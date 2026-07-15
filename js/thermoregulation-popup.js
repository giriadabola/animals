import { getGeneralModelSvg } from './general-visual-catalog.js';

const thermoregulationCatalog = [
    { label: 'Endotérmico', description: 'Produz calor internamente e mantém a temperatura corporal relativamente estável.' },
    { label: 'Ectotérmico', description: 'Depende sobretudo de fontes externas de calor para regular a temperatura corporal.' },
    { label: 'Heterotérmico', description: 'Pode alternar entre diferentes níveis de regulação da temperatura corporal.' },
    { label: 'Homeotérmico', description: 'Mantém a temperatura corporal dentro de uma faixa relativamente constante.' },
    { label: 'Poiquilotérmico', description: 'A temperatura corporal varia de forma significativa com o ambiente.' },
    { label: 'Regionalmente endotérmico', description: 'Mantém apenas determinadas regiões do corpo aquecidas internamente.' }
];

const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-PT')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function resolveThermoregulation(value) {
    const label = String(value || '').trim();
    return thermoregulationCatalog.find(item => normalize(item.label) === normalize(label))
        || { label: label || 'Termorregulação', description: 'Tipo de termorregulação específico deste animal.' };
}

function renderThermoregulationItem(item, inactive = false) {
    return `
        <article class="perception-type-item${inactive ? ' perception-type-catalog-item' : ''}" title="${escapeHtml(item.description)}">
            <div class="perception-type-popup-icon">${getGeneralModelSvg('termorregulacao')}</div>
            <div class="perception-type-popup-copy">
                <strong>${escapeHtml(item.label)}</strong>
                <p>${escapeHtml(item.description)}</p>
            </div>
        </article>`;
}

function closeThermoregulationPopup() {
    const popup = document.getElementById('thermoregulation-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openThermoregulationPopup(trigger) {
    closeThermoregulationPopup();
    let selected = [];
    try {
        const values = JSON.parse(trigger.dataset.thermoregulationTypes || '[]');
        selected = [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch { /* Mantém a lista vazia quando o atributo não contém JSON válido. */ }

    const selectedItems = selected.map(resolveThermoregulation);
    const selectedKeys = new Set(selectedItems.map(item => normalize(item.label)));
    const otherItems = thermoregulationCatalog.filter(item => !selectedKeys.has(normalize(item.label)));
    const popup = document.createElement('div');
    popup.id = 'thermoregulation-modal';
    popup.className = 'conservation-status-modal-backdrop perception-type-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal perception-type-modal" role="dialog" aria-modal="true" aria-label="Termorregulação">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Modelo de termorregulação</span>
                    <h2>Termorregulação</h2>
                    <p>O tipo apresentado no topo pertence a este animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="perception-type-selected-panel" aria-labelledby="thermoregulation-selected-title">
                <h3 id="thermoregulation-selected-title">Termorregulação deste animal</h3>
                <div class="perception-type-list">
                    ${selectedItems.length ? selectedItems.map(item => renderThermoregulationItem(item)).join('') : '<p class="perception-type-empty">Não foi indicada uma forma de termorregulação específica.</p>'}
                </div>
            </section>
            <section class="perception-type-catalog-panel" aria-labelledby="thermoregulation-catalog-title">
                <h3 id="thermoregulation-catalog-title">Outros tipos de termorregulação</h3>
                <div class="perception-type-catalog-grid">${otherItems.map(item => renderThermoregulationItem(item, true)).join('')}</div>
            </section>
        </section>`;
    popup.__trigger = trigger;
    popup.querySelector('.conservation-status-modal-close').addEventListener('click', closeThermoregulationPopup);
    popup.addEventListener('click', event => { if (event.target === popup) closeThermoregulationPopup(); });
    popup.__handleEscape = event => { if (event.key === 'Escape') closeThermoregulationPopup(); };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    popup.querySelector('.conservation-status-modal-close').focus();
}

export function initThermoregulationPopup(root = document) {
    root.querySelectorAll('[data-thermoregulation-popup]').forEach(trigger => {
        if (trigger.dataset.thermoregulationPopupReady === 'true') return;
        trigger.dataset.thermoregulationPopupReady = 'true';
        trigger.addEventListener('click', () => openThermoregulationPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openThermoregulationPopup(trigger);
            }
        });
    });
}
