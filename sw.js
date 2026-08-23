const CACHE_NAME = "indian-club-shell-v3";
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

  if (
    request.method !== "GET" ||
    url.pathname.includes("/api/") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebase")
  ) {
    return;
  }

  /* Network first prevents GitHub Pages users from being stuck on an old
     cached index.html, CSS, or JavaScript file after a GitHub commit. */
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
