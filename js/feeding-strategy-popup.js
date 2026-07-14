import {
    feedingStrategies,
    feedingStrategyDescriptions,
    getFeedingStrategyMeta,
    getFeedingStrategySvg
} from './feeding-strategies.js?v=20260714_strategy_popup';

const strategyCatalog = [...feedingStrategies].sort((a, b) => a.localeCompare(b, 'pt-PT', { sensitivity: 'base' }));

const normalizeStrategy = (value = '') => String(value)
    .trim()
    .toLocaleLowerCase('pt-PT')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

function resolveStrategy(value) {
    const label = String(value || '').trim();
    const canonical = strategyCatalog.find(strategy => normalizeStrategy(strategy) === normalizeStrategy(label)) || label;
    const meta = getFeedingStrategyMeta(canonical);
    return {
        label: canonical || 'Estratégia alimentar',
        description: feedingStrategyDescriptions[canonical] || 'Forma de obter alimento utilizada por este animal.',
        meta,
        icon: getFeedingStrategySvg(meta.key)
    };
}

function readSelectedStrategies(trigger) {
    try {
        const values = JSON.parse(trigger.dataset.feedingStrategies || '[]');
        return [...new Set((Array.isArray(values) ? values : [])
            .map(value => String(value).trim())
            .filter(Boolean))];
    } catch {
        return [];
    }
}

function renderSelectedStrategy(strategy) {
    return `
        <article class="feeding-type-selected-item">
            <div class="feeding-type-popup-icon">${strategy.icon}</div>
            <div class="feeding-type-popup-copy">
                <strong>${escapeHtml(strategy.label)}</strong>
                <p>${escapeHtml(strategy.description)}</p>
            </div>
        </article>`;
}

function renderInactiveStrategy(strategy) {
    return `
        <article class="feeding-type-selected-item feeding-type-catalog-item" title="${escapeHtml(strategy.description)}">
            <div class="feeding-type-popup-icon feeding-type-catalog-icon">${strategy.icon}</div>
            <div class="feeding-type-popup-copy feeding-type-catalog-copy">
                <strong>${escapeHtml(strategy.label)}</strong>
                <p>${escapeHtml(strategy.description)}</p>
            </div>
        </article>`;
}

function closeFeedingStrategyPopup() {
    const popup = document.getElementById('feeding-strategy-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openFeedingStrategyPopup(trigger) {
    closeFeedingStrategyPopup();

    const selectedStrategies = readSelectedStrategies(trigger).map(resolveStrategy);
    const selectedKeys = new Set(selectedStrategies.map(strategy => normalizeStrategy(strategy.label)));
    const inactiveStrategies = strategyCatalog
        .filter(strategy => !selectedKeys.has(normalizeStrategy(strategy)))
        .map(resolveStrategy);

    const popup = document.createElement('div');
    popup.id = 'feeding-strategy-modal';
    popup.className = 'conservation-status-modal-backdrop feeding-strategy-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal feeding-type-modal feeding-strategy-modal" role="dialog" aria-modal="true" aria-label="Estratégias para obter alimentos">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Modelo de alimentação</span>
                    <h2>Estratégia para obter alimentos</h2>
                    <p>As estratégias apresentadas no topo pertencem a este animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="feeding-type-selected-panel" aria-labelledby="feeding-strategy-selected-title">
                <h3 id="feeding-strategy-selected-title">Estratégias deste animal</h3>
                <div class="feeding-type-selected-list">
                    ${selectedStrategies.length ? selectedStrategies.map(renderSelectedStrategy).join('') : '<p class="feeding-type-empty">Não foi indicada uma estratégia específica.</p>'}
                </div>
            </section>
            <section class="feeding-type-catalog-panel" aria-labelledby="feeding-strategy-catalog-title">
                <h3 id="feeding-strategy-catalog-title">Outras estratégias</h3>
                <div class="feeding-type-catalog-grid">
                    ${inactiveStrategies.map(renderInactiveStrategy).join('')}
                </div>
            </section>
        </section>`;
    popup.__trigger = trigger;

    const closeButton = popup.querySelector('.conservation-status-modal-close');
    closeButton.addEventListener('click', closeFeedingStrategyPopup);
    popup.addEventListener('click', event => {
        if (event.target === popup) closeFeedingStrategyPopup();
    });
    popup.__handleEscape = event => {
        if (event.key === 'Escape') closeFeedingStrategyPopup();
    };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    closeButton.focus();
}

export function initFeedingStrategyPopup(root = document) {
    root.querySelectorAll('[data-feeding-strategy-popup]').forEach(trigger => {
        if (trigger.dataset.feedingStrategyPopupReady === 'true') return;
        trigger.dataset.feedingStrategyPopupReady = 'true';
        trigger.addEventListener('click', () => openFeedingStrategyPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openFeedingStrategyPopup(trigger);
            }
        });
    });
}
