import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles, requireSameFlight } from "../auth.js";
import { costPerActualAttendeeFils } from "../clubLogic.js";

export const financeRouter = Router();

financeRouter.post("/sessions/:sessionId/charge", requireAuth, requireRoles("LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const sessionRef = db.collection("sessions").doc(req.params.sessionId);
  const sessionSnap = await sessionRef.get();
  const session = sessionSnap.data();
  if (!session) return res.status(404).json({ error: "Session not found" });
  requireSameFlight(session.flightId, req);

  const attendance = await db.collection("attendance").where("sessionId", "==", req.params.sessionId).where("status", "==", "PRESENT").get();
  const people = attendance.docs.map(x => x.data().playerUid as string);
  const cost = costPerActualAttendeeFils(session.tubePriceFils, session.tubesUsed, people.length);

  await db.runTransaction(async tx => {
    const already = await tx.get(sessionRef);
    if (already.data()?.status === "CHARGED") throw new Error("Session already charged");
    for (const uid of people) {
      const walletRef = db.collection("wallets").doc(uid);
      const wallet = await tx.get(walletRef);
      const balance = (wallet.data()?.balanceFils ?? 0);
      const remaining = Math.max(0, cost.costPerPersonFils - balance);
      tx.set(walletRef, { balanceFils: Math.max(0, balance - cost.costPerPersonFils), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      tx.create(db.collection("walletEntries").doc(), { uid, sessionId: req.params.sessionId, type: "SESSION_CHARGE", amountFils: -Math.min(balance, cost.costPerPersonFils), createdAt: FieldValue.serverTimestamp() });
      if (remaining > 0) tx.create(db.collection("payments").doc(), { uid, sessionId: req.params.sessionId, flightId: session.flightId, amountFils: remaining, method: "CASH", status: "PENDING", createdAtUtc: Date.now(), createdAt: FieldValue.serverTimestamp() });
    }
    tx.update(sessionRef, { status: "CHARGED", totalCostFils: cost.totalSessionCostFils, costPerPersonFils: cost.costPerPersonFils, chargedAt: FieldValue.serverTimestamp() });
  });
  res.json({ charged: people.length, costPerPersonFils: cost.costPerPersonFils });
});

financeRouter.post("/payments/:id/verify", requireAuth, requireRoles("LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const payment = db.collection("payments").doc(req.params.id);
  await payment.update({ status: "VERIFIED", verifiedBy: req.member!.uid, verifiedAt: FieldValue.serverTimestamp() });
  res.json({ ok: true });
});
