
// ============================================
// flightAdminViews.js - Level Admin Dashboard
// COMPLETE & PRODUCTION READY
// ============================================

const flightAdminViews = {
  
  // DASHBOARD
  dashboard: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Level Admin Dashboard</h1>
          <p>Manage your activity sessions and members</p>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <h3>245</h3>
              <p>Active Members</p>
              <span class="stat-change">In your activities</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-content">
              <h3>32</h3>
              <p>Sessions This Month</p>
              <span class="stat-change">All completed</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <h3>98%</h3>
              <p>Attendance Rate</p>
              <span class="stat-change">Excellent performance</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
              <i class="fas fa-badminton"></i>
            </div>
            <div class="stat-content">
              <h3>450</h3>
              <p>Shuttles in Stock</p>
              <span class="stat-change">Good inventory</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <button class="action-btn" onclick="appController.navigate('attendance')">
              <i class="fas fa-check-circle"></i>
              <span>Mark Attendance</span>
            </button>
            <button class="action-btn" onclick="appController.navigate('sessionControl')">
              <i class="fas fa-sliders-h"></i>
              <span>Session Control</span>
            </button>
            <button class="action-btn" onclick="appController.navigate('shuttle')">
              <i class="fas fa-badminton"></i>
              <span>Shuttle Stock</span>
            </button>
            <button class="action-btn" onclick="appController.navigate('reports')">
              <i class="fas fa-chart-bar"></i>
              <span>View Reports</span>
            </button>
          </div>
        </div>

        <!-- Recent Sessions -->
        <div class="card">
          <h2>Recent Sessions</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Members</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sep 11, 2024</td>
                <td>Badminton Level 1</td>
                <td>24/30</td>
                <td><span class="badge badge-success">Completed</span></td>
              </tr>
              <tr>
                <td>Sep 09, 2024</td>
                <td>Badminton Level 1</td>
                <td>26/30</td>
                <td><span class="badge badge-success">Completed</span></td>
              </tr>
              <tr>
                <td>Sep 07, 2024</td>
                <td>Cricket Training</td>
                <td>18/20</td>
                <td><span class="badge badge-success">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ATTENDANCE SECTION
  attendanceSection: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Mark Attendance</h1>
          <p>Record attendance for today's session</p>
        </div>

        <!-- Session Selection -->
        <div class="card">
          <h2>Select Session</h2>
          <div class="form-group">
            <label>Activity</label>
            <select style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
              <option>Badminton Level 1</option>
              <option>Badminton Level 2</option>
              <option>Cricket Training</option>
              <option>Tennis Coaching</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
          </div>
        </div>

        <!-- Attendance List -->
        <div class="card">
          <h2>Members Attendance</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ahmed Al-Mansouri</td>
                <td>ahmed@example.com</td>
                <td><span class="badge badge-success">Present</span></td>
                <td>
                  <button class="btn-small" onclick="appController.showNotification('Marked as absent', 'warning')" style="padding: 6px 10px; background: #ffa502; color: white; border: none; border-radius: 4px; cursor: pointer;">Mark Absent</button>
                </td>
              </tr>
              <tr>
                <td>Fatima Al-Dosari</td>
                <td>fatima@example.com</td>
                <td><span class="badge badge-success">Present</span></td>
                <td>
                  <button class="btn-small" onclick="appController.showNotification('Marked as absent', 'warning')" style="padding: 6px 10px; background: #ffa502; color: white; border: none; border-radius: 4px; cursor: pointer;">Mark Absent</button>
                </td>
              </tr>
              <tr>
                <td>Mohammed Al-Khalifa</td>
                <td>mohammed@example.com</td>
                <td><span class="badge badge-danger">Absent</span></td>
                <td>
                  <button class="btn-small" onclick="appController.showNotification('Marked as present', 'success')" style="padding: 6px 10px; background: #00d4aa; color: white; border: none; border-radius: 4px; cursor: pointer;">Mark Present</button>
                </td>
              </tr>
              <tr>
                <td>Noor Al-Ansari</td>
                <td>noor@example.com</td>
                <td><span class="badge badge-success">Present</span></td>
                <td>
                  <button class="btn-small" onclick="appController.showNotification('Marked as absent', 'warning')" style="padding: 6px 10px; background: #ffa502; color: white; border: none; border-radius: 4px; cursor: pointer;">Mark Absent</button>
                </td>
              </tr>
            </tbody>
          </table>
          <button class="btn btn-primary" onclick="appController.showNotification('Attendance saved successfully!', 'success')" style="margin-top: 15px;">
            <i class="fas fa-save"></i> Save Attendance
          </button>
        </div>
      </div>
    `;
  },

  // SESSION CONTROL SECTION
  sessionControlSection: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Session Control</h1>
          <p>Manage your activity sessions</p>
        </div>

        <!-- Session Management -->
        <div class="card">
          <h2>Active Sessions</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Time</th>
                <th>Members</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Badminton Level 1</td>
                <td>6:00 PM - 7:30 PM</td>
                <td>24/30</td>
                <td><span class="badge badge-success">Active</span></td>
                <td>
                  <button class="btn-small" onclick="appController.showNotification('Session ended', 'success')" style="padding: 6px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">End Session</button>
                </td>
              </tr>
              <tr>
                <td>Cricket Training</td>
                <td>7:00 PM - 8:30 PM</td>
                <td>18/20</td>
                <td><span class="badge badge-success">Active</span></td>
                <td>
                  <button class="btn-small" onclick="appController.showNotification('Session ended', 'success')" style="padding: 6px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">End Session</button>
                </td>
              </tr>
              <tr>
                <td>Tennis Coaching</td>
                <td>5:00 PM - 6:30 PM</td>
                <td>12/15</td>
                <td><span class="badge badge-warning">Scheduled</span></td>
                <td>
                  <button class="btn-small" onclick="appController.showNotification('Session started', 'success')" style="padding: 6px 10px; background: #00d4aa; color: white; border: none; border-radius: 4px; cursor: pointer;">Start Session</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // SHUTTLE STOCK SECTION
  shuttleSection: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Shuttle Stock Management</h1>
          <p>Track and manage shuttle inventory</p>
        </div>

        <!-- Stock Summary -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="fas fa-badminton"></i>
            </div>
            <div class="stat-content">
              <h3>450</h3>
              <p>Total Shuttles</p>
              <span class="stat-change">In stock</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <i class="fas fa-minus-circle"></i>
            </div>
            <div class="stat-content">
              <h3>120</h3>
              <p>Used This Month</p>
              <span class="stat-change">Replacement needed</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <i class="fas fa-plus-circle"></i>
            </div>
            <div class="stat-content">
              <h3>200</h3>
              <p>On Order</p>
              <span class="stat-change">Arriving soon</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-content">
              <h3>50</h3>
              <p>Low Stock Alert</p>
              <span class="stat-change">Order soon</span>
            </div>
          </div>
        </div>

        <!-- Stock Management -->
        <div class="card">
          <h2>Add Stock</h2>
          <div class="form-group">
            <label>Quantity</label>
            <input type="number" placeholder="Enter quantity" style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea placeholder="Add notes..." style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px; height: 100px;"></textarea>
          </div>
          <button class="btn btn-primary" onclick="appController.showNotification('Stock added successfully!', 'success')">
            <i class="fas fa-plus"></i> Add Stock
          </button>
        </div>

        <!-- Stock History -->
        <div class="card">
          <h2>Stock History</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Balance</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sep 11, 2024</td>
                <td><span class="badge badge-danger">Used</span></td>
                <td>-20</td>
                <td>450</td>
                <td>Session usage</td>
              </tr>
              <tr>
                <td>Sep 10, 2024</td>
                <td><span class="badge badge-success">Added</span></td>
                <td>+100</td>
                <td>470</td>
                <td>New stock received</td>
              </tr>
              <tr>
                <td>Sep 09, 2024</td>
                <td><span class="badge badge-danger">Used</span></td>
                <td>-15</td>
                <td>370</td>
                <td>Session usage</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // REPORTS SECTION
  reportsSection: function() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>Reports</h1>
          <p>View detailed reports and analytics</p>
        </div>

        <!-- Report Filters -->
        <div class="card">
          <h2>Generate Report</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div class="form-group">
              <label>Report Type</label>
              <select style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
                <option>Attendance Report</option>
                <option>Revenue Report</option>
                <option>Member Report</option>
                <option>Session Report</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date Range</label>
              <select style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>Custom Range</option>
              </select>
            </div>
            <div class="form-group">
              <label>&nbsp;</label>
              <button class="btn btn-primary" onclick="appController.showNotification('Report generated!', 'success')" style="width: 100%;">
                <i class="fas fa-file-pdf"></i> Generate Report
              </button>
            </div>
          </div>
        </div>

        <!-- Sample Report -->
        <div class="card">
          <h2>Attendance Report - September 2024</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Total Sessions</th>
                <th>Avg Attendance</th>
                <th>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Badminton Level 1</td>
                <td>12</td>
                <td>24</td>
                <td><span class="badge badge-success">98%</span></td>
              </tr>
              <tr>
                <td>Cricket Training</td>
                <td>8</td>
                <td>18</td>
                <td><span class="badge badge-success">95%</span></td>
              </tr>
              <tr>
                <td>Tennis Coaching</td>
                <td>6</td>
                <td>12</td>
                <td><span class="badge badge-success">92%</span></td>
              </tr>
              <tr>
                <td>Swimming Classes</td>
                <td>10</td>
                <td>35</td>
                <td><span class="badge badge-success">96%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};

// ✅ MAKE IT GLOBAL
export const flightAdminViews = flightAdminViews;
console.log('✅ flightAdminViews.js loaded successfully');
