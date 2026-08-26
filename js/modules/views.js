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
  const [data, personalSessions] = await Promise.all([api("/members/dashboard"), api("/timetable/mine")]);
  const next = (personalSessions || [])
    .filter(session => session.status === "SCHEDULED" && Number.isFinite(new Date(session.startAt).getTime()) && new Date(session.startAt).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0] || null;

  return `
    <div class="page-head">
      <div>
        <h2>Welcome, ${escapeHtml(member.fullName)}</h2>
        <p>${escapeHtml(member.flightName || "Your flight will be assigned by Super Admin.")}</p>
      </div>
      ${next ? "<span class='tag blue'>UPCOMING GAME</span>" : ""}
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
            <span class="tag blue">UPCOMING</span>
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
      <p class="note">You can update only your own response until 15 minutes before game start. After the game begins, your Flight Admin can correct actual attendance with an audit reason.</p>
      <div class="session"><div class="grow"><b>My attendance</b></div>${attendanceBadge(session.myAttendance)}</div>
      ${session.canRespond ? `<div class="actions"><button class="primary" data-attendance="PRESENT" data-session-id="${escapeHtml(session.id)}">I am coming</button><button class="pill" data-attendance="ABSENT" data-session-id="${escapeHtml(session.id)}">I am not coming</button></div>` : ""}
    </section>
    <section class="card"><h3>Players coming for this game</h3><p class="note">Only members of ${escapeHtml(session.flightName)} who responded “I am coming” are shown here. Their attendance is read-only on this screen; only your own response can be changed in Attendance.</p>${(session.roster || []).map(person => `<div class="session"><div class="avatar">${escapeHtml((person.fullName || "M").split(" ").map(word => word[0]).join("").slice(0, 2))}</div><div class="grow"><b>${escapeHtml(person.fullName)}</b><p>${escapeHtml(person.memberId || "")}</p></div>${attendanceBadge(person.status)}${session.canCorrect ? `<div class="actions"><button class="pill" data-attendance-correct="PRESENT" data-member-uid="${escapeHtml(person.uid)}" data-session-id="${escapeHtml(session.id)}">Present</button><button class="pill" data-attendance-correct="ABSENT" data-member-uid="${escapeHtml(person.uid)}" data-session-id="${escapeHtml(session.id)}">Absent</button></div>` : ""}</div>`).join("") || "<p class='note'>No members have responded “I am coming” yet.</p>"}</section>
    ${session.canCorrect ? `<section class="card"><h3>Attendance correction audit</h3>${audit.map(item => `<div class="session"><div class="grow"><b>${escapeHtml(item.previousStatus)} → ${escapeHtml(item.newStatus)}</b><p>${escapeHtml(item.reason)} · ${escapeHtml(dateTime(item.createdAt))}</p></div></div>`).join("") || "<p class='note'>No corrections have been recorded for this session.</p>"}</section>` : ""}`;
}

let activityLogSection = "games";

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
    const paymentControls = !row ? `<div class="actions"><button class="primary" disabled>Use credit</button><button class="pill" disabled>Cash / Benefit pay</button><button class="pill" disabled>WhatsApp payment message</button></div>` : Number(row.amountDueFils || 0) > 0 && payment?.status === "PENDING" ? `<div class="actions"><span class="tag amber">CASH / BENEFIT PENDING</span><button class="pill" data-paid-whatsapp="${escapeHtml(row.id)}" data-admin-phone="${escapeHtml(adminContact.phone || "")}" data-admin-name="${escapeHtml(adminContact.name || "Flight Admin")}" data-payment-code="${escapeHtml(paymentId)}" data-payment-method="${escapeHtml(paymentMethod || "CASH / BENEFIT")}" data-charge-amount="${escapeHtml(bhd(row.totalChargeFils))}">WhatsApp payment message</button></div>` : Number(row.amountDueFils || 0) > 0 ? `<div class="actions"><button class="primary" data-credit-charge="${escapeHtml(row.id)}" data-admin-phone="${escapeHtml(adminContact.phone || "")}" data-admin-name="${escapeHtml(adminContact.name || "Flight Admin")}" data-charge-amount="${escapeHtml(displayPayable)}">Use credit</button><button class="pill" data-manual-charge="${escapeHtml(row.id)}" data-admin-phone="${escapeHtml(adminContact.phone || "")}" data-admin-name="${escapeHtml(adminContact.name || "Flight Admin")}" data-charge-amount="${escapeHtml(displayPayable)}">Cash / Benefit pay</button></div>` : `<div class="actions"><span class="tag blue">${escapeHtml(String(row.status || "PAID").replaceAll("_", " "))}</span><button class="pill" data-paid-whatsapp="${escapeHtml(row.id)}" data-admin-phone="${escapeHtml(adminContact.phone || "")}" data-admin-name="${escapeHtml(adminContact.name || "Flight Admin")}" data-payment-code="${escapeHtml(paymentId)}" data-payment-method="${escapeHtml(paymentMethod || "WALLET CREDIT")}" data-charge-amount="${escapeHtml(bhd(row.totalChargeFils))}">WhatsApp payment message</button></div>`;
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
  return `<div class="page-head"><div><span class="tag blue">MY ACCOUNT</span><h2>Update Credentials</h2><p>Keep your Member ID and phone number current. You may also update your email or password securely.</p></div></div>
    <section class="card"><div class="grid two">
      <div class="field"><label for="credentialMemberId">Member ID</label><input id="credentialMemberId" value="${escapeHtml(member.memberId || "")}" placeholder="ICB-PL-001" /></div>
      <div class="field"><label for="credentialPhone">Phone number</label><div class="phone-field"><select id="credentialCountryCode" aria-label="Country code">${countryCodeOptions(member.phone)}</select><input id="credentialPhone" type="tel" inputmode="tel" autocomplete="tel" value="${escapeHtml(localPhoneNumber(member.phone))}" placeholder="Phone number" /></div></div>
      <div class="field"><label for="credentialEmail">Email address</label><input id="credentialEmail" type="email" autocomplete="email" value="${escapeHtml(member.email || "")}" /></div>
      <div class="field"><label for="credentialCurrentPassword">Current password <small>(required only to change email or password)</small></label><div class="password-field"><input id="credentialCurrentPassword" type="password" autocomplete="current-password" /><button type="button" class="password-toggle" data-toggle-password="credentialCurrentPassword">Show</button></div></div>
      <div class="field"><label for="credentialNewPassword">New password <small>(leave blank to keep your current password)</small></label><div class="password-field"><input id="credentialNewPassword" type="password" autocomplete="new-password" placeholder="At least 8 characters" /><button type="button" class="password-toggle" data-toggle-password="credentialNewPassword">Show</button></div></div>
      <div class="field"><label for="credentialConfirmPassword">Confirm new password</label><div class="password-field"><input id="credentialConfirmPassword" type="password" autocomplete="new-password" /><button type="button" class="password-toggle" data-toggle-password="credentialConfirmPassword">Show</button></div></div>
    </div><div class="actions"><button id="saveCredentials" class="primary">Save credentials</button></div><p class="note">If you have forgotten your password, use the <b>Forgot password?</b> link on the Member / Admin Login screen. A reset email will be sent to your registered email address.</p></section>`;
}

export async function publicIndiMart() {
  const businesses = await api("/business/public/directory");
  return `<div class="page-head"><div><h2>Indi Mart</h2><p>Approved Indian community businesses in Bahrain.</p></div></div><section class="card"><button id="showPublicBusinessForm" class="primary">List your business</button><button id="showBusinessUpdate" class="pill" style="margin-left:8px">Update existing advertisement</button></section><section class="grid">${businesses.map(b => `<article class="card"><h3>${escapeHtml(b.businessName)}</h3><p class="note">${escapeHtml(b.category)}</p><p>${escapeHtml(b.description)}</p><p><b>Contact:</b> ${escapeHtml(b.phone)}</p>${b.website ? `<a href="${escapeHtml(b.website)}" target="_blank" rel="noopener">Visit website</a>` : ""}</article>`).join("") || "<article class='card'><p class='note'>No approved listings currently.</p></article>"}</section>`;
}

export function businessSubmissionForm() {
  return `<section class="card"><h2>List Your Business</h2><p class="business-lock">This request enters Super Admin approval. It does not create club login access.</p><div class="field"><label>Business name</label><input id="publicBizName"></div><div class="field"><label>Phone</label><input id="publicBizPhone"></div><div class="field"><label>Category</label><input id="publicBizCategory"></div><div class="field"><label>Description</label><textarea id="publicBizDescription"></textarea></div><button id="publicBizSubmit" class="primary">Submit for approval</button></section>`;
}

export function bindBusinessSubmission() {
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

  document.querySelectorAll("[data-paid-whatsapp]").forEach(button => button.onclick = () => {
    openPaymentWhatsapp(button, `My shuttlecock payment of ${button.dataset.chargeAmount} is recorded by ${button.dataset.paymentMethod}. Payment ID: ${button.dataset.paymentCode}. Please note it for my flight.`);
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
