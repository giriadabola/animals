// Modelo visual de ecologia
        function normalizeEcologyType(type = '') {
            const normalized = normalizeSearchText(type);
            if (normalized.includes('funcao ecologica')) return 'Função Ecológica';
            if (normalized.includes('predador')) return 'Predadores naturais';
            if (normalized.includes('presa')) return 'Presas';
            if (normalized.includes('competidor')) return 'Competidores';
            if (normalized.includes('ameaca') || normalized.includes('ameaça')) return 'Ameaças naturais';
            if (normalized.includes('simbiot')) return 'Relações Simbióticas';
            if (normalized.includes('importancia economica') || normalized.includes('importância económica')) return 'Importância económica para os humanos';
            return type || '';
        }

        function fillEcologyTypeSelect(select, selectedValue = '') {
            const selected = normalizeEcologyType(selectedValue);
            const hasSelected = selected && ecologyModelOptions.includes(selected);
            select.innerHTML = '<option value="">Escolhe um modelo</option>' +
                ecologyModelOptions.map(option => `<option value="${option}">${option}</option>`).join('') +
                (selected && !hasSelected ? `<option value="${selected}">${selected}</option>` : '');
            select.value = selected;
        }

        function getEcologicalFunctionOptions() {
            return [...getGeneralVisualSelectOptions('Função ecológica')].sort((a, b) => a.localeCompare(b));
        }

        function normalizeScientificName(value = '') {
            return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
        }

        function findAnimalByScientificName(nomeCientifico = '') {
            const normalized = normalizeScientificName(nomeCientifico);
            if (!normalized) return null;
            return allAnimals.find(animal => normalizeScientificName(animal.nomeCientifico || '') === normalized) || null;
        }

        function findAnimalByRef(ref) {
            const id = typeof ref === 'string' ? ref : (ref?.id || ref?.animalId || '');
            const byId = id ? allAnimals.find(animal => animal.id === id) : null;
            if (byId) return byId;
            const scientificName = typeof ref === 'string' ? ref : (ref?.nomeCientifico || '');
            return findAnimalByScientificName(scientificName);
        }

        function getEcologyRefKey(ref = {}) {
            if (ref?.id || ref?.animalId) return `id:${ref.id || ref.animalId}`;
            const scientificName = normalizeScientificName(ref?.nomeCientifico || (typeof ref === 'string' ? ref : ''));
            return scientificName ? `scientific:${scientificName}` : '';
        }

        function getAnimalDisplayName(ref) {
            const animal = findAnimalByRef(ref);
            if (animal) return `${animal.nome || animal.id}${animal.nomeCientifico ? ` (${animal.nomeCientifico})` : ''}`;
            if (typeof ref === 'string') return ref;
            if (ref?.nome || ref?.label || ref?.id) return `${ref.nome || ref.label || ref.id}${ref?.nomeCientifico ? ` (${ref.nomeCientifico})` : ''}`;
            return ref?.nomeCientifico || 'Animal manual';
        }

        function animalToEcologyRef(animalOrRef) {
            const animal = typeof animalOrRef === 'string' ? findAnimalByRef(animalOrRef) : (findAnimalByRef(animalOrRef) || animalOrRef);
            if (!animal) return null;
            const id = animal.id || animal.animalId || '';
            const nomeCientifico = String(animal.nomeCientifico || (typeof animalOrRef === 'string' ? animalOrRef : '')).trim();
            if (id) {
                return {
                    id,
                    nome: animal.nome || animal.label || id,
                    nomeCientifico
                };
            }
            return nomeCientifico ? { nomeCientifico } : null;
        }

        function normalizeEcologyRefs(items = []) {
            if (!Array.isArray(items)) return [];
            const seen = new Set();
            return items.map(animalToEcologyRef).filter(ref => {
                if (!ref || (!ref.id && !ref.nomeCientifico)) return false;
                const key = getEcologyRefKey(ref);
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        }

        function getEcologySelectedRefs(hiddenInput) {
            try {
                return normalizeEcologyRefs(JSON.parse(hiddenInput.value || '[]'));
            } catch (_) {
                return [];
            }
        }

        function setEcologySelectedRefs(hiddenInput, refs) {
            hiddenInput.value = JSON.stringify(normalizeEcologyRefs(refs));
        }

        function renderEcologyTags(tagsContainer, hiddenInput, onChange = updateEcologyPreview) {
            const refs = getEcologySelectedRefs(hiddenInput);
            tagsContainer.innerHTML = refs.map(ref => {
                const key = encodeURIComponent(getEcologyRefKey(ref));
                const label = getAnimalDisplayName(ref);
                return `
                    <span class="ecology-tag" data-key="${key}">
                        <span>${label}</span>
                        <button type="button" aria-label="Remover ${label}">&times;</button>
                    </span>
                `;
            }).join('');
            tagsContainer.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', () => {
                    const tag = button.closest('.ecology-tag');
                    const keyToRemove = decodeURIComponent(tag.dataset.key || '');
                    const nextRefs = getEcologySelectedRefs(hiddenInput).filter(ref => getEcologyRefKey(ref) !== keyToRemove);
                    setEcologySelectedRefs(hiddenInput, nextRefs);
                    renderEcologyTags(tagsContainer, hiddenInput, onChange);
                    onChange();
                });
            });
        }

        function addEcologyRef(hiddenInput, tagsContainer, input, resultsContainer, ref) {
            const refs = getEcologySelectedRefs(hiddenInput);
            refs.push(ref);
            setEcologySelectedRefs(hiddenInput, refs);
            renderEcologyTags(tagsContainer, hiddenInput);
            input.value = '';
            resultsContainer.classList.remove('open');
            resultsContainer.innerHTML = '';
            updateEcologyPreview();
        }

        function renderEcologySearchResults(input, resultsContainer, hiddenInput, tagsContainer) {
            const rawQuery = input.value.trim();
            const query = normalizeSearchText(rawQuery);
            if (!query) {
                resultsContainer.classList.remove('open');
                resultsContainer.innerHTML = '';
                return;
            }
            const selectedKeys = new Set(getEcologySelectedRefs(hiddenInput).map(getEcologyRefKey));
            const matches = allAnimals
                .filter(animal => !selectedKeys.has(getEcologyRefKey(animal)))
                .filter(animal => normalizeSearchText(`${animal.nome || ''} ${animal.nomeCientifico || ''}`).includes(query))
                .slice(0, 8);
            const manualAlreadySelected = selectedKeys.has(`scientific:${normalizeScientificName(rawQuery)}`) || selectedKeys.has(`id:${findAnimalByScientificName(rawQuery)?.id || ''}`);
            const exactScientificExists = Boolean(findAnimalByScientificName(rawQuery));
            const showManualOption = rawQuery && !manualAlreadySelected && !exactScientificExists;

            if (!matches.length && !showManualOption) {
                resultsContainer.innerHTML = '<div class="ecology-search-result" style="cursor: default; opacity: 0.75;">Sem resultados</div>';
                resultsContainer.classList.add('open');
                return;
            }

            resultsContainer.innerHTML = matches.map(animal => `
                <button type="button" class="ecology-search-result" data-id="${animal.id}">
                    <strong>${animal.nome || animal.id}</strong>
                    <small>${animal.nomeCientifico || ''}</small>
                </button>
            `).join('') + (showManualOption ? `
                <button type="button" class="ecology-search-result ecology-search-result-manual" data-scientific="${rawQuery.replace(/"/g, '&quot;')}">
                    <strong>Adicionar Manual (científico)</strong>
                    <small>${rawQuery}</small>
                </button>
            ` : '');
            resultsContainer.classList.add('open');
            resultsContainer.querySelectorAll('button.ecology-search-result[data-id]').forEach(button => {
                button.addEventListener('click', () => {
                    const animal = allAnimals.find(item => item.id === button.dataset.id);
                    if (!animal) return;
                    addEcologyRef(hiddenInput, tagsContainer, input, resultsContainer, animalToEcologyRef(animal));
                });
            });
            resultsContainer.querySelectorAll('button.ecology-search-result-manual').forEach(button => {
                button.addEventListener('click', () => {
                    const nomeCientifico = button.dataset.scientific || rawQuery;
                    addEcologyRef(hiddenInput, tagsContainer, input, resultsContainer, { nomeCientifico });
                });
            });
        }

        function createEcologyAnimalSelector(initialRefs = [], extraText = '') {
            const controls = document.createElement('div');
            controls.className = 'ecology-detail-controls';

            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.className = 'ecology-selected-animals';
            setEcologySelectedRefs(hiddenInput, initialRefs);

            const searchWrap = document.createElement('div');
            searchWrap.className = 'ecology-animal-search-wrap';
            const searchInput = document.createElement('input');
            searchInput.type = 'search';
            searchInput.className = 'ecology-animal-search';
            searchInput.placeholder = 'Pesquisar animal por nome comum ou científico...';
            searchInput.autocomplete = 'off';
            const results = document.createElement('div');
            results.className = 'ecology-search-results';
            searchWrap.append(searchInput, results);

            const tags = document.createElement('div');
            tags.className = 'ecology-selected-tags';
            renderEcologyTags(tags, hiddenInput);

            searchInput.addEventListener('input', () => renderEcologySearchResults(searchInput, results, hiddenInput, tags));
            searchInput.addEventListener('focus', () => renderEcologySearchResults(searchInput, results, hiddenInput, tags));
            document.addEventListener('click', event => {
                if (!controls.contains(event.target)) results.classList.remove('open');
            });

            controls.append(hiddenInput, searchWrap, tags);
            if (extraText !== null) {
                const textInput = document.createElement('input');
                textInput.type = 'text';
                textInput.className = 'ecology-free-text';
                textInput.placeholder = 'Texto livre — ex: seca, incêndios, parasitas, doenças...';
                textInput.value = extraText || '';
                textInput.addEventListener('input', updateEcologyPreview);
                controls.append(textInput);
            }
            return controls;
        }

        function createEcologyFunctionSelector(value = '') {
            const controls = document.createElement('div');
            controls.className = 'ecology-detail-controls';
            const select = document.createElement('select');
            select.className = 'ecology-function-value';
            const options = getEcologicalFunctionOptions();
            const hasSelected = value && options.includes(value);
            select.innerHTML = '<option value="">Escolhe a função ecológica</option>' +
                options.map(option => `<option value="${option}">${option}</option>`).join('') +
                (value && !hasSelected ? `<option value="${value}">${value}</option>` : '');
            select.value = value || '';
            select.addEventListener('change', updateEcologyPreview);
            controls.append(select);
            return controls;
        }

        function createEcologyEconomicImportanceSelector(value = '') {
            const controls = document.createElement('div');
            controls.className = 'ecology-detail-controls';
            const select = document.createElement('select');
            select.className = 'ecology-economic-importance-value';
            const options = ['Negativa', 'Positiva', 'Neutra'];
            const hasSelected = value && options.includes(value);
            select.innerHTML = '<option value="">Escolhe a importância económica</option>' +
                options.map(option => `<option value="${option}">${option}</option>`).join('') +
                (value && !hasSelected ? `<option value="${value}">${value}</option>` : '');
            select.value = value || '';
            select.addEventListener('change', updateEcologyPreview);
            controls.append(select);
            return controls;
        }

        const ECOLOGY_ADVANCED_OPTIONS = {
            'Tipo de hospedeiro': ['Hospedeiro definitivo','Hospedeiro intermediário','Hospedeiro paraténico','Hospedeiro reservatório','Hospedeiro acidental','Vetor'],
            'Localização no hospedeiro': ['Sistema digestivo','Intestino delgado','Sangue','Músculo','Cérebro','Órgãos internos','Rim','Pele','Brânquias','Cavidade corporal'],
            'Tipo de parasita': ['Endoparasita','Ectoparasita','Parasita obrigatório','Parasita facultativo','Cleptoparasita','Parasita social']
        };
        function createEcologyAdvancedSelector(type, value = '') {
            const controls=document.createElement('div'); controls.className='ecology-detail-controls';
            const select=document.createElement('select'); select.className='ecology-advanced-value';
            const options=ECOLOGY_ADVANCED_OPTIONS[type]||[];
            select.innerHTML='<option value="">Escolhe um valor</option>'+options.map(v=>`<option value="${v}">${v}</option>`).join('');
            select.value=value||''; select.addEventListener('change',updateEcologyPreview); controls.append(select); return controls;
        }

        function createEcologyRow(type = '', data = {}) {
            const row = document.createElement('div');
            row.className = 'ecology-row';

            const typeSelect = document.createElement('select');
            typeSelect.className = 'ecology-type';
            fillEcologyTypeSelect(typeSelect, type || data.tipo || '');

            const genderBtn = createModelGenderButton(data.genero || data.gender || GENDER_BOTH, updateEcologyPreview, 'ecology-gender-toggle');
            const faseBtn = createModelFaseButton(data.fase || 'Adulto', updateEcologyPreview, 'ecology-fase-toggle');

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remover relação ecológica';

            function renderControls() {
                const oldControls = row.querySelector('.ecology-detail-controls');
                if (oldControls) oldControls.remove();
                const currentType = normalizeEcologyType(typeSelect.value);
                let controls;
                if (currentType === 'Função Ecológica') {
                    controls = createEcologyFunctionSelector(data.valor || data.detalhe || '');
                } else if (currentType === 'Importância económica para os humanos') {
                    controls = createEcologyEconomicImportanceSelector(data.valor || data.detalhe || '');
                } else if (ECOLOGY_ADVANCED_OPTIONS[currentType]) {
                    controls = createEcologyAdvancedSelector(currentType, data.valor || data.detalhe || '');
                } else {
                    controls = createEcologyAnimalSelector(data.animais || data.animalIds || [], data.texto || data.detalhe || '');
                }
                row.insertBefore(controls, genderBtn);
            }

            typeSelect.addEventListener('change', () => {
                data = {};
                renderControls();
                updateEcologyPreview();
            });
            removeBtn.addEventListener('click', () => {
                row.remove();
                if (ecologyRowsContainer.children.length === 0) setEcologyData();
                updateEcologyPreview();
            });

            row.append(typeSelect, genderBtn, faseBtn, removeBtn);
            ecologyRowsContainer.appendChild(row);
            renderControls();
            updateEcologyPreview();
        }

        function getEcologyData() {
            return [...ecologyRowsContainer.querySelectorAll('.ecology-row')]
                .map(row => {
                    const tipo = normalizeEcologyType(row.querySelector('.ecology-type')?.value || '');
                    if (!tipo) return null;
                    const rowMeta = {
                        genero: normalizeGenderValue(row.querySelector('.ecology-gender-toggle')?.dataset.value, GENDER_BOTH),
                        fase: row.querySelector('.ecology-fase-toggle')?.dataset.value || 'Adulto'
                    };
                    if (tipo === 'Função Ecológica') {
                        const valor = row.querySelector('.ecology-function-value')?.value || '';
                        return valor ? { ...rowMeta, tipo, valor } : null;
                    }
                    if (ECOLOGY_ADVANCED_OPTIONS[tipo]) {
                        const valor = row.querySelector('.ecology-advanced-value')?.value || '';
                        return valor ? { ...rowMeta, tipo, valor } : null;
                    }
                    if (tipo === 'Importância económica para os humanos') {
                        const valor = row.querySelector('.ecology-economic-importance-value')?.value || '';
                        return valor ? { ...rowMeta, tipo, valor } : null;
                    }
                    const hidden = row.querySelector('.ecology-selected-animals');
                    const animais = hidden ? getEcologySelectedRefs(hidden) : [];
                    const texto = row.querySelector('.ecology-free-text')?.value.trim() || '';
                    if (!animais.length && !texto) return null;
                    return { ...rowMeta, tipo, animais, animalIds: animais.map(animal => animal.id).filter(Boolean), texto };
                })
                .filter(Boolean);
        }

        function getDefaultEcologyRows() {
            return ecologyModelOptions.map(tipo => ({ tipo, valor: '', animais: [], texto: '' }));
        }

        function extractLegacyEcologyItems(generalItems = []) {
            return (Array.isArray(generalItems) ? generalItems : [])
                .filter(item => isEcologyFunctionType(item?.tipo || ''))
                .map(item => ({ tipo: 'Função Ecológica', valor: item.valorMin || item.valor || item.valorMax || '' }))
                .filter(item => item.valor);
        }

        function filterLegacyEcologyItems(generalItems = []) {
            return Array.isArray(generalItems) ? generalItems.filter(item => !isEcologyFunctionType(item?.tipo || '')) : [];
        }

        function normalizeEcologyData(ecologia = {}, legacyItems = []) {
            let items = [];
            if (Array.isArray(ecologia?.detalhes)) {
                items = ecologia.detalhes.map(item => ({
                    tipo: normalizeEcologyType(item.tipo || ''),
                    valor: item.valor || item.detalhe || '',
                    animais: normalizeEcologyRefs(item.animais || item.animalIds || []),
                    animalIds: item.animalIds || [],
                    texto: item.texto || '',
                    genero: item.genero || item.gender || GENDER_BOTH,
                    fase: item.fase || 'Adulto'
                }));
            } else {
                if (ecologia?.funcaoEcologica) items.push({ tipo: 'Função Ecológica', valor: ecologia.funcaoEcologica });
                if (ecologia?.importanciaEconomicaHumanos) items.push({ tipo: 'Importância económica para os humanos', valor: ecologia.importanciaEconomicaHumanos });
                Object.entries(ecologyRelationKeys).forEach(([tipo, key]) => {
                    if (Array.isArray(ecologia?.[key]) && ecologia[key].length) {
                        items.push({ tipo, animais: normalizeEcologyRefs(ecologia[key]), texto: tipo === 'Ameaças naturais' ? (ecologia.ameacasNaturaisTexto || '') : '' });
                    }
                });
            }
            legacyItems.forEach(item => {
                if (!items.some(existing => existing.tipo === 'Função Ecológica' && existing.valor)) items.unshift(item);
            });
            return items.length ? items : getDefaultEcologyRows();
        }

        function setEcologyData(items = [], options = {}) {
            const useDefaults = options.useDefaults !== false;
            ecologyRowsContainer.innerHTML = '';
            const normalizedItems = Array.isArray(items) && items.length ? items : (useDefaults ? getDefaultEcologyRows() : []);
            normalizedItems.forEach(item => createEcologyRow(item.tipo || '', item));
            updateEcologyPreview();
        }

        function getPreferredEcologyValue(items, type) {
            const selected = items.find(item => item.tipo === type);
            return selected?.valor || '';
        }

        function getEcologyRelation(items, type) {
            return items.find(item => item.tipo === type)?.animais || [];
        }


        function enrichEcologyRefForAnimal(ref, animalId, animalData) {
            const nomeCientifico = String(animalData?.nomeCientifico || '').trim();
            if (!nomeCientifico || !ref?.nomeCientifico) return { ref, changed: false };
            if (normalizeScientificName(ref.nomeCientifico) !== normalizeScientificName(nomeCientifico)) return { ref, changed: false };
            if (ref.id && ref.nome) return { ref, changed: false };
            return {
                ref: {
                    id: animalId,
                    nome: animalData.nome || animalId,
                    nomeCientifico
                },
                changed: true
            };
        }

        function enrichEcologyRefListForAnimal(refs = [], animalId, animalData) {
            let changed = false;
            const next = normalizeEcologyRefs(refs).map(ref => {
                const enriched = enrichEcologyRefForAnimal(ref, animalId, animalData);
                if (enriched.changed) changed = true;
                return enriched.ref;
            });
            return { refs: next, changed };
        }

        function enrichEcologyObjectForAnimal(ecologia = {}, animalId, animalData) {
            if (!ecologia || typeof ecologia !== 'object') return { ecologia, changed: false };
            let changed = false;
            const nextEcologia = { ...ecologia };

            if (Array.isArray(nextEcologia.detalhes)) {
                nextEcologia.detalhes = nextEcologia.detalhes.map(item => {
                    if (!Array.isArray(item?.animais)) return item;
                    const enriched = enrichEcologyRefListForAnimal(item.animais, animalId, animalData);
                    if (!enriched.changed) return item;
                    changed = true;
                    return { ...item, animais: enriched.refs, animalIds: enriched.refs.map(ref => ref.id).filter(Boolean) };
                });
            }

            Object.values(ecologyRelationKeys).forEach(key => {
                if (!Array.isArray(nextEcologia[key])) return;
                const enriched = enrichEcologyRefListForAnimal(nextEcologia[key], animalId, animalData);
                if (!enriched.changed) return;
                changed = true;
                nextEcologia[key] = enriched.refs;
            });

            return { ecologia: nextEcologia, changed };
        }

        async function backfillEcologyManualRefsForAnimal(animalId, animalData) {
            const nomeCientifico = String(animalData?.nomeCientifico || '').trim();
            if (!animalId || !nomeCientifico) return;
            const batch = writeBatch(db);
            let updates = 0;

            allAnimals.forEach(existingAnimal => {
                if (!existingAnimal?.id || existingAnimal.id === animalId) return;
                const ecologia = existingAnimal.informacao?.ecologia;
                const enriched = enrichEcologyObjectForAnimal(ecologia, animalId, animalData);
                if (!enriched.changed) return;
                batch.update(doc(db, 'animais', existingAnimal.id), { 'informacao.ecologia': enriched.ecologia });
                updates += 1;
            });

            if (updates > 0) {
                await batch.commit();
                console.log(`Ecologia atualizada automaticamente em ${updates} animal(is) para ${nomeCientifico}.`);
            }
        }

        function buildEcologyInfoObject(items = getEcologyData()) {
            const result = {
                resumo: document.getElementById('infoEcologia')?.value || '',
                detalhes: items,
                funcaoEcologica: getPreferredEcologyValue(items, 'Função Ecológica'),
                predadoresNaturais: getEcologyRelation(items, 'Predadores naturais'),
                presas: getEcologyRelation(items, 'Presas'),
                competidores: getEcologyRelation(items, 'Competidores'),
                ameacasNaturais: getEcologyRelation(items, 'Ameaças naturais'),
                ameacasNaturaisTexto: items.find(item => item.tipo === 'Ameaças naturais')?.texto || '',
                relacoesSimbioticas: getEcologyRelation(items, 'Relações Simbióticas'),
                importanciaEconomicaHumanos: getPreferredEcologyValue(items, 'Importância económica para os humanos')
            };
            return result;
        }

        function getEcologyVisualMeta(type = '') {
            const normalized = normalizeSearchText(type);
            if (normalized.includes('importancia economica') || normalized.includes('importância económica')) {
                return { key: 'importancia-economica-humanos', title: type || 'Importância económica para os humanos', accent: 'accent-economic-importance' };
            }
            return getSharedEcologyVisualMeta(type);
        }

        function getEcologyModelSvg(key = 'ecologia') {
            if (key === 'importancia-economica-humanos') {
                return `<svg class="metric-model-svg ecology-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 58h44"/><path d="M24 58V34h12v24"/><path d="M44 58V22h12v36"/><path d="M18 34l22-16l22 16"/><path d="M34 44h12"/><path d="M40 38v12"/></svg>`;
            }
            return getSharedEcologyModelSvg(key);
        }

        function formatEcologyAnimals(item = {}) {
            const names = normalizeEcologyRefs(item.animais || item.animalIds || []).map(ref => ref.nome || ref.nomeCientifico || getAnimalDisplayName(ref));
            const animalText = names.length ? names.join(', ') : 'Seleciona animais da base de dados';
            if (item.tipo === 'Ameaças naturais' && item.texto) {
                return names.length ? `${animalText} — ${item.texto}` : item.texto;
            }
            return animalText;
        }

        function renderEcologyModelCard(item, isSuggestion = false) {
            const type = item.tipo || item;
            if (type === 'Importância económica para os humanos') {
                const meta = getEcologyVisualMeta(type);
                const value = item.valor || 'Escolhe Negativa, Positiva ou Neutra';
                return `
                    <article class="dimension-model-card ecology-model-card ${meta.accent}${isSuggestion ? ' is-suggestion' : ''}">
                        <div class="dimension-model-icon">${getEcologyModelSvg(meta.key)}</div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-label">${meta.title}</div>
                            <div class="dimension-model-value">${value}</div>
                            <div class="dimension-model-meta">Modelo ecológico</div>
                        </div>
                    </article>`;
            }
            if (type === 'Função Ecológica') {
                const value = item.valor || 'Escolhe uma função ecológica';
                const ecologicalMeta = item.valor && !isSuggestion ? getEcologicalFunctionMeta(item.valor) : null;
                return `
                    <article class="dimension-model-card ecology-model-card ${ecologicalMeta?.accent || 'accent-ecology-function'}${isSuggestion ? ' is-suggestion' : ''}">
                        <div class="dimension-model-icon">${ecologicalMeta ? getEcologicalFunctionSvg(ecologicalMeta.key) : getEcologyModelSvg('funcao')}</div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-label">Função Ecológica</div>
                            <div class="dimension-model-value">${value}</div>
                            <div class="dimension-model-meta">Modelo ecológico</div>
                        </div>
                    </article>`;
            }
            const meta = getEcologyVisualMeta(type);
            return `
                <article class="dimension-model-card ecology-model-card ${meta.accent}${isSuggestion ? ' is-suggestion' : ''}">
                    <div class="dimension-model-icon">${getEcologyModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${meta.title}</div>
                        <div class="dimension-model-value">${isSuggestion ? 'Pesquisa e adiciona espécies' : formatEcologyAnimals(item)}</div>
                        <div class="dimension-model-meta">${isSuggestion ? 'Disponível' : 'Modelo visual próprio'}</div>
                    </div>
                </article>`;
        }

        function updateEcologyPreview() {
            const selected = getEcologyData();
            const firstType = selected[0]?.tipo || 'Ecologia';
            const meta = getEcologyVisualMeta(firstType);
            if (ecologyHeroIcon) ecologyHeroIcon.innerHTML = getEcologyModelSvg(meta.key);
            if (ecologyHeroTitle) ecologyHeroTitle.textContent = firstType === 'Ecologia' ? 'Relações ecológicas' : firstType;
            if (!previewEcologyModels) return;
            previewEcologyModels.innerHTML = selected.length
                ? selected.map(item => renderEcologyModelCard(item)).join('')
                : ecologyModelOptions.map(type => renderEcologyModelCard(type, true)).join('');
        }

        addEcologyBtn?.addEventListener('click', () => createEcologyRow());
        setEcologyData();

        // --- REPRODUÇÃO E MODELO VISUAL ---
