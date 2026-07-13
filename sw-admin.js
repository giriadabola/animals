const CACHE_NAME = 'animals-admin-v20260713-text-import-1';

const ASSETS_TO_CACHE = [
  './',
  './form/form.html',
  './form/form.css',
  './form/form.js',
  './form/form-auth.js',
  './form/form-cache.js',
  './form/sw-register.js',
  './form/manifest-admin.webmanifest',

  './form/modules/form-dropdown-polish.js',
  './form/modules/form-state-catalogs.js',
  './form/modules/form-record-type.js',
  './form/modules/form-quality-level.js',
  './form/modules/form-profile-photos.js',
  './form/modules/form-profile-link.js',
  './form/modules/form-dimensions.js',
  './form/modules/form-general.js',
  './form/modules/form-feeding.js',
  './form/modules/form-ecology.js',
  './form/modules/form-reproduction.js',
  './form/modules/form-reproduction-parental-investment.js',
  './form/modules/form-plumage-editing.js',
  './form/modules/form-curiosities-categories.js',
  './form/modules/form-advanced-parameters.js',
  './form/modules/form-statistics-counter.js',
  './form/modules/form-parameter-search.js',
  './form/modules/form-distribution-submit.js',

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
      cacheNames.map((cache) => cache === CACHE_NAME ? Promise.resolve() : caches.delete(cache))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (shouldIgnoreRequest(event.request)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true })
          .then((cachedResponse) => cachedResponse || caches.match('./form/form.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() => cachedResponse);

      return fetchPromise;
    })
  );
});
