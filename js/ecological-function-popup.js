import {
    ecologicalFunctionCatalog,
    ecologicalFunctionDescriptions,
    getEcologicalFunctionMeta,
    getEcologicalFunctionSvg,
    normalizeEcologicalFunctionKey
} from './ecological-functions.js?v=2';

const ecologicalCatalog = [...ecologicalFunctionCatalog].sort((a, b) => a.label.localeCompare(b.label, 'pt-PT', { sensitivity: 'base' }));
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

function resolveFunction(value) {
    const label = String(value || '').trim();
    const catalogItem = ecologicalCatalog.find(item => normalizeEcologicalFunctionKey(item.label) === normalizeEcologicalFunctionKey(label));
    const canonicalLabel = catalogItem?.label || label;
    const meta = getEcologicalFunctionMeta(canonicalLabel);
    return {
        label: canonicalLabel || 'Função Ecológica',
        description: ecologicalFunctionDescriptions[canonicalLabel] || 'Desempenha uma função importante no equilíbrio do ecossistema.',
        icon: getEcologicalFunctionSvg(meta.key)
    };
}

function readSelectedFunctions(trigger) {
    try {
        const values = JSON.parse(trigger.dataset.ecologyFunctions || '[]');
        return [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch {
        return [];
    }
}

function renderSelectedFunction(item) {
    return `
        <article class="ecology-function-selected-item">
            <div class="ecology-function-popup-icon">${item.icon}</div>
            <div class="ecology-function-popup-copy">
                <strong>${escapeHtml(item.label)}</strong>
                <p>${escapeHtml(item.description)}</p>
            </div>
        </article>`;
}

function renderInactiveFunction(item) {
    return `
        <article class="ecology-function-catalog-item" title="${escapeHtml(item.description)}">
            <div class="ecology-function-popup-icon ecology-function-catalog-icon">${item.icon}</div>
            <div class="ecology-function-popup-copy ecology-function-catalog-copy">
                <strong>${escapeHtml(item.label)}</strong>
                <p>${escapeHtml(item.description)}</p>
            </div>
        </article>`;
}

function closeEcologicalFunctionPopup() {
    const popup = document.getElementById('ecological-function-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openEcologicalFunctionPopup(trigger) {
    closeEcologicalFunctionPopup();

    const selectedFunctions = readSelectedFunctions(trigger).map(resolveFunction);
    const selectedKeys = new Set(selectedFunctions.map(item => normalizeEcologicalFunctionKey(item.label)));
    const inactiveFunctions = ecologicalCatalog
        .filter(item => !selectedKeys.has(normalizeEcologicalFunctionKey(item.label)))
        .map(item => resolveFunction(item.label));

    const popup = document.createElement('div');
    popup.id = 'ecological-function-modal';
    popup.className = 'conservation-status-modal-backdrop ecological-function-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal ecological-function-modal" role="dialog" aria-modal="true" aria-label="Função Ecológica">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Modelo ecológico</span>
                    <h2>Função Ecológica</h2>
                    <p>As funções apresentadas no topo pertencem a este animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="ecology-function-selected-panel" aria-labelledby="ecology-function-selected-title">
                <h3 id="ecology-function-selected-title">Funções deste animal</h3>
                <div class="ecology-function-selected-list">
                    ${selectedFunctions.length ? selectedFunctions.map(renderSelectedFunction).join('') : '<p class="ecology-function-empty">Não foi indicada uma função ecológica específica.</p>'}
                </div>
            </section>
            <section class="ecology-function-catalog-panel" aria-labelledby="ecology-function-catalog-title">
                <h3 id="ecology-function-catalog-title">Outras funções ecológicas</h3>
                <div class="ecology-function-catalog-grid">${inactiveFunctions.map(renderInactiveFunction).join('')}</div>
            </section>
        </section>`;
    popup.__trigger = trigger;

    const closeButton = popup.querySelector('.conservation-status-modal-close');
    closeButton.addEventListener('click', closeEcologicalFunctionPopup);
    popup.addEventListener('click', event => {
        if (event.target === popup) closeEcologicalFunctionPopup();
    });
    popup.__handleEscape = event => {
        if (event.key === 'Escape') closeEcologicalFunctionPopup();
    };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    closeButton.focus();
}

export function initEcologicalFunctionPopup(root = document) {
    root.querySelectorAll('[data-ecology-function-popup]').forEach(trigger => {
        if (trigger.dataset.ecologyPopupReady === 'true') return;
        trigger.dataset.ecologyPopupReady = 'true';
        trigger.addEventListener('click', () => openEcologicalFunctionPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openEcologicalFunctionPopup(trigger);
            }
        });
    });
}
