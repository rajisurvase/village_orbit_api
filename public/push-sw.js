// Push Notification Service Worker
// This handles push events and notification clicks

self.addEventListener('push', function(event) {
  console.log('[Push SW] Push event received');
  
  let data = {
    title: 'ग्रामपंचायत सूचना',
    body: 'नवीन अपडेट उपलब्ध आहे',
    url: '/',
    event_type: 'general'
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error('[Push SW] Error parsing push data:', e);
  }

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: data.url,
      event_type: data.event_type,
      event_id: data.event_id
    },
    actions: [
      { action: 'open', title: 'पहा' },
      { action: 'close', title: 'बंद करा' }
    ],
    requireInteraction: true,
    tag: data.event_type + '-' + (data.event_id || Date.now()),
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Push SW] Notification click received');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('[Push SW] Notification closed');
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[Push SW] Push subscription changed');
  // The subscription has changed, notify the app to resubscribe
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then(function(subscription) {
        // Send new subscription to server
        return fetch('/api/update-push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      })
  );
});
