// Mostra o painel de carregamento antes de uma navegação interna.
(function () {
    function showTransition() {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loader-content">
                    <div class="animal-animation"><i class="fa-solid fa-paw"></i></div>
                    <p class="loader-text">A carregar...</p>
                </div>
            `;
            document.body?.appendChild(overlay);
        }
        overlay.classList.remove('fade-out');
    }

    document.addEventListener('click', event => {
        const link = event.target.closest?.('a[href]');
        if (!link || event.defaultPrevented || event.button !== 0) return;
        if (link.target === '_blank' || link.hasAttribute('download')) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const destination = new URL(link.href, window.location.href);
        if (destination.origin !== window.location.origin) return;
        if (destination.href === window.location.href) return;
        if (destination.hash && destination.pathname === window.location.pathname && destination.search === window.location.search) return;

        showTransition();
    }, true);
})();
