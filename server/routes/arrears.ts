import { Router } from "express";
import { db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles } from "../auth.js";
import { isArrears } from "../clubLogic.js";

export const arrearsRouter = Router();

arrearsRouter.post("/refresh", requireAuth, requireRoles("SUPER_ADMIN"), async (_req, res) => {
  const rows = await db.collection("payments").where("status", "==", "PENDING").get();
  let marked = 0;
  const batch = db.batch();
  for (const row of rows.docs) {
    const data = row.data();
    if (isArrears(data.createdAtUtc, "PENDING")) {
      batch.update(row.ref, { status: "ARREARS" });
      marked++;
    }
  }
  if (marked) await batch.commit();
  res.json({ marked });
});
