/* js/modules/flightAdminViews.js */
import { api } from "./auth.js";
import { state } from "../router.js";

const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const bhd = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;

const dateLabel = value => {
  if (!value) return "—";
  const date = value?._seconds ? new Date(Number(value._seconds) * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-BH", { dateStyle: "medium" });
};

const dateTime = value => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-BH", { dateStyle: "medium", timeStyle: "short" });
};

function notify(message) {
  window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: message }));
}

function refresh() {
  window.dispatchEvent(new CustomEvent("indianclub:render"));
}

function deny(title) {
  return `<section class="card"><span class="tag amber">FLIGHT ADMIN OPERATION</span><h2>${escapeHtml(title)}</h2><p class="note">This page is available only to the Flight Admin delegated to a specific level. Super Admin can view the menu but cannot operate this level workflow.</p></section>`;
}

function financeRows(rows, emptyMessage, options = {}) {
  if (!rows?.length) return `<p class="note">${escapeHtml(emptyMessage)}</p>`;

  const due = Boolean(options.due);
  const reminders = Boolean(options.reminders);

  return `<div class="table-wrap"><table class="schedule"><thead><tr><th>Player</th><th>Date</th><th>Amount</th><th>Status</th>${reminders ? "<th>Action</th>" : ""}</tr></thead><tbody>${rows.map(row => `<tr><td><b>${escapeHtml(row.memberName || row.memberId || row.memberUid)}</b>  
<small>${escapeHtml(row.memberId || "")}</small></td><td>${escapeHtml(dateLabel(row.paidAt || row.createdAt || row.dueAt))}</td><td>${bhd(due ? row.amountDueFils : (row.totalChargeFils || row.amountFils))}</td><td><span class="tag ${String(row.status || "").startsWith("PAID") ? "blue" : String(row.status) === "DUE" ? "red" : "amber"}">${escapeHtml(row.status || "DUE")}</span></td>${reminders ? `<td><button class="pill" data-whatsapp-reminder="${escapeHtml(row.phone || "")}" data-whatsapp-name="${escapeHtml(row.memberName || "Member")}" data-whatsapp-amount="${escapeHtml(bhd(row.amountDueFils))}">WhatsApp reminder</button></td>` : ""}</tr>`).join("")}</tbody></table></div>`;
}

function paymentRows(rows) {
  if (!rows?.length) return "<p class='note'>No Cash or Benefit settlement needs approval for your flight.</p>";

  return rows.map(payment => `<div class="session"><div class="grow"><b>${escapeHtml(payment.memberName || payment.memberUid)}</b><p>${escapeHtml(payment.method)} · ${escapeHtml(payment.reference || "No reference")} · ${escapeHtml(dateLabel(payment.submittedAt))}</p></div><strong>${bhd(payment.amountFils)}</strong><button class="primary" data-verify-payment="${escapeHtml(payment.id)}">Verify</button></div>`).join("");
}

export async function flightAdminSessionView() {
  if (state.member?.role !== "LEVEL_ADMIN") return deny("Session Control");

  const [sessions, finance] = await Promise.all([
    api("/timetable/mine"),
    api("/finance/overview")
  ]);

  const readySessions = sessions
    .filter(session => new Date(session.endAt || session.startAt).getTime() <= Date.now() && session.status !== "COMPLETED")
    .sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

  return `<div class="page-head"><div><span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span><h2>Session Control</h2><p>Complete a finished game using the real shuttlecock usage. Only final PRESENT attendees receive equal charges.</p></div></div>
    <section class="card"><h3>Complete finished game</h3><div class="grid two"><div class="field"><label for="completeSessionId">Finished session</label><select id="completeSessionId"><option value="">Choose a finished game</option>${readySessions.map(session => `<option value="${escapeHtml(session.id)}">${escapeHtml(session.flightName)} · ${escapeHtml(dateTime(session.startAt))}</option>`).join("")}</select></div><div class="field"><label for="actualShuttlesUsed">Actual shuttlecocks used</label><input id="actualShuttlesUsed" type="number" min="0" step="1" placeholder="Example: 5" /></div></div><button id="completeGameFinance" class="primary">Complete game and create Player charges</button><p class="note">Set Shuttle Stock before completion. A completed game cannot be charged twice.</p></section>
    <section class="card"><h3>Pending Cash / Benefit confirmation</h3>${paymentRows(finance.pendingPayments || [])}</section>
    <section class="card"><div class="page-head"><div><h3>Paid Players</h3><p class="note">Payment date and record for your assigned flight.</p></div><button class="pill" data-print-flight-list="paid">Print paid list</button></div>${financeRows(finance.paid || [], "No paid Player records.")}</section>
    <section class="card"><div class="page-head"><div><h3>Unpaid Players</h3><p class="note">Send a controlled WhatsApp reminder when appropriate.</p></div><button class="pill" data-print-flight-list="unpaid">Print unpaid list</button></div>${financeRows(finance.unpaid || [], "No unpaid Player records.", { due: true, reminders: true })}</section>`;
}

export async function flightAdminStockView() {
  if (state.member?.role !== "LEVEL_ADMIN") return deny("Shuttle Stock");

  const records = await api("/inventory/mine");
  const stock = records[0] || {};
  const flightId = state.member.flightId || "";

  return `<div class="page-head"><div><span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span><h2>Shuttle Stock</h2><p>Set the physical tube price, shuttlecocks per tube, and available stock for your own level.</p></div></div>
    <div class="grid metrics"><article class="card metric"><span>Available tubes</span><b>${Number(stock.availableTubes || 0)}</b><i>Physical tubes</i></article><article class="card metric"><span>Loose shuttlecocks</span><b>${Number(stock.looseShuttles || 0)}</b><i>Individual pieces</i></article><article class="card metric"><span>Total available</span><b>${Number(stock.totalAvailableShuttles || 0)}</b><i>Shuttlecocks</i></article><article class="card metric"><span>Tube price</span><b>${bhd(stock.tubePriceFils)}</b><i>Configured price</i></article></div>
    <section class="card"><h3>Stock configuration</h3><div class="grid two"><div class="field"><label for="stockTubePrice">Tube price in BHD</label><input id="stockTubePrice" type="number" min="0.001" step="0.001" value="${Number(stock.tubePriceFils || 0) ? (Number(stock.tubePriceFils) / 1000).toFixed(3) : ""}" /></div><div class="field"><label for="stockPerTube">Shuttlecocks per tube</label><input id="stockPerTube" type="number" min="1" step="1" value="${escapeHtml(stock.shuttlesPerTube || "")}" placeholder="12 or 15" /></div><div class="field"><label for="stockAvailableTubes">Available tubes</label><input id="stockAvailableTubes" type="number" min="0" step="1" value="${escapeHtml(stock.availableTubes || 0)}" /></div><div class="field"><label for="stockLooseShuttles">Loose shuttlecocks</label><input id="stockLooseShuttles" type="number" min="0" step="1" value="${escapeHtml(stock.looseShuttles || 0)}" /></div></div><button id="saveStockConfig" data-flight-id="${escapeHtml(flightId)}" class="primary">Save stock configuration</button></section>
    <section class="card"><h3>Physical stock adjustment</h3><div class="grid two"><div class="field"><label for="stockAdjustmentDirection">Change</label><select id="stockAdjustmentDirection"><option value="ADD">Add stock</option><option value="REMOVE">Remove stock</option></select></div><div class="field"><label for="stockAdjustmentReason">Reason</label><input id="stockAdjustmentReason" placeholder="New purchase, damaged shuttlecocks…" /></div><div class="field"><label for="stockTubeChange">Tube change</label><input id="stockTubeChange" type="number" min="0" step="1" value="0" /></div><div class="field"><label for="stockLooseChange">Loose shuttlecock change</label><input id="stockLooseChange" type="number" min="0" step="1" value="0" /></div></div><button id="adjustStock" data-flight-id="${escapeHtml(flightId)}" class="pill">Save stock adjustment</button></section>`;
}

export async function flightAdminReportsView() {
  if (state.member?.role !== "LEVEL_ADMIN") return deny("Reports & Sheets Export");

  const finance = await api("/finance/overview");
  const exportRows = [...(finance.paid || []), ...(finance.unpaid || [])];

  return `<div class="page-head"><div><span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span><h2>Reports & Sheets Export</h2><p>Print or download only your own flight’s paid and unpaid records.</p></div></div>
    <section class="card"><div class="actions"><button class="primary" data-print-flight-report>Print report</button><button class="pill" data-export-flight-report>Download CSV</button></div></section>
    <section class="card"><h3>Paid Players</h3>${financeRows(finance.paid || [], "No paid Player records.")}</section>
    <section class="card"><h3>Unpaid Players</h3>${financeRows(finance.unpaid || [], "No unpaid Player records.", { due: true })}</section>
    <script type="application/json" id="flightReportRows">${escapeHtml(JSON.stringify(exportRows))}</script>`;
}

export function bindFlightAdminViews() {
  const complete = document.getElementById("completeGameFinance");
  if (complete) complete.onclick = async () => {
    try {
      const sessionId = document.getElementById("completeSessionId").value;
      const actualShuttlesUsed = Number(document.getElementById("actualShuttlesUsed").value);
      if (!sessionId) throw new Error("Choose a finished game.");
      if (!Number.isInteger(actualShuttlesUsed) || actualShuttlesUsed < 0) throw new Error("Enter a whole number of shuttlecocks used.");
      await api(`/finance/session/${encodeURIComponent(sessionId)}/complete`, { method: "POST", body: { actualShuttlesUsed } });
      notify("Game completed. Stock and Player charges were created.");
      refresh();
    } catch (error) { notify(error.message); }
  };

  document.querySelectorAll("[data-verify-payment]").forEach(button => button.onclick = async () => {
    try {
      await api(`/finance/payments/${encodeURIComponent(button.dataset.verifyPayment)}/verify`, { method: "POST" });
      notify("Cash / Benefit payment confirmed.");
      refresh();
    } catch (error) { notify(error.message); }
  });

  document.querySelectorAll("[data-whatsapp-reminder]").forEach(button => button.onclick = () => {
    const phone = String(button.dataset.whatsappReminder || "").replace(/\D/g, "");
    if (!phone) return notify("This Player has no phone number saved.");
    const message = encodeURIComponent(`Hello ${button.dataset.whatsappName}, your Indian Club Bahrain shuttlecock charge of ${button.dataset.whatsappAmount} is unpaid. Please pay using wallet credit, Cash, or Benefit. Thank you.`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener" );
  });

  document.querySelectorAll("[data-print-flight-list]").forEach(button => button.onclick = () => window.print());

  const saveConfig = document.getElementById("saveStockConfig");
  if (saveConfig) saveConfig.onclick = async () => {
    try {
      const flightId = saveConfig.dataset.flightId;
      const tubePriceFils = Math.round(Number(document.getElementById("stockTubePrice").value) * 1000);
      const shuttlesPerTube = Number(document.getElementById("stockPerTube").value);
      const availableTubes = Number(document.getElementById("stockAvailableTubes").value);
      const looseShuttles = Number(document.getElementById("stockLooseShuttles").value);
      if (!flightId) throw new Error("Your account has no assigned flight.");
      await api(`/inventory/${encodeURIComponent(flightId)}/config`, { method: "PUT", body: { tubePriceFils, shuttlesPerTube, availableTubes, looseShuttles } });
      notify("Shuttle stock configuration saved.");
      refresh();
    } catch (error) { notify(error.message); }
  };

  const adjust = document.getElementById("adjustStock");
  if (adjust) adjust.onclick = async () => {
    try {
      const flightId = adjust.dataset.flightId;
      const direction = document.getElementById("stockAdjustmentDirection").value;
      const reason = document.getElementById("stockAdjustmentReason").value.trim();
      const tubeChange = Number(document.getElementById("stockTubeChange").value);
      const looseChange = Number(document.getElementById("stockLooseChange").value);
      if (!flightId) throw new Error("Your account has no assigned flight.");
      if (!reason) throw new Error("Enter the stock adjustment reason.");
      await api(`/inventory/${encodeURIComponent(flightId)}/adjust`, { method: "POST", body: { direction, reason, tubeChange, looseChange } });
      notify("Stock adjustment saved.");
      refresh();
    } catch (error) { notify(error.message); }
  };

  document.querySelectorAll("[data-print-flight-report]").forEach(button => button.onclick = () => window.print());

  document.querySelectorAll("[data-export-flight-report]").forEach(button => button.onclick = () => {
    const source = document.getElementById("flightReportRows");
    const rows = source ? JSON.parse(source.textContent || "[]") : [];
    const header = ["Player", "Member ID", "Flight", "Date", "Amount BHD", "Status"];
    const csvRows = rows.map(row => [
      row.memberName || row.memberUid,
      row.memberId || "",
      row.flightName || "",
      dateLabel(row.paidAt || row.createdAt || row.dueAt),
      (Number(row.amountDueFils || row.totalChargeFils || 0) / 1000).toFixed(3),
      row.status || ""
    ]);
    const csv = [header, ...csvRows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "indian-club-flight-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  });
}
