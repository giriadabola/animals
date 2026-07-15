export function initScientificClassificationToggles(root = document) {
    root.querySelectorAll('[data-classification-toggle]').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const detailsId = toggle.getAttribute('aria-controls');
            const details = detailsId ? root.querySelector(`#${detailsId}`) : null;
            if (!details) return;
            const card = toggle.closest('.scientific-classification-card');
            const primary = card?.querySelector('.scientific-classification-primary');

            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            const nextExpandedState = !isExpanded;

            toggle.setAttribute('aria-expanded', String(nextExpandedState));
            if (primary) primary.hidden = nextExpandedState;
            details.hidden = !nextExpandedState;
            toggle.classList.toggle('is-expanded', nextExpandedState);

            const label = toggle.querySelector('[data-classification-toggle-label]');
            const nextLabel = nextExpandedState
                ? 'Mostrar menos'
                : 'Ver classificação completa';
            if (label) label.textContent = nextLabel;
            toggle.setAttribute('aria-label', nextLabel);
            toggle.setAttribute('title', nextLabel);
        });
    });
}
