import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

const MEDIA_CACHE = "travelapp-media-v1";
const PAGES_CACHE = "travelapp-pages-v1";
const ASSETS_CACHE = "travelapp-assets-v1";
const LEGACY_CACHES = new Set(["pages", "assets", "images"]);
const CURRENT_CACHES = new Set([MEDIA_CACHE, PAGES_CACHE, ASSETS_CACHE]);
const serviceWorker = self as unknown as ServiceWorkerGlobalScope;

serviceWorker.addEventListener("install", (event) => {
  event.waitUntil(serviceWorker.skipWaiting());
});

serviceWorker.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                LEGACY_CACHES.has(cacheName) ||
                (cacheName.startsWith("travelapp-") &&
                  !CURRENT_CACHES.has(cacheName)),
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => serviceWorker.clients.claim()),
  );
});

// Keep the latest online document available for offline reloads.
registerRoute(
  ({ request }) => {
    const pathname = new URL(request.url).pathname;

    return (
      request.mode === "navigate" ||
      (request.destination === "" && /\.html$/.test(pathname))
    );
  },
  new NetworkFirst({
    cacheName: PAGES_CACHE,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

// Keep the latest app code available when a document is served offline.
registerRoute(
  ({ request }) => {
    const pathname = new URL(request.url).pathname;

    return (
      ["script", "style", "worker"].includes(request.destination) ||
      (request.destination === "" && /\.(js|css)$/.test(pathname))
    );
  },
  new NetworkFirst({
    cacheName: ASSETS_CACHE,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

// Cache media only; media can safely survive application deploys.
registerRoute(
  ({ request }) =>
    request.destination === "image" || request.destination === "font",
  new CacheFirst({
    cacheName: MEDIA_CACHE,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  }),
);
