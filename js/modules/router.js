
// ============================================
// router.js - NAVIGATION & AUTHORIZATION
// ============================================

// ===== ROLE NORMALIZATION =====
function normalizeRole(role) {
  if (['SUPERADMIN', 'SUPER_ADMIN', 'ADMIN'].includes(role)) {
    return 'SUPER_ADMIN';
  } else if (['LEVELADMIN', 'LEVEL_ADMIN', 'FLIGHT_ADMIN'].includes(role)) {
    return 'LEVEL_ADMIN';
  } else {
    return 'PLAYER';
  }
}

// ===== PAGE AUTHORIZATION =====
function canOpenPage(page, role) {
  const playerPages = ['home', 'timetable', 'attendance', 'wallet', 'bazaar', 'profile', 'logs'];
  const adminPages = ['sessions', 'stock', 'reports', 'flight-finance'];
  const superPages = ['overview', 'flights', 'master', 'admin-finance', 'ads', 'audit'];

  if (role === 'PLAYER') {
    return playerPages.includes(page);
  } else if (role === 'LEVEL_ADMIN') {
    return playerPages.includes(page) || adminPages.includes(page);
  } else if (role === 'SUPER_ADMIN') {
    return true;
  }

  return false;
}

// ===== NAVIGATE TO PAGE =====
window.navigateTo = function(page) {
  const role = normalizeRole(localStorage.getItem('userRole') || 'PLAYER');

  // Check authorization
  if (!canOpenPage(page, role)) {
    showNotification('You do not have permission to open this page.', 'error');
    return;
  }

  // Get appropriate view module
  let viewModule = null;
  if (page === 'home' || page === 'timetable' || page === 'attendance' || page === 'wallet' || page === 'bazaar' || page === 'profile' || page === 'logs') {
    viewModule = window.appModules.views;
  } else if (page === 'sessions' || page === 'stock' || page === 'reports' || page === 'flight-finance') {
    viewModule = window.appModules.flightAdminViews;
  } else if (page === 'overview' || page === 'flights' || page === 'master' || page === 'admin-finance' || page === 'ads' || page === 'audit') {
    viewModule = window.appModules.adminViews;
  }

  // Render page
  if (viewModule && viewModule[page]) {
    const content = document.getElementById('content');
    if (content) {
      try {
        content.innerHTML = viewModule[page]();
        console.log(`✅ Rendered page: ${page}`);
      } catch (error) {
        console.error(`❌ Error rendering page ${page}:`, error);
        content.innerHTML = `<div class="card"><h2>Error</h2><p>${error.message}</p></div>`;
      }
    }
  } else {
    console.error(`❌ Page not found: ${page}`);
  }
};

// ===== SHOW NOTIFICATION =====
window.showNotification = function(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#00d4aa' : '#0099ff'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

// ===== REQUIRE SUPER ADMIN =====
window.requireSuperAdmin = function() {
  const role = normalizeRole(localStorage.getItem('userRole') || 'PLAYER');
  if (role !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admin can access this module');
  }
};

// ===== REQUIRE LEVEL ADMIN =====
window.requireLevelAdmin = function() {
  const role = normalizeRole(localStorage.getItem('userRole') || 'PLAYER');
  if (role !== 'LEVEL_ADMIN' && role !== 'SUPER_ADMIN') {
    throw new Error('Only Flight Admin can access this module');
  }
};

console.log('✅ router.js loaded successfully');

