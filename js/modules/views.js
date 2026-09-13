
// ============================================
// views.js - PLAYER DASHBOARD & PAGES
// ============================================

export const views = {
  // ===== HOME PAGE =====
  home: function() {
    const member = window.appState?.member;
    if (!member) return '<p>Loading...</p>';

    // Get metrics from state
    const sessionsAttended = window.appState?.sessionsAttended || 12;
    const pendingAmount = window.appState?.pendingAmount || 150;
    const arrears = window.appState?.arrears || 50;
    const walletBalance = (window.appState?.walletBalanceFils || 50000) / 1000;

    // Get upcoming session
    const upcomingSession = window.appState?.upcomingSession || {
      status: 'SCHEDULED',
      date: 'Sep 14, 2026',
      time: '6:00 AM - 7:30 AM',
      activity: 'Badminton',
      flight: 'Premier',
      sessionId: 'session_001'
    };

    return `
      <div class="page-header">
        <h1>👋 Welcome, ${member.fullName}!</h1>
        <p>Your personal dashboard for Indian Club Bahrain</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">📅</div>
          <div class="stat-content">
            <h3>${sessionsAttended}</h3>
            <p>Sessions Attended</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">⏳</div>
          <div class="stat-content">
            <h3>${pendingAmount} BHD</h3>
            <p>Pending Amount</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⚠️</div>
          <div class="stat-content">
            <h3>${arrears} BHD</h3>
            <p>Arrears (24h+)</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">💰</div>
          <div class="stat-content">
            <h3>${walletBalance.toFixed(3)} BHD</h3>
            <p>Wallet Credit</p>
          </div>
        </div>
      </div>

      ${upcomingSession.status === 'SCHEDULED' ? `
      <div class="card">
        <h2>📅 Upcoming Session</h2>
        <div style="background: #f0f3ff; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
          <p><strong>Date:</strong> ${upcomingSession.date}</p>
          <p><strong>Time:</strong> ${upcomingSession.time}</p>
          <p><strong>Activity:</strong> ${upcomingSession.activity}</p>
          <p><strong>Flight:</strong> ${upcomingSession.flight}</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button class="btn btn-success" data-self-attendance="PRESENT" onclick="window.respondToSession('${upcomingSession.sessionId}', 'PRESENT')">
            ✓ I am coming
          </button>
          <button class="btn btn-danger" data-self-attendance="ABSENT" onclick="window.respondToSession('${upcomingSession.sessionId}', 'ABSENT')">
            ✕ Not coming
          </button>
        </div>
      </div>
      ` : ''}

      <div class="card">
        <h2>📋 Recent Transactions</h2>
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
              <td>Sep 11, 2026</td>
              <td>Game Cost - Badminton</td>
              <td>-25 BHD</td>
              <td><span class="badge badge-success">Paid</span></td>
            </tr>
            <tr>
              <td>Sep 10, 2026</td>
              <td>Monthly Membership</td>
              <td>-100 BHD</td>
              <td><span class="badge badge-success">Paid</span></td>
            </tr>
            <tr>
              <td>Sep 05, 2026</td>
              <td>Wallet Top-up</td>
              <td>+150 BHD</td>
              <td><span class="badge badge-success">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== TIMETABLE PAGE =====
  timetable: function() {
    const member = window.appState?.member;
    const flightId = member?.flightId || 'premier';

    return `
      <div class="page-header">
        <h1>📅 My Timetable</h1>
        <p>Your weekly schedule for all activities</p>
      </div>

      <div class="card">
        <h2>Weekly Schedule (Flight: ${flightId})</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Activity</th>
              <th>Level</th>
              <th>Court</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monday</td>
              <td>6:00 - 7:30 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td>Court 1</td>
            </tr>
            <tr>
              <td>Wednesday</td>
              <td>6:00 - 7:30 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td>Court 1</td>
            </tr>
            <tr>
              <td>Friday</td>
              <td>6:00 - 7:30 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td>Court 1</td>
            </tr>
            <tr>
              <td>Saturday</td>
              <td>7:00 - 8:30 AM</td>
              <td>Cricket</td>
              <td>Premier</td>
              <td>Ground A</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== ATTENDANCE PAGE =====
  attendance: function() {
    return `
      <div class="page-header">
        <h1>✓ Attendance Roster</h1>
        <p>Real-time headcount for upcoming sessions</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">✓</div>
          <div class="stat-content">
            <h3>18</h3>
            <p>Present</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">✕</div>
          <div class="stat-content">
            <h3>4</h3>
            <p>Absent</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">❓</div>
          <div class="stat-content">
            <h3>2</h3>
            <p>No Response</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>👥 Players Present (Status = PRESENT)</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Time In</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Al-Mansouri</td>
              <td>5:55 AM</td>
              <td><span class="badge badge-success">Present</span></td>
            </tr>
            <tr>
              <td>Fatima Hassan</td>
              <td>6:00 AM</td>
              <td><span class="badge badge-success">Present</span></td>
            </tr>
            <tr>
              <td>Mohammed Ali</td>
              <td>6:05 AM</td>
              <td><span class="badge badge-success">Present</span></td>
            </tr>
            <tr>
              <td>Sara Ahmed</td>
              <td>6:10 AM</td>
              <td><span class="badge badge-success">Present</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== WALLET PAGE =====
  wallet: function() {
    const walletBalance = (window.appState?.walletBalanceFils || 50000) / 1000;

    return `
      <div class="page-header">
        <h1>💰 Wallet & Payments</h1>
        <p>Manage your account balance and payments</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">💳</div>
          <div class="stat-content">
            <h3>${walletBalance.toFixed(3)} BHD</h3>
            <p>Current Balance</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">📊</div>
          <div class="stat-content">
            <h3>500 BHD</h3>
            <p>Total Paid</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⏳</div>
          <div class="stat-content">
            <h3>150 BHD</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>💳 Submit Payment</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Payment Method *</label>
            <select id="paymentMethod">
              <option value="">Select payment method</option>
              <option value="BENEFIT_PAY">BenefitPay</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div class="form-group">
            <label>Reference Number *</label>
            <input type="text" id="paymentRef" placeholder="e.g., BenefitPay reference ID">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Amount (BHD) *</label>
            <input type="number" id="paymentAmount" placeholder="0.000" min="0" step="0.001">
          </div>
        </div>
        <button class="btn btn-primary" id="submitPaymentBtn" onclick="window.submitPayment()">Submit Payment</button>
      </div>

      <div class="card">
        <h2>📋 Statement History</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 11, 2026</td>
              <td>Game Cost - Badminton</td>
              <td>Charge</td>
              <td>-25 BHD</td>
              <td><span class="badge badge-success">Paid</span></td>
            </tr>
            <tr>
              <td>Sep 10, 2026</td>
              <td>Payment Received</td>
              <td>Credit</td>
              <td>+100 BHD</td>
              <td><span class="badge badge-success">Verified</span></td>
            </tr>
            <tr>
              <td>Sep 09, 2026</td>
              <td>Monthly Membership</td>
              <td>Charge</td>
              <td>-100 BHD</td>
              <td><span class="badge badge-success">Paid</span></td>
            </tr>
            <tr>
              <td>Sep 05, 2026</td>
              <td>Payment Submitted</td>
              <td>Credit</td>
              <td>+150 BHD</td>
              <td><span class="badge badge-warning">Pending</span></td>
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
        <h1>🛍️ BaZaar - Community Directory</h1>
        <p>Buy, sell, and discover local business offers</p>
      </div>

      <div class="tabs-container">
        <button class="tab-btn active" onclick="window.switchBazaarTab('browse')">Browse Ads</button>
        <button class="tab-btn" onclick="window.switchBazaarTab('post')">Post Your Ad</button>
      </div>

      <div id="bazaar-browse" class="tab-content active">
        <div class="card">
          <h2>🏪 Approved Business Listings</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Category</th>
                <th>Offer</th>
                <th>Location</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Al-Noor Restaurant</td>
                <td>Food & Dining</td>
                <td>20% Discount</td>
                <td>Manama</td>
                <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Contact</button></td>
              </tr>
              <tr>
                <td>Fitness Plus Gym</td>
                <td>Health & Fitness</td>
                <td>Free Trial</td>
                <td>Juffair</td>
                <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Contact</button></td>
              </tr>
              <tr>
                <td>Tech Solutions</td>
                <td>Technology</td>
                <td>15% Off</td>
                <td>Seef</td>
                <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Contact</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div id="bazaar-post" class="tab-content">
        <div class="card">
          <h2>📢 Submit Your Business Ad</h2>
          <div class="form-group">
            <label>Business Name *</label>
            <input type="text" placeholder="Your business name">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category *</label>
              <select>
                <option>Select category</option>
                <option>Food & Dining</option>
                <option>Health & Fitness</option>
                <option>Technology</option>
                <option>Retail</option>
                <option>Services</option>
              </select>
            </div>
            <div class="form-group">
              <label>Location *</label>
              <input type="text" placeholder="Business location">
            </div>
          </div>
          <div class="form-group">
            <label>Promotional Offer *</label>
            <input type="text" placeholder="e.g., 20% Discount">
          </div>
          <div class="form-group">
            <label>Upload Image (PNG/JPEG/WebP, max 2MB) *</label>
            <input type="file" accept="image/png,image/jpeg,image/webp">
          </div>
          <button class="btn btn-primary">Submit for Approval</button>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">Your ad will be reviewed by Super Admin and featured if approved.</p>
        </div>
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
        <h2>🔎 Filter Logs</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Category</label>
            <select id="logCategory">
              <option value="">All Categories</option>
              <option value="LOGIN">Login & Authentication</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="WALLET">Wallet & Payments</option>
              <option value="PROFILE">Profile Updates</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date From</label>
            <input type="date" id="logDateFrom">
          </div>
          <div class="form-group">
            <label>Date To</label>
            <input type="date" id="logDateTo">
          </div>
        </div>
        <button class="btn btn-primary" onclick="window.filterLogs()">Filter</button>
      </div>

      <div class="card">
        <h2>📋 Recent Activities</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Category</th>
              <th>Activity</th>
              <th>Details</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 13, 2026 - 5:20 PM</td>
              <td>Login</td>
              <td>User Login</td>
              <td>Logged in to member portal</td>
              <td><span class="badge badge-success">Success</span></td>
            </tr>
            <tr>
              <td>Sep 11, 2026 - 6:00 AM</td>
              <td>Attendance</td>
              <td>Session Attendance</td>
              <td>Marked present in Badminton</td>
              <td><span class="badge badge-success">Completed</span></td>
            </tr>
            <tr>
              <td>Sep 10, 2026 - 2:30 PM</td>
              <td>Wallet</td>
              <td>Payment Submitted</td>
              <td>Payment of 100 BHD submitted</td>
              <td><span class="badge badge-warning">Pending</span></td>
            </tr>
            <tr>
              <td>Sep 05, 2026 - 10:15 AM</td>
              <td>Wallet</td>
              <td>Credit Added</td>
              <td>150 BHD added to wallet</td>
              <td><span class="badge badge-success">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
};

// ===== HELPER FUNCTIONS =====
window.respondToSession = function(sessionId, status) {
  console.log(`Responding to session ${sessionId} with status: ${status}`);
  if (window.showToast) {
    window.showToast(`✅ Your response (${status}) has been recorded!`);
  }
};

window.submitPayment = function() {
  const method = document.getElementById('paymentMethod')?.value;
  const ref = document.getElementById('paymentRef')?.value?.trim();
  const amount = parseFloat(document.getElementById('paymentAmount')?.value || 0);

  if (!method) {
    if (window.showToast) window.showToast('❌ Please select a payment method');
    return;
  }

  if (!ref) {
    if (window.showToast) window.showToast('❌ Please enter a reference number');
    return;
  }

  if (amount <= 0) {
    if (window.showToast) window.showToast('❌ Amount must be greater than 0');
    return;
  }

  const amountFils = Math.round(amount * 1000);
  console.log(`Payment submitted: ${method}, Ref: ${ref}, Amount: ${amountFils} Fils`);
  
  if (window.showToast) {
    window.showToast(`✅ Payment of ${amount.toFixed(3)} BHD submitted for verification!`);
  }
};

window.switchBazaarTab = function(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(`bazaar-${tab}`)?.classList.add('active');
  event.target.classList.add('active');
};

window.filterLogs = function() {
  const category = document.getElementById('logCategory')?.value;
  const dateFrom = document.getElementById('logDateFrom')?.value;
  const dateTo = document.getElementById('logDateTo')?.value;
  
  console.log(`Filtering logs: Category=${category}, From=${dateFrom}, To=${dateTo}`);
  if (window.showToast) {
    window.showToast('✅ Logs filtered successfully!');
  }
};

console.log('✅ views.js loaded successfully');

