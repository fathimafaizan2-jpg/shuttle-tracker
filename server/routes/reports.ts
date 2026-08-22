import { Router } from "express";
import { db, Timestamp } from "../firebaseAdmin.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

function monthValue(value: unknown) {
  const text = String(value || "").trim();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(text)) throw new Error("Use a month in YYYY-MM format.");
  return text;
}

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function csv(rows: unknown[][]) {
  return rows.map(row => row.map(csvCell).join(",")).join("\r\n");
}

function dateText(value: unknown) {
  if (value && typeof (value as Timestamp).toDate === "function") return (value as Timestamp).toDate().toISOString();
  return value ? new Date(value as string).toISOString() : "";
}

function sendCsv(response: import("express").Response, filename: string, rows: unknown[][]) {
  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  response.send("\uFEFF" + csv(rows));
}

async function permittedFlightId(request: import("express").Request) {
  if (request.member!.role === "SUPER_ADMIN") return String(request.query.flightId || "").trim() || undefined;
  return request.member!.flightId;
}

/* Attendance ledger: compatible with direct opening/import in Google Sheets. */
router.get("/attendance.csv", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const month = monthValue(request.query.month || new Date().toISOString().slice(0, 7));
    const flightId = await permittedFlightId(request);
    const sessions = await db.collection("sessions").where("month", "==", month).get();
    const allowedSessions = sessions.docs.filter(doc => !flightId || doc.data().flightId === flightId);
    const sessionIds = allowedSessions.map(doc => doc.id);

    const [attendance, members] = await Promise.all([
      Promise.all(sessionIds.map(id => db.collection("attendance").where("sessionId", "==", id).get())),
      db.collection("members").get()
    ]);
    const memberName = new Map(members.docs.map(doc => [doc.id, doc.data().fullName]));
    const sessionById = new Map(allowedSessions.map(doc => [doc.id, doc.data()]));

    const rows: unknown[][] = [["Session ID", "Date / Time", "Flight", "Member", "Status", "Source", "Updated at"]];
    attendance.flatMap(snapshot => snapshot.docs).forEach(doc => {
      const row = doc.data();
      const session = sessionById.get(row.sessionId);
      rows.push([
        row.sessionId,
        session ? dateText(session.startAt) : "",
        session?.flightName || "",
        memberName.get(row.memberUid) || row.memberUid,
        row.status,
        row.source || "",
        dateText(row.updatedAt)
      ]);
    });
    sendCsv(response, `indian-club-attendance-${month}.csv`, rows);
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not export attendance." });
  }
});

/* Finance audit: total cost and assigned player share for every completed session. */
router.get("/finance.csv", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const month = monthValue(request.query.month || new Date().toISOString().slice(0, 7));
    const flightId = await permittedFlightId(request);
    const charges = await db.collection("sessionCharges").get();
    const filtered = charges.docs.filter(doc => {
      const row = doc.data();
      return (!flightId || row.flightId === flightId) && String(row.sessionId || "").startsWith(`${month}_`);
    });
    const members = await db.collection("members").get();
    const memberName = new Map(members.docs.map(doc => [doc.id, doc.data().fullName]));

    const rows: unknown[][] = [["Session ID", "Flight", "Member", "Total share (fils)", "Credit applied (fils)", "Due (fils)", "Status", "Due at"]];
    filtered.forEach(doc => {
      const row = doc.data();
      rows.push([
        row.sessionId,
        row.flightName,
        memberName.get(row.memberUid) || row.memberUid,
        row.totalChargeFils,
        row.coveredByCreditFils,
        row.amountDueFils,
        row.status,
        dateText(row.dueAt)
      ]);
    });
    sendCsv(response, `indian-club-finance-${month}.csv`, rows);
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not export finance." });
  }
});

/* Inventory audit records who changed stock or completed a session. */
router.get("/inventory.csv", requireAuth, requireRole("LEVEL_ADMIN", "SUPER_ADMIN"), async (request, response) => {
  try {
    const flightId = await permittedFlightId(request);
    const audit = await db.collection("inventoryAudit").orderBy("createdAt", "desc").limit(2000).get();
    const rows: unknown[][] = [["Date", "Flight", "Session", "Action", "Used", "Remaining", "Tube price (fils)", "Shuttles per tube", "Reason", "Action by"]];
    audit.docs.filter(doc => !flightId || doc.data().flightId === flightId).forEach(doc => {
      const row = doc.data();
      rows.push([
        dateText(row.createdAt),
        row.flightId,
        row.sessionId || "",
        row.action,
        row.actualShuttlesUsed || "",
        row.remainingShuttles || "",
        row.tubePriceFils || "",
        row.shuttlesPerTube || "",
        row.reason || "",
        row.actionBy || ""
      ]);
    });
    sendCsv(response, "indian-club-inventory-audit.csv", rows);
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Could not export inventory audit." });
  }
});

export default router;
