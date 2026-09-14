
// ============================================
// views.js - PLAYER PAGES (COMPLETE)
// ============================================

export const views = {
  // ===== HOME DASHBOARD =====
  home: async function() {
    const member = window.appState?.member;
    const role = window.appState?.role;

    if (!member) {
      return '<div class="error-message">❌ Member data not found</div>';
    }

    try {
      // Fetch member's attendance data
      const attendanceData = await window.api.getAttendance(member.id);
      const sessionsData = await window.api.getSessions(member.flightId);

      // Calculate metrics
      const sessionsAttended = attendanceData?.attendance?.filter(a => a.status === 'PRESENT').length || 0;
      const pendingAmount = member.pendingAmount || 0;
      const arrears = member.arrears || 0;
      const walletBalanceBHD = (member.walletBalanceFils || 0) / 1000;

      // Find upcoming session
      const upcomingSession = sessionsData?.sessions?.find(s => s.status === 'SCHEDULED') || null;

      // Update app state
      window.setState({
        sessionsAttended: sessionsAttended,
        pendingAmount: pendingAmount,
        arrears: arrears,
        walletBalanceFils: member.walletBalanceFils || 0,
        upcomingSession: upcomingSession
      });

      let html = `
        <div class="page-header">
          <h1>👋 Welcome, ${member.fullName}</h1>
          <p>Your personal dashboard</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: #e3f2fd; color: #1976d2;">📊</div>
            <div class="stat-content">
              <h3>${sessionsAttended}</h3>
              <p>Sessions Attended</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #fff3e0; color: #f57c00;">⏳</div>
            <div class="stat-content">
              <h3>BHD ${(pendingAmount / 1000).toFixed(3)}</h3>
              <p>Pending Amount</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #ffebee; color: #d32f2f;">⚠️</div>
            <div class="stat-content">
              <h3>BHD ${(arrears / 1000).toFixed(3)}</h3>
              <p>Arrears</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: #e8f5e9; color: #388e3c;">💰</div>
            <div class="stat-content">
              <h3>BHD ${walletBalanceBHD.toFixed(3)}</h3>
              <p>Wallet Credit</p>
            </div>
          </div>
        </div>
      `;

      // Upcoming Session Card
      if (upcomingSession) {
        html += `
          <div class="card">
            <h2>📅 Upcoming Session</h2>
            <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Activity:</strong> ${upcomingSession.activity}</p>
              <p><strong>Day:</strong> ${upcomingSession.day}</p>
              <p><strong>Time:</strong> ${upcomingSession.startTime} - ${upcomingSession.endTime}</p>
              <p><strong>Flight:</strong> ${upcomingSession.flight}</p>
              <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="btn btn-success" onclick="window.respondToSession('${upcomingSession.id}', 'PRESENT')" data-self-attendance="PRESENT">
                  ✓ I am coming
                </button>
                <button class="btn btn-danger" onclick="window.respondToSession('${upcomingSession.id}', 'ABSENT')" data-self-attendance="ABSENT">
                  ✗ Not coming
                </button>
              </div>
            </div>
          </div>
        `;
      }

      html += `
        <div class="card">
          <h2>📊 Quick Stats</h2>
          <table class="data-table">
            <tr>
              <td><strong>Member Since:</strong></td>
              <td>${member.memberSince || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Flight Level:</strong></td>
              <td>${member.flightId || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Status:</strong></td>
              <td><span class="badge badge-success">${member.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
            </tr>
            <tr>
              <td><strong>Role:</strong></td>
              <td>${role === 'LEVEL_ADMIN' ? 'Flight Admin' : role === 'SUPER_ADMIN' ? 'Super Admin' : 'Player'}</td>
            </tr>
          </table>
        </div>
      `;

      return html;

    } catch (error) {
      console.error('❌ Error loading home:', error);
      return `<div class="error-message">❌ Error loading dashboard: ${error.message}</div>`;
    }
  },

  // ===== MY TIMETABLE =====
  timetable: async function() {
    const member = window.appState?.member;

    if (!member) {
      return '<div class="error-message">❌ Member data not found</div>';
    }

    try {
      const timetableData = await window.api.getTimetable(member.flightId);
      const timetable = timetableData?.timetable || [];

      let html = `
        <div class="page-header">
          <h1>📅 My Timetable</h1>
          <p>Weekly schedule for ${member.flightId} flight</p>
        </div>

        <div class="card">
          <h2>Weekly Schedule</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Level</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Activity</th>
                <th>Court</th>
              </tr>
            </thead>
            <tbody>
      `;

      if (timetable.length === 0) {
        html += '<tr><td colspan="6" style="text-align: center; color: #999;">No sessions scheduled</td></tr>';
      } else {
        timetable.forEach(slot => {
          html += `
            <tr>
              <td><strong>${slot.day}</strong></td>
              <td>${slot.level}</td>
              <td>${slot.startTime}</td>
              <td>${slot.endTime}</td>
              <td>${slot.activity}</td>
              <td>${slot.court}</td>
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
      console.error('❌ Error loading timetable:', error);
      return `<div class="error-message">❌ Error loading timetable: ${error.message}</div>`;
    }
  },

  // ===== ATTENDANCE ROSTER =====
  attendance: async function() {
    const member = window.appState?.member;

    if (!member) {
      return '<div class="error-message">❌ Member data not found</div>';
    }

    try {
      const sessionsData = await window.api.getSessions(member.flightId);
      const upcomingSession = sessionsData?.sessions?.find(s => s.status === 'SCHEDULED');

      if (!upcomingSession) {
        return `
          <div class="page-header">
            <h1>✓ Attendance Roster</h1>
            <p>Real-time headcount for upcoming sessions</p>
          </div>
          <div class="card">
            <p style="color: #999; text-align: center; padding: 40px;">No upcoming sessions</p>
          </div>
        `;
      }

      const attendanceData = await window.api.getAttendance(upcomingSession.id);
      const presentMembers = attendanceData?.attendance?.filter(a => a.status === 'PRESENT') || [];

      let html = `
        <div class="page-header">
          <h1>✓ Attendance Roster</h1>
          <p>Real-time headcount for ${upcomingSession.day} - ${upcomingSession.startTime}</p>
        </div>

        <div class="card">
          <h2>Present Members (${presentMembers.length})</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Status</th>
                <th>Time In</th>
              </tr>
            </thead>
            <tbody>
      `;

      if (presentMembers.length === 0) {
        html += '<tr><td colspan="4" style="text-align: center; color: #999;">No members present yet</td></tr>';
      } else {
        presentMembers.forEach((member, index) => {
          html += `
            <tr>
              <td>${index + 1}</td>
              <td><strong>${member.name}</strong></td>
              <td><span class="badge badge-success">PRESENT</span></td>
              <td>${member.timeIn || 'N/A'}</td>
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
      console.error('❌ Error loading attendance:', error);
      return `<div class="error-message">❌ Error loading attendance: ${error.message}</div>`;
    }
  },

  // ===== WALLET & PAYMENTS =====
  wallet: async function() {
    const member = window.appState?.member;

    if (!member) {
      return '<div class="error-message">❌ Member data not found</div>';
    }

    const walletBalanceBHD = (member.walletBalanceFils || 0) / 1000;

    let html = `
      <div class="page-header">
        <h1>💰 Wallet & Payments</h1>
        <p>Manage your account balance and payments</p>
      </div>

      <div class="card">
        <h2>Current Balance</h2>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <p style="font-size: 14px; opacity: 0.9;">Available Balance</p>
          <h1 style="font-size: 48px; margin: 10px 0;">BHD ${walletBalanceBHD.toFixed(3)}</h1>
          <p style="font-size: 12px; opacity: 0.8;">${member.walletBalanceFils} Fils</p>
        </div>
      </div>

      <div class="card">
        <h2>Submit Payment</h2>
        <form id="paymentForm" onsubmit="window.submitPayment(event)">
          <div class="form-row">
            <div class="form-group">
              <label>Payment Method *</label>
              <select id="paymentMethod" required>
                <option value="">Select method</option>
                <option value="BENEFIT_PAY">BenefitPay</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
            <div class="form-group">
              <label>Reference Number *</label>
              <input type="text" id="paymentRef" placeholder="Transaction reference" required>
            </div>
          </div>

          <div class="form-group">
            <label>Amount (BHD) *</label>
            <input type="number" id="paymentAmount" placeholder="0.000" step="0.001" min="0" required>
          </div>

          <button type="submit" class="btn btn-primary" id="submitPaymentBtn">Submit Payment</button>
        </form>
      </div>

      <div class="card">
        <h2>Payment Statement</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount (BHD)</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-09-14</td>
              <td>Session charge - Badminton</td>
              <td>-0.167</td>
              <td>Deduction</td>
              <td><span class="badge badge-success">PAID</span></td>
            </tr>
            <tr>
              <td>2026-09-13</td>
              <td>Manual credit</td>
              <td>+10.000</td>
              <td>Credit</td>
              <td><span class="badge badge-success">VERIFIED</span></td>
            </tr>
            <tr>
              <td>2026-09-12</td>
              <td>Payment submission</td>
              <td>+5.000</td>
              <td>Credit</td>
              <td><span class="badge badge-warning">PENDING</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    return html;
  },

  // ===== MY PROFILE =====
  profile: async function() {
    const member = window.appState?.member;

    if (!member) {
      return '<div class="error-message">❌ Member data not found</div>';
    }

    let html = `
      <div class="page-header">
        <h1>👤 My Profile</h1>
        <p>Manage your personal information</p>
      </div>

      <div class="card">
        <h2>Personal Information</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" value="${member.fullName}" disabled>
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" value="${member.email}" disabled>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" value="${member.phone}" disabled>
          </div>
          <div class="form-group">
            <label>Member Since</label>
            <input type="text" value="${member.memberSince || 'N/A'}" disabled>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Activity Information</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Primary Activity</label>
            <input type="text" value="Badminton" disabled>
          </div>
          <div class="form-group">
            <label>Flight Level</label>
            <input type="text" value="${member.flightId}" disabled>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Status</label>
            <input type="text" value="${member.active ? 'ACTIVE' : 'INACTIVE'}" disabled>
          </div>
          <div class="form-group">
            <label>Role</label>
            <input type="text" value="${member.role}" disabled>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Change Password</h2>
        <form id="changePasswordForm" onsubmit="window.changePassword(event)">
          <div class="form-group">
            <label>Current Password *</label>
            <input type="password" id="currentPassword" placeholder="••••••••" required>
          </div>

          <div class="form-group">
            <label>New Password *</label>
            <input type="password" id="newPassword" placeholder="••••••••" minlength="6" required>
          </div>

          <div class="form-group">
            <label>Confirm New Password *</label>
            <input type="password" id="confirmPassword" placeholder="••••••••" minlength="6" required>
          </div>

          <button type="submit" class="btn btn-primary">Update Password</button>
        </form>
      </div>
    `;

    return html;
  },

  // ===== BAZAAR =====
  bazaar: async function() {
    let html = `
      <div class="page-header">
        <h1>🛍️ BaZaar - Community Marketplace</h1>
        <p>Buy, sell, and connect with club members</p>
      </div>

      <div class="card">
        <h2>Post New Item</h2>
        <form id="bazaarForm" onsubmit="window.submitBazaarItem(event)">
          <div class="form-row">
            <div class="form-group">
              <label>Item Title *</label>
              <input type="text" id="bazaarTitle" placeholder="What are you selling?" required>
            </div>
            <div class="form-group">
              <label>Category *</label>
              <select id="bazaarCategory" required>
                <option value="">Select category</option>
                <option value="sports">Sports Equipment</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="clothing">Clothing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Price (BHD) *</label>
              <input type="number" id="bazaarPrice" placeholder="0.000" step="0.001" min="0" required>
            </div>
            <div class="form-group">
              <label>Contact Number *</label>
              <input type="tel" id="bazaarPhone" placeholder="+973 XXXX XXXX" required>
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea id="bazaarDescription" placeholder="Describe your item..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary">Post Item</button>
        </form>
      </div>

      <div class="card">
        <h2>Available Items</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
          <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px;">
            <h4>Badminton Racket</h4>
            <p style="color: #999; font-size: 12px;">Sports Equipment</p>
            <p style="margin: 10px 0;"><strong>BHD 25.000</strong></p>
            <p style="font-size: 13px; color: #666;">Barely used, excellent condition</p>
            <button class="btn btn-secondary" style="width: 100%; margin-top: 10px;">Contact Seller</button>
          </div>

          <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px;">
            <h4>Sports Shoes</h4>
            <p style="color: #999; font-size: 12px;">Clothing</p>
            <p style="margin: 10px 0;"><strong>BHD 35.000</strong></p>
            <p style="font-size: 13px; color: #666;">Size 42, professional grade</p>
            <button class="btn btn-secondary" style="width: 100%; margin-top: 10px;">Contact Seller</button>
          </div>
        </div>
      </div>
    `;

    return html;
  },

  // ===== ACTIVITY LOGS =====
  logs: async function() {
    const member = window.appState?.member;

    if (!member) {
      return '<div class="error-message">❌ Member data not found</div>';
    }

    let html = `
      <div class="page-header">
        <h1>📜 Activity Logs</h1>
        <p>Your personal activity history</p>
      </div>

      <div class="card">
        <h2>Login & Authentication Logs</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Event</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-09-14 11:30:00</td>
              <td>Login successful</td>
              <td><span class="badge badge-success">SUCCESS</span></td>
            </tr>
            <tr>
              <td>2026-09-13 18:45:00</td>
              <td>Login successful</td>
              <td><span class="badge badge-success">SUCCESS</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>Attendance Logs</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Session</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-09-14</td>
              <td>Badminton - Premier</td>
              <td><span class="badge badge-success">PRESENT</span></td>
              <td>06:00</td>
            </tr>
            <tr>
              <td>2026-09-12</td>
              <td>Badminton - Premier</td>
              <td><span class="badge badge-success">PRESENT</span></td>
              <td>06:05</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>Wallet & Payment Logs</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Transaction</th>
              <th>Amount (BHD)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-09-14 06:15:00</td>
              <td>Session charge deduction</td>
              <td>-0.167</td>
              <td><span class="badge badge-success">PAID</span></td>
            </tr>
            <tr>
              <td>2026-09-13 15:30:00</td>
              <td>Manual credit added</td>
              <td>+10.000</td>
              <td><span class="badge badge-success">VERIFIED</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    return html;
  }
};

// ===== GLOBAL FUNCTIONS =====

window.respondToSession = async function(sessionId, status) {
  try {
    const response = await window.api.respondToSession(sessionId, status);
    if (response.success) {
      alert(`✅ Response recorded: ${status}`);
      window.navigateTo('home');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.submitPayment = async function(event) {
  event.preventDefault();

  const method = document.getElementById('paymentMethod')?.value;
  const ref = document.getElementById('paymentRef')?.value?.trim();
  const amountBHD = parseFloat(document.getElementById('paymentAmount')?.value);

  // Validation
  if (!method || !ref || !amountBHD || amountBHD <= 0) {
    alert('❌ All fields required and amount must be > 0');
    return;
  }

  try {
    const amountFils = Math.round(amountBHD * 1000);
    const response = await window.api.submitPayment({
      method: method,
      reference: ref,
      amountFils: amountFils,
      status: 'PENDING_VERIFICATION'
    });

    if (response.success) {
      alert('✅ Payment submitted for verification');
      document.getElementById('paymentForm').reset();
      window.navigateTo('wallet');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.changePassword = async function(event) {
  event.preventDefault();

  const current = document.getElementById('currentPassword')?.value;
  const newPass = document.getElementById('newPassword')?.value;
  const confirm = document.getElementById('confirmPassword')?.value;

  if (newPass !== confirm) {
    alert('❌ Passwords do not match');
    return;
  }

  if (newPass.length < 6) {
    alert('❌ Password must be at least 6 characters');
    return;
  }

  try {
    const response = await window.api.changePassword({
      currentPassword: current,
      newPassword: newPass
    });

    if (response.success) {
      alert('✅ Password changed successfully');
      document.getElementById('changePasswordForm').reset();
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.submitBazaarItem = async function(event) {
  event.preventDefault();

  const title = document.getElementById('bazaarTitle')?.value?.trim();
  const category = document.getElementById('bazaarCategory')?.value;
  const price = parseFloat(document.getElementById('bazaarPrice')?.value);
  const phone = document.getElementById('bazaarPhone')?.value?.trim();
  const description = document.getElementById('bazaarDescription')?.value?.trim();

  if (!title || !category || !price || !phone) {
    alert('❌ All required fields must be filled');
    return;
  }

  try {
    const response = await window.api.submitBazaarItem({
      title: title,
      category: category,
      priceBHD: price,
      phone: phone,
      description: description
    });

    if (response.success) {
      alert('✅ Item posted successfully');
      document.getElementById('bazaarForm').reset();
      window.navigateTo('bazaar');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

console.log('✅ views.js loaded successfully');

