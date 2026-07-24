const WIKIDATA_ENDPOINT = 'https://www.wikidata.org/w/api.php';
const ENTITY_ENDPOINT = 'https://www.wikidata.org/wiki/Special:EntityData/';
const cache = new Map();

function detectLanguage(value = '') {
    if (/[\u4e00-\u9fff]/u.test(value)) return 'zh';
    if (/[\u3040-\u30ff]/u.test(value)) return 'ja';
    if (/[\uac00-\ud7af]/u.test(value)) return 'ko';
    if (/[\u0600-\u06ff]/u.test(value)) return 'ar';
    if (/[\u0400-\u04ff]/u.test(value)) return 'ru';
    return 'en';
}
function normalize(value = '') {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}
function getClaimValues(entity, property) {
    return (entity?.claims?.[property] || []).map(claim => claim?.mainsnak?.datavalue?.value).filter(value => typeof value === 'string');
}
async function findLocalAnimalsByWikidata(queryText, items = [], getAnimal = item => item) {
    const query = String(queryText || '').trim();
    if (query.length < 2 || !items.length) return [];
    const key = detectLanguage(query) + ':' + query.toLocaleLowerCase();
    let candidateIds = cache.get(key);
    if (!candidateIds) {
        const params = new URLSearchParams({ action: 'wbsearchentities', search: query, language: detectLanguage(query), uselang: detectLanguage(query), type: 'item', limit: '5', format: 'json', origin: '*' });
        const response = await fetch(WIKIDATA_ENDPOINT + '?' + params);
        if (!response.ok) return [];
        const results = (await response.json())?.search || [];
        const entities = await Promise.all(results.map(result => fetch(ENTITY_ENDPOINT + encodeURIComponent(result.id) + '.json').then(r => r.ok ? r.json() : null).catch(() => null)));
        candidateIds = entities.flatMap(data => Object.values(data?.entities || {})).flatMap(entity => getClaimValues(entity, 'P225')).map(normalize).filter(Boolean);
        cache.set(key, candidateIds);
    }
    if (!candidateIds.length) return [];
    return items.filter(item => candidateIds.includes(normalize(getAnimal(item)?.nomeCientifico)));
}
const scientificNamesCache = new Map();

async function getWikidataScientificName(term = '') {
    const value = String(term || '').trim();
    if (!value) return '';
    const cacheKey = normalize(value);
    if (scientificNamesCache.has(cacheKey)) return scientificNamesCache.get(cacheKey);

    try {
        const params = new URLSearchParams({
            action: 'wbsearchentities',
            search: value,
            language: 'pt',
            uselang: 'pt',
            type: 'item',
            limit: '10',
            format: 'json',
            origin: '*'
        });
        const response = await fetch(WIKIDATA_ENDPOINT + '?' + params);
        const results = response.ok ? (await response.json())?.search || [] : [];
        const entities = await Promise.all(results.map(result =>
            fetch(ENTITY_ENDPOINT + encodeURIComponent(result.id) + '.json')
                .then(entityResponse => entityResponse.ok ? entityResponse.json() : null)
                .catch(() => null)
        ));
        const target = normalize(value);
        const entity = entities
            .flatMap(data => Object.values(data?.entities || {}))
            .find(candidate => {
                const labels = Object.values(candidate?.labels || {}).map(label => label?.value);
                const aliases = Object.values(candidate?.aliases || {}).flatMap(items => items.map(item => item?.value));
                return [...labels, ...aliases].some(label => normalize(label) === target);
            })
            || entities.flatMap(data => Object.values(data?.entities || {}))[0];
            
        const scientificName = entity?.claims?.P225?.[0]?.mainsnak?.datavalue?.value || '';
        scientificNamesCache.set(cacheKey, scientificName);
        return scientificName;
    } catch {
        scientificNamesCache.set(cacheKey, '');
        return '';
    }
}

export { findLocalAnimalsByWikidata, getWikidataLocalizedNames, getWikidataLabelsByTerm, getWikidataScientificName };

const localizedNamesCache = new Map();

async function getWikidataLocalizedNames(scientificName = '') {
    const scientific = String(scientificName || '').trim();
    if (!scientific) return {};
    const cacheKey = normalize(scientific);
    if (localizedNamesCache.has(cacheKey)) return localizedNamesCache.get(cacheKey);

    const emptyResult = {};
    try {
        const params = new URLSearchParams({
            action: 'wbsearchentities',
            search: scientific,
            language: 'en',
            uselang: 'en',
            type: 'item',
            limit: '10',
            format: 'json',
            origin: '*'
        });
        const response = await fetch(`${WIKIDATA_ENDPOINT}?${params}`);
        if (!response.ok) {
            localizedNamesCache.set(cacheKey, emptyResult);
            return emptyResult;
        }
        const results = (await response.json())?.search || [];
        const entities = await Promise.all(results.map(result =>
            fetch(`${ENTITY_ENDPOINT}${encodeURIComponent(result.id)}.json`)
                .then(entityResponse => entityResponse.ok ? entityResponse.json() : null)
                .catch(() => null)
        ));
        const entity = entities
            .flatMap(data => Object.values(data?.entities || {}))
            .find(candidate => getClaimValues(candidate, 'P225').some(value => normalize(value) === cacheKey))
            || entities.flatMap(data => Object.values(data?.entities || {}))[0];
        const names = Object.fromEntries(Object.entries(entity?.labels || {})
            .map(([language, label]) => [language, String(label?.value || '').trim()])
            .filter(([, label]) => label));
        localizedNamesCache.set(cacheKey, names);
        return names;
    } catch (error) {
        localizedNamesCache.set(cacheKey, emptyResult);
        return emptyResult;
    }
}


const termLabelsCache = new Map();

async function getWikidataLabelsByTerm(term = '') {
    const value = String(term || '').trim();
    if (!value) return {};
    const cacheKey = 'term:' + normalize(value);
    if (termLabelsCache.has(cacheKey)) return termLabelsCache.get(cacheKey);

    try {
        const params = new URLSearchParams({
            action: 'wbsearchentities',
            search: value,
            language: 'pt',
            uselang: 'pt',
            type: 'item',
            limit: '10',
            format: 'json',
            origin: '*'
        });
        const response = await fetch(WIKIDATA_ENDPOINT + '?' + params);
        const results = response.ok ? (await response.json())?.search || [] : [];
        const entities = await Promise.all(results.map(result =>
            fetch(ENTITY_ENDPOINT + encodeURIComponent(result.id) + '.json')
                .then(entityResponse => entityResponse.ok ? entityResponse.json() : null)
                .catch(() => null)
        ));
        const target = normalize(value);
        const entity = entities
            .flatMap(data => Object.values(data?.entities || {}))
            .find(candidate => {
                const labels = Object.values(candidate?.labels || {}).map(label => label?.value);
                const aliases = Object.values(candidate?.aliases || {}).flatMap(items => items.map(item => item?.value));
                return [...labels, ...aliases].some(label => normalize(label) === target);
            })
            || entities.flatMap(data => Object.values(data?.entities || {}))[0];
        const labels = Object.fromEntries(Object.entries(entity?.labels || {})
            .map(([language, label]) => [language, String(label?.value || '').trim()])
            .filter(([, label]) => label));
        termLabelsCache.set(cacheKey, labels);
        return labels;
    } catch {
        termLabelsCache.set(cacheKey, {});
        return {};
    }
}
