import { getAnimalAudioId, getAnimalAudioIconSvg } from './animal-audio.js?v=20260710_audio_2';

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"]/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
    }[char]));
}

function getComparisonHref(animalId = '') {
    const params = new URLSearchParams();
    if (animalId) params.set('id', animalId);
    const query = params.toString();
    return `vs.html${query ? `?${query}` : ''}`;
}

function getActionIconSvg(kind = 'comparacao') {
    if (kind === 'comparacao') {
        return `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 5v14" />
                <path d="M16 5v14" />
                <path d="M5 8c0-1.657 1.343-3 3-3h3v14H8c-1.657 0-3-1.343-3-3V8Z" />
                <path d="M19 8c0-1.657-1.343-3-3-3h-3v14h3c1.657 0 3-1.343 3-3V8Z" />
            </svg>`;
    }
    return '';
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
    // Quando existe uma imagem de cria, a imagem principal representa o adulto
    // mesmo que não tenha uma fase preenchida nos metadados da galeria.
    if (phases.has('Adulto') || phases.has('Cria')) {
        const adultImageUrl = findProfileImageForBadge(entries, 'phase', 'Adulto', originalUrl) || originalUrl;
        const youngImageUrl = findProfileImageForBadge(entries, 'phase', 'Cria', originalUrl) || originalUrl;
        badges.push(`<button type="button" class="profile-image-badge phase-switch" data-profile-phase-switch data-profile-adult-url="${escapeHtml(adultImageUrl)}" data-profile-young-url="${escapeHtml(youngImageUrl)}" data-profile-active-phase="Adulto" title="Mudar entre imagem de adulto e cria" aria-label="Mudar entre imagem de adulto e cria"><span class="phase-switch-option adult active" data-phase-option="Adulto" title="Adulto"><i class="fa-solid fa-paw" aria-hidden="true"></i></span><span class="phase-switch-option young" data-phase-option="Cria" title="Cria"><i class="fa-solid fa-baby" aria-hidden="true"></i></span></button>`);
    }

    return badges.length ? `<div class="profile-image-badges" data-profile-image-badges>${badges.join('')}</div>` : '';
}

function toggleProfileImageByBadge(widget, button) {
    const image = widget.querySelector('[data-profile-main-image]');
    if (!image || !button) return;

    const originalSrc = image.dataset.originalSrc || image.getAttribute('src') || '';
    image.dataset.originalSrc = originalSrc;

    if (button.hasAttribute('data-profile-phase-switch')) {
        const currentPhase = button.dataset.profileActivePhase || 'Adulto';
        const nextPhase = currentPhase === 'Adulto' ? 'Cria' : 'Adulto';
        const targetUrl = nextPhase === 'Adulto' ? button.dataset.profileAdultUrl : button.dataset.profileYoungUrl;
        image.src = targetUrl || originalSrc;
        button.dataset.profileActivePhase = nextPhase;
        button.classList.toggle('is-young-active', nextPhase === 'Cria');
        button.querySelectorAll('[data-phase-option]').forEach(option => {
            option.classList.toggle('active', option.dataset.phaseOption === nextPhase);
        });
        button.title = nextPhase === 'Adulto' ? 'Mudar para imagem de cria' : 'Mudar para imagem de adulto';
        button.setAttribute('aria-label', button.title);
        return;
    }

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

export function renderAnimalMediaBlock(animalData = {}, animalId = '') {
    const objectPosition = animalData.imagemObjectPosition || 'center center';
    const compareHref = getComparisonHref(animalId);
    const profileBadgesHTML = getProfileImageBadges(animalData);
    const audioId = getAnimalAudioId(animalData);

    return `
        <section class="anatomy-widget">
            <div class="animal-image">
                <img data-profile-main-image src="${escapeHtml(animalData.imagemUrl || '')}" alt="${escapeHtml(animalData.nome || 'Animal')}" style="object-position: ${escapeHtml(objectPosition)};">
                ${profileBadgesHTML}
            </div>
            <div class="animal-media-actions">
                <a class="animal-media-action" href="${compareHref}" aria-label="Comparação" title="Comparação">
                    ${getActionIconSvg('comparacao')}
                </a>
                ${audioId ? `
                    <button type="button" class="animal-media-action animal-media-action-audio" data-animal-audio-panel-toggle data-audio-id="${escapeHtml(audioId)}" aria-label="Áudio" title="Áudio">
                        ${getAnimalAudioIconSvg('audio')}
                    </button>
                ` : ''}
            </div>
            ${audioId ? `
                <div class="animal-audio-panel" data-animal-audio-panel hidden>
                    <button type="button" class="animal-audio-control" data-animal-audio-pause data-audio-id="${escapeHtml(audioId)}">
                        ${getAnimalAudioIconSvg('pause')}<span>Pause</span>
                    </button>
                    <button type="button" class="animal-audio-control" data-animal-audio-stop data-audio-id="${escapeHtml(audioId)}">
                        ${getAnimalAudioIconSvg('stop')}<span>Parar</span>
                    </button>
                </div>
            ` : ''}
        </section>
    `;
}

export function initAnimalMediaBlock(root = document) {
    root.querySelectorAll('.anatomy-widget').forEach(widget => {
        if (widget.dataset.ready === 'true') return;
        widget.dataset.ready = 'true';

        widget.querySelectorAll('[data-profile-badge-key], [data-profile-phase-switch]').forEach(button => {
            button.addEventListener('click', () => toggleProfileImageByBadge(widget, button));
        });
    });
}

export function initFooterAnatomyTabs(root = document) {
    const section = root.querySelector('.footer-anatomy-section');
    if (!section) return;

    const showInfo = (container, title, text) => {
        const infoPanel = container.querySelector('.anatomy-info-panel');
        if (!infoPanel) return;

        infoPanel.querySelector('.anatomy-info-title').textContent = title;
        infoPanel.querySelector('.anatomy-info-desc').textContent = text;
        infoPanel.style.display = 'flex';
        container.classList.add('has-active-info');
    };

    const hideInfo = (container) => {
        const infoPanel = container.querySelector('.anatomy-info-panel');
        if (!infoPanel) return;

        infoPanel.style.display = 'none';
        container.classList.remove('has-active-info');
    };

    const cleanText = (value = '') => String(value).replace(/\s+/g, ' ').trim();

    const getInlineInfo = (hotspot) => {
        const handler = hotspot.getAttribute('onclick') || '';
        const match = handler.match(/showInfo\(\s*(['"])([\s\S]*?)\1\s*,\s*(['"])([\s\S]*?)\3\s*\)/);
        if (!match) return null;

        const decode = value => value.replace(/\\(['"\\])/g, '$1');
        return { title: decode(match[2]), text: decode(match[4]) };
    };

    const getPopupInfo = (svg, anchor) => {
        const href = anchor?.getAttribute('href') || '';
        const popupId = href.split('#')[1];
        if (!popupId) return null;

        const popup = [...svg.querySelectorAll('[id]')].find(element => element.id === popupId);
        if (!popup) return null;

        const title = cleanText(popup.querySelector('.popup-title')?.textContent || '');
        const text = cleanText(popup.querySelector('foreignObject')?.textContent || '');
        return title || text ? { title, text } : null;
    };

    const initSvgInteractions = (container, svg) => {
        svg.querySelectorAll('.hotspot').forEach(hotspot => {
            const anchor = hotspot.closest('a');
            const info = getPopupInfo(svg, anchor) || getInlineInfo(hotspot);
            if (!info) return;

            // Os SVG antigos trazem handlers inline e âncoras para popups internos.
            // A interação passa a ser controlada aqui, no painel HTML comum.
            hotspot.removeAttribute('onclick');
            hotspot.removeAttribute('onkeydown');
            anchor?.removeAttribute('href');

            const open = event => {
                event.preventDefault();
                event.stopPropagation();
                showInfo(container, info.title, info.text);
            };

            hotspot.addEventListener('click', open);
            hotspot.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') open(event);
            });
        });

        svg.querySelectorAll('.close, a[href="#"]').forEach(closeControl => {
            closeControl.removeAttribute('onclick');
            closeControl.removeAttribute('onkeydown');
            closeControl.removeAttribute('href');
            closeControl.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                hideInfo(container);
            });
        });
    };

    const loadSvg = async (container) => {
        const url = container.dataset.svgUrl;
        if (!url) return;
        const wrapper = container.querySelector('.svg-content-wrapper');
        if (!wrapper) return;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Ficheiro não encontrado (${res.status})`);
            let svgText = await res.text();
            
            // Remove the inline script to avoid overwriting showInfo/hideInfo globally
            svgText = svgText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            
            wrapper.innerHTML = svgText;

            const svg = wrapper.querySelector('svg');
            if (!svg) throw new Error('O ficheiro SVG não contém um elemento SVG válido.');
            initSvgInteractions(container, svg);
        } catch (err) {
            wrapper.innerHTML = `<div class="svg-error" style="color: var(--text-secondary); padding: 20px; text-align: center; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">Não foi possível carregar o ficheiro SVG interativo.<br><small style="opacity: 0.6; display: block; margin-top: 6px;">${url}</small></div>`;
            console.error(err);
        }
    };

    const svgContainers = section.querySelectorAll('.footer-svg-container');
    svgContainers.forEach(container => {
        // Create HTML info panel next to the SVG if not present
        if (!container.querySelector('.anatomy-info-panel')) {
            const panel = document.createElement('div');
            panel.className = 'anatomy-info-panel';
            panel.style.display = 'none';
            panel.innerHTML = `
                <button type="button" class="anatomy-info-close" aria-label="Fechar">&times;</button>
                <div class="anatomy-info-content">
                    <h4 class="anatomy-info-title"></h4>
                    <p class="anatomy-info-desc"></p>
                </div>
            `;
            container.appendChild(panel);

            // Close button handler
            panel.querySelector('.anatomy-info-close').addEventListener('click', () => {
                hideInfo(container);
            });
        }
        loadSvg(container);
    });
}
