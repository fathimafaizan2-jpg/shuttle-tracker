import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles, requireSameFlight } from "../auth.js";
import { isSessionLocked } from "../clubLogic.js";

export const attendanceRouter = Router();
const choice = z.enum(["COMING", "NOT_COMING"]);

attendanceRouter.put("/:sessionId/me", requireAuth, requireRoles("PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const status = choice.parse(req.body.status);
  const sessionRef = db.collection("sessions").doc(req.params.sessionId);
  const session = (await sessionRef.get()).data();
  if (!session) return res.status(404).json({ error: "Session not found" });
  requireSameFlight(session.flightId, req);
  if (isSessionLocked(session.startAtUtc)) return res.status(409).json({ error: "Session locked" });

  await db.collection("attendance").doc(`${req.params.sessionId}_${req.member!.uid}`).set({
    sessionId: req.params.sessionId,
    playerUid: req.member!.uid,
    flightId: session.flightId,
    status,
    changedAt: FieldValue.serverTimestamp(),
    changedBy: req.member!.uid
  }, { merge: true });
  res.json({ status });
});

attendanceRouter.put("/:sessionId/:playerUid/correct", requireAuth, requireRoles("LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const input = z.object({ status: z.enum(["PRESENT", "ABSENT"]), reason: z.string().min(3).max(500) }).parse(req.body);
  const session = (await db.collection("sessions").doc(req.params.sessionId).get()).data();
  if (!session) return res.status(404).json({ error: "Session not found" });
  requireSameFlight(session.flightId, req);
  if (!isSessionLocked(session.startAtUtc)) return res.status(409).json({ error: "Session is still open" });

  const ref = db.collection("attendance").doc(`${req.params.sessionId}_${req.params.playerUid}`);
  await ref.set({ sessionId: req.params.sessionId, playerUid: req.params.playerUid, flightId: session.flightId, status: input.status, correctedAt: FieldValue.serverTimestamp(), correctedBy: req.member!.uid }, { merge: true });
  await db.collection("auditLogs").add({ actorUid: req.member!.uid, action: "LOCKED_ATTENDANCE_CORRECTION", targetId: ref.id, reason: input.reason, createdAt: FieldValue.serverTimestamp() });
  res.json({ ok: true });
});
