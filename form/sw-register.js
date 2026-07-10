if ('serviceWorker' in navigator) {
  const registerAdminServiceWorker = () => {
    navigator.serviceWorker.register('./sw-admin.js?v=20260710_parental_save_fix_1', { scope: './' })
      .then((registration) => {
        console.log('Service Worker de Administração registado:', registration.scope);
      })
      .catch((error) => {
        console.warn('Falha ao registar Service Worker de Administração:', error);
      });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerAdminServiceWorker, { once: true });
  } else {
    registerAdminServiceWorker();
  }
}
