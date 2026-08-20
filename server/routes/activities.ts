import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles } from "../auth.js";

export const activitiesRouter = Router();

// Validation Schemas for Multi-Sport Management
const activitySchema = z.object({
  activityId: z.string().trim().min(2).max(40).regex(/^[a-z0-9_]+$/), // e.g., "badminton", "cricket", "tennis"
  displayName: z.string().trim().min(2).max(60), // e.g., "Badminton Section", "Cricket Section"
  icon: z.string().trim().default("🎾"),
  inventoryUnitName: z.string().trim().default("Tube"), // e.g., "Tube" for Badminton, "Ball Box" for Cricket/Tennis
  unitCapacity: z.number().int().positive().default(12), // 12 shuttles per tube, 6 balls per box, etc.
  courtOrGroundLabel: z.string().trim().default("Court"), // "Court" or "Ground" or "Table"
  active: z.boolean().default(true)
});

const sectionAdminAssignment = z.object({
  activityId: z.string().trim().min(2),
  adminUid: z.string().trim().min(1),
  role: z.enum(["SECTION_HEAD", "LEVEL_ADMIN"])
});

// -----------------------------------------------------------------------------
// PUBLIC & MEMBER ACTIVITY ENDPOINTS
// -----------------------------------------------------------------------------

// List all active Indian Club sports sections (Public)
activitiesRouter.get("/public/list", async (_req, res) => {
  const snapshot = await db.collection("activities")
    .where("active", "==", true)
    .get();

  const activities = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  res.json(activities);
});

// Fetch configuration parameters for a specific sport
activitiesRouter.get("/:activityId/config", async (req, res) => {
  const doc = await db.collection("activities").doc(req.params.activityId).get();
  if (!doc.exists) {
    return res.status(404).json({ error: "Sports section not found" });
  }
  res.json({ id: doc.id, ...doc.data() });
});

// -----------------------------------------------------------------------------
// SUPER ADMIN MULTI-SPORT GOVERNANCE
// -----------------------------------------------------------------------------

// Create or register a new sports section (e.g., Adding "Cricket" or "Tennis")
activitiesRouter.post("/admin/create", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = activitySchema.parse(req.body);
  const docRef = db.collection("activities").doc(input.activityId);
  const existing = await docRef.get();

  if (existing.exists) {
    return res.status(409).json({ error: "Sports section activityId already exists" });
  }

  await docRef.set({
    ...input,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: req.member!.uid
  });

  await db.collection("auditLogs").add({
    actorUid: req.member!.uid,
    action: "SPORT_SECTION_CREATED",
    targetId: input.activityId,
    createdAt: FieldValue.serverTimestamp()
  });

  res.status(201).json({ activityId: input.activityId, ok: true });
});

// Assign an Admin to a specific sports section
activitiesRouter.post("/admin/assign-section-admin", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = sectionAdminAssignment.parse(req.body);

  await db.collection("members").doc(input.adminUid).update({
    activityId: input.activityId,
    role: input.role,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: req.member!.uid
  });

  await db.collection("auditLogs").add({
    actorUid: req.member!.uid,
    action: "SECTION_ADMIN_ASSIGNED",
    targetId: input.adminUid,
    activityId: input.activityId,
    createdAt: FieldValue.serverTimestamp()
  });

  res.json({ ok: true });
});

// Toggle sport section active status
activitiesRouter.patch("/admin/:activityId/toggle-status", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = z.object({ active: z.boolean() }).parse(req.body);
  
  await db.collection("activities").doc(req.params.activityId).update({
    active: input.active,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: req.member!.uid
  });

  await db.collection("auditLogs").add({
    actorUid: req.member!.uid,
    action: `SPORT_SECTION_${input.active ? "ACTIVATED" : "DEACTIVATED"}`,
    targetId: req.params.activityId,
    createdAt: FieldValue.serverTimestamp()
  });

  res.json({ ok: true });
});
