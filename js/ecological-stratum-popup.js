import { getEcologicalStratumSvg } from './general-visual-catalog.js';

const ecologicalStratumCatalog = [
    { label: 'Arbustivo', description: 'Associado à vegetação de arbustos e plantas de porte intermédio.' },
    { label: 'Bentónico', description: 'Vive no fundo de ambientes aquáticos, sobre ou junto ao substrato.' },
    { label: 'Copa', description: 'Ocorre principalmente na copa das árvores e na vegetação elevada.' },
    { label: 'Litoral', description: 'Associado à faixa de transição entre o ambiente terrestre e o marinho.' },
    { label: 'Nerítico', description: 'Ocorre nas águas marinhas sobre a plataforma continental, relativamente perto da costa.' },
    { label: 'Oceânico', description: 'Ocorre em zonas marinhas afastadas da costa e da plataforma continental.' },
    { label: 'Pelágico', description: 'Vive na coluna de água, sem depender directamente do fundo.' },
    { label: 'Solo', description: 'Vive sobretudo à superfície ou nas camadas superiores do solo.' },
    { label: 'Subterrâneo', description: 'Vive principalmente no interior do solo ou em galerias subterrâneas.' }
];

const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-PT')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function resolveStratum(value) {
    const label = String(value || '').trim();
    return ecologicalStratumCatalog.find(item => normalize(item.label) === normalize(label))
        || { label: label || 'Estrato ecológico', description: 'Estrato ecológico específico deste animal.' };
}

function renderStratumItem(item, inactive = false) {
    return `<article class="perception-type-item${inactive ? ' perception-type-catalog-item' : ''}" title="${escapeHtml(item.description)}">
        <div class="perception-type-popup-icon">${getEcologicalStratumSvg(item.label)}</div>
        <div class="perception-type-popup-copy"><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.description)}</p></div>
    </article>`;
}

function closeEcologicalStratumPopup() {
    const popup = document.getElementById('ecological-stratum-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openEcologicalStratumPopup(trigger) {
    closeEcologicalStratumPopup();
    let selected = [];
    try {
        const values = JSON.parse(trigger.dataset.ecologicalStratumTypes || '[]');
        selected = [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch { /* Mantém a lista vazia quando o atributo não contém JSON válido. */ }
    const selectedItems = selected.map(resolveStratum);
    const selectedKeys = new Set(selectedItems.map(item => normalize(item.label)));
    const otherItems = ecologicalStratumCatalog.filter(item => !selectedKeys.has(normalize(item.label)));
    const popup = document.createElement('div');
    popup.id = 'ecological-stratum-modal';
    popup.className = 'conservation-status-modal-backdrop perception-type-modal-backdrop';
    popup.innerHTML = `<section class="conservation-status-modal perception-type-modal" role="dialog" aria-modal="true" aria-label="Estrato ecológico">
        <div class="conservation-status-modal-heading"><div><span class="conservation-status-modal-kicker">Modelo ecológico</span><h2>Estrato ecológico</h2><p>O estrato apresentado no topo pertence a este animal.</p></div><button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button></div>
        <section class="perception-type-selected-panel" aria-labelledby="ecological-stratum-selected-title"><h3 id="ecological-stratum-selected-title">Estrato ecológico deste animal</h3><div class="perception-type-list">${selectedItems.length ? selectedItems.map(item => renderStratumItem(item)).join('') : '<p class="perception-type-empty">Não foi indicado um estrato ecológico específico.</p>'}</div></section>
        <section class="perception-type-catalog-panel" aria-labelledby="ecological-stratum-catalog-title"><h3 id="ecological-stratum-catalog-title">Outros estratos ecológicos</h3><div class="perception-type-catalog-grid">${otherItems.map(item => renderStratumItem(item, true)).join('')}</div></section>
    </section>`;
    popup.__trigger = trigger;
    popup.querySelector('.conservation-status-modal-close').addEventListener('click', closeEcologicalStratumPopup);
    popup.addEventListener('click', event => { if (event.target === popup) closeEcologicalStratumPopup(); });
    popup.__handleEscape = event => { if (event.key === 'Escape') closeEcologicalStratumPopup(); };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    popup.querySelector('.conservation-status-modal-close').focus();
}

export function initEcologicalStratumPopup(root = document) {
    root.querySelectorAll('[data-ecological-stratum-popup]').forEach(trigger => {
        if (trigger.dataset.ecologicalStratumPopupReady === 'true') return;
        trigger.dataset.ecologicalStratumPopupReady = 'true';
        trigger.addEventListener('click', () => openEcologicalStratumPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openEcologicalStratumPopup(trigger); }
        });
    });
}
