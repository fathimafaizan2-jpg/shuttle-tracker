import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../firebaseAdmin.js";
import { FIXED_COURT_COUNT, repeatingWeeklyDatesForMonth } from "../clubLogic.js";
import { requireAuth, requireRoles, requireSameFlight } from "../auth.js";

export const timetableRouter = Router();

const weeklySlotSchema = z.object({
  activityId: z.string().min(1),
  flightId: z.string().min(1),
  weekdayZeroSunday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  monthlyYear: z.number().int().min(2025),
  monthlyMonthIndex: z.number().int().min(0).max(11)
});

// Super Admin saves a weekly slot. The same weekday slot repeats for the whole month.
// Court count is never accepted from the browser: it is always FIXED_COURT_COUNT = 2.
timetableRouter.post("/weekly-slots", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = weeklySlotSchema.parse(req.body);
  const ref = await db.collection("weeklyTimetableSlots").add({
    clubId: req.member!.clubId,
    ...input,
    courtCount: FIXED_COURT_COUNT,
    active: true,
    createdBy: req.member!.uid,
    createdAt: FieldValue.serverTimestamp()
  });
  res.status(201).json({ id: ref.id, courtCount: FIXED_COURT_COUNT });
});

// Generates/replaces monthly session records from the repeating weekly timetable.
timetableRouter.post("/generate-month", requireAuth, requireRoles("SUPER_ADMIN"), async (req, res) => {
  const input = z.object({ year: z.number().int(), monthIndex: z.number().int().min(0).max(11) }).parse(req.body);
  const slots = await db.collection("weeklyTimetableSlots")
    .where("clubId", "==", req.member!.clubId)
    .where("active", "==", true)
    .get();

  const batch = db.batch();
  let created = 0;

  for (const slotDoc of slots.docs) {
    const slot = slotDoc.data();
    const dates = repeatingWeeklyDatesForMonth(input.year, input.monthIndex, slot.weekdayZeroSunday);

    for (const dateUtc of dates) {
      const date = new Date(dateUtc);
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);
      const startAtUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), startHour, startMinute);
      const endAtUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), endHour, endMinute);
      const id = `${slotDoc.id}_${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;

      batch.set(db.collection("sessions").doc(id), {
        clubId: req.member!.clubId,
        activityId: slot.activityId,
        flightId: slot.flightId,
        weeklySlotId: slotDoc.id,
        startAtUtc,
        endAtUtc,
        courtCount: FIXED_COURT_COUNT,
        status: "OPEN",
        generatedBy: req.member!.uid,
        generatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
      created++;
    }
  }

  await batch.commit();
  res.json({ created, courtCount: FIXED_COURT_COUNT });
});

// Player and Level Admin receive only their assigned flight sessions.
timetableRouter.get("/mine", requireAuth, async (req, res) => {
  if (req.member!.role === "SUPER_ADMIN") {
    const all = await db.collection("sessions").where("clubId", "==", req.member!.clubId).get();
    return res.json(all.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

  if (!req.member!.flightId) return res.json([]);
  const rows = await db.collection("sessions")
    .where("flightId", "==", req.member!.flightId)
    .get();
  res.json(rows.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

// Flight Admin may edit only one existing session in their own flight.
timetableRouter.patch("/sessions/:sessionId", requireAuth, requireRoles("LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const input = z.object({
    tubePriceFils: z.number().int().min(0).optional(),
    shuttlesPerTube: z.number().int().positive().optional(),
    availableTubeCount: z.number().int().min(0).optional(),
    looseShuttlesBeforeGame: z.number().int().min(0).optional()
  }).parse(req.body);

  const sessionRef = db.collection("sessions").doc(req.params.sessionId);
  const session = (await sessionRef.get()).data();
  if (!session) return res.status(404).json({ error: "Session not found" });
  requireSameFlight(session.flightId, req);

  await sessionRef.update({ ...input, updatedBy: req.member!.uid, updatedAt: FieldValue.serverTimestamp() });
  res.json({ ok: true });
});
