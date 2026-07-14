import { perceptionTypes, perceptionDescriptions, getPerceptionVisualMeta, getPerceptionModelSvg } from './perception-visuals.js';

const perceptionCatalog = [...perceptionTypes].sort((a, b) => a.localeCompare(b, 'pt-PT', { sensitivity: 'base' }));

const normalizePerceptionType = (value = '') => String(value)
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

function resolvePerceptionType(value) {
    const label = String(value || '').trim();
    const canonical = perceptionCatalog.find(type => normalizePerceptionType(type) === normalizePerceptionType(label)) || label;
    const meta = getPerceptionVisualMeta(canonical);
    return {
        label: canonical || 'Tipo de perceção',
        description: perceptionDescriptions[canonical] || 'Tipo de perceção específico deste animal.',
        icon: getPerceptionModelSvg(meta.key)
    };
}

function readSelectedTypes(trigger) {
    try {
        const values = JSON.parse(trigger.dataset.perceptionTypes || '[]');
        return [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch {
        return [];
    }
}

function renderPerceptionItem(type, inactive = false) {
    return `
        <article class="perception-type-item${inactive ? ' perception-type-catalog-item' : ''}" title="${escapeHtml(type.description)}">
            <div class="perception-type-popup-icon">${type.icon}</div>
            <div class="perception-type-popup-copy">
                <strong>${escapeHtml(type.label)}</strong>
                <p>${escapeHtml(type.description)}</p>
            </div>
        </article>`;
}

function closePerceptionTypePopup() {
    const popup = document.getElementById('perception-type-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openPerceptionTypePopup(trigger) {
    closePerceptionTypePopup();

    const selectedTypes = readSelectedTypes(trigger).map(resolvePerceptionType);
    const selectedKeys = new Set(selectedTypes.map(type => normalizePerceptionType(type.label)));
    const inactiveTypes = perceptionCatalog
        .filter(type => !selectedKeys.has(normalizePerceptionType(type)))
        .map(resolvePerceptionType);

    const popup = document.createElement('div');
    popup.id = 'perception-type-modal';
    popup.className = 'conservation-status-modal-backdrop perception-type-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal perception-type-modal" role="dialog" aria-modal="true" aria-label="Tipo de perceção">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Modelo de perceção</span>
                    <h2>Tipo de perceção</h2>
                    <p>Os tipos apresentados no topo pertencem a este animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="perception-type-selected-panel" aria-labelledby="perception-type-selected-title">
                <h3 id="perception-type-selected-title">Tipos de perceção deste animal</h3>
                <div class="perception-type-list">
                    ${selectedTypes.length ? selectedTypes.map(type => renderPerceptionItem(type)).join('') : '<p class="perception-type-empty">Não foi indicado um tipo de perceção específico.</p>'}
                </div>
            </section>
            <section class="perception-type-catalog-panel" aria-labelledby="perception-type-catalog-title">
                <h3 id="perception-type-catalog-title">Outros tipos de perceção</h3>
                <div class="perception-type-catalog-grid">
                    ${inactiveTypes.map(type => renderPerceptionItem(type, true)).join('')}
                </div>
            </section>
        </section>`;
    popup.__trigger = trigger;

    const closeButton = popup.querySelector('.conservation-status-modal-close');
    closeButton.addEventListener('click', closePerceptionTypePopup);
    popup.addEventListener('click', event => {
        if (event.target === popup) closePerceptionTypePopup();
    });
    popup.__handleEscape = event => {
        if (event.key === 'Escape') closePerceptionTypePopup();
    };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    closeButton.focus();
}

export function initPerceptionTypePopup(root = document) {
    root.querySelectorAll('[data-perception-type-popup]').forEach(trigger => {
        if (trigger.dataset.perceptionPopupReady === 'true') return;
        trigger.dataset.perceptionPopupReady = 'true';
        trigger.addEventListener('click', () => openPerceptionTypePopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPerceptionTypePopup(trigger);
            }
        });
    });
}
