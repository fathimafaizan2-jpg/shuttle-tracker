// SUPER ADMIN & OPERATIONS INTERACTIVE PANELS
window.adminViews = {
  
  // 1. SESSION CONTROL PANEL (Level Admin & Super Admin)
  sessions: () => {
    return `
      ${pageHead("Session Control", "Flight level session configuration and cork tube usage.")}
      <div class="grid two">
        <div class="card">
          <h3>Active Court Session</h3>
          <div class="field"><label>Selected Flight</label>
            <select id="sessFlight" onchange="state.activeFlightLevel=this.value; render();">
              ${flights.map(f => `<option value="${f}" ${f===state.activeFlightLevel?'selected':''}>${f}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>Shuttle Tubes Consumed</label><input id="tubesUsed" value="2" type="number" min="0" /></div>
          <div class="field"><label>Tube Cost (BHD)</label><input id="tubePrice" value="5.500" type="number" step="0.100" /></div>
          <button class="primary" onclick="toast('Session cork usage and charges logged!')">Calculate & Charge Session</button>
        </div>
        <div class="card">
          <h3>Auto-Lock Timer Status</h3>
          <div style="padding:12px; background:#f8fafc; border-radius:12px; border:1px solid var(--line);">
            <p style="margin:0; font-size:12px; font-weight:bold; color:var(--blue);">⏱️ Lock Status: ACTIVE</p>
            <small style="color:var(--muted);">Player attendance responses lock automatically 15 minutes after session start.</small>
          </div>
          <button class="action" style="margin-top:16px;" onclick="toast('Attendance override unlocked for admin adjustment.')">Override Locked Attendance</button>
        </div>
      </div>`;
  },

  // 2. MASTER TIMETABLE MATRIX (Super Admin)
  master: () => {
    return `
      ${pageHead("Master Timetable Matrix", "Quarterly rotational court schedule for all flights.")}
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>Dynamic Rotational Matrix</h3>
          <button class="tag blue" onclick="toast('New timetable slot added')">+ Add Court Slot</button>
        </div>
        <div style="overflow-x:auto;">
          <table style="width:100%; text-align:left; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="border-bottom:2px solid var(--line); color:var(--muted);">
                <th style="padding:8px;">Day</th>
                <th style="padding:8px;">Flight</th>
                <th style="padding:8px;">Timing</th>
                <th style="padding:8px;">Courts</th>
                <th style="padding:8px;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid var(--line);">
                <td style="padding:8px;"><b>Monday</b></td>
                <td style="padding:8px;"><span class="tag">Flight 1</span></td>
                <td style="padding:8px;">7:35 PM – 8:35 PM</td>
                <td style="padding:8px;">2 Courts</td>
                <td style="padding:8px;"><button class="tag red" onclick="toast('Slot deleted')">Delete</button></td>
              </tr>
              <tr style="border-bottom:1px solid var(--line);">
                <td style="padding:8px;"><b>Wednesday</b></td>
                <td style="padding:8px;"><span class="tag">Premier</span></td>
                <td style="padding:8px;">8:35 PM – 9:35 PM</td>
                <td style="padding:8px;">3 Courts</td>
                <td style="padding:8px;"><button class="tag red" onclick="toast('Slot deleted')">Delete</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`;
  },

  // 3. FLIGHTS & MEMBERS MANAGEMENT (Super Admin)
  flightsPage: () => {
    return `
      ${pageHead("Flights & Member Roster", "Register players, assign Flight levels, and delegate admins.")}
      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>Member Assignment Panel</h3>
          <button class="primary" style="width:auto; padding:8px 16px;" onclick="document.getElementById('memberModal').classList.remove('hidden')">+ Register New Member</button>
        </div>
      </div>
      <div class="card">
        <h3>Active Registered Roster</h3>
        <div style="overflow-x:auto; margin-top:12px;">
          <table style="width:100%; text-align:left; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="border-bottom:2px solid var(--line); color:var(--muted);">
                <th style="padding:8px;">Member Name</th>
                <th style="padding:8px;">ID</th>
                <th style="padding:8px;">Flight</th>
                <th style="padding:8px;">Role</th>
                <th style="padding:8px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid var(--line);">
                <td style="padding:8px;"><b>Rajesh Kumar</b></td>
                <td style="padding:8px;">ICB-101</td>
                <td style="padding:8px;"><span class="tag">Flight 1</span></td>
                <td style="padding:8px;"><span class="tag blue">Level Admin</span></td>
                <td style="padding:8px;">
                  <button class="tag" onclick="document.getElementById('memberModal').classList.remove('hidden')">Edit / Transfer</button>
                </td>
              </tr>
              <tr style="border-bottom:1px solid var(--line);">
                <td style="padding:8px;"><b>Suresh Nair</b></td>
                <td style="padding:8px;">ICB-108</td>
                <td style="padding:8px;"><span class="tag">Flight 2</span></td>
                <td style="padding:8px;"><span class="tag">Player</span></td>
                <td style="padding:8px;">
                  <button class="tag" onclick="document.getElementById('memberModal').classList.remove('hidden')">Edit / Transfer</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`;
  },

  // 4. FINANCE & ARREARS MANAGEMENT (Super Admin)
  finance: () => {
    return `
      ${pageHead("Finance & Arrears Audit", "Track unpaid player dues, top-up wallets, and export ledgers.")}
      <div class="grid two" style="margin-bottom:16px;">
        <div class="card">
          <h3>Wallet Top-up Adjustment</h3>
          <div class="field"><label>Member ID</label><input id="finMemId" placeholder="ICB-101" /></div>
          <div class="field"><label>Credit Amount (BHD)</label><input id="finCredit" type="number" step="0.500" value="5.000" /></div>
          <button class="primary" onclick="toast('Wallet credit added successfully!')">Add Credit Balance</button>
        </div>
        <div class="card">
          <h3>CSV Ledger Exports</h3>
          <p style="font-size:12px; color:var(--muted);">Download complete club financial and arrears records.</p>
          <button class="action" onclick="toast('Downloading Attendance CSV...')">📥 Export Attendance CSV</button>
          <button class="action" style="margin-top:8px;" onclick="toast('Downloading Arrears Statement CSV...')">📥 Export Arrears Statement CSV</button>
        </div>
      </div>`;
  },

  // 5. ADVERTISING MANAGEMENT (Super Admin)
  ads: () => {
    return `
      ${pageHead("Advertising & Community Sponsors", "Approve merchant flyer submissions and manage front-page ads.")}
      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>Sponsor Flyer Review Queue</h3>
          <button class="primary" style="width:auto; padding:8px 16px;" onclick="openBusinessSubmitModal()">+ Submit New Ad Flyer</button>
        </div>
      </div>
      <div class="grid two">
        <div class="card">
          <span class="tag blue">Pending Review</span>
          <h4 style="margin:8px 0 4px 0;">Spice Route Restaurant</h4>
          <p style="font-size:11px; color:var(--muted); margin:0;">10% discount for ICB Members · Manama</p>
          <div style="display:flex; gap:8px; margin-top:12px;">
            <button class="tag" style="background:#22c55e; color:white;" onclick="toast('Ad approved and published to landing page!')">Approve & Publish</button>
            <button class="tag red" onclick="toast('Ad submission rejected')">Reject</button>
          </div>
        </div>
      </div>`;
  }
};
