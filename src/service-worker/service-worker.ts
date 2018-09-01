(function(self: ServiceWorkerGlobalScope) {
  self.addEventListener('push', function(event: any) {
    const promiseChain = self.registration.showNotification('Hello, World.');

    event.waitUntil(promiseChain);
  });
})(self as any);
