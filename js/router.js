import { api, observeAuth } from "./modules/auth.js";

export const state = {
  member: null,
  page: "home",
  language: "en"
};

const playerPages = new Set([
  "home",
  "timetable",
  "attendance",
  "wallet",
  "profile",
  "bazaar"
]);

const flightAdminPages = new Set([
  ...playerPages,
  "sessions",
  "stock",
  "reports"
]);

const superAdminPages = new Set([
  ...flightAdminPages,
  "master",
  "flights",
  "finance",
  "ads",
  "audit"
]);

function allowedPagesForRole(role) {
  if (role === "SUPER_ADMIN") return superAdminPages;
  if (role === "LEVEL_ADMIN") return flightAdminPages;
  return playerPages;
}

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
  window.dispatchEvent(new CustomEvent("indianclub:render"));
  return true;
}

export async function startSignedInApp() {
  const member = await api("/members/me");

  if (!member || !["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role)) {
    throw new Error("This account is not approved for Indian Club access.");
  }

  state.member = member;
  state.page = "home";
  state.language = localStorage.getItem("indian_club_language") || "en";
  return member;
}

export function setLanguage(language) {
  state.language = language;
  localStorage.setItem("indian_club_language", language);
  window.dispatchEvent(new CustomEvent("indianclub:render"));
}

/*
  Firebase only proves the person signed in. The Express server returns the
  approved member profile and role. This prevents browser role selection.
*/
export function watchAuthentication({ onSignedIn, onSignedOut, onError }) {
  return observeAuth(async user => {
    if (!user) {
      state.member = null;
      state.page = "home";
      onSignedOut?.();
      return;
    }

    try {
      await startSignedInApp();
      onSignedIn?.(state.member);
    } catch (error) {
      state.member = null;
      onError?.(error);
    }
  });
}
