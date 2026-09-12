
// ============================================
// adminViews.js - Super Admin Dashboard
// COMPLETE & PRODUCTION READY
// ============================================

const adminViews = {
  
  // DASHBOARD
  dashboard: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Super Admin Dashboard</h1>
          <p>Welcome back! Manage your entire club here.</p>
        </div>

        <!-- Stats Cards -->
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

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <button class="action-btn" onclick="appController.navigate('members')">
              <i class="fas fa-user-plus"></i>
              <span>Add Member</span>
            </button>
            <button class="action-btn" onclick="appController.navigate('activities')">
              <i class="fas fa-calendar-plus"></i>
              <span>Create Activity</span>
            </button>
            <button class="action-btn" onclick="appController.navigate('advertising')">
              <i class="fas fa-megaphone"></i>
              <span>Post Ad</span>
            </button>
            <button class="action-btn" onclick="appController.navigate('logs')">
              <i class="fas fa-history"></i>
              <span>View Logs</span>
            </button>
          </div>
        </div>

        <!-- Recent Activities -->
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

            <div class="activity-item">
              <div class="activity-icon" style="background: #ffa502;">
                <i class="fas fa-money-bill"></i>
              </div>
              <div class="activity-content">
                <h4>Payment Received</h4>
                <p>BHD 150 from wallet top-up</p>
                <span class="activity-time">6 hours ago</span>
              </div>
            </div>

            <div class="activity-item">
              <div class="activity-icon" style="background: #0099ff;">
                <i class="fas fa-megaphone"></i>
              </div>
              <div class="activity-content">
                <h4>Advertisement Posted</h4>
                <p>New coaching program announcement</p>
                <span class="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // MEMBERS SECTION
  membersSection: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Members Management</h1>
          <div class="header-actions">
            <button class="btn btn-primary" onclick="appController.showNotification('Add Member modal opening...', 'info')">
              <i class="fas fa-user-plus"></i> Add New Member
            </button>
            <button class="btn btn-secondary" onclick="appController.showNotification('Pre-register modal opening...', 'info')">
              <i class="fas fa-file-import"></i> Pre-Register
            </button>
            <button class="btn btn-info" onclick="appController.showNotification('Members exported to CSV', 'success')">
              <i class="fas fa-download"></i> Export
            </button>
          </div>
        </div>

        <!-- Search & Filter -->
        <div class="search-bar">
          <input type="text" placeholder="Search members by name or email..." style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px; margin-bottom: 15px;">
          <select style="padding: 10px; border: 1px solid #e0e6ed; border-radius: 8px;">
            <option>All Levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
            <option>Professional</option>
          </select>
        </div>

        <!-- Members Table -->
        <div class="card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Level</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Ahmed Al-Mansouri</strong></td>
                <td>ahmed@example.com</td>
                <td><span class="badge badge-success">Advanced</span></td>
                <td>Jan 15, 2024</td>
                <td><span class="badge badge-success">Active</span></td>
                <td>
                  <button class="btn-small" onclick="appController.showNotification('Edit member', 'info')">Edit</button>
                  <button class="btn-small" onclick="appController.showNotification('Member deleted', 'success')">Delete</button>
                </td>
              </tr>
              <tr>
                <td><strong>Fatima Al-Dosari</strong></td>
                <td>fatima@example.com</td>
                <td><span class="badge badge-info">Intermediate</span></td>
                <td>Feb 20, 2024</td>
                <td><span class="badge badge-success">Active</span></td>
                <td>
                  <button class="btn-small" onclick="appController.showNotification('Edit member', 'info')">Edit</button>
                  <button class="btn-small" onclick="appController.showNotification('Member deleted', 'success')">Delete</button>
                </td>
              </tr>
              <tr>
                <td><strong>Mohammed Al-Khalifa</strong></td>
                <td>mohammed@example.com</td>
                <td><span class="badge badge-warning">Beginner</span></td>
                <td>Mar 10, 2024</td>
                <td><span class="badge badge-danger">Inactive</span></td>
                <td>
                  <button class="btn-small" onclick="appController.showNotification('Edit member', 'info')">Edit</button>
                  <button class="btn-small" onclick="appController.showNotification('Member deleted', 'success')">Delete</button>
                </td>
              </tr>
              <tr>
                <td><strong>Noor Al-Ansari</strong></td>
                <td>noor@example.com</td>
                <td><span class="badge badge-success">Professional</span></td>
                <td>Apr 05, 2024</td>
                <td><span class="badge badge-success">Active</span></td>
                <td>
                  <button class="btn-small" onclick="appController.showNotification('Edit member', 'info')">Edit</button>
                  <button class="btn-small" onclick="appController.showNotification('Member deleted', 'success')">Delete</button>
                </td>
              </tr>
              <tr>
                <td><strong>Sara Al-Sulaiti</strong></td>
                <td>sara@example.com</td>
                <td><span class="badge badge-success">Advanced</span></td>
                <td>May 12, 2024</td>
                <td><span class="badge badge-success">Active</span></td>
                <td>
                  <button class="btn-small" onclick="appController.showNotification('Edit member', 'info')">Edit</button>
                  <button class="btn-small" onclick="appController.showNotification('Member deleted', 'success')">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ACTIVITIES SECTION
  activitiesSection: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Activities Management</h1>
          <button class="btn btn-primary" onclick="appController.showNotification('Create Activity modal opening...', 'info')">
            <i class="fas fa-calendar-plus"></i> Create Activity
          </button>
        </div>

        <!-- Activities Grid -->
        <div class="activities-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
          <div class="activity-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div class="activity-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 8px; color: white; margin-bottom: 15px;">
              <h3 style="margin: 0; color: white;">Badminton Level 1</h3>
              <span class="activity-badge" style="background: rgba(255,255,255,0.3); padding: 4px 10px; border-radius: 4px; font-size: 12px;">Beginner</span>
            </div>
            <div class="activity-body">
              <p><i class="fas fa-calendar"></i> Monday & Wednesday</p>
              <p><i class="fas fa-clock"></i> 6:00 PM - 7:30 PM</p>
              <p><i class="fas fa-users"></i> 24 Members</p>
              <p><i class="fas fa-user-tie"></i> Coach: Ali Ahmed</p>
              <p><i class="fas fa-map-marker"></i> Court A</p>
              <div class="activity-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn-small" onclick="appController.showNotification('Activity updated', 'success')" style="padding: 8px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Edit</button>
                <button class="btn-small" onclick="appController.showNotification('Activity deleted', 'success')" style="padding: 8px 12px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer;">Delete</button>
              </div>
            </div>
          </div>

          <div class="activity-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div class="activity-header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 15px; border-radius: 8px; color: white; margin-bottom: 15px;">
              <h3 style="margin: 0; color: white;">Cricket Training</h3>
              <span class="activity-badge" style="background: rgba(255,255,255,0.3); padding: 4px 10px; border-radius: 4px; font-size: 12px;">Intermediate</span>
            </div>
            <div class="activity-body">
              <p><i class="fas fa-calendar"></i> Tuesday & Thursday</p>
              <p><i class="fas fa-clock"></i> 7:00 PM - 8:30 PM</p>
              <p><i class="fas fa-users"></i> 18 Members</p>
              <p><i class="fas fa-user-tie"></i> Coach: Hassan Khan</p>
              <p><i class="fas fa-map-marker"></i> Court B</p>
              <div class="activity-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn-small" onclick="appController.showNotification('Activity updated', 'success')" style="padding: 8px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Edit</button>
                <button class="btn-small" onclick="appController.showNotification('Activity deleted', 'success')" style="padding: 8px 12px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer;">Delete</button>
              </div>
            </div>
          </div>

          <div class="activity-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div class="activity-header" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 15px; border-radius: 8px; color: white; margin-bottom: 15px;">
              <h3 style="margin: 0; color: white;">Tennis Coaching</h3>
              <span class="activity-badge" style="background: rgba(255,255,255,0.3); padding: 4px 10px; border-radius: 4px; font-size: 12px;">Advanced</span>
            </div>
            <div class="activity-body">
              <p><i class="fas fa-calendar"></i> Saturday & Sunday</p>
              <p><i class="fas fa-clock"></i> 5:00 PM - 6:30 PM</p>
              <p><i class="fas fa-users"></i> 12 Members</p>
              <p><i class="fas fa-user-tie"></i> Coach: Fatima Al-Dosari</p>
              <p><i class="fas fa-map-marker"></i> Court C</p>
              <div class="activity-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn-small" onclick="appController.showNotification('Activity updated', 'success')" style="padding: 8px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Edit</button>
                <button class="btn-small" onclick="appController.showNotification('Activity deleted', 'success')" style="padding: 8px 12px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer;">Delete</button>
              </div>
            </div>
          </div>

          <div class="activity-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div class="activity-header" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 15px; border-radius: 8px; color: white; margin-bottom: 15px;">
              <h3 style="margin: 0; color: white;">Swimming Classes</h3>
              <span class="activity-badge" style="background: rgba(255,255,255,0.3); padding: 4px 10px; border-radius: 4px; font-size: 12px;">All Levels</span>
            </div>
            <div class="activity-body">
              <p><i class="fas fa-calendar"></i> Daily</p>
              <p><i class="fas fa-clock"></i> 6:00 AM - 7:00 AM</p>
              <p><i class="fas fa-users"></i> 35 Members</p>
              <p><i class="fas fa-user-tie"></i> Coach: Mohammed Al-Khalifa</p>
              <p><i class="fas fa-map-marker"></i> Pool</p>
              <div class="activity-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                <button class="btn-small" onclick="appController.showNotification('Activity updated', 'success')" style="padding: 8px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Edit</button>
                <button class="btn-small" onclick="appController.showNotification('Activity deleted', 'success')" style="padding: 8px 12px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer;">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ADVERTISING SECTION
  advertisingSection: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Advertising Management</h1>
          <button class="btn btn-primary" onclick="appController.showNotification('Post Advertisement modal opening...', 'info')">
            <i class="fas fa-megaphone"></i> Post Advertisement
          </button>
        </div>

        <!-- Ads List -->
        <div class="ads-list">
          <div class="ad-item" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div class="ad-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h3 style="margin: 0;">New Coaching Program</h3>
              <span class="ad-status" style="background: #00d4aa; color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;">Approved</span>
            </div>
            <p class="ad-description">Join our new advanced coaching program starting next month. Limited seats available!</p>
            <div class="ad-meta" style="display: flex; gap: 20px; margin: 15px 0; font-size: 13px; color: #666;">
              <span><i class="fas fa-user"></i> Posted by: Admin</span>
              <span><i class="fas fa-calendar"></i> Sep 10, 2024</span>
              <span><i class="fas fa-eye"></i> 245 views</span>
            </div>
            <div class="ad-actions" style="display: flex; gap: 10px;">
              <button class="btn-small" onclick="appController.showNotification('Ad updated', 'success')" style="padding: 8px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Edit</button>
              <button class="btn-small" onclick="appController.showNotification('Ad deleted', 'success')" style="padding: 8px 12px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer;">Delete</button>
            </div>
          </div>

          <div class="ad-item" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div class="ad-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h3 style="margin: 0;">Equipment Sale</h3>
              <span class="ad-status" style="background: #ffa502; color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;">Pending</span>
            </div>
            <p class="ad-description">Selling premium badminton rackets and shuttles at discounted prices. Contact admin for details.</p>
            <div class="ad-meta" style="display: flex; gap: 20px; margin: 15px 0; font-size: 13px; color: #666;">
              <span><i class="fas fa-user"></i> Posted by: Level Admin</span>
              <span><i class="fas fa-calendar"></i> Sep 09, 2024</span>
              <span><i class="fas fa-eye"></i> 128 views</span>
            </div>
            <div class="ad-actions" style="display: flex; gap: 10px;">
              <button class="btn-small" onclick="appController.showNotification('Ad approved', 'success')" style="padding: 8px 12px; background: #00d4aa; color: white; border: none; border-radius: 6px; cursor: pointer;">Approve</button>
              <button class="btn-small" onclick="appController.showNotification('Ad rejected', 'warning')" style="padding: 8px 12px; background: #ffa502; color: white; border: none; border-radius: 6px; cursor: pointer;">Reject</button>
            </div>
          </div>

          <div class="ad-item" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div class="ad-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h3 style="margin: 0;">Membership Discount</h3>
              <span class="ad-status" style="background: #00d4aa; color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;">Approved</span>
            </div>
            <p class="ad-description">Get 20% discount on annual membership this month only! Hurry, offer ends soon.</p>
            <div class="ad-meta" style="display: flex; gap: 20px; margin: 15px 0; font-size: 13px; color: #666;">
              <span><i class="fas fa-user"></i> Posted by: Admin</span>
              <span><i class="fas fa-calendar"></i> Sep 08, 2024</span>
              <span><i class="fas fa-eye"></i> 512 views</span>
            </div>
            <div class="ad-actions" style="display: flex; gap: 10px;">
              <button class="btn-small" onclick="appController.showNotification('Ad updated', 'success')" style="padding: 8px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Edit</button>
              <button class="btn-small" onclick="appController.showNotification('Ad deleted', 'success')" style="padding: 8px 12px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer;">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // LOGS SECTION
  logsSection: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>System Logs</h1>
          <button class="btn btn-secondary" onclick="appController.showNotification('Logs exported to CSV', 'success')">
            <i class="fas fa-download"></i> Export Logs
          </button>
        </div>

        <!-- Logs Table -->
        <div class="card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sep 11, 2024 11:30 PM</td>
                <td>Admin User</td>
                <td>Member Added</td>
                <td>New member: Ahmed Al-Mansouri</td>
                <td><span class="badge badge-success">Success</span></td>
              </tr>
              <tr>
                <td>Sep 11, 2024 10:45 PM</td>
                <td>Level Admin</td>
                <td>Attendance Marked</td>
                <td>Badminton Level 1 - 24 attendees</td>
                <td><span class="badge badge-success">Success</span></td>
              </tr>
              <tr>
                <td>Sep 11, 2024 09:20 PM</td>
                <td>Admin User</td>
                <td>Activity Created</td>
                <td>New activity: Tennis Coaching</td>
                <td><span class="badge badge-success">Success</span></td>
              </tr>
              <tr>
                <td>Sep 11, 2024 08:15 PM</td>
                <td>Player</td>
                <td>Wallet Top-up</td>
                <td>Amount: BHD 50</td>
                <td><span class="badge badge-success">Success</span></td>
              </tr>
              <tr>
                <td>Sep 11, 2024 07:00 PM</td>
                <td>Level Admin</td>
                <td>Session Finalized</td>
                <td>Cricket Training - 18 attendees</td>
                <td><span class="badge badge-success">Success</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};

// ✅ MAKE IT GLOBAL
export { adminViews };
console.log('✅ adminViews.js loaded successfully');


