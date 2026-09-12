
const adminViews = {
  dashboard: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Super Admin Dashboard</h1>
        <p>Manage Members, Activities, Finance & Audit</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><i class="fas fa-users"></i></div>
          <div class="stat-content"><h3>1,245</h3><p>Total Members</p><span class="stat-change">+12% this month</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-content"><h3>156</h3><p>Sessions This Month</p><span class="stat-change">+8% from last month</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"><i class="fas fa-money-bill-wave"></i></div>
          <div class="stat-content"><h3>BHD 45,230</h3><p>Total Revenue</p><span class="stat-change">+15% this quarter</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);"><i class="fas fa-check-circle"></i></div>
          <div class="stat-content"><h3>23</h3><p>Pending Approvals</p><span class="stat-change">Action needed</span></div>
        </div>
      </div>
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="action-buttons" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
          <button class="action-btn" onclick="appController.navigate('members')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;"><i class="fas fa-user-plus" style="font-size: 24px; color: #667eea; display: block; margin-bottom: 8px;"></i><span>Manage Members</span></button>
          <button class="action-btn" onclick="appController.navigate('timetable')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;"><i class="fas fa-calendar-alt" style="font-size: 24px; color: #f5576c; display: block; margin-bottom: 8px;"></i><span>Timetable</span></button>
          <button class="action-btn" onclick="appController.navigate('advertising')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;"><i class="fas fa-megaphone" style="font-size: 24px; color: #00d4aa; display: block; margin-bottom: 8px;"></i><span>Advertising</span></button>
          <button class="action-btn" onclick="appController.navigate('finance')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;"><i class="fas fa-money-bill" style="font-size: 24px; color: #ffa502; display: block; margin-bottom: 8px;"></i><span>Finance</span></button>
          <button class="action-btn" onclick="appController.navigate('audit')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;"><i class="fas fa-history" style="font-size: 24px; color: #667eea; display: block; margin-bottom: 8px;"></i><span>Audit Logs</span></button>
        </div>
      </div>
      <div class="card">
        <h2>Recent Activities</h2>
        <div class="activity-list">
          <div class="activity-item" style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #e0e6ed;">
            <div class="activity-icon" style="background: #e94560; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"><i class="fas fa-user-check"></i></div>
            <div class="activity-content" style="flex: 1;">
              <h4 style="margin: 0 0 5px 0;">New Member Registered</h4>
              <p style="margin: 0 0 5px 0; color: #666;">Ahmed Al-Mansouri joined the club</p>
              <span class="activity-time" style="font-size: 12px; color: #999;">2 hours ago</span>
            </div>
          </div>
          <div class="activity-item" style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #e0e6ed;">
            <div class="activity-icon" style="background: #00d4aa; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"><i class="fas fa-calendar-check"></i></div>
            <div class="activity-content" style="flex: 1;">
              <h4 style="margin: 0 0 5px 0;">Session Completed</h4>
              <p style="margin: 0 0 5px 0; color: #666;">Badminton Level 2 - 24 attendees</p>
              <span class="activity-time" style="font-size: 12px; color: #999;">4 hours ago</span>
            </div>
          </div>
          <div class="activity-item" style="display: flex; gap: 15px; padding: 15px 0;">
            <div class="activity-icon" style="background: #ffa502; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;"><i class="fas fa-money-bill"></i></div>
            <div class="activity-content" style="flex: 1;">
              <h4 style="margin: 0 0 5px 0;">Payment Received</h4>
              <p style="margin: 0 0 5px 0; color: #666;">BHD 150 from wallet top-up</p>
              <span class="activity-time" style="font-size: 12px; color: #999;">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  membersSection: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Members Management</h1>
        <div class="header-actions" style="display: flex; gap: 10px;">
          <button class="btn btn-primary" onclick="appController.showNotification('Add Member modal opening...', 'info')" style="padding: 10px 15px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-user-plus"></i> Add Member</button>
          <button class="btn btn-secondary" onclick="appController.showNotification('Pre-register modal opening...', 'info')" style="padding: 10px 15px; background: #00d4aa; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-file-import"></i> Pre-Register</button>
          <button class="btn btn-info" onclick="appController.showNotification('Members exported to CSV', 'success')" style="padding: 10px 15px; background: #0099ff; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-download"></i> Export</button>
        </div>
      </div>
      <div class="card">
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Name</th>
              <th style="padding: 12px; text-align: left;">Email</th>
              <th style="padding: 12px; text-align: left;">Phone</th>
              <th style="padding: 12px; text-align: left;">Role</th>
              <th style="padding: 12px; text-align: left;">Flight</th>
              <th style="padding: 12px; text-align: left;">Status</th>
              <th style="padding: 12px; text-align: left;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;"><strong>Ahmed Al-Mansouri</strong></td>
              <td style="padding: 12px;">ahmed@example.com</td>
              <td style="padding: 12px;">+973 1234 5680</td>
              <td style="padding: 12px;"><span class="badge badge-info" style="background: #0099ff; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Flight Admin</span></td>
              <td style="padding: 12px;">Badminton A</td>
              <td style="padding: 12px;"><span class="badge badge-success" style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Active</span></td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Edit member', 'info')" style="padding: 6px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Edit</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;"><strong>Fatima Al-Dosari</strong></td>
              <td style="padding: 12px;">fatima@example.com</td>
              <td style="padding: 12px;">+973 3344 5566</td>
              <td style="padding: 12px;"><span class="badge badge-success" style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Player</span></td>
              <td style="padding: 12px;">Badminton A</td>
              <td style="padding: 12px;"><span class="badge badge-success" style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Active</span></td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Member promoted', 'success')" style="padding: 6px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Promote</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;"><strong>Mohammed Al-Khalifa</strong></td>
              <td style="padding: 12px;">mohammed@example.com</td>
              <td style="padding: 12px;">+973 5566 7788</td>
              <td style="padding: 12px;"><span class="badge badge-success" style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Player</span></td>
              <td style="padding: 12px;">Cricket B</td>
              <td style="padding: 12px;"><span class="badge badge-danger" style="background: #ff4757; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Inactive</span></td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Member activated', 'success')" style="padding: 6px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Activate</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  timetableSection: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Timetable Master</h1>
        <div class="header-actions" style="display: flex; gap: 10px;">
          <button class="btn btn-primary" onclick="appController.showNotification('Create Activity modal opening...', 'info')" style="padding: 10px 15px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-plus"></i> Create Activity</button>
          <button class="btn btn-secondary" onclick="appController.showNotification('Bulk import modal opening...', 'info')" style="padding: 10px 15px; background: #00d4aa; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-upload"></i> Bulk Import</button>
          <button class="btn btn-info" onclick="appController.showNotification('Monthly sessions published', 'success')" style="padding: 10px 15px; background: #0099ff; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-calendar-check"></i> Publish</button>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; border-radius: 8px; color: white; margin-bottom: 15px;">
            <h3 style="margin: 0; color: white;">Badminton Level 1</h3>
            <span style="background: rgba(255,255,255,0.3); padding: 4px 10px; border-radius: 4px; font-size: 12px;">Flight A</span>
          </div>
          <p><i class="fas fa-calendar"></i> Monday & Wednesday</p>
          <p><i class="fas fa-clock"></i> 6:00 PM - 7:30 PM</p>
          <p><i class="fas fa-users"></i> 30 Capacity</p>
          <p><i class="fas fa-user-tie"></i> Coach: Ali Ahmed</p>
          <p><i class="fas fa-map-marker"></i> Court A</p>
          <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button onclick="appController.showNotification('Activity updated', 'success')" style="padding: 8px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; flex: 1;">Edit</button>
            <button onclick="appController.showNotification('Activity deleted', 'success')" style="padding: 8px 12px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer; flex: 1;">Delete</button>
          </div>
        </div>
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 15px; border-radius: 8px; color: white; margin-bottom: 15px;">
            <h3 style="margin: 0; color: white;">Cricket Training</h3>
            <span style="background: rgba(255,255,255,0.3); padding: 4px 10px; border-radius: 4px; font-size: 12px;">Flight B</span>
          </div>
          <p><i class="fas fa-calendar"></i> Tuesday & Thursday</p>
          <p><i class="fas fa-clock"></i> 7:00 PM - 8:30 PM</p>
          <p><i class="fas fa-users"></i> 20 Capacity</p>
          <p><i class="fas fa-user-tie"></i> Coach: Hassan Khan</p>
          <p><i class="fas fa-map-marker"></i> Ground B</p>
          <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button onclick="appController.showNotification('Activity updated', 'success')" style="padding: 8px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; flex: 1;">Edit</button>
            <button onclick="appController.showNotification('Activity deleted', 'success')" style="padding: 8px 12px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer; flex: 1;">Delete</button>
          </div>
        </div>
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 15px; border-radius: 8px; color: white; margin-bottom: 15px;">
            <h3 style="margin: 0; color: white;">Tennis Coaching</h3>
            <span style="background: rgba(255,255,255,0.3); padding: 4px 10px; border-radius: 4px; font-size: 12px;">Flight C</span>
          </div>
          <p><i class="fas fa-calendar"></i> Saturday & Sunday</p>
          <p><i class="fas fa-clock"></i> 5:00 PM - 6:30 PM</p>
          <p><i class="fas fa-users"></i> 15 Capacity</p>
          <p><i class="fas fa-user-tie"></i> Coach: Fatima Al-Dosari</p>
          <p><i class="fas fa-map-marker"></i> Court C</p>
          <div style="margin-top: 15px; display: flex; gap: 10px;">
            <button onclick="appController.showNotification('Activity updated', 'success')" style="padding: 8px 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; flex: 1;">Edit</button>
            <button onclick="appController.showNotification('Activity deleted', 'success')" style="padding: 8px 12px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer; flex: 1;">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,

  advertisingSection: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Advertising & BaZaar</h1>
        <div class="header-actions" style="display: flex; gap: 10px;">
          <button class="btn btn-primary" onclick="appController.showNotification('Post Advertisement modal opening...', 'info')" style="padding: 10px 15px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-megaphone"></i> Post Ad</button>
          <button class="btn btn-secondary" onclick="appController.showNotification('Official notice modal opening...', 'info')" style="padding: 10px 15px; background: #00d4aa; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-bullhorn"></i> Official Notice</button>
        </div>
      </div>
      <div class="card">
        <h2>Featured Carousel (Max 10)</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
          <div style="background: #f5f7fa; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="background: #e0e6ed; height: 120px; border-radius: 6px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="font-size: 40px; color: #999;"></i></div>
            <p style="margin: 0 0 8px 0; font-weight: 600;">New Coaching Program</p>
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">Sep 10 - Sep 20</p>
            <button onclick="appController.showNotification('Ad removed from carousel', 'success')" style="padding: 6px 10px; background: #ff4757; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Remove</button>
          </div>
          <div style="background: #f5f7fa; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="background: #e0e6ed; height: 120px; border-radius: 6px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="font-size: 40px; color: #999;"></i></div>
            <p style="margin: 0 0 8px 0; font-weight: 600;">Equipment Sale</p>
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">Sep 12 - Sep 25</p>
            <button onclick="appController.showNotification('Ad removed from carousel', 'success')" style="padding: 6px 10px; background: #ff4757; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Remove</button>
          </div>
          <div style="background: #f5f7fa; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="background: #e0e6ed; height: 120px; border-radius: 6px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-plus" style="font-size: 40px; color: #999;"></i></div>
            <p style="margin: 0 0 8px 0; font-weight: 600;">Add New Ad</p>
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">Slots available: 8</p>
            <button onclick="appController.showNotification('Add ad modal opening...', 'info')" style="padding: 6px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Add</button>
          </div>
        </div>
      </div>
      <div class="card">
        <h2>Pending Business Submissions (23)</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Business Name</th>
              <th style="padding: 12px; text-align: left;">Owner</th>
              <th style="padding: 12px; text-align: left;">Category</th>
              <th style="padding: 12px; text-align: left;">Status</th>
              <th style="padding: 12px; text-align: left;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;"><strong>Premium Sports Gear</strong></td>
              <td style="padding: 12px;">Khalid Al-Sulaiti</td>
              <td style="padding: 12px;">Sports Equipment</td>
              <td style="padding: 12px;"><span style="background: #ffa502; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Pending</span></td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Business approved', 'success')" style="padding: 6px 10px; background: #00d4aa; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Approve</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;"><strong>Nutrition & Wellness</strong></td>
              <td style="padding: 12px;">Sara Al-Dosari</td>
              <td style="padding: 12px;">Health & Fitness</td>
              <td style="padding: 12px;"><span style="background: #ffa502; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Pending</span></td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Business approved', 'success')" style="padding: 6px 10px; background: #00d4aa; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Approve</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  financeSection: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Finance Management</h1>
        <div class="header-actions" style="display: flex; gap: 10px;">
          <button class="btn btn-primary" onclick="appController.showNotification('Add wallet credit modal opening...', 'info')" style="padding: 10px 15px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-plus"></i> Add Wallet Credit</button>
          <button class="btn btn-secondary" onclick="appController.showNotification('Finance report exported', 'success')" style="padding: 10px 15px; background: #00d4aa; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-download"></i> Export Report</button>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><i class="fas fa-wallet"></i></div>
          <div class="stat-content"><h3>BHD 125,450</h3><p>Total Wallet Credits</p><span class="stat-change">Active credits</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"><i class="fas fa-money-bill-wave"></i></div>
          <div class="stat-content"><h3>BHD 45,230</h3><p>Pending Payments</p><span class="stat-change">From 234 players</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"><i class="fas fa-check-circle"></i></div>
          <div class="stat-content"><h3>BHD 89,560</h3><p>Paid Payments</p><span class="stat-change">From 567 players</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);"><i class="fas fa-chart-line"></i></div>
          <div class="stat-content"><h3>BHD 12,340</h3><p>This Month Revenue</p><span class="stat-change">+8% from last month</span></div>
        </div>
      </div>
      <div class="card">
        <h2>Wallet Credits by Flight</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Flight</th>
              <th style="padding: 12px; text-align: left;">Total Credits</th>
              <th style="padding: 12px; text-align: left;">Used</th>
              <th style="padding: 12px; text-align: left;">Available</th>
              <th style="padding: 12px; text-align: left;">Players</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;"><strong>Badminton A</strong></td>
              <td style="padding: 12px;">BHD 45,230</td>
              <td style="padding: 12px;">BHD 23,450</td>
              <td style="padding: 12px;">BHD 21,780</td>
              <td style="padding: 12px;">245</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;"><strong>Cricket B</strong></td>
              <td style="padding: 12px;">BHD 32,150</td>
              <td style="padding: 12px;">BHD 15,670</td>
              <td style="padding: 12px;">BHD 16,480</td>
              <td style="padding: 12px;">156</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;"><strong>Tennis C</strong></td>
              <td style="padding: 12px;">BHD 28,070</td>
              <td style="padding: 12px;">BHD 12,340</td>
              <td style="padding: 12px;">BHD 15,730</td>
              <td style="padding: 12px;">98</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  auditSection: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Audit Logs</h1>
        <p>Complete activity history and audit trail</p>
      </div>
      <div class="card">
        <h2>Filter Logs</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
          <select style="width: 100%; padding: 10px; border: 1px solid #e0e6ed; border-radius: 8px;">
            <option>All Types</option>
            <option>Member Actions</option>
            <option>Attendance</option>
            <option>Wallet/Payment</option>
            <option>Session Control</option>
            <option>Shuttle Stock</option>
          </select>
          <select style="width: 100%; padding: 10px; border: 1px solid #e0e6ed; border-radius: 8px;">
            <option>All Flights</option>
            <option>Badminton A</option>
            <option>Cricket B</option>
            <option>Tennis C</option>
          </select>
          <input type="date" style="width: 100%; padding: 10px; border: 1px solid #e0e6ed; border-radius: 8px;">
          <button class="btn btn-primary" onclick="appController.showNotification('Logs filtered', 'success')" style="padding: 10px 15px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-filter"></i> Filter</button>
        </div>
      </div>
      <div class="card">
        <h2>Activity Logs</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Timestamp</th>
              <th style="padding: 12px; text-align: left;">Type</th>
              <th style="padding: 12px; text-align: left;">User</th>
              <th style="padding: 12px; text-align: left;">Flight</th>
              <th style="padding: 12px; text-align: left;">Action</th>
              <th style="padding: 12px; text-align: left;">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 12, 2024 6:30 PM</td>
              <td style="padding: 12px;"><span style="background: #0099ff; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Member</span></td>
              <td style="padding: 12px;">Admin User</td>
              <td style="padding: 12px;">Badminton A</td>
              <td style="padding: 12px;">Member Added</td>
              <td style="padding: 12px;">New member: Ahmed Al-Mansouri</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 12, 2024 5:45 PM</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Attendance</span></td>
              <td style="padding: 12px;">Flight Admin</td>
              <td style="padding: 12px;">Badminton A</td>
              <td style="padding: 12px;">Attendance Finalized</td>
              <td style="padding: 12px;">24 present, 6 absent</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 12, 2024 4:20 PM</td>
              <td style="padding: 12px;"><span style="background: #ffa502; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Payment</span></td>
              <td style="padding: 12px;">Player</td>
              <td style="padding: 12px;">Cricket B</td>
              <td style="padding: 12px;">Payment Received</td>
              <td style="padding: 12px;">BHD 50 wallet credit</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
};

export { adminViews };
console.log('✅ adminViews.js loaded successfully');
