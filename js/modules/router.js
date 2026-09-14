
// ============================================
// router.js - COMPLETE ROUTING & NAVIGATION
// ============================================

// ===== ROUTE DEFINITIONS =====
const routes = {
  // PLAYER ROUTES
  'home': { view: 'views', page: 'home', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'timetable': { view: 'views', page: 'timetable', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'attendance': { view: 'views', page: 'attendance', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'wallet': { view: 'views', page: 'wallet', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'profile': { view: 'views', page: 'profile', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'bazaar': { view: 'views', page: 'bazaar', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'logs': { view: 'views', page: 'logs', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'] },

  // FLIGHT ADMIN ROUTES
  'sessions': { view: 'flightAdminViews', page: 'sessions', roles: ['LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'stock': { view: 'flightAdminViews', page: 'stock', roles: ['LEVEL_ADMIN', 'SUPER_ADMIN'] },
  'reports': { view: 'flightAdminViews', page: 'reports', roles: ['LEVEL_ADMIN', 'SUPER_ADMIN'] },

  // SUPER ADMIN ROUTES
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
    { label: '🏠 Home', route: 'home', icon: 'home' },
    { label: '📅 Timetable', route: 'timetable', icon: 'calendar' },
    { label: '✓ Attendance', route: 'attendance', icon: 'check' },
    { label: '💰 Wallet', route: 'wallet', icon: 'wallet' },
    { label: '👤 Profile', route: 'profile', icon: 'user' },
    { label: '🛍️ BaZaar', route: 'bazaar', icon: 'shopping' },
    { label: '📜 Logs', route: 'logs', icon: 'list' }
  ],
  LEVEL_ADMIN: [
    { label: '🏠 Home', route: 'home', icon: 'home' },
    { label: '📅 Timetable', route: 'timetable', icon: 'calendar' },
    { label: '✓ Attendance', route: 'attendance', icon: 'check' },
    { label: '💰 Wallet', route: 'wallet', icon: 'wallet' },
    { label: '👤 Profile', route: 'profile', icon: 'user' },
    { label: '🛍️ BaZaar', route: 'bazaar', icon: 'shopping' },
    { label: '📜 Logs', route: 'logs', icon: 'list' },
    { label: '---', separator: true },
    { label: '📅 Session Control', route: 'sessions', icon: 'control' },
    { label: '📦 Shuttle Stock', route: 'stock', icon: 'package' },
    { label: '📊 Reports', route: 'reports', icon: 'chart' }
  ],
  SUPER_ADMIN: [
    { label: '🏠 Home', route: 'home', icon: 'home' },
    { label: '📅 Timetable', route: 'timetable', icon: 'calendar' },
    { label: '✓ Attendance', route: 'attendance', icon: 'check' },
    { label: '💰 Wallet', route: 'wallet', icon: 'wallet' },
    { label: '👤 Profile', route: 'profile', icon: 'user' },
    { label: '🛍️ BaZaar', route: 'bazaar', icon: 'shopping' },
    { label: '📜 Logs', route: 'logs', icon: 'list' },
    { label: '---', separator: true },
    { label: '📅 Session Control', route: 'sessions', icon: 'control' },
    { label: '📦 Shuttle Stock', route: 'stock', icon: 'package' },
    { label: '📊 Reports', route: 'reports', icon: 'chart' },
    { label: '---', separator: true },
    { label: '📊 Club Overview', route: 'overview', icon: 'dashboard' },
    { label: '✈️ Flights & Members', route: 'flights', icon: 'flight' },
    { label: '📅 Master Timetable', route: 'master', icon: 'calendar-master' },
    { label: '💼 Executive Finance', route: 'finance', icon: 'finance' },
    { label: '📢 Ads & Notices', route: 'ads', icon: 'megaphone' },
    { label: '🔍 Audit Log', route: 'audit', icon: 'audit' }
  ]
};

// ===== INITIALIZE ROUTER =====
window.initializeRouter = function() {
  console.log('🔄 Initializing router...');

  // Check authentication
  if (!window.appState?.isAuthenticated) {
    console.warn('⚠️ Not authenticated, redirecting to login');
    document.getElementById('app').style.display = 'none';
    document.getElementById('login').style.display = 'flex';
    return;
  }

  // Build navigation menu
  window.buildNavigation();

  // Load default home page
  window.navigateTo('home');

  console.log('✅ Router initialized');
};

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

  // Check if route exists
  const route = routes[routeName];
  if (!route) {
    console.error('❌ Route not found:', routeName);
    window.showNotification('❌ Page not found: ' + routeName, 'error');
    return;
  }

  // Check authentication
  if (!window.appState?.isAuthenticated) {
    console.warn('⚠️ Not authenticated');
    window.showNotification('❌ Please login first', 'error');
    return;
  }

  // Check role authorization
  const userRole = window.appState?.role;
  if (!route.roles.includes(userRole)) {
    console.error('❌ Unauthorized access:', routeName, 'for role:', userRole);
    window.showNotification('❌ You do not have permission to access this page', 'error');
    return;
  }

  try {
    // Get the view module
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

    // Get the page renderer
    const pageRenderer = viewModule[route.page];
    if (!pageRenderer) {
      throw new Error(`Page not found: ${route.page}`);
    }

    // Show loading state
    const contentArea = document.getElementById('pageContent');
    if (contentArea) {
      contentArea.innerHTML = '<div style="text-align: center; padding: 40px;"><p>⏳ Loading...</p></div>';
    }

    // Render the page
    console.log('📄 Rendering page:', route.page);
    const pageHTML = await pageRenderer();

    // Update content area
    if (contentArea) {
      contentArea.innerHTML = pageHTML;
    }

    // Update app state
    window.appState.currentPage = routeName;

    // Update active nav item
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

  // Auto-remove after 5 seconds
  setTimeout(() => {
    const element = document.getElementById(notificationId);
    if (element) {
      element.style.animation = 'slideOut 0.3s ease-in-out';
      setTimeout(() => element.remove(), 300);
    }
  }, 5000);
};

// ===== REQUIRE SUPER ADMIN =====
window.requireSuperAdmin = function() {
  if (window.appState?.role !== 'SUPER_ADMIN') {
    console.error('❌ Super Admin access required');
    window.showNotification('❌ Super Admin access required', 'error');
    return false;
  }
  return true;
};

// ===== REQUIRE FLIGHT ADMIN =====
window.requireFlightAdmin = function() {
  const role = window.appState?.role;
  if (role !== 'LEVEL_ADMIN' && role !== 'SUPER_ADMIN') {
    console.error('❌ Flight Admin access required');
    window.showNotification('❌ Flight Admin access required', 'error');
    return false;
  }
  return true;
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

// ===== SET STATE =====
window.setState = function(updates) {
  window.appState = {
    ...window.appState,
    ...updates
  };
  console.log('📝 State updated:', updates);
};

// ===== GET STATE =====
window.getState = function() {
  return window.appState;
};

// ===== LOGOUT =====
window.logout = function() {
  if (confirm('Are you sure you want to logout?')) {
    console.log('🚪 Logging out...');

    // Clear session storage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('memberData');

    // Reset app state
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
      currentPage: null
    };

    // Show login page
    document.getElementById('app').style.display = 'none';
    document.getElementById('login').style.display = 'flex';

    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('activateForm').reset();
    document.getElementById('errorMessage').textContent = '';
    document.getElementById('errorMessage').style.display = 'none';

    console.log('✅ Logged out successfully');
  }
};

// ===== HANDLE ROUTE CHANGES =====
window.addEventListener('hashchange', function() {
  const hash = window.location.hash.slice(1) || 'home';
  window.navigateTo(hash);
});

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

console.log('✅ router.js loaded successfully');

