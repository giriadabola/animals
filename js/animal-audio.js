function escapeHtml(value = '') {
    return String(value).replace(/[&<>"]/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
    }[char]));
}

export function normalizeXenoCantoAudioId(value = '') {
    return String(value || '').replace(/\D/g, '').trim();
}

export function getAnimalAudioId(animalData = {}) {
    return normalizeXenoCantoAudioId(
        animalData.xenoCantoAudioId ||
        animalData.audioXenoCantoId ||
        animalData.xenoCantoId ||
        animalData.audioId ||
        animalData.informacao?.xenoCantoAudioId ||
        animalData.informacao?.audioXenoCantoId ||
        animalData.informacao?.audio?.codigo ||
        ''
    );
}

export function getAnimalAudioUrl(audioId = '') {
    const id = normalizeXenoCantoAudioId(audioId);
    return id ? `https://xeno-canto.org/${id}/download` : '';
}

export function getAnimalAudioIconSvg(kind = 'audio') {
    if (kind === 'pause') {
        return `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.5 6.5v11" />
                <path d="M15.5 6.5v11" />
            </svg>`;
    }

    if (kind === 'stop') {
        return `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 8h8v8H8z" />
            </svg>`;
    }

    if (kind === 'play') {
        return `
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" />
                <path class="animal-audio-play-triangle" d="M10 8.3v7.4L16 12l-6-3.7Z" />
            </svg>`;
    }

    return `
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.5 14.4h3.1l4.4 3.9V5.7L7.6 9.6H4.5v4.8Z" />
            <path d="M15.5 9.2c.8.7 1.2 1.7 1.2 2.8s-.4 2.1-1.2 2.8" />
            <path d="M18.2 6.8A7.2 7.2 0 0 1 20.5 12a7.2 7.2 0 0 1-2.3 5.2" />
        </svg>`;
}

export function renderAnimalAudioThumbnail(animalData = {}) {
    const audioId = getAnimalAudioId(animalData);
    if (!audioId) return '';

    const imageUrl = animalData.imagemUrl || '';
    const animalName = animalData.nome || 'Animal';

    return `
        <button type="button" class="thumbnail animal-audio-thumbnail" data-animal-audio-toggle data-audio-id="${escapeHtml(audioId)}" aria-label="Ouvir vocalização" title="Ouvir vocalização">
            <img src="${escapeHtml(imageUrl)}" alt="Vocalização de ${escapeHtml(animalName)}">
            <span class="animal-audio-thumbnail-blur" aria-hidden="true"></span>
            <span class="play-icon animal-audio-play-icon" data-audio-state-icon>
                ${getAnimalAudioIconSvg('play')}
            </span>
            <span class="animal-audio-label">Vocalização</span>
        </button>`;
}

function getOrCreateAudio(audioId = '') {
    const id = normalizeXenoCantoAudioId(audioId);
    if (!id) return null;

    const existing = document.querySelector(`audio[data-xeno-canto-audio="${CSS.escape(id)}"]`);
    if (existing) return existing;

    const audio = document.createElement('audio');
    audio.preload = 'none';
    audio.src = getAnimalAudioUrl(id);
    audio.dataset.xenoCantoAudio = id;
    audio.dataset.audioRequestToken = '0';
    audio.style.display = 'none';
    document.body.appendChild(audio);
    return audio;
}

function setControlState(audioId = '', state = 'paused') {
    const id = normalizeXenoCantoAudioId(audioId);
    if (!id) return;

    document.querySelectorAll(`[data-audio-id="${CSS.escape(id)}"]`).forEach(control => {
        control.classList.toggle('is-playing', state === 'playing');
        const icon = control.querySelector('[data-audio-state-icon]');
        if (icon) icon.innerHTML = getAnimalAudioIconSvg(state === 'playing' ? 'pause' : 'play');
    });
}

function markNewAudioRequest(audio) {
    const nextToken = Number(audio.dataset.audioRequestToken || '0') + 1;
    audio.dataset.audioRequestToken = String(nextToken);
    return nextToken;
}

function pauseAudio(audioId = '') {
    const audio = getOrCreateAudio(audioId);
    if (!audio) return;
    markNewAudioRequest(audio);
    audio.pause();
    setControlState(audioId, 'paused');
}

function stopAudio(audioId = '') {
    const audio = getOrCreateAudio(audioId);
    if (!audio) return;
    markNewAudioRequest(audio);
    audio.pause();
    audio.currentTime = 0;
    setControlState(audioId, 'paused');
}

async function toggleAudio(audioId = '') {
    const audio = getOrCreateAudio(audioId);
    if (!audio) return;

    if (!audio.paused) {
        pauseAudio(audioId);
        return;
    }

    document.querySelectorAll('audio[data-xeno-canto-audio]').forEach(other => {
        if (other !== audio) {
            markNewAudioRequest(other);
            other.pause();
        }
    });

    pauseEmbeddedYoutubeVideos();

    const requestToken = markNewAudioRequest(audio);
    try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
            await playPromise;
        }
        if (audio.dataset.audioRequestToken === String(requestToken) && !audio.paused) {
            setControlState(audioId, 'playing');
        }
    } catch (error) {
        if (error?.name === 'AbortError') return;
        setControlState(audioId, 'paused');
        throw error;
    }
}


export function pauseAllAnimalAudio({ reset = false } = {}) {
    document.querySelectorAll('audio[data-xeno-canto-audio]').forEach(audio => {
        markNewAudioRequest(audio);
        audio.pause();
        if (reset) {
            try { audio.currentTime = 0; } catch (_) {}
        }
        setControlState(audio.dataset.xenoCantoAudio, 'paused');
    });
}

function pauseEmbeddedYoutubeVideos() {
    document.querySelectorAll('#main-video-container iframe').forEach(iframe => {
        if (iframe.src) iframe.src = '';
    });
    const videoContainer = document.getElementById('main-video-container');
    if (videoContainer) videoContainer.style.display = 'none';
    document.querySelectorAll('.thumbnail[data-video-url]').forEach(t => t.classList.remove('active'));
}

export function initAnimalAudioControls(root = document) {
    root.querySelectorAll('[data-animal-audio-toggle]').forEach(button => {
        if (button.dataset.audioReady === 'true') return;
        button.dataset.audioReady = 'true';
        button.addEventListener('click', async () => {
            try {
                await toggleAudio(button.dataset.audioId || '');
            } catch (error) {
                console.error('Erro ao tocar áudio xeno-canto:', error);
            }
        });
    });

    root.querySelectorAll('[data-animal-audio-panel-toggle]').forEach(button => {
        if (button.dataset.audioPanelReady === 'true') return;
        button.dataset.audioPanelReady = 'true';
        button.addEventListener('click', async () => {
            const audioId = button.dataset.audioId || '';
            const panel = button.closest('.anatomy-widget')?.querySelector('[data-animal-audio-panel]');
            if (panel) panel.hidden = false;

            try {
                await toggleAudio(audioId);
            } catch (error) {
                console.error('Erro ao tocar áudio xeno-canto:', error);
            }
        });
    });

    root.querySelectorAll('[data-animal-audio-pause]').forEach(button => {
        if (button.dataset.audioPauseReady === 'true') return;
        button.dataset.audioPauseReady = 'true';
        button.addEventListener('click', () => pauseAudio(button.dataset.audioId || ''));
    });

    root.querySelectorAll('[data-animal-audio-stop]').forEach(button => {
        if (button.dataset.audioStopReady === 'true') return;
        button.dataset.audioStopReady = 'true';
        button.addEventListener('click', () => stopAudio(button.dataset.audioId || ''));
    });

    root.querySelectorAll('[data-audio-id]').forEach(control => {
        const audio = getOrCreateAudio(control.dataset.audioId || '');
        if (!audio || audio.dataset.eventsReady === 'true') return;
        audio.dataset.eventsReady = 'true';
        audio.addEventListener('ended', () => setControlState(audio.dataset.xenoCantoAudio, 'paused'));
        audio.addEventListener('pause', () => setControlState(audio.dataset.xenoCantoAudio, 'paused'));
        audio.addEventListener('play', () => setControlState(audio.dataset.xenoCantoAudio, 'playing'));
    });
}
