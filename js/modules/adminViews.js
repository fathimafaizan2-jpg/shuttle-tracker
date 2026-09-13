
// ============================================
// adminViews.js - SUPER ADMIN MODULES
// ============================================

export const adminViews = {
  // ===== ACTIVITIES, FLIGHTS & MEMBERS =====
  flights: () => {
    try {
      requireSuperAdmin();
      
      const activities = JSON.parse(localStorage.getItem('activities') || '[]');
      const members = JSON.parse(localStorage.getItem('members') || '[]');

      let html = `
        <div class="page-header">
          <h1>✈️ Activities, Flights & Members</h1>
          <p>Manage sports activities, flight levels, and member registrations</p>
        </div>

        <div class="tabs-container">
          <button class="tab-btn active" onclick="switchAdminTab('activities')">Activities & Flights</button>
          <button class="tab-btn" onclick="switchAdminTab('members')">Member Roster</button>
        </div>

        <!-- ACTIVITIES & FLIGHTS TAB -->
        <div id="activities-tab" class="tab-content">
          <div class="card">
            <h2>➕ Create New Sport / Activity</h2>
            <form onsubmit="createActivity(event)">
              <div class="form-group">
                <label>Activity Name *</label>
                <input type="text" id="newActivityName" placeholder="e.g., Badminton, Cricket, Tennis" required>
              </div>
              <button type="submit" class="btn btn-primary">Create Activity</button>
            </form>
          </div>

          <div class="card">
            <h2>📋 Manage Activities & Flights</h2>
      `;

      if (activities.length === 0) {
        html += `<p style="color: #999;">No activities created yet</p>`;
      } else {
        activities.forEach(activity => {
          html += `
            <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3>${activity.name}</h3>
                <button class="btn btn-danger" onclick="toggleActivity('${activity.id}')">
                  ${activity.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              <div style="margin-bottom: 15px;">
                <h4>Flights:</h4>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Flight Name</th>
                      <th>Display Order</th>
                      <th>Members</th>
                    </tr>
                  </thead>
                  <tbody>
          `;

          if (!activity.flights || activity.flights.length === 0) {
            html += `<tr><td colspan="3" style="text-align: center; padding: 10px;">No flights</td></tr>`;
          } else {
            activity.flights.forEach(flight => {
              const flightMemberCount = members.filter(m => m.flightId === flight.id).length;
              html += `
                <tr>
                  <td>${flight.name}</td>
                  <td>${flight.displayOrder}</td>
                  <td>${flightMemberCount}</td>
                </tr>
              `;
            });
          }

          html += `
                  </tbody>
                </table>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                <div class="form-group">
                  <label>Flight Name</label>
                  <input type="text" id="flightName-${activity.id}" placeholder="e.g., Premier, Flight 1">
                </div>
                <div class="form-group">
                  <label>Display Order</label>
                  <input type="number" id="flightSort-${activity.id}" min="0" value="0">
                </div>
                <div style="display: flex; align-items: flex-end;">
                  <button class="btn btn-secondary" onclick="addFlight('${activity.id}')">Add Flight</button>
                </div>
              </div>
            </div>
          `;
        });
      }

      html += `
          </div>
        </div>

        <!-- MEMBERS TAB -->
        <div id="members-tab" class="tab-content" style="display: none;">
          <div class="card">
            <h2>➕ Pre-Register New Member</h2>
            <form onsubmit="preRegisterMember(event)">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div class="form-group">
                  <label>Full Name *</label>
                  <input type="text" id="memberFullName" placeholder="Full name" required>
                </div>
                <div class="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" id="memberPhone" placeholder="+973-XXXX-XXXX" required>
                </div>
                <div class="form-group">
                  <label>Role *</label>
                  <select id="memberRole" required>
                    <option value="">Select role...</option>
                    <option value="PLAYER">Player</option>
                    <option value="LEVEL_ADMIN">Flight Admin</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Flight Level *</label>
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
              </div>
              <button type="submit" class="btn btn-primary">Pre-register Member</button>
            </form>
          </div>

          <div class="card">
            <h2>📋 All Members Roster</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
              <div class="form-group">
                <label>Filter by Activity</label>
                <select id="rosterActivityFilter" onchange="filterRoster()">
                  <option value="">All Activities</option>
      `;

      activities.forEach(activity => {
        html += `<option value="${activity.id}">${activity.name}</option>`;
      });

      html += `
                </select>
              </div>
              <div class="form-group">
                <label>Filter by Flight</label>
                <select id="rosterFlightFilter" onchange="filterRoster()">
                  <option value="">All Flights</option>
                </select>
              </div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Flight</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="rosterTableBody">
      `;

      members.forEach(member => {
        html += `
          <tr>
            <td>${member.fullName}</td>
            <td>${member.phone}</td>
            <td>
              <select id="memberRole-${member.uid}" onchange="updateMemberRole('${member.uid}', this.value)">
                <option value="PLAYER" ${member.role === 'PLAYER' ? 'selected' : ''}>Player</option>
                <option value="LEVEL_ADMIN" ${member.role === 'LEVEL_ADMIN' ? 'selected' : ''}>Flight Admin</option>
              </select>
            </td>
            <td>
              <select id="memberFlight-${member.uid}" onchange="updateMemberFlight('${member.uid}', this.value)">
                <option value="">Select flight...</option>
        `;

        activities.forEach(activity => {
          if (activity.flights) {
            activity.flights.forEach(flight => {
              const selected = member.flightId === flight.id ? 'selected' : '';
              html += `<option value="${flight.id}" ${selected}>${activity.name} - ${flight.name}</option>`;
            });
          }
        });

        html += `
              </select>
            </td>
            <td><span class="badge badge-success">${member.status}</span></td>
            <td>
              <button class="btn btn-danger" onclick="deleteMember('${member.uid}', '${member.fullName}')">Delete</button>
              <a href="${generateWhatsAppLink(member.phone, 'Welcome to Indian Club Bahrain! Click here to activate your account: https://indianclub.bh/activate')}" target="_blank" class="btn btn-secondary" style="display: inline-block; margin-top: 5px;">WhatsApp</a>
            </td>
          </tr>
        `;
      });

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
  },

  // ===== MASTER TIMETABLE =====
  master: () => {
    try {
      requireSuperAdmin();
      
      const activities = JSON.parse(localStorage.getItem('activities') || '[]');
      const masterTimetable = JSON.parse(localStorage.getItem('masterTimetable') || '[]');

      let html = `
        <div class="page-header">
          <h1>📆 Master Timetable</h1>
          <p>Create and manage weekly schedule patterns</p>
        </div>

        <div class="tabs-container">
          <button class="tab-btn active" onclick="switchAdminTab('slots')">Weekly Slots</button>
          <button class="tab-btn" onclick="switchAdminTab('publish')">Publish Month</button>
          <button class="tab-btn" onclick="switchAdminTab('csv')">CSV Import</button>
        </div>

        <!-- SLOTS TAB -->
        <div id="slots-tab" class="tab-content">
          <div class="card">
            <h2>➕ Add Weekly Slot</h2>
            <form onsubmit="addMasterSlot(event)">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div class="form-group">
                  <label>Day of Week *</label>
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
                  <label>Flight Level *</label>
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
              </div>
              <button type="submit" class="btn btn-primary">Save Weekly Slot</button>
            </form>
          </div>

          <div class="card">
            <h2>📋 Master Timetable Slots</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Flight</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
      `;

      if (masterTimetable.length === 0) {
        html += `<tr><td colspan="5" style="text-align: center; padding: 20px;">No slots defined</td></tr>`;
      } else {
        masterTimetable.forEach(slot => {
          html += `
            <tr>
              <td>${slot.day}</td>
              <td>${formatLevelName(slot.flightId)}</td>
              <td>${slot.startTime}</td>
              <td>${slot.endTime}</td>
              <td>
                <button class="btn btn-danger" onclick="deleteSlot('${slot.id}')">Delete</button>
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

        <!-- PUBLISH TAB -->
        <div id="publish-tab" class="tab-content" style="display: none;">
          <div class="card">
            <h2>📅 Publish Month</h2>
            <p>Convert weekly patterns into concrete calendar sessions</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
              <div class="form-group">
                <label>Select Month *</label>
                <input type="month" id="masterMonth" required>
              </div>
            </div>
            <button class="btn btn-primary" onclick="publishMonth()">Publish Month</button>
            <button class="btn btn-danger" onclick="deleteEntireMonth()" style="margin-left: 10px;">Clear Entire Month</button>
          </div>
        </div>

        <!-- CSV IMPORT TAB -->
        <div id="csv-tab" class="tab-content" style="display: none;">
          <div class="card">
            <h2>📊 Bulk CSV Import</h2>
            <p>Format: weekday,flight,startTime,endTime</p>
            <form onsubmit="importBulkTimetable(event)">
              <div class="form-group">
                <label>CSV Data *</label>
                <textarea id="bulkTimetableCsv" placeholder="Monday,badminton_premier,06:00,07:30&#10;Wednesday,badminton_premier,06:00,07:30" required style="min-height: 200px;"></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Import CSV Grid</button>
            </form>
          </div>
        </div>
      `;

      return html;
    } catch (error) {
      return `<div class="card"><h2>Error</h2><p>${error.message}</p></div>`;
    }
  },

  // ===== EXECUTIVE FINANCE =====
  'admin-finance': () => {
    try {
      requireSuperAdmin();
      
      const activities = JSON.parse(localStorage.getItem('activities') || '[]');
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');

      let html = `
        <div class="page-header">
          <h1>💼 Executive Finance</h1>
          <p>Club-wide financial management and member wallet control</p>
        </div>

        <div class="tabs-container">
          <button class="tab-btn active" onclick="switchAdminTab('credit')">Add Credit</button>
          <button class="tab-btn" onclick="switchAdminTab('pending')">Pending Payments</button>
          <button class="tab-btn" onclick="switchAdminTab('credited')">Credited Players</button>
          <button class="tab-btn" onclick="switchAdminTab('unpaid')">Unpaid Players</button>
        </div>

        <!-- ADD CREDIT TAB -->
        <div id="credit-tab" class="tab-content">
          <div class="card">
            <h2>💰 Add Verified Credit</h2>
            <form onsubmit="addFinanceCredit(event)">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div class="form-group">
                  <label>Activity *</label>
                  <select id="financeActivityFilter" onchange="updateMemberDropdown()" required>
                    <option value="">Select activity...</option>
      `;

      activities.forEach(activity => {
        html += `<option value="${activity.id}">${activity.name}</option>`;
      });

      html += `
                  </select>
                </div>
                <div class="form-group">
                  <label>Flight Level *</label>
                  <select id="financeFlightFilter" onchange="updateMemberDropdown()" required>
                    <option value="">Select flight...</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Member *</label>
                  <select id="financeCreditMember" onchange="updateMemberPreview()" required>
                    <option value="">Select member...</option>
                  </select>
                </div>
              </div>

              <div style="background: #f5f7fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p><strong>Selected Member Balance:</strong> <span id="financeSelectedMemberPreview">-</span></p>
              </div>

              <div class="form-group">
                <label>Credit Amount (BHD) *</label>
                <input type="number" id="financeCreditAmount" step="0.001" min="0.001" required>
              </div>

              <button type="submit" class="btn btn-primary">Add Verified Credit</button>
              <button type="button" class="btn btn-danger" onclick="deductFinanceCredit()" style="margin-left: 10px;">Deduct Credit</button>
            </form>
          </div>
        </div>

        <!-- PENDING PAYMENTS TAB -->
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
              <td>${payment.memberName}</td>
              <td>${filsToBhd(payment.amountFils)}</td>
              <td>${payment.method}</td>
              <td>${payment.reference}</td>
              <td>${payment.submittedAt}</td>
              <td>
                <button class="btn btn-secondary" onclick="verifyPaymentAdmin('${payment.id}')">Verify</button>
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

        <!-- CREDITED PLAYERS TAB -->
        <div id="credited-tab" class="tab-content" style="display: none;">
          <div class="card">
            <h2>✅ Credited Players</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Flight</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
      `;

      const creditedMembers = members.filter(m => m.walletBalanceFils > 0);
      if (creditedMembers.length === 0) {
        html += `<tr><td colspan="3" style="text-align: center; padding: 20px;">No credited players</td></tr>`;
      } else {
        creditedMembers.forEach(member => {
          html += `
            <tr>
              <td>${member.fullName}</td>
              <td>${member.flightName}</td>
              <td>${filsToBhd(member.walletBalanceFils)}</td>
            </tr>
          `;
        });
      }

      html += `
              </tbody>
            </table>
          </div>
        </div>

        <!-- UNPAID PLAYERS TAB -->
        <div id="unpaid-tab" class="tab-content" style="display: none;">
          <div class="card">
            <h2>❌ Unpaid Players</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Flight</th>
                  <th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
      `;

      const unpaidMembers = members.filter(m => m.walletBalanceFils < 0);
      if (unpaidMembers.length === 0) {
        html += `<tr><td colspan="3" style="text-align: center; padding: 20px;">No unpaid players</td></tr>`;
      } else {
        unpaidMembers.forEach(member => {
          html += `
            <tr>
              <td>${member.fullName}</td>
              <td>${member.flightName}</td>
              <td>${filsToBhd(Math.abs(member.walletBalanceFils))}</td>
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
  },

  // ===== ADVERTISING & BAZAAR CONTROL =====
  ads: () => {
    try {
      requireSuperAdmin();
      
      const businesses = JSON.parse(localStorage.getItem('businesses') || '[]');

      let html = `
        <div class="page-header">
          <h1>📢 Ads & BaZaar Control</h1>
          <p>Manage advertisements and sponsor listings</p>
        </div>

        <div class="tabs-container">
          <button class="tab-btn active" onclick="switchAdminTab('carousel')">Carousel</button>
          <button class="tab-btn" onclick="switchAdminTab('notice')">Upload Notice</button>
          <button class="tab-btn" onclick="switchAdminTab('businesses')">Businesses</button>
        </div>

        <!-- CAROUSEL TAB -->
        <div id="carousel-tab" class="tab-content">
          <div class="card">
            <h2>🎠 Carousel Settings</h2>
            <div class="form-group">
              <label>Number of Featured Ads (Max 10) *</label>
              <input type="number" id="carouselAdCount" min="1" max="10" value="5" required>
            </div>
            <button class="btn btn-primary" onclick="saveCarouselSettings()">Save Carousel Count</button>
          </div>
        </div>

        <!-- NOTICE TAB -->
        <div id="notice-tab" class="tab-content" style="display: none;">
          <div class="card">
            <h2>📝 Create Official Notice</h2>
            <form onsubmit="publishOfficialNotice(event)">
              <div class="form-group">
                <label>Notice Title *</label>
                <input type="text" id="noticeTitle" placeholder="e.g., Maintenance Schedule" required>
              </div>
              <div class="form-group">
                <label>Notice Body *</label>
                <textarea id="noticeBody" placeholder="Enter notice content..." required style="min-height: 150px;"></textarea>
              </div>
              <div class="form-group">
                <label>Image (PNG, JPEG, WebP - Max 2MB)</label>
                <input type="file" id="noticeImageFile" accept="image/png,image/jpeg,image/webp">
              </div>
              <button type="submit" class="btn btn-primary">Publish Official Notice</button>
            </form>
          </div>
        </div>

        <!-- BUSINESSES TAB -->
        <div id="businesses-tab" class="tab-content" style="display: none;">
          <div class="card">
            <h2>🏪 BaZaar Businesses</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Category</th>
                  <th>Offer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
      `;

      if (businesses.length === 0) {
        html += `<tr><td colspan="5" style="text-align: center; padding: 20px;">No businesses</td></tr>`;
      } else {
        businesses.forEach(biz => {
          html += `
            <tr>
              <td>${biz.name}</td>
              <td>${biz.category}</td>
              <td>${biz.offer}</td>
              <td><span class="badge badge-success">${biz.status}</span></td>
              <td>
                <button class="btn btn-danger" onclick="deleteBusiness('${biz.id}')">Delete</button>
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
      `;

      return html;
    } catch (error) {
      return `<div class="card"><h2>Error</h2><p>${error.message}</p></div>`;
    }
  },

  // ===== SYSTEM AUDIT LOG =====
  audit: () => {
    try {
      requireSuperAdmin();
      
      const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      const activities = JSON.parse(localStorage.getItem('activities') || '[]');

      let html = `
        <div class="page-header">
          <h1>🔍 System Audit Log</h1>
          <p>Track all system activities and changes</p>
        </div>

        <div class="card">
          <h2>🔎 Filters</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div class="form-group">
              <label>Category</label>
              <select id="auditCategoryFilter" onchange="filterAuditLogs()">
                <option value="">All Categories</option>
                <option value="MEMBER">Member</option>
                <option value="ATTENDANCE">Attendance</option>
                <option value="WALLET">Wallet / Payment</option>
                <option value="SESSION">Session Control</option>
                <option value="SHUTTLE_STOCK">Shuttle Stock</option>
                <option value="ACTIVITY">Activity</option>
                <option value="FLIGHT">Flight</option>
                <option value="TIMETABLE">Timetable</option>
              </select>
            </div>
            <div class="form-group">
              <label>Activity</label>
              <select id="auditActivityFilter" onchange="filterAuditLogs()">
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
              <input type="date" id="auditDateFilter" onchange="filterAuditLogs()">
            </div>
            <div class="form-group">
              <label>Member Search</label>
              <input type="text" id="auditMemberFilter" placeholder="Search member..." onkeyup="filterAuditLogs()">
            </div>
          </div>
          <button class="btn btn-secondary" onclick="printAuditLog()">🖨️ Print Current Log</button>
        </div>

        <div class="card">
          <h2>📋 Audit Logs</h2>
          <table class="data-table" id="auditTable">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Category</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
                <th>Actor</th>
              </tr>
            </thead>
            <tbody id="auditTableBody">
      `;

      if (auditLogs.length === 0) {
        html += `<tr><td colspan="6" style="text-align: center; padding: 20px;">No audit logs</td></tr>`;
      } else {
        auditLogs.slice(-100).reverse().forEach(log => {
          html += `
            <tr>
              <td>${log.timestamp}</td>
              <td><strong>${log.category}</strong></td>
              <td>${log.action}</td>
              <td>${log.target}</td>
              <td>${log.details}</td>
              <td>${log.actor}</td>
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

  // ===== CLUB OVERVIEW =====
  overview: () => {
    try {
      requireSuperAdmin();
      
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      const sessions = JSON.parse(localStorage.getItem('flightSessions') || '[]');
      const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

      const totalMembers = members.length;
      const activeSessions = sessions.filter(s => s.status === 'SCHEDULED').length;
      const totalAttendance = attendance.length;
      const totalRevenue = transactions
        .filter(t => t.status === 'PAID')
        .reduce((sum, t) => sum + (t.amountFils || 0), 0);

      let html = `
        <div class="page-header">
          <h1>📈 Club Overview</h1>
          <p>High-level club statistics and metrics</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: #667eea;">👥</div>
            <div class="stat-content">
              <h3>${totalMembers}</h3>
              <p>Total Members</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #00d4aa;">🎮</div>
            <div class="stat-content">
              <h3>${activeSessions}</h3>
              <p>Active Sessions</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #ffa502;">✓</div>
            <div class="stat-content">
              <h3>${totalAttendance}</h3>
              <p>Total Attendance</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #667eea;">💰</div>
            <div class="stat-content">
              <h3>${filsToBhd(totalRevenue)}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>📊 Member Distribution</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Players</td>
                <td>${members.filter(m => m.role === 'PLAYER').length}</td>
              </tr>
              <tr>
                <td>Flight Admins</td>
                <td>${members.filter(m => m.role === 'LEVEL_ADMIN').length}</td>
              </tr>
              <tr>
                <td>Super Admins</td>
                <td>${members.filter(m => m.role === 'SUPER_ADMIN').length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      return html;
    } catch (error) {
      return `<div class="card"><h2>Error</h2><p>${error.message}</p></div>`;
    }
  }
};

// ===== HELPER FUNCTIONS =====
window.switchAdminTab = function(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  const tab = document.getElementById(`${tabName}-tab`);
  if (tab) {
    tab.style.display = 'block';
    event.target.classList.add('active');
  }
};

window.createActivity = async function(event) {
  event.preventDefault();
  const name = document.getElementById('newActivityName').value;
  
  try {
    const result = await window.api.createActivity(name);
    if (result.success) {
      showToast(`Activity "${name}" created successfully`, 'success');
      navigateTo('flights');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.addFlight = async function(activityId) {
  const flightName = document.getElementById(`flightName-${activityId}`).value;
  const displayOrder = parseInt(document.getElementById(`flightSort-${activityId}`).value);
  
  if (!flightName) {
    showToast('Enter flight name', 'error');
    return;
  }
  
  try {
    const result = await window.api.addFlight(activityId, flightName, displayOrder);
    if (result.success) {
      showToast(`Flight "${flightName}" added successfully`, 'success');
      navigateTo('flights');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.preRegisterMember = async function(event) {
  event.preventDefault();
  const fullName = document.getElementById('memberFullName').value;
  const phone = document.getElementById('memberPhone').value;
  const role = document.getElementById('memberRole').value;
  const flightId = document.getElementById('memberFlight').value;
  
  if (!flightId) {
    showToast('Please select a flight level', 'error');
    return;
  }
  
  try {
    const result = await window.api.preRegisterMember(fullName, phone, role, flightId);
    if (result.success) {
      showToast(`Member "${fullName}" pre-registered successfully`, 'success');
      event.target.reset();
      navigateTo('flights');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.deleteMember = async function(uid, name) {
  if (!showConfirm(`Permanently delete ${name}? This action cannot be undone.`)) return;
  
  try {
    const result = await window.api.deleteMember(uid);
    if (result.success) {
      showToast(`Member "${name}" deleted permanently`, 'success');
      navigateTo('flights');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.addMasterSlot = async function(event) {
  event.preventDefault();
  const day = document.getElementById('slotDay').value;
  const flightId = document.getElementById('slotFlight').value;
  const startTime = document.getElementById('slotStart').value;
  const endTime = document.getElementById('slotEnd').value;
  
  try {
    const result = await window.api.addMasterSlot(day, flightId, startTime, endTime);
    if (result.success) {
      showToast('Weekly slot added successfully', 'success');
      event.target.reset();
      navigateTo('master');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.publishMonth = async function() {
  const month = document.getElementById('masterMonth').value;
  
  if (!month) {
    showToast('Select a month', 'error');
    return;
  }
  
  if (!showConfirm(`Publish all sessions for ${month}?`)) return;
  
  try {
    const result = await window.api.publishMonth(month);
    if (result.success) {
      showToast(result.message, 'success');
      navigateTo('master');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.deleteEntireMonth = function() {
  const month = document.getElementById('masterMonth').value;
  
  if (!month) {
    showToast('Select a month', 'error');
    return;
  }
  
  if (!showConfirm(`DELETE ALL TIMETABLE SLOTS for ${month}? This action cannot be undone.`)) return;
  
  showToast('Month timetable cleared', 'success');
};

window.importBulkTimetable = function(event) {
  event.preventDefault();
  const csvText = document.getElementById('bulkTimetableCsv').value;
  
  try {
    const validation = validateCSV(csvText, 4);
    if (!validation.valid) {
      throw new Error(validation.errors[0]);
    }
    
    showToast('CSV imported successfully', 'success');
    event.target.reset();
    navigateTo('master');
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.addFinanceCredit = async function(event) {
  event.preventDefault();
  const memberUid = document.getElementById('financeCreditMember').value;
  const amountBHD = parseFloat(document.getElementById('financeCreditAmount').value);
  
  if (!memberUid) {
    showToast('Select a member', 'error');
    return;
  }
  
  try {
    const amountFils = bhdToFils(amountBHD);
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    const member = members.find(m => m.uid === memberUid);
    
    if (member) {
      member.walletBalanceFils = (member.walletBalanceFils || 0) + amountFils;
      localStorage.setItem('members', JSON.stringify(members));
      
      logAudit('WALLET', 'Credit Added', memberUid, `${amountBHD} BHD credit added`);
      
      showToast(`${amountBHD} BHD credited to ${member.fullName}`, 'success');
      event.target.reset();
      navigateTo('admin-finance');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.deductFinanceCredit = function() {
  const memberUid = document.getElementById('financeCreditMember').value;
  const amountBHD = parseFloat(document.getElementById('financeCreditAmount').value);
  
  if (!memberUid) {
    showToast('Select a member', 'error');
    return;
  }
  
  try {
    const amountFils = bhdToFils(amountBHD);
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    const member = members.find(m => m.uid === memberUid);
    
    if (member) {
      member.walletBalanceFils = (member.walletBalanceFils || 0) - amountFils;
      localStorage.setItem('members', JSON.stringify(members));
      
      logAudit('WALLET', 'Credit Deducted', memberUid, `${amountBHD} BHD deducted`);
      
      showToast(`${amountBHD} BHD deducted from ${member.fullName}`, 'success');
      navigateTo('admin-finance');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.verifyPaymentAdmin = async function(paymentId) {
  if (!showConfirm('Verify this payment?')) return;
  
  try {
    const result = await window.api.verifyPayment(paymentId);
    if (result.success) {
      showToast(result.message, 'success');
      navigateTo('admin-finance');
    } else {
      showToast(result.error, 'error');
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.saveCarouselSettings = function() {
  const count = parseInt(document.getElementById('carouselAdCount').value);
  
  if (count < 1 || count > 10) {
    showToast('Carousel count must be between 1 and 10', 'error');
    return;
  }
  
  localStorage.setItem('carouselLimit', count.toString());
  showToast(`Carousel limit set to ${count}`, 'success');
};

window.publishOfficialNotice = function(event) {
  event.preventDefault();
  const title = document.getElementById('noticeTitle').value;
  const body = document.getElementById('noticeBody').value;
  const imageFile = document.getElementById('noticeImageFile').files[0];
  
  try {
    if (imageFile) {
      const validation = validateImage(imageFile);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }
    
    showToast('Notice published successfully', 'success');
    event.target.reset();
    navigateTo('ads');
  } catch (error) {
    showToast(error.message, 'error');
  }
};

window.deleteBusiness = function(bizId) {
  if (!showConfirm('Delete this business?')) return;
  
  const businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
  const filtered = businesses.filter(b => b.id !== bizId);
  localStorage.setItem('businesses', JSON.stringify(filtered));
  
  showToast('Business deleted', 'success');
  navigateTo('ads');
};

window.printAuditLog = function() {
  printTable('auditTable', 'System Audit Log');
};

window.filterAuditLogs = function() {
  // TODO: Implement multi-filter logic
};

window.updateMemberDropdown = function() {
  // TODO: Dynamically update member dropdown based on activity/flight selection
};

window.updateMemberPreview = function() {
  const memberUid = document.getElementById('financeCreditMember').value;
  const members = JSON.parse(localStorage.getItem('members') || '[]');
  const member = members.find(m => m.uid === memberUid);
  
  if (member) {
    document.getElementById('financeSelectedMemberPreview').textContent = filsToBhd(member.walletBalanceFils);
  }
};

window.toggleActivity = function(activityId) {
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  const activity = activities.find(a => a.id === activityId);
  
  if (activity) {
    activity.status = activity.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    localStorage.setItem('activities', JSON.stringify(activities));
    
    logAudit('ACTIVITY', activity.status === 'ACTIVE' ? 'Activated' : 'Deactivated', activityId, `Activity ${activity.name} ${activity.status}`);
    
    showToast(`Activity ${activity.status}`, 'success');
    navigateTo('flights');
  }
};

window.updateMemberRole = function(uid, role) {
  const members = JSON.parse(localStorage.getItem('members') || '[]');
  const member = members.find(m => m.uid === uid);
  
  if (member) {
    member.role = role;
    localStorage.setItem('members', JSON.stringify(members));
    
    logAudit('MEMBER', 'Role Updated', uid, `Role changed to ${role}`);
    
    showToast('Member role updated', 'success');
  }
};

window.updateMemberFlight = function(uid, flightId) {
  const members = JSON.parse(localStorage.getItem('members') || '[]');
  const member = members.find(m => m.uid === uid);
  
  if (member) {
    member.flightId = flightId;
    member.flightName = formatLevelName(flightId);
    localStorage.setItem('members', JSON.stringify(members));
    
    logAudit('MEMBER', 'Flight Updated', uid, `Flight changed to ${member.flightName}`);
    
    showToast('Member flight updated', 'success');
  }
};

window.deleteSlot = function(slotId) {
  if (!showConfirm('Delete this slot?')) return;
  
  const masterTimetable = JSON.parse(localStorage.getItem('masterTimetable') || '[]');
  const filtered = masterTimetable.filter(s => s.id !== slotId);
  localStorage.setItem('masterTimetable', JSON.stringify(filtered));
  
  showToast('Slot deleted', 'success');
  navigateTo('master');
};

console.log('✅ adminViews.js loaded successfully');

