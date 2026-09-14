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

let currentEnv = ENV.development;

export const API_CONFIG = {
  baseUrl: currentEnv.apiUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
};

export const FIREBASE_CONFIG = currentEnv.firebaseConfig;

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    register: "/auth/register",
    resetPassword: "/auth/reset-password",
    refreshToken: "/auth/refresh-token"
  },

  members: {
    list: "/members",
    get: "/members/:id",
    create: "/members",
    update: "/members/:id",
    delete: "/members/:id",
    search: "/members/search",
    preRegister: "/members/pre-register"
  },

  activities: {
    list: "/activities",
    get: "/activities/:id",
    create: "/activities",
    update: "/activities/:id",
    delete: "/activities/:id",
    byLevel: "/activities/level/:level"
  },

  timetable: {
    list: "/timetable",
    get: "/timetable/:id",
    create: "/timetable",
    update: "/timetable/:id",
    delete: "/timetable/:id"
  },

  attendance: {
    list: "/attendance",
    get: "/attendance/:id",
    create: "/attendance",
    update: "/attendance/:id",
    markPresent: "/attendance/:id/present",
    markAbsent: "/attendance/:id/absent",
    finalize: "/attendance/:sessionId/finalize"
  },

  wallet: {
    getBalance: "/wallet/balance",
    getTransactions: "/wallet/transactions",
    topUp: "/wallet/topup",
    payByCash: "/wallet/pay-cash",
    payByWhatsApp: "/wallet/pay-whatsapp"
  },

  advertising: {
    list: "/advertising",
    get: "/advertising/:id",
    create: "/advertising",
    update: "/advertising/:id",
    delete: "/advertising/:id",
    approve: "/advertising/:id/approve",
    reject: "/advertising/:id/reject"
  },

  shuttle: {
    getStock: "/shuttle/stock",
    updateStock: "/shuttle/stock/update",
    getHistory: "/shuttle/history"
  },

  reports: {
    attendance: "/reports/attendance",
    payments: "/reports/payments",
    members: "/reports/members",
    activities: "/reports/activities"
  },

  logs: {
    list: "/logs",
    get: "/logs/:id",
    filter: "/logs/filter"
  }
};

export const APP_CONFIG = {
  appName: "Indian Club Bahrain",
  appVersion: "1.0.0",
  appDescription: "Premium Management System",
  environment: "development",
  
  ui: {
    itemsPerPage: 10,
    maxUploadSize: 5242880,
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
    currency: "BHD"
  },

  features: {
    enableAdvertising: true,
    enableWallet: true,
    enableBazaar: true,
    enableReports: true,
    enableLogs: true,
    enablePWA: true,
    enableServiceWorker: true
  },

  roles: {
    SUPER_ADMIN: "Super Admin",
    LEVEL_ADMIN: "Level Admin",
    PLAYER: "Player"
  },

  levels: {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    PROFESSIONAL: "Professional"
  },

  activities: {
    BADMINTON: "Badminton",
    CRICKET: "Cricket",
    TENNIS: "Tennis",
    SWIMMING: "Swimming"
  },

  colors: {
    primary: "#1a1a2e",
    accent: "#e94560",
    success: "#00d4aa",
    warning: "#ffa502",
    danger: "#ff4757",
    info: "#0099ff"
  },

  timeouts: {
    sessionTimeout: 3600000,
    apiTimeout: 30000,
    notificationDuration: 3000
  }
};

export function getApiUrl(endpoint) {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}

export function getEnvironment() {
  return currentEnv;
}

export function setEnvironment(env) {
  if (ENV[env]) {
    currentEnv = ENV[env];
    console.log(`✅ Environment changed to: ${env}`);
  } else {
    console.error(`❌ Unknown environment: ${env}`);
  }
}

export function getConfig(key) {
  return APP_CONFIG[key];
}

export default {
  API_CONFIG,
  FIREBASE_CONFIG,
  API_ENDPOINTS,
  APP_CONFIG,
  getApiUrl,
  getEnvironment,
  setEnvironment,
  getConfig
};

console.log('✅ config.js loaded');
console.log('📱 App:', APP_CONFIG.appName, 'v' + APP_CONFIG.appVersion);
console.log('🌍 Environment:', APP_CONFIG.environment);

