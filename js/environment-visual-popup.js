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
    if (kind === 'climate') return climateDescriptions[label] || 'Zona clim\u00e1tica definida pelas condi\u00e7\u00f5es m\u00e9dias de temperatura, humidade e precipita\u00e7\u00e3o.';
    if (kind === 'secondary-climate') return secondaryClimateDescriptions[label] || 'Subtipo clim\u00e1tico que detalha as condi\u00e7\u00f5es sazonais e ambientais desta regi\u00e3o.';
    if (document.documentElement.lang === 'zh') {
        return kind === 'habitat'
            ? '\u8fd9\u4e2a\u6816\u606f\u5730\u662f\u7531\u53ef\u5229\u7528\u8d44\u6e90\u3001\u5730\u5f62\u3001\u6c34\u5206\u548c\u5f53\u5730\u73af\u5883\u6761\u4ef6\u5171\u540c\u5b9a\u4e49\u7684\u751f\u6d3b\u7a7a\u95f4\u3002'
            : '\u8fd9\u4e2a\u751f\u7269\u7fa4\u7cfb\u662f\u4e00\u79cd\u7531\u690d\u88ab\u3001\u5730\u5f62\u3001\u6c34\u8d44\u6e90\u548c\u5f53\u5730\u6c14\u5019\u6761\u4ef6\u5171\u540c\u6784\u6210\u7684\u73af\u5883\u3002';
    }
    if (document.documentElement.lang === 'ja') {
        return kind === 'habitat'
            ? '\u3053\u306e\u751f\u606f\u5730\u306f\u3001\u5229\u7528\u53ef\u80fd\u306a\u8cc7\u6e90\u3001\u5730\u5f62\u3001\u6c34\u5206\u3001\u5730\u57df\u306e\u74b0\u5883\u6761\u4ef6\u306b\u3088\u3063\u3066\u5b9a\u7fa9\u3055\u308c\u308b\u751f\u6d3b\u7a7a\u9593\u3067\u3059\u3002'
            : '\u3053\u306e\u30d0\u30a4\u30aa\u30fc\u30e0\u306f\u3001\u690d\u751f\u3001\u5730\u5f62\u3001\u6c34\u8cc7\u6e90\u3001\u5730\u57df\u306e\u6c17\u5019\u6761\u4ef6\u306b\u3088\u3063\u3066\u7279\u5fb4\u3065\u3051\u3089\u308c\u308b\u74b0\u5883\u3067\u3059\u3002';
    }
    if (document.documentElement.lang === 'de') {
        return kind === 'habitat'
            ? 'Dieser Lebensraum wird durch verf\u00fcgbare Ressourcen, Gel\u00e4nde, Feuchtigkeit und lokale Umweltbedingungen definiert.'
            : 'Dieses Biom ist eine durch Vegetation, Gel\u00e4nde, Wasserressourcen und lokale Klimabedingungen gekennzeichnete Umwelt.';
    }
    if (document.documentElement.lang === 'es') {
        return kind === 'habitat'
            ? 'Este h\u00e1bitat se define por los recursos disponibles, el relieve, la humedad y las condiciones ambientales locales.'
            : 'Este bioma es un entorno caracterizado por la vegetaci\u00f3n, el relieve, los recursos h\u00eddricos y las condiciones clim\u00e1ticas locales.';
    }
    if (document.documentElement.lang === 'fr') {
        return kind === 'habitat'
            ? 'Cet habitat est d\u00e9fini par les ressources disponibles, le relief, l\u2019humidit\u00e9 et les conditions environnementales locales.'
            : 'Ce biome est un environnement caract\u00e9ris\u00e9 par la v\u00e9g\u00e9tation, le relief, les ressources en eau et les conditions climatiques locales.';
    }
    if (document.documentElement.lang === 'en') {
        return kind === 'habitat'
            ? 'This habitat is defined by available resources, terrain, moisture, and local environmental conditions.'
            : 'This biome is an environment characterized by vegetation, terrain, water resources, and local climate conditions.';
    }
    return `O bioma ${label} \u00e9 um ambiente caracterizado pela sua vegeta\u00e7\u00e3o, pelo relevo, pela disponibilidade de \u00e1gua e pelas condi\u00e7\u00f5es clim\u00e1ticas locais.`;
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
    const title = kind === 'climate' ? 'Zona Climática' : kind === 'secondary-climate' ? 'Zona Climática Secundária' : kind === 'habitat' ? 'Habitat' : 'Bioma';
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
