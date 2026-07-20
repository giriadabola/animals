const INATURALIST_ENDPOINT = 'https://api.inaturalist.org/v1/observations';

function getPhotoUrl(url = '', size = 'medium') {
    return String(url).replace(/\/square\.(jpg|jpeg|png)$/i, `/${size}.$1`);
}

function createGalleryItem(photo, scientificName) {
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'animal-gallery-item';
    link.title = 'Abrir fotografia em tamanho grande';
    link.setAttribute('aria-label', 'Abrir fotografia ampliada');

    const image = document.createElement('img');
    image.src = getPhotoUrl(photo.url);
    image.alt = `Fotografia de ${scientificName}`;
    image.loading = 'lazy';
    image.referrerPolicy = 'no-referrer';

    const loader = document.createElement('div');
    loader.className = 'profile-image-loader';
    loader.style.cssText = 'position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(9, 9, 20, 0.45); backdrop-filter: blur(6px); z-index: 5; border-radius: 12px;';
    loader.innerHTML = '<i class="fa-solid fa-paw fa-fade" style="font-size: 1.5rem; color: #10b981;"></i>';

    const onFinish = () => {
        image.removeEventListener('load', onFinish);
        image.removeEventListener('error', onFinish);
        loader.style.display = 'none';
    };
    image.addEventListener('load', onFinish);
    image.addEventListener('error', onFinish);

    if (image.complete) {
        loader.style.display = 'none';
    }

    const credit = document.createElement('span');
    credit.className = 'animal-gallery-credit';
    credit.textContent = photo.attribution || 'iNaturalist';

    link.addEventListener('click', () => openGalleryPopup(photo, scientificName));
    link.append(image, loader, credit);
    return link;
}

let galleryPopup;

function getGalleryPopup() {
    if (galleryPopup) return galleryPopup;

    galleryPopup = document.createElement('div');
    galleryPopup.className = 'animal-gallery-lightbox';
    galleryPopup.setAttribute('role', 'dialog');
    galleryPopup.setAttribute('aria-modal', 'true');
    galleryPopup.setAttribute('aria-label', 'Fotografia ampliada');
    galleryPopup.hidden = true;
    galleryPopup.innerHTML = `
        <div class="animal-gallery-lightbox-backdrop" data-gallery-close></div>
        <div class="animal-gallery-lightbox-dialog">
            <button type="button" class="animal-gallery-lightbox-close" data-gallery-close aria-label="Fechar fotografia">&times;</button>
            <div class="profile-image-loader" style="display: none; position: absolute; inset: 0; align-items: center; justify-content: center; background: rgba(9, 9, 20, 0.45); backdrop-filter: blur(6px); z-index: 5; border-radius: 18px;">
                <i class="fa-solid fa-paw fa-fade" style="font-size: 3rem; color: #10b981;"></i>
            </div>
            <img class="animal-gallery-lightbox-image" alt="">
            <div class="animal-gallery-lightbox-caption"></div>
        </div>`;

    galleryPopup.querySelectorAll('[data-gallery-close]').forEach(button => {
        button.addEventListener('click', closeGalleryPopup);
    });
    document.body.appendChild(galleryPopup);
    return galleryPopup;
}

function closeGalleryPopup() {
    if (!galleryPopup) return;
    galleryPopup.hidden = true;
    document.body.classList.remove('animal-gallery-popup-open');
}

function openGalleryPopup(photo, scientificName) {
    const popup = getGalleryPopup();
    const image = popup.querySelector('.animal-gallery-lightbox-image');
    const caption = popup.querySelector('.animal-gallery-lightbox-caption');
    const loader = popup.querySelector('.profile-image-loader');

    if (loader) {
        loader.style.display = 'flex';
    }

    const onFinish = () => {
        image.removeEventListener('load', onFinish);
        image.removeEventListener('error', onFinish);
        if (loader) loader.style.display = 'none';
    };
    image.addEventListener('load', onFinish);
    image.addEventListener('error', onFinish);

    image.src = getPhotoUrl(photo.url, 'large');
    image.alt = `Fotografia de ${scientificName}`;
    caption.textContent = `${photo.attribution || 'iNaturalist'} · Fonte: iNaturalist`;
    popup.hidden = false;
    document.body.classList.add('animal-gallery-popup-open');
    popup.querySelector('.animal-gallery-lightbox-close').focus();
}

if (!window.__animalGalleryPopupKeyboardBound) {
    window.__animalGalleryPopupKeyboardBound = true;
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeGalleryPopup();
    });
}
async function fetchAnimalPhotos(scientificName) {
    const url = new URL(INATURALIST_ENDPOINT);
    url.searchParams.set('taxon_name', scientificName);
    url.searchParams.set('photos', 'true');
    url.searchParams.set('quality_grade', 'research');
    url.searchParams.set('photo_license', 'cc0,cc-by,cc-by-sa');
    url.searchParams.set('order_by', 'observed_on');
    url.searchParams.set('order', 'desc');
    url.searchParams.set('per_page', '12');

    const response = await fetch(url);
    if (!response.ok) throw new Error(`iNaturalist respondeu com ${response.status}`);

    const data = await response.json();
    const photos = data.results.flatMap(observation => (observation.photos || []).map(photo => ({
        url: photo.url,
        attribution: photo.attribution,
        observationId: observation.id
    })));

    return [...new Map(photos.map(photo => [photo.url, photo])).values()].slice(0, 6);
}

export function renderAnimalGallery(scientificName = "", isMobile = false) {
    setTimeout(() => initAnimalGallery(scientificName), 0);
    const suffix = isMobile ? '-mobile' : '';
    return `
        <section class="animal-gallery-section" id="animal-gallery${suffix}">
            <div class="animal-gallery-grid" data-animal-gallery-grid aria-live="polite">
                <p class="animal-gallery-status"><i class="fa-solid fa-paw fa-fade" style="margin-right: 8px; color: #10b981;"></i>A carregar fotografias...</p>
            </div>
        </section>`;
}

export async function initAnimalGallery(scientificName = '') {
    const grids = document.querySelectorAll('[data-animal-gallery-grid]');
    if (!grids.length || !scientificName) return;

    try {
        const photos = await fetchAnimalPhotos(scientificName);
        
        grids.forEach(grid => {
            grid.replaceChildren();

            if (!photos.length) {
                grid.innerHTML = '<p class="animal-gallery-status">Não foram encontradas fotografias para este animal.</p>';
                return;
            }

            photos.forEach(photo => grid.appendChild(createGalleryItem(photo, scientificName)));
        });
    } catch (error) {
        console.warn('Não foi possível carregar a galeria do animal:', error);
        grids.forEach(grid => {
            grid.innerHTML = '<p class="animal-gallery-status">A galeria não está disponível neste momento.</p>';
        });
    }
}
