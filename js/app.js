
// ============================================
// app.js - Main Application Controller
// CORRECTED VERSION WITH SAFETY CHECKS
// ============================================

// Wait for all scripts to load
window.addEventListener('load', function() {
  console.log('✅ Window loaded, checking if views are ready...');
  
  // Check if all view objects are loaded
  if (typeof adminViews === 'undefined') {
    console.error('❌ adminViews not loaded!');
    alert('Error: adminViews not loaded. Check console.');
    return;
  }
  if (typeof flightAdminViews === 'undefined') {
    console.error('❌ flightAdminViews not loaded!');
    alert('Error: flightAdminViews not loaded. Check console.');
    return;
  }
  if (typeof views === 'undefined') {
    console.error('❌ views not loaded!');
    alert('Error: views not loaded. Check console.');
    return;
  }
  
  console.log('✅ All views loaded successfully!');
  console.log('✅ adminViews:', adminViews);
  console.log('✅ flightAdminViews:', flightAdminViews);
  console.log('✅ views:', views);
  
  // Initialize app
  initializeApp();
});

// ============================================
// APP INITIALIZATION
// ============================================

function initializeApp() {
  console.log('🚀 Initializing app...');
  
  // Check if user is authenticated
  const authToken = localStorage.getItem('firebase_auth_token');
  const userRole = localStorage.getItem('user_role');
  
  if (authToken && userRole) {
    console.log('✅ User authenticated as:', userRole);
    showMainApp();
    setupMainApp();
  } else {
    console.log('❌ User not authenticated, showing login');
    showAuthScreen();
    setupAuthScreen();
  }
}

// ============================================
// SCREEN MANAGEMENT
// ============================================

function showLoadingScreen() {
  const loading = document.getElementById('loadingScreen');
  const auth = document.getElementById('authScreen');
  const main = document.getElementById('mainApp');
  
  if (loading) loading.style.display = 'flex';
  if (auth) auth.style.display = 'none';
  if (main) main.style.display = 'none';
}

function showAuthScreen() {
  const loading = document.getElementById('loadingScreen');
  const auth = document.getElementById('authScreen');
  const main = document.getElementById('mainApp');
  
  if (loading) loading.style.display = 'none';
  if (auth) auth.style.display = 'flex';
  if (main) main.style.display = 'none';
}

function showMainApp() {
  const loading = document.getElementById('loadingScreen');
  const auth = document.getElementById('authScreen');
  const main = document.getElementById('mainApp');
  
  if (loading) loading.style.display = 'none';
  if (auth) auth.style.display = 'none';
  if (main) main.style.display = 'flex';
}

// ============================================
// AUTH SCREEN SETUP
// ============================================

function setupAuthScreen() {
  const loginBtn = document.querySelector('button[onclick="handleLogin()"]');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }
}

function handleLogin() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  
  if (!email || !password) {
    showNotification('Please enter email and password', 'warning');
    return;
  }
  
  // Determine role based on email
  let role = 'PLAYER';
  if (email.includes('superadmin')) role = 'SUPER_ADMIN';
  else if (email.includes('admin')) role = 'LEVEL_ADMIN';
  
  // Save to localStorage
  localStorage.setItem('firebase_auth_token', 'token_' + Date.now());
  localStorage.setItem('user_role', role);
  localStorage.setItem('user_email', email);
  localStorage.setItem('user_name', email.split('@')[0]);
  
  console.log('✅ Login successful as:', role);
  
  // Show main app
  showMainApp();
  setupMainApp();
}

// ============================================
// MAIN APP SETUP
// ============================================

function setupMainApp() {
  console.log('🚀 Setting up main app...');
  
  // Update header
  updateUserHeader();
  
  // Generate sidebar
  generateSidebarMenu();
  
  // Render home page
  renderPage('home');
  
  // Setup event listeners
  setupEventListeners();
}

// ============================================
// USER HEADER
// ============================================

function updateUserHeader() {
  const userName = localStorage.getItem('user_name') || 'User';
  const userRole = localStorage.getItem('user_role') || 'Player';
  
  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  
  if (userNameEl) userNameEl.textContent = userName;
  if (userRoleEl) userRoleEl.textContent = userRole.replace('_', ' ');
}

// ============================================
// SIDEBAR MENU GENERATION
// ============================================

function generateSidebarMenu() {
  const userRole = localStorage.getItem('user_role');
  const sidebarMenu = document.getElementById('sidebarMenu');
  
  if (!sidebarMenu) return;
  
  sidebarMenu.innerHTML = '';
  
  let menuItems = [];
  
  if (userRole === 'SUPER_ADMIN') {
    menuItems = [
      { page: 'home', label: 'Dashboard', icon: 'home' },
      { page: 'members', label: 'Members', icon: 'users' },
      { page: 'activities', label: 'Activities', icon: 'calendar' },
      { page: 'advertising', label: 'Advertising', icon: 'megaphone' },
      { page: 'logs', label: 'Logs', icon: 'history' }
    ];
  } else if (userRole === 'LEVEL_ADMIN') {
    menuItems = [
      { page: 'home', label: 'Dashboard', icon: 'home' },
      { page: 'attendance', label: 'Attendance', icon: 'check-circle' },
      { page: 'sessionControl', label: 'Sessions', icon: 'sliders-h' },
      { page: 'shuttle', label: 'Shuttle Stock', icon: 'badminton' },
      { page: 'reports', label: 'Reports', icon: 'chart-bar' }
    ];
  } else {
    menuItems = [
      { page: 'home', label: 'Home', icon: 'home' },
      { page: 'timetable', label: 'Timetable', icon: 'calendar-alt' },
      { page: 'attendance', label: 'Attendance', icon: 'check-circle' },
      { page: 'wallet', label: 'Wallet', icon: 'wallet' },
      { page: 'bazaar', label: 'BaZaar', icon: 'store' },
      { page: 'logs', label: 'Logs', icon: 'history' },
      { page: 'profile', label: 'Profile', icon: 'user-circle' }
    ];
  }
  
  menuItems.forEach(item => {
    const menuItem = document.createElement('a');
    menuItem.className = 'menu-item';
    menuItem.href = '#';
    menuItem.setAttribute('data-page', item.page);
    menuItem.innerHTML = `
      <i class="fas fa-${item.icon} menu-icon"></i>
      <span>${item.label}</span>
    `;
    
    menuItem.addEventListener('click', (e) => {
      e.preventDefault();
      renderPage(item.page);
    });
    
    sidebarMenu.appendChild(menuItem);
  });
}

// ============================================
// PAGE RENDERING
// ============================================

function renderPage(page) {
  console.log('📄 Rendering page:', page);
  
  const userRole = localStorage.getItem('user_role');
  const pageContent = document.getElementById('pageContent');
  
  if (!pageContent) {
    console.error('❌ pageContent element not found!');
    return;
  }
  
  let content = '';
  
  try {
    if (userRole === 'SUPER_ADMIN') {
      content = renderSuperAdminPage(page);
    } else if (userRole === 'LEVEL_ADMIN') {
      content = renderLevelAdminPage(page);
    } else {
      content = renderPlayerPage(page);
    }
    
    pageContent.innerHTML = content;
    updateActiveMenu(page);
    
    console.log('✅ Page rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering page:', error);
    pageContent.innerHTML = `<div class="card"><h2>Error Loading Page</h2><p>${error.message}</p></div>`;
  }
}

// ============================================
// SUPER ADMIN PAGES
// ============================================

function renderSuperAdminPage(page) {
  if (!adminViews) {
    throw new Error('adminViews not loaded');
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

// ============================================
// LEVEL ADMIN PAGES
// ============================================

function renderLevelAdminPage(page) {
  if (!flightAdminViews) {
    throw new Error('flightAdminViews not loaded');
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

// ============================================
// PLAYER PAGES
// ============================================

function renderPlayerPage(page) {
  if (!views) {
    throw new Error('views not loaded');
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
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', handleSignOut);
  }
}

// ============================================
// SIGN OUT
// ============================================

function handleSignOut() {
  if (confirm('Are you sure you want to sign out?')) {
    localStorage.removeItem('firebase_auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    location.reload();
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  
  if (!container) {
    console.error('Toast container not found');
    return;
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${getIconForType(type)}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function getIconForType(type) {
  const icons = {
    'success': 'check-circle',
    'error': 'exclamation-circle',
    'warning': 'exclamation-triangle',
    'info': 'info-circle'
  };
  return icons[type] || 'info-circle';
}

// ============================================
// GLOBAL APP CONTROLLER
// ============================================

window.appController = {
  renderPage,
  showNotification,
  navigate: (page) => renderPage(page)
};

console.log('✅ app.js loaded successfully');
