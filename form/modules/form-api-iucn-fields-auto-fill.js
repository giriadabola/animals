// Campos estruturados da IUCN preenchidos automaticamente no formulário.
(function initIucnFieldsAutoFill() {
  const scientificInput = document.getElementById('nomeCientifico');
  const params = new URLSearchParams(window.location.search);
  if (!scientificInput || params.has('edit') || params.has('id') || params.has('animal')) return;

  const API_TIMEOUT_MS = 9000;
  let searchTimer = null;
  let searchSequence = 0;
  let autoGeneralEntries = new Set();
  let autoRegionEntries = new Set();

  function fetchJson(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    return fetch(url, { signal: controller.signal, cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .finally(() => clearTimeout(timeout));
  }

  function replaceGeneralRows(rows) {
    if (typeof getGeneralVisualData !== 'function' || typeof setGeneralVisualData !== 'function') return;
    if (!rows.length && !autoGeneralEntries.size) return;
    const current = getGeneralVisualData();
    const remaining = current.filter(item => !autoGeneralEntries.has(window.formIucnMapping.generalKey(item)));
    setGeneralVisualData(remaining.concat(rows), { useDefaults: false });
    autoGeneralEntries = new Set(rows.map(window.formIucnMapping.generalKey));
  }

  function replaceRegionRows(realms) {
    const getRegions = window.getDistributionRegionsData;
    const setRegions = window.setDistributionRegionsData;
    if (typeof getRegions !== 'function' || typeof setRegions !== 'function') return;
    if (!realms.length && !autoRegionEntries.size) return;
    const current = getRegions();
    const remaining = current.filter(item => !autoRegionEntries.has(window.formIucnMapping.regionKey(item)));
    const rows = realms.map(valor => ({ tipo: 'Regiões Biogeográficas', valor }));
    setRegions(remaining.concat(rows));
    autoRegionEntries = new Set(rows.map(window.formIucnMapping.regionKey));
  }

  function applyFields(response) {
    const assessment = response?.assessment || {};
    if (!response?.summary) {
      replaceGeneralRows([]);
      replaceRegionRows([]);
      return;
    }
    replaceGeneralRows(window.formIucnMapping.generalRows(assessment));
    replaceRegionRows(window.formIucnMapping.realmLabels(assessment));
  }

  async function run() {
    const name = scientificInput.value.trim();
    const sequence = ++searchSequence;
    if (name.split(/\s+/).length < 2) {
      replaceGeneralRows([]);
      replaceRegionRows([]);
      return;
    }
    const proxyUrl = window.ANIMAL_API_CONFIG?.iucnProxy;
    if (!proxyUrl) return;
    try {
      const response = await fetchJson(proxyUrl + '?name=' + encodeURIComponent(name));
      if (sequence !== searchSequence || scientificInput.value.trim() !== name) return;
      applyFields(response);
    } catch (error) {
      if (sequence === searchSequence) {
        replaceGeneralRows([]);
        replaceRegionRows([]);
      }
      console.warn('Campos estruturados da IUCN indisponíveis:', error);
    }
  }

  function schedule() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => run(), 700);
  }

  scientificInput.addEventListener('input', schedule);
  scientificInput.addEventListener('blur', schedule);
})();
