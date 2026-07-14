import {
    biogeographicRegions,
    normalizeBiogeographicRegion
} from './biogeographic-regions.js?v=1';

const regionCatalog = [...biogeographicRegions].sort((a, b) => a.label.localeCompare(b.label, 'pt-PT', { sensitivity: 'base' }));
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

function readSelectedRegions(trigger) {
    try {
        const values = JSON.parse(trigger.dataset.biogeographicRegions || '[]');
        return [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch {
        return [];
    }
}

function renderRegionItem(region, selected = false) {
    return `
        <article class="biogeographic-region-item${selected ? ' is-selected' : ' is-inactive'}">
            <span class="biogeographic-region-dot" aria-hidden="true"></span>
            <div class="biogeographic-region-copy">
                <strong>${escapeHtml(region.label)}</strong>
                <p>${escapeHtml(region.description)}</p>
                <small>${escapeHtml(region.continents.join(' • '))}</small>
            </div>
        </article>`;
}

function closeBiogeographicRegionPopup() {
    const popup = document.getElementById('biogeographic-region-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    popup.__map?.destroy?.();
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function createWorldMap(popup, selectedRegions) {
    const mapContainer = popup.querySelector('#biogeographic-region-map');
    if (!mapContainer || typeof window.jsVectorMap !== 'function') {
        mapContainer?.classList.add('is-unavailable');
        return;
    }

    const selectedCountryCodes = [...new Set(selectedRegions.flatMap(region => region.countries))];
    try {
        popup.__map = new window.jsVectorMap({
            selector: '#biogeographic-region-map',
            map: 'world',
            regionsSelectable: false,
            selectedRegions: selectedCountryCodes,
            zoomButtons: false,
            zoomOnScroll: false,
            regionStyle: {
                initial: {
                    fill: '#303347',
                    fillOpacity: 1,
                    stroke: '#15182d',
                    strokeWidth: 0.7
                },
                selected: {
                    fill: '#34d399',
                    fillOpacity: 0.96
                },
                hover: {
                    fill: '#6ee7b7'
                }
            }
        });
    } catch (error) {
        console.warn('[Biogeografia] Não foi possível inicializar o mapa:', error);
        mapContainer.classList.add('is-unavailable');
    }
}

function openBiogeographicRegionPopup(trigger) {
    closeBiogeographicRegionPopup();

    const selectedKeys = new Set(readSelectedRegions(trigger).map(normalizeBiogeographicRegion));
    const selectedRegions = regionCatalog.filter(region => selectedKeys.has(normalizeBiogeographicRegion(region.label)));
    const inactiveRegions = regionCatalog.filter(region => !selectedKeys.has(normalizeBiogeographicRegion(region.label)));
    const selectedContinents = [...new Set(selectedRegions.flatMap(region => region.continents))];

    const popup = document.createElement('div');
    popup.id = 'biogeographic-region-modal';
    popup.className = 'conservation-status-modal-backdrop biogeographic-region-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal biogeographic-region-modal" role="dialog" aria-modal="true" aria-label="Regiões Biogeográficas">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Distribuição biogeográfica</span>
                    <h2>Regiões Biogeográficas</h2>
                    <p>O mapa destaca os continentes correspondentes às regiões deste animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="biogeographic-region-map-panel" aria-labelledby="biogeographic-region-map-title">
                <div class="biogeographic-region-section-heading">
                    <h3 id="biogeographic-region-map-title">Mapa-mundo</h3>
                    <span>${selectedContinents.length ? escapeHtml(selectedContinents.join(' • ')) : 'Sem continente selecionado'}</span>
                </div>
                <div id="biogeographic-region-map" class="biogeographic-region-map" role="img" aria-label="Mapa-mundo com os continentes correspondentes destacados"></div>
                <div class="biogeographic-region-map-legend"><span class="biogeographic-region-dot" aria-hidden="true"></span> Continentes correspondentes ao animal</div>
            </section>
            <section class="biogeographic-region-selected-panel" aria-labelledby="biogeographic-region-selected-title">
                <h3 id="biogeographic-region-selected-title">Regiões deste animal</h3>
                <div class="biogeographic-region-list">
                    ${selectedRegions.length ? selectedRegions.map(region => renderRegionItem(region, true)).join('') : '<p class="biogeographic-region-empty">Não foi indicada uma região biogeográfica específica.</p>'}
                </div>
            </section>
            <section class="biogeographic-region-catalog-panel" aria-labelledby="biogeographic-region-catalog-title">
                <h3 id="biogeographic-region-catalog-title">Outras regiões biogeográficas</h3>
                <div class="biogeographic-region-list">${inactiveRegions.map(region => renderRegionItem(region)).join('')}</div>
            </section>
        </section>`;
    popup.__trigger = trigger;

    const closeButton = popup.querySelector('.conservation-status-modal-close');
    closeButton.addEventListener('click', closeBiogeographicRegionPopup);
    popup.addEventListener('click', event => {
        if (event.target === popup) closeBiogeographicRegionPopup();
    });
    popup.__handleEscape = event => {
        if (event.key === 'Escape') closeBiogeographicRegionPopup();
    };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    createWorldMap(popup, selectedRegions);
    closeButton.focus();
}

export function initBiogeographicRegionPopup(root = document) {
    root.querySelectorAll('[data-biogeographic-region-popup]').forEach(trigger => {
        if (trigger.dataset.biogeographicPopupReady === 'true') return;
        trigger.dataset.biogeographicPopupReady = 'true';
        trigger.addEventListener('click', () => openBiogeographicRegionPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openBiogeographicRegionPopup(trigger);
            }
        });
    });
}
