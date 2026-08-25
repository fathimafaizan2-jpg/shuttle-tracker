import { Router } from "express";
import { db, FieldValue, Timestamp } from "../firebaseAdmin.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
type Weekday = typeof weekdays[number];

const asText = (value: unknown, label: string) => {
  const text = String(value || "").trim();
  if (!text) throw new Error(`${label} is required.`);
  return text;
};

const asTime = (value: unknown, label: string) => {
  const time = asText(value, label);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error(`${label} must use HH:MM time.`);
  }
  return time;
};

function monthValue(input?: unknown) {
  const text = String(input || "").trim();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(text)) {
    throw new Error("Month must use YYYY-MM format.");
  }
  return text;
}

function timestampToDate(value: unknown): Date | null {
  if (value && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate();
  }
  const date = value ? new Date(value as string) : null;
  return date && Number.isFinite(date.getTime()) ? date : null;
}

function timestampToIso(value: unknown) {
  return timestampToDate(value)?.toISOString() || null;
}

function timestampValue(value: unknown) {
  return timestampToDate(value)?.getTime() || 0;
}

function dateMonth(value: unknown) {
  const date = timestampToDate(value);
  if (!date) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dateTime(value: Date) {
  return `${String(value.getUTCHours()).padStart(2, "0")}:${String(value.getUTCMinutes()).padStart(2, "0")}`;
}

function storedWeekdayIndex(slot: FirebaseFirestore.DocumentData) {
  const number = Number(slot.weekdayIndex);
  if (Number.isInteger(number) && number >= 0 && number <= 6) return number;
  return weekdays.indexOf(String(slot.weekday) as Weekday);
}

/*
  A dated session remains visible only when it still belongs to its exact current
  Master Timetable slot. This prevents old published dates from surviving after
  a Super Admin changes or deletes a weekly day/time slot.
*/
function matchesCurrentWeeklySlot(
  session: FirebaseFirestore.DocumentData,
  slotsById: Map<string, FirebaseFirestore.DocumentData>
) {
  const slotId = String(session.weeklySlotId || "");
  const slot = slotsById.get(slotId);
  if (!slot) return false;

  const startAt = timestampToDate(session.startAt);
  const weekdayIndex = storedWeekdayIndex(slot);
  if (!startAt || weekdayIndex < 0) return false;

  return (
    String(session.activityId || "") === String(slot.activityId || "") &&
    String(session.flightId || "") === String(slot.flightId || "") &&
    startAt.getUTCDay() === weekdayIndex &&
    dateTime(startAt) === String(slot.startTime || "")
  );
}

async function getActivityFlights() {
  const activities = await db.collection("activities").where("active", "==", true).get();
  return Promise.all(activities.docs.map(async activity => {
    const flights = await activity.ref.collection("flights").where("active", "==", true).get();
    return {
      id: activity.id,
      name: activity.data().name,
      flights: flights.docs
        .map(f => ({ id: f.id, ...f.data() }))
        .sort((a, b) => Number(a.sortOrder ?? 999) - Number(b.sortOrder ?? 999) || String(a.name).localeCompare(String(b.name)))
    };
  })).then(rows => rows.sort((a, b) => String(a.name).localeCompare(String(b.name))));
}

router.get("/mine", requireAuth, async (request, response) => {
  try {
    const member = request.member!;
    if (!member.flightId && member.role !== "SUPER_ADMIN") return response.json([]);

    const [snapshot, slots] = await Promise.all([
      member.role === "SUPER_ADMIN"
        ? db.collection("sessions").get()
        : db.collection("sessions").where("flightId", "==", member.flightId).get(),
      db.collection("weeklyTimetable").get()
    ]);

    const slotsById = new Map(slots.docs.map(doc => [doc.id, doc.data()]));
    const visibleSessionDocs = snapshot.docs.filter(doc => matchesCurrentWeeklySlot(doc.data(), slotsById));
    const attendanceRows = member.role === "SUPER_ADMIN"
      ? []
      : await Promise.all(visibleSessionDocs.map(doc => db.collection("attendance").doc(`${doc.id}_${member.uid}`).get()));
    const attendanceBySession = new Map(
      attendanceRows.filter(row => row.exists).map(row => [String(row.data()!.sessionId), row.data()!.status])
    );

    response.json(visibleSessionDocs
      .map(doc => {
        const session = doc.data();
        return {
          id: doc.id,
          ...session,
          startAt: timestampToIso(session.startAt),
          endAt: timestampToIso(session.endAt),
          myAttendance: attendanceBySession.get(doc.id) || "NO_RESPONSE",
          courtCount: 2
        };
      })
      .sort((a, b) => timestampValue(a.startAt) - timestampValue(b.startAt))
    );
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load your timetable." });
  }
});

/* Same weekly club timetable for every signed-in Player, Flight Admin and Super Admin. */
router.get("/club", requireAuth, async (_request, response) => {
  try {
    const snapshot = await db.collection("weeklyTimetable").get();

    response.json(snapshot.docs
      .map(doc => {
        const slot = doc.data();
        return {
          id: doc.id,
          activityId: slot.activityId,
          activityName: slot.activityName,
          flightId: slot.flightId,
          flightName: slot.flightName,
          weekday: slot.weekday,
          weekdayIndex: storedWeekdayIndex(slot),
          startTime: String(slot.startTime),
          endTime: String(slot.endTime),
          courtCount: 2
        };
      })
      .sort((a, b) => a.weekdayIndex - b.weekdayIndex || a.startTime.localeCompare(b.startTime) || a.flightName.localeCompare(b.flightName))
    );
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load the club timetable." });
  }
});

router.get("/master", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const month = request.query.month ? monthValue(request.query.month) : new Date().toISOString().slice(0, 7);
    const activities = await getActivityFlights();
    const activityId = String(request.query.activityId || activities[0]?.id || "");
    const slots = await db.collection("weeklyTimetable").where("activityId", "==", activityId).get();

    response.json({
      month,
      activityId,
      activities,
      flights: activities.find(a => a.id === activityId)?.flights || [],
      weeklyPattern: slots.docs
        .map(doc => ({ id: doc.id, ...doc.data(), weekdayIndex: storedWeekdayIndex(doc.data()), courtCount: 2 }))
        .sort((a, b) => Number(a.weekdayIndex) - Number(b.weekdayIndex) || String(a.startTime).localeCompare(String(b.startTime)))
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load master timetable." });
  }
});

router.post("/master/slot", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const weekday = asText(request.body.weekday, "Day") as Weekday;
    if (!weekdays.includes(weekday)) throw new Error("Invalid weekday.");

    const flightId = asText(request.body.flightId, "Flight");
    const startTime = asTime(request.body.startTime, "Start time");
    const endTime = asTime(request.body.endTime, "End time");
    if (endTime <= startTime) throw new Error("End time must be later than start time.");

    const allActivities = await getActivityFlights();
    const owner = allActivities.find(activity => activity.flights.some(flight => flight.id === flightId));
    const flight = owner?.flights.find(item => item.id === flightId);
    if (!owner || !flight) throw new Error("Selected flight does not exist or is inactive.");

    const weekdayIndex = weekdays.indexOf(weekday);
    const existingSlots = await db.collection("weeklyTimetable").where("activityId", "==", owner.id).get();
    const conflict = existingSlots.docs.some(doc => {
      const row = doc.data();
      return row.flightId === flightId && storedWeekdayIndex(row) === weekdayIndex && row.startTime === startTime;
    });
    if (conflict) return response.status(409).json({ message: "This weekly flight slot already exists." });

    const created = await db.collection("weeklyTimetable").add({
      activityId: owner.id,
      activityName: owner.name,
      flightId,
      flightName: flight.name,
      weekday,
      weekdayIndex,
      startTime,
      endTime,
      courtCount: 2,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: request.member!.uid
    });

    response.status(201).json({ id: created.id, courtCount: 2 });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not save weekly slot." });
  }
});

router.delete("/master/slot/:slotId", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const slotId = asText(request.params.slotId, "Slot ID");
    const slotRef = db.collection("weeklyTimetable").doc(slotId);
    const [slot, sessionRows] = await Promise.all([
      slotRef.get(),
      db.collection("sessions").where("weeklySlotId", "==", slotId).get()
    ]);

    if (!slot.exists) throw new Error("Weekly timetable slot not found.");
    const staleScheduled = sessionRows.docs.filter(doc => doc.data().status !== "COMPLETED");
    if (staleScheduled.length + 1 > 500) {
      throw new Error("Too many scheduled sessions are attached to this slot. Remove older months separately.");
    }

    const batch = db.batch();
    batch.delete(slotRef);
    staleScheduled.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    response.json({ success: true, removedScheduledSessions: staleScheduled.length });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not remove weekly slot." });
  }
});

/* Publishing creates exactly the calendar dates whose weekday and time match current Master Timetable slots. */
router.post("/master/publish-month", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const month = monthValue(request.body.month);
    const activityId = asText(request.body.activityId, "Activity");
    const [year, monthNumber] = month.split("-").map(Number);
    const [patterns, existingSessions] = await Promise.all([
      db.collection("weeklyTimetable").where("activityId", "==", activityId).get(),
      db.collection("sessions").where("activityId", "==", activityId).get()
    ]);
    if (patterns.empty) return response.status(400).json({ message: "Create at least one weekly timetable slot first." });

    const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const planned = new Map<string, FirebaseFirestore.DocumentData>();

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(Date.UTC(year, monthNumber - 1, day));
      const weekdayIndex = date.getUTCDay();

      for (const patternDoc of patterns.docs) {
        const pattern = patternDoc.data();
        if (storedWeekdayIndex(pattern) !== weekdayIndex) continue;

        const [startHour, startMinute] = String(pattern.startTime).split(":").map(Number);
        const [endHour, endMinute] = String(pattern.endTime).split(":").map(Number);
        const startAt = new Date(Date.UTC(year, monthNumber - 1, day, startHour, startMinute));
        const endAt = new Date(Date.UTC(year, monthNumber - 1, day, endHour, endMinute));
        const key = `${month}_${String(day).padStart(2, "0")}_${patternDoc.id}`;

        planned.set(key, {
          activityId: pattern.activityId,
          activityName: pattern.activityName,
          flightId: pattern.flightId,
          flightName: pattern.flightName,
          weeklySlotId: patternDoc.id,
          month,
          startAt: Timestamp.fromDate(startAt),
          endAt: Timestamp.fromDate(endAt),
          courtCount: 2,
          status: "SCHEDULED",
          createdAt: FieldValue.serverTimestamp(),
          createdBy: request.member!.uid
        });
      }
    }

    const currentMonthSessions = existingSessions.docs.filter(doc => {
      const session = doc.data();
      return String(session.month || dateMonth(session.startAt)) === month;
    });
    const existingById = new Map(currentMonthSessions.map(doc => [doc.id, doc]));
    const staleScheduled = currentMonthSessions.filter(doc => !planned.has(doc.id) && doc.data().status !== "COMPLETED");
    const writesRequired = planned.size + staleScheduled.length;
    if (writesRequired > 500) {
      throw new Error("Too many session updates for one publish operation. Publish activities separately.");
    }

    const batch = db.batch();
    let preparedSessions = 0;
    let preservedCompletedSessions = 0;

    for (const [key, data] of planned) {
      const existing = existingById.get(key);
      if (existing?.data().status === "COMPLETED") {
        preservedCompletedSessions += 1;
        continue;
      }
      batch.set(db.collection("sessions").doc(key), data, { merge: true });
      preparedSessions += 1;
    }

    staleScheduled.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    response.json({
      success: true,
      month,
      sessionsPrepared: preparedSessions,
      staleScheduledSessionsRemoved: staleScheduled.length,
      completedSessionsPreserved: preservedCompletedSessions
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not publish month." });
  }
});

export default router;
