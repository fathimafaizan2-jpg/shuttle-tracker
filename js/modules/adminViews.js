
// adminViews.js - Super Admin Dashboard (Updated)

const adminViews = {
  // Main Admin Dashboard
  dashboard: () => {
    return `
      <div class="admin-dashboard">
        <h1>Super Admin Dashboard</h1>
        
        <!-- Quick Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Members</h3>
            <p id="totalMembers" class="stat-number">0</p>
          </div>
          <div class="stat-card">
            <h3>Active Sessions</h3>
            <p id="activeSessions" class="stat-number">0</p>
          </div>
          <div class="stat-card">
            <h3>Unpaid Amount</h3>
            <p id="unpaidAmount" class="stat-number">0.000 BHD</p>
          </div>
          <div class="stat-card">
            <h3>Pending Approvals</h3>
            <p id="pendingApprovals" class="stat-number">0</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="admin-tabs">
          <button class="tab-btn active" onclick="adminViews.switchTab('members')">Members</button>
          <button class="tab-btn" onclick="adminViews.switchTab('timetable')">Timetable</button>
          <button class="tab-btn" onclick="adminViews.switchTab('advertising')">Advertising</button>
          <button class="tab-btn" onclick="adminViews.switchTab('reports')">Reports</button>
          <button class="tab-btn" onclick="adminViews.switchTab('logs')">Logs</button>
        </div>

        <!-- Tab Content -->
        <div id="tabContent" class="tab-content"></div>
      </div>
    `;
  },

  // Switch between tabs
  switchTab: (tabName) => {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const content = document.getElementById('tabContent');
    
    switch(tabName) {
      case 'members':
        content.innerHTML = adminViews.membersTab();
        adminViews.loadMembers();
        break;
      case 'timetable':
        content.innerHTML = adminViews.timetableTab();
        adminViews.loadTimetable();
        break;
      case 'advertising':
        content.innerHTML = adminViews.advertisingTab();
        adminViews.loadAdvertising();
        break;
      case 'reports':
        content.innerHTML = adminViews.reportsTab();
        break;
      case 'logs':
        content.innerHTML = adminViews.logsTab();
        adminViews.loadLogs();
        break;
    }
  },

  // Members Tab
  membersTab: () => {
    return `
      <div class="members-section">
        <h2>Members Management</h2>
        
        <div class="section-controls">
          <button class="btn btn-primary" onclick="adminViews.showMemberForm()">+ Add Member</button>
          <button class="btn btn-secondary" onclick="adminViews.showPreRegisterForm()">+ Pre-Register</button>
          <button class="btn btn-secondary" onclick="adminViews.showDeletedUsers()">Deleted Users</button>
        </div>

        <!-- Level Filter Dropdown -->
        <div class="filter-section">
          <label>Filter by Level:</label>
          <select id="levelFilter" onchange="adminViews.filterMembersByLevel()">
            <option value="">All Levels</option>
            <option value="flight1">Flight 1</option>
            <option value="flight2">Flight 2</option>
            <option value="flight3">Flight 3</option>
          </select>
        </div>

        <!-- Members Table -->
        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Member ID</th>
                <th>Phone</th>
                <th>Level</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="membersTableBody">
              <tr><td colspan="7" class="loading">Loading members...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Load members
  loadMembers: async () => {
    try {
      const levelFilter = document.getElementById('levelFilter')?.value || '';
      const response = await fetch(`/api/members${levelFilter ? `?level=${levelFilter}` : ''}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const tbody = document.getElementById('membersTableBody');
      tbody.innerHTML = data.members.map(member => `
        <tr>
          <td>${member.fullName}</td>
          <td>${member.memberId}</td>
          <td>${member.phone}</td>
          <td>${member.flightName}</td>
          <td><span class="badge badge-${member.role.toLowerCase()}">${member.role}</span></td>
          <td><span class="badge badge-${member.status}">${member.status}</span></td>
          <td>
            <button class="btn-sm btn-edit" onclick="adminViews.editMember('${member.uid}')">Edit</button>
            <button class="btn-sm btn-deactivate" onclick="adminViews.deactivateMember('${member.uid}')">Deactivate</button>
            <button class="btn-sm btn-delete" onclick="adminViews.deleteMemberPermanently('${member.uid}')">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error loading members:', error);
      document.getElementById('membersTableBody').innerHTML = '<tr><td colspan="7" class="error">Error loading members</td></tr>';
    }
  },

  // Show member form
  showMemberForm: () => {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Add New Member</h3>
        <form onsubmit="adminViews.saveMember(event)">
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" id="memberName" required>
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input type="email" id="memberEmail" required>
          </div>
          <div class="form-group">
            <label>Phone *</label>
            <input type="tel" id="memberPhone" required>
          </div>
          <div class="form-group">
            <label>Level *</label>
            <select id="memberLevel" required>
              <option value="">Select Level</option>
              <option value="flight1">Flight 1</option>
              <option value="flight2">Flight 2</option>
              <option value="flight3">Flight 3</option>
            </select>
          </div>
          <div class="form-group">
            <label>Role *</label>
            <select id="memberRole" required>
              <option value="PLAYER">Player</option>
              <option value="LEVEL_ADMIN">Level Admin</option>
            </select>
          </div>
          <div class="form-group">
            <label>Initial Credit (BHD)</label>
            <input type="number" id="memberCredit" step="0.001" value="0">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save Member</button>
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  },

  // Save member
  saveMember: async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/members/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: document.getElementById('memberName').value,
          email: document.getElementById('memberEmail').value,
          phone: document.getElementById('memberPhone').value,
          flightId: document.getElementById('memberLevel').value,
          role: document.getElementById('memberRole').value,
          creditAmount: parseFloat(document.getElementById('memberCredit').value) * 1000
        })
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification('Member created successfully', 'success');
        document.querySelector('.modal').remove();
        adminViews.loadMembers();
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      showNotification('Error creating member', 'error');
    }
  },

  // Show pre-register form
  showPreRegisterForm: () => {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Pre-Register Member</h3>
        <form onsubmit="adminViews.savePreRegister(event)">
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" id="preRegName" required>
          </div>
          <div class="form-group">
            <label>Phone/WhatsApp *</label>
            <input type="tel" id="preRegPhone" required>
          </div>
          <div class="form-group">
            <label>Level *</label>
            <select id="preRegLevel" required>
              <option value="">Select Level</option>
              <option value="flight1">Flight 1</option>
              <option value="flight2">Flight 2</option>
              <option value="flight3">Flight 3</option>
            </select>
          </div>
          <div class="form-group">
            <label>Initial Credit (BHD)</label>
            <input type="number" id="preRegCredit" step="0.001" value="2">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Pre-Register</button>
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  },

  // Save pre-register
  savePreRegister: async (event) => {
    event.preventDefault();
    try {
      const phone = document.getElementById('preRegPhone').value;
      const name = document.getElementById('preRegName').value;
      const credit = parseFloat(document.getElementById('preRegCredit').value);
      
      // Create pre-register record
      const response = await fetch('/api/members/pre-register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: name,
          phone,
          flightId: document.getElementById('preRegLevel').value,
          creditAmount: credit * 1000
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Show WhatsApp message option
        const whatsappMessage = `Hi ${name}, you have been pre-registered for Indian Club Bahrain. Your initial credit: ${credit} BHD. Please complete your registration at: [APP_LINK]`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
        
        showNotification('Pre-registration created. Opening WhatsApp...', 'success');
        window.open(whatsappUrl, '_blank');
        
        document.querySelector('.modal').remove();
        adminViews.loadMembers();
      }
    } catch (error) {
      showNotification('Error pre-registering member', 'error');
    }
  },

  // Deactivate member
  deactivateMember: async (uid) => {
    if (!confirm('Deactivate this member?')) return;
    
    try {
      const response = await fetch(`/api/members/${uid}/deactivate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification('Member deactivated', 'success');
        adminViews.loadMembers();
      }
    } catch (error) {
      showNotification('Error deactivating member', 'error');
    }
  },

  // Delete member permanently
  deleteMemberPermanently: async (uid) => {
    if (!confirm('PERMANENTLY DELETE this member? This cannot be undone.')) return;
    
    try {
      const reason = prompt('Reason for deletion:');
      if (!reason) return;
      
      const response = await fetch(`/api/members/${uid}/delete-permanently`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification('Member permanently deleted', 'success');
        adminViews.loadMembers();
      }
    } catch (error) {
      showNotification('Error deleting member', 'error');
    }
  },

  // Show deleted users
  showDeletedUsers: async () => {
    try {
      const response = await fetch('/api/members/deleted-users/log', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content large">
          <h3>Deleted Users Audit Log</h3>
          <div class="table-container">
            <table class="compact-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Deleted At</th>
                  <th>Deleted By</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                ${data.deletedUsers.map(user => `
                  <tr>
                    <td>${user.fullName}</td>
                    <td>${user.phone}</td>
                    <td>${new Date(user.deletedAt).toLocaleDateString('en-BH')}</td>
                    <td>${user.deletedBy}</td>
                    <td>${user.reason}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
        </div>
      `;
      document.body.appendChild(modal);
    } catch (error) {
      showNotification('Error loading deleted users', 'error');
    }
  },

  // Timetable Tab
  timetableTab: () => {
    return `
      <div class="timetable-section">
        <h2>Timetable Management</h2>
        
        <div class="section-controls">
          <button class="btn btn-primary" onclick="adminViews.showTimetableForm()">+ Add Session</button>
          <button class="btn btn-secondary" onclick="adminViews.showMonthSelector()">View Month</button>
        </div>

        <!-- Month Selector -->
        <div class="filter-section">
          <label>Select Month:</label>
          <select id="monthSelector" onchange="adminViews.loadTimetable()">
            <option value="">Current Month</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>

        <!-- Timetable Table -->
        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Level</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="timetableTableBody">
              <tr><td colspan="6" class="loading">Loading timetable...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Load timetable
  loadTimetable: async () => {
    try {
      const month = document.getElementById('monthSelector')?.value || new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      
      const response = await fetch(`/api/timetable?month=${month}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const tbody = document.getElementById('timetableTableBody');
      tbody.innerHTML = data.sessions.map(session => `
        <tr>
          <td>${new Date(session.startAt).toLocaleDateString('en-BH')}</td>
          <td>${session.activityName}</td>
          <td>${session.flightName}</td>
          <td>${new Date(session.startAt).toLocaleTimeString('en-BH', { hour: '2-digit', minute: '2-digit' })}</td>
          <td><span class="badge badge-${session.status}">${session.status}</span></td>
          <td>
            <button class="btn-sm btn-edit" onclick="adminViews.editSession('${session.id}')">Edit</button>
            <button class="btn-sm btn-delete" onclick="adminViews.deleteSession('${session.id}')">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error loading timetable:', error);
    }
  },

  // Show timetable form
  showTimetableForm: () => {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Add Session</h3>
        <form onsubmit="adminViews.saveSession(event)">
          <div class="form-group">
            <label>Activity *</label>
            <select id="sessionActivity" required>
              <option value="">Select Activity</option>
              <option value="badminton">Badminton</option>
              <option value="cricket">Cricket</option>
            </select>
          </div>
          <div class="form-group">
            <label>Level *</label>
            <select id="sessionLevel" required>
              <option value="">Select Level</option>
              <option value="flight1">Flight 1</option>
              <option value="flight2">Flight 2</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date *</label>
            <input type="date" id="sessionDate" required>
          </div>
          <div class="form-group">
            <label>Time *</label>
            <input type="time" id="sessionTime" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save Session</button>
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  },

  // Save session
  saveSession: async (event) => {
    event.preventDefault();
    try {
      const date = document.getElementById('sessionDate').value;
      const time = document.getElementById('sessionTime').value;
      const startAt = new Date(`${date}T${time}`);
      
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activityId: document.getElementById('sessionActivity').value,
          flightId: document.getElementById('sessionLevel').value,
          startAt: startAt.toISOString()
        })
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification('Session created', 'success');
        document.querySelector('.modal').remove();
        adminViews.loadTimetable();
      }
    } catch (error) {
      showNotification('Error creating session', 'error');
    }
  },

  // Advertising Tab
  advertisingTab: () => {
    return `
      <div class="advertising-section">
        <h2>Advertising Management</h2>
        
        <div class="section-controls">
          <button class="btn btn-primary" onclick="adminViews.showCarouselSettings()">Carousel Settings</button>
          <button class="btn btn-secondary" onclick="adminViews.showPendingAds()">Pending Approvals</button>
        </div>

        <!-- Ads Table -->
        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Business Name</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="adsTableBody">
              <tr><td colspan="7" class="loading">Loading ads...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Load advertising
  loadAdvertising: async () => {
    try {
      const response = await fetch('/api/advertising/all-ads', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const tbody = document.getElementById('adsTableBody');
      tbody.innerHTML = data.ads.map(ad => `
        <tr>
          <td>${ad.referenceId}</td>
          <td>${ad.businessName}</td>
          <td><span class="badge badge-${ad.status}">${ad.status}</span></td>
          <td>${ad.featured ? '✓ Yes' : '✗ No'}</td>
          <td>${ad.startDate ? new Date(ad.startDate).toLocaleDateString('en-BH') : '-'}</td>
          <td>${ad.endDate ? new Date(ad.endDate).toLocaleDateString('en-BH') : '-'}</td>
          <td>
            <button class="btn-sm btn-edit" onclick="adminViews.editAd('${ad.id}')">Edit</button>
            <button class="btn-sm btn-warning" onclick="adminViews.removeFromCarousel('${ad.id}')">Unpublish</button>
            <button class="btn-sm btn-delete" onclick="adminViews.deleteAdPermanently('${ad.id}')">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error loading ads:', error);
    }
  },

  // Show carousel settings
  showCarouselSettings: () => {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Carousel Settings</h3>
        <form onsubmit="adminViews.saveCarouselSettings(event)">
          <div class="form-group">
            <label>Max Ads in Carousel (1-10) *</label>
            <input type="number" id="maxAds" min="1" max="10" value="5" required>
          </div>
          <div class="form-group">
            <label>Select Ads to Feature:</label>
            <div id="adsList" class="checkbox-list"></div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save Settings</button>
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    adminViews.loadAdsForCarousel();
  },

  // Load ads for carousel
  loadAdsForCarousel: async () => {
    try {
      const response = await fetch('/api/advertising/all-ads', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const adsList = document.getElementById('adsList');
      adsList.innerHTML = data.ads.filter(ad => ad.status === 'approved').map(ad => `
        <label class="checkbox-item">
          <input type="checkbox" value="${ad.id}" ${ad.featured ? 'checked' : ''}>
          ${ad.businessName}
        </label>
      `).join('');
    } catch (error) {
      console.error('Error loading ads:', error);
    }
  },

  // Save carousel settings
  saveCarouselSettings: async (event) => {
    event.preventDefault();
    try {
      const maxAds = parseInt(document.getElementById('maxAds').value);
      const selectedAds = Array.from(document.querySelectorAll('.checkbox-item input:checked'))
        .map(cb => cb.value);
      
      const response = await fetch('/api/advertising/carousel/set-ads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adIds: selectedAds, maxAds })
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification('Carousel updated', 'success');
        document.querySelector('.modal').remove();
      }
    } catch (error) {
      showNotification('Error updating carousel', 'error');
    }
  },

  // Remove from carousel
  removeFromCarousel: async (adId) => {
    if (!confirm('Remove from carousel? (Ad will remain in BaZaar)')) return;
    
    try {
      const response = await fetch(`/api/advertising/${adId}/remove-from-carousel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification('Ad removed from carousel', 'success');
        adminViews.loadAdvertising();
      }
    } catch (error) {
      showNotification('Error removing ad', 'error');
    }
  },

  // Delete ad permanently
  deleteAdPermanently: async (adId) => {
    if (!confirm('PERMANENTLY DELETE this ad? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/advertising/${adId}/delete-permanently`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirmDelete: true })
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification('Ad permanently deleted', 'success');
        adminViews.loadAdvertising();
      }
    } catch (error) {
      showNotification('Error deleting ad', 'error');
    }
  },

  // Reports Tab
  reportsTab: () => {
    return `
      <div class="reports-section">
        <h2>Reports & Analytics</h2>
        
        <div class="section-controls">
          <button class="btn btn-primary" onclick="adminViews.generateReport('attendance')">Attendance Report</button>
          <button class="btn btn-primary" onclick="adminViews.generateReport('payments')">Payments Report</button>
          <button class="btn btn-primary" onclick="adminViews.generateReport('shuttle')">Shuttle Report</button>
        </div>

        <div id="reportContent"></div>
      </div>
    `;
  },

  // Generate report
  generateReport: async (reportType) => {
    try {
      const response = await fetch(`/api/reports/generate?type=${reportType}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const content = document.getElementById('reportContent');
      content.innerHTML = `
        <div class="report-container">
          <h3>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h3>
          <pre>${JSON.stringify(data, null, 2)}</pre>
          <button class="btn btn-secondary" onclick="adminViews.exportReport('${reportType}')">Export to CSV</button>
        </div>
      `;
    } catch (error) {
      showNotification('Error generating report', 'error');
    }
  },

  // Logs Tab
  logsTab: () => {
    return `
      <div class="logs-section">
        <h2>System Logs</h2>
        
        <div class="filter-section">
          <label>Log Type:</label>
          <select id="logTypeFilter" onchange="adminViews.loadLogs()">
            <option value="">All Logs</option>
            <option value="attendance">Attendance Changes</option>
            <option value="payment">Payment Updates</option>
            <option value="member">Member Changes</option>
            <option value="admin">Admin Actions</option>
          </select>
        </div>

        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody id="logsTableBody">
              <tr><td colspan="4" class="loading">Loading logs...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Load logs
  loadLogs: async () => {
    try {
      const logType = document.getElementById('logTypeFilter')?.value || '';
      const response = await fetch(`/api/audit-logs${logType ? `?type=${logType}` : ''}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const tbody = document.getElementById('logsTableBody');
      tbody.innerHTML = data.logs.map(log => `
        <tr>
          <td>${new Date(log.timestamp).toLocaleString('en-BH')}</td>
          <td>${log.action}</td>
          <td>${log.userName}</td>
          <td>${log.details}</td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  }
};

