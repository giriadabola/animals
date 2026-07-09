if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw-admin.js', { scope: './form.html' })
            .then(reg => console.log('Service Worker de Administração registrado:', reg.scope))
            .catch(err => console.log('Erro ao registrar o Service Worker de Administração:', err));
    });
}
