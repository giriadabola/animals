import { kinshipLineageOptions, getKinshipLineageMeta, getKinshipLineageDescription, getKinshipLineageSvg } from './kinship-lineage-visuals.js';

const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function resolve(value) {
    const meta = getKinshipLineageMeta(value);
    return { label: meta.label, description: getKinshipLineageDescription(meta.label), icon: getKinshipLineageSvg(meta.label) };
}
function renderItem(item, inactive = false) {
    return `<article class="perception-type-item${inactive ? ' perception-type-catalog-item' : ''}" title="${escapeHtml(item.description)}"><div class="perception-type-popup-icon">${item.icon}</div><div class="perception-type-popup-copy"><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.description)}</p></div></article>`;
}
function closePopup() {
    const popup = document.getElementById('kinship-lineage-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}
function openPopup(trigger) {
    closePopup();
    let selected = [];
    try { const values = JSON.parse(trigger.dataset.kinshipLineageTypes || '[]'); selected = [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))]; } catch { /* Lista vazia para dados inválidos. */ }
    const selectedItems = selected.map(resolve);
    const selectedKeys = new Set(selectedItems.map(item => normalize(item.label)));
    const otherItems = kinshipLineageOptions.filter(label => !selectedKeys.has(normalize(label))).map(resolve);
    const popup = document.createElement('div');
    popup.id = 'kinship-lineage-modal';
    popup.className = 'conservation-status-modal-backdrop perception-type-modal-backdrop';
    popup.innerHTML = `<section class="conservation-status-modal perception-type-modal" role="dialog" aria-modal="true" aria-label="Parentesco e linhagem social"><div class="conservation-status-modal-heading"><div><span class="conservation-status-modal-kicker">Modelo social</span><h2>Parentesco e linhagem social</h2><p>O tipo apresentado no topo pertence a este animal.</p></div><button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button></div><section class="perception-type-selected-panel" aria-labelledby="kinship-selected-title"><h3 id="kinship-selected-title">Parentesco deste animal</h3><div class="perception-type-list">${selectedItems.length ? selectedItems.map(item => renderItem(item)).join('') : '<p class="perception-type-empty">Não foi indicado um tipo de parentesco específico.</p>'}</div></section><section class="perception-type-catalog-panel" aria-labelledby="kinship-catalog-title"><h3 id="kinship-catalog-title">Outros tipos de parentesco</h3><div class="perception-type-catalog-grid">${otherItems.map(item => renderItem(item, true)).join('')}</div></section></section>`;
    popup.__trigger = trigger;
    popup.querySelector('.conservation-status-modal-close').addEventListener('click', closePopup);
    popup.addEventListener('click', event => { if (event.target === popup) closePopup(); });
    popup.__handleEscape = event => { if (event.key === 'Escape') closePopup(); };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    popup.querySelector('.conservation-status-modal-close').focus();
}

export function initKinshipLineagePopup(root = document) {
    root.querySelectorAll('[data-kinship-lineage-popup]').forEach(trigger => {
        if (trigger.dataset.kinshipLineagePopupReady === 'true') return;
        trigger.dataset.kinshipLineagePopupReady = 'true';
        trigger.addEventListener('click', () => openPopup(trigger));
        trigger.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPopup(trigger); } });
    });
}
