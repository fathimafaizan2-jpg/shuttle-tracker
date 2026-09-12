
const flightAdminViews = {
  
  dashboard: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Level Admin Dashboard</h1>
        <p>Manage your flight sessions, attendance, and finances</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><i class="fas fa-users"></i></div>
          <div class="stat-content"><h3>245</h3><p>Active Members</p><span class="stat-change">In your flight</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-content"><h3>32</h3><p>Sessions This Month</p><span class="stat-change">All completed</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"><i class="fas fa-check-circle"></i></div>
          <div class="stat-content"><h3>98%</h3><p>Attendance Rate</p><span class="stat-change">Excellent performance</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);"><i class="fas fa-badminton"></i></div>
          <div class="stat-content"><h3>450</h3><p>Shuttles in Stock</p><span class="stat-change">Good inventory</span></div>
        </div>
      </div>
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="action-buttons" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
          <button class="action-btn" onclick="appController.navigate('attendance')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;"><i class="fas fa-check-circle" style="font-size: 24px; color: #00d4aa; display: block; margin-bottom: 8px;"></i><span>Mark Attendance</span></button>
          <button class="action-btn" onclick="appController.navigate('sessionControl')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;"><i class="fas fa-sliders-h" style="font-size: 24px; color: #667eea; display: block; margin-bottom: 8px;"></i><span>Session Control</span></button>
          <button class="action-btn" onclick="appController.navigate('shuttle')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;"><i class="fas fa-badminton" style="font-size: 24px; color: #ffa502; display: block; margin-bottom: 8px;"></i><span>Shuttle Stock</span></button>
          <button class="action-btn" onclick="appController.navigate('reports')" style="background: white; border: 1px solid #e0e6ed; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;"><i class="fas fa-chart-bar" style="font-size: 24px; color: #f5576c; display: block; margin-bottom: 8px;"></i><span>View Reports</span></button>
        </div>
      </div>
      <div class="card">
        <h2>Recent Sessions</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Date</th>
              <th style="padding: 12px; text-align: left;">Activity</th>
              <th style="padding: 12px; text-align: left;">Present/Total</th>
              <th style="padding: 12px; text-align: left;">Charge/Player</th>
              <th style="padding: 12px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 12, 2024</td>
              <td style="padding: 12px;">Badminton Level 1</td>
              <td style="padding: 12px;">24/30</td>
              <td style="padding: 12px;">BHD 5.50</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Completed</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 10, 2024</td>
              <td style="padding: 12px;">Badminton Level 1</td>
              <td style="padding: 12px;">26/30</td>
              <td style="padding: 12px;">BHD 5.20</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Completed</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 08, 2024</td>
              <td style="padding: 12px;">Badminton Level 1</td>
              <td style="padding: 12px;">28/30</td>
              <td style="padding: 12px;">BHD 4.80</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  attendanceSection: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Mark Attendance</h1>
        <p>Record attendance for today's session</p>
      </div>
      <div class="card">
        <h2>Select Session</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
          <select style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
            <option>Badminton Level 1</option>
            <option>Badminton Level 2</option>
            <option>Badminton Level 3</option>
          </select>
          <input type="date" style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
          <button class="btn btn-primary" onclick="appController.showNotification('Session loaded', 'success')" style="padding: 12px 15px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-search"></i> Load Session</button>
        </div>
      </div>
      <div class="card">
        <h2>Members Attendance (30 Total)</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Member Name</th>
              <th style="padding: 12px; text-align: left;">Email</th>
              <th style="padding: 12px; text-align: left;">Phone</th>
              <th style="padding: 12px; text-align: left;">Status</th>
              <th style="padding: 12px; text-align: left;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Ahmed Al-Mansouri</td>
              <td style="padding: 12px;">ahmed@example.com</td>
              <td style="padding: 12px;">+973 1234 5680</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Present</span></td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Marked as absent', 'warning')" style="padding: 6px 10px; background: #ffa502; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Mark Absent</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Fatima Al-Dosari</td>
              <td style="padding: 12px;">fatima@example.com</td>
              <td style="padding: 12px;">+973 3344 5566</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Present</span></td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Marked as absent', 'warning')" style="padding: 6px 10px; background: #ffa502; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Mark Absent</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Mohammed Al-Khalifa</td>
              <td style="padding: 12px;">mohammed@example.com</td>
              <td style="padding: 12px;">+973 5566 7788</td>
              <td style="padding: 12px;"><span style="background: #ff4757; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Absent</span></td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Marked as present', 'success')" style="padding: 6px 10px; background: #00d4aa; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Mark Present</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Noor Al-Ansari</td>
              <td style="padding: 12px;">noor@example.com</td>
              <td style="padding: 12px;">+973 7788 9900</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Present</span></td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Marked as absent', 'warning')" style="padding: 6px 10px; background: #ffa502; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Mark Absent</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sara Al-Sulaiti</td>
              <td style="padding: 12px;">sara@example.com</td>
              <td style="padding: 12px;">+973 9900 1122</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Present</span></td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Marked as absent', 'warning')" style="padding: 6px 10px; background: #ffa502; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Mark Absent</button></td>
            </tr>
          </tbody>
        </table>
        <button class="btn btn-primary" onclick="appController.showNotification('Attendance saved successfully!', 'success')" style="margin-top: 15px; padding: 12px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-save"></i> Save Attendance</button>
      </div>
    </div>
  `,

  sessionControlSection: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Session Control & Finalization</h1>
        <p>Finalize attendance and calculate charges</p>
      </div>
      <div class="card">
        <h2>Pending Sessions</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Date</th>
              <th style="padding: 12px; text-align: left;">Activity</th>
              <th style="padding: 12px; text-align: left;">Present</th>
              <th style="padding: 12px; text-align: left;">Shuttles Used</th>
              <th style="padding: 12px; text-align: left;">Tube Price</th>
              <th style="padding: 12px; text-align: left;">Charge/Player</th>
              <th style="padding: 12px; text-align: left;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 12, 2024</td>
              <td style="padding: 12px;">Badminton Level 1</td>
              <td style="padding: 12px;">24</td>
              <td style="padding: 12px;"><input type="number" value="20" style="width: 60px; padding: 6px; border: 1px solid #e0e6ed; border-radius: 4px;"></td>
              <td style="padding: 12px;">BHD 2.50</td>
              <td style="padding: 12px;"><strong>BHD 5.50</strong></td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Session finalized', 'success')" style="padding: 6px 10px; background: #00d4aa; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Finalize</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 10, 2024</td>
              <td style="padding: 12px;">Badminton Level 1</td>
              <td style="padding: 12px;">26</td>
              <td style="padding: 12px;"><input type="number" value="18" style="width: 60px; padding: 6px; border: 1px solid #e0e6ed; border-radius: 4px;"></td>
              <td style="padding: 12px;">BHD 2.50</td>
              <td style="padding: 12px;"><strong>BHD 5.20</strong></td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Session finalized', 'success')" style="padding: 6px 10px; background: #00d4aa; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Finalize</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <h2>Completed Sessions</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Date</th>
              <th style="padding: 12px; text-align: left;">Activity</th>
              <th style="padding: 12px; text-align: left;">Present</th>
              <th style="padding: 12px; text-align: left;">Charge/Player</th>
              <th style="padding: 12px; text-align: left;">Total Revenue</th>
              <th style="padding: 12px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 08, 2024</td>
              <td style="padding: 12px;">Badminton Level 1</td>
              <td style="padding: 12px;">28</td>
              <td style="padding: 12px;">BHD 4.80</td>
              <td style="padding: 12px;">BHD 134.40</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Completed</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 06, 2024</td>
              <td style="padding: 12px;">Badminton Level 1</td>
              <td style="padding: 12px;">25</td>
              <td style="padding: 12px;">BHD 5.00</td>
              <td style="padding: 12px;">BHD 125.00</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  shuttleSection: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Shuttle Stock Management</h1>
        <p>Track and manage shuttle inventory</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><i class="fas fa-badminton"></i></div>
          <div class="stat-content"><h3>450</h3><p>Total Shuttles</p><span class="stat-change">In stock</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"><i class="fas fa-minus-circle"></i></div>
          <div class="stat-content"><h3>120</h3><p>Used This Month</p><span class="stat-change">Replacement needed</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"><i class="fas fa-plus-circle"></i></div>
          <div class="stat-content"><h3>200</h3><p>On Order</p><span class="stat-change">Arriving soon</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="stat-content"><h3>BHD 2.50</h3><p>Tube Price</p><span class="stat-change">Per tube</span></div>
        </div>
      </div>
      <div class="card">
        <h2>Add Stock</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
          <input type="number" placeholder="Enter quantity" style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
          <input type="number" placeholder="2.50" value="2.50" style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
          <button class="btn btn-primary" onclick="appController.showNotification('Stock added successfully!', 'success')" style="padding: 12px 15px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-plus"></i> Add Stock</button>
        </div>
      </div>
      <div class="card">
        <h2>Stock History</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Date</th>
              <th style="padding: 12px; text-align: left;">Type</th>
              <th style="padding: 12px; text-align: left;">Quantity</th>
              <th style="padding: 12px; text-align: left;">Balance</th>
              <th style="padding: 12px; text-align: left;">Session</th>
              <th style="padding: 12px; text-align: left;">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 12, 2024</td>
              <td style="padding: 12px;"><span style="background: #ff4757; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Used</span></td>
              <td style="padding: 12px;">-20</td>
              <td style="padding: 12px;">450</td>
              <td style="padding: 12px;">Badminton Level 1</td>
              <td style="padding: 12px;">Session usage</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 10, 2024</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Added</span></td>
              <td style="padding: 12px;">+100</td>
              <td style="padding: 12px;">470</td>
              <td style="padding: 12px;">-</td>
              <td style="padding: 12px;">New stock received</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Sep 08, 2024</td>
              <td style="padding: 12px;"><span style="background: #ff4757; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Used</span></td>
              <td style="padding: 12px;">-18</td>
              <td style="padding: 12px;">370</td>
              <td style="padding: 12px;">Badminton Level 1</td>
              <td style="padding: 12px;">Session usage</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  reportsSection: () => `
    <div class="page-container">
      <div class="page-header">
        <h1>Reports & Analytics</h1>
        <p>View detailed reports and export data</p>
      </div>
      <div class="card">
        <h2>Generate Report</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
          <select style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
            <option>Paid Players</option>
            <option>Unpaid Players</option>
            <option>Attendance Summary</option>
            <option>Revenue Report</option>
          </select>
          <input type="date" style="width: 100%; padding: 12px; border: 1px solid #e0e6ed; border-radius: 8px;">
          <button class="btn btn-primary" onclick="appController.showNotification('Report generated', 'success')" style="padding: 12px 15px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-file-pdf"></i> Generate</button>
          <button class="btn btn-secondary" onclick="appController.showNotification('Report exported to CSV', 'success')" style="padding: 12px 15px; background: #00d4aa; color: white; border: none; border-radius: 6px; cursor: pointer;"><i class="fas fa-download"></i> Export CSV</button>
        </div>
      </div>
      <div class="card">
        <h2>Paid Players Report</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Member Name</th>
              <th style="padding: 12px; text-align: left;">Email</th>
              <th style="padding: 12px; text-align: left;">Sessions</th>
              <th style="padding: 12px; text-align: left;">Total Charge</th>
              <th style="padding: 12px; text-align: left;">Paid Amount</th>
              <th style="padding: 12px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Ahmed Al-Mansouri</td>
              <td style="padding: 12px;">ahmed@example.com</td>
              <td style="padding: 12px;">12</td>
              <td style="padding: 12px;">BHD 60.00</td>
              <td style="padding: 12px;">BHD 60.00</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Paid</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Fatima Al-Dosari</td>
              <td style="padding: 12px;">fatima@example.com</td>
              <td style="padding: 12px;">10</td>
              <td style="padding: 12px;">BHD 50.00</td>
              <td style="padding: 12px;">BHD 50.00</td>
              <td style="padding: 12px;"><span style="background: #00d4aa; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Paid</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <h2>Unpaid Players Report</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f7fa; border-bottom: 2px solid #e0e6ed;">
              <th style="padding: 12px; text-align: left;">Member Name</th>
              <th style="padding: 12px; text-align: left;">Email</th>
              <th style="padding: 12px; text-align: left;">Sessions</th>
              <th style="padding: 12px; text-align: left;">Total Charge</th>
              <th style="padding: 12px; text-align: left;">Outstanding</th>
              <th style="padding: 12px; text-align: left;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Mohammed Al-Khalifa</td>
              <td style="padding: 12px;">mohammed@example.com</td>
              <td style="padding: 12px;">8</td>
              <td style="padding: 12px;">BHD 40.00</td>
              <td style="padding: 12px;">BHD 40.00</td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Reminder sent', 'success')" style="padding: 6px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Send Reminder</button></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e6ed;">
              <td style="padding: 12px;">Noor Al-Ansari</td>
              <td style="padding: 12px;">noor@example.com</td>
              <td style="padding: 12px;">6</td>
              <td style="padding: 12px;">BHD 30.00</td>
              <td style="padding: 12px;">BHD 30.00</td>
              <td style="padding: 12px;"><button onclick="appController.showNotification('Reminder sent', 'success')" style="padding: 6px 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Send Reminder</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
};

window.flightAdminViews = flightAdminViews;
export { flightAdminViews };
console.log('✅ flightAdminViews.js loaded successfully');

