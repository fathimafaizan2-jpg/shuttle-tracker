
// ============================================
// flightAdminViews.js - FLIGHT ADMIN PAGES (COMPLETE)
// ============================================

export const flightAdminViews = {
  // ===== HOME DASHBOARD (Same as Player) =====
  home: async function() {
    return window.views.home();
  },

  // ===== MY TIMETABLE (Same as Player) =====
  timetable: async function() {
    return window.views.timetable();
  },

  // ===== ATTENDANCE ROSTER (Same as Player) =====
  attendance: async function() {
    return window.views.attendance();
  },

  // ===== WALLET & PAYMENTS (Same as Player) =====
  wallet: async function() {
    return window.views.wallet();
  },

  // ===== SESSION CONTROL - FLIGHT ADMIN ONLY =====
  sessions: async function() {
    const member = window.appState?.member;

    if (!member) {
      return '<div class="error-message">❌ Member data not found</div>';
    }

    try {
      const sessionsData = await window.api.getSessions(member.flightId);
      const sessions = sessionsData?.sessions || [];

      let html = `
        <div class="page-header">
          <h1>📅 Session Control</h1>
          <p>Manage attendance and calculate charges for ${member.flightId} flight</p>
        </div>
      `;

      if (sessions.length === 0) {
        html += '<div class="card"><p style="color: #999; text-align: center; padding: 40px;">No sessions available</p></div>';
        return html;
      }

      sessions.forEach(session => {
        const presentCount = session.presentCount || 0;
        const totalCostFils = session.totalCost || 0;
        const perPlayerShareFils = presentCount > 0 ? Math.ceil(totalCostFils / presentCount) : 0;

        html += `
          <div class="card">
            <h2>📅 ${session.day} - ${session.startTime} to ${session.endTime}</h2>
            <div style="background: #f5f7fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Activity:</strong> ${session.activity}</p>
              <p><strong>Flight:</strong> ${session.flight}</p>
              <p><strong>Status:</strong> <span class="badge badge-warning">${session.status}</span></p>
            </div>

            <h3>Present Attendees (${presentCount})</h3>
            <table class="data-table" style="margin-bottom: 20px;">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
        `;

        // Mock present members
        const presentMembers = [
          { id: 'member_001', name: 'Ahmed Al-Mansouri', status: 'PRESENT' },
          { id: 'member_002', name: 'Fatima Hassan', status: 'PRESENT' },
          { id: 'member_003', name: 'Mohammed Ali', status: 'PRESENT' }
        ];

        presentMembers.forEach((m, idx) => {
          html += `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${m.name}</strong></td>
              <td><span class="badge badge-success">PRESENT</span></td>
              <td>
                <button class="btn btn-danger" onclick="window.removeFromSession('${session.id}', '${m.id}')" data-session-attendance="ABSENT" style="padding: 6px 12px; font-size: 12px;">
                  Remove
                </button>
              </td>
            </tr>
          `;
        });

        html += `
              </tbody>
            </table>

            <h3>Add Late Arrivals / Walk-ins</h3>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
              <select id="addMemberSelect_${session.id}" style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                <option value="">Select member to add</option>
                <option value="member_004">Sara Ahmed</option>
                <option value="member_005">Hassan Ibrahim</option>
                <option value="member_006">Layla Mohammed</option>
              </select>
              <button class="btn btn-primary" onclick="window.addToSession('${session.id}')" data-add-member-to-session style="padding: 10px 20px;">
                Add to Present
              </button>
            </div>

            <h3>Final Attendance & Charges</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Shuttlecocks Used *</label>
                <input type="number" id="shuttlesUsed_${session.id}" placeholder="0" min="0" value="0" required>
              </div>
              <div class="form-group">
                <label>Tube Price (BHD)</label>
                <input type="number" value="3.000" disabled>
              </div>
            </div>

            <div style="background: #f0f3ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Calculation:</strong></p>
              <p>Total Cost = ⌈${presentCount} × (3000 Fils / 12)⌉ = ${totalCostFils} Fils</p>
              <p>Per Player Share = ⌈${totalCostFils} / ${presentCount}⌉ = ${perPlayerShareFils} Fils (BHD ${(perPlayerShareFils / 1000).toFixed(3)})</p>
            </div>

            <button class="btn btn-success" onclick="window.completeSession('${session.id}', ${presentCount}, ${perPlayerShareFils})" data-complete-flight-game style="width: 100%; padding: 12px;">
              ✓ Update Final Attendance & Calculate Charges
            </button>
          </div>
        `;
      });

      return html;

    } catch (error) {
      console.error('❌ Error loading sessions:', error);
      return `<div class="error-message">❌ Error loading sessions: ${error.message}</div>`;
    }
  },

  // ===== SHUTTLE STOCK - FLIGHT ADMIN ONLY =====
  stock: async function() {
    const member = window.appState?.member;

    if (!member) {
      return '<div class="error-message">❌ Member data not found</div>';
    }

    try {
      const stockData = await window.api.getStock(member.flightId);
      const stock = stockData?.stock || {};

      let html = `
        <div class="page-header">
          <h1>📦 Shuttle Stock Management</h1>
          <p>Manage inventory for ${member.flightId} flight</p>
        </div>

        <div class="card">
          <h2>Current Inventory</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="color: #1976d2; font-size: 12px; font-weight: 600;">TOTAL SHUTTLES</p>
              <h2 style="color: #1976d2; margin: 10px 0;">${stock.shuttles || 0}</h2>
            </div>
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="color: #388e3c; font-size: 12px; font-weight: 600;">GOOD CONDITION</p>
              <h2 style="color: #388e3c; margin: 10px 0;">${stock.good || 0}</h2>
            </div>
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="color: #f57c00; font-size: 12px; font-weight: 600;">UNDER REPAIR</p>
              <h2 style="color: #f57c00; margin: 10px 0;">${stock.repair || 0}</h2>
            </div>
            <div style="background: #ffebee; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="color: #d32f2f; font-size: 12px; font-weight: 600;">DAMAGED</p>
              <h2 style="color: #d32f2f; margin: 10px 0;">${stock.damaged || 0}</h2>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>Update Stock Configuration</h2>
          <form id="stockForm" onsubmit="window.saveFlightStock(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Tube Price (BHD) *</label>
                <input type="number" id="stockTubePrice" placeholder="3.000" step="0.001" min="0" value="${(stock.tubePrice / 1000).toFixed(3)}" required>
              </div>
              <div class="form-group">
                <label>Available Tubes (Count) *</label>
                <input type="number" id="stockTubes" placeholder="0" min="0" value="${stock.tubes || 0}" required>
              </div>
            </div>

            <div style="background: #f0f3ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="font-size: 12px; color: #666;">
                <strong>Note:</strong> Tube price is used to calculate per-player charges during session completion.
                Formula: Total Cost = ⌈Shuttles Used × (Tube Price / 12)⌉
              </p>
            </div>

            <button type="submit" class="btn btn-primary" id="saveFlightStock">Save Stock Configuration</button>
          </form>
        </div>

        <div class="card">
          <h2>Stock History</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Event</th>
                <th>Quantity</th>
                <th>Updated By</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-09-14 10:30:00</td>
                <td>Stock updated</td>
                <td>+5 tubes</td>
                <td>Admin</td>
              </tr>
              <tr>
                <td>2026-09-13 15:00:00</td>
                <td>Tube price changed</td>
                <td>3.000 BHD</td>
                <td>Admin</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      return html;

    } catch (error) {
      console.error('❌ Error loading stock:', error);
      return `<div class="error-message">❌ Error loading stock: ${error.message}</div>`;
    }
  },

  // ===== REPORTS & SHEETS - FLIGHT ADMIN ONLY =====
  reports: async function() {
    const member = window.appState?.member;

    if (!member) {
      return '<div class="error-message">❌ Member data not found</div>';
    }

    let html = `
      <div class="page-header">
        <h1>📊 Reports & Sheets</h1>
        <p>Financial oversight and attendance printouts for ${member.flightId} flight</p>
      </div>

      <div class="card">
        <h2>Report Generator</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Report Type *</label>
            <select id="reportType" required>
              <option value="">Select report</option>
              <option value="paid">Paid Members</option>
              <option value="unpaid">Unpaid Members</option>
              <option value="attendance">Attendance Summary</option>
              <option value="financial">Financial Summary</option>
            </select>
          </div>
          <div class="form-group">
            <label>Month *</label>
            <input type="month" id="reportMonth" required>
          </div>
        </div>
        <button class="btn btn-primary" onclick="window.generateReport()" style="width: 100%;">Generate Report</button>
      </div>

      <div class="card">
        <h2>Paid Members</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Member Name</th>
              <th>Sessions</th>
              <th>Total Paid (BHD)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><strong>Ahmed Al-Mansouri</strong></td>
              <td>12</td>
              <td>2.004</td>
              <td><span class="badge badge-success">PAID</span></td>
            </tr>
            <tr>
              <td>2</td>
              <td><strong>Fatima Hassan</strong></td>
              <td>11</td>
              <td>1.837</td>
              <td><span class="badge badge-success">PAID</span></td>
            </tr>
            <tr>
              <td>3</td>
              <td><strong>Mohammed Ali</strong></td>
              <td>10</td>
              <td>1.670</td>
              <td><span class="badge badge-success">PAID</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>Unpaid Members</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Member Name</th>
              <th>Sessions</th>
              <th>Amount Due (BHD)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><strong>Sara Ahmed</strong></td>
              <td>8</td>
              <td>1.336</td>
              <td><span class="badge badge-danger">UNPAID</span></td>
            </tr>
            <tr>
              <td>2</td>
              <td><strong>Hassan Ibrahim</strong></td>
              <td>5</td>
              <td>0.835</td>
              <td><span class="badge badge-danger">UNPAID</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-top: 20px;">
        <button class="btn btn-primary" onclick="window.printReport()" style="width: 100%; padding: 12px;">
          🖨️ Print Report
        </button>
      </div>
    `;

    return html;
  }
};

// ===== GLOBAL FUNCTIONS =====

window.removeFromSession = async function(sessionId, memberId) {
  if (confirm('Remove this member from present list?')) {
    try {
      const response = await window.api.removeFromSession(sessionId, memberId);
      if (response.success) {
        alert('✅ Member removed from session');
        window.navigateTo('sessions');
      } else {
        alert(`❌ ${response.message}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  }
};

window.addToSession = async function(sessionId) {
  const memberId = document.getElementById(`addMemberSelect_${sessionId}`)?.value;

  if (!memberId) {
    alert('❌ Please select a member');
    return;
  }

  try {
    const response = await window.api.addToSession(sessionId, memberId);
    if (response.success) {
      alert('✅ Member added to present list');
      window.navigateTo('sessions');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.completeSession = async function(sessionId, presentCount, perPlayerShareFils) {
  const shuttlesUsed = parseInt(document.getElementById(`shuttlesUsed_${sessionId}`)?.value) || 0;

  if (shuttlesUsed < 0) {
    alert('❌ Shuttles used must be >= 0');
    return;
  }

  if (!confirm(`Complete session with ${presentCount} players? Each will be charged BHD ${(perPlayerShareFils / 1000).toFixed(3)}`)) {
    return;
  }

  try {
    const response = await window.api.completeSession(sessionId, {
      shuttlesUsed: shuttlesUsed,
      presentCount: presentCount,
      perPlayerShareFils: perPlayerShareFils
    });

    if (response.success) {
      alert('✅ Session completed and charges calculated');
      window.navigateTo('sessions');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.saveFlightStock = async function(event) {
  event.preventDefault();

  const tubePrice = parseFloat(document.getElementById('stockTubePrice')?.value);
  const tubes = parseInt(document.getElementById('stockTubes')?.value);

  if (!tubePrice || tubePrice <= 0 || !tubes || tubes < 0) {
    alert('❌ Please enter valid values');
    return;
  }

  try {
    const tubePriceFils = Math.round(tubePrice * 1000);
    const response = await window.api.updateStock({
      tubePrice: tubePriceFils,
      tubes: tubes
    });

    if (response.success) {
      alert('✅ Stock configuration saved');
      window.navigateTo('stock');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.generateReport = async function() {
  const reportType = document.getElementById('reportType')?.value;
  const reportMonth = document.getElementById('reportMonth')?.value;

  if (!reportType || !reportMonth) {
    alert('❌ Please select report type and month');
    return;
  }

  try {
    const response = await window.api.getReports(window.appState?.member?.flightId, reportType);
    if (response.success) {
      alert('✅ Report generated');
    } else {
      alert(`❌ ${response.message}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};

window.printReport = function() {
  window.print();
};

console.log('✅ flightAdminViews.js loaded successfully');

