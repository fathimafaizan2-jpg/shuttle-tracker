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

  if (window.location.hostname.endsWith("github.io")) {
    return "https://indian-club-api.onrender.com/api";
  }

  return "http://localhost:3000/api";
}

const API_BASE_URL = resolveApiBaseUrl();

function messageFromResponse(data, fallback) {
  return data?.message || data?.error || fallback;
}

async function publicApi(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(messageFromResponse(data, "Request failed."));
  return data;
}

export async function getIdToken(forceRefresh = false) {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("Please sign in first.");
  return user.getIdToken(forceRefresh);
}

/* All protected club actions go through Render API with a Firebase ID token. */
export async function api(path, options = {}) {
  const token = await getIdToken(Boolean(options.forceRefresh));
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(messageFromResponse(data, "Request failed."));
  return data;
}

/* Public business requests never require a Player/Admin Firebase account. */
export async function submitPublicBusiness(payload) {
  return publicApi("/business/public/submit", { method: "POST", body: payload });
}

export async function submitBusinessUpdateRequest(payload) {
  return publicApi("/business/public/update-request", { method: "POST", body: payload });
}

/* A member uses the one-time code supplied privately by Super Admin to create their own login. */
export async function activateMemberAccount(payload) {
  return publicApi("/members/activate", { method: "POST", body: payload });
}

export async function login(email, password) {
  if (!email || !password) throw new Error("Enter both email and password.");

  await signInWithEmailAndPassword(firebaseAuth, email, password);

  try {
    const member = await api("/members/me");
    if (!member || !["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role)) {
      await signOut(firebaseAuth);
      throw new Error("This account is not an approved Indian Club Player or Admin account.");
    }
    return member;
  } catch (error) {
    await signOut(firebaseAuth);
    throw error;
  }
}

export async function logout() {
  await signOut(firebaseAuth);
}

export async function sendMyPasswordReset(email) {
  const value = String(email || "").trim().toLowerCase();
  if (!value) throw new Error("Enter your registered email address first.");
  await sendPasswordResetEmail(firebaseAuth, value);
}

/* Re-authentication is required only before a sensitive email or password change. */
async function reauthenticate(currentPassword) {
  const current = firebaseAuth.currentUser;
  if (!current?.email) throw new Error("Please sign in again.");
  if (!currentPassword) throw new Error("Enter your current password to update email or password.");
  const credential = EmailAuthProvider.credential(current.email, currentPassword);
  await reauthenticateWithCredential(current, credential);
}

export async function updateMyCredentials(payload) {
  const current = firebaseAuth.currentUser;
  if (!current?.email) throw new Error("Please sign in again.");

  const nextEmail = String(payload.email || current.email).trim().toLowerCase();
  const nextPassword = String(payload.newPassword || "");
  const isChangingEmail = nextEmail && nextEmail !== current.email.toLowerCase();
  const isChangingPassword = Boolean(nextPassword);

  if (isChangingPassword && nextPassword.length < 8) {
    throw new Error("Use at least 8 characters for the new password.");
  }

  if (isChangingEmail || isChangingPassword) {
    await reauthenticate(payload.currentPassword);
  }

  if (isChangingEmail) {
    await api("/members/me/validate-email", {
      method: "POST",
      body: { email: nextEmail }
    });
    await updateEmail(current, nextEmail);
  }

  if (isChangingPassword) await updatePassword(current, nextPassword);

  await api("/members/me", {
    method: "PATCH",
    forceRefresh: isChangingEmail,
    body: {
      memberId: payload.memberId,
      phone: payload.phone,
      email: isChangingEmail ? nextEmail : current.email
    }
  });
}

export async function changeMyPassword(newPassword, currentPassword) {
  await updateMyCredentials({ newPassword, currentPassword });
}

export function observeAuth(callback) {
  return onAuthStateChanged(firebaseAuth, callback);
}

export { firebaseAuth, API_BASE_URL };
