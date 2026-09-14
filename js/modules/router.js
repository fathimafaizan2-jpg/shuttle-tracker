
import { views } from "./modules/views.js";
import { flightAdminViews } from "./modules/flightAdminViews.js";
import { adminViews } from "./modules/adminViews.js";
import { api } from "./modules/auth.js";

// ===== GLOBAL STATE =====
export const state = {
  member: null,
  role: null,
  flightId: null,
  flightName: null,
  currentTab: "home",
  currentPage: "login"
};

// ===== ROLE-BASED TAB DEFINITIONS =====
const TAB_CONFIG = {
  PLAYER: [
    { id: "home", label: "🏠 Home", view: views.home },
    { id: "timetable", label: "📅 Timetable", view: views.timetable },
    { id: "attendance", label: "📊 Attendance", view: views.attendance },
    { id: "wallet", label: "💰 Wallet", view: views.wallet },
    { id: "bazaar", label: "🏪 Bazaar", view: views.bazaar },
    { id: "profile", label: "👤 Profile", view: views.profile },
    { id: "logs", label: "📜 Logs", view: views.logs }
  ],
  LEVEL_ADMIN: [
    // Player tabs (7)
    { id: "home", label: "🏠 Home", view: flightAdminViews.home },
    { id: "timetable", label: "📅 Timetable", view: flightAdminViews.timetable },
    { id: "attendance", label: "📊 Attendance", view: flightAdminViews.attendance },
    { id: "wallet", label: "💰 Wallet", view: flightAdminViews.wallet },
    { id: "bazaar", label: "🏪 Bazaar", view: flightAdminViews.bazaar },
    { id: "profile", label: "👤 Profile", view: flightAdminViews.profile },
    { id: "logs", label: "📜 Logs", view: flightAdminViews.logs },
    // Flight Admin tabs (3)
    { id: "sessionControl", label: "🎮 Session Control", view: flightAdminViews.sessionControl },
    { id: "stock", label: "📦 Stock", view: flightAdminViews.stock },
    { id: "finance", label: "💳 Finance", view: flightAdminViews.finance }
  ],
  SUPER_ADMIN: [
    // Player tabs (7)
    { id: "home", label: "🏠 Home", view: adminViews.home },
    { id: "timetable", label: "📅 Timetable", view: adminViews.timetable },
    { id: "attendance", label: "📊 Attendance", view: adminViews.attendance },
    { id: "wallet", label: "💰 Wallet", view: adminViews.wallet },
    { id: "bazaar", label: "🏪 Bazaar", view: adminViews.bazaar },
    { id: "profile", label: "👤 Profile", view: adminViews.profile },
    { id: "logs", label: "📜 Logs", view: adminViews.logs },
    // Super Admin tabs (6)
    { id: "activities", label: "🎮 Activities & Flights", view: adminViews.activities },
    { id: "masterTimetable", label: "📅 Master Timetable", view: adminViews.timetable },
    { id: "finance", label: "💳 Finance", view: adminViews.finance },
    { id: "auditLogs", label: "📜 Audit Logs", view: adminViews.auditLogs },
    { id: "ads", label: "📢 Ads & Notices", view: adminViews.ads }
  ]
};

// ===== NAVIGATION FUNCTIONS =====
export async function navigate(tabId) {
  if (!state.member) {
    console.error("❌ Not authenticated");
    return;
  }

  const tabs = TAB_CONFIG[state.role];
  const tab = tabs.find(t => t.id === tabId);

  if (!tab) {
    console.error(`❌ Tab not found: ${tabId}`);
    return;
  }

  state.currentTab = tabId;
  await renderPage();
}

export async function renderPage() {
  const container = document.getElementById("app-content");
  if (!container) {
    console.error("❌ App container not found");
    return;
  }

  try {
    const tabs = TAB_CONFIG[state.role];
    const currentTab = tabs.find(t => t.id === state.currentTab);

    if (!currentTab) {
      container.innerHTML = `<p class="note">❌ Page not found: ${state.currentTab}</p>`;
      return;
    }

    // Show loading state
    container.innerHTML = `<div class="card"><p class="note">⏳ Loading...</p></div>`;

    // Render the tab view
    const html = await currentTab.view();
    container.innerHTML = html;

    // Update active tab in navigation
    updateActiveTab();

    console.log(`✅ Rendered tab: ${state.currentTab}`);
  } catch (error) {
    console.error("❌ Error rendering page:", error);
    container.innerHTML = `<div class="card"><p class="note">❌ Error: ${error.message}</p></div>`;
  }
}

function updateActiveTab() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    if (tab.dataset.tab === state.currentTab) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
}

export function renderNavigation() {
  const navContainer = document.getElementById("app-nav");
  if (!navContainer) return;

  const tabs = TAB_CONFIG[state.role];

  navContainer.innerHTML = `
    <div class="nav-header">
      <h3>${state.flightName || state.member.fullName}</h3>
      <small>${state.role === "SUPER_ADMIN" ? "🏢 Super Admin" : state.role === "LEVEL_ADMIN" ? "👨‍💼 Flight Admin" : "👤 Player"}</small>
    </div>
    <nav class="nav-tabs">
      ${tabs.map(tab => `
        <button class="nav-tab ${tab.id === state.currentTab ? "active" : ""}" 
                data-tab="${tab.id}" 
                onclick="window.navigate('${tab.id}')">
          ${tab.label}
        </button>
      `).join("")}
    </nav>
    <div class="nav-footer">
      <button class="nav-btn" onclick="window.logout()">🚪 Logout</button>
    </div>
  `;
}

// ===== AUTHENTICATION FUNCTIONS =====
export async function login(email, password, role) {
  try {
    const response = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role })
    });

    if (!response.member) {
      throw new Error("Invalid credentials");
    }

    // Set global state
    state.member = response.member;
    state.role = response.member.role;
    state.flightId = response.member.flightId;
    state.flightName = response.member.flightName;
    state.currentTab = "home";
    state.currentPage = "dashboard";

    // Store auth token
    localStorage.setItem("authToken", response.token);
    localStorage.setItem("memberRole", state.role);

    console.log(`✅ Login successful: ${state.member.fullName} (${state.role})`);
    
    // Render navigation and home page
    renderNavigation();
    await navigate("home");

    return true;
  } catch (error) {
    console.error("❌ Login failed:", error);
    showNotification(`❌ Login failed: ${error.message}`);
    return false;
  }
}

export async function logout() {
  if (confirm("Are you sure you want to logout?")) {
    state.member = null;
    state.role = null;
    state.flightId = null;
    state.flightName = null;
    state.currentTab = "home";
    state.currentPage = "login";

    localStorage.removeItem("authToken");
    localStorage.removeItem("memberRole");

    console.log("✅ Logged out successfully");
    location.reload();
  }
}

export async function checkAuth() {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("memberRole");

  if (!token || !role) {
    state.currentPage = "login";
    return false;
  }

  try {
    const response = await api("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token })
    });

    if (response.member) {
      state.member = response.member;
      state.role = response.member.role;
      state.flightId = response.member.flightId;
      state.flightName = response.member.flightName;
      state.currentPage = "dashboard";
      state.currentTab = "home";

      console.log(`✅ Auth verified: ${state.member.fullName}`);
      return true;
    }
  } catch (error) {
    console.error("❌ Auth verification failed:", error);
  }

  state.currentPage = "login";
  return false;
}

// ===== NOTIFICATION SYSTEM =====
export function showNotification(message) {
  window.dispatchEvent(new CustomEvent("indianclub:toast", { detail: message }));
}

// ===== GLOBAL WINDOW FUNCTIONS =====
window.navigate = navigate;
window.logout = logout;
window.showNotification = showNotification;

// ===== INITIALIZATION =====
export async function initializeApp() {
  console.log("🚀 Initializing Indian Club App...");

  const isAuthenticated = await checkAuth();

  if (isAuthenticated) {
    renderNavigation();
    await navigate("home");
  } else {
    // Show login page
    const container = document.getElementById("app-content");
    if (container) {
      container.innerHTML = `
        <section class="card">
          <h2>🏏 Indian Club Bahrain</h2>
          <p class="note">Member Portal</p>
        </section>
        <section class="card">
          <h3>🔐 Login</h3>
          <form onsubmit="window.handleLogin(event)">
            <div class="field">
              <label>Email *</label>
              <input type="email" id="loginEmail" placeholder="your@email.com" required>
            </div>
            <div class="field">
              <label>Password *</label>
              <input type="password" id="loginPassword" placeholder="••••••••" required>
            </div>
            <div class="field">
              <label>Role *</label>
              <select id="loginRole" required>
                <option value="">Select role...</option>
                <option value="PLAYER">Player</option>
                <option value="LEVEL_ADMIN">Flight Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <button type="submit" class="primary">🔓 Login</button>
          </form>
        </section>
        <section class="card">
          <h3>📝 New Member?</h3>
          <p class="note">Contact your Flight Admin or Super Admin to register</p>
        </section>
      `;
    }
  }
}

window.handleLogin = async function(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const role = document.getElementById("loginRole").value;

  const success = await login(email, password, role);
  if (!success) {
    document.getElementById("loginPassword").value = "";
  }
};

// Auto-initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

export default { navigate, renderPage, login, logout, checkAuth, state };

