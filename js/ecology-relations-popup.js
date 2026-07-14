import { getEcologyBlockSvg } from './ecology-visuals.js?v=20260714_ecology_models';
import { db } from './firebase-config.js?v=5';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

const gridIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1"></rect>
        <rect x="14" y="4" width="6" height="6" rx="1"></rect>
        <rect x="4" y="14" width="6" height="6" rx="1"></rect>
        <rect x="14" y="14" width="6" height="6" rx="1"></rect>
    </svg>`;

const listIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
        <path d="M5 6h14M5 12h14M5 18h14"></path>
        <circle cx="3.5" cy="6" r=".7" fill="currentColor" stroke="none"></circle>
        <circle cx="3.5" cy="12" r=".7" fill="currentColor" stroke="none"></circle>
        <circle cx="3.5" cy="18" r=".7" fill="currentColor" stroke="none"></circle>
    </svg>`;

function normalizeRelationEntry(item = {}) {
    if (typeof item === 'string') {
        const value = item.trim();
        return { id: value, nome: value, nomeCientifico: '' };
    }
    return {
        id: String(item.id || item.animalId || '').trim(),
        nome: String(item.nome || item.label || item.name || '').trim(),
        nomeCientifico: String(item.nomeCientifico || item.scientificName || '').trim(),
        imagemUrl: String(item.imagemUrl || item.imageUrl || item.imagem || item.image || '').trim(),
        imagemObjectPosition: String(item.imagemObjectPosition || item.imageObjectPosition || 'center center').trim()
    };
}

function getRelationLabel(item) {
    if (item.nome && item.nomeCientifico) return `${item.nome} (${item.nomeCientifico})`;
    return item.nome || item.nomeCientifico || item.id || 'Animal';
}

function getRelationImage(item) {
    if (item.imagemUrl) return item.imagemUrl;
    const profileImage = Array.isArray(item.profileImages)
        ? item.profileImages.find(image => image?.isPrimary)?.url || item.profileImages[0]?.url
        : '';
    return String(profileImage || '').trim();
}

function renderRelationImage(item, relationKey) {
    const imageUrl = getRelationImage(item);
    const imageContent = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="Imagem de ${escapeHtml(item.nome || item.nomeCientifico || item.id || 'animal')}" loading="lazy" style="object-position: ${escapeHtml(item.imagemObjectPosition || 'center center')};">`
        : `<div class="ecology-relations-item-image-placeholder">${getEcologyBlockSvg(relationKey)}</div>`;
    return `<div class="ecology-relations-item-image${imageUrl ? '' : ' is-placeholder'}" data-ecology-relation-image="${escapeHtml(item.id)}">${imageContent}</div>`;
}

function readRelations(trigger) {
    try {
        const values = JSON.parse(trigger.dataset.ecologyRelations || '[]');
        const seen = new Set();
        return (Array.isArray(values) ? values : [])
            .map(normalizeRelationEntry)
            .filter(item => {
                const key = `${item.id}|${item.nome}|${item.nomeCientifico}`;
                if (seen.has(key) || (!item.id && !item.nome && !item.nomeCientifico)) return false;
                seen.add(key);
                return true;
            });
    } catch {
        return [];
    }
}

function renderRelationItem(item, relationKey) {
    const label = getRelationLabel(item);
    const commonName = item.nome || item.nomeCientifico || item.id || 'Animal';
    const scientificName = item.nome && item.nomeCientifico
        ? `<span>${escapeHtml(item.nomeCientifico)}</span>`
        : '';
    const content = `
        ${renderRelationImage(item, relationKey)}
        <div class="ecology-relations-item-icon">${getEcologyBlockSvg(relationKey)}</div>
        <div class="ecology-relations-item-copy">
            <strong>${escapeHtml(commonName)}</strong>
            ${scientificName}
        </div>
        ${item.id ? '<span class="ecology-relations-item-arrow" aria-hidden="true">↗︎</span>' : ''}`;

    if (!item.id) {
        return `<div class="ecology-relations-item ecology-relations-item-static" title="${escapeHtml(label)}">${content}</div>`;
    }

    return `<a class="ecology-relations-item" href="animal.html?id=${encodeURIComponent(item.id)}">${content}</a>`;
}

function setRelationImageFallback(imageBox, relationKey) {
    imageBox.classList.add('is-placeholder');
    imageBox.innerHTML = `<div class="ecology-relations-item-image-placeholder">${getEcologyBlockSvg(relationKey)}</div>`;
}

async function hydrateRelationImages(popup, relations, relationKey) {
    await Promise.all(relations.map(async relation => {
        if (!relation.id || getRelationImage(relation)) return;
        try {
            const snapshot = await getDoc(doc(db, 'animais', relation.id));
            if (!snapshot.exists()) return;
            const animal = snapshot.data() || {};
            const imageUrl = String(animal.imagemUrl || '').trim();
            if (!imageUrl) return;
            const imageBox = [...popup.querySelectorAll('[data-ecology-relation-image]')]
                .find(element => element.dataset.ecologyRelationImage === relation.id);
            if (!imageBox) return;
            imageBox.classList.remove('is-placeholder');
            imageBox.innerHTML = `<img src="${escapeHtml(imageUrl)}" alt="Imagem de ${escapeHtml(relation.nome || relation.nomeCientifico || relation.id)}" loading="lazy" style="object-position: ${escapeHtml(animal.imagemObjectPosition || 'center center')};">`;
            imageBox.querySelector('img')?.addEventListener('error', () => setRelationImageFallback(imageBox, relationKey), { once: true });
        } catch (error) {
            console.warn('Não foi possível carregar a imagem da relação ecológica.', error);
        }
    }));
}

function setViewMode(popup, mode) {
    const list = popup.querySelector('[data-ecology-relations-list]');
    const toggle = popup.querySelector('[data-ecology-relations-view-toggle]');
    const isGrid = mode === 'grid';
    list.classList.toggle('is-grid', isGrid);
    toggle.innerHTML = isGrid ? listIcon : gridIcon;
    toggle.setAttribute('aria-label', isGrid ? 'Mudar para lista' : 'Mudar para grelha');
    toggle.setAttribute('title', isGrid ? 'Mudar para lista' : 'Mudar para grelha');
    toggle.dataset.view = isGrid ? 'grid' : 'list';
}

function closeEcologyRelationsPopup() {
    const popup = document.getElementById('ecology-relations-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}

function openEcologyRelationsPopup(trigger) {
    closeEcologyRelationsPopup();

    const relations = readRelations(trigger);
    const relationTitle = trigger.dataset.ecologyRelationTitle || 'Relações ecológicas';
    const relationKey = trigger.dataset.ecologyRelationKey || 'ecologia';
    const countLabel = `${relations.length} ${relations.length === 1 ? 'animal' : 'animais'}`;

    const popup = document.createElement('div');
    popup.id = 'ecology-relations-modal';
    popup.className = 'conservation-status-modal-backdrop ecology-relations-modal-backdrop';
    popup.innerHTML = `
        <section class="conservation-status-modal ecology-relations-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(relationTitle)}">
            <div class="conservation-status-modal-heading">
                <div>
                    <span class="conservation-status-modal-kicker">Relações ecológicas</span>
                    <h2>${escapeHtml(relationTitle)}</h2>
                    <p>${escapeHtml(countLabel)} associados a este animal.</p>
                </div>
                <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
            </div>
            <section class="ecology-relations-panel" aria-labelledby="ecology-relations-title">
                <div class="ecology-relations-section-heading">
                    <h3 id="ecology-relations-title">Animais relacionados</h3>
                    <button type="button" class="ecology-relations-view-toggle" data-ecology-relations-view-toggle aria-label="Mudar para grelha" title="Mudar para grelha">${gridIcon}</button>
                </div>
                <div class="ecology-relations-list" data-ecology-relations-list>
                    ${relations.map(item => renderRelationItem(item, relationKey)).join('')}
                </div>
            </section>
        </section>`;

    popup.__trigger = trigger;
    const closeButton = popup.querySelector('.conservation-status-modal-close');
    const viewToggle = popup.querySelector('[data-ecology-relations-view-toggle]');
    closeButton.addEventListener('click', closeEcologyRelationsPopup);
    viewToggle.addEventListener('click', () => setViewMode(popup, viewToggle.dataset.view === 'grid' ? 'list' : 'grid'));
    popup.addEventListener('click', event => {
        if (event.target === popup) closeEcologyRelationsPopup();
    });
    popup.__handleEscape = event => {
        if (event.key === 'Escape') closeEcologyRelationsPopup();
    };
    document.addEventListener('keydown', popup.__handleEscape);
    document.body.appendChild(popup);
    document.body.classList.add('conservation-status-modal-open');
    setViewMode(popup, 'list');
    hydrateRelationImages(popup, relations, relationKey);
    closeButton.focus();
}

export function initEcologyRelationsPopup(root = document) {
    root.querySelectorAll('[data-ecology-relations]').forEach(trigger => {
        if (trigger.dataset.ecologyRelationsPopupReady === 'true') return;
        trigger.dataset.ecologyRelationsPopupReady = 'true';
        trigger.addEventListener('click', () => openEcologyRelationsPopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openEcologyRelationsPopup(trigger);
            }
        });
    });
}
