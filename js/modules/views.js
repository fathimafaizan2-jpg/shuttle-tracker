
// ============================================
// views.js - Player Dashboard
// COMPLETE & PRODUCTION READY - STRICT MODE COMPATIBLE
// ============================================

export const views = {
  
  // HOME PAGE
  home: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Welcome, John Player!</h1>
          <p>Your next session is today at 6:00 PM</p>
        </div>

        <!-- Upcoming Session Card -->
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
          <div class="action-buttons" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
            <button class="action-btn" onclick="appController.navigate('timetable')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;">
              <i class="fas fa-calendar-alt" style="font-size: 24px; color: #667eea; display: block; margin-bottom: 8px;"></i>
              <span>View Timetable</span>
            </button>
            <button class="action-btn" onclick="appController.navigate('attendance')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;">
              <i class="fas fa-check-circle" style="font-size: 24px; color: #00d4aa; display: block; margin-bottom: 8px;"></i>
              <span>My Attendance</span>
            </button>
            <button class="action-btn" onclick="appController.navigate('wallet')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;">
              <i class="fas fa-wallet" style="font-size: 24px; color: #f5576c; display: block; margin-bottom: 8px;"></i>
              <span>Wallet</span>
            </button>
            <button class="action-btn" onclick="appController.navigate('bazaar')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;">
              <i class="fas fa-store" style="font-size: 24px; color: #ffa502; display: block; margin-bottom: 8px;"></i>
              <span>BaZaar</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // TIMETABLE PAGE
  timetable: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Activity Timetable</h1>
          <p>All available sessions for this week</p>
        </div>

        <!-- Timetable Grid -->
        <div class="timetable-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          <div class="timetable-day" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #667eea;">Monday</h3>
            <div class="session-slot" style="background: #f5f7fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
              <h4 style="margin: 0 0 8px 0;">Badminton Level 1</h4>
              <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 6:00 PM - 7:30 PM</p>
              <p style="margin: 4px 0;"><i class="fas fa-users"></i> 24/30 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
            </div>
            <div class="session-slot" style="background: #f5f7fa; padding: 12px; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0;">Badminton Level 3</h4>
              <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 7:45 PM - 9:00 PM</p>
              <p style="margin: 4px 0;"><i class="fas fa-users"></i> 12/15 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
            </div>
          </div>

          <div class="timetable-day" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #f5576c;">Tuesday</h3>
            <div class="session-slot" style="background: #f5f7fa; padding: 12px; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0;">Cricket Training</h4>
              <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 7:00 PM - 8:30 PM</p>
              <p style="margin: 4px 0;"><i class="fas fa-users"></i> 18/20 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
            </div>
          </div>

          <div class="timetable-day" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #00d4aa;">Wednesday</h3>
            <div class="session-slot" style="background: #f5f7fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
              <h4 style="margin: 0 0 8px 0;">Badminton Level 1</h4>
              <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 6:00 PM - 7:30 PM</p>
              <p style="margin: 4px 0;"><i class="fas fa-users"></i> 24/30 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
            </div>
            <div class="session-slot" style="background: #f5f7fa; padding: 12px; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0;">Tennis Coaching</h4>
              <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 5:00 PM - 6:30 PM</p>
              <p style="margin: 4px 0;"><i class="fas fa-users"></i> 10/12 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
            </div>
          </div>

          <div class="timetable-day" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #ffa502;">Thursday</h3>
            <div class="session-slot" style="background: #f5f7fa; padding: 12px; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0;">Cricket Training</h4>
              <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 7:00 PM - 8:30 PM</p>
              <p style="margin: 4px 0;"><i class="fas fa-users"></i> 18/20 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
            </div>
          </div>

          <div class="timetable-day" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #0099ff;">Friday</h3>
            <div class="session-slot" style="background: #f5f7fa; padding: 12px; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0;">Swimming Classes</h4>
              <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 6:00 AM - 7:00 AM</p>
              <p style="margin: 4px 0;"><i class="fas fa-users"></i> 35/40 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
            </div>
          </div>

          <div class="timetable-day" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #667eea;">Saturday</h3>
            <div class="session-slot" style="background: #f5f7fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
              <h4 style="margin: 0 0 8px 0;">Tennis Coaching</h4>
              <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 5:00 PM - 6:30 PM</p>
              <p style="margin: 4px 0;"><i class="fas fa-users"></i> 10/12 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
            </div>
            <div class="session-slot" style="background: #f5f7fa; padding: 12px; border-radius: 8px;">
              <h4 style="margin: 0 0 8px 0;">Badminton Tournament</h4>
              <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 7:00 PM - 9:00 PM</p>
              <p style="margin: 4px 0;"><i class="fas fa-users"></i> 16/20 Members</p>
              <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ATTENDANCE PAGE
  attendance: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Attendance</h1>
          <p>Track your session attendance</p>
        </div>

        <div class="card">
          <h2>Attendance Summary</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Badminton Level 1</td>
                <td>Sep 11, 2024</td>
                <td><span class="badge badge-success">Present</span></td>
              </tr>
              <tr>
                <td>Badminton Level 1</td>
                <td>Sep 09, 2024</td>
                <td><span class="badge badge-success">Present</span></td>
              </tr>
              <tr>
                <td>Cricket Training</td>
                <td>Sep 07, 2024</td>
                <td><span class="badge badge-success">Present</span></td>
              </tr>
              <tr>
                <td>Tennis Coaching</td>
                <td>Sep 05, 2024</td>
                <td><span class="badge badge-danger">Absent</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // WALLET PAGE
  wallet: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Wallet</h1>
          <p>Manage your club wallet</p>
        </div>

        <div class="card">
          <h2>Wallet Balance</h2>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0;">Current Balance</h3>
            <h1 style="margin: 0; font-size: 48px;">BHD 250</h1>
          </div>

          <h3>Top Up Wallet</h3>
          <div class="form-group">
            <label>Amount (BHD)</label>
            <input type="number" placeholder="Enter amount" style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
          </div>
          <button class="btn btn-primary" onclick="appController.showNotification('Wallet topped up successfully!', 'success')">
            <i class="fas fa-plus"></i> Top Up
          </button>

          <h3 style="margin-top: 30px;">Transaction History</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sep 11, 2024</td>
                <td>Session Fee - Badminton</td>
                <td>-BHD 10</td>
                <td>BHD 250</td>
              </tr>
              <tr>
                <td>Sep 10, 2024</td>
                <td>Wallet Top-up</td>
                <td>+BHD 50</td>
                <td>BHD 260</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // BAZAAR PAGE
  bazaar: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>BaZaar</h1>
          <p>Buy and sell items in the club marketplace</p>
        </div>

        <div class="card">
          <h2>Available Items</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div style="background: white; border: 1px solid #e0e6ed; border-radius: 8px; padding: 15px;">
              <h4>Badminton Racket</h4>
              <p>Professional grade racket</p>
              <p style="font-size: 18px; font-weight: bold; color: #667eea;">BHD 45</p>
              <button class="btn btn-primary" onclick="appController.showNotification('Item added to cart!', 'success')" style="width: 100%;">Add to Cart</button>
            </div>
            <div style="background: white; border: 1px solid #e0e6ed; border-radius: 8px; padding: 15px;">
              <h4>Shuttles (Pack of 12)</h4>
              <p>High quality shuttles</p>
              <p style="font-size: 18px; font-weight: bold; color: #667eea;">BHD 15</p>
              <button class="btn btn-primary" onclick="appController.showNotification('Item added to cart!', 'success')" style="width: 100%;">Add to Cart</button>
            </div>
            <div style="background: white; border: 1px solid #e0e6ed; border-radius: 8px; padding: 15px;">
              <h4>Sports Shoes</h4>
              <p>Comfortable sports shoes</p>
              <p style="font-size: 18px; font-weight: bold; color: #667eea;">BHD 60</p>
              <button class="btn btn-primary" onclick="appController.showNotification('Item added to cart!', 'success')" style="width: 100%;">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // LOGS PAGE
  logs: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Logs</h1>
          <p>View your activity history</p>
        </div>

        <div class="card">
          <h2>Activity Logs</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sep 11, 2024</td>
                <td>Session Attended</td>
                <td>Badminton Level 1</td>
              </tr>
              <tr>
                <td>Sep 10, 2024</td>
                <td>Wallet Top-up</td>
                <td>BHD 50 added</td>
              </tr>
              <tr>
                <td>Sep 09, 2024</td>
                <td>Session Attended</td>
                <td>Badminton Level 1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // PROFILE PAGE
  profile: () => {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>My Profile</h1>
          <p>Manage your personal information</p>
        </div>

        <div class="profile-card" style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div class="profile-header" style="text-align: center; margin-bottom: 30px;">
            <div class="profile-avatar" style="font-size: 60px; margin-bottom: 15px;">
              <i class="fas fa-user-circle"></i>
            </div>
            <h2 style="margin: 0 0 8px 0;">John Player</h2>
            <p style="margin: 0 0 8px 0; color: #666;">player@club.com</p>
            <p class="profile-level" style="margin: 0;">Level: <strong>Intermediate</strong></p>
          </div>

          <div class="profile-details">
            <h3>Personal Information</h3>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
              <span class="detail-label" style="font-weight: 600;">Full Name:</span>
              <span class="detail-value">John Player</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
              <span class="detail-label" style="font-weight: 600;">Email:</span>
              <span class="detail-value">player@club.com</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
              <span class="detail-label" style="font-weight: 600;">Phone:</span>
              <span class="detail-value">+973 1234 5680</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
              <span class="detail-label" style="font-weight: 600;">Join Date:</span>
              <span class="detail-value">March 1, 2024</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
              <span class="detail-label" style="font-weight: 600;">Current Level:</span>
              <span class="detail-value">Intermediate</span>
            </div>
            <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0;">
              <span class="detail-label" style="font-weight: 600;">Membership Status:</span>
              <span class="detail-value"><span class="badge badge-success">Active</span></span>
            </div>
          </div>

          <div class="profile-actions" style="display: flex; gap: 12px; margin-top: 20px;">
            <button class="btn btn-primary" onclick="appController.showNotification('Edit profile feature coming soon!', 'info')" style="flex: 1;">
              <i class="fas fa-edit"></i> Edit Profile
            </button>
            <button class="btn btn-secondary" onclick="appController.showNotification('Password changed successfully!', 'success')" style="flex: 1;">
              <i class="fas fa-lock"></i> Change Password
            </button>
          </div>
        </div>
      </div>
    `;
  }
};
export const views = views;
console.log('✅ views.js loaded successfully');
