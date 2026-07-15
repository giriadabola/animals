import { getGeneralModelSvg } from './general-visual-catalog.js';

const skeletonCatalog = [
    { label: 'Ósseo', description: 'Esqueleto interno formado principalmente por ossos.' },
    { label: 'Cartilagíneo', description: 'Esqueleto interno formado principalmente por cartilagem.' },
    { label: 'Exoesqueleto', description: 'Estrutura rígida externa que protege e sustenta o corpo.' },
    { label: 'Hidroesqueleto', description: 'Sustentação corporal assegurada por fluidos sob pressão.' },
    { label: 'Ausente', description: 'Não existe uma estrutura esquelética especializada.' }
];

const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-PT')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function resolveSkeletonType(value) {
    const label = String(value || '').trim();
    return skeletonCatalog.find(item => normalize(item.label) === normalize(label))
        || { label: label || 'Tipo de esqueleto', description: 'Tipo de esqueleto específico deste animal.' };
}

function renderSkeletonItem(item, inactive = false) {
    return `
        <article class="perception-type-item${inactive ? ' perception-type-catalog-item' : ''}" title="${escapeHtml(item.description)}">
            <div class="perception-type-popup-icon">${getGeneralModelSvg('tipo-esqueleto')}</div>
            <div class="perception-type-popup-copy">
                <strong>${escapeHtml(item.label)}</strong>
                <p>${escapeHtml(item.description)}</p>
            </div>
        </article>`;
}

function closeSkeletonTypePopup() {
    const popup = document.getElementById('skeleton-type-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openSkeletonTypePopup(trigger) {
    closeSkeletonTypePopup();
    let selected = [];
    try {
        const values = JSON.parse(trigger.dataset.skeletonTypes || '[]');
        selected = [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch { /* Mantém a lista vazia quando o atributo não contém JSON válido. */ }

    const selectedItems = selected.map(resolveSkeletonType);
    const selectedKeys = new Set(selectedItems.map(item => normalize(item.label)));
    const otherItems = skeletonCatalog.filter(item => !selectedKeys.has(normalize(item.label)));
    const popup = document.createElement('div');
    popup.id = 'skeleton-type-modal';
    popup.className = 'conservation-status-modal-backdrop perception-type-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal perception-type-modal" role="dialog" aria-modal="true" aria-label="Tipo de esqueleto">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Modelo do esqueleto</span>
                    <h2>Tipo de esqueleto</h2>
                    <p>O tipo apresentado no topo pertence a este animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="perception-type-selected-panel" aria-labelledby="skeleton-type-selected-title">
                <h3 id="skeleton-type-selected-title">Tipo de esqueleto deste animal</h3>
                <div class="perception-type-list">
                    ${selectedItems.length ? selectedItems.map(item => renderSkeletonItem(item)).join('') : '<p class="perception-type-empty">Não foi indicado um tipo de esqueleto específico.</p>'}
                </div>
            </section>
            <section class="perception-type-catalog-panel" aria-labelledby="skeleton-type-catalog-title">
                <h3 id="skeleton-type-catalog-title">Outros tipos de esqueleto</h3>
                <div class="perception-type-catalog-grid">${otherItems.map(item => renderSkeletonItem(item, true)).join('')}</div>
            </section>
        </section>`;
    popup.__trigger = trigger;
    popup.querySelector('.conservation-status-modal-close').addEventListener('click', closeSkeletonTypePopup);
    popup.addEventListener('click', event => { if (event.target === popup) closeSkeletonTypePopup(); });
    popup.__handleEscape = event => { if (event.key === 'Escape') closeSkeletonTypePopup(); };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    popup.querySelector('.conservation-status-modal-close').focus();
}

export function initSkeletonTypePopup(root = document) {
    root.querySelectorAll('[data-skeleton-type-popup]').forEach(trigger => {
        if (trigger.dataset.skeletonPopupReady === 'true') return;
        trigger.dataset.skeletonPopupReady = 'true';
        trigger.addEventListener('click', () => openSkeletonTypePopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openSkeletonTypePopup(trigger);
            }
        });
    });
}
