// FLIGHT ADMIN AND SUPER ADMIN VIEWS
window.adminViews = {
  sessions: () => {
    return `
      ${pageHead("Session Control", "Assigned Level Admin controls only.")}
      <div class="grid two">
        <div class="card">
          <h3>Session Inventory</h3>
          <div class="field"><label>Tubes Used</label><input id="tubesUsed" value="1" type="number"></div>
          <div class="field"><label>Tube Price (BHD)</label><input id="tubePrice" value="5.000"></div>
          <button class="primary" onclick="toast('Inventory Saved')">Save Session Figures</button>
        </div>
      </div>`;
  },

  master: () => {
    return `
      ${pageHead("Master Timetable", "Super Admin timetable matrix control.")}
      <div class="card"><p>Quarterly Timetable Matrix Editor</p></div>`;
  },

  flightsPage: () => {
    return `
      ${pageHead("Flights & Members", "Register members and manage dynamic flight rosters.")}
      <div class="card"><p>Super Admin Member Assignment Panel</p></div>`;
  },

  finance: () => {
    return `
      ${pageHead("Finance & Arrears", "Super Admin payment verification and arrears review.")}
      <div class="card"><a href="http://localhost:3000/api/reports/arrears.csv" class="tag">Export Arrears CSV</a></div>`;
  },

  ads: () => {
    return `
      ${pageHead("Advertising Management", "Package manager and flyer approval queue.")}
      <div class="card"><p>Sponsor Flyer Review Panel</p></div>`;
  }
};
