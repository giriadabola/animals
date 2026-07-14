import {
    sexualSystems,
    sexualSystemDescriptions,
    normalizeSexualSystemKey,
    getSexualSystemSvg
} from './sexual-systems.js?v=1';

const sexualSystemCatalog = [...sexualSystems].sort((a, b) => a.localeCompare(b, 'pt-PT', { sensitivity: 'base' }));
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

function resolveSexualSystem(value) {
    const label = String(value || '').trim();
    const canonical = sexualSystemCatalog.find(system => normalizeSexualSystemKey(system) === normalizeSexualSystemKey(label)) || label;
    return {
        label: canonical || 'Sistema Sexual',
        description: sexualSystemDescriptions[canonical] || 'Sistema sexual específico deste animal.',
        icon: getSexualSystemSvg(canonical)
    };
}

function readSelectedSystems(trigger) {
    try {
        const values = JSON.parse(trigger.dataset.sexualSystems || '[]');
        return [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch {
        return [];
    }
}

function renderSelectedSystem(system) {
    return `
        <article class="sexual-system-selected-item">
            <div class="sexual-system-popup-icon">${system.icon}</div>
            <div class="sexual-system-popup-copy">
                <strong>${escapeHtml(system.label)}</strong>
                <p>${escapeHtml(system.description)}</p>
            </div>
        </article>`;
}

function renderInactiveSystem(system) {
    return `
        <article class="sexual-system-catalog-item" title="${escapeHtml(system.description)}">
            <div class="sexual-system-popup-icon sexual-system-catalog-icon">${system.icon}</div>
            <div class="sexual-system-popup-copy sexual-system-catalog-copy">
                <strong>${escapeHtml(system.label)}</strong>
                <p>${escapeHtml(system.description)}</p>
            </div>
        </article>`;
}

function closeSexualSystemPopup() {
    const popup = document.getElementById('sexual-system-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openSexualSystemPopup(trigger) {
    closeSexualSystemPopup();

    const selectedSystems = readSelectedSystems(trigger).map(resolveSexualSystem);
    const selectedKeys = new Set(selectedSystems.map(system => normalizeSexualSystemKey(system.label)));
    const inactiveSystems = sexualSystemCatalog
        .filter(system => !selectedKeys.has(normalizeSexualSystemKey(system)))
        .map(resolveSexualSystem);

    const popup = document.createElement('div');
    popup.id = 'sexual-system-modal';
    popup.className = 'conservation-status-modal-backdrop sexual-system-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal sexual-system-modal" role="dialog" aria-modal="true" aria-label="Sistema Sexual">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Modelo sexual</span>
                    <h2>Sistema Sexual</h2>
                    <p>As opções apresentadas no topo pertencem a este animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="sexual-system-selected-panel" aria-labelledby="sexual-system-selected-title">
                <h3 id="sexual-system-selected-title">Sistemas deste animal</h3>
                <div class="sexual-system-selected-list">
                    ${selectedSystems.length ? selectedSystems.map(renderSelectedSystem).join('') : '<p class="sexual-system-empty">Não foi indicado um sistema sexual específico.</p>'}
                </div>
            </section>
            <section class="sexual-system-catalog-panel" aria-labelledby="sexual-system-catalog-title">
                <h3 id="sexual-system-catalog-title">Outros sistemas sexuais</h3>
                <div class="sexual-system-catalog-list">
                    ${inactiveSystems.map(renderInactiveSystem).join('')}
                </div>
            </section>
        </section>`;
    popup.__trigger = trigger;

    const closeButton = popup.querySelector('.conservation-status-modal-close');
    closeButton.addEventListener('click', closeSexualSystemPopup);
    popup.addEventListener('click', event => {
        if (event.target === popup) closeSexualSystemPopup();
    });
    popup.__handleEscape = event => {
        if (event.key === 'Escape') closeSexualSystemPopup();
    };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    closeButton.focus();
}

export function initSexualSystemPopup(root = document) {
    root.querySelectorAll('[data-sexual-system-popup]').forEach(trigger => {
        if (trigger.dataset.sexualPopupReady === 'true') return;
        trigger.dataset.sexualPopupReady = 'true';
        trigger.addEventListener('click', () => openSexualSystemPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openSexualSystemPopup(trigger);
            }
        });
    });
}
