import { locomotionCatalog, getLocomotionMeta, getLocomotionSvg, normalizeLocomotionKey } from './locomotion-visuals.js';

const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

const locomotionDescriptions = {
    Quadrúpede: 'Desloca-se usando quatro membros de apoio.',
    Bípede: 'Desloca-se principalmente sobre dois membros.',
    Saltador: 'Move-se através de saltos, usando impulsos rápidos dos membros.',
    Rastejante: 'Desloca-se mantendo o corpo muito próximo do substrato.',
    Serpentino: 'Avança através de ondulações do corpo, como uma serpente.',
    Nadador: 'Desloca-se na água através de movimentos do corpo, barbatanas ou membros.',
    Voador: 'Desloca-se activamente pelo ar através de estruturas de voo.',
    Planador: 'Desloca-se pelo ar sem voo activo contínuo, aproveitando superfícies de sustentação.',
    Trepador: 'Desloca-se sobre troncos, ramos ou outras superfícies verticais.',
    'Escavador / Fossorial': 'Desloca-se no solo ou em galerias subterrâneas que escava ou utiliza.',
    Cursorial: 'Está adaptado a deslocações rápidas e prolongadas em terreno aberto.',
    Ambulante: 'Desloca-se caminhando sobre uma superfície, com apoio sucessivo dos membros.',
    'Sésil': 'Permanece fixo ou quase fixo, sem deslocação activa significativa.'
};

function resolveLocomotion(value) {
    const label = String(value || '').trim();
    const item = locomotionCatalog.find(option => normalizeLocomotionKey(option.label) === normalizeLocomotionKey(label));
    const canonical = item?.label || label;
    const meta = getLocomotionMeta(canonical);
    return { label: canonical || 'Locomoção', key: meta.key, description: locomotionDescriptions[canonical] || 'Forma de deslocação característica deste animal.' };
}

function renderLocomotionItem(item, inactive = false) {
    return `<article class="perception-type-item${inactive ? ' perception-type-catalog-item' : ''}" title="${escapeHtml(item.description)}">
        <div class="perception-type-popup-icon">${getLocomotionSvg(item.key)}</div>
        <div class="perception-type-popup-copy"><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.description)}</p></div>
    </article>`;
}

function closeLocomotionPopup() {
    const popup = document.getElementById('locomotion-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openLocomotionPopup(trigger) {
    closeLocomotionPopup();
    let selected = [];
    try {
        const values = JSON.parse(trigger.dataset.locomotionTypes || '[]');
        selected = [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch { /* Mantém a lista vazia quando o atributo não contém JSON válido. */ }
    const selectedItems = selected.map(resolveLocomotion);
    const selectedKeys = new Set(selectedItems.map(item => normalizeLocomotionKey(item.label)));
    const otherItems = locomotionCatalog.filter(item => !selectedKeys.has(normalizeLocomotionKey(item.label))).map(item => resolveLocomotion(item.label));
    const popup = document.createElement('div');
    popup.id = 'locomotion-modal';
    popup.className = 'conservation-status-modal-backdrop perception-type-modal-backdrop';
    popup.innerHTML = `<section class="conservation-status-modal perception-type-modal" role="dialog" aria-modal="true" aria-label="Locomoção">
        <div class="conservation-status-modal-heading"><div><span class="conservation-status-modal-kicker">Modelo de locomoção</span><h2>Locomoção</h2><p>O tipo apresentado no topo pertence a este animal.</p></div><button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button></div>
        <section class="perception-type-selected-panel" aria-labelledby="locomotion-selected-title"><h3 id="locomotion-selected-title">Locomoção deste animal</h3><div class="perception-type-list">${selectedItems.length ? selectedItems.map(item => renderLocomotionItem(item)).join('') : '<p class="perception-type-empty">Não foi indicado um tipo de locomoção específico.</p>'}</div></section>
        <section class="perception-type-catalog-panel" aria-labelledby="locomotion-catalog-title"><h3 id="locomotion-catalog-title">Outros tipos de locomoção</h3><div class="perception-type-catalog-grid">${otherItems.map(item => renderLocomotionItem(item, true)).join('')}</div></section>
    </section>`;
    popup.__trigger = trigger;
    popup.querySelector('.conservation-status-modal-close').addEventListener('click', closeLocomotionPopup);
    popup.addEventListener('click', event => { if (event.target === popup) closeLocomotionPopup(); });
    popup.__handleEscape = event => { if (event.key === 'Escape') closeLocomotionPopup(); };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    popup.querySelector('.conservation-status-modal-close').focus();
}

export function initLocomotionPopup(root = document) {
    root.querySelectorAll('[data-locomotion-popup]').forEach(trigger => {
        if (trigger.dataset.locomotionPopupReady === 'true') return;
        trigger.dataset.locomotionPopupReady = 'true';
        trigger.addEventListener('click', () => openLocomotionPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLocomotionPopup(trigger); }
        });
    });
}
