
// ============================================
// state.js - GLOBAL STATE MANAGEMENT
// ============================================

// ===== GLOBAL APP STATE =====
export const appState = {
  member: null,
  currentPage: 'home',
  language: 'en',
  theme: 'light'
};

// ===== STATE SETTERS =====
export function setPage(page) {
  appState.currentPage = page;
  emitEvent('indianclub:pagechange', page);
}

export function setLoading(isLoading) {
  const contentDiv = document.getElementById('content');
  if (isLoading) {
    contentDiv?.classList.add('loading');
  } else {
    contentDiv?.classList.remove('loading');
  }
}

export function setMember(member) {
  appState.member = member;
  emitEvent('indianclub:memberupdate', member);
}

export function setLanguage(lang) {
  appState.language = lang;
  localStorage.setItem('language', lang);
  emitEvent('indianclub:languagechange', lang);
}

// ===== EVENT SYSTEM =====
const eventListeners = {};

export function onEvent(eventName, callback) {
  if (!eventListeners[eventName]) {
    eventListeners[eventName] = [];
  }
  eventListeners[eventName].push(callback);
}

export function emitEvent(eventName, data) {
  if (eventListeners[eventName]) {
    eventListeners[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }
}

export function offEvent(eventName, callback) {
  if (eventListeners[eventName]) {
    eventListeners[eventName] = eventListeners[eventName].filter(cb => cb !== callback);
  }
}

// ===== INITIALIZATION =====
export function initializeState() {
  const savedLanguage = localStorage.getItem('language') || 'en';
  appState.language = savedLanguage;
  console.log('✅ state.js loaded successfully');
}

// Initialize on load
initializeState();

