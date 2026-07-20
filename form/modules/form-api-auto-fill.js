// Preenchimento automático directo para as APIs escolhidas pelo formulário.
(function initApiAutoFill() {
    const scientificInput = document.getElementById('nomeCientifico');
    const params = new URLSearchParams(window.location.search);
    if (!scientificInput || params.has('edit') || params.has('id') || params.has('animal')) return;

    const API_TIMEOUT_MS = 9000;
    let searchTimer = null;
    let searchSequence = 0;
    let autoIucnEntries = new Set();

    function fetchJson(url) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
        return fetch(url, { signal: controller.signal, cache: 'no-store' })
            .then(response => response.ok ? response.json() : null)
            .finally(() => clearTimeout(timeout));
    }

    function setFieldValue(id, value) {
        const field = document.getElementById(id);
        const text = String(value || '').trim();
        if (!field || !text) return;
        field.value = text;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function getIucnText(value) {
        if (typeof value === 'string') return value.trim();
        return String(value?.description?.pt || value?.description?.en || value?.name || value?.label || value?.text || '').trim();
    }

    function normalizeTrend(value) {
        const text = getIucnText(value).toLowerCase();
        if (!text) return '';
        if (text.includes('increas') || text.includes('aument')) return 'A aumentar';
        if (text.includes('decreas') || text.includes('declin') || text.includes('dimin') || text.includes('redu')) return 'A diminuir';
        if (text.includes('stable') || text.includes('estável') || text.includes('estavel')) return 'Estável';
        return 'Desconhecida';
    }

    function curiosityKey(item) {
        return String(item?.tipo || '') + '|' + String(item?.valor || '');
    }

    function clearAutoIucn() {
        if (!autoIucnEntries.size || typeof window.getCuriosidadesData !== 'function' || typeof window.setCuriosidadesData !== 'function') return;
        const current = window.getCuriosidadesData();
        window.setCuriosidadesData(current.filter(item => !autoIucnEntries.has(curiosityKey(item))), { useDefaults: false });
        autoIucnEntries = new Set();
    }

    function applyIucn(response) {
        const summary = response?.summary;
        const assessment = response?.assessment || {};
        if (!summary) { clearAutoIucn(); return; }

        const category = String(summary.red_list_category_code || summary.category || '').trim();
        const trend = normalizeTrend(assessment.population_trend || summary.population_trend);
        if (!category && !trend) { clearAutoIucn(); return; }
        if (typeof window.getCuriosidadesData !== 'function' || typeof window.setCuriosidadesData !== 'function') return;

        const current = window.getCuriosidadesData();
        const remaining = current.filter(item => !autoIucnEntries.has(curiosityKey(item)));
        const next = [];
        if (category) next.push({ tipo: 'Estado de Conservação', valor: category, genero: 'Ambos', fase: 'Adulto' });
        if (trend) next.push({ tipo: 'Tendência populacional', valor: trend, genero: 'Ambos', fase: 'Adulto' });
        window.setCuriosidadesData(remaining.concat(next), { useDefaults: false });
        autoIucnEntries = new Set(next.map(curiosityKey));
    }

    async function runAutoFill() {
        const name = scientificInput.value.trim();
        const sequence = ++searchSequence;

        if (name.split(/\s+/).length < 2) return;
        const config = window.ANIMAL_API_CONFIG || {};
        const iucnUrl = config.iucnProxy + '?name=' + encodeURIComponent(name);
        const iucnResult = await fetchJson(iucnUrl);
        if (sequence !== searchSequence || scientificInput.value.trim() !== name) return;
        applyIucn(iucnResult);
    }

    function scheduleAutoFill() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            runAutoFill().catch(error => console.warn('Preenchimento automático indisponível:', error));
        }, 700);
    }

    scientificInput.addEventListener('input', scheduleAutoFill);
    scientificInput.addEventListener('blur', scheduleAutoFill);
    window.formApiAutoFill = runAutoFill;
})();