const CACHE_NAME = 'animals-app-v1.0.37';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './animal.html',
  './categories.html',
  './filtros.html',
  './css/style.css',
  './css/globe-search.css',
  './js/components.js',
  './js/countries.json',
  './js/feeding-animal-options.js',
  './js/feeding-strategies.js',
  './js/feeding-visuals.js',
  './js/firebase-config.js',
  './js/loader.js',
  './js/mating-systems.js',
  './assets/logos/favicon.ico',
  './assets/logos/apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/jsvectormap/dist/css/jsvectormap.min.css',
  'https://cdn.jsdelivr.net/npm/jsvectormap',
  'https://cdn.jsdelivr.net/npm/jsvectormap/dist/maps/world.js'
];

// Instalar e armazenar em cache os recursos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercetar pedidos de rede
self.addEventListener('fetch', (event) => {
  // Ignorar pedidos que não sejam GET e requisições do Firebase/Firestore
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('firestore.googleapis.com') || 
    event.request.url.includes('firebase')
  ) {
    return;
  }
  
  // Estratégia Network-First para navegação (HTML) para obter sempre o mais recente se online
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return caches.match('./index.html');
        });
      })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Padrão Stale-While-Revalidate: serve do cache e atualiza em background
        fetch(event.request).then((response) => {
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response));
          }
        }).catch(() => {/* Ignorar erro de fetch em background */});
        
        return cachedResponse;
      }
      
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Redirecionar para index.html em caso de falha de navegação offline
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
