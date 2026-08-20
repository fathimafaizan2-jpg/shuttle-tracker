// LEVEL ADMIN & SUPER ADMIN VIEWS
window.adminViews = {
  master: () => {
    return `
      ${pageHead("Master Timetable", "Super Admin controls date range, day, time, courts, activity and flight. There is no venue field.", '<button class="tag" onclick="toast(\'Timetable saved\')">Save timetable</button>')}
      <div class="card"><p><b>Quarter: 04 July – 03 September 2026</b></p>${window.views.timetable(true)}</div>`;
  },

  flightsPage: () => {
    return `
      ${pageHead("Flights & Members", "Create, activate, assign and manage future flights without code changes.", '<button class="tag" onclick="toast(\'Flight 5 created\')">+ Create Flight</button>')}
      <div class="card"><div class="table-wrap"><table><thead><tr><th>Flight</th><th>Status</th><th>Players</th><th>Admin</th><th>Action</th></tr></thead>
      <tbody>${flights.map((flight, i) => `<tr><td><b>${flight}</b></td><td><span class="tag">Active</span></td><td>${16 + i}</td><td>${i === 1 ? "Ayesha Rahman" : "Assigned admin"}</td><td><button class="tag blue" onclick="toast('Flight management opened')">Manage</button></td></tr>`).join("")}</tbody>
      </table></div></div>`;
  },

  sessions: () => {
    return `
      ${pageHead("Session Control", "Assigned Level Admin controls only.", '<span class="badge">Flight 1</span>')}
      <div class="grid two"><div class="card"><h3>Monday session calculation</h3>
        <div class="field"><label>Tubes used</label><input value="1" type="number"></div>
        <div class="field"><label>Tube price (BHD)</label><input value="5.000"></div>
        <div class="field"><label>Actual eligible attendees</label><input value="10" readonly></div>
        <p class="notice"><b>Cost per attendee: BHD 0.500</b> Total cost is divided only among actual attendees.</p>
        <button class="primary" onclick="toast('Session calculation saved')">Save session figures</button>
      </div><div class="card"><h3>Shuttle stock</h3><p><b>14 sealed tubes</b></p><p>12 shuttlecocks per tube · Low-stock threshold: 8 tubes</p><button class="tag" onclick="toast('Stock report opened')">View stock report</button></div></div>`;
  },

  finance: () => {
    return `
      ${pageHead("Finance & Arrears", "Super Admin payment confirmation and arrears review.")}
      <div class="card"><div class="table-wrap"><table><thead><tr><th>Player</th><th>Flight</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
      <tbody><tr><td>Nabeel P</td><td>Flight 2</td><td>BHD 0.500</td><td><span class="tag amber">Submitted</span></td><td><button class="tag" onclick="toast('Payment verified with audit record')">Verify</button></td></tr>
      <tr><td>Sameer K</td><td>Premier</td><td>BHD 1.000</td><td><span class="tag red">Arrears</span></td><td><button class="tag blue" onclick="toast('Reminder prepared')">Remind</button></td></tr></tbody></table></div></div>`;
  },

  ads: () => {
    return `
      ${pageHead("Advertising Management", "Packages, approval and expiry for community advertisers.", '<button class="tag" onclick="toast(\'Package form opened\')">Create package</button>')}
      <div class="grid two"><div class="card"><h3>Community Standard</h3><p>BHD 15.000 · 30 days · Directory and banner placement</p><span class="tag">Active</span></div>
      <div class="card"><h3>Review queue</h3><p><b>Spice Route offer</b> <span class="note">Awaiting Super Admin approval</span></p><button class="tag" onclick="toast('Advertisement approved')">Approve</button> <button class="tag red" onclick="toast('Advertisement rejected')">Reject</button></div></div>`;
  }
};
