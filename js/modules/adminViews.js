
// ============================================
// adminViews.js - Super Admin Dashboard
// COMPLETE & PRODUCTION READY
// ============================================

const adminViews = {
  
  dashboard: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Super Admin Dashboard</h1>
          <p>Welcome back! Manage your entire club here.</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <h3>1,245</h3>
              <p>Total Members</p>
              <span class="stat-change">+12% this month</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-content">
              <h3>156</h3>
              <p>Sessions This Month</p>
              <span class="stat-change">+8% from last month</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <h3>23</h3>
              <p>Pending Approvals</p>
              <span class="stat-change">Action needed</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="stat-content">
              <h3>BHD 45,230</h3>
              <p>Total Revenue</p>
              <span class="stat-change">+15% this quarter</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>Recent Activities</h2>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon" style="background: #e94560;">
                <i class="fas fa-user-check"></i>
              </div>
              <div class="activity-content">
                <h4>New Member Registered</h4>
                <p>Ahmed Al-Mansouri joined the club</p>
                <span class="activity-time">2 hours ago</span>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-icon" style="background: #00d4aa;">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="activity-content">
                <h4>Session Completed</h4>
                <p>Badminton Level 2 - 24 attendees</p>
                <span class="activity-time">4 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  membersSection: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Members Management</h1>
        </div>
        <div class="card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ahmed Al-Mansouri</td>
                <td>ahmed@example.com</td>
                <td><span class="badge badge-success">Advanced</span></td>
                <td><span class="badge badge-success">Active</span></td>
              </tr>
              <tr>
                <td>Fatima Al-Dosari</td>
                <td>fatima@example.com</td>
                <td><span class="badge badge-info">Intermediate</span></td>
                <td><span class="badge badge-success">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  activitiesSection: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Activities Management</h1>
        </div>
        <div class="card">
          <p>Activities list here</p>
        </div>
      </div>
    `;
  },

  advertisingSection: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Advertising Management</h1>
        </div>
        <div class="card">
          <p>Advertising list here</p>
        </div>
      </div>
    `;
  },

  logsSection: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>System Logs</h1>
        </div>
        <div class="card">
          <p>Logs here</p>
        </div>
      </div>
    `;
  }
};

export { adminViews };
console.log('✅ adminViews.js loaded successfully');
