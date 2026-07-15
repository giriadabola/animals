const symmetryCatalog = [
    { label: 'Bilateral', description: 'O corpo pode ser dividido em duas metades semelhantes por um único plano.' },
    { label: 'Radial', description: 'As partes semelhantes do corpo estão organizadas em torno de um eixo central.' },
    { label: 'Birradial', description: 'Combina uma organização radial com um número limitado de planos de simetria.' },
    { label: 'Assimétrica', description: 'Não existe um plano regular que divida o corpo em metades semelhantes.' },
    { label: 'Pentarradial', description: 'Apresenta cinco eixos ou planos de simetria dispostos radialmente.' }
];

const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-PT')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

const makeSvg = content => `<svg viewBox="0 0 80 80" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><g stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${content}</g></svg>`;

function getSymmetrySvg(label) {
    switch (normalize(label)) {
        case 'bilateral':
            return makeSvg('<path d="M40 10v60"/><path d="M40 18c-14 3-23 13-23 22s9 19 23 22"/><path d="M40 18c14 3 23 13 23 22s-9 19-23 22"/><path d="M24 30l16 7 16-7M24 50l16-7 16 7"/>');
        case 'radial':
            return makeSvg('<circle cx="40" cy="40" r="9"/><circle cx="40" cy="40" r="25"/><path d="M40 31V12M40 49v19M31 40H12M49 40h19M34 34L21 21M46 34l13-13M34 46L21 59M46 46l13 13"/>');
        case 'birradial':
            return makeSvg('<ellipse cx="40" cy="40" rx="25" ry="14"/><ellipse cx="40" cy="40" rx="14" ry="25"/><path d="M40 15v50M15 40h50"/>');
        case 'assimetrica':
            return makeSvg('<path d="M31 14c-12 4-18 14-16 26 2 13 13 25 26 25 14 0 24-11 24-25 0-13-9-24-21-28"/><path d="M27 29c7-4 15-5 24-1M23 48c8 5 18 7 29 3"/>');
        case 'pentarradial':
            return makeSvg('<path d="M40 10l7 21 22 1-17 13 6 22-18-12-18 12 6-22-17-13 22-1 7-21Z"/><circle cx="40" cy="40" r="5"/>');
        default:
            return makeSvg('<circle cx="40" cy="40" r="24"/><circle cx="40" cy="40" r="6"/>');
    }
}

function resolveSymmetry(value) {
    const label = String(value || '').trim();
    return symmetryCatalog.find(item => normalize(item.label) === normalize(label))
        || { label: label || 'Simetria corporal', description: 'Tipo de simetria corporal específico deste animal.' };
}

function renderSymmetryItem(item, inactive = false) {
    return `
        <article class="perception-type-item${inactive ? ' perception-type-catalog-item' : ''}" title="${escapeHtml(item.description)}">
            <div class="perception-type-popup-icon">${getSymmetrySvg(item.label)}</div>
            <div class="perception-type-popup-copy">
                <strong>${escapeHtml(item.label)}</strong>
                <p>${escapeHtml(item.description)}</p>
            </div>
        </article>`;
}

function closeBodySymmetryPopup() {
    const popup = document.getElementById('body-symmetry-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openBodySymmetryPopup(trigger) {
    closeBodySymmetryPopup();
    let selected = [];
    try {
        const values = JSON.parse(trigger.dataset.bodySymmetryTypes || '[]');
        selected = [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch { /* Mantém a lista vazia quando o atributo não contém JSON válido. */ }

    const selectedItems = selected.map(resolveSymmetry);
    const selectedKeys = new Set(selectedItems.map(item => normalize(item.label)));
    const otherItems = symmetryCatalog.filter(item => !selectedKeys.has(normalize(item.label)));
    const popup = document.createElement('div');
    popup.id = 'body-symmetry-modal';
    popup.className = 'conservation-status-modal-backdrop perception-type-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal perception-type-modal" role="dialog" aria-modal="true" aria-label="Simetria corporal">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Modelo de simetria</span>
                    <h2>Simetria corporal</h2>
                    <p>O tipo apresentado no topo pertence a este animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="perception-type-selected-panel" aria-labelledby="body-symmetry-selected-title">
                <h3 id="body-symmetry-selected-title">Simetria corporal deste animal</h3>
                <div class="perception-type-list">
                    ${selectedItems.length ? selectedItems.map(item => renderSymmetryItem(item)).join('') : '<p class="perception-type-empty">Não foi indicada uma simetria corporal específica.</p>'}
                </div>
            </section>
            <section class="perception-type-catalog-panel" aria-labelledby="body-symmetry-catalog-title">
                <h3 id="body-symmetry-catalog-title">Outros tipos de simetria corporal</h3>
                <div class="perception-type-catalog-grid">${otherItems.map(item => renderSymmetryItem(item, true)).join('')}</div>
            </section>
        </section>`;
    popup.__trigger = trigger;
    popup.querySelector('.conservation-status-modal-close').addEventListener('click', closeBodySymmetryPopup);
    popup.addEventListener('click', event => { if (event.target === popup) closeBodySymmetryPopup(); });
    popup.__handleEscape = event => { if (event.key === 'Escape') closeBodySymmetryPopup(); };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    popup.querySelector('.conservation-status-modal-close').focus();
}

export function initBodySymmetryPopup(root = document) {
    root.querySelectorAll('[data-body-symmetry-popup]').forEach(trigger => {
        if (trigger.dataset.bodySymmetryPopupReady === 'true') return;
        trigger.dataset.bodySymmetryPopupReady = 'true';
        trigger.addEventListener('click', () => openBodySymmetryPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openBodySymmetryPopup(trigger);
            }
        });
    });
}
