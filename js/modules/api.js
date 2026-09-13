
// ============================================
// api.js - COMPLETE API MOCK SYSTEM
// ============================================

// ===== MOCK MEMBERS DATABASE =====
const mockMembers = {
  'player@club.com': {
    id: 'player_001',
    email: 'player@club.com',
    fullName: 'Ahmed Al-Mansouri',
    phone: '+973 3366 1234',
    role: 'PLAYER',
    flightId: 'premier',
    active: true,
    walletBalanceFils: 50000,
    sessionsAttended: 12,
    pendingAmount: 150,
    arrears: 50
  },
  'admin@club.com': {
    id: 'admin_001',
    email: 'admin@club.com',
    fullName: 'Mohammed Al-Khalifa',
    phone: '+973 3366 5678',
    role: 'LEVEL_ADMIN',
    flightId: 'premier',
    active: true,
    walletBalanceFils: 100000,
    sessionsAttended: 24,
    pendingAmount: 0,
    arrears: 0
  },
  'superadmin@club.com': {
    id: 'superadmin_001',
    email: 'superadmin@club.com',
    fullName: 'Fathima Al-Dosari',
    phone: '+973 3366 9999',
    role: 'SUPER_ADMIN',
    flightId: 'all',
    active: true,
    walletBalanceFils: 500000,
    sessionsAttended: 48,
    pendingAmount: 0,
    arrears: 0
  }
};

// ===== MOCK PRE-REGISTERED MEMBERS (For activation) =====
const mockPreRegistered = {
  'Ahmed Al-Mansouri': {
    phone: '+973 3366 1234',
    email: 'player@club.com',
    role: 'PLAYER',
    flightId: 'premier'
  },
  'Mohammed Al-Khalifa': {
    phone: '+973 3366 5678',
    email: 'admin@club.com',
    role: 'LEVEL_ADMIN',
    flightId: 'premier'
  },
  'Fathima Al-Dosari': {
    phone: '+973 3366 9999',
    email: 'superadmin@club.com',
    role: 'SUPER_ADMIN',
    flightId: 'all'
  }
};

// ===== API OBJECT =====
export const api = {
  // ===== LOGIN =====
  login: async function(email, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const member = mockMembers[email];
        
        if (!member || password !== 'password123') {
          resolve({
            success: false,
            message: 'Invalid email or password'
          });
          return;
        }

        resolve({
          success: true,
          token: `token_${Date.now()}`,
          member: member
        });
      }, 500);
    });
  },

  // ===== GET MEMBER DETAILS =====
  getMemberDetails: async function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          resolve({ success: false });
          return;
        }

        // Get member from stored data
        const memberData = sessionStorage.getItem('memberData');
        if (memberData) {
          resolve({
            success: true,
            member: JSON.parse(memberData)
          });
        } else {
          resolve({ success: false });
        }
      }, 300);
    });
  },

  // ===== ACTIVATE ACCOUNT =====
  activateAccount: async function(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { fullName, phone, password } = data;
        const preReg = mockPreRegistered[fullName];

        if (!preReg || preReg.phone !== phone) {
          resolve({
            success: false,
            message: 'Name and phone do not match our records'
          });
          return;
        }

        // Create new member
        const newMember = {
          id: `member_${Date.now()}`,
          email: preReg.email,
          fullName: fullName,
          phone: phone,
          role: preReg.role,
          flightId: preReg.flightId,
          active: true,
          walletBalanceFils: 0,
          sessionsAttended: 0,
          pendingAmount: 0,
          arrears: 0
        };

        // Add to mock database
        mockMembers[preReg.email] = newMember;

        resolve({
          success: true,
          message: 'Account activated successfully',
          member: newMember
        });
      }, 500);
    });
  },

  // ===== GET SESSIONS =====
  getSessions: async function(flightId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          sessions: [
            {
              id: 'session_001',
              day: 'MONDAY',
              startTime: '06:00',
              endTime: '07:30',
              activity: 'Badminton',
              flight: flightId,
              status: 'SCHEDULED',
              presentCount: 18,
              totalCost: 500,
              perPlayerCost: 167
            },
            {
              id: 'session_002',
              day: 'WEDNESDAY',
              startTime: '06:00',
              endTime: '07:30',
              activity: 'Badminton',
              flight: flightId,
              status: 'SCHEDULED',
              presentCount: 0,
              totalCost: 0,
              perPlayerCost: 0
            }
          ]
        });
      }, 300);
    });
  },

  // ===== GET ATTENDANCE =====
  getAttendance: async function(sessionId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          attendance: [
            { memberId: 'member_001', name: 'Ahmed Al-Mansouri', status: 'PRESENT', timeIn: '05:55' },
            { memberId: 'member_002', name: 'Fatima Hassan', status: 'PRESENT', timeIn: '06:00' },
            { memberId: 'member_003', name: 'Mohammed Ali', status: 'PRESENT', timeIn: '06:05' },
            { memberId: 'member_004', name: 'Sara Ahmed', status: 'ABSENT', timeIn: null }
          ]
        });
      }, 300);
    });
  },

  // ===== SUBMIT PAYMENT =====
  submitPayment: async function(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Payment submitted for verification',
          paymentId: `payment_${Date.now()}`
        });
      }, 500);
    });
  },

  // ===== VERIFY PAYMENT =====
  verifyPayment: async function(paymentId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Payment verified and added to wallet'
        });
      }, 500);
    });
  },

  // ===== GET WALLET BALANCE =====
  getWalletBalance: async function(memberId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          balanceFils: 50000,
          balanceBHD: 50.000
        });
      }, 300);
    });
  },

  // ===== GET TIMETABLE =====
  getTimetable: async function(flightId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          timetable: [
            { day: 'MONDAY', startTime: '06:00', endTime: '07:30', activity: 'Badminton', level: 'Premier', court: 'Court 1' },
            { day: 'WEDNESDAY', startTime: '06:00', endTime: '07:30', activity: 'Badminton', level: 'Premier', court: 'Court 1' },
            { day: 'FRIDAY', startTime: '06:00', endTime: '07:30', activity: 'Badminton', level: 'Premier', court: 'Court 1' },
            { day: 'SATURDAY', startTime: '07:00', endTime: '08:30', activity: 'Cricket', level: 'Premier', court: 'Ground A' }
          ]
        });
      }, 300);
    });
  },

  // ===== GET MEMBERS =====
  getMembers: async function(flightId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          members: [
            { id: 'member_001', name: 'Ahmed Al-Mansouri', phone: '+973 3366 1234', role: 'PLAYER', status: 'ACTIVE' },
            { id: 'member_002', name: 'Fatima Hassan', phone: '+973 3366 5678', role: 'PLAYER', status: 'ACTIVE' },
            { id: 'member_003', name: 'Mohammed Ali', phone: '+973 3366 9012', role: 'PLAYER', status: 'ACTIVE' }
          ]
        });
      }, 300);
    });
  },

  // ===== CREATE MEMBER =====
  createMember: async function(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Member created successfully',
          memberId: `member_${Date.now()}`
        });
      }, 500);
    });
  },

  // ===== GET STOCK =====
  getStock: async function(flightId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          stock: {
            shuttles: 150,
            good: 120,
            repair: 20,
            damaged: 10,
            tubePrice: 3000
          }
        });
      }, 300);
    });
  },

  // ===== UPDATE STOCK =====
  updateStock: async function(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Stock updated successfully'
        });
      }, 500);
    });
  },

  // ===== GET REPORTS =====
  getReports: async function(flightId, reportType) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          report: {
            type: reportType,
            flightId: flightId,
            generatedAt: new Date().toISOString(),
            data: []
          }
        });
      }, 300);
    });
  },

  // ===== GET ACTIVITIES =====
  getActivities: async function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          activities: [
            { id: 'badminton', name: 'Badminton', status: 'ACTIVE', flights: 3, members: 68 },
            { id: 'cricket', name: 'Cricket', status: 'ACTIVE', flights: 2, members: 52 },
            { id: 'tennis', name: 'Tennis', status: 'ACTIVE', flights: 2, members: 36 }
          ]
        });
      }, 300);
    });
  },

  // ===== GET FLIGHTS =====
  getFlights: async function(activityId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          flights: [
            { id: 'premier', name: 'Premier', activity: activityId, members: 24, admin: 'Ahmed Al-Mansouri' },
            { id: 'flight1', name: 'Flight 1', activity: activityId, members: 22, admin: 'Mohammed Al-Khalifa' },
            { id: 'flight2', name: 'Flight 2', activity: activityId, members: 20, admin: 'Fatima Hassan' }
          ]
        });
      }, 300);
    });
  },

  // ===== GET AUDIT LOGS =====
  getAuditLogs: async function(filters) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          logs: [
            { timestamp: new Date().toISOString(), user: 'Fathima Al-Dosari', category: 'LOGIN', action: 'User Login', status: 'SUCCESS' },
            { timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Mohammed Al-Khalifa', category: 'MEMBER', action: 'Member Added', status: 'SUCCESS' }
          ]
        });
      }, 300);
    });
  },

  // ===== GET ADS =====
  getAds: async function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          ads: [
            { id: 'ad_001', business: 'Al-Noor Restaurant', category: 'Food & Dining', offer: '20% Discount', status: 'ACTIVE' },
            { id: 'ad_002', business: 'Fitness Plus Gym', category: 'Health & Fitness', offer: 'Free Trial', status: 'ACTIVE' }
          ]
        });
      }, 300);
    });
  }
};

// ===== MAKE API GLOBAL =====
window.api = api;

console.log('✅ api.js loaded successfully');

