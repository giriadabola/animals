// Liga apenas o link de cumprimento do cabecalho ao portefolio.
// Evita varrer a pagina toda e interceptar cliques do formulario.
(function setupPortfolioGreetingLink() {
    const portfolioHref = '../myportefolio.html';
    const authSectionSelector = '#header-auth-section';
    const greetingLinkSelector = `${authSectionSelector} > a`;

    function decorateGreetingLink() {
        const authSection = document.querySelector(authSectionSelector);
        const greetingLink = document.querySelector(greetingLinkSelector);

        if (!authSection || !greetingLink) return false;

        greetingLink.dataset.portfolioLink = 'true';
        greetingLink.href = portfolioHref;
        greetingLink.title = 'Abrir o meu portefolio';
        greetingLink.style.cursor = 'pointer';

        return true;
    }

    function scheduleBinding() {
        const tryBind = () => decorateGreetingLink();
        if (tryBind()) return;

        window.setTimeout(tryBind, 250);
        window.setTimeout(tryBind, 1000);
        window.setTimeout(tryBind, 2500);
    }

    if (document.body) {
        scheduleBinding();

        const observer = new MutationObserver(() => {
            if (decorateGreetingLink()) {
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        window.setTimeout(() => observer.disconnect(), 10000);
    } else {
        document.addEventListener('DOMContentLoaded', scheduleBinding, { once: true });
    }
})();
