import { login, logout, api } from "./modules/auth.js";

export const state = { member:null, page:"home" };

export function allowedPages() {
  const role = state.member?.role;
  const base = ["home","timetable","attendance","wallet","history","announcements","bazaar","profile"];
  if (role === "LEVEL_ADMIN") return [...base,"session","stock","reports"];
  if (role === "SUPER_ADMIN") return [...base,"session","stock","reports","master","members","finance","ads","audit"];
  return base;
}

export async function startSignedInApp() {
  state.member = await api("/me");
  state.page = "home";
  document.dispatchEvent(new CustomEvent("indianclub:render"));
}

export async function signInFromForm(email, password) {
  state.member = await login(email, password);
  state.page = "home";
  document.dispatchEvent(new CustomEvent("indianclub:render"));
}

export function navigate(page) {
  if (!allowedPages().includes(page)) return;
  state.page = page;
  document.dispatchEvent(new CustomEvent("indianclub:render"));
}

export async function signOutUser() { await logout(); state.member=null; document.dispatchEvent(new CustomEvent("indianclub:logout")); }
