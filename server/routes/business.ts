import { randomBytes } from "node:crypto";
import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles } from "../auth.js";

export const businessRouter = Router();
const PENDING="PENDING_SUPER_ADMIN_APPROVAL";
const APPROVED="APPROVED";
const ref=()=>`BIZ-${randomBytes(4).toString("hex").toUpperCase()}`;
const normal=(phone:string)=>phone.replace(/[^0-9+]/g,"");
const submission=z.object({businessName:z.string().min(2).max(100),ownerName:z.string().min(2).max(100),phone:z.string().min(6),category:z.string().min(2).max(40),description:z.string().min(10).max(1000),packageId:z.string().min(1),flyerUrl:z.string().url().optional(),googleMapsUrl:z.string().url().optional(),discountText:z.string().max(300).optional()});

// Public Indi Mart: no Player login required.
businessRouter.get("/public/notices",async(_req,res)=>{
  const rows=await db.collection("publicNotices").where("status","==",APPROVED).get();
  res.json(rows.docs.map(d=>({id:d.id,...d.data()})));
});
businessRouter.get("/public/directory",async(req,res)=>{
  const search=String(req.query.search??"").toLowerCase();
  const rows=await db.collection("businessSubmissions").where("status","==",APPROVED).get();
  res.json(rows.docs.map(d=>({id:d.id,...d.data()})).filter((b:any)=>!search||`${b.businessName} ${b.category} ${b.description}`.toLowerCase().includes(search)).map((b:any)=>({id:b.id,businessName:b.businessName,category:b.category,description:b.description,flyerUrl:b.flyerUrl??null,googleMapsUrl:b.googleMapsUrl??null,discountText:b.discountText??null})));
});
businessRouter.get("/public/sponsors",async(_req,res)=>{
  const rows=await db.collection("businessSubmissions").where("status","==",APPROVED).get();
  res.json(rows.docs.map(d=>({id:d.id,...d.data()})).filter((b:any)=>!b.liveUntilUtc||b.liveUntilUtc>=Date.now()).map((b:any)=>({id:b.id,businessName:b.businessName,flyerUrl:b.flyerUrl??null,discountText:b.discountText??null})));
});

// Business visitors may submit only. They never get a member account/dashboard.
businessRouter.post("/public/submit",async(req,res)=>{
  const input=submission.parse(req.body); const referenceCode=ref();
  await db.collection("businessSubmissions").add({...input,phoneNormalised:normal(input.phone),referenceCode,status:PENDING,createdAt:FieldValue.serverTimestamp()});
  res.status(201).json({referenceCode,status:PENDING});
});

// Reference code + matching phone creates an update request, never direct public edit.
businessRouter.post("/public/update-request",async(req,res)=>{
  const input=z.object({referenceCode:z.string().regex(/^BIZ-[A-Z0-9]{8}$/),phone:z.string().min(6),flyerUrl:z.string().url().optional(),description:z.string().max(1000).optional(),discountText:z.string().max(300).optional()}).parse(req.body);
  const found=await db.collection("businessSubmissions").where("referenceCode","==",input.referenceCode).limit(1).get();
  if(found.empty||normal(input.phone)!==found.docs[0].data().phoneNormalised)return res.status(403).json({error:"Reference code or phone invalid"});
  await db.collection("businessUpdateRequests").add({businessId:found.docs[0].id,changes:{flyerUrl:input.flyerUrl??null,description:input.description??null,discountText:input.discountText??null},status:PENDING,createdAt:FieldValue.serverTimestamp()});
  res.status(201).json({status:PENDING});
});

businessRouter.get("/admin/queue",requireAuth,requireRoles("SUPER_ADMIN"),async(_req,res)=>{
  const [a,b]=await Promise.all([db.collection("businessSubmissions").where("status","==",PENDING).get(),db.collection("businessUpdateRequests").where("status","==",PENDING).get()]);
  res.json({submissions:a.docs.map(d=>({id:d.id,...d.data()})),updates:b.docs.map(d=>({id:d.id,...d.data()}))});
});

businessRouter.post("/admin/submissions/:id/review",requireAuth,requireRoles("SUPER_ADMIN"),async(req,res)=>{
  const input=z.object({approved:z.boolean(),liveUntilUtc:z.number().int().nullable().optional(),reason:z.string().max(500).optional()}).parse(req.body);
  await db.collection("businessSubmissions").doc(req.params.id).update({status:input.approved?APPROVED:"REJECTED",liveFromUtc:input.approved?Date.now():null,liveUntilUtc:input.liveUntilUtc??null,reviewedBy:req.member!.uid,reviewedAt:FieldValue.serverTimestamp(),rejectionReason:input.approved?null:(input.reason??"Not approved")});
  res.json({ok:true});
});

businessRouter.post("/admin/notices",requireAuth,requireRoles("SUPER_ADMIN"),async(req,res)=>{
  const input=z.object({title:z.string().min(2),body:z.string().min(2),priority:z.enum(["NORMAL","HIGH","URGENT"]).default("NORMAL")}).parse(req.body);
  const doc=await db.collection("publicNotices").add({...input,status:APPROVED,createdBy:req.member!.uid,createdAt:FieldValue.serverTimestamp()});
  res.status(201).json({id:doc.id});
});
