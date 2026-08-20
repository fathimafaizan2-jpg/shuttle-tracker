// PLAYER AND COMMUNITY DIRECTORY VIEWS
window.views = {
  home: () => {
    const t = translations[state.lang] || translations.en;
    return `
      ${pageHead("Good evening", "Your Flight activity, credit and next session.", `<span class="badge">${state.activeFlightLevel}</span>`)}
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
            <div class="grow"><b>Badminton Match</b><p>7:35 PM – 8:35 PM · 2 courts</p></div>
            <span class="tag">${state.attendance}</span>
          </div>
          <div class="actions">
            <button class="action" onclick="go('attendance')">Respond to attendance<span>Coming / Not Coming</span></button>
            <button class="action" onclick="go('wallet')">Add credit<span>Wallet and payment history</span></button>
          </div>
        </div>
      </div>`;
  },

  attendance: () => {
    return `
      ${pageHead("Attendance", "Players change only their own response before session lock.")}
      <div class="card">
        <h3>Current Flight Roster</h3>
        <button class="tag" onclick="window.realAttendance('COMING', 'session123')">Mark Coming</button>
        <button class="tag red" onclick="window.realAttendance('NOT_COMING', 'session123')">Mark Not Coming</button>
      </div>`;
  },

  wallet: () => {
    return `
      ${pageHead("Wallet & Payments", "Personal credit, payments and cost deductions.")}
      <div class="grid two">
        <div class="card wallet"><small>CURRENT CREDIT</small><div class="balance">BHD 3.450</div></div>
        <div class="card"><h3>Settle Dues</h3><button class="primary" onclick="toast('Payment Submitted')">I Have Paid 📱</button></div>
      </div>`;
  },

  community: () => {
    return `
      ${pageHead("Indi Mart", "Approved Indian community businesses and offers.")}
      <div class="grid two">
        <div class="card"><h3>Spice Route Bahrain</h3><p>Indian restaurant · Manama</p><button class="tag blue">Contact Business</button></div>
        <div class="card"><h3>Trusted Travel Services</h3><p>Flights & Visa Support</p><button class="tag blue">View Details</button></div>
      </div>`;
  }
};
