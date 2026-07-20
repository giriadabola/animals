// Campos estruturados do Wikidata preenchidos automaticamente no formulário.
(function initWikidataFieldsAutoFill() {
    const scientificInput = document.getElementById('nomeCientifico');
    const params = new URLSearchParams(window.location.search);
    if (!scientificInput || params.has('edit') || params.has('id') || params.has('animal')) return;

    const API = 'https://www.wikidata.org/w/api.php';
    const TIMEOUT_MS = 9000;
    let timer = null;
    let sequence = 0;
    let lastName = '';
    const autoFields = new Map();
    const autoRows = { general: new Set(), dimensions: new Set(), reproduction: new Set(), curiosities: new Set() };
    const text = value => String(value ?? '').trim();
    const normalize = value => text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    function fetchJson(url) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
        return fetch(url, { signal: controller.signal, cache: 'no-store' }).then(response => response.ok ? response.json() : null).finally(() => clearTimeout(timeout));
    }
    function claimStatements(entity, property) {
        return (entity?.claims?.[property] || []).filter(statement => statement?.mainsnak?.datavalue?.value !== undefined && statement.rank !== 'deprecated').sort((a, b) => (a.rank === 'preferred' ? -1 : 0) - (b.rank === 'preferred' ? -1 : 0));
    }
    function claimValues(entity, property) { return claimStatements(entity, property).map(statement => statement.mainsnak.datavalue.value); }
    function itemId(value) { return typeof value === 'string' && /^Q\d+$/.test(value) ? value : text(value?.id || '').match(/^Q\d+$/)?.[0] || ''; }
    function itemIds(entity, property) { return [...new Set(claimValues(entity, property).map(itemId).filter(Boolean))]; }
    function localizedValue(value, preferred = ['pt', 'en']) {
        if (!value || typeof value !== 'object') return text(value);
        if (value.text) return text(value.text);
        return preferred.map(language => text(value[language]?.value)).find(Boolean) || '';
    }
    function entityLabel(entity) { return localizedValue(entity?.labels, ['pt', 'en']) || localizedValue(entity?.labels, ['en', 'pt']); }
    function amount(value) { const number = Number(String(value ?? '').replace(',', '.').replace(/^\+/, '')); return Number.isFinite(number) ? number : null; }
    function quantity(statement) {
        const value = statement?.mainsnak?.datavalue?.value;
        if (!value || typeof value !== 'object') return null;
        const central = amount(value.amount);
        if (central === null) return null;
        const lower = amount(value.lowerBound);
        const upper = amount(value.upperBound);
        return { min: lower !== null && lower !== central ? lower : central, max: upper !== null && upper !== central ? upper : '', unitId: text(value.unit).match(/Q\d+$/)?.[0] || '' };
    }
    const UNIT = { Q11573: { kind: 'length', value: 1 }, Q174728: { kind: 'length', value: 0.01 }, Q174789: { kind: 'length', value: 0.001 }, Q828224: { kind: 'length', value: 1000 }, Q11570: { kind: 'mass', value: 1 }, Q41803: { kind: 'mass', value: 0.001 }, Q191118: { kind: 'mass', value: 1000 }, Q573: { kind: 'time', unit: 'dias' }, Q23387: { kind: 'time', unit: 'semanas' }, Q5151: { kind: 'time', unit: 'meses' }, Q577: { kind: 'time', unit: 'anos' }, Q182429: { kind: 'speed', value: 3.6 }, Q180154: { kind: 'speed', value: 1 }, Q128822: { kind: 'speed', value: 1.852 }, Q211256: { kind: 'speed', value: 1.609344 } };
    function convertNumber(value, unitId, target) {
        const number = amount(value); const source = UNIT[unitId];
        if (number === null) return '';
        if (target === 'length') return source?.kind === 'length' ? String(number * source.value * 100) : String(number);
        if (target === 'depth') return source?.kind === 'length' ? String(number * source.value) : String(number);
        if (target === 'mass') return source?.kind === 'mass' ? String(number * source.value) : String(number);
        if (target === 'speed') return source?.kind === 'speed' ? String(number * (source.value || 1)) : String(number);
        if (target === 'time') {
            if (source?.kind !== 'time') return String(number);
            if (source.unit === 'dias') return String(number / 365.25);
            if (source.unit === 'semanas') return String(number / 52.1775);
            if (source.unit === 'meses') return String(number / 12);
        }
        return String(number);
    }
    function formatNumber(value) { const number = amount(value); return number === null ? '' : String(Number(number.toFixed(4))); }
    function convertQuantity(statement, target) {
        const parsed = quantity(statement); if (!parsed) return null;
        return { min: formatNumber(convertNumber(parsed.min, parsed.unitId, target)), max: parsed.max === '' ? '' : formatNumber(convertNumber(parsed.max, parsed.unitId, target)) };
    }
    function timeDetail(statement) {
        const parsed = quantity(statement); if (!parsed) return '';
        const unit = UNIT[parsed.unitId]?.unit || 'dias'; const min = formatNumber(parsed.min); const max = parsed.max === '' ? '' : formatNumber(parsed.max);
        return `${min}${max ? `-${max}` : ''} ${unit}`;
    }
    async function getEntities(ids) {
        const unique = [...new Set(ids.filter(Boolean))]; if (!unique.length) return {};
        const query = new URLSearchParams({ action: 'wbgetentities', ids: unique.join('|'), props: 'labels|descriptions|claims', languages: 'pt|en', format: 'json', origin: '*' });
        const response = await fetchJson(`${API}?${query}`); return response?.entities || {};
    }
    async function getEntity(id) { const entities = await getEntities([id]); return entities[id] || null; }
    async function findTaxon(name) {
        const query = new URLSearchParams({ action: 'wbsearchentities', search: name, language: 'en', uselang: 'en', type: 'item', limit: '10', format: 'json', origin: '*' });
        const search = await fetchJson(`${API}?${query}`); const candidates = Array.isArray(search?.search) ? search.search : [];
        if (!candidates.length) return null;
        const entities = await getEntities(candidates.map(item => item.id)); const target = normalize(name);
        return Object.values(entities).find(entity => claimValues(entity, 'P225').some(value => normalize(value) === target)) || null;
    }
    async function collectReferencedEntities(entity) {
        const ids = ['P1843', 'P405', 'P1420', 'P2974', 'P1034', 'P2975', 'P9714', 'P141', 'P13318'].flatMap(property => itemIds(entity, property));
        return getEntities(ids);
    }
    function replaceRows(getter, setter, rows, owned, key) {
        if (typeof getter !== 'function' || typeof setter !== 'function') return;
        const current = getter() || []; setter(current.filter(item => !owned.has(key(item))).concat(rows), { useDefaults: false });
        owned.clear(); rows.forEach(item => owned.add(key(item)));
    }
    function setAutoField(id, value) {
        const field = document.getElementById(id); const next = text(value); if (!field || !next) return;
        if (autoFields.has(id) && field.value !== autoFields.get(id)) autoFields.delete(id);
        if (!field.value || autoFields.has(id)) { field.value = next; autoFields.set(id, next); field.dispatchEvent(new Event('input', { bubbles: true })); field.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    function setAutoRecordType(value) {
        const checkbox = document.getElementById('personalizarTipoRegisto');
        const select = document.getElementById('tipoRegisto');
        const next = text(value);
        if (!checkbox || !select || !next || next === 'Espécie' || ![...select.options].some(option => option.value === next)) return;
        if (autoFields.has('tipoRegisto') && (select.value !== autoFields.get('tipoRegisto') || !checkbox.checked)) autoFields.delete('tipoRegisto');
        if (checkbox.checked && !autoFields.has('tipoRegisto') && select.value !== next) return;
        checkbox.checked = true;
        select.value = next;
        autoFields.set('tipoRegisto', next);
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    function clearAutoData() {
        for (const [id, value] of autoFields) {
            const field = document.getElementById(id);
            if (!field || field.value !== value) continue;
            if (id === 'tipoRegisto') {
                field.value = 'Espécie';
                const checkbox = document.getElementById('personalizarTipoRegisto');
                if (checkbox) checkbox.checked = false;
                field.dispatchEvent(new Event('change', { bubbles: true }));
                continue;
            }
            field.value = '';
        }
        autoFields.clear();
        const generalKey = item => `${item.tipo}|${item.valorMin || item.valor || ''}|${item.valorMax || ''}|${item.unidade || ''}`;
        const dimensionKey = generalKey; const reproductionKey = item => `${item.tipo}|${item.detalhe || ''}`; const curiosityKey = item => `${item.tipo}|${item.valor || item.valorMin || ''}`;
        replaceRows(getGeneralVisualData, setGeneralVisualData, [], autoRows.general, generalKey); replaceRows(getDimensionData, setDimensionData, [], autoRows.dimensions, dimensionKey); replaceRows(getReproductionData, setReproductionData, [], autoRows.reproduction, reproductionKey);
        if (window.getCuriosidadesData && window.setCuriosidadesData) replaceRows(window.getCuriosidadesData, window.setCuriosidadesData, [], autoRows.curiosities, curiosityKey);
        window.setImportedDistributionCountries?.([]);
    }
    function rankField(rank) {
        const value = normalize(rank); const map = { kingdom: 'reino', reino: 'reino', phylum: 'filo', filo: 'filo', subphylum: 'subfilo', subfilo: 'subfilo', class: 'classe', classe: 'classe', subclass: 'subclasse', subclasse: 'subclasse', infraclass: 'infraclasse', infraclasse: 'infraclasse', magnorder: 'magnordem', magnordem: 'magnordem', superorder: 'superordem', superordem: 'superordem', order: 'ordem', ordem: 'ordem', suborder: 'subordem', subordem: 'subordem', infraorder: 'infraordem', infraordem: 'infraordem', parvorder: 'parvordem', parvordem: 'parvordem', family: 'familia', familia: 'familia', superfamily: 'superfamilia', superfamilia: 'superfamilia', subfamily: 'subfamilia', subfamilia: 'subfamilia', tribe: 'tribo', tribo: 'tribo', genus: 'genero', genero: 'genero', subgenus: 'subgenero', subgenero: 'subgenero' };
        return map[value] || '';
    }
    async function taxonomy(entity, entities) {
        const fields = {}; const visited = new Set(); let current = entity;
        for (let depth = 0; current && depth < 32; depth += 1) {
            const id = current.id || `current-${depth}`; if (visited.has(id)) break; visited.add(id);
            const rankId = itemIds(current, 'P105')[0]; const rankEntity = rankId ? entities[rankId] || await getEntity(rankId) : null; const rank = entityLabel(rankEntity) || rankId; const field = rankField(rank); const scientific = claimValues(current, 'P225')[0];
            if (field && scientific) fields[field] = scientific;
            const normalized = normalize(rank); if (normalized.includes('subspecies') || normalized.includes('subespecie')) fields.tipoRegisto = 'Subespécie'; else if (normalized === 'species' || normalized === 'especie') fields.tipoRegisto = 'Espécie'; else if (normalized.includes('breed') || normalized.includes('raca')) fields.tipoRegisto = 'Raça'; else if (normalized.includes('variety') || normalized.includes('variedade')) fields.tipoRegisto = 'Variedade'; else if (normalized.includes('hybrid') || normalized.includes('hibrido')) fields.tipoRegisto = 'Híbrido';
            const parentId = itemIds(current, 'P171')[0]; if (!parentId) break; current = entities[parentId] || await getEntity(parentId);
        }
        return fields;
    }
    function dimensionRows(entity) {
        const mappings = [['P2067', 'Peso', 'mass'], ['P2043', 'Comprimento total', 'length'], ['P2050', 'Envergadura', 'length'], ['P2048', 'Altura', 'length'], ['P2049', 'Largura do corpo', 'length']];
        return mappings.map(([property, tipo, target]) => { const value = convertQuantity(claimStatements(entity, property)[0], target); return value ? { tipo, valor: value.min, valorMin: value.min, valorMax: value.max, unidade: target === 'mass' ? 'kg' : 'cm', genero: 'Ambos', fase: 'Adulto' } : null; }).filter(Boolean);
    }
    function generalRows(entity, entities) {
        const rows = []; const life = convertQuantity(claimStatements(entity, 'P2250')[0], 'time'); const depth = convertQuantity(claimStatements(entity, 'P4511')[0], 'depth'); const speed = convertQuantity(claimStatements(entity, 'P2052')[0], 'speed');
        if (life) rows.push({ tipo: 'Expetativa média de vida', valorMin: life.min, valorMax: life.max, unidade: 'anos', genero: 'Ambos', fase: 'Adulto' });
        if (depth) rows.push({ tipo: 'Profundidade máxima', valorMin: depth.min, valorMax: depth.max, unidade: 'm', genero: 'Ambos', fase: 'Adulto' });
        if (speed) rows.push({ tipo: 'Velocidade máxima', valorMin: speed.min, valorMax: speed.max, unidade: 'km/h', genero: 'Ambos', fase: 'Adulto' });
        itemIds(entity, 'P2974').forEach(id => { const value = entityLabel(entities[id]); if (value) rows.push({ tipo: 'Habitats', valorMin: value, valor: value, unidade: '', genero: 'Ambos', fase: 'Adulto' }); }); return rows;
    }
    function reproductionRows(entity, entities) {
        const rows = []; const aliases = { oviparity: 'Ovíparo', viviparity: 'Vivíparo', ovoviviparity: 'Ovovivíparo', 'asexual reproduction': 'Assexuada', 'sexual reproduction': 'Sexuada' };
        itemIds(entity, 'P13318').map(id => entityLabel(entities[id])).filter(Boolean).forEach(value => { const mapped = aliases[normalize(value)] || value; rows.push({ tipo: mapped, detalhe: mapped, genero: 'Ambos', fase: 'Adulto' }); });
        const gestation = timeDetail(claimStatements(entity, 'P3063')[0]); if (gestation) rows.push({ tipo: 'Tempo de Gestação', detalhe: gestation, genero: 'Ambos', fase: 'Adulto' });
        const maturity = timeDetail(claimStatements(entity, 'P12432')[0]); if (maturity) rows.push({ tipo: 'Maturidade Sexual', detalhe: maturity, genero: 'Ambos', fase: 'Adulto' });
        const litter = convertQuantity(claimStatements(entity, 'P7725')[0], 'count'); if (litter) rows.push({ tipo: 'Número de Crias', detalhe: `${litter.min}${litter.max ? `-${litter.max}` : ''} crias`, genero: 'Ambos', fase: 'Adulto' });
        const incubation = timeDetail(claimStatements(entity, 'P7770')[0]); if (incubation) rows.push({ tipo: 'Tempo até à eclosão', detalhe: incubation, genero: 'Ambos', fase: 'Adulto' }); return rows;
    }
    async function apply(entity) {
        const referenced = await collectReferencedEntities(entity); const fields = await taxonomy(entity, referenced); const common = claimValues(entity, 'P1843').sort((a, b) => (a.language === 'pt' ? -1 : 0) - (b.language === 'pt' ? -1 : 0)).map(localizedValue).find(Boolean) || entityLabel(entity);
        setAutoField('nomeAnimal', common); const authorId = itemIds(entity, 'P405')[0]; if (authorId) setAutoField('autoridadeTaxonomica', entityLabel(referenced[authorId])); const image = claimValues(entity, 'P18')[0]; if (image) setAutoField('imagemUrl', `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(image).replace(/%2F/g, '/')}`);
        const description = localizedValue(entity.descriptions, ['pt', 'en']); if (description) setAutoField('infoGeral', description); const food = itemIds(entity, 'P1034').map(id => entityLabel(referenced[id])).filter(Boolean); if (food.length) setAutoField('infoAlimentacao', food.join(', ')); const hosts = itemIds(entity, 'P2975').map(id => entityLabel(referenced[id])).filter(Boolean); if (hosts.length) setAutoField('infoEcologia', `Hospedeiro: ${hosts.join(', ')}`);
        Object.entries(fields).forEach(([field, value]) => { if (field === 'tipoRegisto') setAutoRecordType(value); else setAutoField(field, value); });
        const generalKey = item => `${item.tipo}|${item.valorMin || item.valor || ''}|${item.valorMax || ''}|${item.unidade || ''}`; const reproductionKey = item => `${item.tipo}|${item.detalhe || ''}`;
        replaceRows(getGeneralVisualData, setGeneralVisualData, generalRows(entity, referenced), autoRows.general, generalKey); replaceRows(getDimensionData, setDimensionData, dimensionRows(entity), autoRows.dimensions, generalKey); replaceRows(getReproductionData, setReproductionData, reproductionRows(entity, referenced), autoRows.reproduction, reproductionKey);
        if (window.getCuriosidadesData && window.setCuriosidadesData) { const rows = itemIds(entity, 'P1420').map(id => entityLabel(referenced[id])).filter(Boolean).map(value => ({ tipo: 'Também conhecido como', valor: value, genero: 'Ambos', fase: 'Adulto' })); replaceRows(window.getCuriosidadesData, window.setCuriosidadesData, rows, autoRows.curiosities, item => `${item.tipo}|${item.valor || item.valorMin || ''}`); }
        const rangeIds = itemIds(entity, 'P9714'); const rangeEntities = await getEntities(rangeIds); const codes = rangeIds.flatMap(id => claimValues(rangeEntities[id], 'P297').map(text).filter(code => /^[A-Z]{2}$/.test(code))); window.setImportedDistributionCountries?.([...new Set(codes)]);
    }
    async function run() {
        const name = scientificInput.value.trim(); const currentSequence = ++sequence; if (name !== lastName) { clearAutoData(); lastName = name; } if (name.split(/\s+/).length < 2) return;
        try { const entity = await findTaxon(name); if (currentSequence !== sequence || scientificInput.value.trim() !== name) return; if (entity) await apply(entity); } catch (error) { if (currentSequence === sequence) console.warn('Wikidata indisponível:', error); }
    }
    function schedule() { clearTimeout(timer); timer = setTimeout(run, 700); }
    scientificInput.addEventListener('input', schedule); scientificInput.addEventListener('blur', schedule); window.formWikidataAutoFill = run;
})();
