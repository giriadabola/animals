// Modelo visual de alimentação
        function normalizeSearchText(value = '') {
            return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        let feedingFoodOptions = [];
        let feedingAnimalsLoaded = false;
        let feedingAnimalsLoadPromise = null;
        const feedingRelationKey = { animals: 'animais', foods: 'alimentos' };
        const relationLabel = { animals: 'Animais da dieta', foods: 'Alimentos' };
        const relationPlaceholder = { animals: 'Pesquisar nome comum ou científico...', foods: 'Pesquisar alimento...' };
        const relationIdKey = { animals: 'id', foods: 'id' };

        function getFeedingAnimalOption() { return null; }

        async function ensureFeedingAnimalsLoaded() {
            // O módulo de edição pode limpar allAnimals ao iniciar; nesse caso
            // a pesquisa deve voltar a consultar o Firebase.
            if (feedingAnimalsLoaded && allAnimals.length) return allAnimals;
            if (feedingAnimalsLoadPromise) return feedingAnimalsLoadPromise;
            feedingAnimalsLoadPromise = getDocs(collection(db, 'animais')).then(snapshot => {
                const loaded = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
                const byId = new Map(allAnimals.map(item => [item.id, item]));
                loaded.forEach(item => byId.set(item.id, item));
                allAnimals = [...byId.values()];
                feedingAnimalsLoaded = true;
                return allAnimals;
            }).catch(error => {
                console.warn('Não foi possível carregar os animais para a pesquisa da alimentação.', error);
                return allAnimals;
            }).finally(() => { feedingAnimalsLoadPromise = null; });
            return feedingAnimalsLoadPromise;
        }

        async function loadFeedingFoodOptions() {
            try {
                const snapshot = await getDocs(collection(db, 'alimento'));
                feedingFoodOptions = snapshot.docs.map(item => ({ id: item.id, ...item.data() }))
                    .filter(item => String(item.nome || '').trim())
                    .sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'pt-PT', { sensitivity: 'base' }));
            } catch (error) {
                console.warn('Não foi possível carregar o catálogo de alimentos.', error);
            }
        }

        function relationKey(value, kind) {
            if (kind === 'animals') return value?.id ? `id:${value.id}` : `scientific:${normalizeSearchText(value?.nomeCientifico || value?.nome || value)}`;
            return value?.id ? `id:${value.id}` : `name:${normalizeSearchText(value?.nome || value)}`;
        }

        function renderRelationTags(tags, hidden, kind, onChange) {
            let values = [];
            try { values = JSON.parse(hidden.value || '[]'); } catch (_) { values = []; }
            tags.innerHTML = values.map(value => `<span class="feeding-relation-tag"><span>${value.nome || value.nomeCientifico || value}</span><button type="button" aria-label="Remover">&times;</button></span>`).join('');
            tags.querySelectorAll('button').forEach((button, index) => button.addEventListener('click', () => {
                values.splice(index, 1); hidden.value = JSON.stringify(values); renderRelationTags(tags, hidden, kind, onChange); onChange();
            }));
        }

        function createFeedingRelationSelector(kind, initialValues = [], onChange = updateFeedingPreview) {
            const wrapper = document.createElement('div'); wrapper.className = `feeding-relation feeding-relation-${kind}`;
            const hidden = document.createElement('input'); hidden.type = 'hidden'; hidden.className = `feeding-selected-${kind}`; hidden.value = JSON.stringify(initialValues || []);
            const input = document.createElement('input'); input.type = 'search'; input.placeholder = relationPlaceholder[kind]; input.autocomplete = 'off'; input.className = 'feeding-relation-search';
            const results = document.createElement('div'); results.className = 'feeding-relation-results';
            const tags = document.createElement('div'); tags.className = 'feeding-relation-tags';
            const getValues = () => { try { return JSON.parse(hidden.value || '[]'); } catch (_) { return []; } };
            const addValue = value => {
                const values = getValues(); if (!value || values.some(item => relationKey(item, kind) === relationKey(value, kind))) return;
                values.push(value); hidden.value = JSON.stringify(values); renderRelationTags(tags, hidden, kind, onChange); input.value = ''; results.classList.remove('open'); onChange();
            };
            const commitText = async raw => {
                if (kind === 'animals') await ensureFeedingAnimalsLoaded();
                String(raw || '').split(/[;,\n\t]+/).map(item => item.trim()).filter(Boolean).forEach(token => {
                const query = normalizeSearchText(token);
                if (kind === 'animals') {
                    const animal = allAnimals.find(item => normalizeSearchText(item.nome || '') === query || normalizeSearchText(item.nomeCientifico || '') === query);
                    addValue(animal ? { id: animal.id, nome: animal.nome || animal.id, nomeCientifico: animal.nomeCientifico || '' } : { nomeCientifico: token });
                } else {
                    const food = feedingFoodOptions.find(item => normalizeSearchText(item.nome) === query);
                    addValue(food ? { id: food.id, nome: food.nome } : { nome: token });
                }
                });
            };
            const renderResults = () => {
                const query = normalizeSearchText(input.value); if (!query) { results.innerHTML = ''; results.classList.remove('open'); return; }
                const values = getValues(); const selected = new Set(values.map(item => relationKey(item, kind)));
                const source = kind === 'animals'
                    ? allAnimals.filter(item => normalizeSearchText(`${item.nome || ''} ${item.nomeCientifico || ''}`).includes(query)).slice(0, 8).map(item => ({ id: item.id, nome: item.nome || item.id, nomeCientifico: item.nomeCientifico || '' }))
                    : feedingFoodOptions.filter(item => normalizeSearchText(item.nome).includes(query)).slice(0, 8).map(item => ({ id: item.id, nome: item.nome }));
                results.innerHTML = source.filter(item => !selected.has(relationKey(item, kind))).map(item => `<button type="button" data-value="${encodeURIComponent(JSON.stringify(item))}"><strong>${item.nome || item.nomeCientifico}</strong><small>${item.nomeCientifico || ''}</small></button>`).join('');
                results.innerHTML += `<button type="button" class="feeding-relation-manual" data-manual="${input.value.replace(/"/g, '&quot;')}"><strong>Adicionar</strong><small>${input.value}</small></button>`;
                results.classList.add('open');
            };
            input.addEventListener('input', () => {
                renderResults();
                if (kind === 'animals') ensureFeedingAnimalsLoaded().then(renderResults);
            });
            input.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); commitText(input.value); } });
            input.addEventListener('paste', () => setTimeout(() => { if (/[;,\n\t]/.test(input.value)) commitText(input.value); }, 0));
            input.addEventListener('blur', () => setTimeout(() => { if (input.value.trim()) commitText(input.value); }, 150));
            results.addEventListener('mousedown', event => { const button = event.target.closest('button'); if (!button) return; event.preventDefault(); if (button.dataset.value) addValue(JSON.parse(decodeURIComponent(button.dataset.value))); else addValue(kind === 'animals' ? { nomeCientifico: button.dataset.manual } : { nome: button.dataset.manual }); });
            wrapper.append(hidden, input, results, tags); renderRelationTags(tags, hidden, kind, onChange); return wrapper;
        }

        const feedingModelOptions = [
            'Água bebida em Média',
            'Alimento Ingerido em Média',
            'Estratégia para obter alimentos',
            'Mecanismo de ingestão',
            'Tipo de Alimentação'
        ].sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));

        const feedingFoodUnits = ['g/dia', 'g/semana', 'g/mes', 'g/ano', 'kg/dia', 'kg/semana', 'kg/mes', 'kg/ano'];
        const feedingWaterUnits = ['l/dia', 'l/semana', 'l/mes', 'l/ano'];

        function isFeedingStrategyModel(tipo = '') {
            const normalized = normalizeSearchText(tipo);
            return (normalized.includes('estrategia') && normalized.includes('alimento')) || normalized.includes('mecanismo de ingestao');
        }

        function getFeedingStrategyOptions(type = 'Estratégia para obter alimentos') {
            if (normalizeSearchText(type).includes('mecanismo de ingestao')) return ['Mastigação','Sucção','Filtração','Raspagem','Trituração faríngea','Absorção pelo tegumento','Perfuração','Injeção de veneno','Digestão externa','Engolimento inteiro'];
            return [...getGeneralVisualSelectOptions('Estratégia para obter alimento')].sort((a, b) => a.localeCompare(b));
        }

        function fillFeedingTypeSelect(select, selectedValue = '') {
            const sortedTypes = [...feedingTypes].sort((a, b) => a.localeCompare(b));
            const hasSelected = selectedValue && sortedTypes.includes(selectedValue);
            select.innerHTML = `<option value="">Escolhe um tipo</option>` +
                sortedTypes.map(type => `<option value="${type}">${type}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue} — personalizado</option>` : '');
            select.value = selectedValue;
        }

        function fillFeedingModelSelect(select, selectedValue = '') {
            const value = feedingModelOptions.includes(selectedValue) ? selectedValue : 'Tipo de Alimentação';
            select.innerHTML = feedingModelOptions.map(option => `<option value="${option}">${option}</option>`).join('');
            select.value = value;
        }

        function createUnitSelect(className, units, selectedValue) {
            const select = document.createElement('select');
            select.className = className;
            select.innerHTML = units.map(unit => `<option value="${unit}">${unit}</option>`).join('');
            select.value = units.includes(selectedValue) ? selectedValue : units[0];
            select.addEventListener('change', updateFeedingPreview);
            return select;
        }

        function parseFeedingTypeDetail(detail = '') {
            const clean = String(detail || '').trim();
            if (clean.includes(' | ')) {
                const parts = clean.split(' | ');
                return { type: parts[0] || '', detail: parts.slice(1).join(' | ') || '' };
            }
            if (feedingTypes.includes(clean)) return { type: clean, detail: '' };
            return { type: '', detail: clean };
        }

        function renderFeedingDetailControls(row, tipo = 'Tipo de Alimentação', detail = '') {
            const oldControls = row.querySelector('.feeding-detail-controls');
            if (oldControls) oldControls.remove();

            const controls = document.createElement('div');
            controls.className = 'feeding-detail-controls';

            if (tipo === 'Alimento Ingerido em Média' || tipo === 'Água bebida em Média') {
                controls.classList.add('measure-controls');
                const fallbackUnit = tipo === 'Água bebida em Média' ? 'l/dia' : 'kg/dia';
                const units = tipo === 'Água bebida em Média' ? feedingWaterUnits : feedingFoodUnits;
                const parsed = parseNutritionRange(detail, fallbackUnit);

                const minInput = document.createElement('input');
                minInput.type = 'text';
                minInput.className = 'feeding-measure-min';
                minInput.placeholder = 'Mín.';
                minInput.inputMode = 'decimal';
                minInput.value = parsed.min;

                const maxInput = document.createElement('input');
                maxInput.type = 'text';
                maxInput.className = 'feeding-measure-max';
                maxInput.placeholder = 'Máx.';
                maxInput.inputMode = 'decimal';
                maxInput.value = parsed.max;

                const unitSelect = createUnitSelect('feeding-measure-unit', units, parsed.unit || fallbackUnit);

                [minInput, maxInput].forEach(input => input.addEventListener('input', updateFeedingPreview));
                controls.append(minInput, maxInput, unitSelect);
            } else if (isFeedingStrategyModel(tipo)) {
                const strategySelect = document.createElement('select');
                strategySelect.className = 'feeding-strategy-value';
                const options = getFeedingStrategyOptions(tipo);
                strategySelect.innerHTML = '<option value="">Escolhe uma estratégia</option>' +
                    options.map(option => `<option value="${option}">${option}</option>`).join('');
                strategySelect.value = options.includes(detail) ? detail : '';
                strategySelect.addEventListener('change', updateFeedingPreview);
                controls.append(strategySelect);
            } else {
                const parsed = parseFeedingTypeDetail(detail);
                const legacyAnimal = parsed.detail ? allAnimals.find(animal => normalizeSearchText(`${animal.nome || ''} ${animal.nomeCientifico || ''}`).includes(normalizeSearchText(parsed.detail))) : null;
                const animals = row._feedingInitialAnimals || (legacyAnimal ? [{ id: legacyAnimal.id, nome: legacyAnimal.nome || legacyAnimal.id, nomeCientifico: legacyAnimal.nomeCientifico || '' }] : []);
                const foods = row._feedingInitialFoods || [];
                controls.append(
                    (() => { const select = document.createElement('select'); select.className = 'feeding-type-value'; fillFeedingTypeSelect(select, parsed.type); select.addEventListener('change', updateFeedingPreview); return select; })(),
                    createFeedingRelationSelector('animals', animals),
                    createFeedingRelationSelector('foods', foods)
                );
                row._feedingInitialAnimals = null; row._feedingInitialFoods = null;
            }

            const anchorBtn = row.querySelector('.feeding-gender-toggle') || row.querySelector('.remove-dimension-btn');
            row.insertBefore(controls, anchorBtn);
        }

        function createFeedingRow(type = 'Tipo de Alimentação', detail = '', gender = GENDER_BOTH, fase = 'Adulto') {
            const row = document.createElement('div');
            row.className = 'feeding-row';

            const modelSelect = document.createElement('select');
            modelSelect.className = 'feeding-model-kind';
            fillFeedingModelSelect(modelSelect, type);

            const genderBtn = createModelGenderButton(gender, updateFeedingPreview, 'feeding-gender-toggle');
            const faseBtn = createModelFaseButton(fase, updateFeedingPreview, 'feeding-fase-toggle');

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remover modelo de alimentação';

            modelSelect.addEventListener('change', () => {
                renderFeedingDetailControls(row, modelSelect.value, '');
                updateFeedingPreview();
            });
            removeBtn.addEventListener('click', () => {
                row.remove();
                if (feedingRowsContainer.children.length === 0) createFeedingRow();
                updateFeedingPreview();
            });

            row.append(modelSelect, genderBtn, faseBtn, removeBtn);
            feedingRowsContainer.appendChild(row);
            renderFeedingDetailControls(row, modelSelect.value, detail);
            updateFeedingPreview();
        }

        function getFeedingRowData(row) {
            const tipo = row.querySelector('.feeding-model-kind')?.value || 'Tipo de Alimentação';
            const meta = {
                genero: normalizeGenderValue(row.querySelector('.feeding-gender-toggle')?.dataset.value, GENDER_BOTH),
                fase: row.querySelector('.feeding-fase-toggle')?.dataset.value || 'Adulto'
            };
            if (tipo === 'Alimento Ingerido em Média' || tipo === 'Água bebida em Média') {
                const detail = buildRangeDetail(
                    row.querySelector('.feeding-measure-min')?.value,
                    row.querySelector('.feeding-measure-max')?.value,
                    row.querySelector('.feeding-measure-unit')?.value || (tipo === 'Água bebida em Média' ? 'l/dia' : 'kg/dia')
                );
                return detail ? { tipo, detalhe: detail, ...meta } : null;
            }

            if (isFeedingStrategyModel(tipo)) {
                const detail = row.querySelector('.feeding-strategy-value')?.value || '';
                return detail ? { tipo, detalhe: detail, ...meta } : null;
            }

            const feedingTypeVal = row.querySelector('.feeding-type-value')?.value || '';
            const readRelation = kind => { try { return JSON.parse(row.querySelector(`.feeding-selected-${kind}`)?.value || '[]'); } catch (_) { return []; } };
            const animais = readRelation('animals');
            const alimentos = readRelation('foods');
            if (!feedingTypeVal && !animais.length && !alimentos.length) return null;
            return {
                tipo: 'Tipo de Alimentação',
                detalhe: feedingTypeVal,
                animais,
                animalIds: animais.map(item => item.id).filter(Boolean),
                alimentos,
                ...meta
            };
        }

        function getFeedingData() {
            return [...feedingRowsContainer.querySelectorAll('.feeding-row')]
                .map(getFeedingRowData)
                .filter(Boolean);
        }

        function setFeedingData(items = []) {
            feedingRowsContainer.innerHTML = '';
            if (!Array.isArray(items) || items.length === 0) {
                feedingModelOptions.forEach(type => createFeedingRow(type));
                updateFeedingPreview();
                return;
            }
            items.forEach(item => {
                const row = createFeedingRow(item.tipo || 'Tipo de Alimentação', item.detalhe || item.descricao || '', item.genero || GENDER_BOTH, item.fase || 'Adulto');
                const created = feedingRowsContainer.lastElementChild;
                if (created && (item.animais?.length || item.alimentos?.length)) {
                    created._feedingInitialAnimals = item.animais || [];
                    created._feedingInitialFoods = item.alimentos || [];
                    renderFeedingDetailControls(created, created.querySelector('.feeding-model-kind').value, item.detalhe || item.descricao || '');
                }
            });
            if (feedingRowsContainer.children.length === 0) createFeedingRow();
            updateFeedingPreview();
        }
        function renderFeedingModelCard(item, isSuggestion = false) {
            const type = item.tipo || item;
            const rawDetail = item.detalhe || '';
            const nutritionMetaByType = {
                'Tipo de Alimentação': { key: 'alimentacaoTipo', title: 'Tipo de Alimentação', accent: 'accent-food', fallback: 'Seleciona o tipo e escreve o detalhe livre' },
                'Alimento Ingerido em Média': { key: 'alimentoMedio', title: 'Alimento Ingerido em Média', accent: 'accent-meal', fallback: 'Indica mínimo, máximo e unidade' },
                'Água bebida em Média': { key: 'aguaMedia', title: 'Água bebida em Média', accent: 'accent-water', fallback: 'Indica mínimo, máximo e unidade' },
                'Estratégia para obter alimentos': { key: 'estrategiaAlimentar', title: 'Estratégia para obter alimentos', accent: 'accent-feeding-strategy', fallback: 'Escolhe a estratégia alimentar' }
            };
            if (nutritionMetaByType[type]) {
                const meta = nutritionMetaByType[type];
                let detail = rawDetail || meta.fallback;
                if (type === 'Tipo de Alimentação' && detail.includes(' | ')) {
                    const [feedingType, freeText] = detail.split(' | ');
                    detail = freeText ? `${feedingType} — ${freeText}` : feedingType;
                }
                const icon = type === 'Estratégia para obter alimentos'
                    ? getFeedingStrategySvg(getFeedingStrategyMeta(rawDetail || '').key)
                    : getReproductionModelSvg(meta.key);
                return `
                    <article class="dimension-model-card feeding-model-card reproduction-model-card ${meta.accent}${isSuggestion ? ' is-suggestion' : ''}">
                        <div class="dimension-model-icon">${icon}</div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-label">${meta.title}</div>
                            <div class="dimension-model-value">${detail}</div>
                            <div class="dimension-model-meta">${isSuggestion ? 'Disponível' : 'Modelo visual próprio'}</div>
                        </div>
                    </article>`;
            }

            const meta = getFeedingVisualMeta(type);
            const detail = rawDetail || feedingTypeDescriptions[type] || 'Tipo de dieta';
            const animalOption = getFeedingAnimalOption(rawDetail || '');
            const visual = animalOption?.src
                ? `<img class="feeding-model-animal-image" src="${animalOption.src}" alt="${animalOption.label}">`
                : getFeedingModelSvg(meta.key);
            return `
                <article class="dimension-model-card feeding-model-card ${meta.accent}${isSuggestion ? ' is-suggestion' : ''}">
                    <div class="dimension-model-icon">${visual}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${meta.title}</div>
                        <div class="dimension-model-value">${detail}</div>
                        <div class="dimension-model-meta">${isSuggestion ? 'Disponível' : 'Modelo visual'}</div>
                    </div>
                </article>`;
        }
        function updateFeedingPreview() {
            const selected = getFeedingData();
            const hero = selected[0]?.tipo || 'Alimentação';
            const heroMeta = getFeedingVisualMeta(hero);
            feedingHeroIcon.innerHTML = getFeedingModelSvg(heroMeta.key);
            feedingHeroTitle.textContent = selected[0]?.tipo || 'Tipos de alimentação';

            if (selected.length) {
                previewFeedingModels.innerHTML = selected.map(item => renderFeedingModelCard(item)).join('');
                return;
            }

            previewFeedingModels.innerHTML = feedingTypes.map(type => renderFeedingModelCard(type, true)).join('');
        }

        addFeedingBtn.addEventListener('click', () => createFeedingRow());
        loadFeedingFoodOptions().then(() => updateFeedingPreview());
        setFeedingData();

        async function ensureFeedingFoodCatalogEntries() {
            const rows = [...feedingRowsContainer.querySelectorAll('.feeding-row')];
            const names = [...new Set(rows.flatMap(row => { try { return JSON.parse(row.querySelector('.feeding-selected-foods')?.value || '[]').map(food => String(food.nome || '').trim()); } catch (_) { return []; } }).filter(Boolean))];
            for (const nome of names) {
                let catalogItem = feedingFoodOptions.find(item => normalizeSearchText(item.nome) === normalizeSearchText(nome));
                if (!catalogItem) {
                    const created = await addDoc(collection(db, 'alimento'), { nome, criadoEm: Date.now() });
                    catalogItem = { id: created.id, nome }; feedingFoodOptions.push(catalogItem);
                }
                rows.forEach(row => {
                    const hidden = row.querySelector('.feeding-selected-foods'); if (!hidden) return;
                    try { hidden.value = JSON.stringify(JSON.parse(hidden.value || '[]').map(food => normalizeSearchText(food.nome) === normalizeSearchText(nome) ? catalogItem : food)); } catch (_) { /* ignorar */ }
                });
            }
        }

        async function backfillFeedingManualRefsForAnimal(animalId, animalData) {
            const scientific = normalizeSearchText(animalData?.nomeCientifico || '');
            if (!animalId || !scientific) return;
            await Promise.all(allAnimals.filter(item => item?.id && item.id !== animalId).map(async existing => {
                const details = existing.informacao?.alimentacaoDetalhada;
                if (!Array.isArray(details)) return;
                let changed = false;
                const next = details.map(item => {
                    if (!Array.isArray(item?.animais)) return item;
                    const animais = item.animais.map(ref => normalizeSearchText(ref?.nomeCientifico || '') === scientific ? { ...ref, id: animalId, nome: animalData.nome || animalId, nomeCientifico: animalData.nomeCientifico } : ref);
                    const itemChanged = JSON.stringify(animais) !== JSON.stringify(item.animais);
                    if (itemChanged) changed = true;
                    return itemChanged ? { ...item, animais, animalIds: animais.map(ref => ref.id).filter(Boolean) } : item;
                });
                if (changed) await updateDoc(doc(db, 'animais', existing.id), { 'informacao.alimentacaoDetalhada': next });
            }));
        }

        const ecologyModelOptions = [
            'Ameaças naturais',
            'Competidores',
            'Função Ecológica',
            'Predadores naturais',
            'Presas',
            'Relações Simbióticas',
            'Tipo de hospedeiro',
            'Localização no hospedeiro',
            'Tipo de parasita'
        ];

        const ecologyRelationKeys = {
            'Predadores naturais': 'predadoresNaturais',
            'Presas': 'presas',
            'Competidores': 'competidores',
            'Ameaças naturais': 'ameacasNaturais',
            'Relações Simbióticas': 'relacoesSimbioticas'
        };
