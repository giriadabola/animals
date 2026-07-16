if ('serviceWorker' in navigator) {
  const registerAdminServiceWorker = () => {
    navigator.serviceWorker.register('../sw-admin.js?v=20260716-ios-refresh-1', { scope: '../', updateViaCache: 'none' })
      .then(async (registration) => {
        console.log('Service Worker de Administração registado:', registration.scope);
        await registration.update();
        if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      })
      .catch((error) => {
        console.warn('Falha ao registar Service Worker de Administração:', error);
      });
  };

  let reloadedForNewController = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadedForNewController) return;
    reloadedForNewController = true;
    window.location.reload();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerAdminServiceWorker, { once: true });
  } else {
    registerAdminServiceWorker();
  }
}
