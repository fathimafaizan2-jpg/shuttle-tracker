
// ============================================
// utils.js - UTILITY FUNCTIONS & HELPERS
// ============================================

// ===== CURRENCY CONVERSIONS =====
window.bhdToFils = function(bhdAmount) {
  return Math.round(parseFloat(bhdAmount) * 1000);
};

window.filsToBhd = function(filsAmount) {
  return (filsAmount / 1000).toFixed(3);
};

window.formatBHD = function(filsAmount) {
  return filsToBhd(filsAmount) + ' BHD';
};

// ===== COST SPLIT CALCULATION =====
window.calculateCostSplit = function(shuttlesUsed, tubePriceFils, presentCount) {
  if (presentCount === 0) throw new Error('No players present');
  
  const costPerShuttleFils = Math.round(tubePriceFils / 12);
  const totalGameCostFils = Math.ceil(shuttlesUsed * costPerShuttleFils);
  const perPlayerShareFils = Math.ceil(totalGameCostFils / presentCount);
  
  return {
    costPerShuttleFils,
    totalGameCostFils,
    perPlayerShareFils,
    totalGameCostBHD: filsToBhd(totalGameCostFils),
    perPlayerShareBHD: filsToBhd(perPlayerShareFils)
  };
};

// ===== ARREARS CALCULATION =====
window.calculateArrears = function(charges) {
  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  
  return charges
    .filter(charge => new Date(charge.createdAt).getTime() < twentyFourHoursAgo)
    .reduce((sum, charge) => sum + charge.amountFils, 0);
};

// ===== ATTENDANCE FILTERING =====
window.filterPresentPlayers = function(attendance, sessionId) {
  return attendance.filter(a => a.sessionId === sessionId && a.status === 'PRESENT');
};

// ===== DATE FORMATTING =====
window.formatDate = function(dateString) {
  return new Date(dateString).toLocaleDateString();
};

window.formatDateTime = function(dateString) {
  return new Date(dateString).toLocaleString();
};

window.formatTime = function(timeString) {
  return timeString; // Already in HH:MM format
};

// ===== FLIGHT NAME FORMATTING =====
window.formatLevelName = function(flightId) {
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  for (const activity of activities) {
    const flight = activity.flights?.find(f => f.id === flightId);
    if (flight) return `${activity.name} - ${flight.name}`;
  }
  return 'Unknown Flight';
};

// ===== PHONE SANITIZATION =====
window.sanitizePhone = function(phone) {
  return phone.replace(/\D/g, '');
};

// ===== WHATSAPP LINK GENERATOR =====
window.generateWhatsAppLink = function(phone, message) {
  const sanitized = sanitizePhone(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${sanitized}?text=${encoded}`;
};

// ===== TOAST NOTIFICATIONS =====
window.showToast = function(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#00d4aa' : type === 'warning' ? '#ffa502' : '#0099ff'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 9999;
    animation: slideIn 0.3s ease;
    font-weight: 600;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// ===== CONFIRMATION DIALOG =====
window.showConfirm = function(message) {
  return confirm(message);
};

// ===== LOADING STATE =====
window.setLoading = function(isLoading) {
  window.appState.loading = isLoading;
  fireEvent('indianclub:loading', isLoading);
};

// ===== CSV VALIDATION =====
window.validateCSV = function(csvText, expectedColumns) {
  const lines = csvText.trim().split('\n');
  const errors = [];
  
  lines.forEach((line, index) => {
    const columns = line.split(',').map(col => col.trim());
    if (columns.length !== expectedColumns) {
      errors.push(`Row ${index + 1}: Expected ${expectedColumns} columns, got ${columns.length}`);
    }
  });
  
  return { valid: errors.length === 0, errors };
};

// ===== IMAGE VALIDATION =====
window.validateImage = function(file) {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2 MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PNG, JPEG, and WebP images are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 2 MB' };
  }
  
  return { valid: true };
};

// ===== PRINT FUNCTIONALITY =====
window.printTable = function(tableId, title) {
  const table = document.getElementById(tableId);
  if (!table) {
    showToast('Table not found', 'error');
    return;
  }
  
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<style>');
  printWindow.document.write('body { font-family: Arial, sans-serif; }');
  printWindow.document.write('table { border-collapse: collapse; width: 100%; }');
  printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
  printWindow.document.write('th { background-color: #667eea; color: white; }');
  printWindow.document.write('</style></head><body>');
  printWindow.document.write('<h2>' + title + '</h2>');
  printWindow.document.write(table.outerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
};

// ===== DEBOUNCE FUNCTION =====
window.debounce = function(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ===== DEEP CLONE =====
window.deepClone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

console.log('✅ utils.js loaded successfully');

