import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkOnly } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

const MEDIA_CACHE = "travelapp-media-v1";
const LEGACY_CACHES = new Set(["pages", "assets", "images"]);
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
                  cacheName !== MEDIA_CACHE),
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => serviceWorker.clients.claim()),
  );
});

// Never serve deploy-coupled documents or code from an old deployment.
registerRoute(({ request }) => {
  const pathname = new URL(request.url).pathname;

  return (
    request.mode === "navigate" ||
    ["script", "style", "worker"].includes(request.destination) ||
    (request.destination === "" && /\.(html|js|css)$/.test(pathname))
  );
}, new NetworkOnly());

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
