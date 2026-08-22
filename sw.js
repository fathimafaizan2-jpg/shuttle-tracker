const CACHE="indian-club-shell-v1";
const ASSETS=["./","./index.html","./css/styles.css","./js/config.js","./js/router.js"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{
  // Never cache API/Firebase responses containing private attendance, wallet, or payment data.
  if (event.request.url.includes("/api/") || event.request.url.includes("firestore")) return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
