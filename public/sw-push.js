// Push Notification Service Worker
console.log('[SW-PUSH] 🚀 Service worker script loaded at:', new Date().toISOString());

self.addEventListener('install', function(event) {
  console.log('[SW-PUSH] ✅ Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[SW-PUSH] ✅ Activated!');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {
  console.log('[SW-PUSH] ========== PUSH EVENT RECEIVED ==========');
  console.log('[SW-PUSH] Event:', event);
  console.log('[SW-PUSH] Has data:', !!event.data);

  let data = {
    title: 'Village Marketplace',
    body: 'You have a new notification',
    url: '/',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'default'
  };

  try {
    if (event.data) {
      const rawData = event.data.text();
      console.log('[SW-PUSH] Raw push data:', rawData);
      
      const payload = event.data.json();
      console.log('[SW-PUSH] Parsed payload:', JSON.stringify(payload, null, 2));
      data = { ...data, ...payload };
    }
  } catch (e) {
    console.log('[SW-PUSH] ⚠️ Error parsing push data:', e);
    if (event.data) {
      data.body = event.data.text();
      console.log('[SW-PUSH] Using text body:', data.body);
    }
  }

  console.log('[SW-PUSH] Final notification data:', JSON.stringify(data, null, 2));

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'notification-' + Date.now(),
    data: {
      url: data.url || '/'
    },
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  console.log('[SW-PUSH] Notification options:', JSON.stringify(options, null, 2));
  console.log('[SW-PUSH] Showing notification with title:', data.title);

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => {
        console.log('[SW-PUSH] ✅ Notification shown successfully!');
      })
      .catch((err) => {
        console.error('[SW-PUSH] ❌ Failed to show notification:', err);
      })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW-PUSH] 👆 Notification clicked!');
  console.log('[SW-PUSH] Action:', event.action);
  console.log('[SW-PUSH] Tag:', event.notification.tag);
  console.log('[SW-PUSH] Data:', event.notification.data);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    console.log('[SW-PUSH] User dismissed notification');
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';
  console.log('[SW-PUSH] Opening URL:', urlToOpen);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        console.log('[SW-PUSH] Found', clientList.length, 'client windows');
        
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('[SW-PUSH] Focusing existing window and navigating to:', urlToOpen);
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          console.log('[SW-PUSH] Opening new window:', urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('[SW-PUSH] Notification closed:', event.notification.tag);
});

// Handle subscription change
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[SW-PUSH] ⚠️ Push subscription changed - need to resubscribe');
});

console.log('[SW-PUSH] ✅ All event listeners registered');