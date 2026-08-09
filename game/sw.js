/* Abyss Drop service worker — cache-first for full offline play */
const VERSION = "abyss-drop-v1.1.1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    Promise.all([
      caches.keys()
        .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))),
      self.registration.navigationPreload ? self.registration.navigationPreload.enable() : Promise.resolve(),
    ]).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const isNav = e.request.mode === "navigate" || url.pathname.endsWith("/index.html");
  if (isNav) {
    // network-first: players get updates when online, cache keeps it playable offline
    e.respondWith((async () => {
      try {
        const preload = e.preloadResponse ? await e.preloadResponse : null;
        const res = preload || await fetch(e.request);
        if (res && res.ok) {
          const copy = res.clone();
          e.waitUntil(caches.open(VERSION).then((c) => c.put("./index.html", copy)));
        }
        return res;
      } catch (err) {
        return caches.match("./index.html");
      }
    })());
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          e.waitUntil(caches.open(VERSION).then((c) => c.put(e.request, copy)));
        }
        return res;
      });
    })
  );
});
