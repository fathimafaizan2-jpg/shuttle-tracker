
// ============================================
// views.js - PLAYER DASHBOARD & PAGES
// ============================================

export const views = {
  // ===== HOME PAGE =====
  home: function() {
    const member = window.appState?.member;
    if (!member) return '<p>Loading...</p>';

    return `
      <div class="page-header">
        <h1>👋 Welcome, ${member.fullName}!</h1>
        <p>Your personal dashboard for Indian Club Bahrain</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">📅</div>
          <div class="stat-content">
            <h3>5</h3>
            <p>Upcoming Sessions</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">✓</div>
          <div class="stat-content">
            <h3>12</h3>
            <p>Sessions Attended</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">💰</div>
          <div class="stat-content">
            <h3>50 BHD</h3>
            <p>Wallet Balance</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">📊</div>
          <div class="stat-content">
            <h3>85%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>📋 Upcoming Sessions</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Activity</th>
              <th>Flight</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 14, 2026</td>
              <td>6:00 AM - 7:30 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td><span class="badge badge-success">Scheduled</span></td>
            </tr>
            <tr>
              <td>Sep 16, 2026</td>
              <td>6:00 AM - 7:30 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td><span class="badge badge-success">Scheduled</span></td>
            </tr>
            <tr>
              <td>Sep 18, 2026</td>
              <td>6:00 AM - 7:30 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td><span class="badge badge-info">Pending</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>💳 Recent Transactions</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 10, 2026</td>
              <td>Monthly Membership Fee</td>
              <td>-100 BHD</td>
              <td><span class="badge badge-success">Paid</span></td>
            </tr>
            <tr>
              <td>Sep 05, 2026</td>
              <td>Wallet Top-up</td>
              <td>+50 BHD</td>
              <td><span class="badge badge-success">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== TIMETABLE PAGE =====
  timetable: function() {
    return `
      <div class="page-header">
        <h1>📅 My Timetable</h1>
        <p>Your weekly schedule for all activities</p>
      </div>

      <div class="card">
        <h2>Weekly Schedule</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Activity</th>
              <th>Flight</th>
              <th>Venue</th>
              <th>Coach</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monday</td>
              <td>6:00 - 7:30 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td>Court 1</td>
              <td>Ahmed Al-Mansouri</td>
            </tr>
            <tr>
              <td>Wednesday</td>
              <td>6:00 - 7:30 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td>Court 1</td>
              <td>Ahmed Al-Mansouri</td>
            </tr>
            <tr>
              <td>Friday</td>
              <td>6:00 - 7:30 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td>Court 1</td>
              <td>Ahmed Al-Mansouri</td>
            </tr>
            <tr>
              <td>Saturday</td>
              <td>7:00 - 8:30 AM</td>
              <td>Cricket</td>
              <td>Flight 1</td>
              <td>Ground A</td>
              <td>Mohammed Al-Khalifa</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>📝 Notes</h2>
        <p>• Sessions are held at the club premises</p>
        <p>• Please arrive 10 minutes early</p>
        <p>• Bring your own equipment</p>
        <p>• Contact your flight admin for any changes</p>
      </div>
    `;
  },

  // ===== ATTENDANCE PAGE =====
  attendance: function() {
    return `
      <div class="page-header">
        <h1>✓ Attendance Record</h1>
        <p>Your attendance history and statistics</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">✓</div>
          <div class="stat-content">
            <h3>12</h3>
            <p>Sessions Attended</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">✕</div>
          <div class="stat-content">
            <h3>2</h3>
            <p>Sessions Missed</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⏱</div>
          <div class="stat-content">
            <h3>1</h3>
            <p>Late Arrivals</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">📊</div>
          <div class="stat-content">
            <h3>85%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Attendance History</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>Flight</th>
              <th>Status</th>
              <th>Time In</th>
              <th>Time Out</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 11, 2026</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td><span class="badge badge-success">Present</span></td>
              <td>5:55 AM</td>
              <td>7:35 AM</td>
            </tr>
            <tr>
              <td>Sep 09, 2026</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td><span class="badge badge-success">Present</span></td>
              <td>6:05 AM</td>
              <td>7:30 AM</td>
            </tr>
            <tr>
              <td>Sep 07, 2026</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td><span class="badge badge-danger">Absent</span></td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Sep 05, 2026</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td><span class="badge badge-success">Present</span></td>
              <td>5:58 AM</td>
              <td>7:32 AM</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== WALLET PAGE =====
  wallet: function() {
    return `
      <div class="page-header">
        <h1>💰 Wallet & Payments</h1>
        <p>Manage your account balance and payments</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">💳</div>
          <div class="stat-content">
            <h3>50 BHD</h3>
            <p>Current Balance</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">📊</div>
          <div class="stat-content">
            <h3>100 BHD</h3>
            <p>Total Paid</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⏳</div>
          <div class="stat-content">
            <h3>0 BHD</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>💳 Top-up Wallet</h2>
        <div class="form-group">
          <label>Amount (BHD) *</label>
          <input type="number" placeholder="Enter amount" min="1" step="0.1">
        </div>
        <div class="form-group">
          <label>Payment Method *</label>
          <select>
            <option>Select payment method</option>
            <option>Credit Card</option>
            <option>Debit Card</option>
            <option>Bank Transfer</option>
          </select>
        </div>
        <button class="btn btn-primary">Top-up Now</button>
      </div>

      <div class="card">
        <h2>📋 Transaction History</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 10, 2026</td>
              <td>Monthly Membership</td>
              <td>Debit</td>
              <td>-100 BHD</td>
              <td>50 BHD</td>
              <td><span class="badge badge-success">Paid</span></td>
            </tr>
            <tr>
              <td>Sep 05, 2026</td>
              <td>Wallet Top-up</td>
              <td>Credit</td>
              <td>+150 BHD</td>
              <td>150 BHD</td>
              <td><span class="badge badge-success">Completed</span></td>
            </tr>
            <tr>
              <td>Aug 28, 2026</td>
              <td>Monthly Membership</td>
              <td>Debit</td>
              <td>-100 BHD</td>
              <td>0 BHD</td>
              <td><span class="badge badge-success">Paid</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== PROFILE PAGE =====
  profile: function() {
    const member = window.appState?.member;
    return `
      <div class="page-header">
        <h1>👤 My Profile</h1>
        <p>View and manage your personal information</p>
      </div>

      <div class="card">
        <h2>Personal Information</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" value="${member?.fullName || ''}" disabled>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" value="${member?.email || ''}" disabled>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" value="${member?.phone || ''}" disabled>
          </div>
          <div class="form-group">
            <label>Member Since</label>
            <input type="text" value="January 15, 2024" disabled>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Activity Information</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Primary Activity</label>
            <input type="text" value="Badminton" disabled>
          </div>
          <div class="form-group">
            <label>Flight</label>
            <input type="text" value="Premier" disabled>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Status</label>
            <input type="text" value="Active" disabled>
          </div>
          <div class="form-group">
            <label>Role</label>
            <input type="text" value="Player" disabled>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>🔐 Change Password</h2>
        <div class="form-group">
          <label>Current Password *</label>
          <input type="password" placeholder="Enter current password">
        </div>
        <div class="form-group">
          <label>New Password *</label>
          <input type="password" placeholder="Enter new password" minlength="6">
        </div>
        <div class="form-group">
          <label>Confirm Password *</label>
          <input type="password" placeholder="Confirm new password" minlength="6">
        </div>
        <button class="btn btn-primary">Update Password</button>
      </div>
    `;
  },

  // ===== BAZAAR PAGE =====
  bazaar: function() {
    return `
      <div class="page-header">
        <h1>🛍️ BaZaar</h1>
        <p>Buy and sell items within the club community</p>
      </div>

      <div class="card">
        <h2>📢 Post New Item</h2>
        <div class="form-group">
          <label>Item Title *</label>
          <input type="text" placeholder="What are you selling?">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Category *</label>
            <select>
              <option>Select category</option>
              <option>Sports Equipment</option>
              <option>Clothing</option>
              <option>Electronics</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Price (BHD) *</label>
            <input type="number" placeholder="0.00" min="0" step="0.1">
          </div>
        </div>
        <div class="form-group">
          <label>Description *</label>
          <textarea placeholder="Describe your item..." rows="4"></textarea>
        </div>
        <button class="btn btn-primary">Post Item</button>
      </div>

      <div class="card">
        <h2>🏪 Available Items</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Posted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Badminton Racket</td>
              <td>Sports Equipment</td>
              <td>Ali Ahmed</td>
              <td>25 BHD</td>
              <td>Sep 10, 2026</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Contact</button></td>
            </tr>
            <tr>
              <td>Tennis Shoes</td>
              <td>Clothing</td>
              <td>Fatima Hassan</td>
              <td>35 BHD</td>
              <td>Sep 08, 2026</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Contact</button></td>
            </tr>
            <tr>
              <td>Cricket Bat</td>
              <td>Sports Equipment</td>
              <td>Mohammed Ali</td>
              <td>50 BHD</td>
              <td>Sep 05, 2026</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Contact</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== LOGS PAGE =====
  logs: function() {
    return `
      <div class="page-header">
        <h1>📜 Activity Logs</h1>
        <p>Your personal activity history</p>
      </div>

      <div class="card">
        <h2>Recent Activities</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Activity</th>
              <th>Details</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 13, 2026 - 5:20 PM</td>
              <td>Login</td>
              <td>Logged in to member portal</td>
              <td><span class="badge badge-success">Success</span></td>
            </tr>
            <tr>
              <td>Sep 11, 2026 - 6:00 AM</td>
              <td>Attendance</td>
              <td>Marked present in Badminton session</td>
              <td><span class="badge badge-success">Completed</span></td>
            </tr>
            <tr>
              <td>Sep 10, 2026 - 2:30 PM</td>
              <td>Payment</td>
              <td>Monthly membership fee paid</td>
              <td><span class="badge badge-success">Completed</span></td>
            </tr>
            <tr>
              <td>Sep 05, 2026 - 10:15 AM</td>
              <td>Wallet Top-up</td>
              <td>Added 150 BHD to wallet</td>
              <td><span class="badge badge-success">Completed</span></td>
            </tr>
            <tr>
              <td>Sep 01, 2026 - 8:45 AM</td>
              <td>Profile Update</td>
              <td>Updated phone number</td>
              <td><span class="badge badge-success">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
};

console.log('✅ views.js loaded successfully');

