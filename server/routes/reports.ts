import { Router } from "express";
import { requireAuth, requireRoles } from "../auth.js";
import { db } from "../firebaseAdmin.js";

export const reportsRouter = Router();

reportsRouter.get("/attendance.csv", requireAuth, requireRoles("LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const rows = await db.collection("attendance").where("flightId", "==", req.member!.flightId).get();
  const csv = ["sessionId,playerUid,status"]
    .concat(rows.docs.map(d => `${d.data().sessionId},${d.data().playerUid},${d.data().status}`))
    .join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=attendance.csv");
  res.send(csv);
});

reportsRouter.get("/arrears.csv", requireAuth, requireRoles("SUPER_ADMIN"), async (_req, res) => {
  const rows = await db.collection("payments").where("status", "==", "ARREARS").get();
  const csv = ["uid,sessionId,amountFils,status"]
    .concat(rows.docs.map(d => `${d.data().uid},${d.data().sessionId},${d.data().amountFils},${d.data().status}`))
    .join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=arrears.csv");
  res.send(csv);
});
