
// ============================================
// adminViews.js - SUPER ADMIN DASHBOARD
// ============================================

export const adminViews = {
  // ===== HOME PAGE =====
  home: function() {
    return `
      <div class="page-header">
        <h1>🏆 Super Admin Dashboard</h1>
        <p>Complete club management and oversight</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">👥</div>
          <div class="stat-content">
            <h3>156</h3>
            <p>Total Members</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">📅</div>
          <div class="stat-content">
            <h3>32</h3>
            <p>Active Sessions</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">💰</div>
          <div class="stat-content">
            <h3>15,600 BHD</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">⚠️</div>
          <div class="stat-content">
            <h3>12</h3>
            <p>Pending Issues</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>📋 Quick Actions</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
          <button class="btn btn-primary" onclick="window.navigateTo('overview')">Club Overview</button>
          <button class="btn btn-primary" onclick="window.navigateTo('flights')">Manage Activities</button>
          <button class="btn btn-primary" onclick="window.navigateTo('master')">Master Timetable</button>
          <button class="btn btn-primary" onclick="window.navigateTo('admin-finance')">Finance</button>
          <button class="btn btn-primary" onclick="window.navigateTo('ads')">Ads & BaZaar</button>
          <button class="btn btn-primary" onclick="window.navigateTo('audit')">Audit Log</button>
        </div>
      </div>

      <div class="card">
        <h2>📊 Club Performance</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>This Month</th>
              <th>Last Month</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>New Members</td>
              <td>12</td>
              <td>8</td>
              <td><span class="badge badge-success">+50%</span></td>
            </tr>
            <tr>
              <td>Revenue</td>
              <td>15,600 BHD</td>
              <td>14,200 BHD</td>
              <td><span class="badge badge-success">+9.9%</span></td>
            </tr>
            <tr>
              <td>Attendance Rate</td>
              <td>82%</td>
              <td>78%</td>
              <td><span class="badge badge-success">+5.1%</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== OVERVIEW PAGE =====
  overview: function() {
    return `
      <div class="page-header">
        <h1>📊 Club Overview</h1>
        <p>Complete club statistics and analytics</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">👥</div>
          <div class="stat-content">
            <h3>156</h3>
            <p>Total Members</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">✓</div>
          <div class="stat-content">
            <h3>142</h3>
            <p>Active Members</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⏸</div>
          <div class="stat-content">
            <h3>14</h3>
            <p>Inactive Members</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">🚫</div>
          <div class="stat-content">
            <h3>0</h3>
            <p>Suspended</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>📈 Member Distribution by Activity</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Total Members</th>
              <th>Active</th>
              <th>Inactive</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Badminton</td>
              <td>68</td>
              <td>62</td>
              <td>6</td>
              <td>43.6%</td>
            </tr>
            <tr>
              <td>Cricket</td>
              <td>52</td>
              <td>48</td>
              <td>4</td>
              <td>33.3%</td>
            </tr>
            <tr>
              <td>Tennis</td>
              <td>36</td>
              <td>32</td>
              <td>4</td>
              <td>23.1%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>💰 Financial Summary</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Revenue</td>
              <td>15,600 BHD</td>
              <td>100%</td>
            </tr>
            <tr>
              <td>Total Expenses</td>
              <td>4,200 BHD</td>
              <td>26.9%</td>
            </tr>
            <tr>
              <td>Net Profit</td>
              <td>11,400 BHD</td>
              <td>73.1%</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== FLIGHTS/ACTIVITIES PAGE =====
  flights: function() {
    return `
      <div class="page-header">
        <h1>✈️ Activities & Flights Management</h1>
        <p>Create and manage club activities and flights</p>
      </div>

      <div class="card">
        <h2>➕ Create New Activity</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Activity Name *</label>
            <input type="text" placeholder="e.g., Badminton, Cricket">
          </div>
          <div class="form-group">
            <label>Status *</label>
            <select>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary">Create Activity</button>
      </div>

      <div class="card">
        <h2>📋 Activities List</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Flights</th>
              <th>Members</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Badminton</td>
              <td>3</td>
              <td>68</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Manage</button></td>
            </tr>
            <tr>
              <td>Cricket</td>
              <td>2</td>
              <td>52</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Manage</button></td>
            </tr>
            <tr>
              <td>Tennis</td>
              <td>2</td>
              <td>36</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Manage</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>➕ Create New Flight</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Activity *</label>
            <select>
              <option>Select activity</option>
              <option>Badminton</option>
              <option>Cricket</option>
              <option>Tennis</option>
            </select>
          </div>
          <div class="form-group">
            <label>Flight Name *</label>
            <input type="text" placeholder="e.g., Premier, Flight 1">
          </div>
        </div>
        <button class="btn btn-primary">Create Flight</button>
      </div>

      <div class="card">
        <h2>✈️ Flights List</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Flight</th>
              <th>Members</th>
              <th>Admin</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Badminton</td>
              <td>Premier</td>
              <td>24</td>
              <td>Ahmed Al-Mansouri</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Badminton</td>
              <td>Flight 1</td>
              <td>22</td>
              <td>Mohammed Al-Khalifa</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Cricket</td>
              <td>Premier</td>
              <td>26</td>
              <td>Fatima Hassan</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== MASTER TIMETABLE PAGE =====
  master: function() {
    return `
      <div class="page-header">
        <h1>📅 Master Timetable</h1>
        <p>Club-wide weekly schedule</p>
      </div>

      <div class="card">
        <h2>➕ Add Session to Master Timetable</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Day *</label>
            <select>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
              <option>Sunday</option>
            </select>
          </div>
          <div class="form-group">
            <label>Time *</label>
            <input type="time">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Activity *</label>
            <select>
              <option>Badminton</option>
              <option>Cricket</option>
              <option>Tennis</option>
            </select>
          </div>
          <div class="form-group">
            <label>Flight *</label>
            <select>
              <option>Premier</option>
              <option>Flight 1</option>
              <option>Flight 2</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary">Add to Timetable</button>
      </div>

      <div class="card">
        <h2>📋 Weekly Schedule</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Activity</th>
              <th>Flight</th>
              <th>Venue</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monday</td>
              <td>6:00 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td>Court 1</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Wednesday</td>
              <td>6:00 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td>Court 1</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Friday</td>
              <td>6:00 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td>Court 1</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Saturday</td>
              <td>7:00 AM</td>
              <td>Cricket</td>
              <td>Premier</td>
              <td>Ground A</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== EXECUTIVE FINANCE PAGE =====
  'admin-finance': function() {
    return `
      <div class="page-header">
        <h1>💰 Executive Finance</h1>
        <p>Club-wide financial management</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">💵</div>
          <div class="stat-content">
            <h3>15,600 BHD</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">💸</div>
          <div class="stat-content">
            <h3>4,200 BHD</h3>
            <p>Total Expenses</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">📊</div>
          <div class="stat-content">
            <h3>11,400 BHD</h3>
            <p>Net Profit</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⏳</div>
          <div class="stat-content">
            <h3>1,200 BHD</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>📈 Revenue by Activity</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Revenue</th>
              <th>Members</th>
              <th>Per Member</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Badminton</td>
              <td>6,800 BHD</td>
              <td>68</td>
              <td>100 BHD</td>
              <td>43.6%</td>
            </tr>
            <tr>
              <td>Cricket</td>
              <td>5,200 BHD</td>
              <td>52</td>
              <td>100 BHD</td>
              <td>33.3%</td>
            </tr>
            <tr>
              <td>Tennis</td>
              <td>3,600 BHD</td>
              <td>36</td>
              <td>100 BHD</td>
              <td>23.1%</td>
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
              <td>Equipment & Maintenance</td>
              <td>1,800 BHD</td>
              <td>42.9%</td>
              <td>Sep 10, 2026</td>
            </tr>
            <tr>
              <td>Venue Rental</td>
              <td>1,500 BHD</td>
              <td>35.7%</td>
              <td>Sep 01, 2026</td>
            </tr>
            <tr>
              <td>Staff Salaries</td>
              <td>700 BHD</td>
              <td>16.7%</td>
              <td>Sep 05, 2026</td>
            </tr>
            <tr>
              <td>Miscellaneous</td>
              <td>200 BHD</td>
              <td>4.8%</td>
              <td>Sep 08, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== ADS & BAZAAR PAGE =====
  ads: function() {
    return `
      <div class="page-header">
        <h1>📢 Ads & BaZaar Management</h1>
        <p>Manage club advertisements and marketplace</p>
      </div>

      <div class="card">
        <h2>➕ Post New Advertisement</h2>
        <div class="form-group">
          <label>Title *</label>
          <input type="text" placeholder="Advertisement title">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Category *</label>
            <select>
              <option>Select category</option>
              <option>Promotion</option>
              <option>Event</option>
              <option>Announcement</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status *</label>
            <select>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Description *</label>
          <textarea placeholder="Advertisement details..." rows="4"></textarea>
        </div>
        <button class="btn btn-primary">Post Advertisement</button>
      </div>

      <div class="card">
        <h2>📋 Active Advertisements</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Posted By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>New Badminton Tournament</td>
              <td>Event</td>
              <td>Admin</td>
              <td>Sep 12, 2026</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Equipment Sale</td>
              <td>Promotion</td>
              <td>Admin</td>
              <td>Sep 10, 2026</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Membership Drive</td>
              <td>Announcement</td>
              <td>Admin</td>
              <td>Sep 08, 2026</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>🛍️ BaZaar Items</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Badminton Racket</td>
              <td>Ali Ahmed</td>
              <td>25 BHD</td>
              <td>Sports Equipment</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Manage</button></td>
            </tr>
            <tr>
              <td>Tennis Shoes</td>
              <td>Fatima Hassan</td>
              <td>35 BHD</td>
              <td>Clothing</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Manage</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== AUDIT LOG PAGE =====
  audit: function() {
    return `
      <div class="page-header">
        <h1>🔍 Audit Log</h1>
        <p>Track all system activities and changes</p>
      </div>

      <div class="card">
        <h2>🔎 Filter Logs</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Category</label>
            <select>
              <option>All</option>
              <option>Login</option>
              <option>Member Management</option>
              <option>Finance</option>
              <option>Settings</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date Range</label>
            <input type="date">
          </div>
          <div class="form-group">
            <label>User</label>
            <input type="text" placeholder="Search user...">
          </div>
        </div>
        <button class="btn btn-primary">Filter</button>
      </div>

      <div class="card">
        <h2>📋 Audit Trail</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>User</th>
              <th>Category</th>
              <th>Action</th>
              <th>Details</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 13, 2026 - 5:20 PM</td>
              <td>Fathima Al-Dosari</td>
              <td>Login</td>
              <td>User Login</td>
              <td>Logged in to admin panel</td>
              <td><span class="badge badge-success">Success</span></td>
            </tr>
            <tr>
              <td>Sep 13, 2026 - 3:45 PM</td>
              <td>Mohammed Al-Khalifa</td>
              <td>Member Management</td>
              <td>Member Added</td>
              <td>New member registered</td>
              <td><span class="badge badge-success">Success</span></td>
            </tr>
            <tr>
              <td>Sep 12, 2026 - 10:30 AM</td>
              <td>Fathima Al-Dosari</td>
              <td>Finance</td>
              <td>Payment Processed</td>
              <td>Monthly fees collected</td>
              <td><span class="badge badge-success">Success</span></td>
            </tr>
            <tr>
              <td>Sep 11, 2026 - 2:15 PM</td>
              <td>Ahmed Al-Mansouri</td>
              <td>Settings</td>
              <td>Settings Updated</td>
              <td>Club settings modified</td>
              <td><span class="badge badge-success">Success</span></td>
            </tr>
            <tr>
              <td>Sep 10, 2026 - 9:00 AM</td>
              <td>Fathima Al-Dosari</td>
              <td>Member Management</td>
              <td>Member Suspended</td>
              <td>Member account suspended</td>
              <td><span class="badge badge-warning">Warning</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
};

console.log('✅ adminViews.js loaded successfully');

