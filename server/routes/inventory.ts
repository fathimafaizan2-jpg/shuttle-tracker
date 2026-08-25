import { Router } from "express";
import { db, FieldValue } from "../firebaseAdmin.js";
import { requireAuth, requireFlightAccess, requireRole } from "../auth.js";

const router = Router();

function wholeNumber(value: unknown, label: string, minimum = 0) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum) {
    throw new Error(`${label} must be a whole number of ${minimum} or greater.`);
  }
  return number;
}

function text(value: unknown, label: string) {
  const result = String(value || "").trim();
  if (!result) throw new Error(`${label} is required.`);
  return result;
}

async function findFlight(flightId: string) {
  const activities = await db.collection("activities").get();
  for (const activity of activities.docs) {
    const flight = await activity.ref.collection("flights").doc(flightId).get();
    if (flight.exists) return { activityId: activity.id, activity: activity.data(), id: flight.id, ...flight.data() };
  }
  throw new Error("Flight not found.");
}

function assertInventoryAccess(flightId: string, member: Express.Request["member"]) {
  if (!requireFlightAccess(flightId, member!)) {
    throw new Error("You may manage inventory only for your assigned flight.");
  }
}

/* Flight Admin sees only own stock. Super Admin may filter by flight or view all. */
router.get("/mine", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    if (request.member!.role === "LEVEL_ADMIN") {
      if (!request.member!.flightId) return response.json([]);
      const record = await db.collection("inventory").doc(request.member!.flightId).get();
      return response.json(record.exists ? [{ id: record.id, ...record.data() }] : []);
    }

    const records = await db.collection("inventory").get();
    response.json(records.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => String(a.flightName || "").localeCompare(String(b.flightName || ""))));
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load stock." });
  }
});

router.get("/:flightId", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const flightId = text(request.params.flightId, "Flight ID");
    assertInventoryAccess(flightId, request.member);
    const record = await db.collection("inventory").doc(flightId).get();
    response.json(record.exists ? { id: record.id, ...record.data() } : null);
  } catch (error) {
    response.status(403).json({ message: error instanceof Error ? error.message : "Could not load stock." });
  }
});

/* Price is always stored as integer fils. Example: BHD 3.250 is saved as 3250. */
router.put("/:flightId/config", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const flightId = text(request.params.flightId, "Flight ID");
    assertInventoryAccess(flightId, request.member);
    const flight = await findFlight(flightId);

    const tubePriceFils = wholeNumber(request.body.tubePriceFils, "Tube price in fils", 1);
    const shuttlesPerTube = wholeNumber(request.body.shuttlesPerTube, "Shuttles per tube", 1);
    const availableTubes = wholeNumber(request.body.availableTubes, "Available tubes");
    const existing = await db.collection("inventory").doc(flightId).get();
    const looseShuttles = request.body.looseShuttles === undefined || request.body.looseShuttles === null || request.body.looseShuttles === ""
      ? (existing.exists ? wholeNumber(existing.data()!.looseShuttles || 0, "Existing loose shuttles") : 0)
      : wholeNumber(request.body.looseShuttles, "Loose shuttles");
    const totalAvailableShuttles = availableTubes * shuttlesPerTube + looseShuttles;
    const lowStockThresholdShuttles = shuttlesPerTube;
    const lowStock = totalAvailableShuttles <= lowStockThresholdShuttles;

    await db.collection("inventory").doc(flightId).set({
      flightId,
      flightName: flight.name,
      activityId: flight.activityId,
      activityName: flight.activity.name,
      tubePriceFils,
      shuttlesPerTube,
      availableTubes,
      looseShuttles,
      totalAvailableShuttles,
      lowStockThresholdShuttles,
      lowStock,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.member!.uid
    }, { merge: true });

    await db.collection("inventoryAudit").add({
      flightId,
      action: "CONFIGURATION_UPDATED",
      tubePriceFils,
      shuttlesPerTube,
      availableTubes,
      looseShuttles,
      totalAvailableShuttles,
      lowStockThresholdShuttles,
      lowStock,
      actionBy: request.member!.uid,
      actionRole: request.member!.role,
      createdAt: FieldValue.serverTimestamp()
    });

    response.json({
      success: true,
      totalAvailableShuttles,
      lowStockThresholdShuttles,
      lowStock
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not save inventory configuration." });
  }
});

export default router;
