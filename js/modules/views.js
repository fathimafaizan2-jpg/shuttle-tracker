
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

// ===== PLAYER HOME PAGE =====
export async function playerHomeView() {
  const [member, sessions, wallet, attendance] = await Promise.all([
    api("/members/me"),
    api("/timetable/mine"),
    api("/wallet/me"),
    api("/attendance/mine")
  ]);

  const upcomingSessions = sessions.filter(s => new Date(s.startAt) > new Date()).slice(0, 3);
  const recentAttendance = attendance.slice(0, 5);
  const pendingAmount = wallet.pendingAmount || 0;

  return `
    <section class="card">
      <h2>Welcome, ${escapeHtml(member.fullName)}</h2>
      <p class="note">Member ID: ${escapeHtml(member.memberId)} | Flight: ${escapeHtml(member.flightName)}</p>
    </section>

    <div class="grid two">
      <section class="card">
        <h3>💰 Wallet Balance</h3>
        <div class="session"><b>${bhd(wallet.balanceFils || 0)}</b></div>
        <small>Available credit</small>
      </section>

      <section class="card">
        <h3>💳 Pending Amount</h3>
        <div class="session"><b>${bhd(pendingAmount)}</b></div>
        <small>Due for payment</small>
      </section>

      <section class="card">
        <h3>🎮 Sessions Attended</h3>
        <div class="session"><b>${attendance.length}</b></div>
        <small>Total games played</small>
      </section>

      <section class="card">
        <h3>📅 Upcoming Sessions</h3>
        <div class="session"><b>${upcomingSessions.length}</b></div>
        <small>Scheduled for you</small>
      </section>
    </div>

    <section class="card">
      <h3>📅 Upcoming Sessions</h3>
      ${upcomingSessions.length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Date</th><th>Flight</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              ${upcomingSessions.map(s => `
                <tr>
                  <td>${escapeHtml(dateLabel(s.startAt))}</td>
                  <td>${escapeHtml(s.flightName)}</td>
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
            <thead><tr><th>Date</th><th>Flight</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              ${recentAttendance.map(a => `
                <tr>
                  <td>${escapeHtml(dateLabel(a.sessionDate))}</td>
                  <td>${escapeHtml(a.flightName)}</td>
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
}

// ===== PLAYER TIMETABLE PAGE =====
export async function playerTimetableView() {
  const sessions = await api("/timetable/mine");
  const today = new Date();
  const upcomingSessions = sessions.filter(s => new Date(s.startAt) >= today);
  const pastSessions = sessions.filter(s => new Date(s.startAt) < today);

  return `
    <section class="card">
      <h2>📅 My Timetable</h2>
      <p class="note">Your scheduled sessions for ${escapeHtml(state.member.flightName)}</p>
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
}

// ===== PLAYER ATTENDANCE PAGE =====
export async function playerAttendanceView() {
  const attendance = await api("/attendance/mine");
  const presentCount = attendance.filter(a => a.status === "PRESENT").length;
  const absentCount = attendance.filter(a => a.status === "ABSENT").length;

  return `
    <section class="card">
      <h2>📊 My Attendance</h2>
      <p class="note">Complete attendance history for all sessions</p>
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
            <thead><tr><th>Date</th><th>Flight</th><th>Status</th><th>Charge</th><th>Payment</th></tr></thead>
            <tbody>
              ${attendance.map(a => `
                <tr>
                  <td>${escapeHtml(dateLabel(a.sessionDate))}</td>
                  <td>${escapeHtml(a.flightName)}</td>
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
}

// ===== PLAYER WALLET PAGE =====
export async function playerWalletView() {
  const [wallet, transactions] = await Promise.all([
    api("/wallet/me"),
    api("/wallet/transactions")
  ]);

  const credits = transactions.filter(t => t.type === "CREDIT");
  const charges = transactions.filter(t => t.type === "CHARGE");
  const payments = transactions.filter(t => t.type === "PAYMENT");

  return `
    <section class="card">
      <h2>💰 My Wallet</h2>
      <p class="note">Manage your credits, charges, and payments</p>
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
}

// ===== PLAYER BAZAAR PAGE =====
export async function playerBazaarView() {
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
        <article class="card">
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
}

// ===== PLAYER PROFILE PAGE =====
export async function playerProfileView() {
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
}

// ===== PLAYER LOGS PAGE =====
export async function playerLogsView() {
  const logs = await api("/members/audit/me");

  return `
    <section class="card">
      <h2>📜 My Activity Log</h2>
      <p class="note">Complete history of your actions and transactions</p>
    </section>

    <section class="card">
      <h3>📋 Recent Activities</h3>
      ${logs.length ? `
        <div class="table-wrap">
          <table class="schedule">
            <thead><tr><th>Date</th><th>Action</th><th>Category</th><th>Details</th></tr></thead>
            <tbody>
              ${logs.slice(0, 50).map(log => `
                <tr>
                  <td>${escapeHtml(dateTime(log.createdAt))}</td>
                  <td>${escapeHtml(log.action || "—")}</td>
                  <td><span class="tag amber">${escapeHtml(log.category || "ACTIVITY")}</span></td>
                  <td>${escapeHtml(log.detail || "—")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="note">No activity logs yet.</p>`}
    </section>
  `;
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
    const result = await api("/members/me/photo", { method: "POST", body: formData });
    notify("✅ Profile photo updated successfully");
    refresh();
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

export const views = {
  home: playerHomeView,
  timetable: playerTimetableView,
  attendance: playerAttendanceView,
  wallet: playerWalletView,
  bazaar: playerBazaarView,
  profile: playerProfileView,
  logs: playerLogsView
};

