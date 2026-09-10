
// service-worker.js - Service Worker for PWA Support
// Enables offline functionality and caching

const CACHE_NAME = 'indian-club-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/premium-styles.css',
  '/js/app.js',
  '/js/modules/config.js',
  '/js/modules/router.js',
  '/js/modules/auth.js',
  '/js/modules/adminViews.js',
  '/js/modules/flightAdminViews.js',
  '/js/modules/views.js',
  '/manifest.json'
];

// ============================================
// INSTALL EVENT
// ============================================

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('✅ Service Worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Installation failed:', error);
      })
  );
});

// ============================================
// ACTIVATE EVENT
// ============================================

self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH EVENT - CACHE FIRST STRATEGY
// ============================================

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if available
        if (response) {
          console.log('📦 Serving from cache:', event.request.url);
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Return offline page if available
            console.log('📡 Offline - serving cached version');
            return caches.match('/index.html');
          });
      })
  );
});

// ============================================
// MESSAGE EVENT - COMMUNICATION WITH APP
// ============================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Skipping waiting...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🗑️ Clearing cache...');
    caches.delete(CACHE_NAME);
  }
});

// ============================================
// BACKGROUND SYNC (Optional)
// ============================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(
      // Sync attendance data when back online
      fetch('/api/attendance/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(() => {
          console.log('✅ Attendance synced');
        })
        .catch((error) => {
          console.error('❌ Sync failed:', error);
        })
    );
  }
});

// ============================================
// PUSH NOTIFICATIONS (Optional)
// ============================================

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New notification from Indian Club',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%231a1a2e" width="192" height="192"/><text x="96" y="144" font-size="120" fill="%23e94560" text-anchor="middle">🏸</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%231a1a2e" width="96" height="96"/><text x="48" y="72" font-size="60" fill="%23e94560" text-anchor="middle">🏸</text></svg>',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Indian Club', options)
  );
});

// ============================================
// NOTIFICATION CLICK
// ============================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Open app if not already open
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

console.log('✅ Service Worker loaded');

