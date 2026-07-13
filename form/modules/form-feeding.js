// Modelo visual de alimentação
        function normalizeSearchText(value = '') {
            return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        function closeFeedingAnimalDropdown() {
            feedingAnimalDropdown.classList.remove('open');
            feedingAnimalTrigger.setAttribute('aria-expanded', 'false');
        }

        function renderFeedingAnimalOptions(query = '') {
            const normalizedQuery = normalizeSearchText(query);
            const filteredOptions = feedingAnimalOptions.filter(option => normalizeSearchText(option.label).includes(normalizedQuery));

            if (!filteredOptions.length) {
                feedingAnimalList.innerHTML = '<div class="feeding-animal-empty">Sem resultados</div>';
                return;
            }

            feedingAnimalList.innerHTML = filteredOptions.map(option => `
                <button type="button" class="feeding-animal-option" role="option" data-label="${option.label}">
                    <img class="feeding-animal-thumb" src="${option.src}" alt="${option.label}" loading="lazy">
                    <span class="feeding-animal-option-copy">
                        <strong>${option.label}</strong>
                        <small>${option.feedingType}</small>
                    </span>
                </button>
            `).join('');
        }

        function getFeedingAnimalOption(label = '') {
            return feedingAnimalOptions.find(option => option.label === label);
        }

        function selectFeedingAnimal(label) {
            const option = feedingAnimalOptions.find(item => item.label === label);
            if (!option) return;

            const emptyRow = [...feedingRowsContainer.querySelectorAll('.feeding-row')].find(row => !getFeedingRowData(row));

            if (emptyRow) {
                const modelSelect = emptyRow.querySelector('.feeding-model-kind');
                modelSelect.value = 'Tipo de Alimentação';
                renderFeedingDetailControls(emptyRow, 'Tipo de Alimentação', `${option.feedingType} | ${option.label}`);
                updateFeedingPreview();
            } else {
                createFeedingRow('Tipo de Alimentação', `${option.feedingType} | ${option.label}`);
            }

            feedingAnimalSearch.value = '';
            renderFeedingAnimalOptions();
            closeFeedingAnimalDropdown();
        }

        function initFeedingAnimalDropdown() {
            renderFeedingAnimalOptions();

            feedingAnimalTrigger.addEventListener('click', () => {
                const isOpen = feedingAnimalDropdown.classList.toggle('open');
                feedingAnimalTrigger.setAttribute('aria-expanded', String(isOpen));
                if (isOpen) feedingAnimalSearch.focus();
            });

            feedingAnimalSearch.addEventListener('input', event => renderFeedingAnimalOptions(event.target.value));
            feedingAnimalList.addEventListener('click', event => {
                const optionButton = event.target.closest('.feeding-animal-option');
                if (optionButton) selectFeedingAnimal(optionButton.dataset.label);
            });

            document.addEventListener('click', event => {
                if (!feedingAnimalDropdown.contains(event.target)) closeFeedingAnimalDropdown();
            });

            document.addEventListener('keydown', event => {
                if (event.key === 'Escape') closeFeedingAnimalDropdown();
            });
        }

        const feedingModelOptions = [
            'Água bebida em Média',
            'Alimento Ingerido em Média',
            'Estratégia para obter alimentos',
            'Tipo de Alimentação'
        ].sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));

        const feedingFoodUnits = ['g/dia', 'g/semana', 'g/mes', 'g/ano', 'kg/dia', 'kg/semana', 'kg/mes', 'kg/ano'];
        const feedingWaterUnits = ['l/dia', 'l/semana', 'l/mes', 'l/ano'];

        function isFeedingStrategyModel(tipo = '') {
            const normalized = normalizeSearchText(tipo);
            return normalized.includes('estrategia') && normalized.includes('alimento');
        }

        function getFeedingStrategyOptions() {
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
                const options = getFeedingStrategyOptions();
                strategySelect.innerHTML = '<option value="">Escolhe uma estratégia</option>' +
                    options.map(option => `<option value="${option}">${option}</option>`).join('');
                strategySelect.value = options.includes(detail) ? detail : '';
                strategySelect.addEventListener('change', updateFeedingPreview);
                controls.append(strategySelect);
            } else {
                const parsed = parseFeedingTypeDetail(detail);

                const typeSelect = document.createElement('select');
                typeSelect.className = 'feeding-type-value';
                fillFeedingTypeSelect(typeSelect, parsed.type);

                const detailInput = document.createElement('input');
                detailInput.className = 'feeding-detail-value';
                detailInput.type = 'text';
                detailInput.placeholder = 'Ex: folhas jovens';
                detailInput.value = parsed.detail;

                typeSelect.addEventListener('change', updateFeedingPreview);
                detailInput.addEventListener('input', updateFeedingPreview);
                controls.append(typeSelect, detailInput);
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
                return detail ? { tipo: 'Estratégia para obter alimentos', detalhe: detail, ...meta } : null;
            }

            const feedingTypeVal = row.querySelector('.feeding-type-value')?.value || '';
            const detailVal = row.querySelector('.feeding-detail-value')?.value.trim() || '';
            if (!feedingTypeVal && !detailVal) return null;
            return {
                tipo: 'Tipo de Alimentação',
                detalhe: feedingTypeVal && detailVal ? `${feedingTypeVal} | ${detailVal}` : (feedingTypeVal || detailVal),
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
            items.forEach(item => createFeedingRow(
                item.tipo || 'Tipo de Alimentação',
                item.detalhe || item.descricao || '',
                item.genero || GENDER_BOTH,
                item.fase || 'Adulto'
            ));
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
        initFeedingAnimalDropdown();

        setFeedingData();

        const ecologyModelOptions = [
            'Ameaças naturais',
            'Competidores',
            'Função Ecológica',
            'Predadores naturais',
            'Presas',
            'Relações Simbióticas'
        ];

        const ecologyRelationKeys = {
            'Predadores naturais': 'predadoresNaturais',
            'Presas': 'presas',
            'Competidores': 'competidores',
            'Ameaças naturais': 'ameacasNaturais',
            'Relações Simbióticas': 'relacoesSimbioticas'
        };

