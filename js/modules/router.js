export const state = {
  member: null,
  page: "home",
  language: "en"
};

const playerPages = new Set([
  "home", "timetable", "attendance", "logs", "wallet", "bazaar", "profile"
]);

const levelAdminPages = new Set([
  "home", "attendance", "sessionControl", "shuttle", "reports", "logs", "wallet", "profile"
]);

const superAdminPages = new Set([
  "home", "members", "activities", "advertising", "logs", "wallet", "profile"
]);

function approvedMember(member) {
  return member && ["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role);
}

function allowedPagesForRole(role) {
  if (role === "SUPER_ADMIN") return superAdminPages;
  if (role === "LEVEL_ADMIN") return levelAdminPages;
  return playerPages;
}

export function canOpenPage(page) {
  if (!state.member) return false;
  return allowedPagesForRole(state.member.role).has(page);
}

export function navigate(page) {
  if (!canOpenPage(page)) {
    showNotification("You do not have permission to open this page.", "warning");
    return false;
  }
  state.page = page;
  renderApp();
  return true;
}

export function getCurrentRole() {
  return state.member?.role || null;
}

export function isSuperAdmin() {
  return state.member?.role === "SUPER_ADMIN";
}

export function isLevelAdmin() {
  return state.member?.role === "LEVEL_ADMIN";
}

export function isPlayer() {
  return state.member?.role === "PLAYER";
}

export function getMember() {
  return state.member;
}

export function getCurrentPage() {
  return state.page;
}

export function getSidebarMenu() {
  const role = state.member?.role;

  if (role === "SUPER_ADMIN") {
    return [
      { label: "Dashboard", page: "home", icon: "home" },
      { label: "Members", page: "members", icon: "users" },
      { label: "Activities", page: "activities", icon: "calendar" },
      { label: "Advertising", page: "advertising", icon: "megaphone" },
      { label: "Logs", page: "logs", icon: "history" }
    ];
  } else if (role === "LEVEL_ADMIN") {
    return [
      { label: "Dashboard", page: "home", icon: "home" },
      { label: "Attendance", page: "attendance", icon: "check-circle" },
      { label: "Session Control", page: "sessionControl", icon: "sliders-h" },
      { label: "Shuttle Stock", page: "shuttle", icon: "badminton" },
      { label: "Reports", page: "reports", icon: "chart-bar" }
    ];
  } else if (role === "PLAYER") {
    return [
      { label: "Home", page: "home", icon: "home" },
      { label: "Timetable", page: "timetable", icon: "calendar-alt" },
      { label: "Attendance", page: "attendance", icon: "check-circle" },
      { label: "Wallet", page: "wallet", icon: "wallet" },
      { label: "BaZaar", page: "bazaar", icon: "store" },
      { label: "Profile", page: "profile", icon: "user-circle" }
    ];
  }

  return [];
}

export function getAuthToken() {
  return localStorage.getItem("firebase_auth_token") || null;
}

export function setAuthToken(token) {
  localStorage.setItem("firebase_auth_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("firebase_auth_token");
}

export function setMember(member) {
  state.member = member;
  localStorage.setItem("member_data", JSON.stringify(member));
}

export function loadMember() {
  const memberData = localStorage.getItem("member_data");
  if (memberData) {
    state.member = JSON.parse(memberData);
  }
  return state.member;
}

function renderApp() {
  window.dispatchEvent(new CustomEvent("app:navigate"));
}

function showNotification(message, type) {
  window.dispatchEvent(new CustomEvent("app:notify", { 
    detail: { message, type } 
  }));
}

export function initRouter() {
  loadMember();
  console.log("✅ Router initialized");
}

console.log('✅ router.js loaded');
