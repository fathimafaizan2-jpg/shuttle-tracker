import { api, submitBusinessUpdateRequest, updateMyCredentials } from "./auth.js";
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

const weekdayTime = value => {
  const date = clubDate(value);
  return date ? date.toLocaleDateString("en-BH", { weekday: "long", timeZone: "Asia/Bahrain" }) : "Day unavailable";
};

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
  const safelyLoad = async (path, fallback) => {
    try { return await api(path); }
    catch (error) {
      console.warn(`Home dashboard data unavailable for ${path}:`, error);
      return fallback;
    }
  };
  const [dashboardData, personalSessions, walletData] = await Promise.all([
    safelyLoad("/members/dashboard", {}),
    safelyLoad("/timetable/mine", []),
    safelyLoad("/finance/mine", {})
  ]);
  const data = {
    walletFils: Number(dashboardData.walletFils ?? walletData.balanceFils ?? 0),
    attendedCount: Number(dashboardData.attendedCount ?? 0),
    pendingFils: Number(dashboardData.pendingFils ?? walletData.unpaidFils ?? 0),
    arrearsFils: Number(dashboardData.arrearsFils ?? walletData.arrearsFils ?? 0)
  };
  const now = Date.now();
  const safeSessions = Array.isArray(personalSessions) ? personalSessions : [];
  const next = safeSessions
    .filter(session => {
      if (!session || typeof session !== "object" || session.status !== "SCHEDULED") return false;
      const startAt = new Date(session.startAt).getTime();
      const endAt = new Date(session.endAt || session.startAt).getTime();
      return Number.isFinite(startAt) && Number.isFinite(endAt) && endAt >= now;
    })
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0] || null;
  const gameStatus = next && new Date(next.startAt).getTime() <= now ? "TODAY'S GAME" : "UPCOMING GAME";

  return `
    <div class="page-head">
      <div>
        <h2>Welcome, ${escapeHtml(signedInMember.fullName || "Member")}</h2>
        <p>${escapeHtml(signedInMember.flightName || "Your flight will be assigned by Super Admin.")}</p>
      </div>
      ${next ? `<span class='tag blue'>${gameStatus}</span>` : ""}
    </div>

    <div class="grid metrics">
      <article class="card metric"><span>Wallet credit</span><b>${bhd(data.walletFils)}</b><i>Available verified credit</i></article>
      <article class="card metric"><span>Sessions attended</span><b>${Number(data.attendedCount || 0)}</b><i>All recorded sessions</i></article>
      <article class="card metric"><span>Pending amount</span><b>${bhd(data.pendingFils)}</b><i>Cash / Benefit pending</i></article>
      <article class="card metric"><span>Arrears</span><b>${bhd(data.arrearsFils)}</b><i>Due after 24 hours</i></article>
    </div>

    <div class="grid two">
      <article class="card">
        <h3>Upcoming game</h3>
        ${next ? `
          <div class="session">
            <div class="datebox">${new Date(next.startAt).getDate()}<small>${new Date(next.startAt).toLocaleString("en", { month: "short" })}</small></div>
            <div class="grow"><b>${escapeHtml(next.flightName)}</b><p>${new Date(next.startAt).toLocaleDateString("en-BH", { weekday: "long", dateStyle: "medium", timeZone: "Asia/Bahrain" })}</p><p>${dateTime(next.startAt)} · 2 courts</p></div>
            <span class="tag blue">${gameStatus}</span>
          </div>
        ` : "<p class='note'>No upcoming game has been published for your flight.</p>"}
      </article>
      <article class="card wallet">
        <span>Credit rule</span>
        <div class="balance">${bhd(data.walletFils)}</div>
        <p>Only final PRESENT attendees are charged after Flight Admin records actual shuttlecocks used.</p>
      </article>
    </div>
  `;
}

export async function playerTimetable() {
  const slots = await api("/timetable/club");

  if (!slots.length) {
    return `<div class="page-head"><div><h2>Club Timetable</h2><p>The weekly club timetable will appear after Super Admin saves the first slot.</p></div></div><section class="card"><p class="note">No weekly club timetable has been saved yet.</p></section>`;
  }

  const slotTime = slot => `${slot.startTime} – ${slot.endTime}`;
  const timeColumns = [...new Map(slots.map(slot => [slotTime(slot), slot])).entries()];
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
        const slot = daySlots.find(item => slotTime(item) === range);
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
    .tone-saffron { background: #fdba74; }.tone-sun { background: #fef08a; }.tone-rose { background: #ff1717; }.tone-rose b { color: #ffffff; }.tone-lavender { background: #c4b5d5; }.tone-leaf { background: #c4df9b; }.tone-sky { background: #bae6fd; }
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
      <h3>${escapeHtml(session.flightName)} · ${escapeHtml(weekdayTime(session.startAt))}, ${escapeHtml(dateTime(session.startAt))}</h3>
      <p class="note">Players can update only their own response until 15 minutes before game start. Your assigned Flight Admin can correct final attendance with an audit reason until the game is settled.</p>
      <div class="session"><div class="grow"><b>My attendance</b></div>${attendanceBadge(session.myAttendance)}</div>
      ${session.canRespond ? `<div class="actions"><button class="primary" data-attendance="PRESENT" data-session-id="${escapeHtml(session.id)}">I am coming</button><button class="pill" data-attendance="ABSENT" data-session-id="${escapeHtml(session.id)}">I am not coming</button></div>` : ""}
    </section>
    <section class="card"><h3>Players coming for this game</h3><p class="note">Only members of ${escapeHtml(session.flightName)} who responded “I am coming” are shown here. Their attendance is read-only on this screen; only your own response can be changed in Attendance.</p>${(session.roster || []).map(person => `<div class="session"><div class="avatar">${escapeHtml((person.fullName || "M").split(" ").map(word => word[0]).join("").slice(0, 2))}</div><div class="grow"><b>${escapeHtml(person.fullName)}</b><p>${escapeHtml(person.memberId || "")}</p></div>${attendanceBadge(person.status)}${session.canCorrect ? `<div class="actions"><button class="pill" data-attendance-correct="PRESENT" data-member-uid="${escapeHtml(person.uid)}" data-session-id="${escapeHtml(session.id)}">Present</button><button class="pill" data-attendance-correct="ABSENT" data-member-uid="${escapeHtml(person.uid)}" data-session-id="${escapeHtml(session.id)}">Absent</button></div>` : ""}</div>`).join("") || "<p class='note'>No members have responded “I am coming” yet.</p>"}</section>
    ${session.canCorrect ? `<section class="card"><h3>Attendance correction audit</h3>${audit.map(item => `<div class="session"><div class="grow"><b>${escapeHtml(item.previousStatus)} → ${escapeHtml(item.newStatus)}</b><p>${escapeHtml(item.reason)} · ${escapeHtml(dateTime(item.createdAt))}</p></div></div>`).join("") || "<p class='note'>No corrections have been recorded for this session.</p>"}</section>` : ""}`;
}

let activityLogSection = "games";
let indiMartCategory = "";
let showIndiMartBusinessForm = false;

const businessCategories = ["All categories", "Restaurant & Catering", "Groceries & Food", "Fashion & Beauty", "Health & Wellness", "Education & Training", "Home Services", "Travel & Transport", "Professional Services", "Retail & Electronics", "Community Services", "Other"];
const categoryOptions = (selected = "", includeAll = false) => businessCategories
  .filter(category => includeAll || category !== "All categories")
  .map(category => `<option value="${escapeHtml(category === "All categories" ? "" : category)}" ${String(selected) === String(category === "All categories" ? "" : category) ? "selected" : ""}>${escapeHtml(category)}</option>`)
  .join("");

function imagePreviewUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const fileId = url.hostname.endsWith("drive.google.com") ? (url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get("id")) : null;
    return fileId ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600` : url.toString();
  } catch { return ""; }
}

export async function playerActivityLog() {
  const log = await api("/members/activity-log");
  const day = value => value ? new Date(value).toLocaleDateString("en-BH", { dateStyle: "medium" }) : "Date unavailable";
  const sections = {
    games: { label: "Game Days", content: log.gameDays.map(row => `<div class="session"><div class="grow"><b>${escapeHtml(row.flightName)}</b><p>${escapeHtml(dateTime(row.startAt))}</p></div><span class="tag blue">${escapeHtml(row.status)}</span></div>`).join("") || "<p class='note'>No game days announced.</p>" },
    attendance: { label: "Attendance", content: log.attendance.map(row => `<div class="session"><div class="grow"><b>${escapeHtml(row.flightName)}</b><p>${escapeHtml(day(row.startAt))}</p></div>${attendanceBadge(row.status)}</div>`).join("") || "<p class='note'>No attendance history.</p>" },
    charges: { label: "Shuttlecock Charges", content: log.charges.map(row => `<div class="session"><div class="grow"><b>${escapeHtml(row.flightName)}</b><p>${escapeHtml(day(row.startAt))} · ${bhd(row.totalChargeFils)}</p></div><div><b>${bhd(row.amountDueFils)}</b><br>${row.amountDueFils > 0 ? "<span class='tag red'>UNPAID DUE</span>" : "<span class='tag blue'>PAID</span>"}</div></div>`).join("") || "<p class='note'>No shuttlecock charges.</p>" },
    payments: { label: "Payments & Dues", content: log.payments.map(row => `<div class="session"><div class="grow"><b>${escapeHtml(row.kind)} · ${escapeHtml(row.method)}</b><p>${escapeHtml(day(row.submittedAt))}</p></div><b>${bhd(row.amountFils)}</b><span class="tag amber">${escapeHtml(row.status)}</span></div>`).join("") || "<p class='note'>No payment claims.</p>" },
    credentials: { label: "Credential Updates", content: log.credentialUpdates.map(row => `<div class="session"><div class="grow"><b>Credentials updated</b><p>${escapeHtml((row.changedFields || []).join(", ") || "Profile details")} · ${escapeHtml(day(row.createdAt))}</p></div></div>`).join("") || "<p class='note'>No credential updates.</p>" }
  };
  const selected = sections[activityLogSection] || sections.games;
  return `<div class="page-head"><div><h2>My Activity Log</h2><p>Choose the information you need.</p></div></div><section class="card"><div class="actions">${Object.entries(sections).map(([key, section]) => `<button class="${key === activityLogSection ? "primary" : "pill"}" data-log-section="${key}">${section.label}</button>`).join("")}</div></section><section class="card"><h3>${selected.label}</h3>${selected.content}</section>`;
}

export async function walletView() {
  const data = await api("/finance/mine");
  const paymentRows = data.payments || [];
  const chargeRows = data.charges || [];
  const day = value => {
    const date = clubDate(value);
    return date ? date.toLocaleDateString("en-BH", { dateStyle: "medium", timeZone: "Asia/Bahrain" }) : "Date unavailable";
  };
  const pendingChargeIds = new Set(
    paymentRows
      .filter(row => row.kind === "SESSION_SETTLEMENT" && row.status === "PENDING")
      .map(row => row.chargeId)
  );
  const paymentKind = row => row.method === "WALLET_CREDIT" ? "Used wallet credit" : "Cash / Benefit game payment";
  const adminContact = data.flightAdminContact || {};
  const paymentByChargeId = new Map(paymentRows.filter(row => row.chargeId).map(row => [row.chargeId, row]));
  const chargeDetails = (row = null) => {
    const payment = row ? paymentByChargeId.get(row.id) : null;
    const displayPayable = row ? bhd(Number(row.amountDueFils || 0) || Number(row.totalChargeFils || 0)) : "—";
    const gameDateTime = row?.gameStartAt ? dateTime(row.gameStartAt) : "Awaiting completed game";
    const shuttlesUsed = row ? String(Number(row.actualShuttlesUsed || 0)) : "—";
    const finalPlayers = row ? String(Number(row.finalPresentCount || 0)) : "—";
    const paymentId = row?.paymentCode || payment?.paymentCode || payment?.id || "";
    const paymentMethod = row?.paymentMethod || payment?.method || "";
    const paymentControls = !row ? `<div class="actions"><button class="primary" disabled>Use credit</button><button class="pill" disabled>Cash / Benefit pay</button></div>` : Number(row.amountDueFils || 0) > 0 && payment?.status === "PENDING" ? `<div class="actions"><span class="tag amber">CASH / BENEFIT PENDING</span></div>` : Number(row.amountDueFils || 0) > 0 ? `<div class="actions"><button class="primary" data-credit-charge="${escapeHtml(row.id)}" data-admin-phone="${escapeHtml(adminContact.phone || "")}" data-admin-name="${escapeHtml(adminContact.name || "Flight Admin")}" data-charge-amount="${escapeHtml(displayPayable)}">Use credit</button><button class="pill" data-manual-charge="${escapeHtml(row.id)}" data-admin-phone="${escapeHtml(adminContact.phone || "")}" data-admin-name="${escapeHtml(adminContact.name || "Flight Admin")}" data-charge-amount="${escapeHtml(displayPayable)}">Cash / Benefit pay</button></div>` : `<div class="actions"><span class="tag blue">${escapeHtml(String(row.status || "PAID").replaceAll("_", " "))}</span></div>`;
    return `<article class="card"><div class="page-head"><div><h3>Game charge${row ? ` · ${escapeHtml(row.flightName || "Assigned flight")}` : ""}</h3><p class="note">${row ? "Final game details and your personal amount payable." : "These boxes will update after Flight Admin finishes the game and confirms final PRESENT attendance."}</p></div>${row ? `<span class="tag ${Number(row.amountDueFils || 0) > 0 ? "red" : "blue"}">${Number(row.amountDueFils || 0) > 0 ? "PAYMENT REQUIRED" : "PAID"}</span>` : "<span class='tag amber'>AWAITING GAME</span>"}</div><div class="grid two"><div class="field"><label>Game date / time</label><div class="session"><b>${escapeHtml(gameDateTime)}</b></div></div><div class="field"><label>Shuttlecocks used</label><div class="session"><b>${escapeHtml(shuttlesUsed)}</b></div></div><div class="field"><label>Final players attended</label><div class="session"><b>${escapeHtml(finalPlayers)}</b></div></div><div class="field"><label>Amount payable</label><div class="session"><b>${escapeHtml(displayPayable)}</b></div></div></div><div class="field"><label>Payment method</label><p class="note">${paymentId ? `Payment ID: <b>${escapeHtml(paymentId)}</b> · ${escapeHtml(String(paymentMethod || "Recorded payment").replaceAll("_", " "))}` : row ? "Choose Use Credit or Cash / Benefit Pay below." : "Payment buttons will activate after this charge is created."}</p></div>${paymentControls}</article>`;
  };

  return `
    <div class="page-head">
      <div>
        <h2>Wallet & Payments</h2>
        <p>Only Super Admin adds verified wallet credit. Use credit only after a completed game charge is shown below.</p>
      </div>
    </div>

    <div class="grid metrics">
      <article class="card metric"><span>Wallet credit</span><b>${bhd(data.balanceFils)}</b><i>Verified Super Admin credit available now</i></article>
      <article class="card metric"><span>Payable amount</span><b>${bhd(data.unpaidFils)}</b><i>Completed-game shuttlecock charges</i></article>
      <article class="card metric"><span>Unpaid arrears</span><b>${bhd(data.arrearsFils)}</b><i>Charges past their due time</i></article>
    </div>

    <section class="card">
      <h3>Shuttlecock charges</h3>
      <p class="note">A charge appears only after your Flight Admin confirms the final PRESENT attendance and actual shuttlecocks used. Wallet credit is refilled only when Super Admin records verified payment at the club desk.</p>
      ${chargeRows.length ? chargeRows.map(chargeDetails).join("") : chargeDetails()}
    </section>

    <section class="card">
      <h3>Payment request status</h3>
      ${paymentRows.map(row => `<div class="session"><div class="grow"><b>${escapeHtml(paymentKind(row))} · ${escapeHtml(row.method)}</b><p>Payment ID: <b>${escapeHtml(row.paymentCode || row.id)}</b> · ${escapeHtml(row.reference || "No reference")} · ${escapeHtml(dateTime(row.submittedAt))}</p></div><b>${bhd(row.amountFils)}</b><span class="tag ${row.status === "VERIFIED" ? "blue" : "amber"}">${escapeHtml(row.status)}</span></div>`).join("") || "<p class='note'>No game payment records yet.</p>"}
    </section>

    <section class="card">
      <h3>Wallet history</h3>
      ${(data.ledger || []).map(row => `<div class="session"><div class="grow"><b>${escapeHtml(row.description)}</b><p>${row.paymentCode ? `Payment ID: ${escapeHtml(row.paymentCode)} · ` : ""}${escapeHtml(dateTime(row.createdAt))}</p></div><b>${row.direction === "CREDIT" ? "+" : "−"}${bhd(row.amountFils)}</b></div>`).join("") || "<p class='note'>No verified wallet credit or payment entries yet.</p>"}
    </section>
  `;
}

export async function credentialsView() {
  const member = await api("/members/me");
  const profileImage = imagePreviewUrl(member.profilePhotoUrl);
  return `<div class="page-head"><div><span class="tag blue">MY ACCOUNT</span><h2>Update Credentials</h2><p>Keep your Member ID and phone number current. You may also update your email or password securely.</p></div></div>
    <section class="card"><div class="grid two">
      <div class="field"><label for="credentialFullName">Full name</label><input id="credentialFullName" value="${escapeHtml(member.fullName || "")}" autocomplete="name" placeholder="Your full name" /></div>
      <div class="field"><label for="credentialMemberId">Member ID</label><input id="credentialMemberId" value="${escapeHtml(member.memberId || "")}" placeholder="ICB-PL-001" /></div>
      <div class="field"><label for="credentialPhone">Phone number</label><div class="phone-field"><select id="credentialCountryCode" aria-label="Country code">${countryCodeOptions(member.phone)}</select><input id="credentialPhone" type="tel" inputmode="tel" autocomplete="tel" value="${escapeHtml(localPhoneNumber(member.phone))}" placeholder="Phone number" /></div></div>
      <div class="field"><label for="credentialEmail">Email address</label><input id="credentialEmail" type="email" autocomplete="email" value="${escapeHtml(member.email || "")}" /></div>
      <div class="field"><label for="credentialCurrentPassword">Current password <small>(required only to change email or password)</small></label><div class="password-field"><input id="credentialCurrentPassword" type="password" autocomplete="current-password" /><button type="button" class="password-toggle" data-toggle-password="credentialCurrentPassword">Show</button></div></div>
      <div class="field"><label for="credentialNewPassword">New password <small>(leave blank to keep your current password)</small></label><div class="password-field"><input id="credentialNewPassword" type="password" autocomplete="new-password" placeholder="At least 8 characters" /><button type="button" class="password-toggle" data-toggle-password="credentialNewPassword">Show</button></div></div>
      <div class="field"><label for="credentialConfirmPassword">Confirm new password</label><div class="password-field"><input id="credentialConfirmPassword" type="password" autocomplete="new-password" /><button type="button" class="password-toggle" data-toggle-password="credentialConfirmPassword">Show</button></div></div>
    </div><section class="profile-photo-card"><div><h3>Profile photo</h3><p class="note">Upload your photo to Google Drive, set it to <b>Anyone with the link</b>, then paste the public image link below. The image is shown only as your club profile photo.</p></div><div class="field"><label for="credentialProfilePhoto">Google Drive profile photo link</label><input id="credentialProfilePhoto" type="url" maxlength="1800" value="${escapeHtml(member.profilePhotoUrl || "")}" placeholder="Paste a public Google Drive image link" /></div><div class="actions"><button id="previewProfilePhoto" class="pill" type="button">Preview photo</button></div><div id="profilePhotoPreview" class="profile-photo-preview ${profileImage ? "" : "hidden"}">${profileImage ? `<img src="${escapeHtml(profileImage)}" alt="Profile photo preview" />` : ""}</div></section><div class="actions"><button id="saveCredentials" class="primary">Save credentials</button></div><p class="note">If you have forgotten your password, use the <b>Forgot password?</b> link on the Member / Admin Login screen. A reset email will be sent to your registered email address.</p></section>`;
}

export async function publicIndiMart() {
  const businesses = await api("/business/public/directory");
  const categories = [...new Set(businesses.map(row => String(row.category || "Other")).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const selectedCategory = categories.includes(indiMartCategory) ? indiMartCategory : "";
  if (indiMartCategory && !selectedCategory) indiMartCategory = "";
  const shown = selectedCategory ? businesses.filter(row => row.category === selectedCategory) : businesses;
  const card = business => {
    const destination = business.destinationUrl || business.website || "";
    const image = imagePreviewUrl(business.flyerUrl);
    const imageMarkup = image ? (destination
      ? `<a class="directory-flyer" href="${escapeHtml(destination)}" target="_blank" rel="noopener"><img src="${escapeHtml(image)}" alt="${escapeHtml(business.businessName)} flyer" loading="lazy" /></a>`
      : `<div class="directory-flyer"><img src="${escapeHtml(image)}" alt="${escapeHtml(business.businessName)} flyer" loading="lazy" /></div>`)
      : `<div class="directory-flyer directory-flyer-empty"><span>INDI MART</span></div>`;
    return `<article class="card directory-card">${imageMarkup}<div class="directory-card-body"><div class="page-head"><div><span class="tag blue">${escapeHtml(business.category || "Business")}</span><h3>${escapeHtml(business.businessName)}</h3></div></div><p>${escapeHtml(business.description)}</p>${business.discountText ? `<p class="directory-offer"><b>Offer:</b> ${escapeHtml(business.discountText)}</p>` : ""}<p class="note"><b>Contact:</b> ${escapeHtml(business.phone || "Not provided")}</p>${business.address ? `<p class="note"><b>Location:</b> ${escapeHtml(business.address)}</p>` : ""}<div class="actions">${destination ? `<a class="primary directory-link" href="${escapeHtml(destination)}" target="_blank" rel="noopener">View offer / contact</a>` : ""}${business.website && business.website !== destination ? `<a class="pill directory-link" href="${escapeHtml(business.website)}" target="_blank" rel="noopener">Website</a>` : ""}</div></div></article>`;
  };
  const memberForm = `<section class="card indi-mart-submission"><div class="page-head"><div><span class="tag amber">MEMBER BUSINESS SUBMISSION</span><h3>List your business</h3><p class="note">Your request and flyer link go to Super Admin for approval before anyone can see it.</p></div><button id="closeMemberBusinessForm" class="pill">Back to directory</button></div><p class="business-lock">Google Drive flyer: set the image to <b>Anyone with the link</b>, paste the Drive sharing link below, and use Preview before submitting. The flyer can open your website, WhatsApp catalogue, social page, or map link.</p><div class="grid two"><div class="field"><label for="memberBizName">Business name</label><input id="memberBizName" maxlength="100" placeholder="Business name" /></div><div class="field"><label for="memberBizOwner">Owner name</label><input id="memberBizOwner" maxlength="100" value="${escapeHtml(state.member?.fullName || "")}" /></div><div class="field"><label for="memberBizPhone">Phone / WhatsApp</label><input id="memberBizPhone" maxlength="40" value="${escapeHtml(state.member?.phone || "")}" /></div><div class="field"><label for="memberBizCategory">Category</label><select id="memberBizCategory">${categoryOptions("Other")}</select></div></div><div class="field"><label for="memberBizDescription">Offer / description</label><textarea id="memberBizDescription" maxlength="800" placeholder="Describe the business, service, or current offer."></textarea></div><div class="grid two"><div class="field"><label for="memberBizAddress">Location / address</label><input id="memberBizAddress" maxlength="200" placeholder="Area, building, or shop location" /></div><div class="field"><label for="memberBizWebsite">Website link (optional)</label><input id="memberBizWebsite" type="url" maxlength="1800" placeholder="https://..." /></div><div class="field"><label for="memberBizDestination">Flyer destination link</label><input id="memberBizDestination" type="url" maxlength="1800" placeholder="WhatsApp, website, catalogue, social page, or map link" /></div><div class="field"><label for="memberBizOffer">Featured offer text (optional)</label><input id="memberBizOffer" maxlength="200" placeholder="10% club member offer" /></div></div><div class="field"><label for="memberBizFlyer">Google Drive flyer / poster image link (optional)</label><input id="memberBizFlyer" type="url" maxlength="1800" placeholder="Paste Google Drive sharing link" /></div><div class="actions"><button id="previewMemberBusinessFlyer" class="pill" type="button">Preview flyer</button><button id="submitMemberBusiness" class="primary" type="button">Submit for Super Admin approval</button></div><div id="memberBusinessFlyerPreview" class="image-link-preview hidden"></div></section>`;
  return `<div class="page-head"><div><span class="tag blue">INDIAN CLUB BAHRAIN</span><h2>Indi Mart</h2><p>Approved Indian community businesses, offers, and services in Bahrain.</p></div></div>${showIndiMartBusinessForm ? memberForm : `<section class="card"><div class="page-head"><div><h3>Community Directory</h3><p class="note">Choose a category or open a business card for its offer, contact, catalogue, location, or website.</p></div><div class="actions"><button id="showPublicBusinessForm" class="primary">List your business</button><button id="showBusinessUpdate" class="pill">Update existing advertisement</button></div></div><div class="field"><label for="indiMartCategory">Business category</label><select id="indiMartCategory"><option value="">All categories</option>${categories.map(category => `<option value="${escapeHtml(category)}" ${category === selectedCategory ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}</select></div></section><section class="grid directory-grid">${shown.map(card).join("") || "<article class='card'><p class='note'>No approved businesses are available in this category yet.</p></article>"}</section>`}`;
}

export function businessSubmissionForm() {
  showIndiMartBusinessForm = true;
  return "";
}

export function bindBusinessSubmission() {
  const category = document.getElementById("indiMartCategory");
  if (category) category.onchange = () => { indiMartCategory = category.value; window.dispatchEvent(new CustomEvent("indianclub:render")); };
  const showBusinessForm = document.getElementById("showPublicBusinessForm");
  if (showBusinessForm) showBusinessForm.onclick = () => { showIndiMartBusinessForm = true; window.dispatchEvent(new CustomEvent("indianclub:render")); };
  const closeBusinessForm = document.getElementById("closeMemberBusinessForm");
  if (closeBusinessForm) closeBusinessForm.onclick = () => { showIndiMartBusinessForm = false; window.dispatchEvent(new CustomEvent("indianclub:render")); };
  const previewBusiness = document.getElementById("previewMemberBusinessFlyer");
  if (previewBusiness) previewBusiness.onclick = () => {
    const preview = document.getElementById("memberBusinessFlyerPreview");
    const url = imagePreviewUrl(document.getElementById("memberBizFlyer")?.value);
    if (!url) return notify("Paste a valid Google Drive or public image link first.");
    preview.innerHTML = `<img src="${escapeHtml(url)}" alt="Flyer preview" /><p class="note">Preview only. Super Admin approval is still required before publication.</p>`;
    preview.classList.remove("hidden");
  };
  const submitBusiness = document.getElementById("submitMemberBusiness");
  if (submitBusiness) submitBusiness.onclick = async () => {
    try {
      const result = await api("/business/public/submit", { method: "POST", body: {
        businessName: document.getElementById("memberBizName").value.trim(),
        ownerName: document.getElementById("memberBizOwner").value.trim(),
        phone: document.getElementById("memberBizPhone").value.trim(),
        category: document.getElementById("memberBizCategory").value,
        description: document.getElementById("memberBizDescription").value.trim(),
        address: document.getElementById("memberBizAddress").value.trim(),
        website: document.getElementById("memberBizWebsite").value.trim(),
        destinationUrl: document.getElementById("memberBizDestination").value.trim(),
        flyerUrl: document.getElementById("memberBizFlyer").value.trim(),
        discountText: document.getElementById("memberBizOffer").value.trim(),
        packageId: "community-standard"
      }});
      showIndiMartBusinessForm = false;
      notify(`Business submitted. Save reference code: ${result.referenceCode}`);
      window.dispatchEvent(new CustomEvent("indianclub:render"));
    } catch (error) { notify(error.message || "Could not submit business."); }
  };

  const openPaymentWhatsapp = (button, text) => {
    const phone = String(button.dataset.adminPhone || "").replace(/\D/g, "");
    if (!phone) return notify("Payment recorded, but no Flight Admin phone number is saved.");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Hello ${button.dataset.adminName || "Flight Admin"}, ${text}`)}`, "_blank", "noopener");
  };

  document.querySelectorAll("[data-credit-charge]").forEach(button => button.onclick = async () => {
    try {
      const result = await api(`/finance/charges/${encodeURIComponent(button.dataset.creditCharge)}/pay-with-credit`, { method: "POST" });
      const remaining = bhd(result.remainingBalanceFils || 0);
      notify(`Charge paid from credit. Payment ID: ${result.paymentCode}. Remaining credit: ${remaining}.`);
      openPaymentWhatsapp(button, `I have paid ${button.dataset.chargeAmount} from my verified club credit. Payment ID: ${result.paymentCode}. My remaining credit is ${remaining}. Please note it for my flight.`);
      window.dispatchEvent(new CustomEvent("indianclub:render"));
    } catch (error) { notify(error.message); }
  });

  document.querySelectorAll("[data-manual-charge]").forEach(button => button.onclick = async () => {
    const method = String(window.prompt("Enter CASH or BENEFIT", "BENEFIT") || "").trim().toUpperCase();
    const reference = String(window.prompt("Enter the Benefit reference or cash note") || "").trim();
    if (!method || !reference) return;
    if (!["CASH", "BENEFIT"].includes(method)) return notify("Choose CASH or BENEFIT.");
    try {
      const result = await api(`/finance/charges/${encodeURIComponent(button.dataset.manualCharge)}/payment-claim`, { method: "POST", body: { method, reference } });
      notify(`Cash / Benefit settlement sent to your Flight Admin for confirmation. Payment ID: ${result.paymentCode}.`);
      openPaymentWhatsapp(button, `I have paid ${button.dataset.chargeAmount} by ${method}. Payment ID: ${result.paymentCode}. Reference: ${reference}. Please verify my payment for the flight.`);
      window.dispatchEvent(new CustomEvent("indianclub:render"));
    } catch (error) { notify(error.message); }
  });

  document.querySelectorAll("[data-log-section]").forEach(button => button.onclick = () => {
    activityLogSection = button.dataset.logSection || "games";
    window.dispatchEvent(new CustomEvent("indianclub:render"));
  });

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
      await api(`/attendance/session/${encodeURIComponent(button.dataset.sessionId)}/correct`, { method: "POST", body: { memberUid: button.dataset.memberUid, status: button.dataset.attendanceCorrect, reason: reason.trim() } });
      notify("Attendance correction saved and audit-logged.");
      window.dispatchEvent(new CustomEvent("indianclub:render"));
    } catch (error) { notify(error.message); }
  });

  const saveCredentials = document.getElementById("saveCredentials");
  const previewProfilePhoto = document.getElementById("previewProfilePhoto");
  if (previewProfilePhoto) previewProfilePhoto.onclick = () => {
    const preview = document.getElementById("profilePhotoPreview");
    const image = imagePreviewUrl(document.getElementById("credentialProfilePhoto")?.value);
    if (!image) return notify("Paste a valid public Google Drive or HTTPS image link first.");
    preview.innerHTML = `<img src="${escapeHtml(image)}" alt="Profile photo preview" />`;
    preview.classList.remove("hidden");
  };
  if (saveCredentials) saveCredentials.onclick = async () => {
    try {
      const newPassword = document.getElementById("credentialNewPassword").value;
      const confirmation = document.getElementById("credentialConfirmPassword").value;
      if (newPassword !== confirmation) throw new Error("The new password and confirmation do not match.");
      await updateMyCredentials({
        fullName: document.getElementById("credentialFullName").value.trim(),
        memberId: document.getElementById("credentialMemberId").value.trim(),
        phone: `${document.getElementById("credentialCountryCode").value} ${document.getElementById("credentialPhone").value.trim()}`.trim(),
        email: document.getElementById("credentialEmail").value.trim(),
        currentPassword: document.getElementById("credentialCurrentPassword").value,
        newPassword,
        profilePhotoUrl: document.getElementById("credentialProfilePhoto").value.trim()
      });
      if (state.member) {
        state.member.fullName = document.getElementById("credentialFullName").value.trim() || state.member.fullName;
        state.member.profilePhotoUrl = document.getElementById("credentialProfilePhoto").value.trim() || null;
      }
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
