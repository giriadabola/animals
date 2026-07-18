import { getFeedingModelSvg } from '../js/feeding-visuals.js?v=1';
import { getConservationStatusMeta } from '../js/conservation-status-popup.js?v=1';
import { initShowcaseLike } from '../js/profile-favorites.js?v=1.0.13';

const DEFAULT_SHOWCASE_SETTINGS = {
    selectedAnimalId: '',
    characteristic: '',
    characteristicValue: '',
    randomAnimals: true,
    quantity: 6
};

const normalize = (value = '') => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function text(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ');
    return String(value.label ?? value.nome ?? value.name ?? value.valor ?? value.value ?? '');
}

function collectStrings(value, output = []) {
    if (value === null || value === undefined) return output;
    if (typeof value === 'string' || typeof value === 'number') {
        output.push(String(value));
        return output;
    }
    if (Array.isArray(value)) {
        value.forEach(item => collectStrings(item, output));
        return output;
    }
    if (typeof value === 'object') Object.values(value).forEach(item => collectStrings(item, output));
    return output;
}

function findDetail(animal, terms = []) {
    const wanted = terms.map(normalize);
    const visit = value => {
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) {
            for (const item of value) {
                const found = visit(item);
                if (found) return found;
            }
            return '';
        }
        if (typeof value !== 'object') return '';
        const type = normalize(value.tipo || value.label || value.nome || '');
        if (type && wanted.some(term => type.includes(term))) {
            const detail = text(value.valor ?? value.valorMin ?? value.value ?? value.detalhe ?? value.descricao);
            if (detail) {
                const unit = String(value.unidade || value.unit || '').trim();
                return unit ? `${detail} ${unit}` : detail;
            }
        }
        for (const child of Object.values(value)) {
            const found = visit(child);
            if (found) return found;
        }
        return '';
    };
    return visit(animal.informacao) || '—';
}
function firstBiome(animal) {
    const candidates = [animal.biomas, animal.bioma, animal.informacao?.geralDetalhada, animal.informacao?.distribuicao?.biomas,
        animal.informacao?.distribuicao?.bioma, animal.informacao?.ecologia?.biomas];
    for (const candidate of candidates) {
        const value = Array.isArray(candidate) ? candidate.find(item => normalize(item?.tipo || item?.label || "").includes("bioma"))?.valor || candidate[0] : candidate;
        const result = text(value).split(',')[0].trim();
        if (result) return result;
    }
    const all = collectStrings(animal.informacao?.distribuicao || {});
    return all.find(value => /bioma|floresta|savana|deserto|tundra|oceano|rio|lago|pântano|pantano/i.test(value)) || '';
}

function imageForAnimal(animal) {
    const source = animal.imagemUrl || '';
    const scientific = String(animal.nomeCientifico || '').trim().toLowerCase().replace(/\s+/g, '_');
    const file = scientific ? `${scientific}.png` : source.split('/').pop();
    return `assets/animais/${encodeURIComponent(file)}`;
}

function biomeImage(name) {
    return `assets/biomas_vertical/${encodeURIComponent(String(name || '').trim())}.png`;
}

function matchesCharacteristic(animal, characteristic) {
    const query = normalize(characteristic);
    if (!query) return true;
    return normalize(collectStrings(animal).join(' ')).includes(query);
}

function metricModelSvg(key) {
    const icons = {
        altura: '<svg class="metric-model-svg metric-height" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 10v60"/><path d="M18 10l-7 8"/><path d="M18 10l7 8"/><path d="M18 70l-7-8"/><path d="M18 70l7-8"/><path d="M40 19c10 0 18 9 18 24s-8 24-18 24"/><path d="M40 19c-6 5-9 13-9 24s3 19 9 24"/></svg>',
        peso: '<svg class="metric-model-svg metric-weight" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M25 68h30"/><path d="M40 13l-12 14h24L40 13Z"/><path d="M28 27h24l9 31H19l9-31Z"/><path d="M40 35v8"/></svg>',
        comprimento: '<svg class="metric-model-svg metric-length" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M11 45h58"/><path d="M11 45l8-8"/><path d="M11 45l8 8"/><path d="M69 45l-8-8"/><path d="M69 45l-8 8"/><path d="M20 31c12-12 28-12 40 0"/></svg>'
    };
    return icons[key] || icons.comprimento;
}

function reproductionModelSvg() {
    return '<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 13c15 0 27 12 27 27S55 67 40 67S13 55 13 40S25 13 40 13Z"/><path d="M40 25v30"/><path d="M25 40h30"/></svg>';
}
function renderCard(animal, characteristic = '') {
    const biome = firstBiome(animal);
    const card = document.createElement('div');
    card.className = 'animal-showcase-card';
    card.style.cursor = 'pointer';
    card.style.setProperty('--showcase-biome', 'url("' + biomeImage(biome) + '")');
    
    let statsHtml = '';
    if (characteristic) {
        const val = findDetail(animal, [characteristic]);
        const label = characteristic.charAt(0).toUpperCase() + characteristic.slice(1);
        const icon = reproductionModelSvg();
        statsHtml = `<article class="dimension-model-card showcase-stat-card accent-characteristic" style="grid-column: span 3; justify-content: center; text-align: center; width: 100%;"><div class="dimension-model-icon">${icon}</div><div class="dimension-model-copy" style="text-align: center;"><div class="dimension-model-label">${label}</div><div class="dimension-model-value">${val}</div></div></article>`;
    } else {
        const stats = [
            { label: 'Altura', value: findDetail(animal, ['altura']), icon: metricModelSvg('altura'), accent: 'accent-height' },
            { label: 'Peso', value: findDetail(animal, ['peso']), icon: metricModelSvg('peso'), accent: 'accent-weight' },
            { label: 'Comprimento', value: findDetail(animal, ['comprimento total', 'comprimento']), icon: metricModelSvg('comprimento'), accent: 'accent-length' }
        ];
        statsHtml = stats.map(stat => '<article class="dimension-model-card showcase-stat-card ' + stat.accent + '"><div class="dimension-model-icon">' + stat.icon + '</div><div class="dimension-model-copy"><div class="dimension-model-label">' + stat.label + '</div><div class="dimension-model-value">' + stat.value + '</div></div></article>').join('');
    }

    card.innerHTML = `
        <div class="animal-showcase-visual"><span class="animal-showcase-like" aria-label="Favoritar" title="Favoritar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg></span>
            <img class="animal-showcase-animal" src="${imageForAnimal(animal)}" alt="${text(animal.nome)}" loading="lazy" onerror="this.src='${animal.imagemUrl || ''}'">
        </div>
        <div class="animal-showcase-content">
            <div class="animal-showcase-biome-wrap">
                <svg class="biome-watermark-svg" viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 62h56"/>
                    <path d="M18 62V40l10-10l10 10v22M42 62V27l10-11l10 11v35"/>
                    <path d="M28 30V18M52 16V8M22 48h12M46 38h12"/>
                </svg>
                <span class="animal-showcase-biome">${biome || 'Bioma não indicado'}</span>
            </div>
            <h3>${text(animal.nome) || text(animal.nomeCientifico)}</h3>
            <div class="animal-showcase-stats">${statsHtml}</div>
        </div>`;
    const visual = card.querySelector('.animal-showcase-visual');
    const likeBtn = card.querySelector('.animal-showcase-like');
    initShowcaseLike({ button: likeBtn, animalId: animal.id });
    card.onclick = e => {
        if (e.target.closest('.animal-showcase-like')) return;
        window.location.href = `animal.html?id=${encodeURIComponent(animal.id)}`;
    };
    card.style.backgroundImage = 'linear-gradient(180deg, rgba(4,18,15,.04) 0%, rgba(4,18,15,.10) 52%, rgba(4,24,17,.96) 75%, #061a12 100%), url("' + biomeImage(biome) + '")';
    card.style.backgroundPosition = 'center, center bottom';
    card.style.backgroundSize = 'cover';
    visual.style.backgroundImage = 'none';
    return card;
}

export async function populateAnimalShowcase(allAnimals, db, getDoc, doc, settings = {}) {
    const container = document.getElementById('dynamic-sections-container');
    if (!container) return;
    const config = { ...DEFAULT_SHOWCASE_SETTINGS, ...(settings || {}) };
    if (!settings || Object.keys(settings).length === 0) {
        try {
            const snap = await getDoc(doc(db, 'settings', 'index-lists'));
            if (snap.exists()) Object.assign(config, snap.data().animalShowcase || {});
        } catch (error) { console.warn('Não foi possível carregar os cartões de animais.', error); }
    }

    let candidates = allAnimals;
    if (config.characteristic) {
        candidates = allAnimals.filter(animal => {
            const val = findDetail(animal, [config.characteristic]);
            if (!val || val === '—') return false;
            if (config.characteristicValue) {
                return normalize(val).includes(normalize(config.characteristicValue));
            }
            return true;
        });
    }
    const selected = allAnimals.find(animal => animal.id === config.selectedAnimalId);
    if (selected && !candidates.some(animal => animal.id === selected.id)) candidates.unshift(selected);
    if (config.randomAnimals) {
        candidates = [...candidates].sort(() => Math.random() - 0.5);
    } else if (selected) {
        candidates = [selected];
    }
    candidates = candidates.slice(0, Math.max(1, Number(config.quantity) || 6));
    if (!candidates.length) return;

    const section = document.createElement('section');
    section.className = 'animal-showcase-section';
    section.innerHTML = `<div class="animal-showcase-heading"><span>Em destaque</span><h2>Animais selecionados</h2></div><div class="animal-showcase-grid"></div>`;
    const grid = section.querySelector('.animal-showcase-grid');
    candidates.forEach(animal => grid.appendChild(renderCard(animal, config.characteristic)));
    container.appendChild(section);
}

export { DEFAULT_SHOWCASE_SETTINGS, collectStrings, firstBiome, matchesCharacteristic };
