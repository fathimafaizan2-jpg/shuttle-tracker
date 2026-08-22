import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../firebaseAdmin.js";
import { calculateShuttleSessionCost, isAttendanceLocked } from "../clubLogic.js";
import { requireAuth, requireRoles, requireSameFlight } from "../auth.js";

export const financeRouter = Router();

// Run only after game completion: attendance is locked/final and actual shuttle use is recorded.
financeRouter.post("/sessions/:sessionId/apply-charges", requireAuth, requireRoles("LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const sessionRef = db.collection("sessions").doc(req.params.sessionId);
  const sessionSnap = await sessionRef.get();
  const session = sessionSnap.data();
  if (!session) return res.status(404).json({ error: "Session not found" });
  requireSameFlight(session.flightId, req);
  if (!isAttendanceLocked(session.startAtUtc)) return res.status(409).json({ error: "Game must be locked before charges" });
  if (!Number.isInteger(session.shuttlesUsedAfterGame)) return res.status(409).json({ error: "Level Admin must record actual shuttles used" });

  const attendance = await db.collection("attendance")
    .where("sessionId", "==", req.params.sessionId)
    .where("status", "==", "PRESENT")
    .get();
  const attendees = attendance.docs.map(doc => doc.data().playerUid as string).sort();
  if (!attendees.length) return res.status(409).json({ error: "No actual attendees" });

  const calculation = calculateShuttleSessionCost({
    tubePriceFils: session.tubePriceFils,
    shuttlesPerTube: session.shuttlesPerTube,
    availableTubeCount: session.availableTubeCount,
    looseShuttlesBeforeGame: session.looseShuttlesBeforeGame,
    shuttlesUsedAfterGame: session.shuttlesUsedAfterGame,
    actualAttendeeCount: attendees.length
  });

  await db.runTransaction(async tx => {
    const latest = await tx.get(sessionRef);
    if (latest.data()?.status === "CHARGED") throw new Error("Charges already applied");

    for (const [index, uid] of attendees.entries()) {
      const dueFils = calculation.attendeeChargesFils[index];
      const walletRef = db.collection("wallets").doc(uid);
      const wallet = (await tx.get(walletRef)).data() ?? { balanceFils: 0 };
      const creditUsedFils = Math.min(wallet.balanceFils, dueFils);
      const remainingFils = dueFils - creditUsedFils;

      tx.set(walletRef, { balanceFils: wallet.balanceFils - creditUsedFils, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      if (creditUsedFils > 0) tx.create(db.collection("walletEntries").doc(), { uid, sessionId:req.params.sessionId, type:"SESSION_SHUTTLE_CHARGE", amountFils:-creditUsedFils, createdAt:FieldValue.serverTimestamp() });
      if (remainingFils > 0) tx.create(db.collection("payments").doc(), { uid, sessionId:req.params.sessionId, flightId:session.flightId, amountFils:remainingFils, method:null, status:"PENDING", createdAtUtc:Date.now(), createdAt:FieldValue.serverTimestamp() });
    }

    tx.update(sessionRef, { status:"CHARGED", totalDayCostFils:calculation.totalDayCostFils, remainingShuttles:calculation.remainingShuttles, chargedAt:FieldValue.serverTimestamp(), chargedBy:req.member!.uid });
  });
  res.json(calculation);
});

financeRouter.post("/payments/:paymentId/mark-paid", requireAuth, async (req, res) => {
  const input = z.object({ method:z.enum(["CASH","BENEFIT"]) }).parse(req.body);
  const paymentRef = db.collection("payments").doc(req.params.paymentId);
  const payment = (await paymentRef.get()).data();
  if (!payment || payment.uid !== req.member!.uid) return res.status(404).json({ error:"Payment not found" });
  await paymentRef.update({ method:input.method, status:"PENDING", playerMarkedPaidAt:FieldValue.serverTimestamp() });
  res.json({ ok:true });
});

financeRouter.post("/payments/:paymentId/verify", requireAuth, requireRoles("LEVEL_ADMIN","SUPER_ADMIN"), async (req,res) => {
  const paymentRef=db.collection("payments").doc(req.params.paymentId);
  const payment=(await paymentRef.get()).data();
  if (!payment) return res.status(404).json({error:"Payment not found"});
  requireSameFlight(payment.flightId,req);
  await paymentRef.update({ status:"VERIFIED", verifiedBy:req.member!.uid, verifiedAt:FieldValue.serverTimestamp() });
  await db.collection("auditLogs").add({actorUid:req.member!.uid,action:"PAYMENT_VERIFIED",targetId:req.params.paymentId,createdAt:FieldValue.serverTimestamp()});
  res.json({ok:true});
});
