(function(self: ServiceWorkerGlobalScope) {
  self.addEventListener('push', function(event: any) {
    const data = event.data && event.data.json();
    if (!data) {
      console.log('Event has no data', data);
    }
    const promiseChain = self.registration.showNotification(data.title || 'Push notification', {
      body: data.body,
      icon: 'https://push.paullessing.com/bin/icon.png',
      badge: 'https://push.paullessing.com/bin/badge.png',
    });

    event.waitUntil(promiseChain);
  });
})(self as any);
