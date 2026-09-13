
// ============================================
// main.js - APP INITIALIZATION & DATA LOGIC
// ============================================

import { views } from './views.js';
import { flightAdminViews } from './flightAdminViews.js';
import { adminViews } from './adminViews.js';

// ===== INITIALIZE APP =====
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing Indian Club App...');
  
  // Initialize mock data if not exists
  initializeMockData();
  
  // Setup event listeners
  setupEventListeners();
  
  // Check authentication
  checkAuthentication();
  
  console.log('✅ App initialized successfully');
});

// ===== INITIALIZE MOCK DATA =====
function initializeMockData() {
  // Initialize Activities
  if (!localStorage.getItem('activities')) {
    const activities = [
      {
        id: 'badminton',
        name: 'Badminton',
        status: 'ACTIVE',
        displayOrder: 1,
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
        displayOrder: 2,
        flights: [
          { id: 'cricket_premier', name: 'Premier', displayOrder: 1 },
          { id: 'cricket_flight1', name: 'Flight 1', displayOrder: 2 }
        ]
      },
      {
        id: 'tennis',
        name: 'Tennis',
        status: 'ACTIVE',
        displayOrder: 3,
        flights: [
          { id: 'tennis_premier', name: 'Premier', displayOrder: 1 }
        ]
      }
    ];
    localStorage.setItem('activities', JSON.stringify(activities));
  }

  // Initialize Members
  if (!localStorage.getItem('members')) {
    const members = [
      {
        uid: 'member_001',
        name: 'Ahmed Al-Mansouri',
        email: 'ahmed@club.com',
        phone: '+973-1234-5678',
        role: 'PLAYER',
        flight: 'badminton_premier',
        status: 'ACTIVE',
        balance: 50.500,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        uid: 'member_002',
        name: 'Fatima Al-Dosari',
        email: 'fatima@club.com',
        phone: '+973-2345-6789',
        role: 'PLAYER',
        flight: 'badminton_flight1',
        status: 'ACTIVE',
        balance: -25.750,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        uid: 'member_003',
        name: 'Mohammed Al-Khalifa',
        email: 'mohammed@club.com',
        phone: '+973-3456-7890',
        role: 'LEVEL_ADMIN',
        flight: 'badminton_premier',
        status: 'ACTIVE',
        balance: 100.000,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        uid: 'member_004',
        name: 'Layla Al-Shehri',
        email: 'layla@club.com',
        phone: '+973-4567-8901',
        role: 'PLAYER',
        flight: 'cricket_premier',
        status: 'ACTIVE',
        balance: 15.250,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        uid: 'member_005',
        name: 'Khalid Al-Otaibi',
        email: 'khalid@club.com',
        phone: '+973-5678-9012',
        role: 'PLAYER',
        flight: 'tennis_premier',
        status: 'ACTIVE',
        balance: -50.000,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('members', JSON.stringify(members));
  }

  // Initialize Sessions
  if (!localStorage.getItem('sessions')) {
    const sessions = [
      {
        id: 'session_001',
        flight: 'Badminton - Premier',
        date: new Date().toLocaleDateString(),
        startTime: '06:00',
        endTime: '07:30',
        status: 'SCHEDULED',
        courts: 'Courts 1 & 2'
      },
      {
        id: 'session_002',
        flight: 'Badminton - Flight 1',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        startTime: '07:30',
        endTime: '09:00',
        status: 'SCHEDULED',
        courts: 'Courts 1 & 2'
      },
      {
        id: 'session_003',
        flight: 'Cricket - Premier',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        startTime: '06:00',
        endTime: '08:00',
        status: 'COMPLETED',
        courts: 'Field 1'
      }
    ];
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }

  // Initialize Attendance
  if (!localStorage.getItem('attendance')) {
    const attendance = [
      { sessionId: 'session_001', name: 'Ahmed Al-Mansouri', memberId: 'member_001', status: 'PRESENT' },
      { sessionId: 'session_001', name: 'Fatima Al-Dosari', memberId: 'member_002', status: 'PRESENT' },
      { sessionId: 'session_001', name: 'Mohammed Al-Khalifa', memberId: 'member_003', status: 'PRESENT' }
    ];
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }

  // Initialize Wallet & Transactions
  if (!localStorage.getItem('walletBalance')) {
    localStorage.setItem('walletBalance', '150.500');
  }

  if (!localStorage.getItem('transactions')) {
    const transactions = [
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        description: 'Session Charge - Badminton',
        amount: 5.000,
        status: 'PAID'
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        description: 'Manual Credit',
        amount: 50.000,
        status: 'PAID'
      },
      {
        date: new Date().toLocaleDateString(),
        description: 'Payment via Benefit Pay',
        amount: 100.000,
        status: 'PENDING_VERIFICATION'
      }
    ];
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  // Initialize Arrears (charges older than 24 hours)
  if (!localStorage.getItem('arrears')) {
    const arrears = [
      {
        id: 'arrear_001',
        amount: 25.750,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        description: 'Session Charge - Cricket'
      },
      {
        id: 'arrear_002',
        amount: 10.000,
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        description: 'Session Charge - Tennis'
      }
    ];
    localStorage.setItem('arrears', JSON.stringify(arrears));
    localStorage.setItem('arrears', JSON.stringify(arrears));
    localStorage.setItem('pendingAmount', '35.750');
  }

  // Initialize Timetable
  if (!localStorage.getItem('timetable')) {
    const timetable = [
      { day: 'Monday', flight: 'Badminton - Premier', startTime: '06:00', endTime: '07:30', courts: 'Courts 1 & 2' },
      { day: 'Tuesday', flight: 'Badminton - Flight 1', startTime: '07:30', endTime: '09:00', courts: 'Courts 1 & 2' },
      { day: 'Wednesday', flight: 'Cricket - Premier', startTime: '06:00', endTime: '08:00', courts: 'Field 1' },
      { day: 'Thursday', flight: 'Tennis - Premier', startTime: '05:30', endTime: '07:00', courts: 'Courts 3 & 4' },
      { day: 'Friday', flight: 'Badminton - Premier', startTime: '06:00', endTime: '07:30', courts: 'Courts 1 & 2' },
      { day: 'Saturday', flight: 'Cricket - Premier', startTime: '07:00', endTime: '09:00', courts: 'Field 1' }
    ];
    localStorage.setItem('timetable', JSON.stringify(timetable));
  }

  // Initialize Flight Stock
  if (!localStorage.getItem('flightStock')) {
    const stock = {
      availableTubes: 150,
      tubePrice: 0.500,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('flightStock', JSON.stringify(stock));
  }

  // Initialize Flight Sessions
  if (!localStorage.getItem('flightSessions')) {
    const flightSessions = [
      {
        id: 'fsession_001',
        flight: 'Badminton - Premier',
        date: new Date().toLocaleDateString(),
        startTime: '06:00',
        endTime: '07:30',
        status: 'SCHEDULED',
        presentPlayers: JSON.stringify([
          { uid: 'member_001', name: 'Ahmed Al-Mansouri' },
          { uid: 'member_002', name: 'Fatima Al-Dosari' }
        ]),
        tubePrice: 0.500
      }
    ];
    localStorage.setItem('flightSessions', JSON.stringify(flightSessions));
  }

  // Initialize Businesses (BaZaar)
  if (!localStorage.getItem('businesses')) {
    const businesses = [
      {
        id: 'biz_001',
        name: 'Al-Noor Restaurant',
        category: 'FOOD',
        offer: '15% Club Discount',
        link: 'https://alnoor.bh',
        address: 'Manama, Bahrain',
        status: 'APPROVED'
      },
      {
        id: 'biz_002',
        name: 'Sports Gear Store',
        category: 'SPORTS',
        offer: '20% Off Badminton Equipment',
        link: 'https://sportsgear.bh',
        address: 'Seef, Bahrain',
        status: 'APPROVED'
      }
    ];
    localStorage.setItem('businesses', JSON.stringify(businesses));
  }

  // Initialize Audit Logs
  if (!localStorage.getItem('auditLogs')) {
    const auditLogs = [
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
        category: 'ATTENDANCE',
        action: 'Marked Present',
        target: 'Session 001',
        details: 'Ahmed Al-Mansouri marked present',
        actor: 'System'
      },
      {
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString(),
        category: 'WALLET',
        action: 'Payment Verified',
        target: 'Fatima Al-Dosari',
        details: 'Payment of 100 BHD verified',
        actor: 'Mohammed Al-Khalifa'
      },
      {
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString(),
        category: 'MEMBER',
        action: 'Member Created',
        target: 'Khalid Al-Otaibi',
        details: 'New member registered',
        actor: 'System'
      }
    ];
    localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
  }

  // Initialize Activity Logs
  if (!localStorage.getItem('activityLogs')) {
    const activityLogs = [
      {
        timestamp: new Date().toLocaleString(),
        action: 'Login',
        details: 'User logged in'
      },
      {
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toLocaleString(),
        action: 'Viewed Wallet',
        details: 'Checked wallet balance'
      },
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
        action: 'Marked Attendance',
        details: 'Marked present for session'
      }
    ];
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
  }

  // Initialize Pending Payments
  if (!localStorage.getItem('pendingPayments')) {
    const pendingPayments = [
      {
        id: 'payment_001',
        playerName: 'Layla Al-Shehri',
        amount: 100.000,
        method: 'BENEFIT_PAY',
        reference: 'BEN123456',
        date: new Date().toLocaleDateString(),
        status: 'PENDING_VERIFICATION'
      }
    ];
    localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
  }

  // Initialize Club Wallet
  if (!localStorage.getItem('clubWallet')) {
    const clubWallet = {
      total: 5250.750,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('clubWallet', JSON.stringify(clubWallet));
  }

  // Initialize Master Timetable
  if (!localStorage.getItem('masterTimetable')) {
    const masterTimetable = [
      { id: 'slot_001', day: 'Monday', flight: 'Badminton - Premier', startTime: '06:00', endTime: '07:30', courts: 'Courts 1 & 2' },
      { id: 'slot_002', day: 'Tuesday', flight: 'Badminton - Flight 1', startTime: '07:30', endTime: '09:00', courts: 'Courts 1 & 2' },
      { id: 'slot_003', day: 'Wednesday', flight: 'Cricket - Premier', startTime: '06:00', endTime: '08:00', courts: 'Field 1' }
    ];
    localStorage.setItem('masterTimetable', JSON.stringify(masterTimetable));
  }

  console.log('✅ Mock data initialized');
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
  // Navigation
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
      e.preventDefault();
      const page = e.target.getAttribute('onclick')?.match(/navigateTo\('([^']+)'\)/)?.[1];
      if (page) {
        updateActiveNav(e.target);
      }
    }
  });
}

// ===== UPDATE ACTIVE NAV =====
function updateActiveNav(element) {
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  element.classList.add('active');
}

// ===== CHECK AUTHENTICATION =====
function checkAuthentication() {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');
  const email = localStorage.getItem('userEmail');

  if (token && role && email) {
    console.log('✅ User authenticated:', email, role);
  } else {
    console.log('⚠️ User not authenticated');
  }
}

// ===== EXPORT MODULES =====
window.appModules = {
  views,
  flightAdminViews,
  adminViews
};

console.log('✅ main.js loaded successfully');

