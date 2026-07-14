import { socialTypes, getSocialMeta, getSocialSvg } from './general-visual-catalog.js';

const socialCatalog = [...socialTypes].sort((a, b) => a.label.localeCompare(b.label, 'pt-PT', { sensitivity: 'base' }));

const normalizeSocialType = (value = '') => String(value)
    .trim()
    .toLocaleLowerCase('pt-PT')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

function resolveSocialType(value) {
    const label = String(value || '').trim();
    const match = socialCatalog.find(type => normalizeSocialType(type.label) === normalizeSocialType(label));
    const canonical = match?.label || label;
    const meta = getSocialMeta(canonical);
    return {
        label: canonical || 'Vida social',
        description: 'Modelo visual da organização social deste animal.',
        icon: getSocialSvg(meta.key)
    };
}

function readSelectedTypes(trigger) {
    try {
        const values = JSON.parse(trigger.dataset.socialTypes || '[]');
        return [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch {
        return [];
    }
}

function renderSocialItem(type, inactive = false) {
    return `
        <article class="perception-type-item${inactive ? ' perception-type-catalog-item' : ''}" title="${escapeHtml(type.description)}">
            <div class="perception-type-popup-icon">${type.icon}</div>
            <div class="perception-type-popup-copy">
                <strong>${escapeHtml(type.label)}</strong>
                <p>${escapeHtml(type.description)}</p>
            </div>
        </article>`;
}

function closeSocialTypePopup() {
    const popup = document.getElementById('social-type-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openSocialTypePopup(trigger) {
    closeSocialTypePopup();

    const selectedTypes = readSelectedTypes(trigger).map(resolveSocialType);
    const selectedKeys = new Set(selectedTypes.map(type => normalizeSocialType(type.label)));
    const inactiveTypes = socialCatalog
        .filter(type => !selectedKeys.has(normalizeSocialType(type.label)))
        .map(type => resolveSocialType(type.label));

    const popup = document.createElement('div');
    popup.id = 'social-type-modal';
    popup.className = 'conservation-status-modal-backdrop social-type-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal perception-type-modal social-type-modal" role="dialog" aria-modal="true" aria-label="Vida Social">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Modelo de vida social</span>
                    <h2>Vida Social</h2>
                    <p>As opções apresentadas no topo pertencem a este animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="perception-type-selected-panel" aria-labelledby="social-type-selected-title">
                <h3 id="social-type-selected-title">Tipos de vida social deste animal</h3>
                <div class="perception-type-list">
                    ${selectedTypes.length ? selectedTypes.map(type => renderSocialItem(type)).join('') : '<p class="perception-type-empty">Não foi indicado um tipo de vida social específico.</p>'}
                </div>
            </section>
            <section class="perception-type-catalog-panel" aria-labelledby="social-type-catalog-title">
                <h3 id="social-type-catalog-title">Outros tipos de vida social</h3>
                <div class="perception-type-catalog-grid">
                    ${inactiveTypes.map(type => renderSocialItem(type, true)).join('')}
                </div>
            </section>
        </section>`;
    popup.__trigger = trigger;

    const closeButton = popup.querySelector('.conservation-status-modal-close');
    closeButton.addEventListener('click', closeSocialTypePopup);
    popup.addEventListener('click', event => {
        if (event.target === popup) closeSocialTypePopup();
    });
    popup.__handleEscape = event => {
        if (event.key === 'Escape') closeSocialTypePopup();
    };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    closeButton.focus();
}

export function initSocialTypePopup(root = document) {
    root.querySelectorAll('[data-social-type-popup]').forEach(trigger => {
        if (trigger.dataset.socialPopupReady === 'true') return;
        trigger.dataset.socialPopupReady = 'true';
        trigger.addEventListener('click', () => openSocialTypePopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openSocialTypePopup(trigger);
            }
        });
    });
}
