import { Router } from "express";
import { db } from "../firebaseAdmin.js";
import { isPaymentArrears } from "../clubLogic.js";
import { requireAuth, requireRoles } from "../auth.js";

export const arrearsRouter = Router();

// Super Admin runs this before viewing/exporting arrears. A future scheduled job can call the same rule.
arrearsRouter.post("/refresh", requireAuth, requireRoles("SUPER_ADMIN"), async (_req, res) => {
  const rows = await db.collection("payments").where("status", "==", "PENDING").get();
  const batch = db.batch(); let marked = 0;
  for (const row of rows.docs) {
    const payment = row.data();
    if (isPaymentArrears(payment.createdAtUtc, payment.status)) { batch.update(row.ref, { status:"ARREARS" }); marked++; }
  }
  if (marked) await batch.commit();
  res.json({ marked });
});
