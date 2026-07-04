// Loader PWA/Mobile para Grandes Projetos
// Injeta automaticamente a estrutura HTML do loader assim que é importado

function injectLoader() {
    if (document.getElementById('loading-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loader-content">
            <div class="animal-animation">
                <i class="fa-solid fa-paw"></i>
            </div>
            <p class="loader-text">A carregar...</p>
        </div>
    `;
    
    if (document.body) {
        document.body.insertBefore(overlay, document.body.firstChild);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.insertBefore(overlay, document.body.firstChild);
        });
    }
}

// Injetar imediatamente
injectLoader();

/**
 * Remove o loading overlay com um efeito suave de fade-out
 */
export function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 400);
    }
}
