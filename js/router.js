// NAVIGATION ENGINE & UTILITIES
function toast(message) {
  const box = document.getElementById("toast");
  box.textContent = message;
  box.classList.remove("hidden");
  setTimeout(() => box.classList.add("hidden"), 2500);
}

function go(page) {
  state.page = page;
  render();
}

function setAttendance(value) {
  state.attendance = value;
  toast("Attendance updated to " + value);
  render();
}

function pageHead(title, text, extra = "") {
  return `
    <div class="page-head">
      <div><h2>${title}</h2><p>${text}</p></div>
      ${extra}
    </div>`;
}

function flightClass(name) {
  if (name === "Premier") return "premier";
  if (name === "Flight 1") return "flight1";
  if (name === "Flight 2") return "flight2";
  if (name === "Flight 3") return "flight3";
  return "flight4";
}

function simple(title, text) {
  return `${pageHead(title, text)}<div class="card"><div class="empty-state"><h3>${title}</h3><p>${text}</p></div></div>`;
}

function render() {
  const pageMap = {
    home: window.views.home,
    timetable: window.views.timetable,
    attendance: window.views.attendance,
    wallet: window.views.wallet,
    history: () => simple("My History", "Attendance, session cost and payment history."),
    sessions: window.adminViews.sessions,
    stock: () => simple("Shuttle Stock", "Inventory, tube usage, valuation and low-stock warnings."),
    reports: () => simple("Reports & Print", "Attendance report, unpaid statement, stock report and printable receipt."),
    master: window.adminViews.master,
    flights: window.adminViews.flightsPage,
    finance: window.adminViews.finance,
    ads: window.adminViews.ads,
    audit: () => simple("Audit History", "Read-only corrections, approvals, payment checks and timetable changes."),
    announcements: () => simple("Announcements", "Club notices, flight reminders and manual WhatsApp sharing."),
    bazaar: window.views.community,
    profile: () => simple("My Profile", "Profile, contact preferences, language and secure password change.")
  };

  document.getElementById("view").innerHTML = (pageMap[state.page] || window.views.home)();

  const isAdmin = state.role === "LEVEL_ADMIN" || state.role === "SUPER_ADMIN";
  const isSuper = state.role === "SUPER_ADMIN";

  document.querySelectorAll(".admin-nav").forEach(el => el.classList.toggle("hidden", !isAdmin));
  document.querySelectorAll(".super-nav").forEach(el => el.classList.toggle("hidden", !isSuper));
  document.querySelectorAll(".nav").forEach(el => el.classList.toggle("active", el.dataset.page === state.page));

  document.getElementById("roleLabel").textContent = state.role.replace("_", " ");
  document.getElementById("sideRole").textContent = isSuper ? "Super Admin · All flights" : isAdmin ? "Level Admin · Flight 1" : "Player · Flight 1";
}
