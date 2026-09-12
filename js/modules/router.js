
// ============================================
// router.js - Application Router
// ============================================

export const router = {
  currentPage: 'dashboard',

  init: () => {
    console.log('🔄 Router Initializing...');
    router.setupNavigation();
    router.navigate('dashboard');
  },

  navigate: (page) => {
    const contentDiv = document.getElementById('content');
    const userRole = localStorage.getItem('userRole') || 'player';

    console.log(`📍 Route: ${page} | Role: ${userRole}`);

    let html = '';

    if (userRole === 'superadmin') {
      switch(page) {
        case 'dashboard': html = window.adminViews.dashboard(); break;
        case 'members': html = window.adminViews.membersSection(); break;
        case 'timetable': html = window.adminViews.timetableSection(); break;
        case 'advertising': html = window.adminViews.advertisingSection(); break;
        case 'finance': html = window.adminViews.financeSection(); break;
        case 'audit': html = window.adminViews.auditSection(); break;
        default: html = window.adminViews.dashboard();
      }
    } else if (userRole === 'flightadmin') {
      switch(page) {
        case 'dashboard': html = window.flightAdminViews.dashboard(); break;
        case 'attendance': html = window.flightAdminViews.attendanceSection(); break;
        case 'sessionControl': html = window.flightAdminViews.sessionControlSection(); break;
        case 'shuttle': html = window.flightAdminViews.shuttleSection(); break;
        case 'reports': html = window.flightAdminViews.reportsSection(); break;
        default: html = window.flightAdminViews.dashboard();
      }
    } else {
      switch(page) {
        case 'home': html = window.views.home(); break;
        case 'timetable': html = window.views.timetable(); break;
        case 'attendance': html = window.views.attendance(); break;
        case 'wallet': html = window.views.wallet(); break;
        case 'bazaar': html = window.views.bazaar(); break;
        case 'logs': html = window.views.logs(); break;
        case 'profile': html = window.views.profile(); break;
        default: html = window.views.home();
      }
    }

    if (contentDiv) {
      contentDiv.innerHTML = html;
    }
    router.currentPage = page;
  },

  setupNavigation: () => {
    const userRole = localStorage.getItem('userRole') || 'player';
    const navDiv = document.getElementById('navigation');

    if (!navDiv) return;

    let navHTML = '';

    if (userRole === 'superadmin') {
      navHTML = `
        <nav style="background: #667eea; padding: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button onclick="appController.navigate('dashboard')" style="padding: 10px 15px; background: white; color: #667eea; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Dashboard</button>
          <button onclick="appController.navigate('members')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Members</button>
          <button onclick="appController.navigate('timetable')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Timetable</button>
          <button onclick="appController.navigate('advertising')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Advertising</button>
          <button onclick="appController.navigate('finance')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Finance</button>
          <button onclick="appController.navigate('audit')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Audit</button>
          <button onclick="appController.logout()" style="padding: 10px 15px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer; margin-left: auto;">Logout</button>
        </nav>
      `;
    } else if (userRole === 'flightadmin') {
      navHTML = `
        <nav style="background: #f5576c; padding: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button onclick="appController.navigate('dashboard')" style="padding: 10px 15px; background: white; color: #f5576c; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Dashboard</button>
          <button onclick="appController.navigate('attendance')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Attendance</button>
          <button onclick="appController.navigate('sessionControl')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Sessions</button>
          <button onclick="appController.navigate('shuttle')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Shuttle</button>
          <button onclick="appController.navigate('reports')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Reports</button>
          <button onclick="appController.logout()" style="padding: 10px 15px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer; margin-left: auto;">Logout</button>
        </nav>
      `;
    } else {
      navHTML = `
        <nav style="background: #00d4aa; padding: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button onclick="appController.navigate('home')" style="padding: 10px 15px; background: white; color: #00d4aa; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Home</button>
          <button onclick="appController.navigate('timetable')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Timetable</button>
          <button onclick="appController.navigate('attendance')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Attendance</button>
          <button onclick="appController.navigate('wallet')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Wallet</button>
          <button onclick="appController.navigate('bazaar')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">BaZaar</button>
          <button onclick="appController.navigate('logs')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Logs</button>
          <button onclick="appController.navigate('profile')" style="padding: 10px 15px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer;">Profile</button>
          <button onclick="appController.logout()" style="padding: 10px 15px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer; margin-left: auto;">Logout</button>
        </nav>
      `;
    }

    navDiv.innerHTML = navHTML;
  }
};

console.log('✅ router.js loaded successfully');

