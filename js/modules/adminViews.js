
import { api } from "./auth.js";
import { state } from "../router.js";

const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const bhd = fils => `BHD ${(Number(fils || 0) / 1000).toFixed(3)}`;

const recordDate = value => {
  if (!value) return "—";
  const date = value?._seconds ? new Date(Number(value._seconds) * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-BH", { dateStyle: "medium" });
};

const inputDate = value => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bahrain", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(date);
  const part = type => parts.find(item => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

const imageUrl = value => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const id = url.hostname.endsWith("drive.google.com")
      ? (url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get("id"))
      : null;
    return id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600` : url.toString();
  } catch { return ""; }
};

async function uploadAdminImage(file) {
  if (!file) throw new Error("Choose a PNG, JPEG, or WebP image first.");
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("Only PNG, JPEG, or WebP images are allowed.");
  if (file.size > 2 * 1024 * 1024) throw new Error("Image must be 2 MB or smaller.");
  const result = await api("/business/admin/upload-image", {
    method: "POST", body: file, confirm: false,
    loadingLabel: "Uploading image…",
    headers: { "Content-Type": file.type, "X-File-Name": file.name }
  });
  return result.imageUrl;
}

// ===== STATE VARIABLES =====
let selectedMasterMonth = new Date().toISOString().slice(0, 7);
let selectedMasterActivityId = "";
let selectedFinanceActivityId = "";
let selectedFinanceFlightId = "";
let selectedFinanceTab = "credits";
let selectedFinanceCreditMemberId = "";
let selectedRosterActivityId = "";
let selectedRosterFlightId = "";
let latestInvitation = null;
let selectedAuditCategory = "ALL";
let selectedAuditActivityId = "";
let selectedAuditFlightId = "";
let selectedAuditDate = "";
let selectedAuditMember = "";

// ===== HELPER FUNCTIONS =====
function requireSuperAdmin() {
  if (state.member?.role !== "SUPER_ADMIN") throw new Error("Only Super Admin can access this module.");
}

function refresh() {
  window.dispatchEvent(new CustomEvent("indianclub:render"));
}

function notify(message) {
  window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: message }));
}

function flattenFlights(activities) {
  return activities.flatMap(activity =>
    (activity.flights || []).map(flight => ({
      ...flight, activityId: activity.id, activityName: activity.name
    }))
  );
}

function flightOptions(activities, selectedFlightId = "") {
  return activities.map(activity => `
    <optgroup label="${escapeHtml(activity.name)}">
      ${(activity.flights || []).map(flight => `
        <option value="${escapeHtml(flight.id)}" ${flight.id === selectedFlightId ? "selected" : ""}>
          ${escapeHtml(flight.name)}
        </option>
      `).join("")}
    </optgroup>
  `).join("");
}

function financeRows(rows, emptyText, options = {}) {
  if (!rows?.length) return `<p class="note">${escapeHtml(emptyText)}</p>`;
  const due = Boolean(options.showAmountDue);
  const reminders = Boolean(options.showReminder);
  const dates = Boolean(options.showDate);
  return `
    <div class="table-wrap">
      <table class="schedule">
        <thead><tr>
          <th>Player</th>
          ${dates ? "<th>Date</th>" : ""}
          <th>Flight</th>
          <th>Amount</th>
          <th>Status</th>
          ${reminders ? "<th>Action</th>" : ""}
        </tr></thead>
        <tbody>
          ${rows.map(row => {
            const amountFils = due ? row.amountDueFils : (row.balanceFils ?? row.totalChargeFils ?? row.amountFils ?? 0);
            const status = row.status || (Number(row.balanceFils || 0) < 1000 ? "DUE" : "CREDIT AVAILABLE");
            return `
              <tr>
                <td>${escapeHtml(row.memberName || row.memberId || row.memberUid)}<br><small>${escapeHtml(row.memberId || "")}</small></td>
                ${dates ? `<td>${escapeHtml(recordDate(row.updatedAt || row.paidAt || row.createdAt || row.dueAt))}</td>` : ""}
                <td>${escapeHtml(row.flightName || "—")}</td>
                <td>${bhd(amountFils)}</td>
                <td><span class="tag">${escapeHtml(status)}</span></td>
                ${reminders ? `<td><button class="pill" data-whatsapp-reminder="${escapeHtml(row.phone || "")}" data-whatsapp-name="${escapeHtml(row.memberName || "")}" data-whatsapp-amount="${bhd(row.amountDueFils || 0)}">WhatsApp reminder</button></td>` : ""}
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function auditDateKey(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Bahrain", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(date);
  const valueFor = type => parts.find(part => part.type === type)?.value || "";
  return `${valueFor("year")}-${valueFor("month")}-${valueFor("day")}`;
}

function auditPrint(sectionId, title) {
  const section = document.getElementById(sectionId);
  if (!section) return notify("The current log is not ready to print.");
  const printWindow = window.open("", "_blank", "width=960,height=720");
  if (!printWindow) return notify("Allow pop-ups to print this page.");
  printWindow.opener = null;
  printWindow.document.write(`<html><head><title>${title}</title><style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px;text-align:left;font-size:12px}th{background:#f5f5f5}</style></head><body>${section.outerHTML}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function auditScopeOptions(records) {
  const activities = [...new Map(
    records.filter(row => row.activityId).map(row => [row.activityId, row.activityName || row.activityId])
  ).entries()];
  const flights = records.filter(row => row.flightId && (!selectedAuditActivityId || row.activityId === selectedAuditActivityId));
  const flightOpts = [...new Map(
    flights.map(row => [row.flightId, row.flightName || row.flightId])
  ).entries()];
  const memberOptions = [...new Set(
    records.flatMap(row => [row.subject, row.actor]).filter(Boolean)
  )].sort((a, b) => String(a).localeCompare(String(b)));
  return { activities, flightOptions: flightOpts, memberOptions };
}

// ===== AUDIT LOG BASE FUNCTION =====
async function superAdminAuditLogView(options = {}) {
  requireSuperAdmin();
  const records = await api("/members/audit");
  const title = options.title || "Audit History";
  const description = options.description || "Read-only club history of member, attendance, payment, game, and stock actions.";
  const permittedCategories = options.categories || ["MEMBER", "ATTENDANCE", "WALLET / PAYMENT", "SESSION CONTROL", "SHUTTLE STOCK"];

  if (!permittedCategories.includes(selectedAuditCategory) && selectedAuditCategory !== "ALL")
    selectedAuditCategory = "ALL";

  const { activities, flightOptions: flightOpts, memberOptions } = auditScopeOptions(records);
  if (selectedAuditActivityId && !activities.some(([id]) => id === selectedAuditActivityId)) selectedAuditActivityId = "";
  if (selectedAuditFlightId && !flightOpts.some(([id]) => id === selectedAuditFlightId)) selectedAuditFlightId = "";

  const displayedRecords = records.filter(row => {
    if (!permittedCategories.includes(row.category)) return false;
    if (selectedAuditCategory !== "ALL" && row.category !== selectedAuditCategory) return false;
    if (selectedAuditActivityId && row.activityId !== selectedAuditActivityId) return false;
    if (selectedAuditFlightId && row.flightId !== selectedAuditFlightId) return false;
    if (selectedAuditDate && auditDateKey(row.createdAt) !== selectedAuditDate && auditDateKey(row.sessionDate) !== selectedAuditDate) return false;
    if (selectedAuditMember && row.subject !== selectedAuditMember && row.actor !== selectedAuditMember) return false;
    return true;
  });

  const categoryButtons = ["ALL", ...permittedCategories].map(category =>
    `<button class="pill ${selectedAuditCategory === category ? "active" : ""}" data-audit-category="${escapeHtml(category)}">${escapeHtml(category === "ALL" ? "All actions" : category)}</button>`
  ).join("");

  return `
    <section class="card">
      <span class="tag blue">SUPER ADMIN · READ ONLY</span>
      <h2>${escapeHtml(title)}</h2>
      <p class="note">${escapeHtml(description)}</p>
      <div class="actions">
        <button class="pill" data-print-audit-log>🖨️ Print current log</button>
      </div>
    </section>

    <section class="card">
      <h3>Filter this log</h3>
      <div class="actions">${categoryButtons}</div>
      <div class="grid two">
        <div class="field">
          <label>Activity</label>
          <select id="auditActivityFilter">
            <option value="">All activities</option>
            ${activities.map(([id, name]) => `<option value="${escapeHtml(id)}" ${selectedAuditActivityId === id ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Flight / Level</label>
          <select id="auditFlightFilter">
            <option value="">All levels</option>
            ${flightOpts.map(([id, name]) => `<option value="${escapeHtml(id)}" ${selectedAuditFlightId === id ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Date</label>
          <input type="date" id="auditDateFilter" value="${selectedAuditDate}">
        </div>
        <div class="field">
          <label>Member name</label>
          <select id="auditMemberFilter">
            <option value="">All members and admins</option>
            ${memberOptions.map(name => `<option value="${escapeHtml(name)}" ${selectedAuditMember === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}
          </select>
        </div>
      </div>
    </section>

    <section class="card" id="superAdminAuditPrint">
      <h3>${displayedRecords.length} matching action${displayedRecords.length === 1 ? "" : "s"}</h3>
      <p class="note">Player and Flight Admin activity retains the date, level, member, action, and actor.</p>
      <div class="table-wrap">
        <table class="schedule">
          <thead><tr><th>Date</th><th>Category</th><th>Action</th><th>Member / Flight</th><th>Details</th><th>By</th></tr></thead>
          <tbody>
            ${displayedRecords.map(row => `
              <tr>
                <td>${escapeHtml(recordDate(row.createdAt))}${row.sessionDate ? `<br><small>Game: ${escapeHtml(recordDate(row.sessionDate))}</small>` : ""}</td>
                <td><span class="tag amber">${escapeHtml(row.category || "—")}</span></td>
                <td>${escapeHtml(row.action || "—")}</td>
                <td>${escapeHtml(row.subject || "—")}<br><small>${escapeHtml(row.activityName || "Club")} · ${escapeHtml(row.flightName || "All levels")}</small></td>
                <td>${escapeHtml(row.detail || "—")}</td>
                <td>${escapeHtml(row.actor || "System")}</td>
              </tr>
            `).join("") || `<tr><td colspan="6" class="note">No actions match the selected filters.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

// ===== SUPER ADMIN HOME VIEW =====
export async function superAdminHomeView() {
  requireSuperAdmin();
  const records = await api("/members/audit");
  const latest = records.slice(0, 5);
  const count = category => records.filter(row => row.category === category).length;

  return `
    <section class="card">
      <span class="tag blue">SUPER ADMIN</span>
      <h2>Club Oversight</h2>
      <p class="note">Review Player and Flight Admin history by activity, level, date, member, and action without changing the personal Player dashboard.</p>
    </section>

    <div class="grid two">
      <section class="card"><h3>👥 Member actions</h3><div class="session"><b>${count("MEMBER")}</b></div><small>Registration and profile records</small></section>
      <section class="card"><h3>💰 Wallet actions</h3><div class="session"><b>${count("WALLET / PAYMENT")}</b></div><small>Credits and payment records</small></section>
      <section class="card"><h3>🎮 Completed sessions</h3><div class="session"><b>${count("SESSION CONTROL")}</b></div><small>Final game records</small></section>
      <section class="card"><h3>📦 Stock actions</h3><div class="session"><b>${count("SHUTTLE STOCK")}</b></div><small>Shuttle stock audit</small></section>
    </div>

    <section class="card">
      <h3>🔗 Open a filtered club log</h3>
      <div class="actions">
        <button class="pill" onclick="window.navigate('activityLog')">👥 Player & Admin Activity</button>
        <button class="pill" onclick="window.navigate('walletLog')">💰 Wallet & Payments</button>
        <button class="pill" onclick="window.navigate('sessionLog')">🎮 Session Control Logs</button>
        <button class="pill" onclick="window.navigate('stockLog')">📦 Shuttle Stock Logs</button>
        <button class="pill" onclick="window.navigate('auditLogs')">📜 All Audit History</button>
      </div>
    </section>

    <section class="card">
      <h3>📜 Most recent club actions</h3>
      ${latest.map(row => `
        <div class="session">
          <b>${escapeHtml(row.action || "Club action")}</b>
          <small>${escapeHtml(row.subject || "Club")} · ${escapeHtml(recordDate(row.createdAt))}</small>
          <span class="tag amber">${escapeHtml(row.category || "AUDIT")}</span>
        </div>
      `).join("") || `<p class="note">No club actions have been recorded yet.</p>`}
    </section>
  `;
}

// ===== FILTERED AUDIT LOG VIEWS =====
export async function superAdminActivityLogView() {
  return superAdminAuditLogView({
    title: "Player & Flight Admin Activity",
    description: "Registration, profile, and attendance activity by Players and Flight Admins.",
    categories: ["MEMBER", "ATTENDANCE"]
  });
}

export async function superAdminWalletLogView() {
  return superAdminAuditLogView({
    title: "Player Wallet & Payment Log",
    description: "Read-only Player credit, charge, and Cash / Benefit payment activity across all levels.",
    categories: ["WALLET / PAYMENT"]
  });
}

export async function superAdminSessionLogView() {
  return superAdminAuditLogView({
    title: "Flight Admin Session Control Log",
    description: "Final attendance and completed-game records from every level.",
    categories: ["ATTENDANCE", "SESSION CONTROL"]
  });
}

export async function superAdminStockLogView() {
  return superAdminAuditLogView({
    title: "Flight Admin Shuttle Stock Log",
    description: "Read-only stock and completed-game shuttle-usage history across all levels.",
    categories: ["SHUTTLE STOCK"]
  });
}

// ===== ACTIVITIES & FLIGHTS VIEW =====
export async function activitiesAndFlightsView() {
  requireSuperAdmin();
  const [activities, allMembers, deletedUsers] = await Promise.all([
    api("/activities"), api("/members"), api("/members/deleted")
  ]);
  const flights = flattenFlights(activities);
  const accounts = allMembers.filter(member => ["PLAYER", "LEVEL_ADMIN"].includes(member.role));
  const rosterFlights = selectedRosterActivityId
    ? flights.filter(flight => flight.activityId === selectedRosterActivityId)
    : flights;
  if (selectedRosterFlightId && !rosterFlights.some(flight => flight.id === selectedRosterFlightId))
    selectedRosterFlightId = "";
  const roster = accounts.filter(member =>
    selectedRosterFlightId ? member.flightId === selectedRosterFlightId
    : selectedRosterActivityId ? rosterFlights.some(flight => flight.id === member.flightId)
    : true
  );

  return `
    <section class="card">
      <span class="tag blue">SUPER ADMIN</span>
      <h2>Activities, Flights & Members</h2>
      <p class="note">Create activities, manage levels, view every roster, and assign delegated Flight Admins.</p>
    </section>

    <section class="card">
      <h3>➕ Add sport / activity</h3>
      <div class="field">
        <label>Activity name</label>
        <input type="text" id="newActivityName" placeholder="e.g. Badminton">
      </div>
      <button class="primary" id="createActivity">Create activity</button>
    </section>

    ${activities.map(activity => `
      <section class="card">
        <span class="tag ${activity.active ? "blue" : "red"}">${activity.active ? "ACTIVE" : "INACTIVE"}</span>
        <h3>${escapeHtml(activity.name)}</h3>
        <p class="note">${activity.flights?.length || 0} flight(s). Courts are always 1 and 2.</p>
        <button class="pill" data-toggle-activity="${escapeHtml(activity.id)}" data-active="${activity.active}">
          ${activity.active ? "Deactivate" : "Activate"}
        </button>

        ${(activity.flights || []).map(flight => `
          <div class="session">
            <span class="tag blue">2 courts</span>
            <b>${escapeHtml(flight.name)}</b>
            <small>Display order: ${Number(flight.sortOrder ?? 999)}</small>
            <span class="tag ${flight.active ? "blue" : "red"}">${flight.active ? "ACTIVE" : "INACTIVE"}</span>
            <button class="pill" data-toggle-flight="${escapeHtml(flight.id)}" data-activity-id="${escapeHtml(activity.id)}" data-active="${flight.active}">
              ${flight.active ? "Deactivate" : "Activate"}
            </button>
          </div>
        `).join("") || `<p class="note">No flights yet.</p>`}

        <div class="grid two">
          <div class="field">
            <label>New flight name</label>
            <input type="text" id="flightName-${escapeHtml(activity.id)}" placeholder="e.g. Flight 1">
          </div>
          <div class="field">
            <label>Display order</label>
            <input type="number" id="flightSort-${escapeHtml(activity.id)}" value="1" min="1">
          </div>
        </div>
        <button class="pill" data-create-flight="${escapeHtml(activity.id)}">Add flight</button>
      </section>
    `).join("") || `<p class="note">Create Badminton first.</p>`}

    <section class="card">
      <h3>👤 PRE-REGISTER PLAYER OR FLIGHT ADMIN</h3>
      <p class="note">Super Admin records the chosen name, phone number, role, and level. The member later matches the same name and phone number to create their own Member ID, email address, and password.</p>
      <div class="grid two">
        <div class="field"><label>Registered name</label><input type="text" id="memberFullName" placeholder="Full name"></div>
        <div class="field"><label>Phone / WhatsApp number</label><input type="tel" id="memberPhone" placeholder="+973 XXXX XXXX"></div>
        <div class="field">
          <label>Account role</label>
          <select id="memberRole">
            <option value="PLAYER">Player</option>
            <option value="LEVEL_ADMIN">Flight Admin / Delegate</option>
          </select>
        </div>
        <div class="field">
          <label>Assigned flight</label>
          <select id="memberFlight">
            <option value="">Choose a flight</option>
            ${flightOptions(activities)}
          </select>
        </div>
      </div>
      <button class="primary" id="createMember">Pre-register member</button>
    </section>

    ${latestInvitation ? `
      <section class="card">
        <span class="tag blue">MEMBER PRE-REGISTERED</span>
        <h3>${escapeHtml(latestInvitation.fullName)}</h3>
        <p class="note">The member can now open the app and use the same registered name and phone number to create their own email and password.</p>
        <div class="actions">
          <button class="pill" data-whatsapp-onboarding-name="${escapeHtml(latestInvitation.fullName)}" data-whatsapp-onboarding-phone="${escapeHtml(latestInvitation.phone || "")}">WhatsApp app link</button>
          <button class="pill" id="hideLatestInvitation">Done</button>
        </div>
      </section>
    ` : ""}

    <section class="card">
      <h3>📋 ALL LEVELS ROSTER</h3>
      <p class="note">Players and Flight Admins. To promote an existing Player, choose Flight Admin / Delegate, select one flight, then save.</p>
      <div class="grid two">
        <div class="field">
          <label>Activity</label>
          <select id="rosterActivityFilter">
            <option value="">All activities</option>
            ${activities.map(activity => `<option value="${escapeHtml(activity.id)}" ${selectedRosterActivityId === activity.id ? "selected" : ""}>${escapeHtml(activity.name)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Flight / Level</label>
          <select id="rosterFlightFilter">
            <option value="">All flights in this selection</option>
            ${rosterFlights.map(flight => `<option value="${escapeHtml(flight.id)}" ${selectedRosterFlightId === flight.id ? "selected" : ""}>${escapeHtml(flight.activityName)} · ${escapeHtml(flight.name)}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="table-wrap">
        <table class="schedule">
          <thead><tr><th>Member</th><th>Role</th><th>Assigned flight</th><th>Access</th><th>Save</th></tr></thead>
          <tbody>
            ${roster.map(member => `
              <tr>
                <td>${escapeHtml(member.fullName)}<br><small>${escapeHtml(member.memberId || "")} · ${escapeHtml(member.email || "")}</small></td>
                <td>
                  <select id="memberRole-${escapeHtml(member.uid)}">
                    <option value="PLAYER" ${member.role === "PLAYER" ? "selected" : ""}>Player</option>
                    <option value="LEVEL_ADMIN" ${member.role === "LEVEL_ADMIN" ? "selected" : ""}>Flight Admin / Delegate</option>
                  </select>
                </td>
                <td>
                  <select id="memberFlight-${escapeHtml(member.uid)}">
                    ${flightOptions(activities, member.flightId)}
                  </select>
                </td>
                <td><span class="tag ${member.active ? "blue" : "red"}">${member.active ? "ACTIVE" : "INACTIVE"}</span></td>
                <td>
                  <div class="actions">
                    <button class="pill" data-save-member="${escapeHtml(member.uid)}">Save role / flight</button>
                    <button class="pill" data-toggle-member="${escapeHtml(member.uid)}" data-active="${member.active}">${member.active ? "Deactivate" : "Activate"}</button>
                  </div>
                </td>
              </tr>
            `).join("") || `<tr><td colspan="5" class="note">No account exists for this selection.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <h3>🗑️ DELETED USERS</h3>
      <p class="note">Permanent deletions are recorded here. A phone number can only be registered again after permanent deletion.</p>
      <button class="pill" data-print-deleted-users>🖨️ Print register</button>
      ${deletedUsers.map(member => `
        <div class="session">
          <b>${escapeHtml(member.fullName || member.registeredName || "Deleted member")}</b>
          <small>${escapeHtml(member.phone || "No phone")} · Deleted ${escapeHtml(recordDate(member.deletedAt))}</small>
          <span class="tag red">PERMANENTLY DELETED</span>
        </div>
      `).join("") || `<p class="note">No permanently deleted users are recorded.</p>`}
    </section>
  `;
}

// ===== SUPER ADMIN TIMETABLE VIEW =====
export async function superAdminTimetableView() {
  requireSuperAdmin();
  const baseData = await api(`/timetable/master?${new URLSearchParams({ month: selectedMasterMonth }).toString()}`);
  const activities = baseData.activities || [];
  if (!activities.some(activity => activity.id === selectedMasterActivityId))
    selectedMasterActivityId = baseData.activityId || activities[0]?.id || "";

  const query = new URLSearchParams({ month: selectedMasterMonth });
  if (selectedMasterActivityId) query.set("activityId", selectedMasterActivityId);
  const data = selectedMasterActivityId === baseData.activityId ? baseData : await api(`/timetable/master?${query.toString()}`);
  const flights = data.flights || [];

  return `
    <section class="card">
      <span class="tag blue">SUPER ADMIN</span>
      <h2>Master Timetable</h2>
      <p class="note">Weekly pattern for the selected month. Courts always use 1 and 2.</p>
    </section>

    <section class="card">
      <div class="grid two">
        <div class="field"><label>Month</label><input type="month" id="masterMonth" value="${selectedMasterMonth}"></div>
        <div class="field">
          <label>Activity</label>
          <select id="masterActivity">
            ${activities.map(activity => `<option value="${escapeHtml(activity.id)}" ${selectedMasterActivityId === activity.id ? "selected" : ""}>${escapeHtml(activity.name)}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="actions">
        <button class="primary" id="loadMasterMonth">Load timetable</button>
        <button class="pill" id="publishMasterMonth">Publish this month</button>
      </div>
    </section>

    <section class="card">
      <div class="table-wrap">
        <table class="schedule">
          <thead><tr><th>Day</th><th>Flight</th><th>Start</th><th>End</th><th>Courts</th><th>Action</th></tr></thead>
          <tbody>
            ${(data.weeklyPattern || []).map(slot => `
              <tr>
                <td>${escapeHtml(slot.weekday)}</td>
                <td>${escapeHtml(slot.flightName)}</td>
                <td>${escapeHtml(slot.startTime)}</td>
                <td>${escapeHtml(slot.endTime)}</td>
                <td>1 & 2</td>
                <td><button class="pill" data-delete-slot="${escapeHtml(slot.id)}">Remove</button></td>
              </tr>
            `).join("") || `<tr><td colspan="6" class="note">No weekly slots yet.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <h3>📤 Bulk weekly grid</h3>
      <p class="note">Paste one row per occupied cell. Format: weekday, flight, start time, end time. The app auto-removes header lines and rejects duplicates.</p>
      <div class="field">
        <label>CSV rows: weekday, flight, start time, end time</label>
        <textarea id="bulkTimetableCsv" rows="6" placeholder="Saturday,Flight 2,18:35,19:35"></textarea>
      </div>
      <div class="actions">
        <button class="primary" id="importBulkTimetable">Import weekly grid</button>
        <button class="pill" id="downloadBulkTemplate">Download CSV template</button>
      </div>
    </section>

    <section class="card">
      <h3>➕ Add weekly flight slot</h3>
      <div class="grid two">
        <div class="field">
          <label>Day</label>
          <select id="slotDay">
            <option value="Sunday">Sunday</option><option value="Monday">Monday</option><option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option><option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option><option value="Saturday">Saturday</option>
          </select>
        </div>
        <div class="field">
          <label>Flight</label>
          <select id="slotFlight">
            ${flights.map(flight => `<option value="${escapeHtml(flight.id)}">${escapeHtml(flight.name)}</option>`).join("")}
          </select>
        </div>
        <div class="field"><label>Start time</label><input type="time" id="slotStart"></div>
        <div class="field"><label>End time</label><input type="time" id="slotEnd"></div>
      </div>
      <button class="primary" id="saveMasterSlot">Save weekly slot</button>
    </section>
  `;
}

// ===== FINANCE ADMIN VIEW =====
export async function financeAdminView() {
  const isSuperAdmin = state.member?.role === "SUPER_ADMIN",
        isFlightAdmin = state.member?.role === "LEVEL_ADMIN";
  if (!isSuperAdmin && !isFlightAdmin) throw new Error("Only Flight Admin or Super Admin can access finance.");

  const [activities, members] = await Promise.all([
    api("/activities"),
    isSuperAdmin ? api("/members") : Promise.resolve([])
  ]);
  const flights = flattenFlights(activities);

  if (selectedFinanceActivityId && !activities.some(activity => activity.id === selectedFinanceActivityId))
    selectedFinanceActivityId = "";
  const selectedFlights = selectedFinanceActivityId
    ? flights.filter(flight => flight.activityId === selectedFinanceActivityId) : flights;
  if (selectedFinanceFlightId && !selectedFlights.some(flight => flight.id === selectedFinanceFlightId))
    selectedFinanceFlightId = "";

  const query = new URLSearchParams();
  if (isSuperAdmin && selectedFinanceFlightId) query.set("flightId", selectedFinanceFlightId);
  else if (isSuperAdmin && selectedFinanceActivityId) query.set("activityId", selectedFinanceActivityId);

  let data;
  try {
    data = await api(`/finance/overview${query.size ? `?${query.toString()}` : ""}`);
  } catch (error) {
    const message = String(error?.message || error || "");
    if (!isSuperAdmin || (!message.toLowerCase().includes("selected flight") && !message.toLowerCase().includes("invalid option"))) throw error;
    selectedFinanceActivityId = "";
    selectedFinanceFlightId = "";
    data = await api("/finance/overview");
  }

  const allowedFlights = new Set(selectedFlights.map(flight => flight.id));
  const players = members.filter(member =>
    member.active && member.flightId &&
    ["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role) &&
    (!selectedFinanceFlightId || member.flightId === selectedFinanceFlightId) &&
    (!selectedFinanceActivityId || allowedFlights.has(member.flightId))
  );
  const creditRecipients = players;

  if (selectedFinanceCreditMemberId && !creditRecipients.some(member => member.uid === selectedFinanceCreditMemberId))
    selectedFinanceCreditMemberId = "";

  const selectedCreditBalanceFils = Number(
    (data.credits || []).find(row => row.memberUid === selectedFinanceCreditMemberId)?.balanceFils || 0
  );

  const scope = isFlightAdmin
    ? (data.scope?.flights?.[0]?.name || state.member?.flightName || "Your flight")
    : selectedFinanceFlightId
      ? (flights.find(flight => flight.id === selectedFinanceFlightId)?.name || "Selected flight")
      : selectedFinanceActivityId
        ? (activities.find(activity => activity.id === selectedFinanceActivityId)?.name || "Selected activity")
        : "All activities and flights";

  const tabs = {
    credits: {
      label: "Credited Players",
      content: `
        <section class="card">
          <h3>Add or deduct member credit</h3>
          <p class="note">First select Activity and Flight / Level above. The Member list below then shows only active members assigned to that selection. Changing a filter intentionally returns the Member field to \u201cChoose member\u201d; it never selects a recipient automatically.</p>

          <div class="field">
            <label>Member receiving credit</label>
            <select id="financeCreditMember">
              <option value="">Choose member${selectedFinanceFlightId ? " in selected level" : selectedFinanceActivityId ? " in selected activity" : ""}</option>
              ${creditRecipients.map(member => `
                <option value="${escapeHtml(member.uid)}" data-wallet-balance="${Number((data.credits || []).find(row => row.memberUid === member.uid)?.balanceFils || 0)}" ${selectedFinanceCreditMemberId === member.uid ? "selected" : ""}>
                  ${escapeHtml(member.fullName)} &middot; ${escapeHtml(member.memberId || "No ID")} &middot; ${escapeHtml(member.flightName || flights.find(flight => flight.id === member.flightId)?.name || "Assigned flight")} &middot; ${escapeHtml(String(member.role || "PLAYER").replaceAll("_", " "))}
                </option>
              `).join("")}
            </select>
          </div>

          <p class="note" id="financeSelectedMemberPreview">
            ${selectedFinanceCreditMemberId
              ? `<b>Selected member:</b> ${escapeHtml(creditRecipients.find(member => member.uid === selectedFinanceCreditMemberId)?.fullName || "selected member")}<br><b>Current wallet credit:</b> ${bhd(selectedCreditBalanceFils)}`
              : creditRecipients.length
                ? "Choose the exact member before adding or deducting credit."
                : "No active member is assigned to this activity / level yet."}
          </p>

          <div class="grid two">
            <div class="field">
              <label>Credit to add in BHD</label>
              <input type="number" id="financeCreditAmount" step="0.001" min="0.001" placeholder="0.000">
            </div>
            <div class="field">
              <label>Add-credit verification note</label>
              <input type="text" id="financeCreditNote" placeholder="e.g. Cash received">
            </div>
          </div>
          <button class="primary" id="addFinanceCredit" ${!selectedFinanceCreditMemberId ? "disabled" : ""}>Add verified credit</button>

          <h3>Deduct an incorrect credit</h3>
          <p class="note">Enter the amount to deduct as a normal positive number. For example, enter 0.100 to reduce the wallet by BHD 0.100. The app will never make the balance negative, and every deduction stays in the audit history.</p>
          <div class="grid two">
            <div class="field">
              <label>Credit to deduct in BHD</label>
              <input type="number" id="financeCreditDeduction" step="0.001" min="0.001" placeholder="0.000">
            </div>
            <div class="field">
              <label>Deduction reason</label>
              <input type="text" id="financeCreditAdjustmentNote" placeholder="Reason is required">
            </div>
          </div>
          <button class="primary" id="deductFinanceCredit" ${!selectedFinanceCreditMemberId ? "disabled" : ""}>Deduct selected wallet credit</button>

          <h3>Current Wallet Credit by Member</h3>
          <p class="note">This table shows one current wallet balance for each member. Additions and deductions remain in the private audit history; they do not create duplicate current-credit rows.</p>
          ${financeRows(data.credits, "No member wallet balance exists for this selection.", { showDate: true })}
        </section>
      `
    },
    pending: {
      label: "Pending Cash / Benefit",
      content: `
        <section class="card">
          <h3>Pending Cash / Benefit confirmations</h3>
          <p class="note">Confirm only after receiving the Player's Cash or Benefit payment.</p>
          ${(data.pendingPayments || []).map(payment => `
            <div class="session">
              <b>${escapeHtml(payment.memberName || payment.memberUid)}</b>
              <small>${escapeHtml(payment.flightName || "Flight")} &middot; ${escapeHtml(payment.method)} &middot; ${escapeHtml(payment.reference || "No reference")}</small>
              <span class="tag amber">${bhd(payment.amountFils)}</span>
              <button class="pill" data-verify-payment="${escapeHtml(payment.id)}">Verify</button>
            </div>
          `).join("") || `<p class="note">No settlement payment awaits confirmation for this flight.</p>`}
        </section>
      `
    },
    paid: {
      label: "Paid Players",
      content: `
        <section class="card">
          <h3>Paid Players</h3>
          ${financeRows(data.paid, "No paid charges for this selection.", { showDate: true })}
        </section>
      `
    },
    unpaid: {
      label: "Unpaid Players",
      content: `
        <section class="card">
          <h3>Unpaid Players</h3>
          ${financeRows(data.unpaid, "No unpaid charges for this selection.", { showAmountDue: true, showDate: true, showReminder: isFlightAdmin })}
        </section>
      `
    }
  };

  const keys = isSuperAdmin ? ["credits", "paid", "unpaid"] : ["pending", "paid", "unpaid"];
  if (!keys.includes(selectedFinanceTab)) selectedFinanceTab = keys[0];
  const active = tabs[selectedFinanceTab];

  return `
    <section class="card">
      <span class="tag blue">${isSuperAdmin ? "SUPER ADMIN FINANCE" : "FLIGHT ADMIN FINANCE"}</span>
      <h2>Finance</h2>
      <p class="note">${isSuperAdmin ? "View and print audit lists by selected activity and level." : "Manage only your assigned flight."}</p>
    </section>

    <div class="grid two">
      <section class="card"><h3>Verified credit</h3><div class="session"><b>${bhd(data.totalCreditFils)}</b></div><small>${escapeHtml(scope)}</small></section>
      ${isFlightAdmin ? `<section class="card"><h3>Pending payment</h3><div class="session"><b>${bhd(data.pendingPaymentFils)}</b></div><small>Your flight</small></section>` : ""}
      <section class="card"><h3>Unpaid amount</h3><div class="session"><b>${bhd((data.unpaid || []).reduce((sum, row) => sum + Number(row.amountDueFils || 0), 0))}</b></div><small>Selected level</small></section>
      <section class="card"><h3>Session costs</h3><div class="session"><b>${bhd(data.monthCostFils)}</b></div><small>Current month</small></section>
    </div>

    ${isSuperAdmin ? `
      <section class="card">
        <h3>Select activity and level</h3>
        <div class="grid two">
          <div class="field">
            <label>Activity</label>
            <select id="financeActivityFilter">
              <option value="">All activities</option>
              ${activities.map(activity => `<option value="${escapeHtml(activity.id)}" ${selectedFinanceActivityId === activity.id ? "selected" : ""}>${escapeHtml(activity.name)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>Flight / Level</label>
            <select id="financeFlightFilter">
              <option value="">All flights in this selection</option>
              ${selectedFlights.map(flight => `<option value="${escapeHtml(flight.id)}" ${selectedFinanceFlightId === flight.id ? "selected" : ""}>${escapeHtml(flight.activityName)} &middot; ${escapeHtml(flight.name)}</option>`).join("")}
            </select>
          </div>
        </div>
      </section>
    ` : ""}

    <section class="card">
      <div class="actions">
        ${keys.map(key => `<button class="pill ${selectedFinanceTab === key ? "active" : ""}" data-finance-tab="${key}">${tabs[key].label}</button>`).join("")}
        <button class="pill" data-print-finance>Print current tab</button>
      </div>
    </section>

    <section class="card" id="financePrintArea">
      <h3>${escapeHtml(active.label)}</h3>
      <p class="note">${escapeHtml(scope)}</p>
      ${active.content}
    </section>
  `;
}

// ===== AUDIT HISTORY VIEW =====
export async function auditHistoryView() {
  return superAdminAuditLogView();
}

// ===== ADVERTISING & BAZAAR APPROVAL VIEW =====
export async function advertisingApprovalView() {
  requireSuperAdmin();
  const data = await api("/business/admin/pending");
  const businesses = data.businesses || [];
  const pending = businesses.filter(row => row.status === "PENDING_APPROVAL");
  const published = businesses.filter(row => row.status === "PUBLISHED");
  const carouselAds = published.filter(row => row.featured);
  const other = businesses.filter(row => !["PENDING_APPROVAL", "PUBLISHED"].includes(row.status));

  const defaultFeatureStart = inputDate(new Date());
  const defaultFeatureEnd = inputDate(new Date(Date.now() + (6 * 24 * 60 * 60 * 1000)));

  const adCard = business => {
    const image = imageUrl(business.flyerUrl);
    const tone = business.status === "PUBLISHED" ? "blue" : business.status === "PENDING_APPROVAL" ? "amber" : "red";
    return `
      <div class="card">
        <span class="tag ${tone}">${escapeHtml(String(business.status).replaceAll("_", " "))}</span>
        <h3>${escapeHtml(business.businessName)}</h3>
        <p class="note">BIZ reference: ${escapeHtml(business.referenceCode || "\u2014")} &middot; Submitted ${escapeHtml(recordDate(business.createdAt))}</p>

        ${image
          ? `<span class="tag blue">IMAGE STORED</span>`
          : '<span class="tag red">NO IMAGE</span>'}
        ${image
          ? `<img src="${image}" alt="${escapeHtml(business.businessName)}" style="max-width:100%;border-radius:8px;margin:8px 0;">`
          : `<p class="note">No Storage image uploaded</p>`}

        <div class="grid two">
          <div class="field">
            <label>Category</label>
            <input type="text" id="adCategory-${escapeHtml(business.id)}" value="${escapeHtml(business.category || "")}">
          </div>
          <div class="field">
            <label>Featured offer text</label>
            <input type="text" id="adOffer-${escapeHtml(business.id)}" value="${escapeHtml(business.discountText || "")}">
          </div>
          <div class="field">
            <label>Flyer image from club Storage</label>
            <input type="text" id="adFlyer-${escapeHtml(business.id)}" value="${escapeHtml(business.flyerUrl || "")}">
          </div>
          <div class="field">
            <label>Upload flyer to Storage</label>
            <input type="file" id="adFlyerFile-${escapeHtml(business.id)}" accept="image/png,image/jpeg,image/webp">
            <button class="pill" data-upload-ad-image="${escapeHtml(business.id)}">Upload flyer to Storage</button>
            <small>Only Super Admin can upload. The stored image is shown read-only to app users.</small>
          </div>
          <div class="field">
            <label>Click-through business link</label>
            <input type="url" id="adDestination-${escapeHtml(business.id)}" value="${escapeHtml(business.destinationUrl || "")}">
          </div>
          <div class="field">
            <label>Website link</label>
            <input type="url" id="adWebsite-${escapeHtml(business.id)}" value="${escapeHtml(business.website || "")}">
          </div>
          <div class="field">
            <label>Location / address</label>
            <input type="text" id="adAddress-${escapeHtml(business.id)}" value="${escapeHtml(business.address || "")}">
          </div>
          <div class="field">
            <label>Feature on front page</label>
            <input type="checkbox" id="adFeatured-${escapeHtml(business.id)}" ${business.featured ? "checked" : ""}>
          </div>
          <div class="field">
            <label>Featured start date</label>
            <input type="date" id="adFeatureStart-${escapeHtml(business.id)}" value="${inputDate(business.featureStartDate) || defaultFeatureStart}">
          </div>
          <div class="field">
            <label>Featured end date</label>
            <input type="date" id="adFeatureEnd-${escapeHtml(business.id)}" value="${inputDate(business.featureEndDate) || defaultFeatureEnd}">
          </div>
        </div>

        <div class="actions">
          <button class="pill" data-save-ad="${escapeHtml(business.id)}">Save advertisement</button>
          ${business.status === "PENDING_APPROVAL" ? `
            <button class="primary" data-ad-decision="PUBLISH" data-ad-id="${escapeHtml(business.id)}">Approve &amp; publish</button>
            <button class="pill" data-ad-decision="REJECT" data-ad-id="${escapeHtml(business.id)}">Reject</button>
          ` : business.status === "PUBLISHED" ? `
            <button class="pill" data-ad-decision="UNPUBLISH" data-ad-id="${escapeHtml(business.id)}">Remove from carousel</button>
            <button class="pill" data-delete-ad="${escapeHtml(business.id)}">Delete permanently</button>
          ` : `
            <button class="pill" data-delete-ad="${escapeHtml(business.id)}">Delete permanently</button>
          `}
        </div>
      </div>
    `;
  };

  return `
    <section class="card">
      <span class="tag blue">SUPER ADMIN</span>
      <h2>Advertising &amp; BaZaar</h2>
      <p class="note">Review all listings, edit approved details, manage dated carousel placement, and permanently delete records when required.</p>
      <div class="actions">
        <button class="pill" data-print-advertising>Print advertising register</button>
      </div>
    </section>

    <section class="card">
      <div class="actions">
        <button class="pill" data-scroll-section="carouselSection">Carousel</button>
        <button class="pill" data-scroll-section="noticeSection">Upload notice</button>
        <button class="pill" data-scroll-section="pendingSection">Pending approvals</button>
        <button class="pill" data-scroll-section="publishedSection">Available ads</button>
        <button class="pill" data-scroll-section="noticeHistorySection">Notice history</button>
      </div>
    </section>

    <section class="card" id="carouselSection">
      <h3>Front-page carousel control</h3>
      <p class="note">Choose how many selected, approved advertisements appear on the front page. The hard maximum is ${Number(data.maxCarouselLimit || 10)} active ads. Each selected ad uses its own start and end date in the advertisement card below.</p>
      <span class="tag blue">${carouselAds.length} SELECTED</span>
      <div class="field">
        <label>Number of carousel advertisements</label>
        <select id="carouselAdCount">
          ${Array.from({ length: Number(data.maxCarouselLimit || 10) }, (_, index) => index + 1).map(count =>
            `<option value="${count}" ${count === carouselAds.length ? "selected" : ""}>${count} advertisement${count === 1 ? "" : "s"}</option>`
          ).join("")}
        </select>
      </div>
      <p class="note">Current selected carousel ads: <b>${escapeHtml(carouselAds.map(ad => ad.businessName).join(" \u00b7 ") || "No ads selected yet")}</b></p>
      <button class="primary" data-save-carousel-settings>Save carousel count</button>
      <p class="note">To add a new advertisement to the carousel, upload its image, approve it, select Feature on front page, and set its start and end dates. Ads outside their date window are automatically hidden.</p>
    </section>

    <section class="card" id="noticeSection">
      <h3>Create official notice</h3>
      <p class="note">Upload an optional PNG, JPEG, or WebP announcement image directly to the configured club Storage bucket, then preview it before publishing.</p>
      <div class="field">
        <label>Notice title</label>
        <input type="text" id="noticeTitle" placeholder="Notice title">
      </div>
      <div class="field">
        <label>Notice message</label>
        <textarea id="noticeBody" rows="4" placeholder="Notice message"></textarea>
      </div>
      <div class="field">
        <label>Official notice image from club Storage</label>
        <input type="text" id="noticeImageUrl" placeholder="Image URL from Storage">
      </div>
      <div class="field">
        <label>Upload notice to Storage</label>
        <input type="file" id="noticeImageFile" accept="image/png,image/jpeg,image/webp">
        <button class="pill" id="uploadNoticeImage">Upload notice to Storage</button>
      </div>
      <div id="noticeImagePreview" class="hidden"></div>
      <div class="actions">
        <button class="pill" id="previewNoticeImage">Preview notice image</button>
        <button class="primary" id="publishOfficialNotice">Publish official notice</button>
      </div>
    </section>

    <section class="card" id="pendingSection">
      <h3>Pending business approvals</h3>
      <p class="note">Review every business, upload the approved flyer to club Storage, then approve, reject, or edit the listing.</p>
      ${pending.map(adCard).join("") || `<p class="note">No business submission is awaiting approval.</p>`}
    </section>

    <section class="card">
      <h3>Business update requests</h3>
      ${(data.updateRequests || []).map(row => `
        <div class="session">
          <b>${escapeHtml(row.referenceCode || "Business update")}</b>
          <small>${escapeHtml(row.requestedBusinessName || "Existing business")} &middot; ${escapeHtml(row.requestedCategory || "No category change")} &middot; ${escapeHtml(recordDate(row.createdAt))}</small>
          <button class="pill" data-update-request-decision="APPROVE" data-update-request-id="${escapeHtml(row.id)}">Approve update</button>
          <button class="pill" data-update-request-decision="REJECT" data-update-request-id="${escapeHtml(row.id)}">Reject</button>
        </div>
      `).join("") || `<p class="note">No advertiser update request is awaiting approval.</p>`}
    </section>

    <section class="card" id="publishedSection">
      <h3>Published directory and featured ads</h3>
      <p class="note">Maximum ten featured ads may overlap. When a feature end date passes, the business stays in BaZaar but automatically leaves the landing-page carousel.</p>
      ${published.map(adCard).join("") || `<p class="note">No business has been published yet.</p>`}
    </section>

    ${other.length ? `
      <section class="card">
        <h3>Unpublished or rejected businesses</h3>
        ${other.map(adCard).join("")}
      </section>
    ` : ""}

    <section class="card" id="noticeHistorySection">
      <h3>Official notice history</h3>
      ${(data.notices || []).map(notice => `
        <div class="session">
          <b>${escapeHtml(notice.title)}</b>
          <small>${escapeHtml(recordDate(notice.publishedAt || notice.createdAt))} &middot; ${notice.published ? "Published" : "Draft"}</small>
          ${notice.imageUrl ? `<img src="${imageUrl(notice.imageUrl)}" alt="Stored notice image" style="max-width:200px;border-radius:6px;">` : ""}
          <button class="pill" data-toggle-notice="${escapeHtml(notice.id)}" data-notice-published="${notice.published}">${notice.published ? "Unpublish" : "Publish"}</button>
        </div>
      `).join("") || `<p class="note">No official notices have been created yet.</p>`}
    </section>
  `;
}

// ===== BIND ALL ADMIN EVENT HANDLERS =====
export function bindAdminViews() {
  // Scroll-to-section navigation
  document.querySelectorAll("[data-scroll-section]").forEach(button =>
    button.onclick = () => document.getElementById(button.dataset.scrollSection)?.scrollIntoView({ behavior: "smooth", block: "start" })
  );

  // Create activity
  const createActivity = document.getElementById("createActivity");
  if (createActivity) createActivity.onclick = async () => {
    try {
      await api("/activities", { method: "POST", body: { name: document.getElementById("newActivityName").value.trim() } });
      notify("Activity created."); refresh();
    } catch (error) { notify(error.message); }
  };

  // Create flight
  document.querySelectorAll("[data-create-flight]").forEach(button => button.onclick = async () => {
    try {
      const id = button.dataset.createFlight;
      await api(`/activities/${encodeURIComponent(id)}/flights`, {
        method: "POST", body: { name: document.getElementById(`flightName-${id}`).value.trim(), sortOrder: Number(document.getElementById(`flightSort-${id}`).value) }
      });
      notify("Flight created."); refresh();
    } catch (error) { notify(error.message); }
  });

  // Toggle activity active/inactive
  document.querySelectorAll("[data-toggle-activity]").forEach(button => button.onclick = async () => {
    try {
      await api(`/activities/${encodeURIComponent(button.dataset.toggleActivity)}`, { method: "PATCH", body: { active: button.dataset.active !== "true" } });
      refresh();
    } catch (error) { notify(error.message); }
  });

  // Toggle flight active/inactive
  document.querySelectorAll("[data-toggle-flight]").forEach(button => button.onclick = async () => {
    try {
      await api(`/activities/${encodeURIComponent(button.dataset.activityId)}/flights/${encodeURIComponent(button.dataset.toggleFlight)}`, { method: "PATCH", body: { active: button.dataset.active !== "true" } });
      refresh();
    } catch (error) { notify(error.message); }
  });

  // Pre-register member
  const createMember = document.getElementById("createMember");
  if (createMember) createMember.onclick = async () => {
    try {
      const flightId = document.getElementById("memberFlight").value;
      if (!flightId) throw new Error("Choose an assigned flight.");
      latestInvitation = await api("/members/pre-register", {
        method: "POST", body: {
          registeredName: document.getElementById("memberFullName").value.trim(),
          phone: document.getElementById("memberPhone").value.trim(),
          role: document.getElementById("memberRole").value,
          flightId
        }
      });
      latestInvitation.fullName = latestInvitation.registeredName || document.getElementById("memberFullName").value.trim();
      notify("Member pre-registered."); refresh();
    } catch (error) { notify(error.message); }
  };

  // Hide latest invitation
  const hideLatestInvitation = document.getElementById("hideLatestInvitation");
  if (hideLatestInvitation) hideLatestInvitation.onclick = () => { latestInvitation = null; refresh(); };

  // WhatsApp onboarding link
  document.querySelectorAll("[data-whatsapp-onboarding-name]").forEach(button => button.onclick = () => {
    const phone = String(button.dataset.whatsappOnboardingPhone || "").replace(/\D/g, "");
    if (!phone) return notify("No phone number was saved.");
    const name = button.dataset.whatsappOnboardingName || "Member";
    const appUrl = `${window.location.origin}${window.location.pathname}`;
    const message = encodeURIComponent(`Hello ${name}, your Indian Club Bahrain membership is ready. Open ${appUrl}, choose New registered member? Create my login, then enter the same registered name and phone number provided to Super Admin. You can create your own email address and password.`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener");
  });

  // Roster activity filter
  const rosterActivity = document.getElementById("rosterActivityFilter");
  if (rosterActivity) rosterActivity.onchange = () => { selectedRosterActivityId = rosterActivity.value; selectedRosterFlightId = ""; refresh(); };

  // Roster flight filter
  const rosterFlight = document.getElementById("rosterFlightFilter");
  if (rosterFlight) rosterFlight.onchange = () => { selectedRosterFlightId = rosterFlight.value; refresh(); };

  // Save member role/flight
  document.querySelectorAll("[data-save-member]").forEach(button => button.onclick = async () => {
    try {
      const uid = button.dataset.saveMember,
            role = document.getElementById(`memberRole-${uid}`).value,
            flightId = document.getElementById(`memberFlight-${uid}`).value;
      if (!flightId) throw new Error("Choose one assigned flight.");
      await api(`/members/${encodeURIComponent(uid)}`, { method: "PATCH", body: { role, flightId } });
      notify(role === "LEVEL_ADMIN" ? "Member is now Flight Admin for the selected level only." : "Member is now a Player.");
      refresh();
    } catch (error) { notify(error.message); }
  });

  // Toggle member active/inactive
  document.querySelectorAll("[data-toggle-member]").forEach(button => button.onclick = async () => {
    try {
      await api(`/members/${encodeURIComponent(button.dataset.toggleMember)}`, { method: "PATCH", body: { active: button.dataset.active !== "true" } });
      notify("Member access updated."); refresh();
    } catch (error) { notify(error.message); }
  });

  // Load master timetable month
  const loadMonth = document.getElementById("loadMasterMonth");
  if (loadMonth) loadMonth.onclick = () => {
    selectedMasterMonth = document.getElementById("masterMonth").value;
    selectedMasterActivityId = document.getElementById("masterActivity").value;
    refresh();
  };

  // Bulk timetable import
  const bulkImport = document.getElementById("importBulkTimetable");
  if (bulkImport) bulkImport.onclick = async () => {
    try {
      const lines = document.getElementById("bulkTimetableCsv").value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      if (lines[0]?.toLowerCase().replaceAll(" ", "") === "weekday,flight,starttime,endtime") lines.shift();
      const flights = flattenFlights(await api("/activities"));
      const rows = lines.map((line, index) => {
        const parts = line.split(",").map(value => value.trim());
        if (parts.length !== 4) throw new Error(`Bulk row ${index + 1} must have weekday, flight, start time, and end time.`);
        const flight = flights.find(item => item.name.toLowerCase() === parts[1].toLowerCase());
        if (!flight) throw new Error(`Bulk row ${index + 1} flight was not found: ${parts[1]}.`);
        return { weekday: parts[0], flightId: flight.id, startTime: parts[2], endTime: parts[3] };
      });
      if (!rows.length) throw new Error("Paste at least one timetable row.");
      const result = await api("/timetable/master/bulk-slots", { method: "POST", body: { activityId: selectedMasterActivityId, rows } });
      notify(`${result.created?.length || 0} weekly slots imported. ${result.skipped?.length || 0} overlapping existing slots skipped.`);
      refresh();
    } catch (error) { notify(error.message); }
  };

  // Download bulk template
  const downloadBulkTemplate = document.getElementById("downloadBulkTemplate");
  if (downloadBulkTemplate) downloadBulkTemplate.onclick = () => {
    const csv = "weekday,flight,startTime,endTime\nSaturday,Flight 2,18:35,19:35\nSaturday,Flight 1,19:35,20:35\nSunday,Flight 4B,18:35,19:35\n";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "master-timetable-template.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Save weekly timetable slot
  const saveSlot = document.getElementById("saveMasterSlot");
  if (saveSlot) saveSlot.onclick = async () => {
    try {
      await api("/timetable/master/slot", {
        method: "POST", body: {
          weekday: document.getElementById("slotDay").value,
          flightId: document.getElementById("slotFlight").value,
          startTime: document.getElementById("slotStart").value,
          endTime: document.getElementById("slotEnd").value
        }
      });
      notify("Weekly timetable slot saved."); refresh();
    } catch (error) { notify(error.message); }
  };

  // Publish master month
  const publish = document.getElementById("publishMasterMonth");
  if (publish) publish.onclick = async () => {
    try {
      await api("/timetable/master/publish-month", { method: "POST", body: { month: selectedMasterMonth, activityId: selectedMasterActivityId } });
      notify("Monthly sessions published.");
    } catch (error) { notify(error.message); }
  };

  // Delete timetable slot
  document.querySelectorAll("[data-delete-slot]").forEach(button => button.onclick = async () => {
    if (!confirm("Remove this weekly timetable slot?")) return;
    try {
      await api(`/timetable/master/slot/${encodeURIComponent(button.dataset.deleteSlot)}`, { method: "DELETE" });
      refresh();
    } catch (error) { notify(error.message); }
  });

  // Finance activity filter
  const financeActivity = document.getElementById("financeActivityFilter");
  if (financeActivity) financeActivity.onchange = () => {
    selectedFinanceActivityId = financeActivity.value && [...financeActivity.options].some(option => option.value === financeActivity.value) ? financeActivity.value : "";
    selectedFinanceFlightId = "";
    selectedFinanceCreditMemberId = "";
    refresh();
  };

  // Finance flight filter
  const financeFlight = document.getElementById("financeFlightFilter");
  if (financeFlight) financeFlight.onchange = () => {
    selectedFinanceFlightId = financeFlight.value && [...financeFlight.options].some(option => option.value === financeFlight.value) ? financeFlight.value : "";
    selectedFinanceCreditMemberId = "";
    refresh();
  };

  // Finance credit member selection
  const financeCreditMember = document.getElementById("financeCreditMember");
  if (financeCreditMember) financeCreditMember.onchange = () => {
    selectedFinanceCreditMemberId = financeCreditMember.value;
    const selectedOption = financeCreditMember.options[financeCreditMember.selectedIndex];
    const preview = document.getElementById("financeSelectedMemberPreview");
    const addButton = document.getElementById("addFinanceCredit");
    const deductButton = document.getElementById("deductFinanceCredit");
    const balance = Number(selectedOption?.dataset.walletBalance || 0);
    if (preview) preview.innerHTML = selectedFinanceCreditMemberId
      ? `<b>Selected member:</b> ${escapeHtml(selectedOption.textContent || "selected member")}<br><b>Current wallet credit:</b> ${bhd(balance)}`
      : "Choose the exact member before adding or deducting credit.";
    if (addButton) addButton.disabled = !selectedFinanceCreditMemberId;
    if (deductButton) deductButton.disabled = !selectedFinanceCreditMemberId;
  };

  // Finance tab switching
  document.querySelectorAll("[data-finance-tab]").forEach(button => button.onclick = () => {
    selectedFinanceTab = button.dataset.financeTab || "credits";
    refresh();
  });

  // Audit category filter
  document.querySelectorAll("[data-audit-category]").forEach(button => button.onclick = () => {
    selectedAuditCategory = button.dataset.auditCategory || "ALL";
    refresh();
  });

  // Audit activity filter
  const auditActivity = document.getElementById("auditActivityFilter");
  if (auditActivity) auditActivity.onchange = () => { selectedAuditActivityId = auditActivity.value; selectedAuditFlightId = ""; refresh(); };

  // Audit flight filter
  const auditFlight = document.getElementById("auditFlightFilter");
  if (auditFlight) auditFlight.onchange = () => { selectedAuditFlightId = auditFlight.value; refresh(); };

  // Audit date filter
  const auditDate = document.getElementById("auditDateFilter");
  if (auditDate) auditDate.onchange = () => { selectedAuditDate = auditDate.value; refresh(); };

  // Audit member filter
  const auditMember = document.getElementById("auditMemberFilter");
  if (auditMember) auditMember.onchange = () => { selectedAuditMember = auditMember.value; refresh(); };

  // Print audit log
  document.querySelectorAll("[data-print-audit-log]").forEach(button =>
    button.onclick = () => auditPrint("superAdminAuditPrint", "Indian Club Bahrain filtered audit log")
  );

  // Add credit
  const addCredit = document.getElementById("addFinanceCredit");
  if (addCredit) addCredit.onclick = async () => {
    try {
      const memberUid = document.getElementById("financeCreditMember").value,
            amountFils = Math.round(Number(document.getElementById("financeCreditAmount").value) * 1000),
            note = document.getElementById("financeCreditNote").value.trim();
      if (!memberUid) throw new Error("Choose a member.");
      if (!Number.isInteger(amountFils) || amountFils < 1) throw new Error("Enter a valid credit amount.");
      await api("/finance/admin/wallet-credit", { method: "POST", body: { memberUid, amountFils, note } });
      notify("Verified wallet credit added to the selected member."); refresh();
    } catch (error) { notify(error.message); }
  };

  // Deduct credit
  const deductCredit = document.getElementById("deductFinanceCredit");
  if (deductCredit) deductCredit.onclick = async () => {
    try {
      const memberUid = document.getElementById("financeCreditMember").value,
            deductionFils = Math.round(Number(document.getElementById("financeCreditDeduction").value) * 1000),
            note = document.getElementById("financeCreditAdjustmentNote").value.trim();
      if (!memberUid) throw new Error("Choose a member.");
      if (!Number.isInteger(deductionFils) || deductionFils < 1) throw new Error("Enter a valid deduction amount.");
      if (!note) throw new Error("Enter the reason for this manual deduction.");
      const result = await api("/finance/admin/wallet-adjustment", { method: "POST", body: { memberUid, adjustmentFils: -deductionFils, note } });
      notify(`Credit deducted. Current wallet credit: ${bhd(result.balanceAfterFils)}.`); refresh();
    } catch (error) { notify(error.message); }
  };

  // Verify pending payment
  document.querySelectorAll("[data-verify-payment]").forEach(button => button.onclick = async () => {
    try {
      await api(`/finance/payments/${encodeURIComponent(button.dataset.verifyPayment)}/verify`, { method: "POST" });
      notify("Cash / Benefit payment confirmed."); refresh();
    } catch (error) { notify(error.message); }
  });

  // WhatsApp payment reminder
  document.querySelectorAll("[data-whatsapp-reminder]").forEach(button => button.onclick = () => {
    const phone = String(button.dataset.whatsappReminder || "").replace(/\D/g, "");
    if (!phone) return notify("This Player has no phone number saved.");
    const message = encodeURIComponent(`Hello ${button.dataset.whatsappName}, a club shuttlecock amount of ${button.dataset.whatsappAmount} is unpaid. Please pay using wallet credit, Cash, or Benefit. Thank you.`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener");
  });

  // Print buttons
  document.querySelectorAll("[data-print-finance], [data-print-audit], [data-print-advertising], [data-print-deleted-users]").forEach(button =>
    button.onclick = () => window.print()
  );

  // Save carousel settings
  const saveCarouselSettings = document.querySelector("[data-save-carousel-settings]");
  if (saveCarouselSettings) saveCarouselSettings.onclick = async () => {
    try {
      const carouselLimit = Number(document.getElementById("carouselAdCount").value);
      await api("/business/admin/carousel-settings", { method: "PATCH", body: { carouselLimit } });
      notify("Carousel count updated."); refresh();
    } catch (error) { notify(error.message); }
  };

  // Upload ad flyer image
  document.querySelectorAll("[data-upload-ad-image]").forEach(button => button.onclick = async () => {
    try {
      const id = button.dataset.uploadAdImage;
      const file = document.getElementById(`adFlyerFile-${id}`).files[0];
      document.getElementById(`adFlyer-${id}`).value = await uploadAdminImage(file);
      notify("Flyer uploaded. Save the advertisement to attach it.");
    } catch (error) { notify(error.message); }
  });

  // Upload notice image
  const uploadNoticeImage = document.getElementById("uploadNoticeImage");
  if (uploadNoticeImage) uploadNoticeImage.onclick = async () => {
    try {
      const file = document.getElementById("noticeImageFile").files[0];
      document.getElementById("noticeImageUrl").value = await uploadAdminImage(file);
      notify("Announcement image uploaded.");
    } catch (error) { notify(error.message); }
  };

  // Preview notice image
  const previewNoticeImage = document.getElementById("previewNoticeImage");
  if (previewNoticeImage) previewNoticeImage.onclick = () => {
    const preview = document.getElementById("noticeImagePreview");
    const url = imageUrl(document.getElementById("noticeImageUrl").value);
    if (!url) return notify("Upload an image or enter a valid public image link first.");
    preview.innerHTML = `<img src="${url}" alt="Notice preview" style="max-width:100%;border-radius:8px;">`;
    preview.classList.remove("hidden");
  };

  // Publish official notice
  const publishOfficialNotice = document.getElementById("publishOfficialNotice");
  if (publishOfficialNotice) publishOfficialNotice.onclick = async () => {
    try {
      await api("/business/admin/notices", {
        method: "POST", body: {
          title: document.getElementById("noticeTitle").value.trim(),
          body: document.getElementById("noticeBody").value.trim(),
          imageUrl: document.getElementById("noticeImageUrl").value.trim(),
          published: true
        }
      });
      notify("Official notice published."); refresh();
    } catch (error) { notify(error.message); }
  };

  // Toggle notice publish/unpublish
  document.querySelectorAll("[data-toggle-notice]").forEach(button => button.onclick = async () => {
    try {
      await api(`/business/admin/notices/${encodeURIComponent(button.dataset.toggleNotice)}`, { method: "PATCH", body: { published: button.dataset.noticePublished !== "true" } });
      notify("Official notice updated."); refresh();
    } catch (error) { notify(error.message); }
  });

  // Ad decision (approve/reject/unpublish)
  document.querySelectorAll("[data-ad-decision]").forEach(button => button.onclick = async () => {
    try {
      const id = button.dataset.adId;
      const note = String(prompt(`Optional note for ${button.dataset.adDecision.toLowerCase()}:`) || "").trim();
      await api(`/business/admin/${encodeURIComponent(id)}/decision`, { method: "POST", body: { decision: button.dataset.adDecision, note } });

      if (button.dataset.adDecision === "PUBLISH") {
        const featured = document.getElementById(`adFeatured-${id}`).checked;
        const body = {
          category: document.getElementById(`adCategory-${id}`).value.trim(),
          discountText: document.getElementById(`adOffer-${id}`).value.trim(),
          flyerUrl: document.getElementById(`adFlyer-${id}`).value.trim(),
          destinationUrl: document.getElementById(`adDestination-${id}`).value.trim(),
          website: document.getElementById(`adWebsite-${id}`).value.trim(),
          address: document.getElementById(`adAddress-${id}`).value.trim(),
          featured,
          featureStartDate: document.getElementById(`adFeatureStart-${id}`).value,
          featureEndDate: document.getElementById(`adFeatureEnd-${id}`).value
        };
        if (featured && (!body.featureStartDate || !body.featureEndDate))
          throw new Error("The business was published, but both featured dates are needed before it can be featured.");
        await api(`/business/admin/${encodeURIComponent(id)}`, { method: "PATCH", body });
      }
      notify(`Business ${String(button.dataset.adDecision).toLowerCase()}ed.`); refresh();
    } catch (error) { notify(error.message); }
  });

  // Delete ad permanently
  document.querySelectorAll("[data-delete-ad]").forEach(button => button.onclick = async () => {
    try {
      if (!window.confirm("Delete this unpublished advertisement record permanently?")) return;
      await api(`/business/admin/${encodeURIComponent(button.dataset.deleteAd)}`, { method: "DELETE", confirm: false });
      notify("Advertisement record deleted."); refresh();
    } catch (error) { notify(error.message); }
  });

  // Save ad details
  document.querySelectorAll("[data-save-ad]").forEach(button => button.onclick = async () => {
    try {
      const id = button.dataset.saveAd;
      const featured = document.getElementById(`adFeatured-${id}`).checked;
      const body = {
        category: document.getElementById(`adCategory-${id}`).value.trim(),
        discountText: document.getElementById(`adOffer-${id}`).value.trim(),
        flyerUrl: document.getElementById(`adFlyer-${id}`).value.trim(),
        destinationUrl: document.getElementById(`adDestination-${id}`).value.trim(),
        website: document.getElementById(`adWebsite-${id}`).value.trim(),
        address: document.getElementById(`adAddress-${id}`).value.trim(),
        featured,
        featureStartDate: document.getElementById(`adFeatureStart-${id}`).value,
        featureEndDate: document.getElementById(`adFeatureEnd-${id}`).value
      };
      if (featured && (!body.featureStartDate || !body.featureEndDate))
        throw new Error("Choose both featured start and end dates.");
      await api(`/business/admin/${encodeURIComponent(id)}`, { method: "PATCH", body });
      notify("Advertisement saved."); refresh();
    } catch (error) { notify(error.message); }
  });

  // Update request decisions
  document.querySelectorAll("[data-update-request-decision]").forEach(button => button.onclick = async () => {
    try {
      await api(`/business/admin/update-requests/${encodeURIComponent(button.dataset.updateRequestId)}/decision`, { method: "POST", body: { decision: button.dataset.updateRequestDecision } });
      notify("Business update request reviewed."); refresh();
    } catch (error) { notify(error.message); }
  });
}

// ===== EXPORT ADMIN VIEWS =====
export const adminViews = {
  home: superAdminHomeView,
  activities: activitiesAndFlightsView,
  timetable: superAdminTimetableView,
  finance: financeAdminView,
  auditLogs: auditHistoryView,
  activityLog: superAdminActivityLogView,
  walletLog: superAdminWalletLogView,
  sessionLog: superAdminSessionLogView,
  stockLog: superAdminStockLogView,
  ads: advertisingApprovalView
};

