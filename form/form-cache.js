// Forçar limpeza de cache e service workers se houver atualização
(async function() {
    const VERSION = 'v1.0.53';
    if (localStorage.getItem('app_cache_version') !== VERSION) {
        try {
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                for (let reg of regs) {
                    await reg.unregister();
                }
            }
            if ('caches' in window) {
                const keys = await caches.keys();
                for (let key of keys) {
                    await caches.delete(key);
                }
            }
            localStorage.setItem('app_cache_version', VERSION);
            window.location.reload();
        } catch (e) {
            console.error("Erro ao limpar cache:", e);
        }
    }
})();
