
// ============================================
// views.js - PLAYER EXPERIENCE MODULES
// ============================================

export const views = {
  // ===== HOME DASHBOARD =====
  home: () => {
    const member = window.appState.member;
    const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    const sessions = JSON.parse(localStorage.getItem('flightSessions') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Calculate Sessions Attended (COMPLETED sessions where status === "PRESENT")
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
    const attendedSessions = attendance.filter(a => 
      a.memberUid === member.uid && 
      a.status === 'PRESENT' && 
      completedSessions.find(s => s.id === a.sessionId)
    ).length;
    
    // Calculate Pending Amount (unpaid charges)
    const pendingAmount = transactions
      .filter(t => t.status === 'DUE' || t.status === 'PENDING_VERIFICATION')
      .reduce((sum, t) => sum + (t.amountFils || 0), 0);
    
    // Calculate Arrears (charges older than 24 hours)
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    const arrears = transactions
      .filter(t => t.status === 'DUE' && new Date(t.date).getTime() < twentyFourHoursAgo)
      .reduce((sum, t) => sum + (t.amountFils || 0), 0);
    
    // Get wallet balance
    const walletBalance = member.walletBalanceFils || 0;
    
    // Get upcoming session
    const upcomingSession = sessions.find(s => s.status === 'SCHEDULED' && s.flightId === member.flightId);
    
    let html = `
      <div class="page-header">
        <h1>🏠 Home Dashboard</h1>
        <p>Welcome back, ${member.fullName}!</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">🎯</div>
          <div class="stat-content">
            <h3>${attendedSessions}</h3>
            <p>Sessions Attended</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⏳</div>
          <div class="stat-content">
            <h3>${filsToBhd(pendingAmount)}</h3>
            <p>Pending Amount</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff4757;">⚠️</div>
          <div class="stat-content">
            <h3>${filsToBhd(arrears)}</h3>
            <p>Arrears (24h+)</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #00d4aa;">💰</div>
          <div class="stat-content">
            <h3>${filsToBhd(walletBalance)}</h3>
            <p>Wallet Credit</p>
          </div>
        </div>
      </div>
    `;

    if (upcomingSession) {
      html += `
        <div class="card">
          <h2>📅 Upcoming Session</h2>
          <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Flight:</strong> ${formatLevelName(upcomingSession.flightId)}</p>
            <p><strong>Date:</strong> ${upcomingSession.date}</p>
            <p><strong>Time:</strong> ${upcomingSession.startTime} - ${upcomingSession.endTime}</p>
            <p><strong>Courts:</strong> ${upcomingSession.courts}</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" onclick="respondToSession('${upcomingSession.id}', 'PRESENT')">✓ I am coming</button>
            <button class="btn btn-danger" onclick="respondToSession('${upcomingSession.id}', 'ABSENT')">✗ Not coming</button>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="card">
          <h2>📅 Upcoming Session</h2>
          <p style="color: #999;">No upcoming sessions scheduled</p>
        </div>
      `;
    }

    html += `
      <div class="card">
        <h2>📊 Quick Stats</h2>
        <table class="data-table">
          <tr>
            <td><strong>Member Since:</strong></td>
            <td>${formatDate(member.createdAt)}</td>
          </tr>
          <tr>
            <td><strong>Flight Level:</strong></td>
            <td>${member.flightName}</td>
          </tr>
          <tr>
            <td><strong>Account Status:</strong></td>
            <td><span class="badge badge-success">${member.status}</span></td>
          </tr>
        </table>
      </div>
    `;

    return html;
  },

  // ===== MY TIMETABLE =====
  timetable: () => {
    const member = window.appState.member;
    const timetable = JSON.parse(localStorage.getItem('timetable') || '[]');
    
    // Filter by member's flight
    const myTimetable = timetable.filter(slot => slot.flightId === member.flightId);

    let html = `
      <div class="page-header">
        <h1>📅 My Timetable</h1>
        <p>Your weekly schedule for ${member.flightName}</p>
      </div>

      <div class="card">
        <h2>Weekly Schedule</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Flight</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Courts</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (myTimetable.length === 0) {
      html += `<tr><td colspan="5" style="text-align: center; padding: 20px;">No timetable available</td></tr>`;
    } else {
      myTimetable.forEach(slot => {
        html += `
          <tr>
            <td><strong>${slot.day}</strong></td>
            <td>${formatLevelName(slot.flightId)}</td>
            <td>${slot.startTime}</td>
            <td>${slot.endTime}</td>
            <td>${slot.courts}</td>
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
  },

  // ===== ATTENDANCE =====
  attendance: () => {
    const member = window.appState.member;
    const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    const sessions = JSON.parse(localStorage.getItem('flightSessions') || '[]');
    
    // Get upcoming session
    const upcomingSession = sessions.find(s => s.status === 'SCHEDULED' && s.flightId === member.flightId);
    
    // STRICT FILTER: Only PRESENT players
    const presentPlayers = upcomingSession 
      ? attendance.filter(a => a.sessionId === upcomingSession.id && a.status === 'PRESENT')
      : [];

    let html = `
      <div class="page-header">
        <h1>✓ Attendance</h1>
        <p>Confirmed players for upcoming session</p>
      </div>

      <div class="card">
        <h2>Headcount: ${presentPlayers.length} Players</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (presentPlayers.length === 0) {
      html += `<tr><td colspan="3" style="text-align: center; padding: 20px;">No confirmed players yet</td></tr>`;
    } else {
      presentPlayers.forEach((player, index) => {
        html += `
          <tr>
            <td>${index + 1}</td>
            <td>${player.memberName}</td>
            <td><span class="badge badge-success">PRESENT</span></td>
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
  },

  // ===== WALLET & PAYMENTS =====
  wallet: () => {
    const member = window.appState.member;
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    let html = `
      <div class="page-header">
        <h1>💰 Wallet & Payments</h1>
        <p>Manage your account balance and payments</p>
      </div>

      <div class="card">
        <h2>Current Balance</h2>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; opacity: 0.9;">Available Credit</p>
          <h1 style="margin: 0; font-size: 48px;">${filsToBhd(member.walletBalanceFils)}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">BHD</p>
        </div>
      </div>

      <div class="card">
        <h2>Submit Payment</h2>
        <form onsubmit="submitPaymentForm(event)">
          <div class="form-group">
            <label>Payment Method *</label>
            <select id="paymentMethod" required>
              <option value="">Select method...</option>
              <option value="BENEFIT_PAY">BenefitPay</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div class="form-group">
            <label>Transaction Reference *</label>
            <input type="text" id="paymentRef" placeholder="e.g., BEN123456" required>
          </div>
          <div class="form-group">
            <label>Amount (BHD) *</label>
            <input type="number" id="paymentAmount" placeholder="0.000" step="0.001" min="0.001" required>
          </div>
          <button type="submit" class="btn btn-primary">Submit Payment for Verification</button>
        </form>
      </div>

      <div class="card">
        <h2>Transaction History</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (transactions.length === 0) {
      html += `<tr><td colspan="4" style="text-align: center; padding: 20px;">No transactions</td></tr>`;
    } else {
      transactions.forEach(tx => {
        const statusColor = tx.status === 'PAID' ? 'badge-success' : tx.status === 'DUE' ? 'badge-danger' : 'badge-warning';
        html += `
          <tr>
            <td>${tx.date}</td>
            <td>${tx.description}</td>
            <td>${filsToBhd(tx.amountFils)}</td>
            <td><span class="badge ${statusColor}">${tx.status}</span></td>
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
  },

  // ===== BAZAAR =====
  bazaar: () => {
    const businesses = JSON.parse(localStorage.getItem('businesses') || '[]');

    let html = `
      <div class="page-header">
        <h1>🛍️ BaZaar Directory</h1>
        <p>Exclusive offers from local sponsors</p>
      </div>

      <div class="card">
        <h2>Filter</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
          <div class="form-group">
            <label>Category</label>
            <select id="bazaarCategory">
              <option value="">All Categories</option>
              <option value="FOOD">Food & Dining</option>
              <option value="SPORTS">Sports & Fitness</option>
              <option value="RETAIL">Retail</option>
              <option value="SERVICES">Services</option>
            </select>
          </div>
          <div class="form-group">
            <label>Search</label>
            <input type="text" id="bazaarSearch" placeholder="Search businesses...">
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
    `;

    if (businesses.length === 0) {
      html += `<p>No businesses available</p>`;
    } else {
      businesses.forEach(biz => {
        html += `
          <div style="background: white; border: 1px solid #e0e6ed; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3>${biz.name}</h3>
            <p><strong>Category:</strong> ${biz.category}</p>
            <p><strong>Offer:</strong> ${biz.offer}</p>
            <p><strong>Address:</strong> ${biz.address}</p>
            ${biz.link ? `<p><a href="${biz.link}" target="_blank" class="btn btn-secondary" style="display: inline-block;">Visit Website</a></p>` : ''}
          </div>
        `;
      });
    }

    html += `
      </div>
    `;

    return html;
  },

  // ===== PROFILE =====
  profile: () => {
    const member = window.appState.member;

    let html = `
      <div class="page-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div class="card">
        <h2>Profile Information</h2>
        <table class="data-table">
          <tr>
            <td><strong>Full Name:</strong></td>
            <td>${member.fullName}</td>
          </tr>
          <tr>
            <td><strong>Email:</strong></td>
            <td>${member.email}</td>
          </tr>
          <tr>
            <td><strong>Phone:</strong></td>
            <td>${member.phone}</td>
          </tr>
          <tr>
            <td><strong>Flight Level:</strong></td>
            <td>${member.flightName}</td>
          </tr>
          <tr>
            <td><strong>Member Since:</strong></td>
            <td>${formatDate(member.createdAt)}</td>
          </tr>
        </table>
      </div>

      <div class="card">
        <h2>Change Password</h2>
        <form onsubmit="changePassword(event)">
          <div class="form-group">
            <label>Current Password *</label>
            <input type="password" id="currentPass" required>
          </div>
          <div class="form-group">
            <label>New Password *</label>
            <input type="password" id="newPass" required>
          </div>
          <div class="form-group">
            <label>Confirm Password *</label>
            <input type="password" id="confirmPass" required>
          </div>
          <button type="submit" class="btn btn-primary">Update Password</button>
        </form>
      </div>
    `;

    return html;
  },

  // ===== ACTIVITY LOGS =====
  logs: () => {
    const activityLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');

    let html = `
      <div class="page-header">
        <h1>📋 Activity Logs</h1>
        <p>Your recent activities</p>
      </div>

      <div class="card">
        <h2>Recent Activities</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (activityLogs.length === 0) {
      html += `<tr><td colspan="3" style="text-align: center; padding: 20px;">No activities</td></tr>`;
    } else {
      activityLogs.slice(-50).reverse().forEach(log => {
        html += `
          <tr>
            <td>${log.timestamp}</td>
            <td><strong>${log.action}</strong></td>
            <td>${log.details}</td>
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
  }
};

// ===== HELPER FUNCTIONS =====
window.respondToSession = async function(sessionId, status) {
  try {
    const result = await window.api.respondAttendance(sessionId, status);
    if (result.success) {
      showToast(`Marked as ${status}`, 'success');
      navigateTo('home');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.submitPaymentForm = async function(event) {
  event.preventDefault();
  
  const method = document.getElementById('paymentMethod').value;
  const reference = document.getElementById('paymentRef').value;
  const amountBHD = parseFloat(document.getElementById('paymentAmount').value);
  
  try {
    if (!method || !reference || !amountBHD) {
      throw new Error('Please fill all fields');
    }
    
    const result = await window.api.submitPayment(method, reference, amountBHD);
    if (result.success) {
      showToast(result.message, 'success');
      event.target.reset();
      navigateTo('wallet');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.changePassword = function(event) {
  event.preventDefault();
  const newPass = document.getElementById('newPass').value;
  const confirmPass = document.getElementById('confirmPass').value;
  
  if (newPass !== confirmPass) {
    showToast('Passwords do not match', 'error');
    return;
  }
  
  showToast('Password updated successfully', 'success');
  event.target.reset();
};

console.log('✅ views.js loaded successfully');

