
// views.js - Premium Player Dashboard

const views = {
  home: () => {
    return `
      <div class="player-home">
        <div class="page-header">
          <h1>Welcome Back!</h1>
          <p>Your club dashboard and upcoming activities</p>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Next Game</h3>
            <p class="stat-text" id="nextGame">Loading...</p>
          </div>
          <div class="stat-card">
            <h3>Wallet Balance</h3>
            <p class="stat-number" id="walletBalance">0.000 BHD</p>
          </div>
          <div class="stat-card">
            <h3>Attendance Rate</h3>
            <p class="stat-number" id="attendanceRate">0%</p>
          </div>
          <div class="stat-card">
            <h3>Upcoming Events</h3>
            <p class="stat-number" id="upcomingEvents">0</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <h2>Quick Actions</h2>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="views.goToPage('timetable')">
              <i class="fas fa-calendar"></i> View Timetable
            </button>
            <button class="btn btn-primary" onclick="views.goToPage('attendance')">
              <i class="fas fa-check-circle"></i> My Attendance
            </button>
            <button class="btn btn-primary" onclick="views.goToPage('wallet')">
              <i class="fas fa-wallet"></i> Wallet
            </button>
            <button class="btn btn-primary" onclick="views.goToPage('bazaar')">
              <i class="fas fa-store"></i> BaZaar
            </button>
          </div>
        </div>
      </div>
    `;
  },

  timetable: () => {
    return `
      <div class="timetable-page">
        <div class="page-header">
          <h1>Timetable</h1>
          <p>Upcoming activities and sessions</p>
        </div>

        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Level</th>
                <th>Time</th>
                <th>Venue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="timetableTable">
              <tr><td colspan="6" class="text-center" style="padding: 40px;">No sessions found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  attendance: () => {
    return `
      <div class="attendance-page">
        <div class="page-header">
          <h1>Attendance Log</h1>
          <p>Your attendance history</p>
        </div>

        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody id="attendanceTable">
              <tr><td colspan="4" class="text-center" style="padding: 40px;">No attendance records found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  logs: () => {
    return `
      <div class="logs-page">
        <div class="page-header">
          <h1>Activity Logs</h1>
          <p>Your recent activities</p>
        </div>

        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody id="logsTable">
              <tr><td colspan="3" class="text-center" style="padding: 40px;">No logs found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  wallet: () => {
    return `
      <div class="wallet-page">
        <div class="page-header">
          <h1>Wallet & Payments</h1>
          <p>Manage your account balance and payments</p>
        </div>

        <div class="card">
          <h2>Current Balance</h2>
          <p style="font-size: 36px; font-weight: 700; color: #e94560; margin: 20px 0;">0.000 BHD</p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="views.topUpWallet()">
              <i class="fas fa-plus"></i> Top Up Credit
            </button>
            <button class="btn btn-secondary" onclick="views.payByCash()">
              <i class="fas fa-money-bill"></i> Pay by Cash
            </button>
            <button class="btn btn-secondary" onclick="views.payByWhatsApp()">
              <i class="fab fa-whatsapp"></i> Pay by WhatsApp
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="transactionsTable">
              <tr><td colspan="5" class="text-center" style="padding: 40px;">No transactions found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  bazaar: () => {
    return `
      <div class="bazaar-page">
        <div class="page-header">
          <h1>BaZaar - Community Directory</h1>
          <p>Discover local businesses and services</p>
        </div>

        <div id="bazaarContent" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
          <p class="text-center" style="grid-column: 1/-1; color: #a0a8b8;">No businesses found</p>
        </div>
      </div>
    `;
  },

  profile: () => {
    return `
      <div class="profile-page">
        <div class="page-header">
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>

        <div class="card">
          <h2>Account Details</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="profileName" readonly>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="profileEmail" readonly>
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" id="profilePhone" readonly>
            </div>
            <div class="form-group">
              <label>Member Level</label>
              <input type="text" id="profileLevel" readonly>
            </div>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="btn btn-primary" onclick="views.editProfile()">
              <i class="fas fa-edit"></i> Edit Profile
            </button>
            <button class="btn btn-secondary" onclick="views.changePassword()">
              <i class="fas fa-lock"></i> Change Password
            </button>
          </div>
        </div>
      </div>
    `;
  },

  goToPage: (page) => {
    appController.navigate(page);
  },

  topUpWallet: () => {
    appController.showNotification('Top Up feature coming soon', 'info');
  },

  payByCash: () => {
    appController.showNotification('Pay by Cash feature coming soon', 'info');
  },

  payByWhatsApp: () => {
    appController.showNotification('Pay by WhatsApp feature coming soon', 'info');
  },

  editProfile: () => {
    appController.showNotification('Edit Profile feature coming soon', 'info');
  },

  changePassword: () => {
    appController.showNotification('Change Password feature coming soon', 'info');
  }
};

