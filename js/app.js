import { 
  state, 
  navigate, 
  getCurrentRole, 
  getSidebarMenu, 
  getCurrentPage, 
  getMember,
  initRouter,
  loadMember
} from './modules/router.js';

import { 
  isAuthenticated, 
  getCurrentUser,
  login,
  logout
} from './modules/auth.js';

import { APP_CONFIG } from './modules/config.js';

let appReady = false;

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 App initializing...');
  console.log('App Name:', APP_CONFIG.appName);
  console.log('App Version:', APP_CONFIG.appVersion);
  
  initRouter();
  
  if (isAuthenticated()) {
    console.log('✅ User authenticated');
    showMainApp();
    initializeApp();
  } else {
    console.log('❌ User not authenticated - showing login');
    showAuthScreen();
    initializeAuthScreen();
  }
});

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

function initializeAuthScreen() {
  const authContainer = document.getElementById('firebaseui-auth-container');
  
  authContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 15px;">
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="authEmail" placeholder="Enter your email" style="width: 100%; padding: 10px; border: 1px solid #e0e6ed; border-radius: 8px; font-family: inherit;">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="authPassword" placeholder="Enter your password" style="width: 100%; padding: 10px; border: 1px solid #e0e6ed; border-radius: 8px; font-family: inherit;">
      </div>
      <button id="loginBtn" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
        <i class="fas fa-sign-in-alt"></i> Sign In
      </button>
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #a0a8b8; line-height: 1.8;">
        <p style="margin: 0; font-weight: 600; margin-bottom: 10px;">📋 Test Accounts:</p>
        <p style="margin: 5px 0;"><strong>Super Admin:</strong></p>
        <p style="margin: 0 0 10px 0; color: #6c757d;">superadmin@club.com</p>
        
        <p style="margin: 5px 0;"><strong>Level Admin:</strong></p>
        <p style="margin: 0 0 10px 0; color: #6c757d;">leveladmin@club.com</p>
        
        <p style="margin: 5px 0;"><strong>Player:</strong></p>
        <p style="margin: 0 0 10px 0; color: #6c757d;">player@club.com</p>
        
        <p style="margin: 10px 0 0 0; color: #6c757d;">Password: <strong>any</strong></p>
      </div>
    </div>
  `;
  
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('authEmail').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('authPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
}

async function handleLogin() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  
  if (!email || !password) {
    showNotification('Please enter email and password', 'warning');
    return;
  }
  
  try {
    console.log('🔐 Attempting login with:', email);
    showLoadingScreen();
    
    const user = await login(email, password);
    
    console.log('✅ Login successful:', user);
    showMainApp();
    initializeApp();
    showNotification(`Welcome, ${user.fullName}!`, 'success');
  } catch (error) {
    console.error('❌ Login failed:', error);
    showAuthScreen();
    initializeAuthScreen();
    showNotification('Login failed: ' + error.message, 'error');
  }
}

function initializeApp() {
  console.log('📱 Initializing main app...');
  
  try {
    updateUserHeader();
    generateSidebarMenu();
    renderPage();
    setupEventListeners();
    
    appReady = true;
    console.log('✅ App initialized successfully');
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    showNotification('Failed to initialize app', 'error');
  }
}

function updateUserHeader() {
  const member = getMember();
  const role = getCurrentRole();
  
  if (member) {
    document.getElementById('userName').textContent = member.fullName || 'User';
    document.getElementById('userRole').textContent = role || 'Player';
    console.log('👤 User header updated:', member.fullName, '(' + role + ')');
  }
}

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
  
  console.log('📋 Sidebar menu generated with', menu.length, 'items');
}

function renderPage() {
  if (!appReady) return;
  
  const role = getCurrentRole();
  const page = getCurrentPage();
  
  console.log(`📄 Rendering page: ${page} (Role: ${role})`);
  
  let content = '';
  
  try {
    if (role === 'SUPER_ADMIN') {
      content = renderSuperAdminPage(page);
    } else if (role === 'LEVEL_ADMIN') {
      content = renderLevelAdminPage(page);
    } else if (role === 'PLAYER') {
      content = renderPlayerPage(page);
    } else {
      content = '<div class="card"><p>Unknown role</p></div>';
    }
    
    document.getElementById('pageContent').innerHTML = content;
    updateActiveMenu(page);
    document.querySelector('.premium-content').scrollTop = 0;
  } catch (error) {
    console.error('❌ Error rendering page:', error);
    showNotification('Error loading page', 'error');
  }
}

function renderSuperAdminPage(page) {
  if (!window.adminViews) {
    console.error('❌ adminViews not loaded');
    return '<div class="card"><p>Admin views not loaded</p></div>';
  }
  
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

function renderLevelAdminPage(page) {
  if (!window.flightAdminViews) {
    console.error('❌ flightAdminViews not loaded');
    return '<div class="card"><p>Level admin views not loaded</p></div>';
  }
  
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

function renderPlayerPage(page) {
  if (!window.views) {
    console.error('❌ views not loaded');
    return '<div class="card"><p>Player views not loaded</p></div>';
  }
  
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

function updateActiveMenu(page) {
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeItem = document.querySelector(`[data-page="${page}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

function setupEventListeners() {
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', handleSignOut);
  }
  
  window.addEventListener('app:navigate', (e) => {
    renderPage();
  });
  
  window.addEventListener('app:notify', (e) => {
    showNotification(e.detail.message, e.detail.type);
  });
  
  console.log('✅ Event listeners setup complete');
}

async function handleSignOut() {
  if (confirm('Are you sure you want to sign out?')) {
    try {
      console.log('🔓 Signing out...');
      await logout();
      appReady = false;
      showAuthScreen();
      initializeAuthScreen();
      showNotification('Signed out successfully', 'success');
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      showNotification('Logout failed: ' + error.message, 'error');
    }
  }
}

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
  
  console.log(`📢 Notification [${type}]:`, message);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

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

window.appController = {
  renderPage,
  showNotification,
  navigate,
  login,
  logout,
  isReady: () => appReady
};

console.log('✅ app.js loaded successfully');

