// Liga o cumprimento "Olá..." da barra superior ao portefólio do utilizador.
// Fica isolado para não tocar no design nem na lógica principal do formulário.
(function setupPortfolioGreetingLink() {
    const portfolioHref = '../myportefolio.html';
    const GREETING_TEXT_RE = /\b(olá|ola)\s*,?/i;
    const BLOCK_TEXT_RE = /\bsair\b|logout|terminar sessão|terminar sessao/i;
    const MAX_ASCENT_STEPS = 8;

    function getCleanText(element) {
        return (element && element.textContent ? element.textContent : '').replace(/\s+/g, ' ').trim();
    }

    function isGreetingText(text) {
        return GREETING_TEXT_RE.test(text) && !BLOCK_TEXT_RE.test(text);
    }

    function isSafeCandidate(element) {
        if (!element || element === document.body || element === document.documentElement) return false;
        const tag = (element.tagName || '').toLowerCase();
        if (['input', 'textarea', 'select', 'option'].includes(tag)) return false;
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

    function goToPortfolio(event) {
        const greetingElement = findGreetingElement(event.target);
        if (!greetingElement) return;

        event.preventDefault();
        event.stopPropagation();
        window.location.href = portfolioHref;
    }

    function markGreetingLinks(root = document) {
        const candidates = root.querySelectorAll ? root.querySelectorAll('*') : [];
        candidates.forEach(element => {
            if (!isSafeCandidate(element)) return;
            element.dataset.portfolioLink = 'true';
            element.style.cursor = 'pointer';
            element.setAttribute('title', 'Abrir o meu portefólio');
            if (element.tagName === 'A') element.setAttribute('href', portfolioHref);
        });
    }

    document.addEventListener('click', goToPortfolio, true);

    if (document.body) {
        markGreetingLinks(document);
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) markGreetingLinks(node);
                });
            }
            markGreetingLinks(document);
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => markGreetingLinks(document), { once: true });
    }
})();
