import { db } from '../js/firebase-config.js?v=5';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import { initAnimalLanguage, renderAnimalLanguageSelect, getSavedAnimalLanguage } from '../js/i18n/index.js?v=20260718_footer_labels_1';
import { getWikidataLocalizedNames } from '../js/wikidata-search.js?v=20260717_localized_names_1';

const main = document.getElementById('main-content-area');
function applyLabSiteLogo() {
    const logo = document.querySelector('.logo-emoji');
    if (!logo || logo.dataset.labLogoReady === 'true') return;
    logo.dataset.labLogoReady = 'true';
    logo.innerHTML = '<img src="assets/logos/site/elephant-paw-target-style.svg" alt="" aria-hidden="true">';
    logo.classList.add('lab-site-logo');
}

applyLabSiteLogo();
new MutationObserver(applyLabSiteLogo).observe(document.body, { childList: true, subtree: true });

function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function localAnimalImage(scientificName = '') {
    const filename = String(scientificName).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    return filename ? `assets/animais/${filename}.png` : '';
}

function hasDimensionValue(item = {}) {
    return [item.valor, item.valorMin, item.valorMax].some(value => String(value ?? '').trim() !== '');
}

function getDimensionModelKey(type = '') {
    const normalized = String(type).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (normalized.includes('altura')) return 'altura';
    if (normalized.includes('peso')) return 'peso';
    if (normalized.includes('envergadura')) return 'envergadura';
    if (normalized.includes('asa')) return 'asa';
    if (normalized.includes('bico')) return 'bico';
    if (normalized.includes('cauda')) return 'cauda';
    if (normalized.includes('pata')) return 'patas';
    if (normalized.includes('ovo')) return 'ovo';
    if (normalized.includes('largura')) return 'largura';
    if (normalized.includes('diametro')) return 'diametro';
    if (normalized.includes('comprimento')) return 'comprimento';
    return 'medida';
}

function getDimensionModelSvg(key = 'medida') {
    const models = {
        altura: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M18 10v60M18 10l-7 8M18 10l7 8M18 70l-7-8M18 70l7-8M40 19c10 0 18 9 18 24s-8 24-18 24M40 19c-6 5-9 13-9 24s3 19 9 24"/></svg>',
        peso: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M25 68h30M40 13l-12 14h24L40 13ZM28 27h24l9 31H19l9-31ZM40 35v8"/></svg>',
        comprimento: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M11 45h58M11 45l8-8M11 45l8 8M69 45l-8-8M69 45l-8 8M20 31c12-12 28-12 40 0"/></svg>',
        largura: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M18 41h44M18 41l7-7M18 41l7 7M62 41l-7-7M62 41l-7 7"/><ellipse cx="40" cy="41" rx="21" ry="27"/></svg>',
        diametro: '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="25"/><path d="M15 40h50M15 40l7-7M15 40l7 7M65 40l-7-7M65 40l-7 7"/></svg>',
        envergadura: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M7 42h66M7 42l8-8M7 42l8 8M73 42l-8-8M73 42l-8 8M17 55c8-13 15-20 23-23M63 55c-8-13-15-20-23-23"/></svg>',
        asa: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M14 55C27 30 44 16 67 13C63 34 51 52 30 66H14V55ZM31 28C38 36 42 46 43 59M45 21C51 30 53 40 53 50"/></svg>',
        bico: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M13 44c8-15 22-24 37-22c8 1 13 5 16 11h8L61 44H42l-9 9H18l5-9H13ZM57 33h17M57 44h17"/><circle cx="35" cy="31" r="3"/></svg>',
        cauda: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M16 44h19M35 44L66 22M35 44L70 44M35 44L66 66M15 33v22M54 22v44"/></svg>',
        patas: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M28 13v39M52 13v39M24 52l-10 12M28 52l4 13M32 52l12 10M48 52l-10 12M52 52l4 13M56 52l12 10"/></svg>',
        ovo: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 10c13 0 23 17 23 33c0 15-9 27-23 27S17 58 17 43C17 27 27 10 40 10ZM20 70h40"/></svg>',
        medida: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M16 59L58 17l6 6l-42 42l-8-6ZM26 49l6 6M36 39l6 6M46 29l6 6"/></svg>'
    };
    return models[key] || models.medida;
}
function formatDimensionValue(item = {}) {
    const min = String(item.valorMin ?? item.valor ?? '').trim();
    const max = String(item.valorMax ?? '').trim();
    const value = min && max ? `${min}–${max}` : (min || max || '—');
    return `${value}${item.unidade ? ` ${item.unidade}` : ''}`;
}

function renderDimensionFilters(dimensions) {
    const genders = new Set(dimensions.map(item => String(item.genero || '').trim().toUpperCase()).filter(value => value === 'M' || value === 'F'));
    const phases = new Set(dimensions.map(item => String(item.fase || 'Adulto').trim()).filter(Boolean));
    const buttons = [];
    if (genders.has('M')) buttons.push('<button type="button" class="lab-filter-button lab-filter-gender-m is-active" data-lab-gender="M" aria-label="Filtrar macho" title="Macho">&#9794;</button>');
    if (genders.has('F')) buttons.push('<button type="button" class="lab-filter-button lab-filter-gender-f" data-lab-gender="F" aria-label="Filtrar fêmea" title="Fêmea">&#9792;</button>');
    if (phases.has('Cria')) {
        buttons.push('<span class="lab-filter-separator" aria-hidden="true"></span>');
        buttons.push('<button type="button" class="lab-filter-button lab-filter-phase-adult is-active" data-lab-phase="Adulto" aria-label="Filtrar adulto" title="Adulto"><i class="fa-solid fa-paw" aria-hidden="true"></i></button>');
        buttons.push('<button type="button" class="lab-filter-button lab-filter-phase-young" data-lab-phase="Cria" aria-label="Filtrar cria" title="Cria"><i class="fa-solid fa-baby" aria-hidden="true"></i></button>');
    }
    return buttons.length ? `<div class="lab-dimension-filters" aria-label="Filtros de dimensões">${buttons.join('')}</div>` : '';
}

function renderMeasurementGuides(dimensions = []) {
    const keys = new Set(dimensions.map(item => getDimensionModelKey(item.tipo)));
    const guides = [];
    if (keys.has('altura')) guides.push('<span class="lab-measurement-guide lab-measurement-height" data-measure-guide="altura" aria-label="Linha de medição da altura"><i class="lab-measurement-arrow lab-arrow-top"></i><i class="lab-measurement-arrow lab-arrow-bottom"></i></span>');
    if (keys.has('comprimento')) guides.push('<span class="lab-measurement-guide lab-measurement-length" data-measure-guide="comprimento" aria-label="Linha de medição do comprimento"><i class="lab-measurement-arrow lab-arrow-left"></i><i class="lab-measurement-arrow lab-arrow-right"></i></span>');
    return guides.join('');
}
function renderDimensions(animal = {}) {
    const dimensions = Array.isArray(animal.informacao?.dimensoesDetalhadas)
        ? animal.informacao.dimensoesDetalhadas.filter(item => item?.tipo && hasDimensionValue(item))
        : [];
    if (!dimensions.length) return '';
    return `<section class="lab-dimensions" aria-label="Dimensões">
<div class="lab-dimension-grid" style="--lab-dimension-count: ${dimensions.length};">
            ${dimensions.map(item => {
                return `<article class="lab-dimension-card" data-lab-dimension data-measure-key="${escapeHtml(getDimensionModelKey(item.tipo))}" data-gender="${escapeHtml(String(item.genero || '').trim().toUpperCase())}" data-phase="${escapeHtml(item.fase || 'Adulto')}" tabindex="0" role="button">
<div class="lab-dimension-icon">${getDimensionModelSvg(getDimensionModelKey(item.tipo))}</div>
                    <div class="lab-dimension-copy">
                        <h3>${escapeHtml(item.tipo)}</h3>
                        <strong>${escapeHtml(formatDimensionValue(item))}</strong>
                    </div>
                </article>`;
            }).join('')}
        </div>
    </section>`;
}

function initMeasurementCardClicks() {
    const cards = [...document.querySelectorAll('[data-lab-dimension]')];
    const guides = [...document.querySelectorAll('[data-measure-guide]')];
    const activateCard = card => {
        card.classList.toggle('is-measure-selected');
        const selectedKeys = new Set(
            cards
                .filter(c => c.classList.contains('is-measure-selected'))
                .map(c => c.dataset.measureKey)
                .filter(key => ['altura', 'comprimento'].includes(key))
        );
        guides.forEach(guide => {
            guide.classList.toggle('is-visible', selectedKeys.has(guide.dataset.measureGuide));
        });
    };
    cards.forEach(card => {
        card.addEventListener('click', () => activateCard(card));
        card.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            activateCard(card);
        });
    });
}
function initDimensionFilters() {
    const cards = [...document.querySelectorAll('[data-lab-dimension]')];
    const controls = [...document.querySelectorAll('[data-lab-gender], [data-lab-phase]')];
    if (!controls.length) return;
    const selected = {
        gender: controls.find(control => control.dataset.labGender)?.dataset.labGender || '',
        phase: controls.find(control => control.dataset.labPhase)?.dataset.labPhase || ''
    };
    const applyFilters = () => {
        cards.forEach(card => {
            const genderMatches = !selected.gender || !card.dataset.gender || card.dataset.gender === selected.gender;
            const phaseMatches = !selected.phase || card.dataset.phase === selected.phase;
            card.hidden = !(genderMatches && phaseMatches);
        });
        controls.forEach(control => {
            const value = control.dataset.labGender || control.dataset.labPhase;
            control.classList.toggle('is-active', value === selected.gender || value === selected.phase);
        });
    };
    controls.forEach(control => control.addEventListener('click', () => {
        if (control.dataset.labGender) selected.gender = control.dataset.labGender;
        if (control.dataset.labPhase) selected.phase = control.dataset.labPhase;
        applyFilters();
    }));
    applyFilters();
}
function renderLab(animal) {
    const image = localAnimalImage(animal.nomeCientifico);
    main.innerHTML = `<div class="lab-shell"><header class="lab-header"><div><span class="lab-kicker">Laboratório</span><h1 data-animal-common-name>${escapeHtml(animal.nome || 'Animal')}</h1><p class="lab-scientific-name">(${escapeHtml(animal.nomeCientifico || 'Nome científico não indicado')})</p></div><div class="lab-language">${renderAnimalLanguageSelect()}</div></header><section class="lab-visual" aria-label="Imagem de ${escapeHtml(animal.nome || 'animal')}"><div class="lab-visual-filters">${renderDimensionFilters(Array.isArray(animal.informacao?.dimensoesDetalhadas) ? animal.informacao.dimensoesDetalhadas.filter(item => item?.tipo && hasDimensionValue(item)) : [])}</div><img src="${escapeHtml(image)}" alt="${escapeHtml(animal.nome || 'Animal')}" data-local-image><div class="lab-measurement-guides">${renderMeasurementGuides(Array.isArray(animal.informacao?.dimensoesDetalhadas) ? animal.informacao.dimensoesDetalhadas.filter(item => item?.tipo && hasDimensionValue(item)) : [])}</div></section>${renderDimensions(animal)}</div>`;
    const imageElement = main.querySelector('[data-local-image]');
    imageElement.draggable = false;
    imageElement.addEventListener('contextmenu', event => event.preventDefault());
    imageElement.addEventListener('dragstart', event => event.preventDefault());
    imageElement.addEventListener('selectstart', event => event.preventDefault());
    imageElement.addEventListener('error', () => {
        if (animal.imagemUrl) { imageElement.src = animal.imagemUrl; return; }
        imageElement.replaceWith(Object.assign(document.createElement('p'), { className: 'lab-error', textContent: 'A imagem local deste animal ainda não está disponível.' }));
    }, { once: true });
    initAnimalLanguage(main);
    initDimensionFilters();
    initMeasurementCardClicks();
    initLocalizedName(animal);
    document.title = `${animal.nome || 'Laboratório'} - Laboratório`;
}

async function initLocalizedName(animal) {
    const updateName = async language => {
        let name = animal.nome || 'Animal';
        if (language !== 'pt' && animal.nomeCientifico) {
            const names = await getWikidataLocalizedNames(animal.nomeCientifico);
            name = names[language] || names.en || name;
        }
        document.querySelectorAll('[data-animal-common-name]').forEach(element => { element.textContent = name; });
        document.title = `${name} - Laboratório`;
    };
    document.addEventListener('animal-language-change', event => updateName(event.detail?.language || getSavedAnimalLanguage()));
    await updateName(getSavedAnimalLanguage());
}

async function loadLab() {
    const animalId = new URLSearchParams(window.location.search).get('id');
    if (!animalId) { main.innerHTML = '<p class="lab-error">Não foi indicado o animal a explorar.</p>'; return; }
    try {
        const snapshot = await getDoc(doc(db, 'animais', animalId));
        if (!snapshot.exists()) throw new Error('Animal não encontrado');
        renderLab(snapshot.data());
    } catch (error) {
        console.error('Erro ao carregar o laboratório:', error);
        main.innerHTML = '<p class="lab-error">Não foi possível carregar este laboratório.</p>';
    }
}

loadLab();
