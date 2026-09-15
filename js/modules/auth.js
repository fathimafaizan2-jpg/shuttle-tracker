
// =============================================
// INDIAN CLUB BAHRAIN - auth.js
// Location: js/modules/auth.js
// COMPLETE CLEAN VERSION - NO DUPLICATES
// =============================================

// ===== FIREBASE CONFIGURATION =====
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDemoKeyForIndianClubBahrain",
  authDomain: "indian-club-bahrain.firebaseapp.com",
  projectId: "indian-club-bahrain",
  storageBucket: "indian-club-bahrain.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// ===== AUTH STATE =====
let loggedInMember = null;
let authObservers = [];

// ===== MOCK DATABASE =====
const MOCK_MEMBERS = [
  {
    id: "player1",
    email: "player@example.com",
    password: "password123",
    fullName: "Ahmed Al-Mansouri",
    role: "PLAYER",
    flightId: "flight1",
    flightName: "Flight 1",
    phone: "+973 3366 1234",
    profilePic: null,
    walletBalance: 50000,
    status: "ACTIVE",
    createdAt: new Date("2026-01-15")
  },
  {
    id: "leveladmin1",
    email: "leveladmin@example.com",
    password: "password123",
    fullName: "Fatima Al-Dosari",
    role: "LEVEL_ADMIN",
    flightId: "flight1",
    flightName: "Flight 1",
    phone: "+973 3366 5678",
    profilePic: null,
    walletBalance: 100000,
    status: "ACTIVE",
    createdAt: new Date("2025-06-10")
  },
  {
    id: "superadmin1",
    email: "superadmin@example.com",
    password: "password123",
    fullName: "Mohammed Al-Khalifa",
    role: "SUPER_ADMIN",
    flightId: null,
    flightName: null,
    phone: "+973 3366 9999",
    profilePic: null,
    walletBalance: 0,
    status: "ACTIVE",
    createdAt: new Date("2025-01-01")
  }
];

const MOCK_ACTIVITIES = [
  { id: "badminton", name: "Badminton", status: "ACTIVE", createdAt: new Date("2026-01-01") },
  { id: "cricket", name: "Cricket", status: "ACTIVE", createdAt: new Date("2026-01-01") },
  { id: "football", name: "Football", status: "ACTIVE", createdAt: new Date("2026-01-01") }
];

const MOCK_FLIGHTS = [
  { id: "flight1", activityId: "badminton", name: "Flight 1", displayOrder: 1, status: "ACTIVE" },
  { id: "flight2", activityId: "badminton", name: "Flight 2", displayOrder: 2, status: "ACTIVE" },
  { id: "flight3", activityId: "badminton", name: "Flight 3", displayOrder: 3, status: "ACTIVE" },
  { id: "flight4", activityId: "badminton", name: "Flight 4", displayOrder: 4, status: "ACTIVE" },
  { id: "flight4a", activityId: "badminton", name: "Flight 4A", displayOrder: 5, status: "ACTIVE" },
  { id: "flight4b", activityId: "badminton", name: "Flight 4B", displayOrder: 6, status: "ACTIVE" }
];

const MOCK_ANNOUNCEMENTS = [
  {
    id: "ann1",
    title: "🏆 Annual Badminton Championship",
    message: "Join us for the biggest badminton tournament of the year! Registration opens next week.",
    image: null,
    publishedAt: new Date("2026-09-10"),
    isPublished: true
  },
  {
    id: "ann2",
    title: "🎉 Club Anniversary Celebration",
    message: "Celebrate 25 years of Indian Club Bahrain with us! Special events and prizes await.",
    image: null,
    publishedAt: new Date("2026-09-05"),
    isPublished: true
  },
  {
    id: "ann3",
    title: "📢 New Membership Drive",
    message: "Invite your friends to join our vibrant community. Special discounts for new members!",
    image: null,
    publishedAt: new Date("2026-09-01"),
    isPublished: true
  }
];

const MOCK_ADS = [
  { id: "ad1", businessName: "Al-Noor Restaurant", category: "Food & Beverage", email: "info@alnoor.bh", phone: "+973 1234 5678", description: "Authentic Bahraini cuisine with modern ambiance", image: null, status: "APPROVED", inCarousel: true, expiryDate: new Date("2026-12-31"), createdAt: new Date("2026-08-01") },
  { id: "ad2", businessName: "Fitness Plus Gym", category: "Health & Fitness", email: "contact@fitnessplus.bh", phone: "+973 3344 5566", description: "State-of-the-art gym with professional trainers", image: null, status: "APPROVED", inCarousel: true, expiryDate: new Date("2026-12-31"), createdAt: new Date("2026-08-15") },
  { id: "ad3", businessName: "Travel Bahrain Tours", category: "Travel & Tourism", email: "bookings@travelbahrain.bh", phone: "+973 5566 7788", description: "Explore Bahrain with our guided tours", image: null, status: "APPROVED", inCarousel: true, expiryDate: new Date("2026-12-31"), createdAt: new Date("2026-08-20") },
  { id: "ad4", businessName: "Tech Solutions Ltd", category: "Technology", email: "sales@techsolutions.bh", phone: "+973 7788 9900", description: "IT services and software development", image: null, status: "APPROVED", inCarousel: true, expiryDate: new Date("2026-12-31"), createdAt: new Date("2026-08-25") },
  { id: "ad5", businessName: "Beauty & Spa Center", category: "Beauty & Wellness", email: "bookings@beautyspa.bh", phone: "+973 9900 1122", description: "Premium beauty and spa treatments", image: null, status: "APPROVED", inCarousel: true, expiryDate: new Date("2026-12-31"), createdAt: new Date("2026-08-28") },
  { id: "ad6", businessName: "Real Estate Bahrain", category: "Real Estate", email: "info@realestate.bh", phone: "+973 1122 3344", description: "Premium properties and investment opportunities", image: null, status: "APPROVED", inCarousel: true, expiryDate: new Date("2026-12-31"), createdAt: new Date("2026-09-01") }
];

const MOCK_SHUTTLE_STOCK = [
  { flightId: "flight1", flightName: "Flight 1", totalStock: 200, used: 120, remaining: 80, lastRefill: new Date("2026-09-01") },
  { flightId: "flight2", flightName: "Flight 2", totalStock: 150, used: 90, remaining: 60, lastRefill: new Date("2026-09-05") }
];

const MOCK_WALLET_TRANSACTIONS = [
  { id: "txn1", memberId: "player1", type: "CREDIT", amount: 50000, description: "Initial deposit", date: new Date("2026-01-15"), status: "COMPLETED" },
  { id: "txn2", memberId: "player1", type: "DEBIT", amount: 5000, description: "Shuttle charge - Session 1", date: new Date("2026-09-10"), status: "COMPLETED" }
];

// ===== API HANDLER =====
export async function api(endpoint, options = {}) {
  const method = options.method || "GET";
  const body = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : null;

  console.log(`📡 API Call: ${method} ${endpoint}`, body);

  // ===== AUTHENTICATION ENDPOINTS =====
  if (endpoint === "/auth/login") {
    const { email, password, role } = body;
    const member = MOCK_MEMBERS.find(m => m.email === email && m.password === password && m.role === role);
    if (!member) throw new Error("Invalid email, password, or role");
    const token = btoa(JSON.stringify({ id: member.id, email: member.email, role: member.role, timestamp: Date.now() }));
    console.log(`✅ Login successful: ${member.fullName}`);
    return { success: true, token, member: { id: member.id, email: member.email, fullName: member.fullName, role: member.role, flightId: member.flightId, flightName: member.flightName, phone: member.phone, profilePic: member.profilePic, walletBalance: member.walletBalance, status: member.status } };
  }

  if (endpoint === "/auth/verify") {
    const { token } = body;
    try {
      const decoded = JSON.parse(atob(token));
      const member = MOCK_MEMBERS.find(m => m.id === decoded.id);
      if (!member) throw new Error("Member not found");
      console.log(`✅ Token verified: ${member.fullName}`);
      return { success: true, member: { id: member.id, email: member.email, fullName: member.fullName, role: member.role, flightId: member.flightId, flightName: member.flightName, phone: member.phone, profilePic: member.profilePic, walletBalance: member.walletBalance, status: member.status } };
    } catch (error) { throw new Error("Invalid token"); }
  }

  // ===== MEMBER ENDPOINTS =====
  if (endpoint === "/members/me") {
    if (!loggedInMember) throw new Error("Not authenticated");
    return loggedInMember;
  }
  if (endpoint === "/members" && method === "GET") { return MOCK_MEMBERS; }
  if (endpoint === "/members" && method === "POST") {
    const newMember = { id: `member_${Date.now()}`, ...body, createdAt: new Date() };
    MOCK_MEMBERS.push(newMember);
    return newMember;
  }
  if (endpoint.startsWith("/members/") && method === "PUT") {
    const id = endpoint.split("/")[2];
    const idx = MOCK_MEMBERS.findIndex(m => m.id === id);
    if (idx >= 0) Object.assign(MOCK_MEMBERS[idx], body);
    return MOCK_MEMBERS[idx];
  }
  if (endpoint.startsWith("/members/") && method === "DELETE") {
    const id = endpoint.split("/")[2];
    const idx = MOCK_MEMBERS.findIndex(m => m.id === id);
    if (idx >= 0) MOCK_MEMBERS.splice(idx, 1);
    return { success: true };
  }

  // ===== ACTIVITY ENDPOINTS =====
  if (endpoint === "/activities" && method === "GET") { return MOCK_ACTIVITIES; }
  if (endpoint === "/activities" && method === "POST") {
    const newActivity = { id: `activity_${Date.now()}`, ...body, createdAt: new Date() };
    MOCK_ACTIVITIES.push(newActivity);
    return newActivity;
  }

  // ===== FLIGHT ENDPOINTS =====
  if (endpoint === "/flights" && method === "GET") { return MOCK_FLIGHTS; }
  if (endpoint === "/flights" && method === "POST") {
    const newFlight = { id: `flight_${Date.now()}`, ...body };
    MOCK_FLIGHTS.push(newFlight);
    return newFlight;
  }

  // ===== ANNOUNCEMENTS ENDPOINTS =====
  if (endpoint === "/announcements" && method === "GET") { return MOCK_ANNOUNCEMENTS; }
  if (endpoint === "/announcements" && method === "POST") {
    const newAnnouncement = { id: `ann_${Date.now()}`, ...body, publishedAt: new Date() };
    MOCK_ANNOUNCEMENTS.push(newAnnouncement);
    return newAnnouncement;
  }

  // ===== ADS ENDPOINTS =====
  if (endpoint === "/ads" && method === "GET") { return MOCK_ADS; }
  if (endpoint === "/ads" && method === "POST") {
    const newAd = { id: `ad_${Date.now()}`, ...body, createdAt: new Date() };
    MOCK_ADS.push(newAd);
    return newAd;
  }
  if (endpoint.startsWith("/ads/") && endpoint.endsWith("/approve")) {
    const id = endpoint.split("/")[2];
    const ad = MOCK_ADS.find(a => a.id === id);
    if (ad) ad.status = "APPROVED";
    return { success: true };
  }
  if (endpoint.startsWith("/ads/") && endpoint.endsWith("/reject")) {
    const id = endpoint.split("/")[2];
    const ad = MOCK_ADS.find(a => a.id === id);
    if (ad) ad.status = "REJECTED";
    return { success: true };
  }

  // ===== TIMETABLE ENDPOINTS =====
  if (endpoint === "/timetable" && method === "GET") {
    return [
      { id: "session1", flightId: "flight1", activityId: "badminton", date: new Date("2026-09-15"), startTime: "18:00", endTime: "19:30", status: "SCHEDULED" },
      { id: "session2", flightId: "flight1", activityId: "badminton", date: new Date("2026-09-17"), startTime: "18:00", endTime: "19:30", status: "SCHEDULED" },
      { id: "session3", flightId: "flight2", activityId: "badminton", date: new Date("2026-09-16"), startTime: "19:30", endTime: "21:00", status: "SCHEDULED" }
    ];
  }
  if (endpoint === "/timetable" && method === "POST") {
    return { id: `session_${Date.now()}`, ...body };
  }

  // ===== ATTENDANCE ENDPOINTS =====
  if (endpoint === "/attendance" && method === "GET") {
    return [
      { id: "att1", memberId: "player1", memberName: "Ahmed Al-Mansouri", flightId: "flight1", sessionId: "session1", status: "PRESENT", chargeAmount: 5000, paymentStatus: "PAID", paymentMethod: "CASH", sessionDate: new Date("2026-09-10"), walletBalance: 50000 },
      { id: "att2", memberId: "player1", memberName: "Ahmed Al-Mansouri", flightId: "flight1", sessionId: "session2", status: "ABSENT", chargeAmount: 0, paymentStatus: "NONE", paymentMethod: null, sessionDate: new Date("2026-09-12"), walletBalance: 50000 }
    ];
  }
  if (endpoint === "/attendance/respond" && method === "POST") { return { success: true }; }

  // ===== WALLET ENDPOINTS =====
  if (endpoint === "/wallet/balance") { return { balance: loggedInMember?.walletBalance || 0 }; }
  if (endpoint === "/wallet/transactions") { return MOCK_WALLET_TRANSACTIONS; }
  if (endpoint.startsWith("/wallet/credit") && method === "POST") {
    const member = MOCK_MEMBERS.find(m => m.id === body.memberId);
    if (member) member.walletBalance += body.amount;
    return { success: true, newBalance: member?.walletBalance };
  }
  if (endpoint.startsWith("/wallet/debit") && method === "POST") {
    const member = MOCK_MEMBERS.find(m => m.id === body.memberId);
    if (member) member.walletBalance -= body.amount;
    return { success: true, newBalance: member?.walletBalance };
  }

  // ===== SHUTTLE STOCK ENDPOINTS =====
  if (endpoint === "/shuttle/stock" && method === "GET") { return MOCK_SHUTTLE_STOCK; }
  if (endpoint === "/shuttle/stock" && method === "POST") {
    const stock = MOCK_SHUTTLE_STOCK.find(s => s.flightId === body.flightId);
    if (stock) { stock.totalStock += body.quantity; stock.remaining += body.quantity; stock.lastRefill = new Date(); }
    return { success: true };
  }

  // ===== AUDIT LOGS ENDPOINTS =====
  if (endpoint === "/audit/logs" && method === "GET") {
    return [
      { id: "log1", category: "MEMBER", action: "Member Created", memberName: "Ahmed Al-Mansouri", flightName: "Flight 1", detail: "New player registered", actorName: "Fatima Al-Dosari", createdAt: new Date("2026-09-14T10:30:00") },
      { id: "log2", category: "ATTENDANCE", action: "Attendance Marked", memberName: "Ahmed Al-Mansouri", flightName: "Flight 1", detail: "Present in session", actorName: "Fatima Al-Dosari", createdAt: new Date("2026-09-14T09:15:00") },
      { id: "log3", category: "WALLET/PAYMENT", action: "Payment Confirmed", memberName: "Ahmed Al-Mansouri", flightName: "Flight 1", detail: "Cash payment received", actorName: "Fatima Al-Dosari", createdAt: new Date("2026-09-13T18:45:00") },
      { id: "log4", category: "SESSION CONTROL", action: "Session Ended", memberName: null, flightName: "Flight 1", detail: "Badminton session completed", actorName: "Fatima Al-Dosari", createdAt: new Date("2026-09-13T20:00:00") },
      { id: "log5", category: "SHUTTLE STOCK", action: "Stock Added", memberName: null, flightName: "Flight 1", detail: "50 shuttles added to inventory", actorName: "Fatima Al-Dosari", createdAt: new Date("2026-09-12T14:30:00") }
    ];
  }

  // ===== NOTICES ENDPOINTS =====
  if (endpoint === "/notices" && method === "GET") { return MOCK_ANNOUNCEMENTS; }

  // ===== REPORTS ENDPOINTS =====
  if (endpoint === "/reports/attendance") { return []; }
  if (endpoint === "/reports/payments") { return []; }
  if (endpoint === "/reports/members") { return MOCK_MEMBERS; }
  
  // ===== MEMBERS AUDIT ENDPOINT =====
  // (Add this block right BEFORE the "// ===== DEFAULT =====" line in auth.js)

  if (endpoint === "/members/audit" && method === "GET") {
    return [
      { category: "MEMBER", action: "Member Created", subject: "Ahmed Al-Mansouri", activityId: "badminton", activityName: "Badminton", flightId: "flight1", flightName: "Flight 1", detail: "New player registered", actor: "Fatima Al-Dosari", createdAt: new Date("2026-09-14T10:30:00"), sessionDate: null },
      { category: "ATTENDANCE", action: "Attendance Marked", subject: "Ahmed Al-Mansouri", activityId: "badminton", activityName: "Badminton", flightId: "flight1", flightName: "Flight 1", detail: "Present in session", actor: "Fatima Al-Dosari", createdAt: new Date("2026-09-14T09:15:00"), sessionDate: new Date("2026-09-14") },
      { category: "WALLET / PAYMENT", action: "Payment Confirmed", subject: "Ahmed Al-Mansouri", activityId: "badminton", activityName: "Badminton", flightId: "flight1", flightName: "Flight 1", detail: "Cash payment BHD 5.000 received", actor: "Fatima Al-Dosari", createdAt: new Date("2026-09-13T18:45:00"), sessionDate: null },
      { category: "SESSION CONTROL", action: "Session Ended", subject: "Badminton Flight 1", activityId: "badminton", activityName: "Badminton", flightId: "flight1", flightName: "Flight 1", detail: "Badminton session completed", actor: "Fatima Al-Dosari", createdAt: new Date("2026-09-13T20:00:00"), sessionDate: new Date("2026-09-13") },
      { category: "SHUTTLE STOCK", action: "Stock Added", subject: "Flight 1 Inventory", activityId: "badminton", activityName: "Badminton", flightId: "flight1", flightName: "Flight 1", detail: "50 shuttles added to inventory", actor: "Fatima Al-Dosari", createdAt: new Date("2026-09-12T14:30:00"), sessionDate: null },
      { category: "MEMBER", action: "Profile Updated", subject: "Fatima Al-Dosari", activityId: "badminton", activityName: "Badminton", flightId: "flight1", flightName: "Flight 1", detail: "Phone number updated", actor: "Fatima Al-Dosari", createdAt: new Date("2026-09-12T11:00:00"), sessionDate: null },
      { category: "WALLET / PAYMENT", action: "Credit Added", subject: "Ahmed Al-Mansouri", activityId: "badminton", activityName: "Badminton", flightId: "flight1", flightName: "Flight 1", detail: "BHD 50.000 wallet credit added", actor: "Mohammed Al-Khalifa", createdAt: new Date("2026-09-11T14:00:00"), sessionDate: null }
    ];
  }

  // ===== DEFAULT =====
  console.warn(`⚠️ Unknown endpoint: ${endpoint}`);
  return { success: false, message: "Endpoint not found" };
}

// ===== LOGIN FUNCTION =====
export async function login(email, password, role) {
  const result = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role })
  });
  if (result.success) {
    loggedInMember = result.member;
    localStorage.setItem("indian_club_token", result.token);
    localStorage.setItem("indian_club_member", JSON.stringify(result.member));
    authObservers.forEach(cb => cb(result.member));
  }
  return result;
}

// ===== SIGN OUT =====
export async function signOut() {
  loggedInMember = null;
  localStorage.removeItem("indian_club_token");
  localStorage.removeItem("indian_club_member");
  authObservers.forEach(cb => cb(null));
}

// ===== OBSERVE AUTH (THIS IS WHAT router.js NEEDS!) =====
export function observeAuth(callback) {
  authObservers.push(callback);
  const savedMember = localStorage.getItem("indian_club_member");
  if (savedMember) {
    try {
      loggedInMember = JSON.parse(savedMember);
      setTimeout(() => callback(loggedInMember), 100);
    } catch { setTimeout(() => callback(null), 100); }
  } else {
    setTimeout(() => callback(null), 100);
  }
  return () => { authObservers = authObservers.filter(cb2 => cb2 !== callback); };
}

// ===== GET CURRENT MEMBER =====
export function getCurrentMember() { return loggedInMember; }

// ===== VERIFY TOKEN =====
export async function verifyToken() {
  const token = localStorage.getItem("indian_club_token");
  if (!token) return null;
  try {
    const result = await api("/auth/verify", { method: "POST", body: JSON.stringify({ token }) });
    if (result.success) { loggedInMember = result.member; return result.member; }
  } catch { localStorage.removeItem("indian_club_token"); localStorage.removeItem("indian_club_member"); }
  return null;
}

// ===== DEFAULT EXPORT =====
export default { api, login, signOut, observeAuth, getCurrentMember, verifyToken };

console.log("✅ auth.js loaded successfully");

