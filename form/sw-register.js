if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw-admin.js', { scope: './' })
      .then((reg) => {
        console.log('Service Worker de Administração registado:', reg.scope);
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      })
      .catch((err) => console.log('Erro ao registar o Service Worker de Administração:', err));
  });
}
