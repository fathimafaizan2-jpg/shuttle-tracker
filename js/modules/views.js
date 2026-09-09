import { api, submitBusinessUpdateRequest, updateMyCredentials, uploadProfilePhoto, deleteProfilePhoto } from "./auth.js";
import { state } from "../router.js";

const escapeHtml = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const bhd = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;

export async function playerDashboard(member = state.member) {
  const signedInMember = member && typeof member === "object" ? member : {};
  const [dashboardData, personalSessions, walletData] = await Promise.all([
    api("/members/dashboard").catch(() => ({})),
    api("/timetable/mine").catch(() => []),
    api("/finance/mine").catch(() => ({}))
  ]);
  
  const data = {
    walletFils: Number(dashboardData.walletFils ?? walletData.balanceFils ?? signedInMember.walletBalanceFils ?? 0),
    attendedCount: Number(dashboardData.attendedCount ?? 0),
    pendingFils: Number(dashboardData.pendingFils ?? walletData.unpaidFils ?? 0),
    arrearsFils: Number(dashboardData.arrearsFils ?? walletData.arrearsFils ?? 0)
  };

  return `
    <div class="page-head">
      <div>
        <h2>Welcome, ${escapeHtml(signedInMember.fullName || "Member")}</h2>
        <p>${escapeHtml(signedInMember.flightName || "Your level will be assigned by Super Admin.")}</p>
      </div>
    </div>

    <div class="grid metrics">
      <article class="card metric"><span>Sessions attended</span><b>${Number(data.attendedCount)}</b><i>All recorded sessions</i></article>
      <article class="card metric"><span>Pending amount</span><b>${bhd(data.pendingFils)}</b><i>Cash / Benefit pending</i></article>
      <article class="card metric"><span>Arrears</span><b>${bhd(data.arrearsFils)}</b><i>Due after 24 hours</i></article>
    </div>

    <div class="grid two">
      <article class="card wallet">
        <span>Available Wallet Credit</span>
        <div class="balance">${bhd(data.walletFils)}</div>
        <p>Synced live with Wallet & Payments tab.</p>
      </article>
      <article class="card">
        <h3>Upcoming Session</h3>
        <p class="note">Check My Timetable or Attendance tab for your level schedule.</p>
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
      <h3>Players Responded</h3>
      ${(session.roster || []).map(p => `<div class="session"><div class="grow"><b>${escapeHtml(p.fullName)}</b></div><span class="tag ${p.status === 'PRESENT' ? 'blue' : 'amber'}">${escapeHtml(p.status)}</span></div>`).join('') || "<p class='note'>No responses recorded yet.</p>"}
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
  const member = await api("/members/me");
  return `<div class="page-head"><div><h2>Update Credentials</h2></div></div><section class="card"><div class="field"><label>Full Name</label><input id="credentialFullName" value="${escapeHtml(member.fullName || '')}" /></div><button id="saveCredentials" class="primary">Save Credentials</button></section>`;
}

export async function publicIndiMart() {
  return `<div class="page-head"><div><h2>BaZaar</h2></div></div><section class="card"><p class="note">Community Directory.</p></section>`;
}

export function businessSubmissionForm() { return ""; }

export function bindBusinessSubmission() {
  document.querySelectorAll("[data-attendance]").forEach(button => button.onclick = async () => {
    try {
      await api("/attendance/respond", { method: "POST", body: { sessionId: button.dataset.sessionId, status: button.dataset.attendance } });
      window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: "Attendance updated." }));
      window.dispatchEvent(new CustomEvent("indianclub:render"));
    } catch (err) { alert(err.message); }
  });
}
