
// ============================================
// adminViews.js - SUPER ADMIN DASHBOARD
// ============================================

export const adminViews = {
  // ===== HOME PAGE =====
  home: function() {
    return `
      <div class="page-header">
        <h1>🏆 Super Admin Dashboard</h1>
        <p>Complete club management and oversight</p>
      </div>

      <div class="level-selector">
        <label>Select Flight Level:</label>
        <select id="adminLevelFilter" onchange="window.filterByLevel()">
          <option value="">All Levels</option>
          <option value="premier">Premier</option>
          <option value="flight1">Flight 1</option>
          <option value="flight2">Flight 2</option>
          <option value="flight3">Flight 3</option>
          <option value="flight4">Flight 4</option>
          <option value="flight4a">Flight 4A</option>
          <option value="flight4b">Flight 4B</option>
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">👥</div>
          <div class="stat-content">
            <h3>156</h3>
            <p>Total Members</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">⚽</div>
          <div class="stat-content">
            <h3>3</h3>
            <p>Active Sports</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">👨‍💼</div>
          <div class="stat-content">
            <h3>7</h3>
            <p>Flight Admins</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">💰</div>
          <div class="stat-content">
            <h3>156,000 BHD</h3>
            <p>Total Club Wallet</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>📋 Quick Actions</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
          <button class="btn btn-primary" onclick="window.navigateTo('overview')">Club Overview</button>
          <button class="btn btn-primary" onclick="window.navigateTo('flights')">Activities & Flights</button>
          <button class="btn btn-primary" onclick="window.navigateTo('master')">Master Timetable</button>
          <button class="btn btn-primary" onclick="window.navigateTo('admin-finance')">Finance</button>
          <button class="btn btn-primary" onclick="window.navigateTo('ads')">Ads & Notices</button>
          <button class="btn btn-primary" onclick="window.navigateTo('audit')">Audit Log</button>
        </div>
      </div>

      <div class="card">
        <h2>📊 Club Performance</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>This Month</th>
              <th>Last Month</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>New Members</td>
              <td>12</td>
              <td>8</td>
              <td><span class="badge badge-success">+50%</span></td>
            </tr>
            <tr>
              <td>Revenue</td>
              <td>15,600 BHD</td>
              <td>14,200 BHD</td>
              <td><span class="badge badge-success">+9.9%</span></td>
            </tr>
            <tr>
              <td>Attendance Rate</td>
              <td>82%</td>
              <td>78%</td>
              <td><span class="badge badge-success">+5.1%</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== OVERVIEW PAGE =====
  overview: function() {
    return `
      <div class="page-header">
        <h1>📊 Club Overview</h1>
        <p>Complete club statistics and analytics</p>
      </div>

      <div class="level-selector">
        <label>Select Flight Level:</label>
        <select id="overviewLevelFilter" onchange="window.filterByLevel()">
          <option value="">All Levels</option>
          <option value="premier">Premier</option>
          <option value="flight1">Flight 1</option>
          <option value="flight2">Flight 2</option>
          <option value="flight3">Flight 3</option>
          <option value="flight4">Flight 4</option>
          <option value="flight4a">Flight 4A</option>
          <option value="flight4b">Flight 4B</option>
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">👥</div>
          <div class="stat-content">
            <h3>156</h3>
            <p>Total Members</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">✓</div>
          <div class="stat-content">
            <h3>142</h3>
            <p>Active Members</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⏸</div>
          <div class="stat-content">
            <h3>14</h3>
            <p>Inactive Members</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">🚫</div>
          <div class="stat-content">
            <h3>0</h3>
            <p>Suspended</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>📈 Member Distribution by Activity</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Total Members</th>
              <th>Active</th>
              <th>Inactive</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Badminton</td>
              <td>68</td>
              <td>62</td>
              <td>6</td>
              <td>43.6%</td>
            </tr>
            <tr>
              <td>Cricket</td>
              <td>52</td>
              <td>48</td>
              <td>4</td>
              <td>33.3%</td>
            </tr>
            <tr>
              <td>Tennis</td>
              <td>36</td>
              <td>32</td>
              <td>4</td>
              <td>23.1%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>💰 Financial Summary</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Revenue</td>
              <td>15,600 BHD</td>
              <td>100%</td>
            </tr>
            <tr>
              <td>Total Expenses</td>
              <td>4,200 BHD</td>
              <td>26.9%</td>
            </tr>
            <tr>
              <td>Net Profit</td>
              <td>11,400 BHD</td>
              <td>73.1%</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== ACTIVITIES & FLIGHTS PAGE =====
  flights: function() {
    return `
      <div class="page-header">
        <h1>✈️ Activities, Flights & Members</h1>
        <p>Create and manage club activities, flights, and members</p>
      </div>

      <div class="level-selector">
        <label>Select Flight Level:</label>
        <select id="flightsLevelFilter" onchange="window.filterByLevel()">
          <option value="">All Levels</option>
          <option value="premier">Premier</option>
          <option value="flight1">Flight 1</option>
          <option value="flight2">Flight 2</option>
          <option value="flight3">Flight 3</option>
          <option value="flight4">Flight 4</option>
          <option value="flight4a">Flight 4A</option>
          <option value="flight4b">Flight 4B</option>
        </select>
      </div>

      <div class="card">
        <h2>➕ Create New Activity</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Activity Name *</label>
            <input type="text" id="createActivityName" placeholder="e.g., Badminton, Cricket">
          </div>
          <div class="form-group">
            <label>Status *</label>
            <select id="createActivityStatus">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" onclick="window.createActivity()">Create Activity</button>
      </div>

      <div class="card">
        <h2>📋 Activities List</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Flights</th>
              <th>Members</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Badminton</td>
              <td>3</td>
              <td>68</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Manage</button></td>
            </tr>
            <tr>
              <td>Cricket</td>
              <td>2</td>
              <td>52</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Manage</button></td>
            </tr>
            <tr>
              <td>Tennis</td>
              <td>2</td>
              <td>36</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Manage</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>➕ Create New Flight</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Activity *</label>
            <select id="createFlightActivity">
              <option value="">Select activity</option>
              <option value="badminton">Badminton</option>
              <option value="cricket">Cricket</option>
              <option value="tennis">Tennis</option>
            </select>
          </div>
          <div class="form-group">
            <label>Flight Name *</label>
            <input type="text" id="createFlightName" placeholder="e.g., Premier, Flight 1">
          </div>
          <div class="form-group">
            <label>Display Order *</label>
            <input type="number" id="createFlightOrder" placeholder="1" min="1">
          </div>
        </div>
        <button class="btn btn-primary" onclick="window.createFlight()">Create Flight</button>
      </div>

      <div class="card">
        <h2>✈️ Flights List</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Flight</th>
              <th>Members</th>
              <th>Admin</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Badminton</td>
              <td>Premier</td>
              <td>24</td>
              <td>Ahmed Al-Mansouri</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Badminton</td>
              <td>Flight 1</td>
              <td>22</td>
              <td>Mohammed Al-Khalifa</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Cricket</td>
              <td>Premier</td>
              <td>26</td>
              <td>Fatima Hassan</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>➕ Pre-Register Member</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Registered Full Name *</label>
            <input type="text" id="createMemberName" placeholder="Member's full name">
          </div>
          <div class="form-group">
            <label>Phone Number *</label>
            <input type="tel" id="createMemberPhone" placeholder="Mobile/WhatsApp number">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Role *</label>
            <select id="createMemberRole">
              <option value="">Select role</option>
              <option value="PLAYER">Player</option>
              <option value="LEVEL_ADMIN">Flight Admin</option>
            </select>
          </div>
          <div class="form-group">
            <label>Assigned Flight Level *</label>
            <select id="createMemberFlight">
              <option value="">-- Select flight --</option>
              <option value="premier">Premier</option>
              <option value="flight1">Flight 1</option>
              <option value="flight2">Flight 2</option>
              <option value="flight3">Flight 3</option>
              <option value="flight4">Flight 4</option>
              <option value="flight4a">Flight 4A</option>
              <option value="flight4b">Flight 4B</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" id="createMember" onclick="window.createMember()">Pre-Register Member</button>
      </div>

      <div class="card">
        <h2>👥 Pre-Registered Members</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Flight</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Al-Mansouri</td>
              <td>+973 3366 1234</td>
              <td>Flight Admin</td>
              <td>Premier</td>
              <td><span class="badge badge-success">Active</span></td>
              <td>
                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;" data-save-member onclick="window.saveMember('ahmed_001')">Save</button>
                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" data-delete-member-perm onclick="window.deleteMemberPerm('ahmed_001')">Delete</button>
              </td>
            </tr>
            <tr>
              <td>Fatima Hassan</td>
              <td>+973 3366 5678</td>
              <td>Player</td>
              <td>Flight 1</td>
              <td><span class="badge badge-success">Active</span></td>
              <td>
                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;" data-save-member onclick="window.saveMember('fatima_001')">Save</button>
                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" data-delete-member-perm onclick="window.deleteMemberPerm('fatima_001')">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>📱 WhatsApp Onboarding</h2>
        <p>Send onboarding instructions via WhatsApp to pre-registered members</p>
        <div class="form-group">
          <label>Member Phone Number *</label>
          <input type="tel" id="whatsappPhone" placeholder="+973 XXXX XXXX">
        </div>
        <button class="btn btn-primary" data-whatsapp-onboarding-phone onclick="window.sendWhatsAppOnboarding()">Send WhatsApp Link</button>
      </div>
    `;
  },

  // ===== MASTER TIMETABLE PAGE =====
  master: function() {
    return `
      <div class="page-header">
        <h1>📅 Master Timetable</h1>
        <p>Club-wide weekly schedule management</p>
      </div>

      <div class="level-selector">
        <label>Select Flight Level:</label>
        <select id="masterLevelFilter" onchange="window.filterByLevel()">
          <option value="">All Levels</option>
          <option value="premier">Premier</option>
          <option value="flight1">Flight 1</option>
          <option value="flight2">Flight 2</option>
          <option value="flight3">Flight 3</option>
          <option value="flight4">Flight 4</option>
          <option value="flight4a">Flight 4A</option>
          <option value="flight4b">Flight 4B</option>
        </select>
      </div>

      <div class="card">
        <h2>📅 Month Selector</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Select Month *</label>
            <input type="month" id="masterMonth" value="2026-09">
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <button class="btn btn-primary" onclick="window.publishMasterMonth()">Publish Month</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>⚠️ Danger Zone</h2>
        <p style="color: #ff6b6b; margin-bottom: 15px;"><strong>⚠️ WARNING:</strong> This action will delete ALL timetable entries for the selected month!</p>
        <button class="btn btn-danger" id="deleteEntireMonthTimetable" onclick="window.deleteEntireMonth()">Clear Entire Month Timetable</button>
      </div>

      <div class="card">
        <h2>➕ Add Session to Master Timetable</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Day *</label>
            <select id="masterDay">
              <option value="">Select day</option>
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
              <option value="SATURDAY">Saturday</option>
              <option value="SUNDAY">Sunday</option>
            </select>
          </div>
          <div class="form-group">
            <label>Start Time *</label>
            <input type="time" id="masterStartTime">
          </div>
          <div class="form-group">
            <label>End Time *</label>
            <input type="time" id="masterEndTime">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Activity *</label>
            <select id="masterActivity">
              <option value="">Select activity</option>
              <option value="badminton">Badminton</option>
              <option value="cricket">Cricket</option>
              <option value="tennis">Tennis</option>
            </select>
          </div>
          <div class="form-group">
            <label>Flight *</label>
            <select id="masterFlight">
              <option value="">Select flight</option>
              <option value="premier">Premier</option>
              <option value="flight1">Flight 1</option>
              <option value="flight2">Flight 2</option>
              <option value="flight3">Flight 3</option>
              <option value="flight4">Flight 4</option>
              <option value="flight4a">Flight 4A</option>
              <option value="flight4b">Flight 4B</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" onclick="window.addMasterSession()">Add to Timetable</button>
      </div>

      <div class="card">
        <h2>📋 Weekly Schedule</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Activity</th>
              <th>Flight</th>
              <th>Venue</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monday</td>
              <td>6:00 - 7:30 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td>Court 1</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Wednesday</td>
              <td>6:00 - 7:30 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td>Court 1</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Friday</td>
              <td>6:00 - 7:30 AM</td>
              <td>Badminton</td>
              <td>Premier</td>
              <td>Court 1</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>📤 Bulk CSV Import</h2>
        <p style="margin-bottom: 15px;"><strong>Format:</strong> weekday,flight,startTime,endTime (one per line)</p>
        <p style="margin-bottom: 15px; color: #999; font-size: 12px;">Example:<br>MONDAY,Premier,06:00,07:30<br>WEDNESDAY,Premier,06:00,07:30</p>
        <div class="form-group">
          <label>Paste CSV Data *</label>
          <textarea id="importBulkTimetable" placeholder="MONDAY,Premier,06:00,07:30&#10;WEDNESDAY,Premier,06:00,07:30" rows="6"></textarea>
        </div>
        <button class="btn btn-primary" onclick="window.importBulkTimetable()">Import CSV</button>
      </div>
    `;
  },

  // ===== EXECUTIVE FINANCE PAGE =====
  'admin-finance': function() {
    return `
      <div class="page-header">
        <h1>💰 Executive Finance</h1>
        <p>Club-wide financial management</p>
      </div>

      <div class="level-selector">
        <label>Select Flight Level:</label>
        <select id="financeLevelFilter" onchange="window.filterByLevel()">
          <option value="">All Levels</option>
          <option value="premier">Premier</option>
          <option value="flight1">Flight 1</option>
          <option value="flight2">Flight 2</option>
          <option value="flight3">Flight 3</option>
          <option value="flight4">Flight 4</option>
          <option value="flight4a">Flight 4A</option>
          <option value="flight4b">Flight 4B</option>
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">💵</div>
          <div class="stat-content">
            <h3>15,600 BHD</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">💸</div>
          <div class="stat-content">
            <h3>4,200 BHD</h3>
            <p>Total Expenses</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">📊</div>
          <div class="stat-content">
            <h3>11,400 BHD</h3>
            <p>Net Profit</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⏳</div>
          <div class="stat-content">
            <h3>1,200 BHD</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>💳 Member Wallet Credit Controls</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Select Member *</label>
            <select id="financeCreditMember" onchange="window.enableFinanceButtons()">
              <option value="">-- Select member --</option>
              <option value="ahmed_001">Ahmed Al-Mansouri</option>
              <option value="fatima_001">Fatima Hassan</option>
              <option value="mohammed_001">Mohammed Ali</option>
            </select>
          </div>
          <div class="form-group">
            <label>Amount (BHD) *</label>
            <input type="number" id="financeAmount" placeholder="0.000" min="0" step="0.001">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button class="btn btn-success" id="addFinanceCredit" disabled onclick="window.addFinanceCredit()">Add Verified Credit</button>
          <button class="btn btn-danger" id="deductFinanceCredit" disabled onclick="window.deductFinanceCredit()">Deduct Wallet Credit</button>
        </div>
      </div>

      <div class="card">
        <h2>📈 Revenue by Activity</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Revenue</th>
              <th>Members</th>
              <th>Per Member</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Badminton</td>
              <td>6,800 BHD</td>
              <td>68</td>
              <td>100 BHD</td>
              <td>43.6%</td>
            </tr>
            <tr>
              <td>Cricket</td>
              <td>5,200 BHD</td>
              <td>52</td>
              <td>100 BHD</td>
              <td>33.3%</td>
            </tr>
            <tr>
              <td>Tennis</td>
              <td>3,600 BHD</td>
              <td>36</td>
              <td>100 BHD</td>
              <td>23.1%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>⏳ Pending Payments for Verification</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Al-Mansouri</td>
              <td>100 BHD</td>
              <td>BenefitPay</td>
              <td>BP123456</td>
              <td>Sep 12, 2026</td>
              <td><button class="btn btn-success" style="padding: 6px 12px; font-size: 12px;" data-verify-payment onclick="window.verifyPayment('ahmed_001')">Verify</button></td>
            </tr>
            <tr>
              <td>Fatima Hassan</td>
              <td>75 BHD</td>
              <td>Cash</td>
              <td>CASH-001</td>
              <td>Sep 11, 2026</td>
              <td><button class="btn btn-success" style="padding: 6px 12px; font-size: 12px;" data-verify-payment onclick="window.verifyPayment('fatima_001')">Verify</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== ADS & NOTICE CONTROL PAGE =====
  ads: function() {
    return `
      <div class="page-header">
        <h1>📢 Ads & Notice Control</h1>
        <p>Manage carousel ads and club notices</p>
      </div>

      <div class="level-selector">
        <label>Select Flight Level:</label>
        <select id="adsLevelFilter" onchange="window.filterByLevel()">
          <option value="">All Levels</option>
          <option value="premier">Premier</option>
          <option value="flight1">Flight 1</option>
          <option value="flight2">Flight 2</option>
          <option value="flight3">Flight 3</option>
          <option value="flight4">Flight 4</option>
          <option value="flight4a">Flight 4A</option>
          <option value="flight4b">Flight 4B</option>
        </select>
      </div>

      <div class="card">
        <h2>🎠 Carousel Advertisement Limit</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Max Active Featured Ads (Max 10) *</label>
            <input type="number" id="carouselAdCount" placeholder="10" min="1" max="10" value="6">
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <button class="btn btn-primary" onclick="window.saveCarouselLimit()">Save Limit</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>📸 Club Announcements Banner</h2>
        <p style="margin-bottom: 15px;">Upload image for celebrations, updates, or obituary announcements</p>
        <div class="form-group">
          <label>Upload Notice Image (PNG/JPEG/WebP, max 2MB) *</label>
          <input type="file" id="uploadNoticeImage" accept="image/png,image/jpeg,image/webp" onchange="window.validateNoticeImage()">
        </div>
        <button class="btn btn-primary" onclick="window.uploadNoticeImage()">Upload Banner</button>
      </div>

      <div class="card">
        <h2>📅 Feature Window for Ads</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Feature Start Date *</label>
            <input type="date" id="adFeatureStart">
          </div>
          <div class="form-group">
            <label>Feature End Date *</label>
            <input type="date" id="adFeatureEnd">
          </div>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 10px;">Ads automatically leave carousel when system date exceeds end date</p>
      </div>

      <div class="card">
        <h2>📋 Active Advertisements</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Category</th>
              <th>Offer</th>
              <th>Featured Until</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Al-Noor Restaurant</td>
              <td>Food & Dining</td>
              <td>20% Discount</td>
              <td>Sep 30, 2026</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
            <tr>
              <td>Fitness Plus Gym</td>
              <td>Health & Fitness</td>
              <td>Free Trial</td>
              <td>Sep 25, 2026</td>
              <td><span class="badge badge-success">Active</span></td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>⏳ Pending Ad Approvals</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Category</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tech Solutions</td>
              <td>Technology</td>
              <td>Sep 12, 2026</td>
              <td><span class="badge badge-warning">Pending</span></td>
              <td>
                <button class="btn btn-success" style="padding: 6px 12px; font-size: 12px;">Approve</button>
                <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== SYSTEM AUDIT LOG PAGE =====
  audit: function() {
    return `
      <div class="page-header">
        <h1>🔍 System Audit Log</h1>
        <p>Track all system activities and changes</p>
      </div>

      <div class="level-selector">
        <label>Select Flight Level:</label>
        <select id="auditLevelFilter" onchange="window.filterByLevel()">
          <option value="">All Levels</option>
          <option value="premier">Premier</option>
          <option value="flight1">Flight 1</option>
          <option value="flight2">Flight 2</option>
          <option value="flight3">Flight 3</option>
          <option value="flight4">Flight 4</option>
          <option value="flight4a">Flight 4A</option>
          <option value="flight4b">Flight 4B</option>
        </select>
      </div>

      <div class="card">
        <h2>🔎 Multi-Filter Audit Logs</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Category</label>
            <select id="auditCategory">
              <option value="">All Categories</option>
              <option value="MEMBER">Member Management</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="WALLET">Wallet & Payment</option>
              <option value="SESSION">Session Control</option>
              <option value="SHUTTLE">Shuttle Stock</option>
            </select>
          </div>
          <div class="form-group">
            <label>Activity</label>
            <select id="auditActivity">
              <option value="">All Activities</option>
              <option value="badminton">Badminton</option>
              <option value="cricket">Cricket</option>
              <option value="tennis">Tennis</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="auditDate">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Member/Actor Name</label>
            <input type="text" id="auditMember" placeholder="Search member...">
          </div>
        </div>
        <button class="btn btn-primary" onclick="window.filterAuditLogs()">Filter Logs</button>
      </div>

      <div class="card">
        <h2>📋 Audit Trail</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>User/Actor</th>
              <th>Category</th>
              <th>Action</th>
              <th>Details</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 13, 2026 - 5:20 PM</td>
              <td>Fathima Al-Dosari</td>
              <td>Login</td>
              <td>User Login</td>
              <td>Logged in to admin panel</td>
              <td><span class="badge badge-success">Success</span></td>
            </tr>
            <tr>
              <td>Sep 13, 2026 - 3:45 PM</td>
              <td>Mohammed Al-Khalifa</td>
              <td>Member</td>
              <td>Member Added</td>
              <td>New member registered</td>
              <td><span class="badge badge-success">Success</span></td>
            </tr>
            <tr>
              <td>Sep 12, 2026 - 10:30 AM</td>
              <td>Fathima Al-Dosari</td>
              <td>Wallet</td>
              <td>Payment Processed</td>
              <td>Monthly fees collected</td>
              <td><span class="badge badge-success">Success</span></td>
            </tr>
            <tr>
              <td>Sep 11, 2026 - 2:15 PM</td>
              <td>Ahmed Al-Mansouri</td>
              <td>Session</td>
              <td>Session Completed</td>
              <td>Game session finalized</td>
              <td><span class="badge badge-success">Success</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>🖨️ Print Audit Log</h2>
        <button class="btn btn-primary" onclick="window.printAuditLog()">Print Current Log</button>
      </div>
    `;
  }
};

// ===== HELPER FUNCTIONS =====
window.filterByLevel = function() {
  console.log('Filtering by level...');
  if (window.showToast) {
    window.showToast('✅ Level filter applied');
  }
};

window.createActivity = function() {
  const name = document.getElementById('createActivityName')?.value?.trim();
  if (!name) {
    if (window.showToast) window.showToast('❌ Please enter activity name');
    return;
  }
  console.log(`Creating activity: ${name}`);
  if (window.showToast) window.showToast(`✅ Activity "${name}" created successfully!`);
};

window.createFlight = function() {
  const activity = document.getElementById('createFlightActivity')?.value;
  const name = document.getElementById('createFlightName')?.value?.trim();
  if (!activity || !name) {
    if (window.showToast) window.showToast('❌ Please fill all fields');
    return;
  }
  console.log(`Creating flight: ${name} for ${activity}`);
  if (window.showToast) window.showToast(`✅ Flight "${name}" created successfully!`);
};

window.createMember = function() {
  const name = document.getElementById('createMemberName')?.value?.trim();
  const phone = document.getElementById('createMemberPhone')?.value?.trim();
  const role = document.getElementById('createMemberRole')?.value;
  const flight = document.getElementById('createMemberFlight')?.value;

  if (!name || !phone || !role || !flight) {
    if (window.showToast) window.showToast('❌ All fields are required');
    return;
  }

  console.log(`Pre-registering member: ${name}, ${phone}, ${role}, ${flight}`);
  if (window.showToast) window.showToast(`✅ Member "${name}" pre-registered successfully!`);
};

window.sendWhatsAppOnboarding = function() {
  const phone = document.getElementById('whatsappPhone')?.value?.trim();
  if (!phone) {
    if (window.showToast) window.showToast('❌ Please enter phone number');
    return;
  }
  const cleanPhone = phone.replace(/\D/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=Welcome%20to%20Indian%20Club%20Bahrain!%20Please%20activate%20your%20account...`;
  window.open(waLink, '_blank');
  console.log(`WhatsApp link opened for: ${cleanPhone}`);
};

window.saveMember = function(memberId) {
  console.log(`Saving member: ${memberId}`);
  if (window.showToast) window.showToast('✅ Member updated successfully!');
};

window.deleteMemberPerm = function(memberId) {
  if (confirm('⚠️ Are you sure you want to permanently delete this member? This action cannot be undone.')) {
    console.log(`Deleting member: ${memberId}`);
    if (window.showToast) window.showToast('✅ Member deleted permanently!');
  }
};

window.publishMasterMonth = function() {
  const month = document.getElementById('masterMonth')?.value;
  console.log(`Publishing month: ${month}`);
  if (window.showToast) window.showToast(`✅ Month ${month} published successfully!`);
};

window.deleteEntireMonth = function() {
  const month = document.getElementById('masterMonth')?.value;
  if (confirm(`⚠️ Are you sure you want to delete ALL timetable entries for ${month}? This cannot be undone!`)) {
    console.log(`Deleting entire month: ${month}`);
    if (window.showToast) window.showToast(`✅ All entries for ${month} deleted!`);
  }
};

window.addMasterSession = function() {
  const day = document.getElementById('masterDay')?.value;
  const startTime = document.getElementById('masterStartTime')?.value;
  const endTime = document.getElementById('masterEndTime')?.value;
  const activity = document.getElementById('masterActivity')?.value;
  const flight = document.getElementById('masterFlight')?.value;

  if (!day || !startTime || !endTime || !activity || !flight) {
    if (window.showToast) window.showToast('❌ All fields are required');
    return;
  }

  console.log(`Adding session: ${day} ${startTime}-${endTime} ${activity} ${flight}`);
  if (window.showToast) window.showToast('✅ Session added to timetable!');
};

window.importBulkTimetable = function() {
  const csvData = document.getElementById('importBulkTimetable')?.value?.trim();
  if (!csvData) {
    if (window.showToast) window.showToast('❌ Please paste CSV data');
    return;
  }

  const lines = csvData.split('\n').filter(line => line.trim());
  let validCount = 0;
  let errorRow = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (i === 0 && (line.toLowerCase().includes('weekday') || line.toLowerCase().includes('day'))) {
      continue; // Skip header
    }
    const parts = line.split(',');
    if (parts.length !== 4) {
      errorRow = i + 1;
      break;
    }
    validCount++;
  }

  if (errorRow) {
    if (window.showToast) window.showToast(`❌ Row ${errorRow} invalid. Expected 4 comma-separated values.`);
    return;
  }

  console.log(`Imported ${validCount} timetable entries`);
  if (window.showToast) window.showToast(`✅ Successfully imported ${validCount} entries!`);
};

window.enableFinanceButtons = function() {
  const member = document.getElementById('financeCreditMember')?.value;
  document.getElementById('addFinanceCredit').disabled = !member;
  document.getElementById('deductFinanceCredit').disabled = !member;
};

window.addFinanceCredit = function() {
  const member = document.getElementById('financeCreditMember')?.value;
  const amount = parseFloat(document.getElementById('financeAmount')?.value || 0);

  if (!member || amount <= 0) {
    if (window.showToast) window.showToast('❌ Please select member and enter amount');
    return;
  }

  const amountFils = Math.round(amount * 1000);
  console.log(`Adding credit: ${amountFils} Fils to ${member}`);
  if (window.showToast) window.showToast(`✅ Added ${amount.toFixed(3)} BHD to member wallet!`);
};

window.deductFinanceCredit = function() {
  const member = document.getElementById('financeCreditMember')?.value;
  const amount = parseFloat(document.getElementById('financeAmount')?.value || 0);

  if (!member || amount <= 0) {
    if (window.showToast) window.showToast('❌ Please select member and enter amount');
    return;
  }

  const amountFils = -Math.round(amount * 1000);
  console.log(`Deducting credit: ${Math.abs(amountFils)} Fils from ${member}`);
  if (window.showToast) window.showToast(`✅ Deducted ${amount.toFixed(3)} BHD from member wallet!`);
};

window.verifyPayment = function(memberId) {
  console.log(`Verifying payment for: ${memberId}`);
  if (window.showToast) window.showToast('✅ Payment verified and added to wallet!');
};

window.saveCarouselLimit = function() {
  const limit = parseInt(document.getElementById('carouselAdCount')?.value || 10);
  if (limit < 1 || limit > 10) {
    if (window.showToast) window.showToast('❌ Limit must be between 1 and 10');
    return;
  }
  console.log(`Carousel limit set to: ${limit}`);
  if (window.showToast) window.showToast(`✅ Carousel limit set to ${limit} ads!`);
};

window.validateNoticeImage = function() {
  const file = document.getElementById('uploadNoticeImage')?.files?.[0];
  if (!file) return;

  const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!validTypes.includes(file.type)) {
    if (window.showToast) window.showToast('❌ Only PNG, JPEG, or WebP images allowed');
    document.getElementById('uploadNoticeImage').value = '';
    return;
  }

  if (file.size > maxSize) {
    if (window.showToast) window.showToast('❌ File size must be 2MB or less');
    document.getElementById('uploadNoticeImage').value = '';
    return;
  }
};

window.uploadNoticeImage = function() {
  const file = document.getElementById('uploadNoticeImage')?.files?.[0];
  if (!file) {
    if (window.showToast) window.showToast('❌ Please select an image');
    return;
  }
  console.log(`Uploading notice image: ${file.name}`);
  if (window.showToast) window.showToast('✅ Notice image uploaded successfully!');
};

window.filterAuditLogs = function() {
  const category = document.getElementById('auditCategory')?.value;
  const activity = document.getElementById('auditActivity')?.value;
  const date = document.getElementById('auditDate')?.value;
  const member = document.getElementById('auditMember')?.value;

  console.log(`Filtering audit logs: Category=${category}, Activity=${activity}, Date=${date}, Member=${member}`);
  if (window.showToast) window.showToast('✅ Audit logs filtered!');
};

window.printAuditLog = function() {
  console.log('Printing audit log...');
  window.print();
};

console.log('✅ adminViews.js loaded successfully');

