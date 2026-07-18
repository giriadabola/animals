(() => {
  'use strict';

  const RELEASE_ID = '20260718-utf8-fix-1';
  const STORAGE_KEY = `animals-cache-reset:${RELEASE_ID}`;

  async function forceCacheRefresh() {
    if (sessionStorage.getItem(STORAGE_KEY) === 'done') return;
    sessionStorage.setItem(STORAGE_KEY, 'done');

    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(async (registration) => {
          try {
            await registration.update();
          } catch (error) {
            console.warn('[Cache Reset] Não foi possível atualizar um Service Worker:', error);
          }
        }));
      }

      console.info('[Cache Reset] Cache antigo eliminado para a versão', RELEASE_ID);
    } catch (error) {
      console.warn('[Cache Reset] Falha ao limpar o cache antigo:', error);
    }
  }

  forceCacheRefresh();
})();
