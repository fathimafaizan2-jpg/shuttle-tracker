
// router.js - Navigation & Authentication Logic

export const state = {
  member: null,
  page: "home",
  language: "en"
};

// Define allowed pages for each role
const playerPages = new Set([
  "home", "timetable", "attendance", "logs", "wallet", "bazaar", "profile"
]);

const levelAdminPages = new Set([
  "home", "attendance", "sessionControl", "shuttle", "reports", "logs", "wallet", "profile"
]);

const superAdminPages = new Set([
  "home", "members", "activities", "advertising", "logs", "wallet", "profile"
]);

// ============================================
// MEMBER VALIDATION
// ============================================

function approvedMember(member) {
  return member && ["PLAYER", "LEVEL_ADMIN", "SUPER_ADMIN"].includes(member.role);
}

function allowedPagesForRole(role) {
  if (role === "SUPER_ADMIN") return superAdminPages;
  if (role === "LEVEL_ADMIN") return levelAdminPages;
  return playerPages;
}

// ============================================
// PAGE ACCESS CONTROL
// ============================================

export function canOpenPage(page) {
  if (!state.member) return false;
  return allowedPagesForRole(state.member.role).has(page);
}

export function navigate(page) {
  if (!canOpenPage(page)) {
    showNotification("You do not have permission to open this page.", "warning");
    return false;
  }
  state.page = page;
  renderApp();
  return true;
}

// ============================================
// ROLE CHECKS
// ============================================

export function getCurrentRole() {
  return state.member?.role || null;
}

export function isSuperAdmin() {
  return state.member?.role === "SUPER_ADMIN";
}

export function isLevelAdmin() {
  return state.member?.role === "LEVEL_ADMIN";
}

export function isPlayer() {
  return state.member?.role === "PLAYER";
}

// ============================================
// MEMBER & PAGE INFO
// ============================================

export function getMember() {
  return state.member;
}

export function getCurrentPage() {
  return state.page;
}

// ============================================
// SIDEBAR MENU GENERATION
// ============================================

export function getSidebarMenu() {
  const role = state.member?.role;

  if (role === "SUPER_ADMIN") {
    return [
      { label: "Dashboard", page: "home", icon: "home" },
      { label: "Members", page: "members", icon: "users" },
      { label: "Activities", page: "activities", icon: "calendar" },
      { label: "Advertising", page: "advertising", icon: "megaphone" },
      { label: "Logs", page: "logs", icon: "history" }
    ];
  } else if (role === "LEVEL_ADMIN") {
    return [
      { label: "Dashboard", page: "home", icon: "home" },
      { label: "Attendance", page: "attendance", icon: "check-circle" },
      { label: "Session Control", page: "sessionControl", icon: "sliders-h" },
      { label: "Shuttle Stock", page: "shuttle", icon: "badminton" },
      { label: "Reports", page: "reports", icon: "chart-bar" }
    ];
  } else if (role === "PLAYER") {
    return [
      { label: "Home", page: "home", icon: "home" },
      { label: "Timetable", page: "timetable", icon: "calendar-alt" },
      { label: "Attendance", page: "attendance", icon: "check-circle" },
      { label: "Wallet", page: "wallet", icon: "wallet" },
      { label: "BaZaar", page: "bazaar", icon: "store" },
      { label: "Profile", page: "profile", icon: "user-circle" }
    ];
  }

  return [];
}

// ============================================
// AUTH TOKEN MANAGEMENT
// ============================================

export function getAuthToken() {
  return localStorage.getItem("firebase_auth_token") || null;
}

export function setAuthToken(token) {
  localStorage.setItem("firebase_auth_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("firebase_auth_token");
}

export function setMember(member) {
  state.member = member;
  localStorage.setItem("member_data", JSON.stringify(member));
}

export function loadMember() {
  const memberData = localStorage.getItem("member_data");
  if (memberData) {
    state.member = JSON.parse(memberData);
  }
  return state.member;
}

// ============================================
// APP RENDERING
// ============================================

function renderApp() {
  window.dispatchEvent(new CustomEvent("app:navigate"));
}

function showNotification(message, type) {
  window.dispatchEvent(new CustomEvent("app:notify", { 
    detail: { message, type } 
  }));
}

// ============================================
// INITIALIZATION
// ============================================

export function initRouter() {
  loadMember();
  console.log("Router initialized");
}

``````javascript

// auth.js - Firebase Authentication

import { setAuthToken, clearAuthToken, setMember, loadMember } from './router.js';

// ============================================
// FIREBASE INITIALIZATION
// ============================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (if using Firebase)
// firebase.initializeApp(firebaseConfig);

// ============================================
// MOCK AUTHENTICATION (FOR TESTING)
// ============================================

const mockUsers = {
  "superadmin@club.com": {
    uid: "admin001",
    email: "superadmin@club.com",
    fullName: "Admin User",
    role: "SUPER_ADMIN",
    level: "Professional"
  },
  "leveladmin@club.com": {
    uid: "admin002",
    email: "leveladmin@club.com",
    fullName: "Level Admin",
    role: "LEVEL_ADMIN",
    level: "Advanced"
  },
  "player@club.com": {
    uid: "player001",
    email: "player@club.com",
    fullName: "John Player",
    role: "PLAYER",
    level: "Intermediate"
  }
};

// ============================================
// LOGIN FUNCTION
// ============================================

export async function login(email, password) {
  try {
    console.log("Attempting login with:", email);
    
    // Mock authentication
    const user = mockUsers[email];
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Set auth token
    const token = "mock_token_" + Date.now();
    setAuthToken(token);
    setMember(user);
    
    console.log("Login successful:", user);
    return user;
    
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// ============================================
// LOGOUT FUNCTION
// ============================================

export async function logout() {
  try {
    clearAuthToken();
    localStorage.removeItem("member_data");
    console.log("Logout successful");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

// ============================================
// CHECK AUTH STATUS
// ============================================

export function isAuthenticated() {
  const token = localStorage.getItem("firebase_auth_token");
  const member = localStorage.getItem("member_data");
  return !!(token && member);
}

// ============================================
// GET CURRENT USER
// ============================================

export function getCurrentUser() {
  return loadMember();
}

// ============================================
// REGISTER FUNCTION
// ============================================

export async function register(email, password, fullName) {
  try {
    console.log("Attempting registration with:", email);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = {
      uid: "user_" + Date.now(),
      email: email,
      fullName: fullName,
      role: "PLAYER",
      level: "Beginner"
    };
    
    // Set auth token
    const token = "mock_token_" + Date.now();
    setAuthToken(token);
    setMember(newUser);
    
    console.log("Registration successful:", newUser);
    return newUser;
    
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

// ============================================
// PASSWORD RESET
// ============================================

export async function resetPassword(email) {
  try {
    console.log("Password reset requested for:", email);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Password reset email sent");
    return true;
    
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}

// ============================================
// UPDATE PROFILE
// ============================================

export async function updateProfile(updates) {
  try {
    const user = getCurrentUser();
    const updatedUser = { ...user, ...updates };
    setMember(updatedUser);
    
    console.log("Profile updated:", updatedUser);
    return updatedUser;
    
  } catch (error) {
    console.error("Profile update error:", error);
    throw error;
  }
}

// ============================================
// EXPORT MOCK USERS FOR TESTING
// ============================================

export function getMockUsers() {
  return mockUsers;
}

