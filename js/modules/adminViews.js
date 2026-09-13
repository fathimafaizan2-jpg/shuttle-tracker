
// ============================================
// adminViews.js - SUPER ADMIN MODULE
// ============================================

export const adminViews = {
  // CLUB OVERVIEW PAGE
  overview: () => {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    const admins = members.filter(m => m.role === 'LEVEL_ADMIN');
    const walletCredit = JSON.parse(localStorage.getItem('clubWallet') || '{"total": 0}');

    let html = `
      <div class="page-header">
        <h1>Club Overview</h1>
        <p>Executive dashboard</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #667eea;">🏃</div>
          <div class="stat-content">
            <h3>${activities.length}</h3>
            <p>Active Sports</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #00d4aa;">👥</div>
          <div class="stat-content">
            <h3>${members.length}</h3>
            <p>Registered Players</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #ffa502;">👨‍💼</div>
          <div class="stat-content">
            <h3>${admins.length}</h3>
            <p>Flight Admins</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: #0099ff;">💼</div>
          <div class="stat-content">
            <h3>${walletCredit.total.toFixed(3)} BHD</h3>
            <p>Club Wallet</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Recent Activities</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Activity Name</th>
              <th>Status</th>
              <th>Flights</th>
              <th>Members</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (activities.length === 0) {
      html += `<tr><td colspan="4" style="text-align: center; padding: 20px;">No activities yet</td></tr>`;
    } else {
      activities.forEach(activity => {
        const activityMembers = members.filter(m => m.activityId === activity.id);
        html += `
          <tr>
            <td>${activity.name}</td>
            <td><span class="badge badge-success">${activity.status || 'ACTIVE'}</span></td>
            <td>${activity.flights ? activity.flights.length : 0}</td>
            <td>${activityMembers.length}</td>
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

  // ACTIVITIES & FLIGHTS PAGE
  flights: () => {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const members = JSON.parse(localStorage.getItem('members') || '[]');

    let html = `
      <div class="page-header">
        <h1>Activities & Flights</h1>
        <p>Manage sports activities and flight levels</p>
      </div>

      <div class="card">
        <h2>Create New Activity</h2>
        <form onsubmit="createActivity(event)">
          <div class="form-group">
            <label>Activity Name *</label>
            <input type="text" id="activityName" placeholder="e.g., Badminton, Cricket" required>
          </div>
          <button type="submit" class="btn btn-primary">Create Activity</button>
        </form>
      </div>

      <div class="card">
        <h2>Activities & Flight Management</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Status</th>
              <th>Flights</th>
              <th>Display Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (activities.length === 0) {
      html += `<tr><td colspan="5" style="text-align: center; padding: 20px;">No activities created yet</td></tr>`;
    } else {
      activities.forEach(activity => {
        html += `
          <tr>
            <td>${activity.name}</td>
            <td><span class="badge ${activity.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}">${activity.status || 'ACTIVE'}</span></td>
            <td>${activity.flights ? activity.flights.length : 0}</td>
            <td>${activity.displayOrder || 0}</td>
            <td>
              <button class="btn btn-secondary" onclick="toggleActivityStatus('${activity.id}')">
                ${activity.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
        <h2>Add Flight Level</h2>
        <form onsubmit="addFlight(event)">
          <div class="form-group">
            <label>Select Activity *</label>
            <select id="flightActivityId" required>
              <option value="">Select activity...</option>
      `;

    activities.forEach(activity => {
      html += `<option value="${activity.id}">${activity.name}</option>`;
    });

    html += `
            </select>
          </div>
          <div class="form-group">
            <label>Flight Name *</label>
            <input type="text" id="flightName" placeholder="e.g., Premier, Flight 1" required>
          </div>
          <div class="form-group">
            <label>Display Order</label>
            <input type="number" id="flightOrder" placeholder="0" value="0">
          </div>
          <button type="submit" class="btn btn-primary">Add Flight</button>
        </form>
      </div>

      <div class="card">
        <h2>Pre-Register Member</h2>
        <form onsubmit="preRegisterMember(event)">
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" id="memberName" placeholder="Enter member name" required>
          </div>
          <div class="form-group">
            <label>Phone Number *</label>
            <input type="tel" id="memberPhone" placeholder="Enter phone number" required>
          </div>
          <div class="form-group">
            <label>Role *</label>
            <select id="memberRole" required>
              <option value="PLAYER">Player</option>
              <option value="LEVEL_ADMIN">Flight Admin</option>
            </select>
          </div>
          <div class="form-group">
            <label>Assigned Flight *</label>
            <select id="memberFlight" required>
              <option value="">Select flight...</option>
      `;

    activities.forEach(activity => {
      if (activity.flights) {
        activity.flights.forEach(flight => {
          html += `<option value="${flight.id}">${activity.name} - ${flight.name}</option>`;
        });
      }
    });

    html += `
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Pre-Register Member</button>
        </form>
      </div>

      <div class="card">
        <h2>All Members Roster</h2>
        <div style="margin-bottom: 15px;">
          <input type="text" id="memberSearch" placeholder="Search member..." style="padding: 10px; border: 1px solid #e0e6ed; border-radius: 6px; width: 100%;">
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Flight</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (members.length === 0) {
      html += `<tr><td colspan="6" style="text-align: center; padding: 20px;">No members registered</td></tr>`;
    } else {
      members.slice(0, 50).forEach(member => {
        html += `
          <tr>
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.role}</td>
            <td>${member.flight || 'N/A'}</td>
            <td><span class="badge ${member.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}">${member.status || 'ACTIVE'}</span></td>
            <td>
              <button class="btn btn-secondary" onclick="toggleMemberStatus('${member.uid}')">Toggle</button>
              <button class="btn btn-danger" onclick="deleteMember('${member.uid}')">Delete</button>
            </td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
        <p style="margin-top: 10px; color: #999; font-size: 12px;">Showing ${Math.min(50, members.length)} of ${members.length} members</p>
      </div>
    `;

    return html;
  },

  // MASTER TIMETABLE PAGE
  master: () => {
    const timetable = JSON.parse(localStorage.getItem('masterTimetable') || '[]');
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');

    let html = `
      <div class="page-header">
        <h1>Master Timetable</h1>
        <p>Manage club-wide timetable</p>
      </div>

      <div class="card">
        <h2>Timetable Controls</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
          <div class="form-group">
            <label>Month (YYYY-MM)</label>
            <input type="month" id="selectedMonth" value="2026-09">
          </div>
          <div class="form-group">
            <label>Activity</label>
            <select id="selectedActivity">
              <option value="">All Activities</option>
      `;

    activities.forEach(activity => {
      html += `<option value="${activity.id}">${activity.name}</option>`;
    });

    html += `
            </select>
          </div>
          <div style="display: flex; gap: 10px; align-items: flex-end;">
            <button class="btn btn-primary" onclick="loadTimetable()">Load Timetable</button>
            <button class="btn btn-secondary" onclick="publishMonth()">Publish Month</button>
            <button class="btn btn-danger" onclick="clearMonth()">Clear Entire Month</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Weekly Pattern</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Flight</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Courts</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (timetable.length === 0) {
      html += `<tr><td colspan="6" style="text-align: center; padding: 20px;">No timetable entries</td></tr>`;
    } else {
      timetable.forEach(slot => {
        html += `
          <tr>
            <td>${slot.day}</td>
            <td>${slot.flight}</td>
            <td>${slot.startTime}</td>
            <td>${slot.endTime}</td>
            <td>${slot.courts || 'Courts 1 & 2'}</td>
            <td><button class="btn btn-danger" onclick="removeSlot('${slot.id}')">Remove</button></td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>Add Weekly Slot</h2>
        <form onsubmit="addWeeklySlot(event)">
          <div class="form-group">
            <label>Day *</label>
            <select id="slotDay" required>
              <option value="">Select day...</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div class="form-group">
            <label>Flight *</label>
            <select id="slotFlight" required>
              <option value="">Select flight...</option>
      `;

    activities.forEach(activity => {
      if (activity.flights) {
        activity.flights.forEach(flight => {
          html += `<option value="${flight.id}">${activity.name} - ${flight.name}</option>`;
        });
      }
    });

    html += `
            </select>
          </div>
          <div class="form-group">
            <label>Start Time *</label>
            <input type="time" id="slotStart" required>
          </div>
          <div class="form-group">
            <label>End Time *</label>
            <input type="time" id="slotEnd" required>
          </div>
          <button type="submit" class="btn btn-primary">Save Weekly Slot</button>
        </form>
      </div>

      <div class="card">
        <h2>Bulk CSV Import</h2>
        <p style="margin-bottom: 15px; color: #666;">Format: weekday,flight,startTime,endTime (one per line)</p>
        <form onsubmit="importCSV(event)">
          <div class="form-group">
            <label>CSV Data</label>
            <textarea id="csvData" placeholder="Monday,Premier,06:00,07:30&#10;Tuesday,Flight 1,07:30,09:00" style="min-height: 150px;"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Import CSV Grid</button>
        </form>
      </div>
    `;

    return html;
  },

  // EXECUTIVE FINANCE PAGE
  finance: () => {
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const creditedPlayers = members.filter(m => (m.balance || 0) > 0);
    const unpaidPlayers = members.filter(m => (m.balance || 0) < 0);
    const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');

    let html = `
      <div class="page-header">
        <h1>Executive Finance</h1>
        <p>Manage club finances and member credits</p>
      </div>

      <div class="tabs-container">
        <button class="tab-btn active" onclick="switchFinanceTab('credited')">Credited Players</button>
        <button class="tab-btn" onclick="switchFinanceTab('pending')">Pending Payments</button>
        <button class="tab-btn" onclick="switchFinanceTab('paid')">Paid Players</button>
        <button class="tab-btn" onclick="switchFinanceTab('unpaid')">Unpaid Players</button>
      </div>

      <div class="card">
        <h2>Filter</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
          <div class="form-group">
            <label>Activity</label>
            <select id="financeActivity">
              <option value="">All Activities</option>
      `;

    activities.forEach(activity => {
      html += `<option value="${activity.id}">${activity.name}</option>`;
    });

    html += `
            </select>
          </div>
          <div class="form-group">
            <label>Flight Level</label>
            <select id="financeFlight">
              <option value="">All Flights</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Member Credit Management</h2>
        <div class="form-group">
          <label>Select Member *</label>
          <select id="financeSelectedMember" onchange="updateFinanceMemberBalance()">
            <option value="">Select member...</option>
      `;

    members.forEach(member => {
      html += `<option value="${member.uid}">${member.name}</option>`;
    });

    html += `
          </select>
        </div>

        <div id="memberFinanceBalance" style="background: #f5f7fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: none;">
          <p><strong>Current Balance:</strong> <span id="financeBalanceAmount">0.000</span> BHD</p>
        </div>

        <h3>Add Verified Credit</h3>
        <form onsubmit="addFinanceCredit(event)">
          <div class="form-group">
            <label>Amount (BHD) *</label>
            <input type="number" id="financeAddAmount" placeholder="0.000" step="0.001" min="0.001" required>
          </div>
          <div class="form-group">
            <label>Note</label>
            <textarea id="financeAddNote" placeholder="Add a note..."></textarea>
          </div>
          <button type="submit" class="btn btn-secondary" id="financeAddBtn" disabled>Add Verified Credit</button>
        </form>

        <h3 style="margin-top: 30px;">Deduct Selected Wallet Credit</h3>
        <form onsubmit="deductFinanceCredit(event)">
          <div class="form-group">
            <label>Amount (BHD) *</label>
            <input type="number" id="financeDeductAmount" placeholder="0.000" step="0.001" min="0.001" required>
          </div>
          <div class="form-group">
            <label>Reason *</label>
            <input type="text" id="financeDeductReason" placeholder="Enter deduction reason" required>
          </div>
          <button type="submit" class="btn btn-danger" id="financeDeductBtn" disabled>Deduct Selected Wallet Credit</button>
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
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (pendingPayments.length === 0) {
      html += `<tr><td colspan="6" style="text-align: center; padding: 20px;">No pending payments</td></tr>`;
    } else {
      pendingPayments.forEach(payment => {
        html += `
          <tr>
            <td>${payment.playerName}</td>
            <td>${payment.amount.toFixed(3)}</td>
            <td>${payment.method}</td>
            <td>${payment.reference}</td>
            <td>${payment.date}</td>
            <td><button class="btn btn-primary" onclick="verifyFinancePayment('${payment.id}')">Verify</button></td>
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
  },

  // ADS & NOTICES PAGE
  ads: () => {
    const carousel = JSON.parse(localStorage.getItem('carouselAds') || '[]');
    const pendingAds = JSON.parse(localStorage.getItem('pendingAds') || '[]');
    const publishedAds = JSON.parse(localStorage.getItem('publishedAds') || '[]');
    const carouselLimit = parseInt(localStorage.getItem('carouselLimit') || '10');

    let html = `
      <div class="page-header">
        <h1>Ads & Notice Control</h1>
        <p>Manage advertisements and official notices</p>
      </div>

      <div class="card">
        <h2>Carousel Limit Control</h2>
        <form onsubmit="updateCarouselLimit(event)">
          <div class="form-group">
            <label>Maximum Active Carousel Ads (Max 10)</label>
            <input type="number" id="carouselLimitInput" value="${carouselLimit}" min="1" max="10">
          </div>
          <button type="submit" class="btn btn-primary">Save Carousel Count</button>
        </form>
      </div>

      <div class="card">
        <h2>Create Official Notice</h2>
        <form onsubmit="publishNotice(event)">
          <div class="form-group">
            <label>Title *</label>
            <input type="text" id="noticeTitle" placeholder="Enter notice title" required>
          </div>
          <div class="form-group">
            <label>Message *</label>
            <textarea id="noticeMessage" placeholder="Enter notice message" required></textarea>
          </div>
          <div class="form-group">
            <label>Image</label>
            <input type="file" id="noticeImage" accept="image/*">
          </div>
          <button type="submit" class="btn btn-primary">Publish Official Notice</button>
        </form>
      </div>

      <div class="card">
        <h2>Pending Business Approvals (${pendingAds.length})</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
    `;

    if (pendingAds.length === 0) {
      html += `<p>No pending approvals</p>`;
    } else {
      pendingAds.forEach(ad => {
        html += `
          <div style="background: white; border: 1px solid #e0e6ed; border-radius: 8px; padding: 15px;">
            <h3>${ad.name}</h3>
            <p><strong>Category:</strong> ${ad.category}</p>
            <p><strong>Offer:</strong> ${ad.offer}</p>
            <p><strong>Address:</strong> ${ad.address}</p>
            ${ad.link ? `<p><strong>Link:</strong> <a href="${ad.link}" target="_blank">${ad.link}</a></p>` : ''}
            <div style="display: flex; gap: 10px; margin-top: 15px;">
              <button class="btn btn-secondary" onclick="approveAd('${ad.id}')">Approve & Publish</button>
              <button class="btn btn-danger" onclick="rejectAd('${ad.id}')">Reject</button>
            </div>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>

      <div class="card">
        <h2>Published Directory (${publishedAds.length})</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Category</th>
              <th>Offer</th>
              <th>Feature Start</th>
              <th>Feature End</th>
              <th>Front Page</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (publishedAds.length === 0) {
      html += `<tr><td colspan="7" style="text-align: center; padding: 20px;">No published ads</td></tr>`;
    } else {
      publishedAds.forEach(ad => {
        const now = new Date();
        const endDate = new Date(ad.featureEndAt);
        const isExpired = now > endDate;

        html += `
          <tr>
            <td>${ad.name}</td>
            <td>${ad.category}</td>
            <td>${ad.offer}</td>
            <td><input type="date" value="${ad.featureStartAt}" onchange="updateAdDate('${ad.id}', 'start', this.value)"></td>
            <td><input type="date" value="${ad.featureEndAt}" onchange="updateAdDate('${ad.id}', 'end', this.value)"></td>
            <td><input type="checkbox" ${ad.isFeatured ? 'checked' : ''} onchange="toggleAdFeature('${ad.id}')"></td>
            <td>
              <button class="btn btn-danger" onclick="deleteAd('${ad.id}')">Delete</button>
              ${isExpired ? '<span class="badge badge-danger">EXPIRED</span>' : ''}
            </td>
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

  // AUDIT HISTORY PAGE
  audit: () => {
    const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');

    let html = `
      <div class="page-header">
        <h1>System Audit History</h1>
        <p>Track all system activities and changes</p>
      </div>

      <div class="card">
        <h2>Filter Audit Logs</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
          <div class="form-group">
            <label>Category</label>
            <select id="auditCategory">
              <option value="">All</option>
              <option value="MEMBER">Member</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="WALLET">Wallet/Payment</option>
              <option value="SESSION">Session Control</option>
              <option value="STOCK">Shuttle Stock</option>
            </select>
          </div>
          <div class="form-group">
            <label>Activity</label>
            <select id="auditActivity">
              <option value="">All Activities</option>
      `;

    activities.forEach(activity => {
      html += `<option value="${activity.id}">${activity.name}</option>`;
    });

    html += `
            </select>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="auditDate">
          </div>
          <div class="form-group">
            <label>Member Name</label>
            <input type="text" id="auditMember" placeholder="Search member...">
          </div>
          <div style="display: flex; gap: 10px; align-items: flex-end;">
            <button class="btn btn-primary" onclick="filterAuditLogs()">Filter</button>
            <button class="btn btn-primary" onclick="window.print()">🖨️ Print Log</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Audit Trail</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Category</th>
              <th>Action</th>
              <th>Target</th>
              <th>Details</th>
              <th>Actor</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (auditLogs.length === 0) {
      html += `<tr><td colspan="6" style="text-align: center; padding: 20px;">No audit logs</td></tr>`;
    } else {
      auditLogs.slice(0, 100).forEach(log => {
        html += `
          <tr>
            <td>${log.timestamp}</td>
            <td><span class="badge badge-info">${log.category}</span></td>
            <td>${log.action}</td>
            <td>${log.target || 'N/A'}</td>
            <td>${log.details}</td>
            <td>${log.actor}</td>
          </tr>
        `;
      });
    }

    html += `
          </tbody>
        </table>
        <p style="margin-top: 10px; color: #999; font-size: 12px;">Showing ${Math.min(100, auditLogs.length)} of ${auditLogs.length} logs</p>
      </div>
    `;

    return html;
  }
};

// ===== HELPER FUNCTIONS =====
window.createActivity = function(event) {
  event.preventDefault();
  const name = document.getElementById('activityName').value;
  if (!name) {
    alert('Please enter activity name');
    return;
  }

  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  activities.push({
    id: 'activity_' + Date.now(),
    name,
    status: 'ACTIVE',
    flights: [],
    displayOrder: activities.length
  });
  localStorage.setItem('activities', JSON.stringify(activities));
  alert('Activity created');
  event.target.reset();
  location.reload();
};

window.toggleActivityStatus = function(activityId) {
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  const activity = activities.find(a => a.id === activityId);
  if (activity) {
    activity.status = activity.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    localStorage.setItem('activities', JSON.stringify(activities));
    location.reload();
  }
};

window.addFlight = function(event) {
  event.preventDefault();
  const activityId = document.getElementById('flightActivityId').value;
  const flightName = document.getElementById('flightName').value;
  const flightOrder = parseInt(document.getElementById('flightOrder').value) || 0;

  if (!activityId || !flightName) {
    alert('Please fill all required fields');
    return;
  }

  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  const activity = activities.find(a => a.id === activityId);
  if (activity) {
    if (!activity.flights) activity.flights = [];
    activity.flights.push({
      id: 'flight_' + Date.now(),
      name: flightName,
      displayOrder: flightOrder
    });
    localStorage.setItem('activities', JSON.stringify(activities));
    alert('Flight added');
    event.target.reset();
    location.reload();
  }
};

window.preRegisterMember = function(event) {
  event.preventDefault();
  const name = document.getElementById('memberName').value;
  const phone = document.getElementById('memberPhone').value;
  const role = document.getElementById('memberRole').value;
  const flightId = document.getElementById('memberFlight').value;

  if (!name || !phone || !flightId) {
    alert('Please fill all required fields');
    return;
  }

  const members = JSON.parse(localStorage.getItem('members') || '[]');
  members.push({
    uid: 'member_' + Date.now(),
    name,
    phone,
    role,
    flightId,
    status: 'ACTIVE',
    balance: 0,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('members', JSON.stringify(members));
  alert(`Member pre-registered. WhatsApp link: https://wa.me/${phone}`);
  event.target.reset();
  location.reload();
};

window.toggleMemberStatus = function(memberId) {
  const members = JSON.parse(localStorage.getItem('members') || '[]');
  const member = members.find(m => m.uid === memberId);
  if (member) {
    member.status = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    localStorage.setItem('members', JSON.stringify(members));
    location.reload();
  }
};

window.deleteMember = function(memberId) {
  if (!confirm('Are you sure you want to permanently delete this member?')) return;

  const members = JSON.parse(localStorage.getItem('members') || '[]');
  const member = members.find(m => m.uid === memberId);
  if (member) {
    const deletedMembers = JSON.parse(localStorage.getItem('deletedMembers') || '[]');
    deletedMembers.push({ ...member, deletedAt: new Date().toISOString() });
    localStorage.setItem('deletedMembers', JSON.stringify(deletedMembers));

    const filtered = members.filter(m => m.uid !== memberId);
    localStorage.setItem('members', JSON.stringify(filtered));
    alert('Member deleted permanently');
    location.reload();
  }
};

window.loadTimetable = function() {
  alert('Timetable loaded');
};

window.publishMonth = function() {
  alert('Month published');
};

window.clearMonth = function() {
  if (!confirm('Are you sure you want to clear the entire month timetable?')) return;
  const month = document.getElementById('selectedMonth').value;
  localStorage.removeItem('masterTimetable_' + month);
  alert('Month cleared');
  location.reload();
};

window.addWeeklySlot = function(event) {
  event.preventDefault();
  const day = document.getElementById('slotDay').value;
  const flight = document.getElementById('slotFlight').value;
  const startTime = document.getElementById('slotStart').value;
  const endTime = document.getElementById('slotEnd').value;

  if (!day || !flight || !startTime || !endTime) {
    alert('Please fill all fields');
    return;
  }

  const timetable = JSON.parse(localStorage.getItem('masterTimetable') || '[]');
  timetable.push({
    id: 'slot_' + Date.now(),
    day,
    flight,
    startTime,
    endTime,
    courts: 'Courts 1 & 2'
  });
  localStorage.setItem('masterTimetable', JSON.stringify(timetable));
  alert('Weekly slot added');
  event.target.reset();
  location.reload();
};

window.removeSlot = function(slotId) {
  const timetable = JSON.parse(localStorage.getItem('masterTimetable') || '[]');
  const filtered = timetable.filter(s => s.id !== slotId);
  localStorage.setItem('masterTimetable', JSON.stringify(filtered));
  location.reload();
};

window.importCSV = function(event) {
  event.preventDefault();
  const csvData = document.getElementById('csvData').value;
  const lines = csvData.trim().split('\n');
  const timetable = JSON.parse(localStorage.getItem('masterTimetable') || '[]');

  let errorRow = null;
  lines.forEach((line, index) => {
    const parts = line.split(',');
    if (parts.length !== 4) {
      errorRow = index + 1;
      return;
    }

    const [day, flight, startTime, endTime] = parts.map(p => p.trim());
    timetable.push({
      id: 'slot_' + Date.now() + '_' + index,
      day,
      flight,
      startTime,
      endTime,
      courts: 'Courts 1 & 2'
    });
  });

  if (errorRow) {
    alert(`Row ${errorRow} invalid.`);
    return;
  }

  localStorage.setItem('masterTimetable', JSON.stringify(timetable));
  alert('CSV imported successfully');
  event.target.reset();
  location.reload();
};

window.updateFinanceMemberBalance = function() {
  const memberUid = document.getElementById('financeSelectedMember').value;
  const addBtn = document.getElementById('financeAddBtn');
  const deductBtn = document.getElementById('financeDeductBtn');

  if (memberUid) {
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    const member = members.find(m => m.uid === memberUid);
    if (member) {
      document.getElementById('memberFinanceBalance').style.display = 'block';
      document.getElementById('financeBalanceAmount').textContent = (member.balance || 0).toFixed(3);
      addBtn.disabled = false;
      deductBtn.disabled = false;
    }
  } else {
    document.getElementById('memberFinanceBalance').style.display = 'none';
    addBtn.disabled = true;
    deductBtn.disabled = true;
  }
};

window.addFinanceCredit = function(event) {
  event.preventDefault();
  const memberUid = document.getElementById('financeSelectedMember').value;
  const amount = parseFloat(document.getElementById('financeAddAmount').value);
  const note = document.getElementById('financeAddNote').value;

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

window.deductFinanceCredit = function(event) {
  event.preventDefault();
  const memberUid = document.getElementById('financeSelectedMember').value;
  const amount = parseFloat(document.getElementById('financeDeductAmount').value);
  const reason = document.getElementById('financeDeductReason').value;

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

window.verifyFinancePayment = function(paymentId) {
  const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
  const payment = pendingPayments.find(p => p.id === paymentId);
  if (payment) {
    pendingPayments.splice(pendingPayments.indexOf(payment), 1);
    localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
    alert('Payment verified');
    location.reload();
  }
};

window.updateCarouselLimit = function(event) {
  event.preventDefault();
  const limit = parseInt(document.getElementById('carouselLimitInput').value);
  if (limit < 1 || limit > 10) {
    alert('Carousel limit must be between 1 and 10');
    return;
  }
  localStorage.setItem('carouselLimit', limit.toString());
  alert('Carousel limit updated');
};

window.publishNotice = function(event) {
  event.preventDefault();
  const title = document.getElementById('noticeTitle').value;
  const message = document.getElementById('noticeMessage').value;

  if (!title || !message) {
    alert('Please fill all required fields');
    return;
  }

  const notice = {
    id: 'notice_' + Date.now(),
    title,
    message,
    publishedAt: new Date().toISOString()
  };

  const notices = JSON.parse(localStorage.getItem('notices') || '[]');
  notices.push(notice);
  localStorage.setItem('notices', JSON.stringify(notices));
  alert('Notice published');
  event.target.reset();
};

window.approveAd = function(adId) {
  const pendingAds = JSON.parse(localStorage.getItem('pendingAds') || '[]');
  const ad = pendingAds.find(a => a.id === adId);
  if (ad) {
    pendingAds.splice(pendingAds.indexOf(ad), 1);
    const publishedAds = JSON.parse(localStorage.getItem('publishedAds') || '[]');
    ad.featureStartAt = new Date().toISOString().split('T')[0];
    ad.featureEndAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    ad.isFeatured = false;
    publishedAds.push(ad);
    localStorage.setItem('pendingAds', JSON.stringify(pendingAds));
    localStorage.setItem('publishedAds', JSON.stringify(publishedAds));
    alert('Ad approved and published');
    location.reload();
  }
};

window.rejectAd = function(adId) {
  const pendingAds = JSON.parse(localStorage.getItem('pendingAds') || '[]');
  const filtered = pendingAds.filter(a => a.id !== adId);
  localStorage.setItem('pendingAds', JSON.stringify(filtered));
  alert('Ad rejected');
  location.reload();
};

window.deleteAd = function(adId) {
  if (!confirm('Are you sure you want to delete this ad permanently?')) return;
  const publishedAds = JSON.parse(localStorage.getItem('publishedAds') || '[]');
  const filtered = publishedAds.filter(a => a.id !== adId);
  localStorage.setItem('publishedAds', JSON.stringify(filtered));
  alert('Ad deleted');
  location.reload();
};

window.updateAdDate = function(adId, type, date) {
  const publishedAds = JSON.parse(localStorage.getItem('publishedAds') || '[]');
  const ad = publishedAds.find(a => a.id === adId);
  if (ad) {
    if (type === 'start') ad.featureStartAt = date;
    if (type === 'end') ad.featureEndAt = date;
    localStorage.setItem('publishedAds', JSON.stringify(publishedAds));
  }
};

window.toggleAdFeature = function(adId) {
  const publishedAds = JSON.parse(localStorage.getItem('publishedAds') || '[]');
  const ad = publishedAds.find(a => a.id === adId);
  if (ad) {
    ad.isFeatured = !ad.isFeatured;
    localStorage.setItem('publishedAds', JSON.stringify(publishedAds));
  }
};

window.filterAuditLogs = function() {
  alert('Audit logs filtered');
};

window.switchFinanceTab = function(tab) {
  alert('Switched to ' + tab + ' tab');
};

console.log('✅ adminViews.js loaded successfully');

