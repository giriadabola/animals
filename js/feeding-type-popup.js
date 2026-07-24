import { feedingTypes, feedingTypeDescriptions, getFeedingModelSvg, getFeedingVisualMeta } from './feeding-visuals.js';
import { getWikidataLabelsByTerm, getWikidataLocalizedNames, getWikidataScientificName } from './wikidata-search.js?v=20260717_localized_names_1';

const feedingCatalog = [...feedingTypes].sort((a, b) => a.localeCompare(b, 'pt-PT', { sensitivity: 'base' }));

const normalizeFeedingType = (value = '') => String(value).trim().toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[character]));

function resolveFeedingType(value) {
    const label = String(value || '').trim();
    const canonical = feedingCatalog.find(type => normalizeFeedingType(type) === normalizeFeedingType(label)) || label;
    const meta = getFeedingVisualMeta(canonical);
    return {
        label: canonical || 'Alimentação',
        description: feedingTypeDescriptions[canonical] || 'Tipo de alimentação específico deste animal.',
        meta,
        icon: getFeedingModelSvg(meta.key)
    };
}

function readSelectedTypes(trigger) {
    try {
        const values = JSON.parse(trigger.dataset.feedingTypes || '[]');
        return [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(Boolean))];
    } catch {
        return [];
    }
}

function readFeedingRelations(trigger) {
    try {
        const data = JSON.parse(trigger.dataset.feedingRelations || '{}');
        return {
            animals: Array.isArray(data.animals) ? data.animals : [],
            foods: Array.isArray(data.foods) ? data.foods : [],
            groups: Array.isArray(data.groups) ? data.groups : []
        };
    } catch {
        return { animals: [], foods: [] };
    }
}

function renderFeedingRelations(relations, selectedTypes = []) {
    const renderItemRows = (animals = [], foods = []) => [
        ...animals.map(animal => ({
            category: 'Animal',
            name: animal.nome || animal.label || animal.nomeCientifico || 'Animal',
            scientific: animal.nomeCientifico || ''
        })),
        ...foods.map(food => ({
            category: 'Alimento',
            name: typeof food === 'object' ? food.nome || food.label || 'Alimento' : food,
            scientific: typeof food === 'object' ? food.nomeCientifico || '' : ''
        }))
    ];
    const rows = relations.groups.length
        ? relations.groups.flatMap(group => [
            { groupTitle: group.title },
            ...renderItemRows(group.animals, group.foods)
        ])
        : renderItemRows(relations.animals, relations.foods);
    if (!rows.some(row => !row.groupTitle)) return '';
    return `
        <section class="feeding-relations-panel" aria-labelledby="feeding-relations-title">
            <h3 id="feeding-relations-title">Animais e alimentos associados</h3>
            <div class="feeding-relations-table-wrap">
                <table class="feeding-relations-table">
                    <thead><tr><th>Tipo</th><th>Nome</th><th>Nome científico</th></tr></thead>
                    <tbody>${rows.map(row => row.groupTitle
                        ? `<tr class="feeding-relations-group-row"><th colspan="3">${escapeHtml(row.groupTitle)}</th></tr>`
                        : `<tr><td>${escapeHtml(row.category)}</td><td data-feeding-name-source="${escapeHtml(row.name)}" data-feeding-scientific-source="${escapeHtml(row.scientific)}">${escapeHtml(row.name)}</td><td>${row.scientific ? escapeHtml(row.scientific) : '&#8212;'}</td></tr>`).join('')}</tbody>
                </table>
            </div>
        </section>`;
}

function renderSelectedType(type) {
    return `
        <article class="feeding-type-selected-item">
            <div class="feeding-type-popup-icon">${type.icon}</div>
            <div class="feeding-type-popup-copy">
                <strong>${escapeHtml(type.label)}</strong>
                <p>${escapeHtml(type.description)}</p>
            </div>
        </article>`;
}

function renderInactiveType(type) {
    return `
        <article class="feeding-type-selected-item feeding-type-catalog-item" title="${escapeHtml(type.description)}">
            <div class="feeding-type-popup-icon feeding-type-catalog-icon">${type.icon}</div>
            <div class="feeding-type-popup-copy feeding-type-catalog-copy">
                <strong>${escapeHtml(type.label)}</strong>
                <p>${escapeHtml(type.description)}</p>
            </div>
        </article>`;
}

function closeFeedingTypePopup() {
    const popup = document.getElementById('feeding-type-modal');
    if (!popup) return;
    if (popup.__handleEscape) document.removeEventListener('keydown', popup.__handleEscape);
    if (popup.__handleLanguageChange) document.removeEventListener('animal-language-change', popup.__handleLanguageChange);
    const trigger = popup.__trigger;
    popup.remove();
    document.body.classList.remove('conservation-status-modal-open');
    trigger?.focus();
}


function getActiveFeedingLanguage() {
    return document.documentElement.lang === 'pt-PT' ? 'pt' : document.documentElement.lang || 'pt';
}

async function openFeedingTypePopup(trigger) {
    closeFeedingTypePopup();

    const loader = document.createElement('div');
    loader.className = 'feeding-loading-backdrop';
    loader.style.cssText = 'position: fixed; inset: 0; z-index: 100000; background: rgba(3, 5, 16, 0.7); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center;';
    loader.innerHTML = '<i class="fa-solid fa-paw fa-fade" style="font-size: 4rem; color: #10b981;"></i>';
    document.body.appendChild(loader);

    try {
        const selectedTypes = readSelectedTypes(trigger).map(resolveFeedingType);
        const relations = readFeedingRelations(trigger);
        const language = getActiveFeedingLanguage();

        const processItems = async (items, isAnimal) => {
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                const originalName = isAnimal 
                    ? (item.nome || item.label || item.nomeCientifico || '') 
                    : (typeof item === 'object' ? item.nome || item.label : item);
                
                let displayName = originalName;
                const scientificSource = isAnimal ? item.nomeCientifico || '' : '';
                if (language !== 'pt' && originalName) {
                    const labels = scientificSource
                        ? await getWikidataLocalizedNames(scientificSource)
                        : await getWikidataLabelsByTerm(originalName);
                    displayName = labels[language]
                        || (language === 'zh' ? labels['zh-hans'] || labels['zh-hant'] : '')
                        || originalName;
                }

                if (!isAnimal && typeof item !== 'object') {
                    item = { nome: displayName, nomeCientifico: '' };
                    items[i] = item;
                } else {
                    item.nome = displayName;
                }

                if (!item.nomeCientifico && originalName) {
                    const scName = await getWikidataScientificName(originalName);
                    item.nomeCientifico = scName || '';
                }
            }
        };

        if (relations.groups.length) {
            await Promise.all(relations.groups.map(async group => {
                await Promise.all([
                    processItems(group.animals || [], true),
                    processItems(group.foods || [], false)
                ]);
            }));
        } else {
            await Promise.all([
                processItems(relations.animals || [], true),
                processItems(relations.foods || [], false)
            ]);
        }

        const selectedKeys = new Set(selectedTypes.map(type => normalizeFeedingType(type.label)));
        const inactiveTypes = feedingCatalog
            .filter(type => !selectedKeys.has(normalizeFeedingType(type)))
            .map(resolveFeedingType);

        const popup = document.createElement('div');
        popup.id = 'feeding-type-modal';
        popup.className = 'conservation-status-modal-backdrop feeding-type-modal-backdrop';
        popup.innerHTML = `
            <section class="conservation-status-modal feeding-type-modal" role="dialog" aria-modal="true" aria-label="Alimentação">
                <div class="conservation-status-modal-heading">
                    <div>
                        <span class="conservation-status-modal-kicker">Modelo de alimentação</span>
                        <h2>Alimentação</h2>
                        <p>Os tipos apresentados no topo pertencem a este animal.</p>
                    </div>
                    <button type="button" class="conservation-status-modal-close" aria-label="Fechar">&times;</button>
                </div>
                <section class="feeding-type-selected-panel" aria-labelledby="feeding-type-selected-title">
                    <h3 id="feeding-type-selected-title">Tipos de alimentação deste animal</h3>
                    <div class="feeding-type-selected-list">
                        ${selectedTypes.length ? selectedTypes.map(renderSelectedType).join('') : '<p class="feeding-type-empty">Não foi indicado um tipo de alimentação específico.</p>'}
                    </div>
                </section>
                ${renderFeedingRelations(relations, selectedTypes)}
                <section class="feeding-type-catalog-panel" aria-labelledby="feeding-type-catalog-title">
                    <h3 id="feeding-type-catalog-title">Outros tipos de alimentação</h3>
                    <div class="feeding-type-catalog-grid">
                        ${inactiveTypes.map(renderInactiveType).join('')}
                    </div>
                </section>
            </section>`;
        popup.__trigger = trigger;

        const closeButton = popup.querySelector('.conservation-status-modal-close');
        closeButton.addEventListener('click', closeFeedingTypePopup);
        popup.addEventListener('click', event => {
            if (event.target === popup) closeFeedingTypePopup();
        });
        popup.__handleEscape = event => {
            if (event.key === 'Escape') closeFeedingTypePopup();
        };
        document.addEventListener('keydown', popup.__handleEscape);
        popup.__handleLanguageChange = () => {
            closeFeedingTypePopup();
            openFeedingTypePopup(trigger);
        };
        document.addEventListener('animal-language-change', popup.__handleLanguageChange);
        document.body.appendChild(popup);
        document.body.classList.add('conservation-status-modal-open');
        closeButton.focus();
    } catch (error) {
        console.error(error);
    } finally {
        loader.remove();
    }
}

export function initFeedingTypePopup(root = document) {
    root.querySelectorAll('[data-feeding-type-popup]').forEach(trigger => {
        if (trigger.dataset.feedingPopupReady === 'true') return;
        trigger.dataset.feedingPopupReady = 'true';
        trigger.addEventListener('click', () => openFeedingTypePopup(trigger));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openFeedingTypePopup(trigger);
            }
        });
    });
}
