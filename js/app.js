
// app.js - Main Application Controller (Updated)

import { 
  state, 
  navigate, 
  getCurrentRole, 
  getSidebarMenu, 
  getCurrentPage, 
  getMember,
  initRouter,
  loadMember
} from './router.js';

import { 
  isAuthenticated, 
  getCurrentUser,
  login,
  logout
} from './auth.js';

import { APP_CONFIG } from './config.js';

// ============================================
// APP INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 App initializing...');
  console.log('App Name:', APP_CONFIG.appName);
  console.log('App Version:', APP_CONFIG.appVersion);
  
  // Initialize router
  initRouter();
  
  // Check if user is authenticated
  if (isAuthenticated()) {
    console.log('✅ User authenticated');
    showMainApp();
    initializeApp();
  } else {
    console.log('❌ User not authenticated');
    showAuthScreen();
    initializeAuthScreen();
  }
});

// ============================================
// SCREEN MANAGEMENT
// ============================================

function showLoadingScreen() {
  document.getElementById('loadingScreen').style.display = 'flex';
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'none';
}

function showAuthScreen() {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'flex';
}

// ============================================
// AUTH SCREEN INITIALIZATION
// ============================================

function initializeAuthScreen() {
  const authContainer = document.getElementById('firebaseui-auth-container');
  
  // Create simple login form for testing
  authContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 15px;">
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="authEmail" placeholder="Enter your email" style="width: 100%; padding: 10px; border: 1px solid #e0e6ed; border-radius: 8px;">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="authPassword" placeholder="Enter your password" style="width: 100%; padding: 10px; border: 1px solid #e0e6ed; border-radius: 8px;">
      </div>
      <button id="loginBtn" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
        Sign In
      </button>
      <div style="text-align: center; margin-top: 15px; font-size: 12px; color: #a0a8b8;">
        <p><strong>Test Accounts:</strong></p>
        <p>Super Admin: superadmin@club.com</p>
        <p>Level Admin: leveladmin@club.com</p>
        <p>Player: player@club.com</p>
        <p>Password: any</p>
      </div>
    </div>
  `;
  
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
}

// ============================================
// LOGIN HANDLER
// ============================================

async function handleLogin() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  
  if (!email || !password) {
    showNotification('Please enter email and password', 'warning');
    return;
  }
  
  try {
    showLoadingScreen();
    const user = await login(email, password);
    showMainApp();
    initializeApp();
    showNotification(`Welcome, ${user.fullName}!`, 'success');
  } catch (error) {
    showAuthScreen();
    initializeAuthScreen();
    showNotification('Login failed: ' + error.message, 'error');
  }
}

// ============================================
// APP INITIALIZATION
// ============================================

function initializeApp() {
  console.log('📱 Initializing main app...');
  
  // Set user info in header
  updateUserHeader();
  
  // Generate sidebar menu
  generateSidebarMenu();
  
  // Render initial page
  renderPage();
  
  // Setup event listeners
  setupEventListeners();
  
  console.log('✅ App initialized successfully');
}

// ============================================
// USER HEADER
// ============================================

function updateUserHeader() {
  const member = getMember();
  const role = getCurrentRole();
  
  if (member) {
    document.getElementById('userName').textContent = member.fullName || 'User';
    document.getElementById('userRole').textContent = role || 'Player';
  }
}

// ============================================
// SIDEBAR MENU GENERATION
// ============================================

function generateSidebarMenu() {
  const menu = getSidebarMenu();
  const sidebarMenu = document.getElementById('sidebarMenu');
  
  sidebarMenu.innerHTML = '';
  
  menu.forEach(item => {
    const menuItem = document.createElement('a');
    menuItem.className = 'menu-item';
    menuItem.href = '#';
    menuItem.setAttribute('data-page', item.page);
    menuItem.innerHTML = `
      <i class="fas fa-${getIconForPage(item.page)} menu-icon"></i>
      <span>${item.label}</span>
    `;
    
    menuItem.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(item.page);
    });
    
    sidebarMenu.appendChild(menuItem);
  });
}

// ============================================
// PAGE RENDERING
// ============================================

function renderPage() {
  const role = getCurrentRole();
  const page = getCurrentPage();
  
  console.log(`📄 Rendering page: ${page} (Role: ${role})`);
  
  let content = '';
  
  if (role === 'SUPER_ADMIN') {
    content = renderSuperAdminPage(page);
  } else if (role === 'LEVEL_ADMIN') {
    content = renderLevelAdminPage(page);
  } else if (role === 'PLAYER') {
    content = renderPlayerPage(page);
  }
  
  document.getElementById('pageContent').innerHTML = content;
  
  // Update active menu item
  updateActiveMenu(page);
}

// ============================================
// SUPER ADMIN PAGES
// ============================================

function renderSuperAdminPage(page) {
  switch(page) {
    case 'home':
      return adminViews.dashboard();
    case 'members':
      return adminViews.membersSection();
    case 'activities':
      return adminViews.activitiesSection();
    case 'advertising':
      return adminViews.advertisingSection();
    case 'logs':
      return adminViews.logsSection();
    default:
      return adminViews.dashboard();
  }
}

// ============================================
// LEVEL ADMIN PAGES
// ============================================

function renderLevelAdminPage(page) {
  switch(page) {
    case 'home':
      return flightAdminViews.dashboard();
    case 'attendance':
      return flightAdminViews.attendanceSection();
    case 'sessionControl':
      return flightAdminViews.sessionControlSection();
    case 'shuttle':
      return flightAdminViews.shuttleSection();
    case 'reports':
      return flightAdminViews.reportsSection();
    default:
      return flightAdminViews.dashboard();
  }
}

// ============================================
// PLAYER PAGES
// ============================================

function renderPlayerPage(page) {
  switch(page) {
    case 'home':
      return views.home();
    case 'timetable':
      return views.timetable();
    case 'attendance':
      return views.attendance();
    case 'logs':
      return views.logs();
    case 'wallet':
      return views.wallet();
    case 'bazaar':
      return views.bazaar();
    case 'profile':
      return views.profile();
    default:
      return views.home();
  }
}

// ============================================
// ACTIVE MENU ITEM
// ============================================

function updateActiveMenu(page) {
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeItem = document.querySelector(`[data-page="${page}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Sign out button
  document.getElementById('signOutBtn').addEventListener('click', handleSignOut);
  
  // Listen for navigation events
  window.addEventListener('app:navigate', (e) => {
    renderPage();
  });
  
  // Listen for notification events
  window.addEventListener('app:notify', (e) => {
    showNotification(e.detail.message, e.detail.type);
  });
}

// ============================================
// SIGN OUT
// ============================================

async function handleSignOut() {
  if (confirm('Are you sure you want to sign out?')) {
    try {
      await logout();
      showAuthScreen();
      initializeAuthScreen();
      showNotification('Signed out successfully', 'success');
    } catch (error) {
      showNotification('Logout failed: ' + error.message, 'error');
    }
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span>${getNotificationIcon(type)}</span>
      <span>${message}</span>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getIconForPage(page) {
  const icons = {
    'home': 'home',
    'members': 'users',
    'activities': 'calendar',
    'advertising': 'megaphone',
    'logs': 'history',
    'attendance': 'check-circle',
    'sessionControl': 'sliders-h',
    'shuttle': 'badminton',
    'reports': 'chart-bar',
    'timetable': 'calendar-alt',
    'wallet': 'wallet',
    'bazaar': 'store',
    'profile': 'user-circle'
  };
  
  return icons[page] || 'circle';
}

function getNotificationIcon(type) {
  const icons = {
    'success': '✅',
    'error': '❌',
    'warning': '⚠️',
    'info': 'ℹ️'
  };
  
  return icons[type] || 'ℹ️';
}

// ============================================
// EXPORT FOR GLOBAL USE
// ============================================

window.appController = {
  renderPage,
  showNotification,
  navigate,
  login,
  logout
};

console.log('✅ app.js loaded successfully');
