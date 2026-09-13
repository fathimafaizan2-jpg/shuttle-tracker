
// ============================================
// views.js - PLAYER MODULE
// ============================================

export const views = {
  // HOME PAGE
  home: () => {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    const upcomingSession = sessions.find(s => s.status === 'SCHEDULED');
    
    let html = `
      <div class="page-header">
        <h1>Welcome Back!</h1>
        <p>Your dashboard overview</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">📊</div>
          <div class="stat-content">
            <h3>${sessions.filter(s => s.status === 'COMPLETED').length}</h3>
            <p>Sessions Attended</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #00d4aa;">💰</div>
          <div class="stat-content">
            <h3>${(localStorage.getItem('walletBalance') || '0.000')} BHD</h3>
            <p>Wallet Balance</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⚠️</div>
          <div class="stat-content">
            <h3>${(localStorage.getItem('pendingAmount') || '0.000')} BHD</h3>
            <p>Pending Amount</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff4757;">🔴</div>
          <div class="stat-content">
            <h3>${(localStorage.getItem('arrears') || '0.000')} BHD</h3>
            <p>Arrears (24h+)</p>
          </div>
        </div>
      </div>
    `;

    if (upcomingSession) {
      html += `
        <div class="card">
          <h2>Upcoming Session</h2>
          <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <p><strong>Flight:</strong> ${upcomingSession.flight}</p>
            <p><strong>Date:</strong> ${upcomingSession.date}</p>
            <p><strong>Time:</strong> ${upcomingSession.startTime} - ${upcomingSession.endTime}</p>
            <p><strong>Courts:</strong> Courts 1 & 2</p>
            <p><strong>Status:</strong> <span class="badge badge-info">SCHEDULED</span></p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" onclick="markAttendance('${upcomingSession.id}', 'PRESENT')">✓ I am coming</button>
            <button class="btn btn-danger" onclick="markAttendance('${upcomingSession.id}', 'ABSENT')">✗ Not coming</button>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="card">
          <h2>No Upcoming Sessions</h2>
          <p>Check back later for scheduled sessions.</p>
        </div>
      `;
    }

    return html;
  },

  // TIMETABLE PAGE
  timetable: () => {
    const timetable = JSON.parse(localStorage.getItem('timetable') || '[]');
    
    let html = `
      <div class="page-header">
        <h1>My Timetable</h1>
        <p>Your weekly flight schedule</p>
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

    if (timetable.length === 0) {
      html += `<tr><td colspan="5" style="text-align: center; padding: 20px;">No timetable assigned yet</td></tr>`;
    } else {
      timetable.forEach(slot => {
        html += `
          <tr>
            <td>${slot.day}</td>
            <td>${slot.flight}</td>
            <td>${slot.startTime}</td>
            <td>${slot.endTime}</td>
            <td>${slot.courts || 'Courts 1 & 2'}</td>
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

  // ATTENDANCE PAGE
  attendance: () => {
    const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    const presentPlayers = attendance.filter(a => a.status === 'PRESENT');
    
    let html = `
      <div class="page-header">
        <h1>Attendance</h1>
        <p>Track your session attendance</p>
      </div>

      <div class="card">
        <h2>Live Session Headcount</h2>
        <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h3 style="font-size: 32px; margin: 0;">${presentPlayers.length}</h3>
          <p style="margin: 0;">Players Present</p>
        </div>

        <h3>Attendance Roster</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Member ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (presentPlayers.length === 0) {
      html += `<tr><td colspan="3" style="text-align: center; padding: 20px;">No players marked present yet</td></tr>`;
    } else {
      presentPlayers.forEach(player => {
        html += `
          <tr>
            <td>${player.name}</td>
            <td>${player.memberId}</td>
            <td><span class="badge badge-success">PRESENT</span></td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>Attendance History</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    const history = JSON.parse(localStorage.getItem('attendanceHistory') || '[]');
    if (history.length === 0) {
      html += `<tr><td colspan="3" style="text-align: center; padding: 20px;">No attendance history</td></tr>`;
    } else {
      history.forEach(record => {
        const statusBadge = record.status === 'PRESENT' ? 'badge-success' : 'badge-danger';
        html += `
          <tr>
            <td>${record.date}</td>
            <td>${record.activity}</td>
            <td><span class="badge ${statusBadge}">${record.status}</span></td>
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

  // WALLET PAGE
  wallet: () => {
    const walletBalance = parseFloat(localStorage.getItem('walletBalance') || '0');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const arrears = JSON.parse(localStorage.getItem('arrears') || '[]');

    // Calculate arrears (charges older than 24 hours)
    const now = Date.now();
    const arrearsAmount = arrears
      .filter(a => (now - new Date(a.createdAt).getTime()) > 24 * 60 * 60 * 1000)
      .reduce((sum, a) => sum + a.amount, 0);

    let html = `
      <div class="page-header">
        <h1>Wallet & Payments</h1>
      </div>

      <div class="card">
        <h2>Current Balance</h2>
        <h3 style="color: #667eea; font-size: 32px;">${walletBalance.toFixed(3)} BHD</h3>
      </div>

      ${arrearsAmount > 0 ? `
        <div class="card" style="border-left: 4px solid #ff4757;">
          <h2>⚠️ Arrears Due</h2>
          <h3 style="color: #ff4757; font-size: 24px;">${arrearsAmount.toFixed(3)} BHD</h3>
          <p>Charges older than 24 hours require immediate payment</p>
        </div>
      ` : ''}

      <div class="card">
        <h2>Make Payment</h2>
        <form onsubmit="submitPayment(event)">
          <div class="form-group">
            <label>Payment Method *</label>
            <select id="paymentMethod" required>
              <option value="">Select method...</option>
              <option value="BENEFIT_PAY">Benefit Pay</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div class="form-group">
            <label>Reference Number *</label>
            <input type="text" id="reference" placeholder="Enter reference or receipt number" required>
          </div>
          <div class="form-group">
            <label>Amount (BHD) *</label>
            <input type="number" id="amount" placeholder="0.000" step="0.001" min="0.001" required>
          </div>
          <button type="submit" class="btn btn-primary">Submit Payment</button>
        </form>
      </div>

      <div class="card">
        <h2>Transaction History</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount (BHD)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (transactions.length === 0) {
      html += `<tr><td colspan="4" style="text-align: center; padding: 20px;">No transactions yet</td></tr>`;
    } else {
      transactions.forEach(tx => {
        const statusBadge = tx.status === 'PAID' ? 'badge-success' : tx.status === 'PENDING' ? 'badge-warning' : 'badge-danger';
        html += `
          <tr>
            <td>${tx.date}</td>
            <td>${tx.description}</td>
            <td>${tx.amount.toFixed(3)}</td>
            <td><span class="badge ${statusBadge}">${tx.status}</span></td>
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

  // BAZAAR PAGE
  bazaar: () => {
    const businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
    
    let html = `
      <div class="page-header">
        <h1>BaZaar Directory</h1>
        <p>Explore local businesses and special offers</p>
      </div>

      <div class="card">
        <h2>Submit Your Business</h2>
        <form onsubmit="submitBusiness(event)">
          <div class="form-group">
            <label>Business Name *</label>
            <input type="text" id="businessName" placeholder="Enter business name" required>
          </div>
          <div class="form-group">
            <label>Category *</label>
            <select id="businessCategory" required>
              <option value="">Select category...</option>
              <option value="FOOD">Food & Beverage</option>
              <option value="RETAIL">Retail</option>
              <option value="SERVICES">Services</option>
              <option value="SPORTS">Sports</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Discount Offer</label>
            <input type="text" id="businessOffer" placeholder="e.g., 10% Club Discount">
          </div>
          <div class="form-group">
            <label>Website/Social Link</label>
            <input type="url" id="businessLink" placeholder="https://...">
          </div>
          <div class="form-group">
            <label>Physical Address</label>
            <input type="text" id="businessAddress" placeholder="Enter address">
          </div>
          <div class="form-group">
            <label>Image</label>
            <input type="file" id="businessImage" accept="image/*">
          </div>
          <button type="submit" class="btn btn-primary">Submit for Approval</button>
        </form>
      </div>

      <div class="card">
        <h2>Featured Businesses</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
    `;

    if (businesses.length === 0) {
      html += `<p>No businesses listed yet</p>`;
    } else {
      businesses.forEach(biz => {
        html += `
          <div style="background: white; border: 1px solid #e0e6ed; border-radius: 8px; padding: 15px;">
            <h3>${biz.name}</h3>
            <p><strong>Category:</strong> ${biz.category}</p>
            <p><strong>Offer:</strong> ${biz.offer || 'N/A'}</p>
            <p><strong>Address:</strong> ${biz.address}</p>
            ${biz.link ? `<a href="${biz.link}" target="_blank" class="btn btn-secondary" style="display: inline-block;">Visit</a>` : ''}
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;

    return html;
  },

  // PROFILE PAGE
  profile: () => {
    const userEmail = localStorage.getItem('userEmail') || '';
    
    let html = `
      <div class="page-header">
        <h1>My Profile</h1>
      </div>

      <div class="card">
        <h2>Personal Information</h2>
        <form onsubmit="updateProfile(event)">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="fullName" placeholder="Enter your full name">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" value="${userEmail}" disabled>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="phone" placeholder="Enter your phone number">
          </div>
          <div class="form-group">
            <label>Member ID</label>
            <input type="text" id="memberId" placeholder="Your member ID" disabled>
          </div>
          <button type="submit" class="btn btn-primary">Update Profile</button>
        </form>
      </div>

      <div class="card">
        <h2>Change Password</h2>
        <form onsubmit="changePassword(event)">
          <div class="form-group">
            <label>Current Password</label>
            <input type="password" id="currentPassword" placeholder="Enter current password" required>
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" id="newPassword" placeholder="Enter new password" required>
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" id="confirmPassword" placeholder="Confirm new password" required>
          </div>
          <button type="submit" class="btn btn-primary">Change Password</button>
        </form>
      </div>
    `;

    return html;
  },

  // LOGS PAGE
  logs: () => {
    const activityLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    
    let html = `
      <div class="page-header">
        <h1>Activity Logs</h1>
        <p>Your account activity history</p>
      </div>

      <div class="card">
        <h2>Recent Activity</h2>
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
      html += `<tr><td colspan="3" style="text-align: center; padding: 20px;">No activity logs yet</td></tr>`;
    } else {
      activityLogs.forEach(log => {
        html += `
          <tr>
            <td>${log.timestamp}</td>
            <td>${log.action}</td>
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
window.markAttendance = function(sessionId, status) {
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  attendance.push({
    sessionId,
    status,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('attendance', JSON.stringify(attendance));
  alert(`Marked as ${status}`);
  location.reload();
};

window.submitPayment = function(event) {
  event.preventDefault();
  const method = document.getElementById('paymentMethod').value;
  const reference = document.getElementById('reference').value;
  const amount = parseFloat(document.getElementById('amount').value);

  if (!method || !reference || amount <= 0) {
    alert('Please fill all fields correctly');
    return;
  }

  const transaction = {
    date: new Date().toLocaleDateString(),
    description: `Payment via ${method}`,
    amount,
    status: 'PENDING_VERIFICATION',
    reference,
    method
  };

  const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));

  alert('Payment submitted for verification');
  event.target.reset();
};

window.submitBusiness = function(event) {
  event.preventDefault();
  const business = {
    name: document.getElementById('businessName').value,
    category: document.getElementById('businessCategory').value,
    offer: document.getElementById('businessOffer').value,
    link: document.getElementById('businessLink').value,
    address: document.getElementById('businessAddress').value,
    status: 'PENDING',
    submittedAt: new Date().toISOString()
  };

  const businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
  businesses.push(business);
  localStorage.setItem('businesses', JSON.stringify(businesses));

  alert('Business submitted for approval');
  event.target.reset();
};

window.updateProfile = function(event) {
  event.preventDefault();
  const profile = {
    fullName: document.getElementById('fullName').value,
    phone: document.getElementById('phone').value,
    memberId: document.getElementById('memberId').value
  };

  localStorage.setItem('userProfile', JSON.stringify(profile));
  alert('Profile updated successfully');
};

window.changePassword = function(event) {
  event.preventDefault();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  alert('Password changed successfully');
  event.target.reset();
};

console.log('✅ views.js loaded successfully');

