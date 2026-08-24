import { Router } from "express";
import { db, FieldValue, Timestamp } from "../firebaseAdmin.js";
import { requireAuth, requireFlightAccess, requireRole } from "../auth.js";
import { arrearsDueAt, calculateShuttleCost } from "../clubLogic.js";

const router = Router();

const asText = (value: unknown, label: string, max = 240) => {
  const text = String(value || "").trim();
  if (!text || text.length > max) throw new Error(`${label} is required and must be under ${max} characters.`);
  return text;
};

const asWholeNumber = (value: unknown, label: string, minimum = 0) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum) throw new Error(`${label} must be a whole number of ${minimum} or more.`);
  return number;
};

function asDate(value: unknown) {
  if (value && typeof (value as Timestamp).toDate === "function") return (value as Timestamp).toDate();
  return new Date(value as string);
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
  if (!requireFlightAccess(session.flightId, member!)) throw new Error("You may manage finance only for your assigned flight.");
  return { ref: sessionDoc.ref, id: sessionDoc.id, ...session };
}

/*
  Complete a game only after the Flight Admin enters ACTUAL shuttlecocks used.
  Charge formula is calculated only from final PRESENT attendance.
*/
router.post("/session/:sessionId/complete", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const sessionId = asText(request.params.sessionId, "Session ID");
    const actualShuttlesUsed = asWholeNumber(request.body.actualShuttlesUsed, "Actual shuttlecocks used");
    const session = await loadSessionForAdmin(sessionId, request.member);
    if (session.status === "COMPLETED") return response.status(409).json({ message: "This session has already been completed and charged." });
    if (asDate(session.endAt).getTime() > Date.now()) return response.status(400).json({ message: "A session can be completed only after its scheduled end time." });

    const [stockDoc, attendance] = await Promise.all([
      db.collection("inventory").doc(session.flightId).get(),
      db.collection("attendance").where("sessionId", "==", sessionId).where("status", "==", "PRESENT").get()
    ]);
    if (!stockDoc.exists) throw new Error("Set the flight inventory price and stock before completing the game.");

    const stock = stockDoc.data()!;
    const presentMemberUids = attendance.docs.map(doc => String(doc.data().memberUid));
    const result = calculateShuttleCost({
      availableTubes: Number(stock.availableTubes),
      looseShuttles: Number(stock.looseShuttles),
      shuttlesPerTube: Number(stock.shuttlesPerTube),
      tubePriceFils: Number(stock.tubePriceFils)
    }, actualShuttlesUsed, presentMemberUids);

    const dueAt = arrearsDueAt(session.endAt);
    await db.runTransaction(async transaction => {
      const liveSession = await transaction.get(session.ref);
      if (!liveSession.exists || liveSession.data()!.status === "COMPLETED") throw new Error("This session was already completed.");

      const liveStock = await transaction.get(stockDoc.ref);
      if (!liveStock.exists) throw new Error("Inventory record no longer exists.");
      const currentStock = liveStock.data()!;
      if (
        Number(currentStock.availableTubes) !== Number(stock.availableTubes) ||
        Number(currentStock.looseShuttles) !== Number(stock.looseShuttles) ||
        Number(currentStock.shuttlesPerTube) !== Number(stock.shuttlesPerTube) ||
        Number(currentStock.tubePriceFils) !== Number(stock.tubePriceFils)
      ) throw new Error("Inventory changed while completing this session. Review the latest stock and submit again.");

      const remainingTubes = Math.floor(result.remainingShuttles / Number(stock.shuttlesPerTube));
      const remainingLoose = result.remainingShuttles % Number(stock.shuttlesPerTube);
      transaction.update(stockDoc.ref, {
        availableTubes: remainingTubes,
        looseShuttles: remainingLoose,
        totalAvailableShuttles: result.remainingShuttles,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: request.member!.uid
      });

      transaction.update(session.ref, {
        status: "COMPLETED",
        completedAt: FieldValue.serverTimestamp(),
        completedBy: request.member!.uid,
        actualShuttlesUsed,
        attendeeCount: result.attendeeCount,
        totalDayCostFils: result.totalDayCostFils,
        remainingShuttlesAfterGame: result.remainingShuttles
      });

      for (const charge of result.charges) {
        const walletDocument = await transaction.get(walletRef(charge.memberUid));
        const walletBeforeFils = walletDocument.exists ? Number(walletDocument.data()!.balanceFils || 0) : 0;
        const coveredByCreditFils = 0;
        const amountDueFils = charge.amountFils;
        const status = "DUE";

        transaction.set(chargeRef(sessionId, charge.memberUid), {
          sessionId,
          memberUid: charge.memberUid,
          flightId: session.flightId,
          flightName: session.flightName,
          totalChargeFils: charge.amountFils,
          coveredByCreditFils,
          amountDueFils,
          dueAt: Timestamp.fromDate(dueAt),
          status,
          createdAt: FieldValue.serverTimestamp(),
          completedBy: request.member!.uid
        });
      }
    });

    await db.collection("inventoryAudit").add({
      flightId: session.flightId,
      sessionId,
      action: "GAME_COMPLETED_AND_STOCK_CONSUMED",
      actualShuttlesUsed,
      remainingShuttles: result.remainingShuttles,
      totalDayCostFils: result.totalDayCostFils,
      attendeeCount: result.attendeeCount,
      actionBy: request.member!.uid,
      createdAt: FieldValue.serverTimestamp()
    });

    response.json({ success: true, ...result, dueAt: dueAt.toISOString() });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not complete game finance." });
  }
});

/* Player chooses to settle a completed shuttlecock charge from available credit. */
router.post("/charges/:chargeId/pay-with-credit", requireAuth, async (request, response) => {
  try {
    const chargeId = asText(request.params.chargeId, "Charge ID");
    const charge = await db.collection("sessionCharges").doc(chargeId).get();
    if (!charge.exists) return response.status(404).json({ message: "Charge not found." });
    if (charge.data()!.memberUid !== request.member!.uid) return response.status(403).json({ message: "You may pay only your own charge." });

    await db.runTransaction(async transaction => {
      const liveCharge = await transaction.get(charge.ref);
      if (!liveCharge.exists || liveCharge.data()!.status !== "DUE") throw new Error("This charge is not available for credit payment.");
      const due = Number(liveCharge.data()!.amountDueFils || 0);
      const wallet = walletRef(request.member!.uid);
      const liveWallet = await transaction.get(wallet);
      const balance = liveWallet.exists ? Number(liveWallet.data()!.balanceFils || 0) : 0;
      if (balance < due) throw new Error("Your wallet credit is too low. Please top up or submit Cash/Benefit payment.");
      transaction.set(wallet, { memberUid: request.member!.uid, balanceFils: balance - due, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      transaction.update(charge.ref, { amountDueFils: 0, coveredByCreditFils: Number(liveCharge.data()!.coveredByCreditFils || 0) + due, status: "PAID_BY_CREDIT", paidAt: FieldValue.serverTimestamp() });
      transaction.set(db.collection("walletLedger").doc(`credit_payment_${chargeId}`), { memberUid: request.member!.uid, flightId: liveCharge.data()!.flightId, sessionId: liveCharge.data()!.sessionId, direction: "DEBIT", amountFils: due, description: `Credit payment for ${liveCharge.data()!.flightName}`, createdAt: FieldValue.serverTimestamp(), createdBy: request.member!.uid });
    });
    response.json({ success: true, message: "Shuttlecock charge paid using wallet credit." });
  } catch (error) { response.status(400).json({ message: error instanceof Error ? error.message : "Could not pay using credit." }); }
});

/* Flight Admin credits only their flight; Super Admin may credit any member. */
router.post("/admin/wallet-credit", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const memberUid = asText(request.body.memberUid, "Member");
    const amountFils = asWholeNumber(request.body.amountFils, "Credit amount", 1);
    const note = asText(request.body.note || "Verified club credit", "Credit note");
    const target = await db.collection("members").doc(memberUid).get();
    if (!target.exists) throw new Error("Player not found.");
    if (!requireFlightAccess(target.data()!.flightId, request.member!)) throw new Error("You may credit only your assigned flight.");
    await db.runTransaction(async transaction => {
      const wallet = walletRef(memberUid); const current = await transaction.get(wallet); const before = current.exists ? Number(current.data()!.balanceFils || 0) : 0;
      transaction.set(wallet, { memberUid, balanceFils: before + amountFils, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      transaction.set(db.collection("walletLedger").doc(`admin_credit_${Date.now()}_${memberUid}`), { memberUid, flightId: target.data()!.flightId || null, direction: "CREDIT", amountFils, description: note, createdAt: FieldValue.serverTimestamp(), createdBy: request.member!.uid });
    });
    response.json({ success: true });
  } catch (error) { response.status(400).json({ message: error instanceof Error ? error.message : "Could not add wallet credit." }); }
});

/* Player submits Cash or Benefit payment proof; this remains pending until admin verification. */
router.post("/charges/:chargeId/payment-claim", requireAuth, async (request, response) => {
  try {
    const chargeId = asText(request.params.chargeId, "Charge ID");
    const method = asText(request.body.method, "Payment method").toUpperCase();
    const reference = asText(request.body.reference, "Payment reference");
    if (!["CASH", "BENEFIT"].includes(method)) throw new Error("Payment method must be CASH or BENEFIT.");

    const charge = await db.collection("sessionCharges").doc(chargeId).get();
    if (!charge.exists) return response.status(404).json({ message: "Charge not found." });
    const data = charge.data()!;
    if (data.memberUid !== request.member!.uid) return response.status(403).json({ message: "You may submit payment only for your own charge." });
    if (data.status !== "DUE") return response.status(400).json({ message: "This charge does not need a manual payment." });

    const payment = await db.collection("payments").add({
      kind: "SESSION_SETTLEMENT",
      chargeId,
      memberUid: request.member!.uid,
      flightId: data.flightId,
      amountFils: Number(data.amountDueFils),
      method,
      reference,
      status: "PENDING",
      submittedAt: FieldValue.serverTimestamp()
    });
    response.status(201).json({ id: payment.id, status: "PENDING" });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not submit payment claim." });
  }
});

/* Player can top up wallet credit through a Cash or Benefit claim. */
router.post("/wallet/topup-claim", requireAuth, async (request, response) => {
  try {
    const amountFils = asWholeNumber(request.body.amountFils, "Top-up amount", 1);
    const method = asText(request.body.method, "Payment method").toUpperCase();
    const reference = asText(request.body.reference, "Payment reference");
    if (!["CASH", "BENEFIT"].includes(method)) throw new Error("Payment method must be CASH or BENEFIT.");

    const payment = await db.collection("payments").add({
      kind: "CREDIT_TOPUP",
      memberUid: request.member!.uid,
      flightId: request.member!.flightId || null,
      amountFils,
      method,
      reference,
      status: "PENDING",
      submittedAt: FieldValue.serverTimestamp()
    });
    response.status(201).json({ id: payment.id, status: "PENDING" });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not submit top-up claim." });
  }
});

/* Flight Admin verifies their own flight; Super Admin may verify all. */
router.post("/payments/:paymentId/verify", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const paymentId = asText(request.params.paymentId, "Payment ID");
    const paymentRef = db.collection("payments").doc(paymentId);

    await db.runTransaction(async transaction => {
      const payment = await transaction.get(paymentRef);
      if (!payment.exists) throw new Error("Payment not found.");
      const data = payment.data()!;
      if (data.status !== "PENDING") throw new Error("This payment was already processed.");
      if (data.flightId && !requireFlightAccess(data.flightId, request.member!)) throw new Error("You may verify payments only for your assigned flight.");

      transaction.update(paymentRef, { status: "VERIFIED", verifiedAt: FieldValue.serverTimestamp(), verifiedBy: request.member!.uid });

      if (data.kind === "CREDIT_TOPUP") {
        const wallet = walletRef(data.memberUid);
        const existingWallet = await transaction.get(wallet);
        const before = existingWallet.exists ? Number(existingWallet.data()!.balanceFils || 0) : 0;
        transaction.set(wallet, { memberUid: data.memberUid, balanceFils: before + Number(data.amountFils), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        transaction.set(db.collection("walletLedger").doc(`topup_${paymentId}`), {
          memberUid: data.memberUid,
          flightId: data.flightId || null,
          direction: "CREDIT",
          amountFils: Number(data.amountFils),
          description: `Verified ${data.method} wallet top-up`,
          paymentId,
          createdAt: FieldValue.serverTimestamp(),
          createdBy: request.member!.uid
        });
      }

      if (data.kind === "SESSION_SETTLEMENT") {
        const charge = await transaction.get(db.collection("sessionCharges").doc(data.chargeId));
        if (!charge.exists) throw new Error("Session charge not found.");
        transaction.update(charge.ref, { amountDueFils: 0, status: "PAID_MANUAL", verifiedPaymentId: paymentId, paidAt: FieldValue.serverTimestamp() });
      }
    });

    response.json({ success: true });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not verify payment." });
  }
});

/* Player sees only their own wallet, charges, payment claims and unpaid dues. */
router.get("/mine", requireAuth, async (request, response) => {
  try {
    const memberUid = request.member!.uid;
    const [wallet, ledger, charges, payments] = await Promise.all([
      walletRef(memberUid).get(),
      db.collection("walletLedger").where("memberUid", "==", memberUid).get(),
      db.collection("sessionCharges").where("memberUid", "==", memberUid).get(),
      db.collection("payments").where("memberUid", "==", memberUid).get()
    ]);

    const iso = (value: unknown) => {
      const date = asDate(value);
      return Number.isFinite(date.getTime()) ? date.toISOString() : null;
    };
    const byNewest = (a: Record<string, unknown>, b: Record<string, unknown>) => asDate(b.createdAt || b.submittedAt || b.dueAt).getTime() - asDate(a.createdAt || a.submittedAt || a.dueAt).getTime();
    const chargeRows = charges.docs.map(doc => ({ id: doc.id, ...doc.data(), dueAt: iso(doc.data().dueAt), createdAt: iso(doc.data().createdAt), paidAt: iso(doc.data().paidAt) }));
    const paymentRows = payments.docs.map(doc => ({ id: doc.id, ...doc.data(), submittedAt: iso(doc.data().submittedAt), verifiedAt: iso(doc.data().verifiedAt) }));
    const ledgerRows = ledger.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: iso(doc.data().createdAt) }));
    const now = Date.now();

    response.json({
      balanceFils: wallet.exists ? Number(wallet.data()!.balanceFils || 0) : 0,
      ledger: ledgerRows.sort(byNewest),
      charges: chargeRows.sort(byNewest),
      payments: paymentRows.sort(byNewest),
      unpaidFils: chargeRows.filter(row => Number(row.amountDueFils || 0) > 0).reduce((sum, row) => sum + Number(row.amountDueFils || 0), 0),
      arrearsFils: chargeRows.filter(row => Number(row.amountDueFils || 0) > 0 && row.dueAt && new Date(row.dueAt).getTime() <= now).reduce((sum, row) => sum + Number(row.amountDueFils || 0), 0)
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load your wallet." });
  }
});

router.get("/overview", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const flightId = request.member!.role === "LEVEL_ADMIN" ? request.member!.flightId : undefined;
    const [wallets, payments, charges, sessions] = await Promise.all([
      db.collection("wallets").get(),
      db.collection("payments").where("status", "==", "PENDING").get(),
      db.collection("sessionCharges").where("status", "==", "DUE").get(),
      db.collection("sessions").where("status", "==", "COMPLETED").get()
    ]);
    const belongs = (row: FirebaseFirestore.DocumentData) => !flightId || row.flightId === flightId;
    const pendingPayments = payments.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(belongs);
    const dueCharges = charges.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(belongs);
    const completedSessions = sessions.docs.map(doc => doc.data()).filter(belongs);
    const now = Date.now();

    response.json({
      totalCreditFils: wallets.docs.reduce((sum, doc) => sum + Number(doc.data().balanceFils || 0), 0),
      pendingPaymentFils: pendingPayments.reduce((sum, row) => sum + Number(row.amountFils || 0), 0),
      arrearsFils: dueCharges.filter(row => asDate(row.dueAt).getTime() <= now).reduce((sum, row) => sum + Number(row.amountDueFils || 0), 0),
      monthCostFils: completedSessions.filter(row => String(row.month) === new Date().toISOString().slice(0, 7)).reduce((sum, row) => sum + Number(row.totalDayCostFils || 0), 0),
      pendingPayments,
      arrears: dueCharges.filter(row => asDate(row.dueAt).getTime() <= now)
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load finance overview." });
  }
});

export default router;
