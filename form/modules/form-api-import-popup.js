// Importação inicial automática a partir do nome científico.
(function initApiImportPopup() {
    const scientificInput = document.getElementById('nomeCientifico');
    const params = new URLSearchParams(window.location.search);
    if (!scientificInput || params.has('edit') || params.has('id') || params.has('animal')) return;

    const fieldLabels = {
        nomeAnimal: 'Nome comum', nomeCientifico: 'Nome científico', imagemUrl: 'URL da imagem',
        reino: 'Reino', filo: 'Filo', classe: 'Classe', ordem: 'Ordem', familia: 'Família',
        genero: 'Género', especies: 'Espécies', autoridadeTaxonomica: 'Autoridade taxonómica',
        infoGeral: 'Informação geral', infoAlimentacao: 'Alimentação', infoEcologia: 'Ecologia',
        infoDistribuicao: 'Distribuição', infoCuriosidades: 'Curiosidades',
        xenoCantoAudioId: 'C\u00f3digo de \u00e1udio Xeno-canto',
        iucnCategory: 'Estado de conserva\u00e7\u00e3o (IUCN)',
        iucnPopulation: 'Tamanho da Popula\u00e7\u00e3o (IUCN)', iucnDepth: 'Profundidade m\u00e1xima (IUCN)',
        iucnHabitat: 'Habitats (IUCN)', iucnRegion: 'Regi\u00e3o biogeogr\u00e1fica (IUCN)'
    };
    const excludedFields = new Set([
        'nomeAnimal', 'nomeCientifico', 'reino', 'filo', 'subfilo', 'classe', 'subclasse',
        'infraclasse', 'magnordem', 'superordem', 'ordem', 'subordem', 'infraordem', 'parvordem',
        'familia', 'superfamilia', 'subfamilia', 'tribo', 'genero', 'subgenero', 'especies', 'autoridadeTaxonomica'
    ]);
    const API_TIMEOUT_MS = 9000;
    let searchTimer = null;
    let searchSequence = 0;
    let currentRows = [];
    let popup = null;

    function addRow(rows, field, value, source, detail) {
        const text = String(value || '').trim();
        if (text && fieldLabels[field] && !excludedFields.has(field)) rows.push({ field, value: text, source, detail: detail || '', selected: true });
    }
    function escapeHtml(value) {
        return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
    function fetchJson(url, options) {
        const controller = new AbortController();
        const timeout = setTimeout(function () { controller.abort(); }, API_TIMEOUT_MS);
        return fetch(url, Object.assign({ signal: controller.signal, cache: 'no-store' }, options || {}))
            .then(function (response) { return response.ok ? response.json() : null; })
            .finally(function () { clearTimeout(timeout); });
    }
    function getRankValue(ancestors, rank) {
        const item = Array.isArray(ancestors) ? ancestors.find(function (ancestor) {
            return ancestor && ancestor.rank === rank && ancestor.name;
        }) : null;
        return item ? item.name : '';
    }
    function rowsFromGbif(data) {
        if (!data || !(data.key || data.usageKey) || !data.scientificName || data.matchType === 'NONE') return [];
        const rows = [];
        addRow(rows, 'nomeCientifico', data.scientificName || data.canonicalName, 'GBIF', 'correspondência: ' + (data.matchType || 'exacta'));
        addRow(rows, 'reino', data.kingdom, 'GBIF');
        addRow(rows, 'filo', data.phylum, 'GBIF');
        addRow(rows, 'classe', data.class, 'GBIF');
        addRow(rows, 'ordem', data.order, 'GBIF');
        addRow(rows, 'familia', data.family, 'GBIF');
        addRow(rows, 'genero', data.genus, 'GBIF');
        addRow(rows, 'especies', data.species || data.canonicalName, 'GBIF');
        addRow(rows, 'autoridadeTaxonomica', data.authorship, 'GBIF');
        return rows;
    }
    function rowsFromINaturalist(data, searchedName) {
        const results = data && Array.isArray(data.results) ? data.results : [];
        const taxon = results.find(function (item) {
            return item && item.name && item.name.toLowerCase() === searchedName.toLowerCase();
        });
        if (!taxon) return [];
        const rows = [];
        addRow(rows, 'nomeCientifico', taxon.name, 'iNaturalist', taxon.rank ? 'nível: ' + taxon.rank : '');
        addRow(rows, 'nomeAnimal', taxon.preferred_common_name || (taxon.default_name && taxon.default_name.name), 'iNaturalist');
        addRow(rows, 'imagemUrl', taxon.default_photo && (taxon.default_photo.medium_url || taxon.default_photo.url), 'iNaturalist');
        addRow(rows, 'reino', getRankValue(taxon.ancestors, 'kingdom'), 'iNaturalist');
        addRow(rows, 'filo', getRankValue(taxon.ancestors, 'phylum'), 'iNaturalist');
        addRow(rows, 'classe', getRankValue(taxon.ancestors, 'class'), 'iNaturalist');
        addRow(rows, 'ordem', getRankValue(taxon.ancestors, 'order'), 'iNaturalist');
        addRow(rows, 'familia', getRankValue(taxon.ancestors, 'family'), 'iNaturalist');
        addRow(rows, 'genero', getRankValue(taxon.ancestors, 'genus'), 'iNaturalist');
        addRow(rows, 'especies', taxon.name, 'iNaturalist');
        return rows;
    }

    function rowsFromWikimedia(data) {
        const rows = [];
        const pages = data && data.query && data.query.pages ? Object.values(data.query.pages) : [];
        pages.slice(0, 3).forEach(function (page) {
            const image = page.imageinfo && page.imageinfo[0];
            if (!image) return;
            addRow(rows, 'imagemUrl', image.thumburl || image.url, 'Wikimedia Commons', page.title || '');
        });
        return rows;
    }

    async function rowsFromWikidata(name) {
        const search = await fetchJson('https://www.wikidata.org/w/api.php?action=wbsearchentities&search=' + encodeURIComponent(name) + '&language=en&format=json&origin=*');
        const exact = (search && Array.isArray(search.search) ? search.search : []).find(function (item) {
            return item && ((item.match && item.match.text || '').toLowerCase() === name.toLowerCase()
                || (item.aliases || []).some(function (alias) { return String(alias).toLowerCase() === name.toLowerCase(); }));
        });
        if (!exact || !exact.id) return [];
        const entityResponse = await fetchJson('https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + exact.id + '&props=labels|descriptions|claims&languages=pt|en|fr|es&format=json&origin=*');
        const entity = entityResponse && entityResponse.entities ? entityResponse.entities[exact.id] : null;
        if (!entity) return [];
        const rows = [];
        const labels = entity.labels || {};
        const commonName = labels.pt?.value || labels.en?.value || '';
        const description = entity.descriptions?.pt?.value || entity.descriptions?.en?.value || '';
        addRow(rows, 'nomeAnimal', commonName, 'Wikidata', exact.id);
        if (description) addRow(rows, 'infoGeral', 'Wikidata (' + exact.id + '): ' + description, 'Wikidata');
        return rows;
    }

    function getInteractionNames(data, side) {
        const values = [];
        (Array.isArray(data) ? data : []).forEach(function (item) {
            const source = side === 'source' ? item.source_taxon_name : item.target_taxon_name;
            const fallback = side === 'source' ? item.source?.name : item.target?.name;
            const names = Array.isArray(source) ? source : [source || fallback];
            names.forEach(function (value) {
                const text = String(value || '').trim();
                if (text && !values.includes(text)) values.push(text);
            });
        });
        return values;
    }

    async function rowsFromGlobi(name) {
        const encoded = encodeURIComponent(name);
        const results = await Promise.allSettled([
            fetchJson('https://api.globalbioticinteractions.org/taxon/' + encoded + '/preysOn?type=json.v2&limit=30'),
            fetchJson('https://api.globalbioticinteractions.org/taxon/' + encoded + '/preyedUponBy?type=json.v2&limit=30')
        ]);
        const rows = [];
        const prey = results[0].status === 'fulfilled' ? getInteractionNames(results[0].value, 'target') : [];
        const predators = results[1].status === 'fulfilled' ? getInteractionNames(results[1].value, 'source') : [];
        if (prey.length) addRow(rows, 'infoAlimentacao', 'GloBI — presas/alimentos: ' + prey.slice(0, 20).join(', '), 'GloBI', prey.length + ' relação(ões)');
        if (predators.length) addRow(rows, 'infoEcologia', 'GloBI — predadores naturais: ' + predators.slice(0, 20).join(', '), 'GloBI', predators.length + ' relação(ões)');
        return rows;
    }

    function rowsFromObisTaxon(data) {
        const taxon = data && Array.isArray(data.results) ? data.results[0] : null;
        if (!taxon) return [];
        const rows = [];
        addRow(rows, 'nomeCientifico', taxon.scientificName, 'OBIS', taxon.taxonRank || '');
        addRow(rows, 'autoridadeTaxonomica', taxon.scientificNameAuthorship, 'OBIS');
        ['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'].forEach(function (rank) {
            const field = rank === 'class' ? 'classe' : rank === 'order' ? 'ordem' : rank === 'family' ? 'familia' : rank === 'genus' ? 'genero' : rank === 'species' ? 'especies' : rank;
            addRow(rows, field, taxon[rank], 'OBIS');
        });
        if (taxon.vernacularNames?.length) addRow(rows, 'nomeAnimal', taxon.vernacularNames[0], 'OBIS');
        return rows;
    }

    async function rowsFromObis(name) {
        const taxon = await fetchJson('https://api.obis.org/v3/taxon/' + encodeURIComponent(name));
        const rows = rowsFromObisTaxon(taxon);
        const record = taxon && Array.isArray(taxon.results) ? taxon.results[0] : null;
        const taxonId = record && (record.taxonID || record.acceptedNameUsageID);
        if (taxonId) {
            const occurrences = await fetchJson('https://api.obis.org/v3/occurrence?taxonid=' + encodeURIComponent(taxonId) + '&size=0');
            if (occurrences?.total) addRow(rows, 'infoDistribuicao', 'OBIS: ' + occurrences.total + ' ocorrência(s) marinha(s) registada(s).', 'OBIS');
        }
        return rows;
    }

    function rowsFromItis(data) {
        const doc = data && data.response && data.response.docs ? data.response.docs[0] : null;
        if (!doc) return [];
        const rows = [];
        addRow(rows, 'nomeCientifico', doc.nameWOInd || doc.nameWInd, 'ITIS', 'TSN ' + (doc.tsn || ''));
        addRow(rows, 'autoridadeTaxonomica', doc.taxonAuthor, 'ITIS');
        const hierarchy = Array.isArray(doc.hierarchySoFarWRanks) ? doc.hierarchySoFarWRanks[0] : '';
        const rankFields = { Kingdom: 'reino', Phylum: 'filo', Class: 'classe', Order: 'ordem', Family: 'familia', Genus: 'genero', Species: 'especies' };
        Object.keys(rankFields).forEach(function (rank) {
            const match = String(hierarchy || '').match(new RegExp('\\\\$' + rank + ':([^$]+)'));
            if (match) addRow(rows, rankFields[rank], match[1], 'ITIS');
        });
        const common = Array.isArray(doc.vernacular) ? doc.vernacular[0] : '';
        if (common) addRow(rows, 'nomeAnimal', String(common).split('$')[1] || '', 'ITIS');
        return rows;
    }

    function rowsFromCatalogueOfLife(data, name) {
        const records = data && Array.isArray(data.result) ? data.result : [];
        const record = records.find(function (item) {
            return item.usage?.name?.scientificName && item.usage.name.scientificName.toLowerCase() === name.toLowerCase();
        }) || records[0];
        if (!record) return [];
        const rows = [];
        const classification = Array.isArray(record.classification) ? record.classification : [];
        const rankFields = { kingdom: 'reino', phylum: 'filo', class: 'classe', order: 'ordem', family: 'familia', genus: 'genero', species: 'especies' };
        classification.forEach(function (item) {
            if (rankFields[item.rank]) addRow(rows, rankFields[item.rank], item.name, 'Catalogue of Life');
        });
        addRow(rows, 'nomeCientifico', record.usage?.name?.scientificName, 'Catalogue of Life');
        addRow(rows, 'autoridadeTaxonomica', record.usage?.name?.authorship, 'Catalogue of Life');
        addRow(rows, 'nomeAnimal', record.vernacularNames?.find(function (item) { return item.language === 'por' || item.language === 'eng'; })?.name, 'Catalogue of Life');
        return rows;
    }

    async function rowsFromOpenTree(name) {
        const response = await fetchJson('https://api.opentreeoflife.org/v3/tnrs/match_names', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names: [name] })
        });
        const match = response?.results?.[0]?.matches?.[0];
        if (!match) return [];
        return [{
            field: 'infoGeral',
            value: 'Open Tree of Life: OTT ' + (match.taxon?.ott_id || match.ott_id || 'disponível') + ' — nome correspondente: ' + (match.taxon?.name || name) + '.',
            source: 'Open Tree of Life',
            detail: 'árvore evolutiva',
            selected: true
        }];
    }

    async function rowsFromPaleobiology(name) {
        const response = await fetchJson('https://paleobiodb.org/data1.2/taxa/list.json?name=' + encodeURIComponent(name) + '&show=attr,app,ref');
        const record = response?.records?.[0];
        if (!record) return [];
        const details = ['PBDB — registo fóssil', record.tei && 'primeiro período: ' + record.tei, record.tli && 'último período: ' + record.tli, record.att && 'autoridade: ' + record.att, record.ref && 'referência: ' + record.ref].filter(Boolean).join('; ');
        return details ? [{ field: 'infoGeral', value: details, source: 'Paleobiology Database', detail: 'paleontologia', selected: true }] : [];
    }

    async function rowsFromEuropePmc(name) {
        const response = await fetchJson('https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=' + encodeURIComponent('"' + name + '"') + '&format=json&pageSize=3');
        const results = response?.resultList?.result || [];
        if (!results.length) return [];
        const titles = results.map(function (item) { return item.title; }).filter(Boolean);
        return [{ field: 'infoGeral', value: 'Europe PMC — ' + (response.hitCount || results.length) + ' publicação(ões). Exemplos: ' + titles.join(' | '), source: 'Europe PMC', detail: 'literatura científica', selected: true }];
    }

    async function rowsFromCrossref(name) {
        const response = await fetchJson('https://api.crossref.org/works?query.bibliographic=' + encodeURIComponent(name) + '&rows=3');
        const items = response?.message?.items || [];
        if (!items.length) return [];
        const titles = items.map(function (item) { return item.title?.[0]; }).filter(Boolean);
        return [{ field: 'infoGeral', value: 'Crossref — referências encontradas: ' + titles.join(' | '), source: 'Crossref', detail: 'DOI/publicações', selected: true }];
    }

    async function rowsFromDataCite(name) {
        const response = await fetchJson('https://api.datacite.org/dois?query=' + encodeURIComponent(name) + '&page[size]=3');
        const items = response?.data || [];
        if (!items.length) return [];
        const titles = items.map(function (item) { return item.attributes?.titles?.[0]?.title; }).filter(Boolean);
        return [{ field: 'infoGeral', value: 'DataCite — datasets/DOI encontrados: ' + titles.join(' | '), source: 'DataCite', detail: 'datasets científicos', selected: true }];
    }


    async function rowsFromNcbi(name) {
        const search = await fetchJson('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=taxonomy&term=' + encodeURIComponent(name) + '[SCIN]&retmode=json');
        const id = search?.esearchresult?.idlist?.[0];
        if (!id) return [];
        const summary = await fetchJson('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=taxonomy&id=' + encodeURIComponent(id) + '&retmode=json');
        const doc = summary?.result?.[id];
        if (!doc) return [];
        const detail = ['NCBI Taxonomy ID: ' + id, doc.rank && 'nível: ' + doc.rank, doc.lineage && 'linhagem: ' + doc.lineage].filter(Boolean).join('; ');
        const rows = [{ field: 'infoGeral', value: detail, source: 'NCBI E-utilities', detail: 'taxonomia/genética', selected: true }];
        
        return rows;
    }

    async function rowsFromIdigBio(name) {
        const query = encodeURIComponent(JSON.stringify({ scientificname: name }));
        const response = await fetchJson('https://search.idigbio.org/v2/search/records/?rq=' + query + '&limit=0');
        if (!response?.itemCount) return [];
        return [{ field: 'infoDistribuicao', value: 'iDigBio: ' + response.itemCount + ' espécime(s) de museu encontrados para esta espécie.', source: 'iDigBio', detail: 'colecções científicas', selected: true }];
    }

    async function rowsFromSpeciesPlus(name) {
        const proxyUrl = window.ANIMAL_API_CONFIG?.speciesPlusProxy;
        if (!proxyUrl) return [];
        const response = await fetchJson(proxyUrl + '?name=' + encodeURIComponent(name));
        const concept = response?.concept;
        if (!concept) return [];

        function asList(data, keys) {
            if (Array.isArray(data)) return data;
            for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
            if (Array.isArray(data?.data)) return data.data;
            return [];
        }
        function values(items, keys) {
            return items.map(function (item) {
                for (const key of keys) if (item?.[key] !== undefined && item?.[key] !== null && String(item[key]).trim()) return String(item[key]).trim();
                return '';
            }).filter(Boolean);
        }

        const rows = [];
        const cites = asList(response.cites, ['cites_listings', 'cites_legislation', 'listings', 'results']);
        const citesQuotas = asList(response.cites, ['cites_quotas', 'quotas']);
        const citesSuspensions = asList(response.cites, ['cites_suspensions', 'suspensions']);
        const distributions = asList(response.distributions, ['distributions', 'results']);
        const eu = asList(response.eu, ['eu_listings', 'eu_legislation', 'listings', 'results']);
        const euDecisions = asList(response.eu, ['eu_decisions', 'decisions']);
        const appendices = values(cites, ['appendix', 'appendix_name', 'cites_appendix']);
        const quotas = values(citesQuotas, ['quota', 'quantity', 'notes', 'description']);
        const suspensions = values(citesSuspensions, ['notes', 'description']);
        const countries = values(distributions, ['country_name', 'country', 'name', 'region']);
        const euListings = values(eu, ['annex', 'listing', 'description', 'opinion']).concat(values(euDecisions, ['annex', 'listing', 'description', 'opinion']));

        if (appendices.length || quotas.length) {
            addRow(rows, 'infoGeral', 'Species+/CITES — apêndices: ' + (appendices.join(', ') || 'sem informação') + (quotas.length ? '; quotas: ' + quotas.slice(0, 8).join(' | ') : '') + (suspensions.length ? '; suspensões: ' + suspensions.slice(0, 4).join(' | ') : ''), 'Species+', 'legislação CITES');
        }
        if (countries.length) addRow(rows, 'infoDistribuicao', 'Species+ — distribuição registada: ' + countries.slice(0, 30).join(', '), 'Species+', 'distribuição CITES');
        if (euListings.length) addRow(rows, 'infoGeral', 'Species+ — regulamentação UE: ' + euListings.slice(0, 8).join(' | '), 'Species+', 'legislação europeia');
        return rows;
    }
    async function rowsFromXenoCanto(name) {
        const proxyUrl = window.ANIMAL_API_CONFIG?.xenoCantoProxy;
        if (!proxyUrl) return [];
        const response = await fetchJson(proxyUrl + '?name=' + encodeURIComponent(name));
        const recording = response?.recording;
        const rawId = recording?.id || recording?.audio_id || recording?.cat_no;
        const id = String(rawId || '').replace(/\D/g, '');
        if (!id) return [];
        const types = Array.isArray(recording.type) ? recording.type.join(', ') : String(recording.type || response.preference || '').trim();
        const detail = (response.preference || 'Call/Song') + (types ? ' — ' + types : '');
        const rows = [];
        addRow(rows, 'xenoCantoAudioId', id, 'Xeno-canto', detail);
        return rows;
    }
    async function rowsFromIucn(name) {
        const proxyUrl = window.ANIMAL_API_CONFIG?.iucnProxy;
        if (!proxyUrl) return [];
        const response = await fetchJson(proxyUrl + '?name=' + encodeURIComponent(name));
        const summary = response?.summary;
        const full = response?.assessment || {};
        if (!summary) return [];
        function textOf(item) {
            return String(item?.description?.pt || item?.description?.en || item?.name || item?.label || item?.text || '').trim();
        }
        function unique(values) {
            return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
        }

        const rows = [];
        const structured = window.formIucnMapping;
        if (structured) {
            const generalRows = structured.generalRows(full);
            const population = generalRows.find(item => item.tipo === 'Tamanho da População');
            const depth = generalRows.find(item => item.tipo === 'Profundidade máxima');
            if (population) addRow(rows, 'iucnPopulation', population.valorMax || population.valorMin, 'IUCN Red List', 'Informação Geral → Tamanho da População');
            if (depth) addRow(rows, 'iucnDepth', depth.valorMin || depth.valorMax, 'IUCN Red List', 'Informação Geral → Profundidade máxima');
            generalRows.filter(item => item.tipo === 'Habitats').forEach(item => addRow(rows, 'iucnHabitat', item.valorMin || item.valor, 'IUCN Red List', 'Informação Geral → Habitats'));
            structured.realmLabels(full).forEach(item => addRow(rows, 'iucnRegion', item, 'IUCN Red List', 'Distribuição → Regiões Biogeográficas'));
        }
        const category = summary.red_list_category_code || summary.category || '';
        const categoryLabel = summary.red_list_category?.name || summary.red_list_category?.description?.en || category;
        if (category) addRow(rows, 'iucnCategory', category, 'IUCN Red List', categoryLabel);
        const trend = textOf(full.population_trend);
        const general = [
            'IUCN Red List — categoria: ' + (categoryLabel || category),
            summary.criteria && 'critérios: ' + summary.criteria,
            (summary.year_published || summary.assessment_date) && 'avaliação: ' + (summary.year_published || summary.assessment_date),
            trend && 'tendência populacional: ' + trend,
            summary.assessment_id && 'assessment ID: ' + summary.assessment_id,
            summary.url && 'fonte: ' + summary.url
        ].filter(Boolean).join('; ');
        if (general) addRow(rows, 'infoGeral', general, 'IUCN Red List', 'avaliação de conservação');
        const habitats = unique((Array.isArray(full.habitats) ? full.habitats : []).map(textOf));
        const threats = unique((Array.isArray(full.threats) ? full.threats : []).map(textOf));
        const actions = unique((Array.isArray(full.conservation_actions) ? full.conservation_actions : []).map(textOf));
        const ecology = [
            habitats.length && 'habitats: ' + habitats.slice(0, 20).join(', '),
            threats.length && 'ameaças: ' + threats.slice(0, 20).join(', '),
            actions.length && 'conservação: ' + actions.slice(0, 20).join(', ')
        ].filter(Boolean).join('; ');
        if (ecology) addRow(rows, 'infoEcologia', 'IUCN Red List — ' + ecology, 'IUCN Red List', 'habitat, ameaças e conservação');
        const locations = unique((Array.isArray(full.locations) ? full.locations : []).map(textOf));
        if (locations.length) addRow(rows, 'infoDistribuicao', 'IUCN Red List — países/regiões: ' + locations.slice(0, 50).join(', '), 'IUCN Red List', 'distribuição');
        return rows;
    }
    async function rowsFromEbird(name) {
        const proxyUrl = window.ANIMAL_API_CONFIG?.ebirdProxy;
        if (!proxyUrl) return [];
        const response = await fetchJson(proxyUrl + '?name=' + encodeURIComponent(name));
        const species = response?.species;
        if (!species?.speciesCode) return [];
        const recent = Array.isArray(response.recent) ? response.recent : [];
        const notable = Array.isArray(response.notable) ? response.notable : [];
        if (!recent.length && !notable.length) return [];
        const observations = recent.concat(notable);
        const dates = observations.map(item => String(item.obsDt || '').trim()).filter(Boolean).sort().reverse();
        const counts = observations.map(item => Number(item.howMany)).filter(Number.isFinite);
        const locations = [...new Set(observations.map(item => item.locName).filter(Boolean))];
        const rows = [];
        const summary = [
            'eBird — código: ' + species.speciesCode,
            'registos recentes: ' + recent.length,
            dates.length && 'última observação: ' + dates[0],
            counts.length && 'maior contagem: ' + Math.max(...counts),
            notable.length && 'observações notáveis: ' + notable.length
        ].filter(Boolean).join('; ');
        if (summary) addRow(rows, 'infoGeral', summary, 'eBird', 'estatísticas de observação');
        if (locations.length) addRow(rows, 'infoDistribuicao', 'eBird — locais registados: ' + locations.slice(0, 30).join(', '), 'eBird', 'locais de observação');
        return rows;
    }
    async function rowsFromBhl(name) {
        const proxyUrl = window.ANIMAL_API_CONFIG?.bhlProxy;
        if (!proxyUrl) return [];
        const response = await fetchJson(proxyUrl + '?name=' + encodeURIComponent(name));
        const stats = response?.summary;
        if (!response?.found || !stats?.titleCount) return [];
        const rows = [];
        const general = [
            'Biodiversity Heritage Library — ' + stats.titleCount + ' título(s), ' + stats.itemCount + ' volume(s) e ' + stats.pageCount + ' página(s)',
            (stats.earliestYear && stats.latestYear) && 'publicações entre ' + stats.earliestYear + ' e ' + stats.latestYear,
            stats.ocrPageCount && 'páginas com OCR: ' + stats.ocrPageCount,
            stats.illustrationCount && 'ilustrações: ' + stats.illustrationCount,
            stats.mapCount && 'mapas: ' + stats.mapCount,
            stats.languages?.length && 'idiomas: ' + stats.languages.join(', ')
        ].filter(Boolean).join('; ');
        if (general) addRow(rows, 'infoGeral', general, 'Biodiversity Heritage Library', 'estatísticas bibliográficas');
        const references = Array.isArray(response.references) ? response.references : [];
        const referencesText = references.map(reference => [
            reference.title,
            reference.publicationDate,
            reference.publisher,
            reference.url
        ].filter(Boolean).join(' — ')).join(' | ');
        if (referencesText) addRow(rows, 'infoCuriosidades', 'BHL — referências históricas: ' + referencesText, 'Biodiversity Heritage Library', 'livros e publicações');
        return rows;
    }    async function searchSources(name) {
        const encodedName = encodeURIComponent(name);
        const results = await Promise.allSettled([
            fetchJson('https://api.gbif.org/v1/species/match?name=' + encodedName + '&verbose=true'),
            fetchJson('https://api.inaturalist.org/v1/taxa?q=' + encodedName + '&per_page=5'),
            fetchJson('https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodedName + '&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*'),
            rowsFromWikidata(name),
            rowsFromGlobi(name),
            rowsFromObis(name),
            fetchJson('https://services.itis.gov/?q=nameWOInd:%22' + encodedName + '%22&wt=json&rows=3'),
            fetchJson('https://api.checklistbank.org/dataset/3LR/nameusage/search?q=' + encodedName + '&limit=5'),
            rowsFromOpenTree(name),
            rowsFromPaleobiology(name),
            rowsFromEuropePmc(name),
            rowsFromCrossref(name),
            rowsFromDataCite(name),
            rowsFromNcbi(name),
            rowsFromIdigBio(name),
            rowsFromSpeciesPlus(name),
            rowsFromXenoCanto(name),
            rowsFromIucn(name),
            rowsFromEbird(name),
            rowsFromBhl(name)
        ]);
        let rows = [];
        rows = rows.concat(results[0].status === 'fulfilled' ? rowsFromGbif(results[0].value) : []);
        rows = rows.concat(results[1].status === 'fulfilled' ? rowsFromINaturalist(results[1].value, name) : []);
        rows = rows.concat(results[2].status === 'fulfilled' ? rowsFromWikimedia(results[2].value) : []);
        rows = rows.concat(results[3].status === 'fulfilled' ? results[3].value : []);
        rows = rows.concat(results[4].status === 'fulfilled' ? results[4].value : []);
        rows = rows.concat(results[5].status === 'fulfilled' ? results[5].value : []);
        rows = rows.concat(results[6].status === 'fulfilled' ? rowsFromItis(results[6].value) : []);
        rows = rows.concat(results[7].status === 'fulfilled' ? rowsFromCatalogueOfLife(results[7].value, name) : []);
        rows = rows.concat(results[8].status === 'fulfilled' ? results[8].value : []);
        rows = rows.concat(results[9].status === 'fulfilled' ? results[9].value : []);
        rows = rows.concat(results[10].status === 'fulfilled' ? results[10].value : []);
        rows = rows.concat(results[11].status === 'fulfilled' ? results[11].value : []);
        rows = rows.concat(results[12].status === 'fulfilled' ? results[12].value : []);
        rows = rows.concat(results[13].status === 'fulfilled' ? results[13].value : []);
        rows = rows.concat(results[14].status === 'fulfilled' ? results[14].value : []);
        rows = rows.concat(results[15].status === 'fulfilled' ? results[15].value : []);
        rows = rows.concat(results[16].status === 'fulfilled' ? results[16].value : []);
        rows = rows.concat(results[17].status === 'fulfilled' ? results[17].value : []);
        rows = rows.concat(results[18].status === 'fulfilled' ? results[18].value : []);
        rows = rows.concat(results[19].status === 'fulfilled' ? results[19].value : []);
        return rows;
    }
    function markConflicts(rows) {
        const counts = rows.filter(function (row) { return !row.removed; }).reduce(function (map, row) {
            map.set(row.field, (map.get(row.field) || 0) + 1);
            return map;
        }, new Map());
        return rows.map(function (row) { return Object.assign({}, row, { conflict: counts.get(row.field) > 1 }); });
    }
    function closePopup() {
        if (popup) popup.remove();
        popup = null;
        currentRows = [];
    }
    function applyRow(row) {
        const structuredGeneralFields = { iucnPopulation: 'Tamanho da População', iucnDepth: 'Profundidade máxima', iucnHabitat: 'Habitats' };
        if (structuredGeneralFields[row.field]) {
            if (typeof getGeneralVisualData !== 'function' || typeof setGeneralVisualData !== 'function') return;
            const type = structuredGeneralFields[row.field];
            const value = String(row.value || '').trim();
            if (!value) return;
            const current = getGeneralVisualData();
            const remaining = type === 'Habitats' ? current : current.filter(item => item.tipo !== type);
            if (type === 'Habitats' && remaining.some(item => item.tipo === type && String(item.valorMin || item.valor || '').trim() === value)) return;
            remaining.push({ tipo: type, valorMin: value, valor: value, valorMax: '', unidade: type === 'Profundidade máxima' ? 'm' : (type === 'Tamanho da População' ? 'indivíduos' : ''), genero: 'Ambos', fase: 'Adulto' });
            setGeneralVisualData(remaining, { useDefaults: false });
            return;
        }
        if (row.field === 'iucnRegion') {
            const getRegions = window.getDistributionRegionsData;
            const setRegions = window.setDistributionRegionsData;
            if (typeof getRegions !== 'function' || typeof setRegions !== 'function') return;
            const value = String(row.value || '').trim();
            if (!value) return;
            const current = getRegions();
            if (current.some(item => item.tipo === 'Regiões Biogeográficas' && item.valor === value)) return;
            setRegions(current.concat({ tipo: 'Regiões Biogeográficas', valor: value }));
            return;
        }

        if (row.field === 'iucnCategory') {
            const current = typeof getCuriosidadesData === 'function' ? getCuriosidadesData() : [];
            const remaining = current.filter(item => item.tipo !== 'Estado de Conservação');
            remaining.push({ tipo: 'Estado de Conservação', valor: row.value, genero: 'Ambos', fase: 'Adulto' });
            if (typeof setCuriosidadesData === 'function') {
                setCuriosidadesData(remaining, { useDefaults: false });
            } else {
                const fallback = document.getElementById('infoCuriosidades');
                if (fallback) fallback.value = [fallback.value, 'Estado de Conservação (IUCN): ' + row.value].filter(Boolean).join('\n');
            }
            return;
        }
        const field = document.getElementById(row.field);
        if (!field || !row.value) return;
        field.value = row.value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
    }
    function renderPopup(rows, searchedName) {
        closePopup();
        currentRows = markConflicts(rows);
        popup = document.createElement('div');
        popup.className = 'api-import-overlay';
        popup.innerHTML = '<section class="api-import-modal" role="dialog" aria-modal="true" aria-labelledby="apiImportTitle">' +
            '<div class="api-import-heading"><div><span class="api-import-kicker">Dados encontrados</span><h2 id="apiImportTitle">Importar dados de ' + escapeHtml(searchedName) + '</h2></div><button type="button" class="api-import-close" aria-label="Fechar">&times;</button></div>' +
            '<p class="api-import-description">Selecciona as linhas que queres importar. Linhas vermelhas têm o mesmo campo vindo de fontes diferentes; elimina uma delas antes de confirmar.</p>' +
            '<div class="api-import-list" aria-live="polite"></div><p class="api-import-status" role="status"></p>' +
            '<div class="api-import-actions"><button type="button" class="api-import-cancel">Cancelar</button><button type="button" class="api-import-confirm">Importar seleccionados</button></div></section>';
        document.body.appendChild(popup);
        const list = popup.querySelector('.api-import-list');
        const status = popup.querySelector('.api-import-status');
        function renderRows() {
            const visibleRows = currentRows.filter(function (row) { return !row.removed; });
            list.innerHTML = visibleRows.length ? visibleRows.map(function (row) {
                const index = currentRows.indexOf(row);
                return '<div class="api-import-row' + (row.conflict ? ' is-conflict' : '') + '" data-row-index="' + index + '">' +
                    '<label class="api-import-check"><input type="checkbox" ' + (row.selected ? 'checked' : '') + '><span></span></label>' +
                    '<div class="api-import-field"><strong>' + escapeHtml(fieldLabels[row.field]) + '</strong><small>' + escapeHtml(row.field) + '</small></div>' +
                    '<div class="api-import-value" title="' + escapeHtml(row.value) + '">' + escapeHtml(row.value) + '</div>' +
                    '<div class="api-import-source">' + escapeHtml(row.source) + (row.detail ? '<small>' + escapeHtml(row.detail) + '</small>' : '') + '</div>' +
                    '<button type="button" class="api-import-remove" aria-label="Eliminar linha">Eliminar</button></div>';
            }).join('') : '<p class="api-import-empty">Não há linhas para importar.</p>';
            const hasConflicts = visibleRows.some(function (row) { return row.conflict; });
            status.textContent = hasConflicts ? 'Existem campos repetidos. Elimina uma das linhas vermelhas para continuar.' : visibleRows.length + ' campo(s) encontrado(s).';
            status.classList.toggle('has-conflicts', hasConflicts);
        }
        list.addEventListener('change', function (event) {
            const rowElement = event.target.closest('[data-row-index]');
            if (rowElement && event.target.matches('input[type="checkbox"]')) currentRows[Number(rowElement.dataset.rowIndex)].selected = event.target.checked;
        });
        list.addEventListener('click', function (event) {
            const removeButton = event.target.closest('.api-import-remove');
            if (!removeButton) return;
            const rowElement = removeButton.closest('[data-row-index]');
            currentRows[Number(rowElement.dataset.rowIndex)].removed = true;
            renderRows();
        });
        popup.querySelector('.api-import-close').addEventListener('click', closePopup);
        popup.querySelector('.api-import-cancel').addEventListener('click', closePopup);
        popup.addEventListener('click', function (event) { if (event.target === popup) closePopup(); });
        popup.querySelector('.api-import-confirm').addEventListener('click', function () {
            const rowsToImport = currentRows.filter(function (row) { return row.selected && !row.removed; });
            if (rowsToImport.some(function (row) { return row.conflict; })) {
                status.textContent = 'Elimina uma das linhas vermelhas antes de importar.';
                status.classList.add('has-conflicts');
                return;
            }
            rowsToImport.forEach(applyRow);
            closePopup();
        });
        renderRows();
    }
    async function runSearch() {
        const name = scientificInput.value.trim();
        const sequence = ++searchSequence;
        closePopup();
        if (name.split(/\s+/).length < 2) return;
        try {
            const rows = await searchSources(name);
            if (sequence !== searchSequence || scientificInput.value.trim() !== name || !rows.length) return;
            renderPopup(rows, name);
        } catch (error) {
            if (sequence === searchSequence) console.warn('Importação automática indisponível:', error);
        }
    }
    scientificInput.addEventListener('input', function () {
        clearTimeout(searchTimer);
        closePopup();
        searchTimer = setTimeout(runSearch, 800);
    });
    scientificInput.addEventListener('blur', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(runSearch, 120);
    });
    window.formApiImportLookup = runSearch;
})();
