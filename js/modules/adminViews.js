// FLIGHT ADMIN & SUPER ADMIN OPERATIONAL PANELS
window.adminViews = {
  sessions: () => {
    const inv = flightInventories[state.activeFlightLevel] || { tubePacks: 2, tubePrice: 6.000, corksUsed: 2 };
    const totalShuttles = inv.tubePacks * 12;
    const singlePrice = (inv.tubePacks * inv.tubePrice) / totalShuttles;

    return `
      ${pageHead("Session & Inventory Control", "Flight Admin inventory counter and cork usage.", `<span class="badge">${state.activeFlightLevel}</span>`)}
      <div class="grid two">
        <div class="card">
          <h3>Shuttle Inventory (${state.activeFlightLevel})</h3>
          <div class="field"><label>Tubes Stocked (12 Shuttles/Tube)</label><input type="number" id="admTubePacks" value="${inv.tubePacks}"></div>
          <div class="field"><label>Tube Price (BHD)</label><input type="number" step="0.100" id="admTubePrice" value="${inv.tubePrice.toFixed(3)}"></div>
          <div class="field"><label>Shuttles Used Today</label><input type="number" id="admCorksUsed" value="${inv.corksUsed}"></div>
          <button class="primary" onclick="saveFlightInventoryParameters()">Save Inventory Parameters</button>
        </div>
        <div class="card">
          <h3>Cost Breakdown</h3>
          <p>Single Shuttle Cost: <b>BHD ${singlePrice.toFixed(3)}</b></p>
          <p>Total Game Cost: <b>BHD ${(inv.corksUsed * singlePrice).toFixed(3)}</b></p>
          <button class="tag" onclick="exportDuesToCSV()">📥 Export Dues (CSV)</button>
        </div>
      </div>`;
  },

  master: () => {
    return `
      ${pageHead("Master Timetable & Rotational Hours", "Super Admin controls timetable matrix and dynamic session hours.", '<button class="tag" onclick="toast(\'Saved\')">Save Timetable</button>')}
      <div class="card">
        <div class="field"><label>Rotational Session Timing Box</label><input type="text" placeholder="e.g. 8:00 PM - 10:00 PM / 6:00 PM - 9:00 PM" value="8:00 PM - 10:00 PM"></div>
        ${window.views.timetable ? window.views.timetable(true) : ''}
      </div>`;
  },

  flightsPage: () => {
    return `
      ${pageHead("Super Admin: Member Registration & Flight Assignment", "Register players and assign them to specific flight levels.")}
      <div class="card">
        <h3>Register New Member</h3>
        <div class="field"><label>Member Name</label><input type="text" id="regName" placeholder="Full Name"></div>
        <div class="field"><label>Member ID</label><input type="text" id="regId" placeholder="IC-105"></div>
        <div class="field"><label>Assign Flight Level</label>
          <select id="regFlight">
            ${flights.map(f=>`<option value="${f}">${f}</option>`).join("")}
          </select>
        </div>
        <button class="primary" onclick="toast('Member Registered & Assigned!')">+ Register Member</button>
      </div>`;
  },

  ads: () => {
    return `
      ${pageHead("Sponsor Ad & Flyer Publisher", "Super Admin upload portal for sponsor banners.")}
      <div class="card">
        <div class="field"><label>Ad Title / Caption</label><input type="text" placeholder="e.g. Pro Sports Shop Discount"></div>
        <div class="field"><label>Upload Flyer Image</label><input type="file" accept="image/*"></div>
        <button class="primary" onclick="toast('Flyer & Announcement Published Globally!')">Publish Banner</button>
      </div>`;
  }
};

function saveFlightInventoryParameters() {
  const packs = parseInt(document.getElementById('admTubePacks').value) || 2;
  const price = parseFloat(document.getElementById('admTubePrice').value) || 6.000;
  const corks = parseInt(document.getElementById('admCorksUsed').value) || 2;

  flightInventories[state.activeFlightLevel] = { tubePacks: packs, tubePrice: price, corksUsed: corks };
  localStorage.setItem('shuttle_flight_inventories', JSON.stringify(flightInventories));
  toast("Saved inventory parameters for " + state.activeFlightLevel);
}

// DIRECT EXPORT TO CSV FOR CLUB COMMITTEES
function exportDuesToCSV() {
  const rows = [
    ["Member Name", "Member ID", "Flight", "Outstanding Dues (BHD)"],
    ["Alex", "IC-101", state.activeFlightLevel, "0.000"],
    ["Syed", "IC-102", state.activeFlightLevel, "0.500"]
  ];

  let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  let encodedUri = encodeURI(csvContent);
  let link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `ShuttleTracker_Dues_${state.activeFlightLevel}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
