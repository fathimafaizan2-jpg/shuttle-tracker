
// config.js - Configuration & API Endpoints

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

const ENV = {
  development: {
    apiUrl: "http://localhost:3000/api",
    firebaseConfig: {
      apiKey: "YOUR_DEV_API_KEY",
      authDomain: "your-dev-project.firebaseapp.com",
      projectId: "your-dev-project",
      storageBucket: "your-dev-project.appspot.com",
      messagingSenderId: "YOUR_DEV_SENDER_ID",
      appId: "YOUR_DEV_APP_ID"
    }
  },
  production: {
    apiUrl: "https://api.indianclubbahra in.com/api",
    firebaseConfig: {
      apiKey: "YOUR_PROD_API_KEY",
      authDomain: "your-prod-project.firebaseapp.com",
      projectId: "your-prod-project",
      storageBucket: "your-prod-project.appspot.com",
      messagingSenderId: "YOUR_PROD_SENDER_ID",
      appId: "YOUR_PROD_APP_ID"
    }
  }
};

const currentEnv = ENV.development; // Change to production when ready

// ============================================
// API CONFIGURATION
// ============================================

export const API_CONFIG = {
  baseUrl: currentEnv.apiUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
};

// ============================================
// FIREBASE CONFIGURATION
// ============================================

export const FIREBASE_CONFIG = currentEnv.firebaseConfig;

// ============================================
// API ENDPOINTS
// ============================================

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    register: "/auth/register",
    resetPassword: "/auth/reset-password",
    refreshToken: "/auth/refresh-token"
  },

  // Members
  members: {
    list: "/members",
    get: "/members/:id",
    create: "/members",
    update: "/members/:id",
    delete: "/members/:id",
    search: "/members/search",
    preRegister: "/members/pre-register"
  },

  // Activities
  activities: {
    list: "/activities",
    get: "/activities/:id",
    create: "/activities",
    update: "/activities/:id",
    delete: "/activities/:id",
    byLevel: "/activities/level/:level"
  },

  // Timetable
  timetable: {
    list: "/timetable",
    get: "/timetable/:id",
    create: "/timetable",
    update: "/timetable/:id",
    delete: "/timetable/:id"
  },

  // Attendance
  attendance: {
    list: "/attendance",
    get: "/attendance/:id",
    create: "/attendance",
    update: "/attendance/:id",
    markPresent: "/attendance/:id/present",
    markAbsent: "/attendance/:id/absent",
    finalize: "/attendance/:sessionId/finalize"
  },

  // Wallet
  wallet: {
    getBalance: "/wallet/balance",
    getTransactions: "/wallet/transactions",
    topUp: "/wallet/topup",
    payByCash: "/wallet/pay-cash",
    payByWhatsApp: "/wallet/pay-whatsapp"
  },

  // Advertising
  advertising: {
    list: "/advertising",
    get: "/advertising/:id",
    create: "/advertising",
    update: "/advertising/:id",
    delete: "/advertising/:id",
    approve: "/advertising/:id/approve",
    reject: "/advertising/:id/reject"
  },

  // Shuttle Stock
  shuttle: {
    getStock: "/shuttle/stock",
    updateStock: "/shuttle/stock/update",
    getHistory: "/shuttle/history"
  },

  // Reports
  reports: {
    attendance: "/reports/attendance",
    payments: "/reports/payments",
    members: "/reports/members",
    activities: "/reports/activities"
  },

  // Logs
  logs: {
    list: "/logs",
    get: "/logs/:id",
    filter: "/logs/filter"
  }
};

// ============================================
// APP CONFIGURATION
// ============================================

export const APP_CONFIG = {
  appName: "Indian Club Bahrain",
  appVersion: "1.0.0",
  appDescription: "Premium Management System",
  
  // UI Settings
  ui: {
    itemsPerPage: 10,
    maxUploadSize: 5242880, // 5MB
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
    currency: "BHD"
  },

  // Features
  features: {
    enableAdvertising: true,
    enableWallet: true,
    enableBazaar: true,
    enableReports: true,
    enableLogs: true
  },

  // Roles
  roles: {
    SUPER_ADMIN: "Super Admin",
    LEVEL_ADMIN: "Level Admin",
    PLAYER: "Player"
  },

  // Levels
  levels: {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    PROFESSIONAL: "Professional"
  },

  // Activities
  activities: {
    BADMINTON: "Badminton",
    CRICKET: "Cricket",
    TENNIS: "Tennis",
    SWIMMING: "Swimming"
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getApiUrl(endpoint) {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}

export function getEnvironment() {
  return currentEnv;
}

export function setEnvironment(env) {
  if (ENV[env]) {
    currentEnv = ENV[env];
    console.log(`Environment changed to: ${env}`);
  }
}

// ============================================
// EXPORT ALL CONFIG
// ============================================

export default {
  API_CONFIG,
  FIREBASE_CONFIG,
  API_ENDPOINTS,
  APP_CONFIG,
  getApiUrl,
  getEnvironment,
  setEnvironment
};

