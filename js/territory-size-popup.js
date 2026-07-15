import { getGeneralModelSvg } from './general-visual-catalog.js';

const FOOTBALL_FIELD_AREA_M2 = 105 * 68;
const FOOTBALL_FIELD_LABEL = 'Campo de futebol (105 × 68 m)';

const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function parseArea(value, unit = 'km²') {
    const number = Number(String(value || '').replace(/\s/g, '').replace(',', '.'));
    if (!Number.isFinite(number) || number < 0) return null;
    const normalizedUnit = String(unit || 'km²').toLocaleLowerCase('pt-PT');
    // Verificar km² antes de m²: a string "km²" também contém "m²".
    if (normalizedUnit.includes('km²') || normalizedUnit.includes('km2')) return number;
    if (normalizedUnit.includes('m²') || normalizedUnit.includes('m2')) return number / 1_000_000;
    if (normalizedUnit.includes('ha')) return number / 100;
    return number;
}

function formatNumber(value, maximumFractionDigits = 2) {
    return new Intl.NumberFormat('pt-PT', { maximumFractionDigits }).format(value);
}

function readTerritoryEntry(item = {}) {
    const unit = item.unidade || 'km²';
    const min = parseArea(item.valorMin ?? item.valor, unit);
    const max = parseArea(item.valorMax, unit) ?? min;
    return { min, max, unit, raw: item.valorMin ?? item.valor ?? item.valorMax ?? '' };
}

function getFieldSize(areaKm2) {
    const areaM2 = Math.max(areaKm2 * 1_000_000, FOOTBALL_FIELD_AREA_M2);
    const scale = 280 / Math.sqrt(areaM2);
    return {
        width: Math.max(14, Math.min(250, 105 * scale)),
        height: Math.max(10, Math.min(210, 68 * scale)),
        compressed: areaKm2 * 1_000_000 < FOOTBALL_FIELD_AREA_M2
    };
}

function closeTerritorySizePopup() {
    const popup = document.getElementById('territory-size-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openTerritorySizePopup(trigger) {
    closeTerritorySizePopup();
    let entries = [];
    try {
        const values = JSON.parse(trigger.dataset.territoryValues || '[]');
        entries = (Array.isArray(values) ? values : []).map(readTerritoryEntry).filter(item => item.min !== null || item.max !== null);
    } catch { /* Mantém o estado vazio quando o atributo não contém JSON válido. */ }

    const entry = entries[0] || { min: null, max: null, unit: 'km²' };
    const area = entry.max ?? entry.min;
    const fieldCount = area === null ? null : area * 1_000_000 / FOOTBALL_FIELD_AREA_M2;
    const fieldSize = area === null ? { width: 105, height: 68, compressed: false } : getFieldSize(area);
    const areaLabel = entry.min !== null && entry.max !== null && entry.min !== entry.max
        ? `${formatNumber(entry.min)}–${formatNumber(entry.max)} km²`
        : entry.min === null ? 'Valor não indicado' : `${formatNumber(entry.min)} km²`;
    const comparison = fieldCount === null
        ? 'Não foi possível calcular a comparação.'
        : `Equivale aproximadamente a ${formatNumber(fieldCount)} campos de futebol.`;

    const popup = document.createElement('div');
    popup.id = 'territory-size-modal';
    popup.className = 'conservation-status-modal-backdrop territory-size-modal-backdrop';
    popup.innerHTML = `<section class="conservation-status-modal territory-size-modal" role="dialog" aria-modal="true" aria-labelledby="territory-size-title">
        <div class="conservation-status-modal-heading"><div><span class="conservation-status-modal-kicker">Comparação de área</span><h2 id="territory-size-title">Tamanho do território</h2><p>O quadrado representa a área de território indicada para este animal.</p></div><button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button></div>
        <div class="territory-size-summary"><span>Área indicada</span><strong>${escapeHtml(areaLabel)}</strong><p>${escapeHtml(comparison)}</p></div>
        <div class="territory-comparison-square" aria-label="Comparação entre o território e um campo de futebol"><div class="football-field" style="width: ${fieldSize.width}px; height: ${fieldSize.height}px;"><span>Campo de futebol</span></div><span class="territory-square-label">Território</span></div>
        <div class="territory-comparison-legend"><span class="territory-legend-field"></span><span>${FOOTBALL_FIELD_LABEL}</span><span class="territory-legend-area"></span><span>Área total do território</span></div>
        ${fieldSize.compressed ? '<p class="territory-size-note">O campo é maior do que a área indicada; foi ajustado ao quadrado para continuar visível.</p>' : ''}
    </section>`;
    popup.__trigger = trigger;
    popup.querySelector('.conservation-status-modal-close').addEventListener('click', closeTerritorySizePopup);
    popup.addEventListener('click', event => { if (event.target === popup) closeTerritorySizePopup(); });
    popup.__handleEscape = event => { if (event.key === 'Escape') closeTerritorySizePopup(); };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    popup.querySelector('.conservation-status-modal-close').focus();
}

export function initTerritorySizePopup(root = document) {
    root.querySelectorAll('[data-territory-size-popup]').forEach(trigger => {
        if (trigger.dataset.territoryPopupReady === 'true') return;
        trigger.dataset.territoryPopupReady = 'true';
        trigger.addEventListener('click', () => openTerritorySizePopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openTerritorySizePopup(trigger); }
        });
    });
}
