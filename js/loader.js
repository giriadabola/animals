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

function extractUrlsFromCssValue(cssValue = '') {
    const matches = String(cssValue).match(/url\((['"]?)(.*?)\1\)/g) || [];
    return matches
        .map(match => match.replace(/^url\((['"]?)/, '').replace(/(['"]?)\)$/, ''))
        .filter(Boolean);
}

function waitForImageElement(image) {
    if (!image) return Promise.resolve();
    if (image.complete) return Promise.resolve();

    return new Promise(resolve => {
        const finish = () => {
            image.removeEventListener('load', finish);
            image.removeEventListener('error', finish);
            resolve();
        };

        image.addEventListener('load', finish, { once: true });
        image.addEventListener('error', finish, { once: true });
    });
}

function waitForImageUrl(url) {
    if (!url) return Promise.resolve();

    return new Promise(resolve => {
        const image = new Image();
        const finish = () => {
            image.onload = null;
            image.onerror = null;
            resolve();
        };

        image.onload = finish;
        image.onerror = finish;
        image.src = url;

        if (image.complete) finish();
    });
}

function collectBackgroundImageUrls(root = document) {
    const urls = new Set();
    root.querySelectorAll('*').forEach(element => {
        const backgroundImage = window.getComputedStyle(element).backgroundImage;
        extractUrlsFromCssValue(backgroundImage).forEach(url => urls.add(url));
    });
    return [...urls];
}

function createTimeoutPromise(timeoutMs) {
    return new Promise(resolve => {
        setTimeout(resolve, timeoutMs);
    });
}

export async function waitForPageImages({ root = document, timeoutMs = 15000 } = {}) {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const imageElements = [...root.querySelectorAll('img')].filter(image => image.currentSrc || image.src);
    const backgroundUrls = collectBackgroundImageUrls(root);
    const pending = [
        ...imageElements.map(waitForImageElement),
        ...backgroundUrls.map(waitForImageUrl)
    ];

    if (!pending.length) return;

    await Promise.race([
        Promise.allSettled(pending),
        createTimeoutPromise(timeoutMs)
    ]);
}

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
