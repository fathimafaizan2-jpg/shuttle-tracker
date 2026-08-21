// NAVIGATION ENGINE & API FETCH WRAPPERS
function toast(message) {
  const box = document.getElementById("toast");
  if (!box) return;
  box.textContent = message;
  box.classList.remove("hidden");
  setTimeout(() => box.classList.add("hidden"), 2500);
}

function go(page) {
  state.page = page;
  render();
}

function pageHead(title, text, extra = "") {
  return `
    <div class="page-head">
      <div><h2>${title}</h2><p>${text}</p></div>
      ${extra}
    </div>`;
}

function simple(title, text) {
  return `${pageHead(title, text)}<div class="card"><div class="empty-state"><h3>${title}</h3><p>${text}</p></div></div>`;
}

function render() {
  const v = window.views || {};
  const av = window.adminViews || {};

  const pageMap = {
    home: v.home || (() => simple("Home Dashboard", "Welcome to ICB Shuttle Tracker.")),
    timetable: v.timetable || (() => simple("My Timetable", "Weekly match schedule and court allocations.")),
    attendance: v.attendance || (() => simple("Attendance Roster", "View and update your session attendance.")),
    wallet: v.wallet || (() => simple("Wallet & Payments", "Check balance and settle session costs.")),
    history: () => simple("My History", "Attendance, session cost and payment history."),
    sessions: av.sessions || (() => simple("Session Control", "Flight level session operations.")),
    stock: () => simple("Shuttle Stock", "Inventory, tube usage, valuation and low-stock warnings."),
    reports: () => simple("Reports & Print", "Attendance report, unpaid statement, stock report and printable receipt."),
    master: av.master || (() => simple("Master Timetable", "Quarterly rotational court schedule.")),
    flights: av.flightsPage || (() => simple("Flights & Members", "Register players and manage flight rosters.")),
    finance: av.finance || (() => simple("Finance & Arrears", "Track unpaid player dues and top-up balances.")),
    ads: av.ads || (() => simple("Advertising Management", "Sponsor flyer submissions and approvals.")),
    audit: () => simple("Audit History", "Read-only corrections, approvals, payment checks and timetable changes."),
    announcements: () => simple("Announcements", "Club notices, flight reminders and manual WhatsApp sharing."),
    bazaar: v.community || (() => simple("Indi Mart", "Community directory and local business offers.")),
    profile: () => simple("My Profile", "Profile, contact preferences, language and secure password change.")
  };

  const viewContainer = document.getElementById("view");
  if (viewContainer) {
    const viewFn = pageMap[state.page] || pageMap.home;
    viewContainer.innerHTML = viewFn();
  }

  const isAdmin = state.role === "LEVEL_ADMIN" || state.role === "SUPER_ADMIN";
  const isSuper = state.role === "SUPER_ADMIN";

  document.querySelectorAll(".admin-nav").forEach(el => el.classList.toggle("hidden", !isAdmin));
  document.querySelectorAll(".super-nav").forEach(el => el.classList.toggle("hidden", !isSuper));
  document.querySelectorAll(".nav").forEach(el => el.classList.toggle("active", el.dataset.page === state.page));

  const roleLabel = document.getElementById("roleLabel");
  if (roleLabel) roleLabel.textContent = (state.role || "PLAYER").replace("_", " ");
}
