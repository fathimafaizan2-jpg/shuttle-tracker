import { Router } from "express";
import { db } from "../firebaseAdmin.js";
import type { Timestamp as FirestoreTimestamp } from "firebase-admin/firestore";
import { requireAuth, requireFlightAccess, requireRole } from "../auth.js";

const router = Router();

function toDate(value: unknown) {
  if (value && typeof (value as FirestoreTimestamp).toDate === "function") return (value as FirestoreTimestamp).toDate();
  return new Date(value as string);
}

function serializeCharge(document: FirebaseFirestore.QueryDocumentSnapshot) {
  const row = document.data();
  return {
    id: document.id,
    sessionId: row.sessionId,
    memberUid: row.memberUid,
    flightId: row.flightId,
    flightName: row.flightName,
    totalChargeFils: Number(row.totalChargeFils || 0),
    coveredByCreditFils: Number(row.coveredByCreditFils || 0),
    amountDueFils: Number(row.amountDueFils || 0),
    dueAt: toDate(row.dueAt).toISOString(),
    status: row.status
  };
}

/* Player sees only their own arrears. */
router.get("/mine", requireAuth, async (request, response) => {
  try {
    const charges = await db.collection("sessionCharges")
      .where("memberUid", "==", request.member!.uid)
      .where("status", "==", "DUE")
      .get();

    const now = Date.now();
    const arrears = charges.docs
      .filter(doc => toDate(doc.data().dueAt).getTime() <= now)
      .map(serializeCharge)
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

    response.json({
      totalFils: arrears.reduce((sum, row) => sum + row.amountDueFils, 0),
      arrears
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load your arrears." });
  }
});

/* Flight Admin sees arrears for assigned flight; Super Admin sees all. */
router.get("/", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const requestedFlightId = String(request.query.flightId || "").trim();
    const flightId = request.member!.role === "SUPER_ADMIN" ? requestedFlightId || undefined : request.member!.flightId;

    if (flightId && !requireFlightAccess(flightId, request.member!)) {
      return response.status(403).json({ message: "You may view arrears only for your assigned flight." });
    }

    let query: FirebaseFirestore.Query = db.collection("sessionCharges").where("status", "==", "DUE");
    if (flightId) query = query.where("flightId", "==", flightId);
    const charges = await query.get();
    const now = Date.now();

    const overdue = charges.docs.filter(doc => toDate(doc.data().dueAt).getTime() <= now);
    const memberUids = [...new Set(overdue.map(doc => String(doc.data().memberUid)))];
    const members = await Promise.all(memberUids.map(uid => db.collection("members").doc(uid).get()));
    const memberByUid = new Map(members.filter(doc => doc.exists).map(doc => [doc.id, doc.data()]));

    const arrears = overdue.map(doc => {
      const base = serializeCharge(doc);
      const member = memberByUid.get(base.memberUid);
      return {
        ...base,
        memberName: member?.fullName || "Former member",
        memberId: member?.memberId || "",
        phone: member?.phone || ""
      };
    }).sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

    response.json({
      totalFils: arrears.reduce((sum, row) => sum + row.amountDueFils, 0),
      arrears
    });
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not load arrears." });
  }
});

export default router;
