import { db, auth } from "../js/firebase-config.js?v=5";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { hideLoadingOverlay, waitForPageImages } from "../js/loader.js?v=2";
import { initGlobeSearch } from "./globe-search.js";
import { initBiomaExplorer } from "./bioma-explorer.js";
import { populateSurvivalLists } from "./survival-lists.js?v=1.0.14";
import { findLocalAnimalsByWikidata } from "../js/wikidata-search.js?v=1";

onAuthStateChanged(auth, (user) => {
    console.log("AUTH STATE: Estado de autenticação recebido. Utilizador:", user ? (user.email || user.uid) : "Anónimo");
});

let allAnimals = [];
let searchSequence = 0;
let mainLayout = null;
const searchInput = document.getElementById('searchInput');
const searchResultsContainer = document.getElementById('searchResults');
const heroSearchSection = document.querySelector('.hero-wrapper-section');
const loadingMessage = document.getElementById('loading-message');
const categoriesContainer = document.getElementById('categories-list');
const heroContentGrid = document.querySelector('.hero-content-grid');
const indexSearchArea = document.getElementById('indexSearchArea');

function setSearchResultsOpen(isOpen) {
    if (heroSearchSection) heroSearchSection.classList.toggle('search-results-open', Boolean(isOpen));
    if (mainLayout) mainLayout.classList.toggle('has-results', Boolean(isOpen));
}

function syncSearchResultsPlacement() {
    if (!searchResultsContainer || !heroContentGrid || !indexSearchArea) return;
    const shouldLiveUnderInput = window.innerWidth <= 992;
    const desiredParent = shouldLiveUnderInput ? indexSearchArea : heroContentGrid;

    if (searchResultsContainer.parentElement !== desiredParent) {
        desiredParent.appendChild(searchResultsContainer);
    }
}

function keepSearchResultsTopVisible(forceScroll = false) {
    if (!searchResultsContainer) return;
    syncSearchResultsPlacement();
    searchResultsContainer.scrollTop = 0;

    const rect = searchResultsContainer.getBoundingClientRect();
    const safeTop = window.innerWidth <= 992 ? 18 : 76;
    const targetY = window.scrollY + rect.top - safeTop;

    if (forceScroll || rect.top < safeTop || rect.top > window.innerHeight * 0.42) {
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
}

function keepSearchCardTopVisible() {
    const anchor = heroSearchSection || document.querySelector('.hero-content-grid') || indexSearchArea;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const safeTop = window.innerWidth <= 992 ? 12 : 64;
    const targetY = window.scrollY + rect.top - safeTop;

    if (rect.top < safeTop || rect.top > window.innerHeight * 0.22) {
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
}

window.addEventListener('resize', syncSearchResultsPlacement);
syncSearchResultsPlacement();

const categoryIcons = {
    Mamiferos: '<i class="fa-solid fa-paw"></i>',
    Aves: '<i class="fa-solid fa-dove"></i>',
    Peixes: '<i class="fa-solid fa-fish"></i>',
    Moluscos: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 15c0-1.66-1.34-3-3-3H9c-1.66 0-3-1.34-3-3s1.34-3 3-3h7c1.66 0 3-1.34 3-3s-1.34-3-3-3h-4a5 5 0 0 0-5 5v.2c-1.8.4-3 2-3 3.8 0 2.2 1.8 4 4 4h10c1.1 0 2 .9 2 2s-.9 2-2 2H4v2h12c2.8 0 5-2.2 5-5Zm-3-12a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-7 6c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1Z"/></svg>',
    Crustaceos: '<i class="fa-solid fa-shrimp"></i>',
    Aracnideos: '<i class="fa-solid fa-spider"></i>',
    Vermes: '<i class="fa-solid fa-worm"></i>',
    Repteis: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 7.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5ZM21 9c0 1.93-1.57 3.5-3.5 3.5H9c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5h7.5c.83 0 1.5-.67 1.5-1.5S17.33 5 16.5 5h-10A4.5 4.5 0 0 0 2 9.5 4.5 4.5 0 0 0 6.5 14h10c2.48 0 4.5-2.02 4.5-4.5V9ZM6.5 16A6.5 6.5 0 0 1 0 9.5V11a7.5 7.5 0 0 0 7.5 7.5H19c1.93 0 3.5-1.57 3.5-3.5v-1c0 .83-.67 1.5-1.5 1.5H6.5Z"/></svg>',
    Anfibios: '<i class="fa-solid fa-frog"></i>',
    Insetos: '<i class="fa-solid fa-bug"></i>',
    Microscopicos: '<i class="fa-solid fa-microscope"></i>',
    Extintos: '<i class="fa-solid fa-bone"></i>'
};

// Helpers de compatibilidade de categorias
function getFirstActiveCategory(categoria) {
    if (typeof categoria === 'string') return categoria;
    if (categoria && typeof categoria === 'object') {
        const active = Object.keys(categoria).filter(k => categoria[k] === true);
        return active[0] || '';
    }
    return '';
}

function translateCategory(cat) {
    const translations = {
        'Mamiferos': 'Mamíferos',
        'Aves': 'Aves',
        'Peixes': 'Peixes',
        'Moluscos': 'Moluscos',
        'Crustaceos': 'Crustáceos',
        'Aracnideos': 'Aracnídeos',
        'Vermes': 'Vermes',
        'Repteis': 'Répteis',
        'Anfibios': 'Anfíbios',
        'Insetos': 'Insetos',
        'Microscopicos': 'Microscópicos',
        'Extintos': 'Extintos'
    };
    return translations[cat] || cat;
}


function normalizeAnimalSearchText(value = '') {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
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

function animalMatchesSearch(animal = {}, searchTerm = '') {
    const normalizedTerm = normalizeAnimalSearchText(searchTerm);
    if (!normalizedTerm) return true;
    const searchable = [
        animal.nome,
        animal.nomeCientifico,
        ...getAlsoKnownAsNames(animal)
    ].map(normalizeAnimalSearchText);
    return searchable.some(value => value.includes(normalizedTerm));
}

function formatCategoryDisplay(categoria) {
    if (typeof categoria === 'string') {
        return translateCategory(categoria);
    }
    if (categoria && typeof categoria === 'object') {
        const active = Object.keys(categoria)
            .filter(k => categoria[k] === true)
            .map(translateCategory);
        return active.join(', ');
    }
    return '';
}

function populateCategories() {
    if (!categoriesContainer) return;
    categoriesContainer.innerHTML = '';
    for (const [name, iconHtml] of Object.entries(categoryIcons)) {
        const categoryLink = document.createElement('a');
        categoryLink.className = 'category-link';
        categoryLink.href = `categories.html?category=${name}`;
        categoryLink.innerHTML = `
            <span class="category-emoji">${iconHtml}</span>
            <span>${name}</span>
        `;
        categoriesContainer.appendChild(categoryLink);
    }
}

async function fetchAllAnimals() {
    console.log("fetchAllAnimals: A iniciar carregamento dos animais do Firestore...");
    
    try {
        console.log("fetchAllAnimals: A chamar getDocs(collection(db, 'animais'))...");
        const querySnapshot = await getDocs(collection(db, "animais"));
        console.log("fetchAllAnimals: getDocs concluído com sucesso. Registos obtidos:", querySnapshot.size);
        querySnapshot.forEach((doc) => {
            allAnimals.push({ id: doc.id, ...doc.data() });
        });

        // Mantém todas as listas normais do index por ordem alfabética.
        // A ordenação ignora acentos e diferenças entre maiúsculas/minúsculas.
        allAnimals.sort((a, b) => String(a.nome || '').localeCompare(
            String(b.nome || ''),
            'pt-PT',
            { sensitivity: 'base', numeric: true }
        ));

        if (loadingMessage) loadingMessage.style.display = 'none';
        if (categoriesContainer) categoriesContainer.style.display = 'grid';
        
        console.log("fetchAllAnimals: A popular categorias...");
        populateCategories();
        
        console.log("fetchAllAnimals: A popular listas de sobrevivência...");
        await populateSurvivalLists(allAnimals, db, searchResultsContainer, getDoc, doc);
        
        mainLayout = document.querySelector('.main-layout');

        console.log("fetchAllAnimals: A ocultar overlay de loading...");
        hideLoadingOverlay();
        waitForPageImages().catch(() => {});
    } catch (error) {
        console.error("Erro ao carregar animais do Firestore:", error);
        if (loadingMessage) loadingMessage.textContent = "Não foi possível carregar os animais.";
        hideLoadingOverlay();
        waitForPageImages().catch(() => {});
    }
}

function displayResults(results) {
    if (!searchResultsContainer) return;
    syncSearchResultsPlacement();
    searchResultsContainer.innerHTML = '';
    if (results.length === 0) {
        searchResultsContainer.style.display = 'none';
        setSearchResultsOpen(false);
        return;
    }
    results.forEach(animal => {
        const resultElement = document.createElement('a');
        resultElement.className = 'result-item';
        resultElement.href = `animal.html?id=${animal.id}`;
        
        resultElement.innerHTML = `
            <div class="result-main-info">
                <img src="${animal.imagemUrl}" alt="Imagem de ${animal.nome}" style="object-position: ${animal.imagemObjectPosition || 'center center'};">
                <div class="result-text">
                    <span class="nome">${animal.nome}</span>
                    <span class="nome-cientifico">(${animal.nomeCientifico})</span>
                </div>
            </div>
            <div class="result-category">${formatCategoryDisplay(animal.categoria)}</div>
        `;
        searchResultsContainer.appendChild(resultElement);
    });
    searchResultsContainer.style.display = 'block';
    setSearchResultsOpen(true);
    requestAnimationFrame(() => keepSearchResultsTopVisible(true));
}

if (searchInput) {
    searchInput.addEventListener('input', async () => {
        const currentSearch = ++searchSequence;
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length === 0) {
            if (searchResultsContainer) {
                searchResultsContainer.style.display = 'none';
                searchResultsContainer.scrollTop = 0;
            }
            setSearchResultsOpen(false);
            requestAnimationFrame(keepSearchCardTopVisible);
            return;
        }
        const localMatches = allAnimals.filter(animal => animalMatchesSearch(animal, searchTerm));
        let remoteMatches = [];
        try { remoteMatches = await findLocalAnimalsByWikidata(searchTerm, allAnimals); } catch (error) { console.warn('Wikidata: pesquisa indisponível', error); }
        if (currentSearch !== searchSequence) return;
        const merged = new Map([...localMatches, ...remoteMatches].map(animal => [animal.id, animal]));
        displayResults([...merged.values()]);
    });
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-container') && !event.target.closest('#searchResults')) {
        if (searchResultsContainer) searchResultsContainer.style.display = 'none';
        setSearchResultsOpen(false);
    }
});

// Inicialização dos módulos específicos e carregamento dos dados
initGlobeSearch();
initBiomaExplorer();
fetchAllAnimals();
