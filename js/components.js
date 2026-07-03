import { auth, db } from "./firebase-config.js?v=2";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
            <nav class="nav-links">
                <a href="index.html" class="nav-link ${isHome ? 'active' : ''}"><i class="fa-solid fa-house"></i> Início</a>
                <a href="form.html" class="nav-link ${isForm ? 'active' : ''}"><i class="fa-solid fa-sliders"></i> Gerir Portal</a>
                <span id="header-auth-section" style="display: flex; align-items: center; gap: 15px; margin-left: 10px;">
                    <!-- Auth info dynamically inserted -->
                </span>
            </nav>
        </div>
    `;
    document.body.insertBefore(header, document.body.firstChild);

    // Dynamic auth UI update
    const authSection = document.getElementById('header-auth-section');
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            let nome = user.displayName || user.email.split('@')[0];
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists() && userDoc.data().nome) {
                    nome = userDoc.data().nome;
                }
            } catch (err) {
                console.error("Erro ao carregar dados do utilizador no cabeçalho:", err);
            }
            authSection.innerHTML = `
                <span style="font-size: 0.85rem; color: var(--text-secondary); display: inline-flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-circle-user" style="color: var(--primary-color);"></i>
                    Olá, <strong>${nome}</strong>
                </span>
                <button id="logout-btn" class="nav-link" style="background: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 0;">
                    <i class="fa-solid fa-right-from-bracket"></i> Sair
                </button>
            `;
            document.getElementById('logout-btn').addEventListener('click', async () => {
                await signOut(auth);
                window.location.href = 'index.html';
            });
        } else {
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
