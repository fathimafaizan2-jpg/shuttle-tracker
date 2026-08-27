import { api, observeAuth } from "./modules/auth.js";

export const state = { member: null, page: "home", language: "en" };
const memberCacheKey = "indian_club_verified_member";

const playerPages = new Set(["home", "timetable", "attendance", "logs", "wallet", "bazaar", "profile"]);
const flightAdminPages = new Set([...playerPages, "sessions", "stock", "finance"]);
const superAdminPages = new Set(["home", "master", "flights", "finance", "logs", "wallet", "sessions", "stock", "ads", "audit", "bazaar", "profile"]);

function approvedMember(member) { return member && ["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role); }
function allowedPagesForRole(role) { return role === "SUPER_ADMIN" ? superAdminPages : role === "LEVEL_ADMIN" ? flightAdminPages : playerPages; }
function cacheMember(member) { try { localStorage.setItem(memberCacheKey, JSON.stringify(member)); } catch {} }
function clearCachedMember() { try { localStorage.removeItem(memberCacheKey); } catch {} }
function cachedMemberFor(uid) {
  try { const value = JSON.parse(localStorage.getItem(memberCacheKey) || "null"); return value?.uid === uid && approvedMember(value) ? value : null; } catch { return null; }
}
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

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
  let member;
  try { member = await api("/members/me", { loadingLabel: "Restoring your account…" }); }
  catch (firstError) {
    await delay(650);
    member = await api("/members/me", { forceRefresh: true, loadingLabel: "Restoring your account…" });
  }
  if (!approvedMember(member)) throw new Error("This account is not approved for Indian Club access.");
  state.member = member;
  state.page = state.page || "home";
  state.language = localStorage.getItem("indian_club_language") || "en";
  cacheMember(member);
  return member;
}

export function setLanguage(language) { state.language = language; localStorage.setItem("indian_club_language", language); window.dispatchEvent(new CustomEvent("indianclub:render")); }

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
