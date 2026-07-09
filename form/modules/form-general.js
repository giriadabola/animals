// Modelo visual de informações gerais
        function getGeneralVisualOption(type = '') {
            return getGeneralVisualCatalogOption(type);
        }

        const ecologyFunctionLabel = 'Função ecológica';
        function isEcologyFunctionType(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('funcao ecologica') || normalized.includes('função ecológica');
        }

        generalVisualOptions.length = 0;
        generalVisualOptions.push(...generalVisualCatalogOptions.filter(option => !isEcologyFunctionType(option.tipo)));
        if (!generalVisualOptions.some(option => option.tipo === 'Espetativa média de vida')) {
            generalVisualOptions.unshift({ tipo: 'Espetativa média de vida', unidade: 'anos' });
        }
        generalVisualUnits.length = 0;
        generalVisualUnits.push(...generalVisualCatalogUnits);
        ['segundos', 'minutos', 'horas', 'dias', 'semanas', 'meses', 'anos', 'milénios'].forEach(unit => {
            if (!generalVisualUnits.includes(unit)) generalVisualUnits.push(unit);
        });
        if (!generalVisualOptions.some(option => option.tipo === 'Tempo de Amamentação')) {
            generalVisualOptions.splice(5, 0, { tipo: 'Tempo de Amamentação', unidade: 'meses' });
        }

        function fillGeneralVisualTypeSelect(select, selectedValue = '') {
            const options = generalVisualOptions.map(option => option.tipo).sort((a, b) => a.localeCompare(b));
            const hasSelected = selectedValue && options.includes(selectedValue);
            select.innerHTML = `<option value="">Escolhe um modelo</option>` +
                options.map(option => `<option value="${option}">${option}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue}</option>` : '');
            select.value = selectedValue;
        }

        function isDropdownOnlyGeneralModel(type = '') {
            return isGeneralVisualCatalogDropdownOnly(type);
        }

        function isPopulationGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('popul');
        }

        function isNursingGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('amament');
        }

        function isLifeExpectancyGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('espetativa media de vida') || normalized.includes('expectativa media de vida') || (normalized.includes('vida') && normalized.includes('media'));
        }

        function getLifeExpectancyUnits() {
            return ['segundos', 'minutos', 'horas', 'dias', 'semanas', 'meses', 'anos', 'milénios'];
        }

        function getGeneralUnitOptions(type = '') {
            if (isLifeExpectancyGeneralModel(type)) return getLifeExpectancyUnits();
            if (isNursingGeneralModel(type)) return ['dias', 'meses', 'anos'];
            if (isPopulationGeneralModel(type)) return ['dezenas', 'centenas', 'milhares', 'milhões'];
            return [...generalVisualUnits];
        }

        function getGeneralDefaultUnit(type = '') {
            if (isLifeExpectancyGeneralModel(type)) return 'anos';
            if (isNursingGeneralModel(type)) return 'meses';
            if (isPopulationGeneralModel(type)) return 'milhares';
            return getGeneralVisualOption(type)?.unidade || 'anos';
        }

        function updateGeneralUnitSelect(unitSelect, type, selectedUnit = '', preserveUserChoice = false) {
            const options = getGeneralUnitOptions(type);
            unitSelect.innerHTML = options.map(option => `<option value="${option}">${option}</option>`).join('');
            const nextUnit = preserveUserChoice && selectedUnit && options.includes(selectedUnit)
                ? selectedUnit
                : (selectedUnit && options.includes(selectedUnit) ? selectedUnit : getGeneralDefaultUnit(type));
            unitSelect.value = nextUnit;
        }

        function getGeneralMinPlaceholder(type = '') {
            if (isPopulationGeneralModel(type)) return 'Ex: 1200';
            if (isNursingGeneralModel(type)) return 'Ex: 2';
            if (isLifeExpectancyGeneralModel(type)) return 'Ex: 8';
            return type && type.includes('Velocidade') ? 'Ex: 40' : 'Ex: 10';
        }

        function getGeneralMaxPlaceholder(type = '') {
            if (isPopulationGeneralModel(type)) return 'Ex: 3500';
            if (isNursingGeneralModel(type)) return 'Ex: 8';
            if (isLifeExpectancyGeneralModel(type)) return 'Ex: 15';
            return type && type.includes('Velocidade') ? 'Ex: 80' : 'Ex: 15';
        }

        function configureGeneralVisualRowControls(type, minInput, maxInput, unitSelect, strategySelect) {
            const isStrategy = isDropdownOnlyGeneralModel(type);
            
            if (isStrategy) {
                minInput.style.display = 'none';
                maxInput.style.display = 'none';
                unitSelect.style.display = 'none';
                if (strategySelect) {
                    strategySelect.style.display = '';
                    strategySelect.style.gridColumn = 'span 3';
                }
                maxInput.value = '';
                unitSelect.value = '';
            } else {
                minInput.style.display = '';
                maxInput.style.display = '';
                unitSelect.style.display = '';
                if (strategySelect) {
                    strategySelect.style.display = 'none';
                    strategySelect.style.gridColumn = '';
                }
                minInput.step = '0.01';
                minInput.min = '0';
            }
            minInput.placeholder = getGeneralMinPlaceholder(type);
            maxInput.placeholder = getGeneralMaxPlaceholder(type);
        }

        function createGeneralVisualRow(type = '', minValue = '', unit = '', maxValue = '', gender = GENDER_BOTH, fase = 'Adulto') {
            const row = document.createElement('div');
            row.className = 'general-visual-row';

            const typeSelect = document.createElement('select');
            typeSelect.className = 'general-visual-type';
            fillGeneralVisualTypeSelect(typeSelect, type);

            const minInput = document.createElement('input');
            minInput.className = 'general-visual-min';
            minInput.type = 'number';
            minInput.step = '0.01';
            minInput.min = '0';
            minInput.placeholder = getGeneralMinPlaceholder(type);
            minInput.value = minValue;

            const strategySelect = document.createElement('select');
            strategySelect.className = 'general-visual-strategy';
            strategySelect.style.display = 'none';
            function populateDropdownSelect(selectedType) {
                const config = getGeneralVisualSelectConfig(selectedType);
                const options = [...getGeneralVisualSelectOptions(selectedType)].sort((a, b) => a.localeCompare(b));
                strategySelect.innerHTML = `<option value="">${config?.placeholder || 'Escolhe uma opção'}</option>` +
                    options.map(option => `<option value="${option}">${option}</option>`).join('');
            }
            populateDropdownSelect(type);
            if (isDropdownOnlyGeneralModel(type)) {
                strategySelect.value = minValue;
            }

            const maxInput = document.createElement('input');
            maxInput.className = 'general-visual-max';
            maxInput.type = 'number';
            maxInput.step = '0.01';
            maxInput.min = '0';
            maxInput.placeholder = getGeneralMaxPlaceholder(type);
            maxInput.value = maxValue;
            maxInput.title = 'Opcional. Usa para intervalos, como 10-15 anos ou 40-80 km/h.';

            const unitSelect = document.createElement('select');
            unitSelect.className = 'general-visual-unit';
            updateGeneralUnitSelect(unitSelect, type, unit);
            configureGeneralVisualRowControls(type, minInput, maxInput, unitSelect, strategySelect);

            const genderBtn = document.createElement('button');
            genderBtn.type = 'button';
            genderBtn.className = 'gender-toggle-btn general-visual-gender-toggle';
            genderBtn.dataset.value = normalizeGenderValue(gender, GENDER_BOTH);
            function updateGenderBtnUI() {
                const ui = getGenderUi(genderBtn.dataset.value);
                genderBtn.dataset.value = ui.value;
                genderBtn.innerHTML = ui.html;
                genderBtn.title = ui.title;
            }
            updateGenderBtnUI();

            const faseBtn = document.createElement('button');
            faseBtn.type = 'button';
            faseBtn.className = 'fase-toggle-btn general-visual-fase-toggle';
            faseBtn.dataset.value = fase || 'Adulto';
            function updateFaseBtnUI() {
                if (faseBtn.dataset.value === 'Adulto') {
                    faseBtn.innerHTML = '<i class="fa-solid fa-paw" style="color: #10b981; font-size: 0.9rem;"></i>';
                    faseBtn.title = 'Adulto';
                } else {
                    faseBtn.innerHTML = '<i class="fa-solid fa-baby" style="color: #f59e0b; font-size: 0.9rem;"></i>';
                    faseBtn.title = 'Cria';
                }
            }
            updateFaseBtnUI();

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remover modelo visual';

            typeSelect.addEventListener('change', () => {
                const previousUnit = unitSelect.value;
                updateGeneralUnitSelect(unitSelect, typeSelect.value, previousUnit, unitSelect.dataset.userChanged === 'true');
                populateDropdownSelect(typeSelect.value);
                configureGeneralVisualRowControls(typeSelect.value, minInput, maxInput, unitSelect, strategySelect);
                updateGeneralVisualPreview();
            });
            minInput.addEventListener('input', updateGeneralVisualPreview);
            strategySelect.addEventListener('change', updateGeneralVisualPreview);
            maxInput.addEventListener('input', updateGeneralVisualPreview);
            unitSelect.addEventListener('change', () => {
                unitSelect.dataset.userChanged = 'true';
                updateGeneralVisualPreview();
            });
            genderBtn.addEventListener('click', () => {
                genderBtn.dataset.value = getNextGenderValue(genderBtn.dataset.value);
                updateGenderBtnUI();
                updateGeneralVisualPreview();
            });
            faseBtn.addEventListener('click', () => {
                faseBtn.dataset.value = faseBtn.dataset.value === 'Adulto' ? 'Cria' : 'Adulto';
                updateFaseBtnUI();
                updateGeneralVisualPreview();
            });
            removeBtn.addEventListener('click', () => {
                row.remove();
                if (generalVisualRowsContainer.children.length === 0) setGeneralVisualData();
                updateGeneralVisualPreview();
            });

            row.append(typeSelect, minInput, strategySelect, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
            generalVisualRowsContainer.appendChild(row);
            updateGeneralVisualPreview();
        }

        function getGeneralVisualData() {
            return [...generalVisualRowsContainer.querySelectorAll('.general-visual-row')]
                .map(row => {
                    const type = row.querySelector('.general-visual-type')?.value || '';
                    const isStrategy = isDropdownOnlyGeneralModel(type);
                    const min = isStrategy 
                        ? (row.querySelector('.general-visual-strategy')?.value || '')
                        : (row.querySelector('.general-visual-min')?.value || '');
                    const max = isStrategy ? '' : (row.querySelector('.general-visual-max')?.value || '');
                    return {
                        tipo: type,
                        valor: min,
                        valorMin: min,
                        valorMax: max,
                        unidade: isStrategy ? '' : (row.querySelector('.general-visual-unit')?.value || ''),
                        genero: normalizeGenderValue(row.querySelector('.general-visual-gender-toggle')?.dataset.value, GENDER_BOTH),
                        fase: row.querySelector('.general-visual-fase-toggle')?.dataset.value || 'Adulto'
                    };
                })
                .filter(item => item.tipo && (item.valorMin || item.valorMax || item.valor));
        }

        function getDefaultGeneralVisualOptions() {
            const hiddenByDefault = new Set(['Velocidade média', 'Força da mordida', 'Estratégia para obter alimento', 'Tempo de Amamentação']);
            return generalVisualOptions.filter(option => !hiddenByDefault.has(option.tipo));
        }

        function isLegacyGeneralMatingItem(item = {}) {
            return normalizeSearchText(item?.tipo || '').includes('acasalamento') && !!(item?.valor || item?.valorMin || item?.valorMax);
        }

        function filterLegacyGeneralMatingItems(items = []) {
            return Array.isArray(items) ? items.filter(item => !isLegacyGeneralMatingItem(item)) : [];
        }

        function extractLegacyGeneralMatingItems(items = []) {
            return collapseCombinedGenderItems(
                Array.isArray(items) ? items.filter(item => isLegacyGeneralMatingItem(item)) : []
            )
                .map(item => ({
                    tipo: 'Acasalamento',
                    detalhe: item.valorMin || item.valor || item.valorMax || ''
                }))
                .filter(item => item.detalhe);
        }

        function mergeUniqueReproductionItems(items = []) {
            const seen = new Set();
            return items.filter(item => {
                const key = `${item?.tipo || ''}::${item?.detalhe || ''}`;
                if (!item?.tipo || seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        }

        function setGeneralVisualData(items = []) {
            generalVisualRowsContainer.innerHTML = '';
            const normalizedItems = collapseCombinedGenderItems(filterLegacyGeneralMatingItems(items));
            if (!Array.isArray(normalizedItems) || normalizedItems.length === 0) {
                getDefaultGeneralVisualOptions().forEach(option => {
                    if (option.tipo !== 'Velocidade média' && option.tipo !== 'Força da mordida') {
                        createGeneralVisualRow(option.tipo, '', option.unidade, '', option.genero || GENDER_BOTH, option.fase || 'Adulto');
                    }
                });
                updateGeneralVisualPreview();
                return;
            }
            normalizedItems.forEach(item => createGeneralVisualRow(
                item.tipo || '',
                item.valorMin ?? item.valor ?? '',
                item.unidade || getGeneralVisualOption(item.tipo)?.unidade || '',
                item.valorMax ?? '',
                item.genero || GENDER_BOTH,
                item.fase || 'Adulto'
            ));
            updateGeneralVisualPreview();
        }

        function formatGeneralVisualValue(item, fallback = '—') {
            if (!item) return fallback;
            const min = item.valorMin ?? item.valor ?? '';
            const max = item.valorMax ?? '';
            const unit = item.unidade || '';
            const value = min && max ? `${min}-${max}` : `${min || max}`;
            return `${value}${unit ? ` ${unit}` : ''}`.trim() || fallback;
        }

        function getGeneralVisualMeta(type = '') {
            if (isLifeExpectancyGeneralModel(type)) {
                return { key: 'expectativa-vida', title: type || 'Espetativa média de vida', accent: 'accent-life-expectancy' };
            }
            if (isNursingGeneralModel(type)) {
                return { key: 'amamentacao', title: type || 'Tempo de Amamentação', accent: 'accent-life' };
            }
            return getGeneralVisualCatalogMeta(type);
        }

        function getClimateZoneMeta(value = '') {
            const normalized = normalizeSearchText(value);
            const zones = {
                tropical: { image: '../assets/zonas-climaticas/01_Tropical.png', accent: 'accent-climate-tropical' },
                subtropical: { image: '../assets/zonas-climaticas/02_Subtropical.png', accent: 'accent-climate-subtropical' },
                temperada: { image: '../assets/zonas-climaticas/03_Temperada.png', accent: 'accent-climate-temperada' },
                polar: { image: '../assets/zonas-climaticas/04_Polar.png', accent: 'accent-climate-polar' },
                artica: { image: '../assets/zonas-climaticas/05_Artica.png', accent: 'accent-climate-artica' },
                antartica: { image: '../assets/zonas-climaticas/06_Antartica.png', accent: 'accent-climate-antartica' },
                desertica: { image: '../assets/zonas-climaticas/07_Desertica.png', accent: 'accent-climate-desertica' },
                semiarida: { image: '../assets/zonas-climaticas/08_Semiarida.png', accent: 'accent-climate-semiarida' },
                mediterranica: { image: '../assets/zonas-climaticas/09_Mediterranica.png', accent: 'accent-climate-mediterranica' },
                montanhosa_alpina: { image: '../assets/zonas-climaticas/10_Montanhosa_Alpina.png', accent: 'accent-climate-montanhosa' }
            };
            if (normalized.includes('montanhosa') || normalized.includes('alpina')) return zones.montanhosa_alpina;
            return zones[normalized.replace(/\s+/g, '_')] || zones[normalized] || null;
        }

        function getBiomaMeta(value = '') {
            const normalized = normalizeSearchText(value);
            const biomas = {
                areas_rochosas: { image: '../assets/bioma/15_Areas_Rochosas.png', accent: 'accent-bioma-areas-rochosas' },
                bosque: { image: '../assets/bioma/03_Bosque.png', accent: 'accent-bioma-bosque' },
                calota_de_gelo: { image: '../assets/bioma/07_Calota_de_Gelo.png', accent: 'accent-bioma-calota-gelo' },
                caverna: { image: '../assets/bioma/05_Caverna.png', accent: 'accent-bioma-caverna' },
                chaparral: { image: '../assets/bioma/10_Chaparral.png', accent: 'accent-bioma-chaparral' },
                costa: { image: '../assets/bioma/14_Costa.png', accent: 'accent-bioma-costa' },
                duna: { image: '../assets/bioma/06_Duna.png', accent: 'accent-bioma-duna' },
                estepe: { image: '../assets/bioma/09_Estepe.png', accent: 'accent-bioma-estepe' },
                fauna_urbana: { image: '../assets/bioma/12_Fauna_Urbana.png', accent: 'accent-bioma-fauna-urbana' },
                floresta: { image: '../assets/bioma/16_floresta.png', accent: 'accent-bioma-floresta' },
                marinho: { image: '../assets/bioma/01_Marinho.png', accent: 'accent-bioma-marinho' },
                marinho_corais: { image: '../assets/bioma/13_Marinho_corais.png', accent: 'accent-bioma-marinho-corais' },
                matagal: { image: '../assets/bioma/17_Matagal.png', accent: 'accent-bioma-matagal' },
                montanha: { image: '../assets/bioma/11_Montanha.png', accent: 'accent-bioma-montanha' },
                pantano: { image: '../assets/bioma/04_Pantano.png', accent: 'accent-bioma-pantano' },
                pradaria: { image: '../assets/bioma/08_Pradaria.png', accent: 'accent-bioma-pradaria' },
                savana: { image: '../assets/bioma/02_Savana.png', accent: 'accent-bioma-savana' }
            };
            const key = normalized.replace(/[^a-z0-9_]+/g, '_').replace(/\s+/g, '_').replace(/__+/g, '_').replace(/^_|_$/g, '');
            return biomas[key] || null;
        }

        function getGeneralModelSvg(key = 'geral') {
            if (key === 'expectativa-vida') {
                return `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M25 10h30"/><path d="M25 70h30"/><path d="M29 10c0 12 7 18 11 22c4-4 11-10 11-22"/><path d="M29 70c0-12 7-18 11-22c4 4 11 10 11 22"/><path d="M32 34h16"/><path d="M40 48c-8-6-14-11-14-18c0-5 4-9 9-9c3 0 5 1 5 3c1-2 3-3 6-3c5 0 9 4 9 9c0 7-7 12-15 18Z"/></svg>`;
            }
            if (key === 'amamentacao') {
                return `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M26 20c8 0 14 6 14 14v8c0 8-6 14-14 14s-14-6-14-14v-8c0-8 6-14 14-14Z"/><path d="M54 30c7 0 12 5 12 12s-5 12-12 12"/><path d="M40 38h12"/><path d="M52 34v16"/><path d="M24 58h30"/></svg>`;
            }
            return getGeneralCatalogModelSvg(key);
            const icons = {
                vida: `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M28 10h24"/><path d="M28 70h24"/><path d="M31 10c0 15 18 16 18 30S31 55 31 70"/><path d="M49 10c0 15-18 16-18 30s18 15 18 30"/><path d="M34 53h12"/><path d="M37 59h6"/></svg>`,
                'velocidade-maxima': `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M14 58a26 26 0 0 1 52 0"/><path d="M24 58h32"/><path d="M40 58l18-24"/><path d="M28 30l-5-6"/><path d="M52 30l5-6"/><path d="M40 24v-9"/><path d="M61 58h7"/></svg>`,
                'velocidade-media': `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M13 58a27 27 0 0 1 54 0"/><path d="M22 58h36"/><path d="M40 58l8-18"/><path d="M23 43h8"/><path d="M49 43h8"/><path d="M30 28l-4-7"/><path d="M50 28l4-7"/></svg>`,
                'forca-mordida': `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M20 30c0-6 10-10 20-10s20 4 20 10v6H20v-6z"/><path d="M20 50c0 6 10 10 20 10s20-4 20-10v-6H20v6z"/><path d="M28 30l2 6M36 30l1 6M44 30l-1 6M52 30l-2 6"/><path d="M28 50l2-6M36 50l1-6M44 50l-1-6M52 50l-2-6"/></svg>`,
                geral: `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="25"/><path d="M40 25v18"/><path d="M40 53v2"/></svg>`,
                acasalamento: `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="28" cy="30" r="8"/><circle cx="52" cy="30" r="8"/><path d="M28 38v10"/><path d="M52 38v10"/><path d="M22 54c4-5 8-8 14-8"/><path d="M58 54c-4-5-8-8-14-8"/><path d="M36 30h8"/><path d="M44 30h8"/></svg>`
            };
            return icons[key] || icons.geral;
        }

        function renderGeneralVisualCard(item, isSuggestion = false) {
            const type = item.tipo || item;
            const meta = getGeneralVisualMeta(type);
            const value = isSuggestion ? 'Por preencher' : formatGeneralVisualValue(item);
            const normalizedType = normalizeDimensionKey(type);
            const isStrategy = normalizedType.includes('estrategia');
            const isActivity = normalizedType.includes('atividade');
            const isSocial = normalizedType.includes('vida social');
            const isEcologicalFunction = normalizedType.includes('funcao ecologica');
            const isLocomotion = normalizedType.includes('locomocao');
            const isClimateZone = normalizedType.includes('zona');
            const isBioma = normalizedType.includes('bioma');
            const strategyMeta = isStrategy && !isSuggestion ? getFeedingStrategyMeta(item.valorMin || item.valor || '') : null;
            const activityMeta = isActivity && !isSuggestion ? getActivityMeta(item.valorMin || item.valor || '') : null;
            const socialMeta = isSocial && !isSuggestion ? getSocialMeta(item.valorMin || item.valor || '') : null;
            const ecologicalMeta = isEcologicalFunction && !isSuggestion ? getEcologicalFunctionMeta(item.valorMin || item.valor || '') : null;
            const locomotionMeta = isLocomotion && !isSuggestion ? getLocomotionMeta(item.valorMin || item.valor || '') : null;
            const climateMeta = isClimateZone && !isSuggestion ? getClimateZoneMeta(item.valorMin || item.valor || '') : null;
            const biomaMeta = isBioma && !isSuggestion ? getBiomaMeta(item.valorMin || item.valor || '') : null;
            const icon = climateMeta
                ? `<img class="climate-zone-model-image" src="${climateMeta.image}" alt="Zona climática ${item.valorMin || item.valor || ''}" loading="lazy">`
                : biomaMeta
                    ? `<img class="climate-zone-model-image" src="${biomaMeta.image}" alt="Bioma ${item.valorMin || item.valor || ''}" loading="lazy">`
                    : ecologicalMeta
                        ? getEcologicalFunctionSvg(ecologicalMeta.key)
                    : locomotionMeta
                        ? getLocomotionSvg(locomotionMeta.key)
                    : strategyMeta
                        ? getFeedingStrategySvg(strategyMeta.key)
                        : activityMeta
                            ? getActivitySvg(activityMeta.key)
                            : socialMeta
                                ? getSocialSvg(socialMeta.key)
                            : getGeneralModelSvg(meta.key);
            return `
                <article class="dimension-model-card general-model-card ${climateMeta?.accent || biomaMeta?.accent || ecologicalMeta?.accent || locomotionMeta?.accent || strategyMeta?.accent || activityMeta?.accent || socialMeta?.accent || meta.accent}${isSuggestion ? ' is-suggestion' : ''}">
                    <div class="dimension-model-icon ${climateMeta || biomaMeta ? 'climate-zone-model-icon' : ''}">${icon}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${meta.title}</div>
                        <div class="dimension-model-value">${value}</div>
                    </div>
                </article>`;
        }

        function updateGeneralVisualPreview() {
            const selected = getGeneralVisualData();
            if (selected.length) {
                previewGeneralVisualModels.innerHTML = selected.map(item => renderGeneralVisualCard(item)).join('');
                return;
            }
            previewGeneralVisualModels.innerHTML = getDefaultGeneralVisualOptions().map(option => renderGeneralVisualCard(option, true)).join('');
        }

        addGeneralVisualBtn.addEventListener('click', () => createGeneralVisualRow());
        setGeneralVisualData();

        addDimensionBtn.addEventListener('click', () => createDimensionRow());
        document.getElementById('categoria').addEventListener('change', () => {
            const hasFilledDimensions = getDimensionData().length > 0;
            if (!hasFilledDimensions) {
                setDimensionData();
            } else {
                updateAllDimensionMetricSelects();
                updateDimensionPreview();
            }

            updateAllReproductionTypeSelects();
            updateReproductionPreview();
        });
        setDimensionData();


        function createModelGenderButton(initialValue = GENDER_BOTH, onChange = () => {}, extraClass = '') {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `gender-toggle-btn ${extraClass}`.trim();
            button.dataset.value = normalizeGenderValue(initialValue, GENDER_BOTH);
            const sync = () => {
                const ui = getGenderUi(button.dataset.value);
                button.dataset.value = ui.value;
                button.innerHTML = ui.html;
                button.title = ui.title;
            };
            sync();
            button.addEventListener('click', () => {
                button.dataset.value = getNextGenderValue(button.dataset.value);
                sync();
                onChange();
            });
            return button;
        }

        function createModelFaseButton(initialValue = 'Adulto', onChange = () => {}, extraClass = '') {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `fase-toggle-btn ${extraClass}`.trim();
            button.dataset.value = initialValue || 'Adulto';
            const sync = () => {
                if (button.dataset.value === 'Adulto') {
                    button.innerHTML = '<i class="fa-solid fa-paw" style="color: #10b981; font-size: 0.9rem;"></i>';
                    button.title = 'Adulto';
                } else {
                    button.innerHTML = '<i class="fa-solid fa-baby" style="color: #f59e0b; font-size: 0.9rem;"></i>';
                    button.title = 'Cria';
                }
            };
            sync();
            button.addEventListener('click', () => {
                button.dataset.value = button.dataset.value === 'Adulto' ? 'Cria' : 'Adulto';
                sync();
                onChange();
            });
            return button;
        }

        // --- ALIMENTAÇÃO E MODELO VISUAL ---
