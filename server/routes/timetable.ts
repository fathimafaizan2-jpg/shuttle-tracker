import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles, requireSameFlight } from "../auth.js";

export const timetableRouter = Router();
const cell = z.object({ activityId: z.string(), flightId: z.string(), day: z.string(), startAtUtc: z.number().int(), endAtUtc: z.number().int(), courtCount: z.number().int().min(1), rotationalTimeText: z.string().min(3).max(80) });

timetableRouter.post("/flights", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = z.object({ name: z.string().min(2).max(40), activityId: z.string(), active: z.boolean().default(true) }).parse(req.body);
  const ref = await db.collection("flights").add({ ...input, clubId: req.member!.clubId, createdAt: FieldValue.serverTimestamp(), createdBy: req.member!.uid });
  res.status(201).json({ id: ref.id });
});

timetableRouter.post("/cells", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = cell.parse(req.body);
  const ref = await db.collection("timetableCells").add({ ...input, clubId: req.member!.clubId, updatedAt: FieldValue.serverTimestamp(), updatedBy: req.member!.uid });
  await db.collection("auditLogs").add({ actorUid: req.member!.uid, action: "TIMETABLE_CELL_CREATED", targetId: ref.id, createdAt: FieldValue.serverTimestamp() });
  res.status(201).json({ id: ref.id });
});

timetableRouter.get("/mine", requireAuth, async (req, res) => {
  if (req.member!.role === "SUPER_ADMIN") {
    const rows = await db.collection("timetableCells").where("clubId", "==", req.member!.clubId).get();
    return res.json(rows.docs.map(d => ({ id: d.id, ...d.data() })));
  }
  if (!req.member!.flightId) return res.json([]);
  const rows = await db.collection("timetableCells").where("flightId", "==", req.member!.flightId).get();
  res.json(rows.docs.map(d => ({ id: d.id, ...d.data() })));
});

timetableRouter.post("/sessions", requireAuth, requireRoles("LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const input = cell.extend({ tubePriceFils: z.number().int().min(0), tubesUsed: z.number().int().min(0) }).parse(req.body);
  requireSameFlight(input.flightId, req);
  const ref = await db.collection("sessions").add({ ...input, clubId: req.member!.clubId, status: "OPEN", createdBy: req.member!.uid, createdAt: FieldValue.serverTimestamp() });
  res.status(201).json({ id: ref.id });
});
