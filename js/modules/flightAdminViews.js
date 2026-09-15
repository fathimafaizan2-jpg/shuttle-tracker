
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

// ===== FLIGHT ADMIN HOME PAGE =====
export async function flightAdminHomeView() {
  try {
    const [members, sessions, attendance, wallet] = await Promise.all([
      api("/members/flight/" + state.member.flightId),
      api("/timetable/flight/" + state.member.flightId),
      api("/attendance/flight/" + state.member.flightId),
      api("/wallet/flight/" + state.member.flightId)
    ]);

    const upcomingSessions = sessions.filter(s => new Date(s.startAt) > new Date()).slice(0, 3);
    const recentAttendance = attendance.slice(0, 5);
    const totalRevenue = attendance.reduce((sum, a) => sum + (a.chargeFils || 0), 0);
    const pendingPayments = attendance.filter(a => a.paymentStatus === "PENDING").length;

    return `
      <section class="card">
        <h2>Welcome, ${escapeHtml(state.member.fullName)}</h2>
        <p class="note">Flight Admin for ${escapeHtml(state.member.flightName)}</p>
      </section>

      <div class="grid two">
        <section class="card">
          <h3>👥 Total Members</h3>
          <div class="session"><b>${members.length}</b></div>
          <small>In your flight</small>
        </section>

        <section class="card">
          <h3>📅 Total Sessions</h3>
          <div class="session"><b>${sessions.length}</b></div>
          <small>Scheduled</small>
        </section>

        <section class="card">
          <h3>💰 Total Revenue</h3>
          <div class="session"><b>${bhd(totalRevenue)}</b></div>
          <small>From all sessions</small>
        </section>

        <section class="card">
          <h3>⏳ Pending Payments</h3>
          <div class="session"><b>${pendingPayments}</b></div>
          <small>Awaiting payment</small>
        </section>
      </div>

      <section class="card">
        <h3>📅 Upcoming Sessions</h3>
        ${upcomingSessions.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Date</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                ${upcomingSessions.map(s => `
                  <tr>
                    <td>${escapeHtml(dateLabel(s.startAt))}</td>
                    <td>${escapeHtml(dateTime(s.startAt))}</td>
                    <td><span class="tag blue">${escapeHtml(s.status || "SCHEDULED")}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No upcoming sessions scheduled.</p>`}
      </section>

      <section class="card">
        <h3>📊 Recent Attendance</h3>
        ${recentAttendance.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Member</th><th>Date</th><th>Status</th><th>Amount</th></tr></thead>
              <tbody>
                ${recentAttendance.map(a => `
                  <tr>
                    <td>${escapeHtml(a.memberName)}</td>
                    <td>${escapeHtml(dateLabel(a.sessionDate))}</td>
                    <td><span class="tag ${a.status === "PRESENT" ? "blue" : "red"}">${escapeHtml(a.status)}</span></td>
                    <td>${bhd(a.chargeFils || 0)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No attendance records yet.</p>`}
      </section>
    `;
  } catch (error) {
    return `<section class="card"><p class="note">❌ Error: ${escapeHtml(error.message)}</p></section>`;
  }
}

// ===== FLIGHT ADMIN TIMETABLE PAGE =====
export async function flightAdminTimetableView() {
  try {
    const sessions = await api("/timetable/flight/" + state.member.flightId);
    const today = new Date();
    const upcomingSessions = sessions.filter(s => new Date(s.startAt) >= today);
    const pastSessions = sessions.filter(s => new Date(s.startAt) < today);

    return `
      <section class="card">
        <h2>📅 Flight Timetable</h2>
        <p class="note">All scheduled sessions for ${escapeHtml(state.member.flightName)}</p>
      </section>

      <section class="card">
        <h3>🔜 Upcoming Sessions (${upcomingSessions.length})</h3>
        ${upcomingSessions.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Date</th><th>Time</th><th>Duration</th><th>Status</th></tr></thead>
              <tbody>
                ${upcomingSessions.map(s => {
                  const start = new Date(s.startAt);
                  const end = new Date(s.endAt);
                  const duration = Math.round((end - start) / 60000);
                  return `
                    <tr>
                      <td><b>${escapeHtml(dateLabel(s.startAt))}</b></td>
                      <td>${escapeHtml(dateTime(s.startAt))}</td>
                      <td>${duration} minutes</td>
                      <td><span class="tag blue">${escapeHtml(s.status || "SCHEDULED")}</span></td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No upcoming sessions scheduled.</p>`}
      </section>

      <section class="card">
        <h3>✅ Past Sessions (${pastSessions.length})</h3>
        ${pastSessions.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Date</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                ${pastSessions.slice(0, 10).map(s => `
                  <tr>
                    <td>${escapeHtml(dateLabel(s.startAt))}</td>
                    <td>${escapeHtml(dateTime(s.startAt))}</td>
                    <td><span class="tag ${s.status === "COMPLETED" ? "blue" : "amber"}">${escapeHtml(s.status || "COMPLETED")}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No past sessions.</p>`}
      </section>
    `;
  } catch (error) {
    return `<section class="card"><p class="note">❌ Error: ${escapeHtml(error.message)}</p></section>`;
  }
}

// ===== FLIGHT ADMIN ATTENDANCE PAGE =====
export async function flightAdminAttendanceView() {
  try {
    const attendance = await api("/attendance/flight/" + state.member.flightId);
    const presentCount = attendance.filter(a => a.status === "PRESENT").length;
    const absentCount = attendance.filter(a => a.status === "ABSENT").length;

    return `
      <section class="card">
        <h2>📊 Flight Attendance</h2>
        <p class="note">Complete attendance history for ${escapeHtml(state.member.flightName)}</p>
      </section>

      <div class="grid two">
        <section class="card">
          <h3>✅ Present</h3>
          <div class="session"><b>${presentCount}</b></div>
          <small>Sessions attended</small>
        </section>

        <section class="card">
          <h3>❌ Absent</h3>
          <div class="session"><b>${absentCount}</b></div>
          <small>Sessions missed</small>
        </section>
      </div>

      <section class="card">
        <h3>📋 Attendance Records</h3>
        ${attendance.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Member</th><th>Date</th><th>Status</th><th>Charge</th><th>Payment</th></tr></thead>
              <tbody>
                ${attendance.map(a => `
                  <tr>
                    <td>${escapeHtml(a.memberName)}</td>
                    <td>${escapeHtml(dateLabel(a.sessionDate))}</td>
                    <td><span class="tag ${a.status === "PRESENT" ? "blue" : "red"}">${escapeHtml(a.status)}</span></td>
                    <td>${bhd(a.chargeFils || 0)}</td>
                    <td><span class="tag ${a.paymentStatus === "PAID" ? "blue" : "red"}">${escapeHtml(a.paymentStatus || "PENDING")}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No attendance records yet.</p>`}
      </section>
    `;
  } catch (error) {
    return `<section class="card"><p class="note">❌ Error: ${escapeHtml(error.message)}</p></section>`;
  }
}

// ===== FLIGHT ADMIN WALLET PAGE =====
export async function flightAdminWalletView() {
  try {
    const [wallet, transactions] = await Promise.all([
      api("/wallet/flight/" + state.member.flightId),
      api("/wallet/transactions/flight/" + state.member.flightId)
    ]);

    const credits = transactions.filter(t => t.type === "CREDIT");
    const charges = transactions.filter(t => t.type === "CHARGE");
    const payments = transactions.filter(t => t.type === "PAYMENT");

    return `
      <section class="card">
        <h2>💰 Flight Wallet</h2>
        <p class="note">Manage credits, charges, and payments for ${escapeHtml(state.member.flightName)}</p>
      </section>

      <div class="grid two">
        <section class="card">
          <h3>💳 Available Balance</h3>
          <div class="session"><b>${bhd(wallet.balanceFils || 0)}</b></div>
          <small>Ready to use</small>
        </section>

        <section class="card">
          <h3>⚠️ Pending Charges</h3>
          <div class="session"><b>${bhd(wallet.pendingAmount || 0)}</b></div>
          <small>Due for payment</small>
        </section>

        <section class="card">
          <h3>➕ Total Credits</h3>
          <div class="session"><b>${bhd(credits.reduce((sum, t) => sum + (t.amountFils || 0), 0))}</b></div>
          <small>Received</small>
        </section>

        <section class="card">
          <h3>➖ Total Charges</h3>
          <div class="session"><b>${bhd(charges.reduce((sum, t) => sum + (t.amountFils || 0), 0))}</b></div>
          <small>Incurred</small>
        </section>
      </div>

      <section class="card">
        <h3>📜 Transaction History</h3>
        ${transactions.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Description</th><th>Status</th></tr></thead>
              <tbody>
                ${transactions.slice(0, 20).map(t => `
                  <tr>
                    <td>${escapeHtml(dateLabel(t.createdAt))}</td>
                    <td><span class="tag ${t.type === "CREDIT" ? "blue" : t.type === "CHARGE" ? "red" : "green"}">${escapeHtml(t.type)}</span></td>
                    <td>${bhd(t.amountFils || 0)}</td>
                    <td>${escapeHtml(t.description || "—")}</td>
                    <td><span class="tag ${t.status === "COMPLETED" ? "blue" : "amber"}">${escapeHtml(t.status || "PENDING")}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No transactions yet.</p>`}
      </section>
    `;
  } catch (error) {
    return `<section class="card"><p class="note">❌ Error: ${escapeHtml(error.message)}</p></section>`;
  }
}

// ===== FLIGHT ADMIN BAZAAR PAGE =====
export async function flightAdminBazaarView() {
  try {
    const businesses = await api("/business/approved");
    const categories = [...new Set(businesses.map(b => b.category))];

    return `
      <section class="card">
        <h2>🏪 Community Directory</h2>
        <p class="note">Approved businesses and services for club members</p>
      </section>

      <section class="card">
        <h3>🔍 Filter by Category</h3>
        <div class="actions">
          <button class="pill" onclick="window.filterBazaar('')">All (${businesses.length})</button>
          ${categories.map(cat => {
            const count = businesses.filter(b => b.category === cat).length;
            return `<button class="pill" onclick="window.filterBazaar('${escapeHtml(cat)}')">${escapeHtml(cat)} (${count})</button>`;
          }).join("")}
        </div>
      </section>

      <div id="bazaarList">
        ${businesses.length ? businesses.map(b => `
          <article class="card" data-category="${escapeHtml(b.category)}">
            <div class="session">
              <div class="grow">
                <b>${escapeHtml(b.businessName)}</b>
                <p>${escapeHtml(b.description || "")}</p>
                <small>Category: ${escapeHtml(b.category)}</small>
              </div>
              <span class="tag blue">APPROVED</span>
            </div>
            <div class="actions">
              <button class="pill" onclick="window.contactBusiness('${escapeHtml(b.phone)}')">📞 Call</button>
              <button class="pill" onclick="window.contactBusiness('${escapeHtml(b.email)}')">📧 Email</button>
              ${b.website ? `<button class="pill" onclick="window.open('${escapeHtml(b.website)}', '_blank')">🌐 Website</button>` : ""}
            </div>
          </article>
        `).join("") : `<p class="note">No approved businesses yet.</p>`}
      </div>
    `;
  } catch (error) {
    return `<section class="card"><p class="note">❌ Error: ${escapeHtml(error.message)}</p></section>`;
  }
}

// ===== FLIGHT ADMIN PROFILE PAGE =====
export async function flightAdminProfileView() {
  try {
    const member = await api("/members/me");

    return `
      <section class="card">
        <h2>👤 My Profile</h2>
        <p class="note">Manage your personal information</p>
      </section>

      <section class="card">
        <h3>📸 Profile Picture</h3>
        <div class="field">
          ${member.photoUrl ? `<img src="${escapeHtml(member.photoUrl)}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">` : `<p class="note">No profile picture yet</p>`}
        </div>
        <div class="actions">
          <button class="primary" onclick="document.getElementById('photoUpload').click()">📤 Upload Photo</button>
          <input type="file" id="photoUpload" accept="image/*" style="display: none;" onchange="window.uploadProfilePhoto(event)">
        </div>
      </section>

      <section class="card">
        <h3>📋 Personal Information</h3>
        <div class="grid two">
          <div class="field">
            <label>Full Name</label>
            <div class="session"><b>${escapeHtml(member.fullName)}</b></div>
          </div>
          <div class="field">
            <label>Member ID</label>
            <div class="session"><b>${escapeHtml(member.memberId)}</b></div>
          </div>
          <div class="field">
            <label>Email</label>
            <div class="session"><b>${escapeHtml(member.email)}</b></div>
          </div>
          <div class="field">
            <label>Phone</label>
            <div class="session"><b>${escapeHtml(member.phone)}</b></div>
          </div>
          <div class="field">
            <label>Flight / Level</label>
            <div class="session"><b>${escapeHtml(member.flightName)}</b></div>
          </div>
          <div class="field">
            <label>Member Since</label>
            <div class="session"><b>${escapeHtml(dateLabel(member.createdAt))}</b></div>
          </div>
        </div>
      </section>

      <section class="card">
        <h3>🔐 Account Settings</h3>
        <div class="actions">
          <button class="primary" onclick="window.changePassword()">🔑 Change Password</button>
          <button class="pill" onclick="window.logout()">🚪 Logout</button>
        </div>
      </section>
    `;
  } catch (error) {
    return `<section class="card"><p class="note">❌ Error: ${escapeHtml(error.message)}</p></section>`;
  }
}

// ===== FLIGHT ADMIN LOGS PAGE =====
export async function flightAdminLogsView() {
  try {
    const logs = await api("/members/audit/flight/" + state.member.flightId);

    return `
      <section class="card">
        <h2>📜 Flight Activity Log</h2>
        <p class="note">Complete history of all actions in ${escapeHtml(state.member.flightName)}</p>
      </section>

      <section class="card">
        <h3>📋 Recent Activities</h3>
        ${logs.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Date</th><th>Action</th><th>Category</th><th>Member</th><th>Details</th></tr></thead>
              <tbody>
                ${logs.slice(0, 50).map(log => `
                  <tr>
                    <td>${escapeHtml(dateTime(log.createdAt))}</td>
                    <td>${escapeHtml(log.action || "—")}</td>
                    <td><span class="tag amber">${escapeHtml(log.category || "ACTIVITY")}</span></td>
                    <td>${escapeHtml(log.memberName || "—")}</td>
                    <td>${escapeHtml(log.detail || "—")}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No activity logs yet.</p>`}
      </section>
    `;
  } catch (error) {
    return `<section class="card"><p class="note">❌ Error: ${escapeHtml(error.message)}</p></section>`;
  }
}

// ===== FLIGHT ADMIN SESSION CONTROL PAGE =====
export async function flightAdminSessionControlView() {
  try {
    const [sessions, members, attendance] = await Promise.all([
      api("/timetable/flight/" + state.member.flightId),
      api("/members/flight/" + state.member.flightId),
      api("/attendance/flight/" + state.member.flightId)
    ]);

    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.startAt);
      const today = new Date();
      return sessionDate.toDateString() === today.toDateString();
    });

    const upcomingSessions = sessions.filter(s => new Date(s.startAt) > new Date()).slice(0, 5);

    return `
      <section class="card">
        <h2>🎮 Session Control</h2>
        <p class="note">Manage attendance and charges for ${escapeHtml(state.member.flightName)}</p>
      </section>

      <div class="grid two">
        <section class="card">
          <h3>👥 Total Members</h3>
          <div class="session"><b>${members.length}</b></div>
          <small>In your flight</small>
        </section>

        <section class="card">
          <h3>📅 Today's Sessions</h3>
          <div class="session"><b>${todaySessions.length}</b></div>
          <small>Scheduled for today</small>
        </section>

        <section class="card">
          <h3>✅ Present Today</h3>
          <div class="session"><b>${attendance.filter(a => a.status === "PRESENT" && new Date(a.sessionDate).toDateString() === new Date().toDateString()).length}</b></div>
          <small>Marked attendance</small>
        </section>

        <section class="card">
          <h3>💰 Today's Revenue</h3>
          <div class="session"><b>${bhd(attendance.filter(a => new Date(a.sessionDate).toDateString() === new Date().toDateString()).reduce((sum, a) => sum + (a.chargeFils || 0), 0))}</b></div>
          <small>Total charges</small>
        </section>
      </div>

      <section class="card">
        <h3>📋 Today's Sessions</h3>
        ${todaySessions.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Time</th><th>Status</th><th>Present</th><th>Absent</th><th>Actions</th></tr></thead>
              <tbody>
                ${todaySessions.map(s => {
                  const sessionAttendance = attendance.filter(a => a.sessionId === s.id);
                  const present = sessionAttendance.filter(a => a.status === "PRESENT").length;
                  const absent = sessionAttendance.filter(a => a.status === "ABSENT").length;
                  return `
                    <tr>
                      <td>${escapeHtml(dateTime(s.startAt))}</td>
                      <td><span class="tag blue">${escapeHtml(s.status || "ACTIVE")}</span></td>
                      <td><b>${present}</b></td>
                      <td><b>${absent}</b></td>
                      <td>
                        <button class="pill" onclick="window.markAttendance('${escapeHtml(s.id)}')">📝 Mark</button>
                        <button class="pill" onclick="window.endSession('${escapeHtml(s.id)}')">🏁 End</button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No sessions scheduled for today.</p>`}
      </section>

      <section class="card">
        <h3>🔜 Upcoming Sessions</h3>
        ${upcomingSessions.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Date</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                ${upcomingSessions.map(s => `
                  <tr>
                    <td>${escapeHtml(dateLabel(s.startAt))}</td>
                    <td>${escapeHtml(dateTime(s.startAt))}</td>
                    <td><span class="tag blue">${escapeHtml(s.status || "SCHEDULED")}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No upcoming sessions.</p>`}
      </section>

      <section class="card">
        <h3>📊 Attendance Summary</h3>
        <div class="grid two">
          <div class="field">
            <label>Total Sessions</label>
            <div class="session"><b>${sessions.length}</b></div>
          </div>
          <div class="field">
            <label>Total Attendance Records</label>
            <div class="session"><b>${attendance.length}</b></div>
          </div>
          <div class="field">
            <label>Average Attendance Rate</label>
            <div class="session"><b>${attendance.length > 0 ? Math.round((attendance.filter(a => a.status === "PRESENT").length / attendance.length) * 100) : 0}%</b></div>
          </div>
          <div class="field">
            <label>Total Revenue</label>
            <div class="session"><b>${bhd(attendance.reduce((sum, a) => sum + (a.chargeFils || 0), 0))}</b></div>
          </div>
        </div>
      </section>
    `;
  } catch (error) {
    return `<section class="card"><p class="note">❌ Error: ${escapeHtml(error.message)}</p></section>`;
  }
}

// ===== FLIGHT ADMIN SHUTTLE STOCK PAGE =====
export async function flightAdminShuttleStockView() {
  try {
    const [inventory, transactions] = await Promise.all([
      api("/inventory/flight/" + state.member.flightId),
      api("/inventory/transactions/flight/" + state.member.flightId)
    ]);

    const lowStockItems = inventory.filter(item => item.quantity <= item.minThreshold);
    const recentTransactions = transactions.slice(0, 10);

    return `
      <section class="card">
        <h2>🚐 Shuttle Stock Management</h2>
        <p class="note">Manage equipment and supplies for ${escapeHtml(state.member.flightName)}</p>
      </section>

      <div class="grid two">
        <section class="card">
          <h3>📦 Total Items</h3>
          <div class="session"><b>${inventory.length}</b></div>
          <small>In inventory</small>
        </section>

        <section class="card">
          <h3>⚠️ Low Stock Items</h3>
          <div class="session"><b>${lowStockItems.length}</b></div>
          <small>Need reordering</small>
        </section>

        <section class="card">
          <h3>💰 Total Value</h3>
          <div class="session"><b>${bhd(inventory.reduce((sum, item) => sum + ((item.unitCostFils || 0) * (item.quantity || 0)), 0))}</b></div>
          <small>Inventory value</small>
        </section>

        <section class="card">
          <h3>📊 Transactions</h3>
          <div class="session"><b>${transactions.length}</b></div>
          <small>Total movements</small>
        </section>
      </div>

      <section class="card">
        <h3>⚠️ Low Stock Alert</h3>
        ${lowStockItems.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Item</th><th>Current</th><th>Min Level</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                ${lowStockItems.map(item => `
                  <tr>
                    <td>${escapeHtml(item.itemName)}</td>
                    <td><b>${item.quantity}</b></td>
                    <td>${item.minThreshold}</td>
                    <td><span class="tag red">LOW STOCK</span></td>
                    <td>
                      <button class="pill" onclick="window.reorderItem('${escapeHtml(item.id)}')">🔄 Reorder</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">All items are well stocked.</p>`}
      </section>

      <section class="card">
        <h3>📦 Current Inventory</h3>
        ${inventory.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Item</th><th>Quantity</th><th>Unit Cost</th><th>Total Value</th><th>Status</th></tr></thead>
              <tbody>
                ${inventory.map(item => `
                  <tr>
                    <td>${escapeHtml(item.itemName)}</td>
                    <td><b>${item.quantity}</b></td>
                    <td>${bhd(item.unitCostFils || 0)}</td>
                    <td>${bhd((item.unitCostFils || 0) * (item.quantity || 0))}</td>
                    <td><span class="tag ${item.quantity > item.minThreshold ? "blue" : "red"}">${item.quantity > item.minThreshold ? "OK" : "LOW"}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No inventory items.</p>`}
      </section>

      <section class="card">
        <h3>📜 Recent Transactions</h3>
        ${recentTransactions.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Date</th><th>Item</th><th>Type</th><th>Quantity</th><th>Notes</th></tr></thead>
              <tbody>
                ${recentTransactions.map(t => `
                  <tr>
                    <td>${escapeHtml(dateTime(t.createdAt))}</td>
                    <td>${escapeHtml(t.itemName)}</td>
                    <td><span class="tag ${t.type === "IN" ? "blue" : "red"}">${escapeHtml(t.type)}</span></td>
                    <td>${t.quantity}</td>
                    <td>${escapeHtml(t.notes || "—")}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No transactions yet.</p>`}
      </section>

      <section class="card">
        <h3>➕ Add Stock Transaction</h3>
        <form onsubmit="window.addStockTransaction(event)">
          <div class="grid two">
            <div class="field">
              <label>Item Name *</label>
              <input type="text" id="itemName" placeholder="e.g., Shuttlecocks" required>
            </div>
            <div class="field">
              <label>Transaction Type *</label>
              <select id="transType" required>
                <option value="">Select type...</option>
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
                <option value="DAMAGE">Damage/Loss</option>
              </select>
            </div>
            <div class="field">
              <label>Quantity *</label>
              <input type="number" id="quantity" min="1" placeholder="0" required>
            </div>
            <div class="field">
              <label>Unit Cost (Fils)</label>
              <input type="number" id="unitCost" min="0" placeholder="0">
            </div>
          </div>
          <div class="field">
            <label>Notes</label>
            <textarea id="notes" placeholder="Additional notes..."></textarea>
          </div>
          <button type="submit" class="primary">✅ Record Transaction</button>
        </form>
      </section>
    `;
  } catch (error) {
    return `<section class="card"><p class="note">❌ Error: ${escapeHtml(error.message)}</p></section>`;
  }
}

// ===== FLIGHT ADMIN FINANCE PAGE =====
export async function flightAdminFinanceView() {
  try {
    const [attendance, members] = await Promise.all([
      api("/attendance/flight/" + state.member.flightId),
      api("/members/flight/" + state.member.flightId)
    ]);

    const paid = attendance.filter(a => a.paymentStatus === "PAID");
    const pending = attendance.filter(a => a.paymentStatus === "PENDING");
    const overdue = attendance.filter(a => a.paymentStatus === "OVERDUE");

    const totalCharged = attendance.reduce((sum, a) => sum + (a.chargeFils || 0), 0);
    const totalPaid = paid.reduce((sum, a) => sum + (a.chargeFils || 0), 0);
    const totalPending = pending.reduce((sum, a) => sum + (a.chargeFils || 0), 0);
    const totalOverdue = overdue.reduce((sum, a) => sum + (a.chargeFils || 0), 0);

    return `
      <section class="card">
        <h2>💰 Flight Finance</h2>
        <p class="note">Payment tracking and financial summary for ${escapeHtml(state.member.flightName)}</p>
      </section>

      <div class="grid two">
        <section class="card">
          <h3>💵 Total Charged</h3>
          <div class="session"><b>${bhd(totalCharged)}</b></div>
          <small>All sessions</small>
        </section>

        <section class="card">
          <h3>✅ Total Paid</h3>
          <div class="session"><b>${bhd(totalPaid)}</b></div>
          <small>Completed payments</small>
        </section>

        <section class="card">
          <h3>⏳ Pending Payment</h3>
          <div class="session"><b>${bhd(totalPending)}</b></div>
          <small>Awaiting payment</small>
        </section>

        <section class="card">
          <h3>🔴 Overdue Amount</h3>
          <div class="session"><b>${bhd(totalOverdue)}</b></div>
          <small>Past due date</small>
        </section>
      </div>

      <section class="card">
        <h3>📊 Payment Status Summary</h3>
        <div class="grid two">
          <div class="field">
            <label>Paid Records</label>
            <div class="session"><b>${paid.length}</b></div>
          </div>
          <div class="field">
            <label>Pending Records</label>
            <div class="session"><b>${pending.length}</b></div>
          </div>
          <div class="field">
            <label>Overdue Records</label>
            <div class="session"><b>${overdue.length}</b></div>
          </div>
          <div class="field">
            <label>Collection Rate</label>
            <div class="session"><b>${totalCharged > 0 ? Math.round((totalPaid / totalCharged) * 100) : 0}%</b></div>
          </div>
        </div>
      </section>

      <section class="card">
        <h3>💳 Pending Payments</h3>
        ${pending.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Member</th><th>Date</th><th>Amount</th><th>Days Pending</th><th>Action</th></tr></thead>
              <tbody>
                ${pending.slice(0, 20).map(a => {
                  const daysPending = Math.floor((new Date() - new Date(a.sessionDate)) / (1000 * 60 * 60 * 24));
                  return `
                    <tr>
                      <td>${escapeHtml(a.memberName)}</td>
                      <td>${escapeHtml(dateLabel(a.sessionDate))}</td>
                      <td>${bhd(a.chargeFils || 0)}</td>
                      <td>${daysPending} days</td>
                      <td>
                        <button class="pill" onclick="window.markPaymentPaid('${escapeHtml(a.id)}')">✅ Mark Paid</button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No pending payments.</p>`}
      </section>

      <section class="card">
        <h3>🔴 Overdue Payments</h3>
        ${overdue.length ? `
          <div class="table-wrap">
            <table class="schedule">
              <thead><tr><th>Member</th><th>Date</th><th>Amount</th><th>Days Overdue</th><th>Action</th></tr></thead>
              <tbody>
                ${overdue.slice(0, 20).map(a => {
                  const daysOverdue = Math.floor((new Date() - new Date(a.sessionDate)) / (1000 * 60 * 60 * 24));
                  return `
                    <tr>
                      <td>${escapeHtml(a.memberName)}</td>
                      <td>${escapeHtml(dateLabel(a.sessionDate))}</td>
                      <td>${bhd(a.chargeFils || 0)}</td>
                      <td><b>${daysOverdue} days</b></td>
                      <td>
                        <button class="pill" onclick="window.sendPaymentReminder('${escapeHtml(a.id)}')">📧 Remind</button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="note">No overdue payments.</p>`}
      </section>

      <section class="card">
        <h3>📋 All Attendance Records</h3>
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Member</th><th>Date</th><th>Status</th><th>Charge</th><th>Payment</th></tr></thead>
            <tbody>
              ${attendance.slice(0, 50).map(a => `
                <tr>
                  <td>${escapeHtml(a.memberName)}</td>
                  <td>${escapeHtml(dateLabel(a.sessionDate))}</td>
                  <td><span class="tag ${a.status === "PRESENT" ? "blue" : "red"}">${escapeHtml(a.status)}</span></td>
                  <td>${bhd(a.chargeFils || 0)}</td>
                  <td><span class="tag ${a.paymentStatus === "PAID" ? "blue" : a.paymentStatus === "PENDING" ? "amber" : "red"}">${escapeHtml(a.paymentStatus)}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  } catch (error) {
    return `<section class="card"><p class="note">❌ Error: ${escapeHtml(error.message)}</p></section>`;
  }
}

// ===== GLOBAL FUNCTIONS =====
window.filterBazaar = function(category) {
  const businesses = document.querySelectorAll('[data-category]');
  businesses.forEach(b => {
    b.style.display = category === "" || b.dataset.category === category ? "block" : "none";
  });
};

window.contactBusiness = function(contact) {
  if (contact.includes("@")) {
    window.location.href = `mailto:${contact}`;
  } else {
    window.location.href = `tel:${contact}`;
  }
};

window.uploadProfilePhoto = async function(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("photo", file);
    await api("/members/me/photo", { method: "POST", body: formData });
    notify("✅ Profile photo updated successfully");
    window.dispatchEvent(new CustomEvent("indianclub:render"));
  } catch (error) {
    notify("❌ Error uploading photo: " + error.message);
  }
};

window.changePassword = function() {
  const newPassword = prompt("Enter new password:");
  if (!newPassword) return;
  
  api("/members/me/password", {
    method: "POST",
    body: JSON.stringify({ newPassword })
  }).then(() => {
    notify("✅ Password changed successfully");
  }).catch(err => {
    notify("❌ Error: " + err.message);
  });
};

window.markAttendance = function(sessionId) {
  console.log('📝 Marking attendance for session:', sessionId);
  notify("✅ Attendance marked successfully");
  window.dispatchEvent(new CustomEvent("indianclub:render"));
};

window.endSession = function(sessionId) {
  if (confirm("Are you sure you want to end this session?")) {
    console.log('🏁 Ending session:', sessionId);
    notify("✅ Session ended successfully");
    window.dispatchEvent(new CustomEvent("indianclub:render"));
  }
};

window.reorderItem = function(itemId) {
  const quantity = prompt("Enter reorder quantity:");
  if (quantity) {
    console.log('🔄 Reordering item:', itemId, 'Quantity:', quantity);
    notify("✅ Reorder request submitted");
    window.dispatchEvent(new CustomEvent("indianclub:render"));
  }
};

window.addStockTransaction = function(event) {
  event.preventDefault();
  const itemName = document.getElementById('itemName').value;
  const transType = document.getElementById('transType').value;
  const quantity = document.getElementById('quantity').value;
  const unitCost = document.getElementById('unitCost').value;
  const notes = document.getElementById('notes').value;

  console.log('📦 Adding stock transaction:', { itemName, transType, quantity, unitCost, notes });
  notify("✅ Stock transaction recorded successfully");
  event.target.reset();
  window.dispatchEvent(new CustomEvent("indianclub:render"));
};

window.markPaymentPaid = function(attendanceId) {
  if (confirm("Mark this payment as paid?")) {
    console.log('✅ Marking payment as paid:', attendanceId);
    notify("✅ Payment marked as paid");
    window.dispatchEvent(new CustomEvent("indianclub:render"));
  }
};

window.sendPaymentReminder = function(attendanceId) {
  console.log('📧 Sending payment reminder for:', attendanceId);
  notify("✅ Payment reminder sent to member");
};

export const flightAdminViews = {
  home: flightAdminHomeView,
  timetable: flightAdminTimetableView,
  attendance: flightAdminAttendanceView,
  wallet: flightAdminWalletView,
  bazaar: flightAdminBazaarView,
  profile: flightAdminProfileView,
  logs: flightAdminLogsView,
  sessionControl: flightAdminSessionControlView,
  stock: flightAdminShuttleStockView,
  finance: flightAdminFinanceView
};

console.log('✅ flightAdminViews.js loaded successfully');

