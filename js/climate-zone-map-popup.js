const climateCountryCodes = {
    Tropical: ['BR','CO','VE','EC','PE','BO','CD','CG','CM','GA','GQ','NG','GH','CI','SL','LR','UG','KE','ID','MY','TH','PH','VN','KH','MM','IN','LK','BD','PG'],
    Árido: ['MX','US','PE','CL','AR','NA','BW','ZA','EG','LY','DZ','MA','MR','NE','ML','TD','SD','SA','AE','OM','IR','AF','PK','CN','MN','AU'],
    Temperado: ['CA','US','GB','IE','FR','DE','ES','PT','IT','NL','BE','CH','AT','PL','CZ','SK','HU','RO','UA','JP','KR','AR','CL','ZA','AU','NZ'],
    Continental: ['CA','US','RU','KZ','MN','CN','UA','BY','PL','FI','SE','NO'],
    Polar: ['GL','CA','US','RU','NO','SE','FI','IS','AQ'],
    Montanhoso: ['CA','US','MX','GT','CO','EC','PE','BO','CL','AR','NO','CH','AT','IT','FR','ES','TR','GE','NP','BT','IN','CN','KZ','NZ','ET','KE','TZ','ZA']
};

const climateDescriptions = {
    Tropical: 'As áreas tropicais distribuem-se sobretudo em torno do equador, entre os trópicos, com temperaturas elevadas durante todo o ano.',
    Árido: 'As áreas áridas correspondem às grandes regiões desérticas e semiáridas, com pouca precipitação e elevada evaporação.',
    Temperado: 'As áreas temperadas encontram-se sobretudo nas latitudes médias, com estações do ano marcadas e temperaturas moderadas.',
    Continental: 'As áreas continentais ocupam sobretudo o interior dos grandes continentes, com fortes contrastes entre o verão e o inverno.',
    Polar: 'As áreas polares localizam-se nas altas latitudes do Ártico e da Antártida, dominadas pelo frio, gelo e neve.',
    Montanhoso: 'As áreas montanhosas acompanham grandes cadeias de montanhas, onde a altitude altera a temperatura, a precipitação e a vegetação.'
};

function resolveClimateKey(value = '') {
    const normalized = String(value || '').toLocaleLowerCase('pt-PT')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const aliases = {
        tropical: 'Tropical',
        arido: 'Árido',
        arida: 'Árido',
        temperado: 'Temperado',
        temperada: 'Temperado',
        continental: 'Continental',
        polar: 'Polar',
        montanhoso: 'Montanhoso',
        montanhosa: 'Montanhoso'
    };
    return aliases[normalized] || value;
}

const normalizeClimateMapKey = value => String(value || '')
    .toLocaleLowerCase('pt-PT')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const escapeClimateMapHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function closeClimateZoneMapPopup() {
    const popup = document.getElementById('climate-zone-map-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    popup.__map?.destroy?.();
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function createClimateWorldMap(popup, climate) {
    const mapContainer = popup.querySelector('#climate-zone-world-map');
    if (!mapContainer || typeof window.jsVectorMap !== 'function') return;
    try {
        popup.__map = new window.jsVectorMap({
            selector: '#climate-zone-world-map',
            map: 'world',
            regionsSelectable: false,
            selectedRegions: climateCountryCodes[resolveClimateKey(climate)] || [],
            zoomButtons: false,
            zoomOnScroll: false,
            regionStyle: {
                initial: { fill: '#303347', fillOpacity: 1, stroke: '#15182d', strokeWidth: 0.7 },
                selected: { fill: '#f59e0b', fillOpacity: 0.96 },
                hover: { fill: '#fbbf24' }
            }
        });
    } catch (error) {
        console.warn('[Clima] Não foi possível inicializar o mapa:', error);
        mapContainer.classList.add('is-unavailable');
    }
}

function openClimateZoneMapPopup(trigger) {
    closeClimateZoneMapPopup();
    const climate = trigger.dataset.popupLabel || '';
    const climateKey = resolveClimateKey(climate);
    const popup = document.createElement('div');
    popup.id = 'climate-zone-map-modal';
    popup.className = 'conservation-status-modal-backdrop biogeographic-region-modal-backdrop climate-zone-map-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal biogeographic-region-modal climate-zone-map-modal" role="dialog" aria-modal="true" aria-label="Mapa da zona climática">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Distribuição climática</span>
                    <h2>${escapeClimateMapHtml(climate)}</h2>
                    <p>O mapa destaca as principais áreas associadas a esta zona climática.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="biogeographic-region-map-panel" aria-labelledby="climate-zone-map-title">
                <div class="biogeographic-region-section-heading">
                    <h3 id="climate-zone-map-title">Mapa-mundo</h3>
                    <span>Áreas destacadas</span>
                </div>
                <div id="climate-zone-world-map" class="biogeographic-region-map climate-zone-world-map" role="img" aria-label="Mapa-mundo com a zona climática destacada"></div>
                <div class="biogeographic-region-map-legend"><span class="biogeographic-region-dot climate-zone-map-dot" aria-hidden="true"></span> ${escapeClimateMapHtml(climate)}</div>
            </section>
            <div class="environment-visual-modal-copy climate-zone-map-description"><strong>Sobre esta zona</strong><p>${escapeClimateMapHtml(climateDescriptions[climateKey] || 'Zona climática definida por padrões regionais de temperatura e precipitação.')}</p></div>
        </section>`;
    popup.__trigger = trigger;
    popup.querySelector('.conservation-status-modal-close').addEventListener('click', closeClimateZoneMapPopup);
    popup.addEventListener('click', event => { if (event.target === popup) closeClimateZoneMapPopup(); });
    popup.__handleEscape = event => { if (event.key === 'Escape') closeClimateZoneMapPopup(); };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    createClimateWorldMap(popup, climate);
    popup.querySelector('.conservation-status-modal-close').focus();
}

export function initClimateZoneMapPopup(root = document) {
    root.querySelectorAll('[data-climate-zone-map-popup]').forEach(trigger => {
        if (trigger.dataset.climateMapPopupReady === 'true') return;
        trigger.dataset.climateMapPopupReady = 'true';
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.addEventListener('click', event => {
            event.stopPropagation();
            openClimateZoneMapPopup(trigger);
        });
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                openClimateZoneMapPopup(trigger);
            }
        });
    });
}
