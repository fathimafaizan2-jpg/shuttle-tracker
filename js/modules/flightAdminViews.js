
// ============================================
// flightAdminViews.js - FLIGHT ADMIN MODULES
// ============================================

export const flightAdminViews = {
  // ===== SESSION CONTROL =====
  sessions: () => {
    try {
      requireLevelAdmin();
      
      const member = window.appState.member;
      const sessions = JSON.parse(localStorage.getItem('flightSessions') || '[]');
      const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      const stock = JSON.parse(localStorage.getItem('flightStock') || '{"tubePriceFils": 500}');
      
      // Get upcoming session for this flight
      const upcomingSession = sessions.find(s => s.status === 'SCHEDULED' && s.flightId === member.flightId);
      
      if (!upcomingSession) {
        return `
          <div class="page-header">
            <h1>🎮 Session Control</h1>
            <p>Manage attendance and game costs</p>
          </div>
          <div class="card">
            <p style="color: #999;">No upcoming sessions for your flight</p>
          </div>
        `;
      }
      
      // STRICT FILTER: Only PRESENT players
      const presentPlayers = attendance.filter(a => a.sessionId === upcomingSession.id && a.status === 'PRESENT');
      const presentCount = presentPlayers.length;
      
      // Get all members for this flight
      const flightMembers = members.filter(m => m.flightId === member.flightId && m.uid !== member.uid);
      
      // Get members NOT present
      const notPresentMembers = flightMembers.filter(m => 
        !presentPlayers.find(p => p.memberUid === m.uid)
      );

      let html = `
        <div class="page-header">
          <h1>🎮 Session Control</h1>
          <p>Manage attendance and game costs for ${upcomingSession.date}</p>
        </div>

        <div class="card">
          <h2>📋 Attending Roster (${presentCount} Players)</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
      `;

      if (presentCount === 0) {
        html += `<tr><td colspan="4" style="text-align: center; padding: 20px;">No players marked present</td></tr>`;
      } else {
        presentPlayers.forEach((player, index) => {
          html += `
            <tr>
              <td>${index + 1}</td>
              <td>${player.memberName}</td>
              <td><span class="badge badge-success">PRESENT</span></td>
              <td>
                <button class="btn btn-danger" onclick="removePlayerFromSession('${upcomingSession.id}', '${player.memberUid}')">
                  Remove (Mark Absent)
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

        <div class="card">
          <h2>➕ Add Player to Roster</h2>
          <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <select id="addMemberSelect-${upcomingSession.id}" style="flex: 1; padding: 10px; border: 1px solid #e0e6ed; border-radius: 6px;">
              <option value="">Select a player to add...</option>
      `;

      notPresentMembers.forEach(member => {
        html += `<option value="${member.uid}">${member.fullName}</option>`;
      });

      html += `
            </select>
            <button class="btn btn-secondary" onclick="addPlayerToSession('${upcomingSession.id}')">
              Add to Present List
            </button>
          </div>
        </div>

        <div class="card">
          <h2>🎯 Game Completion & Cost Calculation</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div class="form-group">
              <label>Shuttlecocks Used *</label>
              <input type="number" id="shuttlesUsed-${upcomingSession.id}" min="0" value="0" required>
            </div>
            <div class="form-group">
              <label>Attendees Count (Read-only)</label>
              <input type="number" value="${presentCount}" readonly style="background: #f5f7fa;">
            </div>
            <div class="form-group">
              <label>Tube Price (BHD)</label>
              <input type="text" value="${filsToBhd(stock.tubePriceFils)}" readonly style="background: #f5f7fa;">
            </div>
          </div>

          <div style="background: #f5f7fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3>Cost Split Formula</h3>
            <p><strong>Tube Price Fils:</strong> ${stock.tubePriceFils}</p>
            <p><strong>Cost Per Shuttle Fils:</strong> ${stock.tubePriceFils} ÷ 12 = ${Math.round(stock.tubePriceFils / 12)}</p>
            <p><strong>Total Game Cost Fils:</strong> ⌈Shuttles × ${Math.round(stock.tubePriceFils / 12)}⌉</p>
            <p><strong>Per Player Share Fils:</strong> ⌈Total Cost ÷ ${presentCount}⌉</p>
          </div>

          <button class="btn btn-primary" onclick="completeFlightSession('${upcomingSession.id}')">
            Update Final Attendance & Calculate Charges
          </button>
        </div>
      `;

      return html;
    } catch (error) {
      return `<div class="card"><h2>Error</h2><p>${error.message}</p></div>`;
    }
  },

  // ===== SHUTTLE STOCK =====
  stock: () => {
    try {
      requireLevelAdmin();
      
      const stock = JSON.parse(localStorage.getItem('flightStock') || '{"tubePriceFils": 500, "availableTubes": 150}');

      let html = `
        <div class="page-header">
          <h1>📦 Shuttle Stock Management</h1>
          <p>Manage tube inventory and pricing</p>
        </div>

        <div class="card">
          <h2>Current Stock</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666;">Available Tubes</p>
              <h2 style="margin: 0; color: #667eea;">${stock.availableTubes}</h2>
            </div>
            <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666;">Tube Price</p>
              <h2 style="margin: 0; color: #667eea;">${filsToBhd(stock.tubePriceFils)} BHD</h2>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>Update Stock</h2>
          <form onsubmit="updateFlightStock(event)">
            <div class="form-group">
              <label>Tube Price (BHD) *</label>
              <input type="number" id="stockTubePrice" step="0.001" value="${filsToBhd(stock.tubePriceFils)}" required>
            </div>
            <div class="form-group">
              <label>Available Tubes (Count) *</label>
              <input type="number" id="stockTubes" min="0" value="${stock.availableTubes}" required>
            </div>
            <button type="submit" class="btn btn-primary">Save Stock</button>
          </form>
        </div>

        <div class="card">
          <h2>📊 Stock History</h2>
          <p style="color: #999;">Stock updates are logged automatically</p>
        </div>
      `;

      return html;
    } catch (error) {
      return `<div class="card"><h2>Error</h2><p>${error.message}</p></div>`;
    }
  },

  // ===== REPORTS & SHEETS =====
  reports: () => {
    try {
      requireLevelAdmin();
      
      const member = window.appState.member;
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      
      // Filter members for this flight
      const flightMembers = members.filter(m => m.flightId === member.flightId);
      
      // Separate paid and unpaid
      const paidMembers = flightMembers.filter(m => m.walletBalanceFils >= 0);
      const unpaidMembers = flightMembers.filter(m => m.walletBalanceFils < 0);

      let html = `
        <div class="page-header">
          <h1>📊 Reports & Sheets</h1>
          <p>Financial reports for your flight</p>
        </div>

        <div class="card">
          <h2>📈 Metrics</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
            <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666;">Available Stock</p>
              <h2 style="margin: 0; color: #667eea;">150</h2>
            </div>
            <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666;">Paid Players</p>
              <h2 style="margin: 0; color: #00d4aa;">${paidMembers.length}</h2>
            </div>
            <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666;">Unpaid Players</p>
              <h2 style="margin: 0; color: #ff4757;">${unpaidMembers.length}</h2>
            </div>
          </div>
          <button class="btn btn-secondary" onclick="printReport()">🖨️ Print Report</button>
        </div>

        <div class="card">
          <h2>✅ Paid Players Log</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player Name</th>
                <th>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `;

      if (paidMembers.length === 0) {
        html += `<tr><td colspan="4" style="text-align: center; padding: 20px;">No paid players</td></tr>`;
      } else {
        paidMembers.forEach((player, index) => {
          html += `
            <tr>
              <td>${index + 1}</td>
              <td>${player.fullName}</td>
              <td>${filsToBhd(player.walletBalanceFils)}</td>
              <td><span class="badge badge-success">PAID</span></td>
            </tr>
          `;
        });
      }

      html += `
            </tbody>
          </table>
        </div>

        <div class="card">
          <h2>❌ Unpaid Players Log</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player Name</th>
                <th>Outstanding</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `;

      if (unpaidMembers.length === 0) {
        html += `<tr><td colspan="4" style="text-align: center; padding: 20px;">No unpaid players</td></tr>`;
      } else {
        unpaidMembers.forEach((player, index) => {
          html += `
            <tr>
              <td>${index + 1}</td>
              <td>${player.fullName}</td>
              <td>${filsToBhd(Math.abs(player.walletBalanceFils))}</td>
              <td><span class="badge badge-danger">UNPAID</span></td>
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
      return `<div class="card"><h2>Error</h2><p>${error.message}</p></div>`;
    }
  },

  // ===== FLIGHT FINANCE =====
  'flight-finance': () => {
    try {
      requireLevelAdmin();
      
      const member = window.appState.member;
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
      
      // Filter for this flight
      const flightMembers = members.filter(m => m.flightId === member.flightId);
      const flightPendingPayments = pendingPayments.filter(p => 
        flightMembers.find(m => m.uid === p.memberUid)
      );

      let html = `
        <div class="page-header">
          <h1>💳 Flight Finance</h1>
          <p>Manage payments and member wallets</p>
        </div>

        <div class="tabs-container">
          <button class="tab-btn active" onclick="switchTab('credited')">Credited Players</button>
          <button class="tab-btn" onclick="switchTab('pending')">Pending Payments</button>
          <button class="tab-btn" onclick="switchTab('paid')">Paid Players</button>
          <button class="tab-btn" onclick="switchTab('unpaid')">Unpaid Players</button>
        </div>

        <div id="credited-tab" class="tab-content">
          <div class="card">
            <h2>💰 Credited Players</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
      `;

      const creditedMembers = flightMembers.filter(m => m.walletBalanceFils > 0);
      if (creditedMembers.length === 0) {
        html += `<tr><td colspan="3" style="text-align: center; padding: 20px;">No credited players</td></tr>`;
      } else {
        creditedMembers.forEach(player => {
          html += `
            <tr>
              <td>${player.fullName}</td>
              <td>${filsToBhd(player.walletBalanceFils)}</td>
              <td><span class="badge badge-success">CREDITED</span></td>
            </tr>
          `;
        });
      }

      html += `
              </tbody>
            </table>
          </div>
        </div>

        <div id="pending-tab" class="tab-content" style="display: none;">
          <div class="card">
            <h2>⏳ Pending Payments</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
      `;

      if (flightPendingPayments.length === 0) {
        html += `<tr><td colspan="5" style="text-align: center; padding: 20px;">No pending payments</td></tr>`;
      } else {
        flightPendingPayments.forEach(payment => {
          html += `
            <tr>
              <td>${payment.memberName}</td>
              <td>${filsToBhd(payment.amountFils)}</td>
              <td>${payment.method}</td>
              <td>${payment.reference}</td>
              <td>
                <button class="btn btn-secondary" onclick="verifyPayment('${payment.id}')">
                  Verify
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
        </div>

        <div id="paid-tab" class="tab-content" style="display: none;">
          <div class="card">
            <h2>✅ Paid Players</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
      `;

      const paidMembers = flightMembers.filter(m => m.walletBalanceFils === 0);
      if (paidMembers.length === 0) {
        html += `<tr><td colspan="3" style="text-align: center; padding: 20px;">No paid players</td></tr>`;
      } else {
        paidMembers.forEach(player => {
          html += `
            <tr>
              <td>${player.fullName}</td>
              <td>${filsToBhd(player.walletBalanceFils)}</td>
              <td><span class="badge badge-success">PAID</span></td>
            </tr>
          `;
        });
      }

      html += `
              </tbody>
            </table>
          </div>
        </div>

        <div id="unpaid-tab" class="tab-content" style="display: none;">
          <div class="card">
            <h2>❌ Unpaid Players</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
      `;

      const unpaidMembers = flightMembers.filter(m => m.walletBalanceFils < 0);
      if (unpaidMembers.length === 0) {
        html += `<tr><td colspan="3" style="text-align: center; padding: 20px;">No unpaid players</td></tr>`;
      } else {
        unpaidMembers.forEach(player => {
          html += `
            <tr>
              <td>${player.fullName}</td>
              <td>${filsToBhd(Math.abs(player.walletBalanceFils))}</td>
              <td><span class="badge badge-danger">UNPAID</span></td>
            </tr>
          `;
        });
      }

      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;

      return html;
    } catch (error) {
      return `<div class="card"><h2>Error</h2><p>${error.message}</p></div>`;
    }
  }
};

// ===== HELPER FUNCTIONS =====
window.removePlayerFromSession = async function(sessionId, memberUid) {
  if (!showConfirm('Mark this player as absent?')) return;
  
  try {
    const result = await window.api.correctSessionAttendance(sessionId, memberUid, 'ABSENT');
    if (result.success) {
      showToast('Player marked absent', 'success');
      navigateTo('sessions');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.addPlayerToSession = async function(sessionId) {
  const dropdown = document.getElementById(`addMemberSelect-${sessionId}`);
  const memberUid = dropdown.value;
  
  if (!memberUid) {
    showToast('Select a player from the dropdown to add', 'error');
    return;
  }
  
  try {
    const result = await window.api.correctSessionAttendance(sessionId, memberUid, 'PRESENT');
    if (result.success) {
      showToast('Player added to roster', 'success');
      navigateTo('sessions');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.completeFlightSession = async function(sessionId) {
  const shuttlesInput = document.getElementById(`shuttlesUsed-${sessionId}`);
  const shuttlesUsed = parseInt(shuttlesInput.value);
  
  if (shuttlesUsed < 0) {
    showToast('Shuttles used must be 0 or more', 'error');
    return;
  }
  
  try {
    const result = await window.api.completeFlightSession(sessionId, shuttlesUsed);
    if (result.success) {
      showToast(`Session completed! Total cost: ${result.totalCost} BHD, Per player: ${result.perPlayerCost} BHD`, 'success');
      navigateTo('sessions');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.updateFlightStock = async function(event) {
  event.preventDefault();
  
  const tubePriceBHD = parseFloat(document.getElementById('stockTubePrice').value);
  const availableTubes = parseInt(document.getElementById('stockTubes').value);
  
  try {
    const tubePriceFils = bhdToFils(tubePriceBHD);
    
    const stock = {
      tubePriceFils,
      availableTubes,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('flightStock', JSON.stringify(stock));
    
    logAudit('SHUTTLE_STOCK', 'Updated', 'Flight Stock', `Tube price: ${tubePriceBHD} BHD, Available: ${availableTubes}`);
    
    showToast('Stock updated successfully', 'success');
    navigateTo('stock');
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.printReport = function() {
  printTable('reportsTable', 'Flight Reports');
};

window.switchTab = function(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(`${tabName}-tab`).style.display = 'block';
  event.target.classList.add('active');
};

window.verifyPayment = async function(paymentId) {
  if (!showConfirm('Verify this payment?')) return;
  
  try {
    const result = await window.api.verifyPayment(paymentId);
    if (result.success) {
      showToast(result.message, 'success');
      navigateTo('flight-finance');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

console.log('✅ flightAdminViews.js loaded successfully');

