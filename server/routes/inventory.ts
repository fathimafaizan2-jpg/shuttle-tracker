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

    const records = await db.collection("inventory").orderBy("updatedAt", "desc").get();
    response.json(records.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    const looseShuttles = wholeNumber(request.body.looseShuttles, "Loose shuttles");

    await db.collection("inventory").doc(flightId).set({
      flightId,
      flightName: flight.name,
      activityId: flight.activityId,
      activityName: flight.activity.name,
      tubePriceFils,
      shuttlesPerTube,
      availableTubes,
      looseShuttles,
      totalAvailableShuttles: availableTubes * shuttlesPerTube + looseShuttles,
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
      actionBy: request.member!.uid,
      actionRole: request.member!.role,
      createdAt: FieldValue.serverTimestamp()
    });

    response.json({
      success: true,
      totalAvailableShuttles: availableTubes * shuttlesPerTube + looseShuttles
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not save inventory configuration." });
  }
});

/* Physical stock top-up or correction. Consumption after a completed game happens only in finance.ts. */
router.post("/:flightId/adjust", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const flightId = text(request.params.flightId, "Flight ID");
    assertInventoryAccess(flightId, request.member);
    const reason = text(request.body.reason, "Stock adjustment reason");
    const tubeChange = wholeNumber(Math.abs(Number(request.body.tubeChange)), "Tube change");
    const looseChange = wholeNumber(Math.abs(Number(request.body.looseChange)), "Loose shuttle change");
    const direction = request.body.direction === "REMOVE" ? "REMOVE" : "ADD";

    const ref = db.collection("inventory").doc(flightId);
    await db.runTransaction(async transaction => {
      const current = await transaction.get(ref);
      if (!current.exists) throw new Error("Create inventory configuration before adjusting stock.");
      const stock = current.data()!;
      const availableTubes = Number(stock.availableTubes || 0) + (direction === "ADD" ? tubeChange : -tubeChange);
      const looseShuttles = Number(stock.looseShuttles || 0) + (direction === "ADD" ? looseChange : -looseChange);
      if (availableTubes < 0 || looseShuttles < 0) throw new Error("Stock cannot become negative.");
      transaction.update(ref, {
        availableTubes,
        looseShuttles,
        totalAvailableShuttles: availableTubes * Number(stock.shuttlesPerTube) + looseShuttles,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: request.member!.uid
      });
    });

    await db.collection("inventoryAudit").add({
      flightId,
      action: "MANUAL_STOCK_ADJUSTMENT",
      direction,
      tubeChange,
      looseChange,
      reason,
      actionBy: request.member!.uid,
      actionRole: request.member!.role,
      createdAt: FieldValue.serverTimestamp()
    });

    response.json({ success: true });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not adjust stock." });
  }
});

export default router;
