// server/routes/members.ts
import { Router } from "express";
import { adminAuth, db, FieldValue, Timestamp } from "../firebaseAdmin.js";
import { requireAuth, requireRole, type ClubRole } from "../auth.js";

const router = Router();
const assignableRoles = new Set<ClubRole>(["PLAYER", "LEVEL_ADMIN"]);

function asText(value: unknown, label: string, max = 120) {
  const text = String(value || "").trim();
  if (!text || text.length > max) {
    throw new Error(`${label} is required and must be under ${max} characters.`);
  }
  return text;
}

function optionalText(value: unknown, max = 160) {
  const text = String(value || "").trim();
  if (text.length > max) {
    throw new Error(`Value must be under ${max} characters.`);
  }
  return text || null;
}

function optionalImageUrl(value: unknown) {
  const text = optionalText(value, 1800);
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:") throw new Error();
    return url.toString();
  } catch {
    throw new Error("Profile photo must be a valid HTTPS Google Drive or image link.");
  }
}

function emailText(value: unknown) {
  const email = asText(value, "Email address", 150).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }
  return email;
}

function normalizedPhone(value: unknown) {
  const phone = String(value || "").replace(/\D/g, "");
  if (phone.length < 7 || phone.length > 20) {
    throw new Error("Enter a valid phone number.");
  }
  return phone;
}

function toIso(value: unknown) {
  if (value && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  return value ? new Date(value as string).toISOString() : null;
}

function timeValue(value: unknown) {
  if (value && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate().getTime();
  }
  const time = value ? new Date(value as string).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
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

async function memberIdAvailable(memberId: string, exceptUid?: string) {
  const existing = await db
    .collection("members")
    .where("memberId", "==", memberId)
    .limit(2)
    .get();

  return existing.docs.every(doc => doc.id === exceptUid);
}

async function emailAvailable(email: string, exceptUid?: string) {
  const existing = await db
    .collection("members")
    .where("email", "==", email)
    .limit(2)
    .get();

  return existing.docs.every(doc => doc.id === exceptUid);
}

async function firebaseEmailAvailable(email: string, exceptUid?: string) {
  try {
    const user = await adminAuth.getUserByEmail(email);
    return user.uid === exceptUid;
  } catch (error: any) {
    if (error?.code === "auth/user-not-found") return true;
    throw error;
  }
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
    profilePhotoUrl: row.profilePhotoUrl || null,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt)
  };
}

router.get("/me", requireAuth, async (request, response) => {
  const member = await db.collection("members").doc(request.member!.uid).get();

  if (!member.exists || member.data()!.active !== true) {
    return response.status(403).json({ message: "This club account is inactive." });
  }

  response.json(publicMember(member.id, member.data()!));
});

router.post("/me/validate-email", requireAuth, async (request, response) => {
  try {
    const email = emailText(request.body.email);
    if (!(await emailAvailable(email, request.member!.uid)) || !(await firebaseEmailAvailable(email, request.member!.uid))) {
      return response.status(409).json({
        message: "This email address is already registered. Use a different email address."
      });
    }
    response.json({ available: true });
  } catch (error) {
    response.status(400).json({
      message: error instanceof Error ? error.message : "Could not validate email."
    });
  }
});

router.get("/dashboard", requireAuth, async (request, response) => {
  try {
    const member = request.member!;
    const [wallet, ledger, attendance, charges, sessions] = await Promise.all([
      db.collection("wallets").doc(member.uid).get(),
      db.collection("walletLedger").where("memberUid", "==", member.uid).get(),
      db.collection("attendance").where("memberUid", "==", member.uid).get(),
      db.collection("sessionCharges").where("memberUid", "==", member.uid).get(),
      member.flightId
        ? db.collection("sessions").where("flightId", "==", member.flightId).get()
        : Promise.resolve(null)
    ]);

    let nextSession: Record<string, unknown> | null = null;

    if (sessions) {
      const next = sessions.docs
        .filter(doc => doc.data().status === "SCHEDULED" && timeValue(doc.data().startAt) >= Date.now())
        .sort((a, b) => timeValue(a.data().startAt) - timeValue(b.data().startAt))[0];

      if (next) {
        const attendanceRow = await db
          .collection("attendance")
          .doc(`${next.id}_${member.uid}`)
          .get();

        nextSession = {
          id: next.id,
          ...next.data(),
          startAt: toIso(next.data().startAt),
          endAt: toIso(next.data().endAt),
          myAttendance: attendanceRow.exists
            ? attendanceRow.data()!.status
            : "NO_RESPONSE"
        };
      }
    }

    const dueRows = charges.docs
      .map(doc => doc.data())
      .filter(row => row.status === "DUE");

    const now = Date.now();
    const dueTime = (row: FirebaseFirestore.DocumentData) => timeValue(row.dueAt);

    response.json({
      walletFils: wallet.exists ? Number(wallet.data()!.balanceFils || 0) : 0,
      attendedCount: attendance.docs.filter(doc => doc.data().status === "PRESENT").length,
      pendingFils: dueRows.reduce((sum, row) => sum + Number(row.amountDueFils || 0), 0),
      arrearsFils: dueRows
        .filter(row => dueTime(row) <= now)
        .reduce((sum, row) => sum + Number(row.amountDueFils || 0), 0),
      nextSession,
      recentLedger: ledger.docs
        .sort((a, b) => timeValue(b.data().createdAt) - timeValue(a.data().createdAt))
        .slice(0, 8)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: toIso(doc.data().createdAt)
        }))
    });
  } catch (error) {
    response.status(400).json({
      message: error instanceof Error ? error.message : "Could not load dashboard."
    });
  }
});

router.get("/activity-log", requireAuth, async (request, response) => {
  try {
    const member = request.member!;
    const [attendance, sessions, charges, payments, audit] = await Promise.all([
      db.collection("attendance").where("memberUid", "==", member.uid).get(),
      member.flightId
        ? db.collection("sessions").where("flightId", "==", member.flightId).get()
        : Promise.resolve(null),
      db.collection("sessionCharges").where("memberUid", "==", member.uid).get(),
      db.collection("payments").where("memberUid", "==", member.uid).get(),
      db.collection("memberAudit").where("targetMemberUid", "==", member.uid).get()
    ]);

    const sessionById = new Map(
      (sessions?.docs || []).map(doc => [doc.id, { id: doc.id, ...doc.data() }])
    );

    response.json({
      gameDays: [...sessionById.values()]
        .map((row: any) => ({
          id: row.id,
          flightName: row.flightName,
          startAt: toIso(row.startAt),
          status: row.status || "SCHEDULED"
        }))
        .sort((a, b) => timeValue(a.startAt) - timeValue(b.startAt)),
      attendance: attendance.docs.map(doc => {
        const row = doc.data();
        const session: any = sessionById.get(String(row.sessionId));
        return {
          id: doc.id,
          status: row.status || "NO_RESPONSE",
          flightName: session?.flightName || member.flightName,
          startAt: toIso(session?.startAt)
        };
      }),
      charges: charges.docs.map(doc => {
        const row = doc.data();
        const session: any = sessionById.get(String(row.sessionId));
        return {
          id: doc.id,
          flightName: row.flightName || session?.flightName || member.flightName,
          startAt: toIso(session?.startAt),
          totalChargeFils: Number(row.totalChargeFils || 0),
          amountDueFils: Number(row.amountDueFils || 0),
          status: row.status
        };
      }),
      payments: payments.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: toIso(doc.data().submittedAt)
      })),
      credentialUpdates: audit.docs
        .map(doc => doc.data())
        .filter(row => row.action === "MEMBER_SELF_UPDATED")
        .map(row => ({
          changedFields: row.changedFields || [],
          createdAt: toIso(row.createdAt)
        }))
    });
  } catch (error) {
    response.status(400).json({
      message: error instanceof Error ? error.message : "Could not load your activity log."
    });
  }
});

router.patch("/me", requireAuth, async (request, response) => {
  try {
    const update: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.member!.uid
    };

    if (request.body.fullName !== undefined) {
      update.fullName = asText(request.body.fullName, "Full name");
    }

    if (request.body.phone !== undefined) {
      update.phone = optionalText(request.body.phone, 40);
    }

    if (request.body.preferredLanguage !== undefined) {
      update.preferredLanguage = optionalText(request.body.preferredLanguage, 10) || "en";
    }

    if (request.body.memberId !== undefined) {
      const memberId = asText(request.body.memberId, "Member ID", 40).toUpperCase();
      if (!(await memberIdAvailable(memberId, request.member!.uid))) {
        throw new Error("This Member ID is already used.");
      }
      update.memberId = memberId;
    }

    if (request.body.email !== undefined) {
      const email = emailText(request.body.email);
      const authUser = await adminAuth.getUser(request.member!.uid);
      if (email !== String(authUser.email || "").toLowerCase()) {
        throw new Error("Sign in again before updating your email address.");
      }
      if (!(await emailAvailable(email, request.member!.uid)) || !(await firebaseEmailAvailable(email, request.member!.uid))) {
        throw new Error("This email address is already registered. Use a different email address.");
      }
      update.email = email;
    }

    if (request.body.profilePhotoUrl !== undefined) {
      update.profilePhotoUrl = optionalImageUrl(request.body.profilePhotoUrl);
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
    response.status(400).json({
      message: error instanceof Error ? error.message : "Could not update profile."
    });
  }
});

router.get("/", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  const flightId = String(request.query.flightId || "").trim();
  const members = await db.collection("members").get();

  response.json(
    members.docs
      .map(doc => publicMember(doc.id, doc.data()))
      .filter(member => !flightId || member.flightId === flightId)
      .sort((a, b) => String(a.fullName || "").localeCompare(String(b.fullName || "")))
  );
});

router.get("/audit", requireAuth, requireRole("SUPER_ADMIN"), async (_request, response) => {
  try {
    const [memberAudit, attendanceAudit, inventoryAudit, walletLedger, payments, members, sessions] = await Promise.all([
      db.collection("memberAudit").get(),
      db.collection("attendanceAudit").get(),
      db.collection("inventoryAudit").get(),
      db.collection("walletLedger").get(),
      db.collection("payments").get(),
      db.collection("members").get(),
      db.collection("sessions").get()
    ]);
    const memberRows = new Map(members.docs.map(doc => [doc.id, doc.data()]));
    const sessionRows = new Map(sessions.docs.map(doc => [doc.id, doc.data()]));
    const actorName = (uid: unknown) => memberRows.get(String(uid || ""))?.fullName || String(uid || "System");
    const memberDetails = (uid: unknown) => memberRows.get(String(uid || "")) || {};
    const sessionDetails = (sessionId: unknown) => sessionRows.get(String(sessionId || "")) || {};
    const scope = (row: FirebaseFirestore.DocumentData, session: FirebaseFirestore.DocumentData = {}, targetUid?: unknown) => {
      const target = memberDetails(targetUid || row.memberUid || row.targetMemberUid);
      return {
        memberUid: String(targetUid || row.memberUid || row.targetMemberUid || ""),
        flightId: String(row.flightId || session.flightId || target.flightId || ""),
        flightName: String(row.flightName || session.flightName || target.flightName || ""),
        activityId: String(row.activityId || session.activityId || target.activityId || ""),
        activityName: String(row.activityName || session.activityName || target.activityName || "")
      };
    };
    const records = [
      ...memberAudit.docs.map(doc => {
        const row = doc.data();
        return { id: doc.id, category: "MEMBER", action: row.action || "MEMBER_EVENT", subject: actorName(row.targetMemberUid), detail: row.flightId ? `Flight ${row.flightId}` : "", actor: actorName(row.actionBy), createdAt: toIso(row.createdAt), ...scope(row, {}, row.targetMemberUid) };
      }),
      ...attendanceAudit.docs.map(doc => {
        const row = doc.data(), session = sessionDetails(row.sessionId);
        return { id: doc.id, category: "ATTENDANCE", action: row.actionRole === "PLAYER" ? "PLAYER RESPONSE" : "ADMIN CORRECTION", subject: actorName(row.targetMemberUid), detail: `${row.previousStatus || "NO_RESPONSE"} → ${row.newStatus || "—"}${row.reason ? ` · ${row.reason}` : ""}`, actor: actorName(row.actionBy), createdAt: toIso(row.createdAt), sessionDate: toIso(session.startAt), ...scope(row, session, row.targetMemberUid) };
      }),
      ...inventoryAudit.docs.map(doc => {
        const row = doc.data(), session = sessionDetails(row.sessionId);
        return { id: doc.id, category: "SHUTTLE STOCK", action: row.action || "STOCK EVENT", subject: session.flightName || row.flightName || row.flightId || "Flight", detail: `${row.attendeeCount || 0} attendees · ${row.actualShuttlesUsed || 0} shuttles used · ${row.totalDayCostFils || 0} fils`, actor: actorName(row.actionBy), createdAt: toIso(row.createdAt), sessionDate: toIso(session.startAt), ...scope(row, session) };
      }),
      ...walletLedger.docs.map(doc => {
        const row = doc.data();
        return { id: doc.id, category: "WALLET / PAYMENT", action: row.kind || row.direction || "WALLET ENTRY", subject: actorName(row.memberUid), detail: `${row.description || "Wallet transaction"} · ${Number(row.amountFils || 0)} fils`, actor: actorName(row.createdBy || row.updatedBy), createdAt: toIso(row.createdAt), ...scope(row, {}, row.memberUid) };
      }),
      ...payments.docs.map(doc => {
        const row = doc.data();
        return { id: doc.id, category: "WALLET / PAYMENT", action: row.status || "PAYMENT", subject: actorName(row.memberUid), detail: `${row.method || "Payment"} · ${Number(row.amountFils || 0)} fils · ${row.paymentCode || doc.id}`, actor: actorName(row.verifiedBy || row.memberUid), createdAt: toIso(row.verifiedAt || row.submittedAt || row.createdAt), ...scope(row, {}, row.memberUid) };
      }),
      ...sessions.docs.filter(doc => doc.data().status === "COMPLETED").map(doc => {
        const row = doc.data();
        return { id: doc.id, category: "SESSION CONTROL", action: "GAME COMPLETED", subject: row.flightName || row.flightId || "Flight", detail: `${Number(row.attendeeCount || 0)} final attendees · ${Number(row.actualShuttlesUsed || 0)} shuttlecocks used · ${Number(row.totalDayCostFils || 0)} fils`, actor: actorName(row.completedBy), createdAt: toIso(row.completedAt || row.startAt), sessionDate: toIso(row.startAt), ...scope(row, row) };
      })
    ].sort((a, b) => timeValue(b.createdAt) - timeValue(a.createdAt));
    response.json(records);
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load audit history." });
  }
});

router.post("/pre-register", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const registeredName = asText(request.body.registeredName, "Registered name");
    const phoneNormalized = normalizedPhone(request.body.phone);
    const role = asText(request.body.role, "Role") as ClubRole;
    const flightId = asText(request.body.flightId, "Flight allocation");

    if (!assignableRoles.has(role)) {
      throw new Error("Super Admin may pre-register only PLAYER or LEVEL_ADMIN accounts.");
    }

    const duplicate = await db
      .collection("memberPreRegistrations")
      .where("phoneNormalized", "==", phoneNormalized)
      .get();

    if (duplicate.docs.some(doc => doc.data().status === "PRE_REGISTERED")) {
      throw new Error("This phone number already has an unfinished pre-registration.");
    }

    const flight = await findFlight(flightId);

    const created = await db.collection("memberPreRegistrations").add({
      registeredName,
      registeredNameNormalized: registeredName.toLowerCase(),
      phone: String(request.body.phone || "").trim(),
      phoneNormalized,
      role,
      activityId: flight.activityId,
      activityName: flight.activityName,
      flightId: flight.id,
      flightName: flight.name,
      status: "PRE_REGISTERED",
      createdAt: FieldValue.serverTimestamp(),
      createdBy: request.member!.uid
    });

    await db.collection("memberAudit").add({
      action: "MEMBER_PRE_REGISTERED_BY_SUPER_ADMIN",
      preRegistrationId: created.id,
      role,
      flightId: flight.id,
      actionBy: request.member!.uid,
      createdAt: FieldValue.serverTimestamp()
    });

    response.status(201).json({
      success: true,
      id: created.id,
      registeredName,
      phone: String(request.body.phone || "").trim(),
      role,
      flightName: flight.name
    });
  } catch (error) {
    response.status(400).json({
      message: error instanceof Error ? error.message : "Could not pre-register member."
    });
  }
});

router.post("/activate-registered", async (request, response) => {
  let authUid: string | null = null;

  try {
    const registeredName = asText(
      request.body.registeredName || request.body.fullName,
      "Registered name"
    );
    const phoneNormalized = normalizedPhone(request.body.phone);
    const memberId = asText(request.body.memberId, "Member ID", 40).toUpperCase();
    const email = emailText(request.body.email);
    const password = asText(request.body.password, "Password", 200);

    if (password.length < 8) {
      throw new Error("Password must contain at least 8 characters.");
    }

    if (!(await memberIdAvailable(memberId))) {
      throw new Error("This Member ID is already used.");
    }

    if (!(await emailAvailable(email)) || !(await firebaseEmailAvailable(email))) {
      throw new Error("This email address is already registered. Use a different email address.");
    }

    const matches = await db
      .collection("memberPreRegistrations")
      .where("phoneNormalized", "==", phoneNormalized)
      .get();

    const record = matches.docs.find(doc =>
      doc.data().status === "PRE_REGISTERED" &&
      String(doc.data().registeredNameNormalized || "") === registeredName.toLowerCase()
    );

    if (!record) {
      throw new Error("Registered name and phone number do not match a Super Admin record.");
    }

    const authUser = await adminAuth.createUser({
      email,
      password,
      displayName: registeredName,
      disabled: false
    });
    authUid = authUser.uid;

    await db.runTransaction(async transaction => {
      const fresh = await transaction.get(record.ref);

      if (!fresh.exists || fresh.data()!.status !== "PRE_REGISTERED") {
        throw new Error("This registration was already completed.");
      }

      transaction.set(db.collection("members").doc(authUid!), {
        fullName: fresh.data()!.registeredName,
        memberId,
        email,
        phone: fresh.data()!.phone,
        role: fresh.data()!.role,
        active: true,
        activityId: fresh.data()!.activityId,
        activityName: fresh.data()!.activityName,
        flightId: fresh.data()!.flightId,
        flightName: fresh.data()!.flightName,
        preferredLanguage: "en",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        activatedFromPreRegistrationId: record.id
      });

      transaction.update(record.ref, {
        status: "ACTIVATED",
        activatedAt: FieldValue.serverTimestamp(),
        activatedMemberUid: authUid
      });
    });

    await db.collection("memberAudit").add({
      action: "PRE_REGISTERED_MEMBER_ACTIVATED",
      preRegistrationId: record.id,
      targetMemberUid: authUid,
      createdAt: FieldValue.serverTimestamp()
    });

    response.status(201).json({
      success: true,
      email,
      message: "Account activated. Sign in with your email and password."
    });
  } catch (error) {
    if (authUid) {
      await adminAuth.deleteUser(authUid).catch(() => undefined);
    }

    const code = (error as any)?.code;
    response.status(400).json({
      message: code === "auth/email-already-exists"
        ? "This email address is already registered. Use a different email address."
        : error instanceof Error ? error.message : "Could not activate your account."
    });
  }
});

router.patch("/:memberUid", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const memberUid = asText(request.params.memberUid, "Member UID");
    const target = await db.collection("members").doc(memberUid).get();

    if (!target.exists) {
      return response.status(404).json({ message: "Member not found." });
    }

    const update: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.member!.uid
    };

    if (request.body.fullName !== undefined) {
      update.fullName = asText(request.body.fullName, "Full name");
    }
    if (request.body.phone !== undefined) {
      update.phone = optionalText(request.body.phone, 40);
    }
    if (request.body.active !== undefined) {
      update.active = Boolean(request.body.active);
    }
    if (request.body.role !== undefined) {
      const role = asText(request.body.role, "Role") as ClubRole;
      if (!assignableRoles.has(role)) {
        throw new Error("Only PLAYER and LEVEL_ADMIN roles may be assigned here.");
      }
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

    if (request.body.active !== undefined) {
      await adminAuth.updateUser(memberUid, { disabled: !Boolean(request.body.active) });
    }

    await db.collection("memberAudit").add({
      action: "MEMBER_UPDATED",
      targetMemberUid: memberUid,
      changedFields: Object.keys(update).filter(key => !["updatedAt", "updatedBy"].includes(key)),
      actionBy: request.member!.uid,
      createdAt: FieldValue.serverTimestamp()
    });

    response.json({ success: true });
  } catch (error) {
    response.status(400).json({
      message: error instanceof Error ? error.message : "Could not update member."
    });
  }
});

export default router;
