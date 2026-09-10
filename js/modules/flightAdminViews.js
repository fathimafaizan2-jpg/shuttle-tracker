
// flightAdminViews.js - Premium Level Admin Dashboard

const flightAdminViews = {
  dashboard: () => {
    return `
      <div class="level-admin-dashboard">
        <div class="page-header">
          <h1>Level Admin Dashboard</h1>
          <p>Manage attendance, sessions, and shuttle stock</p>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Next Session</h3>
            <p class="stat-text" id="nextSession">Loading...</p>
          </div>
          <div class="stat-card">
            <h3>Players Coming</h3>
            <p class="stat-number" id="playersComing">0</p>
          </div>
          <div class="stat-card">
            <h3>Shuttle Stock</h3>
            <p class="stat-number" id="shuttleStock">0</p>
          </div>
          <div class="stat-card">
            <h3>Unpaid Amount</h3>
            <p class="stat-number" id="unpaidAmount">0.000 BHD</p>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="nav-buttons">
          <button class="nav-btn active" onclick="flightAdminViews.showSection('attendance')">
            <i class="fas fa-check-circle"></i> Attendance
          </button>
          <button class="nav-btn" onclick="flightAdminViews.showSection('sessionControl')">
            <i class="fas fa-sliders-h"></i> Session Control
          </button>
          <button class="nav-btn" onclick="flightAdminViews.showSection('shuttle')">
            <i class="fas fa-badminton"></i> Shuttle Stock
          </button>
          <button class="nav-btn" onclick="flightAdminViews.showSection('reports')">
            <i class="fas fa-chart-bar"></i> Reports
          </button>
        </div>

        <!-- Content Sections -->
        <div id="levelAdminContent"></div>
      </div>
    `;
  },

  showSection: (section) => {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.nav-btn').classList.add('active');

    const content = document.getElementById('levelAdminContent');
    
    switch(section) {
      case 'attendance':
        content.innerHTML = flightAdminViews.attendanceSection();
        break;
      case 'sessionControl':
        content.innerHTML = flightAdminViews.sessionControlSection();
        break;
      case 'shuttle':
        content.innerHTML = flightAdminViews.shuttleSection();
        break;
      case 'reports':
        content.innerHTML = flightAdminViews.reportsSection();
        break;
    }
  },

  attendanceSection: () => {
    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>Attendance Management</h2>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="flightAdminViews.addPlayer()">
              <i class="fas fa-plus"></i> Add Player
            </button>
            <button class="btn btn-success" onclick="flightAdminViews.finalizeAttendance()">
              <i class="fas fa-check"></i> Finalize
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div class="card">
            <h3>✓ Coming (0)</h3>
            <div id="presentList" style="max-height: 300px; overflow-y: auto;">
              <p class="text-center" style="color: #a0a8b8;">No players yet</p>
            </div>
          </div>
          <div class="card">
            <h3>✗ Not Coming (0)</h3>
            <div id="absentList" style="max-height: 300px; overflow-y: auto;">
              <p class="text-center" style="color: #a0a8b8;">No players yet</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  sessionControlSection: () => {
    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>Session Control</h2>
          <button class="btn btn-primary" onclick="flightAdminViews.createSession()">
            <i class="fas fa-plus"></i> Create Session
          </button>
        </div>

        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Activity</th>
                <th>Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="sessionsTable">
              <tr><td colspan="6" class="text-center" style="padding: 40px;">No sessions found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  shuttleSection: () => {
    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>Shuttle Stock Management</h2>
          <button class="btn btn-primary" onclick="flightAdminViews.updateStock()">
            <i class="fas fa-edit"></i> Update Stock
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
          <div class="stat-card">
            <h3>Tubes</h3>
            <p class="stat-number" id="tubesCount">0</p>
          </div>
          <div class="stat-card">
            <h3>Loose Shuttles</h3>
            <p class="stat-number" id="looseCount">0</p>
          </div>
          <div class="stat-card">
            <h3>Total</h3>
            <p class="stat-number" id="totalCount">0</p>
          </div>
        </div>

        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Action</th>
                <th>Updated By</th>
              </tr>
            </thead>
            <tbody id="stockTable">
              <tr><td colspan="5" class="text-center" style="padding: 40px;">No stock history found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  reportsSection: () => {
    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>Reports & Analytics</h2>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" onclick="flightAdminViews.printAttendance()">
              <i class="fas fa-print"></i> Print Attendance
            </button>
            <button class="btn btn-secondary" onclick="flightAdminViews.exportReport()">
              <i class="fas fa-download"></i> Export Report
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Total</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody id="reportsTable">
              <tr><td colspan="6" class="text-center" style="padding: 40px;">No reports found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  addPlayer: () => {
    console.log('Add player');
    appController.showNotification('Add Player feature coming soon', 'info');
  },

  finalizeAttendance: () => {
    console.log('Finalize attendance');
    appController.showNotification('Attendance finalized', 'success');
  },

  createSession: () => {
    console.log('Create session');
    appController.showNotification('Create Session feature coming soon', 'info');
  },

  updateStock: () => {
    console.log('Update stock');
    appController.showNotification('Update Stock feature coming soon', 'info');
  },

  printAttendance: () => {
    console.log('Print attendance');
    window.print();
  },

  exportReport: () => {
    console.log('Export report');
    appController.showNotification('Report exported successfully', 'success');
  }
};

