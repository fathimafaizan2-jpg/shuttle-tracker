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

function isOperationalAdmin() { return state.member?.role === "LEVEL_ADMIN" && Boolean(state.member?.flightId); }

function onlyFlightAdmin(title) {
  return `<section class="card"><span class="tag amber">FLIGHT ADMIN OPERATION</span><h2>${escapeHtml(title)}</h2><p class="note">Only the Flight Admin delegated to a level can operate this page. Super Admin can view the menu only.</p></section>`;
}

function rows(items, empty, options = {}) {
  if (!items?.length) return `<p class="note">${escapeHtml(empty)}</p>`;
  const due = Boolean(options.due);
  return `<div class="table-wrap"><table class="schedule"><thead><tr><th>Player</th><th>Date</th><th>Amount</th><th>Status / payment ID</th></tr></thead><tbody>${items.map(item => { const amount = bhd(due ? item.amountDueFils : (item.totalChargeFils || item.amountFils)); const paymentCode = item.paymentCode || item.verifiedPaymentId || "—"; return `<tr><td><b>${escapeHtml(item.memberName || item.memberId || item.memberUid)}</b><br><small>${escapeHtml(item.memberId || "")}</small></td><td>${escapeHtml(dateLabel(item.paidAt || item.createdAt || item.dueAt))}</td><td>${amount}</td><td><span class="tag ${String(item.status || "").startsWith("PAID") ? "blue" : item.status === "DUE" ? "red" : "amber"}">${escapeHtml(item.status || "DUE")}</span><br><small>${paymentCode === "—" ? "" : `ID: ${escapeHtml(paymentCode)}`}</small></td></tr>`; }).join("")}</tbody></table></div>`;
}

export async function flightAdminSessionControlView() {
  if (!isOperationalAdmin()) return onlyFlightAdmin("Session Control");

  const financeQuery = state.member.role === "SUPER_ADMIN" && state.member.flightId ? `?flightId=${encodeURIComponent(state.member.flightId)}` : "";
  const [sessions, finance, inventoryRows, flightRoster] = await Promise.all([api("/timetable/mine"), api(`/finance/overview${financeQuery}`), api("/inventory/mine"), state.member.role === "LEVEL_ADMIN" ? api("/members/assigned-flight") : Promise.resolve([])]);
  const stock = inventoryRows[0] || {};
  const noSessionRoster = Array.isArray(flightRoster) ? flightRoster : [];
  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bahrain", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const today = sessions.filter(session => bahrainDateKey(session.startAt) === todayKey).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const attendanceResults = await Promise.all(today.map(async session => {
    try { return [session.id, await api(`/attendance/session/${encodeURIComponent(session.id)}`)]; }
    catch { return [session.id, null]; }
  }));
  const attendanceBySession = new Map(attendanceResults);
  const noSessionRosterRows = noSessionRoster.map((member, index) => `<div class="session"><b>${index + 1}.</b><div class="grow"><b>${escapeHtml(member.fullName || "Player")}</b><p>${escapeHtml(member.phone || member.memberId || "")}</p></div><span class="tag blue">ACTIVE</span></div>`).join("") || "<p class='note'>No active Players are assigned to this flight yet.</p>";
  const emptyTodaySessionCard = `<article class="card"><div class="session"><div class="grow"><b>${escapeHtml(state.member.flightName || "Assigned flight")}</b><p>No game is scheduled today. Operational controls remain available.</p></div><span class="tag amber">NO SESSION TODAY</span></div><section class="card"><div class="page-head"><div><h3>Flight roster</h3><p class="note">Add a Player to your assigned flight even when no game is scheduled. The Player completes registration later using the registered name and phone.</p></div><span class="tag blue">${noSessionRoster.length} ACTIVE</span></div>${noSessionRosterRows}<div class="grid two"><div class="field"><label for="noSessionMemberName">Player registered name</label><input id="noSessionMemberName" placeholder="Name used for registration" /></div><div class="field"><label for="noSessionMemberPhone">Phone / WhatsApp</label><input id="noSessionMemberPhone" placeholder="Phone number" /></div></div><button class="primary" id="addNoSessionMember">Add Player to flight</button></section><section class="card"><h3>Record shuttle usage</h3><p class="note">This records physical usage and updates stock. It does not create Player charges because there is no completed game.</p><div class="grid two"><div class="field"><label for="noSessionShuttlesUsed">Shuttles used</label><input id="noSessionShuttlesUsed" type="number" min="1" step="1" placeholder="Enter number used" /></div><div class="field"><label for="noSessionShuttleNote">Reason / note</label><input id="noSessionShuttleNote" placeholder="Practice or manual stock correction" /></div></div><button class="primary" id="recordNoSessionShuttles">Record shuttle usage</button></section></article>`;
  const sessionCards = today.map(session => {
    const ended = new Date(session.endAt || session.startAt).getTime() <= Date.now();
    const completed = session.status === "COMPLETED";
    const attendance = attendanceBySession.get(session.id);
    const roster = attendance?.roster || [];
    const presentCount = roster.filter(person => person.status === "PRESENT").length;
    const canCorrect = Boolean(attendance?.canCorrect);
    
    // Separate Flight Admin's own attendance row vs other players
    const adminSelfRow = roster.find(person => person.uid === state.member.id);
    const otherPlayersRoster = roster.filter(person => person.uid !== state.member.id);

    const adminSelfMarkup = adminSelfRow ? `
      <div class="card" style="background:#eff6ff; border-color:#bfdbfe; margin-bottom:12px; padding:12px;">
        <div class="page-head" style="margin:0;">
          <div>
            <b>Your Personal Attendance (Admin)</b>
            <p class="note">Status: <b>${escapeHtml(adminSelfRow.status || 'NO_RESPONSE')}</b></p>
          </div>
          <div class="actions">
            <button class="pill ${adminSelfRow.status === 'PRESENT' ? 'primary' : ''}" data-attendance="PRESENT" data-session-id="${escapeHtml(session.id)}">I'm Playing (Present)</button>
            <button class="pill ${adminSelfRow.status === 'ABSENT' ? 'danger-action' : ''}" data-attendance="ABSENT" data-session-id="${escapeHtml(session.id)}">Not Playing (Absent)</button>
          </div>
        </div>
      </div>` : "";

    const rosterRows = otherPlayersRoster.map((person, index) => {
      const isPresent = person.status === "PRESENT";
      const action = canCorrect ? `<button class="${isPresent ? "pill" : "primary"}" data-session-attendance="${isPresent ? "ABSENT" : "PRESENT"}" data-session-id="${escapeHtml(session.id)}" data-member-uid="${escapeHtml(person.uid)}">${isPresent ? "Remove" : "Add"}</button>` : "";
      return `<div class="session"><b>${index + 1}.</b><div class="grow"><b>${escapeHtml(person.fullName || "Member")}</b><p>${escapeHtml(person.memberId || "")}</p></div><span class="tag ${isPresent ? "blue" : person.status === "ABSENT" ? "red" : "amber"}">${escapeHtml(String(person.status || "NO_RESPONSE").replaceAll("_", " "))}</span>${action}</div>`;
    }).join("") || "<p class='note'>No other active members are assigned to this flight.</p>";
    
    const previewDisabled = completed || !presentCount || !Number(stock.tubePriceFils) || !Number(stock.shuttlesPerTube);
    const calculation = completed ? `<div class="grid two"><div class="field"><label for="recalculateShuttles-${escapeHtml(session.id)}">Actual shuttlecocks used</label><input id="recalculateShuttles-${escapeHtml(session.id)}" type="number" min="0" step="1" value="${Number(session.actualShuttlesUsed || 0)}" /></div><div class="field"><label>Amount payable per person (Equal Share)</label><div class="session"><b>${bhd(session.perPlayerCostExactFils || 0)}</b></div></div></div><div class="actions"><button class="primary" data-recalculate-flight-game="${escapeHtml(session.id)}">Recalculate charges</button></div><p class="note">Completed game. Assigned Level Admin may correct shuttle usage; the app restores stock, recalculates equal shares among attendees (including Admin if present), and updates unpaid charges.</p>` : `<div class="grid two"><div class="field"><label for="actualShuttlesUsed-${escapeHtml(session.id)}">No. of shuttlecocks used</label><input id="actualShuttlesUsed-${escapeHtml(session.id)}" data-session-cost-input="${escapeHtml(session.id)}" data-present-count="${presentCount}" data-tube-price-fils="${Number(stock.tubePriceFils || 0)}" data-shuttles-per-tube="${Number(stock.shuttlesPerTube || 0)}" type="number" min="0" step="1" placeholder="Enter number used"  /></div><div class="field"><label>Amount payable per person (Equal Share)</label><div class="session"><b id="perPersonPreview-${escapeHtml(session.id)}">${ended ? "Enter shuttles used" : "Available after game ends"}</b></div><small>Final amount is split equally among ALL PRESENT players (Admin included) and shuttlecocks are deducted from available stock.</small></div></div><button class="primary" data-complete-flight-game="${escapeHtml(session.id)}" ${previewDisabled ? "disabled" : ""}>Update final attendance, deduct stock, and create Player charges</button>`;
    const attendeeSection = `<section class="card"><div class="page-head"><div><h3>No. of players attended</h3><p class="note">Final PRESENT players: <b>${presentCount}</b>. Use Add/Remove for manual player overrides.</p></div><span class="tag ${presentCount ? "blue" : "amber"}">${presentCount} ATTENDED</span></div>${adminSelfMarkup}${rosterRows}${!canCorrect ? "<p class='note'>Administrator corrections are unavailable because this account is not assigned to this flight.</p>" : ""}</section>`;
    return `<article class="card"><div class="session"><div class="grow"><b>${escapeHtml(session.flightName || state.member.flightName || "Assigned flight")}</b><p>${escapeHtml(dateTime(session.startAt))} – ${escapeHtml(dateTime(session.endAt))}</p></div><span class="tag ${completed ? "blue" : ended ? "amber" : "blue"}">${completed ? "COMPLETED" : ended ? "READY TO FINISH" : "TODAY · UPCOMING"}</span></div>${attendeeSection}<section class="card"><h3>Game cost calculation</h3>${calculation}</section></article>`;
  }).join("") || emptyTodaySessionCard;

  window.__indianClubUnpaidReminderRows = finance.unpaid || [];
  return `<div class="page-head"><div><span class="tag blue">FLIGHT ADMIN · ${escapeHtml(state.member.flightName || "Assigned flight")}</span><h2>Session Control</h2><p>Confirm actual attendance, enter shuttlecocks used, then create equal final charges for all present players (including Admin).</p></div></div>
  <section class="card"><h3>Today’s game session</h3>${sessionCards}<div id="flightGameResult"></div></section>
  <section class="card"><h3>Pending Cash / Benefit confirmation</h3>${(finance.pendingPayments || []).map(payment => `<div class="session"><div class="grow"><b>${escapeHtml(payment.memberName || payment.memberUid)}</b><p>Payment ID: <b>${escapeHtml(payment.paymentCode || payment.id)}</b> · ${escapeHtml(payment.method)} · ${escapeHtml(payment.reference || "No reference")} · ${escapeHtml(dateLabel(payment.submittedAt))}</p></div><strong>${bhd(payment.amountFils)}</strong><button class="primary" data-flight-verify="${escapeHtml(payment.id)}">Verify</button></div>`).join("") || "<p class='note'>No Cash or Benefit settlement is awaiting confirmation for your flight.</p>"}</section>
  <div class="grid two"><section id="paidPlayersList" class="card"><div class="page-head"><div><h3>Paid Players</h3><p class="note">Verified Credit and Cash / Benefit settlement records.</p></div><button class="pill" data-flight-print-list="paidPlayersList">Print</button></div>${rows(finance.paid || [], "No paid Player records.")}</section>
  <section id="unpaidPlayersList" class="card"><div class="page-head"><div><h3>Unpaid Players</h3><p class="note">Send one combined reminder for all currently unpaid Players.</p></div><div class="actions"><button class="pill" data-flight-print-list="unpaidPlayersList">Print</button><button class="primary" data-unpaid-reminder ${finance.unpaid?.length ? "" : "disabled"}>WhatsApp all unpaid</button></div></div>${rows(finance.unpaid || [], "No unpaid Player records.", { due: true })}</section></div>`;
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
  document.querySelectorAll("[data-session-cost-input]").forEach(input => input.oninput = () => {
    const sessionId = input.dataset.sessionCostInput;
    const used = Number(input.value);
    const presentCount = Number(input.dataset.presentCount || 0);
    const tubePriceFils = Number(input.dataset.tubePriceFils || 0);
    const shuttlesPerTube = Number(input.dataset.shuttlesPerTube || 0);
    const target = document.getElementById(`perPersonPreview-${sessionId}`);
    if (!target) return;
    if (!Number.isInteger(used) || used < 0) { target.textContent = "Enter whole shuttlecock number"; return; }
    if (!presentCount || !tubePriceFils || !shuttlesPerTube) { target.textContent = "Set final attendees and stock first"; return; }
    const totalDayCostFils = Math.ceil((used * tubePriceFils) / shuttlesPerTube);
    const baseFils = Math.floor(totalDayCostFils / presentCount);
    const remainderFils = totalDayCostFils % presentCount;
    target.textContent = remainderFils ? `${bhd(baseFils)} or ${bhd(baseFils + 1)}*` : bhd(baseFils);
    target.title = remainderFils ? `* ${remainderFils} attendee(s) receive one extra fil so the total stays exact.` : "";
  });

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

  document.querySelectorAll("[data-recalculate-flight-game]").forEach(button => button.onclick = async () => {
    try {
      const sessionId = button.dataset.recalculateFlightGame;
      const actualShuttlesUsed = Number(document.getElementById(`recalculateShuttles-${sessionId}`).value);
      if (!Number.isInteger(actualShuttlesUsed) || actualShuttlesUsed < 0) throw new Error("Enter a whole number of shuttlecocks used.");
      if (!window.confirm("Recalculate this completed game, deduct shuttles from stock, and update player charges?")) return;
      const result = await api(`/finance/session/${encodeURIComponent(sessionId)}/recalculate`, { method: "POST", body: { actualShuttlesUsed }, confirm: false });
      notify(`Completed game recalculated. New total: ${bhd(result.totalDayCostFils)}.`);
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
      if (target) target.innerHTML = `<section class="card"><h3>Game charges created (Equal Shares)</h3><p><b>Total game cost:</b> ${bhd(result.totalDayCostFils)} · <b>PRESENT attendees (incl. Admin):</b> ${Number(result.attendeeCount || 0)} · <b>Shuttles used:</b> ${Number(result.actualShuttlesUsed || actualShuttlesUsed)} · <b>Stock remaining:</b> ${Number(result.remainingShuttles || 0)}</p><table class="schedule"><thead><tr><th>Player</th><th>Amount payable</th></tr></thead><tbody>${chargeRows || "<tr><td colspan='2'>No final PRESENT attendees.</td></tr>"}</tbody></table></section>`;
      notify("Game completed. Stock deducted & equal Player charges created.");
      button.disabled = true;
      refresh();
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

  document.querySelectorAll("[data-flight-print-list]").forEach(button => button.onclick = () => {
    const section = document.getElementById(button.dataset.flightPrintList);
    if (!section) return;
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) return notify("Allow pop-ups to print this list.");
    printWindow.document.write(`<!doctype html><html><head><title>Indian Club Bahrain payment list</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#172554}.card{border:1px solid #cbd5e1;border-radius:12px;padding:20px}.page-head,.actions{display:flex;justify-content:space-between;gap:12px}.schedule{width:100%;border-collapse:collapse;margin-top:16px}.schedule th,.schedule td{border:1px solid #cbd5e1;padding:9px;text-align:left}.tag{font-size:12px;font-weight:700}button{display:none}</style></head><body>${section.outerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  });

  document.querySelectorAll("[data-unpaid-reminder]").forEach(button => button.onclick = () => {
    const unpaid = window.__indianClubUnpaidReminderRows || [];
    if (!unpaid.length) return notify("There are no unpaid Players to remind.");
    const lines = unpaid.slice(0, 35).map((row, index) => `${index + 1}. ${row.memberName || row.memberId || "Member"} — ${bhd(row.amountDueFils || 0)}`);
    const extra = unpaid.length > lines.length ? `\n+ ${unpaid.length - lines.length} more unpaid Player(s).` : "";
    const message = `Indian Club Bahrain payment reminder\n\nThe following shuttlecock charges are unpaid:\n${lines.join("\n")}${extra}\n\nPlease pay through Wallet Credit, Cash, or Benefit. Thank you.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  });

  const addNoSessionMember = document.getElementById("addNoSessionMember");
  if (addNoSessionMember) addNoSessionMember.onclick = async () => {
    try {
      const registeredName = document.getElementById("noSessionMemberName")?.value.trim();
      const phone = document.getElementById("noSessionMemberPhone")?.value.trim();
      if (!registeredName || !phone) throw new Error("Enter the Player name and phone number.");
      const result = await api("/members/assigned-flight/pre-register", { method: "POST", body: { registeredName, phone }, confirm: true, confirmTitle: "Add Player to flight?", confirmMessage: "The Player will be pre-registered for your assigned flight." });
      notify(`Player added. Reference: ${result.id}`);
      refresh();
    } catch (error) { notify(error.message); }
  };
  const recordNoSessionShuttles = document.getElementById("recordNoSessionShuttles");
  if (recordNoSessionShuttles) recordNoSessionShuttles.onclick = async () => {
    try {
      const flightId = state.member?.flightId;
      const usedShuttles = Number(document.getElementById("noSessionShuttlesUsed")?.value);
      const note = document.getElementById("noSessionShuttleNote")?.value.trim();
      if (!flightId) throw new Error("Your account has no assigned flight.");
      if (!Number.isInteger(usedShuttles) || usedShuttles < 1) throw new Error("Enter a whole number of shuttles used.");
      await api(`/inventory/${encodeURIComponent(flightId)}/usage`, { method: "POST", body: { usedShuttles, note }, confirm: true, confirmTitle: "Record shuttle usage?", confirmMessage: "This updates stock only and does not create Player charges." });
      notify("Shuttle usage recorded and stock updated.");
      refresh();
    } catch (error) { notify(error.message); }
  };
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
