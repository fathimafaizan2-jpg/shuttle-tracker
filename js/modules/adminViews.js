
// adminViews.js - Super Admin Dashboard

const adminViews = {
  dashboard: () => {
    return `
      <div class="admin-dashboard">
        <h1>Super Admin Dashboard</h1>
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Members</h3>
            <p class="stat-number">0</p>
          </div>
          <div class="stat-card">
            <h3>Active Sessions</h3>
            <p class="stat-number">0</p>
          </div>
          <div class="stat-card">
            <h3>Unpaid Amount</h3>
            <p class="stat-number">0.000 BHD</p>
          </div>
          <div class="stat-card">
            <h3>Pending Approvals</h3>
            <p class="stat-number">0</p>
          </div>
        </div>
        <div class="admin-tabs">
          <button class="tab-btn active" onclick="adminViews.switchTab('members')">Members</button>
          <button class="tab-btn" onclick="adminViews.switchTab('timetable')">Timetable</button>
          <button class="tab-btn" onclick="adminViews.switchTab('advertising')">Advertising</button>
          <button class="tab-btn" onclick="adminViews.switchTab('reports')">Reports</button>
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
      case 'members':
        content.innerHTML = adminViews.membersTab();
        break;
      case 'timetable':
        content.innerHTML = adminViews.timetableTab();
        break;
      case 'advertising':
        content.innerHTML = adminViews.advertisingTab();
        break;
      case 'reports':
        content.innerHTML = adminViews.reportsTab();
        break;
    }
  },

  membersTab: () => {
    return `
      <div class="members-section">
        <h2>Members Management</h2>
        <div class="section-controls">
          <button class="btn btn-primary">+ Add Member</button>
          <button class="btn btn-secondary">+ Pre-Register</button>
        </div>
        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Member ID</th>
                <th>Phone</th>
                <th>Level</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="7" class="loading">No members yet</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  timetableTab: () => {
    return `
      <div class="timetable-section">
        <h2>Timetable Management</h2>
        <div class="section-controls">
          <button class="btn btn-primary">+ Add Session</button>
        </div>
        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Level</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="6" class="loading">No sessions yet</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  advertisingTab: () => {
    return `
      <div class="advertising-section">
        <h2>Advertising Management</h2>
        <div class="section-controls">
          <button class="btn btn-primary">Carousel Settings</button>
          <button class="btn btn-secondary">Pending Approvals</button>
        </div>
        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="4" class="loading">No ads yet</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  reportsTab: () => {
    return `
      <div class="reports-section">
        <h2>Reports & Analytics</h2>
        <div class="section-controls">
          <button class="btn btn-primary">Attendance Report</button>
          <button class="btn btn-primary">Payments Report</button>
          <button class="btn btn-primary">Shuttle Report</button>
        </div>
        <div id="reportContent"></div>
      </div>
    `;
  }
};

