
// ============================================
// router.js - ROUTING & NAVIGATION SYSTEM
// ============================================

import * as views from './views.js';
import * as flightAdminViews from './flightAdminViews.js';
import * as adminViews from './adminViews.js';

// ===== ROLE-BASED PAGE ACCESS =====
const pageAccess = {
  // PLAYER pages (accessible to PLAYER, LEVEL_ADMIN, SUPER_ADMIN)
  PLAYER: ['home', 'timetable', 'attendance', 'wallet', 'profile', 'bazaar', 'logs'],
  
  // FLIGHT ADMIN pages (accessible to LEVEL_ADMIN, SUPER_ADMIN)
  LEVEL_ADMIN: ['home', 'timetable', 'attendance', 'wallet', 'profile', 'bazaar', 'logs', 'sessions', 'stock', 'reports'],
  
  // SUPER ADMIN pages (accessible to SUPER_ADMIN only)
  SUPER_ADMIN: ['home', 'overview', 'flights', 'master', 'admin-finance', 'ads', 'audit', 'bazaar', 'logs']
};

// ===== CURRENT ROUTE STATE =====
let currentRoute = 'home';
let currentLevel = 'premier'; // Default level filter

// ===== INITIALIZE ROUTER =====
export function initializeRouter() {
  const userRole = window.appState?.role || 'PLAYER';
  
  console.log(`🔀 Router initialized for role: ${userRole}`);
  
  // Set up navigation event listeners
  setupNavigationListeners();
  
  // Navigate to home
  navigateTo('home');
}

// ===== SETUP NAVIGATION LISTENERS =====
function setupNavigationListeners() {
  // Player navigation
  document.getElementById('nav-home')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('nav-timetable')?.addEventListener('click', () => navigateTo('timetable'));
  document.getElementById('nav-attendance')?.addEventListener('click', () => navigateTo('attendance'));
  document.getElementById('nav-wallet')?.addEventListener('click', () => navigateTo('wallet'));
  document.getElementById('nav-profile')?.addEventListener('click', () => navigateTo('profile'));
  document.getElementById('nav-bazaar')?.addEventListener('click', () => navigateTo('bazaar'));
  document.getElementById('nav-logs')?.addEventListener('click', () => navigateTo('logs'));
  
  // Flight Admin navigation
  document.getElementById('nav-sessions')?.addEventListener('click', () => navigateTo('sessions'));
  document.getElementById('nav-stock')?.addEventListener('click', () => navigateTo('stock'));
  document.getElementById('nav-reports')?.addEventListener('click', () => navigateTo('reports'));
  
  // Super Admin navigation
  document.getElementById('nav-overview')?.addEventListener('click', () => navigateTo('overview'));
  document.getElementById('nav-flights')?.addEventListener('click', () => navigateTo('flights'));
  document.getElementById('nav-master')?.addEventListener('click', () => navigateTo('master'));
  document.getElementById('nav-admin-finance')?.addEventListener('click', () => navigateTo('admin-finance'));
  document.getElementById('nav-ads')?.addEventListener('click', () => navigateTo('ads'));
  document.getElementById('nav-audit')?.addEventListener('click', () => navigateTo('audit'));
  
  // Logout
  document.getElementById('nav-logout')?.addEventListener('click', () => logout());
}

// ===== CHECK AUTHORIZATION =====
function checkAuthorization(page) {
  const userRole = window.appState?.role || 'PLAYER';
  const allowedPages = pageAccess[userRole] || [];
  
  if (!allowedPages.includes(page)) {
    console.warn(`❌ Access denied to page: ${page} for role: ${userRole}`);
    return false;
  }
  
  return true;
}

// ===== REQUIRE SUPER ADMIN =====
export function requireSuperAdmin() {
  const userRole = window.appState?.role;
  if (userRole !== 'SUPER_ADMIN') {
    console.error('❌ Super Admin access required!');
    if (window.showToast) {
      window.showToast('❌ You do not have permission to access this feature');
    }
    return false;
  }
  return true;
}

// ===== REQUIRE FLIGHT ADMIN =====
export function requireFlightAdmin() {
  const userRole = window.appState?.role;
  if (userRole !== 'LEVEL_ADMIN' && userRole !== 'SUPER_ADMIN') {
    console.error('❌ Flight Admin access required!');
    if (window.showToast) {
      window.showToast('❌ You do not have permission to access this feature');
    }
    return false;
  }
  return true;
}

// ===== NAVIGATE TO PAGE =====
export function navigateTo(page) {
  // Check authorization
  if (!checkAuthorization(page)) {
    if (window.showToast) {
      window.showToast('❌ You do not have access to this page');
    }
    return;
  }

  currentRoute = page;
  renderPage(page);
  updateActiveNavigation(page);
  
  console.log(`✅ Navigated to: ${page}`);
}

// ===== RENDER PAGE CONTENT =====
function renderPage(page) {
  const contentArea = document.getElementById('content');
  if (!contentArea) {
    console.error('❌ Content area not found');
    return;
  }

  let html = '';
  const userRole = window.appState?.role || 'PLAYER';

  try {
    // PLAYER pages
    if (page === 'home' && userRole !== 'SUPER_ADMIN') {
      html = views.views.home();
    } else if (page === 'timetable' && userRole !== 'SUPER_ADMIN') {
      html = views.views.timetable();
    } else if (page === 'attendance' && userRole !== 'SUPER_ADMIN') {
      html = views.views.attendance();
    } else if (page === 'wallet' && userRole !== 'SUPER_ADMIN') {
      html = views.views.wallet();
    } else if (page === 'profile') {
      html = views.views.profile();
    } else if (page === 'bazaar') {
      html = views.views.bazaar();
    } else if (page === 'logs') {
      html = views.views.logs();
    }
    
    // FLIGHT ADMIN pages
    else if (page === 'sessions' && (userRole === 'LEVEL_ADMIN' || userRole === 'SUPER_ADMIN')) {
      html = flightAdminViews.flightAdminViews.sessions();
    } else if (page === 'stock' && (userRole === 'LEVEL_ADMIN' || userRole === 'SUPER_ADMIN')) {
      html = flightAdminViews.flightAdminViews.stock();
    } else if (page === 'reports' && (userRole === 'LEVEL_ADMIN' || userRole === 'SUPER_ADMIN')) {
      html = flightAdminViews.flightAdminViews.reports();
    }
    
    // SUPER ADMIN pages
    else if (page === 'overview' && userRole === 'SUPER_ADMIN') {
      html = adminViews.adminViews.overview();
    } else if (page === 'flights' && userRole === 'SUPER_ADMIN') {
      html = adminViews.adminViews.flights();
    } else if (page === 'master' && userRole === 'SUPER_ADMIN') {
      html = adminViews.adminViews.master();
    } else if (page === 'admin-finance' && userRole === 'SUPER_ADMIN') {
      html = adminViews.adminViews['admin-finance']();
    } else if (page === 'ads' && userRole === 'SUPER_ADMIN') {
      html = adminViews.adminViews.ads();
    } else if (page === 'audit' && userRole === 'SUPER_ADMIN') {
      html = adminViews.adminViews.audit();
    }
    
    // Default to home
    else {
      html = views.views.home();
    }

    contentArea.innerHTML = html;
    
    // Trigger render event for custom initialization
    window.dispatchEvent(new CustomEvent('indianclub:render', { detail: { page: page } }));
    
  } catch (error) {
    console.error(`❌ Error rendering page ${page}:`, error);
    contentArea.innerHTML = `<div class="error-message">❌ Error loading page. Please try again.</div>`;
  }
}

// ===== UPDATE ACTIVE NAVIGATION =====
function updateActiveNavigation(page) {
  // Remove active class from all nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  // Add active class to current nav item
  const navItem = document.getElementById(`nav-${page}`);
  if (navItem) {
    navItem.classList.add('active');
  }
}

// ===== LOGOUT =====
function logout() {
  if (window.logout) {
    window.logout();
  }
}

// ===== GET CURRENT ROUTE =====
export function getCurrentRoute() {
  return currentRoute;
}

// ===== GET CURRENT LEVEL =====
export function getCurrentLevel() {
  return currentLevel;
}

// ===== SET CURRENT LEVEL =====
export function setCurrentLevel(level) {
  currentLevel = level;
  console.log(`📍 Level filter set to: ${level}`);
}

// ===== SWITCH LOGIN TAB =====
window.switchLoginTab = function(tab) {
  document.querySelectorAll('.login-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.login-tab-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(`${tab}-form`)?.classList.add('active');
  event.target?.classList.add('active');
};

// ===== SHOW TOAST NOTIFICATION =====
window.showToast = function(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 9999;
    animation: slideIn 0.3s ease-in-out;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// ===== NORMALIZE ROLE =====
window.normalizeRole = function(role) {
  if (!role) return 'PLAYER';
  
  const roleUpper = role.toUpperCase();
  
  if (roleUpper === 'SUPERADMIN' || roleUpper === 'ADMIN') {
    return 'SUPER_ADMIN';
  } else if (roleUpper === 'LEVELADMIN' || roleUpper === 'FLIGHT_ADMIN') {
    return 'LEVEL_ADMIN';
  }
  
  return 'PLAYER';
};

// ===== VALIDATE EMAIL =====
window.validateEmail = function(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ===== VALIDATE PHONE =====
window.validatePhone = function(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
};

// ===== VALIDATE PASSWORD =====
window.validatePassword = function(password) {
  return password && password.length >= 6;
};

// ===== UPDATE USER UI =====
window.updateUserUI = function() {
  const member = window.appState?.member;
  const role = window.appState?.role;
  
  if (!member) return;

  // Update user name in header
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    userNameEl.textContent = member.fullName || 'User';
  }

  // Update role badge
  const roleEl = document.getElementById('userRole');
  if (roleEl) {
    roleEl.textContent = role || 'PLAYER';
  }

  // Show/hide navigation based on role
  updateNavigationVisibility(role);
};

// ===== UPDATE NAVIGATION VISIBILITY =====
function updateNavigationVisibility(role) {
  // Hide all nav items first
  document.querySelectorAll('.nav-item').forEach(item => {
    item.style.display = 'none';
  });

  // Show items based on role
  const playerItems = ['nav-home', 'nav-timetable', 'nav-attendance', 'nav-wallet', 'nav-profile', 'nav-bazaar', 'nav-logs'];
  const flightAdminItems = [...playerItems, 'nav-sessions', 'nav-stock', 'nav-reports'];
  const superAdminItems = ['nav-home', 'nav-overview', 'nav-flights', 'nav-master', 'nav-admin-finance', 'nav-ads', 'nav-audit', 'nav-bazaar', 'nav-logs'];

  let itemsToShow = playerItems;
  
  if (role === 'LEVEL_ADMIN') {
    itemsToShow = flightAdminItems;
  } else if (role === 'SUPER_ADMIN') {
    itemsToShow = superAdminItems;
  }

  itemsToShow.forEach(itemId => {
    const item = document.getElementById(itemId);
    if (item) item.style.display = 'block';
  });

  // Always show logout
  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) logoutBtn.style.display = 'block';
}

// ===== FILTER BY LEVEL =====
window.filterByLevel = function() {
  const levelSelects = document.querySelectorAll('[id$="LevelFilter"]');
  
  levelSelects.forEach(select => {
    const level = select.value;
    if (level) {
      setCurrentLevel(level);
      console.log(`📍 Filtering by level: ${level}`);
      
      // Re-render current page with new filter
      renderPage(currentRoute);
    }
  });
};

console.log('✅ router.js loaded successfully');

