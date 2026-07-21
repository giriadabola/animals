import { auth, db } from "./firebase-config.js?v=5";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, onSnapshot, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { findLocalAnimalsByWikidata } from "./wikidata-search.js?v=1";

let allAnimals = null;

async function loadSearchAnimals() {
    if (allAnimals) return;
    try {
        const querySnapshot = await getDocs(collection(db, "animais"));
        allAnimals = [];
        querySnapshot.forEach((doc) => {
            allAnimals.push({ id: doc.id, ...doc.data() });
        });
        allAnimals.sort((a, b) => String(a.nome || '').localeCompare(
            String(b.nome || ''),
            'pt-PT',
            { sensitivity: 'base', numeric: true }
        ));
    } catch (error) {
        console.error("Erro ao carregar animais no cabeçalho:", error);
    }
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

function translateCategory(cat) {
    const translations = {
        'Mamiferos': 'Mamíferos',
        'Aves': 'Aves',
        'Peixes': 'Peixes',
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

function displayHeaderResults(results, container) {
    container.innerHTML = '';
    if (results.length === 0) {
        container.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-secondary); width: 100%; box-sizing: border-box;">not found</div>';
        container.style.display = 'flex';
        return;
    }
    results.forEach(animal => {
        const resultElement = document.createElement('a');
        resultElement.className = 'result-item';
        resultElement.href = `animal.html?id=${animal.id}`;
        
        resultElement.innerHTML = `
            <div class="result-main-info">
                <img src="${animal.imagemUrl || ''}" alt="Imagem de ${animal.nome || ''}">
                <div class="result-text">
                    <span class="nome">${animal.nome || ''}</span>
                    <span class="nome-cientifico">(${animal.nomeCientifico || ''})</span>
                </div>
            </div>
            <div class="result-category">${formatCategoryDisplay(animal.categoria)}</div>
        `;
        container.appendChild(resultElement);
    });
    container.style.display = 'flex';
}

export function injectHeader() {
    // Evita duplicar se já existir
    if (document.querySelector('.global-header')) return;

    // Injetar Font Awesome CDN se não existir
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);
    }

    // Injetar estilos adicionais para a barra de pesquisa do cabeçalho
    if (!document.getElementById('header-search-styles')) {
        const style = document.createElement('style');
        style.id = 'header-search-styles';
        style.textContent = `
            .header-search-wrapper #header-search-container {
                display: flex;
                align-items: center;
                border-radius: 30px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid transparent;
                background: transparent;
                padding: 2px;
                box-sizing: border-box;
            }
            .header-search-wrapper #header-search-container.active {
                background: rgba(0, 0, 0, 0.45);
                border-color: var(--border-color);
                padding: 2px 6px;
            }
            .header-search-wrapper #header-search-btn {
                background: none;
                border: none;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                color: var(--text-secondary);
                transition: var(--transition);
                flex-shrink: 0;
                padding: 0;
            }
            .header-search-wrapper #header-search-btn:hover {
                background: rgba(255, 255, 255, 0.08);
                color: var(--primary-color) !important;
            }
            .header-search-wrapper #headerSearchInput {
                width: 0;
                opacity: 0;
                pointer-events: none;
                border: none;
                background: transparent;
                color: var(--text-primary);
                font-size: 0.85rem;
                outline: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                padding: 0;
                box-sizing: border-box;
            }
            .header-search-wrapper #header-search-container.active #headerSearchInput {
                width: 220px;
                opacity: 1;
                pointer-events: auto;
                padding: 6px 10px;
            }
            .header-search-wrapper .result-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                text-decoration: none;
                color: var(--text-primary);
                border-radius: var(--border-radius-sm);
                transition: var(--transition);
                margin-bottom: 4px;
                border: 1px solid transparent;
                background: rgba(255, 255, 255, 0.02);
                box-sizing: border-box;
                width: 100%;
            }
            .header-search-wrapper .result-item:hover {
                background-color: var(--bg-card-hover);
                border-color: var(--border-color);
                transform: translateX(4px);
            }
            .header-search-wrapper .result-main-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .header-search-wrapper .result-main-info img {
                width: 36px;
                height: 36px;
                border-radius: var(--border-radius-xs);
                object-fit: cover;
            }
            .header-search-wrapper .result-text {
                display: flex;
                flex-direction: column;
                gap: 2px;
                text-align: left;
            }
            .header-search-wrapper .result-text .nome {
                font-weight: 600;
                font-size: 0.85rem;
                color: var(--text-primary);
            }
            .header-search-wrapper .result-text .nome-cientifico {
                font-size: 0.75rem;
                color: var(--text-secondary);
                font-style: italic;
            }
            .header-search-wrapper .result-category {
                font-size: 0.75rem;
                color: var(--primary-color);
                background: rgba(129, 140, 248, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);
    }

    // Injetar SVG Gradient para ícones SVG se não existir no body
    if (!document.getElementById('aurora-gradient-svg')) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svgElem = document.createElementNS(svgNS, "svg");
        svgElem.setAttribute("id", "aurora-gradient-svg");
        svgElem.setAttribute("style", "width:0; height:0; position:absolute; pointer-events:none;");
        svgElem.setAttribute("aria-hidden", "true");
        svgElem.innerHTML = `
            <defs>
                <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#818cf8" />
                    <stop offset="50%" stop-color="#c084fc" />
                    <stop offset="100%" stop-color="#f472b6" />
                </linearGradient>
            </defs>
        `;
        document.body.insertBefore(svgElem, document.body.firstChild);
    }

    const header = document.createElement('header');
    header.className = 'global-header';
    
    // Determinar qual link está ativo
    const path = window.location.pathname;
    const isHome = path.endsWith('index.html') || path.endsWith('/') || !path.includes('.html');
    const isForm = path.endsWith('form.html');

    header.innerHTML = `
        <div class="header-container">
            <a href="${isForm ? '../index.html' : 'index.html'}" class="logo">
                <span class="logo-emoji"><i class="fa-solid fa-paw"></i></span>
                <span class="logo-text">Grandes Projetos</span>
            </a>
            <div id="header-center-info" style="display: flex; justify-content: center; align-items: center;"></div>
            <nav class="nav-links" style="display: flex; align-items: center; gap: 15px;">
                <span id="header-auth-section" class="hide-on-mobile" style="display: flex; align-items: center; gap: 15px; margin-left: 10px;">
                    <!-- Auth info dynamically inserted -->
                </span>
                ${!isHome && !isForm ? `
                <div class="header-search-wrapper" style="position: relative; display: flex; align-items: center;">
                    <div id="header-search-container">
                        <input type="text" id="headerSearchInput" placeholder="Pesquisar por nome comum ou científico...">
                        <button id="header-search-btn" aria-label="Pesquisar">
                            <i class="fa-solid fa-magnifying-glass" style="font-size: 1.1rem;"></i>
                        </button>
                    </div>
                    <div id="headerSearchResults" style="display: none; position: absolute; right: 0; top: calc(100% + 12px); background: rgba(9, 12, 28, 0.95); backdrop-filter: blur(20px); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 12px; width: 320px; box-shadow: var(--shadow-lg); z-index: 1010; flex-direction: column; gap: 4px; box-sizing: border-box;"></div>
                </div>
                ` : ''}
            </nav>
        </div>
    `;
    document.body.insertBefore(header, document.body.firstChild);

    if (!isHome && !isForm) {
        const searchBtn = document.getElementById('header-search-btn');
        const container = document.getElementById('header-search-container');
        const searchInput = document.getElementById('headerSearchInput');
        const searchResults = document.getElementById('headerSearchResults');

        if (searchBtn && container && searchInput && searchResults) {
            searchBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const isActive = container.classList.contains('active');
                if (!isActive) {
                    container.classList.add('active');
                    searchInput.focus();
                    
                    const searchTerm = searchInput.value.trim();
                    if (searchTerm.length > 0) {
                        searchResults.style.display = 'flex';
                        searchResults.innerHTML = `
                            <div class="search-loading" style="display: flex; align-items: center; justify-content: center; padding: 20px; width: 100%; box-sizing: border-box;">
                                <i class="fa-solid fa-paw fa-fade" style="font-size: 1.8rem; color: var(--primary-color);"></i>
                            </div>
                        `;
                    }
                    
                    await loadSearchAnimals();
                    
                    if (searchTerm.length > 0) {
                        searchInput.dispatchEvent(new Event('input'));
                    }
                } else {
                    const searchTerm = searchInput.value.trim();
                    if (searchTerm.length === 0) {
                        container.classList.remove('active');
                        searchResults.style.display = 'none';
                    }
                }
            });

            container.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.header-search-wrapper')) {
                    container.classList.remove('active');
                    searchResults.style.display = 'none';
                }
            });

            let globalSearchSequence = 0;
            searchInput.addEventListener('input', async () => {
                const currentSearch = ++globalSearchSequence;
                const searchTerm = searchInput.value.trim();
                if (searchTerm.length === 0) {
                    searchResults.style.display = 'none';
                    searchResults.innerHTML = '';
                    return;
                }

                // Show pulsing paw loader inside the search results dropdown
                searchResults.style.display = 'flex';
                searchResults.innerHTML = `
                    <div class="search-loading" style="display: flex; align-items: center; justify-content: center; padding: 20px; width: 100%; box-sizing: border-box;">
                        <i class="fa-solid fa-paw fa-fade" style="font-size: 1.8rem; color: var(--primary-color);"></i>
                    </div>
                `;

                try {
                    if (!allAnimals) await loadSearchAnimals();

                    const localMatches = allAnimals.filter(animal => animalMatchesSearch(animal, searchTerm));
                    let remoteMatches = [];
                    try { 
                        remoteMatches = await findLocalAnimalsByWikidata(searchTerm, allAnimals); 
                    } catch (error) { 
                        console.warn('Wikidata: pesquisa indisponível', error); 
                    }
                    
                    if (currentSearch !== globalSearchSequence) return;
                    const merged = new Map([...localMatches, ...remoteMatches].map(animal => [animal.id, animal]));
                    displayHeaderResults([...merged.values()], searchResults);
                } catch (error) {
                    console.error("Erro na pesquisa:", error);
                    if (currentSearch === globalSearchSequence) {
                        searchResults.innerHTML = '<div style="padding: 12px; color: var(--text-secondary);">Erro ao pesquisar.</div>';
                    }
                }
            });
        }
    }

    // Dynamic auth UI update
    const authSection = document.getElementById('header-auth-section');
    let unsubscribeProfile = null;
    let unsubscribeAnimais = null; // reservado para compatibilidade, mas sem snapshot global no form

    onAuthStateChanged(auth, async (user) => {
        // Limpar escutadores ativos ao mudar estado
        if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = null;
        }
        if (unsubscribeAnimais) {
            unsubscribeAnimais();
            unsubscribeAnimais = null;
        }

        let gerirPortalLink = document.getElementById('nav-link-gerir-portal');
        const centerInfo = document.getElementById('header-center-info');
        
        if (user) {
            // 1. Escutar dados e permissões do utilizador
            unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (userDoc) => {
                let nome = user.displayName || user.email.split('@')[0];
                let isAuthorized = false;

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.nome) {
                        nome = userData.nome;
                    }
                    const status = String(userData.status || '').toLowerCase();
                    const role = String(userData.rule || '').toLowerCase();
                    if (status === 'on' && (role === 'ruler' || role === 'estafeta')) {
                        isAuthorized = true;
                    }
                }

                // Atualizar referência no DOM
                gerirPortalLink = document.getElementById('nav-link-gerir-portal');

                // Exibir link "Gerir Portal" apenas se for autorizado
                if (isAuthorized) {
                    if (!gerirPortalLink) {
                        gerirPortalLink = document.createElement('a');
                        gerirPortalLink.id = 'nav-link-gerir-portal';
                        gerirPortalLink.href = isForm ? 'form.html' : 'form/form.html';
                        gerirPortalLink.className = `nav-link ${isForm ? 'active' : ''}`;
                        gerirPortalLink.style.fontSize = '1.25rem';
                        gerirPortalLink.style.display = 'inline-flex';
                        gerirPortalLink.style.alignItems = 'center';
                        gerirPortalLink.title = 'Gerir Portal';
                        gerirPortalLink.ariaLabel = 'Gerir Portal';
                        authSection.parentNode.insertBefore(gerirPortalLink, authSection);
                    }
                    gerirPortalLink.innerHTML = `<i class="fa-solid fa-sliders"></i>`;
                } else {
                    if (gerirPortalLink) gerirPortalLink.remove();
                }
            }, (err) => {
                console.error("Erro ao escutar dados do perfil:", err);
            });

            // 2. NÃO escutar a coleção inteira de animais no form.html.
            //
            // A versão anterior fazia:
            //   onSnapshot(collection(db, "animais"), ...)
            // apenas para contar "Criou" e "Editados" no cabeçalho.
            //
            // Isso obriga o browser a receber e percorrer TODOS os documentos de animais,
            // incluindo arrays/campos grandes, logo ao abrir o formulário. Com muitos animais,
            // o separador fica com a thread principal presa e até fechar a aba se torna difícil.
            // O formulário não precisa destes contadores para funcionar, por isso o cabeçalho
            // passa a mostrar apenas um atalho leve para o portefólio.
            if (isForm && centerInfo) {
                centerInfo.innerHTML = `
                    <a href="../myportefolio.html" class="nav-link form-portfolio-link" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); padding: 8px 18px; border-radius: var(--border-radius-sm); font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); text-decoration: none;">
                        <i class="fa-solid fa-table-list" style="color: var(--primary-color);"></i> Meu portefólio
                    </a>
                    <a href="../index.html" class="form-mobile-home-link" aria-label="Voltar ao início" title="Voltar ao início">
                        <i class="fa-solid fa-house" aria-hidden="true"></i>
                    </a>
                `;
            }

            const profileHref = isForm ? '../myperfil.html' : 'myperfil.html';
            authSection.innerHTML = `
                <a href="${profileHref}" aria-label="O meu perfil" title="O meu perfil" style="font-size: 1.25rem; color: var(--text-secondary); display: inline-flex; align-items: center; justify-content: center; text-decoration: none; cursor: pointer;">
                    <i class="fa-solid fa-circle-user" style="color: var(--primary-color);"></i>
                </a>
            `;
        } else {
            if (gerirPortalLink) gerirPortalLink.remove();
            if (centerInfo) centerInfo.innerHTML = '';
            authSection.innerHTML = `
                <a href="login.html" class="nav-link"><i class="fa-solid fa-right-to-bracket"></i> Entrar</a>
            `;
        }
    });
}

// Injetar automaticamente se o body estiver pronto, senão esperar pelo DOMContentLoaded
if (document.body) {
    injectHeader();
} else {
    document.addEventListener('DOMContentLoaded', injectHeader);
}
