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
function isOperationalAdmin() { return state.member?.role === "LEVEL_ADMIN" && Boolean(state.member?.flightId); }

export async function flightAdminSessionControlView() {
  if (!isOperationalAdmin()) return `<section class="card"><h2>Session Control</h2><p class="note">Only delegated Flight Admins can access operational controls.</p></section>`;

  const [sessions, finance, inventoryRows, flightRoster] = await Promise.all([
    api("/timetable/mine"),
    api("/finance/overview"),
    api("/inventory/mine"),
    api("/members/assigned-flight")
  ]);

  const stock = inventoryRows[0] || {};
  const roster = Array.isArray(flightRoster) ? flightRoster : [];
  const todaySessions = sessions || [];

  const sessionCards = todaySessions.map(session => {
    const completed = session.status === "COMPLETED";
    const presentPlayers = roster.filter(p => p.status === "PRESENT");
    const presentCount = presentPlayers.length;

    // Admin Self-Attendance Row
    const adminSelf = roster.find(p => p.uid === state.member.id);
    const adminSelfStatus = adminSelf ? adminSelf.status : "NO_RESPONSE";

    const adminSelfMarkup = `
      <div class="card" style="background:#eff6ff; border:1px solid #bfdbfe; margin-bottom:10px; padding:10px;">
        <div class="page-head" style="margin:0;">
          <div>
            <b>Your Personal Attendance (Flight Admin)</b>
            <p class="note">Status: <b>${escapeHtml(adminSelfStatus)}</b></p>
          </div>
          <div class="actions">
            <button class="pill ${adminSelfStatus === 'PRESENT' ? 'primary' : ''}" data-self-attendance="PRESENT" data-session-id="${escapeHtml(session.id)}">I'm Playing (Present)</button>
            <button class="pill ${adminSelfStatus === 'ABSENT' ? 'danger-action' : ''}" data-self-attendance="ABSENT" data-session-id="${escapeHtml(session.id)}">Not Playing (Absent)</button>
          </div>
        </div>
      </div>`;

    const otherRosterRows = roster.filter(p => p.uid !== state.member.id).map((person, index) => `
      <div class="session">
        <b>${index + 1}.</b>
        <div class="grow"><b>${escapeHtml(person.fullName)}</b></div>
        <span class="tag ${person.status === "PRESENT" ? "blue" : person.status === "ABSENT" ? "red" : "amber"}">${escapeHtml(person.status || "NO_RESPONSE")}</span>
        <div class="actions">
          <button class="pill" data-session-attendance="PRESENT" data-session-id="${escapeHtml(session.id)}" data-member-uid="${escapeHtml(person.uid)}">Present</button>
          <button class="pill" data-session-attendance="ABSENT" data-session-id="${escapeHtml(session.id)}" data-member-uid="${escapeHtml(person.uid)}">Absent</button>
        </div>
      </div>`).join("") || "<p class='note'>No other players in flight roster.</p>";

    return `
      <article class="card">
        <div class="page-head">
          <div><h3>${escapeHtml(session.flightName || state.member.flightName)}</h3><p>${dateTime(session.startAt)}</p></div>
          <span class="tag ${completed ? "blue" : "amber"}">${completed ? "COMPLETED" : "SCHEDULED"}</span>
        </div>
        ${adminSelfMarkup}
        <h4>Flight Roster Overrides</h4>
        ${otherRosterRows}
        <div class="grid two" style="margin-top:12px;">
          <div class="field"><label for="shuttlesUsed-${escapeHtml(session.id)}">Shuttlecocks Used</label><input id="shuttlesUsed-${escapeHtml(session.id)}" type="number" min="0" value="${session.actualShuttlesUsed || 0}" /></div>
          <div class="field"><label>PRESENT Attendees to Charge</label><div class="session"><b>${presentCount} Present (Equal Split)</b></div></div>
        </div>
        <button class="primary" data-complete-flight-game="${escapeHtml(session.id)}" ${completed ? "disabled" : ""}>Complete Game, Deduct Stock & Charge Present Players</button>
      </article>`;
  }).join("") || "<p class='note'>No sessions scheduled today.</p>";

  return `<div class="page-head"><div><span class="tag blue">FLIGHT ADMIN</span><h2>Session Control</h2></div></div><section class="card">${sessionCards}</section>`;
}

export async function flightAdminShuttleStockView() {
  if (!isOperationalAdmin()) return `<section class="card"><h2>Shuttle Stock</h2><p class="note">Flight Admin access required.</p></section>`;
  const stockRows = await api("/inventory/mine");
  const stock = stockRows[0] || {};
  return `<div class="page-head"><div><span class="tag blue">FLIGHT ADMIN</span><h2>Shuttle Stock</h2></div></div><div class="grid metrics"><article class="card metric"><span>Available Tubes</span><b>${Number(stock.availableTubes || 0)}</b></article><article class="card metric"><span>Loose Shuttles</span><b>${Number(stock.looseShuttles || 0)}</b></article><article class="card metric"><span>Tube Price</span><b>${bhd(stock.tubePriceFils)}</b></article></div>`;
}

export async function flightAdminReportsView() {
  const finance = await api("/finance/overview");
  return `<div class="page-head"><div><h2>Reports</h2></div></div><section class="card"><p class="note">Flight Admin financial report.</p></section>`;
}

export function bindFlightAdminViews() {
  document.querySelectorAll("[data-self-attendance]").forEach(button => button.onclick = async () => {
    try {
      const status = button.dataset.selfAttendance;
      const sessionId = button.dataset.sessionId;
      await api("/attendance/respond", { method: "POST", body: { sessionId, status } });
      notify(`Your attendance marked ${status}.`);
      refresh();
    } catch (err) { notify(err.message); }
  });

  document.querySelectorAll("[data-session-attendance]").forEach(button => button.onclick = async () => {
    try {
      const status = button.dataset.sessionAttendance;
      const memberUid = button.dataset.memberUid;
      const sessionId = button.dataset.sessionId;
      const reason = window.prompt("Reason for manual attendance override:") || "Admin Override";
      await api(`/attendance/session/${encodeURIComponent(sessionId)}/correct`, { method: "POST", body: { memberUid, status, reason } });
      notify(`Player status updated to ${status}.`);
      refresh();
    } catch (err) { notify(err.message); }
  });

  document.querySelectorAll("[data-complete-flight-game]").forEach(button => button.onclick = async () => {
    try {
      const sessionId = button.dataset.completeFlightGame;
      const actualShuttlesUsed = Number(document.getElementById(`shuttlesUsed-${sessionId}`)?.value || 0);
      const result = await api(`/finance/session/${encodeURIComponent(sessionId)}/complete`, { method: "POST", body: { actualShuttlesUsed } });
      notify("Game completed! Stock deducted & equal shares charged to PRESENT players.");
      refresh();
    } catch (err) { notify(err.message); }
  });
}
