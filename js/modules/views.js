import { api, submitBusinessUpdateRequest, updateMyCredentials } from "./auth.js";
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

const countryCodes = [
  ["+973", "Bahrain (+973)"],
  ["+91", "India (+91)"],
  ["+971", "UAE (+971)"],
  ["+966", "Saudi Arabia (+966)"],
  ["+974", "Qatar (+974)"],
  ["+968", "Oman (+968)"],
  ["+965", "Kuwait (+965)"],
  ["+44", "United Kingdom (+44)"],
  ["+1", "USA / Canada (+1)"]
];

function countryCodeOptions(selectedPhone = "") {
  const selected = countryCodes.find(([code]) => String(selectedPhone).startsWith(code))?.[0] || "+973";
  return countryCodes.map(([code, label]) => `<option value="${code}" ${code === selected ? "selected" : ""}>${label}</option>`).join("");
}

function localPhoneNumber(phone = "") {
  const code = countryCodes.find(([value]) => String(phone).startsWith(value))?.[0] || "+973";
  return String(phone).replace(code, "").trim();
}

function timetableTone(flightName = "") {
  const tones = ["saffron", "sun", "rose", "lavender", "leaf", "sky"];
  const total = [...String(flightName)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return tones[total % tones.length];
}

function timeRange(session) {
  const start = new Date(session.startAt);
  const end = new Date(session.endAt);
  return `${start.toLocaleTimeString("en-BH", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("en-BH", { hour: "2-digit", minute: "2-digit" })}`;
}

function attendanceBadge(status) {
  const safe = String(status || "NO_RESPONSE").toUpperCase();
  const classes = safe === "PRESENT" ? "blue" : safe === "ABSENT" ? "red" : "amber";
  return `<span class="tag ${classes}">${escapeHtml(safe.replaceAll("_", " "))}</span>`;
}

function notify(message) {
  window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: message }));
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
        <span class="tag blue">Use the Attendance tab to respond</span>` : "<p class='note'>No future session has been published for your flight.</p>"}</article>
      <article class="card wallet"><span>Credit rule</span><div class="balance">${bhd(data.walletFils)}</div><p>Only final PRESENT attendees are charged after Flight Admin records actual shuttlecocks used.</p></article>
    </div>
    <section class="card"><h3>Recent ledger</h3>${(data.recentLedger || []).map(item => `<div class="session"><div class="grow"><b>${escapeHtml(item.description)}</b><p>${dateTime(item.createdAt)}</p></div><strong>${item.direction === "CREDIT" ? "+" : "−"}${bhd(item.amountFils)}</strong></div>`).join("") || "<p class='note'>No wallet entries yet.</p>"}</section>`;
}

export async function playerTimetable() {
  const slots = await api("/timetable/club");

  if (!slots.length) {
    return `<div class="page-head"><div><h2>Club Timetable</h2><p>The weekly club timetable will appear after Super Admin saves the first slot.</p></div></div><section class="card"><p class="note">No weekly club timetable has been saved yet.</p></section>`;
  }

  const timeRange = slot => `${slot.startTime} – ${slot.endTime}`;
  const timeColumns = [...new Map(slots.map(slot => [timeRange(slot), slot])).entries()];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const tones = ["saffron", "sun", "rose", "lavender", "leaf", "sky"];
  const toneFor = flightName => {
    const total = [...String(flightName || "")].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return tones[total % tones.length];
  };

  const rows = dayNames.map((dayName, dayIndex) => {
    const daySlots = slots.filter(slot => Number(slot.weekdayIndex) === dayIndex);
    if (!daySlots.length) return "";

    return `<tr>
      <th scope="row" class="club-timetable-day">${dayName}</th>
      ${timeColumns.map(([range]) => {
        const slot = daySlots.find(item => timeRange(item) === range);
        if (!slot) return "<td class='club-timetable-empty'>—</td>";
        return `<td class="club-timetable-cell tone-${toneFor(slot.flightName)}"><b>${escapeHtml(slot.flightName)}</b><span>2 COURTS</span></td>`;
      }).join("")}
    </tr>`;
  }).filter(Boolean).join("");

  return `<style>
    .club-timetable-card { overflow: hidden; padding: 0; }
    .club-timetable { width: 100%; min-width: 840px; table-layout: fixed; border-collapse: collapse; }
    .club-timetable th, .club-timetable td { border: 1px solid #334155; text-align: center; }
    .club-timetable thead th { min-width: 150px; padding: 14px 10px; color: #ffffff; font-size: 12px; background: #111827; }
    .club-timetable thead th:first-child { min-width: 95px; }
    .club-timetable thead small { display: block; margin-top: 5px; color: #e2e8f0; font-size: 10px; }
    .club-timetable-day { width: 95px; color: #111827; font-size: 11px; letter-spacing: .08em; writing-mode: vertical-rl; transform: rotate(180deg); background: #d1d5db; }
    .club-timetable-cell { min-height: 112px; padding: 14px 8px; vertical-align: middle; }
    .club-timetable-cell b { display: block; color: #172554; font-size: 16px; text-transform: uppercase; }
    .club-timetable-cell span { display: block; margin-top: 9px; color: #334155; font-size: 10px; font-weight: 900; }
    .club-timetable-empty { color: #94a3b8; background: #f8fafc; }
    .tone-saffron { background: #fdba74; }
    .tone-sun { background: #fef08a; }
    .tone-rose { background: #ff1717; }
    .tone-rose b { color: #ffffff; }
    .tone-lavender { background: #c4b5d5; }
    .tone-leaf { background: #c4df9b; }
    .tone-sky { background: #bae6fd; }
    @media (max-width: 700px) { .club-timetable { min-width: 680px; } }
  </style>
  <div class="page-head"><div><h2>Club Timetable</h2><p>Weekly group timings for Premier through Flight 4B. Every slot has exactly two courts.</p></div></div>
  <section class="card club-timetable-card"><div class="table-wrap"><table class="club-timetable"><thead><tr><th>DAY</th>${timeColumns.map(([range]) => `<th>${escapeHtml(range)}<small>2 COURTS</small></th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

export async function attendanceView(sessionId) {
  const session = await api(`/attendance/session/${encodeURIComponent(sessionId)}`);
  const audit = session.canCorrect ? await api(`/attendance/session/${encodeURIComponent(sessionId)}/audit`) : [];
  return `<div class="page-head"><div><h2>Attendance</h2><p>Your response is fixed to the next game day for your flight in the club timetable.</p></div>${session.locked ? "<span class='tag red'>PLAYER RESPONSES LOCKED</span>" : "<span class='tag blue'>RESPONSES OPEN</span>"}</div>
    <section class="card">
      <h3>${escapeHtml(session.flightName)} · ${escapeHtml(dateTime(session.startAt))}</h3>
      <p class="note">You can update only your own response until 15 minutes before game start. After the game begins, your Flight Admin can correct actual attendance with an audit reason.</p>
      <div class="session"><div class="grow"><b>My attendance</b></div>${attendanceBadge(session.myAttendance)}</div>
      ${session.canRespond ? `<div class="actions"><button class="primary" data-attendance="PRESENT" data-session-id="${escapeHtml(session.id)}">I am coming</button><button class="pill" data-attendance="ABSENT" data-session-id="${escapeHtml(session.id)}">I am not coming</button></div>` : ""}
    </section>
    <section class="card"><h3>${escapeHtml(session.flightName)} roster</h3>${(session.roster || []).map(person => `<div class="session"><div class="avatar">${escapeHtml((person.fullName || "M").split(" ").map(word => word[0]).join("").slice(0, 2))}</div><div class="grow"><b>${escapeHtml(person.fullName)}</b><p>${escapeHtml(person.memberId || "")}</p></div>${attendanceBadge(person.status)}${session.canCorrect ? `<div class="actions"><button class="pill" data-attendance-correct="PRESENT" data-member-uid="${escapeHtml(person.uid)}" data-session-id="${escapeHtml(session.id)}">Present</button><button class="pill" data-attendance-correct="ABSENT" data-member-uid="${escapeHtml(person.uid)}" data-session-id="${escapeHtml(session.id)}">Absent</button></div>` : ""}</div>`).join("") || "<p class='note'>No active members are assigned to this flight.</p>"}</section>
    ${session.canCorrect ? `<section class="card"><h3>Attendance correction audit</h3>${audit.map(item => `<div class="session"><div class="grow"><b>${escapeHtml(item.previousStatus)} → ${escapeHtml(item.newStatus)}</b><p>${escapeHtml(item.reason)} · ${escapeHtml(dateTime(item.createdAt))}</p></div></div>`).join("") || "<p class='note'>No corrections have been recorded for this session.</p>"}</section>` : ""}`;
}

export async function playerActivityLog() {
  const log = await api("/members/activity-log");
  const day = value => value ? new Date(value).toLocaleDateString("en-BH", { dateStyle: "medium" }) : "Date unavailable";
  return `<div class="page-head"><div><h2>My Activity Log</h2><p>Your private game-day, attendance, payment, due and credential history.</p></div></div>
  <section class="card"><h3>Club-announced game days</h3>${log.gameDays.map(row => `<div class="session"><div class="grow"><b>${escapeHtml(row.flightName)}</b><p>${escapeHtml(dateTime(row.startAt))}</p></div><span class="tag blue">${escapeHtml(row.status)}</span></div>`).join("") || "<p class='note'>No game days announced.</p>"}</section>
  <section class="card"><h3>Attendance history</h3>${log.attendance.map(row => `<div class="session"><div class="grow"><b>${escapeHtml(row.flightName)}</b><p>${escapeHtml(day(row.startAt))}</p></div>${attendanceBadge(row.status)}</div>`).join("") || "<p class='note'>No attendance history.</p>"}</section>
  <section class="card"><h3>Shuttlecock charges and unpaid dues</h3>${log.charges.map(row => `<div class="session"><div class="grow"><b>${escapeHtml(row.flightName)}</b><p>${escapeHtml(day(row.startAt))} · ${bhd(row.totalChargeFils)}</p></div><div><b>${bhd(row.amountDueFils)}</b><br>${row.amountDueFils > 0 ? "<span class='tag red'>UNPAID DUE</span>" : "<span class='tag blue'>PAID</span>"}</div></div>`).join("") || "<p class='note'>No shuttlecock charges.</p>"}</section>
  <section class="card"><h3>Payment history</h3>${log.payments.map(row => `<div class="session"><div class="grow"><b>${escapeHtml(row.kind)} · ${escapeHtml(row.method)}</b><p>${escapeHtml(day(row.submittedAt))}</p></div><b>${bhd(row.amountFils)}</b><span class="tag amber">${escapeHtml(row.status)}</span></div>`).join("") || "<p class='note'>No payments.</p>"}</section>
  <section class="card"><h3>Credential update history</h3>${log.credentialUpdates.map(row => `<div class="session"><div class="grow"><b>Credentials updated</b><p>${escapeHtml((row.changedFields || []).join(", ") || "Profile details")} · ${escapeHtml(day(row.createdAt))}</p></div></div>`).join("") || "<p class='note'>No credential updates.</p>"}</section>`;
}

export async function credentialsView() {
  const member = await api("/members/me");
  return `
    <div class="page-head"><div><span class="tag blue">MY ACCOUNT</span><h2>Update Credentials</h2><p>Keep your Member ID and phone number current. You may also update your email or password securely.</p></div></div>
    <section class="card">
      <div class="grid two">
        <div class="field"><label for="credentialMemberId">Member ID</label><input id="credentialMemberId" value="${escapeHtml(member.memberId || "")}" placeholder="ICB-PL-001" /></div>
        <div class="field"><label for="credentialPhone">Phone number</label><div class="phone-field"><select id="credentialCountryCode" aria-label="Country code">${countryCodeOptions(member.phone)}</select><input id="credentialPhone" type="tel" inputmode="tel" autocomplete="tel" value="${escapeHtml(localPhoneNumber(member.phone))}" placeholder="Phone number" /></div></div>
        <div class="field"><label for="credentialEmail">Email address</label><input id="credentialEmail" type="email" autocomplete="email" value="${escapeHtml(member.email || "")}" /></div>
        <div class="field"><label for="credentialCurrentPassword">Current password <small>(required only to change email or password)</small></label><div class="password-field"><input id="credentialCurrentPassword" type="password" autocomplete="current-password" /><button type="button" class="password-toggle" data-toggle-password="credentialCurrentPassword">Show</button></div></div>
        <div class="field"><label for="credentialNewPassword">New password <small>(leave blank to keep your current password)</small></label><div class="password-field"><input id="credentialNewPassword" type="password" autocomplete="new-password" placeholder="At least 8 characters" /><button type="button" class="password-toggle" data-toggle-password="credentialNewPassword">Show</button></div></div>
        <div class="field"><label for="credentialConfirmPassword">Confirm new password</label><div class="password-field"><input id="credentialConfirmPassword" type="password" autocomplete="new-password" /><button type="button" class="password-toggle" data-toggle-password="credentialConfirmPassword">Show</button></div></div>
      </div>
      <div class="actions"><button id="saveCredentials" class="primary">Save credentials</button></div>
      <p class="note">If you have forgotten your password, use the <b>Forgot password?</b> link on the Member / Admin Login screen. A reset email will be sent to your registered email address.</p>
    </section>
  `;
}

export async function publicIndiMart() {
  const businesses = await api("/business/public/directory");
  return `<div class="page-head"><div><h2>Indi Mart</h2><p>Approved Indian community businesses in Bahrain.</p></div></div>
    <section class="card"><button id="showPublicBusinessForm" class="primary">List your business</button><button id="showBusinessUpdate" class="pill" style="margin-left:8px">Update existing advertisement</button></section>
    <section class="grid">${businesses.map(b => `<article class="card"><h3>${escapeHtml(b.businessName)}</h3><p class="note">${escapeHtml(b.category)}</p><p>${escapeHtml(b.description)}</p><p><b>Contact:</b> ${escapeHtml(b.phone)}</p>${b.website ? `<a href="${escapeHtml(b.website)}" target="_blank" rel="noopener">Visit website</a>` : ""}</article>`).join("") || "<article class='card'><p class='note'>No approved listings currently.</p></article>"}</section>`;
}

export function businessSubmissionForm() {
  return `<section class="card"><h2>List Your Business</h2><p class="business-lock">This request enters Super Admin approval. It does not create club login access.</p><div class="field"><label>Business name</label><input id="publicBizName"></div><div class="field"><label>Phone</label><input id="publicBizPhone"></div><div class="field"><label>Category</label><input id="publicBizCategory"></div><div class="field"><label>Description</label><textarea id="publicBizDescription"></textarea></div><button id="publicBizSubmit" class="primary">Submit for approval</button></section>`;
}

export function bindBusinessSubmission() {
  document.querySelectorAll("[data-open-attendance]").forEach(button => button.onclick = () => {
    window.sessionStorage.setItem("indianClubAttendanceSessionId", button.dataset.openAttendance);
    window.dispatchEvent(new CustomEvent("indianclub:navigate", { detail: { page: "attendance", sessionId: button.dataset.openAttendance } }));
  });

  const attendanceSessionSelect = document.getElementById("attendanceSessionSelect");
  if (attendanceSessionSelect) attendanceSessionSelect.onchange = () => {
    window.sessionStorage.setItem("indianClubAttendanceSessionId", attendanceSessionSelect.value);
    window.dispatchEvent(new CustomEvent("indianclub:render"));
  };

  document.querySelectorAll("[data-attendance]").forEach(button => button.onclick = async () => {
    try {
      await api("/attendance/respond", { method: "POST", body: { sessionId: button.dataset.sessionId, status: button.dataset.attendance } });
      notify("Attendance updated.");
      window.dispatchEvent(new CustomEvent("indianclub:render"));
    } catch (error) { notify(error.message); }
  });

  document.querySelectorAll("[data-attendance-correct]").forEach(button => button.onclick = async () => {
    const reason = window.prompt("Enter the required reason for this locked attendance correction:");
    if (!reason || !reason.trim()) return;
    try {
      await api(`/attendance/session/${encodeURIComponent(button.dataset.sessionId)}/correct`, {
        method: "POST",
        body: { memberUid: button.dataset.memberUid, status: button.dataset.attendanceCorrect, reason: reason.trim() }
      });
      notify("Attendance correction saved and audit-logged.");
      window.dispatchEvent(new CustomEvent("indianclub:render"));
    } catch (error) { notify(error.message); }
  });

  const saveCredentials = document.getElementById("saveCredentials");
  if (saveCredentials) saveCredentials.onclick = async () => {
    try {
      const newPassword = document.getElementById("credentialNewPassword").value;
      const confirmation = document.getElementById("credentialConfirmPassword").value;
      if (newPassword !== confirmation) throw new Error("The new password and confirmation do not match.");

      await updateMyCredentials({
        memberId: document.getElementById("credentialMemberId").value.trim(),
        phone: `${document.getElementById("credentialCountryCode").value} ${document.getElementById("credentialPhone").value.trim()}`.trim(),
        email: document.getElementById("credentialEmail").value.trim(),
        currentPassword: document.getElementById("credentialCurrentPassword").value,
        newPassword
      });
      notify("Your credentials have been updated.");
      window.dispatchEvent(new CustomEvent("indianclub:render"));
    } catch (error) { notify(error.message); }
  };

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

  document.querySelectorAll("[data-toggle-password]").forEach(button => {
    button.onclick = () => {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;
      const reveal = input.type === "password";
      input.type = reveal ? "text" : "password";
      button.textContent = reveal ? "Hide" : "Show";
    };
  });
}
