import { Router } from "express";
import { createHash, randomBytes } from "node:crypto";
import { adminAuth, db, FieldValue, Timestamp } from "../firebaseAdmin.js";
import { requireAuth, requireRole, type ClubRole } from "../auth.js";

const router = Router();
const assignableRoles = new Set<ClubRole>(["PLAYER", "LEVEL_ADMIN"]);
const invitationDurationMs = 14 * 24 * 60 * 60 * 1000;

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

const emailText = (value: unknown) => {
  const email = asText(value, "Email address", 150).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  return email;
};

function toIso(value: unknown) {
  if (value && typeof (value as Timestamp).toDate === "function") return (value as Timestamp).toDate().toISOString();
  return value ? new Date(value as string).toISOString() : null;
}

function inviteCode() {
  return randomBytes(6).toString("hex").toUpperCase().match(/.{1,4}/g)!.join("-");
}

function inviteCodeHash(code: string) {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

function inviteIsExpired(row: FirebaseFirestore.DocumentData) {
  const date = row.expiresAt?.toDate ? row.expiresAt.toDate() : new Date(row.expiresAt);
  return !date || date.getTime() <= Date.now();
}

async function findFlight(flightId: string) {
  const activities = await db.collection("activities").get();
  for (const activity of activities.docs) {
    const flight = await activity.ref.collection("flights").doc(flightId).get();
    if (flight.exists && flight.data()!.active === true) {
      return {
        id: flight.id,
        activityId: activity.id,
        activityName: activity.data().name,
        name: flight.data()!.name
      };
    }
  }
  throw new Error("Assigned active flight was not found.");
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

function publicInvitation(id: string, row: FirebaseFirestore.DocumentData) {
  return {
    id,
    fullName: row.fullName,
    role: row.role,
    activityId: row.activityId,
    activityName: row.activityName,
    flightId: row.flightId,
    flightName: row.flightName,
    status: row.status,
    expiresAt: toIso(row.expiresAt),
    createdAt: toIso(row.createdAt)
  };
}

async function memberIdAvailable(memberId: string, exceptUid?: string) {
  const existing = await db.collection("members").where("memberId", "==", memberId).limit(2).get();
  return existing.docs.every(doc => doc.id === exceptUid);
}

async function emailAvailable(email: string, exceptUid?: string) {
  const existing = await db.collection("members").where("email", "==", email).limit(2).get();
  return existing.docs.every(doc => doc.id === exceptUid);
}

/* Signed-in user may read only their own approved member profile. */
router.get("/me", requireAuth, async (request, response) => {
  const member = await db.collection("members").doc(request.member!.uid).get();
  if (!member.exists || member.data()!.active !== true) {
    return response.status(403).json({ message: "This club account is inactive." });
  }
  response.json(publicMember(member.id, member.data()!));
});

/* Check a proposed new email after Firebase re-authentication but before changing the Firebase account. */
router.post("/me/validate-email", requireAuth, async (request, response) => {
  try {
    const email = emailText(request.body.email);
    if (!(await emailAvailable(email, request.member!.uid))) {
      return response.status(409).json({ message: "This email address is already used by another club account." });
    }
    response.json({ available: true });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not validate email." });
  }
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

/* A signed-in member manages their own profile. Firebase email changes are checked against the fresh sign-in token. */
router.patch("/me", requireAuth, async (request, response) => {
  try {
    const update: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.member!.uid
    };

    if (request.body.fullName !== undefined) update.fullName = asText(request.body.fullName, "Full name");
    if (request.body.phone !== undefined) update.phone = optionalText(request.body.phone, 40);
    if (request.body.preferredLanguage !== undefined) update.preferredLanguage = optionalText(request.body.preferredLanguage, 10) || "en";

    if (request.body.memberId !== undefined) {
      const memberId = asText(request.body.memberId, "Member ID", 40).toUpperCase();
      if (!(await memberIdAvailable(memberId, request.member!.uid))) {
        throw new Error("This Member ID is already used.");
      }
      update.memberId = memberId;
    }

    if (request.body.email !== undefined) {
      const email = emailText(request.body.email);
      if (email !== request.member!.email.toLowerCase()) {
        throw new Error("Sign in again before updating your email address.");
      }
      if (!(await emailAvailable(email, request.member!.uid))) {
        throw new Error("This email address is already used by another club account.");
      }
      update.email = email;
    }

    await db.collection("members").doc(request.member!.uid).update(update);
    await db.collection("memberAudit").add({
      action: "MEMBER_SELF_UPDATED",
      targetMemberUid: request.member!.uid,
      changedFields: Object.keys(update).filter(key => !["updatedAt", "updatedBy"].includes(key)),
      actionBy: request.member!.uid,
      createdAt: FieldValue.serverTimestamp()
    });
    response.json({ success: true });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not update profile." });
  }
});

/* Super Admin lists only activated Player and Flight Admin accounts. */
router.get("/", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  const flightId = String(request.query.flightId || "").trim();
  const members = await db.collection("members").get();
  const rows = members.docs
    .map(doc => publicMember(doc.id, doc.data()))
    .filter(member => !flightId || member.flightId === flightId)
    .sort((a, b) => String(a.fullName || "").localeCompare(String(b.fullName || "")));
  response.json(rows);
});

/* Super Admin creates a provisional invitation with name, role, and flight only. */
router.post("/invitations", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const fullName = asText(request.body.fullName, "Full name");
    const role = asText(request.body.role, "Role") as ClubRole;
    const flightId = asText(request.body.flightId, "Flight allocation");
    if (!assignableRoles.has(role)) throw new Error("Super Admin may invite only PLAYER or LEVEL_ADMIN accounts.");

    const flight = await findFlight(flightId);
    const code = inviteCode();
    const created = await db.collection("memberInvitations").add({
      fullName,
      role,
      activityId: flight.activityId,
      activityName: flight.activityName,
      flightId: flight.id,
      flightName: flight.name,
      status: "INVITED",
      inviteCodeHash: inviteCodeHash(code),
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + invitationDurationMs)),
      createdBy: request.member!.uid
    });

    await db.collection("memberAudit").add({
      action: "MEMBER_INVITED",
      invitationId: created.id,
      role,
      flightId: flight.id,
      actionBy: request.member!.uid,
      createdAt: FieldValue.serverTimestamp()
    });

    response.status(201).json({
      invitationId: created.id,
      fullName,
      role,
      flightName: flight.name,
      inviteCode: code,
      expiresInDays: 14
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not create member invitation." });
  }
});

/* Super Admin can view who has not completed their sign-up. Sensitive join codes are never returned again. */
router.get("/invitations", requireAuth, requireRole("SUPER_ADMIN"), async (_request, response) => {
  const invitations = await db.collection("memberInvitations").get();
  response.json(
    invitations.docs
      .map(doc => publicInvitation(doc.id, doc.data()))
      .filter(invitation => invitation.status === "INVITED")
      .sort((a, b) => String(a.fullName).localeCompare(String(b.fullName)))
  );
});

/* If a code was not delivered, Super Admin may invalidate it and create a fresh one. */
router.post("/invitations/:invitationId/regenerate", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const invitationRef = db.collection("memberInvitations").doc(asText(request.params.invitationId, "Invitation ID"));
    const invitation = await invitationRef.get();
    if (!invitation.exists || invitation.data()!.status !== "INVITED") {
      return response.status(404).json({ message: "Active invitation not found." });
    }

    const code = inviteCode();
    await invitationRef.update({
      inviteCodeHash: inviteCodeHash(code),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + invitationDurationMs)),
      regeneratedAt: FieldValue.serverTimestamp(),
      regeneratedBy: request.member!.uid
    });

    response.json({ invitationId: invitation.id, fullName: invitation.data()!.fullName, inviteCode: code, expiresInDays: 14 });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not regenerate invitation code." });
  }
});

/* Public sign-up claims exactly one existing invitation, creates Firebase authentication, and activates the member record. */
router.post("/activate", async (request, response) => {
  let authUid: string | null = null;
  try {
    const code = asText(request.body.inviteCode, "Invitation code", 40).toUpperCase();
    const fullName = asText(request.body.fullName, "Full name");
    const memberId = asText(request.body.memberId, "Member ID", 40).toUpperCase();
    const email = emailText(request.body.email);
    const phone = optionalText(request.body.phone, 40);
    const password = asText(request.body.password, "Password", 200);
    if (password.length < 8) throw new Error("Password must contain at least 8 characters.");

    const matches = await db.collection("memberInvitations").where("inviteCodeHash", "==", inviteCodeHash(code)).limit(1).get();
    if (matches.empty) throw new Error("Invitation code is invalid.");

    const invitation = matches.docs[0];
    const row = invitation.data();
    if (row.status !== "INVITED") throw new Error("This invitation has already been used or cancelled.");
    if (inviteIsExpired(row)) throw new Error("This invitation code has expired. Ask Super Admin for a new code.");
    if (String(row.fullName).trim().toLowerCase() !== fullName.toLowerCase()) {
      throw new Error("The full name does not match this invitation.");
    }
    if (!(await memberIdAvailable(memberId))) throw new Error("This Member ID is already used.");
    if (!(await emailAvailable(email))) throw new Error("This email address is already used.");

    const authUser = await adminAuth.createUser({ email, password, displayName: fullName, disabled: false });
    authUid = authUser.uid;

    await db.runTransaction(async transaction => {
      const fresh = await transaction.get(invitation.ref);
      if (!fresh.exists || fresh.data()!.status !== "INVITED" || fresh.data()!.inviteCodeHash !== inviteCodeHash(code)) {
        throw new Error("This invitation was already used. Ask Super Admin for help.");
      }

      transaction.set(db.collection("members").doc(authUid!), {
        fullName,
        memberId,
        email,
        phone,
        role: fresh.data()!.role,
        active: true,
        activityId: fresh.data()!.activityId,
        activityName: fresh.data()!.activityName,
        flightId: fresh.data()!.flightId,
        flightName: fresh.data()!.flightName,
        preferredLanguage: "en",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        activatedFromInvitationId: invitation.id
      });
      transaction.update(invitation.ref, {
        status: "ACTIVATED",
        activatedAt: FieldValue.serverTimestamp(),
        activatedMemberUid: authUid
      });
      transaction.set(db.collection("memberAudit").doc(), {
        action: "MEMBER_ACTIVATED",
        invitationId: invitation.id,
        targetMemberUid: authUid,
        role: fresh.data()!.role,
        flightId: fresh.data()!.flightId,
        createdAt: FieldValue.serverTimestamp()
      });
    });

    response.status(201).json({
      success: true,
      email,
      message: "Account activated. Sign in with your email and password."
    });
  } catch (error) {
    if (authUid) await adminAuth.deleteUser(authUid).catch(() => undefined);
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not activate account." });
  }
});

/* Super Admin may change an activated member’s flight, role, contact details, or access state. */
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
