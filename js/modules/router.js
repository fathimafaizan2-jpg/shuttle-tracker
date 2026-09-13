
// ============================================
// router.js - ROUTING & NAVIGATION SYSTEM
// ============================================

// ===== ROUTE DEFINITIONS =====
const routes = {
  PLAYER: [
    'home', 'timetable', 'attendance', 'wallet', 'profile', 'bazaar', 'logs'
  ],
  LEVEL_ADMIN: [
    'home', 'timetable', 'attendance', 'wallet', 'profile', 'bazaar', 'logs',
    'sessions', 'stock', 'reports', 'flight-finance'
  ],
  SUPER_ADMIN: [
    'home', 'timetable', 'attendance', 'wallet', 'profile', 'bazaar', 'logs',
    'sessions', 'stock', 'reports', 'flight-finance',
    'overview', 'flights', 'master', 'admin-finance', 'ads', 'audit'
  ]
};

// ===== GET ALLOWED ROUTES =====
export function getAllowedRoutes(role) {
  const normalized = window.normalizeRole(role);
  return routes[normalized] || routes.PLAYER;
}

// ===== CHECK IF USER CAN ACCESS ROUTE =====
export function canAccessRoute(page, role) {
  const allowed = getAllowedRoutes(role);
  return allowed.includes(page);
}

// ===== REDIRECT IF UNAUTHORIZED =====
export function redirectIfUnauthorized(page, role) {
  if (!canAccessRoute(page, role)) {
    console.warn(`⚠️ Access denied to page: ${page}`);
    return 'home';
  }
  return page;
}

// ===== RENDER PAGE CONTENT =====
export function renderPage(page) {
  const member = window.appState?.member;
  if (!member) {
    return '<p>Please login first</p>';
  }

  const role = window.normalizeRole(member.role);
  
  // Check authorization
  if (!canAccessRoute(page, role)) {
    return `<div class="card"><h2>❌ Access Denied</h2><p>You don't have permission to access this page.</p></div>`;
  }

  // Render based on role
  let content = '';

  if (role === 'PLAYER') {
    if (window.views && window.views[page]) {
      content = window.views[page]();
    }
  } else if (role === 'LEVEL_ADMIN') {
    // Try flight admin views first
    if (window.flightAdminViews && window.flightAdminViews[page]) {
      content = window.flightAdminViews[page]();
    }
    // Fall back to player views
    else if (window.views && window.views[page]) {
      content = window.views[page]();
    }
  } else if (role === 'SUPER_ADMIN') {
    // Try super admin views first
    if (window.adminViews && window.adminViews[page]) {
      content = window.adminViews[page]();
    }
    // Fall back to flight admin views
    else if (window.flightAdminViews && window.flightAdminViews[page]) {
      content = window.flightAdminViews[page]();
    }
    // Fall back to player views
    else if (window.views && window.views[page]) {
      content = window.views[page]();
    }
  }

  if (!content) {
    content = `<div class="card"><h2>⚠️ Page Not Found</h2><p>The page "${page}" could not be found.</p></div>`;
  }

  return content;
}

// ===== NAVIGATE TO PAGE =====
export function navigateTo(page) {
  const member = window.appState?.member;
  if (!member) {
    console.warn('Not authenticated');
    return;
  }

  const role = window.normalizeRole(member.role);
  const safePage = redirectIfUnauthorized(page, role);

  // Update content
  const contentDiv = document.getElementById('content');
  if (contentDiv) {
    contentDiv.innerHTML = renderPage(safePage);
  }

  // Update active nav
  updateActiveNav(safePage);

  // Update page state
  if (window.setPage) {
    window.setPage(safePage);
  }

  console.log(`✅ Navigated to: ${safePage}`);
}

// ===== UPDATE ACTIVE NAVIGATION =====
export function updateActiveNav(page) {
  // Remove active from all nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Add active to current page
  const activeLink = document.querySelector(`[data-page="${page}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// ===== SETUP NAVIGATION LISTENERS =====
export function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      if (page) {
        navigateTo(page);
      }
    });
  });

  console.log('✅ Navigation setup complete');
}

// ===== UPDATE NAVIGATION VISIBILITY =====
export function updateNavigationVisibility() {
  const member = window.appState?.member;
  if (!member) return;

  const role = window.normalizeRole(member.role);
  const allowed = getAllowedRoutes(role);

  // Hide/show nav links based on role
  document.querySelectorAll('.nav-link').forEach(link => {
    const page = link.getAttribute('data-page');
    if (page && allowed.includes(page)) {
      link.classList.remove('hidden');
    } else {
      link.classList.add('hidden');
    }
  });

  // Hide/show nav sections based on role
  document.querySelectorAll('.flight-only-nav').forEach(el => {
    if (role === 'LEVEL_ADMIN' || role === 'SUPER_ADMIN') {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  document.querySelectorAll('.super-nav').forEach(el => {
    if (role === 'SUPER_ADMIN') {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  console.log(`✅ Navigation visibility updated for role: ${role}`);
}

// ===== INITIALIZE ROUTER =====
export function initializeRouter() {
  console.log('🚀 Initializing Router...');

  // Setup navigation listeners
  setupNavigation();

  // Update navigation visibility
  updateNavigationVisibility();

  // Navigate to home
  navigateTo('home');

  console.log('✅ Router initialized successfully');
}

console.log('✅ router.js loaded successfully');

