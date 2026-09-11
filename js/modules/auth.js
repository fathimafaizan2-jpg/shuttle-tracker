import { setAuthToken, clearAuthToken, setMember, loadMember } from './router.js';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const mockUsers = {
  "superadmin@club.com": {
    uid: "admin001",
    email: "superadmin@club.com",
    fullName: "Admin User",
    role: "SUPER_ADMIN",
    level: "Professional",
    phone: "+973 1234 5678",
    joinDate: "2024-01-01"
  },
  "leveladmin@club.com": {
    uid: "admin002",
    email: "leveladmin@club.com",
    fullName: "Level Admin",
    role: "LEVEL_ADMIN",
    level: "Advanced",
    phone: "+973 1234 5679",
    joinDate: "2024-02-01"
  },
  "player@club.com": {
    uid: "player001",
    email: "player@club.com",
    fullName: "John Player",
    role: "PLAYER",
    level: "Intermediate",
    phone: "+973 1234 5680",
    joinDate: "2024-03-01"
  }
};

export async function login(email, password) {
  try {
    console.log("🔐 Attempting login with:", email);
    
    const user = mockUsers[email];
    
    if (!user) {
      throw new Error("User not found");
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const token = "mock_token_" + Date.now();
    setAuthToken(token);
    setMember(user);
    
    console.log("✅ Login successful:", user);
    return user;
    
  } catch (error) {
    console.error("❌ Login error:", error);
    throw error;
  }
}

export async function logout() {
  try {
    console.log("🔓 Logging out...");
    clearAuthToken();
    localStorage.removeItem("member_data");
    console.log("✅ Logout successful");
  } catch (error) {
    console.error("❌ Logout error:", error);
    throw error;
  }
}

export function isAuthenticated() {
  const token = localStorage.getItem("firebase_auth_token");
  const member = localStorage.getItem("member_data");
  return !!(token && member);
}

export function getCurrentUser() {
  return loadMember();
}

export async function register(email, password, fullName) {
  try {
    console.log("📝 Attempting registration with:", email);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = {
      uid: "user_" + Date.now(),
      email: email,
      fullName: fullName,
      role: "PLAYER",
      level: "Beginner",
      phone: "",
      joinDate: new Date().toISOString().split('T')[0]
    };
    
    const token = "mock_token_" + Date.now();
    setAuthToken(token);
    setMember(newUser);
    
    console.log("✅ Registration successful:", newUser);
    return newUser;
    
  } catch (error) {
    console.error("❌ Registration error:", error);
    throw error;
  }
}

export async function resetPassword(email) {
  try {
    console.log("🔑 Password reset requested for:", email);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("✅ Password reset email sent");
    return true;
    
  } catch (error) {
    console.error("❌ Password reset error:", error);
    throw error;
  }
}

export async function updateProfile(updates) {
  try {
    const user = getCurrentUser();
    const updatedUser = { ...user, ...updates };
    setMember(updatedUser);
    
    console.log("✅ Profile updated:", updatedUser);
    return updatedUser;
    
  } catch (error) {
    console.error("❌ Profile update error:", error);
    throw error;
  }
}

export function getMockUsers() {
  return mockUsers;
}

console.log('✅ auth.js loaded');
