import { api, observeAuth } from "./modules/auth.js";

export const state = { member: null, page: "home", language: "en" };
const memberCacheKey = "indian_club_verified_member";

const playerPages = new Set(["home", "timetable", "attendance", "logs", "wallet", "bazaar", "profile"]);
const flightAdminPages = new Set([...playerPages, "sessions", "stock", "reports", "finance"]);
const superAdminPages = new Set(["home", "master", "flights", "finance", "logs", "wallet", "sessions", "stock", "reports", "ads", "audit", "bazaar", "profile"]);

function approvedMember(member) { return member && ["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role); }
function allowedPagesForRole(role) { return role === "SUPER_ADMIN" ? superAdminPages : role === "LEVEL_ADMIN" ? flightAdminPages : playerPages; }

export function canOpenPage(page) { return allowedPagesForRole(state.member?.role).has(page); }
export function navigate(page) {
  if (!canOpenPage(page)) {
    window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: "You do not have permission to open this page." }));
    return false;
  }
  state.page = page;
  window.dispatchEvent(new CustomEvent("indianclub:render"));
  return true;
}

export async function startSignedInApp() {
  let member = await api("/members/me").catch(() => null);
  if (!approvedMember(member)) throw new Error("Account unverified or unauthorized.");
  state.member = member;
  state.page = state.page || "home";
  return member;
}

export function setLanguage(language) { state.language = language; localStorage.setItem("indian_club_language", language); window.dispatchEvent(new CustomEvent("indianclub:render")); }

export function watchAuthentication({ onSignedIn, onSignedOut, onError }) {
  return observeAuth(async user => {
    if (!user) {
      state.member = null;
      onSignedOut?.();
      return;
    }
    try {
      await startSignedInApp();
      onSignedIn?.(state.member);
    } catch (error) {
      onError?.(error);
    }
  });
}

window.render = async function() {
  const v = window.views || {};
  const av = window.adminViews || {};
  const fv = window.flightAdminViews || {};

  const role = state.member?.role || "PLAYER";
  const isSuper = role === "SUPER_ADMIN";
  const isFlightAdmin = role === "LEVEL_ADMIN";
  const isAdmin = isSuper || isFlightAdmin;

  document.querySelectorAll(".admin-nav").forEach(el => el.classList.toggle("hidden", !isAdmin));
  document.querySelectorAll(".super-nav").forEach(el => el.classList.toggle("hidden", !isSuper));
  document.querySelectorAll(".flight-only-nav").forEach(el => el.classList.toggle("hidden", !isFlightAdmin));
  document.querySelectorAll(".nav[data-page]").forEach(el => el.classList.toggle("active", el.dataset.page === state.page));

  const pageMap = {
    home: isSuper ? (av.home || v.home) : v.home,
    timetable: v.timetable,
    attendance: v.attendance,
    logs: isSuper ? av.logs : v.logs,
    wallet: isSuper ? av.walletLogs : v.wallet,
    sessions: isSuper ? av.sessions : (fv.sessionControl || av.sessions),
    stock: isSuper ? av.stockLogs : (fv.stock || av.stockLogs),
    reports: fv.reports,
    master: av.master,
    flights: av.flightsPage,
    finance: av.finance,
    ads: av.ads,
    audit: av.audit,
    bazaar: v.community,
    profile: v.profile
  };

  const viewContainer = document.getElementById("view");
  if (viewContainer) {
    const viewFn = pageMap[state.page] || pageMap.home || (() => `<div class="card"><h3>View Loading...</h3></div>`);
    try {
      viewContainer.innerHTML = typeof viewFn === 'function' ? await viewFn() : viewFn;
      
      // Bind navigation clicks across the entire view
      document.querySelectorAll("[data-go-page]").forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          const page = btn.dataset.goPage;
          if (page) navigate(page);
        };
      });

      if (typeof av.bindAdminViews === 'function' && isSuper) av.bindAdminViews();
      if (typeof fv.bindFlightAdminViews === 'function' && isFlightAdmin) fv.bindFlightAdminViews();
      if (typeof v.bindBusinessSubmission === 'function') v.bindBusinessSubmission();
    } catch (err) {
      console.error("View rendering error:", err);
      viewContainer.innerHTML = `<section class="card"><h2>Unable to render view</h2><p class="note">${err.message || "An unexpected error occurred."}</p></section>`;
    }
  }

  const roleLabel = document.getElementById("roleLabel");
  if (roleLabel) roleLabel.textContent = role.replace("_", " ");
  
  const memberName = document.getElementById("memberName");
  if (memberName && state.member) memberName.textContent = state.member.fullName || "Member";

  const sideRole = document.getElementById("sideRole");
  if (sideRole && state.member) sideRole.textContent = isSuper ? "All activities" : (state.member.flightName || "No flight assigned");
};

window.addEventListener("indianclub:render", () => {
  if (typeof window.render === "function") window.render();
});
