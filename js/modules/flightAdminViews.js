import { api } from "./auth.js";
import { state } from "../router.js";

let stockEditMode = false;

const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const bhd = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;

function asDate(value) {
  if (!value) return null;
  const date = value?._seconds ? new Date(Number(value._seconds) * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateLabel(value) {
  const date = asDate(value);
  return date ? date.toLocaleDateString("en-BH", { dateStyle: "medium" }) : "—";
}

function dateTime(value) {
  const date = asDate(value);
  return date ? date.toLocaleString("en-BH", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

function notify(message) {
  window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: message }));
}

function refresh() {
  window.dispatchEvent(new CustomEvent("indianclub:render"));
}

function onlyFlightAdmin(title) {
  return `<section class="card"><span class="tag amber">FLIGHT ADMIN OPERATION</span><h2>${escapeHtml(title)}</h2><p class="note">Only the Flight Admin delegated to a flight can operate this page. Super Admin can view the menu only.</p></section>`;
}

function gameDate(row) {
  return row.gameDate || row.sessionStartAt || row.startAt || row.paidAt || row.createdAt || row.dueAt;
}

function stockSummary(stock) {
  const availableTubes = Number(stock.availableTubes || 0);
  const shuttlesPerTube = Number(stock.shuttlesPerTube || 0);
  const looseShuttles = Number(stock.looseShuttles || 0);
  const totalAvailable = Number(stock.totalAvailableShuttles || availableTubes * shuttlesPerTube + looseShuttles);
  const costPerShuttleFils = shuttlesPerTube ? Number(stock.tubePriceFils || 0) / shuttlesPerTube : 0;
  const lowStockThreshold = Number(stock.lowStockThresholdShuttles || shuttlesPerTube || 0);
  return {
    availableTubes,
    shuttlesPerTube,
    looseShuttles,
    totalAvailable,
    costPerShuttleFils,
    lowStockThreshold,
    lowStock: typeof stock.lowStock === "boolean" ? stock.lowStock : totalAvailable <= lowStockThreshold
  };
}

function paymentRows(items, empty, unpaid = false) {
  if (!items?.length) return `<p class="note">${escapeHtml(empty)}</p>`;
  return `<div class="table-wrap"><table class="schedule"><thead><tr><th>Player</th><th>Game date</th><th>Amount</th><th>Status</th>${unpaid ? "<th>Action</th>" : ""}</tr></thead><tbody>${items.map(item => `
    <tr>
      <td><b>${escapeHtml(item.memberName || item.memberId || item.memberUid)}</b><br><small>${escapeHtml(item.memberId || "")}</small></td>
      <td>${escapeHtml(dateLabel(gameDate(item)))}</td>
      <td>${bhd(unpaid ? item.amountDueFils : (item.totalChargeFils || item.amountFils))}</td>
      <td><span class="tag ${String(item.status || "").startsWith("PAID") ? "blue" : item.status === "DUE" ? "red" : "amber"}">${escapeHtml(item.status || "DUE")}</span></td>
      ${unpaid ? `<td><button class="pill" data-flight-reminder-phone="${escapeHtml(item.phone || "")}" data-flight-reminder-name="${escapeHtml(item.memberName || "Member")}" data-flight-reminder-amount="${escapeHtml(bhd(item.amountDueFils))}">WhatsApp reminder</button></td>` : ""}
    </tr>`).join("")}</tbody></table></div>`;
}

function gameLogRows(items) {
  if (!items?.length) return "<p class='note'>No completed games have been recorded for this flight yet.</p>";
  return `<div class="table-wrap"><table class="schedule"><thead><tr><th>Game date</th><th>Present</th><th>Used</th><th>Cost</th><th>Per Player</th><th>Remaining</th><th>Refill</th></tr></thead><tbody>${items.map(game => `
    <tr>
      <td><b>${escapeHtml(dateLabel(game.gameDate || game.startAt))}</b><br><small>${escapeHtml(dateTime(game.startAt))}</small></td>
      <td>${Number(game.attendeeCount || 0)}</td><td>${Number(game.actualShuttlesUsed || 0)}</td>
      <td>${bhd(game.totalDayCostFils)}</td><td>${bhd(game.perPlayerCostExactFils)}</td>
      <td>${Number(game.remainingShuttlesAfterGame || 0)} shuttlecocks</td>
      <td><span class="tag ${game.lowStock ? "red" : "blue"}">${game.lowStock ? "REFILL NEEDED" : "SUFFICIENT"}</span></td>
    </tr>`).join("")}</tbody></table></div>`;
}

export async function flightAdminSessionControlView() {
  if (state.member?.role !== "LEVEL_ADMIN") return onlyFlightAdmin("Session Control");

  const [sessions, finance, stockRows] = await Promise.all([
    api("/timetable/mine"), api("/finance/overview"), api("/inventory/mine")
  ]);
  const summary = stockSummary(stockRows[0] || {});
  const finishedSessions = sessions
    .filter(session => asDate(session.endAt || session.startAt)?.getTime() <= Date.now() && session.status !== "COMPLETED")
    .sort((a, b) => asDate(b.startAt)?.getTime() - asDate(a.startAt)?.getTime());

  return `
    <div class="page-head"><div><span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span><h2>Session Control</h2><p>Only finished games that still match your Super Admin Master Timetable appear below. Charges use only final PRESENT attendees.</p></div></div>
    <section class="card">
      <div class="page-head"><div><h3>Complete a scheduled game</h3><p class="note">Price per shuttlecock: <b>${summary.shuttlesPerTube ? bhd(summary.costPerShuttleFils) : "Set stock first"}</b>. The app divides actual use equally among final PRESENT attendees.</p></div><span class="tag ${summary.lowStock ? "red" : "blue"}">${summary.lowStock ? "REFILL NEEDED" : `${summary.totalAvailable} AVAILABLE`}</span></div>
      <div class="grid two"><div class="field"><label for="completeSessionId">Finished scheduled game</label><select id="completeSessionId"><option value="">Choose a timetable game</option>${finishedSessions.map(session => `<option value="${escapeHtml(session.id)}">${escapeHtml(dateTime(session.startAt))}</option>`).join("")}</select></div><div class="field"><label for="actualShuttlesUsed">Actual shuttlecocks used</label><input id="actualShuttlesUsed" type="number" min="0" max="${summary.totalAvailable}" step="1" placeholder="Example: 9" /></div></div>
      <button id="completeFlightGame" class="primary" ${summary.shuttlesPerTube ? "" : "disabled"}>Complete game and create Player charges</button>
      <p class="note">Example: BHD 12.000 per tube ÷ 12 shuttlecocks = BHD 1.000 each. If 9 are used by 5 final PRESENT players, each player is charged BHD 1.800.</p>
    </section>
    <section class="card"><h3>Game log</h3><p class="note">Each completed timetable game records its date, final attendance, actual use, cost, remaining stock, and refill status.</p>${gameLogRows(finance.gameLog || [])}</section>
    <section class="card"><h3>Pending Cash / Benefit confirmation</h3>${(finance.pendingPayments || []).map(payment => `<div class="session"><div class="grow"><b>${escapeHtml(payment.memberName || payment.memberUid)}</b><p>${escapeHtml(payment.method)} · ${escapeHtml(payment.reference || "No reference")} · ${escapeHtml(dateLabel(payment.submittedAt))}</p></div><strong>${bhd(payment.amountFils)}</strong><button class="primary" data-flight-verify="${escapeHtml(payment.id)}">Verify</button></div>`).join("") || "<p class='note'>No Cash or Benefit settlement is awaiting confirmation for your flight.</p>"}</section>`;
}

export async function flightAdminShuttleStockView() {
  if (state.member?.role !== "LEVEL_ADMIN") return onlyFlightAdmin("Shuttle Stock");
  const stockRows = await api("/inventory/mine");
  const stock = stockRows[0] || {};
  const summary = stockSummary(stock);
  const configured = Boolean(Number(stock.shuttlesPerTube) && Number(stock.tubePriceFils));

  return `
    <div class="page-head"><div><span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span><h2>Shuttle Stock</h2><p>Tube count, shuttles per tube, and tube price remain fixed until you use Edit settings. Remaining stock changes only after a completed game.</p></div></div>
    <div class="grid metrics"><article class="card metric"><span>Tube count</span><b>${summary.availableTubes}</b></article><article class="card metric"><span>Shuttles per tube</span><b>${summary.shuttlesPerTube || "—"}</b></article><article class="card metric"><span>Price per shuttlecock</span><b>${summary.shuttlesPerTube ? bhd(summary.costPerShuttleFils) : "—"}</b></article><article class="card metric"><span>Remaining stock</span><b>${summary.totalAvailable}</b></article></div>
    <section class="card"><div class="page-head"><div><h3>Stock settings</h3><p class="note">${configured ? `${bhd(stock.tubePriceFils)} per tube · refill warning at ${summary.lowStockThreshold} shuttlecocks or less.` : "Set your starting tube count, shuttles per tube, and tube price before completing a game."}</p></div><button id="toggleFlightStockEdit" class="pill">${stockEditMode || !configured ? "Cancel" : "Edit settings"}</button></div>
    ${stockEditMode || !configured ? `<div class="grid two"><div class="field"><label for="stockTubePrice">Tube price in BHD</label><input id="stockTubePrice" type="number" min="0.001" step="0.001" value="${Number(stock.tubePriceFils || 0) ? (Number(stock.tubePriceFils) / 1000).toFixed(3) : ""}" /></div><div class="field"><label for="stockPerTube">Shuttlecocks per tube</label><input id="stockPerTube" type="number" min="1" step="1" value="${escapeHtml(stock.shuttlesPerTube || "")}" placeholder="12" /></div><div class="field"><label for="stockTubes">Tube count</label><input id="stockTubes" type="number" min="0" step="1" value="${escapeHtml(stock.availableTubes || 0)}" /></div></div><button id="saveFlightStock" class="primary">Save fixed stock settings</button>` : ""}</section>
    <section class="card"><h3>Refill status</h3><p class="note">${summary.lowStock ? `Only ${summary.totalAvailable} shuttlecocks remain. Refill the stock before the next game.` : `${summary.totalAvailable} shuttlecocks remain. The app will show a refill warning at ${summary.lowStockThreshold} or fewer.`}</p></section>`;
}

export async function flightAdminReportsView() {
  if (state.member?.role !== "LEVEL_ADMIN") return onlyFlightAdmin("Reports & Sheets Export");
  const finance = await api("/finance/overview");
  window.__indianClubFlightReportRows = [...(finance.paid || []), ...(finance.unpaid || [])];
  return `<div class="page-head"><div><span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span><h2>Reports & Sheets Export</h2><p>Print or download only your assigned flight’s paid and unpaid records.</p></div></div><section class="card"><div class="actions"><button class="primary" data-flight-print>Print current report</button><button id="exportFlightCsv" class="pill">Download CSV</button></div></section><section class="card"><h3>Paid Players</h3>${paymentRows(finance.paid || [], "No paid Player records.")}</section><section class="card"><h3>Unpaid Players</h3>${paymentRows(finance.unpaid || [], "No unpaid Player records.", true)}</section>`;
}

export function bindFlightAdminViews() {
  const complete = document.getElementById("completeFlightGame");
  if (complete) complete.onclick = async () => {
    try {
      const sessionId = document.getElementById("completeSessionId").value;
      const actualShuttlesUsed = Number(document.getElementById("actualShuttlesUsed").value);
      if (!sessionId) throw new Error("Choose a finished Master Timetable game.");
      if (!Number.isInteger(actualShuttlesUsed) || actualShuttlesUsed < 0) throw new Error("Enter a whole number of shuttlecocks used.");
      await api(`/finance/session/${encodeURIComponent(sessionId)}/complete`, { method: "POST", body: { actualShuttlesUsed } });
      notify("Game completed. Final-present charges, stock, and the game log were created.");
      refresh();
    } catch (error) { notify(error.message); }
  };

  document.querySelectorAll("[data-flight-verify]").forEach(button => button.onclick = async () => {
    try { await api(`/finance/payments/${encodeURIComponent(button.dataset.flightVerify)}/verify`, { method: "POST" }); notify("Cash / Benefit payment confirmed."); refresh(); }
    catch (error) { notify(error.message); }
  });

  document.querySelectorAll("[data-flight-reminder-phone]").forEach(button => button.onclick = () => {
    const phone = String(button.dataset.flightReminderPhone || "").replace(/\D/g, "");
    if (!phone) return notify("This Player has no phone number saved.");
    const message = encodeURIComponent(`Hello ${button.dataset.flightReminderName}, your Indian Club Bahrain shuttlecock charge of ${button.dataset.flightReminderAmount} is unpaid. Please pay using wallet credit, Cash, or Benefit. Thank you.`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener");
  });

  document.querySelectorAll("[data-flight-print]").forEach(button => button.onclick = () => window.print());

  const toggleStockEdit = document.getElementById("toggleFlightStockEdit");
  if (toggleStockEdit) toggleStockEdit.onclick = () => { stockEditMode = !stockEditMode; refresh(); };

  const saveStock = document.getElementById("saveFlightStock");
  if (saveStock) saveStock.onclick = async () => {
    try {
      const flightId = state.member?.flightId;
      if (!flightId) throw new Error("Your account has no assigned flight.");
      await api(`/inventory/${encodeURIComponent(flightId)}/config`, { method: "PUT", body: { tubePriceFils: Math.round(Number(document.getElementById("stockTubePrice").value) * 1000), shuttlesPerTube: Number(document.getElementById("stockPerTube").value), availableTubes: Number(document.getElementById("stockTubes").value) } });
      stockEditMode = false;
      notify("Fixed stock settings saved. Game completion will now update remaining stock automatically.");
      refresh();
    } catch (error) { notify(error.message); }
  };

  const exportCsv = document.getElementById("exportFlightCsv");
  if (exportCsv) exportCsv.onclick = () => {
    const rows = window.__indianClubFlightReportRows || [];
    const header = ["Player", "Member ID", "Flight", "Game date", "Amount BHD", "Status"];
    const values = rows.map(row => [row.memberName || row.memberUid, row.memberId || "", row.flightName || "", dateLabel(gameDate(row)), (Number(row.amountDueFils || row.totalChargeFils || 0) / 1000).toFixed(3), row.status || ""]);
    const csv = [header, ...values].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "indian-club-flight-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
}
