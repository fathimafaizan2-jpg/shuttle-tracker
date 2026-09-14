
// ============================================
// api.js - COMPLETE API INTEGRATION LAYER
// ============================================

// ===== API BASE CONFIGURATION =====
const API_BASE_URL = 'https://indian-club-bahrain.firebaseapp.com/api';
const FIREBASE_STORAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/indian-club-bahrain.appspot.com/o';

// ===== MOCK DATA FOR DEVELOPMENT =====
const mockMembers = {
  'member_001': {
    id: 'member_001',
    email: 'ahmed@example.com',
    fullName: 'Ahmed Al-Mansouri',
    phone: '+973 3366 1234',
    role: 'PLAYER',
    flightId: 'Premier',
    active: true,
    memberSince: '2024-01-15',
    walletBalanceFils: 50000,
    sessionsAttended: 12,
    pendingAmount: 0,
    arrears: 0,
    profilePic: null
  },
  'member_002': {
    id: 'member_002',
    email: 'fatima@example.com',
    fullName: 'Fatima Hassan',
    phone: '+973 3366 5678',
    role: 'LEVEL_ADMIN',
    flightId: 'Flight 1',
    active: true,
    memberSince: '2023-06-20',
    walletBalanceFils: 75000,
    sessionsAttended: 18,
    pendingAmount: 0,
    arrears: 0,
    profilePic: null
  },
  'member_003': {
    id: 'member_003',
    email: 'admin@example.com',
    fullName: 'Mohammed Ali',
    phone: '+973 3366 9012',
    role: 'SUPER_ADMIN',
    flightId: 'Premier',
    active: true,
    memberSince: '2022-03-10',
    walletBalanceFils: 100000,
    sessionsAttended: 25,
    pendingAmount: 0,
    arrears: 0,
    profilePic: null
  }
};

// ===== AUTHENTICATION API =====
export const api = {
  // LOGIN
  login: async function(email, password) {
    console.log('📡 API: login -', email);
    
    try {
      // Mock authentication - replace with real Firebase call
      const member = Object.values(mockMembers).find(m => m.email === email);
      
      if (!member) {
        return {
          success: false,
          message: 'Email not found. Please check your email or activate your account.'
        };
      }

      if (!member.active) {
        return {
          success: false,
          message: 'Account not activated. Please activate your account first.'
        };
      }

      // Generate mock token
      const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // Log activity
      await this.logActivity({
        category: 'MEMBER',
        event: 'Login',
        memberId: member.id,
        memberName: member.fullName,
        details: 'Successful login'
      });

      return {
        success: true,
        message: 'Login successful',
        token: token,
        member: member
      };

    } catch (error) {
      console.error('❌ API Error (login):', error);
      return {
        success: false,
        message: 'Login failed: ' + error.message
      };
    }
  },

  // ACTIVATE ACCOUNT
  activateAccount: async function(data) {
    console.log('📡 API: activateAccount -', data.fullName);
    
    try {
      // Mock activation - replace with real Firebase call
      const member = Object.values(mockMembers).find(m => 
        m.fullName === data.fullName && m.phone === data.phone
      );

      if (!member) {
        return {
          success: false,
          message: 'Member not found. Please check your name and phone number.'
        };
      }

      // Update member
      member.active = true;
      member.password = data.password; // In real app, hash this!

      // Log activity
      await this.logActivity({
        category: 'MEMBER',
        event: 'Account Activated',
        memberId: member.id,
        memberName: member.fullName,
        details: 'Account activated successfully'
      });

      return {
        success: true,
        message: 'Account activated successfully',
        member: member
      };

    } catch (error) {
      console.error('❌ API Error (activateAccount):', error);
      return {
        success: false,
        message: 'Activation failed: ' + error.message
      };
    }
  },

  // VERIFY TOKEN
  verifyToken: async function(token) {
    console.log('📡 API: verifyToken');
    
    try {
      // Mock token verification
      if (token && token.startsWith('token_')) {
        return { success: true, message: 'Token valid' };
      }
      return { success: false, message: 'Token invalid' };
    } catch (error) {
      console.error('❌ API Error (verifyToken):', error);
      return { success: false, message: error.message };
    }
  },

  // REFRESH TOKEN
  refreshToken: async function(token) {
    console.log('📡 API: refreshToken');
    
    try {
      const newToken = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      return { success: true, token: newToken };
    } catch (error) {
      console.error('❌ API Error (refreshToken):', error);
      return { success: false, message: error.message };
    }
  },

  // CHANGE PASSWORD
  changePassword: async function(data) {
    console.log('📡 API: changePassword');
    
    try {
      const member = window.appState?.member;
      if (!member) {
        return { success: false, message: 'Member not found' };
      }

      // In real app, verify current password
      member.password = data.newPassword;

      await this.logActivity({
        category: 'MEMBER',
        event: 'Password Changed',
        memberId: member.id,
        memberName: member.fullName,
        details: 'Password changed successfully'
      });

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('❌ API Error (changePassword):', error);
      return { success: false, message: error.message };
    }
  },

  // FORGOT PASSWORD
  forgotPassword: async function(email) {
    console.log('📡 API: forgotPassword -', email);
    
    try {
      const member = Object.values(mockMembers).find(m => m.email === email);
      if (!member) {
        return { success: false, message: 'Email not found' };
      }

      // In real app, send email with reset link
      console.log('📧 Password reset email would be sent to:', email);

      await this.logActivity({
        category: 'MEMBER',
        event: 'Password Reset Requested',
        memberId: member.id,
        memberName: member.fullName,
        details: 'Password reset email sent'
      });

      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('❌ API Error (forgotPassword):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== PLAYER DATA API =====

  // GET ATTENDANCE
  getAttendance: async function(memberId) {
    console.log('📡 API: getAttendance -', memberId);
    
    try {
      return {
        success: true,
        attendance: [
          { id: 'att_001', status: 'PRESENT', date: '2026-09-14', timeIn: '06:00' },
          { id: 'att_002', status: 'PRESENT', date: '2026-09-12', timeIn: '06:05' },
          { id: 'att_003', status: 'ABSENT', date: '2026-09-10', timeIn: null }
        ]
      };
    } catch (error) {
      console.error('❌ API Error (getAttendance):', error);
      return { success: false, message: error.message };
    }
  },

  // GET SESSIONS
  getSessions: async function(flightId) {
    console.log('📡 API: getSessions -', flightId);
    
    try {
      return {
        success: true,
        sessions: [
          {
            id: 'session_001',
            activity: 'Badminton',
            flight: flightId,
            day: 'Monday',
            startTime: '06:00',
            endTime: '07:00',
            status: 'SCHEDULED',
            presentCount: 3,
            totalCost: 500
          },
          {
            id: 'session_002',
            activity: 'Badminton',
            flight: flightId,
            day: 'Wednesday',
            startTime: '18:00',
            endTime: '19:00',
            status: 'SCHEDULED',
            presentCount: 4,
            totalCost: 667
          }
        ]
      };
    } catch (error) {
      console.error('❌ API Error (getSessions):', error);
      return { success: false, message: error.message };
    }
  },

  // GET TIMETABLE
  getTimetable: async function(flightId) {
    console.log('📡 API: getTimetable -', flightId);
    
    try {
      return {
        success: true,
        timetable: [
          { day: 'Monday', level: flightId, startTime: '06:00', endTime: '07:00', activity: 'Badminton', court: 'Court 1' },
          { day: 'Wednesday', level: flightId, startTime: '18:00', endTime: '19:00', activity: 'Badminton', court: 'Court 2' },
          { day: 'Friday', level: flightId, startTime: '19:00', endTime: '20:00', activity: 'Badminton', court: 'Court 1' }
        ]
      };
    } catch (error) {
      console.error('❌ API Error (getTimetable):', error);
      return { success: false, message: error.message };
    }
  },

  // RESPOND TO SESSION
  respondToSession: async function(sessionId, status) {
    console.log('📡 API: respondToSession -', sessionId, status);
    
    try {
      const member = window.appState?.member;
      
      await this.logActivity({
        category: 'ATTENDANCE',
        event: 'Session Response',
        memberId: member.id,
        memberName: member.fullName,
        details: `Responded: ${status}`
      });

      return { success: true, message: 'Response recorded' };
    } catch (error) {
      console.error('❌ API Error (respondToSession):', error);
      return { success: false, message: error.message };
    }
  },

  // SUBMIT PAYMENT
  submitPayment: async function(data) {
    console.log('📡 API: submitPayment -', data);
    
    try {
      const member = window.appState?.member;
      
      await this.logActivity({
        category: 'WALLET',
        event: 'Payment Submitted',
        memberId: member.id,
        memberName: member.fullName,
        details: `${data.method}: BHD ${(data.amountFils / 1000).toFixed(3)}`
      });

      return { success: true, message: 'Payment submitted for verification' };
    } catch (error) {
      console.error('❌ API Error (submitPayment):', error);
      return { success: false, message: error.message };
    }
  },

  // SUBMIT BAZAAR ITEM
  submitBazaarItem: async function(data) {
    console.log('📡 API: submitBazaarItem -', data.title);
    
    try {
      const member = window.appState?.member;
      
      await this.logActivity({
        category: 'BAZAAR',
        event: 'Item Posted',
        memberId: member.id,
        memberName: member.fullName,
        details: `${data.title} - BHD ${data.priceBHD.toFixed(3)}`
      });

      return { success: true, message: 'Item posted successfully' };
    } catch (error) {
      console.error('❌ API Error (submitBazaarItem):', error);
      return { success: false, message: error.message };
    }
  },

  // UPLOAD PROFILE PICTURE
  uploadProfilePic: async function(file) {
    console.log('📡 API: uploadProfilePic -', file.name);
    
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { success: false, message: 'Only image files allowed' };
      }

      if (file.size > 2 * 1024 * 1024) {
        return { success: false, message: 'File size must be 2MB or less' };
      }

      // In real app, upload to Firebase Storage
      const member = window.appState?.member;
      const fileUrl = `${FIREBASE_STORAGE_URL}/profile_pics/${member.id}.jpg?alt=media`;
      
      member.profilePic = fileUrl;

      await this.logActivity({
        category: 'MEMBER',
        event: 'Profile Picture Updated',
        memberId: member.id,
        memberName: member.fullName,
        details: 'Profile picture uploaded'
      });

      return { success: true, message: 'Profile picture updated', url: fileUrl };
    } catch (error) {
      console.error('❌ API Error (uploadProfilePic):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== FLIGHT ADMIN API =====

  // GET STOCK
  getStock: async function(flightId) {
    console.log('📡 API: getStock -', flightId);
    
    try {
      return {
        success: true,
        stock: {
          shuttles: 45,
          good: 40,
          repair: 3,
          damaged: 2,
          tubePrice: 3000,
          tubes: 8
        }
      };
    } catch (error) {
      console.error('❌ API Error (getStock):', error);
      return { success: false, message: error.message };
    }
  },

  // UPDATE STOCK
  updateStock: async function(data) {
    console.log('📡 API: updateStock -', data);
    
    try {
      const member = window.appState?.member;
      
      await this.logActivity({
        category: 'SHUTTLE',
        event: 'Stock Updated',
        memberId: member.id,
        memberName: member.fullName,
        details: `Tube Price: BHD ${(data.tubePrice / 1000).toFixed(3)}, Tubes: ${data.tubes}`
      });

      return { success: true, message: 'Stock updated successfully' };
    } catch (error) {
      console.error('❌ API Error (updateStock):', error);
      return { success: false, message: error.message };
    }
  },

  // REMOVE FROM SESSION
  removeFromSession: async function(sessionId, memberId) {
    console.log('📡 API: removeFromSession -', sessionId, memberId);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'ATTENDANCE',
        event: 'Member Removed',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Removed member from session ${sessionId}`
      });

      return { success: true, message: 'Member removed from session' };
    } catch (error) {
      console.error('❌ API Error (removeFromSession):', error);
      return { success: false, message: error.message };
    }
  },

  // ADD TO SESSION
  addToSession: async function(sessionId, memberId) {
    console.log('📡 API: addToSession -', sessionId, memberId);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'ATTENDANCE',
        event: 'Member Added',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Added member to session ${sessionId}`
      });

      return { success: true, message: 'Member added to session' };
    } catch (error) {
      console.error('❌ API Error (addToSession):', error);
      return { success: false, message: error.message };
    }
  },

  // COMPLETE SESSION
  completeSession: async function(sessionId, data) {
    console.log('📡 API: completeSession -', sessionId, data);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'SESSION',
        event: 'Session Completed',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `${data.presentCount} players, BHD ${(data.perPlayerShareFils / 1000).toFixed(3)} per player`
      });

      return { success: true, message: 'Session completed and charges calculated' };
    } catch (error) {
      console.error('❌ API Error (completeSession):', error);
      return { success: false, message: error.message };
    }
  },

  // GET REPORTS
  getReports: async function(flightId, reportType) {
    console.log('📡 API: getReports -', flightId, reportType);
    
    try {
      return {
        success: true,
        reports: {
          paid: [
            { name: 'Ahmed Al-Mansouri', sessions: 12, amount: 2004 },
            { name: 'Fatima Hassan', sessions: 11, amount: 1837 }
          ],
          unpaid: [
            { name: 'Sara Ahmed', sessions: 8, amount: 1336 },
            { name: 'Hassan Ibrahim', sessions: 5, amount: 835 }
          ]
        }
      };
    } catch (error) {
      console.error('❌ API Error (getReports):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== SUPER ADMIN API =====

  // GET CLUB OVERVIEW
  getClubOverview: async function() {
    console.log('📡 API: getClubOverview');
    
    try {
      return {
        success: true,
        totalActivities: 3,
        totalPlayers: 45,
        totalAdmins: 8,
        totalWallet: 125000,
        activeMembers: 42,
        inactiveMembers: 3,
        sessionsThisMonth: 24,
        pendingPayments: 15000
      };
    } catch (error) {
      console.error('❌ API Error (getClubOverview):', error);
      return { success: false, message: error.message };
    }
  },

  // GET FLIGHTS
  getFlights: async function() {
    console.log('📡 API: getFlights');
    
    try {
      return {
        success: true,
        flights: [
          { id: 'flight_001', name: 'Ahmed Al-Mansouri', phone: '+973 3366 1234', role: 'PLAYER', flight: 'Premier', status: 'PENDING' },
          { id: 'flight_002', name: 'Fatima Hassan', phone: '+973 3366 5678', role: 'LEVEL_ADMIN', flight: 'Flight 1', status: 'PENDING' }
        ]
      };
    } catch (error) {
      console.error('❌ API Error (getFlights):', error);
      return { success: false, message: error.message };
    }
  },

  // CREATE ACTIVITY
  createActivity: async function(activityName) {
    console.log('📡 API: createActivity -', activityName);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'MEMBER',
        event: 'Activity Created',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Created activity: ${activityName}`
      });

      return { success: true, message: 'Activity created successfully' };
    } catch (error) {
      console.error('❌ API Error (createActivity):', error);
      return { success: false, message: error.message };
    }
  },

  // CREATE FLIGHT
  createFlight: async function(activity, flightName) {
    console.log('📡 API: createFlight -', activity, flightName);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'MEMBER',
        event: 'Flight Created',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Created flight: ${flightName} for ${activity}`
      });

      return { success: true, message: 'Flight created successfully' };
    } catch (error) {
      console.error('❌ API Error (createFlight):', error);
      return { success: false, message: error.message };
    }
  },

  // CREATE MEMBER
  createMember: async function(data) {
    console.log('📡 API: createMember -', data.name);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'MEMBER',
        event: 'Member Pre-Registered',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Pre-registered: ${data.name} as ${data.role}`
      });

      return { success: true, message: 'Member pre-registered successfully' };
    } catch (error) {
      console.error('❌ API Error (createMember):', error);
      return { success: false, message: error.message };
    }
  },

  // DELETE MEMBER
  deleteMember: async function(memberId) {
    console.log('📡 API: deleteMember -', memberId);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'MEMBER',
        event: 'Member Deleted',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Permanently deleted member: ${memberId}`
      });

      return { success: true, message: 'Member deleted successfully' };
    } catch (error) {
      console.error('❌ API Error (deleteMember):', error);
      return { success: false, message: error.message };
    }
  },

  // DELETE MONTH TIMETABLE
  deleteMonthTimetable: async function(month) {
    console.log('📡 API: deleteMonthTimetable -', month);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'SESSION',
        event: 'Month Timetable Cleared',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Cleared timetable for ${month}`
      });

      return { success: true, message: 'Month timetable cleared' };
    } catch (error) {
      console.error('❌ API Error (deleteMonthTimetable):', error);
      return { success: false, message: error.message };
    }
  },

  // PUBLISH MONTH
  publishMonth: async function(month) {
    console.log('📡 API: publishMonth -', month);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'SESSION',
        event: 'Month Published',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Published timetable for ${month}`
      });

      return { success: true, message: 'Month published successfully' };
    } catch (error) {
      console.error('❌ API Error (publishMonth):', error);
      return { success: false, message: error.message };
    }
  },

  // IMPORT TIMETABLE
  importTimetable: async function(timetable) {
    console.log('📡 API: importTimetable -', timetable.length, 'sessions');
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'SESSION',
        event: 'Timetable Imported',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Imported ${timetable.length} sessions via CSV`
      });

      return { success: true, message: `${timetable.length} sessions imported successfully` };
    } catch (error) {
      console.error('❌ API Error (importTimetable):', error);
      return { success: false, message: error.message };
    }
  },

  // GET FINANCE
  getFinance: async function() {
    console.log('📡 API: getFinance');
    
    try {
      return {
        success: true,
        finance: {
          totalWallet: 125000,
          pendingPayments: 15000,
          verifiedPayments: 110000
        }
      };
    } catch (error) {
      console.error('❌ API Error (getFinance):', error);
      return { success: false, message: error.message };
    }
  },

  // ADD CREDIT
  addCredit: async function(memberId, amountFils) {
    console.log('📡 API: addCredit -', memberId, amountFils);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'WALLET',
        event: 'Credit Added',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Added BHD ${(amountFils / 1000).toFixed(3)} to member ${memberId}`
      });

      return { success: true, message: 'Credit added successfully' };
    } catch (error) {
      console.error('❌ API Error (addCredit):', error);
      return { success: false, message: error.message };
    }
  },

  // DEDUCT CREDIT
  deductCredit: async function(memberId, amountFils) {
    console.log('📡 API: deductCredit -', memberId, amountFils);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'WALLET',
        event: 'Credit Deducted',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Deducted BHD ${(amountFils / 1000).toFixed(3)} from member ${memberId}`
      });

      return { success: true, message: 'Credit deducted successfully' };
    } catch (error) {
      console.error('❌ API Error (deductCredit):', error);
      return { success: false, message: error.message };
    }
  },

  // VERIFY PAYMENT
  verifyPayment: async function(paymentId) {
    console.log('📡 API: verifyPayment -', paymentId);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'WALLET',
        event: 'Payment Verified',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Verified payment: ${paymentId}`
      });

      return { success: true, message: 'Payment verified and credit added' };
    } catch (error) {
      console.error('❌ API Error (verifyPayment):', error);
      return { success: false, message: error.message };
    }
  },

  // GET ADS
  getAds: async function() {
    console.log('📡 API: getAds');
    
    try {
      return {
        success: true,
        activeAds: 6,
        ads: [
          { id: 'ad_001', business: 'Al-Noor Restaurant', offer: '20% Discount', start: '2026-09-01', end: '2026-09-30' },
          { id: 'ad_002', business: 'Fitness Plus Gym', offer: 'Free Trial', start: '2026-09-10', end: '2026-09-25' }
        ]
      };
    } catch (error) {
      console.error('❌ API Error (getAds):', error);
      return { success: false, message: error.message };
    }
  },

  // SET CAROUSEL LIMIT
  setCarouselLimit: async function(limit) {
    console.log('📡 API: setCarouselLimit -', limit);
    
    try {
      const admin = window.appState?.member;
      
      await this.logActivity({
        category: 'SYSTEM',
        event: 'Carousel Limit Set',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Set carousel limit to ${limit} ads`
      });

      return { success: true, message: 'Carousel limit saved' };
    } catch (error) {
      console.error('❌ API Error (setCarouselLimit):', error);
      return { success: false, message: error.message };
    }
  },

  // UPLOAD NOTICE IMAGE
  uploadNoticeImage: async function(formData) {
    console.log('📡 API: uploadNoticeImage');
    
    try {
      const admin = window.appState?.member;
      const file = formData.get('file');

      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return { success: false, message: 'Only PNG, JPEG, and WebP files allowed' };
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        return { success: false, message: 'File size must be 2MB or less' };
      }

      // In real app, upload to Firebase Storage
      const imageUrl = `${FIREBASE_STORAGE_URL}/notices/${Date.now()}_${file.name}?alt=media`;

      await this.logActivity({
        category: 'SYSTEM',
        event: 'Notice Image Uploaded',
        memberId: admin.id,
        memberName: admin.fullName,
        details: `Uploaded notice image: ${file.name}`
      });

      return { success: true, message: 'Notice image uploaded', url: imageUrl };
    } catch (error) {
      console.error('❌ API Error (uploadNoticeImage):', error);
      return { success: false, message: error.message };
    }
  },

  // GET AUDIT LOGS
  getAuditLogs: async function(filters = {}) {
    console.log('📡 API: getAuditLogs -', filters);
    
    try {
      // Mock audit logs
      const allLogs = [
        {
          id: 'log_001',
          timestamp: '2026-09-14 11:30:00',
          category: 'MEMBER',
          event: 'Login',
          activity: 'Badminton',
          level: 'Premier',
          memberId: 'member_001',
          memberName: 'Ahmed Al-Mansouri',
          details: 'Successful login'
        },
        {
          id: 'log_002',
          timestamp: '2026-09-14 06:15:00',
          category: 'ATTENDANCE',
          event: 'Session Completed',
          activity: 'Badminton',
          level: 'Premier',
          memberId: 'admin_001',
          memberName: 'Admin User',
          details: '3 players, BHD 0.167 per player'
        },
        {
          id: 'log_003',
          timestamp: '2026-09-13 15:30:00',
          category: 'WALLET',
          event: 'Credit Added',
          activity: 'Badminton',
          level: 'Flight 1',
          memberId: 'admin_001',
          memberName: 'Super Admin',
          details: 'BHD 10.000 added'
        }
      ];

      // Apply filters (concurrent matching - ALL filters must match)
      let filteredLogs = allLogs;

      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }
      if (filters.activity) {
        filteredLogs = filteredLogs.filter(log => log.activity === filters.activity);
      }
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      if (filters.date) {
        filteredLogs = filteredLogs.filter(log => log.timestamp.startsWith(filters.date));
      }
      if (filters.member) {
        filteredLogs = filteredLogs.filter(log => 
          log.memberName.toLowerCase().includes(filters.member.toLowerCase())
        );
      }

      return {
        success: true,
        logs: filteredLogs
      };
    } catch (error) {
      console.error('❌ API Error (getAuditLogs):', error);
      return { success: false, message: error.message };
    }
  },

  // ===== LOGGING SYSTEM =====
  logActivity: async function(data) {
    console.log('📝 Logging activity:', data.event);
    
    try {
      // In real app, save to Firestore
      const logEntry = {
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        ...data
      };

      console.log('✅ Activity logged:', logEntry);
      return { success: true };
    } catch (error) {
      console.error('❌ Error logging activity:', error);
      return { success: false };
    }
  }
};

console.log('✅ api.js loaded successfully');

