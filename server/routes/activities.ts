import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles } from "../auth.js";

export const activitiesRouter = Router();

const createActivitySchema = z.object({
  name: z.string().trim().min(2).max(60),
  kind: z.enum(["BADMINTON", "CRICKET", "FOOTBALL", "VOLLEYBALL", "TABLE_TENNIS", "OTHER"]),
  active: z.boolean().default(true)
});

const createFlightSchema = z.object({
  activityId: z.string().min(1),
  name: z.string().trim().min(2).max(40),
  active: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0)
});

// Super Admin creates Badminton and future sports only here.
activitiesRouter.post("/", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = createActivitySchema.parse(req.body);
  const ref = await db.collection("activities").add({
    clubId: req.member!.clubId,
    ...input,
    createdBy: req.member!.uid,
    createdAt: FieldValue.serverTimestamp()
  });
  res.status(201).json({ id: ref.id });
});

activitiesRouter.get("/", requireAuth, async (req, res) => {
  const rows = await db.collection("activities")
    .where("clubId", "==", req.member!.clubId)
    .where("active", "==", true)
    .get();
  res.json(rows.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

// Dynamic flight creation: Flight 5 is created here, not hard-coded.
activitiesRouter.post("/flights", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = createFlightSchema.parse(req.body);
  const activity = await db.collection("activities").doc(input.activityId).get();
  if (!activity.exists || activity.data()!.clubId !== req.member!.clubId) {
    return res.status(404).json({ error: "Activity not found" });
  }

  const duplicate = await db.collection("flights")
    .where("activityId", "==", input.activityId)
    .where("name", "==", input.name)
    .limit(1)
    .get();
  if (!duplicate.empty) return res.status(409).json({ error: "Flight already exists" });

  const ref = await db.collection("flights").add({
    clubId: req.member!.clubId,
    ...input,
    createdBy: req.member!.uid,
    createdAt: FieldValue.serverTimestamp()
  });

  await db.collection("auditLogs").add({
    actorUid: req.member!.uid,
    action: "FLIGHT_CREATED",
    targetId: ref.id,
    createdAt: FieldValue.serverTimestamp()
  });

  res.status(201).json({ id: ref.id });
});

activitiesRouter.get("/:activityId/flights", requireAuth, async (req, res) => {
  const rows = await db.collection("flights")
    .where("activityId", "==", req.params.activityId)
    .where("active", "==", true)
    .orderBy("displayOrder", "asc")
    .get();
  res.json(rows.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

activitiesRouter.patch("/flights/:flightId", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = z.object({
    name: z.string().trim().min(2).max(40).optional(),
    active: z.boolean().optional(),
    displayOrder: z.number().int().min(0).optional()
  }).parse(req.body);

  await db.collection("flights").doc(req.params.flightId).update({
    ...input,
    updatedBy: req.member!.uid,
    updatedAt: FieldValue.serverTimestamp()
  });

  await db.collection("auditLogs").add({
    actorUid: req.member!.uid,
    action: "FLIGHT_UPDATED",
    targetId: req.params.flightId,
    createdAt: FieldValue.serverTimestamp()
  });

  res.json({ ok: true });
});
