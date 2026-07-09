// Fotos de perfil: metadados de sexo/fase da imagem principal e imagens extra
function normalizeProfileGender(value = '') {
    const v = String(value || '').trim().toUpperCase();
    if (v === 'M' || v === 'MACHO' || v === 'MALE') return 'M';
    if (v === 'F' || v === 'FEMEA' || v === 'FÊMEA' || v === 'FEMALE') return 'F';
    return '';
}

function normalizeProfilePhase(value = '') {
    const v = String(value || '').trim().toLowerCase();
    if (v === 'cria' || v === 'juvenil' || v === 'jovem') return 'Cria';
    if (v === 'adulto' || v === 'adulta') return 'Adulto';
    return '';
}

function updateProfileMultiToggle(button, value = '') {
    if (!button) return;
    const normalizedValue = button.matches('[data-profile-main-gender-cycle], [data-profile-extra-gender-cycle]')
        ? normalizeProfileGender(value)
        : normalizeProfilePhase(value);

    button.dataset.value = normalizedValue;
    button.classList.toggle('active', !!normalizedValue);
    button.querySelectorAll('[data-option]').forEach(icon => {
        icon.classList.toggle('active', icon.dataset.option === normalizedValue);
    });
}

function cycleProfileMultiToggle(button) {
    if (!button) return;
    const isGender = button.matches('[data-profile-main-gender-cycle], [data-profile-extra-gender-cycle]');
    const values = isGender ? ['', 'M', 'F'] : ['', 'Adulto', 'Cria'];
    const current = isGender ? normalizeProfileGender(button.dataset.value) : normalizeProfilePhase(button.dataset.value);
    const currentIndex = values.indexOf(current);
    const nextValue = values[(currentIndex + 1) % values.length];
    updateProfileMultiToggle(button, nextValue);
}

function getProfileMainGender() {
    const multi = document.querySelector('[data-profile-main-gender-cycle]');
    if (multi) return normalizeProfileGender(multi.dataset.value || '');
    return document.querySelector('.profile-toggle-btn.active[data-profile-main-gender]')?.dataset.profileMainGender || '';
}

function getProfileMainPhase() {
    const multi = document.querySelector('[data-profile-main-phase-cycle]');
    if (multi) return normalizeProfilePhase(multi.dataset.value || '');
    return document.querySelector('.profile-toggle-btn.active[data-profile-main-phase]')?.dataset.profileMainPhase || '';
}

function setProfileButtonState(selector, value = '') {
    const isGender = selector.includes('gender');
    const normalized = isGender ? normalizeProfileGender(value) : normalizeProfilePhase(value);

    document.querySelectorAll(selector).forEach(btn => {
        if (btn.matches('[data-profile-main-gender-cycle], [data-profile-extra-gender-cycle], [data-profile-main-phase-cycle], [data-profile-extra-phase-cycle]')) {
            updateProfileMultiToggle(btn, normalized);
            return;
        }
        const btnValue = btn.dataset.profileMainGender || btn.dataset.profileMainPhase || btn.dataset.profileExtraGender || btn.dataset.profileExtraPhase || '';
        btn.classList.toggle('active', !!normalized && btnValue === normalized);
    });
}

function createProfileExtraPhotoRow(photo = {}) {
    const rows = document.getElementById('profileExtraPhotosRows');
    if (!rows) return null;

    const row = document.createElement('div');
    row.className = 'profile-extra-photo-row';
    row.innerHTML = `
        <input type="url" class="profile-extra-photo-url" placeholder="https://exemplo.com/foto-extra.jpg" value="${String(photo.url || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">
        <div class="profile-photo-toggles compact" data-profile-toggle-group="extra">
            <button type="button" class="profile-multi-toggle profile-gender-multi-toggle" data-profile-extra-gender-cycle data-value="" title="Sexo da foto: clicar alterna entre macho/fêmea/sem opção" aria-label="Sexo da foto">
                <span class="profile-multi-icon gender-male" data-option="M">♂</span>
                <span class="profile-multi-icon gender-female" data-option="F">♀</span>
            </button>
            <button type="button" class="profile-multi-toggle profile-phase-multi-toggle" data-profile-extra-phase-cycle data-value="" title="Fase da foto: clicar alterna entre adulto/cria/sem opção" aria-label="Fase da foto">
                <span class="profile-multi-icon phase-adult" data-option="Adulto"><i class="fa-solid fa-paw" aria-hidden="true"></i></span>
                <span class="profile-multi-icon phase-young" data-option="Cria"><i class="fa-solid fa-baby" aria-hidden="true"></i></span>
            </button>
        </div>
        <button type="button" class="profile-remove-photo-btn" title="Apagar foto" aria-label="Apagar foto">×</button>
    `;
    rows.appendChild(row);

    const gender = normalizeProfileGender(photo.gender || photo.sexo || photo.genero);
    const phase = normalizeProfilePhase(photo.phase || photo.fase || photo.idade);
    updateProfileMultiToggle(row.querySelector('[data-profile-extra-gender-cycle]'), gender);
    updateProfileMultiToggle(row.querySelector('[data-profile-extra-phase-cycle]'), phase);
    return row;
}

function initProfilePhotosUi() {
    const addBtn = document.getElementById('addProfileExtraPhotoBtn');
    const rows = document.getElementById('profileExtraPhotosRows');
    if (!rows || rows.dataset.ready === 'true') return;
    rows.dataset.ready = 'true';

    addBtn?.addEventListener('click', () => createProfileExtraPhotoRow());

    document.addEventListener('click', (event) => {
        const multiBtn = event.target.closest('[data-profile-main-gender-cycle], [data-profile-main-phase-cycle], [data-profile-extra-gender-cycle], [data-profile-extra-phase-cycle]');
        if (multiBtn) {
            cycleProfileMultiToggle(multiBtn);
            return;
        }

        const mainGenderBtn = event.target.closest('[data-profile-main-gender]');
        if (mainGenderBtn) {
            const isActive = mainGenderBtn.classList.contains('active');
            document.querySelectorAll('[data-profile-main-gender]').forEach(btn => btn.classList.remove('active'));
            if (!isActive) mainGenderBtn.classList.add('active');
            return;
        }

        const mainPhaseBtn = event.target.closest('[data-profile-main-phase]');
        if (mainPhaseBtn) {
            const isActive = mainPhaseBtn.classList.contains('active');
            document.querySelectorAll('[data-profile-main-phase]').forEach(btn => btn.classList.remove('active'));
            if (!isActive) mainPhaseBtn.classList.add('active');
            return;
        }

        const extraGenderBtn = event.target.closest('[data-profile-extra-gender]');
        if (extraGenderBtn) {
            const row = extraGenderBtn.closest('.profile-extra-photo-row');
            const isActive = extraGenderBtn.classList.contains('active');
            row?.querySelectorAll('[data-profile-extra-gender]').forEach(btn => btn.classList.remove('active'));
            if (!isActive) extraGenderBtn.classList.add('active');
            return;
        }

        const extraPhaseBtn = event.target.closest('[data-profile-extra-phase]');
        if (extraPhaseBtn) {
            const row = extraPhaseBtn.closest('.profile-extra-photo-row');
            const isActive = extraPhaseBtn.classList.contains('active');
            row?.querySelectorAll('[data-profile-extra-phase]').forEach(btn => btn.classList.remove('active'));
            if (!isActive) extraPhaseBtn.classList.add('active');
            return;
        }

        const removeBtn = event.target.closest('.profile-remove-photo-btn');
        if (removeBtn) {
            removeBtn.closest('.profile-extra-photo-row')?.remove();
        }
    });
}

function getProfilePhotosData() {
    const mainUrl = document.getElementById('imagemUrl')?.value.trim() || '';
    const mainGender = normalizeProfileGender(getProfileMainGender());
    const mainPhase = normalizeProfilePhase(getProfileMainPhase());

    const profileImages = [];
    if (mainUrl) {
        profileImages.push({
            url: mainUrl,
            gender: mainGender,
            phase: mainPhase,
            isPrimary: true
        });
    }

    document.querySelectorAll('.profile-extra-photo-row').forEach(row => {
        const url = row.querySelector('.profile-extra-photo-url')?.value.trim() || '';
        if (!url) return;
        const gender = normalizeProfileGender(row.querySelector('[data-profile-extra-gender-cycle]')?.dataset.value || row.querySelector('[data-profile-extra-gender].active')?.dataset.profileExtraGender || '');
        const phase = normalizeProfilePhase(row.querySelector('[data-profile-extra-phase-cycle]')?.dataset.value || row.querySelector('[data-profile-extra-phase].active')?.dataset.profileExtraPhase || '');
        profileImages.push({ url, gender, phase, isPrimary: false });
    });

    return {
        primary: { url: mainUrl, gender: mainGender, phase: mainPhase, isPrimary: true },
        extras: profileImages.filter(item => !item.isPrimary),
        profileImages
    };
}

function setProfilePhotosData(animal = {}) {
    initProfilePhotosUi();
    const rows = document.getElementById('profileExtraPhotosRows');
    if (rows) rows.innerHTML = '';

    const images = Array.isArray(animal.profileImages) ? animal.profileImages : [];
    const primary = images.find(item => item?.isPrimary) || images.find(item => item?.url === animal.imagemUrl) || {};
    const mainGender = normalizeProfileGender(primary.gender || primary.sexo || primary.genero || animal.imagemPerfilSexo || animal.imagemSexo || '');
    const mainPhase = normalizeProfilePhase(primary.phase || primary.fase || primary.idade || animal.imagemPerfilFase || animal.imagemFase || '');

    setProfileButtonState('[data-profile-main-gender-cycle], [data-profile-main-gender]', mainGender);
    setProfileButtonState('[data-profile-main-phase-cycle], [data-profile-main-phase]', mainPhase);

    const extras = images.filter(item => item && item.url && !item.isPrimary && item.url !== animal.imagemUrl);
    extras.forEach(photo => createProfileExtraPhotoRow(photo));
}

function resetProfilePhotosData() {
    setProfilePhotosData({ profileImages: [] });
}

initProfilePhotosUi();
