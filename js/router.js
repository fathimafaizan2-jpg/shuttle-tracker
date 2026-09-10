
// router.js - Updated Navigation & Authentication (Complete)

import { api, observeAuth } from "./modules/auth.js";

export const state = { member: null, page: "home", language: "en" };
const memberCacheKey = "indian_club_verified_member";

// Updated page access for each role
const playerPages = new Set([
  "home",
  "timetable",
  "attendance",
  "logs",
  "wallet",
  "bazaar",
  "profile"
]);

const flightAdminPages = new Set([
  "home",
  "attendance",
  "sessionControl",
  "shuttle",
  "reports",
  "logs",
  "wallet",
  "profile"
]);

const superAdminPages = new Set([
  "home",
  "members",
  "timetable",
  "advertising",
  "reports",
  "logs",
  "wallet",
  "bazaar",
  "profile"
]);

// Helper functions
function approvedMember(member) {
  return member && ["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role);
}

function allowedPagesForRole(role) {
  if (role === "SUPER_ADMIN") return superAdminPages;
  if (role === "LEVEL_ADMIN") return flightAdminPages;
  return playerPages;
}

function cacheMember(member) {
  try {
    localStorage.setItem(memberCacheKey, JSON.stringify(member));
  } catch (e) {
    console.warn("Could not cache member:", e);
  }
}

function clearCachedMember() {
  try {
    localStorage.removeItem(memberCacheKey);
  } catch (e) {
    console.warn("Could not clear cached member:", e);
  }
}

function cachedMemberFor(uid) {
  try {
    const value = JSON.parse(localStorage.getItem(memberCacheKey) || "null");
    return value?.uid === uid && approvedMember(value) ? value : null;
  } catch (e) {
    return null;
  }
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// Check if user can open a page
export function canOpenPage(page) {
  if (!state.member) return false;
  return allowedPagesForRole(state.member.role).has(page);
}

// Navigate to a page with permission check
export function navigate(page) {
  if (!canOpenPage(page)) {
    window.dispatchEvent(
      new CustomEvent("indianclub:toast", {
        detail: "You do not have permission to open this page."
      })
    );
    return false;
  }
  state.page = page;
  window.dispatchEvent(new CustomEvent("indianclub:render"));
  return true;
}

// Get current user role
export function getCurrentRole() {
  return state.member?.role || null;
}

// Check if user is Super Admin
export function isSuperAdmin() {
  return state.member?.role === "SUPER_ADMIN";
}

// Check if user is Level Admin
export function isLevelAdmin() {
  return state.member?.role === "LEVEL_ADMIN";
}

// Check if user is Player
export function isPlayer() {
  return state.member?.role === "PLAYER";
}

// Get user's flight ID
export function getUserFlightId() {
  return state.member?.flightId || null;
}

// Get user's member ID
export function getUserMemberId() {
  return state.member?.memberId || null;
}

// Get user's full name
export function getUserName() {
  return state.member?.fullName || null;
}

// Get user's email
export function getUserEmail() {
  return state.member?.email || null;
}

// Get user's UID
export function getUserUid() {
  return state.member?.uid || null;
}

// Start signed-in app
export async function startSignedInApp() {
  let member;
  try {
    member = await api("/members/me", {
      loadingLabel: "Restoring your account…"
    });
  } catch (firstError) {
    await delay(650);
    member = await api("/members/me", {
      forceRefresh: true,
      loadingLabel: "Restoring your account…"
    });
  }

  if (!approvedMember(member)) {
    throw new Error("This account is not approved for Indian Club access.");
  }

  state.member = member;
  state.page = state.page || "home";
  state.language = localStorage.getItem("indian_club_language") || "en";
  cacheMember(member);

  return member;
}

// Set language
export function setLanguage(language) {
  state.language = language;
  localStorage.setItem("indian_club_language", language);
  window.dispatchEvent(new CustomEvent("indianclub:render"));
}

// Get current language
export function getLanguage() {
  return state.language;
}

// Watch authentication state
export function watchAuthentication({ onSignedIn, onSignedOut, onError }) {
  return observeAuth(async (user) => {
    if (!user) {
      clearCachedMember();
      state.member = null;
      state.page = "home";
      onSignedOut?.();
      return;
    }

    try {
      await startSignedInApp();
      onSignedIn?.(state.member);
    } catch (error) {
      const cached = cachedMemberFor(user.uid);
      if (cached) {
        state.member = cached;
        state.page = "home";
        onSignedIn?.(cached);
        return;
      }
      onError?.(error);
    }
  });
}

// Get member data
export function getMember() {
  return state.member;
}

// Get current page
export function getCurrentPage() {
  return state.page;
}

// Render page based on role and current page
export function renderPage() {
  const role = state.member?.role;
  const page = state.page;

  // Import views based on role
  if (role === "SUPER_ADMIN") {
    return renderAdminPage(page);
  } else if (role === "LEVEL_ADMIN") {
    return renderFlightAdminPage(page);
  } else if (role === "PLAYER") {
    return renderPlayerPage(page);
  }

  return "<p>Loading...</p>";
}

// Render admin pages
function renderAdminPage(page) {
  switch (page) {
    case "home":
      return adminViews.dashboard();
    case "members":
      return adminViews.membersTab();
    case "timetable":
      return adminViews.timetableTab();
    case "advertising":
      return adminViews.advertisingTab();
    case "reports":
      return adminViews.reportsTab();
    case "logs":
      return adminViews.logsTab();
    case "wallet":
      return adminViews.walletTab?.() || "<p>Wallet</p>";
    case "bazaar":
      return adminViews.bazaarTab?.() || "<p>BaZaar</p>";
    case "profile":
      return adminViews.profileTab?.() || "<p>Profile</p>";
    default:
      return "<p>Page not found</p>";
  }
}

// Render flight admin pages
function renderFlightAdminPage(page) {
  switch (page) {
    case "home":
      return flightAdminViews.dashboard();
    case "attendance":
      return flightAdminViews.attendanceTab();
    case "sessionControl":
      return flightAdminViews.sessionControlTab();
    case "shuttle":
      return flightAdminViews.shuttleTab();
    case "reports":
      return flightAdminViews.reportsTab();
    case "logs":
      return flightAdminViews.logsTab?.() || "<p>Logs</p>";
    case "wallet":
      return flightAdminViews.walletTab?.() || "<p>Wallet</p>";
    case "profile":
      return flightAdminViews.profileTab?.() || "<p>Profile</p>";
    default:
      return "<p>Page not found</p>";
  }
}

// Render player pages
function renderPlayerPage(page) {
  switch (page) {
    case "home":
      return views.home();
    case "timetable":
      return views.timetable();
    case "attendance":
      return views.attendance();
    case "logs":
      return views.logs();
    case "wallet":
      return views.wallet();
    case "bazaar":
      return views.bazaar();
    case "profile":
      return views.profile();
    default:
      return "<p>Page not found</p>";
  }
}

// Navigation helper for buttons
export function navigateTo(page) {
  if (navigate(page)) {
    // Scroll to top
    window.scrollTo(0, 0);
  }
}

// Get sidebar menu items based on role
export function getSidebarMenu() {
  const role = state.member?.role;

  if (role === "SUPER_ADMIN") {
    return [
      { label: "Home", page: "home", icon: "🏠" },
      { label: "Members", page: "members", icon: "👥" },
      { label: "Timetable", page: "timetable", icon: "📅" },
      { label: "Advertising", page: "advertising", icon: "📢" },
      { label: "Reports", page: "reports", icon: "📊" },
      { label: "Logs", page: "logs", icon: "📝" },
      { label: "Wallet", page: "wallet", icon: "💰" },
      { label: "BaZaar", page: "bazaar", icon: "🛍️" },
      { label: "Profile", page: "profile", icon: "👤" }
    ];
  } else if (role === "LEVEL_ADMIN") {
    return [
      { label: "Home", page: "home", icon: "🏠" },
      { label: "Attendance", page: "attendance", icon: "✓" },
      { label: "Session Control", page: "sessionControl", icon: "⚙️" },
      { label: "Shuttle Stock", page: "shuttle", icon: "🏸" },
      { label: "Reports", page: "reports", icon: "📊" },
      { label: "Logs", page: "logs", icon: "📝" },
      { label: "Wallet", page: "wallet", icon: "💰" },
      { label: "Profile", page: "profile", icon: "👤" }
    ];
  } else if (role === "PLAYER") {
    return [
      { label: "Home", page: "home", icon: "🏠" },
      { label: "Timetable", page: "timetable", icon: "📅" },
      { label: "Attendance", page: "attendance", icon: "✓" },
      { label: "Logs", page: "logs", icon: "📝" },
      { label: "Wallet", page: "wallet", icon: "💰" },
      { label: "BaZaar", page: "bazaar", icon: "🛍️" },
      { label: "Profile", page: "profile", icon: "👤" }
    ];
  }

  return [];
}

// Check if page is accessible
export function isPageAccessible(page) {
  return canOpenPage(page);
}

// Get all accessible pages for current role
export function getAccessiblePages() {
  return Array.from(allowedPagesForRole(state.member?.role));
}

// Sign out
export async function signOut() {
  clearCachedMember();
  state.member = null;
  state.page = "home";
  window.dispatchEvent(new CustomEvent("indianclub:signout"));
}

// Utility: Show notification
export function showNotification(message, type = "info") {
  window.dispatchEvent(
    new CustomEvent("indianclub:toast", {
      detail: message,
      type: type
    })
  );
}

// Utility: Get auth token
export function getAuthToken() {
  return localStorage.getItem("firebase_auth_token") || null;
}

// Utility: Set auth token
export function setAuthToken(token) {
  localStorage.setItem("firebase_auth_token", token);
}

// Utility: Clear auth token
export function clearAuthToken() {
  localStorage.removeItem("firebase_auth_token");
}

// Export state for debugging
export function getState() {
  return { ...state };
}

