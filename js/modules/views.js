// PLAYER & COMMUNITY VIEWS
window.views = {
  timetable: (editable = false) => {
    return `
      <div class="table-wrap">
        <table class="schedule">
          <thead>
            <tr>
              <th>Day</th>
              <th>6:35 – 7:35 <small>2 courts</small></th>
              <th>7:35 – 8:35 <small>2 courts</small></th>
              <th>8:35 – 9:35 <small>2 courts</small></th>
              <th>9:35 – 10:35 <small>2 courts</small></th>
            </tr>
          </thead>
          <tbody>
            ${schedule.map(row => `
              <tr>
                <td>${row[0]}</td>
                ${row.slice(1).map(flight => `
                  <td>
                    <div class="slot ${flightClass(flight)}">
                      ${editable ? `
                        <select onchange="toast('Timetable cell updated')">
                          ${flights.map(item => `<option ${item === flight ? "selected" : ""}>${item}</option>`).join("")}
                        </select>` : flight}
                    </div>
                  </td>`).join("")}
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  },

  home: () => {
    return `
      ${pageHead("Good evening, Nuzhath", "Your Flight 1 activity, credit and next session.", '<span class="badge">Flight 1</span>')}
      <div class="grid metrics">
        <div class="card metric"><i>Next game</i><b>Mon</b><span>7:35 PM · 2 courts</span></div>
        <div class="card metric"><i>Credit</i><b>3.450</b><span>BHD available</span></div>
        <div class="card metric"><i>Attended</i><b>14</b><span>days this quarter</span></div>
        <div class="card metric"><i>Outstanding</i><b>0.000</b><span>BHD to pay</span></div>
      </div>
      <div class="grid two" style="margin-top:16px">
        <div class="card">
          <h3>Upcoming session</h3>
          <div class="session">
            <div class="datebox">25<small>MON</small></div>
            <div class="grow"><b>Flight 1 Badminton</b><p>7:35 PM – 8:35 PM · 2 courts</p></div>
            <span class="tag">${state.attendance}</span>
          </div>
          <div class="actions">
            <button class="action" onclick="go('attendance')">Respond to attendance<span>Coming / Not Coming</span></button>
            <button class="action" onclick="go('wallet')">Add credit<span>Wallet and payment history</span></button>
            <button class="action" onclick="go('timetable')">View timetable<span>Assigned flight schedule</span></button>
            <button class="action" onclick="go('announcements')">Club notices<span>Latest updates</span></button>
          </div>
        </div>
        <div class="grid">
          <div class="card wallet"><small>WALLET BALANCE</small><div class="balance">BHD 3.450</div><p>Enough for your next estimated session cost.</p></div>
          <div class="card"><h3>Club announcement</h3><p><b>Quarter timetable published</b></p><p class="note">Check your assigned schedule before responding.</p></div>
        </div>
      </div>`;
  },

  attendance: () => {
    const people = ["Nuzhath Fathima", "Ayesha Rahman", "Faisal P", "Rizwan K", "Shabana M"];
    return `
      ${pageHead("Attendance", "Players change only their own response before session lock.", '<span class="badge">Session open</span>')}
      <div class="card"><h3>Monday · Flight 1 · 7:35 PM</h3>
        ${people.map((name, index) => `
          <div class="session">
            <div class="avatar">${name.split(" ").map(x => x[0]).join("")}</div>
            <div class="grow"><b>${name}</b><p>${index === 0 ? "You · " + state.attendance : "Flight 1 roster · visible only"}</p></div>
            ${index === 0 ? `
              <button class="tag" onclick="setAttendance('COMING')">Coming</button>
              <button class="tag red" onclick="setAttendance('NOT COMING')">Not coming</button>` : '<span class="tag blue">Roster</span>'}
          </div>`).join("")}
      </div>
      <div class="card" style="margin-top:16px"><h3>Locking rule</h3><p>After the game starts, only the assigned Level Admin can correct attendance. Every correction requires a reason and audit record.</p></div>`;
  },

  wallet: () => {
    return `
      ${pageHead("Wallet & Payments", "Personal credit, payments and cost deductions.", '<button class="tag" onclick="toast(\'Top-up request created\')">Add credit</button>')}
      <div class="grid two">
        <div class="card wallet"><small>CURRENT CREDIT</small><div class="balance">BHD 3.450</div><p>Credits carry forward for future sessions.</p></div>
        <div class="card"><h3>Next estimated cost</h3><b style="font-size:28px">BHD 0.500</b><p class="note">Final cost = tube price × tubes used ÷ actual attendees.</p><span class="tag">No arrears</span></div>
      </div>
      <div class="card" style="margin-top:16px"><h3>Ledger</h3>
        <div class="table-wrap"><table><thead><tr><th>Date</th><th>Description</th><th>Method</th><th>Amount</th><th>Balance</th></tr></thead>
        <tbody>
          <tr><td>18 Jul</td><td>Credit top-up</td><td>Benefit verified</td><td style="color:#138a55">+2.000</td><td>3.450</td></tr>
          <tr><td>14 Jul</td><td>Flight 1 session</td><td>Credit deduction</td><td style="color:#dc2626">-0.550</td><td>1.450</td></tr>
        </tbody></table></div>
      </div>`;
  },

  community: () => {
    return `
      ${pageHead("Indi Mart", "Approved Indian community businesses and offers.", '<button class="tag" onclick="toast(\'Business listing form opened\')">List a business</button>')}
      <div class="grid two"><div class="card"><h3>Spice Route Bahrain</h3><p>Indian restaurant · Manama</p><p class="note">Community offer available for club members.</p><button class="tag blue">Contact business</button></div>
      <div class="card"><h3>Trusted Travel Services</h3><p>Flights, visa support and holiday packages.</p><p class="note">Approved business directory listing.</p><button class="tag blue">View details</button></div></div>`;
  }
};
