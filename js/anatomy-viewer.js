const BIRD_MANIFEST_PATH = 'assets/anatomy/birds/parts/manifest.json';

const anatomyLabels = {
    cranio: 'Crânio',
    bico: 'Bico',
    coluna: 'Coluna',
    costelas: 'Costelas',
    esterno: 'Esterno',
    umero: 'Úmero',
    radio_ulna: 'Rádio e ulna',
    cerebro: 'Cérebro',
    coracao: 'Coração',
    pulmoes: 'Pulmões',
    femur: 'Fémur',
    traqueia: 'Traqueia',
    esofago: 'Esófago',
    moela: 'Moela',
    pelve: 'Pelve',
    falanges: 'Falanges',
    figado: 'Fígado',
    rins: 'Rins',
    papo: 'Papo',
    proventriculo: 'Proventrículo',
    intestinos: 'Intestinos',
    cloaca: 'Cloaca'
};

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"]/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
    }[char]));
}

function getActiveCategories(categoria) {
    if (typeof categoria === 'string') return [categoria];
    if (!categoria || typeof categoria !== 'object') return [];
    return Object.keys(categoria).filter(key => categoria[key] === true);
}

function supportsBirdAnatomy(animalData = {}) {
    return getActiveCategories(animalData.categoria).some(category => {
        const normalized = String(category || '').toLowerCase();
        return normalized === 'aves' || normalized === 'ave' || normalized === 'birds';
    });
}

function getComparisonHref(animalId = '') {
    const params = new URLSearchParams();
    if (animalId) params.set('id', animalId);
    const query = params.toString();
    return `vs.html${query ? `?${query}` : ''}`;
}

function getActionIconSvg(kind = 'anatomia') {
    if (kind === 'comparacao') {
        return `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 5v14" />
                <path d="M16 5v14" />
                <path d="M5 8c0-1.657 1.343-3 3-3h3v14H8c-1.657 0-3-1.343-3-3V8Z" />
                <path d="M19 8c0-1.657-1.343-3-3-3h-3v14h3c1.657 0 3-1.343 3-3V8Z" />
            </svg>`;
    }

    return `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 18c1-5 4.5-8 9-8h3" />
            <path d="M8 8.5c0-2.2 1.8-4 4-4h2c1.657 0 3 1.343 3 3v2.5" />
            <path d="M10 18v-3" />
            <path d="M14 18v-5" />
            <path d="M18 18v-7" />
            <circle cx="8" cy="18" r="1" fill="currentColor" stroke="none" />
            <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
            <circle cx="16" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>`;
}

function getDefaultPartLabel(key = '') {
    return anatomyLabels[key] || String(key || '').replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
}

async function loadManifest(manifestPath) {
    const response = await fetch(manifestPath, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Manifesto indisponível (${response.status})`);
    }
    return response.json();
}

function renderPartButtons(widget, manifest) {
    const partsContainer = widget.querySelector('[data-anatomy-parts]');
    if (!partsContainer) return [];

    const entries = Object.entries(manifest || {});
    partsContainer.innerHTML = entries.map(([key]) => `
        <button type="button" class="anatomy-part-btn" data-part-key="${escapeHtml(key)}">
            ${escapeHtml(getDefaultPartLabel(key))}
        </button>
    `).join('');

    return [...partsContainer.querySelectorAll('.anatomy-part-btn')];
}

function showPart(widget, key, asset) {
    const image = widget.querySelector('[data-anatomy-image]');
    const caption = widget.querySelector('[data-anatomy-caption]');
    const status = widget.querySelector('[data-anatomy-status]');
    if (!image || !caption) return;

    widget.querySelectorAll('.anatomy-part-btn').forEach(button => {
        button.classList.toggle('active', button.dataset.partKey === key);
    });

    const source = asset?.svg || asset?.png || '';
    image.src = source;
    image.alt = `Anatomia: ${getDefaultPartLabel(key)}`;
    caption.textContent = getDefaultPartLabel(key);
    image.closest('.anatomy-part-image-wrap')?.removeAttribute('hidden');
    if (status) status.textContent = '';
}

async function openAnatomyPanel(widget) {
    const panel = widget.querySelector('[data-anatomy-panel]');
    const status = widget.querySelector('[data-anatomy-status]');
    if (!panel || !status) return;

    panel.hidden = false;

    if (widget.dataset.loaded === 'true') return;

    status.textContent = 'A carregar anatomia...';

    try {
        const manifest = await loadManifest(widget.dataset.manifest || BIRD_MANIFEST_PATH);
        const buttons = renderPartButtons(widget, manifest);
        const firstEntry = Object.entries(manifest || {})[0];

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const partKey = button.dataset.partKey || '';
                showPart(widget, partKey, manifest[partKey]);
            });
        });

        if (firstEntry) {
            showPart(widget, firstEntry[0], firstEntry[1]);
        } else {
            status.textContent = 'Sem peças anatómicas disponíveis.';
        }

        widget.dataset.loaded = 'true';
    } catch (error) {
        status.textContent = 'Não foi possível carregar a anatomia.';
        console.error('Erro ao carregar anatomia:', error);
    }
}

function closeAnatomyPanel(widget) {
    const panel = widget.querySelector('[data-anatomy-panel]');
    if (panel) panel.hidden = true;
}


function normalizeProfileImageGender(value = '') {
    const v = String(value || '').trim().toUpperCase();
    if (v === 'M' || v === 'MACHO' || v === 'MALE') return 'M';
    if (v === 'F' || v === 'FEMEA' || v === 'FÊMEA' || v === 'FEMALE') return 'F';
    return '';
}

function normalizeProfileImagePhase(value = '') {
    const v = String(value || '').trim().toLowerCase();
    if (v === 'cria' || v === 'juvenil' || v === 'jovem') return 'Cria';
    if (v === 'adulto' || v === 'adulta') return 'Adulto';
    return '';
}

function getProfileImageEntries(animalData = {}) {
    const images = Array.isArray(animalData.profileImages) ? animalData.profileImages : [];
    const primaryFallback = animalData.imagemUrl ? [{
        url: animalData.imagemUrl,
        gender: animalData.imagemPerfilSexo || animalData.imagemSexo || '',
        phase: animalData.imagemPerfilFase || animalData.imagemFase || '',
        isPrimary: true
    }] : [];

    const entries = images.length ? images : primaryFallback;
    return entries
        .filter(item => item && item.url)
        .map(item => ({
            url: String(item.url || ''),
            gender: normalizeProfileImageGender(item.gender || item.sexo || item.genero),
            phase: normalizeProfileImagePhase(item.phase || item.fase || item.idade),
            isPrimary: !!item.isPrimary
        }));
}

function findProfileImageForBadge(entries = [], type = '', value = '', originalUrl = '') {
    const normalizedOriginal = String(originalUrl || '').trim();
    const matches = entries.filter(item => {
        if (type === 'gender') return item.gender === value;
        if (type === 'phase') return item.phase === value;
        return false;
    });

    return matches.find(item => !item.isPrimary && item.url !== normalizedOriginal)?.url
        || matches.find(item => item.url !== normalizedOriginal)?.url
        || matches[0]?.url
        || '';
}

function getProfileImageBadges(animalData = {}) {
    const entries = getProfileImageEntries(animalData);
    const genders = new Set(entries.map(item => item.gender).filter(Boolean));
    const phases = new Set(entries.map(item => item.phase).filter(Boolean));
    const originalUrl = animalData.imagemUrl || entries.find(item => item.isPrimary)?.url || entries[0]?.url || '';
    const badges = [];

    if (genders.has('M')) {
        badges.push(`<button type="button" class="profile-image-badge male" data-profile-badge-key="gender:M" data-profile-badge-url="${escapeHtml(findProfileImageForBadge(entries, 'gender', 'M', originalUrl))}" title="Ver imagem de macho" aria-label="Ver imagem de macho">♂</button>`);
    }
    if (genders.has('F')) {
        badges.push(`<button type="button" class="profile-image-badge female" data-profile-badge-key="gender:F" data-profile-badge-url="${escapeHtml(findProfileImageForBadge(entries, 'gender', 'F', originalUrl))}" title="Ver imagem de fêmea" aria-label="Ver imagem de fêmea">♀</button>`);
    }
    if (phases.has('Adulto')) {
        badges.push(`<button type="button" class="profile-image-badge phase adult" data-profile-badge-key="phase:Adulto" data-profile-badge-url="${escapeHtml(findProfileImageForBadge(entries, 'phase', 'Adulto', originalUrl))}" title="Ver imagem de adulto" aria-label="Ver imagem de adulto"><i class="fa-solid fa-paw" aria-hidden="true"></i></button>`);
    }
    if (phases.has('Cria')) {
        badges.push(`<button type="button" class="profile-image-badge phase young" data-profile-badge-key="phase:Cria" data-profile-badge-url="${escapeHtml(findProfileImageForBadge(entries, 'phase', 'Cria', originalUrl))}" title="Ver imagem de cria" aria-label="Ver imagem de cria"><i class="fa-solid fa-baby" aria-hidden="true"></i></button>`);
    }

    return badges.length ? `<div class="profile-image-badges" data-profile-image-badges>${badges.join('')}</div>` : '';
}

function toggleProfileImageByBadge(widget, button) {
    const image = widget.querySelector('[data-profile-main-image]');
    if (!image || !button) return;

    const originalSrc = image.dataset.originalSrc || image.getAttribute('src') || '';
    image.dataset.originalSrc = originalSrc;

    const targetUrl = button.dataset.profileBadgeUrl || '';
    const badgeKey = button.dataset.profileBadgeKey || '';
    const isSameBadgeActive = widget.dataset.activeProfileBadge === badgeKey;

    widget.querySelectorAll('[data-profile-badge-key]').forEach(btn => btn.classList.remove('active'));

    if (isSameBadgeActive || !targetUrl) {
        image.src = originalSrc;
        widget.dataset.activeProfileBadge = '';
        return;
    }

    image.src = targetUrl;
    widget.dataset.activeProfileBadge = badgeKey;
    button.classList.add('active');
}

export function renderAnatomyBlock(animalData = {}, animalId = '') {
    const objectPosition = animalData.imagemObjectPosition || 'center center';
    const supportsAnatomy = supportsBirdAnatomy(animalData);
    const compareHref = getComparisonHref(animalId);

    const profileBadgesHTML = getProfileImageBadges(animalData);

    return `
        <section class="anatomy-widget" ${supportsAnatomy ? `data-manifest="${BIRD_MANIFEST_PATH}"` : ''}>
            <div class="animal-image">
                <img data-profile-main-image src="${escapeHtml(animalData.imagemUrl || '')}" alt="${escapeHtml(animalData.nome || 'Animal')}" style="object-position: ${escapeHtml(objectPosition)};">
                ${profileBadgesHTML}
            </div>
            <div class="animal-media-actions">
                ${supportsAnatomy ? `
                    <button type="button" class="animal-media-action" data-anatomy-toggle aria-label="Anatomia" title="Anatomia">
                        ${getActionIconSvg('anatomia')}
                    </button>
                ` : ''}
                <a class="animal-media-action" href="${compareHref}" aria-label="Comparação" title="Comparação">
                    ${getActionIconSvg('comparacao')}
                </a>
            </div>
            ${supportsAnatomy ? `
                <div class="anatomy-panel" data-anatomy-panel hidden>
                    <div class="anatomy-panel-head">
                        <strong>Anatomia</strong>
                        <button type="button" class="anatomy-close-btn" data-anatomy-close aria-label="Fechar anatomia" title="Fechar">×</button>
                    </div>
                    <p class="anatomy-status" data-anatomy-status>Seleciona o ícone para explorar as peças anatómicas.</p>
                    <div class="anatomy-parts" data-anatomy-parts></div>
                    <div class="anatomy-part-image-wrap" hidden>
                        <img class="anatomy-part-image" data-anatomy-image alt="">
                    </div>
                    <div class="anatomy-part-caption" data-anatomy-caption></div>
                </div>
            ` : ''}
        </section>
    `;
}

export function initAnatomyViewer(root = document) {
    root.querySelectorAll('.anatomy-widget').forEach(widget => {
        if (widget.dataset.ready === 'true') return;
        widget.dataset.ready = 'true';

        const toggle = widget.querySelector('[data-anatomy-toggle]');
        const close = widget.querySelector('[data-anatomy-close]');

        widget.querySelectorAll('[data-profile-badge-key]').forEach(button => {
            button.addEventListener('click', () => toggleProfileImageByBadge(widget, button));
        });

        toggle?.addEventListener('click', async () => {
            const panel = widget.querySelector('[data-anatomy-panel]');
            if (!panel || panel.hidden) {
                await openAnatomyPanel(widget);
            } else {
                closeAnatomyPanel(widget);
            }
        });

        close?.addEventListener('click', () => {
            closeAnatomyPanel(widget);
        });
    });
}
