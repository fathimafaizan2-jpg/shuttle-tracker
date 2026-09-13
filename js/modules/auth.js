
// ============================================
// auth.js - AUTHENTICATION & SESSION MANAGEMENT
// ============================================

// ===== LOGIN HANDLER =====
window.handleLogin = async function(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const errorEl = document.getElementById('errorMessage');

  try {
    errorEl.textContent = '';

    if (!email || !password) {
      throw new Error('Please enter email and password');
    }

    // Normalize role
    let normalizedRole = role;
    if (['SUPERADMIN', 'SUPER_ADMIN', 'ADMIN'].includes(role)) {
      normalizedRole = 'SUPER_ADMIN';
    } else if (['LEVELADMIN', 'LEVEL_ADMIN', 'FLIGHT_ADMIN'].includes(role)) {
      normalizedRole = 'LEVEL_ADMIN';
    } else {
      normalizedRole = 'PLAYER';
    }

    // Simulate authentication
    const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Store session
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRole', normalizedRole);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', email.split('@')[0]);
    localStorage.setItem('loginTime', new Date().toISOString());

    console.log('✅ Login successful! Role:', normalizedRole);

    // Update UI
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('memberName').textContent = email.split('@')[0];
    document.getElementById('roleLabel').textContent = normalizedRole;

    // Show/hide nav items based on role
    updateNavigation();

    // Log activity
    logActivity('LOGIN', `User logged in as ${normalizedRole}`);

    // Navigate to home
    setTimeout(() => {
      navigateTo('home');
    }, 100);

  } catch (error) {
    errorEl.textContent = error.message;
    console.error('Login error:', error);
  }
};

// ===== LOGOUT HANDLER =====
window.handleLogout = function() {
  if (confirm('Are you sure you want to logout?')) {
    const email = localStorage.getItem('userEmail');
    
    // Log activity
    logActivity('LOGOUT', `User logged out`);

    // Clear session
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('loginTime');

    // Reset UI
    document.getElementById('app').style.display = 'none';
    document.getElementById('login').style.display = 'block';

    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('errorMessage').textContent = '';

    console.log('✅ Logout successful');
  }
};

// ===== UPDATE NAVIGATION =====
window.updateNavigation = function() {
  const role = localStorage.getItem('userRole') || 'PLAYER';

  // Hide all role-specific items
  document.querySelectorAll('.flight-only-nav').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.super-nav').forEach(el => el.classList.add('hidden'));

  // Show based on role
  if (role === 'LEVEL_ADMIN') {
    document.querySelectorAll('.flight-only-nav').forEach(el => el.classList.remove('hidden'));
  }
  if (role === 'SUPER_ADMIN') {
    document.querySelectorAll('.super-nav').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.flight-only-nav').forEach(el => el.classList.remove('hidden'));
  }
};

// ===== SWITCH LANGUAGE =====
window.switchLanguage = function(lang) {
  localStorage.setItem('language', lang);
  console.log('Language switched to:', lang);
  // TODO: Implement language switching
};

// ===== LOG ACTIVITY =====
function logActivity(action, details) {
  const activityLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  activityLogs.push({
    timestamp: new Date().toLocaleString(),
    action,
    details
  });
  localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
}

// ===== LOG AUDIT =====
window.logAudit = function(category, action, target, details) {
  const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
  auditLogs.push({
    timestamp: new Date().toLocaleString(),
    category,
    action,
    target,
    details,
    actor: localStorage.getItem('userName') || 'System'
  });
  localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
};

// ===== CHECK SESSION =====
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');
  const email = localStorage.getItem('userEmail');

  if (token && role && email) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('memberName').textContent = email.split('@')[0];
    document.getElementById('roleLabel').textContent = role;

    updateNavigation();
    navigateTo('home');
  }
});

console.log('✅ auth.js loaded successfully');

