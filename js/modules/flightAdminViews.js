
// ============================================
// flightAdminViews.js - FLIGHT ADMIN DASHBOARD
// ============================================

export const flightAdminViews = {
  // ===== HOME PAGE =====
  home: function() {
    return `
      <div class="page-header">
        <h1>🎯 Flight Admin Dashboard</h1>
        <p>Manage your flight operations and members</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">👥</div>
          <div class="stat-content">
            <h3>24</h3>
            <p>Active Members</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">📅</div>
          <div class="stat-content">
            <h3>8</h3>
            <p>Sessions This Week</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">💰</div>
          <div class="stat-content">
            <h3>2,400 BHD</h3>
            <p>Revenue This Month</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">⚠️</div>
          <div class="stat-content">
            <h3>3</h3>
            <p>Pending Payments</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>📋 Quick Actions</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
          <button class="btn btn-primary" onclick="window.navigateTo('sessions')">Manage Sessions</button>
          <button class="btn btn-primary" onclick="window.navigateTo('stock')">Check Stock</button>
          <button class="btn btn-primary" onclick="window.navigateTo('reports')">View Reports</button>
        </div>
      </div>

      <div class="card">
        <h2>👥 Recent Member Activity</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Activity</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Al-Mansouri</td>
              <td>Attended Session</td>
              <td>Sep 11, 2026</td>
              <td><span class="badge badge-success">Present</span></td>
            </tr>
            <tr>
              <td>Fatima Hassan</td>
              <td>Payment Received</td>
              <td>Sep 10, 2026</td>
              <td><span class="badge badge-success">Completed</span></td>
            </tr>
            <tr>
              <td>Mohammed Ali</td>
              <td>Missed Session</td>
              <td>Sep 09, 2026</td>
              <td><span class="badge badge-danger">Absent</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== SESSION CONTROL PAGE =====
  sessions: function() {
    return `
      <div class="page-header">
        <h1>📅 Session Control</h1>
        <p>Manage game day attendance and cost calculations</p>
      </div>

      <div class="card">
        <h2>✓ Present Attendees List</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Time In</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Al-Mansouri</td>
              <td>5:55 AM</td>
              <td><span class="badge badge-success">Present</span></td>
              <td><button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" data-session-attendance="ABSENT" onclick="window.markAbsent('ahmed_001')">Remove</button></td>
            </tr>
            <tr>
              <td>Fatima Hassan</td>
              <td>6:00 AM</td>
              <td><span class="badge badge-success">Present</span></td>
              <td><button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" data-session-attendance="ABSENT" onclick="window.markAbsent('fatima_001')">Remove</button></td>
            </tr>
            <tr>
              <td>Mohammed Ali</td>
              <td>6:05 AM</td>
              <td><span class="badge badge-success">Present</span></td>
              <td><button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" data-session-attendance="ABSENT" onclick="window.markAbsent('mohammed_001')">Remove</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>➕ Add Late Arrivals / Walk-ins</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Select Member *</label>
            <select id="addMemberSelect">
              <option value="">-- Select a member --</option>
              <option value="sara_001">Sara Ahmed</option>
              <option value="ali_001">Ali Hassan</option>
              <option value="noor_001">Noor Mohammed</option>
            </select>
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <button class="btn btn-success" data-add-member-to-session onclick="window.addMemberToSession()">Add to Present List</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>🚀 Finalize Session & Calculate Charges</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Shuttlecocks Used *</label>
            <input type="number" id="shuttlesUsed-session_001" placeholder="0" min="0" value="2">
          </div>
          <div class="form-group">
            <label>Tube Price (BHD) *</label>
            <input type="number" id="tubePrice" placeholder="0.000" min="0" step="0.001" value="3.000" disabled>
          </div>
        </div>
        <div style="background: #f0f3ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Calculation:</strong></p>
          <p>Total Game Cost = ⌈Shuttles × (Tube Price / 12)⌉</p>
          <p>Per Player Share = ⌈Total Cost / Present Count⌉</p>
        </div>
        <button class="btn btn-primary" data-complete-flight-game onclick="window.completeFlightGame('session_001')">Update Final Attendance & Calculate Charges</button>
      </div>

      <div class="card">
        <h2>📊 Calculation Result</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Shuttles Used</td>
              <td id="result-shuttles">2</td>
            </tr>
            <tr>
              <td>Tube Price (Fils)</td>
              <td id="result-tubePrice">3000</td>
            </tr>
            <tr>
              <td>Total Game Cost (Fils)</td>
              <td id="result-totalCost">500</td>
            </tr>
            <tr>
              <td>Present Attendees</td>
              <td id="result-attendees">3</td>
            </tr>
            <tr>
              <td>Per Player Share (Fils)</td>
              <td id="result-perPlayer">167</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== SHUTTLE STOCK PAGE =====
  stock: function() {
    return `
      <div class="page-header">
        <h1>📦 Shuttle Stock Management</h1>
        <p>Manage equipment and inventory for your flight</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">📦</div>
          <div class="stat-content">
            <h3>150</h3>
            <p>Total Shuttles</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #2ed573;">✓</div>
          <div class="stat-content">
            <h3>120</h3>
            <p>Good Condition</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">⚠️</div>
          <div class="stat-content">
            <h3>20</h3>
            <p>Needs Repair</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ff6b6b;">✕</div>
          <div class="stat-content">
            <h3>10</h3>
            <p>Damaged</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>💾 Tube Price & Stock Configuration</h2>
        <div class="form-row">
          <div class="form-group">
            <label>Tube Price (BHD) *</label>
            <input type="number" id="stockTubePrice" placeholder="0.000" min="0" step="0.001" value="3.000">
          </div>
          <div class="form-group">
            <label>Available Tubes *</label>
            <input type="number" id="stockTubes" placeholder="0" min="0" value="150">
          </div>
        </div>
        <button class="btn btn-primary" id="saveFlightStock" onclick="window.saveFlightStock()">Save Stock Configuration</button>
      </div>

      <div class="card">
        <h2>📋 Current Inventory</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Total</th>
              <th>Good</th>
              <th>Repair</th>
              <th>Damaged</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Shuttles</td>
              <td>150</td>
              <td>120</td>
              <td>20</td>
              <td>10</td>
              <td>Sep 12, 2026</td>
            </tr>
            <tr>
              <td>Rackets</td>
              <td>30</td>
              <td>28</td>
              <td>2</td>
              <td>0</td>
              <td>Sep 10, 2026</td>
            </tr>
            <tr>
              <td>Shoes</td>
              <td>45</td>
              <td>40</td>
              <td>5</td>
              <td>0</td>
              <td>Sep 08, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>📊 Stock History</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Updated By</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 12, 2026</td>
              <td>Stock Added</td>
              <td>Shuttles</td>
              <td>+50</td>
              <td>Ahmed Al-Mansouri</td>
            </tr>
            <tr>
              <td>Sep 10, 2026</td>
              <td>Stock Deducted</td>
              <td>Shuttles</td>
              <td>-30</td>
              <td>Mohammed Al-Khalifa</td>
            </tr>
            <tr>
              <td>Sep 08, 2026</td>
              <td>Price Updated</td>
              <td>Tube Price</td>
              <td>3.000 BHD</td>
              <td>Ahmed Al-Mansouri</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // ===== REPORTS PAGE =====
  reports: function() {
    return `
      <div class="page-header">
        <h1>📊 Flight Reports & Sheets</h1>
        <p>Attendance and payment reports for your flight</p>
      </div>

      <div class="card">
        <h2>📈 Attendance Report</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Total Sessions</th>
              <th>Attended</th>
              <th>Missed</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Al-Mansouri</td>
              <td>14</td>
              <td>13</td>
              <td>1</td>
              <td><span class="badge badge-success">93%</span></td>
            </tr>
            <tr>
              <td>Fatima Hassan</td>
              <td>14</td>
              <td>12</td>
              <td>2</td>
              <td><span class="badge badge-success">86%</span></td>
            </tr>
            <tr>
              <td>Mohammed Ali</td>
              <td>14</td>
              <td>10</td>
              <td>4</td>
              <td><span class="badge badge-warning">71%</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>💳 Payment Status Report</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount Due</th>
              <th>Amount Paid</th>
              <th>Status</th>
              <th>Last Payment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Al-Mansouri</td>
              <td>100 BHD</td>
              <td>100 BHD</td>
              <td><span class="badge badge-success">Paid</span></td>
              <td>Sep 10, 2026</td>
            </tr>
            <tr>
              <td>Fatima Hassan</td>
              <td>100 BHD</td>
              <td>50 BHD</td>
              <td><span class="badge badge-warning">Partial</span></td>
              <td>Sep 05, 2026</td>
            </tr>
            <tr>
              <td>Mohammed Ali</td>
              <td>100 BHD</td>
              <td>0 BHD</td>
              <td><span class="badge badge-danger">Pending</span></td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>👥 Paid Members List</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount Paid</th>
              <th>Payment Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Al-Mansouri</td>
              <td>100 BHD</td>
              <td>Sep 10, 2026</td>
              <td><span class="badge badge-success">Cleared</span></td>
            </tr>
            <tr>
              <td>Fatima Hassan</td>
              <td>50 BHD</td>
              <td>Sep 05, 2026</td>
              <td><span class="badge badge-warning">Partial</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>👥 Unpaid Members List</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount Due</th>
              <th>Days Overdue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mohammed Ali</td>
              <td>100 BHD</td>
              <td>8 days</td>
              <td><span class="badge badge-danger">Overdue</span></td>
            </tr>
            <tr>
              <td>Sara Ahmed</td>
              <td>75 BHD</td>
              <td>3 days</td>
              <td><span class="badge badge-warning">Due Soon</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>🖨️ Print Report</h2>
        <p>Generate a printable report for your records</p>
        <button class="btn btn-primary" onclick="window.printFlightReport()">Print Current Report</button>
      </div>
    `;
  }
};

// ===== HELPER FUNCTIONS =====
window.markAbsent = function(memberId) {
  console.log(`Marking ${memberId} as absent`);
  if (window.showToast) {
    window.showToast(`✅ Member marked as absent and removed from roster`);
  }
};

window.addMemberToSession = function() {
  const memberSelect = document.getElementById('addMemberSelect');
  const memberId = memberSelect?.value;

  if (!memberId) {
    if (window.showToast) window.showToast('❌ Please select a member');
    return;
  }

  console.log(`Adding member ${memberId} to session`);
  if (window.showToast) {
    window.showToast(`✅ Member added to present list!`);
  }
};

window.completeFlightGame = function(sessionId) {
  const shuttles = parseInt(document.getElementById('shuttlesUsed-session_001')?.value || 0);
  const tubePrice = 3000; // Fils
  
  if (shuttles <= 0) {
    if (window.showToast) window.showToast('❌ Please enter number of shuttles used');
    return;
  }

  // Calculate costs
  const totalCost = Math.ceil(shuttles * (tubePrice / 12));
  const attendees = 3; // Example
  const perPlayerShare = Math.ceil(totalCost / attendees);

  // Update results
  document.getElementById('result-shuttles').textContent = shuttles;
  document.getElementById('result-tubePrice').textContent = tubePrice;
  document.getElementById('result-totalCost').textContent = totalCost;
  document.getElementById('result-attendees').textContent = attendees;
  document.getElementById('result-perPlayer').textContent = perPlayerShare;

  console.log(`Game completed: Total=${totalCost} Fils, Per Player=${perPlayerShare} Fils`);
  if (window.showToast) {
    window.showToast(`✅ Session finalized! Each player charged ${(perPlayerShare / 1000).toFixed(3)} BHD`);
  }
};

window.saveFlightStock = function() {
  const tubePrice = parseFloat(document.getElementById('stockTubePrice')?.value || 0);
  const tubes = parseInt(document.getElementById('stockTubes')?.value || 0);

  if (tubePrice <= 0 || tubes <= 0) {
    if (window.showToast) window.showToast('❌ Please enter valid values');
    return;
  }

  const tubePriceFils = Math.round(tubePrice * 1000);
  console.log(`Stock saved: Tube Price=${tubePriceFils} Fils, Tubes=${tubes}`);
  
  if (window.showToast) {
    window.showToast(`✅ Stock configuration saved successfully!`);
  }
};

window.printFlightReport = function() {
  console.log('Printing flight report...');
  window.print();
};

console.log('✅ flightAdminViews.js loaded successfully');

