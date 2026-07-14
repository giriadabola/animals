const CONSERVATION_STATUS_OPTIONS = Object.freeze([
    { code: 'NE', name: 'Não Avaliado', bg: '#5c6773', text: '#ffffff', description: 'A espécie ainda não foi avaliada.' },
    { code: 'DD', name: 'Dados Insuficientes', bg: '#835d90', text: '#ffffff', description: 'Não existem dados suficientes para avaliar o risco.' },
    { code: 'LC', name: 'Pouco Preocupante', bg: '#007a5e', text: '#ffffff', description: 'A espécie não enfrenta atualmente uma ameaça significativa.' },
    { code: 'NT', name: 'Quase Ameaçado', bg: '#85bb65', text: '#000000', description: 'A espécie pode ficar ameaçada num futuro próximo.' },
    { code: 'VU', name: 'Vulnerável', bg: '#e69f00', text: '#000000', description: 'A espécie enfrenta um risco elevado de extinção na natureza.' },
    { code: 'EN', name: 'Em Perigo', bg: '#d55e00', text: '#ffffff', description: 'A espécie enfrenta um risco muito elevado de extinção.' },
    { code: 'CR', name: 'Criticamente em Perigo', bg: '#c00000', text: '#ffffff', description: 'A espécie enfrenta um risco extremamente elevado de extinção.' },
    { code: 'EW', name: 'Extinto na Natureza', bg: '#542788', text: '#ffffff', description: 'A espécie só sobrevive em cativeiro ou fora da sua área natural.' },
    { code: 'EX', name: 'Extinto', bg: '#000000', text: '#ffffff', description: 'Não existem dúvidas razoáveis de que morreu o último indivíduo.' }
]);

const CONSERVATION_STATUS_DISPLAY_COLOURS = Object.freeze({
    NE: { bg: '#78909c', text: '#ffffff' },
    DD: { bg: '#8e5aa5', text: '#ffffff' },
    LC: { bg: '#2e9d63', text: '#ffffff' },
    NT: { bg: '#a7bd42', text: '#172016' },
    VU: { bg: '#d79a19', text: '#221804' },
    EN: { bg: '#d66b28', text: '#ffffff' },
    CR: { bg: '#c93636', text: '#ffffff' },
    EW: { bg: '#b6293c', text: '#ffffff' },
    EX: { bg: '#181818', text: '#ffffff' }
});

const normalizeValue = (value = '') => String(value).trim().toLocaleLowerCase('pt-PT');
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

export function getConservationStatusMeta(value = '') {
    const normalizedValue = normalizeValue(value);
    return CONSERVATION_STATUS_OPTIONS.find(option =>
        option.code.toLocaleLowerCase('pt-PT') === normalizedValue ||
        normalizeValue(option.name) === normalizedValue
    ) || {
        code: String(value).trim(),
        name: String(value).trim() || 'Estado desconhecido',
        bg: '#666666',
        text: '#ffffff',
        description: 'Estado de conservação sem correspondência no catálogo.'
    };
}

function buildStatusOptions(selectedCode) {
    const displayOrder = ['EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'NE'];
    return [...CONSERVATION_STATUS_OPTIONS]
        .sort((a, b) => displayOrder.indexOf(a.code) - displayOrder.indexOf(b.code))
        .map(option => {
        const isSelected = option.code === selectedCode;
        const colour = CONSERVATION_STATUS_DISPLAY_COLOURS[option.code] || option;
        const circleStyle = isSelected
            ? `--status-color:${colour.bg};background:${colour.bg};color:${colour.text};`
            : `background:${colour.bg};color:${colour.text};opacity:0.52;`;
        return `
            <li class="conservation-status-option${isSelected ? ' is-selected' : ''}"${isSelected ? ' aria-current="true"' : ''} title="${escapeHtml(option.name)}: ${escapeHtml(option.description)}">
                <span class="conservation-status-code" style="${circleStyle}">${option.code}</span>
                <span class="conservation-status-option-name">${option.name}</span>
            </li>`;
        }).join('');
}

function closeConservationStatusPopup() {
    const popup = document.getElementById('conservation-status-modal');
    if (!popup) return;
    const trigger = popup.__trigger;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openConservationStatusPopup(trigger) {
    closeConservationStatusPopup();

    const selected = getConservationStatusMeta(trigger.dataset.conservationStatus);
    const selectedColour = CONSERVATION_STATUS_DISPLAY_COLOURS[selected.code] || selected;
    const popup = document.createElement('div');
    popup.id = 'conservation-status-modal';
    popup.className = 'conservation-status-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal" role="dialog" aria-modal="true" aria-label="Estados de Conservação">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Catálogo de conservação</span>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <div class="conservation-status-current" style="--status-color:${selectedColour.bg};">
                <strong>${escapeHtml(selected.name)} <small>(${escapeHtml(selected.code)})</small></strong>
                <p>${escapeHtml(selected.description)}</p>
            </div>
            <ul class="conservation-status-list">${buildStatusOptions(selected.code)}</ul>
        </section>`;
    popup.__trigger = trigger;

    const closeButton = popup.querySelector('.conservation-status-modal-close');
    closeButton.addEventListener('click', closeConservationStatusPopup);
    popup.addEventListener('click', event => {
        if (event.target === popup) closeConservationStatusPopup();
    });
    popup.__handleEscape = handleEscape;
    document.addEventListener('keydown', handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    closeButton.focus();

    function handleEscape(event) {
        if (event.key === 'Escape' && document.getElementById('conservation-status-modal')) {
            closeConservationStatusPopup();
        }
    }
}

export function initConservationStatusPopup(root = document) {
    root.querySelectorAll('[data-conservation-status]').forEach(trigger => {
        if (trigger.dataset.conservationPopupReady === 'true') return;
        trigger.dataset.conservationPopupReady = 'true';
        const label = trigger.querySelector('.dimension-model-value');
        if (label) label.textContent = 'Estado de Conservação';
        trigger.addEventListener('click', () => openConservationStatusPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openConservationStatusPopup(trigger);
            }
        });
    });
}

export { CONSERVATION_STATUS_OPTIONS };
