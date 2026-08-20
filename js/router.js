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

  const viewContainer = document.getElementById("view");
  if (viewContainer) {
    viewContainer.innerHTML = (pageMap[state.page] || window.views.home)();
  }

  const isAdmin = state.role === "LEVEL_ADMIN" || state.role === "SUPER_ADMIN";
  const isSuper = state.role === "SUPER_ADMIN";

  document.querySelectorAll(".admin-nav").forEach(el => el.classList.toggle("hidden", !isAdmin));
  document.querySelectorAll(".super-nav").forEach(el => el.classList.toggle("hidden", !isSuper));
  document.querySelectorAll(".nav").forEach(el => el.classList.toggle("active", el.dataset.page === state.page));

  const roleLabel = document.getElementById("roleLabel");
  if (roleLabel) roleLabel.textContent = state.role.replace("_", " ");
}
