
const views = {
  
  home: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Welcome, John Player!</h1>
        <p>Your next session is today at 6:00 PM</p>
      </div>
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.12); margin-bottom: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white;">
          <h2 style="margin: 0 0 8px 0; color: white;">Badminton Level 1</h2>
          <span style="color: rgba(255,255,255,0.9);">Today • 6:00 PM - 7:30 PM</span>
        </div>
        <div style="padding: 20px;">
          <div style="margin-bottom: 12px;"><i class="fas fa-map-marker"></i> <span>Court A, Indian Club</span></div>
          <div style="margin-bottom: 12px;"><i class="fas fa-user-tie"></i> <span>Coach: Ali Ahmed</span></div>
          <div style="margin-bottom: 20px;"><i class="fas fa-users"></i> <span>24 Members Registered</span></div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="appController.showNotification('You are coming to the session!', 'success')" style="flex: 1; padding: 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-check"></i> I'm Coming</button>
            <button class="btn btn-secondary" onclick="appController.showNotification('Session cancelled', 'warning')" style="flex: 1; padding: 12px; background: #ffa502; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-times"></i> Can't Make It</button>
          </div>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-content"><h3>18</h3><p>Sessions Attended</p><span class="stat-change">This month</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"><i class="fas fa-wallet"></i></div>
          <div class="stat-content"><h3>BHD 250</h3><p>Wallet Balance</p><span class="stat-change">Ready to spend</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"><i class="fas fa-trophy"></i></div>
          <div class="stat-content"><h3>Advanced</h3><p>Current Level</p><span class="stat-change">Keep improving!</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);"><i class="fas fa-star"></i></div>
          <div class="stat-content"><h3>4.8/5</h3><p>Your Rating</p><span class="stat-change">Excellent player!</span></div>
        </div>
      </div>
    </div>
  `,

  timetable: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Activity Timetable</h1>
        <p>All available sessions for this week</p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0; color: #667eea;">Monday</h3>
          <div style="background: #f5f7fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
            <h4 style="margin: 0 0 8px 0;">Badminton Level 1</h4>
            <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 6:00 PM - 7:30 PM</p>
            <p style="margin: 4px 0;"><i class="fas fa-users"></i> 24/30 Members</p>
            <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
          </div>
          <div style="background: #f5f7fa; padding: 12px; border-radius: 8px;">
            <h4 style="margin: 0 0 8px 0;">Badminton Level 3</h4>
            <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 7:45 PM - 9:00 PM</p>
            <p style="margin: 4px 0;"><i class="fas fa-users"></i> 12/15 Members</p>
            <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
          </div>
        </div>
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0; color: #f5576c;">Tuesday</h3>
          <div style="background: #f5f7fa; padding: 12px; border-radius: 8px;">
            <h4 style="margin: 0 0 8px 0;">Cricket Training</h4>
            <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 7:00 PM - 8:30 PM</p>
            <p style="margin: 4px 0;"><i class="fas fa-users"></i> 18/20 Members</p>
            <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
          </div>
        </div>
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0; color: #00d4aa;">Wednesday</h3>
          <div style="background: #f5f7fa; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
            <h4 style="margin: 0 0 8px 0;">Badminton Level 1</h4>
            <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 6:00 PM - 7:30 PM</p>
            <p style="margin: 4px 0;"><i class="fas fa-users"></i> 24/30 Members</p>
            <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
          </div>
          <div style="background: #f5f7fa; padding: 12px; border-radius: 8px;">
            <h4 style="margin: 0 0 8px 0;">Tennis Coaching</h4>
            <p style="margin: 4px 0;"><i class="fas fa-clock"></i> 5:00 PM - 6:30 PM</p>
            <p style="margin: 4px 0;"><i class="fas fa-users"></i> 10/12 Members</p>
            <button class="btn-small" onclick="appController.showNotification('Registered for session!', 'success')" style="margin-top: 8px; padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Register</button>
          </div>
        </div>
      </div>
    </div>
  `,

  attendance: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>My Attendance</h1>
        <p>Track your session attendance</p>
      </div>
      <div class="card">
        <h2>Attendance Summary</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Activity</th>
              <th style="padding: 12px; text-align: left;">Date</th>
              <th style="padding: 12px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Badminton Level 1</td>
              <td style="padding: 12px;">Sep 11, 2024</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Present</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Badminton Level 1</td>
              <td style="padding: 12px;">Sep 09, 2024</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Present</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Cricket Training</td>
              <td style="padding: 12px;">Sep 07, 2024</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Present</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Tennis Coaching</td>
              <td style="padding: 12px;">Sep 05, 2024</td>
              <td style="padding: 12px;"><span style="background: #ff4757; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Absent</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  wallet: () => `
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
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Amount (BHD)</label>
          <input type="number" placeholder="Enter amount" style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
        </div>
        <button class="btn btn-primary" onclick="appController.showNotification('Wallet topped up successfully!', 'success')" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-plus"></i> Top Up</button>
        <h3 style="margin-top: 30px;">Transaction History</h3>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Date</th>
              <th style="padding: 12px; text-align: left;">Description</th>
              <th style="padding: 12px; text-align: left;">Amount</th>
              <th style="padding: 12px; text-align: left;">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 11, 2024</td>
              <td style="padding: 12px;">Session Fee - Badminton</td>
              <td style="padding: 12px;">-BHD 10</td>
              <td style="padding: 12px;">BHD 250</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 10, 2024</td>
              <td style="padding: 12px;">Wallet Top-up</td>
              <td style="padding: 12px;">+BHD 50</td>
              <td style="padding: 12px;">BHD 260</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  bazaar: () => `
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
            <button class="btn btn-primary" onclick="appController.showNotification('Item added to cart!', 'success')" style="width: 100%; padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Add to Cart</button>
          </div>
          <div style="background: white; border: 1px solid #e0e6ed; border-radius: 8px; padding: 15px;">
            <h4>Shuttles (Pack of 12)</h4>
            <p>High quality shuttles</p>
            <p style="font-size: 18px; font-weight: bold; color: #667eea;">BHD 15</p>
            <button class="btn btn-primary" onclick="appController.showNotification('Item added to cart!', 'success')" style="width: 100%; padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Add to Cart</button>
          </div>
          <div style="background: white; border: 1px solid #e0e6ed; border-radius: 8px; padding: 15px;">
            <h4>Sports Shoes</h4>
            <p>Comfortable sports shoes</p>
            <p style="font-size: 18px; font-weight: bold; color: #667eea;">BHD 60</p>
            <button class="btn btn-primary" onclick="appController.showNotification('Item added to cart!', 'success')" style="width: 100%; padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `,

  logs: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>My Logs</h1>
        <p>View your activity history</p>
      </div>
      <div class="card">
        <h2>Activity Logs</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Date</th>
              <th style="padding: 12px; text-align: left;">Activity</th>
              <th style="padding: 12px; text-align: left;">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 11, 2024</td>
              <td style="padding: 12px;">Session Attended</td>
              <td style="padding: 12px;">Badminton Level 1</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 10, 2024</td>
              <td style="padding: 12px;">Wallet Top-up</td>
              <td style="padding: 12px;">BHD 50 added</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 09, 2024</td>
              <td style="padding: 12px;">Session Attended</td>
              <td style="padding: 12px;">Badminton Level 1</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  profile: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information</p>
      </div>
      <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 60px; margin-bottom: 15px;"><i class="fas fa-user-circle"></i></div>
          <h2 style="margin: 0 0 8px 0;">John Player</h2>
          <p style="margin: 0 0 8px 0; color: #666;">player@club.com</p>
          <p style="margin: 0;">Level: <strong>Intermediate</strong></p>
        </div>
        <div>
          <h3>Personal Information</h3>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
            <span style="font-weight: 600;">Full Name:</span>
            <span>John Player</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
            <span style="font-weight: 600;">Email:</span>
            <span>player@club.com</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
            <span style="font-weight: 600;">Phone:</span>
            <span>+973 1234 5680</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
            <span style="font-weight: 600;">Join Date:</span>
            <span>March 1, 2024</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e6ed;">
            <span style="font-weight: 600;">Current Level:</span>
            <span>Intermediate</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0;">
            <span style="font-weight: 600;">Membership Status:</span>
            <span><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Active</span></span>
          </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button class="btn btn-primary" onclick="appController.showNotification('Edit profile feature coming soon!', 'info')" style="flex: 1; padding: 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-edit"></i> Edit Profile</button>
          <button class="btn btn-secondary" onclick="appController.showNotification('Password changed successfully!', 'success')" style="flex: 1; padding: 12px; background: #00d4aa; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-lock"></i> Change Password</button>
        </div>
      </div>
    </div>
  `
};

window.views = views;
export { views };
console.log('✅ views.js loaded successfully');

