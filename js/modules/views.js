import { api, submitBusinessUpdateRequest } from "./auth.js";
import { state } from "../router.js";

const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const bhd = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;
const dateTime = value => value ? new Date(value).toLocaleString("en-BH", {
  dateStyle: "medium", timeStyle: "short"
}) : "Not scheduled";

function attendanceBadge(status) {
  const safe = String(status || "NO_RESPONSE").toUpperCase();
  const classes = safe === "PRESENT" ? "blue" : safe === "ABSENT" ? "red" : "amber";
  return `<span class="tag ${classes}">${escapeHtml(safe.replaceAll("_", " "))}</span>`;
}

export async function playerDashboard(member = state.member) {
  const data = await api("/members/dashboard");
  const next = data.nextSession;
  return `
    <div class="page-head"><div><h2>Welcome, ${escapeHtml(member.fullName)}</h2><p>${escapeHtml(member.flightName || "Your flight will be assigned by Super Admin.")}</p></div>${attendanceBadge(next?.myAttendance)}</div>
    <div class="grid metrics">
      <article class="card metric"><span>Wallet credit</span><b>${bhd(data.walletFils)}</b><i>Available credit</i></article>
      <article class="card metric"><span>Sessions attended</span><b>${Number(data.attendedCount || 0)}</b><i>All recorded sessions</i></article>
      <article class="card metric"><span>Pending amount</span><b>${bhd(data.pendingFils)}</b><i>Cash / Benefit pending</i></article>
      <article class="card metric"><span>Arrears</span><b>${bhd(data.arrearsFils)}</b><i>Due after 24 hours</i></article>
    </div>
    <div class="grid two">
      <article class="card"><h3>Next session</h3>${next ? `
        <div class="session"><div class="datebox">${new Date(next.startAt).getDate()}<small>${new Date(next.startAt).toLocaleString("en", { month: "short" })}</small></div>
        <div class="grow"><b>${escapeHtml(next.flightName)}</b><p>${dateTime(next.startAt)} · 2 courts</p></div>${attendanceBadge(next.myAttendance)}</div>
        <button class="primary" data-open-attendance="${escapeHtml(next.id)}">Update my attendance</button>` : "<p class='note'>No future session has been published for your flight.</p>"}</article>
      <article class="card wallet"><span>Credit rule</span><div class="balance">${bhd(data.walletFils)}</div><p>Only final PRESENT attendees are charged after Flight Admin records actual shuttlecocks used.</p></article>
    </div>
    <section class="card"><h3>Recent ledger</h3>${(data.recentLedger || []).map(item => `<div class="session"><div class="grow"><b>${escapeHtml(item.description)}</b><p>${dateTime(item.createdAt)}</p></div><strong>${item.direction === "CREDIT" ? "+" : "−"}${bhd(item.amountFils)}</strong></div>`).join("") || "<p class='note'>No wallet entries yet.</p>"}</section>`;
}

export async function playerTimetable() {
  const sessions = await api("/timetable/mine");
  return `<div class="page-head"><div><h2>My Timetable</h2><p>Weekly pattern repeats for the selected month. Every slot uses two courts.</p></div></div>
    <section class="card">${sessions.map(session => `<div class="session"><div class="datebox">${new Date(session.startAt).getDate()}<small>${new Date(session.startAt).toLocaleString("en", { month: "short" })}</small></div><div class="grow"><b>${escapeHtml(session.flightName)}</b><p>${dateTime(session.startAt)} → ${new Date(session.endAt).toLocaleTimeString("en-BH", { hour: "2-digit", minute: "2-digit" })} · Courts 1 & 2</p></div>${attendanceBadge(session.myAttendance)}</div>`).join("") || "<p class='note'>No timetable sessions are available for your assigned flight.</p>"}</section>`;
}

export async function attendanceView(sessionId) {
  const session = await api(`/attendance/session/${encodeURIComponent(sessionId)}`);
  const editable = Boolean(session.canRespond);
  return `<div class="page-head"><div><h2>Attendance</h2><p>${escapeHtml(session.flightName)} · ${dateTime(session.startAt)}</p></div>${session.locked ? "<span class='tag red'>LOCKED</span>" : "<span class='tag blue'>OPEN</span>"}</div>
    <section class="card"><p class="note">Attendance locks automatically 15 minutes after the scheduled start. Players can update only their own response while open. Flight Admin corrections after lock require an audit reason.</p>
      ${editable ? `<div class="actions"><button class="primary" data-attendance="PRESENT" data-session-id="${escapeHtml(session.id)}">I am coming</button><button class="action" data-attendance="ABSENT" data-session-id="${escapeHtml(session.id)}">I am not coming</button></div>` : ""}
      <h3>My response</h3>${attendanceBadge(session.myAttendance)}
    </section>
    <section class="card"><h3>${escapeHtml(session.flightName)} roster</h3>
      ${(session.roster || []).map(person => `<div class="session"><div class="avatar">${escapeHtml((person.fullName || "M").slice(0, 2))}</div><div class="grow"><b>${escapeHtml(person.fullName)}</b><p>${escapeHtml(person.memberId || "")}</p></div>${attendanceBadge(person.status)}</div>`).join("") || "<p class='note'>No roster data.</p>"}
    </section>`;
}

export async function publicIndiMart() {
  const response = await fetch("http://localhost:3000/api/business/public/directory" );
  const businesses = await response.json();
  return `<div class="page-head"><div><h2>Indi Mart</h2><p>Approved Indian community businesses in Bahrain.</p></div></div>
    <section class="card"><button id="showPublicBusinessForm" class="primary">List your business</button><button id="showBusinessUpdate" class="pill" style="margin-left:8px">Update existing advertisement</button></section>
    <section class="grid">${businesses.map(b => `<article class="card"><h3>${escapeHtml(b.businessName)}</h3><p class="note">${escapeHtml(b.category)}</p><p>${escapeHtml(b.description)}</p><p><b>Contact:</b> ${escapeHtml(b.phone)}</p>${b.website ? `<a href="${escapeHtml(b.website)}" target="_blank" rel="noopener">Visit website</a>` : ""}</article>`).join("") || "<article class='card'><p class='note'>No approved listings currently.</p></article>"}</section>`;
}

export function businessSubmissionForm() {
  return `<section class="card"><h2>List Your Business</h2><p class="business-lock">This request enters Super Admin approval. It does not create club login access.</p><div class="field"><label>Business name</label><input id="publicBizName"></div><div class="field"><label>Phone</label><input id="publicBizPhone"></div><div class="field"><label>Category</label><input id="publicBizCategory"></div><div class="field"><label>Description</label><textarea id="publicBizDescription"></textarea></div><button id="publicBizSubmit" class="primary">Submit for approval</button></section>`;
}

export function bindBusinessSubmission() {
  document.querySelectorAll("[data-open-attendance]").forEach(button => button.onclick = () => {
    window.dispatchEvent(new CustomEvent("indianclub:navigate", { detail: { page: "attendance", sessionId: button.dataset.openAttendance } }));
  });

  document.querySelectorAll("[data-attendance]").forEach(button => button.onclick = async () => {
    try {
      await api("/attendance/respond", { method: "POST", body: { sessionId: button.dataset.sessionId, status: button.dataset.attendance } });
      window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: "Attendance updated." }));
      window.dispatchEvent(new CustomEvent("indianclub:render"));
    } catch (error) { window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: error.message })); }
  });

  const update = document.getElementById("showBusinessUpdate");
  if (update) update.onclick = async () => {
    const referenceCode = prompt("Enter your BIZ reference code");
    const phone = prompt("Enter the phone number used in the request");
    if (!referenceCode || !phone) return;
    try {
      await submitBusinessUpdateRequest({ referenceCode, phone });
      alert("Your update request was sent to Super Admin for approval.");
    } catch (error) { alert(error.message); }
  };
}
