
// ============================================
// main.js - APP INITIALIZATION & SETUP
// ============================================

// ===== INITIALIZE APP ON PAGE LOAD =====
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing Indian Club Bahrain App...');
  
  // Initialize mock data
  initializeMockData();
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup navigation
  setupNavigation();
  
  // Check authentication
  checkAuthentication();
  
  console.log('✅ App initialized successfully');
});

// ===== INITIALIZE MOCK DATA =====
function initializeMockData() {
  // Activities
  if (!localStorage.getItem('activities')) {
    const activities = [
      {
        id: 'badminton',
        name: 'Badminton',
        status: 'ACTIVE',
        displayOrder: 1,
        flights: [
          { id: 'badminton_premier', name: 'Premier', displayOrder: 1 },
          { id: 'badminton_flight1', name: 'Flight 1', displayOrder: 2 }
        ]
      },
      {
        id: 'cricket',
        name: 'Cricket',
        status: 'ACTIVE',
        displayOrder: 2,
        flights: [
          { id: 'cricket_premier', name: 'Premier', displayOrder: 1 }
        ]
      }
    ];
    localStorage.setItem('activities', JSON.stringify(activities));
  }

  // Members
  if (!localStorage.getItem('members')) {
    const members = [
      {
        uid: 'player_001',
        fullName: 'Ahmed Al-Mansouri',
        email: 'ahmed@club.com',
        phone: '+973-1234-5678',
        role: 'PLAYER',
        flightId: 'badminton_premier',
        flightName: 'Badminton - Premier',
        status: 'ACTIVE',
        walletBalanceFils: 50500,
        createdAt: new Date().toISOString()
      },
      {
        uid: 'admin_001',
        fullName: 'Mohammed Al-Khalifa',
        email: 'mohammed@club.com',
        phone: '+973-3456-7890',
        role: 'LEVEL_ADMIN',
        flightId: 'badminton_premier',
        flightName: 'Badminton - Premier',
        status: 'ACTIVE',
        walletBalanceFils: 100000,
        createdAt: new Date().toISOString()
      },
      {
        uid: 'super_001',
        fullName: 'Fathima Faiz',
        email: 'fathima@club.com',
        phone: '+973-9876-5432',
        role: 'SUPER_ADMIN',
        flightId: null,
        flightName: 'All activities',
        status: 'ACTIVE',
        walletBalanceFils: 500000,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('members', JSON.stringify(members));
  }

  // Flight Sessions
  if (!localStorage.getItem('flightSessions')) {
    const sessions = [
      {
        id: 'session_001',
        flightId: 'badminton_premier',
        date: new Date().toLocaleDateString(),
        startTime: '06:00',
        endTime: '07:30',
        status: 'SCHEDULED',
        courts: 'Courts 1 & 2'
      }
    ];
    localStorage.setItem('flightSessions', JSON.stringify(sessions));
  }

  // Flight Stock
  if (!localStorage.getItem('flightStock')) {
    const stock = {
      tubePriceFils: 500,
      availableTubes: 150
    };
    localStorage.setItem('flightStock', JSON.stringify(stock));
  }

  // Timetable
  if (!localStorage.getItem('timetable')) {
    const timetable = [
      { flightId: 'badminton_premier', day: 'Monday', startTime: '06:00', endTime: '07:30', courts: 'Courts 1 & 2' },
      { flightId: 'badminton_premier', day: 'Wednesday', startTime: '06:00', endTime: '07:30', courts: 'Courts 1 & 2' },
      { flightId: 'badminton_premier', day: 'Friday', startTime: '06:00', endTime: '07:30', courts: 'Courts 1 & 2' }
    ];
    localStorage.setItem('timetable', JSON.stringify(timetable));
  }

  console.log('✅ Mock data initialized');
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
  // Brand logo click
  const brandLogo = document.getElementById('brandLogo');
  if (brandLogo) {
    brandLogo.addEventListener('click', () => navigateTo('home'));
  }

  // Sidebar nav links
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      navigateTo(page);
    });
  });

  // Listen for state changes
  onEvent('indianclub:pagechange', (page) => {
    updateActiveNav(page);
  });
}

// ===== SETUP NAVIGATION =====
function setupNavigation() {
  window.navigateTo = function(page) {
    const role = normalizeRole(window.appState.member?.role);

    // Check authorization
    if (!canOpenPage(page, role)) {
      showToast('You do not have permission to open this page.', 'error');
      return;
    }

    // Get appropriate view module
    let viewModule = null;
    if (['home', 'timetable', 'attendance', 'wallet', 'bazaar', 'profile', 'logs'].includes(page)) {
      viewModule = window.appModules.views;
    } else if (['sessions', 'stock', 'reports', 'flight-finance'].includes(page)) {
      viewModule = window.appModules.flightAdminViews;
    } else if (['overview', 'flights', 'master', 'admin-finance', 'ads', 'audit'].includes(page)) {
      viewModule = window.appModules.adminViews;
    }

    // Render page
    if (viewModule && viewModule[page]) {
      const content = document.getElementById('content');
      if (content) {
        try {
          setLoading(true);
          content.innerHTML = viewModule[page]();
          setPage(page);
          updateActiveNav(page);
          console.log(`✅ Rendered page: ${page}`);
        } catch (error) {
          console.error(`❌ Error rendering page ${page}:`, error);
          content.innerHTML = `<div class="card"><h2>Error</h2><p>${error.message}</p></div>`;
          showToast(`Error loading page: ${error.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    } else {
      console.error(`❌ Page not found: ${page}`);
      showToast(`Page not found: ${page}`, 'error');
    }
  };
}

// ===== UPDATE ACTIVE NAV =====
function updateActiveNav(page) {
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ===== CHECK AUTHENTICATION =====
function checkAuthentication() {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    document.getElementById('login').style.display = 'block';
    document.getElementById('app').style.display = 'none';
  }
}

console.log('✅ main.js loaded successfully');

