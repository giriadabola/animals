import { communicationTypeCatalog } from './communication-catalog.js?v=1';
import { getCommunicationModelSvg } from './communication-visuals.js?v=2';

const communicationCatalog = [...communicationTypeCatalog].sort((a, b) => a.label.localeCompare(b.label, 'pt-PT', { sensitivity: 'base' }));
const normalizeCommunicationType = value => String(value).trim().toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

function resolveCommunicationType(value) {
    const label = String(value || '').trim();
    const catalogItem = communicationCatalog.find(item => normalizeCommunicationType(item.label) === normalizeCommunicationType(label));
    const canonical = catalogItem?.label || label;
    return {
        label: canonical || 'Tipo de Comunicação',
        description: catalogItem?.description || 'Tipo de comunicação específico deste animal.',
        icon: getCommunicationModelSvg(canonical)
    };
}

function readSelectedTypes(trigger) {
    try {
        const values = JSON.parse(trigger.dataset.communicationTypes || '[]');
        return [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch {
        return [];
    }
}

function renderSelectedType(type) {
    return `
        <article class="communication-type-selected-item">
            <div class="communication-type-popup-icon">${type.icon}</div>
            <div class="communication-type-popup-copy">
                <strong>${escapeHtml(type.label)}</strong>
                <p>${escapeHtml(type.description)}</p>
            </div>
        </article>`;
}

function renderInactiveType(type) {
    return `
        <article class="communication-type-catalog-item" title="${escapeHtml(type.description)}">
            <div class="communication-type-popup-icon communication-type-catalog-icon">${type.icon}</div>
            <div class="communication-type-popup-copy communication-type-catalog-copy">
                <strong>${escapeHtml(type.label)}</strong>
                <p>${escapeHtml(type.description)}</p>
            </div>
        </article>`;
}

function closeCommunicationTypePopup() {
    const popup = document.getElementById('communication-type-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openCommunicationTypePopup(trigger) {
    closeCommunicationTypePopup();

    const selectedTypes = readSelectedTypes(trigger).map(resolveCommunicationType);
    const selectedKeys = new Set(selectedTypes.map(type => normalizeCommunicationType(type.label)));
    const inactiveTypes = communicationCatalog
        .filter(type => !selectedKeys.has(normalizeCommunicationType(type.label)))
        .map(type => resolveCommunicationType(type.label));

    const popup = document.createElement('div');
    popup.id = 'communication-type-modal';
    popup.className = 'conservation-status-modal-backdrop communication-type-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal communication-type-modal" role="dialog" aria-modal="true" aria-label="Tipo de Comunicação">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Modelo de comunicação</span>
                    <h2>Tipo de Comunicação</h2>
                    <p>Os tipos apresentados no topo pertencem a este animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="communication-type-selected-panel" aria-labelledby="communication-type-selected-title">
                <h3 id="communication-type-selected-title">Tipos de comunicação deste animal</h3>
                <div class="communication-type-selected-list">
                    ${selectedTypes.length ? selectedTypes.map(renderSelectedType).join('') : '<p class="communication-type-empty">Não foi indicado um tipo de comunicação específico.</p>'}
                </div>
            </section>
            <section class="communication-type-catalog-panel" aria-labelledby="communication-type-catalog-title">
                <h3 id="communication-type-catalog-title">Outros tipos de comunicação</h3>
                <div class="communication-type-catalog-list">
                    ${inactiveTypes.map(renderInactiveType).join('')}
                </div>
            </section>
        </section>`;
    popup.__trigger = trigger;

    const closeButton = popup.querySelector('.conservation-status-modal-close');
    closeButton.addEventListener('click', closeCommunicationTypePopup);
    popup.addEventListener('click', event => {
        if (event.target === popup) closeCommunicationTypePopup();
    });
    popup.__handleEscape = event => {
        if (event.key === 'Escape') closeCommunicationTypePopup();
    };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    closeButton.focus();
}

export function initCommunicationTypePopup(root = document) {
    root.querySelectorAll('[data-communication-type-popup]').forEach(trigger => {
        if (trigger.dataset.communicationPopupReady === 'true') return;
        trigger.dataset.communicationPopupReady = 'true';
        trigger.addEventListener('click', () => openCommunicationTypePopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCommunicationTypePopup(trigger);
            }
        });
    });
}
