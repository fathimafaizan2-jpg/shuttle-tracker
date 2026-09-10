
// router.js - Navigation & Authentication

export const state = { member: null, page: "home", language: "en" };

const playerPages = new Set(["home", "timetable", "attendance", "logs", "wallet", "bazaar", "profile"]);
const flightAdminPages = new Set(["home", "attendance", "sessionControl", "shuttle", "reports", "logs", "wallet", "profile"]);
const superAdminPages = new Set(["home", "members", "timetable", "advertising", "reports", "logs", "wallet", "bazaar", "profile"]);

function approvedMember(member) {
  return member && ["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role);
}

function allowedPagesForRole(role) {
  if (role === "SUPER_ADMIN") return superAdminPages;
  if (role === "LEVEL_ADMIN") return flightAdminPages;
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
      { label: "Home", page: "home", icon: "🏠" },
      { label: "Members", page: "members", icon: "👥" },
      { label: "Timetable", page: "timetable", icon: "📅" },
      { label: "Advertising", page: "advertising", icon: "📢" },
      { label: "Reports", page: "reports", icon: "📊" },
      { label: "Logs", page: "logs", icon: "📝" }
    ];
  } else if (role === "LEVEL_ADMIN") {
    return [
      { label: "Home", page: "home", icon: "🏠" },
      { label: "Attendance", page: "attendance", icon: "✓" },
      { label: "Session Control", page: "sessionControl", icon: "⚙️" },
      { label: "Shuttle Stock", page: "shuttle", icon: "🏸" },
      { label: "Reports", page: "reports", icon: "📊" }
    ];
  } else if (role === "PLAYER") {
    return [
      { label: "Home", page: "home", icon: "🏠" },
      { label: "Timetable", page: "timetable", icon: "📅" },
      { label: "Attendance", page: "attendance", icon: "✓" },
      { label: "Wallet", page: "wallet", icon: "💰" },
      { label: "BaZaar", page: "bazaar", icon: "🛍️" }
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

function renderApp() {
  window.dispatchEvent(new CustomEvent("app:render"));
}

function showNotification(message, type) {
  window.dispatchEvent(new CustomEvent("app:notify", { detail: { message, type } }));
}

