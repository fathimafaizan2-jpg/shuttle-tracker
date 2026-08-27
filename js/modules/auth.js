import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseAuth } from "../config.js";

function resolveApiBaseUrl() {
  const configured = window.INDIAN_CLUB_API_URL;
  if (configured) return configured.replace(/\/+$/, "");
  if (window.location.hostname.endsWith("github.io")) return "https://indian-club-api.onrender.com/api";
  return "http://localhost:3000/api";
}

const API_BASE_URL = resolveApiBaseUrl();
const readCache = new Map();
const READ_CACHE_TTL_MS = 3500;

function messageFromResponse(data, fallback) {
  return data?.message || data?.error || fallback;
}

export function friendlyAccountError(error, fallback = "We could not complete this account request.") {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "");
  if (code.includes("wrong-password") || code.includes("invalid-credential") || code.includes("user-not-found")) {
    return "Password is incorrect, or this email address does not have an active club account.";
  }
  if (code.includes("email-already-in-use") || code.includes("email-already-exists")) {
    return "This email address is already registered. Use a different email address or sign in.";
  }
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("too-many-requests")) return "Too many sign-in attempts. Please wait a few minutes and try again.";
  if (code.includes("network-request-failed")) return "Connection problem. Check your internet connection and try again.";
  return message || fallback;
}

function beginLoading(label = "Loading…") {
  window.dispatchEvent(new CustomEvent("indianclub:loading", { detail: { active: true, label } }));
}

function endLoading() {
  window.dispatchEvent(new CustomEvent("indianclub:loading", { detail: { active: false } }));
}

async function publicApi(path, options = {}) {
  beginLoading("Loading…");
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(messageFromResponse(data, "Request failed."));
    return data;
  } finally {
    endLoading();
  }
}

export async function getIdToken(forceRefresh = false) {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("Please sign in first.");
  return user.getIdToken(forceRefresh);
}

export async function api(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const isDataChange = !["GET", "HEAD", "OPTIONS"].includes(method) && !path.endsWith("/me/validate-email");
  const cacheKey = method === "GET" ? path : "";
  const cached = cacheKey ? readCache.get(cacheKey) : null;
  if (cached && Date.now() - cached.savedAt < READ_CACHE_TTL_MS) return cached.value;
  if (isDataChange && options.confirm !== false) {
    const message = options.confirmMessage || "This will change club records. Do you want to continue?";
    if (!window.confirm(message)) throw new Error("Action cancelled. No changes were made.");
  }
  beginLoading(options.loadingLabel || "Loading…");
  try {
    const token = await getIdToken(Boolean(options.forceRefresh));
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(options.headers || {}) },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(messageFromResponse(data, "Request failed."));
    if (cacheKey) readCache.set(cacheKey, { savedAt: Date.now(), value: data });
    if (isDataChange) readCache.clear();
    return data;
  } finally {
    endLoading();
  }
}

export async function submitPublicBusiness(payload) {
  if (!window.confirm("Submit this business for Super Admin approval?")) throw new Error("Action cancelled. No changes were made.");
  return publicApi("/business/public/submit", { method: "POST", body: payload });
}
export async function submitBusinessUpdateRequest(payload) {
  if (!window.confirm("Send this business update request to Super Admin?")) throw new Error("Action cancelled. No changes were made.");
  return publicApi("/business/public/update-request", { method: "POST", body: payload });
}
export async function activateMemberAccount(payload) {
  if (!window.confirm("Create this club account with the entered name, phone number, and email?")) throw new Error("Action cancelled. No account was created.");
  try { return await publicApi("/members/activate-registered", { method: "POST", body: payload }); }
  catch (error) { throw new Error(friendlyAccountError(error, "We could not create this club account.")); }
}

export async function login(email, password) {
  if (!email || !password) throw new Error("Enter both email address and password.");
  beginLoading("Signing you in…");
  try {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
    readCache.clear();
    const member = await api("/members/me", { loadingLabel: "Checking club access…" });
    if (!member || !["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role)) {
      await signOut(firebaseAuth);
      throw new Error("This account is not an approved Indian Club Player or Admin account.");
    }
    return member;
  } catch (error) {
    await signOut(firebaseAuth).catch(() => undefined);
    throw new Error(friendlyAccountError(error, "Unable to sign in."));
  } finally {
    endLoading();
  }
}

export async function logout() { readCache.clear(); await signOut(firebaseAuth); }
export async function sendMyPasswordReset(email) {
  const value = String(email || "").trim().toLowerCase();
  if (!value) throw new Error("Enter your registered email address first.");
  try { await sendPasswordResetEmail(firebaseAuth, value); }
  catch (error) { throw new Error(friendlyAccountError(error, "Password reset could not be started.")); }
}

async function reauthenticate(currentPassword) {
  const current = firebaseAuth.currentUser;
  if (!current?.email) throw new Error("Please sign in again.");
  if (!currentPassword) throw new Error("Enter your current password to update email or password.");
  await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, currentPassword));
}

export async function updateMyCredentials(payload) {
  const current = firebaseAuth.currentUser;
  if (!current?.email) throw new Error("Please sign in again.");
  const nextEmail = String(payload.email || current.email).trim().toLowerCase();
  const nextPassword = String(payload.newPassword || "");
  const isChangingEmail = nextEmail && nextEmail !== current.email.toLowerCase();
  const isChangingPassword = Boolean(nextPassword);
  if (isChangingPassword && nextPassword.length < 8) throw new Error("Use at least 8 characters for the new password.");
  if (!window.confirm("Save these account changes?")) throw new Error("Action cancelled. No account changes were made.");
  try {
    if (isChangingEmail || isChangingPassword) await reauthenticate(payload.currentPassword);
    if (isChangingEmail) {
      await api("/members/me/validate-email", { method: "POST", body: { email: nextEmail }, loadingLabel: "Checking email…", confirm: false });
      await updateEmail(current, nextEmail);
    }
    if (isChangingPassword) await updatePassword(current, nextPassword);
    await api("/members/me", { method: "PATCH", forceRefresh: isChangingEmail, loadingLabel: "Saving account…", confirm: false, body: { memberId: payload.memberId, fullName: payload.fullName, phone: payload.phone, email: isChangingEmail ? nextEmail : current.email, profilePhotoUrl: payload.profilePhotoUrl } });
  } catch (error) {
    throw new Error(friendlyAccountError(error, "Your account changes could not be saved."));
  }
}

export async function changeMyPassword(newPassword, currentPassword) { await updateMyCredentials({ newPassword, currentPassword }); }
export function observeAuth(callback) { return onAuthStateChanged(firebaseAuth, callback); }
export { firebaseAuth, API_BASE_URL };
