import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseAuth } from "../config.js";

/*
  GitHub Pages uses the live Render API.
  Local development still uses http://localhost:3000/api when no live URL exists.
*/
function resolveApiBaseUrl( ) {
  const configured = window.INDIAN_CLUB_API_URL;
  if (configured) return configured.replace(/\/+$/, "");

  if (window.location.hostname.endsWith("github.io")) {
    return "https://indian-club-api.onrender.com/api";
  }

  return "http://localhost:3000/api";
}

const API_BASE_URL = resolveApiBaseUrl( );

function messageFromResponse(data, fallback) {
  return data?.message || data?.error || fallback;
}

export async function getIdToken() {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("Please sign in first.");
  return user.getIdToken();
}

/* All protected club actions go through Render API with a Firebase ID token. */
export async function api(path, options = {}) {
  const token = await getIdToken();
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
  const response = await fetch(`${API_BASE_URL}/business/public/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(messageFromResponse(data, "Business request could not be submitted."));
  return data;
}

export async function submitBusinessUpdateRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/business/public/update-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(messageFromResponse(data, "Business update request could not be submitted."));
  return data;
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

export async function changeMyPassword(newPassword) {
  if (!newPassword || newPassword.length < 8) {
    throw new Error("Use at least 8 characters for the new password.");
  }
  if (!firebaseAuth.currentUser) throw new Error("Please sign in again.");
  await updatePassword(firebaseAuth.currentUser, newPassword);
}

export function observeAuth(callback) {
  return onAuthStateChanged(firebaseAuth, callback);
}

export { firebaseAuth, API_BASE_URL };
