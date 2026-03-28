// Service Worker pour les Web Push Notifications KAVERN
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'Nouvelle notification KAVERN',
    icon: '/kavern-icone.png',
    badge: '/kavern-icone.png',
    image: data.image || undefined,
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Voir' },
      { action: 'close', title: 'Fermer' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'KAVERN', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
