import { feedingTypes, feedingTypeDescriptions, getFeedingModelSvg, getFeedingVisualMeta } from './feeding-visuals.js';

const feedingCatalog = [...feedingTypes].sort((a, b) => a.localeCompare(b, 'pt-PT', { sensitivity: 'base' }));

const normalizeFeedingType = (value = '') => String(value).trim().toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

function resolveFeedingType(value) {
    const label = String(value || '').trim();
    const canonical = feedingCatalog.find(type => normalizeFeedingType(type) === normalizeFeedingType(label)) || label;
    const meta = getFeedingVisualMeta(canonical);
    return {
        label: canonical || 'Alimentação',
        description: feedingTypeDescriptions[canonical] || 'Tipo de alimentação específico deste animal.',
        meta,
        icon: getFeedingModelSvg(meta.key)
    };
}

function readSelectedTypes(trigger) {
    try {
        const values = JSON.parse(trigger.dataset.feedingTypes || '[]');
        return [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch {
        return [];
    }
}

function renderSelectedType(type) {
    return `
        <article class="feeding-type-selected-item">
            <div class="feeding-type-popup-icon">${type.icon}</div>
            <div class="feeding-type-popup-copy">
                <strong>${escapeHtml(type.label)}</strong>
                <p>${escapeHtml(type.description)}</p>
            </div>
        </article>`;
}

function renderInactiveType(type) {
    return `
        <article class="feeding-type-selected-item feeding-type-catalog-item" title="${escapeHtml(type.description)}">
            <div class="feeding-type-popup-icon feeding-type-catalog-icon">${type.icon}</div>
            <div class="feeding-type-popup-copy feeding-type-catalog-copy">
                <strong>${escapeHtml(type.label)}</strong>
                <p>${escapeHtml(type.description)}</p>
            </div>
        </article>`;
}

function closeFeedingTypePopup() {
    const popup = document.getElementById('feeding-type-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openFeedingTypePopup(trigger) {
    closeFeedingTypePopup();

    const selectedTypes = readSelectedTypes(trigger).map(resolveFeedingType);
    const selectedKeys = new Set(selectedTypes.map(type => normalizeFeedingType(type.label)));
    const inactiveTypes = feedingCatalog
        .filter(type => !selectedKeys.has(normalizeFeedingType(type)))
        .map(resolveFeedingType);

    const popup = document.createElement('div');
    popup.id = 'feeding-type-modal';
    popup.className = 'conservation-status-modal-backdrop feeding-type-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal feeding-type-modal" role="dialog" aria-modal="true" aria-label="Alimentação">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Modelo de alimentação</span>
                    <h2>Alimentação</h2>
                    <p>Os tipos apresentados no topo pertencem a este animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="feeding-type-selected-panel" aria-labelledby="feeding-type-selected-title">
                <h3 id="feeding-type-selected-title">Tipos de alimentação deste animal</h3>
                <div class="feeding-type-selected-list">
                    ${selectedTypes.length ? selectedTypes.map(renderSelectedType).join('') : '<p class="feeding-type-empty">Não foi indicado um tipo de alimentação específico.</p>'}
                </div>
            </section>
            <section class="feeding-type-catalog-panel" aria-labelledby="feeding-type-catalog-title">
                <h3 id="feeding-type-catalog-title">Outros tipos de alimentação</h3>
                <div class="feeding-type-catalog-grid">
                    ${inactiveTypes.map(renderInactiveType).join('')}
                </div>
            </section>
        </section>`;
    popup.__trigger = trigger;

    const closeButton = popup.querySelector('.conservation-status-modal-close');
    closeButton.addEventListener('click', closeFeedingTypePopup);
    popup.addEventListener('click', event => {
        if (event.target === popup) closeFeedingTypePopup();
    });
    popup.__handleEscape = event => {
        if (event.key === 'Escape') closeFeedingTypePopup();
    };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    closeButton.focus();
}

export function initFeedingTypePopup(root = document) {
    root.querySelectorAll('[data-feeding-type-popup]').forEach(trigger => {
        if (trigger.dataset.feedingPopupReady === 'true') return;
        trigger.dataset.feedingPopupReady = 'true';
        trigger.addEventListener('click', () => openFeedingTypePopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openFeedingTypePopup(trigger);
            }
        });
    });
}
