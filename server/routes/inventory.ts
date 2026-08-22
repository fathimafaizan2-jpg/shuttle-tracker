import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles, requireSameFlight } from "../auth.js";

export const inventoryRouter = Router();

inventoryRouter.post("/add-tubes", requireAuth, requireRoles("LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const input = z.object({
    flightId: z.string(),
    tubeCount: z.number().int().positive(),
    tubePriceFils: z.number().int().min(0),
    shuttlesPerTube: z.number().int().positive(),
    note: z.string().trim().max(300).optional()
  }).parse(req.body);

  requireSameFlight(input.flightId, req);
  const stockRef = db.collection("flightStock").doc(input.flightId);

  await db.runTransaction(async tx => {
    const current = (await tx.get(stockRef)).data() ?? { tubeCount: 0, looseShuttles: 0 };
    tx.set(stockRef, {
      flightId: input.flightId,
      tubeCount: current.tubeCount + input.tubeCount,
      looseShuttles: current.looseShuttles,
      tubePriceFils: input.tubePriceFils,
      shuttlesPerTube: input.shuttlesPerTube,
      lowStockTubeThreshold: current.lowStockTubeThreshold ?? 8,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    tx.create(db.collection("inventoryLedger").doc(), {
      flightId: input.flightId,
      movement: "TUBES_ADDED",
      tubeCount: input.tubeCount,
      shuttleCount: input.tubeCount * input.shuttlesPerTube,
      tubePriceFils: input.tubePriceFils,
      note: input.note ?? null,
      recordedBy: req.member!.uid,
      createdAt: FieldValue.serverTimestamp()
    });
  });

  res.status(201).json({ ok: true });
});

// Called only after the game is finished and Level Admin records actual shuttle use.
inventoryRouter.post("/record-game-use", requireAuth, requireRoles("LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const input = z.object({
    sessionId: z.string(),
    flightId: z.string(),
    shuttlesUsedAfterGame: z.number().int().min(0)
  }).parse(req.body);

  requireSameFlight(input.flightId, req);
  const stockRef = db.collection("flightStock").doc(input.flightId);
  const sessionRef = db.collection("sessions").doc(input.sessionId);

  await db.runTransaction(async tx => {
    const [stockSnap, sessionSnap] = await Promise.all([tx.get(stockRef), tx.get(sessionRef)]);
    const stock = stockSnap.data();
    const session = sessionSnap.data();
    if (!stock || !session) throw new Error("Stock or session not found");

    const totalAvailable = stock.tubeCount * stock.shuttlesPerTube + stock.looseShuttles;
    if (input.shuttlesUsedAfterGame > totalAvailable) throw new Error("Used shuttles exceed available stock");

    const remaining = totalAvailable - input.shuttlesUsedAfterGame;
    const remainingFullTubes = Math.floor(remaining / stock.shuttlesPerTube);
    const remainingLooseShuttles = remaining % stock.shuttlesPerTube;

    tx.update(stockRef, {
      tubeCount: remainingFullTubes,
      looseShuttles: remainingLooseShuttles,
      updatedAt: FieldValue.serverTimestamp()
    });

    tx.update(sessionRef, {
      shuttlesUsedAfterGame: input.shuttlesUsedAfterGame,
      totalShuttlesBeforeGame: totalAvailable,
      remainingShuttles: remaining,
      stockRecordedBy: req.member!.uid,
      stockRecordedAt: FieldValue.serverTimestamp()
    });

    tx.create(db.collection("inventoryLedger").doc(), {
      flightId: input.flightId,
      sessionId: input.sessionId,
      movement: "GAME_SHUTTLES_USED",
      shuttleCount: -input.shuttlesUsedAfterGame,
      remainingShuttles: remaining,
      recordedBy: req.member!.uid,
      createdAt: FieldValue.serverTimestamp()
    });
  });

  res.json({ ok: true });
});

inventoryRouter.get("/:flightId", requireAuth, async (req, res) => {
  requireSameFlight(req.params.flightId, req);
  const stock = await db.collection("flightStock").doc(req.params.flightId).get();
  if (!stock.exists) return res.json(null);

  const data = stock.data()!;
  const totalShuttles = data.tubeCount * data.shuttlesPerTube + data.looseShuttles;
  res.json({
    ...data,
    totalShuttles,
    lowStock: data.tubeCount <= data.lowStockTubeThreshold
  });
});
