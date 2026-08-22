import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminAuth, db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles } from "../auth.js";

export const membersRouter = Router();

membersRouter.post("/", requireAuth, requireRoles("SUPER_ADMIN"), async (req,res) => {
  const input=z.object({fullName:z.string().min(2),memberId:z.string().min(3),phone:z.string().min(6),email:z.string().email(),temporaryPassword:z.string().min(10),role:z.enum(["PLAYER","LEVEL_ADMIN"]),flightId:z.string().min(1)}).parse(req.body);
  const exists=await db.collection("members").where("memberId","==",input.memberId).limit(1).get();
  if(!exists.empty) return res.status(409).json({error:"Member ID exists"});
  const user=await adminAuth.createUser({email:input.email,password:input.temporaryPassword,displayName:input.fullName});
  await db.collection("members").doc(user.uid).set({clubId:req.member!.clubId,...input,active:true,mustChangePassword:true,createdBy:req.member!.uid,createdAt:FieldValue.serverTimestamp()});
  await db.collection("auditLogs").add({actorUid:req.member!.uid,action:"MEMBER_CREATED",targetId:user.uid,createdAt:FieldValue.serverTimestamp()});
  res.status(201).json({uid:user.uid});
});

membersRouter.patch("/:uid", requireAuth, requireRoles("SUPER_ADMIN"), async (req,res) => {
  const patch=z.object({flightId:z.string().optional(),role:z.enum(["PLAYER","LEVEL_ADMIN"]).optional(),active:z.boolean().optional(),phone:z.string().min(6).optional()}).parse(req.body);
  await db.collection("members").doc(req.params.uid).update({...patch,updatedBy:req.member!.uid,updatedAt:FieldValue.serverTimestamp()});
  res.json({ok:true});
});
