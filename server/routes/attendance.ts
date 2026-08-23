import { Router } from "express";
import { db, FieldValue, Timestamp } from "../firebaseAdmin.js";
import { requireAuth, requireFlightAccess, requireRole } from "../auth.js";
import { isSessionLocked, type AttendanceStatus } from "../clubLogic.js";

const router = Router();
const allowedStatuses = new Set<AttendanceStatus>(["PRESENT", "ABSENT"]);

const asText = (value: unknown, label: string, max = 300) => {
  const text = String(value || "").trim();
  if (!text || text.length > max) throw new Error(`${label} is required and must be under ${max} characters.`);
  return text;
};

function sessionStart(session: FirebaseFirestore.DocumentData): Date {
  const value = session.startAt;
  if (value && typeof value.toDate === "function") return value.toDate();
  return new Date(value);
}

function attendanceRef(sessionId: string, memberUid: string) {
  return db.collection("attendance").doc(`${sessionId}_${memberUid}`);
}

async function loadSessionWithAccess(sessionId: string, member: Express.Request["member"]) {
  const snapshot = await db.collection("sessions").doc(sessionId).get();
  if (!snapshot.exists) throw new Error("Session not found.");
  const session = snapshot.data()!;

  if (member!.role !== "SUPER_ADMIN" && member!.flightId !== session.flightId) {
    throw new Error("You may access attendance only for your assigned flight.");
  }
  return { id: snapshot.id, ...session };
}

/* Player / Flight Admin / Super Admin see roster only for their own authorised flight. */
router.get("/session/:sessionId", requireAuth, async (request, response) => {
  try {
    const sessionId = asText(request.params.sessionId, "Session ID");
    const session = await loadSessionWithAccess(sessionId, request.member);
    const locked = isSessionLocked(session.startAt);

    const [members, attendanceRows] = await Promise.all([
      db.collection("members").where("flightId", "==", session.flightId).get(),
      db.collection("attendance").where("sessionId", "==", sessionId).get()
    ]);
    const statusByMember = new Map(attendanceRows.docs.map(doc => [doc.data().memberUid, doc.data().status]));

    response.json({
      id: sessionId,
      flightId: session.flightId,
      flightName: session.flightName,
      startAt: sessionStart(session).toISOString(),
      locked,
      canRespond: !locked && request.member!.role !== "SUPER_ADMIN",
      myAttendance: statusByMember.get(request.member!.uid) || "NO_RESPONSE",
      roster: members.docs
        .filter(doc => doc.data().active === true)
        .map(doc => ({
          uid: doc.id,
          fullName: doc.data().fullName,
          memberId: doc.data().memberId,
          status: statusByMember.get(doc.id) || "NO_RESPONSE"
        }))
        .sort((a, b) => String(a.fullName).localeCompare(String(b.fullName)))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load attendance.";
    response.status(message.includes("access") ? 403 : 400).json({ message });
  }
});

/* Players can change only THEIR OWN response while the server says the session is open. */
router.post("/respond", requireAuth, async (request, response) => {
  try {
    const sessionId = asText(request.body.sessionId, "Session ID");
    const status = asText(request.body.status, "Attendance status") as AttendanceStatus;
    if (!allowedStatuses.has(status)) throw new Error("Attendance must be PRESENT or ABSENT.");

    const session = await loadSessionWithAccess(sessionId, request.member);
    if (isSessionLocked(session.startAt)) {
      return response.status(423).json({ message: "Attendance is locked. Contact your assigned Flight Admin for a correction." });
    }

    const ref = attendanceRef(sessionId, request.member!.uid);
    const previous = await ref.get();
    await ref.set({
      sessionId,
      memberUid: request.member!.uid,
      flightId: session.flightId,
      status,
      source: "PLAYER_SELF_RESPONSE",
      createdAt: previous.exists ? previous.data()!.createdAt : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.member!.uid
    }, { merge: true });

    await db.collection("attendanceAudit").add({
      sessionId,
      targetMemberUid: request.member!.uid,
      previousStatus: previous.exists ? previous.data()!.status : "NO_RESPONSE",
      newStatus: status,
      reason: "Player self-response before lock",
      actionBy: request.member!.uid,
      actionRole: request.member!.role,
      createdAt: FieldValue.serverTimestamp()
    });

    response.json({ success: true, status });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not update attendance." });
  }
});

/* After lock, only the assigned Flight Admin or Super Admin may correct another member. */
router.post("/session/:sessionId/correct", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const sessionId = asText(request.params.sessionId, "Session ID");
    const targetMemberUid = asText(request.body.memberUid, "Member ID");
    const status = asText(request.body.status, "Attendance status") as AttendanceStatus;
    const reason = asText(request.body.reason, "Correction reason");
    if (!allowedStatuses.has(status)) throw new Error("Attendance must be PRESENT or ABSENT.");

    const session = await loadSessionWithAccess(sessionId, request.member);
    if (!requireFlightAccess(session.flightId, request.member!)) {
      return response.status(403).json({ message: "Only the assigned Flight Admin may correct this flight." });
    }

    const targetMember = await db.collection("members").doc(targetMemberUid).get();
    if (!targetMember.exists || targetMember.data()!.flightId !== session.flightId) {
      return response.status(400).json({ message: "This member is not assigned to the session flight." });
    }

    const ref = attendanceRef(sessionId, targetMemberUid);
    const previous = await ref.get();
    await ref.set({
      sessionId,
      memberUid: targetMemberUid,
      flightId: session.flightId,
      status,
      source: "ADMIN_CORRECTION",
      createdAt: previous.exists ? previous.data()!.createdAt : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.member!.uid,
      correctionReason: reason,
      correctedAfterLock: isSessionLocked(session.startAt)
    }, { merge: true });

    await db.collection("attendanceAudit").add({
      sessionId,
      targetMemberUid,
      previousStatus: previous.exists ? previous.data()!.status : "NO_RESPONSE",
      newStatus: status,
      reason,
      actionBy: request.member!.uid,
      actionRole: request.member!.role,
      createdAt: FieldValue.serverTimestamp()
    });

    response.json({ success: true, status });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not correct attendance." });
  }
});

router.get("/session/:sessionId/audit", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const sessionId = asText(request.params.sessionId, "Session ID");
    const session = await loadSessionWithAccess(sessionId, request.member);
    if (!requireFlightAccess(session.flightId, request.member!)) return response.status(403).json({ message: "No access." });

    const audit = await db.collection("attendanceAudit").where("sessionId", "==", sessionId).orderBy("createdAt", "desc").get();
    response.json(audit.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: (doc.data().createdAt as Timestamp)?.toDate?.().toISOString() || null })));
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load attendance audit." });
  }
});

export default router;
