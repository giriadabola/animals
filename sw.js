const CACHE_NAME = 'animals-app-v20260717-wikidata-search-v1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './animal.html',
  './categories.html',
  './filtros.html',
  './gestor-index.html',
  './login.html',
  './myportefolio.html',

  './css/style.css',
  './css/distance-filter.css',
  './index/globe-search.css',
  './index/bioma-explorer.css',
  './index/main.js',
  './index/globe-search.js',
  './index/bioma-explorer.js',
  './index/survival-lists.js',

  './js/components.js',
  './js/wikidata-search.js',
  './js/countries.json',
  './js/feeding-animal-options.js',
  './js/feeding-strategies.js',
  './js/feeding-visuals.js',
  './js/animal-audio.js',
  './js/animal-media-block.js',
  './js/firebase-config.js',
  './js/loader.js',
  './js/mating-systems.js',
  './js/runtime-guard.js',
  './js/general-visual-catalog.js',
  './js/ecology-visuals.js',
  './js/locomotion-visuals.js',
  './js/communication-catalog.js',
  './js/ecological-functions.js',
  './js/biogeographic-regions.js',
  './js/biogeographic-regions-popup.js',
  './js/communication-visuals.js',
  './js/communication-type-popup.js',
  './js/distance-filter.js',
  './js/perception-visuals.js',
  './js/perception-type-popup.js',
  './js/social-type-popup.js',
  './js/skeleton-type-popup.js',
  './js/thermoregulation-popup.js',
  './js/body-symmetry-popup.js',
  './js/activity-popup.js',
  './js/territory-size-popup.js',
  './animal-page/animal-page.js',
  './animal-page/animal-page.css',

  './form/form.html',
  './form/form.css',
  './form/form.js',
  './form/form-auth.js',
  './form/form-cache.js',
  './form/sw-register.js',
  './sw-admin.js',
  './form/manifest-admin.webmanifest',
  './form/modules/form-state-catalogs.js',
  './form/modules/form-record-type.js',
  './form/modules/form-quality-level.js',
  './form/modules/form-profile-link.js',
  './form/modules/form-dimensions.js',
  './form/modules/form-general.js',
  './form/modules/form-feeding.js',
  './form/modules/form-ecology.js',
  './form/modules/form-reproduction.js',
  './form/modules/form-reproduction-parental-investment.js',
  './form/modules/form-plumage-editing.js',
  './form/modules/form-curiosities-categories.js',
  './form/modules/form-statistics-counter.js',
  './form/modules/form-distribution-submit.js',

  './assets/logos/favicon.ico',
  './assets/logos/apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/jsvectormap/dist/css/jsvectormap.min.css',
  'https://cdn.jsdelivr.net/npm/jsvectormap',
  'https://cdn.jsdelivr.net/npm/jsvectormap/dist/maps/world.js'
];

function shouldIgnoreRequest(request) {
  const url = new URL(request.url);

  // Não interceptar áudio/streaming externo. O xeno-canto usa pedidos de media/range,
  // e o Service Worker pode impedir a reprodução se tentar colocar isso em cache.
  if (
    request.destination === 'audio' ||
    request.headers.has('range') ||
    url.hostname.includes('xeno-canto.org') ||
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('ytimg.com') ||
    url.hostname.includes('googlevideo.com')
  ) {
    return true;
  }

  // Não deixar o Service Worker prender/partir imagens externas.
  // Se uma imagem remota falhar, o browser trata o erro normalmente sem rebentar o fetch do SW.
  if (request.destination === 'image' && url.origin !== self.location.origin) {
    return true;
  }

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
        console.warn('[SW] Recurso ignorado no cache inicial:', asset, error);
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


function createOfflineFallback(request) {
  if (request.destination === 'image') {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1"></svg>';
    return new Response(svg, {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' }
    });
  }

  return new Response('', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

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
        .catch(() => caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          const requestUrl = new URL(event.request.url);
          if (requestUrl.pathname.includes('/form/')) {
            return caches.match('./form/form.html').then((response) => response || createOfflineFallback(event.request));
          }
          return caches.match('./index.html').then((response) => response || createOfflineFallback(event.request));
        }))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() => cachedResponse || createOfflineFallback(event.request));

      return fetchPromise;
    })
  );
});
