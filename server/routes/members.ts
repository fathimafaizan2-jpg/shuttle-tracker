import { Router } from "express";
import { adminAuth, db, FieldValue, Timestamp } from "../firebaseAdmin.js";
import { requireAuth, requireRole, type ClubRole } from "../auth.js";

const router = Router();
const assignableRoles = new Set<ClubRole>(["PLAYER", "LEVEL_ADMIN"]);

const asText = (value: unknown, label: string, max = 120) => {
  const text = String(value || "").trim();
  if (!text || text.length > max) throw new Error(`${label} is required and must be under ${max} characters.`);
  return text;
};

const optionalText = (value: unknown, max = 160) => {
  const text = String(value || "").trim();
  if (text.length > max) throw new Error(`Value must be under ${max} characters.`);
  return text || null;
};

function toIso(value: unknown) {
  if (value && typeof (value as Timestamp).toDate === "function") return (value as Timestamp).toDate().toISOString();
  return value ? new Date(value as string).toISOString() : null;
}

async function findFlight(flightId: string) {
  const activities = await db.collection("activities").get();
  for (const activity of activities.docs) {
    const flight = await activity.ref.collection("flights").doc(flightId).get();
    if (flight.exists) {
      return {
        id: flight.id,
        activityId: activity.id,
        activityName: activity.data().name,
        name: flight.data()!.name
      };
    }
  }
  throw new Error("Assigned flight was not found.");
}

function publicMember(id: string, row: FirebaseFirestore.DocumentData) {
  return {
    uid: id,
    fullName: row.fullName,
    memberId: row.memberId,
    email: row.email,
    phone: row.phone || "",
    role: row.role,
    active: Boolean(row.active),
    activityId: row.activityId || null,
    activityName: row.activityName || null,
    flightId: row.flightId || null,
    flightName: row.flightName || null,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt)
  };
}

/* Signed-in user may read only their own approved member profile. */
router.get("/me", requireAuth, async (request, response) => {
  const member = await db.collection("members").doc(request.member!.uid).get();
  if (!member.exists || member.data()!.active !== true) {
    return response.status(403).json({ message: "This club account is inactive." });
  }
  response.json(publicMember(member.id, member.data()!));
});

/* Player dashboard data: own wallet, own attendance, own charges, own flight’s next session only. */
router.get("/dashboard", requireAuth, async (request, response) => {
  try {
    const member = request.member!;
    const [wallet, ledger, attendance, charges] = await Promise.all([
      db.collection("wallets").doc(member.uid).get(),
      db.collection("walletLedger").where("memberUid", "==", member.uid).orderBy("createdAt", "desc").limit(8).get(),
      db.collection("attendance").where("memberUid", "==", member.uid).where("status", "==", "PRESENT").get(),
      db.collection("sessionCharges").where("memberUid", "==", member.uid).get()
    ]);

    let nextSession: Record<string, unknown> | null = null;
    if (member.flightId) {
      const sessions = await db.collection("sessions").where("flightId", "==", member.flightId).where("status", "==", "SCHEDULED").orderBy("startAt").limit(1).get();
      if (!sessions.empty) {
        const session = sessions.docs[0];
        const attendanceRow = await db.collection("attendance").doc(`${session.id}_${member.uid}`).get();
        nextSession = {
          id: session.id,
          ...session.data(),
          startAt: toIso(session.data().startAt),
          endAt: toIso(session.data().endAt),
          myAttendance: attendanceRow.exists ? attendanceRow.data()!.status : "NO_RESPONSE"
        };
      }
    }

    const due = charges.docs.map(doc => doc.data()).filter(row => row.status === "DUE");
    const now = Date.now();
    const dueAt = (row: FirebaseFirestore.DocumentData) => {
      const value = row.dueAt;
      return value?.toDate ? value.toDate().getTime() : new Date(value).getTime();
    };

    response.json({
      walletFils: wallet.exists ? Number(wallet.data()!.balanceFils || 0) : 0,
      attendedCount: attendance.size,
      pendingFils: due.reduce((sum, row) => sum + Number(row.amountDueFils || 0), 0),
      arrearsFils: due.filter(row => dueAt(row) <= now).reduce((sum, row) => sum + Number(row.amountDueFils || 0), 0),
      nextSession,
      recentLedger: ledger.docs.map(doc => ({ ...doc.data(), id: doc.id, createdAt: toIso(doc.data().createdAt) }))
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load dashboard." });
  }
});

/* Member may update only own contact details. Role and flight remain Super Admin controlled. */
router.patch("/me", requireAuth, async (request, response) => {
  try {
    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp(), updatedBy: request.member!.uid };
    if (request.body.fullName !== undefined) update.fullName = asText(request.body.fullName, "Full name");
    if (request.body.phone !== undefined) update.phone = optionalText(request.body.phone, 40);
    if (request.body.preferredLanguage !== undefined) update.preferredLanguage = optionalText(request.body.preferredLanguage, 10) || "en";
    await db.collection("members").doc(request.member!.uid).update(update);
    response.json({ success: true });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not update profile." });
  }
});

/* Super Admin lists club accounts. Business advertisers never exist in this collection. */
router.get("/", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  const flightId = String(request.query.flightId || "").trim();
  let query: FirebaseFirestore.Query = db.collection("members").orderBy("fullName");
  if (flightId) query = query.where("flightId", "==", flightId);
  const members = await query.get();
  response.json(members.docs.map(doc => publicMember(doc.id, doc.data())));
});

/* Super Admin creates Firebase sign-in and approved member record together. */
router.post("/", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const fullName = asText(request.body.fullName, "Full name");
    const memberId = asText(request.body.memberId, "Member ID", 40).toUpperCase();
    const email = asText(request.body.email, "Email", 150).toLowerCase();
    const temporaryPassword = asText(request.body.temporaryPassword, "Temporary password", 200);
    const role = asText(request.body.role, "Role") as ClubRole;
    const flightId = asText(request.body.flightId, "Flight allocation");
    if (!assignableRoles.has(role)) throw new Error("Super Admin may create only PLAYER or LEVEL_ADMIN accounts through this screen.");
    if (temporaryPassword.length < 8) throw new Error("Temporary password must be at least 8 characters.");

    const duplicateMemberId = await db.collection("members").where("memberId", "==", memberId).limit(1).get();
    if (!duplicateMemberId.empty) return response.status(409).json({ message: "This Member ID is already used." });
    const flight = await findFlight(flightId);
    const authUser = await adminAuth.createUser({ email, password: temporaryPassword, displayName: fullName, disabled: false });

    try {
      await db.collection("members").doc(authUser.uid).set({
        fullName,
        memberId,
        email,
        phone: optionalText(request.body.phone, 40),
        role,
        active: true,
        activityId: flight.activityId,
        activityName: flight.activityName,
        flightId: flight.id,
        flightName: flight.name,
        preferredLanguage: "en",
        createdAt: FieldValue.serverTimestamp(),
        createdBy: request.member!.uid,
        updatedAt: FieldValue.serverTimestamp()
      });
      await db.collection("memberAudit").add({
        action: "MEMBER_CREATED",
        targetMemberUid: authUser.uid,
        role,
        flightId: flight.id,
        actionBy: request.member!.uid,
        createdAt: FieldValue.serverTimestamp()
      });
      response.status(201).json({ uid: authUser.uid, fullName, memberId, email, role, flightId: flight.id });
    } catch (error) {
      await adminAuth.deleteUser(authUser.uid).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not create member account." });
  }
});

/* Super Admin controls role, assignment, activation and permitted profile changes. */
router.patch("/:memberUid", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const memberUid = asText(request.params.memberUid, "Member UID");
    const target = await db.collection("members").doc(memberUid).get();
    if (!target.exists) return response.status(404).json({ message: "Member not found." });

    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp(), updatedBy: request.member!.uid };
    if (request.body.fullName !== undefined) update.fullName = asText(request.body.fullName, "Full name");
    if (request.body.phone !== undefined) update.phone = optionalText(request.body.phone, 40);
    if (request.body.active !== undefined) update.active = Boolean(request.body.active);
    if (request.body.role !== undefined) {
      const role = asText(request.body.role, "Role") as ClubRole;
      if (!assignableRoles.has(role)) throw new Error("Only PLAYER and LEVEL_ADMIN roles may be assigned here.");
      update.role = role;
    }
    if (request.body.flightId !== undefined) {
      const flight = await findFlight(asText(request.body.flightId, "Flight allocation"));
      update.activityId = flight.activityId;
      update.activityName = flight.activityName;
      update.flightId = flight.id;
      update.flightName = flight.name;
    }

    await target.ref.update(update);
    if (request.body.active !== undefined) await adminAuth.updateUser(memberUid, { disabled: !Boolean(request.body.active) });
    await db.collection("memberAudit").add({
      action: "MEMBER_UPDATED",
      targetMemberUid: memberUid,
      changedFields: Object.keys(update).filter(key => !["updatedAt", "updatedBy"].includes(key)),
      actionBy: request.member!.uid,
      createdAt: FieldValue.serverTimestamp()
    });
    response.json({ success: true });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not update member." });
  }
});

export default router;
