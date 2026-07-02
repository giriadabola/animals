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
            </nav>
        </div>
    `;
    document.body.insertBefore(header, document.body.firstChild);
}

// Injetar automaticamente se o body estiver pronto, senão esperar pelo DOMContentLoaded
if (document.body) {
    injectHeader();
} else {
    document.addEventListener('DOMContentLoaded', injectHeader);
}
