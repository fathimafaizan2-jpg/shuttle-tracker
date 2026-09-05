// @ts-nocheck

import { Router } from "express";
import { db, FieldValue } from "../firebaseAdmin.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

const cleanText = (value: unknown, label: string, max = 80) => {
  const text = String(value || "").trim();
  if (!text || text.length > max) {
    throw new Error(`${label} is required and must be under ${max} characters.`);
  }
  return text;
};

function sortFlights<T extends { sortOrder?: number; name?: string }>(flights: T[]) {
  return flights.sort((a, b) => {
    const orderDifference = Number(a.sortOrder ?? 999) - Number(b.sortOrder ?? 999);
    return orderDifference || String(a.name || "").localeCompare(String(b.name || ""));
  });
}

/* All approved members can read active activities and their active flights. */
router.get("/", requireAuth, async (_request, response, next) => {
  try {
    const activities = await db
      .collection("activities")
      .where("active", "==", true)
      .orderBy("name")
      .get();

    const result = await Promise.all(
      activities.docs.map(async activity => {
        /*
          Flights are sorted in JavaScript instead of Firestore. This avoids
          requiring a composite index for every new activity subcollection.
        */
        const flightSnapshot = await activity.ref
          .collection("flights")
          .where("active", "==", true)
          .get();

        const flights = sortFlights(
          flightSnapshot.docs.map(flight => ({ id: flight.id, ...flight.data() }))
        );

        return {
          id: activity.id,
          ...activity.data(),
          flights
        };
      })
    );

    response.json(result);
  } catch (error) {
    next(error);
  }
});

/* Super Admin creates future sports such as Cricket, Football, Volleyball, Table Tennis and Other. */
router.post("/", requireAuth, requireRole("SUPER_ADMIN"), async (request, response, next) => {
  try {
    const name = cleanText(request.body.name, "Activity name");
    const existing = await db
      .collection("activities")
      .where("nameLower", "==", name.toLowerCase())
      .limit(1)
      .get();

    if (!existing.empty) {
      return response.status(409).json({ message: "An activity with this name already exists." });
    }

    const created = await db.collection("activities").add({
      name,
      nameLower: name.toLowerCase(),
      active: true,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: request.member!.uid
    });

    response.status(201).json({ id: created.id, name, active: true });
  } catch (error) {
    next(error);
  }
});

router.patch("/:activityId", requireAuth, requireRole("SUPER_ADMIN"), async (request, response, next) => {
  try {
    const activityId = cleanText(request.params.activityId, "Activity ID");
    const update: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.member!.uid
    };

    if (request.body.name !== undefined) {
      const name = cleanText(request.body.name, "Activity name");
      update.name = name;
      update.nameLower = name.toLowerCase();
    }

    if (request.body.active !== undefined) update.active = Boolean(request.body.active);

    await db.collection("activities").doc(activityId).update(update);
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/* Super Admin can add Flight 5 or any future flight without a code change. */
router.post("/:activityId/flights", requireAuth, requireRole("SUPER_ADMIN"), async (request, response, next) => {
  try {
    const activityId = cleanText(request.params.activityId, "Activity ID");
    const name = cleanText(request.body.name, "Flight name");
    const sortOrder = Number(request.body.sortOrder ?? 999);

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      throw new Error("Sort order must be a whole number.");
    }

    const activity = await db.collection("activities").doc(activityId).get();
    if (!activity.exists) return response.status(404).json({ message: "Activity not found." });

    const duplicate = await activity.ref
      .collection("flights")
      .where("nameLower", "==", name.toLowerCase())
      .limit(1)
      .get();

    if (!duplicate.empty) {
      return response.status(409).json({ message: "A flight with this name already exists." });
    }

    const created = await activity.ref.collection("flights").add({
      name,
      nameLower: name.toLowerCase(),
      activityId,
      active: true,
      sortOrder,
      courtCount: 2,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: request.member!.uid
    });

    response.status(201).json({
      id: created.id,
      name,
      activityId,
      courtCount: 2
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:activityId/flights/:flightId", requireAuth, requireRole("SUPER_ADMIN"), async (request, response, next) => {
  try {
    const { activityId, flightId } = request.params;
    const flightRef = db.collection("activities").doc(activityId).collection("flights").doc(flightId);
    const flight = await flightRef.get();

    if (!flight.exists) return response.status(404).json({ message: "Flight not found." });

    const update: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.member!.uid,
      courtCount: 2
    };

    if (request.body.name !== undefined) {
      const name = cleanText(request.body.name, "Flight name");
      update.name = name;
      update.nameLower = name.toLowerCase();
    }

    if (request.body.sortOrder !== undefined) {
      const sortOrder = Number(request.body.sortOrder);
      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        throw new Error("Sort order must be a whole number.");
      }
      update.sortOrder = sortOrder;
    }

    if (request.body.active !== undefined) update.active = Boolean(request.body.active);

    await flightRef.update(update);
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
