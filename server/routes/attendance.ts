import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../firebaseAdmin.js";
import { isAttendanceLocked } from "../clubLogic.js";
import { requireAuth, requireRoles, requireSameFlight } from "../auth.js";

export const attendanceRouter = Router();

const selfStatus = z.enum(["COMING", "NOT_COMING"]);
const finalStatus = z.enum(["PRESENT", "ABSENT"]);

attendanceRouter.get("/:sessionId/roster", requireAuth, async (req, res) => {
  const session = (await db.collection("sessions").doc(req.params.sessionId).get()).data();
  if (!session) return res.status(404).json({ error: "Session not found" });
  requireSameFlight(session.flightId, req);

  const [members, attendance] = await Promise.all([
    db.collection("members").where("flightId", "==", session.flightId).where("active", "==", true).get(),
    db.collection("attendance").where("sessionId", "==", req.params.sessionId).get()
  ]);
  const attendanceByPlayer = new Map(attendance.docs.map(doc => [doc.data().playerUid, doc.data()]));

  const roster = members.docs.map(doc => {
    const member = doc.data();
    const record = attendanceByPlayer.get(doc.id) ?? null;
    return {
      uid: doc.id,
      fullName: member.fullName,
      // Player views same-flight roster but can only modify their own row.
      status: record?.status ?? "NO_RESPONSE",
      isCurrentUser: doc.id === req.member!.uid
    };
  });

  res.json({ locked: isAttendanceLocked(session.startAtUtc), roster });
});

attendanceRouter.put("/:sessionId/me", requireAuth, requireRoles("PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const status = selfStatus.parse(req.body.status);
  const session = (await db.collection("sessions").doc(req.params.sessionId).get()).data();
  if (!session) return res.status(404).json({ error: "Session not found" });
  requireSameFlight(session.flightId, req);
  if (isAttendanceLocked(session.startAtUtc)) return res.status(409).json({ error: "Attendance locked after 15 minutes" });

  await db.collection("attendance").doc(`${req.params.sessionId}_${req.member!.uid}`).set({
    sessionId: req.params.sessionId,
    playerUid: req.member!.uid,
    flightId: session.flightId,
    status,
    changedAt: FieldValue.serverTimestamp(),
    changedBy: req.member!.uid
  }, { merge: true });

  res.json({ status });
});

attendanceRouter.put("/:sessionId/:playerUid/final", requireAuth, requireRoles("LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const input = z.object({ status: finalStatus, reason: z.string().trim().min(3).max(500) }).parse(req.body);
  const session = (await db.collection("sessions").doc(req.params.sessionId).get()).data();
  if (!session) return res.status(404).json({ error: "Session not found" });
  requireSameFlight(session.flightId, req);
  if (!isAttendanceLocked(session.startAtUtc)) return res.status(409).json({ error: "Final attendance is allowed only after automatic lock" });

  const record = db.collection("attendance").doc(`${req.params.sessionId}_${req.params.playerUid}`);
  await record.set({
    sessionId: req.params.sessionId,
    playerUid: req.params.playerUid,
    flightId: session.flightId,
    status: input.status,
    finalisedAt: FieldValue.serverTimestamp(),
    finalisedBy: req.member!.uid
  }, { merge: true });

  await db.collection("auditLogs").add({
    actorUid: req.member!.uid,
    action: "LOCKED_ATTENDANCE_FINALISED",
    targetId: record.id,
    reason: input.reason,
    createdAt: FieldValue.serverTimestamp()
  });

  res.json({ ok: true });
});
