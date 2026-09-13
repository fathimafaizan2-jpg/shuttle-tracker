
// ============================================
// router.js - NAVIGATION & AUTHORIZATION
// ============================================

// ===== ROUTE DEFINITIONS =====
window.routes = {
  // Player Routes
  home: { path: '/home', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'], module: 'views' },
  timetable: { path: '/timetable', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'], module: 'views' },
  attendance: { path: '/attendance', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'], module: 'views' },
  wallet: { path: '/wallet', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'], module: 'views' },
  profile: { path: '/profile', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'], module: 'views' },
  logs: { path: '/logs', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'], module: 'views' },
  bazaar: { path: '/bazaar', roles: ['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'], module: 'views' },

  // Flight Admin Routes
  sessions: { path: '/sessions', roles: ['LEVEL_ADMIN', 'SUPER_ADMIN'], module: 'flightAdminViews' },
  stock: { path: '/stock', roles: ['LEVEL_ADMIN', 'SUPER_ADMIN'], module: 'flightAdminViews' },
  reports: { path: '/reports', roles: ['LEVEL_ADMIN', 'SUPER_ADMIN'], module: 'flightAdminViews' },
  'flight-finance': { path: '/flight-finance', roles: ['LEVEL_ADMIN', 'SUPER_ADMIN'], module: 'flightAdminViews' },

  // Super Admin Routes
  overview: { path: '/overview', roles: ['SUPER_ADMIN'], module: 'adminViews' },
  flights: { path: '/flights', roles: ['SUPER_ADMIN'], module: 'adminViews' },
  master: { path: '/master', roles: ['SUPER_ADMIN'], module: 'adminViews' },
  'admin-finance': { path: '/admin-finance', roles: ['SUPER_ADMIN'], module: 'adminViews' },
  ads: { path: '/ads', roles: ['SUPER_ADMIN'], module: 'adminViews' },
  audit: { path: '/audit', roles: ['SUPER_ADMIN'], module: 'adminViews' }
};

// ===== NAVIGATION HANDLER =====
window.navigateTo = function(page) {
  try {
    // Check if user is authenticated
    if (!window.appState.member) {
      showToast('Please login first', 'error');
      return;
    }

    // Get route definition
    const route = window.routes[page];
    if (!route) {
      console.error(`❌ Route not found: ${page}`);
      showToast(`Page not found: ${page}`, 'error');
      return;
    }

    // Check authorization
    const userRole = normalizeRole(window.appState.member.role);
    if (!route.roles.includes(userRole)) {
      console.warn(`❌ Unauthorized access attempt: ${userRole} tried to access ${page}`);
      showToast('You do not have permission to open this page.', 'error');
      logAudit('SECURITY', 'Unauthorized Access', page, `${userRole} attempted unauthorized access`);
      return;
    }

    // Get view module
    const moduleMap = {
      views: window.appModules?.views,
      flightAdminViews: window.appModules?.flightAdminViews,
      adminViews: window.appModules?.adminViews
    };

    const viewModule = moduleMap[route.module];
    if (!viewModule || !viewModule[page]) {
      console.error(`❌ View not found: ${route.module}.${page}`);
      showToast(`View not found: ${page}`, 'error');
      return;
    }

    // Render page
    const contentContainer = document.getElementById('content');
    if (!contentContainer) {
      console.error('❌ Content container not found');
      return;
    }

    try {
      setLoading(true);
      
      // Render the view
      const html = viewModule[page]();
      contentContainer.innerHTML = html;
      
      // Update state
      setPage(page);
      updateActiveNav(page);
      
      // Log navigation
      logActivity('NAVIGATION', `Navigated to ${page}`);
      
      console.log(`✅ Rendered page: ${page}`);
    } catch (error) {
      console.error(`❌ Error rendering page ${page}:`, error);
      contentContainer.innerHTML = `
        <div class="card">
          <h2>⚠️ Error Loading Page</h2>
          <p>${error.message}</p>
          <button class="btn btn-secondary" onclick="navigateTo('home')">Go Home</button>
        </div>
      `;
      showToast(`Error loading page: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  } catch (error) {
    console.error('Navigation error:', error);
    showToast('Navigation error', 'error');
  }
};

// ===== UPDATE ACTIVE NAVIGATION =====
window.updateActiveNav = function(page) {
  // Remove active class from all nav links
  document.querySelectorAll('[data-page]').forEach(link => {
    link.classList.remove('active');
  });

  // Add active class to current page link
  const activeLink = document.querySelector(`[data-page="${page}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  // Update page title
  const pageTitle = page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ');
  document.title = `${pageTitle} - Indian Club Bahrain`;
};

// ===== SETUP NAVIGATION LINKS =====
window.setupNavigation = function() {
  // Brand logo click
  const brandLogo = document.getElementById('brandLogo');
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('home');
    });
  }

  // Sidebar navigation links
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      navigateTo(page);
    });
  });

  // Language switcher
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const currentLang = window.appState.language;
      const newLang = currentLang === 'en' ? 'ar' : 'en';
      switchLanguage(newLang);
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }

  // Listen for state changes
  onEvent('indianclub:pagechange', (page) => {
    updateActiveNav(page);
  });

  console.log('✅ Navigation setup complete');
};

// ===== SHOW/HIDE NAVIGATION BASED ON ROLE =====
window.updateNavigationVisibility = function() {
  const role = normalizeRole(window.appState.member?.role);

  // Hide all role-specific navigation items
  document.querySelectorAll('.flight-only-nav').forEach(el => {
    el.classList.add('hidden');
  });
  document.querySelectorAll('.super-nav').forEach(el => {
    el.classList.add('hidden');
  });

  // Show based on role
  if (role === 'LEVEL_ADMIN') {
    document.querySelectorAll('.flight-only-nav').forEach(el => {
      el.classList.remove('hidden');
    });
  }

  if (role === 'SUPER_ADMIN') {
    document.querySelectorAll('.super-nav').forEach(el => {
      el.classList.remove('hidden');
    });
    document.querySelectorAll('.flight-only-nav').forEach(el => {
      el.classList.remove('hidden');
    });
  }

  console.log(`✅ Navigation visibility updated for role: ${role}`);
};

// ===== HANDLE BROWSER BACK/FORWARD =====
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.page) {
    navigateTo(event.state.page);
  }
});

// ===== INITIALIZE ROUTER =====
window.initializeRouter = function() {
  console.log('🚀 Initializing Router...');
  
  // Setup navigation
  setupNavigation();
  
  // Update navigation visibility
  updateNavigationVisibility();
  
  // Listen for member updates
  onEvent('indianclub:memberupdate', () => {
    updateNavigationVisibility();
  });
  
  console.log('✅ Router initialized');
};

// ===== ROUTE GUARD =====
window.canAccessRoute = function(page) {
  const route = window.routes[page];
  if (!route) return false;

  const userRole = normalizeRole(window.appState.member?.role);
  return route.roles.includes(userRole);
};

// ===== GET ALLOWED ROUTES FOR ROLE =====
window.getAllowedRoutes = function(role) {
  const normalized = normalizeRole(role);
  return Object.entries(window.routes)
    .filter(([_, route]) => route.roles.includes(normalized))
    .map(([page, _]) => page);
};

// ===== REDIRECT TO HOME IF UNAUTHORIZED =====
window.redirectIfUnauthorized = function(page) {
  if (!canAccessRoute(page)) {
    showToast('Unauthorized access', 'error');
    navigateTo('home');
    return false;
  }
  return true;
};

console.log('✅ router.js loaded successfully');

