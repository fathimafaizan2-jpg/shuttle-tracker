import { api, observeAuth } from "./modules/auth.js";

export const state = { member: null, page: "home", language: "en" };
const memberCacheKey = "indian_club_verified_member";

const playerPages = new Set(["home", "timetable", "attendance", "logs", "wallet", "bazaar", "profile"]);
const flightAdminPages = new Set([...playerPages, "sessions", "stock", "finance"]);
const superAdminPages = new Set(["home", "master", "flights", "finance", "logs", "wallet", "sessions", "stock", "ads", "audit", "bazaar", "profile"]);

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

export function setLanguage(language) { state.language = language; window.dispatchEvent(new CustomEvent("indianclub:render")); }

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
