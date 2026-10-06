// The site's one service worker, at the root ("/") so its scope covers the
// whole app. Registered by Components/Pwa/PwaInstallPrompt.tsx on every page
// and by Components/Hooks/usePushNotifications.tsx (same URL, so one
// registration). It does two things:
//
// 1. Web push. Payload shape matches what Services/pushNotificationService.ts
//    (noyanai-back) sends: { title: string, message: string, link?: string }
// 2. Installable app shell: content-hashed static files (/_next/static,
//    icons, fonts) are cached on first use, and a page that can't load
//    offline gets the cached /offline page. API calls (/api/), uploaded files
//    (/files/) and pages are never cached, so nothing personal or stale is
//    served from here.

const DEFAULT_ICON = "/icons/icon-192.png";

const VERSION = "noyan-v1";
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_CACHE = `${VERSION}-offline`;
const LOCALES = ["en", "ar", "zh", "hi", "es", "fr", "ru", "pt", "de", "tr", "ur", "bn", "id", "ja"];
const SHELL = ["/offline", "/manifest.json", DEFAULT_ICON, "/icons/icon-512.png"];

// Build files under /_next/static are content-addressed: a production
// server sends them as "immutable", so cache-first is safe. Only responses
// that say so are kept (the dev server sends no-store and is skipped).
const isCacheableStatic = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname.startsWith("/fonts/") ||
  url.pathname === "/manifest.json";

const offlineUrlFor = (url) => {
  const seg = url.pathname.split("/")[1];
  return LOCALES.includes(seg) ? `/${seg}/offline` : "/offline";
};

self.addEventListener("install", (event) => {
  // Don't wait for old tabs to close before this version takes over - a
  // push notification handler should never lag behind a deploy.
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) =>
        Promise.all(SHELL.map((u) => cache.add(new Request(u, { cache: "reload" })).catch(() => undefined))),
      ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// a page asks for its language's offline page to be kept
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "cache-offline" || typeof data.url !== "string") return;
  if (!/^\/([a-z]{2}\/)?offline$/.test(data.url)) return;
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.add(new Request(data.url, { cache: "reload" }))).catch(() => undefined),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/files/")) return;

  if (request.mode === "navigate") {
    // network only; the offline page when there is no network at all
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(OFFLINE_CACHE);
        return (
          (await cache.match(offlineUrlFor(url))) ||
          (await cache.match("/offline")) ||
          Response.error()
        );
      }),
    );
    return;
  }

  if (isCacheableStatic(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        const immutable = /immutable/.test(res.headers.get("cache-control") || "");
        const keep = url.pathname.startsWith("/_next/static/") ? immutable : true;
        if (res.ok && res.type === "basic" && keep) cache.put(request, res.clone());
        return res;
      }),
    );
  }
});

self.addEventListener("push", (event) => {
  let payload = { title: "اعلان جدید", message: "" };
  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      // Not JSON (shouldn't happen from our backend) - fall back to raw text.
      payload.message = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.message,
      icon: DEFAULT_ICON,
      badge: DEFAULT_ICON,
      // Same tag+link collapse into one notification instead of stacking -
      // matches the in-app list, which shows one row per Notification doc.
      tag: payload.link || payload.title,
      data: { link: payload.link || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname === link && "focus" in client) {
            return client.focus();
          }
        }
        for (const client of clientList) {
          if ("focus" in client && "navigate" in client) {
            return client.focus().then(() => client.navigate(link));
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(link);
      }),
  );
});
