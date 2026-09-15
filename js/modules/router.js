
import { api, observeAuth } from "./modules/auth.js";

/* ─────────────── state ─────────────── */
export const state = { member: null, page: "home", language: "en" };
const memberCacheKey = "indian_club_verified_member";

/* ─────────────── page access sets (ORIGINAL + COMPLETE) ─────────────── */

// PLAYER → 7 tabs (all from views.js)
const playerPages = new Set([
  "home",        // Home dashboard with upcoming game, wallet balance
  "timetable",   // View-only timetable with activity/month filters
  "attendance",  // Own attendance log with activity/month filters
  "logs",        // Own activity logs (attendance, payment, wallet)
  "wallet",      // Wallet balance, pay by credit/cash/benefit/WhatsApp
  "bazaar",      // Browse community directory, submit business
  "profile"      // Update credentials, photo, password
]);

// FLIGHT ADMIN (LEVEL_ADMIN) → 10 tabs (7 player + 3 flight-admin specific)
const flightAdminPages = new Set([
  ...playerPages,   // All 7 player tabs
  "sessions",       // Session Control: attendance, shuttles, game completion, charges
  "stock",          // Shuttle Stock: manage own flight stock, refill log
  "finance"         // Finance: payment tracking for own flight
]);

// SUPER ADMIN → 12+ tabs (player + flight-admin + super-admin specific)
const superAdminPages = new Set([
  "home",        // Club-wide dashboard with all flights stats
  "master",      // Members management: add/edit/activate/deactivate/delete
  "flights",     // Timetable management: full CRUD + CSV import
  "finance",     // Finance: all members payments + add credit/deduction per member
  "logs",        // System audit logs with multi-filter (category, activity, level, date, member)
  "wallet",      // View all members wallet status
  "sessions",    // Session Control: view all flights (with level dropdown)
  "stock",       // Shuttle Stock: view all flights stock (with level dropdown)
  "ads",         // Ads & Notices: carousel (max 10), club announcements, approval workflow
  "audit",       // Activities management
  "bazaar",      // Browse + approve/reject businesses
  "profile"      // Update own credentials
]);

/* ─────────────── helper functions ─────────────── */

function approvedMember(member) {
  return member && ["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role);
}

function allowedPagesForRole(role) {
  if (role === "SUPER_ADMIN") return superAdminPages;
  if (role === "LEVEL_ADMIN") return flightAdminPages;
  return playerPages;
}

function cacheMember(member) {
  try { localStorage.setItem(memberCacheKey, JSON.stringify(member)); } catch {}
}

function clearCachedMember() {
  try { localStorage.removeItem(memberCacheKey); } catch {}
}

function cachedMemberFor(uid) {
  try {
    const value = JSON.parse(localStorage.getItem(memberCacheKey) || "null");
    return value?.uid === uid && approvedMember(value) ? value : null;
  } catch { return null; }
}

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

/* ─────────────── navigation ─────────────── */

export function canOpenPage(page) {
  return allowedPagesForRole(state.member?.role).has(page);
}

export function navigate(page) {
  if (!canOpenPage(page)) {
    window.dispatchEvent(new CustomEvent("indianclub:toast", {
      detail: "You do not have permission to open this page."
    }));
    return false;
  }
  state.page = page;
  window.scrollTo(0, 0);
  window.dispatchEvent(new CustomEvent("indianclub:render"));
  return true;
}

/* ─────────────── authentication ─────────────── */

export async function startSignedInApp() {
  let member;
  try {
    member = await api("/members/me", { loadingLabel: "Restoring your account…" });
  } catch (firstError) {
    await delay(650);
    member = await api("/members/me", { forceRefresh: true, loadingLabel: "Restoring your account…" });
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

export function watchAuthentication({ onSignedIn, onSignedOut, onError }) {
  return observeAuth(async user => {
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

/* ─────────────── language ─────────────── */

export function setLanguage(language) {
  state.language = language;
  localStorage.setItem("indian_club_language", language);
  window.dispatchEvent(new CustomEvent("indianclub:render"));
}

export function getLanguage() {
  return state.language;
}

/* ─────────────── sidebar menu (role-based) ─────────────── */

export function getSidebarMenu() {
  const role = state.member?.role;

  // PLAYER → 7 tabs
  if (role === "PLAYER") {
    return [
      { label: "Home",       page: "home",       icon: "fas fa-home" },
      { label: "Timetable",  page: "timetable",  icon: "fas fa-calendar-alt" },
      { label: "Attendance", page: "attendance",  icon: "fas fa-clipboard-check" },
      { label: "Wallet",     page: "wallet",      icon: "fas fa-wallet" },
      { label: "BaZaar",     page: "bazaar",      icon: "fas fa-store" },
      { label: "Profile",    page: "profile",     icon: "fas fa-user-circle" },
      { label: "Logs",       page: "logs",        icon: "fas fa-history" }
    ];
  }

  // FLIGHT ADMIN (LEVEL_ADMIN) → 10 tabs
  if (role === "LEVEL_ADMIN") {
    return [
      { label: "Home",            page: "home",       icon: "fas fa-home" },
      { label: "Timetable",       page: "timetable",  icon: "fas fa-calendar-alt" },
      { label: "Attendance",      page: "attendance",  icon: "fas fa-clipboard-check" },
      { label: "Session Control", page: "sessions",    icon: "fas fa-gamepad" },
      { label: "Shuttle Stock",   page: "stock",       icon: "fas fa-shuttlecock" },
      { label: "Finance",         page: "finance",     icon: "fas fa-money-bill-wave" },
      { label: "Wallet",          page: "wallet",      icon: "fas fa-wallet" },
      { label: "BaZaar",          page: "bazaar",      icon: "fas fa-store" },
      { label: "Profile",         page: "profile",     icon: "fas fa-user-circle" },
      { label: "Logs",            page: "logs",        icon: "fas fa-history" }
    ];
  }

  // SUPER ADMIN → 12 tabs (with level dropdown on ALL)
  if (role === "SUPER_ADMIN") {
    return [
      { label: "Home",            page: "home",     icon: "fas fa-tachometer-alt" },
      { label: "Members",         page: "master",   icon: "fas fa-users" },
      { label: "Timetable",       page: "flights",  icon: "fas fa-calendar-alt" },
      { label: "Session Control", page: "sessions", icon: "fas fa-gamepad" },
      { label: "Shuttle Stock",   page: "stock",    icon: "fas fa-shuttlecock" },
      { label: "Finance",         page: "finance",  icon: "fas fa-money-bill-wave" },
      { label: "Wallet",          page: "wallet",   icon: "fas fa-wallet" },
      { label: "Ads & Notices",   page: "ads",      icon: "fas fa-bullhorn" },
      { label: "Activities",      page: "audit",    icon: "fas fa-running" },
      { label: "BaZaar",          page: "bazaar",   icon: "fas fa-store" },
      { label: "Profile",         page: "profile",  icon: "fas fa-user-circle" },
      { label: "Logs",            page: "logs",     icon: "fas fa-clipboard-list" }
    ];
  }

  return [];
}

/* ─────────────── render page (maps page → correct view file) ─────────────── */

export function renderPage(viewModules) {
  const { views, flightAdminViews, adminViews } = viewModules;
  const role = state.member?.role;
  const page = state.page;

  // ─── PLAYER pages (from views.js) ───
  if (role === "PLAYER") {
    switch (page) {
      case "home":       return views.home();
      case "timetable":  return views.timetable();
      case "attendance": return views.attendance();
      case "logs":       return views.logs();
      case "wallet":     return views.wallet();
      case "bazaar":     return views.bazaar();
      case "profile":    return views.profile();
      default:           return notFound(page);
    }
  }

  // ─── FLIGHT ADMIN pages (7 player tabs from views.js + 3 from flightAdminViews.js) ───
  if (role === "LEVEL_ADMIN") {
    switch (page) {
      // 7 Player tabs (from views.js)
      case "home":       return views.home();
      case "timetable":  return views.timetable();
      case "attendance": return views.attendance();
      case "logs":       return views.logs();
      case "wallet":     return views.wallet();
      case "bazaar":     return views.bazaar();
      case "profile":    return views.profile();
      // 3 Flight Admin-specific tabs (from flightAdminViews.js)
      case "sessions":   return flightAdminViews.sessionControl();
      case "stock":      return flightAdminViews.shuttleStock();
      case "finance":    return flightAdminViews.finance();
      default:           return notFound(page);
    }
  }

  // ─── SUPER ADMIN pages (all views + flightAdmin with level dropdown + adminViews) ───
  if (role === "SUPER_ADMIN") {
    switch (page) {
      // Super Admin dashboard (from adminViews.js)
      case "home":       return adminViews.home();
      // Members management (from adminViews.js)
      case "master":     return adminViews.members();
      // Timetable with full CRUD + CSV import (from adminViews.js)
      case "flights":    return adminViews.timetable();
      // Session Control with level dropdown (from adminViews.js wrapping flightAdminViews)
      case "sessions":   return adminViews.sessions ? adminViews.sessions() : flightAdminViews.sessionControl();
      // Shuttle Stock with level dropdown (from adminViews.js wrapping flightAdminViews)
      case "stock":      return adminViews.stock ? adminViews.stock() : flightAdminViews.shuttleStock();
      // Finance with add credit/deduction (from adminViews.js)
      case "finance":    return adminViews.finance();
      // Wallet (from adminViews.js)
      case "wallet":     return adminViews.wallet ? adminViews.wallet() : views.wallet();
      // Ads & Notices carousel + announcements (from adminViews.js)
      case "ads":        return adminViews.ads();
      // Activities management (from adminViews.js)
      case "audit":      return adminViews.activities ? adminViews.activities() : adminViews.audit();
      // BaZaar with approve/reject (from adminViews.js)
      case "bazaar":     return adminViews.bazaar ? adminViews.bazaar() : views.bazaar();
      // Profile (from views.js)
      case "profile":    return views.profile();
      // Logs with multi-filter (from adminViews.js)
      case "logs":       return adminViews.logs ? adminViews.logs() : views.logs();
      default:           return notFound(page);
    }
  }

  return "<p>Loading...</p>";
}

function notFound(page) {
  console.warn("Page not found:", page);
  return `<section class="card"><p class="note">Page "${page}" was not found. Use the navigation menu.</p></section>`;
}

/* ─────────────── bind page events (calls correct bind function after render) ─────────────── */

export function bindPageEvents(viewModules) {
  const { views, flightAdminViews, adminViews } = viewModules;
  const role = state.member?.role;
  const page = state.page;

  // PLAYER binding
  if (role === "PLAYER") {
    if (typeof views.bindPlayerViews === "function") views.bindPlayerViews();
    return;
  }

  // FLIGHT ADMIN binding
  if (role === "LEVEL_ADMIN") {
    // Player tab bindings
    if (["home", "timetable", "attendance", "logs", "wallet", "bazaar", "profile"].includes(page)) {
      if (typeof views.bindPlayerViews === "function") views.bindPlayerViews();
    }
    // Flight Admin specific tab bindings
    if (["sessions", "stock", "finance"].includes(page)) {
      if (typeof flightAdminViews.bindFlightAdminViews === "function") flightAdminViews.bindFlightAdminViews();
    }
    return;
  }

  // SUPER ADMIN binding
  if (role === "SUPER_ADMIN") {
    // Profile uses player bindings
    if (page === "profile") {
      if (typeof views.bindPlayerViews === "function") views.bindPlayerViews();
    }
    // Admin-specific bindings
    if (typeof adminViews.bindAdminViews === "function") adminViews.bindAdminViews();
    return;
  }
}

/* ─────────────── utility exports ─────────────── */

export function getMember() { return state.member; }
export function getCurrentPage() { return state.page; }
export function getCurrentRole() { return state.member?.role || null; }
export function isSuperAdmin() { return state.member?.role === "SUPER_ADMIN"; }
export function isLevelAdmin() { return state.member?.role === "LEVEL_ADMIN"; }
export function isPlayer() { return state.member?.role === "PLAYER"; }
export function getUserFlightId() { return state.member?.flightId || null; }
export function getUserName() { return state.member?.fullName || null; }
export function getUserEmail() { return state.member?.email || null; }
export function getUserUid() { return state.member?.uid || null; }
export function getAccessiblePages() { return Array.from(allowedPagesForRole(state.member?.role)); }

export async function signOut() {
  clearCachedMember();
  state.member = null;
  state.page = "home";
  window.dispatchEvent(new CustomEvent("indianclub:signout"));
}

/* ─────────────── level dropdown (for Super Admin tabs) ─────────────── */

export const CLUB_LEVELS = [
  { id: "premier",   label: "Premier" },
  { id: "flight1",   label: "Flight 1" },
  { id: "flight2",   label: "Flight 2" },
  { id: "flight3",   label: "Flight 3" },
  { id: "flight4",   label: "Flight 4" },
  { id: "flight4a",  label: "Flight 4A" },
  { id: "flight4b",  label: "Flight 4B" }
];

export function renderLevelDropdown(selectedLevel = "") {
  if (state.member?.role !== "SUPER_ADMIN") return "";
  return `
    <div class="level-dropdown-container">
      <label for="levelDropdown"><strong>Select Level:</strong></label>
      <select id="levelDropdown" class="level-dropdown">
        <option value="">All Levels</option>
        ${CLUB_LEVELS.map(level =>
          `<option value="${level.id}" ${level.id === selectedLevel ? "selected" : ""}>${level.label}</option>`
        ).join("")}
      </select>
    </div>
  `;
}

console.log("✅ router.js loaded successfully");

