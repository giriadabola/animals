import { db } from "./firebase-config.js?v=5";
import { findLocalAnimalsByWikidata, getWikidataLocalizedNames } from "./wikidata-search.js?v=1";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { generalVisualOptions } from "./general-visual-catalog.js";
import { initAnimalLanguage, renderAnimalLanguageSelect, getSavedAnimalLanguage } from "./i18n/index.js?v=20260717_zh_complete_1";
import { hideLoadingOverlay } from "./loader.js?v=2";
import {
    collapseCombinedGenderItems,
    getGenderUi,
    normalizeGenderValue,
    GENDER_BOTH,
    GENDER_MALE,
    GENDER_FEMALE
} from "./gender-utils.js?v=2";

const compareGrid = document.getElementById('compareGrid');
const compareSearchInput = document.getElementById('compareSearchInput');
const compareSearchResults = document.getElementById('compareSearchResults');
const compareSimilarityPanel = document.getElementById('compareSimilarityPanel');

const state = {
    allAnimals: [],
    selectedIds: [],
    selections: {},
    activeRowType: '',
    similarityTargetId: ''
};

const preferredOrder = generalVisualOptions.map(option => option.tipo);

const localizedNamesCache = {}; // { [animalId]: { [lang]: name } }

async function fetchLocalizedNames(animal) {
    if (!animal?.nomeCientifico || !animal?.id) return;
    if (localizedNamesCache[animal.id]?._fetched) return;

    if (!localizedNamesCache[animal.id]) {
        localizedNamesCache[animal.id] = { pt: animal.nome };
    }
    try {
        const names = await getWikidataLocalizedNames(animal.nomeCientifico);
        Object.assign(localizedNamesCache[animal.id], names);
        localizedNamesCache[animal.id]._fetched = true;
    } catch (e) {
        console.warn('Erro ao obter nomes da Wikidata para ' + animal.nome, e);
    }
}

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"]/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
    }[char]));
}

function normalizeSearchText(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}


function getAlsoKnownAsNames(animal = {}) {
    const curiosidades = animal.informacao?.curiosidades || {};
    const names = [];
    const idiomaData = animal.informacao?.idiomas;
    if (Array.isArray(idiomaData)) names.push(...idiomaData.map(item => item?.nome || item?.name).filter(Boolean));
    else if (idiomaData && typeof idiomaData === 'object') names.push(...Object.values(idiomaData).filter(Boolean));
    if (Array.isArray(curiosidades.tambemConhecidoComo)) names.push(...curiosidades.tambemConhecidoComo);
    if (Array.isArray(curiosidades.detalhes)) {
        curiosidades.detalhes
            .filter(item => item?.tipo === 'Também conhecido como' && item?.valor)
            .forEach(item => names.push(...String(item.valor).split(',')));
    }
    return names.map(name => String(name).trim()).filter(Boolean);
}

function animalMatchesSearch(animal = {}, term = '') {
    if (!term) return true;
    return [animal.nome, animal.nomeCientifico, ...getAlsoKnownAsNames(animal)]
        .map(normalizeSearchText)
        .some(value => value.includes(term));
}

function normalizePhaseValue(value = '') {
    return normalizeSearchText(value).includes('cria') ? 'Cria' : 'Adulto';
}

function getPhaseUi(value = 'Adulto') {
    return normalizePhaseValue(value) === 'Cria'
        ? { value: 'Cria', title: 'Cria', html: '<i class="fa-solid fa-baby" aria-hidden="true"></i>' }
        : { value: 'Adulto', title: 'Adulto', html: '<i class="fa-solid fa-paw" aria-hidden="true"></i>' };
}

function parseSelectedIdsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const ids = [
        ...(params.get('ids') ? params.get('ids').split(',') : []),
        ...(params.get('id') ? [params.get('id')] : [])
    ].map(id => id.trim()).filter(Boolean);
    return [...new Set(ids)].slice(0, 4);
}

function getAnimalById(animalId = '') {
    return state.allAnimals.find(animal => animal.id === animalId) || null;
}

function getActiveCategories(categoria) {
    if (typeof categoria === 'string') return categoria || 'Sem categoria';
    if (!categoria || typeof categoria !== 'object') return 'Sem categoria';
    return Object.keys(categoria).filter(key => categoria[key] === true).join(', ') || 'Sem categoria';
}

function getAllItems(animal = {}) {
    const ecology = animal.informacao?.ecologia || {};
    const raw = [
        ...(Array.isArray(animal.informacao?.geralDetalhada) ? animal.informacao.geralDetalhada : []),
        ...(Array.isArray(animal.informacao?.dimensoesDetalhadas) ? animal.informacao.dimensoesDetalhadas : []),
        ...(Array.isArray(animal.informacao?.alimentacaoDetalhada) ? animal.informacao.alimentacaoDetalhada : []),
        ...(Array.isArray(animal.informacao?.alimentacaoEstrategias) ? animal.informacao.alimentacaoEstrategias.map(item => ({
            tipo: item.estrategia || item.tipo || 'Estratégia alimentar',
            detalhe: item.detalhe || item.valor || '',
            genero: item.genero,
            fase: item.fase
        })) : []),
        ...(Array.isArray(animal.informacao?.reproducaoDetalhada) ? animal.informacao.reproducaoDetalhada : []),
        ...(Array.isArray(animal.informacao?.plumagemDetalhada) ? animal.informacao.plumagemDetalhada.map(item => ({
            tipo: item.tipo || item.grupo || 'Plumagem',
            detalhe: item.detalhe || '',
            genero: item.genero,
            fase: item.fase
        })) : []),
        ...(ecology.funcaoEcologica || ecology.funcao ? [{
            tipo: 'Função ecológica',
            detalhe: ecology.funcaoEcologica || ecology.funcao
        }] : []),
        ...(Array.isArray(ecology.predadoresNaturais) ? [{
            tipo: 'Predadores naturais',
            detalhe: ecology.predadoresNaturais.map(item => item?.nome || item?.nomeCientifico || String(item || '')).filter(Boolean).join(' • ')
        }] : []),
        ...(Array.isArray(ecology.presas) ? [{
            tipo: 'Presas',
            detalhe: ecology.presas.map(item => item?.nome || item?.nomeCientifico || String(item || '')).filter(Boolean).join(' • ')
        }] : []),
        ...(Array.isArray(ecology.competidores) ? [{
            tipo: 'Competidores',
            detalhe: ecology.competidores.map(item => item?.nome || item?.nomeCientifico || String(item || '')).filter(Boolean).join(' • ')
        }] : []),
        ...(Array.isArray(ecology.ameacasNaturais) ? [{
            tipo: 'Ameaças naturais',
            detalhe: ecology.ameacasNaturais.map(item => item?.nome || item?.nomeCientifico || String(item || '')).filter(Boolean).join(' • ')
        }] : []),
        ...(ecology.ameacasNaturaisTexto || ecology.ameacasTexto ? [{
            tipo: 'Ameaças naturais (texto)',
            detalhe: ecology.ameacasNaturaisTexto || ecology.ameacasTexto
        }] : []),
        ...(Array.isArray(ecology.relacoesSimbioticas) ? [{
            tipo: 'Relações simbióticas',
            detalhe: ecology.relacoesSimbioticas.map(item => item?.nome || item?.nomeCientifico || String(item || '')).filter(Boolean).join(' • ')
        }] : []),
        ...(Array.isArray(animal.informacao?.curiosidades?.detalhes) ? animal.informacao.curiosidades.detalhes : []),
        ...(animal.informacao?.curiosidades?.cor ? [{ tipo: 'Cor do animal', detalhe: animal.informacao.curiosidades.cor }] : []),
        ...(animal.informacao?.curiosidades?.estadoConservacao ? [{ tipo: 'Estado de Conservação', detalhe: animal.informacao.curiosidades.estadoConservacao }] : []),
        ...(animal.informacao?.curiosidades?.relacaoHumanos ? [{ tipo: 'Relação com Humanos', detalhe: animal.informacao.curiosidades.relacaoHumanos }] : []),
        ...(animal.informacao?.curiosidades?.temperaturaAmbiente ? [{ tipo: 'Temperatura do Ambiente', detalhe: animal.informacao.curiosidades.temperaturaAmbiente }] : [])
    ];

    return collapseCombinedGenderItems(
        raw.filter(item => item?.tipo && (item?.valor || item?.valorMin || item?.valorMax || item?.detalhe))
    );
}

function getAvailableGenderChoices(items = []) {
    const choices = new Set();
    let hasNeutral = false;

    items.forEach(item => {
        const gender = normalizeGenderValue(item?.genero, GENDER_BOTH);
        if (gender === GENDER_BOTH) {
            hasNeutral = true;
            return;
        }
        if (gender === GENDER_MALE || gender === GENDER_FEMALE) {
            choices.add(gender);
        }
    });

    if (!choices.size) choices.add(GENDER_BOTH);
    if (hasNeutral) choices.add(GENDER_BOTH);
    return choices;
}

function getAvailablePhaseChoices(items = []) {
    const choices = new Set();
    items.forEach(item => choices.add(normalizePhaseValue(item?.fase)));
    if (!choices.size) choices.add('Adulto');
    return choices;
}

function getDefaultSelection(items = []) {
    const genders = getAvailableGenderChoices(items);
    const phases = getAvailablePhaseChoices(items);
    return {
        gender: genders.has(GENDER_BOTH) ? GENDER_BOTH : (genders.has(GENDER_MALE) ? GENDER_MALE : GENDER_FEMALE),
        phase: phases.has('Adulto') ? 'Adulto' : [...phases][0]
    };
}

function ensureSelectionForAnimal(animal = {}) {
    if (!animal?.id) return { gender: GENDER_BOTH, phase: 'Adulto' };
    const items = getAllItems(animal);
    const existing = state.selections[animal.id];

    if (!existing) {
        state.selections[animal.id] = getDefaultSelection(items);
        return state.selections[animal.id];
    }

    const genders = getAvailableGenderChoices(items);
    const phases = getAvailablePhaseChoices(items);
    if (!genders.has(existing.gender)) existing.gender = getDefaultSelection(items).gender;
    if (!phases.has(existing.phase)) existing.phase = getDefaultSelection(items).phase;
    return existing;
}

function cycleValue(current, values) {
    if (values.length <= 1) return values[0] || current;
    const index = values.includes(current) ? values.indexOf(current) : 0;
    return values[(index + 1) % values.length];
}

function getNextAvailableGender(animal = {}) {
    const items = getAllItems(animal);
    const allowed = [...getAvailableGenderChoices(items)];
    const selection = ensureSelectionForAnimal(animal);
    return cycleValue(selection.gender, [GENDER_BOTH, GENDER_MALE, GENDER_FEMALE].filter(value => allowed.includes(value)));
}

function getNextAvailablePhase(animal = {}) {
    const items = getAllItems(animal);
    const allowed = [...getAvailablePhaseChoices(items)];
    const selection = ensureSelectionForAnimal(animal);
    return cycleValue(selection.phase, ['Adulto', 'Cria'].filter(value => allowed.includes(value)));
}

function scoreItem(item = {}, selection = { gender: GENDER_BOTH, phase: 'Adulto' }) {
    const itemGender = normalizeGenderValue(item.genero, GENDER_BOTH);
    const itemPhase = normalizePhaseValue(item.fase);
    let score = 0;

    if (itemGender === selection.gender) score += 40;
    else if (itemGender === GENDER_BOTH) score += 22;
    else if (selection.gender === GENDER_BOTH) score += 12;

    if (itemPhase === selection.phase) score += 16;
    else if (!item.fase) score += 4;

    return score;
}

function valueFromItem(item = {}) {
    const detail = String(item?.detalhe ?? '').trim();
    if (detail) return detail;

    const min = String(item?.valorMin ?? item?.valor ?? '').trim();
    const max = String(item?.valorMax ?? '').trim();
    const unit = String(item?.unidade ?? '').trim();
    if (min && max) return `${min}-${max}${unit ? ` ${unit}` : ''}`;
    if (min || max) return `${min || max}${unit ? ` ${unit}` : ''}`;
    return '-';
}

function getVisibleMap(animal = {}) {
    const items = getAllItems(animal);
    const selection = ensureSelectionForAnimal(animal);
    const map = new Map();

    items.forEach(item => {
        const type = item.tipo || '';
        if (!type) return;
        const score = scoreItem(item, selection);
        const current = map.get(type);
        if (!current || score > current.score) {
            map.set(type, { item, score });
        }
    });

    return map;
}

function getStatOrder(animals = []) {
    const seen = new Set();
    const order = [];

    preferredOrder.forEach(type => {
        if (animals.some(animal => getAllItems(animal).some(item => item.tipo === type))) {
            seen.add(type);
            order.push(type);
        }
    });

    animals.forEach(animal => {
        getAllItems(animal).forEach(item => {
            if (!seen.has(item.tipo)) {
                seen.add(item.tipo);
                order.push(item.tipo);
            }
        });
    });

    return order;
}

function normalizeCellValue(value = '') {
    return normalizeSearchText(value).replace(/[^a-z0-9]+/g, '');
}

function getComparisonValue(item = null) {
    if (!item) return '-';
    return valueFromItem(item);
}



function renderAnimalHeader(animal = {}) {
    if (!localizedNamesCache[animal.id]?._fetched) {
        return `
            <article class="compare-animal-card is-loading">
                <div class="compare-animal-loader">
                    <div class="animal-animation">
                        <i class="fa-solid fa-paw"></i>
                    </div>
                </div>
            </article>
        `;
    }

    const selection = ensureSelectionForAnimal(animal);
    const genderUi = getGenderUi(selection.gender);
    const phaseUi = getPhaseUi(selection.phase);
    const items = getAllItems(animal);
    const availableGenders = getAvailableGenderChoices(items);
    const availablePhases = getAvailablePhaseChoices(items);

    const currentLang = getSavedAnimalLanguage();
    const displayName = (localizedNamesCache[animal.id] && (localizedNamesCache[animal.id][currentLang] || localizedNamesCache[animal.id]['en'])) || animal.nome;

    return `
        <article class="compare-animal-card">
            <div class="compare-animal-controls">
                <div class="compare-controls-left">
                    <button type="button" class="compare-variant-btn compare-variant-gender" data-animal-id="${escapeHtml(animal.id)}" data-field="gender" ${availableGenders.size <= 1 ? 'disabled' : ''} aria-label="Alternar género">${genderUi.html}</button>
                    <button type="button" class="compare-variant-btn compare-variant-phase compare-phase-${phaseUi.value.toLowerCase()}" data-animal-id="${escapeHtml(animal.id)}" data-field="phase" ${availablePhases.size <= 1 ? 'disabled' : ''} aria-label="Alternar fase">${phaseUi.html}</button>
                </div>
                <div class="compare-controls-right">
                    <button type="button" class="compare-variant-btn compare-variant-similar" data-similar-id="${escapeHtml(animal.id)}" aria-label="Parecido" title="Parecido"><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i></button>
                    <button type="button" class="compare-variant-btn compare-variant-remove" data-remove-id="${escapeHtml(animal.id)}" aria-label="Remover" title="Remover"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
                </div>
            </div>
            <div class="compare-animal-image">
                <img src="${escapeHtml(animal.imagemUrl || '')}" alt="${escapeHtml(animal.nome || '')}" style="object-position: ${escapeHtml(animal.imagemObjectPosition || 'center center')}">
            </div>
            <div class="compare-animal-copy">
                <h4>${escapeHtml(displayName || 'Animal')}</h4>
                <p>${escapeHtml(animal.nomeCientifico || 'Sem nome científico')}</p>
                <span>${escapeHtml(getActiveCategories(animal.categoria))}</span>
            </div>
            <a class="compare-open-link" href="animal.html?id=${encodeURIComponent(animal.id)}">Abrir</a>
        </article>
    `;
}

function renderMatrix() {
    const animals = state.selectedIds.map(getAnimalById).filter(Boolean);
    const rows = getStatOrder(animals);

    if (!rows.length) {
        compareGrid.innerHTML = '<div class="compare-empty">Escolhe pelo menos um animal para iniciar a comparação.</div>';
        return;
    }

    const maps = new Map(animals.map(animal => [animal.id, getVisibleMap(animal)]));

    compareGrid.innerHTML = `
        <div class="compare-matrix-table" style="--animal-count: ${animals.length};">
            <div class="compare-matrix-row compare-matrix-row-head">
                <div class="compare-matrix-label compare-matrix-label-head">Estatística</div>
                ${animals.map(animal => renderAnimalHeader(animal)).join('')}
            </div>
            ${rows.map(type => `
                <div class="compare-matrix-row ${state.activeRowType === type ? 'is-active' : ''}" data-row-type="${escapeHtml(type)}">
                    <div class="compare-matrix-label">${escapeHtml(type)}</div>
                    ${animals.map(animal => {
                        const isLoaded = !!localizedNamesCache[animal.id]?._fetched;
                        if (!isLoaded) {
                            return `
                                <div class="compare-matrix-value is-loading">
                                    <i class="fa-solid fa-paw fa-pulse" style="opacity: 0.35; font-size: 1.3rem;"></i>
                                </div>
                            `;
                        }
                        const visible = maps.get(animal.id);
                        const item = visible?.get(type)?.item || null;
                        const value = getComparisonValue(item);
                        return `
                            <div class="compare-matrix-value ${value === '-' ? 'is-empty' : ''}">
                                <strong>${escapeHtml(value)}</strong>
                            </div>
                        `;
                    }).join('')}
                </div>
            `).join('')}
        </div>
    `;

    compareGrid.querySelectorAll('.compare-matrix-row[data-row-type]').forEach(row => {
        row.addEventListener('click', event => {
            if (event.target.closest('button, a, input')) return;
            state.activeRowType = row.dataset.rowType || '';
            renderMatrix();
        });
    });

    compareGrid.querySelectorAll('[data-animal-id][data-field]').forEach(button => {
        button.addEventListener('click', () => {
            const animal = getAnimalById(button.dataset.animalId || '');
            if (!animal) return;
            const field = button.dataset.field;
            const next = field === 'gender' ? getNextAvailableGender(animal) : getNextAvailablePhase(animal);
            state.selections[animal.id] = { ...ensureSelectionForAnimal(animal), [field]: next };
            renderAll();
        });
    });

    compareGrid.querySelectorAll('[data-remove-id]').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.removeId;
            state.selectedIds = state.selectedIds.filter(item => item !== id);
            delete state.selections[id];
            if (state.similarityTargetId === id) state.similarityTargetId = '';
            updateUrl();
            renderAll();
        });
    });

    compareGrid.querySelectorAll('[data-similar-id]').forEach(button => {
        button.addEventListener('click', () => {
            state.similarityTargetId = button.dataset.similarId || '';
            renderSimilarityPanel();
        });
    });
}

function computeSimilarity(targetAnimal = {}, candidateAnimal = {}) {
    const targetMap = getVisibleMap(targetAnimal);
    const candidateMap = getVisibleMap(candidateAnimal);
    const allTypes = new Set([...targetMap.keys(), ...candidateMap.keys()]);

    let score = 0;
    let max = 0;

    allTypes.forEach(type => {
        max += 3;
        const targetValue = normalizeCellValue(getComparisonValue(targetMap.get(type)?.item || null));
        const candidateValue = normalizeCellValue(getComparisonValue(candidateMap.get(type)?.item || null));
        if (!targetValue || !candidateValue) return;
        if (targetValue === candidateValue) {
            score += 3;
        } else if (targetValue.slice(0, 6) === candidateValue.slice(0, 6)) {
            score += 1;
        }
    });

    const targetFamily = normalizeSearchText(targetAnimal.familia || '');
    const candidateFamily = normalizeSearchText(candidateAnimal.familia || '');
    if (targetFamily && targetFamily === candidateFamily) score += 8;

    const targetCategory = normalizeSearchText(getActiveCategories(targetAnimal.categoria));
    const candidateCategory = normalizeSearchText(getActiveCategories(candidateAnimal.categoria));
    if (targetCategory && candidateCategory && targetCategory === candidateCategory) score += 5;

    const percentage = max ? Math.min(100, Math.round((score / (max + 13)) * 100)) : 0;
    return percentage;
}

function renderSimilarityPanel() {
    if (!compareSimilarityPanel) return;

    const target = getAnimalById(state.similarityTargetId);
    if (!target) {
        compareSimilarityPanel.hidden = true;
        compareSimilarityPanel.innerHTML = '';
        return;
    }

    const candidates = state.allAnimals
        .filter(animal => animal.id !== target.id)
        .map(animal => ({ animal, score: computeSimilarity(target, animal) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

    compareSimilarityPanel.hidden = false;
    compareSimilarityPanel.innerHTML = `
        <div class="compare-similarity-head">
            <div>
                <strong>Parecido com ${escapeHtml(target.nome || 'animal')}</strong>
                <span>Top animais com estatísticas mais próximas.</span>
            </div>
            <button type="button" class="compare-similarity-close" aria-label="Fechar">×</button>
        </div>
        <div class="compare-similarity-list">
            ${candidates.length ? candidates.map(({ animal, score }) => `
                <article class="compare-similarity-item">
                    <img src="${escapeHtml(animal.imagemUrl || '')}" alt="${escapeHtml(animal.nome || '')}">
                    <div class="compare-similarity-copy">
                        <strong>${escapeHtml(animal.nome || 'Animal')}</strong>
                        <span>${escapeHtml(animal.nomeCientifico || '')}</span>
                        <small>${score}% parecido</small>
                    </div>
                    <a class="compare-open-link" href="animal.html?id=${encodeURIComponent(animal.id)}">Abrir</a>
                </article>
            `).join('') : '<div class="compare-empty">Sem animais semelhantes para mostrar.</div>'}
        </div>
    `;

    compareSimilarityPanel.querySelector('.compare-similarity-close')?.addEventListener('click', () => {
        state.similarityTargetId = '';
        renderSimilarityPanel();
    });
}

function renderSearchResults() {
    if (!compareSearchResults) return;
    const term = normalizeSearchText(compareSearchInput.value);
    if (!term) {
        compareSearchResults.style.display = 'none';
        compareSearchResults.innerHTML = '';
        return;
    }

    const selected = new Set(state.selectedIds);
    const matches = state.allAnimals
        .filter(animal => !selected.has(animal.id))
        .filter(animal => animalMatchesSearch(animal, term))
        .slice(0, 8);

    if (!matches.length) {
        compareSearchResults.innerHTML = '<div class="compare-empty">Sem resultados.</div>';
        compareSearchResults.style.display = 'block';
        return;
    }

    const currentLang = getSavedAnimalLanguage();
    compareSearchResults.innerHTML = matches.map(animal => {
        const displayName = (localizedNamesCache[animal.id] && (localizedNamesCache[animal.id][currentLang] || localizedNamesCache[animal.id]['en'])) || animal.nome;
        return `
            <div class="compare-result-dropdown-item" data-add-id="${animal.id}">
                <img src="${escapeHtml(animal.imagemUrl || '')}" alt="${escapeHtml(displayName || '')}">
                <div class="compare-result-dropdown-copy">
                    <strong>${escapeHtml(displayName || 'Animal')}</strong>
                    <span>${escapeHtml(animal.nomeCientifico || '')}</span>
                </div>
            </div>
        `;
    }).join('');

    compareSearchResults.style.display = 'flex';

    compareSearchResults.querySelectorAll('[data-add-id]').forEach(item => {
        item.addEventListener('click', () => {
            addAnimal(item.dataset.addId);
            compareSearchResults.style.display = 'none';
            compareSearchResults.innerHTML = '';
        });
    });
}

function addAnimal(animalId = '') {
    if (!animalId || state.selectedIds.includes(animalId) || state.selectedIds.length >= 4) return;
    state.selectedIds = [...state.selectedIds, animalId];
    compareSearchInput.value = '';
    state.similarityTargetId = '';
    updateUrl();
    renderAll();

    const animal = getAnimalById(animalId);
    if (animal) {
        fetchLocalizedNames(animal).then(() => renderAll());
    }
}

function renderAll() {
    state.selectedIds.forEach(id => {
        const animal = getAnimalById(id);
        if (animal) ensureSelectionForAnimal(animal);
    });

    renderMatrix();
    renderSimilarityPanel();
}

function updateUrl() {
    const params = new URLSearchParams();
    if (state.selectedIds.length) params.set('ids', state.selectedIds.join(','));
    const query = params.toString();
    history.replaceState({}, '', `vs.html${query ? `?${query}` : ''}`);
}

async function loadAnimals() {
    compareGrid.innerHTML = '<div class="compare-empty">A carregar animais...</div>';

    try {
        const snapshot = await getDocs(collection(db, 'animais'));
        state.allAnimals = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt'));

        const availableIds = new Set(state.allAnimals.map(animal => animal.id));
        state.selectedIds = parseSelectedIdsFromUrl().filter(id => availableIds.has(id));

        // Initialize language control and apply saved language
        const langContainer = document.getElementById('compare-language-select-container');
        if (langContainer) {
            langContainer.innerHTML = renderAnimalLanguageSelect();
            initAnimalLanguage(document.body);
        }

        // Collect translation fetch promises for selected animals
        const localizePromises = [];
        state.selectedIds.forEach(id => {
            const animal = getAnimalById(id);
            if (animal) {
                ensureSelectionForAnimal(animal);
                localizePromises.push(fetchLocalizedNames(animal));
            }
        });

        // Wait for Wikidata localized names to load
        await Promise.all(localizePromises);

        updateUrl();
        renderAll();
        hideLoadingOverlay();
    } catch (error) {
        console.error('Erro ao carregar animais para comparação:', error);
        compareGrid.innerHTML = '<div class="compare-empty">Não foi possível carregar os animais.</div>';
        hideLoadingOverlay();
    }
}

compareSearchInput.addEventListener('input', renderSearchResults);
compareSearchInput.addEventListener('focus', renderSearchResults);

document.addEventListener('click', (e) => {
    if (compareSearchResults && !e.target.closest('.compare-search-block')) {
        compareSearchResults.style.display = 'none';
    }
});

document.addEventListener('animal-language-change', () => {
    const promises = state.selectedIds
        .map(getAnimalById)
        .filter(Boolean)
        .map(animal => fetchLocalizedNames(animal));

    Promise.all(promises).then(() => {
        renderAll();
    });
});

loadAnimals();
