import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { APP_CONFIG, FIREBASE_WEB_CONFIG } from "../config.js";

const firebaseApp = initializeApp(FIREBASE_WEB_CONFIG );
export const firebaseAuth = getAuth(firebaseApp);

export async function api(path, options = {}) {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("Sign in required");
  const token = await user.getIdToken();
  const response = await fetch(APP_CONFIG.API_BASE_URL + path, {
    ...options,
    headers: { "Content-Type":"application/json", "Authorization":`Bearer ${token}`, ...(options.headers ?? {}) }
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body;
}

export async function login(email, password) {
  await signInWithEmailAndPassword(firebaseAuth, email, password);
  // /me denies any account that was not created by Super Admin.
  return api("/me");
}

export async function logout() { await signOut(firebaseAuth); }
export async function changePassword(value) { await updatePassword(firebaseAuth.currentUser, value); }

export async function submitPublicBusiness(payload) {
  const response = await fetch(APP_CONFIG.API_BASE_URL + "/business/public/submit", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Submission failed");
  return body;
}
