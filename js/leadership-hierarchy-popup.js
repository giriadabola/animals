import { leadershipHierarchyOptions, getLeadershipHierarchyMeta, getLeadershipHierarchyDescription, getLeadershipHierarchySvg } from './leadership-hierarchy-visuals.js';

const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const resolve = value => { const meta = getLeadershipHierarchyMeta(value); return { label: meta.label, description: getLeadershipHierarchyDescription(meta.label), icon: getLeadershipHierarchySvg(meta.label) }; };
const renderItem = (item, inactive = false) => `<article class="perception-type-item${inactive ? ' perception-type-catalog-item' : ''}" title="${escapeHtml(item.description)}"><div class="perception-type-popup-icon">${item.icon}</div><div class="perception-type-popup-copy"><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.description)}</p></div></article>`;

function closePopup() {
    const popup = document.getElementById('leadership-hierarchy-modal');
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
    try { const values = JSON.parse(trigger.dataset.leadershipHierarchyTypes || '[]'); selected = [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))]; } catch { /* Dados inválidos: mantém a lista vazia. */ }
    const selectedItems = selected.map(resolve);
    const selectedKeys = new Set(selectedItems.map(item => normalize(item.label)));
    const otherItems = leadershipHierarchyOptions.filter(label => !selectedKeys.has(normalize(label))).map(resolve);
    const popup = document.createElement('div');
    popup.id = 'leadership-hierarchy-modal';
    popup.className = 'conservation-status-modal-backdrop perception-type-modal-backdrop';
    popup.innerHTML = `<section class="conservation-status-modal perception-type-modal" role="dialog" aria-modal="true" aria-label="Liderança e hierarquia"><div class="conservation-status-modal-heading"><div><span class="conservation-status-modal-kicker">Modelo social</span><h2>Liderança e hierarquia</h2><p>O tipo apresentado no topo pertence a este animal.</p></div><button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button></div><section class="perception-type-selected-panel" aria-labelledby="leadership-selected-title"><h3 id="leadership-selected-title">Liderança deste animal</h3><div class="perception-type-list">${selectedItems.length ? selectedItems.map(item => renderItem(item)).join('') : '<p class="perception-type-empty">Não foi indicada uma estrutura de liderança específica.</p>'}</div></section><section class="perception-type-catalog-panel" aria-labelledby="leadership-catalog-title"><h3 id="leadership-catalog-title">Outros tipos de liderança</h3><div class="perception-type-catalog-grid">${otherItems.map(item => renderItem(item, true)).join('')}</div></section></section>`;
    popup.__trigger = trigger;
    popup.querySelector('.conservation-status-modal-close').addEventListener('click', closePopup);
    popup.addEventListener('click', event => { if (event.target === popup) closePopup(); });
    popup.__handleEscape = event => { if (event.key === 'Escape') closePopup(); };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    popup.querySelector('.conservation-status-modal-close').focus();
}

export function initLeadershipHierarchyPopup(root = document) {
    root.querySelectorAll('[data-leadership-hierarchy-popup]').forEach(trigger => {
        if (trigger.dataset.leadershipHierarchyPopupReady === 'true') return;
        trigger.dataset.leadershipHierarchyPopupReady = 'true';
        trigger.addEventListener('click', () => openPopup(trigger));
        trigger.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPopup(trigger); } });
    });
}
