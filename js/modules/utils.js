
// ============================================
// utils.js - UTILITY FUNCTIONS
// ============================================

// ===== CURRENCY CONVERSION =====
export function bhdToFils(bhdAmount) {
  return Math.round(bhdAmount * 1000);
}

export function filsToBhd(filsAmount) {
  return (filsAmount / 1000).toFixed(3);
}

// ===== ROLE NORMALIZATION =====
export function normalizeRole(role) {
  if (!role) return 'PLAYER';
  const normalized = role.toUpperCase().trim();
  if (normalized === 'SUPER_ADMIN' || normalized === 'SUPERADMIN') return 'SUPER_ADMIN';
  if (normalized === 'LEVEL_ADMIN' || normalized === 'LEVELADMIN' || normalized === 'FLIGHT_ADMIN') return 'LEVEL_ADMIN';
  return 'PLAYER';
}

// ===== STATE MANAGEMENT =====
export function setState(key, value) {
  if (window.appState) {
    window.appState[key] = value;
    if (window.emitEvent) {
      window.emitEvent('indianclub:statechange', { key, value });
    }
  }
}

export function getState(key) {
  return window.appState ? window.appState[key] : null;
}

// ===== DATE & TIME FORMATTING =====
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString) {
  if (!timeString) return '-';
  return timeString;
}

// ===== LEVEL NAME FORMATTING =====
export function formatLevelName(flightId) {
  if (!flightId) return 'Unknown';
  
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  
  for (const activity of activities) {
    if (activity.flights) {
      const flight = activity.flights.find(f => f.id === flightId);
      if (flight) {
        return `${activity.name} - ${flight.name}`;
      }
    }
  }
  
  return flightId;
}

// ===== VALIDATION =====
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePhone(phone) {
  const regex = /^[\d\s\-\+\(\)]+$/;
  return regex.test(phone) && phone.length >= 7;
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validateCSV(csvText, expectedColumns) {
  const lines = csvText.trim().split('\n').filter(line => line.trim());
  const errors = [];
  
  if (lines.length === 0) {
    errors.push('CSV is empty');
    return { valid: false, errors };
  }
  
  lines.forEach((line, index) => {
    const columns = line.split(',').map(col => col.trim());
    if (columns.length !== expectedColumns) {
      errors.push(`Line ${index + 1}: Expected ${expectedColumns} columns, got ${columns.length}`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

export function validateImage(file) {
  const maxSize = 2 * 1024 * 1024; // 2MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be less than 2MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PNG, JPEG, and WebP images are allowed' };
  }
  
  return { valid: true };
}

// ===== NOTIFICATIONS =====
export function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 9999;
    animation: slideIn 0.3s ease;
    max-width: 400px;
  `;
  
  // Set colors based on type
  const colors = {
    success: { bg: '#d4edda', text: '#155724', icon: '✓' },
    error: { bg: '#f8d7da', text: '#721c24', icon: '✕' },
    warning: { bg: '#fff3cd', text: '#856404', icon: '⚠' },
    info: { bg: '#d1ecf1', text: '#0c5460', icon: 'ℹ' }
  };
  
  const color = colors[type] || colors.info;
  toast.style.background = color.bg;
  toast.style.color = color.text;
  toast.innerHTML = `${color.icon} ${message}`;
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function showConfirm(message) {
  return confirm(message);
}

// ===== LOGGING =====
export function logActivity(action, details) {
  const log = {
    timestamp: new Date().toISOString(),
    action,
    details,
    memberUid: window.appState?.member?.uid || 'unknown'
  };
  
  const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
  logs.push(log);
  localStorage.setItem('activityLogs', JSON.stringify(logs));
}

export function logAudit(category, action, target, details) {
  const log = {
    timestamp: new Date().toISOString(),
    category,
    action,
    target,
    details,
    actor: window.appState?.member?.fullName || 'System'
  };
  
  const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
  logs.push(log);
  localStorage.setItem('auditLogs', JSON.stringify(logs));
}

// ===== AUTHORIZATION =====
export function requireSuperAdmin() {
  const role = normalizeRole(window.appState?.member?.role);
  if (role !== 'SUPER_ADMIN') {
    throw new Error('Super Admin access required');
  }
}

export function requireLevelAdmin() {
  const role = normalizeRole(window.appState?.member?.role);
  if (role !== 'LEVEL_ADMIN' && role !== 'SUPER_ADMIN') {
    throw new Error('Flight Admin access required');
  }
}

export function requirePlayer() {
  const role = normalizeRole(window.appState?.member?.role);
  if (!['PLAYER', 'LEVEL_ADMIN', 'SUPER_ADMIN'].includes(role)) {
    throw new Error('Player access required');
  }
}

// ===== UI HELPERS =====
export function updateUserUI() {
  const member = window.appState?.member;
  if (!member) return;
  
  // Update avatar
  const avatar = document.getElementById('memberAvatar');
  if (avatar) {
    const initials = member.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    avatar.textContent = initials;
  }
  
  // Update name
  const nameEl = document.getElementById('memberName');
  if (nameEl) nameEl.textContent = member.fullName;
  
  // Update role
  const roleEl = document.getElementById('sideRole');
  if (roleEl) roleEl.textContent = member.flightName || 'All activities';
  
  // Update role badge
  const roleLabel = document.getElementById('roleLabel');
  if (roleLabel) {
    const role = normalizeRole(member.role);
    roleLabel.textContent = role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : role === 'LEVEL_ADMIN' ? 'FLIGHT ADMIN' : 'PLAYER';
  }
}

export function handleLogout() {
  if (!showConfirm('Are you sure you want to logout?')) return;
  
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('currentMember');
  window.appState.member = null;
  
  document.getElementById('login').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  
  showToast('Logged out successfully', 'success');
}

// ===== PRINTING =====
export function printTable(tableId, title) {
  const table = document.getElementById(tableId);
  if (!table) {
    showToast('Table not found', 'error');
    return;
  }
  
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h2>' + title + '</h2>');
  printWindow.document.write(table.outerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

// ===== WHATSAPP LINK GENERATOR =====
export function generateWhatsAppLink(phone, message) {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMessage}`;
}

// ===== SWITCH LANGUAGE =====
export function switchLanguage(lang) {
  setState('language', lang);
  showToast(`Language switched to ${lang === 'en' ? 'English' : 'العربية'}`, 'success');
}

console.log('✅ utils.js loaded successfully');

