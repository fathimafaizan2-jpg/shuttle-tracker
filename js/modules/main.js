
// ============================================
// main.js - Application Entry Point
// ============================================

import { adminViews } from './modules/adminViews.js';
import { flightAdminViews } from './modules/flightAdminViews.js';
import { views } from './modules/views.js';
import { router } from './modules/router.js';
import { auth } from './modules/auth.js';

// Global App Controller
window.appController = {
  currentUser: null,
  currentRole: null,

  init: () => {
    console.log('🚀 App Initializing...');
    auth.checkAuth();
    router.init();
  },

  navigate: (page) => {
    console.log(`📄 Navigating to: ${page}`);
    router.navigate(page);
  },

  showNotification: (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? '#00d4aa' : type === 'error' ? '#ff4757' : type === 'warning' ? '#ffa502' : '#667eea'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  window.appController.init();
});

console.log('✅ main.js loaded successfully');

