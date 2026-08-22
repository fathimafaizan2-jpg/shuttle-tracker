import { Router } from "express";
import { db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles } from "../auth.js";

export const reportsRouter=Router();
function csv(rows:string[][]){return rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n")}

reportsRouter.get("/attendance.csv",requireAuth,requireRoles("LEVEL_ADMIN","SUPER_ADMIN"),async(req,res)=>{
  const flightId=req.member!.role==="SUPER_ADMIN"?String(req.query.flightId??""):req.member!.flightId!;
  const rows=await db.collection("attendance").where("flightId","==",flightId).get();
  res.setHeader("Content-Type","text/csv");res.attachment("attendance.csv");res.send(csv([["Session","Player","Status"],...rows.docs.map(d=>[d.data().sessionId,d.data().playerUid,d.data().status])]));
});
reportsRouter.get("/inventory.csv",requireAuth,requireRoles("LEVEL_ADMIN","SUPER_ADMIN"),async(req,res)=>{
  const flightId=req.member!.role==="SUPER_ADMIN"?String(req.query.flightId??""):req.member!.flightId!;
  const rows=await db.collection("inventoryLedger").where("flightId","==",flightId).get();
  res.setHeader("Content-Type","text/csv");res.attachment("inventory-audit.csv");res.send(csv([["Flight","Movement","Tubes","Shuttles","Session"],...rows.docs.map(d=>[d.data().flightId,d.data().movement,d.data().tubeCount??"",d.data().shuttleCount??"",d.data().sessionId??""])]));
});
reportsRouter.get("/arrears.csv",requireAuth,requireRoles("SUPER_ADMIN"),async(_req,res)=>{
  const rows=await db.collection("payments").where("status","==","ARREARS").get();
  res.setHeader("Content-Type","text/csv");res.attachment("arrears.csv");res.send(csv([["Player","Session","Amount fils","Status"],...rows.docs.map(d=>[d.data().uid,d.data().sessionId,d.data().amountFils,d.data().status])]));
});
