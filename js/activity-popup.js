import { getActivityMeta, getActivitySvg } from './general-visual-catalog.js';

const activityCatalog = [
    ['Diurno', 'Actividade predominante durante o dia.'],
    ['Noturno', 'Actividade predominante durante a noite.'],
    ['Crepuscular', 'Actividade concentrada ao amanhecer e/ou ao entardecer.'],
    ['Matutino', 'Actividade predominante no período da manhã.'],
    ['Vespertino', 'Actividade predominante no período da tarde.'],
    ['Catemeral', 'Actividade distribuída de forma irregular ao longo do dia e da noite.'],
    ['Arrítmico', 'Não apresenta um padrão diário de actividade claramente definido.'],
    ['Ultradiano', 'Apresenta vários ciclos de actividade num período de 24 horas.'],
    ['Sazonal', 'A actividade varia de acordo com as estações ou outros ciclos sazonais.'],
    ['Migratório', 'A actividade inclui deslocações regulares entre diferentes áreas.'],
    ['Hibernante', 'Passa por um período prolongado de dormência durante condições desfavoráveis.'],
    ['Estivante', 'Passa por um período de dormência durante épocas quentes ou secas.'],
    ['Brumante', 'Passa por um período de dormência associado ao frio, sobretudo em répteis e anfíbios.'],
    ['Torpidário', 'Apresenta períodos curtos e reversíveis de redução da actividade e do metabolismo.'],
    ['Subterrâneo/Fossorial', 'Está adaptado a uma actividade predominantemente subterrânea.'],
    ['Aquático ativo', 'Mantém actividade predominante em ambientes aquáticos.'],
    ['Arborícola ativo', 'Mantém actividade predominante em árvores ou outra vegetação elevada.'],
    ['Terrestre ativo', 'Mantém actividade predominante sobre o solo.'],
    ['Aéreo ativo', 'Mantém actividade predominante no ar ou durante o voo.']
].map(([label, description]) => ({ label, description }));

const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-PT')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function resolveActivity(value) {
    const label = String(value || '').trim();
    return activityCatalog.find(item => normalize(item.label) === normalize(label))
        || { label: label || 'Atividade', description: 'Tipo de actividade específico deste animal.' };
}

function renderActivityItem(item, inactive = false) {
    return `<article class="perception-type-item${inactive ? ' perception-type-catalog-item' : ''}" title="${escapeHtml(item.description)}">
        <div class="perception-type-popup-icon">${getActivitySvg(getActivityMeta(item.label).key)}</div>
        <div class="perception-type-popup-copy"><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.description)}</p></div>
    </article>`;
}

function closeActivityPopup() {
    const popup = document.getElementById('activity-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openActivityPopup(trigger) {
    closeActivityPopup();
    let selected = [];
    try {
        const values = JSON.parse(trigger.dataset.activityTypes || '[]');
        selected = [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch { /* Mantém a lista vazia quando o atributo não contém JSON válido. */ }
    const selectedItems = selected.map(resolveActivity);
    const selectedKeys = new Set(selectedItems.map(item => normalize(item.label)));
    const otherItems = activityCatalog.filter(item => !selectedKeys.has(normalize(item.label)));
    const popup = document.createElement('div');
    popup.id = 'activity-modal';
    popup.className = 'conservation-status-modal-backdrop perception-type-modal-backdrop';
    popup.innerHTML = `<section class="conservation-status-modal perception-type-modal" role="dialog" aria-modal="true" aria-label="Atividade">
        <div class="conservation-status-modal-heading"><div><span class="conservation-status-modal-kicker">Modelo de atividade</span><h2>Atividade</h2><p>Os tipos apresentados no topo pertencem a este animal.</p></div><button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button></div>
        <section class="perception-type-selected-panel" aria-labelledby="activity-selected-title"><h3 id="activity-selected-title">Atividade deste animal</h3><div class="perception-type-list">${selectedItems.length ? selectedItems.map(item => renderActivityItem(item)).join('') : '<p class="perception-type-empty">Não foi indicado um tipo de actividade específico.</p>'}</div></section>
        <section class="perception-type-catalog-panel" aria-labelledby="activity-catalog-title"><h3 id="activity-catalog-title">Outros tipos de atividade</h3><div class="perception-type-catalog-grid">${otherItems.map(item => renderActivityItem(item, true)).join('')}</div></section>
    </section>`;
    popup.__trigger = trigger;
    popup.querySelector('.conservation-status-modal-close').addEventListener('click', closeActivityPopup);
    popup.addEventListener('click', event => { if (event.target === popup) closeActivityPopup(); });
    popup.__handleEscape = event => { if (event.key === 'Escape') closeActivityPopup(); };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    popup.querySelector('.conservation-status-modal-close').focus();
}

export function initActivityPopup(root = document) {
    root.querySelectorAll('[data-activity-popup]').forEach(trigger => {
        if (trigger.dataset.activityPopupReady === 'true') return;
        trigger.dataset.activityPopupReady = 'true';
        trigger.addEventListener('click', () => openActivityPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openActivityPopup(trigger); }
        });
    });
}
