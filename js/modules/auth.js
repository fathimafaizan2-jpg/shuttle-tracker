
// ===== FIREBASE CONFIGURATION =====
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDemoKeyForIndianClubBahrain",
  authDomain: "indian-club-bahrain.firebaseapp.com",
  projectId: "indian-club-bahrain",
  storageBucket: "indian-club-bahrain.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// ===== MOCK DATABASE (Replace with Firebase Firestore) =====
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
    walletBalance: 50000, // fils (BHD 0.050)
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
  {
    id: "ad1",
    businessName: "Al-Noor Restaurant",
    category: "Food & Beverage",
    email: "info@alnoor.bh",
    phone: "+973 1234 5678",
    description: "Authentic Bahraini cuisine with modern ambiance",
    image: null,
    status: "APPROVED",
    inCarousel: true,
    expiryDate: new Date("2026-12-31"),
    createdAt: new Date("2026-08-01")
  },
  {
    id: "ad2",
    businessName: "Fitness Plus Gym",
    category: "Health & Fitness",
    email: "contact@fitnessplus.bh",
    phone: "+973 3344 5566",
    description: "State-of-the-art gym with professional trainers",
    image: null,
    status: "APPROVED",
    inCarousel: true,
    expiryDate: new Date("2026-12-31"),
    createdAt: new Date("2026-08-15")
  },
  {
    id: "ad3",
    businessName: "Travel Bahrain Tours",
    category: "Travel & Tourism",
    email: "bookings@travelbahrain.bh",
    phone: "+973 5566 7788",
    description: "Explore Bahrain with our guided tours",
    image: null,
    status: "APPROVED",
    inCarousel: true,
    expiryDate: new Date("2026-12-31"),
    createdAt: new Date("2026-08-20")
  },
  {
    id: "ad4",
    businessName: "Tech Solutions Ltd",
    category: "Technology",
    email: "sales@techsolutions.bh",
    phone: "+973 7788 9900",
    description: "IT services and software development",
    image: null,
    status: "APPROVED",
    inCarousel: true,
    expiryDate: new Date("2026-12-31"),
    createdAt: new Date("2026-08-25")
  },
  {
    id: "ad5",
    businessName: "Beauty & Spa Center",
    category: "Beauty & Wellness",
    email: "bookings@beautyspa.bh",
    phone: "+973 9900 1122",
    description: "Premium beauty and spa treatments",
    image: null,
    status: "APPROVED",
    inCarousel: true,
    expiryDate: new Date("2026-12-31"),
    createdAt: new Date("2026-08-28")
  },
  {
    id: "ad6",
    businessName: "Real Estate Bahrain",
    category: "Real Estate",
    email: "info@realestate.bh",
    phone: "+973 1122 3344",
    description: "Premium properties and investment opportunities",
    image: null,
    status: "APPROVED",
    inCarousel: true,
    expiryDate: new Date("2026-12-31"),
    createdAt: new Date("2026-09-01")
  }
];

// ===== API HANDLER =====
export async function api(endpoint, options = {}) {
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : null;

  console.log(`📡 API Call: ${method} ${endpoint}`, body);

  // ===== AUTHENTICATION ENDPOINTS =====
  if (endpoint === "/auth/login") {
    const { email, password, role } = body;
    
    // Validate credentials
    const member = MOCK_MEMBERS.find(m => m.email === email && m.password === password && m.role === role);
    
    if (!member) {
      throw new Error("Invalid email, password, or role");
    }

    // Generate mock token
    const token = btoa(JSON.stringify({ id: member.id, email: member.email, role: member.role, timestamp: Date.now() }));

    console.log(`✅ Login successful: ${member.fullName}`);
    return {
      success: true,
      token,
      member: {
        id: member.id,
        email: member.email,
        fullName: member.fullName,
        role: member.role,
        flightId: member.flightId,
        flightName: member.flightName,
        phone: member.phone,
        profilePic: member.profilePic,
        walletBalance: member.walletBalance,
        status: member.status
      }
    };
  }

  if (endpoint === "/auth/verify") {
    const { token } = body;
    
    try {
      const decoded = JSON.parse(atob(token));
      const member = MOCK_MEMBERS.find(m => m.id === decoded.id);
      
      if (!member) {
        throw new Error("Member not found");
      }

      console.log(`✅ Token verified: ${member.fullName}`);
      return {
        success: true,
        member: {
          id: member.id,
          email: member.email,
          fullName: member.fullName,
          role: member.role,
          flightId: member.flightId,
          flightName: member.flightName,
          phone: member.phone,
          profilePic: member.profilePic,
          walletBalance: member.walletBalance,
          status: member.status
        }
      };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  // ===== MEMBER ENDPOINTS =====
  if (endpoint === "/members" && method === "GET") {
    console.log(`✅ Fetched ${MOCK_MEMBERS.length} members`);
    return MOCK_MEMBERS;
  }

  if (endpoint === "/members" && method === "POST") {
    const newMember = { id: `member_${Date.now()}`, ...body, createdAt: new Date() };
    MOCK_MEMBERS.push(newMember);
    console.log(`✅ Member created: ${newMember.fullName}`);
    return newMember;
  }

  // ===== ACTIVITY ENDPOINTS =====
  if (endpoint === "/activities" && method === "GET") {
    console.log(`✅ Fetched ${MOCK_ACTIVITIES.length} activities`);
    return MOCK_ACTIVITIES;
  }

  if (endpoint === "/activities" && method === "POST") {
    const newActivity = { id: `activity_${Date.now()}`, ...body, createdAt: new Date() };
    MOCK_ACTIVITIES.push(newActivity);
    console.log(`✅ Activity created: ${newActivity.name}`);
    return newActivity;
  }

  // ===== FLIGHT ENDPOINTS =====
  if (endpoint === "/flights" && method === "GET") {
    console.log(`✅ Fetched ${MOCK_FLIGHTS.length} flights`);
    return MOCK_FLIGHTS;
  }

  if (endpoint === "/flights" && method === "POST") {
    const newFlight = { id: `flight_${Date.now()}`, ...body };
    MOCK_FLIGHTS.push(newFlight);
    console.log(`✅ Flight created: ${newFlight.name}`);
    return newFlight;
  }

  // ===== ANNOUNCEMENTS ENDPOINTS =====
  if (endpoint === "/announcements" && method === "GET") {
    console.log(`✅ Fetched ${MOCK_ANNOUNCEMENTS.length} announcements`);
    return MOCK_ANNOUNCEMENTS;
  }

  if (endpoint === "/announcements" && method === "POST") {
    const newAnnouncement = { id: `ann_${Date.now()}`, ...body, publishedAt: new Date() };
    MOCK_ANNOUNCEMENTS.push(newAnnouncement);
    console.log(`✅ Announcement created: ${newAnnouncement.title}`);
    return newAnnouncement;
  }

  // ===== ADS ENDPOINTS =====
  if (endpoint === "/ads" && method === "GET") {
    console.log(`✅ Fetched ${MOCK_ADS.length} ads`);
    return MOCK_ADS;
  }

  if (endpoint === "/ads" && method === "POST") {
    const newAd = { id: `ad_${Date.now()}`, ...body, createdAt: new Date() };
    MOCK_ADS.push(newAd);
    console.log(`✅ Ad created: ${newAd.businessName}`);
    return newAd;
  }

  // ===== TIMETABLE ENDPOINTS =====
  if (endpoint === "/timetable" && method === "GET") {
    const mockSessions = [
      { id: "session1", flightId: "flight1", activityId: "badminton", date: new Date("2026-09-15"), startTime: "18:00", endTime: "19:30", status: "SCHEDULED" },
      { id: "session2", flightId: "flight1", activityId: "badminton", date: new Date("2026-09-17"), startTime: "18:00", endTime: "19:30", status: "SCHEDULED" },
      { id: "session3", flightId: "flight2", activityId: "badminton", date: new Date("2026-09-16"), startTime: "19:30", endTime: "21:00", status: "SCHEDULED" }
    ];
    console.log(`✅ Fetched ${mockSessions.length} sessions`);
    return mockSessions;
  }

  // ===== ATTENDANCE ENDPOINTS =====
  if (endpoint === "/attendance" && method === "GET") {
    const mockAttendance = [
      { id: "att1", memberId: "player1", flightId: "flight1", sessionId: "session1", status: "PRESENT", chargeAmount: 5000, paymentStatus: "PAID", paymentMethod: "CASH", sessionDate: new Date("2026-09-10"), walletBalance: 50000 },
      { id: "att2", memberId: "player1", flightId: "flight1", sessionId: "session2", status: "ABSENT", chargeAmount: 0, paymentStatus: "NONE", paymentMethod: null, sessionDate: new Date("2026-09-12"), walletBalance: 50000 }
    ];
    console.log(`✅ Fetched ${mockAttendance.length} attendance records`);
    return mockAttendance;
  }

  // ===== AUDIT LOGS ENDPOINTS =====
  if (endpoint === "/audit/logs" && method === "GET") {
    const mockLogs = [
      { id: "log1", category: "MEMBER", action: "Member Created", memberName: "Ahmed Al-Mansouri", flightName: "Flight 1", detail: "New player registered", actorName: "Fatima Al-Dosari", createdAt: new Date("2026-09-14T10:30:00") },
      { id: "log2", category: "ATTENDANCE", action: "Attendance Marked", memberName: "Ahmed Al-Mansouri", flightName: "Flight 1", detail: "Present in session", actorName: "Fatima Al-Dosari", createdAt: new Date("2026-09-14T09:15:00") },
      { id: "log3", category: "WALLET/PAYMENT", action: "Payment Confirmed", memberName: "Ahmed Al-Mansouri", flightName: "Flight 1", detail: "Cash payment received", actorName: "Fatima Al-Dosari", createdAt: new Date("2026-09-13T18:45:00") },
      { id: "log4", category: "SESSION CONTROL", action: "Session Ended", memberName: null, flightName: "Flight 1", detail: "Badminton session completed", actorName: "Fatima Al-Dosari", createdAt: new Date("2026-09-13T20:00:00") },
      { id: "log5", category: "SHUTTLE STOCK", action: "Stock Added", memberName: null, flightName: "Flight 1", detail: "50 shuttles added to inventory", actorName: "Fatima Al-Dosari", createdAt: new Date("2026-09-12T14:30:00") }
    ];
    console.log(`✅ Fetched ${mockLogs.length} audit logs`);
    return mockLogs;
  }

  // ===== NOTICES ENDPOINTS =====
  if (endpoint === "/notices" && method === "GET") {
    console.log(`✅ Fetched ${MOCK_ANNOUNCEMENTS.length} notices`);
    return MOCK_ANNOUNCEMENTS;
  }

  // ===== DEFAULT RESPONSE =====
  console.warn(`⚠️ Unknown endpoint: ${endpoint}`);
  return { success: false, message: "Endpoint not found" };
}

// ===== EXPORT =====
export default { api };

