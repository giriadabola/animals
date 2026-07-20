// Mapa dinâmico de distribuição através de GBIF e iNaturalist.
(function () {
    'use strict';

    const GBIF_API = 'https://api.gbif.org/v1';
    const INAT_API = 'https://api.inaturalist.org/v1';
    const MAP_WIDTH = 1000;
    const MAP_HEIGHT = 500;
    const MAX_RESULTS = 250;
    let dynamicMap = null;
    let dynamicOverlay = null;
    let gbifPoints = [];
    let inaturalistPoints = [];
    let scientificNameLoaded = '';
    let loading = false;

    const byId = id => document.getElementById(id);
    const status = message => {
        const element = byId('gbifDistributionStatus');
        if (element) element.textContent = message;
    };

    function toMapPoint(latitude, longitude) {
        return [
            Math.max(0, Math.min(MAP_WIDTH, ((Number(longitude) + 180) / 360) * MAP_WIDTH)),
            Math.max(0, Math.min(MAP_HEIGHT, ((90 - Number(latitude)) / 180) * MAP_HEIGHT))
        ];
    }

    function normalizeGBIFResults(results) {
        const seen = new Set();
        return results.map(item => {
            const latitude = Number(item.decimalLatitude);
            const longitude = Number(item.decimalLongitude);
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
            const key = `${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
            if (seen.has(key)) return null;
            seen.add(key);
            return {
                id: `gbif-${key.replace(/[^0-9-]/g, '')}`,
                nome: 'Ocorrência GBIF',
                tipo: 'actual',
                ponto: toMapPoint(latitude, longitude),
                fonte: 'GBIF',
                latitude,
                longitude,
                countryCode: String(item.countryCode || '').toUpperCase()
            };
        }).filter(Boolean).slice(0, MAX_RESULTS);
    }

    function normalizeINaturalistResults(results) {
        const seen = new Set();
        return results.map(item => {
            const coordinates = item.geojson?.coordinates || String(item.location || '').split(',').reverse();
            const longitude = Number(coordinates?.[0]);
            const latitude = Number(coordinates?.[1]);
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
            const key = `${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
            if (seen.has(key)) return null;
            seen.add(key);
            return {
                id: `inat-${item.id || key.replace(/[^0-9-]/g, '')}`,
                nome: 'Observação iNaturalist',
                tipo: 'actual',
                ponto: toMapPoint(latitude, longitude),
                fonte: 'iNaturalist',
                latitude,
                longitude,
                qualidade: item.quality_grade || '',
                observacaoId: item.id || null
            };
        }).filter(Boolean).slice(0, MAX_RESULTS);
    }

    function allDynamicPoints() {
        return [...gbifPoints, ...inaturalistPoints];
    }

    function renderDynamicPoints() {
        const container = byId('distributionMapDynamic');
        if (!container || !dynamicMap) return;
        const points = allDynamicPoints();
        if (!dynamicOverlay) dynamicOverlay = window.DistributionAreas?.createDistributionAreaOverlay?.(container, { points });
        dynamicOverlay?.render([], [], points);
    }

    function initDynamicMap() {
        const container = byId('distributionMapDynamic');
        if (!container || dynamicMap || typeof window.jsVectorMap !== 'function') return;
        if (container.offsetWidth === 0 || container.offsetHeight === 0) return;
        dynamicMap = new jsVectorMap({
            selector: '#distributionMapDynamic',
            map: 'world',
            draggable: true,
            zoomButtons: true,
            zoomOnScroll: true,
            zoomMax: 12,
            regionStyle: { initial: { fill: '#2e2e38', fillOpacity: 1, stroke: '#3b3b4f', strokeWidth: 0.5 } }
        });
        renderDynamicPoints();
    }

    function getRecentWindow() {
        const end = new Date();
        const start = new Date(end);
        start.setUTCFullYear(start.getUTCFullYear() - 10);
        return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10), startYear: start.getUTCFullYear(), endYear: end.getUTCFullYear() };
    }

    async function fetchGBIF(taxonKey, recentOnly) {
        const query = new URLSearchParams({ taxon_key: String(taxonKey), has_coordinate: 'true', limit: String(MAX_RESULTS), offset: '0' });
        if (recentOnly) {
            const window = getRecentWindow();
            query.set('year', `${window.startYear},${window.endYear}`);
        }
        const response = await fetch(`${GBIF_API}/occurrence/search?${query}`);
        if (!response.ok) throw new Error('A GBIF não devolveu ocorrências.');
        const data = await response.json();
        return normalizeGBIFResults(Array.isArray(data.results) ? data.results : []);
    }

    async function fetchINaturalist(scientificName, recentOnly) {
        const query = new URLSearchParams({ taxon_name: scientificName, 'has[]': 'geo', quality_grade: 'research', per_page: '200', order_by: 'observed_on', order: 'desc' });
        if (recentOnly) {
            const window = getRecentWindow();
            query.set('d1', window.startDate);
            query.set('d2', window.endDate);
        }
        const response = await fetch(`${INAT_API}/observations?${query}`);
        if (!response.ok) throw new Error('iNaturalist não devolveu observações.');
        const data = await response.json();
        return normalizeINaturalistResults(Array.isArray(data.results) ? data.results : []);
    }

    async function loadDynamicDistribution() {
        const scientificName = String(byId('nomeCientifico')?.value || '').trim();
        const button = byId('loadGbifDistributionBtn');
        const importButton = byId('importGbifDistributionBtn');
        if (!scientificName || loading) {
            if (!scientificName) status('Preencha primeiro o nome científico.');
            return;
        }
        loading = true;
        button && (button.disabled = true);
        importButton && (importButton.disabled = true);
        status(`A procurar ocorrências em GBIF e iNaturalist para ${scientificName}...`);
        try {
            const matchResponse = await fetch(`${GBIF_API}/species/match?name=${encodeURIComponent(scientificName)}`);
            if (!matchResponse.ok) throw new Error('Não foi possível identificar a espécie na GBIF.');
            const match = await matchResponse.json();
            const taxonKey = Number(match.usageKey || match.acceptedUsageKey);
            if (!Number.isFinite(taxonKey)) throw new Error('A GBIF não encontrou um táxon correspondente.');
            let period = 'últimos 10 anos';
            const inaturalistName = match.canonicalName || scientificName;
            gbifPoints = await fetchGBIF(taxonKey, true);
            try {
                inaturalistPoints = await fetchINaturalist(inaturalistName, true);
            } catch (error) {
                inaturalistPoints = [];
                console.warn('iNaturalist: consulta recente indisponível', error);
            }
            if (!gbifPoints.length && !inaturalistPoints.length) {
                period = 'histórico completo';
                gbifPoints = await fetchGBIF(taxonKey, false);
                try {
                    inaturalistPoints = await fetchINaturalist(inaturalistName, false);
                } catch (error) {
                    inaturalistPoints = [];
                    console.warn('iNaturalist: consulta histórica indisponível', error);
                }
            }
            scientificNameLoaded = scientificName;
            initDynamicMap();
            if (dynamicMap) { dynamicMap.updateSize(); renderDynamicPoints(); }
            const total = allDynamicPoints().length;
            importButton && (importButton.disabled = total === 0);
            status(`${gbifPoints.length} GBIF + ${inaturalistPoints.length} iNaturalist = ${total} ocorrências encontradas.`);
        } catch (error) {
            gbifPoints = [];
            inaturalistPoints = [];
            status(`Erro no mapa dinâmico: ${error.message}`);
        } finally {
            loading = false;
            button && (button.disabled = false);
        }
    }

    function importDynamicPoints() {
        const points = allDynamicPoints();
        if (!points.length || !Array.isArray(distributionPoints)) return;
        const existing = new Set(distributionPoints.map(item => `${item.ponto?.[0]}:${item.ponto?.[1]}`));
        points.forEach(point => {
            const key = `${point.ponto[0]}:${point.ponto[1]}`;
            if (!existing.has(key)) {
                distributionPoints.push({
                    ...point,
                    nome: `${point.fonte} — ${point.latitude.toFixed(3)}, ${point.longitude.toFixed(3)}`
                });
            }
        });
        renderHabitatAreas();
                syncCountriesFromHabitatAreas();
        focusDistributionMapContent();
        status(`${points.length} ocorrências copiadas para o mapa manual.`);
    }

    function activateDynamicMap() {
        setTimeout(() => {
            const container = byId('distributionMapDynamic');
            if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) return;
            initDynamicMap();
            if (dynamicMap) dynamicMap.updateSize();
            const scientificName = String(byId('nomeCientifico')?.value || '').trim();
            if (scientificName && scientificName !== scientificNameLoaded) loadDynamicDistribution();
        }, 80);
    }

    byId('loadGbifDistributionBtn')?.addEventListener('click', loadDynamicDistribution);
    byId('importGbifDistributionBtn')?.addEventListener('click', importDynamicPoints);
    document.addEventListener('click', event => {
        if (event.target.closest('.form-tab-nav-btn[data-tab="distribuicao"]') || event.target.closest('.form-subtab-nav-btn[data-subtab="distribuicao-mapa-dinamico"]')) activateDynamicMap();
    });
    document.addEventListener('form:modules-loaded', activateDynamicMap);
    window.initDynamicDistributionMap = activateDynamicMap;
})();