// Web push service worker. Registered by
// Components/Hooks/usePushNotifications.tsx at the site root ("/"), so its
// scope covers the whole app. Payload shape matches what
// Services/pushNotificationService.ts (noyanai-back) sends:
//   { title: string, message: string, link?: string }

const DEFAULT_ICON = "/favicon.ico";

self.addEventListener("install", () => {
  // Don't wait for old tabs to close before this version takes over - a
  // push notification handler should never lag behind a deploy.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
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
