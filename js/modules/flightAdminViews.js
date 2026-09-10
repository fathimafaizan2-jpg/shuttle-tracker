import { api } from "./auth.js";
import { state } from "../router.js";

const escapeHtml = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const bhd = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;

function dateLabel(value) {
  const date = value?._seconds ? new Date(Number(value._seconds) * 1000) : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString("en-BH", { dateStyle: "medium" }) : "—";
}

function dateTime(value) {
  const date = value?._seconds ? new Date(Number(value._seconds) * 1000) : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString("en-BH", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

function notify(message) { window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: message })); }
function refresh() { window.dispatchEvent(new CustomEvent("indianclub:render")); }
function isOperationalAdmin() { return (state.member?.role === "LEVEL_ADMIN" || state.member?.role === "SUPER_ADMIN") && Boolean(state.member?.flightId || state.member?.role === "SUPER_ADMIN"); }

export async function flightAdminSessionControlView() {
  const flightId = state.member?.flightId;
  const [sessions, finance, inventoryRows, flightRoster] = await Promise.all([
    api("/timetable/mine").catch(() => []),
    api("/finance/overview").catch(() => ({ pendingPayments: [] })),
    api("/inventory/mine").catch(() => [{}]),
    api("/members/assigned-flight").catch(() => [])
  ]);

  const stock = inventoryRows[0] || {};
  const roster = Array.isArray(flightRoster) ? flightRoster : [];
  const todaySessions = Array.isArray(sessions) ? sessions : [];

  const sessionCards = todaySessions.map(session => {
    const completed = session.status === "COMPLETED";
    
    // Filter strictly for Present Players
    const presentPlayers = roster.filter(p => p.status === "PRESENT");
    const presentCount = presentPlayers.length;

    // Dropdown for non-present players to manually add them if they showed up
    const nonAttendingRoster = roster.filter(p => p.status !== "PRESENT");

    const addMemberDropdown = `
      <div class="field" style="margin-top:10px;">
        <label>Add Player to Active Roster (Marked Absent/No Response but Attended)</label>
        <div class="actions">
          <select id="addMemberSelect-${escapeHtml(session.id)}">
            <option value="">Select player to add...</option>
            ${nonAttendingRoster.map(p => `<option value="${escapeHtml(p.uid)}">${escapeHtml(p.fullName)} (${escapeHtml(p.memberId || 'No ID')})</option>`).join('')}
          </select>
          <button class="pill" data-add-member-to-session="${escapeHtml(session.id)}">Add to Present List</button>
        </div>
      </div>`;

    const presentRosterRows = presentPlayers.map((person, index) => `
      <div class="session">
        <b>${index + 1}.</b>
        <div class="grow">
          <b>${escapeHtml(person.fullName)}</b> 
          <small>${person.uid === state.member.id ? '(Admin / You)' : ''}</small>
        </div>
        <span class="tag blue">PRESENT</span>
        <div class="actions">
          <button class="pill danger-action" data-session-attendance="ABSENT" data-session-id="${escapeHtml(session.id)}" data-member-uid="${escapeHtml(person.uid)}">Remove (Mark Absent)</button>
        </div>
      </div>`).join("") || "<p class='note'>No players currently marked present for this session.</p>";

    return `
      <article class="card">
        <div class="page-head">
          <div><h3>${escapeHtml(session.flightName || state.member.flightName || "Session")}</h3><p>${dateTime(session.startAt)}</p></div>
          <span class="tag ${completed ? "blue" : "amber"}">${completed ? "COMPLETED" : "SCHEDULED"}</span>
        </div>
        
        <h4>Attending Players (${presentCount})</h4>
        <p class="note">Players below will receive an equal split of the total shuttlecock charge upon game completion.</p>
        ${presentRosterRows}
        ${addMemberDropdown}

        <div class="grid two" style="margin-top:14px;">
          <div class="field"><label for="shuttlesUsed-${escapeHtml(session.id)}">Shuttlecocks Used</label><input id="shuttlesUsed-${escapeHtml(session.id)}" type="number" min="0" value="${session.actualShuttlesUsed || 0}" /></div>
          <div class="field"><label>PRESENT Attendees to Charge (Equal Share)</label><div class="session"><b>${presentCount} Present</b></div></div>
        </div>
        <button class="primary" data-complete-flight-game="${escapeHtml(session.id)}">Update Final Attendance & Calculate Charges</button>
      </article>`;
  }).join("") || "<p class='note'>No sessions scheduled today.</p>";

  return `<div class="page-head"><div><span class="tag blue">FLIGHT ADMIN</span><h2>Session Control</h2></div></div><section class="card">${sessionCards}</section>`;
}

export async function flightAdminShuttleStockView() {
  const stockRows = await api("/inventory/mine").catch(() => [{}]);
  const stock = stockRows[0] || {};
  return `<div class="page-head"><div><span class="tag blue">FLIGHT ADMIN</span><h2>Shuttle Stock</h2></div></div>
  <div class="grid metrics"><article class="card metric"><span>Available Tubes</span><b>${Number(stock.availableTubes || 0)}</b></article><article class="card metric"><span>Loose Shuttles</span><b>${Number(stock.looseShuttles || 0)}</b></article><article class="card metric"><span>Tube Price</span><b>${bhd(stock.tubePriceFils)}</b></article></div>
  <section class="card"><h3>Update Stock Settings</h3>
    <div class="grid two">
      <div class="field"><label for="stockTubePrice">Tube Price in BHD</label><input id="stockTubePrice" type="number" step="0.001" value="${Number(stock.tubePriceFils || 0)/1000}" /></div>
      <div class="field"><label for="stockTubes">Available Tubes</label><input id="stockTubes" type="number" value="${Number(stock.availableTubes || 0)}" /></div>
    </div>
    <button id="saveFlightStock" class="primary">Save Stock</button>
  </section>`;
}

export async function flightAdminReportsView() {
  const finance = await api("/finance/overview").catch(() => ({ paid: [], unpaid: [] }));
  const inventoryRows = await api("/inventory/mine").catch(() => [{}]);
  const stock = inventoryRows[0] || {};

  return `<div class="page-head">
    <div><span class="tag blue">FLIGHT ADMIN</span><h2>Reports & Sheets</h2><p>Print or review logs for attendance, shuttle stock, and payments.</p></div>
    <button class="pill" onclick="window.print()">Print Report</button>
  </div>
  <div class="grid metrics">
    <article class="card metric"><span>Available Stock</span><b>${Number(stock.totalAvailableShuttles || 0)} shuttles</b></article>
    <article class="card metric"><span>Paid Players</span><b>${finance.paid?.length || 0}</b></article>
    <article class="card metric"><span>Unpaid Players</span><b>${finance.unpaid?.length || 0}</b></article>
  </div>
  <section class="card">
    <h3>Paid Players Log</h3>
    ${(finance.paid || []).map(p => `<div class="session"><div class="grow"><b>${escapeHtml(p.memberName)}</b><p>Paid ${bhd(p.amountFils || p.totalChargeFils)}</p></div><span class="tag blue">PAID</span></div>`).join('') || "<p class='note'>No paid players recorded.</p>"}
  </section>
  <section class="card">
    <h3>Unpaid Players Log</h3>
    ${(finance.unpaid || []).map(p => `<div class="session"><div class="grow"><b>${escapeHtml(p.memberName)}</b><p>Due ${bhd(p.amountDueFils)}</p></div><span class="tag red">UNPAID</span></div>`).join('') || "<p class='note'>No unpaid players recorded.</p>"}
  </section>`;
}

export function bindFlightAdminViews() {
  document.querySelectorAll("[data-self-attendance]").forEach(button => button.onclick = async () => {
    try {
      const status = button.dataset.selfAttendance;
      const sessionId = button.dataset.sessionId;
      await api("/attendance/respond", { method: "POST", body: { sessionId, status } });
      notify(`Your attendance marked as ${status}.`);
      refresh();
    } catch (err) { notify(err.message); }
  });

  document.querySelectorAll("[data-add-member-to-session]").forEach(button => button.onclick = async () => {
    try {
      const sessionId = button.dataset.addMemberToSession;
      const select = document.getElementById(`addMemberSelect-${sessionId}`);
      const memberUid = select?.value;
      if (!memberUid) throw new Error("Select a player from the dropdown to add.");
      await api(`/attendance/session/${encodeURIComponent(sessionId)}/correct`, {
        method: "POST",
        body: { memberUid, status: "PRESENT", reason: "Flight Admin added player to roster" }
      });
      notify("Player added to present list.");
      refresh();
    } catch (err) { notify(err.message); }
  });

  document.querySelectorAll("[data-session-attendance]").forEach(button => button.onclick = async () => {
    try {
      const status = button.dataset.sessionAttendance;
      const memberUid = button.dataset.memberUid;
      const sessionId = button.dataset.sessionId;
      await api(`/attendance/session/${encodeURIComponent(sessionId)}/correct`, {
        method: "POST",
        body: { memberUid, status, reason: "Flight Admin marked player absent" }
      });
      notify(`Player status updated to ${status}.`);
      refresh();
    } catch (err) { notify(err.message); }
  });

  document.querySelectorAll("[data-complete-flight-game]").forEach(button => button.onclick = async () => {
    try {
      const sessionId = button.dataset.completeFlightGame;
      const actualShuttlesUsed = Number(document.getElementById(`shuttlesUsed-${sessionId}`)?.value || 0);
      const flightId = state.member?.flightId;
      await api(`/finance/session/${encodeURIComponent(sessionId)}/complete`, { 
        method: "POST", 
        body: { actualShuttlesUsed, flightId } 
      });
      notify("Game completed & charges calculated for present players.");
      refresh();
    } catch (err) { notify(err.message); }
  });

  const saveStock = document.getElementById("saveFlightStock");
  if (saveStock) saveStock.onclick = async () => {
    try {
      const flightId = state.member?.flightId;
      await api(`/inventory/${encodeURIComponent(flightId)}/config`, {
        method: "PUT",
        body: {
          tubePriceFils: Math.round(Number(document.getElementById("stockTubePrice").value) * 1000),
          availableTubes: Number(document.getElementById("stockTubes").value)
        }
      });
      notify("Stock settings saved.");
      refresh();
    } catch (err) { notify(err.message); }
  };
}

window.flightAdminViews = {
  sessionControl: flightAdminSessionControlView,
  stock: flightAdminShuttleStockView,
  reports: flightAdminReportsView
};
