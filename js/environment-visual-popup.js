const climateDescriptions = {
    Tropical: 'Clima quente durante todo o ano, normalmente associado a temperaturas elevadas e grande disponibilidade de energia solar.',
    Árido: 'Clima muito seco, com precipitação reduzida e forte evaporação.',
    Temperado: 'Clima com temperaturas moderadas e variações sazonais bem definidas.',
    Continental: 'Clima marcado por contrastes sazonais fortes, com verões quentes e invernos frios.',
    Polar: 'Clima muito frio, com temperaturas baixas durante a maior parte do ano e pouca vegetação.',
    Montanhoso: 'Clima condicionado pela altitude, pelo relevo e por mudanças rápidas de temperatura.'
};

const secondaryClimateDescriptions = {
    Equatorial: 'Clima quente e húmido, com precipitação abundante e pouca variação térmica anual.',
    Monção: 'Clima tropical com uma estação chuvosa muito marcada e uma estação mais seca.',
    Savana: 'Clima tropical sazonal, alternando entre uma estação chuvosa e outra seca.',
    Desérticos: 'Clima extremamente seco, com precipitação escassa e grande amplitude térmica.',
    Semiáridos: 'Clima seco, mas com precipitação suficiente para manter vegetação esparsa.',
    'Subtropical Húmido': 'Clima quente e húmido, com precipitação distribuída ao longo do ano.',
    Oceânico: 'Clima moderado e húmido, influenciado pela proximidade do oceano.',
    Mediterrânico: 'Clima com verões quentes e secos e invernos suaves e chuvosos.',
    'Continental Húmido': 'Clima com precipitação regular e contrastes sazonais acentuados.',
    Subártico: 'Clima frio, com invernos longos e verões curtos.',
    Tundra: 'Clima frio, sem árvores de grande porte e com uma estação de crescimento muito curta.',
    Glacial: 'Clima dominado pelo gelo e pela neve, com temperaturas persistentemente muito baixas.'
};

const normalizeEnvironmentPopupKey = value => String(value || '')
    .toLocaleLowerCase('pt-PT')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const escapeEnvironmentPopupHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function getEnvironmentDescription(kind, label) {
    if (kind === 'climate') return climateDescriptions[label] || 'Zona climática definida pelas condições médias de temperatura, humidade e precipitação.';
    if (kind === 'secondary-climate') return secondaryClimateDescriptions[label] || 'Subtipo climático que detalha as condições sazonais e ambientais desta região.';
    return `O bioma ${label} é um ambiente caracterizado pela sua vegetação, pelo relevo, pela disponibilidade de água e pelas condições climáticas locais.`;
}

function closeEnvironmentVisualPopup() {
    const popup = document.getElementById('environment-visual-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openEnvironmentVisualPopup(trigger) {
    closeEnvironmentVisualPopup();
    const label = trigger.dataset.popupLabel || '';
    const kind = trigger.dataset.popupKind || 'biome';
    const image = trigger.dataset.popupImage || '';
    const title = kind === 'climate' ? 'Zona Climática' : kind === 'secondary-climate' ? 'Zona Climática Secundária' : 'Bioma';
    const popup = document.createElement('div');
    popup.id = 'environment-visual-modal';
    popup.className = 'conservation-status-modal-backdrop environment-visual-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal environment-visual-modal" role="dialog" aria-modal="true" aria-label="${escapeEnvironmentPopupHtml(title)}">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Modelo visual</span>
                    <h2>${escapeEnvironmentPopupHtml(label)}</h2>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            ${image ? `<div class="environment-visual-modal-image-wrap"><img src="${escapeEnvironmentPopupHtml(image)}" alt="${escapeEnvironmentPopupHtml(label)}" draggable="false"></div>` : ''}
            <div class="environment-visual-modal-copy"><strong>${escapeEnvironmentPopupHtml(title)}</strong><p>${escapeEnvironmentPopupHtml(getEnvironmentDescription(kind, label))}</p></div>
        </section>`;
    popup.__trigger = trigger;
    popup.querySelector('.conservation-status-modal-close').addEventListener('click', closeEnvironmentVisualPopup);
    popup.addEventListener('click', event => { if (event.target === popup) closeEnvironmentVisualPopup(); });
    popup.addEventListener('contextmenu', event => event.preventDefault());
    popup.__handleEscape = event => { if (event.key === 'Escape') closeEnvironmentVisualPopup(); };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    popup.querySelector('.conservation-status-modal-close').focus();
}

export function initEnvironmentVisualPopup(root = document) {
    root.querySelectorAll('[data-environment-visual-popup]').forEach(trigger => {
        if (trigger.dataset.environmentPopupReady === 'true') return;
        trigger.dataset.environmentPopupReady = 'true';
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.addEventListener('click', event => {
            event.stopPropagation();
            openEnvironmentVisualPopup(trigger);
        });
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                openEnvironmentVisualPopup(trigger);
            }
        });
    });
}
