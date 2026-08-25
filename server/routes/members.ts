/* server/routes/members.ts
   Paste this code immediately ABOVE: export default router;
*/

function normalizedPhone(value: unknown) {
  const phone = String(value || "").replace(/\D/g, "");
  if (phone.length < 7 || phone.length > 20) {
    throw new Error("Enter a valid phone number.");
  }
  return phone;
}

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
      registeredNameNormalized: registeredName.trim().toLowerCase(),
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
    if (!(await emailAvailable(email))) {
      throw new Error("This email address is already used.");
    }

    const matches = await db
      .collection("memberPreRegistrations")
      .where("phoneNormalized", "==", phoneNormalized)
      .get();

    const record = matches.docs.find(doc =>
      doc.data().status === "PRE_REGISTERED" &&
      String(doc.data().registeredNameNormalized || "") === registeredName.trim().toLowerCase()
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

    response.status(400).json({
      message: error instanceof Error ? error.message : "Could not activate your account."
    });
  }
});
