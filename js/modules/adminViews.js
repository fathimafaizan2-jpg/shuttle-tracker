
// adminViews.js - Premium Super Admin Dashboard

const adminViews = {
  dashboard: () => {
    return `
      <div class="admin-dashboard">
        <div class="page-header">
          <h1>Club Management</h1>
          <p>Manage members, activities, and club operations</p>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Members</h3>
            <p class="stat-number" id="totalMembers">0</p>
          </div>
          <div class="stat-card">
            <h3>Active Sessions</h3>
            <p class="stat-number" id="activeSessions">0</p>
          </div>
          <div class="stat-card">
            <h3>Pending Approvals</h3>
            <p class="stat-number" id="pendingApprovals">0</p>
          </div>
          <div class="stat-card">
            <h3>Total Revenue</h3>
            <p class="stat-number" id="totalRevenue">0.000 BHD</p>
          </div>
        </div>

        <!-- Club Configuration Header -->
        <div class="admin-header-bar">
          <h3>⚙️ Club Configuration</h3>
          <div class="dropdown-group">
            <label class="dropdown-label">Activity:</label>
            <select class="dropdown-select" id="activityFilter" onchange="adminViews.filterByActivity()">
              <option value="">All Activities</option>
              <option value="badminton">Badminton</option>
              <option value="cricket">Cricket</option>
              <option value="tennis">Tennis</option>
              <option value="swimming">Swimming</option>
            </select>
          </div>
          <div class="dropdown-group">
            <label class="dropdown-label">Level:</label>
            <select class="dropdown-select" id="levelFilter" onchange="adminViews.filterByLevel()">
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="professional">Professional</option>
            </select>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="nav-buttons">
          <button class="nav-btn active" onclick="adminViews.showSection('members')">
            <i class="fas fa-users"></i> Members
          </button>
          <button class="nav-btn" onclick="adminViews.showSection('activities')">
            <i class="fas fa-calendar"></i> Activities
          </button>
          <button class="nav-btn" onclick="adminViews.showSection('advertising')">
            <i class="fas fa-megaphone"></i> Advertising
          </button>
          <button class="nav-btn" onclick="adminViews.showSection('logs')">
            <i class="fas fa-history"></i> Logs
          </button>
        </div>

        <!-- Content Sections -->
        <div id="adminContent"></div>
      </div>
    `;
  },

  showSection: (section) => {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.nav-btn').classList.add('active');

    const content = document.getElementById('adminContent');
    
    switch(section) {
      case 'members':
        content.innerHTML = adminViews.membersSection();
        break;
      case 'activities':
        content.innerHTML = adminViews.activitiesSection();
        break;
      case 'advertising':
        content.innerHTML = adminViews.advertisingSection();
        break;
      case 'logs':
        content.innerHTML = adminViews.logsSection();
        break;
    }
  },

  filterByActivity: () => {
    const activity = document.getElementById('activityFilter').value;
    console.log('Filter by activity:', activity);
    adminViews.loadMembers();
  },

  filterByLevel: () => {
    const level = document.getElementById('levelFilter').value;
    console.log('Filter by level:', level);
    adminViews.loadMembers();
  },

  membersSection: () => {
    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>Members Management</h2>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="adminViews.addMember()">
              <i class="fas fa-plus"></i> Add Member
            </button>
            <button class="btn btn-secondary" onclick="adminViews.preRegister()">
              <i class="fas fa-user-plus"></i> Pre-Register
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="premium-table">
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
            <tbody id="membersTable">
              <tr><td colspan="7" class="text-center" style="padding: 40px;">No members found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  activitiesSection: () => {
    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>Activities & Timetable</h2>
          <button class="btn btn-primary" onclick="adminViews.addActivity()">
            <i class="fas fa-plus"></i> Add Activity
          </button>
        </div>

        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Level</th>
                <th>Schedule</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="activitiesTable">
              <tr><td colspan="6" class="text-center" style="padding: 40px;">No activities found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  advertisingSection: () => {
    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>Advertising & Promotions</h2>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="adminViews.carouselSettings()">
              <i class="fas fa-sliders-h"></i> Carousel Settings
            </button>
            <button class="btn btn-secondary" onclick="adminViews.pendingApprovals()">
              <i class="fas fa-check-circle"></i> Pending Approvals
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Category</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="advertisingTable">
              <tr><td colspan="6" class="text-center" style="padding: 40px;">No advertisements found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  logsSection: () => {
    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>System Logs & Audit Trail</h2>
          <button class="btn btn-secondary" onclick="adminViews.exportLogs()">
            <i class="fas fa-download"></i> Export Logs
          </button>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
          <button class="nav-btn active" onclick="adminViews.showLogType('all')">All Logs</button>
          <button class="nav-btn" onclick="adminViews.showLogType('members')">Member Actions</button>
          <button class="nav-btn" onclick="adminViews.showLogType('payments')">Payment Logs</button>
          <button class="nav-btn" onclick="adminViews.showLogType('attendance')">Attendance Logs</button>
          <button class="nav-btn" onclick="adminViews.showLogType('admin')">Admin Actions</button>
        </div>

        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="logsTable">
              <tr><td colspan="5" class="text-center" style="padding: 40px;">No logs found</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  showLogType: (type) => {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    console.log('Show log type:', type);
    adminViews.loadLogs(type);
  },

  addMember: () => {
    console.log('Add member');
    appController.showNotification('Add Member feature coming soon', 'info');
  },

  preRegister: () => {
    console.log('Pre-register member');
    appController.showNotification('Pre-Register feature coming soon', 'info');
  },

  addActivity: () => {
    console.log('Add activity');
    appController.showNotification('Add Activity feature coming soon', 'info');
  },

  carouselSettings: () => {
    console.log('Carousel settings');
    appController.showNotification('Carousel Settings feature coming soon', 'info');
  },

  pendingApprovals: () => {
    console.log('Pending approvals');
    appController.showNotification('Pending Approvals feature coming soon', 'info');
  },

  exportLogs: () => {
    console.log('Export logs');
    appController.showNotification('Logs exported successfully', 'success');
  },

  loadMembers: async () => {
    console.log('Loading members...');
  },

  loadLogs: async (type) => {
    console.log('Loading logs:', type);
  }
};

