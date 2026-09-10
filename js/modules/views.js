import { api, submitBusinessUpdateRequest, updateMyCredentials, uploadProfilePhoto, deleteProfilePhoto } from "./auth.js";
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
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

const dateTime = value => {
  const date = clubDate(value);
  return date ? date.toLocaleString("en-BH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bahrain" }) : "Not scheduled";
};

function attendanceBadge(status) {
  const safe = String(status || "NO_RESPONSE").toUpperCase();
  const classes = safe === "PRESENT" ? "blue" : safe === "ABSENT" ? "red" : "amber";
  return `<span class="tag ${classes}">${escapeHtml(safe.replaceAll("_", " "))}</span>`;
}

function notify(message) {
  window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: message }));
}

export async function playerDashboard(member = state.member) {
  const signedInMember = member && typeof member === "object" ? member : {};
  const [dashboardData, personalSessions, walletData] = await Promise.all([
    api("/members/dashboard").catch(() => ({})),
    api("/timetable/mine").catch(() => []),
    api("/finance/mine").catch(() => ({}))
  ]);
  
  const balanceFils = Number(walletData.balanceFils ?? dashboardData.walletFils ?? signedInMember.walletBalanceFils ?? 0);
  const safeSessions = Array.isArray(personalSessions) ? personalSessions : [];
  const nextSession = safeSessions.find(s => s.status === "SCHEDULED") || null;

  return `
    <div class="page-head">
      <div>
        <h2>Welcome, ${escapeHtml(signedInMember.fullName || "Member")}</h2>
        <p>${escapeHtml(signedInMember.flightName || "Your level will be assigned by Super Admin.")}</p>
      </div>
    </div>

    <div class="grid metrics">
      <article class="card metric"><span>Sessions attended</span><b>${Number(dashboardData.attendedCount || 0)}</b><i>Recorded sessions</i></article>
      <article class="card metric"><span>Pending amount</span><b>${bhd(dashboardData.pendingFils || walletData.unpaidFils || 0)}</b><i>Cash / Benefit pending</i></article>
      <article class="card metric"><span>Arrears</span><b>${bhd(dashboardData.arrearsFils || walletData.arrearsFils || 0)}</b><i>Due after 24 hours</i></article>
    </div>

    <div class="grid two">
      <article class="card wallet">
        <span>Available Wallet Credit</span>
        <div class="balance">${bhd(balanceFils)}</div>
        <p>Synced live with Wallet & Payments tab.</p>
      </article>

      <article class="card">
        <h3>Upcoming Session & Quick Attendance</h3>
        ${nextSession ? `
          <div class="session">
            <div class="grow">
              <b>${escapeHtml(nextSession.flightName)}</b>
              <p>${dateTime(nextSession.startAt)}</p>
            </div>
            <div class="actions">
              <button class="primary" data-home-attendance="PRESENT" data-session-id="${escapeHtml(nextSession.id)}">I am coming</button>
              <button class="pill" data-home-attendance="ABSENT" data-session-id="${escapeHtml(nextSession.id)}">Not coming</button>
            </div>
          </div>
        ` : "<p class='note'>No upcoming game session published for your flight.</p>"}
      </article>
    </div>`;
}

export async function playerTimetable() {
  const slots = await api("/timetable/club").catch(() => api("/timetable/mine")).catch(() => []);
  return `<div class="page-head"><div><h2>Club Timetable</h2><p>Weekly group schedule.</p></div></div><section class="card"><div class="table-wrap"><table class="schedule"><thead><tr><th>Day</th><th>Level</th><th>Time</th><th>Courts</th></tr></thead><tbody>${(slots || []).map(s => `<tr><td>${escapeHtml(s.weekday)}</td><td><b>${escapeHtml(s.flightName)}</b></td><td>${escapeHtml(s.startTime)} - ${escapeHtml(s.endTime)}</td><td>Courts 1 & 2</td></tr>`).join('') || "<tr><td colspan='4'>No active timetable published.</td></tr>"}</tbody></table></div></section>`;
}

export async function attendanceView(sessionId) {
  const session = await api(`/attendance/session/${encodeURIComponent(sessionId)}`).catch(() => ({ roster: [], myAttendance: "NO_RESPONSE" }));
  const myStatus = session.myAttendance || "NO_RESPONSE";
  
  // Show ONLY members who clicked PRESENT
  const comingRoster = (session.roster || []).filter(p => p.status === "PRESENT");

  return `
    <div class="page-head">
      <div><h2>Attendance</h2><p>Update your personal attendance status for upcoming games.</p></div>
    </div>
    <section class="card">
      <h3>Your Personal Status (${escapeHtml(state.member?.fullName || 'User')}): <span class="tag ${myStatus === 'PRESENT' ? 'blue' : myStatus === 'ABSENT' ? 'red' : 'amber'}">${escapeHtml(myStatus)}</span></h3>
      <div class="actions" style="margin-top:10px;">
        <button class="primary" data-attendance="PRESENT" data-session-id="${escapeHtml(sessionId)}">I am coming (Present)</button>
        <button class="pill" data-attendance="ABSENT" data-session-id="${escapeHtml(sessionId)}">I am not coming (Absent)</button>
      </div>
    </section>
    <section class="card">
      <h3>Players coming for this game (${comingRoster.length})</h3>
      <p class="note">Only members who explicitly responded "I am coming" appear in this list.</p>
      ${comingRoster.map(person => `
        <div class="session">
          <div class="avatar">${escapeHtml((person.fullName || "M").split(" ").map(w => w[0]).join("").slice(0, 2))}</div>
          <div class="grow"><b>${escapeHtml(person.fullName)}</b><p>${escapeHtml(person.memberId || "")}</p></div>
          <span class="tag blue">PRESENT</span>
        </div>`).join("") || "<p class='note'>No members have responded 'I am coming' yet.</p>"}
    </section>`;
}

export async function playerActivityLog() {
  const log = await api("/members/activity-log").catch(() => ({ gameDays: [], attendance: [], charges: [], payments: [] }));
  return `<div class="page-head"><div><h2>Activity Logs</h2></div></div><section class="card"><p class="note">Log history recorded for your account.</p></section>`;
}

export async function walletView() {
  const data = await api("/finance/mine").catch(() => ({ balanceFils: 0, charges: [], payments: [] }));
  return `<div class="page-head"><div><h2>Wallet & Payments</h2></div></div><div class="card wallet"><span>Available Credit</span><div class="balance">${bhd(data.balanceFils)}</div></div>`;
}

export async function credentialsView() {
  const member = await api("/members/me").catch(() => ({}));
  return `<div class="page-head"><div><h2>Update Credentials</h2></div></div><section class="card"><div class="field"><label>Full Name</label><input id="credentialFullName" value="${escapeHtml(member.fullName || '')}" /></div><button id="saveCredentials" class="primary">Save Credentials</button></section>`;
}

export async function publicIndiMart() {
  return `<div class="page-head"><div><h2>BaZaar</h2></div></div><section class="card"><p class="note">Community Directory.</p></section>`;
}

export function businessSubmissionForm() { return ""; }

export function bindBusinessSubmission() {
  document.querySelectorAll("[data-attendance], [data-home-attendance]").forEach(button => button.onclick = async () => {
    try {
      const status = button.dataset.attendance || button.dataset.homeAttendance;
      await api("/attendance/respond", { method: "POST", body: { sessionId: button.dataset.sessionId, status } });
      notify("Attendance updated.");
      window.dispatchEvent(new CustomEvent("indianclub:render"));
    } catch (err) { notify(err.message); }
  });
}

window.views = {
  home: playerDashboard,
  timetable: playerTimetable,
  attendance: attendanceView,
  logs: playerActivityLog,
  wallet: walletView,
  profile: credentialsView,
  community: publicIndiMart
};
