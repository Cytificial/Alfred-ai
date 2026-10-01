const CACHE = "alfred-v106";
self.addEventListener("install", function (e) { self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener("fetch", function (e) {
  var u;
  try { u = new URL(e.request.url); } catch (er) { return; }
  if (e.request.method !== "GET") return;
  if (u.origin !== location.origin) return;
  if (u.pathname.indexOf("/api/") === 0) return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r && r.ok) {
        var cl = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, cl); });
      }
      return r;
    }).catch(function () { return caches.match(e.request); })
  );
});
