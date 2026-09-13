
// ============================================
// main.js - APP INITIALIZATION
// ============================================

export function initializeApp() {
  console.log('🚀 Initializing Indian Club Bahrain App...');
  
  // Initialize mock data
  initializeMockData();
  
  // Setup event listeners
  setupEventListeners();
  
  console.log('✅ App initialized successfully');
}

// ===== INITIALIZE MOCK DATA =====
function initializeMockData() {
  // Initialize activities if not exists
  if (!localStorage.getItem('activities')) {
    const activities = [
      {
        id: 'badminton',
        name: 'Badminton',
        status: 'ACTIVE',
        flights: [
          { id: 'badminton_premier', name: 'Premier', displayOrder: 1 },
          { id: 'badminton_flight1', name: 'Flight 1', displayOrder: 2 },
          { id: 'badminton_flight2', name: 'Flight 2', displayOrder: 3 }
        ]
      },
      {
        id: 'cricket',
        name: 'Cricket',
        status: 'ACTIVE',
        flights: [
          { id: 'cricket_premier', name: 'Premier', displayOrder: 1 },
          { id: 'cricket_flight1', name: 'Flight 1', displayOrder: 2 }
        ]
      },
      {
        id: 'tennis',
        name: 'Tennis',
        status: 'ACTIVE',
        flights: [
          { id: 'tennis_premier', name: 'Premier', displayOrder: 1 },
          { id: 'tennis_flight1', name: 'Flight 1', displayOrder: 2 }
        ]
      }
    ];
    localStorage.setItem('activities', JSON.stringify(activities));
  }

  // Initialize test members if not exists
  if (!localStorage.getItem('members')) {
    const members = [
      {
        uid: 'player_001',
        email: 'ahmed@club.com',
        fullName: 'Ahmed Al-Mansouri',
        phone: '+973-3366-1234',
        role: 'PLAYER',
        flightId: 'badminton_premier',
        flightName: 'Badminton - Premier',
        status: 'ACTIVE',
        walletBalanceFils: 0,
        joinedAt: '2024-01-15',
        activatedAt: '2024-01-15'
      },
      {
        uid: 'admin_001',
        email: 'mohammed@club.com',
        fullName: 'Mohammed Al-Khalifa',
        phone: '+973-3366-5678',
        role: 'LEVEL_ADMIN',
        flightId: 'badminton_premier',
        flightName: 'Badminton - Premier',
        status: 'ACTIVE',
        walletBalanceFils: 0,
        joinedAt: '2024-01-10',
        activatedAt: '2024-01-10'
      },
      {
        uid: 'super_001',
        email: 'fathima@club.com',
        fullName: 'Fathima Al-Dosari',
        phone: '+973-3366-9999',
        role: 'SUPER_ADMIN',
        flightId: 'badminton_premier',
        flightName: 'Badminton - Premier',
        status: 'ACTIVE',
        walletBalanceFils: 0,
        joinedAt: '2024-01-01',
        activatedAt: '2024-01-01'
      }
    ];
    localStorage.setItem('members', JSON.stringify(members));
  }

  // Initialize other data structures
  if (!localStorage.getItem('flightSessions')) {
    localStorage.setItem('flightSessions', JSON.stringify([]));
  }

  if (!localStorage.getItem('attendance')) {
    localStorage.setItem('attendance', JSON.stringify([]));
  }

  if (!localStorage.getItem('transactions')) {
    localStorage.setItem('transactions', JSON.stringify([]));
  }

  if (!localStorage.getItem('masterTimetable')) {
    localStorage.setItem('masterTimetable', JSON.stringify([]));
  }

  if (!localStorage.getItem('auditLogs')) {
    localStorage.setItem('auditLogs', JSON.stringify([]));
  }

  if (!localStorage.getItem('activityLogs')) {
    localStorage.setItem('activityLogs', JSON.stringify([]));
  }

  if (!localStorage.getItem('businesses')) {
    localStorage.setItem('businesses', JSON.stringify([]));
  }

  if (!localStorage.getItem('pendingPayments')) {
    localStorage.setItem('pendingPayments', JSON.stringify([]));
  }

  console.log('✅ Mock data initialized');
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.handleLogout) {
        window.handleLogout();
      }
    });
  }

  // Language toggle
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      if (window.switchLanguage) {
        window.switchLanguage(window.appState?.language === 'en' ? 'ar' : 'en');
      }
    });
  }

  // Brand logo click
  const brandLogo = document.getElementById('brandLogo');
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.navigateTo) {
        window.navigateTo('home');
      }
    });
  }

  console.log('✅ Event listeners setup complete');
}

// ===== EXPORT FUNCTIONS =====
export function navigateTo(page) {
  if (window.navigateTo) {
    window.navigateTo(page);
  }
}

export function showToast(message, type) {
  if (window.showToast) {
    window.showToast(message, type);
  }
}

// ===== INITIALIZE ON LOAD =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

console.log('✅ main.js loaded successfully');

