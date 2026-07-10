// Liga o cumprimento "Olá..." da barra superior ao portefólio do utilizador.
// Versão segura: evita varrer a página inteira em cada mutação do DOM.
(function setupPortfolioGreetingLink() {
    const portfolioHref = '../myportefolio.html';
    const GREETING_TEXT_RE = /\b(olá|ola)\s*,?/i;
    const BLOCK_TEXT_RE = /\bsair\b|logout|terminar sessão|terminar sessao/i;
    const MAX_ASCENT_STEPS = 8;
    const SCAN_SELECTOR = 'a, button, span, div, p, strong, small';

    function getCleanText(element) {
        return (element && element.textContent ? element.textContent : '').replace(/\s+/g, ' ').trim();
    }

    function isGreetingText(text) {
        return GREETING_TEXT_RE.test(text) && !BLOCK_TEXT_RE.test(text);
    }

    function isSafeCandidate(element) {
        if (!element || element === document.body || element === document.documentElement) return false;
        const tag = (element.tagName || '').toLowerCase();
        if (['input', 'textarea', 'select', 'option', 'script', 'style'].includes(tag)) return false;
        return isGreetingText(getCleanText(element));
    }

    function findGreetingElement(startElement) {
        let element = startElement && startElement.nodeType === Node.ELEMENT_NODE
            ? startElement
            : startElement?.parentElement;

        let steps = 0;
        while (element && steps < MAX_ASCENT_STEPS) {
            if (isSafeCandidate(element)) return element;
            element = element.parentElement;
            steps += 1;
        }
        return null;
    }

    function decorateGreetingElement(element) {
        if (!element || element.dataset.portfolioLink === 'true') return;
        element.dataset.portfolioLink = 'true';
        element.style.cursor = 'pointer';
        element.setAttribute('title', 'Abrir o meu portefólio');
        if (element.tagName === 'A') element.setAttribute('href', portfolioHref);
    }

    function markGreetingLinks(root = document) {
        if (!root) return;

        if (root.nodeType === Node.ELEMENT_NODE && isSafeCandidate(root)) {
            decorateGreetingElement(root);
        }

        if (!root.querySelectorAll) return;
        root.querySelectorAll(SCAN_SELECTOR).forEach(element => {
            if (isSafeCandidate(element)) decorateGreetingElement(element);
        });
    }

    function goToPortfolio(event) {
        const greetingElement = findGreetingElement(event.target);
        if (!greetingElement) return;

        event.preventDefault();
        event.stopPropagation();
        window.location.href = portfolioHref;
    }

    function scheduleInitialScans() {
        const run = () => markGreetingLinks(document);
        run();
        window.setTimeout(run, 250);
        window.setTimeout(run, 1000);
        window.setTimeout(run, 2500);
    }

    document.addEventListener('click', goToPortfolio, true);

    if (document.body) {
        scheduleInitialScans();

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) markGreetingLinks(node);
                });

                if (mutation.type === 'characterData' && mutation.target?.parentElement) {
                    markGreetingLinks(mutation.target.parentElement);
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true, characterData: true });

        // Depois do cabeçalho estar injetado, não vale a pena manter observação eterna num form enorme.
        window.setTimeout(() => observer.disconnect(), 10000);
    } else {
        document.addEventListener('DOMContentLoaded', scheduleInitialScans, { once: true });
    }
})();
