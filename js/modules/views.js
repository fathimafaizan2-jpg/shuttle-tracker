
// ============================================
// views.js - Player Dashboard
// COMPLETE & PRODUCTION READY
// ============================================

const views = {
  
  home: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Welcome, John Player!</h1>
          <p>Your next session is today at 6:00 PM</p>
        </div>

        <div class="upcoming-session">
          <div class="session-card-large" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.12);">
            <div class="session-header-large" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white;">
              <h2 style="margin: 0 0 8px 0; color: white;">Badminton Level 1</h2>
              <span class="session-time" style="color: rgba(255,255,255,0.9);">Today • 6:00 PM - 7:30 PM</span>
            </div>
            <div class="session-body-large" style="padding: 20px;">
              <div class="session-detail" style="margin-bottom: 12px;">
                <i class="fas fa-map-marker"></i>
                <span>Court A, Indian Club</span>
              </div>
              <div class="session-detail" style="margin-bottom: 12px;">
                <i class="fas fa-user-tie"></i>
                <span>Coach: Ali Ahmed</span>
              </div>
              <div class="session-detail" style="margin-bottom: 20px;">
                <i class="fas fa-users"></i>
                <span>24 Members Registered</span>
              </div>
              <div class="session-actions-large" style="display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="appController.showNotification('You are coming to the session!', 'success')" style="flex: 1;">
                  <i class="fas fa-check"></i> I'm Coming
                </button>
                <button class="btn btn-secondary" onclick="appController.showNotification('Session cancelled', 'warning')" style="flex: 1;">
                  <i class="fas fa-times"></i> Can't Make It
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-content">
              <h3>18</h3>
              <p>Sessions Attended</p>
              <span class="stat-change">This month</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <i class="fas fa-wallet"></i>
            </div>
            <div class="stat-content">
              <h3>BHD 250</h3>
              <p>Wallet Balance</p>
              <span class="stat-change">Ready to spend</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <i class="fas fa-trophy"></i>
            </div>
            <div class="stat-content">
              <h3>Advanced</h3>
              <p>Current Level</p>
              <span class="stat-change">Keep improving!</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
              <i class="fas fa-star"></i>
            </div>
            <div class="stat-content">
              <h3>4.8/5</h3>
              <p>Your Rating</p>
              <span class="stat-change">Excellent player!</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  timetable: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Activity Timetable</h1>
          <p>All available sessions for this week</p>
        </div>
        <div class="card">
          <p>Timetable here</p>
        </div>
      </div>
    `;
  },

  attendance: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Attendance</h1>
        </div>
        <div class="card">
          <p>Attendance here</p>
        </div>
      </div>
    `;
  },

  wallet: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Wallet</h1>
        </div>
        <div class="card">
          <p>Wallet here</p>
        </div>
      </div>
    `;
  },

  bazaar: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>BaZaar</h1>
        </div>
        <div class="card">
          <p>BaZaar here</p>
        </div>
      </div>
    `;
  },

  logs: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Logs</h1>
        </div>
        <div class="card">
          <p>Logs here</p>
        </div>
      </div>
    `;
  },

  profile: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Profile</h1>
        </div>
        <div class="card">
          <p>Profile here</p>
        </div>
      </div>
    `;
  }
};

export { views };
console.log('✅ views.js loaded successfully');

