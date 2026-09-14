
// ===== AUTH WRAPPER - FIXES EXPORT ISSUES =====
// This file wraps your existing auth.js and exports the functions properly

import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { firebaseAuth } from "../config.js";

// ===== LOGIN FUNCTION =====
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;
    
    // Get member details from your API
    const response = await fetch("https://indian-club-api.onrender.com/api/members/me", {
      headers: {
        "Authorization": `Bearer ${await user.getIdToken()}`
      }
    });
    
    if (!response.ok) throw new Error("Failed to fetch member details");
    
    const member = await response.json();
    return member;
  } catch (error) {
    throw new Error(error.message);
  }
}

// ===== LOGOUT FUNCTION =====
export async function logout() {
  try {
    await signOut(firebaseAuth);
    console.log("✅ Logged out successfully");
  } catch (error) {
    throw new Error(error.message);
  }
}

// ===== OBSERVE AUTH STATE =====
export function observeAuth(callback) {
  return onAuthStateChanged(firebaseAuth, callback);
}

// ===== API FUNCTION =====
export async function api(endpoint, options = {}) {
  const method = options.method || "GET";
  const body = options.body;
  
  try {
    const response = await fetch(`https://indian-club-api.onrender.com/api${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ API Error: ${endpoint}`, error);
    throw error;
  }
}

export default { login, logout, observeAuth, api };

