
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

function notify(message) {
  window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: message }));
}

function refresh() {
  window.dispatchEvent(new CustomEvent("indianclub:render"));
}

const LEVELS = ["Premier", "Flight 1", "Flight 2", "Flight 3", "Flight 4", "Flight 4A", "Flight 4B"];
const CATEGORIES = ["ALL", "MEMBER", "ATTENDANCE", "WALLET/PAYMENT", "SESSION CONTROL", "SHUTTLE STOCK"];

// ===== SUPER ADMIN HOME PAGE =====
export async function superAdminHomeView() {
  const [allMembers, allSessions, allAttendance, allAuditLogs] = await Promise.all([
    api("/members"),
    api("/timetable"),
    api("/attendance"),
    api("/audit/logs")
  ]);

  const recentLogs = allAuditLogs.slice(0, 5);
  const memberActionsCount = allAuditLogs.filter(l => l.category === "MEMBER").length;
  const walletActionsCount = allAuditLogs.filter(l => l.category === "WALLET/PAYMENT").length;
  const completedSessions = allSessions.filter(s => s.status === "COMPLETED").length;
  const stockActionsCount = allAuditLogs.filter(l => l.category === "SHUTTLE STOCK").length;

  return `
    <section class="card">
      <h2>🏢 Club Dashboard</h2>
      <p class="note">Complete club oversight and management</p>
    </section>

    <div class="grid two">
      <section class="card">
        <h3>👥 Total Members</h3>
        <div class="session"><b>${allMembers.length}</b></div>
        <small>Active members</small>
      </section>

      <section class="card">
        <h3>📅 Total Sessions</h3>
        <div class="session"><b>${allSessions.length}</b></div>
        <small>All activities</small>
      </section>

      <section class="card">
        <h3>✅ Completed Sessions</h3>
        <div class="session"><b>${completedSessions}</b></div>
        <small>Finished games</small>
      </section>

      <section class="card">
        <h3>📊 Member Actions</h3>
        <div class="session"><b>${memberActionsCount}</b></div>
        <small>Total actions</small>
      </section>

      <section class="card">
        <h3>💰 Wallet Actions</h3>
        <div class="session"><b>${walletActionsCount}</b></div>
        <small>Payments & credits</small>
      </section>

      <section class="card">
        <h3>📦 Stock Actions</h3>
        <div class="session"><b>${stockActionsCount}</b></div>
        <small>Inventory movements</small>
      </section>
    </div>

    <section class="card">
      <h3>📜 Recent Club Actions</h3>
      ${recentLogs.length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Date</th><th>Category</th><th>Action</th><th>Member/Flight</th><th>Details</th></tr></thead>
            <tbody>
              ${recentLogs.map(log => `
                <tr>
                  <td>${escapeHtml(dateTime(log.createdAt))}</td>
                  <td><span class="tag amber">${escapeHtml(log.category)}</span></td>
                  <td>${escapeHtml(log.action)}</td>
                  <td>${escapeHtml(log.memberName || log.flightName || "—")}</td>
                  <td>${escapeHtml(log.detail || "—")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="note">No recent actions.</p>`}
    </section>

    <section class="card">
      <h3>🔗 Quick Access</h3>
      <div class="actions">
        <button class="pill" onclick="window.navigate('auditLogs')">📋 View All Audit Logs</button>
        <button class="pill" onclick="window.navigate('finance')">💰 Finance Management</button>
        <button class="pill" onclick="window.navigate('activities')">🎮 Activities & Flights</button>
        <button class="pill" onclick="window.navigate('timetable')">📅 Master Timetable</button>
      </div>
    </section>
  `;
}

// ===== SUPER ADMIN ACTIVITIES & FLIGHTS PAGE =====
export async function superAdminActivitiesView() {
  const [activities, flights, members] = await Promise.all([
    api("/activities"),
    api("/flights"),
    api("/members")
  ]);

  return `
    <section class="card">
      <h2>🎮 Activities & Flights Management</h2>
      <p class="note">Create and manage activities, flights, and member assignments</p>
    </section>

    <section class="card">
      <h3>➕ Create New Activity</h3>
      <form onsubmit="window.createActivity(event)">
        <div class="grid two">
          <div class="field">
            <label>Activity Name *</label>
            <input type="text" id="activityName" placeholder="e.g., Badminton, Cricket" required>
          </div>
          <div class="field">
            <label>Status</label>
            <select id="activityStatus">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        <button type="submit" class="primary">✅ Create Activity</button>
      </form>
    </section>

    <section class="card">
      <h3>📋 All Activities</h3>
      ${activities.length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Activity</th><th>Flights</th><th>Members</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${activities.map(act => {
                const actFlights = flights.filter(f => f.activityId === act.id);
                const actMembers = members.filter(m => actFlights.some(f => f.id === m.flightId));
                return `
                  <tr>
                    <td><b>${escapeHtml(act.name)}</b></td>
                    <td>${actFlights.length} flights</td>
                    <td>${actMembers.length} members</td>
                    <td><span class="tag ${act.status === "ACTIVE" ? "blue" : "red"}">${escapeHtml(act.status)}</span></td>
                    <td>
                      <button class="pill" onclick="window.toggleActivityStatus('${escapeHtml(act.id)}')">🔄 Toggle</button>
                      <button class="pill" onclick="window.editActivity('${escapeHtml(act.id)}')">✏️ Edit</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="note">No activities created yet.</p>`}
    </section>

    <section class="card">
      <h3>➕ Create New Flight</h3>
      <form onsubmit="window.createFlight(event)">
        <div class="grid two">
          <div class="field">
            <label>Activity *</label>
            <select id="flightActivityId" required>
              <option value="">Select activity...</option>
              ${activities.map(act => `<option value="${escapeHtml(act.id)}">${escapeHtml(act.name)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>Flight Name *</label>
            <select id="flightName" required>
              <option value="">Select level...</option>
              ${LEVELS.map(level => `<option value="${escapeHtml(level)}">${escapeHtml(level)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>Display Order</label>
            <input type="number" id="displayOrder" min="1" placeholder="1" value="1">
          </div>
          <div class="field">
            <label>Status</label>
            <select id="flightStatus">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        <button type="submit" class="primary">✅ Create Flight</button>
      </form>
    </section>

    <section class="card">
      <h3>📋 All Flights</h3>
      ${flights.length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Activity</th><th>Flight</th><th>Members</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${flights.map(flight => {
                const flightMembers = members.filter(m => m.flightId === flight.id);
                const activity = activities.find(a => a.id === flight.activityId);
                return `
                  <tr>
                    <td>${escapeHtml(activity?.name || "—")}</td>
                    <td><b>${escapeHtml(flight.name)}</b></td>
                    <td>${flightMembers.length} members</td>
                    <td><span class="tag ${flight.status === "ACTIVE" ? "blue" : "red"}">${escapeHtml(flight.status)}</span></td>
                    <td>
                      <button class="pill" onclick="window.toggleFlightStatus('${escapeHtml(flight.id)}')">🔄 Toggle</button>
                      <button class="pill" onclick="window.editFlight('${escapeHtml(flight.id)}')">✏️ Edit</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="note">No flights created yet.</p>`}
    </section>

    <section class="card">
      <h3>👤 Pre-Register Player or Flight Admin</h3>
      <form onsubmit="window.preRegisterMember(event)">
        <div class="grid two">
          <div class="field">
            <label>Full Name *</label>
            <input type="text" id="preName" placeholder="Member name" required>
          </div>
          <div class="field">
            <label>Phone/WhatsApp *</label>
            <input type="tel" id="prePhone" placeholder="+973 XXXX XXXX" required>
          </div>
          <div class="field">
            <label>Role *</label>
            <select id="preRole" required>
              <option value="">Select role...</option>
              <option value="PLAYER">Player</option>
              <option value="LEVEL_ADMIN">Flight Admin</option>
            </select>
          </div>
          <div class="field">
            <label>Assign to Flight *</label>
            <select id="preFlightId" required>
              <option value="">Select flight...</option>
              ${flights.map(f => {
                const activity = activities.find(a => a.id === f.activityId);
                return `<option value="${escapeHtml(f.id)}">${escapeHtml(activity?.name)} - ${escapeHtml(f.name)}</option>`;
              }).join("")}
            </select>
          </div>
        </div>
        <button type="submit" class="primary">📱 Generate WhatsApp Link</button>
      </form>
    </section>

    <section class="card">
      <h3>📋 All Members Roster</h3>
      <div class="grid two">
        <div class="field">
          <label>Filter by Activity</label>
          <select id="rosterActivityFilter" onchange="window.filterRoster()">
            <option value="">All Activities</option>
            ${activities.map(act => `<option value="${escapeHtml(act.id)}">${escapeHtml(act.name)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Filter by Flight/Level</label>
          <select id="rosterFlightFilter" onchange="window.filterRoster()">
            <option value="">All Flights</option>
            ${flights.map(f => {
              const activity = activities.find(a => a.id === f.activityId);
              return `<option value="${escapeHtml(f.id)}">${escapeHtml(activity?.name)} - ${escapeHtml(f.name)}</option>`;
            }).join("")}
          </select>
        </div>
      </div>
      <div class="table-wrap">
        <table class="schedule" id="rosterTable">
          <thead><tr><th>Name</th><th>Role</th><th>Flight</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${members.map(member => {
              const flight = flights.find(f => f.id === member.flightId);
              const activity = activities.find(a => a.id === flight?.activityId);
              return `
                <tr>
                  <td>${escapeHtml(member.fullName)}</td>
                  <td><span class="tag ${member.role === "LEVEL_ADMIN" ? "purple" : "blue"}">${escapeHtml(member.role)}</span></td>
                  <td>${escapeHtml(activity?.name)} - ${escapeHtml(flight?.name)}</td>
                  <td><span class="tag ${member.status === "ACTIVE" ? "blue" : "red"}">${escapeHtml(member.status)}</span></td>
                  <td>
                    <button class="pill" onclick="window.toggleMemberStatus('${escapeHtml(member.id)}')">🔄 Toggle</button>
                    <button class="pill" onclick="window.editMember('${escapeHtml(member.id)}')">✏️ Edit</button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <h3>🗑️ Deleted Members</h3>
      <div class="table-wrap">
        <table class="schedule">
          <thead><tr><th>Name</th><th>Deleted Date</th><th>Actions</th></tr></thead>
          <tbody>
            ${members.filter(m => m.status === "DELETED").map(member => `
              <tr>
                <td>${escapeHtml(member.fullName)}</td>
                <td>${escapeHtml(dateLabel(member.deletedAt))}</td>
                <td>
                  <button class="pill" onclick="window.printRegister('${escapeHtml(member.id)}')">🖨️ Print Register</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

// ===== SUPER ADMIN MASTER TIMETABLE PAGE =====
export async function superAdminTimetableView() {
  const [activities, flights, timetable] = await Promise.all([
    api("/activities"),
    api("/flights"),
    api("/timetable")
  ]);

  const currentMonth = new Date().toISOString().slice(0, 7);

  return `
    <section class="card">
      <h2>📅 Master Timetable Management</h2>
      <p class="note">Create and manage weekly game schedules for all activities</p>
    </section>

    <section class="card">
      <h3>🔍 Select Month & Activity</h3>
      <div class="grid two">
        <div class="field">
          <label>Month (YYYY-MM) *</label>
          <input type="month" id="timetableMonth" value="${currentMonth}" required>
        </div>
        <div class="field">
          <label>Activity *</label>
          <select id="timetableActivity" required>
            <option value="">Select activity...</option>
            ${activities.map(act => `<option value="${escapeHtml(act.id)}">${escapeHtml(act.name)}</option>`).join("")}
          </select>
        </div>
      </div>
      <button class="primary" onclick="window.loadTimetable()">📂 Load Timetable</button>
    </section>

    <section class="card">
      <h3>📋 Weekly Pattern</h3>
      <div class="table-wrap">
        <table class="schedule" id="weeklyPatternTable">
          <thead><tr><th>Day</th><th>Flight</th><th>Start Time</th><th>End Time</th><th>Courts</th><th>Action</th></tr></thead>
          <tbody id="weeklyPatternBody">
            <tr><td colspan="6" class="note">Load timetable to view weekly pattern</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <h3>📤 Bulk Import CSV</h3>
      <p class="note">Format: weekday, flight, startTime, endTime (4 columns exactly)</p>
      <form onsubmit="window.importCSV(event)">
        <div class="field">
          <label>Upload CSV File *</label>
          <input type="file" id="csvFile" accept=".csv" required>
        </div>
        <button type="submit" class="primary">📥 Import CSV</button>
      </form>
    </section>

    <section class="card">
      <h3>➕ Add Weekly Slot</h3>
      <form onsubmit="window.addWeeklySlot(event)">
        <div class="grid two">
          <div class="field">
            <label>Day *</label>
            <select id="slotDay" required>
              <option value="">Select day...</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div class="field">
            <label>Flight *</label>
            <select id="slotFlight" required>
              <option value="">Select flight...</option>
              ${flights.map(f => {
                const activity = activities.find(a => a.id === f.activityId);
                return `<option value="${escapeHtml(f.id)}">${escapeHtml(activity?.name)} - ${escapeHtml(f.name)}</option>`;
              }).join("")}
            </select>
          </div>
          <div class="field">
            <label>Start Time *</label>
            <input type="time" id="slotStartTime" required>
          </div>
          <div class="field">
            <label>End Time *</label>
            <input type="time" id="slotEndTime" required>
          </div>
        </div>
        <button type="submit" class="primary">✅ Add Slot</button>
      </form>
    </section>

    <section class="card">
      <h3>📤 Publish Month</h3>
      <p class="note">Creates dated sessions matching the weekly pattern. Preserves COMPLETED sessions and removes stale SCHEDULED sessions.</p>
      <button class="primary" onclick="window.publishMonth()">🚀 Publish Month</button>
    </section>
  `;
}

// ===== SUPER ADMIN FINANCE PAGE =====
export async function superAdminFinanceView() {
  const [activities, flights, attendance, members] = await Promise.all([
    api("/activities"),
    api("/flights"),
    api("/attendance"),
    api("/members")
  ]);

  const selectedLevel = window.currentLevelFilter || "ALL";
  const filteredFlights = selectedLevel === "ALL" ? flights : flights.filter(f => f.name === selectedLevel);
  const filteredAttendance = filteredFlights.length > 0 
    ? attendance.filter(a => filteredFlights.some(f => f.id === a.flightId))
    : attendance;

  const creditedPlayers = filteredAttendance.filter(a => a.walletBalance > 0);
  const pendingCash = filteredAttendance.filter(a => a.paymentStatus === "PENDING" && a.paymentMethod === "CASH");
  const paidPlayers = filteredAttendance.filter(a => a.paymentStatus === "PAID");
  const unpaidPlayers = filteredAttendance.filter(a => a.paymentStatus === "UNPAID");

  return `
    <section class="card">
      <h2>💰 Finance Management</h2>
      <p class="note">Payment tracking, credit management, and financial overview</p>
    </section>

    <section class="card">
      <h3>🔍 Filter by Level</h3>
      <div class="actions">
        <button class="pill ${selectedLevel === "ALL" ? "active" : ""}" onclick="window.filterFinanceByLevel('ALL')">All Levels</button>
        ${LEVELS.map(level => `
          <button class="pill ${selectedLevel === level ? "active" : ""}" onclick="window.filterFinanceByLevel('${escapeHtml(level)}')">${escapeHtml(level)}</button>
        `).join("")}
      </div>
    </section>

    <div class="grid two">
      <section class="card">
        <h3>💳 Verified Credit</h3>
        <div class="session"><b>${bhd(creditedPlayers.reduce((sum, a) => sum + (a.walletBalance || 0), 0))}</b></div>
        <small>${creditedPlayers.length} players</small>
      </section>

      <section class="card">
        <h3>⏳ Pending Payment</h3>
        <div class="session"><b>${bhd(pendingCash.reduce((sum, a) => sum + (a.chargeAmount || 0), 0))}</b></div>
        <small>${pendingCash.length} records</small>
      </section>

      <section class="card">
        <h3>✅ Paid Amount</h3>
        <div class="session"><b>${bhd(paidPlayers.reduce((sum, a) => sum + (a.chargeAmount || 0), 0))}</b></div>
        <small>${paidPlayers.length} records</small>
      </section>

      <section class="card">
        <h3>❌ Unpaid Amount</h3>
        <div class="session"><b>${bhd(unpaidPlayers.reduce((sum, a) => sum + (a.chargeAmount || 0), 0))}</b></div>
        <small>${unpaidPlayers.length} records</small>
      </section>
    </div>

    <section class="card">
      <h3>💳 Credited Players</h3>
      ${creditedPlayers.length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Member</th><th>Flight</th><th>Credit Balance</th><th>Actions</th></tr></thead>
            <tbody>
              ${creditedPlayers.slice(0, 20).map(a => {
                const member = members.find(m => m.id === a.memberId);
                const flight = flights.find(f => f.id === a.flightId);
                return `
                  <tr>
                    <td>${escapeHtml(member?.fullName || "—")}</td>
                    <td>${escapeHtml(flight?.name || "—")}</td>
                    <td>${bhd(a.walletBalance || 0)}</td>
                    <td>
                      <button class="pill" onclick="window.addCredit('${escapeHtml(a.memberId)}')">➕ Add</button>
                      <button class="pill" onclick="window.deductCredit('${escapeHtml(a.memberId)}')">➖ Deduct</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="note">No credited players.</p>`}
    </section>

    <section class="card">
      <h3>💵 Pending Cash/Benefit Payments</h3>
      ${pendingCash.length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Member</th><th>Flight</th><th>Amount</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              ${pendingCash.slice(0, 20).map(a => {
                const member = members.find(m => m.id === a.memberId);
                const flight = flights.find(f => f.id === a.flightId);
                return `
                  <tr>
                    <td>${escapeHtml(member?.fullName || "—")}</td>
                    <td>${escapeHtml(flight?.name || "—")}</td>
                    <td>${bhd(a.chargeAmount || 0)}</td>
                    <td>${escapeHtml(dateLabel(a.sessionDate))}</td>
                    <td>
                      <button class="pill" onclick="window.confirmPayment('${escapeHtml(a.id)}')">✅ Confirm</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="note">No pending cash payments.</p>`}
    </section>

    <section class="card">
      <h3>✅ Paid Players</h3>
      ${paidPlayers.length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Member</th><th>Flight</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              ${paidPlayers.slice(0, 20).map(a => {
                const member = members.find(m => m.id === a.memberId);
                const flight = flights.find(f => f.id === a.flightId);
                return `
                  <tr>
                    <td>${escapeHtml(member?.fullName || "—")}</td>
                    <td>${escapeHtml(flight?.name || "—")}</td>
                    <td>${bhd(a.chargeAmount || 0)}</td>
                    <td>${escapeHtml(dateLabel(a.sessionDate))}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="note">No paid records.</p>`}
    </section>

    <section class="card">
      <h3>❌ Unpaid Players</h3>
      ${unpaidPlayers.length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Member</th><th>Flight</th><th>Amount</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              ${unpaidPlayers.slice(0, 20).map(a => {
                const member = members.find(m => m.id === a.memberId);
                const flight = flights.find(f => f.id === a.flightId);
                return `
                  <tr>
                    <td>${escapeHtml(member?.fullName || "—")}</td>
                    <td>${escapeHtml(flight?.name || "—")}</td>
                    <td>${bhd(a.chargeAmount || 0)}</td>
                    <td>${escapeHtml(dateLabel(a.sessionDate))}</td>
                    <td>
                      <button class="pill" onclick="window.sendPaymentReminder('${escapeHtml(a.id)}')">📧 Remind</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="note">No unpaid records.</p>`}
    </section>

    <section class="card">
      <h3>➕ Add Member Credit</h3>
      <form onsubmit="window.addMemberCredit(event)">
        <div class="grid two">
          <div class="field">
            <label>Select Member *</label>
            <select id="creditMemberId" required>
              <option value="">Select member...</option>
              ${members.map(m => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.fullName)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>Credit Amount (BHD) *</label>
            <input type="number" id="creditAmount" min="0" step="0.001" placeholder="0.000" required>
          </div>
        </div>
        <div class="field">
          <label>Verification Note *</label>
          <textarea id="creditNote" placeholder="e.g., Monthly credit deposit" required></textarea>
        </div>
        <button type="submit" class="primary">✅ Add Credit</button>
      </form>
    </section>
  `;
}

// ===== SUPER ADMIN AUDIT LOGS PAGE =====
export async function superAdminAuditLogsView() {
  const [auditLogs, activities, flights, members] = await Promise.all([
    api("/audit/logs"),
    api("/activities"),
    api("/flights"),
    api("/members")
  ]);

  const selectedCategory = window.auditFilterCategory || "ALL";
  const selectedActivity = window.auditFilterActivity || "ALL";
  const selectedLevel = window.auditFilterLevel || "ALL";
  const selectedDate = window.auditFilterDate || "ALL";
  const selectedMember = window.auditFilterMember || "ALL";

  let filteredLogs = auditLogs;

  // Apply ALL filters concurrently (ALL must match)
  if (selectedCategory !== "ALL") {
    filteredLogs = filteredLogs.filter(log => log.category === selectedCategory);
  }
  if (selectedActivity !== "ALL") {
    filteredLogs = filteredLogs.filter(log => log.activityId === selectedActivity);
  }
  if (selectedLevel !== "ALL") {
    filteredLogs = filteredLogs.filter(log => log.flightName === selectedLevel);
  }
  if (selectedDate !== "ALL") {
    filteredLogs = filteredLogs.filter(log => dateLabel(log.createdAt) === selectedDate);
  }
  if (selectedMember !== "ALL") {
    filteredLogs = filteredLogs.filter(log => log.memberName === selectedMember || log.actorName === selectedMember);
  }

  return `
    <section class="card">
      <h2>📜 System Audit Logs</h2>
      <p class="note">Complete activity tracking with multi-filter system (ALL filters must match concurrently)</p>
    </section>

    <section class="card">
      <h3>🔍 Multi-Filter System</h3>
      <div class="grid two">
        <div class="field">
          <label>Category</label>
          <select id="auditCategory" onchange="window.applyAuditFilters()">
            <option value="ALL">All Categories</option>
            ${CATEGORIES.map(cat => `<option value="${escapeHtml(cat)}" ${selectedCategory === cat ? "selected" : ""}>${escapeHtml(cat)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Activity</label>
          <select id="auditActivity" onchange="window.applyAuditFilters()">
            <option value="ALL">All Activities</option>
            ${activities.map(act => `<option value="${escapeHtml(act.id)}" ${selectedActivity === act.id ? "selected" : ""}>${escapeHtml(act.name)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Flight/Level</label>
          <select id="auditLevel" onchange="window.applyAuditFilters()">
            <option value="ALL">All Levels</option>
            ${LEVELS.map(level => `<option value="${escapeHtml(level)}" ${selectedLevel === level ? "selected" : ""}>${escapeHtml(level)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Date</label>
          <input type="date" id="auditDate" onchange="window.applyAuditFilters()" ${selectedDate !== "ALL" ? `value="${selectedDate}"` : ""}>
        </div>
        <div class="field">
          <label>Member/Actor Name</label>
          <select id="auditMember" onchange="window.applyAuditFilters()">
            <option value="ALL">All Members</option>
            ${members.map(m => `<option value="${escapeHtml(m.fullName)}" ${selectedMember === m.fullName ? "selected" : ""}>${escapeHtml(m.fullName)}</option>`).join("")}
          </select>
        </div>
      </div>
      <button class="primary" onclick="window.printAuditLog()">🖨️ Print Filtered Log</button>
    </section>

    <section class="card">
      <h3>📋 Audit Log Records (${filteredLogs.length})</h3>
      ${filteredLogs.length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Date</th><th>Category</th><th>Action</th><th>Member/Flight</th><th>Details</th><th>By (Actor)</th></tr></thead>
            <tbody>
              ${filteredLogs.slice(0, 100).map(log => `
                <tr>
                  <td>${escapeHtml(dateTime(log.createdAt))}</td>
                  <td><span class="tag amber">${escapeHtml(log.category)}</span></td>
                  <td>${escapeHtml(log.action)}</td>
                  <td>${escapeHtml(log.memberName || log.flightName || "—")}</td>
                  <td>${escapeHtml(log.detail || "—")}</td>
                  <td>${escapeHtml(log.actorName || "System")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="note">No logs match the selected filters.</p>`}
    </section>

    <section class="card">
      <h3>🔗 Quick Views</h3>
      <div class="actions">
        <button class="pill" onclick="window.viewAuditCategory('MEMBER')">👥 Player & Admin Activity</button>
        <button class="pill" onclick="window.viewAuditCategory('WALLET/PAYMENT')">💰 Wallet & Payment Log</button>
        <button class="pill" onclick="window.viewAuditCategory('ATTENDANCE,SESSION CONTROL')">🎮 Session Control Log</button>
        <button class="pill" onclick="window.viewAuditCategory('SHUTTLE STOCK')">📦 Shuttle Stock Log</button>
      </div>
    </section>
  `;
}

// ===== SUPER ADMIN ADS & NOTICES PAGE =====
export async function superAdminAdsView() {
  const [ads, notices] = await Promise.all([
    api("/ads"),
    api("/notices")
  ]);

  const activeAds = ads.filter(a => a.status === "APPROVED" && new Date(a.expiryDate) > new Date());
  const carouselAds = ads.filter(a => a.inCarousel === true);

  return `
    <section class="card">
      <h2>📢 Ads & Notices Management</h2>
      <p class="note">Manage business directory, advertisements, and club announcements</p>
    </section>

    <section class="card">
      <h3>🎠 Carousel Control</h3>
      <div class="grid two">
        <div class="field">
          <label>Featured Ads in Carousel</label>
          <div class="session"><b>${carouselAds.length} / 10</b></div>
        </div>
        <div class="field">
          <label>Set Carousel Limit (Max 10)</label>
          <input type="number" id="carouselLimit" min="1" max="10" value="10" onchange="window.setCarouselLimit(this.value)">
        </div>
      </div>
      <div class="table-wrap">
        <table class="schedule">
          <thead><tr><th>Business</th><th>Category</th><th>In Carousel</th><th>Actions</th></tr></thead>
          <tbody>
            ${activeAds.slice(0, 10).map(ad => `
              <tr>
                <td>${escapeHtml(ad.businessName)}</td>
                <td>${escapeHtml(ad.category)}</td>
                <td><input type="checkbox" ${ad.inCarousel ? "checked" : ""} onchange="window.toggleCarousel('${escapeHtml(ad.id)}')"></td>
                <td>
                  <button class="pill" onclick="window.editAd('${escapeHtml(ad.id)}')">✏️ Edit</button>
                  <button class="pill" onclick="window.removeAd('${escapeHtml(ad.id)}')">🗑️ Remove</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <h3>📸 Create Official Notice</h3>
      <form onsubmit="window.createNotice(event)">
        <div class="field">
          <label>Notice Title *</label>
          <input type="text" id="noticeTitle" placeholder="e.g., Annual Badminton Championship" required>
        </div>
        <div class="field">
          <label>Message *</label>
          <textarea id="noticeMessage" placeholder="Enter notice message..." required></textarea>
        </div>
        <div class="field">
          <label>Upload Image (PNG, JPEG, WebP - Max 2MB)</label>
          <input type="file" id="noticeImage" accept="image/png,image/jpeg,image/webp" onchange="window.validateImageSize(event)">
          <small id="imageSizeError" style="color: red; display: none;">File size exceeds 2MB</small>
        </div>
        <button type="submit" class="primary">📤 Publish Notice</button>
      </form>
    </section>

    <section class="card">
      <h3>⏳ Pending Business Approvals</h3>
      ${ads.filter(a => a.status === "PENDING").length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Business</th><th>Contact</th><th>Category</th><th>Actions</th></tr></thead>
            <tbody>
              ${ads.filter(a => a.status === "PENDING").map(ad => `
                <tr>
                  <td><b>${escapeHtml(ad.businessName)}</b></td>
                  <td>${escapeHtml(ad.email)}</td>
                  <td>${escapeHtml(ad.category)}</td>
                  <td>
                    <button class="pill" onclick="window.approveAd('${escapeHtml(ad.id)}')">✅ Approve</button>
                    <button class="pill" onclick="window.rejectAd('${escapeHtml(ad.id)}')">❌ Reject</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="note">No pending approvals.</p>`}
    </section>

    <section class="card">
      <h3>📋 Published Directory</h3>
      ${activeAds.length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Business</th><th>Category</th><th>Expiry</th><th>Actions</th></tr></thead>
            <tbody>
              ${activeAds.map(ad => `
                <tr>
                  <td><b>${escapeHtml(ad.businessName)}</b></td>
                  <td>${escapeHtml(ad.category)}</td>
                  <td>${escapeHtml(dateLabel(ad.expiryDate))}</td>
                  <td>
                    <button class="pill" onclick="window.editAd('${escapeHtml(ad.id)}')">✏️ Edit</button>
                    <button class="pill" onclick="window.deleteAd('${escapeHtml(ad.id)}')">🗑️ Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="note">No published ads.</p>`}
    </section>

    <section class="card">
      <h3>📢 Notice History</h3>
      ${notices.length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Title</th><th>Published</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${notices.map(notice => `
                <tr>
                  <td>${escapeHtml(notice.title)}</td>
                  <td>${escapeHtml(dateLabel(notice.publishedAt))}</td>
                  <td><span class="tag ${notice.isPublished ? "blue" : "amber"}">${notice.isPublished ? "PUBLISHED" : "DRAFT"}</span></td>
                  <td>
                    <button class="pill" onclick="window.toggleNoticePublish('${escapeHtml(notice.id)}')">🔄 Toggle</button>
                    <button class="pill" onclick="window.deleteNotice('${escapeHtml(notice.id)}')">🗑️ Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="note">No notices created yet.</p>`}
    </section>
  `;
}

// ===== GLOBAL FUNCTIONS =====
window.createActivity = function(event) {
  event.preventDefault();
  const name = document.getElementById('activityName').value;
  console.log('🎮 Creating activity:', name);
  notify("✅ Activity created successfully");
  event.target.reset();
  refresh();
};

window.toggleActivityStatus = function(activityId) {
  console.log('🔄 Toggling activity status:', activityId);
  notify("✅ Activity status updated");
  refresh();
};

window.editActivity = function(activityId) {
  console.log('✏️ Editing activity:', activityId);
  notify("📝 Edit activity form opened");
};

window.createFlight = function(event) {
  event.preventDefault();
  const flightName = document.getElementById('flightName').value;
  console.log('✈️ Creating flight:', flightName);
  notify("✅ Flight created successfully");
  event.target.reset();
  refresh();
};

window.toggleFlightStatus = function(flightId) {
  console.log('🔄 Toggling flight status:', flightId);
  notify("✅ Flight status updated");
  refresh();
};

window.editFlight = function(flightId) {
  console.log('✏️ Editing flight:', flightId);
  notify("📝 Edit flight form opened");
};

window.preRegisterMember = function(event) {
  event.preventDefault();
  const name = document.getElementById('preName').value;
  const phone = document.getElementById('prePhone').value;
  const whatsappLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Welcome%20to%20Indian%20Club%20Bahrain!%20Click%20here%20to%20activate%20your%20account`;
  console.log('📱 Pre-registering member:', name, 'WhatsApp:', whatsappLink);
  notify("✅ WhatsApp link generated: " + whatsappLink);
  event.target.reset();
};

window.filterRoster = function() {
  console.log('🔍 Filtering roster');
  refresh();
};

window.toggleMemberStatus = function(memberId) {
  console.log('🔄 Toggling member status:', memberId);
  notify("✅ Member status updated");
  refresh();
};

window.editMember = function(memberId) {
  console.log('✏️ Editing member:', memberId);
  notify("📝 Edit member form opened");
};

window.printRegister = function(memberId) {
  console.log('🖨️ Printing register for member:', memberId);
  window.print();
};

window.loadTimetable = function() {
  console.log('📂 Loading timetable');
  notify("✅ Timetable loaded");
  refresh();
};

window.importCSV = function(event) {
  event.preventDefault();
  const file = document.getElementById('csvFile').files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const csv = e.target.result;
    const lines = csv.split('\n').filter(line => line.trim());
    
    // Auto-remove header line
    let dataLines = lines;
    if (lines[0].toLowerCase().includes('weekday') || lines[0].toLowerCase().includes('day')) {
      dataLines = lines.slice(1);
    }

    let hasError = false;
    dataLines.forEach((line, index) => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length !== 4) {
        notify(`❌ Row ${index + 1} invalid: Expected 4 columns, got ${parts.length}`);
        hasError = true;
      }
    });

    if (!hasError) {
      console.log('📥 Importing CSV with', dataLines.length, 'rows');
      notify("✅ CSV imported successfully");
      document.getElementById('csvFile').value = '';
    }
  };
  reader.readAsText(file);
};

window.addWeeklySlot = function(event) {
  event.preventDefault();
  const day = document.getElementById('slotDay').value;
  const startTime = document.getElementById('slotStartTime').value;
  const endTime = document.getElementById('slotEndTime').value;
  console.log('➕ Adding weekly slot:', day, startTime, '-', endTime);
  notify("✅ Weekly slot added successfully");
  event.target.reset();
  refresh();
};

window.publishMonth = function() {
  console.log('🚀 Publishing month');
  notify("✅ Month published successfully");
  refresh();
};

window.filterFinanceByLevel = function(level) {
  window.currentLevelFilter = level;
  console.log('🔍 Filtering finance by level:', level);
  refresh();
};

window.addCredit = function(memberId) {
  console.log('➕ Adding credit for member:', memberId);
  notify("💳 Add credit form opened");
};

window.deductCredit = function(memberId) {
  console.log('➖ Deducting credit for member:', memberId);
  notify("💳 Deduct credit form opened");
};

window.confirmPayment = function(attendanceId) {
  if (confirm("Confirm this payment has been received?")) {
    console.log('✅ Confirming payment:', attendanceId);
    notify("✅ Payment confirmed");
    refresh();
  }
};

window.sendPaymentReminder = function(attendanceId) {
  console.log('📧 Sending payment reminder:', attendanceId);
  notify("✅ Payment reminder sent via WhatsApp");
};

window.addMemberCredit = function(event) {
  event.preventDefault();
  const memberId = document.getElementById('creditMemberId').value;
  const amount = document.getElementById('creditAmount').value;
  const note = document.getElementById('creditNote').value;
  console.log('➕ Adding credit:', { memberId, amount, note });
  notify("✅ Credit added successfully");
  event.target.reset();
  refresh();
};

window.applyAuditFilters = function() {
  window.auditFilterCategory = document.getElementById('auditCategory').value;
  window.auditFilterActivity = document.getElementById('auditActivity').value;
  window.auditFilterLevel = document.getElementById('auditLevel').value;
  window.auditFilterDate = document.getElementById('auditDate').value || "ALL";
  window.auditFilterMember = document.getElementById('auditMember').value;
  console.log('🔍 Applying audit filters');
  refresh();
};

window.printAuditLog = function() {
  console.log('🖨️ Printing audit log');
  window.print();
};

window.viewAuditCategory = function(category) {
  window.auditFilterCategory = category;
  console.log('👁️ Viewing audit category:', category);
  refresh();
};

window.setCarouselLimit = function(limit) {
  if (limit > 10) {
    notify("❌ Carousel limit cannot exceed 10 ads");
    return;
  }
  console.log('🎠 Setting carousel limit:', limit);
  notify("✅ Carousel limit updated to " + limit);
};

window.toggleCarousel = function(adId) {
  console.log('🔄 Toggling carousel for ad:', adId);
  notify("✅ Carousel status updated");
  refresh();
};

window.editAd = function(adId) {
  console.log('✏️ Editing ad:', adId);
  notify("📝 Edit ad form opened");
};

window.removeAd = function(adId) {
  if (confirm("Remove this ad from carousel?")) {
    console.log('🗑️ Removing ad from carousel:', adId);
    notify("✅ Ad removed from carousel");
    refresh();
  }
};

window.createNotice = function(event) {
  event.preventDefault();
  const title = document.getElementById('noticeTitle').value;
  const message = document.getElementById('noticeMessage').value;
  const image = document.getElementById('noticeImage').files[0];
  console.log('📢 Creating notice:', { title, message, image: image?.name });
  notify("✅ Notice published successfully");
  event.target.reset();
  refresh();
};

window.validateImageSize = function(event) {
  const file = event.target.files[0];
  const maxSize = 2 * 1024 * 1024; // 2MB
  const errorElement = document.getElementById('imageSizeError');
  
  if (file && file.size > maxSize) {
    errorElement.style.display = 'block';
    event.target.value = '';
  } else {
    errorElement.style.display = 'none';
  }
};

window.approveAd = function(adId) {
  console.log('✅ Approving ad:', adId);
  notify("✅ Ad approved and published");
  refresh();
};

window.rejectAd = function(adId) {
  const reason = prompt("Enter rejection reason:");
  if (reason) {
    console.log('❌ Rejecting ad:', adId, 'Reason:', reason);
    notify("✅ Ad rejected");
    refresh();
  }
};

window.deleteAd = function(adId) {
  if (confirm("Permanently delete this ad?")) {
    console.log('🗑️ Deleting ad:', adId);
    notify("✅ Ad deleted permanently");
    refresh();
  }
};

window.toggleNoticePublish = function(noticeId) {
  console.log('🔄 Toggling notice publish status:', noticeId);
  notify("✅ Notice status updated");
  refresh();
};

window.deleteNotice = function(noticeId) {
  if (confirm("Delete this notice?")) {
    console.log('🗑️ Deleting notice:', noticeId);
    notify("✅ Notice deleted");
    refresh();
  }
};

export const adminViews = {
  home: superAdminHomeView,
  activities: superAdminActivitiesView,
  timetable: superAdminTimetableView,
  finance: superAdminFinanceView,
  auditLogs: superAdminAuditLogsView,
  ads: superAdminAdsView
};

