
// ============================================
// flightAdminViews.js - FLIGHT ADMIN MODULE
// ============================================

export const flightAdminViews = {
  // SESSION CONTROL PAGE
  sessions: () => {
    const sessions = JSON.parse(localStorage.getItem('flightSessions') || '[]');
    const activeSessions = sessions.filter(s => s.status === 'SCHEDULED');
    
    let html = `
      <div class="page-header">
        <h1>Session Control</h1>
        <p>Manage active sessions and attendance</p>
      </div>
    `;

    if (activeSessions.length === 0) {
      html += `<div class="card"><h2>No Active Sessions</h2><p>No scheduled sessions at the moment</p></div>`;
      return html;
    }

    activeSessions.forEach(session => {
      const presentPlayers = JSON.parse(session.presentPlayers || '[]');
      const allMembers = JSON.parse(localStorage.getItem('members') || '[]');
      const nonPresentMembers = allMembers.filter(m => !presentPlayers.find(p => p.uid === m.uid));

      html += `
        <div class="card">
          <h2>${session.flight} - ${session.date}</h2>
          <p><strong>Time:</strong> ${session.startTime} - ${session.endTime}</p>
          <p><strong>Status:</strong> <span class="badge badge-info">SCHEDULED</span></p>

          <h3>Active Players (${presentPlayers.length})</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Player Name</th>
                <th>Member ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
      `;

      if (presentPlayers.length === 0) {
        html += `<tr><td colspan="3" style="text-align: center;">No players marked present</td></tr>`;
      } else {
        presentPlayers.forEach(player => {
          html += `
            <tr>
              <td>${player.name}</td>
              <td>${player.uid}</td>
              <td><button class="btn btn-danger" onclick="removePlayer('${session.id}', '${player.uid}')">Remove (Mark Absent)</button></td>
            </tr>
          `;
        });
      }

      html += `
            </tbody>
          </table>

          <h3 style="margin-top: 20px;">Add Late Arrival</h3>
          <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <select id="latePlayer_${session.id}" style="flex: 1; padding: 10px; border: 1px solid #e0e6ed; border-radius: 6px;">
              <option value="">Select player...</option>
      `;

      nonPresentMembers.forEach(member => {
        html += `<option value="${member.uid}">${member.name}</option>`;
      });

      html += `
            </select>
            <button class="btn btn-secondary" onclick="addLateArrival('${session.id}')">Add to Present</button>
          </div>

          <h3>Shuttle Calculator</h3>
          <div class="form-group">
            <label>Shuttlecocks Used</label>
            <input type="number" id="shuttles_${session.id}" placeholder="0" min="0">
          </div>
          <div class="form-group">
            <label>Attendees Count</label>
            <input type="number" id="attendees_${session.id}" value="${presentPlayers.length}" disabled>
          </div>
          <div class="form-group">
            <label>Tube Price (BHD)</label>
            <input type="number" id="tubePrice_${session.id}" placeholder="0.000" step="0.001" value="${session.tubePrice || '0.500'}">
          </div>
          <button class="btn btn-primary" onclick="finalizeSession('${session.id}')">Update Final Attendance & Calculate Charges</button>
        </div>
      `;
    });

    return html;
  },

  // SHUTTLE STOCK PAGE
  stock: () => {
    const stock = JSON.parse(localStorage.getItem('flightStock') || '{"availableTubes": 0, "tubePrice": 0.5}');
    
    let html = `
      <div class="page-header">
        <h1>Shuttle Stock</h1>
        <p>Manage inventory</p>
      </div>

      <div class="card">
        <h2>Inventory Overview</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: #667eea;">📦</div>
            <div class="stat-content">
              <h3>${stock.availableTubes}</h3>
              <p>Available Tubes</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #00d4aa;">💰</div>
            <div class="stat-content">
              <h3>${stock.tubePrice.toFixed(3)} BHD</h3>
              <p>Current Tube Price</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Update Stock Settings</h2>
        <form onsubmit="updateStock(event)">
          <div class="form-group">
            <label>Tube Price (BHD) *</label>
            <input type="number" id="tubePrice" placeholder="0.000" step="0.001" value="${stock.tubePrice}" required>
          </div>
          <div class="form-group">
            <label>Available Tubes *</label>
            <input type="number" id="availableTubes" placeholder="0" value="${stock.availableTubes}" min="0" required>
          </div>
          <button type="submit" class="btn btn-primary">Save Stock Settings</button>
        </form>
      </div>
    `;

    return html;
  },

  // REPORTS PAGE
  reports: () => {
    const sessions = JSON.parse(localStorage.getItem('flightSessions') || '[]');
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
    const paidPlayers = JSON.parse(localStorage.getItem('paidPlayers') || '[]');
    const unpaidPlayers = JSON.parse(localStorage.getItem('unpaidPlayers') || '[]');
    
    let html = `
      <div class="page-header">
        <h1>Reports & Sheets</h1>
        <p>Flight metrics and player status</p>
      </div>

      <div class="card">
        <h2>Flight Metrics Summary</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: #667eea;">📊</div>
            <div class="stat-content">
              <h3>${JSON.parse(localStorage.getItem('flightStock') || '{}').availableTubes || 0}</h3>
              <p>Total Available Shuttles</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #00d4aa;">✓</div>
            <div class="stat-content">
              <h3>${paidPlayers.length}</h3>
              <p>Paid Players</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #ff4757;">✗</div>
            <div class="stat-content">
              <h3>${unpaidPlayers.length}</h3>
              <p>Unpaid Players</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Paid Players Log</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Member ID</th>
              <th>Amount Paid (BHD)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (paidPlayers.length === 0) {
      html += `<tr><td colspan="4" style="text-align: center; padding: 20px;">No paid players</td></tr>`;
    } else {
      paidPlayers.forEach(player => {
        html += `
          <tr>
            <td>${player.name}</td>
            <td>${player.memberId}</td>
            <td>${player.amount.toFixed(3)}</td>
            <td>${player.date}</td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>Unpaid Players Log</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Member ID</th>
              <th>Amount Due (BHD)</th>
              <th>Days Overdue</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (unpaidPlayers.length === 0) {
      html += `<tr><td colspan="4" style="text-align: center; padding: 20px;">No unpaid players</td></tr>`;
    } else {
      unpaidPlayers.forEach(player => {
        html += `
          <tr>
            <td>${player.name}</td>
            <td>${player.memberId}</td>
            <td>${player.amount.toFixed(3)}</td>
            <td>${player.daysOverdue}</td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
        <button class="btn btn-primary" onclick="window.print()" style="margin-top: 20px;">🖨️ Print Report</button>
      </div>
    `;

    return html;
  },

  // FLIGHT FINANCE PAGE
  finance: () => {
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    
    let html = `
      <div class="page-header">
        <h1>Flight Finance</h1>
        <p>Manage member credits and payments</p>
      </div>

      <div class="card">
        <h2>Member Credit Management</h2>
        <div class="form-group">
          <label>Select Member *</label>
          <select id="selectedMember" onchange="updateMemberBalance()">
            <option value="">Select member...</option>
      `;

      members.forEach(member => {
        html += `<option value="${member.uid}">${member.name}</option>`;
      });

      html += `
          </select>
        </div>

        <div id="memberBalance" style="background: #f5f7fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: none;">
          <p><strong>Current Balance:</strong> <span id="balanceAmount">0.000</span> BHD</p>
        </div>

        <h3>Add Verified Credit</h3>
        <form onsubmit="addCredit(event)">
          <div class="form-group">
            <label>Amount (BHD) *</label>
            <input type="number" id="creditAmount" placeholder="0.000" step="0.001" min="0.001" required>
          </div>
          <div class="form-group">
            <label>Note</label>
            <textarea id="creditNote" placeholder="Add a note..."></textarea>
          </div>
          <button type="submit" class="btn btn-secondary" id="addCreditBtn" disabled>Add Verified Credit</button>
        </form>

        <h3 style="margin-top: 30px;">Deduct Wallet Credit</h3>
        <form onsubmit="deductCredit(event)">
          <div class="form-group">
            <label>Amount (BHD) *</label>
            <input type="number" id="deductAmount" placeholder="0.000" step="0.001" min="0.001" required>
          </div>
          <div class="form-group">
            <label>Reason *</label>
            <input type="text" id="deductReason" placeholder="Enter deduction reason" required>
          </div>
          <button type="submit" class="btn btn-danger" id="deductBtn" disabled>Deduct Selected Wallet Credit</button>
        </form>
      </div>

      <div class="card">
        <h2>Pending Payments Verification</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Amount (BHD)</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
    `;

    const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
    if (pendingPayments.length === 0) {
      html += `<tr><td colspan="5" style="text-align: center; padding: 20px;">No pending payments</td></tr>`;
    } else {
      pendingPayments.forEach(payment => {
        html += `
          <tr>
            <td>${payment.playerName}</td>
            <td>${payment.amount.toFixed(3)}</td>
            <td>${payment.method}</td>
            <td>${payment.reference}</td>
            <td><button class="btn btn-primary" onclick="verifyPayment('${payment.id}')">Verify</button></td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
        <button class="btn btn-primary" onclick="window.print()" style="margin-top: 20px;">🖨️ Print Current Tab</button>
      </div>
    `;

    return html;
  }
};

// ===== HELPER FUNCTIONS =====
window.removePlayer = function(sessionId, playerUid) {
  const sessions = JSON.parse(localStorage.getItem('flightSessions') || '[]');
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.presentPlayers = JSON.stringify(
      JSON.parse(session.presentPlayers || '[]').filter(p => p.uid !== playerUid)
    );
    localStorage.setItem('flightSessions', JSON.stringify(sessions));
    alert('Player removed and marked absent');
    location.reload();
  }
};

window.addLateArrival = function(sessionId) {
  const playerUid = document.getElementById(`latePlayer_${sessionId}`).value;
  if (!playerUid) {
    alert('Please select a player');
    return;
  }

  const sessions = JSON.parse(localStorage.getItem('flightSessions') || '[]');
  const session = sessions.find(s => s.id === sessionId);
  const members = JSON.parse(localStorage.getItem('members') || '[]');
  const member = members.find(m => m.uid === playerUid);

  if (session && member) {
    const presentPlayers = JSON.parse(session.presentPlayers || '[]');
    presentPlayers.push({ uid: member.uid, name: member.name });
    session.presentPlayers = JSON.stringify(presentPlayers);
    localStorage.setItem('flightSessions', JSON.stringify(sessions));
    alert('Player added to present list');
    location.reload();
  }
};

window.finalizeSession = function(sessionId) {
  const shuttles = parseInt(document.getElementById(`shuttles_${sessionId}`).value) || 0;
  const attendees = parseInt(document.getElementById(`attendees_${sessionId}`).value) || 1;
  const tubePrice = parseFloat(document.getElementById(`tubePrice_${sessionId}`).value) || 0.5;

  if (shuttles < 0) {
    alert('Shuttles used must be >= 0');
    return;
  }

  // Calculate cost: ceil(shuttles / 2) * tubePrice (assuming 2 shuttles per tube)
  const totalCost = Math.ceil(shuttles / 2) * tubePrice;
  const costPerPlayer = totalCost / attendees;

  alert(`Session finalized!\nTotal Cost: ${totalCost.toFixed(3)} BHD\nCost per Player: ${costPerPlayer.toFixed(3)} BHD`);

  const sessions = JSON.parse(localStorage.getItem('flightSessions') || '[]');
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.status = 'COMPLETED';
    session.totalCost = totalCost;
    session.costPerPlayer = costPerPlayer;
    localStorage.setItem('flightSessions', JSON.stringify(sessions));
    location.reload();
  }
};

window.updateStock = function(event) {
  event.preventDefault();
  const tubePrice = parseFloat(document.getElementById('tubePrice').value);
  const availableTubes = parseInt(document.getElementById('availableTubes').value);

  if (tubePrice <= 0 || availableTubes < 0) {
    alert('Please enter valid values');
    return;
  }

  const stock = {
    tubePrice: Math.round(tubePrice * 1000) / 1000,
    availableTubes,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem('flightStock', JSON.stringify(stock));
  alert('Stock settings saved');
  event.target.reset();
};

window.updateMemberBalance = function() {
  const memberUid = document.getElementById('selectedMember').value;
  const addCreditBtn = document.getElementById('addCreditBtn');
  const deductBtn = document.getElementById('deductBtn');

  if (memberUid) {
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    const member = members.find(m => m.uid === memberUid);
    if (member) {
      document.getElementById('memberBalance').style.display = 'block';
      document.getElementById('balanceAmount').textContent = (member.balance || 0).toFixed(3);
      addCreditBtn.disabled = false;
      deductBtn.disabled = false;
    }
  } else {
    document.getElementById('memberBalance').style.display = 'none';
    addCreditBtn.disabled = true;
    deductBtn.disabled = true;
  }
};

window.addCredit = function(event) {
  event.preventDefault();
  const memberUid = document.getElementById('selectedMember').value;
  const amount = parseFloat(document.getElementById('creditAmount').value);
  const note = document.getElementById('creditNote').value;

  if (!memberUid || amount <= 0) {
    alert('Please select member and enter valid amount');
    return;
  }

  const members = JSON.parse(localStorage.getItem('members') || '[]');
  const member = members.find(m => m.uid === memberUid);
  if (member) {
    member.balance = (member.balance || 0) + amount;
    localStorage.setItem('members', JSON.stringify(members));
    alert(`Added ${amount.toFixed(3)} BHD to ${member.name}`);
    event.target.reset();
  }
};

window.deductCredit = function(event) {
  event.preventDefault();
  const memberUid = document.getElementById('selectedMember').value;
  const amount = parseFloat(document.getElementById('deductAmount').value);
  const reason = document.getElementById('deductReason').value;

  if (!memberUid || amount <= 0) {
    alert('Please select member and enter valid amount');
    return;
  }

  const members = JSON.parse(localStorage.getItem('members') || '[]');
  const member = members.find(m => m.uid === memberUid);
  if (member) {
    member.balance = Math.max(0, (member.balance || 0) - amount);
    localStorage.setItem('members', JSON.stringify(members));
    alert(`Deducted ${amount.toFixed(3)} BHD from ${member.name}`);
    event.target.reset();
  }
};

window.verifyPayment = function(paymentId) {
  const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
  const payment = pendingPayments.find(p => p.id === paymentId);
  if (payment) {
    pendingPayments.splice(pendingPayments.indexOf(payment), 1);
    localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
    alert('Payment verified');
    location.reload();
  }
};

console.log('✅ flightAdminViews.js loaded successfully');

