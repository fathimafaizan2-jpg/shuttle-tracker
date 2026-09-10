
// flightAdminViews.js - Level Admin Dashboard

const flightAdminViews = {
  dashboard: () => {
    return `
      <div class="flight-admin-dashboard">
        <h1>Level Admin Dashboard</h1>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Next Game</h3>
            <p class="stat-text">Loading...</p>
          </div>
          <div class="stat-card">
            <h3>Players Coming</h3>
            <p class="stat-number">0</p>
          </div>
          <div class="stat-card">
            <h3>Shuttle Stock</h3>
            <p class="stat-number">0</p>
          </div>
          <div class="stat-card">
            <h3>Unpaid Amount</h3>
            <p class="stat-number">0.000 BHD</p>
          </div>
        </div>
        <div class="admin-tabs">
          <button class="tab-btn active" onclick="flightAdminViews.switchTab('attendance')">Attendance</button>
          <button class="tab-btn" onclick="flightAdminViews.switchTab('sessionControl')">Session Control</button>
          <button class="tab-btn" onclick="flightAdminViews.switchTab('shuttle')">Shuttle Stock</button>
          <button class="tab-btn" onclick="flightAdminViews.switchTab('reports')">Reports</button>
        </div>
        <div id="tabContent" class="tab-content"></div>
      </div>
    `;
  },

  switchTab: (tabName) => {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const content = document.getElementById('tabContent');
    
    switch(tabName) {
      case 'attendance':
        content.innerHTML = flightAdminViews.attendanceTab();
        break;
      case 'sessionControl':
        content.innerHTML = flightAdminViews.sessionControlTab();
        break;
      case 'shuttle':
        content.innerHTML = flightAdminViews.shuttleTab();
        break;
      case 'reports':
        content.innerHTML = flightAdminViews.reportsTab();
        break;
    }
  },

  attendanceTab: () => {
    return `
      <div class="attendance-section">
        <h2>Attendance Management</h2>
        <div class="attendance-lists">
          <div class="list-container">
            <h3>✓ Coming</h3>
            <div id="presentList" class="player-list">
              <p class="loading">No players yet</p>
            </div>
          </div>
          <div class="list-container">
            <h3>✗ Not Coming</h3>
            <div id="absentList" class="player-list">
              <p class="loading">No players yet</p>
            </div>
          </div>
        </div>
        <div class="section-controls">
          <button class="btn btn-primary">+ Add Player</button>
          <button class="btn btn-secondary">Finalize Attendance</button>
        </div>
      </div>
    `;
  },

  sessionControlTab: () => {
    return `
      <div class="session-control-section">
        <h2>Session Control</h2>
        <div class="card">
          <h3>Session Details</h3>
          <p>Select a session to manage</p>
        </div>
      </div>
    `;
  },

  shuttleTab: () => {
    return `
      <div class="shuttle-section">
        <h2>Shuttle Stock Management</h2>
        <div class="card">
          <h3>Current Stock</h3>
          <p>Tubes: 0 | Loose: 0</p>
        </div>
      </div>
    `;
  },

  reportsTab: () => {
    return `
      <div class="reports-section">
        <h2>Reports & Logs</h2>
        <div class="section-controls">
          <button class="btn btn-secondary">Print Attendance</button>
          <button class="btn btn-secondary">Print Payments</button>
        </div>
      </div>
    `;
  }
};

