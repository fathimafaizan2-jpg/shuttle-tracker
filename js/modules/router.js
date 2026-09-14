
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
    { id: "home", label: "🏠 Home", view: flightAdminViews.home },
    { id: "timetable", label: "📅 Timetable", view: flightAdminViews.timetable },
    { id: "attendance", label: "📊 Attendance", view: flightAdminViews.attendance },
    { id: "wallet", label: "💰 Wallet", view: flightAdminViews.wallet },
    { id: "bazaar", label: "🏪 Bazaar", view: flightAdminViews.bazaar },
    { id: "profile", label: "👤 Profile", view: flightAdminViews.profile },
    { id: "logs", label: "📜 Logs", view: flightAdminViews.logs },
    { id: "sessionControl", label: "🎮 Session Control", view: flightAdminViews.sessionControl },
    { id: "stock", label: "📦 Stock", view: flightAdminViews.stock },
    { id: "finance", label: "💳 Finance", view: flightAdminViews.finance }
  ],
  SUPER_ADMIN: [
    { id: "home", label: "🏠 Home", view: adminViews.home },
    { id: "timetable", label: "📅 Timetable", view: adminViews.timetable },
    { id: "attendance", label: "📊 Attendance", view: adminViews.attendance },
    { id: "wallet", label: "💰 Wallet", view: adminViews.wallet },
    { id: "bazaar", label: "🏪 Bazaar", view: adminViews.bazaar },
    { id: "profile", label: "👤 Profile", view: adminViews.profile },
    { id: "logs", label: "📜 Logs", view: adminViews.logs },
    { id: "activities", label: "🎮 Activities & Flights", view: adminViews.activities },
    { id: "masterTimetable", label: "📅 Master Timetable", view: adminViews.timetable },
    { id: "finance", label: "💳 Finance", view: adminViews.finance },
    { id: "auditLogs", label: "📜 Audit Logs", view: adminViews.auditLogs },
    { id: "ads", label: "📢 Ads & Notices", view: adminViews.ads }
  ]
};

// ===== MOCK ADS DATA =====
const MOCK_ADS = [
  {
    id: "ad1",
    businessName: "Al-Noor Restaurant",
    category: "Food & Beverage",
    description: "Authentic Bahraini cuisine with modern ambiance",
    phone: "+973 1234 5678"
  },
  {
    id: "ad2",
    businessName: "Fitness Plus Gym",
    category: "Health & Fitness",
    description: "State-of-the-art gym with professional trainers",
    phone: "+973 3344 5566"
  },
  {
    id: "ad3",
    businessName: "Travel Bahrain Tours",
    category: "Travel & Tourism",
    description: "Explore Bahrain with our guided tours",
    phone: "+973 5566 7788"
  },
  {
    id: "ad4",
    businessName: "Tech Solutions Ltd",
    category: "Technology",
    description: "IT services and software development",
    phone: "+973 7788 9900"
  },
  {
    id: "ad5",
    businessName: "Beauty & Spa Center",
    category: "Beauty & Wellness",
    description: "Premium beauty and spa treatments",
    phone: "+973 9900 1122"
  },
  {
    id: "ad6",
    businessName: "Real Estate Bahrain",
    category: "Real Estate",
    description: "Premium properties and investment opportunities",
    phone: "+973 1122 3344"
  }
];

// ===== MOCK ANNOUNCEMENTS DATA =====
const MOCK_ANNOUNCEMENTS = [
  {
    id: "ann1",
    title: "🏆 Annual Badminton Championship",
    message: "Join us for the biggest badminton tournament of the year! Registration opens next week.",
    publishedAt: new Date("2026-09-10")
  },
  {
    id: "ann2",
    title: "🎉 Club Anniversary Celebration",
    message: "Celebrate 25 years of Indian Club Bahrain with us! Special events and prizes await.",
    publishedAt: new Date("2026-09-05")
  },
  {
    id: "ann3",
    title: "📢 New Membership Drive",
    message: "Invite your friends to join our vibrant community. Special discounts for new members!",
    publishedAt: new Date("2026-09-01")
  }
];

// ===== RENDER LOGIN PAGE =====
function renderLoginPage() {
  const container = document.getElementById("app-content");
  if (!container) return;

  const adsHtml = MOCK_ADS.map((ad, index) => `
    <div class="carousel-ad ${index === 0 ? "active" : ""}">
      <div class="ad-title">🏢 ${ad.businessName}</div>
      <div class="ad-description">${ad.description}</div>
      <small style="color: #6b7280; display: block; margin-bottom: 1rem;">📞 ${ad.phone}</small>
      <div class="ad-contact">
        <button onclick="window.open('tel:${ad.phone.replace(/\s/g, '')}')">📞 Call</button>
        <button onclick="window.open('https://wa.me/${ad.phone.replace(/\D/g, '')}')">💬 WhatsApp</button>
      </div>
    </div>
  `).join("");

  const announcementsHtml = MOCK_ANNOUNCEMENTS.map(ann => `
    <div class="announcement-item">
      <h4>${ann.title}</h4>
      <p>${ann.message}</p>
      <small>${new Date(ann.publishedAt).toLocaleDateString("en-BH")}</small>
    </div>
  `).join("");

  container.innerHTML = `
    <div class="login-page">
      <!-- LOGIN BOX -->
      <div class="login-box">
        <div class="login-header">
          <div class="logo">🏏</div>
          <h1>Indian Club Bahrain</h1>
          <p>Member Portal</p>
        </div>
        <form class="login-form" onsubmit="window.handleLogin(event)">
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
        <div style="background: #eff6ff; border-left: 4px solid #1e40af; padding: 1rem; border-radius: 4px; margin-top: 1.5rem; font-size: 0.85rem; color: #1e40af;">
          <strong>📝 Test Credentials:</strong>
          <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
            <li><strong>Player:</strong> player@example.com / password123</li>
            <li><strong>Flight Admin:</strong> leveladmin@example.com / password123</li>
            <li><strong>Super Admin:</strong> superadmin@example.com / password123</li>
          </ul>
        </div>
      </div>

      <!-- CLUB ANNOUNCEMENTS SECTION -->
      <div class="announcements-section">
        <div class="announcements-header">
          <h2>📢 Club Announcements</h2>
          <p>Latest updates and celebrations</p>
        </div>
        ${announcementsHtml}
      </div>

      <!-- BUSINESS ADS CAROUSEL SECTION -->
      <div class="ads-carousel-section">
        <div class="carousel-header">
          <h2>🏪 Featured Business Directory</h2>
          <p>Explore our partner businesses</p>
        </div>
        <div class="carousel-tabs">
          ${MOCK_ADS.map((ad, index) => `
            <button class="carousel-tab ${index === 0 ? "active" : ""}" onclick="window.switchCarouselTab(${index})">
              ${ad.businessName}
            </button>
          `).join("")}
        </div>
        <div class="carousel-content">
          ${adsHtml}
        </div>
      </div>
    </div>
  `;
}

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

    container.innerHTML = `<div class="card"><p class="note">⏳ Loading...</p></div>`;
    const html = await currentTab.view();
    container.innerHTML = html;
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

    state.member = response.member;
    state.role = response.member.role;
    state.flightId = response.member.flightId;
    state.flightName = response.member.flightName;
    state.currentTab = "home";
    state.currentPage = "dashboard";

    localStorage.setItem("authToken", response.token);
    localStorage.setItem("memberRole", state.role);

    console.log(`✅ Login successful: ${state.member.fullName} (${state.role})`);
    
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
    renderLoginPage();
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

