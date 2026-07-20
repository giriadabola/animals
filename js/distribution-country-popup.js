import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const POPUP_ID = 'distribution-country-animals-modal';
let animalsPromise = null;

function normalizeCountryCode(value = '') {
    if (value && typeof value === 'object') return String(value.codigo || value.code || value.iso2 || value.iso || value.id || '').trim().toUpperCase();
    return String(value || '').trim().toUpperCase();
}

function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
}

function escapeHtml(value = '') {
    return String(value).replace(/[&<>\"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));
}

function ensurePopup() {
    let popup = document.getElementById(POPUP_ID);
    if (popup) return popup;
    popup = document.createElement('div');
    popup.id = POPUP_ID;
    popup.className = 'distribution-country-animals-backdrop';
    popup.hidden = true;
    popup.innerHTML = `<section class="distribution-country-animals-modal" role="dialog" aria-modal="true" aria-labelledby="distribution-country-animals-title"><button type="button" class="distribution-country-animals-close" aria-label="Fechar">&times;</button><div class="distribution-country-animals-heading"><span class="distribution-country-animals-kicker">Distribuição exclusiva</span><h2 id="distribution-country-animals-title"></h2><p>Animais registados apenas neste país.</p></div><div class="distribution-country-animals-status" aria-live="polite"></div><div class="distribution-country-animals-list"></div></section>`;
    const close = () => { popup.hidden = true; document.body.classList.remove('distribution-country-animals-open'); };
    popup.querySelector('.distribution-country-animals-close').addEventListener('click', close);
    popup.addEventListener('click', event => { if (event.target === popup) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !popup.hidden) close(); });
    document.body.appendChild(popup);
    return popup;
}

async function loadAnimals(db) {
    if (!animalsPromise) animalsPromise = getDocs(collection(db, 'animais')).then(snapshot => snapshot.docs.map(item => ({ id: item.id, ...item.data() })));
    return animalsPromise;
}

function getCountryName(countryList, code) {
    const record = countryList?.[code];
    return record?.nome || record?.name || code;
}

function getFlagImage(code, countryName) {
    if (!/^[A-Z]{2}$/.test(code)) return '';
    return '<img class="distribution-country-flag-image" src="https://flagcdn.com/48x36/' + code.toLowerCase() + '.png" alt="Bandeira de ' + escapeHtml(countryName) + '" width="48" height="36" loading="eager">';
}

function renderAnimals(popup, animals) {
    const list = popup.querySelector('.distribution-country-animals-list');
    if (!animals.length) {
        list.innerHTML = '<p class="distribution-country-animals-empty">Não existem outros animais registados apenas neste país.</p>';
        return;
    }
    list.innerHTML = animals.map((animal, index) => {
        const name = animal.nome || 'Animal sem nome';
        const image = animal.imagemUrl || '';
        const objectPosition = animal.imagemObjectPosition || 'center center';
        return `<a class="distribution-country-animal-card" href="animal.html?id=${encodeURIComponent(animal.id)}"><span class="distribution-country-animal-rank">${index + 1}</span>${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy" style="object-position:${escapeHtml(objectPosition)}">` : '<span class="distribution-country-animal-placeholder" aria-hidden="true">🐾</span>'}<span class="distribution-country-animal-name">${escapeHtml(name)}</span></a>`;
    }).join('');
}

export function initDistributionCountryPopup({ db, containers = [], countryList = {}, currentAnimalId = '' } = {}) {
    const popup = ensurePopup();
    const openForCountry = async code => {
        const normalizedCode = normalizeCountryCode(code);
        if (!normalizedCode) return;
        const countryName = getCountryName(countryList, normalizedCode);
        popup.querySelector('#distribution-country-animals-title').innerHTML = `${getFlagImage(normalizedCode, countryName)}<span>${escapeHtml(countryName)}</span>`;
        popup.querySelector('.distribution-country-animals-status').textContent = 'A carregar animais...';
        popup.querySelector('.distribution-country-animals-list').innerHTML = '';
        popup.hidden = false;
        document.body.classList.add('distribution-country-animals-open');
        try {
            const animals = await loadAnimals(db);
            const matches = animals.filter(animal => {
                if (animal.id === currentAnimalId) return false;
                const countries = Array.isArray(animal.informacao?.distribuicao?.paises) ? [...new Set(animal.informacao.distribuicao.paises.map(normalizeCountryCode).filter(Boolean))] : [];
                return countries.length === 1 && countries[0] === normalizedCode;
            });
            renderAnimals(popup, shuffle(matches).slice(0, 10));
            popup.querySelector('.distribution-country-animals-status').textContent = `${matches.length} ${matches.length === 1 ? 'animal encontrado' : 'animais encontrados'}`;
        } catch (error) {
            console.error('Erro ao carregar animais por país:', error);
            popup.querySelector('.distribution-country-animals-status').textContent = 'Não foi possível carregar os animais.';
        }
    };
    containers.filter(Boolean).forEach(container => {
        container.addEventListener('click', event => {
            const path = event.target.closest('path[data-code]');
            if (path && container.contains(path)) openForCountry(path.dataset.code);
        });
        container.classList.add('distribution-country-map-clickable');
    });
}
