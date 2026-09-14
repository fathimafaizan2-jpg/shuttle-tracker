
// ============================================
// main.js - COMPLETE APP INITIALIZATION
// ============================================

console.log('🚀 Indian Club Bahrain App - Starting...');

// ===== IMPORT ALL MODULES =====
import { views } from './views.js';
import { flightAdminViews } from './flightAdminViews.js';
import { adminViews } from './adminViews.js';
import { api } from './api.js';
import { checkAuth, handleLogin, handleActivate } from './auth.js';

// ===== MAKE MODULES GLOBALLY AVAILABLE =====
window.views = views;
window.flightAdminViews = flightAdminViews;
window.adminViews = adminViews;
window.api = api;
window.checkAuth = checkAuth;
window.handleLogin = handleLogin;
window.handleActivate = handleActivate;

console.log('✅ All modules imported');

// ===== INITIALIZE APP STATE =====
window.appState = {
  member: null,
  role: null,
  token: null,
  isAuthenticated: false,
  sessionsAttended: 0,
  pendingAmount: 0,
  arrears: 0,
  walletBalanceFils: 0,
  upcomingSession: null,
  currentPage: null,
  flightId: null
};

console.log('✅ App state initialized');

// ===== ROUTE DEFINITIONS =====
const routes = {
  'home': { view: 'views', page: 'home', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'timetable': { view: 'views', page: 'timetable', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'attendance': { view: 'views', page: 'attendance', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'wallet': { view: 'views', page: 'wallet', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'profile': { view: 'views', page: 'profile', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'bazaar': { view: 'views', page: 'bazaar', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'logs': { view: 'views', page: 'logs', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'sessions': { view: 'flightAdminViews', page: 'sessions', roles: ['LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'stock': { view: 'flightAdminViews', page: 'stock', roles: ['LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'reports': { view: 'flightAdminViews', page: 'reports', roles: ['LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'overview': { view: 'adminViews', page: 'home', roles: ['SUPER_ADMIN'] },
  'flights': { view: 'adminViews', page: 'flights', roles: ['SUPER_ADMIN'] },
  'master': { view: 'adminViews', page: 'master', roles: ['SUPER_ADMIN'] },
  'finance': { view: 'adminViews', page: 'finance', roles: ['SUPER_ADMIN'] },
  'ads': { view: 'adminViews', page: 'ads', roles: ['SUPER_ADMIN'] },
  'audit': { view: 'adminViews', page: 'audit', roles: ['SUPER_ADMIN'] }
};

// ===== NAVIGATION MENU STRUCTURE =====
const navigationMenu = {
  PLAYER: [
    { label: '🏠 Home', route: 'home' },
    { label: '📅 Timetable', route: 'timetable' },
    { label: '✓ Attendance', route: 'attendance' },
    { label: '💰 Wallet', route: 'wallet' },
    { label: '👤 Profile', route: 'profile' },
    { label: '🛍️ BaZaar', route: 'bazaar' },
    { label: '📜 Logs', route: 'logs' }
  ],
  LEVEL_ADMIN: [
    { label: '🏠 Home', route: 'home' },
    { label: '📅 Timetable', route: 'timetable' },
    { label: '✓ Attendance', route: 'attendance' },
    { label: '💰 Wallet', route: 'wallet' },
    { label: '👤 Profile', route: 'profile' },
    { label: '🛍️ BaZaar', route: 'bazaar' },
    { label: '📜 Logs', route: 'logs' },
    { label: '---', separator: true },
    { label: '📅 Session Control', route: 'sessions' },
    { label: '📦 Shuttle Stock', route: 'stock' },
    { label: '📊 Reports', route: 'reports' }
  ],
  SUPER_ADMIN: [
    { label: '🏠 Home', route: 'home' },
    { label: '📅 Timetable', route: 'timetable' },
    { label: '✓ Attendance', route: 'attendance' },
    { label: '💰 Wallet', route: 'wallet' },
    { label: '👤 Profile', route: 'profile' },
    { label: '🛍️ BaZaar', route: 'bazaar' },
    { label: '📜 Logs', route: 'logs' },
    { label: '---', separator: true },
    { label: '📅 Session Control', route: 'sessions' },
    { label: '📦 Shuttle Stock', route: 'stock' },
    { label: '📊 Reports', route: 'reports' },
    { label: '---', separator: true },
    { label: '📊 Club Overview', route: 'overview' },
    { label: '✈️ Flights & Members', route: 'flights' },
    { label: '📅 Master Timetable', route: 'master' },
    { label: '💼 Executive Finance', route: 'finance' },
    { label: '📢 Ads & Notices', route: 'ads' },
    { label: '🔍 Audit Log', route: 'audit' }
  ]
};

console.log('✅ Routes and navigation defined');

// ===== BUILD NAVIGATION MENU =====
window.buildNavigation = function() {
  const role = window.appState?.role;
  const navContainer = document.getElementById('navMenu');

  if (!navContainer) {
    console.warn('⚠️ Navigation container not found');
    return;
  }

  const menu = navigationMenu[role] || navigationMenu.PLAYER;
  let navHTML = '';

  menu.forEach(item => {
    if (item.separator) {
      navHTML += '<div style="border-top: 1px solid #ddd; margin: 10px 0;"></div>';
    } else {
      navHTML += `
        <button class="nav-item" onclick="window.navigateTo('${item.route}')" data-route="${item.route}">
          ${item.label}
        </button>
      `;
    }
  });

  navContainer.innerHTML = navHTML;
  console.log('✅ Navigation menu built for role:', role);
};

// ===== NAVIGATE TO PAGE =====
window.navigateTo = async function(routeName) {
  console.log('🔄 Navigating to:', routeName);

  const route = routes[routeName];
  if (!route) {
    console.error('❌ Route not found:', routeName);
    window.showNotification('❌ Page not found: ' + routeName, 'error');
    return;
  }

  if (!window.appState?.isAuthenticated) {
    console.warn('⚠️ Not authenticated');
    window.showNotification('❌ Please login first', 'error');
    return;
  }

  const userRole = window.appState?.role;
  if (!route.roles.includes(userRole)) {
    console.error('❌ Unauthorized access:', routeName, 'for role:', userRole);
    window.showNotification('❌ You do not have permission to access this page', 'error');
    return;
  }

  try {
    let viewModule;
    if (route.view === 'views') {
      viewModule = window.views;
    } else if (route.view === 'flightAdminViews') {
      viewModule = window.flightAdminViews;
    } else if (route.view === 'adminViews') {
      viewModule = window.adminViews;
    }

    if (!viewModule) {
      throw new Error(`View module not found: ${route.view}`);
    }

    const pageRenderer = viewModule[route.page];
    if (!pageRenderer) {
      throw new Error(`Page not found: ${route.page}`);
    }

    const contentArea = document.getElementById('pageContent');
    if (contentArea) {
      contentArea.innerHTML = '<div style="text-align: center; padding: 40px;"><p>⏳ Loading...</p></div>';
    }

    console.log('📄 Rendering page:', route.page);
    const pageHTML = await pageRenderer();

    if (contentArea) {
      contentArea.innerHTML = pageHTML;
    }

    window.appState.currentPage = routeName;

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.route === routeName) {
        item.classList.add('active');
      }
    });

    console.log('✅ Page loaded:', routeName);

  } catch (error) {
    console.error('❌ Error navigating to:', routeName, error);
    window.showNotification(`❌ Error loading page: ${error.message}`, 'error');
    
    const contentArea = document.getElementById('pageContent');
    if (contentArea) {
      contentArea.innerHTML = `<div class="error-message">❌ Error loading page: ${error.message}</div>`;
    }
  }
};

// ===== SHOW NOTIFICATION =====
window.showNotification = function(message, type = 'info') {
  console.log(`📢 [${type.toUpperCase()}] ${message}`);

  const notificationContainer = document.getElementById('notifications');
  if (!notificationContainer) {
    console.warn('⚠️ Notification container not found');
    return;
  }

  const notificationId = 'notif_' + Date.now();
  const bgColor = type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1';
  const textColor = type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460';
  const borderColor = type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb';

  const notificationHTML = `
    <div id="${notificationId}" style="
      background: ${bgColor};
      color: ${textColor};
      border: 1px solid ${borderColor};
      padding: 15px 20px;
      border-radius: 6px;
      margin-bottom: 10px;
      animation: slideIn 0.3s ease-in-out;
    ">
      ${message}
    </div>
  `;

  notificationContainer.innerHTML += notificationHTML;

  setTimeout(() => {
    const element = document.getElementById(notificationId);
    if (element) {
      element.style.animation = 'slideOut 0.3s ease-in-out';
      setTimeout(() => element.remove(), 300);
    }
  }, 5000);
};

// ===== UPDATE USER UI =====
window.updateUserUI = function() {
  console.log('🎨 Updating user UI...');
  
  const member = window.appState?.member;
  const role = window.appState?.role;
  
  if (!member) {
    console.warn('⚠️ No member data available');
    return;
  }

  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    userNameEl.textContent = member.fullName || 'User';
  }

  const roleEl = document.getElementById('userRole');
  if (roleEl) {
    const roleDisplay = role === 'LEVEL_ADMIN' ? 'Flight Admin' : role === 'SUPER_ADMIN' ? 'Super Admin' : 'Player';
    roleEl.textContent = roleDisplay;
  }

  const flightEl = document.getElementById('userFlight');
  if (flightEl) {
    flightEl.textContent = member.flightId || 'N/A';
  }

  console.log('✅ User UI updated');
};

// ===== INITIALIZE ROUTER =====
window.initializeRouter = function() {
  console.log('🔄 Initializing router...');

  if (!window.appState?.isAuthenticated) {
    console.warn('⚠️ Not authenticated, redirecting to login');
    document.getElementById('app').style.display = 'none';
    document.getElementById('login').style.display = 'flex';
    return;
  }

  window.buildNavigation();
  window.navigateTo('home');

  console.log('✅ Router initialized');
};

// ===== SWITCH AUTH TAB =====
window.switchAuthTab = function(tab) {
  console.log('🔄 Switching auth tab to:', tab);

  const loginForm = document.getElementById('loginForm');
  const activateForm = document.getElementById('activateForm');
  const loginTab = document.getElementById('loginTab');
  const activateTab = document.getElementById('activateTab');

  if (tab === 'login') {
    loginForm.style.display = 'block';
    activateForm.style.display = 'none';
    loginTab.classList.add('active');
    activateTab.classList.remove('active');
  } else if (tab === 'activate') {
    loginForm.style.display = 'none';
    activateForm.style.display = 'block';
    loginTab.classList.remove('active');
    activateTab.classList.add('active');
  }
};

// ===== LOGOUT =====
window.logout = function() {
  if (confirm('Are you sure you want to logout?')) {
    console.log('🚪 Logging out...');

    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('memberData');

    window.appState = {
      member: null,
      role: null,
      token: null,
      isAuthenticated: false,
      sessionsAttended: 0,
      pendingAmount: 0,
      arrears: 0,
      walletBalanceFils: 0,
      upcomingSession: null,
      currentPage: null,
      flightId: null
    };

    document.getElementById('app').style.display = 'none';
    document.getElementById('login').style.display = 'flex';

    document.getElementById('loginForm').reset();
    document.getElementById('activateForm').reset();
    document.getElementById('errorMessage').textContent = '';
    document.getElementById('errorMessage').style.display = 'none';

    console.log('✅ Logged out successfully');
  }
};

// ===== OPEN CLUB ACCESS PORTAL =====
window.openClubAccessPortal = function() {
  alert('🏢 Club Access Portal\n\nSelect your access type:\n\n1. Existing Member - Use "Sign In" tab\n2. New Member - Use "Activate Account" tab\n\nPlease proceed with the appropriate option above.');
};

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(event) {
  // Ctrl/Cmd + L = Logout
  if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
    event.preventDefault();
    window.logout();
  }

  // Ctrl/Cmd + H = Home
  if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
    event.preventDefault();
    window.navigateTo('home');
  }
});

// ===== HANDLE ROUTE CHANGES =====
window.addEventListener('hashchange', function() {
  const hash = window.location.hash.slice(1) || 'home';
  window.navigateTo(hash);
});

// ===== INITIALIZE APP ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('📱 App initializing on page load...');

  // Check if user is already authenticated
  if (window.checkAuth && window.checkAuth()) {
    console.log('✅ User authenticated, loading app');
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    window.updateUserUI();
    window.initializeRouter();
  } else {
    console.log('⚠️ User not authenticated, showing login');
    document.getElementById('app').style.display = 'none';
    document.getElementById('login').style.display = 'flex';
  }

  // Attach auth event listeners
  const loginForm = document.getElementById('loginForm');
  if (loginForm && window.handleLogin) {
    loginForm.addEventListener('submit', window.handleLogin);
  }

  const activateForm = document.getElementById('activateForm');
  if (activateForm && window.handleActivate) {
    activateForm.addEventListener('submit', window.handleActivate);
  }

  console.log('✅ App fully initialized');
});

// ===== HANDLE WINDOW ERRORS =====
window.addEventListener('error', function(event) {
  console.error('❌ Global error:', event.error);
  window.showNotification('❌ An error occurred: ' + event.error.message, 'error');
});

// ===== HANDLE UNHANDLED PROMISE REJECTIONS =====
window.addEventListener('unhandledrejection', function(event) {
  console.error('❌ Unhandled promise rejection:', event.reason);
  window.showNotification('❌ An error occurred: ' + event.reason, 'error');
});

console.log('✅ main.js loaded successfully - App ready!');

