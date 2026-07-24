// GoSmart service worker — handles Web Push delivery only (ETA / delay alerts).
// No offline caching: the app is API-driven and polls live data, so a cache-first
// strategy here would risk serving stale bus positions.

self.addEventListener("push", (event) => {
    let payload = { title: "GoSmart", body: "You have a new update." };
    if (event.data) {
        try {
            payload = { ...payload, ...event.data.json() };
        } catch {
            payload.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: "/favicon.svg",
            badge: "/favicon.svg",
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
            if (clients.length > 0) return clients[0].focus();
            return self.clients.openWindow("/");
        })
    );
});