import { groupCompositionOptions, renderGroupCompositionItem } from './group-composition-visuals.js';

const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-PT')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function closeGroupCompositionPopup() {
    const popup = document.getElementById('group-composition-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openGroupCompositionPopup(trigger) {
    closeGroupCompositionPopup();
    let selected = [];
    try {
        const values = JSON.parse(trigger.dataset.groupCompositionTypes || '[]');
        selected = [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch { /* Mantém a lista vazia quando o atributo não contém JSON válido. */ }
    const selectedItems = selected.map(label => ({ label }));
    const selectedKeys = new Set(selectedItems.map(item => normalize(item.label)));
    const otherItems = groupCompositionOptions.filter(label => !selectedKeys.has(normalize(label))).map(label => ({ label }));
    const popup = document.createElement('div');
    popup.id = 'group-composition-modal';
    popup.className = 'conservation-status-modal-backdrop perception-type-modal-backdrop';
    popup.innerHTML = `<section class="conservation-status-modal perception-type-modal" role="dialog" aria-modal="true" aria-label="Composição do grupo">
        <div class="conservation-status-modal-heading"><div><span class="conservation-status-modal-kicker">Modelo social</span><h2>Composição do grupo</h2><p>A composição apresentada no topo pertence a este animal.</p></div><button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button></div>
        <section class="perception-type-selected-panel" aria-labelledby="group-composition-selected-title"><h3 id="group-composition-selected-title">Composição deste animal</h3><div class="perception-type-list">${selectedItems.length ? selectedItems.map(item => renderGroupCompositionItem(item)).join('') : '<p class="perception-type-empty">Não foi indicada uma composição específica.</p>'}</div></section>
        <section class="perception-type-catalog-panel" aria-labelledby="group-composition-catalog-title"><h3 id="group-composition-catalog-title">Outras composições de grupo</h3><div class="perception-type-catalog-grid">${otherItems.map(item => renderGroupCompositionItem(item, true)).join('')}</div></section>
    </section>`;
    popup.__trigger = trigger;
    popup.querySelector('.conservation-status-modal-close').addEventListener('click', closeGroupCompositionPopup);
    popup.addEventListener('click', event => { if (event.target === popup) closeGroupCompositionPopup(); });
    popup.__handleEscape = event => { if (event.key === 'Escape') closeGroupCompositionPopup(); };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    popup.querySelector('.conservation-status-modal-close').focus();
}

export function initGroupCompositionPopup(root = document) {
    root.querySelectorAll('[data-group-composition-popup]').forEach(trigger => {
        if (trigger.dataset.groupCompositionPopupReady === 'true') return;
        trigger.dataset.groupCompositionPopupReady = 'true';
        trigger.addEventListener('click', () => openGroupCompositionPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openGroupCompositionPopup(trigger); }
        });
    });
}
