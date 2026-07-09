const CACHE_NAME = 'animals-admin-v1.0.9-form-folder';

const ASSETS_TO_CACHE = [
  './',
  './form.html',
  './form.css',
  './form.js',
  './form-auth.js',
  './form-cache.js',
  './sw-register.js',
  './manifest-admin.webmanifest',

  './modules/form-state-catalogs.js',
  './modules/form-record-type.js',
  './modules/form-quality-level.js',
  './modules/form-profile-link.js',
  './modules/form-dimensions.js',
  './modules/form-general.js',
  './modules/form-feeding.js',
  './modules/form-ecology.js',
  './modules/form-reproduction.js',
  './modules/form-plumage-editing.js',
  './modules/form-curiosities-categories.js',
  './modules/form-statistics-counter.js',
  './modules/form-distribution-submit.js',

  '../gestor-index.html',
  '../login.html',
  '../myportefolio.html',
  '../css/style.css',
  '../js/runtime-guard.js',
  '../js/components.js',
  '../js/firebase-config.js',
  '../js/loader.js',
  '../js/countries.json',
  '../js/feeding-animal-options.js',
  '../js/feeding-strategies.js',
  '../js/feeding-visuals.js',
  '../js/mating-systems.js',
  '../js/general-visual-catalog.js',
  '../js/ecology-visuals.js',
  '../js/feeding-visuals.js',
  '../js/locomotion-visuals.js',
  '../js/communication-catalog.js',
  '../js/ecological-functions.js',

  '../assets/logos/admin/favicon.ico',
  '../assets/logos/admin/apple-touch-icon.png',
  '../assets/logos/admin/logo-admin-512.png',
  '../assets/logos/admin/logo-admin-1024.png',
  '../assets/plumagem/remiges.png',

  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/jsvectormap/dist/css/jsvectormap.min.css',
  'https://cdn.jsdelivr.net/npm/jsvectormap',
  'https://cdn.jsdelivr.net/npm/jsvectormap/dist/maps/world.js'
];

function shouldIgnoreRequest(request) {
  const url = new URL(request.url);
  return (
    request.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    url.href.includes('firestore.googleapis.com') ||
    url.href.includes('firebase') ||
    url.href.includes('googleapis.com/identitytoolkit') ||
    url.href.includes('securetoken.googleapis.com')
  );
}

async function cacheAssetsSafely() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(
    ASSETS_TO_CACHE.map(async (asset) => {
      try {
        await cache.add(new Request(asset, { cache: 'reload' }));
      } catch (error) {
        console.warn('[Admin SW] Recurso ignorado no cache inicial:', asset, error);
      }
    })
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAssetsSafely());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cache) => {
        if (cache !== CACHE_NAME && cache.startsWith('animals-admin-')) {
          return caches.delete(cache);
        }
        return Promise.resolve();
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (shouldIgnoreRequest(event.request)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true })
          .then((cachedResponse) => cachedResponse || caches.match('./form.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
