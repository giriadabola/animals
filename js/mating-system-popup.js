import {
    matingSystems,
    matingSystemDescriptions,
    getMatingMeta,
    getMatingSystemSvg
} from './mating-systems.js?v=3';

const matingCatalog = [...matingSystems].sort((a, b) => a.localeCompare(b, 'pt-PT', { sensitivity: 'base' }));
const normalizeMatingSystem = (value = '') => String(value).trim().toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

function resolveMatingSystem(value) {
    const label = String(value || '').trim();
    const canonical = matingCatalog.find(system => normalizeMatingSystem(system) === normalizeMatingSystem(label)) || label;
    const meta = getMatingMeta(canonical);
    return {
        label: canonical || 'Acasalamento',
        description: matingSystemDescriptions[canonical] || 'Modelo de acasalamento específico deste animal.',
        icon: getMatingSystemSvg(meta.key)
    };
}

function readSelectedSystems(trigger) {
    try {
        const values = JSON.parse(trigger.dataset.matingSystems || '[]');
        return [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch {
        return [];
    }
}

function renderSelectedSystem(system) {
    return `
        <article class="mating-system-selected-item">
            <div class="mating-system-popup-icon">${system.icon}</div>
            <div class="mating-system-popup-copy">
                <strong>${escapeHtml(system.label)}</strong>
                <p>${escapeHtml(system.description)}</p>
            </div>
        </article>`;
}

function renderInactiveSystem(system) {
    return `
        <article class="mating-system-catalog-item" title="${escapeHtml(system.description)}">
            <div class="mating-system-popup-icon mating-system-catalog-icon">${system.icon}</div>
            <div class="mating-system-popup-copy mating-system-catalog-copy">
                <strong>${escapeHtml(system.label)}</strong>
                <p>${escapeHtml(system.description)}</p>
            </div>
        </article>`;
}

function closeMatingSystemPopup() {
    const popup = document.getElementById('mating-system-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openMatingSystemPopup(trigger) {
    closeMatingSystemPopup();

    const selectedSystems = readSelectedSystems(trigger).map(resolveMatingSystem);
    const selectedKeys = new Set(selectedSystems.map(system => normalizeMatingSystem(system.label)));
    const inactiveSystems = matingCatalog
        .filter(system => !selectedKeys.has(normalizeMatingSystem(system)))
        .map(resolveMatingSystem);

    const popup = document.createElement('div');
    popup.id = 'mating-system-modal';
    popup.className = 'conservation-status-modal-backdrop mating-system-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal mating-system-modal" role="dialog" aria-modal="true" aria-label="Acasalamento">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Modelo de acasalamento</span>
                    <h2>Acasalamento</h2>
                    <p>As opções apresentadas no topo pertencem a este animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="mating-system-selected-panel" aria-labelledby="mating-system-selected-title">
                <h3 id="mating-system-selected-title">Tipos de acasalamento deste animal</h3>
                <div class="mating-system-selected-list">
                    ${selectedSystems.length ? selectedSystems.map(renderSelectedSystem).join('') : '<p class="mating-system-empty">Não foi indicado um tipo de acasalamento específico.</p>'}
                </div>
            </section>
            <section class="mating-system-catalog-panel" aria-labelledby="mating-system-catalog-title">
                <h3 id="mating-system-catalog-title">Outros tipos de acasalamento</h3>
                <div class="mating-system-catalog-list">
                    ${inactiveSystems.map(renderInactiveSystem).join('')}
                </div>
            </section>
        </section>`;
    popup.__trigger = trigger;

    const closeButton = popup.querySelector('.conservation-status-modal-close');
    closeButton.addEventListener('click', closeMatingSystemPopup);
    popup.addEventListener('click', event => {
        if (event.target === popup) closeMatingSystemPopup();
    });
    popup.__handleEscape = event => {
        if (event.key === 'Escape') closeMatingSystemPopup();
    };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    closeButton.focus();
}

export function initMatingSystemPopup(root = document) {
    root.querySelectorAll('[data-mating-system-popup]').forEach(trigger => {
        if (trigger.dataset.matingPopupReady === 'true') return;
        trigger.dataset.matingPopupReady = 'true';
        trigger.addEventListener('click', () => openMatingSystemPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openMatingSystemPopup(trigger);
            }
        });
    });
}
