
// flightAdminViews.js - Level Admin Dashboard (Updated)

const flightAdminViews = {
  // Main Flight Admin Dashboard
  dashboard: () => {
    return `
      <div class="flight-admin-dashboard">
        <h1>Level Admin Dashboard</h1>
        
        <!-- Quick Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Next Game</h3>
            <p id="nextGameInfo" class="stat-text">Loading...</p>
          </div>
          <div class="stat-card">
            <h3>Players Coming</h3>
            <p id="playersComingCount" class="stat-number">0</p>
          </div>
          <div class="stat-card">
            <h3>Shuttle Stock</h3>
            <p id="shuttleStock" class="stat-number">0</p>
          </div>
          <div class="stat-card">
            <h3>Unpaid Amount</h3>
            <p id="unpaidAmountAdmin" class="stat-number">0.000 BHD</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="admin-tabs">
          <button class="tab-btn active" onclick="flightAdminViews.switchTab('attendance')">Attendance</button>
          <button class="tab-btn" onclick="flightAdminViews.switchTab('sessionControl')">Session Control</button>
          <button class="tab-btn" onclick="flightAdminViews.switchTab('shuttle')">Shuttle Stock</button>
          <button class="tab-btn" onclick="flightAdminViews.switchTab('reports')">Reports</button>
        </div>

        <!-- Tab Content -->
        <div id="tabContent" class="tab-content"></div>
      </div>
    `;
  },

  // Switch tabs
  switchTab: (tabName) => {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const content = document.getElementById('tabContent');
    
    switch(tabName) {
      case 'attendance':
        content.innerHTML = flightAdminViews.attendanceTab();
        flightAdminViews.loadAttendance();
        break;
      case 'sessionControl':
        content.innerHTML = flightAdminViews.sessionControlTab();
        flightAdminViews.loadSessionControl();
        break;
      case 'shuttle':
        content.innerHTML = flightAdminViews.shuttleTab();
        flightAdminViews.loadShuttleStock();
        break;
      case 'reports':
        content.innerHTML = flightAdminViews.reportsTab();
        break;
    }
  },

  // Attendance Tab
  attendanceTab: () => {
    return `
      <div class="attendance-section">
        <h2>Attendance Management</h2>
        
        <div class="filter-section">
          <label>Select Session:</label>
          <select id="sessionSelector" onchange="flightAdminViews.loadAttendance()">
            <option value="">Loading sessions...</option>
          </select>
        </div>

        <!-- Present List -->
        <div class="attendance-lists">
          <div class="list-container">
            <h3>✓ Coming (${document.querySelectorAll('.present-item').length})</h3>
            <div id="presentList" class="player-list">
              <p class="loading">Loading...</p>
            </div>
          </div>

          <!-- Absent List -->
          <div class="list-container">
            <h3>✗ Not Coming (${document.querySelectorAll('.absent-item').length})</h3>
            <div id="absentList" class="player-list">
              <p class="loading">Loading...</p>
            </div>
          </div>
        </div>

        <div class="section-controls">
          <button class="btn btn-primary" onclick="flightAdminViews.showAddPlayerForm()">+ Add Player</button>
          <button class="btn btn-secondary" onclick="flightAdminViews.finalizeAttendance()">Finalize Attendance</button>
        </div>
      </div>
    `;
  },

  // Load attendance
  loadAttendance: async () => {
    try {
      const sessionId = document.getElementById('sessionSelector')?.value;
      if (!sessionId) {
        // Load sessions first
        const sessionsResponse = await fetch('/api/sessions/upcoming', {
          headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });
        const sessionsData = await sessionsResponse.json();
        
        const selector = document.getElementById('sessionSelector');
        selector.innerHTML = sessionsData.sessions.map(s => `
          <option value="${s.id}">${new Date(s.startAt).toLocaleDateString('en-BH')} - ${s.activityName}</option>
        `).join('');
        
        if (sessionsData.sessions.length > 0) {
          selector.value = sessionsData.sessions[0].id;
          flightAdminViews.loadAttendance();
        }
        return;
      }

      const response = await fetch(`/api/attendance/session/${sessionId}/attendance-list`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      // Present list
      const presentList = document.getElementById('presentList');
      presentList.innerHTML = data.presentList.map(player => `
        <div class="player-item present-item">
          <span>${player.name}</span>
          <button class="btn-sm btn-remove" onclick="flightAdminViews.removeAttendee('${data.sessionId}', '${player.uid}')">Remove</button>
        </div>
      `).join('');

      // Absent list
      const absentList = document.getElementById('absentList');
      absentList.innerHTML = data.absentList.map(player => `
        <div class="player-item absent-item">
          <span>${player.name}</span>
          <button class="btn-sm btn-add" onclick="flightAdminViews.addAttendee('${data.sessionId}', '${player.uid}')">Add</button>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  },

  // Show add player form
  showAddPlayerForm: () => {
    const sessionId = document.getElementById('sessionSelector')?.value;
    if (!sessionId) {
      showNotification('Please select a session first', 'warning');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Add Player to Session</h3>
        <div class="form-group">
          <label>Select Player:</label>
          <select id="playerSelector">
            <option value="">Loading players...</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" onclick="flightAdminViews.addPlayerToSession('${sessionId}')">Add</button>
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Load players
    flightAdminViews.loadPlayersForSession();
  },

  // Load players for session
  loadPlayersForSession: async () => {
    try {
      const response = await fetch('/api/members/by-level', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const selector = document.getElementById('playerSelector');
      selector.innerHTML = data.members.map(m => `
        <option value="${m.uid}">${m.name}</option>
      `).join('');
    } catch (error) {
      console.error('Error loading players:', error);
    }
  },

  // Add player to session
  addPlayerToSession: async (sessionId) => {
    try {
      const memberUid = document.getElementById('playerSelector').value;
      
      const response = await fetch(`/api/attendance/session/${sessionId}/add-attendee`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberUid, action: 'add' })
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification('Player added', 'success');
        document.querySelector('.modal').remove();
        flightAdminViews.loadAttendance();
      }
    } catch (error) {
      showNotification('Error adding player', 'error');
    }
  },

  // Add attendee
  addAttendee: async (sessionId, memberUid) => {
    try {
      const response = await fetch(`/api/attendance/session/${sessionId}/add-attendee`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberUid, action: 'add' })
      });
      
      const result = await response.json();
      if (result.success) {
        flightAdminViews.loadAttendance();
      }
    } catch (error) {
      console.error('Error adding attendee:', error);
    }
  },

  // Remove attendee
  removeAttendee: async (sessionId, memberUid) => {
    try {
      const response = await fetch(`/api/attendance/session/${sessionId}/remove-attendee`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberUid, action: 'remove' })
      });
      
      const result = await response.json();
      if (result.success) {
        flightAdminViews.loadAttendance();
      }
    } catch (error) {
      console.error('Error removing attendee:', error);
    }
  },

  // Finalize attendance
  finalizeAttendance: async () => {
    try {
      const sessionId = document.getElementById('sessionSelector')?.value;
      const presentPlayers = Array.from(document.querySelectorAll('.present-item'))
        .map(el => el.dataset.uid);
      
      const response = await fetch(`/api/attendance/session/${sessionId}/mark-attended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attendedMemberUids: presentPlayers })
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification('Attendance finalized', 'success');
      }
    } catch (error) {
      showNotification('Error finalizing attendance', 'error');
    }
  },

  // Session Control Tab
  sessionControlTab: () => {
    return `
      <div class="session-control-section">
        <h2>Session Control</h2>
        
        <div class="filter-section">
          <label>Select Session:</label>
          <select id="sessionControlSelector" onchange="flightAdminViews.loadSessionControl()">
            <option value="">Loading sessions...</option>
          </select>
        </div>

        <!-- Session Info -->
        <div class="session-info-card">
          <h3>Session Details</h3>
          <div id="sessionDetails"></div>
        </div>

        <!-- Attendance Status -->
        <div class="attendance-status-card">
          <h3>Attendance Status</h3>
          <div id="attendanceStatus"></div>
        </div>

        <!-- Shuttle Entry -->
        <div class="shuttle-entry-card">
          <h3>Enter Shuttle Usage</h3>
          <form onsubmit="flightAdminViews.calculateShuttleCost(event)">
            <div class="form-group">
              <label>Tubes Used *</label>
              <input type="number" id="tubesUsed" min="0" required>
            </div>
            <div class="form-group">
              <label>Loose Shuttles</label>
              <input type="number" id="looseShuttles" min="0" value="0">
            </div>
            <div class="form-group">
              <label>Tube Price (BHD) *</label>
              <input type="number" id="tubePrice" step="0.001" required>
            </div>
            <div class="form-group">
              <label>Shuttles Per Tube *</label>
              <input type="number" id="shuttlesPerTube" value="12" required>
            </div>
            <button type="submit" class="btn btn-primary">Calculate Cost</button>
          </form>
        </div>

        <!-- Cost Calculation Result -->
        <div id="costResult" class="cost-result-card" style="display: none;">
          <h3>Cost Calculation</h3>
          <div id="costDetails"></div>
          <button class="btn btn-success" onclick="flightAdminViews.publishCharges()">Publish Charges</button>
        </div>
      </div>
    `;
  },

  // Load session control
  loadSessionControl: async () => {
    try {
      const sessionId = document.getElementById('sessionControlSelector')?.value;
      if (!sessionId) {
        // Load sessions
        const sessionsResponse = await fetch('/api/sessions/upcoming', {
          headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });
        const sessionsData = await sessionsResponse.json();
        
        const selector = document.getElementById('sessionControlSelector');
        selector.innerHTML = sessionsData.sessions.map(s => `
          <option value="${s.id}">${new Date(s.startAt).toLocaleDateString('en-BH')} - ${s.activityName}</option>
        `).join('');
        
        if (sessionsData.sessions.length > 0) {
          selector.value = sessionsData.sessions[0].id;
          flightAdminViews.loadSessionControl();
        }
        return;
      }

      const response = await fetch(`/api/sessionControl/session/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      // Session details
      const sessionDetails = document.getElementById('sessionDetails');
      sessionDetails.innerHTML = `
        <p><strong>Date:</strong> ${new Date(data.session.startAt).toLocaleDateString('en-BH')}</p>
        <p><strong>Time:</strong> ${new Date(data.session.startAt).toLocaleTimeString('en-BH')}</p>
        <p><strong>Activity:</strong> ${data.session.activityName}</p>
        <p><strong>Status:</strong> <span class="badge badge-${data.session.status}">${data.session.status}</span></p>
      `;

      // Attendance status
      const attendanceStatus = document.getElementById('attendanceStatus');
      attendanceStatus.innerHTML = `
        <div class="status-grid">
          <div class="status-item">
            <h4>Coming</h4>
            <p class="count">${data.attendanceList.filter(a => a.status === 'present').length}</p>
          </div>
          <div class="status-item">
            <h4>Not Coming</h4>
            <p class="count">${data.attendanceList.filter(a => a.status === 'absent').length}</p>
          </div>
        </div>
        <div class="player-list">
          ${data.attendanceList.map(player => `
            <div class="player-item ${player.status}">
              <span>${player.name}</span>
              <span class="status-badge">${player.status === 'present' ? '✓' : '✗'}</span>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      console.error('Error loading session control:', error);
    }
  },

  // Calculate shuttle cost
  calculateShuttleCost: async (event) => {
    event.preventDefault();
    try {
      const sessionId = document.getElementById('sessionControlSelector')?.value;
      
      const response = await fetch('/api/shuttle/calculate-cost', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          tubesUsed: parseInt(document.getElementById('tubesUsed').value),
          looseShuttles: parseInt(document.getElementById('looseShuttles').value),
          tubePrice: parseFloat(document.getElementById('tubePrice').value) * 1000, // Convert to fils
          shuttlesPerTube: parseInt(document.getElementById('shuttlesPerTube').value)
        })
      });
      
      const result = await response.json();
      if (result.success) {
        const costResult = document.getElementById('costResult');
        const costDetails = document.getElementById('costDetails');
        
        costDetails.innerHTML = `
          <table class="compact-table">
            <tr>
              <td>Total Available Shuttles:</td>
              <td>${result.calculation.totalAvailableShuttles}</td>
            </tr>
            <tr>
              <td>Total Cost:</td>
              <td>${(result.calculation.totalCostBhd).toFixed(3)} BHD</td>
            </tr>
            <tr>
              <td>Players Attending:</td>
              <td>${result.calculation.presentCount}</td>
            </tr>
            <tr>
              <td>Cost Per Player:</td>
              <td>${(result.calculation.costPerPlayerBhd).toFixed(3)} BHD</td>
            </tr>
          </table>
          <div class="charges-list">
            <h4>Player Charges:</h4>
            ${result.calculation.charges.map(c => `
              <div class="charge-item">
                <span>${c.memberUid}</span>
                <span>${(c.chargeBhd).toFixed(3)} BHD</span>
              </div>
            `).join('')}
          </div>
        `;
        
        costResult.style.display = 'block';
        showNotification('Cost calculated', 'success');
      }
    } catch (error) {
      showNotification('Error calculating cost', 'error');
    }
  },

  // Publish charges
  publishCharges: async () => {
    try {
      showNotification('Charges published to players', 'success');
    } catch (error) {
      showNotification('Error publishing charges', 'error');
    }
  },

  // Shuttle Tab
  shuttleTab: () => {
    return `
      <div class="shuttle-section">
        <h2>Shuttle Stock Management</h2>
        
        <!-- Current Stock -->
        <div class="stock-card">
          <h3>Current Stock</h3>
          <div id="currentStock" class="stock-display">
            <p class="loading">Loading...</p>
          </div>
        </div>

        <!-- Update Stock -->
        <div class="update-stock-card">
          <h3>Update Stock</h3>
          <form onsubmit="flightAdminViews.updateStock(event)">
            <div class="form-group">
              <label>Tubes *</label>
              <input type="number" id="stockTubes" min="0" required>
            </div>
            <div class="form-group">
              <label>Loose Shuttles</label>
              <input type="number" id="stockLoose" min="0" value="0">
            </div>
            <div class="form-group">
              <label>Shuttles Per Tube</label>
              <input type="number" id="stockPerTube" value="12" required>
            </div>
            <button type="submit" class="btn btn-primary">Update Stock</button>
          </form>
        </div>

        <!-- Refill Log -->
        <div class="refill-log-card">
          <h3>Refill History</h3>
          <div id="refillLog" class="log-list">
            <p class="loading">Loading...</p>
          </div>
        </div>
      </div>
    `;
  },

  // Load shuttle stock
  loadShuttleStock: async () => {
    try {
      const response = await fetch('/api/shuttle/inventory', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      
      const stockDisplay = document.getElementById('currentStock');
      stockDisplay.innerHTML = `
        <div class="stock-info">
          <p><strong>Tubes:</strong> ${data.tubes}</p>
          <p><strong>Loose Shuttles:</strong> ${data.looseShuttles}</p>
          <p><strong>Total Available:</strong> ${data.totalAvailable}</p>
          ${data.lowStockAlert ? '<p class="alert">⚠ Low stock alert!</p>' : ''}
        </div>
      `;
    } catch (error) {
      console.error('Error loading shuttle stock:', error);
    }
  },

  // Update stock
  updateStock: async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/shuttle/inventory/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tubes: parseInt(document.getElementById('stockTubes').value),
          looseShuttles: parseInt(document.getElementById('stockLoose').value),
          shuttlesPerTube: parseInt(document.getElementById('stockPerTube').value),
          action: 'refill'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification('Stock updated', 'success');
        flightAdminViews.loadShuttleStock();
      }
    } catch (error) {
      showNotification('Error updating stock', 'error');
    }
  },

  // Reports Tab
  reportsTab: () => {
    return `
      <div class="reports-section">
        <h2>Reports & Logs</h2>
        
        <div class="filter-section">
          <label>Select Month:</label>
          <select id="reportMonth" onchange="flightAdminViews.loadReports()">
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

        <!-- Attendance Logs -->
        <div class="report-card">
          <h3>Attendance Logs</h3>
          <div id="attendanceLogs" class="log-table">
            <p class="loading">Loading...</p>
          </div>
          <button class="btn btn-secondary" onclick="flightAdminViews.printReport('attendance')">Print</button>
        </div>

        <!-- Paid Players -->
        <div class="report-card">
          <h3>Paid Players</h3>
          <div id="paidPlayers" class="log-table">
            <p class="loading">Loading...</p>
          </div>
          <button class="btn btn-secondary" onclick="flightAdminViews.printReport('paid')">Print</button>
        </div>

        <!-- Unpaid Players -->
        <div class="report-card">
          <h3>Unpaid Players</h3>
          <div id="unpaidPlayers" class="log-table">
            <p class="loading">Loading...</p>
          </div>
          <button class="btn btn-secondary" onclick="flightAdminViews.printReport('unpaid')">Print</button>
        </div>

        <!-- Shuttle Logs -->
        <div class="report-card">
          <h3>Shuttle Logs</h3>
          <div id="shuttleLogs" class="log-table">
            <p class="loading">Loading...</p>
          </div>
          <button class="btn btn-secondary" onclick="flightAdminViews.printReport('shuttle')">Print</button>
        </div>
      </div>
    `;
  },

  // Load reports
  loadReports: async () => {
    try {
      const month = document.getElementById('reportMonth')?.value || new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      
      // Attendance logs
      const attendanceResponse = await fetch(`/api/reports/attendance-logs?month=${month}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const attendanceData = await attendanceResponse.json();
      
      document.getElementById('attendanceLogs').innerHTML = `
        <table class="compact-table">
          <thead>
            <tr><th>Date</th><th>Member</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${attendanceData.attendanceLogs.map(log => `
              <tr>
                <td>${new Date(log.date).toLocaleDateString('en-BH')}</td>
                <td>${log.memberName}</td>
                <td>${log.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      // Paid players
      const paidResponse = await fetch(`/api/reports/paid-players?month=${month}&year=${year}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const paidData = await paidResponse.json();
      
      document.getElementById('paidPlayers').innerHTML = `
        <table class="compact-table">
          <thead>
            <tr><th>Date</th><th>Member</th><th>Amount</th><th>Method</th></tr>
          </thead>
          <tbody>
            ${paidData.paidPlayers.map(player => `
              <tr>
                <td>${new Date(player.date).toLocaleDateString('en-BH')}</td>
                <td>${player.memberName}</td>
                <td>${(player.amount).toFixed(3)} BHD</td>
                <td>${player.paymentMethod}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      // Unpaid players
      const unpaidResponse = await fetch(`/api/reports/unpaid-players`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const unpaidData = await unpaidResponse.json();
      
      document.getElementById('unpaidPlayers').innerHTML = `
        <table class="compact-table">
          <thead>
            <tr><th>Member</th><th>Amount Due</th><th>Days Overdue</th></tr>
          </thead>
          <tbody>
            ${unpaidData.unpaidPlayers.map(player => `
              <tr>
                <td>${player.memberName}</td>
                <td>${(player.amountDue).toFixed(3)} BHD</td>
                <td>${player.daysOverdue}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  },

  // Print report
  printReport: (reportType) => {
    window.print();
  }
};

