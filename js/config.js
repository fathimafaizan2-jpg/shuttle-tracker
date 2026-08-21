// GLOBAL STATE & STORAGE CONFIGURATION
// INITIALIZE GLOBAL APPLICATION STATE
window.state = {
  page: 'home',
  role: 'PLAYER',
  currentUser: null
};

// EXPOSE AS GLOBAL SHORTCUTS
var state = window.state;
var currentUser = state.currentUser;
var isAdmin = false;
var isSuperAdmin = false;
var adminLevel = "Level 4A";
var tubePacks = 2;
var currentCorkCount = 2;
const BUILD_VERSION = "v5.1.0-fulltabs";
if (localStorage.getItem('icst_build_ver') !== BUILD_VERSION) {
  localStorage.clear();
  localStorage.setItem('icst_build_ver', BUILD_VERSION);
}

let isAdmin = false;
let isSuperAdmin = false;
let currentAdminObj = null;
let adminLevel = "Level 4A";
let currentUser = JSON.parse(localStorage.getItem('shuttle_user')) || null;

let tubePacks = parseInt(localStorage.getItem('shuttle_tube_packs')) || 2;
let shuttlesPerTube = 12;
let tubePriceBHD = parseFloat(localStorage.getItem('shuttle_tube_price')) || 6.000;
let adminPhone = localStorage.getItem('shuttle_admin_phone') || "97339123456";
let currentCorkCount = 2;

const FlightList = ["Premier", "Level 1", "Level 2", "Level 3", "Level 4A", "Level 4B"];

let systemAuditLogs = JSON.parse(localStorage.getItem('shuttle_audit_logs')) || [
  { timestamp: "10 Aug 10:35 AM", actor: "System", action: "Initialized Indian Club Shuttle Tracker Engine." }
];

let adminAccounts = JSON.parse(localStorage.getItem('shuttle_admin_accounts')) || [
  { adminId: "ADM-4A", name: "Admin Level 4A", password: "123", level: "Level 4A" }
];

let weeklyTimetables = JSON.parse(localStorage.getItem('shuttle_timetables')) || {
  "Level 4A": { "Sunday": "8:00 PM - 10:00 PM", "Tuesday": "8:00 PM - 10:00 PM", "Friday": "6:00 PM - 9:00 PM" }
};

let playersList = JSON.parse(localStorage.getItem('shuttle_players')) || [
  { id: "p1", name: "Alex", memberId: "IC-101", phone: "97339123456", password: "123", level: "Level 4A", coming: true, wallet: 1.000, locked: false, pendingDues: 0.000, logs: [
    { date: "09/08/2026", attended: true, amount: 0.500, method: "Wallet Credit" }
  ] },
  { id: "p2", name: "Syed", memberId: "IC-102", phone: "97339000000", password: "123", level: "Level 4A", coming: true, wallet: 0.000, locked: false, pendingDues: 0.500, logs: [
    { date: "09/08/2026", attended: true, amount: 0.500, method: "Unpaid" }
  ] }
];

function normalizeLevel(lvl) {
  return String(lvl || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function addAuditLog(actor, action) {
  const logItem = {
    timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    actor,
    action
  };
  systemAuditLogs.unshift(logItem);
  localStorage.setItem('shuttle_audit_logs', JSON.stringify(systemAuditLogs));
}

function savePlayersData() {
  localStorage.setItem('shuttle_players', JSON.stringify(playersList));
}
