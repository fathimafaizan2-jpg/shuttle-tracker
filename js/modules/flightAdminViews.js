
// ============================================
// flightAdminViews.js - FLIGHT ADMIN DASHBOARD
// ============================================

export const flightAdminViews = {
  // ===== HOME PAGE =====
  home: function() {
    return `
      <div class="page-header">
        <h1>🎯 Flight Admin Dashboard</h1>
        <p>Manage your flight operations and members</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">👥</div>
          <div class="stat-content">
            <h3>24</h3>
            <p>Active Members</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">📅</div>
          <div class="stat-content">
            <h3>8</h3>
            <p>Sessions This Week</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">💰</div>
          <div class="stat-content">
            <h3>2,400 BHD</h3>
            <p>Revenue This Month</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">⚠️</div>
          <div class="stat-content">
            <h3>3</h3>
            <p>Pending Payments</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>📋 Quick Actions</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
          <button class="btn btn-primary" onclick="window.navigateTo('sessions')">Manage Sessions</button>
          <button class="btn btn-primary" onclick="window.navigateTo('stock')">Check Stock</button>
          <button class="btn btn-primary" onclick="window.navigateTo('reports')">View Reports</button>
          <button class="btn btn-primary" onclick="window.navigateTo('flight-finance')">Finance</button>
        </div>
      </div>

      <div class="card">
        <h2>👥 Recent Member Activity</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Activity</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Al-Mansouri</td>
              <td>Attended Session</td>
              <td>Sep 11, 2026</td>
              <td><span class="badge badge-success">Present</span></td>
            </tr>
            <tr>
              <td>Fatima Hassan</td>
              <td>Payment Received</td>
              <td>Sep 10, 2026</td>
              <td><span class="badge badge-success">Completed</span></td>
            </tr>
            <tr>
              <td>Mohammed Ali</td>
              <td>Missed Session</td>
              <td>Sep 09, 2026</td>
              <td><span class="badge badge-danger">Absent</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== SESSIONS PAGE =====
  sessions: function() {
    return `
      <div class="page-header">
        <h1>📅 Session Control</h1>
        <p>Manage flight sessions and attendance</p>
      </div>

      <div class="card">
        <h2>➕ Create New Session</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Date *</label>
            <input type="date">
          </div>
          <div class="form-group">
            <label>Start Time *</label>
            <input type="time">
          </div>
          <div class="form-group">
            <label>End Time *</label>
            <input type="time">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Venue *</label>
            <input type="text" placeholder="Court/Ground location">
          </div>
          <div class="form-group">
            <label>Coach *</label>
            <select>
              <option>Select coach</option>
              <option>Ahmed Al-Mansouri</option>
              <option>Mohammed Al-Khalifa</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary">Create Session</button>
      </div>

      <div class="card">
        <h2>📋 Upcoming Sessions</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Venue</th>
              <th>Coach</th>
              <th>Registered</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 14, 2026</td>
              <td>6:00 - 7:30 AM</td>
              <td>Court 1</td>
              <td>Ahmed Al-Mansouri</td>
              <td>22/24</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Manage</button></td>
            </tr>
            <tr>
              <td>Sep 16, 2026</td>
              <td>6:00 - 7:30 AM</td>
              <td>Court 1</td>
              <td>Ahmed Al-Mansouri</td>
              <td>20/24</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Manage</button></td>
            </tr>
            <tr>
              <td>Sep 18, 2026</td>
              <td>6:00 - 7:30 AM</td>
              <td>Court 1</td>
              <td>Ahmed Al-Mansouri</td>
              <td>18/24</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Manage</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>✓ Mark Attendance</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Status</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Al-Mansouri</td>
              <td><span class="badge badge-success">Present</span></td>
              <td>5:55 AM</td>
              <td>7:35 AM</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Fatima Hassan</td>
              <td><span class="badge badge-success">Present</span></td>
              <td>6:00 AM</td>
              <td>7:30 AM</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Mohammed Ali</td>
              <td><span class="badge badge-danger">Absent</span></td>
              <td>-</td>
              <td>-</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== STOCK PAGE =====
  stock: function() {
    return `
      <div class="page-header">
        <h1>📦 Shuttle Stock Management</h1>
        <p>Manage equipment and inventory</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">📦</div>
          <div class="stat-content">
            <h3>150</h3>
            <p>Total Shuttles</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">✓</div>
          <div class="stat-content">
            <h3>120</h3>
            <p>Good Condition</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⚠️</div>
          <div class="stat-content">
            <h3>20</h3>
            <p>Needs Repair</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">✕</div>
          <div class="stat-content">
            <h3>10</h3>
            <p>Damaged</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>➕ Add Stock</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Item Type *</label>
            <select>
              <option>Select item</option>
              <option>Shuttles</option>
              <option>Rackets</option>
              <option>Shoes</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Quantity *</label>
            <input type="number" placeholder="0" min="1">
          </div>
          <div class="form-group">
            <label>Cost (BHD) *</label>
            <input type="number" placeholder="0.00" min="0" step="0.1">
          </div>
        </div>
        <button class="btn btn-primary">Add to Stock</button>
      </div>

      <div class="card">
        <h2>📋 Current Inventory</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Total</th>
              <th>Good</th>
              <th>Repair</th>
              <th>Damaged</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Shuttles</td>
              <td>150</td>
              <td>120</td>
              <td>20</td>
              <td>10</td>
              <td>Sep 12, 2026</td>
            </tr>
            <tr>
              <td>Rackets</td>
              <td>30</td>
              <td>28</td>
              <td>2</td>
              <td>0</td>
              <td>Sep 10, 2026</td>
            </tr>
            <tr>
              <td>Shoes</td>
              <td>45</td>
              <td>40</td>
              <td>5</td>
              <td>0</td>
              <td>Sep 08, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== REPORTS PAGE =====
  reports: function() {
    return `
      <div class="page-header">
        <h1>📊 Flight Reports</h1>
        <p>Attendance and payment reports</p>
      </div>

      <div class="card">
        <h2>📈 Attendance Report</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Total Sessions</th>
              <th>Attended</th>
              <th>Missed</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Al-Mansouri</td>
              <td>14</td>
              <td>13</td>
              <td>1</td>
              <td><span class="badge badge-success">93%</span></td>
            </tr>
            <tr>
              <td>Fatima Hassan</td>
              <td>14</td>
              <td>12</td>
              <td>2</td>
              <td><span class="badge badge-success">86%</span></td>
            </tr>
            <tr>
              <td>Mohammed Ali</td>
              <td>14</td>
              <td>10</td>
              <td>4</td>
              <td><span class="badge badge-warning">71%</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>💳 Payment Status Report</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount Due</th>
              <th>Amount Paid</th>
              <th>Status</th>
              <th>Last Payment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Al-Mansouri</td>
              <td>100 BHD</td>
              <td>100 BHD</td>
              <td><span class="badge badge-success">Paid</span></td>
              <td>Sep 10, 2026</td>
            </tr>
            <tr>
              <td>Fatima Hassan</td>
              <td>100 BHD</td>
              <td>50 BHD</td>
              <td><span class="badge badge-warning">Partial</span></td>
              <td>Sep 05, 2026</td>
            </tr>
            <tr>
              <td>Mohammed Ali</td>
              <td>100 BHD</td>
              <td>0 BHD</td>
              <td><span class="badge badge-danger">Pending</span></td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== FLIGHT FINANCE PAGE =====
  'flight-finance': function() {
    return `
      <div class="page-header">
        <h1>💰 Flight Finance</h1>
        <p>Manage flight revenue and expenses</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">💵</div>
          <div class="stat-content">
            <h3>2,400 BHD</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">💸</div>
          <div class="stat-content">
            <h3>800 BHD</h3>
            <p>Total Expenses</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">📊</div>
          <div class="stat-content">
            <h3>1,600 BHD</h3>
            <p>Net Profit</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⏳</div>
          <div class="stat-content">
            <h3>300 BHD</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>📋 Revenue Breakdown</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Amount</th>
              <th>Percentage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Membership Fees</td>
              <td>2,000 BHD</td>
              <td>83%</td>
              <td><span class="badge badge-success">Collected</span></td>
            </tr>
            <tr>
              <td>Session Fees</td>
              <td>300 BHD</td>
              <td>13%</td>
              <td><span class="badge badge-success">Collected</span></td>
            </tr>
            <tr>
              <td>Other Income</td>
              <td>100 BHD</td>
              <td>4%</td>
              <td><span class="badge badge-success">Collected</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>💸 Expense Breakdown</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Percentage</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Equipment Maintenance</td>
              <td>400 BHD</td>
              <td>50%</td>
              <td>Sep 10, 2026</td>
            </tr>
            <tr>
              <td>Venue Rental</td>
              <td>300 BHD</td>
              <td>38%</td>
              <td>Sep 01, 2026</td>
            </tr>
            <tr>
              <td>Miscellaneous</td>
              <td>100 BHD</td>
              <td>12%</td>
              <td>Sep 05, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
};

console.log('✅ flightAdminViews.js loaded successfully');

