// public/sw.js
// Service worker mínimo: recebe eventos push do navegador e mostra
// a notificação do sistema. Regista-se automaticamente pelo hook
// usePushNotifications.ts.

self.addEventListener("push", (event) => {
  let data = { title: "MozServices", body: "Tem uma nova notificação." };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    // payload não era JSON válido — usa o texto simples como corpo
    data.body = event.data?.text() ?? data.body;
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "MozServices", {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
