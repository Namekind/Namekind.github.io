// Import Workbox
importScripts('workbox.js');

// Set up Workbox
const { precacheAndRoute, setCatchHandler } = workbox.precaching;
const { registerRoute } = workbox.routing;
const { NetworkFirst } = workbox.strategies;

// Precache the app's assets
precacheAndRoute(self.__WB_MANIFEST);

// Use a network-first strategy for any other requests
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst()
);

// Show a custom offline page when the network is unavailable
setCatchHandler(({ event }) => {
  if (event.request.mode === 'navigate') {
    return caches.match('offline.html');
  }
});

