import { auth, db } from "./firebase-config.js?v=2";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
            <a href="index.html" class="logo">
                <span class="logo-emoji"><i class="fa-solid fa-paw"></i></span>
                <span class="logo-text">Grandes Projetos</span>
            </a>
            <div id="header-center-info" style="display: flex; justify-content: center; align-items: center;"></div>
            <nav class="nav-links">
                <a href="index.html" class="nav-link ${isHome ? 'active' : ''}"><i class="fa-solid fa-house"></i> Início</a>
                <span id="header-auth-section" style="display: flex; align-items: center; gap: 15px; margin-left: 10px;">
                    <!-- Auth info dynamically inserted -->
                </span>
            </nav>
        </div>
    `;
    document.body.insertBefore(header, document.body.firstChild);

    // Dynamic auth UI update
    const authSection = document.getElementById('header-auth-section');
    let unsubscribeProfile = null;
    let unsubscribeAnimais = null;

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
                    if (userData.status === 'on' && (userData.rule === 'ruler' || userData.rule === 'estafeta')) {
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
                        gerirPortalLink.href = 'form.html';
                        gerirPortalLink.className = `nav-link ${isForm ? 'active' : ''}`;
                        gerirPortalLink.innerHTML = `<i class="fa-solid fa-sliders"></i> Gerir Portal`;
                        authSection.parentNode.insertBefore(gerirPortalLink, authSection);
                    }
                } else {
                    if (gerirPortalLink) gerirPortalLink.remove();
                }

                // Atualizar nome no cabeçalho
                const userNameEl = document.getElementById('header-user-name');
                if (userNameEl) {
                    userNameEl.textContent = nome;
                }
            }, (err) => {
                console.error("Erro ao escutar dados do perfil:", err);
            });

            // 2. Escutar a coleção de animais para contar os criados e editados pelo utilizador (apenas no form.html)
            if (isForm) {
                unsubscribeAnimais = onSnapshot(collection(db, "animais"), (snapshot) => {
                    let criadosCount = 0;
                    let editadosCount = 0;

                    snapshot.forEach((animalDoc) => {
                        const animalData = animalDoc.data();
                        if (animalData.criadoPor === user.uid) {
                            criadosCount++;
                        }
                        if (animalData.editado && Array.isArray(animalData.editado)) {
                            const isEditedByUser = animalData.editado.some(
                                (edit) => edit && edit.editadoPor === user.uid
                            );
                            if (isEditedByUser) {
                                editadosCount++;
                            }
                        }
                    });

                    if (centerInfo) {
                        centerInfo.innerHTML = `
                            <span style="display: inline-flex; align-items: center; gap: 10px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); padding: 8px 18px; border-radius: var(--border-radius-sm); font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">
                                <i class="fa-solid fa-circle-plus" style="color: var(--primary-color);"></i> Criou: <strong style="color: var(--text-primary);">${criadosCount}</strong>
                                <span style="opacity: 0.2;">|</span>
                                <i class="fa-solid fa-pen-to-square" style="color: var(--accent-color);"></i> Editados: <strong style="color: var(--text-primary);">${editadosCount}</strong>
                            </span>
                        `;
                    }
                }, (err) => {
                    console.error("Erro ao escutar coleção de animais:", err);
                });
            }

            authSection.innerHTML = `
                <span style="font-size: 0.85rem; color: var(--text-secondary); display: inline-flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-circle-user" style="color: var(--primary-color);"></i>
                    Olá, <strong id="header-user-name">${user.displayName || user.email.split('@')[0]}</strong>
                </span>
                <button id="logout-btn" class="nav-link" style="background: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 0;">
                    <i class="fa-solid fa-right-from-bracket"></i> Sair
                </button>
            `;
            document.getElementById('logout-btn').addEventListener('click', async () => {
                if (unsubscribeProfile) {
                    unsubscribeProfile();
                    unsubscribeProfile = null;
                }
                if (unsubscribeAnimais) {
                    unsubscribeAnimais();
                    unsubscribeAnimais = null;
                }
                await signOut(auth);
                window.location.href = 'index.html';
            });
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
