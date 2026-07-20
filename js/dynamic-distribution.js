const GBIF_API = 'https://api.gbif.org/v1';
const INAT_API = 'https://api.inaturalist.org/v1';
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;
const MAX_RESULTS = 250;

function getRecentWindow() {
    const end = new Date();
    const start = new Date(end);
    start.setUTCFullYear(start.getUTCFullYear() - 10);
    return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10), startYear: start.getUTCFullYear(), endYear: end.getUTCFullYear() };
}

function toMapPoint(latitude, longitude) {
    return [Math.max(0, Math.min(MAP_WIDTH, ((Number(longitude) + 180) / 360) * MAP_WIDTH)), Math.max(0, Math.min(MAP_HEIGHT, ((90 - Number(latitude)) / 180) * MAP_HEIGHT))];
}

function normalizeGBIF(results) {
    const seen = new Set();
    return results.map(item => {
        const latitude = Number(item.decimalLatitude);
        const longitude = Number(item.decimalLongitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        const key = `${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
        if (seen.has(key)) return null;
        seen.add(key);
        return { id: `gbif-${key}`, nome: 'Ocorrência GBIF', tipo: 'actual', ponto: toMapPoint(latitude, longitude), fonte: 'GBIF', latitude, longitude, countryCode: String(item.countryCode || '').toUpperCase() };
    }).filter(Boolean).slice(0, MAX_RESULTS);
}

function normalizeINat(results) {
    const seen = new Set();
    return results.map(item => {
        const coordinates = item.geojson?.coordinates || String(item.location || '').split(',').reverse();
        const longitude = Number(coordinates?.[0]);
        const latitude = Number(coordinates?.[1]);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        const key = `${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
        if (seen.has(key)) return null;
        seen.add(key);
        return { id: `inat-${item.id || key}`, nome: 'Observação iNaturalist', tipo: 'actual', ponto: toMapPoint(latitude, longitude), fonte: 'iNaturalist', latitude, longitude, qualidade: item.quality_grade || '' };
    }).filter(Boolean).slice(0, MAX_RESULTS);
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
    return normalizeGBIF(Array.isArray(data.results) ? data.results : []);
}

async function fetchINat(scientificName, recentOnly) {
    const query = new URLSearchParams({ taxon_name: scientificName, 'has[]': 'geo', quality_grade: 'research', per_page: '200', order_by: 'observed_on', order: 'desc' });
    if (recentOnly) {
        const window = getRecentWindow();
        query.set('d1', window.startDate);
        query.set('d2', window.endDate);
    }
    const response = await fetch(`${INAT_API}/observations?${query}`);
    if (!response.ok) throw new Error('iNaturalist não devolveu observações.');
    const data = await response.json();
    return normalizeINat(Array.isArray(data.results) ? data.results : []);
}

export async function fetchDynamicDistribution(scientificName) {
    const name = String(scientificName || '').trim();
    if (!name) return { points: [], countryCodes: [], scientificName: '', period: 'none' };
    const matchResponse = await fetch(`${GBIF_API}/species/match?name=${encodeURIComponent(name)}`);
    if (!matchResponse.ok) throw new Error('Não foi possível identificar a espécie na GBIF.');
    const match = await matchResponse.json();
    const taxonKey = Number(match.usageKey || match.acceptedUsageKey);
    if (!Number.isFinite(taxonKey)) throw new Error('A GBIF não encontrou um táxon correspondente.');

    let period = 'últimos 10 anos';
    let gbifPoints = await fetchGBIF(taxonKey, true);
    let inatPoints = [];
    try { inatPoints = await fetchINat(match.scientificName || name, true); } catch (error) { console.warn('iNaturalist: consulta recente indisponível', error); }
    if (!gbifPoints.length && !inatPoints.length) {
        period = 'histórico completo';
        gbifPoints = await fetchGBIF(taxonKey, false);
        try { inatPoints = await fetchINat(match.scientificName || name, false); } catch (error) { console.warn('iNaturalist: consulta histórica indisponível', error); }
    }

    const points = [...gbifPoints, ...inatPoints];
    const countryCodes = [...new Set(gbifPoints.map(point => point.countryCode).filter(Boolean))];
    return { points, countryCodes, scientificName: match.scientificName || name, period };
}