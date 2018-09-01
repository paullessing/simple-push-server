const main = (() => {
  async function main(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      // Service Worker isn't supported on this browser, disable or hide UI.
      return;
    }

    if (!('PushManager' in window)) {
      // Push isn't supported on this browser, disable or hide UI.
      return;
    }

    const sw = await registerServiceWorker();
    if (!sw) {
      return;
    }
    await askPermission();

    const pushSubscription = await subscribeUserToPush();
    await sendSubscriptionToBackEnd(pushSubscription);
  }

  async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    try {
      const registration = await navigator.serviceWorker.register('js/service-worker.js');
      console.log('Service worker successfully registered.');
      return registration;
    } catch (e) {
      console.error('Unable to register service worker.', e);
      return null;
    }
  }

  async function askPermission(): Promise<void> {
    const result = await new Promise(function(resolve, reject) {
      const permissionResult = Notification.requestPermission(function(result) {
        resolve(result);
      });

      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    });
    if (result !== 'granted') {
      throw new Error('We weren\'t granted permission.');
    }
  }

  function urlB64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function subscribeUserToPush(): Promise<PushSubscription> {
    const swRegistration = await navigator.serviceWorker.register('js/service-worker.js')
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(
        'BCrCeCpiYqqg5Q1AOjpnc-tufnpgzQfz6izfgXLWtwnj-FRAKO_4_uaiav340aIa5wpuAT59iVZVPt1A0ZoKb7Q'
      )
    };

    const pushSubscription = await swRegistration.pushManager.subscribe(subscribeOptions);
    console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
    return pushSubscription;
  }

  function sendSubscriptionToBackEnd(subscription: PushSubscription) {
    // return fetch('/api/save-subscription/', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(subscription)
    // })
    //   .then(function(response) {
    //     if (!response.ok) {
    //       throw new Error('Bad status code from server.');
    //     }
    //
    //     return response.json();
    //   })
    //   .then(function(responseData) {
    //     if (!(responseData.data && responseData.data.success)) {
    //       throw new Error('Bad response from server.');
    //     }
    //   });
  }
  return main;
})();
