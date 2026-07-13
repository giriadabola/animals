// Limpeza forçada de cache específica da página /form/form.html
// Sempre que mudares FORM_CACHE_VERSION, o browser limpa caches/service workers e recarrega a página uma única vez.
(function forceFormCacheRefresh() {
    const FORM_CACHE_VERSION = 'form-cache-2026-07-13-text-import-1';
    const STORAGE_KEY = 'animals_form_cache_version';
    const RELOAD_KEY = 'animals_form_cache_reloaded_for_' + FORM_CACHE_VERSION;

    async function clearFormCache() {
        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map((registration) => registration.unregister()));
            }

            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
            }

            localStorage.setItem(STORAGE_KEY, FORM_CACHE_VERSION);

            // Evita loop infinito caso o browser ainda esteja a servir algum ficheiro antigo.
            if (!sessionStorage.getItem(RELOAD_KEY)) {
                sessionStorage.setItem(RELOAD_KEY, '1');
                window.location.replace(window.location.pathname + '?v=' + encodeURIComponent(FORM_CACHE_VERSION));
            }
        } catch (error) {
            console.error('Erro ao limpar a cache do formulário:', error);
        }
    }

    if (localStorage.getItem(STORAGE_KEY) !== FORM_CACHE_VERSION) {
        clearFormCache();
    }
})();
