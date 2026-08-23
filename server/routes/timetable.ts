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
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error(`${label} must use HH:MM time.`);
  return time;
};

function monthValue(input?: unknown) {
  const text = String(input || "").trim();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(text)) throw new Error("Month must use YYYY-MM format.");
  return text;
}

function timestampToIso(value: unknown) {
  if (value && typeof (value as Timestamp).toDate === "function") return (value as Timestamp).toDate().toISOString();
  return value ? new Date(value as string).toISOString() : null;
}

function timestampValue(value: unknown) {
  if (value && typeof (value as Timestamp).toDate === "function") return (value as Timestamp).toDate().getTime();
  const result = value ? new Date(value as string).getTime() : 0;
  return Number.isFinite(result) ? result : 0;
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

/* Player and Flight Admin see only their assigned flight sessions. */
router.get("/mine", requireAuth, async (request, response) => {
  try {
    const member = request.member!;
    if (!member.flightId && member.role !== "SUPER_ADMIN") return response.json([]);

    const snapshot = member.role === "SUPER_ADMIN"
      ? await db.collection("sessions").get()
      : await db.collection("sessions").where("flightId", "==", member.flightId).get();

    const attendanceRows = member.role === "SUPER_ADMIN"
      ? []
      : await Promise.all(snapshot.docs.map(doc => db.collection("attendance").doc(`${doc.id}_${member.uid}`).get()));
    const attendanceBySession = new Map(
      attendanceRows.filter(row => row.exists).map(row => [String(row.data()!.sessionId), row.data()!.status])
    );

    response.json(snapshot.docs
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

/* Super Admin reads master weekly pattern and dynamic flights. */
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
        .map(doc => ({ id: doc.id, ...doc.data(), courtCount: 2 }))
        .sort((a, b) => Number(a.weekdayIndex) - Number(b.weekdayIndex) || String(a.startTime).localeCompare(String(b.startTime)))
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load master timetable." });
  }
});

/* Exactly two courts are stored by the server. Client courtCount is never trusted. */
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
      return row.flightId === flightId && row.weekdayIndex === weekdayIndex && row.startTime === startTime;
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
  const slotId = asText(request.params.slotId, "Slot ID");
  await db.collection("weeklyTimetable").doc(slotId).delete();
  response.json({ success: true });
});

/* Materialize one month from its repeating weekly pattern. Existing generated sessions are not overwritten. */
router.post("/master/publish-month", requireAuth, requireRole("SUPER_ADMIN"), async (request, response) => {
  try {
    const month = monthValue(request.body.month);
    const activityId = asText(request.body.activityId, "Activity");
    const [year, monthNumber] = month.split("-").map(Number);
    const patterns = await db.collection("weeklyTimetable").where("activityId", "==", activityId).get();
    if (patterns.empty) return response.status(400).json({ message: "Create at least one weekly timetable slot first." });

    const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const batch = db.batch();
    let written = 0;

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(Date.UTC(year, monthNumber - 1, day));
      const weekdayIndex = date.getUTCDay();
      for (const patternDoc of patterns.docs) {
        const pattern = patternDoc.data();
        if (pattern.weekdayIndex !== weekdayIndex) continue;
        const [startHour, startMinute] = String(pattern.startTime).split(":").map(Number);
        const [endHour, endMinute] = String(pattern.endTime).split(":").map(Number);
        const startAt = new Date(Date.UTC(year, monthNumber - 1, day, startHour, startMinute));
        const endAt = new Date(Date.UTC(year, monthNumber - 1, day, endHour, endMinute));
        const key = `${month}_${String(day).padStart(2, "0")}_${patternDoc.id}`;
        const ref = db.collection("sessions").doc(key);
        batch.set(ref, {
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
        }, { merge: true });
        written += 1;
      }
    }

    if (written > 500) throw new Error("Too many slots for one publish operation. Publish activities separately.");
    await batch.commit();
    response.json({ success: true, sessionsPrepared: written, month });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not publish month." });
  }
});

export default router;
