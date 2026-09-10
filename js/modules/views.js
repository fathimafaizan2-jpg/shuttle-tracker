
// views.js - Player Dashboard (Updated - Complete)

const views = {
  // Main Player Home
  home: () => {
    return `
      <div class="player-home">
        <h1>Home</h1>
        
        <!-- Upcoming Game Card -->
        <div class="card upcoming-game-card">
          <h2>Next Game</h2>
          <div id="upcomingGameContent">
            <p class="loading">Loading...</p>
          </div>
        </div>

        <!-- I'm Coming / Not Coming Toggle -->
        <div class="card attendance-toggle-card" id="attendanceToggleCard" style="display: none;">
          <h2>Will you attend?</h2>
          <div class="button-group">
            <button class="btn btn-success" id="imComingBtn" onclick="views.toggleAttendance('present')">
              ✓ I'm Coming
            </button>
            <button class="btn btn-danger" id="notComingBtn" onclick="views.toggleAttendance('absent')">
              ✗ Not Coming
            </button>
          </div>
          <p id="attendanceStatus" class="status-text"></p>
        </div>

        <!-- Wallet Balance Card -->
        <div class="card wallet-card">
          <h2>Wallet Balance</h2>
          <div class="balance-display">
            <span id="walletBalance" class="balance-amount">0.000 BHD</span>
          </div>
          <p id="walletStatus" class="wallet-status"></p>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button class="btn btn-primary" onclick="views.navigateTo('timetable')">View Timetable</button>
          <button class="btn btn-secondary" onclick="views.navigateTo('bazaar')">Browse BaZaar</button>
        </div>
      </div>
    `;
  },

  // Initialize home page
  initHome: () => {
    views.fetchUpcomingGame();
    views.fetchWalletBalance();
  },

  // Fetch upcoming game
  fetchUpcomingGame: async () => {
    try {
      const response = await fetch('/api/attendance/upcoming-game', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      if (data.upcomingGame) {
        const game = data.upcomingGame;
        const gameDate = new Date(game.date);
        
        document.getElementById('upcomingGameContent').innerHTML = `
          <div class="game-info">
            <p class="game-date"><strong>${gameDate.toLocaleDateString('en-BH')}</strong></p>
            <p class="game-time">${gameDate.toLocaleTimeString('en-BH', { hour: '2-digit', minute: '2-digit' })}</p>
            <p class="game-activity">${game.activity} - ${game.flight}</p>
          </div>
        `;
        
        // Show attendance toggle
        document.getElementById('attendanceToggleCard').style.display = 'block';
        views.updateAttendanceStatus(game.isAttending);
      } else {
        document.getElementById('upcomingGameContent').innerHTML = '<p>No upcoming games within 10 days</p>';
      }
    } catch (error) {
      console.error('Error fetching upcoming game:', error);
      document.getElementById('upcomingGameContent').innerHTML = '<p class="error">Error loading game</p>';
    }
  },

  // Toggle attendance
  toggleAttendance: async (status) => {
    try {
      const gameResponse = await fetch('/api/attendance/upcoming-game', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const gameData = await gameResponse.json();
      
      if (!gameData.upcomingGame) {
        showNotification('No upcoming game', 'warning');
        return;
      }

      const response = await fetch('/api/attendance/toggle-attendance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: gameData.upcomingGame.sessionId,
          status
        })
      });
      
      const result = await response.json();
      if (result.success) {
        views.updateAttendanceStatus(status);
        showNotification(`Marked as ${status}`, 'success');
      }
    } catch (error) {
      console.error('Error toggling attendance:', error);
      showNotification('Error updating attendance', 'error');
    }
  },

  // Update attendance status display
  updateAttendanceStatus: (status) => {
    const statusEl = document.getElementById('attendanceStatus');
    const comingBtn = document.getElementById('imComingBtn');
    const notComingBtn = document.getElementById('notComingBtn');
    
    if (!comingBtn || !notComingBtn) return;
    
    comingBtn.classList.remove('active');
    notComingBtn.classList.remove('active');
    
    if (status === 'present') {
      comingBtn.classList.add('active');
      statusEl.textContent = '✓ You are coming';
      statusEl.className = 'status-text success';
    } else if (status === 'absent') {
      notComingBtn.classList.add('active');
      statusEl.textContent = '✗ You are not coming';
      statusEl.className = 'status-text danger';
    } else {
      statusEl.textContent = 'Please select';
      statusEl.className = 'status-text';
    }
  },

  // Fetch wallet balance
  fetchWalletBalance: async () => {
    try {
      const response = await fetch('/api/finance/wallet-balance', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      const balanceBhd = (data.balance / 1000).toFixed(3);
      
      document.getElementById('walletBalance').textContent = `${balanceBhd} BHD`;
      
      const statusEl = document.getElementById('walletStatus');
      if (data.balance < 0) {
        statusEl.textContent = `⚠ Amount Due: ${Math.abs(balanceBhd)} BHD`;
        statusEl.className = 'wallet-status danger';
      } else if (data.balance === 0) {
        statusEl.textContent = 'No balance';
        statusEl.className = 'wallet-status warning';
      } else {
        statusEl.textContent = 'Available';
        statusEl.className = 'wallet-status success';
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  },

  // Timetable Page
  timetable: () => {
    return `
      <div class="timetable-page">
        <h1>Timetable</h1>
        
        <div class="filter-section">
          <label>Select Activity:</label>
          <select id="activityFilter" onchange="views.loadTimetable()">
            <option value="">All Activities</option>
            <option value="badminton">Badminton</option>
            <option value="cricket">Cricket</option>
          </select>
        </div>

        <div class="filter-section">
          <label>Select Month:</label>
          <select id="monthFilter" onchange="views.loadTimetable()">
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

        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Level</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="timetableBody">
              <tr><td colspan="5" class="loading">Loading timetable...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Load timetable
  loadTimetable: async () => {
    try {
      const activity = document.getElementById('activityFilter')?.value || '';
      const month = document.getElementById('monthFilter')?.value || new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      
      const response = await fetch(`/api/timetable?month=${month}&year=${year}${activity ? `&activity=${activity}` : ''}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const tbody = document.getElementById('timetableBody');
      tbody.innerHTML = data.sessions.map(session => `
        <tr>
          <td>${new Date(session.startAt).toLocaleDateString('en-BH')}</td>
          <td>${session.activityName}</td>
          <td>${session.flightName}</td>
          <td>${new Date(session.startAt).toLocaleTimeString('en-BH', { hour: '2-digit', minute: '2-digit' })}</td>
          <td><span class="badge badge-${session.status}">${session.status}</span></td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error loading timetable:', error);
    }
  },

  // Attendance Page
  attendance: () => {
    return `
      <div class="attendance-page">
        <h1>Attendance Log</h1>
        
        <div class="filter-section">
          <label>Select Activity:</label>
          <select id="attendanceActivityFilter" onchange="views.loadAttendanceLogs()">
            <option value="">All Activities</option>
            <option value="badminton">Badminton</option>
            <option value="cricket">Cricket</option>
          </select>
        </div>

        <div class="filter-section">
          <label>Select Month:</label>
          <select id="attendanceMonthFilter" onchange="views.loadAttendanceLogs()">
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

        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="attendanceBody">
              <tr><td colspan="3" class="loading">Loading attendance...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Load attendance logs
  loadAttendanceLogs: async () => {
    try {
      const activity = document.getElementById('attendanceActivityFilter')?.value || '';
      const month = document.getElementById('attendanceMonthFilter')?.value || new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      
      const response = await fetch(`/api/attendance/my-logs?month=${month}&year=${year}${activity ? `&activity=${activity}` : ''}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const tbody = document.getElementById('attendanceBody');
      tbody.innerHTML = data.logs.map(log => `
        <tr>
          <td>${new Date(log.date).toLocaleDateString('en-BH')}</td>
          <td>${log.activityName}</td>
          <td><span class="badge badge-${log.status}">${log.status}</span></td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error loading attendance logs:', error);
    }
  },

  // Logs Page
  logs: () => {
    return `
      <div class="logs-page">
        <h1>Activity Logs</h1>
        
        <div class="filter-section">
          <label>Log Type:</label>
          <select id="logTypeFilter" onchange="views.loadActivityLogs()">
            <option value="">All Logs</option>
            <option value="attendance">Attendance</option>
            <option value="payment">Payment</option>
            <option value="wallet">Wallet</option>
          </select>
        </div>

        <div class="table-container">
          <table class="compact-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody id="logsBody">
              <tr><td colspan="3" class="loading">Loading logs...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // Load activity logs
  loadActivityLogs: async () => {
    try {
      const logType = document.getElementById('logTypeFilter')?.value || '';
      
      const response = await fetch(`/api/activity-logs${logType ? `?type=${logType}` : ''}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const tbody = document.getElementById('logsBody');
      tbody.innerHTML = data.logs.map(log => `
        <tr>
          <td>${new Date(log.timestamp).toLocaleString('en-BH')}</td>
          <td>${log.action}</td>
          <td>${log.details}</td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  },

  // Wallet Page
  wallet: () => {
    return `
      <div class="wallet-page">
        <h1>Wallet & Payments</h1>
        
        <!-- Balance Card -->
        <div class="card balance-card">
          <h2>Current Balance</h2>
          <div class="balance-display">
            <span id="walletBalanceDetail" class="balance-amount">0.000 BHD</span>
          </div>
        </div>

        <!-- Payment Options -->
        <div class="card payment-options-card">
          <h2>Payment Options</h2>
          <div class="button-group">
            <button class="btn btn-primary" onclick="views.useCredit()">Use Credit</button>
            <button class="btn btn-secondary" onclick="views.payByCash()">Pay by Cash</button>
            <button class="btn btn-secondary" onclick="views.payByBenefit()">Pay by Benefit</button>
            <button class="btn btn-secondary" onclick="views.payByWhatsApp()">Pay via WhatsApp</button>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="card transaction-history-card">
          <h2>Transaction History</h2>
          <div class="table-container">
            <table class="compact-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="transactionBody">
                <tr><td colspan="4" class="loading">Loading transactions...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // Use credit
  useCredit: async () => {
    try {
      const response = await fetch('/api/finance/use-credit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const result = await response.json();
      if (result.success) {
        showNotification('Credit deducted', 'success');
        views.fetchWalletBalance();
      }
    } catch (error) {
      showNotification('Error using credit', 'error');
    }
  },

  // Pay by cash
  payByCash: () => {
    showNotification('Please contact admin for cash payment', 'info');
  },

  // Pay by benefit
  payByBenefit: () => {
    showNotification('Benefit payment details will be provided by admin', 'info');
  },

  // Pay via WhatsApp
  payByWhatsApp: async () => {
    try {
      const memberData = await fetch('/api/members/me', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      }).then(r => r.json());
      
      const message = `Hi, I want to make a payment for Indian Club. My Member ID: ${memberData.memberId}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      showNotification('Error opening WhatsApp', 'error');
    }
  },

  // BaZaar Page
  bazaar: () => {
    return `
      <div class="bazaar-page">
        <h1>BaZaar - Community Directory</h1>
        
        <div class="filter-section">
          <label>Category:</label>
          <select id="categoryFilter" onchange="views.loadBazaar()">
            <option value="">All Categories</option>
            <option value="restaurant">Restaurants</option>
            <option value="grocery">Grocery</option>
            <option value="fashion">Fashion</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="services">Services</option>
          </select>
        </div>

        <div class="search-section">
          <input type="text" id="bazaarSearch" placeholder="Search businesses..." onkeyup="views.loadBazaar()">
        </div>

        <div id="bazaarContent" class="bazaar-grid">
          <p class="loading">Loading businesses...</p>
        </div>
      </div>
    `;
  },

  // Load BaZaar
  loadBazaar: async () => {
    try {
      const category = document.getElementById('categoryFilter')?.value || '';
      const search = document.getElementById('bazaarSearch')?.value || '';
      
      const response = await fetch(`/api/bazaar?category=${category}&search=${search}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const content = document.getElementById('bazaarContent');
      content.innerHTML = data.businesses.map(business => `
        <div class="business-card">
          <img src="${business.imageUrl}" alt="${business.name}" class="business-image">
          <h3>${business.name}</h3>
          <p class="category">${business.category}</p>
          <p class="description">${business.description}</p>
          <p class="contact">${business.phone}</p>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading BaZaar:', error);
    }
  },

  // Profile Page
  profile: () => {
    return `
      <div class="profile-page">
        <h1>My Profile</h1>
        
        <div class="card profile-card">
          <div class="profile-header">
            <img id="profilePhoto" src="/default-avatar.png" alt="Profile" class="profile-photo">
            <div class="profile-info">
              <h2 id="profileName">Loading...</h2>
              <p id="profileEmail">Loading...</p>
              <p id="profileMemberId">Loading...</p>
            </div>
          </div>

          <div class="profile-actions">
            <button class="btn btn-secondary" onclick="views.uploadProfilePhoto()">Upload Photo</button>
            <button class="btn btn-danger" onclick="views.deleteProfilePhoto()">Delete Photo</button>
          </div>

          <div class="profile-details">
            <h3>Account Details</h3>
            <p><strong>Phone:</strong> <span id="profilePhone">Loading...</span></p>
            <p><strong>Level:</strong> <span id="profileLevel">Loading...</span></p>
            <p><strong>Role:</strong> <span id="profileRole">Loading...</span></p>
            <p><strong>Status:</strong> <span id="profileStatus">Loading...</span></p>
          </div>

          <div class="profile-actions">
            <button class="btn btn-primary" onclick="views.changePassword()">Change Password</button>
            <button class="btn btn-danger" onclick="views.signOut()">Sign Out</button>
          </div>
        </div>
      </div>
    `;
  },

  // Upload profile photo
  uploadProfilePhoto: () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append('photo', file);
      
      try {
        const response = await fetch('/api/members/upload-photo', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getAuthToken()}` },
          body: formData
        });
        
        const result = await response.json();
        if (result.success) {
          showNotification('Photo uploaded', 'success');
          document.getElementById('profilePhoto').src = result.photoUrl;
        }
      } catch (error) {
        showNotification('Error uploading photo', 'error');
      }
    };
    input.click();
  },

  // Delete profile photo
  deleteProfilePhoto: async () => {
    if (!confirm('Delete profile photo?')) return;
    
    try {
      const response = await fetch('/api/members/delete-photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification('Photo deleted', 'success');
        document.getElementById('profilePhoto').src = '/default-avatar.png';
      }
    } catch (error) {
      showNotification('Error deleting photo', 'error');
    }
  },

  // Change password
  changePassword: () => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    
    showNotification('Password change feature coming soon', 'info');
  },

  // Sign out
  signOut: () => {
    if (confirm('Sign out?')) {
      window.dispatchEvent(new CustomEvent('indianclub:signout'));
    }
  },

  // Navigate to page
  navigateTo: (page) => {
    navigate(page);
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (views.initHome) views.initHome();
});

