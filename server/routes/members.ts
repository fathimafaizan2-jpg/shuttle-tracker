import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminAuth, db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles } from "../auth.js";

export const membersRouter = Router();

const createMember = z.object({
  fullName: z.string().min(2).max(100),
  memberId: z.string().min(3).max(40),
  phone: z.string().min(6).max(30),
  email: z.string().email(),
  temporaryPassword: z.string().min(10),
  role: z.enum(["PLAYER", "LEVEL_ADMIN"]),
  flightId: z.string().min(1)
});

membersRouter.post("/", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = createMember.parse(req.body);
  const duplicate = await db.collection("members").where("memberId", "==", input.memberId).limit(1).get();
  if (!duplicate.empty) return res.status(409).json({ error: "Member ID already exists" });

  const authUser = await adminAuth.createUser({
    email: input.email,
    password: input.temporaryPassword,
    displayName: input.fullName,
    disabled: false
  });

  await db.collection("members").doc(authUser.uid).set({
    clubId: req.member!.clubId,
    fullName: input.fullName,
    memberId: input.memberId,
    phone: input.phone,
    role: input.role,
    flightId: input.flightId,
    active: true,
    mustChangePassword: true,
    createdBy: req.member!.uid,
    createdAt: FieldValue.serverTimestamp()
  });

  await db.collection("auditLogs").add({ actorUid: req.member!.uid, action: "MEMBER_CREATED", targetId: authUser.uid, createdAt: FieldValue.serverTimestamp() });
  res.status(201).json({ uid: authUser.uid });
});

membersRouter.patch("/:uid/flight", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = z.object({ flightId: z.string().min(1), role: z.enum(["PLAYER", "LEVEL_ADMIN"]).optional() }).parse(req.body);
  await db.collection("members").doc(req.params.uid).update({ ...input, movedAt: FieldValue.serverTimestamp(), movedBy: req.member!.uid });
  await db.collection("auditLogs").add({ actorUid: req.member!.uid, action: "MEMBER_FLIGHT_CHANGED", targetId: req.params.uid, createdAt: FieldValue.serverTimestamp() });
  res.json({ ok: true });
});
