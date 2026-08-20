import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../firebaseAdmin.js";
import { requireAuth, requireRoles, requireSameFlight } from "../auth.js";

export const inventoryRouter = Router();

const stockMovement = z.object({
  flightId: z.string(),
  tubeCount: z.number().int().positive(),
  tubePriceFils: z.number().int().nonnegative(),
  shuttlesPerTube: z.number().int().positive().default(12),
  note: z.string().max(300).optional()
});

inventoryRouter.post("/purchase", requireAuth, requireRoles("LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const input = stockMovement.parse(req.body);
  requireSameFlight(input.flightId, req);
  const stockRef = db.collection("flightStock").doc(input.flightId);

  await db.runTransaction(async tx => {
    const current = (await tx.get(stockRef)).data() ?? { tubeCount: 0 };
    tx.set(stockRef, {
      flightId: input.flightId,
      tubeCount: current.tubeCount + input.tubeCount,
      tubePriceFils: input.tubePriceFils,
      shuttlesPerTube: input.shuttlesPerTube,
      lowStockThreshold: current.lowStockThreshold ?? 8,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    tx.create(db.collection("inventoryLedger").doc(), {
      flightId: input.flightId,
      type: "PURCHASE",
      tubeCount: input.tubeCount,
      tubePriceFils: input.tubePriceFils,
      recordedBy: req.member!.uid,
      note: input.note ?? null,
      createdAt: FieldValue.serverTimestamp()
    });
  });
  res.status(201).json({ ok: true });
});

inventoryRouter.post("/consume", requireAuth, requireRoles("LEVEL_ADMIN", "SUPER_ADMIN"), async (req, res) => {
  const input = z.object({ flightId: z.string(), sessionId: z.string(), tubeCount: z.number().int().positive() }).parse(req.body);
  requireSameFlight(input.flightId, req);
  const stockRef = db.collection("flightStock").doc(input.flightId);

  await db.runTransaction(async tx => {
    const stock = (await tx.get(stockRef)).data();
    if (!stock || stock.tubeCount < input.tubeCount) throw new Error("Insufficient shuttle stock");
    tx.update(stockRef, { tubeCount: stock.tubeCount - input.tubeCount, updatedAt: FieldValue.serverTimestamp() });
    tx.create(db.collection("inventoryLedger").doc(), {
      flightId: input.flightId,
      sessionId: input.sessionId,
      type: "SESSION_CONSUMPTION",
      tubeCount: -input.tubeCount,
      recordedBy: req.member!.uid,
      createdAt: FieldValue.serverTimestamp()
    });
  });
  res.json({ ok: true });
});
