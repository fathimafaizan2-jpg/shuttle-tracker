
// ============================================
// adminViews.js - SUPER ADMIN PAGES (COMPLETE)
// ============================================

// ===== LEVEL DROPDOWN COMPONENT =====
function getLevelDropdown(selectedLevel = '') {
  const levels = ['Premier', 'Flight 1', 'Flight 2', 'Flight 3', 'Flight 4', 'Flight 4A', 'Flight 4B'];
  let html = `
    <div class="form-group" style="margin-bottom: 20px;">
      <label>Select Flight Level</label>
      <select id="levelFilter" onchange="window.onLevelChange()" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; width: 100%; max-width: 300px;">
        <option value="">All Levels</option>
  `;
  
  levels.forEach(level => {
    html += `<option value="${level}" ${selectedLevel === level ? 'selected' : ''}>${level}</option>`;
  });
  
  html += `</select></div>`;
  return html;
}

export const adminViews = {
  // ===== CLUB OVERVIEW =====
  home: async function() {
    try {
      const overviewData = await window.api.getClubOverview();

      let html = `
        <div class="page-header">
          <h1>📊 Club Overview</h1>
          <p>Executive dashboard with club-wide metrics</p>
        </div>

        ${getLevelDropdown()}

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: #e3f2fd; color: #1976d2;">🏸</div>
            <div class="stat-content">
              <h3>${overviewData?.totalActivities || 0}</h3>
              <p>Total Active Sports</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #e8f5e9; color: #388e3c;">👥</div>
            <div class="stat-content">
              <h3>${overviewData?.totalPlayers || 0}</h3>
              <p>Registered Players</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #fff3e0; color: #f57c00;">👨‍💼</div>
            <div class="stat-content">
              <h3>${overviewData?.totalAdmins || 0}</h3>
              <p>Flight Admins</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #f3e5f5; color: #7b1fa2;">💰</div>
            <div class="stat-content">
              <h3>BHD ${((overviewData?.totalWallet || 0) / 1000).toFixed(3)}</h3>
              <p>Total Club Wallet</p>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>Club Statistics</h2>
          <table class="data-table">
            <tr>
              <td><strong>Active Members:</strong></td>
              <td>${overviewData?.activeMembers || 0}</td>
            </tr>
            <tr>
              <td><strong>Inactive Members:</strong></td>
              <td>${overviewData?.inactiveMembers || 0}</td>
            </tr>
            <tr>
              <td><strong>Total Sessions This Month:</strong></td>
              <td>${overviewData?.sessionsThisMonth || 0}</td>
            </tr>
            <tr>
              <td><strong>Pending Payments:</strong></td>
              <td>BHD ${((overviewData?.pendingPayments || 0) / 1000).toFixed(3)}</td>
            </tr>
          </table>
        </div>
      `;

      return html;

    } catch (error) {
      console.error('❌ Error loading overview:', error);
      return `<div class="error-message">❌ Error loading overview: ${error.message}</div>`;
    }
  },

  // ===== ACTIVITIES, FLIGHTS & MEMBERS =====
  flights: async function() {
    try {
      const flightsData = await window.api.getFlights();
      const flights = flightsData?.flights || [];

      let html = `
        <div class="page-header">
          <h1>✈️ Activities, Flights & Members</h1>
          <p>Create sports, flights, and manage member pre-registration</p>
        </div>

        ${getLevelDropdown()}

        <div class="card">
          <h2>Create New Activity</h2>
          <form id="createActivityForm" onsubmit="window.createActivity(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Activity Name *</label>
                <input type="text" id="createActivity" placeholder="e.g., Badminton, Cricket, Tennis" required>
              </div>
              <button type="submit" class="btn btn-primary" style="align-self: flex-end;">Create Activity</button>
            </div>
          </form>
        </div>

        <div class="card">
          <h2>Add Flight Level</h2>
          <form id="createFlightForm" onsubmit="window.createFlight(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Activity *</label>
                <select id="flightActivity" required>
                  <option value="">Select activity</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Tennis">Tennis</option>
                </select>
              </div>
              <div class="form-group">
                <label>Flight Name *</label>
                <input type="text" id="flightName" placeholder="e.g., Premier, Flight 1" required>
              </div>
              <button type="submit" class="btn btn-primary" style="align-self: flex-end;">Add Flight</button>
            </div>
          </form>
        </div>

        <div class="card">
          <h2>Pre-Register Member</h2>
          <form id="createMemberForm" onsubmit="window.createMember(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Registered Name *</label>
                <input type="text" id="createMember" placeholder="Full name" required>
              </div>
              <div class="form-group">
                <label>Phone Number *</label>
                <input type="tel" id="memberPhone" placeholder="+973 XXXX XXXX" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Role *</label>
                <select id="memberRole" required>
                  <option value="">Select role</option>
                  <option value="PLAYER">Player</option>
                  <option value="LEVEL_ADMIN">Flight Admin</option>
                </select>
              </div>
              <div class="form-group">
                <label>Assigned Flight Level *</label>
                <select id="memberFlight" required>
                  <option value="">Select flight</option>
                  <option value="Premier">Premier</option>
                  <option value="Flight 1">Flight 1</option>
                  <option value="Flight 2">Flight 2</option>
                  <option value="Flight 3">Flight 3</option>
                  <option value="Flight 4">Flight 4</option>
                  <option value="Flight 4A">Flight 4A</option>
                  <option value="Flight 4B">Flight 4B</option>
                </select>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">Pre-Register Member</button>
          </form>
        </div>

        <div class="card">
          <h2>Pre-Registered Members</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Flight</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
      `;

      if (flights.length === 0) {
        html += '<tr><td colspan="7" style="text-align: center; color: #999;">No members registered</td></tr>';
      } else {
        flights.forEach((member, idx) => {
          html += `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${member.name}</strong></td>
              <td>${member.phone}</td>
              <td>${member.role}</td>
              <td>${member.flight}</td>
              <td><span class="badge badge-warning">PENDING</span></td>
              <td>
                <button class="btn btn-secondary" onclick="window.sendWhatsAppLink('${member.phone}')" data-whatsapp-onboarding-phone style="padding: 6px 12px; font-size: 12px; margin-right: 5px;">
                  WhatsApp
                </button>
                <button class="btn btn-danger" onclick="window.deleteMember('${member.id}')" data-delete-member-perm style="padding: 6px 12px; font-size: 12px;">
                  Delete
                </button>
              </td>
            </tr>
          `;
        });
      }

      html += `
            </tbody>
          </table>
        </div>
      `;

      return html;

    } catch (error) {
      console.error('❌ Error loading flights:', error);
      return `<div class="error-message">❌ Error loading flights: ${error.message}</div>`;
    }
  },

  // ===== MASTER TIMETABLE =====
  master: async function() {
    let html = `
      <div class="page-header">
        <h1>📅 Master Timetable</h1>
        <p>Club-wide weekly schedule management</p>
      </div>

      ${getLevelDropdown()}

      <div class="card">
        <h2>Month Management</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Select Month *</label>
            <input type="month" id="masterMonth" required>
          </div>
          <button class="btn btn-danger" onclick="window.deleteEntireMonth()" id="deleteEntireMonthTimetable" style="align-self: flex-end;">
            🗑️ Clear Entire Month
          </button>
          <button class="btn btn-success" onclick="window.publishMonth()" id="publishMasterMonth" style="align-self: flex-end;">
            📤 Publish Month
          </button>
        </div>
      </div>

      <div class="card">
        <h2>Bulk CSV Import</h2>
        <div style="background: #f0f3ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="font-size: 12px; color: #666;">
            <strong>CSV Format:</strong> weekday,flight,startTime,endTime<br>
            <strong>Example:</strong><br>
            Monday,Premier,06:00,07:00<br>
            Wednesday,Flight 1,18:00,19:00<br>
            <strong>Note:</strong> Header line will be automatically removed. Each data line must have exactly 4 comma-separated values.
          </p>
        </div>
        <form id="importBulkTimetable" onsubmit="window.importBulkTimetable(event)">
          <div class="form-group">
            <label>Paste CSV Data *</label>
            <textarea id="csvData" placeholder="Paste your CSV data here..." style="min-height: 200px;" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Import Timetable</button>
        </form>
      </div>

      <div class="card">
        <h2>Current Timetable</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Flight</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Activity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monday</td>
              <td>Premier</td>
              <td>06:00</td>
              <td>07:00</td>
              <td>Badminton</td>
            </tr>
            <tr>
              <td>Wednesday</td>
              <td>Flight 1</td>
              <td>18:00</td>
              <td>19:00</td>
              <td>Badminton</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    return html;
  },

  // ===== EXECUTIVE FINANCE =====
  finance: async function() {
    try {
      const financeData = await window.api.getFinance();

      let html = `
        <div class="page-header">
          <h1>💰 Executive Finance</h1>
          <p>Club-wide financial management</p>
        </div>

        ${getLevelDropdown()}

        <div class="card">
          <h2>Filter Scope</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Activity</label>
              <select id="financeActivity" onchange="window.updateFinanceMembers()">
                <option value="">All Activities</option>
                <option value="Badminton">Badminton</option>
                <option value="Cricket">Cricket</option>
                <option value="Tennis">Tennis</option>
              </select>
            </div>
            <div class="form-group">
              <label>Flight Level</label>
              <select id="financeFlightLevel" onchange="window.updateFinanceMembers()">
                <option value="">All Levels</option>
                <option value="Premier">Premier</option>
                <option value="Flight 1">Flight 1</option>
                <option value="Flight 2">Flight 2</option>
                <option value="Flight 3">Flight 3</option>
                <option value="Flight 4">Flight 4</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>Member Wallet Credit Controls</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Select Member *</label>
              <select id="financeCreditMember" required>
                <option value="">Select member</option>
                <option value="member_001">Ahmed Al-Mansouri</option>
                <option value="member_002">Fatima Hassan</option>
                <option value="member_003">Mohammed Ali</option>
              </select>
            </div>
            <div class="form-group">
              <label>Amount (BHD) *</label>
              <input type="number" id="financeAmount" placeholder="0.000" step="0.001" min="0" required>
            </div>
          </div>

          <div class="form-row">
            <button class="btn btn-success" id="addFinanceCredit" onclick="window.addCredit()" style="flex: 1;">
              ➕ Add Verified Credit
            </button>
            <button class="btn btn-danger" id="deductFinanceCredit" onclick="window.deductCredit()" style="flex: 1;">
              ➖ Deduct Credit
            </button>
          </div>
        </div>

        <div class="card">
          <h2>Pending Payments</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Member</th>
                <th>Amount (BHD)</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td><strong>Sara Ahmed</strong></td>
                <td>5.000</td>
                <td>BenefitPay</td>
                <td>BP123456</td>
                <td><span class="badge badge-warning">PENDING</span></td>
                <td>
                  <button class="btn btn-success" onclick="window.verifyPayment('payment_001')" data-verify-payment style="padding: 6px 12px; font-size: 12px;">
                    Verify
                  </button>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td><strong>Hassan Ibrahim</strong></td>
                <td>3.000</td>
                <td>Cash</td>
                <td>CASH001</td>
                <td><span class="badge badge-warning">PENDING</span></td>
                <td>
                  <button class="btn btn-success" onclick="window.verifyPayment('payment_002')" data-verify-payment style="padding: 6px 12px; font-size: 12px;">
                    Verify
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      return html;

    } catch (error) {
      console.error('❌ Error loading finance:', error);
      return `<div class="error-message">❌ Error loading finance: ${error.message}</div>`;
    }
  },

  // ===== AD & NOTICE CONTROL =====
  ads: async function() {
    try {
      const adsData = await window.api.getAds();

      let html = `
        <div class="page-header">
          <h1>📢 Ad & Notice Control</h1>
          <p>Manage carousel ads and club notices</p>
        </div>

        ${getLevelDropdown()}

        <div class="card">
          <h2>Carousel Advertisement Settings</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Maximum Active Ads (Max 10) *</label>
              <input type="number" id="carouselAdCount" min="1" max="10" value="6" required>
            </div>
            <button class="btn btn-primary" onclick="window.saveCarouselLimit()" style="align-self: flex-end;">Save Limit</button>
          </div>
          <p style="font-size: 12px; color: #999; margin-top: 10px;">Current active ads: ${adsData?.activeAds || 0} / 10</p>
        </div>

        <div class="card">
          <h2>Upload Club Notice Image</h2>
          <form id="uploadNoticeForm" onsubmit="window.uploadNoticeImage(event)">
            <div class="form-group">
              <label>Select Image (PNG, JPEG, WebP - Max 2MB) *</label>
              <input type="file" id="uploadNoticeImage" accept="image/png,image/jpeg,image/webp" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Upload Notice</button>
          </form>
        </div>

        <div class="card">
          <h2>Featured Advertisements</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Business Name</th>
                <th>Offer</th>
                <th>Feature Start</th>
                <th>Feature End</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td><strong>Al-Noor Restaurant</strong></td>
                <td>20% Discount</td>
                <td>2026-09-01</td>
                <td>2026-09-30</td>
                <td><span class="badge badge-success">ACTIVE</span></td>
                <td>
                  <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td><strong>Fitness Plus Gym</strong></td>
                <td>Free Trial</td>
                <td>2026-09-10</td>
                <td>2026-09-25</td>
                <td><span class="badge badge-success">ACTIVE</span></td>
                <td>
                  <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      return html;

    } catch (error) {
      console.error('❌ Error loading ads:', error);
      return `<div class="error-message">❌ Error loading ads: ${error.message}</div>`;
    }
  },

  // ===== SYSTEM AUDIT LOG =====
  audit: async function() {
    try {
      const auditData = await window.api.getAuditLogs();

      let html = `
        <div class="page-header">
          <h1>🔍 System Audit Log</h1>
          <p>Read-only tracking log for all system events</p>
        </div>

        ${getLevelDropdown()}

        <div class="card">
          <h2>Multi-Filter Conditions</h2>
          <p style="font-size: 12px; color: #999; margin-bottom: 15px;">Displays entries only when ALL selected filters match concurrently</p>
          
          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <select id="auditCategory" onchange="window.applyAuditFilters()">
                <option value="">All Categories</option>
                <option value="MEMBER">Member</option>
                <option value="ATTENDANCE">Attendance</option>
                <option value="WALLET">Wallet/Payment</option>
                <option value="SESSION">Session Control</option>
                <option value="SHUTTLE">Shuttle Stock</option>
              </select>
            </div>
            <div class="form-group">
              <label>Activity</label>
              <select id="auditActivity" onchange="window.applyAuditFilters()">
                <option value="">All Activities</option>
                <option value="Badminton">Badminton</option>
                <option value="Cricket">Cricket</option>
                <option value="Tennis">Tennis</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Flight Level</label>
              <select id="auditLevel" onchange="window.applyAuditFilters()">
                <option value="">All Levels</option>
                <option value="Premier">Premier</option>
                <option value="Flight 1">Flight 1</option>
                <option value="Flight 2">Flight 2</option>
                <option value="Flight 3">Flight 3</option>
                <option value="Flight 4">Flight 4</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date</label>
              <input type="date" id="auditDate" onchange="window.applyAuditFilters()">
            </div>
          </div>

          <div class="form-group">
            <label>Member/Actor Name</label>
            <input type="text" id="auditMember" placeholder="Search by name..." onchange="window.applyAuditFilters()">
          </div>
        </div>

        <div class="card">
          <h2>Audit Log Entries</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Category</th>
                <th>Event</th>
                <th>Activity</th>
                <th>Level</th>
                <th>Member/Actor</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-09-14 11:30:00</td>
                <td><span class="badge badge-info">MEMBER</span></td>
                <td>Login</td>
                <td>Badminton</td>
                <td>Premier</td>
                <td>Ahmed Al-Mansouri</td>
                <td>Successful login</td>
              </tr>
              <tr>
                <td>2026-09-14 06:15:00</td>
                <td><span class="badge badge-success">ATTENDANCE</span></td>
                <td>Session Completed</td>
                <td>Badminton</td>
                <td>Premier</td>
                <td>Admin User</td>
                <td>3 players, BHD 0.167 per player</td>
              </tr>
              <tr>
                <td>2026-09-13 15:30:00</td>
                <td><span class="badge badge-warning">WALLET</span></td>
                <td>Credit Added</td>
                <td>Badminton</td>
                <td>Flight 1</td>
                <td>Super Admin</td>
                <td>BHD 10.000 added</td>
              </tr>
              <tr>
                <td>2026-09-13 10:00:00</td>
                <td><span class="badge badge-danger">SHUTTLE</span></td>
                <td>Stock Updated</td>
                <td>Badminton</td>
                <td>Premier</td>
                <td>Flight Admin</td>
                <td>+5 tubes, Price: BHD 3.000</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 20px;">
          <button class="btn btn-primary" onclick="window.printAuditLog()" style="width: 100%; padding: 12px;">
            🖨️ Print Audit Log
          </button>
        </div>
      `;

      return html;

    } catch (error) {
      console.error('❌ Error loading audit:', error);
      return `<div class="error-message">❌ Error loading audit: ${error.message}</div>`;
    }
  }
};

// ===== GLOBAL FUNCTIONS =====

window.onLevelChange = function() {
  const level = document.getElementById('levelFilter')?.value;
  console.log('Level changed to:', level);
  // Reload current page with new level filter
  window.navigateTo(window.appState?.currentPage || 'home');
};

window.createActivity = async function(event) {
  event.preventDefault();
  const activityName = document.getElementById('createActivity')?.value?.trim();

  if (!activityName) {
    alert('❌ Please enter activity name');
    return;
  }

  try {
    const response = await window.api.createActivity(activityName);
    if (response.success) {
      alert('✅ Activity created successfully');
      document.getElementById('createActivityForm').reset();
      window.navigateTo('flights');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.createFlight = async function(event) {
  event.preventDefault();
  const activity = document.getElementById('flightActivity')?.value;
  const flightName = document.getElementById('flightName')?.value?.trim();

  if (!activity || !flightName) {
    alert('❌ Please select activity and enter flight name');
    return;
  }

  try {
    const response = await window.api.createFlight(activity, flightName);
    if (response.success) {
      alert('✅ Flight created successfully');
      document.getElementById('createFlightForm').reset();
      window.navigateTo('flights');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.createMember = async function(event) {
  event.preventDefault();
  const name = document.getElementById('createMember')?.value?.trim();
  const phone = document.getElementById('memberPhone')?.value?.trim();
  const role = document.getElementById('memberRole')?.value;
  const flight = document.getElementById('memberFlight')?.value;

  if (!name || !phone || !role || !flight) {
    alert('❌ All fields are required');
    return;
  }

  try {
    const response = await window.api.createMember({
      name: name,
      phone: phone,
      role: role,
      flight: flight
    });

    if (response.success) {
      alert('✅ Member pre-registered successfully');
      document.getElementById('createMemberForm').reset();
      window.navigateTo('flights');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.sendWhatsAppLink = function(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = encodeURIComponent('Welcome to Indian Club Bahrain! Please activate your account to get started.');
  const waLink = `https://wa.me/${cleanPhone}?text=${message}`;
  window.open(waLink, '_blank');
};

window.deleteMember = async function(memberId) {
  if (confirm('Are you sure you want to permanently delete this member?')) {
    try {
      const response = await window.api.deleteMember(memberId);
      if (response.success) {
        alert('✅ Member deleted successfully');
        window.navigateTo('flights');
      } else {
        alert(`❌ ${response.message}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  }
};

window.deleteEntireMonth = async function() {
  const month = document.getElementById('masterMonth')?.value;

  if (!month) {
    alert('❌ Please select a month');
    return;
  }

  if (confirm(`Are you sure you want to clear the entire timetable for ${month}? This cannot be undone.`)) {
    try {
      const response = await window.api.deleteMonthTimetable(month);
      if (response.success) {
        alert('✅ Month timetable cleared');
        window.navigateTo('master');
      } else {
        alert(`❌ ${response.message}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  }
};

window.publishMonth = async function() {
  const month = document.getElementById('masterMonth')?.value;

  if (!month) {
    alert('❌ Please select a month');
    return;
  }

  try {
    const response = await window.api.publishMonth(month);
    if (response.success) {
      alert('✅ Month published successfully');
      window.navigateTo('master');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.importBulkTimetable = async function(event) {
  event.preventDefault();
  const csvData = document.getElementById('csvData')?.value?.trim();

  if (!csvData) {
    alert('❌ Please paste CSV data');
    return;
  }

  try {
    const lines = csvData.split('\n').filter(line => line.trim());
    const dataLines = lines.slice(1); // Remove header

    const timetable = [];
    for (let i = 0; i < dataLines.length; i++) {
      const parts = dataLines[i].split(',').map(p => p.trim());
      
      if (parts.length !== 4) {
        alert(`❌ Row ${i + 2} invalid: Expected 4 comma-separated values`);
        return;
      }

      timetable.push({
        weekday: parts[0],
        flight: parts[1],
        startTime: parts[2],
        endTime: parts[3]
      });
    }

    const response = await window.api.importTimetable(timetable);
    if (response.success) {
      alert(`✅ ${timetable.length} sessions imported successfully`);
      document.getElementById('importBulkTimetable').reset();
      window.navigateTo('master');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.updateFinanceMembers = async function() {
  const activity = document.getElementById('financeActivity')?.value;
  const flight = document.getElementById('financeFlightLevel')?.value;
  console.log('Filtering by activity:', activity, 'flight:', flight);
};

window.addCredit = async function() {
  const memberId = document.getElementById('financeCreditMember')?.value;
  const amountBHD = parseFloat(document.getElementById('financeAmount')?.value);

  if (!memberId || !amountBHD || amountBHD <= 0) {
    alert('❌ Please select member and enter valid amount');
    return;
  }

  try {
    const amountFils = Math.round(amountBHD * 1000);
    const response = await window.api.addCredit(memberId, amountFils);
    if (response.success) {
      alert('✅ Credit added successfully');
      document.getElementById('financeAmount').value = '';
      window.navigateTo('finance');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.deductCredit = async function() {
  const memberId = document.getElementById('financeCreditMember')?.value;
  const amountBHD = parseFloat(document.getElementById('financeAmount')?.value);

  if (!memberId || !amountBHD || amountBHD <= 0) {
    alert('❌ Please select member and enter valid amount');
    return;
  }

  try {
    const amountFils = Math.round(amountBHD * 1000);
    const response = await window.api.deductCredit(memberId, amountFils);
    if (response.success) {
      alert('✅ Credit deducted successfully');
      document.getElementById('financeAmount').value = '';
      window.navigateTo('finance');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.verifyPayment = async function(paymentId) {
  if (confirm('Verify this payment?')) {
    try {
      const response = await window.api.verifyPayment(paymentId);
      if (response.success) {
        alert('✅ Payment verified and credit added');
        window.navigateTo('finance');
      } else {
        alert(`❌ ${response.message}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  }
};

window.saveCarouselLimit = async function() {
  const limit = parseInt(document.getElementById('carouselAdCount')?.value);

  if (!limit || limit < 1 || limit > 10) {
    alert('❌ Limit must be between 1 and 10');
    return;
  }

  try {
    const response = await window.api.setCarouselLimit(limit);
    if (response.success) {
      alert('✅ Carousel limit saved');
      window.navigateTo('ads');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.uploadNoticeImage = async function(event) {
  event.preventDefault();
  const fileInput = document.getElementById('uploadNoticeImage');
  const file = fileInput?.files?.[0];

  if (!file) {
    alert('❌ Please select a file');
    return;
  }

  // Validate file type
  const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('❌ Only PNG, JPEG, and WebP files are allowed');
    return;
  }

  // Validate file size (2MB = 2 * 1024 * 1024 bytes)
  if (file.size > 2 * 1024 * 1024) {
    alert('❌ File size must be 2MB or less');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await window.api.uploadNoticeImage(formData);
    if (response.success) {
      alert('✅ Notice image uploaded successfully');
      document.getElementById('uploadNoticeForm').reset();
      window.navigateTo('ads');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.applyAuditFilters = async function() {
  const category = document.getElementById('auditCategory')?.value;
  const activity = document.getElementById('auditActivity')?.value;
  const level = document.getElementById('auditLevel')?.value;
  const date = document.getElementById('auditDate')?.value;
  const member = document.getElementById('auditMember')?.value?.trim();

  console.log('Applying filters:', { category, activity, level, date, member });

  try {
    const response = await window.api.getAuditLogs({
      category: category,
      activity: activity,
      level: level,
      date: date,
      member: member
    });

    if (response.success) {
      console.log('✅ Filters applied, results:', response.logs?.length);
    }
  } catch (error) {
    console.error('❌ Error applying filters:', error);
  }
};

window.printAuditLog = function() {
  window.print();
};

console.log('✅ adminViews.js loaded successfully');

