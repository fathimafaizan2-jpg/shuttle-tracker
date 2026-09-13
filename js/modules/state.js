
// ============================================
// state.js - GLOBAL STATE MANAGEMENT
// ============================================

// Global application state
window.appState = {
  // User & Authentication
  member: null, // { uid, email, fullName, phone, role, flightId, flightName, walletBalanceFils, status }
  authToken: null,
  
  // Current Page
  page: 'home',
  language: localStorage.getItem('indian_club_language') || 'en',
  
  // Data Collections
  activities: [],
  members: [],
  sessions: [],
  attendance: [],
  timetable: [],
  transactions: [],
  auditLogs: [],
  businesses: [],
  
  // Flight Admin Data
  flightSessions: [],
  flightStock: { tubePriceFils: 500, availableTubes: 150 },
  
  // Super Admin Data
  masterTimetable: [],
  pendingAds: [],
  publishedAds: [],
  carouselLimit: 10,
  
  // UI State
  loading: false,
  error: null,
  notifications: []
};

// ===== STATE GETTERS =====
window.getState = function() {
  return window.appState;
};

window.setState = function(updates) {
  window.appState = { ...window.appState, ...updates };
  fireEvent('indianclub:statechange', window.appState);
};

window.updateMember = function(updates) {
  window.appState.member = { ...window.appState.member, ...updates };
  fireEvent('indianclub:memberupdate', window.appState.member);
};

window.setPage = function(page) {
  window.appState.page = page;
  fireEvent('indianclub:pagechange', page);
};

// ===== ROLE NORMALIZATION =====
window.normalizeRole = function(role) {
  if (!role) return 'PLAYER';
  const normalized = role.toUpperCase().replace(/-/g, '_');
  if (['SUPERADMIN', 'SUPER_ADMIN', 'ADMIN'].includes(normalized)) {
    return 'SUPER_ADMIN';
  } else if (['LEVELADMIN', 'LEVEL_ADMIN', 'FLIGHT_ADMIN'].includes(normalized)) {
    return 'LEVEL_ADMIN';
  }
  return 'PLAYER';
};

// ===== AUTHORIZATION CHECKS =====
window.canOpenPage = function(page, role) {
  const normalized = normalizeRole(role);
  
  const playerPages = ['home', 'timetable', 'attendance', 'wallet', 'bazaar', 'profile', 'logs'];
  const adminPages = ['sessions', 'stock', 'reports', 'flight-finance'];
  const superPages = ['overview', 'flights', 'master', 'admin-finance', 'ads', 'audit'];
  
  if (normalized === 'PLAYER') return playerPages.includes(page);
  if (normalized === 'LEVEL_ADMIN') return playerPages.includes(page) || adminPages.includes(page);
  if (normalized === 'SUPER_ADMIN') return true;
  
  return false;
};

window.requireSuperAdmin = function() {
  const role = normalizeRole(window.appState.member?.role);
  if (role !== 'SUPER_ADMIN') {
    throw new Error('Only Super Admin can access this module');
  }
};

window.requireLevelAdmin = function() {
  const role = normalizeRole(window.appState.member?.role);
  if (role !== 'LEVEL_ADMIN' && role !== 'SUPER_ADMIN') {
    throw new Error('Only Flight Admin can access this module');
  }
};

// ===== EVENT SYSTEM =====
window.fireEvent = function(eventName, detail) {
  const event = new CustomEvent(eventName, { detail });
  document.dispatchEvent(event);
};

window.onEvent = function(eventName, callback) {
  document.addEventListener(eventName, (e) => callback(e.detail));
};

// ===== LOGGING =====
window.logActivity = function(action, details) {
  const log = {
    timestamp: new Date().toLocaleString(),
    action,
    details,
    actor: window.appState.member?.fullName || 'System'
  };
  
  const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  logs.push(log);
  localStorage.setItem('activityLogs', JSON.stringify(logs));
};

window.logAudit = function(category, action, target, details) {
  const log = {
    timestamp: new Date().toLocaleString(),
    category,
    action,
    target,
    details,
    actor: window.appState.member?.fullName || 'System'
  };
  
  const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
  logs.push(log);
  localStorage.setItem('auditLogs', JSON.stringify(logs));
};

console.log('✅ state.js loaded successfully');

