const CACHE_NAME = "indian-club-shell-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./manifest.json",
  "./js/config.js",
  "./js/router.js",
  "./js/modules/auth.js",
  "./js/modules/views.js",
  "./js/modules/adminViews.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  /* Never cache API data, Firebase authentication, or payment/attendance requests. */
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebase")
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          if (response.ok && url.origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
