import { api } from "./auth.js";
import { state } from "../router.js";

const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const bhd = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;

function clubDate(value) {
  if (!value) return null;
  const date = value?._seconds ? new Date(Number(value._seconds) * 1000) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function dateLabel(value) {
  const date = clubDate(value);
  return date ? date.toLocaleDateString("en-BH", { dateStyle: "medium", timeZone: "Asia/Bahrain" }) : "—";
}

function dateTime(value) {
  const date = clubDate(value);
  return date ? date.toLocaleString("en-BH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bahrain" }) : "—";
}

function bahrainDateKey(value) {
  const date = clubDate(value);
  return date ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bahrain", year: "numeric", month: "2-digit", day: "2-digit" }).format(date) : "";
}

function notify(message) {
  window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: message }));
}

function refresh() {
  window.dispatchEvent(new CustomEvent("indianclub:render"));
}

function isOperationalAdmin() { return ["LEVEL_ADMIN", "SUPER_ADMIN"].includes(state.member?.role) && Boolean(state.member?.flightId); }

function onlyFlightAdmin(title) {
  return `<section class="card"><span class="tag amber">FLIGHT ADMIN OPERATION</span><h2>${escapeHtml(title)}</h2><p class="note">Only the Flight Admin delegated to a level can operate this page. Super Admin can view the menu only.</p></section>`;
}

function rows(items, empty, options = {}) {
  if (!items?.length) return `<p class="note">${escapeHtml(empty)}</p>`;
  const due = Boolean(options.due);
  const reminder = Boolean(options.reminder);
  const confirmation = Boolean(options.confirmation);
  const actionHead = reminder || confirmation ? "<th>Action</th>" : "";
  return `<div class="table-wrap"><table class="schedule"><thead><tr><th>Player</th><th>Date</th><th>Amount</th><th>Status / payment ID</th>${actionHead}</tr></thead><tbody>${items.map(item => { const amount = bhd(due ? item.amountDueFils : (item.totalChargeFils || item.amountFils)); const action = reminder ? `<button class="pill" data-flight-reminder-phone="${escapeHtml(item.phone || "")}" data-flight-reminder-name="${escapeHtml(item.memberName || "Member")}" data-flight-reminder-amount="${escapeHtml(amount)}">WhatsApp reminder</button>` : confirmation ? `<button class="pill" data-flight-paid-phone="${escapeHtml(item.phone || "")}" data-flight-paid-name="${escapeHtml(item.memberName || "Member")}" data-flight-paid-amount="${escapeHtml(amount)}" data-flight-paid-date="${escapeHtml(dateLabel(item.paidAt || item.createdAt || item.dueAt))}">WhatsApp confirmation</button>` : ""; const paymentCode = item.paymentCode || item.verifiedPaymentId || "—"; return `<tr><td><b>${escapeHtml(item.memberName || item.memberId || item.memberUid)}</b><br><small>${escapeHtml(item.memberId || "")}</small></td><td>${escapeHtml(dateLabel(item.paidAt || item.createdAt || item.dueAt))}</td><td>${amount}</td><td><span class="tag ${String(item.status || "").startsWith("PAID") ? "blue" : item.status === "DUE" ? "red" : "amber"}">${escapeHtml(item.status || "DUE")}</span><br><small>${paymentCode === "—" ? "" : `ID: ${escapeHtml(paymentCode)}`}</small></td>${action ? `<td>${action}</td>` : ""}</tr>`; }).join("")}</tbody></table></div>`;
}

export async function flightAdminSessionControlView() {
  if (!isOperationalAdmin()) return onlyFlightAdmin("Session Control");

  const financeQuery = state.member.role === "SUPER_ADMIN" && state.member.flightId ? `?flightId=${encodeURIComponent(state.member.flightId)}` : "";
  const [sessions, finance] = await Promise.all([api("/timetable/mine"), api(`/finance/overview${financeQuery}`)]);
  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bahrain", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const today = sessions.filter(session => bahrainDateKey(session.startAt) === todayKey).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const attendanceResults = await Promise.all(today.map(async session => {
    try { return [session.id, await api(`/attendance/session/${encodeURIComponent(session.id)}`)]; }
    catch { return [session.id, null]; }
  }));
  const attendanceBySession = new Map(attendanceResults);
  const sessionCards = today.map(session => {
    const ended = new Date(session.endAt || session.startAt).getTime() <= Date.now();
    const completed = session.status === "COMPLETED";
    const attendance = attendanceBySession.get(session.id);
    const roster = attendance?.roster || [];
    const presentCount = roster.filter(person => person.status === "PRESENT").length;
    const canCorrect = Boolean(attendance?.canCorrect) && !completed;
    const rosterRows = roster.map(person => `<div class="session"><div class="grow"><b>${escapeHtml(person.fullName || "Member")}</b><p>${escapeHtml(person.memberId || "")}</p></div><span class="tag ${person.status === "PRESENT" ? "blue" : person.status === "ABSENT" ? "red" : "amber"}">${escapeHtml(String(person.status || "NO_RESPONSE").replaceAll("_", " "))}</span>${canCorrect ? `<div class="actions"><button class="pill" data-session-attendance="PRESENT" data-session-id="${escapeHtml(session.id)}" data-member-uid="${escapeHtml(person.uid)}">Mark present</button><button class="pill" data-session-attendance="ABSENT" data-session-id="${escapeHtml(session.id)}" data-member-uid="${escapeHtml(person.uid)}">Mark absent</button></div>` : ""}</div>`).join("") || "<p class='note'>No active members are assigned to this flight.</p>";
    const finalAttendance = `<section class="card"><div class="page-head"><div><h3>Final attendance before calculation</h3><p class="note">Final PRESENT players: <b>${presentCount}</b>. Mark a player Present when they arrived, or Absent when they did not come. Only this final PRESENT list receives the equal shuttlecock charge.</p></div><span class="tag ${presentCount ? "blue" : "amber"}">${presentCount} PRESENT</span></div>${rosterRows}${!canCorrect && !completed ? "<p class='note'>Final attendance correction becomes available when the game has started. Player self-responses remain open until the normal attendance lock.</p>" : ""}</section>`;
    const finishControl = ended && !completed ? `<div class="grid two"><div class="field"><label for="actualShuttlesUsed-${escapeHtml(session.id)}">Actual shuttlecocks used</label><input id="actualShuttlesUsed-${escapeHtml(session.id)}" type="number" min="0" step="1" placeholder="Number used" /></div><div class="field"><label>Final players attending</label><b>${presentCount} PRESENT</b><small>Charges will be split only among these final attendees.</small></div></div><button class="primary" data-complete-flight-game="${escapeHtml(session.id)}" ${presentCount ? "" : "disabled"}>Update final attendance and create Player charges</button>` : "";
    return `<article class="card"><div class="session"><div class="grow"><b>${escapeHtml(session.flightName || state.member.flightName || "Assigned flight")}</b><p>${escapeHtml(dateTime(session.startAt))} – ${escapeHtml(dateTime(session.endAt))}</p></div><span class="tag ${completed ? "blue" : ended ? "amber" : "blue"}">${completed ? "COMPLETED" : ended ? "READY TO FINISH" : "TODAY · UPCOMING"}</span></div>${finalAttendance}${finishControl}</article>`;
  }).join("") || "<p class='note'>No game is scheduled for your flight today.</p>";

  return `<div class="page-head"><div><span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span><h2>Session Control</h2><p>Today’s scheduled game appears here. Finish it using the actual shuttlecocks used; charges are divided only among final PRESENT attendees.</p></div></div>
  <section class="card"><h3>Today’s game session</h3>${sessionCards}<div id="flightGameResult"></div></section>
  <section class="card"><h3>Pending Cash / Benefit confirmation</h3>${(finance.pendingPayments || []).map(payment => `<div class="session"><div class="grow"><b>${escapeHtml(payment.memberName || payment.memberUid)}</b><p>Payment ID: <b>${escapeHtml(payment.paymentCode || payment.id)}</b> · ${escapeHtml(payment.method)} · ${escapeHtml(payment.reference || "No reference")} · ${escapeHtml(dateLabel(payment.submittedAt))}</p></div><strong>${bhd(payment.amountFils)}</strong><button class="primary" data-flight-verify="${escapeHtml(payment.id)}">Verify</button></div>`).join("") || "<p class='note'>No Cash or Benefit settlement is awaiting confirmation for your flight.</p>"}</section>
  <section class="card"><div class="page-head"><div><h3>Paid Players</h3><p class="note">Use the short WhatsApp confirmation button only when needed.</p></div><button class="pill" data-flight-print>Print paid list</button></div>${rows(finance.paid || [], "No paid Player records.", { confirmation: true })}</section>
  <section class="card"><div class="page-head"><div><h3>Unpaid Players</h3><p class="note">Send a controlled WhatsApp reminder when appropriate.</p></div><button class="pill" data-flight-print>Print unpaid list</button></div>${rows(finance.unpaid || [], "No unpaid Player records.", { due: true, reminder: true })}</section>`;
}

export async function flightAdminShuttleStockView() {
  if (!isOperationalAdmin()) return onlyFlightAdmin("Shuttle Stock");

  const stockRows = await api("/inventory/mine");
  const stock = stockRows[0] || {};

  return `<div class="page-head"><div><span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span><h2>Shuttle Stock</h2><p>Set physical tube price and stock only for your assigned level.</p></div></div>
  <div class="grid metrics"><article class="card metric"><span>Available tubes</span><b>${Number(stock.availableTubes || 0)}</b></article><article class="card metric"><span>Loose shuttlecocks</span><b>${Number(stock.looseShuttles || 0)}</b></article><article class="card metric"><span>Total available</span><b>${Number(stock.totalAvailableShuttles || 0)}</b></article><article class="card metric"><span>Tube price</span><b>${bhd(stock.tubePriceFils)}</b></article></div>
  <section class="card"><h3>Stock settings</h3><p class="note">Tube quantity and shuttles per tube are fixed settings. Use the small edit controls when the physical stock is officially updated; game completion automatically reduces remaining stock.</p><div class="grid two"><div class="field"><label for="stockTubePrice">Tube price in BHD</label><input id="stockTubePrice" type="number" min="0.001" step="0.001" value="${Number(stock.tubePriceFils || 0) ? (Number(stock.tubePriceFils) / 1000).toFixed(3) : ""}" /></div><div class="field"><label for="stockPerTube">Shuttles per tube</label><input id="stockPerTube" type="number" min="1" step="1" value="${escapeHtml(stock.shuttlesPerTube || "")}" /></div><div class="field"><label for="stockTubes">Tube quantity</label><input id="stockTubes" type="number" min="0" step="1" value="${escapeHtml(stock.availableTubes || 0)}" /></div><div class="field"><label>Loose shuttles remaining</label><b>${Number(stock.looseShuttles || 0)}</b></div></div><button id="saveFlightStock" class="primary">Edit and save stock settings</button></section>`;
}

export async function flightAdminReportsView() {
  if (!isOperationalAdmin()) return onlyFlightAdmin("Reports & Sheets Export");

  const financeQuery = state.member.role === "SUPER_ADMIN" && state.member.flightId ? `?flightId=${encodeURIComponent(state.member.flightId)}` : "";
  const finance = await api(`/finance/overview${financeQuery}`);
  window.__indianClubFlightReportRows = [...(finance.paid || []), ...(finance.unpaid || [])];

  return `<div class="page-head"><div><span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span><h2>Reports & Sheets Export</h2><p>Print or download only your assigned flight’s records.</p></div></div>
  <section class="card"><div class="actions"><button class="primary" data-flight-print>Print report</button><button id="exportFlightCsv" class="pill">Download CSV</button></div></section>
  <section class="card"><h3>Paid Players</h3>${rows(finance.paid || [], "No paid Player records.")}</section>
  <section class="card"><h3>Unpaid Players</h3>${rows(finance.unpaid || [], "No unpaid Player records.", { due: true })}</section>`;
}

export function bindFlightAdminViews() {
  document.querySelectorAll("[data-session-attendance]").forEach(button => button.onclick = async () => {
    const status = button.dataset.sessionAttendance;
    const memberUid = button.dataset.memberUid;
    const sessionId = button.dataset.sessionId;
    const reason = window.prompt(`Enter the required reason for marking this member ${String(status || "").toLowerCase()}:`);
    if (!reason || !reason.trim()) return;
    try {
      await api(`/attendance/session/${encodeURIComponent(sessionId)}/correct`, {
        method: "POST",
        body: { memberUid, status, reason: reason.trim() }
      });
      notify(`Final attendance updated to ${status}.`);
      refresh();
    } catch (error) { notify(error.message); }
  });

  document.querySelectorAll("[data-complete-flight-game]").forEach(button => button.onclick = async () => {
    try {
      const sessionId = button.dataset.completeFlightGame;
      const actualShuttlesUsed = Number(document.getElementById(`actualShuttlesUsed-${sessionId}`).value);
      if (!sessionId) throw new Error("Today’s game session is unavailable.");
      if (!Number.isInteger(actualShuttlesUsed) || actualShuttlesUsed < 0) throw new Error("Enter a whole number of shuttlecocks used.");
      const result = await api(`/finance/session/${encodeURIComponent(sessionId)}/complete`, { method: "POST", body: { actualShuttlesUsed } });
      const chargeRows = (result.charges || []).map(charge => `<tr><td>${escapeHtml(charge.memberName || charge.memberUid)}</td><td>${bhd(charge.amountFils)}</td></tr>`).join("");
      const target = document.getElementById("flightGameResult");
      if (target) target.innerHTML = `<section class="card"><h3>Game charges created</h3><p><b>Total game cost:</b> ${bhd(result.totalDayCostFils)} · <b>PRESENT attendees:</b> ${Number(result.attendeeCount || 0)} · <b>Shuttles used:</b> ${Number(result.actualShuttlesUsed || actualShuttlesUsed)} · <b>Remaining:</b> ${Number(result.remainingShuttles || 0)}</p><table class="schedule"><thead><tr><th>Player</th><th>Amount payable</th></tr></thead><tbody>${chargeRows || "<tr><td colspan='2'>No final PRESENT attendees.</td></tr>"}</tbody></table></section>`;
      notify("Game completed. Player charges were created.");
      button.disabled = true;
    } catch (error) { notify(error.message); }
  });

  document.querySelectorAll("[data-flight-verify]").forEach(button => button.onclick = async () => {
    try {
      await api(`/finance/payments/${encodeURIComponent(button.dataset.flightVerify)}/verify`, { method: "POST" });
      notify("Cash / Benefit payment confirmed.");
      refresh();
    } catch (error) { notify(error.message); }
  });

  document.querySelectorAll("[data-flight-reminder-phone]").forEach(button => button.onclick = () => {
    const phone = String(button.dataset.flightReminderPhone || "").replace(/\D/g, "");
    if (!phone) return notify("This Player has no phone number saved.");
    const message = encodeURIComponent(`Hello ${button.dataset.flightReminderName}, your Indian Club Bahrain shuttlecock charge of ${button.dataset.flightReminderAmount} is unpaid. Please pay using wallet credit, Cash, or Benefit. Thank you.`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener");
  });

  document.querySelectorAll("[data-flight-paid-phone]").forEach(button => button.onclick = () => {
    const phone = String(button.dataset.flightPaidPhone || "").replace(/\D/g, "");
    if (!phone) return notify("This Player has no phone number saved.");
    const message = encodeURIComponent(`Hello ${button.dataset.flightPaidName}, your Indian Club Bahrain shuttlecock payment of ${button.dataset.flightPaidAmount} for ${button.dataset.flightPaidDate} is recorded as paid. Thank you.`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener");
  });

  document.querySelectorAll("[data-flight-print]").forEach(button => button.onclick = () => window.print());

  const saveStock = document.getElementById("saveFlightStock");
  if (saveStock) saveStock.onclick = async () => {
    try {
      const flightId = state.member?.flightId;
      if (!flightId) throw new Error("Your account has no assigned flight.");
      await api(`/inventory/${encodeURIComponent(flightId)}/config`, {
        method: "PUT",
        body: {
          tubePriceFils: Math.round(Number(document.getElementById("stockTubePrice").value) * 1000),
          shuttlesPerTube: Number(document.getElementById("stockPerTube").value),
          availableTubes: Number(document.getElementById("stockTubes").value)
        }
      });
      notify("Shuttle stock configuration saved.");
      refresh();
    } catch (error) { notify(error.message); }
  };


  const exportCsv = document.getElementById("exportFlightCsv");
  if (exportCsv) exportCsv.onclick = () => {
    const rows = window.__indianClubFlightReportRows || [];
    const header = ["Player", "Member ID", "Flight", "Date", "Amount BHD", "Status"];
    const values = rows.map(row => [
      row.memberName || row.memberUid,
      row.memberId || "",
      row.flightName || "",
      dateLabel(row.paidAt || row.createdAt || row.dueAt),
      (Number(row.amountDueFils || row.totalChargeFils || 0) / 1000).toFixed(3),
      row.status || ""
    ]);
    const csv = [header, ...values]
      .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "indian-club-flight-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
}
