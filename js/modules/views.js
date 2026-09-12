const views = {
  
  // HOME PAGE
  home: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Welcome, John Player!</h1>
          <p>Your next session is today at 6:00 PM</p>
        </div>

        <!-- Upcoming Session Card -->
        <div class="upcoming-session">
          <div class="session-card-large">
            <div class="session-header-large" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h2>Badminton Level 1</h2>
              <span class="session-time">Today • 6:00 PM - 7:30 PM</span>
            </div>
            <div class="session-body-large">
              <div class="session-detail">
                <i class="fas fa-map-marker"></i>
                <span>Court A, Indian Club</span>
              </div>
              <div class="session-detail">
                <i class="fas fa-user-tie"></i>
                <span>Coach: Ali Ahmed</span>
              </div>
              <div class="session-detail">
                <i class="fas fa-users"></i>
                <span>24 Members Registered</span>
              </div>
              <div class="session-actions-large">
                <button class="btn btn-primary" onclick="appController.showNotification('You are coming to the session!', 'success')">
                  <i class="fas fa-check"></i> I'm Coming
                </button>
                <button class="btn btn-secondary" onclick="appController.showNotification('Session cancelled', 'warning')">
                  <i class="fas fa-times"></i> Can't Make It
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
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

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <button class="action-btn" onclick="appController.navigate('timetable')">
              <i class="fas fa-calendar-alt"></i>
              <span>View Timetable</span>
            </button>
            <button class="action-btn" onclick="appController.navigate('attendance')">
              <i class="fas fa-check-circle"></i>
              <span>My Attendance</span>
            </button>
            <button class="action-btn" onclick="appController.navigate('wallet')">
              <i class="fas fa-wallet"></i>
              <span>Wallet</span>
            </button>
            <button class="action-btn" onclick="appController.navigate('bazaar')">
              <i class="fas fa-store"></i>
              <span>BaZaar</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // TIMETABLE PAGE
  timetable: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Activity Timetable</h1>
          <p>All available sessions for this week</p>
        </div>

        <!-- Timetable Grid -->
        <div class="timetable-grid">
          <div class="timetable-day">
            <h3>Monday</h3>
            <div class="session-slot">
              <h4>Badminton Level 1</h4>
              <p><i class="fas fa-clock"></i> 6:00 PM - 7:30 PM</p>
              <p><i class="fas fa-users"></i> 24/30 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')">Register</button>
            </div>
            <div class="session-slot">
              <h4>Badminton Level 3</h4>
              <p><i class="fas fa-clock"></i> 7:45 PM - 9:00 PM</p>
              <p><i class="fas fa-users"></i> 12/15 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')">Register</button>
            </div>
          </div>

          <div class="timetable-day">
            <h3>Tuesday</h3>
            <div class="session-slot">
              <h4>Cricket Training</h4>
              <p><i class="fas fa-clock"></i> 7:00 PM - 8:30 PM</p>
              <p><i class="fas fa-users"></i> 18/20 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')">Register</button>
            </div>
          </div>

          <div class="timetable-day">
            <h3>Wednesday</h3>
            <div class="session-slot">
              <h4>Badminton Level 1</h4>
              <p><i class="fas fa-clock"></i> 6:00 PM - 7:30 PM</p>
              <p><i class="fas fa-users"></i> 24/30 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')">Register</button>
            </div>
            <div class="session-slot">
              <h4>Tennis Coaching</h4>
              <p><i class="fas fa-clock"></i> 5:00 PM - 6:30 PM</p>
              <p><i class="fas fa-users"></i> 10/12 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')">Register</button>
            </div>
          </div>

          <div class="timetable-day">
            <h3>Thursday</h3>
            <div class="session-slot">
              <h4>Cricket Training</h4>
              <p><i class="fas fa-clock"></i> 7:00 PM - 8:30 PM</p>
              <p><i class="fas fa-users"></i> 18/20 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')">Register</button>
            </div>
          </div>

          <div class="timetable-day">
            <h3>Friday</h3>
            <div class="session-slot">
              <h4>Swimming Classes</h4>
              <p><i class="fas fa-clock"></i> 6:00 AM - 7:00 AM</p>
              <p><i class="fas fa-users"></i> 35/40 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')">Register</button>
            </div>
          </div>

          <div class="timetable-day">
            <h3>Saturday</h3>
            <div class="session-slot">
              <h4>Tennis Coaching</h4>
              <p><i class="fas fa-clock"></i> 5:00 PM - 6:30 PM</p>
              <p><i class="fas fa-users"></i> 10/12 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')">Register</button>
            </div>
            <div class="session-slot">
              <h4>Badminton Level 3</h4>
              <p><i class="fas fa-clock"></i> 7:00 PM - 8:30 PM</p>
              <p><i class="fas fa-users"></i> 12/15 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')">Register</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ATTENDANCE PAGE
  attendance: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Attendance</h1>
          <p>Your attendance record this month</p>
        </div>

        <!-- Attendance Stats -->
        <div class="attendance-stats">
          <div class="stat-box">
            <h3>18</h3>
            <p>Sessions Attended</p>
          </div>
          <div class="stat-box">
            <h3>2</h3>
            <p>Sessions Missed</p>
          </div>
          <div class="stat-box">
            <h3>90%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>

        <!-- Attendance Table -->
        <div class="card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sep 11, 2024</td>
                <td>Badminton Level 1</td>
                <td>6:00 PM - 7:30 PM</td>
                <td><span class="badge badge-present">Present</span></td>
              </tr>
              <tr>
                <td>Sep 09, 2024</td>
                <td>Badminton Level 1</td>
                <td>6:00 PM - 7:30 PM</td>
                <td><span class="badge badge-present">Present</span></td>
              </tr>
              <tr>
                <td>Sep 07, 2024</td>
                <td>Cricket Training</td>
                <td>7:00 PM - 8:30 PM</td>
                <td><span class="badge badge-absent">Absent</span></td>
              </tr>
              <tr>
                <td>Sep 04, 2024</td>
                <td>Badminton Level 1</td>
                <td>6:00 PM - 7:30 PM</td>
                <td><span class="badge badge-present">Present</span></td>
              </tr>
              <tr>
                <td>Sep 02, 2024</td>
                <td>Tennis Coaching</td>
                <td>5:00 PM - 6:30 PM</td>
                <td><span class="badge badge-present">Present</span></td>
              </tr>
              <tr>
                <td>Aug 30, 2024</td>
                <td>Swimming Classes</td>
                <td>6:00 AM - 7:00 AM</td>
                <td><span class="badge badge-present">Present</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // WALLET PAGE
  wallet: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Wallet</h1>
          <p>Manage your account balance</p>
        </div>

        <!-- Wallet Card -->
        <div class="wallet-card">
          <div class="wallet-header">
            <h2>My Wallet</h2>
            <div class="wallet-balance">
              <p>Current Balance</p>
              <h1>BHD 250.00</h1>
            </div>
          </div>

          <div class="wallet-actions">
            <button class="btn btn-primary" onclick="appController.showNotification('Top-up initiated! Enter amount.', 'info')">
              <i class="fas fa-plus"></i> Top Up
            </button>
            <button class="btn btn-secondary" onclick="appController.showNotification('Payment via WhatsApp initiated!', 'info')">
              <i class="fab fa-whatsapp"></i> Pay via WhatsApp
            </button>
            <button class="btn btn-secondary" onclick="appController.showNotification('Cash payment recorded!', 'success')">
              <i class="fas fa-money-bill"></i> Pay by Cash
            </button>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="card">
          <h2>Transaction History</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sep 11, 2024</td>
                <td><span class="badge badge-debit">Debit</span></td>
                <td>Session Fee - Badminton Level 1</td>
                <td>-BHD 15</td>
                <td>BHD 250</td>
              </tr>
              <tr>
                <td>Sep 10, 2024</td>
                <td><span class="badge badge-credit">Credit</span></td>
                <td>Top-up via WhatsApp</td>
                <td>+BHD 100</td>
                <td>BHD 265</td>
              </tr>
              <tr>
                <td>Sep 09, 2024</td>
                <td><span class="badge badge-debit">Debit</span></td>
                <td>Session Fee - Badminton Level 1</td>
                <td>-BHD 15</td>
                <td>BHD 165</td>
              </tr>
              <tr>
                <td>Sep 08, 2024</td>
                <td><span class="badge badge-credit">Credit</span></td>
                <td>Top-up by Cash</td>
                <td>+BHD 150</td>
                <td>BHD 180</td>
              </tr>
              <tr>
                <td>Sep 07, 2024</td>
                <td><span class="badge badge-debit">Debit</span></td>
                <td>Session Fee - Tennis Coaching</td>
                <td>-BHD 20</td>
                <td>BHD 30</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // BAZAAR PAGE
  bazaar: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>BaZaar - Buy & Sell</h1>
          <button class="btn btn-primary" onclick="appController.showNotification('Post item form opening...', 'info')">
            <i class="fas fa-plus"></i> Post Item
          </button>
        </div>

        <!-- Bazaar Grid -->
        <div class="bazaar-grid">
          <div class="bazaar-item">
            <div class="item-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 150px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 40px;">
              🏸
            </div>
            <h3>Badminton Racket</h3>
            <p class="item-price">BHD 45</p>
            <p class="item-seller">Seller: Ahmed Al-Mansouri</p>
            <p class="item-condition">Condition: Like New</p>
            <button class="btn-small" onclick="appController.showNotification('Message sent to seller!', 'success')">Contact Seller</button>
          </div>

          <div class="bazaar-item">
            <div class="item-image" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); height: 150px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 40px;">
              🎾
            </div>
            <h3>Tennis Racket</h3>
            <p class="item-price">BHD 60</p>
            <p class="item-seller">Seller: Fatima Al-Dosari</p>
            <p class="item-condition">Condition: Good</p>
            <button class="btn-small" onclick="appController.showNotification('Message sent to seller!', 'success')">Contact Seller</button>
          </div>

          <div class="bazaar-item">
            <div class="item-image" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); height: 150px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 40px;">
              🏊
            </div>
            <h3>Swimming Goggles</h3>
            <p class="item-price">BHD 20</p>
            <p class="item-seller">Seller: Mohammed Al-Khalifa</p>
            <p class="item-condition">Condition: New</p>
            <button class="btn-small" onclick="appController.showNotification('Message sent to seller!', 'success')">Contact Seller</button>
          </div>

          <div class="bazaar-item">
            <div class="item-image" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); height: 150px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 40px;">
              🎒
            </div>
            <h3>Sports Bag</h3>
            <p class="item-price">BHD 35</p>
            <p class="item-seller">Seller: Noor Al-Ansari</p>
            <p class="item-condition">Condition: Good</p>
            <button class="btn-small" onclick="appController.showNotification('Message sent to seller!', 'success')">Contact Seller</button>
          </div>
        </div>
      </div>
    `;
  },

  // LOGS PAGE
  logs: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Activity Logs</h1>
          <p>Your recent activities and transactions</p>
        </div>

        <!-- Logs Table -->
        <div class="card">
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
                <td>Sep 11, 2024 11:30 PM</td>
                <td>Session Attendance</td>
                <td>Marked present in Badminton Level 1</td>
                <td><span class="badge badge-success">Success</span></td>
              </tr>
              <tr>
                <td>Sep 11, 2024 10:45 PM</td>
                <td>Wallet Transaction</td>
                <td>Session fee deducted - BHD 15</td>
                <td><span class="badge badge-success">Success</span></td>
              </tr>
              <tr>
                <td>Sep 10, 2024 09:20 PM</td>
                <td>Wallet Top-up</td>
                <td>Added BHD 100 via WhatsApp</td>
                <td><span class="badge badge-success">Success</span></td>
              </tr>
              <tr>
                <td>Sep 09, 2024 08:15 PM</td>
                <td>Session Registration</td>
                <td>Registered for Badminton Level 1</td>
                <td><span class="badge badge-success">Success</span></td>
              </tr>
              <tr>
                <td>Sep 08, 2024 07:00 PM</td>
                <td>Session Attendance</td>
                <td>Marked present in Tennis Coaching</td>
                <td><span class="badge badge-success">Success</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // PROFILE PAGE
  profile: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Profile</h1>
          <p>Manage your personal information</p>
        </div>

        <!-- Profile Card -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="profile-info">
              <h2>John Player</h2>
              <p>player@club.com</p>
              <p class="profile-level">Level: <strong>Intermediate</strong></p>
            </div>
          </div>

          <div class="profile-details">
            <h3>Personal Information</h3>
            <div class="detail-row">
              <span class="detail-label">Full Name:</span>
              <span class="detail-value">John Player</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">player@club.com</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">+973 1234 5680</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Join Date:</span>
              <span class="detail-value">March 1, 2024</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Current Level:</span>
              <span class="detail-value">Intermediate</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Membership Status:</span>
              <span class="detail-value"><span class="badge badge-active">Active</span></span>
            </div>
          </div>

          <div class="profile-actions">
            <button class="btn btn-primary" onclick="appController.showNotification('Edit profile feature coming soon!', 'info')">
              <i class="fas fa-edit"></i> Edit Profile
            </button>
            <button class="btn btn-secondary" onclick="appController.showNotification('Password changed successfully!', 'success')">
              <i class="fas fa-lock"></i> Change Password
            </button>
          </div>
        </div>
      </div>
    `;
  }
};
};

// Make functions globally accessible
window.playerDashboardView = playerDashboardView;
window.playerProfileView = playerProfileView;
window.bindPlayerViews = bindPlayerViews;

// ✅ MAKE IT GLOBAL
window.views = views;
console.log('✅ views.js loaded successfully');

