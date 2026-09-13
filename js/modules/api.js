
// ============================================
// api.js - API CALLS & MOCK BACKEND
// ============================================

const API_BASE = 'https://api.indianclub.bh'; // Mock API base

// ===== AUTHENTICATION ENDPOINTS =====
window.api = {
  // LOGIN
  login: async function(email, password) {
    try {
      // Mock authentication
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      const member = members.find(m => m.email === email);
      
      if (!member) {
        throw new Error('Member not found');
      }
      
      const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      return {
        success: true,
        token,
        member: {
          uid: member.uid,
          email: member.email,
          fullName: member.fullName,
          phone: member.phone,
          role: normalizeRole(member.role),
          flightId: member.flightId,
          flightName: member.flightName,
          walletBalanceFils: member.walletBalanceFils || 0,
          status: member.status
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ACTIVATE ACCOUNT
  activateAccount: async function(fullName, phone, password) {
    try {
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      const member = members.find(m => m.phone === phone && m.fullName === fullName);
      
      if (!member) {
        throw new Error('Pre-registration not found');
      }
      
      member.status = 'ACTIVE';
      member.password = password; // In real app, hash this
      localStorage.setItem('members', JSON.stringify(members));
      
      logAudit('MEMBER', 'Account Activated', member.fullName, `Member ${member.fullName} activated their account`);
      
      return { success: true, message: 'Account activated successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ===== ATTENDANCE ENDPOINTS =====
  
  // RESPOND TO SESSION ATTENDANCE
  respondAttendance: async function(sessionId, status) {
    try {
      const member = window.appState.member;
      const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
      
      // Remove existing response
      const filtered = attendance.filter(a => !(a.sessionId === sessionId && a.memberUid === member.uid));
      
      // Add new response
      filtered.push({
        sessionId,
        memberUid: member.uid,
        memberName: member.fullName,
        status,
        respondedAt: new Date().toISOString()
      });
      
      localStorage.setItem('attendance', JSON.stringify(filtered));
      
      logActivity('ATTENDANCE', `Marked ${status} for session ${sessionId}`);
      logAudit('ATTENDANCE', `Marked ${status}`, sessionId, `${member.fullName} marked ${status}`);
      
      return { success: true, message: `Marked as ${status}` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // CORRECT SESSION ATTENDANCE (FLIGHT ADMIN)
  correctSessionAttendance: async function(sessionId, memberUid, status) {
    try {
      requireLevelAdmin();
      
      const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
      const filtered = attendance.filter(a => !(a.sessionId === sessionId && a.memberUid === memberUid));
      
      filtered.push({
        sessionId,
        memberUid,
        status,
        correctedAt: new Date().toISOString(),
        correctedBy: window.appState.member.fullName
      });
      
      localStorage.setItem('attendance', JSON.stringify(filtered));
      
      logAudit('ATTENDANCE', 'Corrected', memberUid, `Flight Admin corrected attendance to ${status}`);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ===== WALLET & PAYMENT ENDPOINTS =====
  
  // SUBMIT PAYMENT
  submitPayment: async function(method, reference, amountBHD) {
    try {
      const member = window.appState.member;
      const amountFils = Math.round(amountBHD * 1000);
      
      const payment = {
        id: 'payment_' + Date.now(),
        memberUid: member.uid,
        memberName: member.fullName,
        method,
        reference,
        amountFils,
        amountBHD,
        status: 'PENDING_VERIFICATION',
        submittedAt: new Date().toISOString()
      };
      
      const payments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
      payments.push(payment);
      localStorage.setItem('pendingPayments', JSON.stringify(payments));
      
      logActivity('WALLET', `Submitted payment of ${amountBHD} BHD via ${method}`);
      logAudit('WALLET', 'Payment Submitted', member.uid, `${amountBHD} BHD via ${method}`);
      
      return { success: true, message: 'Payment submitted for verification' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // VERIFY PAYMENT (ADMIN)
  verifyPayment: async function(paymentId) {
    try {
      requireLevelAdmin();
      
      const payments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
      const payment = payments.find(p => p.id === paymentId);
      
      if (!payment) throw new Error('Payment not found');
      
      // Remove from pending
      const filtered = payments.filter(p => p.id !== paymentId);
      localStorage.setItem('pendingPayments', JSON.stringify(filtered));
      
      // Add to member wallet
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      const member = members.find(m => m.uid === payment.memberUid);
      if (member) {
        member.walletBalanceFils = (member.walletBalanceFils || 0) + payment.amountFils;
        localStorage.setItem('members', JSON.stringify(members));
      }
      
      logAudit('WALLET', 'Payment Verified', payment.memberUid, `${payment.amountBHD} BHD verified and credited`);
      
      return { success: true, message: 'Payment verified and credited' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ===== SESSION ENDPOINTS =====
  
  // COMPLETE FLIGHT SESSION (WITH COST SPLIT)
  completeFlightSession: async function(sessionId, shuttlesUsed) {
    try {
      requireLevelAdmin();
      
      const sessions = JSON.parse(localStorage.getItem('flightSessions') || '[]');
      const session = sessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');
      
      const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
      const presentPlayers = attendance.filter(a => a.sessionId === sessionId && a.status === 'PRESENT');
      const presentCount = presentPlayers.length;
      
      if (presentCount === 0) throw new Error('No players marked present');
      
      // EXACT COST SPLIT FORMULA
      const stock = JSON.parse(localStorage.getItem('flightStock') || '{"tubePriceFils": 500}');
      const tubePriceFils = stock.tubePriceFils;
      const costPerShuttleFils = Math.round(tubePriceFils / 12);
      const totalGameCostFils = Math.ceil(shuttlesUsed * costPerShuttleFils);
      const perPlayerShareFils = Math.ceil(totalGameCostFils / presentCount);
      
      // Deduct from each player
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      presentPlayers.forEach(player => {
        const member = members.find(m => m.uid === player.memberUid);
        if (member) {
          member.walletBalanceFils = (member.walletBalanceFils || 0) - perPlayerShareFils;
        }
      });
      localStorage.setItem('members', JSON.stringify(members));
      
      // Mark session complete
      session.status = 'COMPLETED';
      session.shuttlesUsed = shuttlesUsed;
      session.totalGameCostFils = totalGameCostFils;
      session.perPlayerShareFils = perPlayerShareFils;
      session.completedAt = new Date().toISOString();
      localStorage.setItem('flightSessions', JSON.stringify(sessions));
      
      logAudit('SESSION', 'Completed', sessionId, `Session completed. Cost: ${(totalGameCostFils/1000).toFixed(3)} BHD, Per player: ${(perPlayerShareFils/1000).toFixed(3)} BHD`);
      
      return {
        success: true,
        message: 'Session completed',
        totalCost: totalGameCostFils / 1000,
        perPlayerCost: perPlayerShareFils / 1000
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ===== MEMBER ENDPOINTS =====
  
  // PRE-REGISTER MEMBER (SUPER ADMIN)
  preRegisterMember: async function(fullName, phone, role, flightId) {
    try {
      requireSuperAdmin();
      
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      
      const newMember = {
        uid: 'member_' + Date.now(),
        fullName,
        phone,
        email: phone + '@preregister.club',
        role: normalizeRole(role),
        flightId,
        flightName: getFlightName(flightId),
        status: 'PRE_REGISTERED',
        walletBalanceFils: 0,
        createdAt: new Date().toISOString()
      };
      
      members.push(newMember);
      localStorage.setItem('members', JSON.stringify(members));
      
      logAudit('MEMBER', 'Pre-registered', fullName, `New member pre-registered: ${fullName}`);
      
      return { success: true, member: newMember };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // UPDATE MEMBER (SUPER ADMIN)
  updateMember: async function(uid, updates) {
    try {
      requireSuperAdmin();
      
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      const member = members.find(m => m.uid === uid);
      
      if (!member) throw new Error('Member not found');
      
      Object.assign(member, updates);
      localStorage.setItem('members', JSON.stringify(members));
      
      logAudit('MEMBER', 'Updated', uid, `Member updated: ${JSON.stringify(updates)}`);
      
      return { success: true, member };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // DELETE MEMBER (SUPER ADMIN)
  deleteMember: async function(uid) {
    try {
      requireSuperAdmin();
      
      const members = JSON.parse(localStorage.getItem('members') || '[]');
      const member = members.find(m => m.uid === uid);
      
      if (!member) throw new Error('Member not found');
      
      const filtered = members.filter(m => m.uid !== uid);
      localStorage.setItem('members', JSON.stringify(filtered));
      
      logAudit('MEMBER', 'Deleted', uid, `Member permanently deleted: ${member.fullName}`);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ===== ACTIVITY ENDPOINTS =====
  
  // CREATE ACTIVITY (SUPER ADMIN)
  createActivity: async function(name) {
    try {
      requireSuperAdmin();
      
      const activities = JSON.parse(localStorage.getItem('activities') || '[]');
      
      const activity = {
        id: 'activity_' + Date.now(),
        name,
        status: 'ACTIVE',
        flights: [],
        displayOrder: activities.length,
        createdAt: new Date().toISOString()
      };
      
      activities.push(activity);
      localStorage.setItem('activities', JSON.stringify(activities));
      
      logAudit('ACTIVITY', 'Created', activity.id, `New activity created: ${name}`);
      
      return { success: true, activity };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ADD FLIGHT (SUPER ADMIN)
  addFlight: async function(activityId, flightName, displayOrder) {
    try {
      requireSuperAdmin();
      
      const activities = JSON.parse(localStorage.getItem('activities') || '[]');
      const activity = activities.find(a => a.id === activityId);
      
      if (!activity) throw new Error('Activity not found');
      
      const flight = {
        id: 'flight_' + Date.now(),
        name: flightName,
        displayOrder: displayOrder || 0
      };
      
      if (!activity.flights) activity.flights = [];
      activity.flights.push(flight);
      localStorage.setItem('activities', JSON.stringify(activities));
      
      logAudit('FLIGHT', 'Created', flight.id, `New flight created: ${flightName}`);
      
      return { success: true, flight };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ===== TIMETABLE ENDPOINTS =====
  
  // GET MY TIMETABLE (PLAYER)
  getMyTimetable: async function() {
    try {
      const member = window.appState.member;
      const timetable = JSON.parse(localStorage.getItem('timetable') || '[]');
      
      const myTimetable = timetable.filter(slot => slot.flightId === member.flightId);
      
      return { success: true, timetable: myTimetable };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ADD MASTER TIMETABLE SLOT (SUPER ADMIN)
  addMasterSlot: async function(day, flightId, startTime, endTime) {
    try {
      requireSuperAdmin();
      
      const masterTimetable = JSON.parse(localStorage.getItem('masterTimetable') || '[]');
      
      const slot = {
        id: 'slot_' + Date.now(),
        day,
        flightId,
        startTime,
        endTime,
        courts: 'Courts 1 & 2'
      };
      
      masterTimetable.push(slot);
      localStorage.setItem('masterTimetable', JSON.stringify(masterTimetable));
      
      logAudit('TIMETABLE', 'Slot Added', slot.id, `Master timetable slot added: ${day} ${startTime}-${endTime}`);
      
      return { success: true, slot };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // PUBLISH MONTH (SUPER ADMIN)
  publishMonth: async function(month) {
    try {
      requireSuperAdmin();
      
      const masterTimetable = JSON.parse(localStorage.getItem('masterTimetable') || '[]');
      const sessions = JSON.parse(localStorage.getItem('flightSessions') || '[]');
      
      // Generate sessions for the month based on master timetable
      const [year, monthNum] = month.split('-');
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthNum - 1, day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        
        const daySlots = masterTimetable.filter(slot => slot.day === dayName);
        daySlots.forEach(slot => {
          sessions.push({
            id: 'session_' + Date.now() + '_' + Math.random(),
            flightId: slot.flightId,
            date: date.toLocaleDateString(),
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: 'SCHEDULED',
            courts: slot.courts
          });
        });
      }
      
      localStorage.setItem('flightSessions', JSON.stringify(sessions));
      
      logAudit('TIMETABLE', 'Month Published', month, `Month ${month} published with ${sessions.length} sessions`);
      
      return { success: true, message: `Month ${month} published` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ===== HELPER FUNCTIONS =====
function getFlightName(flightId) {
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  for (const activity of activities) {
    const flight = activity.flights?.find(f => f.id === flightId);
    if (flight) return `${activity.name} - ${flight.name}`;
  }
  return 'Unknown Flight';
}

console.log('✅ api.js loaded successfully');

