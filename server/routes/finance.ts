import { Router } from "express";
import { db, FieldValue, Timestamp } from "../firebaseAdmin.js";
import { requireAuth, requireFlightAccess, requireRole } from "../auth.js";
import { arrearsDueAt, calculateShuttleCost } from "../clubLogic.js";

const router = Router();

const asText = (value: unknown, label: string, max = 240) => {
  const text = String(value || "").trim();
  if (!text || text.length > max) {
    throw new Error(`${label} is required and must be under ${max} characters.`);
  }
  return text;
};

const asWholeNumber = (value: unknown, label: string, minimum = 0) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum) {
    throw new Error(`${label} must be a whole number of ${minimum} or more.`);
  }
  return number;
};

const asSignedWholeNumber = (value: unknown, label: string) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number === 0) {
    throw new Error(`${label} must be a non-zero whole number.`);
  }
  return number;
};

const makePaymentCode = (prefix: string, sourceId: string) =>
  `ICB-${prefix}-${String(sourceId).replace(/[^a-zA-Z0-9]/g, "").slice(-10).toUpperCase()}`;

const queryText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function asDate(value: unknown) {
  if (value && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate();
  }
  return new Date(value as string);
}

function dateValue(value: unknown) {
  const time = asDate(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function iso(value: unknown) {
  const time = dateValue(value);
  return time ? new Date(time).toISOString() : null;
}

function utcTime(value: unknown) {
  const date = asDate(value);
  if (!Number.isFinite(date.getTime())) return "";
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function isCurrentTimetableSession(
  session: FirebaseFirestore.DocumentData,
  slot: FirebaseFirestore.DocumentData
) {
  const start = asDate(session.startAt);
  const weekdayIndex = Number(slot.weekdayIndex);
  return (
    Number.isFinite(start.getTime()) &&
    Number.isInteger(weekdayIndex) &&
    weekdayIndex >= 0 &&
    weekdayIndex <= 6 &&
    String(session.activityId || "") === String(slot.activityId || "") &&
    String(session.flightId || "") === String(slot.flightId || "") &&
    start.getUTCDay() === weekdayIndex &&
    utcTime(session.startAt) === String(slot.startTime || "")
  );
}

function walletRef(memberUid: string) {
  return db.collection("wallets").doc(memberUid);
}

function chargeRef(sessionId: string, memberUid: string) {
  return db.collection("sessionCharges").doc(`${sessionId}_${memberUid}`);
}

async function loadSessionForAdmin(sessionId: string, member: Express.Request["member"]) {
  const sessionDoc = await db.collection("sessions").doc(sessionId).get();
  if (!sessionDoc.exists) throw new Error("Session not found.");

  const session = sessionDoc.data()!;
  if (!requireFlightAccess(session.flightId, member!)) {
    throw new Error("You may manage finance only for your assigned flight.");
  }

  const weeklySlotId = String(session.weeklySlotId || "");
  const slotDoc = weeklySlotId ? await db.collection("weeklyTimetable").doc(weeklySlotId).get() : null;
  if (!slotDoc?.exists || !isCurrentTimetableSession(session, slotDoc.data()!)) {
    throw new Error("This date is no longer an active Master Timetable session. Republish the timetable month before managing this game.");
  }

  return { ref: sessionDoc.ref, id: sessionDoc.id, ...session };
}

/* Flight Admin completes only an assigned-flight game after entering actual shuttles used. */
router.post(
  "/session/:sessionId/complete",
  requireAuth,
  requireRole("LEVEL_ADMIN", "SUPER_ADMIN"),
  async (request, response) => {
    try {
      const sessionId = asText(request.params.sessionId, "Session ID");
      const actualShuttlesUsed = asWholeNumber(
        request.body.actualShuttlesUsed,
        "Actual shuttlecocks used"
      );
      const session = await loadSessionForAdmin(sessionId, request.member);

      if (session.status === "COMPLETED") {
        return response.status(409).json({
          message: "This session has already been completed and charged."
        });
      }

      if (dateValue(session.endAt) > Date.now()) {
        return response.status(400).json({
          message: "A session can be completed only after its scheduled end time."
        });
      }

      const dueAt = arrearsDueAt(session.endAt);
      const stockRef = db.collection("inventory").doc(session.flightId);
      const presentAttendanceQuery = db
        .collection("attendance")
        .where("sessionId", "==", sessionId)
        .where("status", "==", "PRESENT");
      let completedResult: ReturnType<typeof calculateShuttleCost> | null = null;
      let remainingTubes = 0;
      let remainingLooseShuttles = 0;
      let lowStockThresholdShuttles = 0;
      let lowStock = false;
      let costPerPlayerExactFils = 0;
      let completedTubePriceFils = 0;
      let completedShuttlesPerTube = 0;
      const gameDate = iso(session.startAt);

      await db.runTransaction(async transaction => {
        const [liveSession, liveStock, presentAttendance] = await Promise.all([
          transaction.get(session.ref),
          transaction.get(stockRef),
          transaction.get(presentAttendanceQuery)
        ]);
        if (!liveSession.exists || liveSession.data()!.status === "COMPLETED") {
          throw new Error("This session was already completed.");
        }
        if (!liveStock.exists) throw new Error("Inventory record no longer exists.");

        const currentStock = liveStock.data()!;
        const shuttlesPerTube = Number(currentStock.shuttlesPerTube);
        const tubePriceFils = Number(currentStock.tubePriceFils);
        completedTubePriceFils = tubePriceFils;
        completedShuttlesPerTube = shuttlesPerTube;
        const result = calculateShuttleCost(
          {
            availableTubes: Number(currentStock.availableTubes),
            looseShuttles: Number(currentStock.looseShuttles),
            shuttlesPerTube,
            tubePriceFils
          },
          actualShuttlesUsed,
          presentAttendance.docs.map(doc => String(doc.data().memberUid))
        );

        remainingTubes = Math.floor(result.remainingShuttles / shuttlesPerTube);
        remainingLooseShuttles = result.remainingShuttles % shuttlesPerTube;
        lowStockThresholdShuttles = Number.isInteger(Number(currentStock.lowStockThresholdShuttles))
          ? Math.max(0, Number(currentStock.lowStockThresholdShuttles))
          : shuttlesPerTube;
        lowStock = result.remainingShuttles <= lowStockThresholdShuttles;
        costPerPlayerExactFils = result.attendeeCount
          ? result.totalDayCostFils / result.attendeeCount
          : 0;

        transaction.update(stockRef, {
          availableTubes: remainingTubes,
          looseShuttles: remainingLooseShuttles,
          totalAvailableShuttles: result.remainingShuttles,
          lowStockThresholdShuttles,
          lowStock,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: request.member!.uid
        });

        transaction.update(session.ref, {
          status: "COMPLETED",
          completedAt: FieldValue.serverTimestamp(),
          completedBy: request.member!.uid,
          actualShuttlesUsed,
          attendeeCount: result.attendeeCount,
          gameDate,
          tubePriceFils,
          shuttlesPerTube,
          costPerShuttleExactFils: result.costPerShuttleExactFils,
          totalDayCostFils: result.totalDayCostFils,
          perPlayerCostExactFils: costPerPlayerExactFils,
          remainingShuttlesAfterGame: result.remainingShuttles,
          remainingTubesAfterGame: remainingTubes,
          remainingLooseShuttlesAfterGame: remainingLooseShuttles,
          lowStockThresholdShuttles,
          lowStock
        });

        for (const charge of result.charges) {
          transaction.set(chargeRef(sessionId, charge.memberUid), {
            sessionId,
            memberUid: charge.memberUid,
            activityId: session.activityId,
            activityName: session.activityName,
            flightId: session.flightId,
            flightName: session.flightName,
            sessionStartAt: session.startAt,
            gameDate,
            totalChargeFils: charge.amountFils,
            coveredByCreditFils: 0,
            amountDueFils: charge.amountFils,
            dueAt: Timestamp.fromDate(dueAt),
            status: "DUE",
            createdAt: FieldValue.serverTimestamp(),
            completedBy: request.member!.uid
          });
        }

        completedResult = result;
      });

      if (!completedResult) throw new Error("Could not calculate the completed game.");
      const result = completedResult as ReturnType<typeof calculateShuttleCost>;

      await db.collection("inventoryAudit").add({
        flightId: session.flightId,
        sessionId,
        action: "GAME_COMPLETED_AND_STOCK_CONSUMED",
        actualShuttlesUsed,
        gameDate,
        attendeeCount: result.attendeeCount,
        tubePriceFils: completedTubePriceFils,
        shuttlesPerTube: completedShuttlesPerTube,
        costPerShuttleExactFils: result.costPerShuttleExactFils,
        totalDayCostFils: result.totalDayCostFils,
        perPlayerCostExactFils: costPerPlayerExactFils,
        remainingShuttles: result.remainingShuttles,
        remainingTubes,
        remainingLooseShuttles,
        lowStockThresholdShuttles,
        lowStock,
        actionBy: request.member!.uid,
        createdAt: FieldValue.serverTimestamp()
      });

      response.json({
        success: true,
        ...result,
        gameDate,
        dueAt: dueAt.toISOString(),
        remainingTubes,
        remainingLooseShuttles,
        lowStockThresholdShuttles,
        lowStock,
        perPlayerCostExactFils: costPerPlayerExactFils
      });
    } catch (error) {
      response.status(400).json({
        message: error instanceof Error ? error.message : "Could not complete game finance."
      });
    }
  }
);

/* A Player explicitly chooses to settle one completed shuttlecock charge with existing credit. */
router.post("/charges/:chargeId/pay-with-credit", requireAuth, async (request, response) => {
  try {
    const chargeId = asText(request.params.chargeId, "Charge ID");
    const charge = await db.collection("sessionCharges").doc(chargeId).get();
    const creditPaymentId = `credit_${chargeId}`;
    const creditPaymentCode = makePaymentCode("CR", chargeId);

    if (!charge.exists) {
      return response.status(404).json({ message: "Charge not found." });
    }

    if (charge.data()!.memberUid !== request.member!.uid) {
      return response.status(403).json({ message: "You may pay only your own charge." });
    }

    let remainingBalanceFils = 0;
    await db.runTransaction(async transaction => {
      const liveCharge = await transaction.get(charge.ref);
      if (!liveCharge.exists || liveCharge.data()!.status !== "DUE") {
        throw new Error("This charge is not available for credit payment.");
      }

      const due = Number(liveCharge.data()!.amountDueFils || 0);
      if (!Number.isInteger(due) || due <= 0) {
        throw new Error("This charge has no payable balance.");
      }

      const wallet = walletRef(request.member!.uid);
      const liveWallet = await transaction.get(wallet);
      const balance = liveWallet.exists ? Number(liveWallet.data()!.balanceFils || 0) : 0;

      if (balance < due) {
        throw new Error(
          "Your wallet credit is too low. Please top up or submit Cash/Benefit payment."
        );
      }

      remainingBalanceFils = balance - due;
      transaction.set(
        wallet,
        {
          memberUid: request.member!.uid,
          balanceFils: remainingBalanceFils,
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );

      transaction.update(charge.ref, {
        amountDueFils: 0,
        coveredByCreditFils: Number(liveCharge.data()!.coveredByCreditFils || 0) + due,
        status: "PAID_BY_CREDIT",
        paymentId: creditPaymentId,
        paymentCode: creditPaymentCode,
        paymentMethod: "WALLET_CREDIT",
        paidAt: FieldValue.serverTimestamp()
      });

      transaction.set(db.collection("walletLedger").doc(`credit_payment_${chargeId}`), {
        memberUid: request.member!.uid,
        flightId: liveCharge.data()!.flightId,
        sessionId: liveCharge.data()!.sessionId,
        direction: "DEBIT",
        amountFils: due,
        description: `Credit payment for ${liveCharge.data()!.flightName}`,
        paymentId: creditPaymentId,
        paymentCode: creditPaymentCode,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: request.member!.uid
      });

      transaction.set(db.collection("payments").doc(creditPaymentId), {
        kind: "SESSION_SETTLEMENT",
        chargeId,
        memberUid: request.member!.uid,
        flightId: liveCharge.data()!.flightId,
        amountFils: due,
        method: "WALLET_CREDIT",
        paymentCode: creditPaymentCode,
        status: "VERIFIED",
        submittedAt: FieldValue.serverTimestamp(),
        verifiedAt: FieldValue.serverTimestamp(),
        verifiedBy: request.member!.uid,
        source: "PLAYER_USE_CREDIT"
      });
    });

    response.json({ success: true, message: "Shuttlecock charge paid using wallet credit.", remainingBalanceFils, paymentId: creditPaymentId, paymentCode: creditPaymentCode });
  } catch (error) {
    response.status(400).json({
      message: error instanceof Error ? error.message : "Could not pay using credit."
    });
  }
});

/* Only Super Admin may add verified wallet credit for any active club member participating in an assigned flight. */
router.post(
  "/admin/wallet-credit",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (request, response) => {
    try {
      const memberUid = asText(request.body.memberUid, "Member");
      const amountFils = asWholeNumber(request.body.amountFils, "Credit amount", 1);
      const note = asText(request.body.note || "Verified club credit", "Credit note");
      const target = await db.collection("members").doc(memberUid).get();

      if (!target.exists) throw new Error("Member not found.");
      const targetData = target.data()!;
      if (targetData.active === false || !targetData.flightId || !["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(String(targetData.role || ""))) {
        throw new Error("Wallet credit can be added only to an active member assigned to a flight.");
      }

      const ledgerRef = db.collection("walletLedger").doc();

      await db.runTransaction(async transaction => {
        const wallet = walletRef(memberUid);
        const current = await transaction.get(wallet);
        const before = current.exists ? Number(current.data()!.balanceFils || 0) : 0;

        transaction.set(
          wallet,
          {
            memberUid,
            balanceFils: before + amountFils,
            updatedAt: FieldValue.serverTimestamp()
          },
          { merge: true }
        );

        transaction.set(ledgerRef, {
          memberUid,
          flightId: targetData.flightId,
          direction: "CREDIT",
          creditSource: "SUPER_ADMIN_VERIFIED_CREDIT",
          amountFils,
          description: note,
          createdAt: FieldValue.serverTimestamp(),
          createdBy: request.member!.uid
        });
      });

      response.json({ success: true, ledgerId: ledgerRef.id });
    } catch (error) {
      response.status(400).json({
        message: error instanceof Error ? error.message : "Could not add wallet credit."
      });
    }
  }
);

/* Super Admin may correct an existing wallet without deleting its history. */
router.post(
  "/admin/wallet-adjustment",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (request, response) => {
    try {
      const memberUid = asText(request.body.memberUid, "Member");
      const adjustmentFils = asSignedWholeNumber(request.body.adjustmentFils, "Wallet adjustment");
      const note = asText(request.body.note, "Correction note");
      const target = await db.collection("members").doc(memberUid).get();

      if (!target.exists) throw new Error("Member not found.");
      const targetData = target.data()!;
      if (targetData.active === false || !targetData.flightId || !["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(String(targetData.role || ""))) {
        throw new Error("A wallet can be corrected only for an active member assigned to a flight.");
      }

      const ledgerRef = db.collection("walletLedger").doc();
      let balanceBeforeFils = 0;
      let balanceAfterFils = 0;

      await db.runTransaction(async transaction => {
        const wallet = walletRef(memberUid);
        const current = await transaction.get(wallet);
        balanceBeforeFils = current.exists ? Number(current.data()!.balanceFils || 0) : 0;
        balanceAfterFils = balanceBeforeFils + adjustmentFils;

        if (balanceAfterFils < 0) {
          throw new Error("This correction would make the member wallet negative. Enter a smaller deduction.");
        }

        transaction.set(
          wallet,
          {
            memberUid,
            balanceFils: balanceAfterFils,
            updatedAt: FieldValue.serverTimestamp(),
            updatedBy: request.member!.uid
          },
          { merge: true }
        );

        transaction.set(ledgerRef, {
          memberUid,
          flightId: targetData.flightId,
          direction: adjustmentFils > 0 ? "CREDIT" : "DEBIT",
          creditSource: "SUPER_ADMIN_WALLET_CORRECTION",
          amountFils: Math.abs(adjustmentFils),
          adjustmentFils,
          balanceBeforeFils,
          balanceAfterFils,
          description: note,
          createdAt: FieldValue.serverTimestamp(),
          createdBy: request.member!.uid
        });
      });

      response.json({
        success: true,
        ledgerId: ledgerRef.id,
        balanceBeforeFils,
        balanceAfterFils
      });
    } catch (error) {
      response.status(400).json({
        message: error instanceof Error ? error.message : "Could not correct wallet credit."
      });
    }
  }
);

/* A Player submits one Cash or Benefit claim for one due charge; duplicate claims are blocked. */
router.post("/charges/:chargeId/payment-claim", requireAuth, async (request, response) => {
  try {
    const chargeId = asText(request.params.chargeId, "Charge ID");
    const method = asText(request.body.method, "Payment method").toUpperCase();
    const reference = asText(request.body.reference, "Payment reference");

    if (!["CASH", "BENEFIT"].includes(method)) {
      throw new Error("Payment method must be CASH or BENEFIT.");
    }

    const chargeRefToPay = db.collection("sessionCharges").doc(chargeId);
    const paymentRef = db.collection("payments").doc(`cash_benefit_${chargeId}`);
    const paymentCode = makePaymentCode("CB", chargeId);

    await db.runTransaction(async transaction => {
      const [charge, existingPayment] = await Promise.all([
        transaction.get(chargeRefToPay),
        transaction.get(paymentRef)
      ]);

      if (!charge.exists) throw new Error("Charge not found.");
      const chargeData = charge.data()!;

      if (chargeData.memberUid !== request.member!.uid) {
        throw new Error("You may submit payment only for your own charge.");
      }

      if (chargeData.status !== "DUE") {
        throw new Error("This charge does not need a manual payment.");
      }

      if (existingPayment.exists) {
        throw new Error("A Cash/Benefit claim for this charge is already awaiting confirmation.");
      }

      transaction.set(paymentRef, {
        kind: "SESSION_SETTLEMENT",
        chargeId,
        memberUid: request.member!.uid,
        flightId: chargeData.flightId,
        amountFils: Number(chargeData.amountDueFils),
        method,
        reference,
        paymentCode,
        status: "PENDING",
        submittedAt: FieldValue.serverTimestamp()
      });
    });

    response.status(201).json({ id: paymentRef.id, paymentCode, status: "PENDING" });
  } catch (error) {
    response.status(400).json({
      message: error instanceof Error ? error.message : "Could not submit payment claim."
    });
  }
});

/* Flight Admin confirms Cash/Benefit settlement only for the assigned flight. */
router.post(
  "/payments/:paymentId/verify",
  requireAuth,
  requireRole("LEVEL_ADMIN", "SUPER_ADMIN"),
  async (request, response) => {
    try {
      const paymentId = asText(request.params.paymentId, "Payment ID");
      const paymentRef = db.collection("payments").doc(paymentId);

      await db.runTransaction(async transaction => {
        const payment = await transaction.get(paymentRef);
        if (!payment.exists) throw new Error("Payment not found.");
        const data = payment.data()!;

        if (data.status !== "PENDING") {
          throw new Error("This payment was already processed.");
        }

        if (data.flightId && !requireFlightAccess(data.flightId, request.member!)) {
          throw new Error("You may verify payments only for your assigned flight.");
        }

        if (data.kind === "CREDIT_TOPUP" && request.member!.role !== "SUPER_ADMIN") {
          throw new Error("Only Super Admin may approve wallet credit top-ups.");
        }

        if (data.kind === "SESSION_SETTLEMENT") {
          const charge = await transaction.get(db.collection("sessionCharges").doc(data.chargeId));
          if (!charge.exists) throw new Error("Session charge not found.");

          const chargeData = charge.data()!;
          if (
            chargeData.status !== "DUE" ||
            chargeData.memberUid !== data.memberUid ||
            chargeData.flightId !== data.flightId
          ) {
            throw new Error("The linked charge is no longer available for manual settlement.");
          }

          transaction.update(charge.ref, {
            amountDueFils: 0,
            status: "PAID_MANUAL",
            verifiedPaymentId: paymentId,
            paymentCode: data.paymentCode || paymentId,
            paymentMethod: data.method,
            paidAt: FieldValue.serverTimestamp()
          });
        }

        if (data.kind === "CREDIT_TOPUP") {
          const wallet = walletRef(data.memberUid);
          const existingWallet = await transaction.get(wallet);
          const before = existingWallet.exists ? Number(existingWallet.data()!.balanceFils || 0) : 0;

          transaction.set(
            wallet,
            {
              memberUid: data.memberUid,
              balanceFils: before + Number(data.amountFils),
              updatedAt: FieldValue.serverTimestamp()
            },
            { merge: true }
          );

          transaction.set(db.collection("walletLedger").doc(), {
            memberUid: data.memberUid,
            flightId: data.flightId || null,
            direction: "CREDIT",
            creditSource: "SUPER_ADMIN_VERIFIED_TOPUP",
            amountFils: Number(data.amountFils),
            description: `Verified ${data.method} wallet top-up`,
            paymentId,
            createdAt: FieldValue.serverTimestamp(),
            createdBy: request.member!.uid
          });
        }

        transaction.update(paymentRef, {
          status: "VERIFIED",
          verifiedAt: FieldValue.serverTimestamp(),
          verifiedBy: request.member!.uid
        });
      });

      response.json({ success: true });
    } catch (error) {
      response.status(400).json({
        message: error instanceof Error ? error.message : "Could not verify payment."
      });
    }
  }
);

/* A Player sees only their own wallet, charges, payment claims, and arrears. */
router.get("/mine", requireAuth, async (request, response) => {
  try {
    const memberUid = request.member!.uid;
    const [wallet, ledger, charges, payments, adminSnapshot] = await Promise.all([
      walletRef(memberUid).get(),
      db.collection("walletLedger").where("memberUid", "==", memberUid).get(),
      db.collection("sessionCharges").where("memberUid", "==", memberUid).get(),
      db.collection("payments").where("memberUid", "==", memberUid).get(),
      db.collection("members").where("role", "==", "LEVEL_ADMIN").get()
    ]);

    const chargeSessionIds = [...new Set(charges.docs.map(doc => String(doc.data().sessionId || "")).filter(Boolean))];
    const sessionDocs = await Promise.all(chargeSessionIds.map(sessionId => db.collection("sessions").doc(sessionId).get()));
    const sessionById = new Map(sessionDocs.filter(doc => doc.exists).map(doc => [doc.id, doc.data()!]));

    const assignedFlightId = request.member!.flightId || null;
    const assignedFlightAdmin = adminSnapshot.docs
      .map(doc => ({ uid: doc.id, ...doc.data() }))
      .find(admin => admin.active !== false && assignedFlightId && admin.flightId === assignedFlightId) as Record<string, unknown> | undefined;

    const iso = (value: unknown) => {
      const time = dateValue(value);
      return time ? new Date(time).toISOString() : null;
    };

    const newestFirst = (a: Record<string, unknown>, b: Record<string, unknown>) =>
      dateValue(b.createdAt || b.submittedAt || b.dueAt) -
      dateValue(a.createdAt || a.submittedAt || a.dueAt);

    const chargeRows = charges.docs.map(doc => {
      const charge = doc.data();
      const session = sessionById.get(String(charge.sessionId || "")) || {};
      return {
        id: doc.id,
        ...charge,
        gameStartAt: iso(session.startAt || charge.sessionStartAt),
        gameEndAt: iso(session.endAt),
        completedAt: iso(session.completedAt),
        actualShuttlesUsed: Number(session.actualShuttlesUsed || 0),
        finalPresentCount: Number(session.attendeeCount || 0),
        totalGameCostFils: Number(session.totalDayCostFils || 0),
        dueAt: iso(charge.dueAt),
        createdAt: iso(charge.createdAt),
        paidAt: iso(charge.paidAt)
      };
    });

    const paymentRows = payments.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: iso(doc.data().submittedAt),
      verifiedAt: iso(doc.data().verifiedAt)
    }));

    const ledgerRows = ledger.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: iso(doc.data().createdAt)
    }));

    const now = Date.now();

    response.json({
      balanceFils: wallet.exists ? Number(wallet.data()!.balanceFils || 0) : 0,
      ledger: ledgerRows.sort(newestFirst),
      charges: chargeRows.sort(newestFirst),
      payments: paymentRows.sort(newestFirst),
      unpaidFils: chargeRows
        .filter(row => Number(row.amountDueFils || 0) > 0)
        .reduce((sum, row) => sum + Number(row.amountDueFils || 0), 0),
      arrearsFils: chargeRows
        .filter(
          row =>
            Number(row.amountDueFils || 0) > 0 &&
            row.dueAt &&
            new Date(row.dueAt).getTime() <= now
        )
        .reduce((sum, row) => sum + Number(row.amountDueFils || 0), 0),
      flightAdminContact: assignedFlightAdmin ? {
        name: assignedFlightAdmin.fullName || assignedFlightAdmin.memberId || "Flight Admin",
        phone: assignedFlightAdmin.phone || ""
      } : null
    });
  } catch (error) {
    response.status(400).json({
      message: error instanceof Error ? error.message : "Could not load your wallet."
    });
  }
});

/*
  Super Admin may filter every activity and flight.
  Flight Admin is always forced to its assigned flight.
  Server-side filtering avoids Firestore compound-index requirements.
*/
router.get("/overview", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const requestedActivityId = queryText(request.query.activityId);
    const requestedFlightId = queryText(request.query.flightId);
    const isFlightAdmin = request.member!.role === "LEVEL_ADMIN";

    const [wallets, payments, charges, sessions, members, activities, ledger] = await Promise.all([
      db.collection("wallets").get(),
      db.collection("payments").get(),
      db.collection("sessionCharges").get(),
      db.collection("sessions").where("status", "==", "COMPLETED").get(),
      db.collection("members").get(),
      db.collection("activities").get(),
      db.collection("walletLedger").get()
    ]);

    const flightRows = (await Promise.all(activities.docs.map(async activity => {
      const activityData = activity.data();
      const flights = await activity.ref.collection("flights").get();
      return flights.docs.map(flight => ({
        id: flight.id,
        ...flight.data(),
        activityId: String(flight.data().activityId || activity.id),
        activityName: String(flight.data().activityName || activityData.name || "Activity")
      }));
    }))).flat();
    let permittedFlightIds: Set<string> | null = null;

    if (isFlightAdmin) {
      if (!request.member!.flightId) {
        throw new Error("Your Flight Admin account has no assigned flight.");
      }
      permittedFlightIds = new Set([String(request.member!.flightId)]);
    } else {
      const activityFlights = requestedActivityId
        ? flightRows.filter(row => String(row.activityId || "") === requestedActivityId)
        : flightRows;

      if (requestedFlightId) {
        if (!activityFlights.some(row => row.id === requestedFlightId)) {
          throw new Error("The selected flight does not belong to the selected activity.");
        }
        permittedFlightIds = new Set([requestedFlightId]);
      } else if (requestedActivityId) {
        permittedFlightIds = new Set(activityFlights.map(row => row.id));
      }
    }

    const rowInScope = (row: FirebaseFirestore.DocumentData) =>
      !permittedFlightIds || permittedFlightIds.has(String(row.flightId || ""));

    const memberByUid = new Map(members.docs.map(doc => [doc.id, doc.data()]));

    const memberInScope = (memberUid: string) => {
      if (!permittedFlightIds) return true;
      return permittedFlightIds.has(String(memberByUid.get(memberUid)?.flightId || ""));
    };

    const enrichMember = (row: FirebaseFirestore.DocumentData & { id: string }) => {
      const member = memberByUid.get(String(row.memberUid)) || {};
      return {
        ...row,
        memberName: member.fullName || member.displayName || member.memberId || row.memberUid,
        memberId: member.memberId || "",
        phone: member.phone || "",
        activityId: member.activityId || ""
      };
    };

    const newestFirst = (a: Record<string, unknown>, b: Record<string, unknown>) =>
      dateValue(b.createdAt || b.submittedAt || b.paidAt || b.dueAt) -
      dateValue(a.createdAt || a.submittedAt || a.paidAt || a.dueAt);

    const allPayments = payments.docs
      .map(doc => enrichMember({ id: doc.id, ...doc.data() }))
      .filter(rowInScope);

    const pendingPayments = allPayments.filter(
      row => row.status === "PENDING" && (!isFlightAdmin || row.kind === "SESSION_SETTLEMENT")
    );

    const allCharges = charges.docs
      .map(doc => enrichMember({ id: doc.id, ...doc.data() }))
      .filter(rowInScope);

    const unpaid = allCharges.filter(row => row.status === "DUE");
    const paid = allCharges.filter(row => String(row.status || "").startsWith("PAID"));
    const now = Date.now();
    const arrears = unpaid.filter(row => dateValue(row.dueAt) > 0 && dateValue(row.dueAt) <= now);

    const credits = ledger.docs
      .map(doc => enrichMember({ id: doc.id, ...doc.data() }))
      .filter(row => row.direction === "CREDIT" && memberInScope(String(row.memberUid)))
      .sort(newestFirst);

    const creditedMembers = wallets.docs
      .filter(doc => memberInScope(doc.id))
      .map(doc => {
        const member = memberByUid.get(doc.id) || {};
        const flightId = String(member.flightId || "");
        const flight = flightRows.find(row => row.id === flightId);
        const balanceFils = Number(doc.data().balanceFils || 0);
        return {
          memberUid: doc.id,
          memberName: member.fullName || member.displayName || member.memberId || doc.id,
          memberId: member.memberId || "",
          phone: member.phone || "",
          flightId,
          flightName: flight?.name || "—",
          balanceFils,
          status: balanceFils < 1000 ? "DUE" : "CREDIT AVAILABLE",
          updatedAt: doc.data().updatedAt || null
        };
      })
      .sort((a, b) => String(a.memberName).localeCompare(String(b.memberName)));

    const completedSessions = sessions.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(rowInScope)
      .sort((a, b) => dateValue(b.startAt || b.completedAt) - dateValue(a.startAt || a.completedAt));

    response.json({
      scope: {
        activityId: requestedActivityId || null,
        flightId: isFlightAdmin ? request.member!.flightId : requestedFlightId || null,
        flights: flightRows
          .filter(row => !permittedFlightIds || permittedFlightIds.has(row.id))
          .map(row => ({
            id: row.id,
            name: row.name,
            activityId: row.activityId || null
          }))
      },
      totalCreditFils: wallets.docs
        .filter(doc => memberInScope(doc.id))
        .reduce((sum, doc) => sum + Number(doc.data().balanceFils || 0), 0),
      pendingPaymentFils: pendingPayments.reduce(
        (sum, row) => sum + Number(row.amountFils || 0),
        0
      ),
      arrearsFils: arrears.reduce((sum, row) => sum + Number(row.amountDueFils || 0), 0),
      monthCostFils: completedSessions
        .filter(row => String(row.month || "") === new Date().toISOString().slice(0, 7))
        .reduce((sum, row) => sum + Number(row.totalDayCostFils || 0), 0),
      credits: creditedMembers,
      creditHistory: credits,
      pendingPayments: pendingPayments.sort(newestFirst),
      paid: paid.sort(newestFirst),
      unpaid: unpaid.sort(newestFirst),
      arrears: arrears.sort(newestFirst),
      gameLog: completedSessions.map(row => ({
        ...row,
        startAt: iso(row.startAt),
        endAt: iso(row.endAt),
        completedAt: iso(row.completedAt),
        gameDate: row.gameDate || iso(row.startAt)
      }))
    });
  } catch (error) {
    response.status(400).json({
      message: error instanceof Error ? error.message : "Could not load finance overview."
    });
  }
});

export default router;
