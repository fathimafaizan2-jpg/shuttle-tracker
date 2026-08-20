// PLAYER VIEWS WITH MANUAL "I HAVE PAID" AUTOMATION
window.views = {
  home: () => {
    const t = translations[state.lang] || translations.EN;
    return `
      <div class="card" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color:white; margin-bottom:14px;">
        <small style="color:#a5b4fc; font-weight:bold;">📢 RUNNING SPONSOR ANNOUNCEMENT</small>
        <h3 style="margin:4px 0 0; color:white;">🎾 Pro Sports Shop Bahrain — 15% Member Discount</h3>
        <p style="font-size:11px; opacity:0.8; margin-top:2px;">Show your Shuttle Tracker member card for discounts on Yonex AS-30 tubes.</p>
      </div>

      ${pageHead(t.home, "Your assigned flight overview & sessions.", `<span class="badge">${state.activeFlightLevel}</span>`)}
      <div class="grid metrics">
        <div class="card metric"><i>Next Game</i><b>Mon</b><span>7:35 PM</span></div>
        <div class="card metric"><i>Credit</i><b>3.450</b><span>BHD Balance</span></div>
        <div class="card metric"><i>Attended</i><b>14</b><span>Sessions</span></div>
        <div class="card metric"><i>Status</i><b style="color:var(--green);">Paid</b><span>No Dues</span></div>
      </div>

      <div class="card" style="margin-top:16px;">
        <h3>Upcoming Game Day</h3>
        <div class="session">
          <div class="datebox">25<small>MON</small></div>
          <div class="grow"><b>${state.activeFlightLevel} Match Session</b><p>7:35 PM – 8:35 PM · 2 Courts</p></div>
          <span class="tag">${state.attendance}</span>
        </div>
        <div class="actions">
          <button class="action" onclick="go('attendance')">Respond Attendance<span>Coming / Not Coming</span></button>
          <button class="action" onclick="go('wallet')">Wallet & Dues<span>Check Balance</span></button>
        </div>
      </div>`;
  },

  attendance: () => {
    const t = translations[state.lang] || translations.EN;
    const isLocked = state.sessionAutoLocked;
    const people = ["Nuzhath Fathima", "Ayesha Rahman", "Faisal P", "Rizwan K"];

    return `
      ${pageHead(t.attendance, "Attendance checklist. Auto-locks 15 mins after session start.", isLocked ? `<span class="tag red">${t.autolocked}</span>` : '<span class="badge">Session Open</span>')}
      <div class="card">
        <h3>Current Roster (${state.activeFlightLevel})</h3>
        ${people.map((name, idx) => `
          <div class="session">
            <div class="avatar">${name.split(" ").map(x=>x[0]).join("")}</div>
            <div class="grow"><b>${name}</b><p>${idx===0 ? "You" : "Roster Member"}</p></div>
            ${idx===0 && !isLocked ? `
              <button class="tag" onclick="setAttendance('COMING')">Yes</button>
              <button class="tag red" onclick="setAttendance('NOT COMING')">No</button>
            ` : `<span class="tag blue">${idx===0?state.attendance:'Roster'}</span>`}
          </div>
        `).join("")}
      </div>`;
  },

  wallet: () => {
    const t = translations[state.lang] || translations.EN;
    return `
      ${pageHead(t.wallet, "Credit wallet and manual payment submission.")}
      <div class="grid two">
        <div class="card wallet"><small>WALET BALANCE</small><div class="balance">BHD 3.450</div></div>
        <div class="card">
          <h3>Settle Session Dues</h3>
          <p class="note">BenefitPay Mobile / Cash Settlement</p>
          <button class="primary" onclick="triggerIHavePaidAutomation()">${t.ihavepaid} 📱</button>
        </div>
      </div>`;
  },

  community: () => {
    return `
      ${pageHead("Indi Mart", "Approved local Indian business directory.")}
      <div class="grid two">
        <div class="card"><h3>Spice Route Bahrain</h3><p>South & North Indian Restaurant · Manama</p><button class="tag blue">Contact Vendor</button></div>
        <div class="card"><h3>Royal Travel & Cargo</h3><p>Flights & Visa Assistance</p><button class="tag blue">View Services</button></div>
      </div>`;
  }
};

function triggerIHavePaidAutomation() {
  const adminPhone = "97339123456";
  const user = state.currentUser?.name || "Player";
  const level = state.activeFlightLevel;
  const msg = `Hi Admin, I (${user}) have submitted my game payment for ${level} via BenefitPay/Cash. Please verify and confirm.`;
  
  toast("Payment submission notice generated!");
  window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`, '_blank');
}
