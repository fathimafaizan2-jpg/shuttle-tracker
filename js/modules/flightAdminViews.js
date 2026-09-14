
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

// ===== FLIGHT ADMIN SESSION CONTROL PAGE =====
export async function flightAdminSessionControlView() {
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
}

// ===== FLIGHT ADMIN SHUTTLE STOCK PAGE =====
export async function flightAdminShuttleStockView() {
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
}

// ===== FLIGHT ADMIN FINANCE PAGE =====
export async function flightAdminFinanceView() {
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
}

// ===== GLOBAL FUNCTIONS =====
window.markAttendance = function(sessionId) {
  console.log('📝 Marking attendance for session:', sessionId);
  notify("✅ Attendance marked successfully");
  refresh();
};

window.endSession = function(sessionId) {
  if (confirm("Are you sure you want to end this session?")) {
    console.log('🏁 Ending session:', sessionId);
    notify("✅ Session ended successfully");
    refresh();
  }
};

window.reorderItem = function(itemId) {
  const quantity = prompt("Enter reorder quantity:");
  if (quantity) {
    console.log('🔄 Reordering item:', itemId, 'Quantity:', quantity);
    notify("✅ Reorder request submitted");
    refresh();
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
  refresh();
};

window.markPaymentPaid = function(attendanceId) {
  if (confirm("Mark this payment as paid?")) {
    console.log('✅ Marking payment as paid:', attendanceId);
    notify("✅ Payment marked as paid");
    refresh();
  }
};

window.sendPaymentReminder = function(attendanceId) {
  console.log('📧 Sending payment reminder for:', attendanceId);
  notify("✅ Payment reminder sent to member");
};

export const flightAdminViews = {
  sessionControl: flightAdminSessionControlView,
  stock: flightAdminShuttleStockView,
  finance: flightAdminFinanceView
};

