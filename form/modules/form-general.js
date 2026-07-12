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
        generalVisualOptions.push(...generalVisualCatalogOptions
            .filter(option => !isEcologyFunctionType(option.tipo))
            .filter(option => !isBaseLifeExpectancyGeneralModel(option.tipo))
            .filter(option => !isFeedingStrategyGeneralModel(option.tipo))
        );
        generalVisualOptions.unshift({ tipo: 'Expetativa média de vida', unidade: 'anos' });
        [
            { tipo: 'Vida útil (cativeiro)', unidade: 'km/dia' },
            { tipo: 'Expetativa média de vida (cativeiro)', unidade: 'km/dia' },
            { tipo: 'Taxa Metabólica Basal média', unidade: 'W' },
            { tipo: 'Profundidade máxima', unidade: 'm' },
            { tipo: 'Profundidade média', unidade: 'm' },
            { tipo: 'Início do voo', unidade: 'meses' },
            { tipo: 'Primeira alimentação sólida', unidade: 'meses' },
            { tipo: 'Saída do ninho', unidade: 'meses' },
            { tipo: 'Saída da toca', unidade: 'meses' },
            { tipo: 'Desmame', unidade: 'meses' },
            { tipo: 'Primeira vocalização', unidade: 'meses' },
            { tipo: 'Maturidade física', unidade: 'meses' },
            { tipo: 'Tamanho do grupo social', unidade: 'centenas' },
            { tipo: 'Composição do grupo social', unidade: 'machos adultos' },
            { tipo: 'Tamanho do território', unidade: 'km²' },
            { tipo: 'Taxa de sucesso da caça', unidade: 'caça individual' },
            { tipo: 'Taxa de mortalidade', unidade: 'mortalidade adulta' },
            { tipo: 'Taxa de mortalidade (cativeiro)', unidade: 'mortalidade adulta' },
            { tipo: 'Altitude mínima', unidade: 'm' },
            { tipo: 'Altitude máxima', unidade: 'm' },
            { tipo: 'Transformações do desenvolvimento', unidade: '' },
            { tipo: 'Número de segmentos', unidade: 'centenas' },
            { tipo: 'Número de patas', unidade: 'centenas' },
            { tipo: 'Número de poros', unidade: 'centenas' },
            { tipo: 'Número de brânquias', unidade: 'centenas' },
            { tipo: 'Número de barbatanas', unidade: 'centenas' },
            { tipo: 'Número de vértebras', unidade: 'centenas' },
            { tipo: 'Número de escamas', unidade: 'centenas' },
            { tipo: 'Número de miômeros', unidade: 'centenas' },
            { tipo: 'Tipo de esqueleto', unidade: '' },
            { tipo: 'Comportamento sazonal', unidade: '' }
        ].forEach(option => {
            if (!generalVisualOptions.some(existing => normalizeSearchText(existing.tipo) === normalizeSearchText(option.tipo))) {
                generalVisualOptions.push(option);
            }
        });
        generalVisualUnits.length = 0;
        generalVisualUnits.push(...generalVisualCatalogUnits);
        ['segundos', 'minutos', 'horas', 'dias', 'semanas', 'meses', 'anos', 'milénios', 'm', 'cm', 'mm', 'km', 'kcal/dia', 'kJ/dia', 'W', 'J/s', 'ml O₂/h', 'L O₂/dia', 'kcal/kg/dia', 'W/kg', 'ml O₂/g/h', 'unidade', 'centenas', 'milhares', 'milhões'].forEach(unit => {
            if (!generalVisualUnits.includes(unit)) generalVisualUnits.push(unit);
        });
        if (!generalVisualOptions.some(option => option.tipo === 'Tempo de Amamentação')) {
            generalVisualOptions.splice(5, 0, { tipo: 'Tempo de Amamentação', unidade: 'meses' });
        }



        const GENERAL_VISUAL_SECTIONS = [
            {
                key: 'geral',
                title: 'Geral',
                icon: 'fa-circle-info',
                models: [
                    'Expetativa média de vida',
                    'Expetativa média de vida (cativeiro)',
                    'Profundidade máxima',
                    'Profundidade média',
                    'Tamanho da População',
                    'Taxa Metabólica Basal média',
                    'Velocidade máxima',
                    'Velocidade média',
                    'Vida útil',
                    'Vida útil (cativeiro)',
                    'Tamanho do grupo social',
                    'Tamanho do território',
                    'Taxa de sucesso da caça',
                    'Taxa de mortalidade',
                    'Taxa de mortalidade (cativeiro)',
                    'Altitude mínima',
                    'Altitude máxima'
                ]
            },
            {
                key: 'habitat',
                title: 'Habitat',
                icon: 'fa-mountain-sun',
                models: ['Bioma', 'Zona Climática']
            },
            {
                key: 'habitos',
                title: 'Hábitos',
                icon: 'fa-arrows-spin',
                models: ['Atividade', 'Comportamento sazonal', 'Locomoção', 'Vida Social', 'Composição do grupo social']
            },
            {
                key: 'fisiologia',
                title: 'Fisiologia',
                icon: 'fa-heart-pulse',
                models: ['Força da mordida', 'Número de dentes', 'Número de mamas', 'Simetria corporal', 'Termorregulação', 'Transformações do desenvolvimento', 'Número de segmentos', 'Número de patas', 'Número de poros', 'Número de brânquias', 'Número de barbatanas', 'Número de vértebras', 'Número de escamas', 'Número de miômeros', 'Tipo de esqueleto']
            },
            {
                key: 'crias',
                title: 'Crias',
                icon: 'fa-baby',
                models: ['Tempo de Amamentação', 'Abertura dos olhos', 'Início da marcha', 'Início da corrida', 'Saída do esconderijo', 'Independência', 'Início do voo', 'Primeira alimentação sólida', 'Saída do ninho', 'Saída da toca', 'Desmame', 'Primeira vocalização', 'Maturidade física']
            }
        ];

        const generalVisualSectionRows = new Map();

        function getGeneralVisualSectionForType(type = '') {
            const normalized = normalizeSearchText(type);
            return GENERAL_VISUAL_SECTIONS.find(section =>
                section.models.some(model => normalizeSearchText(model) === normalized)
            ) || GENERAL_VISUAL_SECTIONS[0];
        }

        function getGeneralVisualSectionByKey(key = '') {
            return GENERAL_VISUAL_SECTIONS.find(section => section.key === key) || GENERAL_VISUAL_SECTIONS[0];
        }

        function buildGeneralVisualSections() {
            generalVisualRowsContainer.innerHTML = '';
            generalVisualRowsContainer.classList.add('general-visual-sections');
            generalVisualSectionRows.clear();

            GENERAL_VISUAL_SECTIONS.forEach(section => {
                const wrapper = document.createElement('section');
                wrapper.className = 'general-visual-section';
                wrapper.dataset.section = section.key;

                const heading = document.createElement('div');
                heading.className = 'general-visual-section-heading';
                heading.innerHTML = `
                    <div class="general-visual-section-title">
                        <i class="fa-solid ${section.icon}" aria-hidden="true"></i>
                        <span>${section.title}</span>
                    </div>
                    <span class="general-visual-section-count">0 parâmetros</span>`;

                const header = document.createElement('div');
                header.className = 'general-visual-row-header general-visual-section-row-header';
                header.innerHTML = `
                    <span>Modelo</span>
                    <span>Mín.</span>
                    <span>Máx.</span>
                    <span>Unidade</span>
                    <span>Género</span>
                    <span>Fase</span>`;

                const rows = document.createElement('div');
                rows.className = 'general-visual-section-rows';
                rows.dataset.sectionRows = section.key;

                const addButton = document.createElement('button');
                addButton.type = 'button';
                addButton.className = 'secondary-action-btn general-visual-section-add';
                addButton.innerHTML = `<i class="fa-solid fa-plus" aria-hidden="true"></i> Adicionar em ${section.title}`;
                addButton.addEventListener('click', () => createGeneralVisualRow('', '', '', '', GENDER_BOTH, 'Adulto', '', section.key));

                wrapper.append(heading, header, rows, addButton);
                generalVisualRowsContainer.appendChild(wrapper);
                generalVisualSectionRows.set(section.key, rows);
            });

            if (addGeneralVisualBtn) addGeneralVisualBtn.style.display = 'none';
            const oldHeader = generalVisualRowsContainer.previousElementSibling;
            if (oldHeader?.classList.contains('general-visual-row-header')) oldHeader.style.display = 'none';
        }

        function updateGeneralVisualSectionCounts() {
            GENERAL_VISUAL_SECTIONS.forEach(section => {
                const rows = generalVisualSectionRows.get(section.key);
                const count = rows?.querySelectorAll('.general-visual-row').length || 0;
                const label = generalVisualRowsContainer.querySelector(`[data-section="${section.key}"] .general-visual-section-count`);
                if (label) label.textContent = `${count} ${count === 1 ? 'parâmetro' : 'parâmetros'}`;
            });
        }

        function fillGeneralVisualTypeSelect(select, selectedValue = '', sectionKey = '') {
            const section = getGeneralVisualSectionByKey(sectionKey || getGeneralVisualSectionForType(selectedValue).key);
            const options = section.models.filter(model =>
                generalVisualOptions.some(option => normalizeSearchText(option.tipo) === normalizeSearchText(model))
            );
            const hasSelected = selectedValue && options.some(option => normalizeSearchText(option) === normalizeSearchText(selectedValue));
            select.innerHTML = `<option value="">Escolhe um modelo</option>` +
                options.map(option => `<option value="${option}">${option}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue}</option>` : '');
            select.value = selectedValue;
        }

        function isDropdownOnlyGeneralModel(type = '') {
            return isSeasonalBehaviorGeneralModel(type) || isGeneralVisualCatalogDropdownOnly(type);
        }

        function isMixedDropdownRangeGeneralModel(type = '') {
            return false;
        }

        function isUnitlessGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('numero de mamas');
        }

        function isPopulationGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('popul');
        }

        function isNursingGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('amament');
        }

        function isFeedingStrategyGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('estrategia') && normalized.includes('alimento');
        }

        function isSeasonalBehaviorGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('comportamento sazonal');
        }

        function getSeasonalBehaviorOptions() {
            return [
                'Migratório',
                'Não-migratório',
                'Parcialmente migratório',
                'Nómada',
                'Dispersivo',
                'Hibernação',
                'Estivação',
                'Torpor',
                'Reprodução sazonal',
                'Alimentação sazonal',
                'Mudança sazonal de habitat',
                'Mudança sazonal de pelagem',
                'Mudança sazonal de plumagem',
                'Acumulação de gordura',
                'Armazenamento de alimento',
                'Redução de atividade na estação seca',
                'Aumento de atividade na estação húmida'
            ];
        }

        function isBaseLifeExpectancyGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('espetativa media de vida') || normalized.includes('expectativa media de vida');
        }

        function isBasalMetabolicRateGeneralModel(type = '') {
            return normalizeSearchText(type).includes('taxa metabolica basal');
        }

        function isDepthGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('profundidade maxima') || normalized.includes('profundidade media');
        }

        function isLifeExpectancyGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return isBaseLifeExpectancyGeneralModel(type) || (normalized.includes('vida') && normalized.includes('media'));
        }

        function getLifeExpectancyUnits() {
            return ['segundos', 'minutos', 'horas', 'dias', 'semanas', 'meses', 'anos', 'milénios'];
        }

        function isCaptivityMovementGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('cativeiro') && (normalized.includes('vida util') || normalized.includes('expectativa media de vida') || normalized.includes('expetativa media de vida'));
        }

        function getCaptivityMovementUnits() {
            return ['m/dia', 'm/semana', 'm/mes', 'm/ano', 'km/dia', 'km/semana', 'km/mes', 'km/ano'];
        }

        function getBasalMetabolicRateUnits() {
            return ['kcal/dia', 'kJ/dia', 'W', 'J/s', 'ml O₂/h', 'L O₂/dia', 'kcal/kg/dia', 'W/kg', 'ml O₂/g/h'];
        }

        function getDepthUnits() {
            return ['m', 'cm', 'mm', 'km'];
        }

        function isDevelopmentMilestoneGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('abertura dos olhos')
                || normalized.includes('inicio da marcha')
                || normalized.includes('inicio da corrida')
                || normalized.includes('saida do esconderijo')
                || normalized === 'independencia'
                || normalized.includes('inicio do voo')
                || normalized.includes('primeira alimentacao solida')
                || normalized.includes('saida do ninho')
                || normalized.includes('saida da toca')
                || normalized === 'desmame'
                || normalized.includes('primeira vocalizacao')
                || normalized.includes('maturidade fisica');
        }

        function isSocialGroupSizeGeneralModel(type = '') {
            return normalizeSearchText(type).includes('tamanho do grupo social');
        }

        function isSocialGroupCompositionGeneralModel(type = '') {
            return normalizeSearchText(type).includes('composicao do grupo social');
        }

        function isTerritorySizeGeneralModel(type = '') {
            return normalizeSearchText(type).includes('tamanho do territorio');
        }

        function isHuntingSuccessGeneralModel(type = '') {
            return normalizeSearchText(type).includes('taxa de sucesso da caca');
        }

        function isMortalityRateGeneralModel(type = '') {
            return normalizeSearchText(type).includes('taxa de mortalidade');
        }

        function isPercentageContextGeneralModel(type = '') {
            return isHuntingSuccessGeneralModel(type) || isMortalityRateGeneralModel(type);
        }

        function isAltitudeGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return normalized.includes('altitude minima') || normalized.includes('altitude maxima');
        }

        function isAnatomicalCountGeneralModel(type = '') {
            const normalized = normalizeSearchText(type);
            return [
                'numero de segmentos',
                'numero de patas',
                'numero de poros',
                'numero de branquias',
                'numero de barbatanas',
                'numero de vertebras',
                'numero de escamas',
                'numero de miomeros'
            ].some(label => normalized.includes(label));
        }

        function getGeneralUnitOptions(type = '') {
            if (isBasalMetabolicRateGeneralModel(type)) return getBasalMetabolicRateUnits();
            if (isDepthGeneralModel(type)) return getDepthUnits();
            if (isCaptivityMovementGeneralModel(type)) return getCaptivityMovementUnits();
            if (isLifeExpectancyGeneralModel(type)) return getLifeExpectancyUnits();
            if (isNursingGeneralModel(type)) return ['dias', 'meses', 'anos'];
            if (isDevelopmentMilestoneGeneralModel(type)) return ['minutos', 'horas', 'dias', 'semanas', 'meses', 'anos'];
            if (isSocialGroupSizeGeneralModel(type)) return ['indivíduos', 'dezenas', 'centenas', 'milhares', 'milhões'];
            if (isSocialGroupCompositionGeneralModel(type)) return ['machos adultos', 'fêmeas adultas', 'subadultos', 'juvenis', 'crias'];
            if (isTerritorySizeGeneralModel(type)) return ['m²', 'hectares', 'km²'];
            if (isHuntingSuccessGeneralModel(type)) return ['caça individual', 'caça em grupo'];
            if (isMortalityRateGeneralModel(type)) return ['mortalidade adulta', 'mortalidade das crias'];
            if (isAltitudeGeneralModel(type)) return ['cm', 'm', 'km'];
            if (isAnatomicalCountGeneralModel(type)) return ['unidade', 'centenas', 'milhares', 'milhões'];
            if (isPopulationGeneralModel(type)) return ['dezenas', 'centenas', 'milhares', 'milhões'];
            return [...generalVisualUnits];
        }

        function getGeneralDefaultUnit(type = '') {
            if (isBasalMetabolicRateGeneralModel(type)) return 'W';
            if (isDepthGeneralModel(type)) return 'm';
            if (isCaptivityMovementGeneralModel(type)) return 'km/dia';
            if (isLifeExpectancyGeneralModel(type)) return 'anos';
            if (isNursingGeneralModel(type)) return 'meses';
            if (isDevelopmentMilestoneGeneralModel(type)) return 'meses';
            if (isSocialGroupSizeGeneralModel(type)) return 'centenas';
            if (isSocialGroupCompositionGeneralModel(type)) return 'machos adultos';
            if (isTerritorySizeGeneralModel(type)) return 'km²';
            if (isHuntingSuccessGeneralModel(type)) return 'caça individual';
            if (isMortalityRateGeneralModel(type)) return 'mortalidade adulta';
            if (isAltitudeGeneralModel(type)) return 'm';
            if (isAnatomicalCountGeneralModel(type)) return 'centenas';
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
            if (isBasalMetabolicRateGeneralModel(type)) return 'Mín.';
            if (isDepthGeneralModel(type)) return 'Mín.';
            if (isCaptivityMovementGeneralModel(type)) return 'Mín.';
            if (isPopulationGeneralModel(type)) return 'Ex: 1200';
            if (isNursingGeneralModel(type)) return 'Ex: 2';
            if (isLifeExpectancyGeneralModel(type)) return 'Ex: 8';
            if (isDevelopmentMilestoneGeneralModel(type)) return 'Ex: 1';
            if (isSocialGroupSizeGeneralModel(type)) return 'Ex: 1';
            if (isSocialGroupCompositionGeneralModel(type)) return 'Ex: 1';
            if (isTerritorySizeGeneralModel(type)) return 'Ex: 1';
            if (isPercentageContextGeneralModel(type)) return 'Ex: 10';
            if (isAltitudeGeneralModel(type)) return 'Ex: 0';
            return type && type.includes('Velocidade') ? 'Ex: 40' : 'Ex: 10';
        }

        function getGeneralMaxPlaceholder(type = '') {
            if (isBasalMetabolicRateGeneralModel(type)) return 'Máx.';
            if (isDepthGeneralModel(type)) return 'Máx.';
            if (isCaptivityMovementGeneralModel(type)) return 'Máx.';
            if (isPopulationGeneralModel(type)) return 'Ex: 3500';
            if (isNursingGeneralModel(type)) return 'Ex: 8';
            if (isLifeExpectancyGeneralModel(type)) return 'Ex: 15';
            if (isDevelopmentMilestoneGeneralModel(type)) return 'Ex: 3';
            if (isSocialGroupSizeGeneralModel(type)) return 'Ex: 5';
            if (isSocialGroupCompositionGeneralModel(type)) return 'Ex: 10';
            if (isTerritorySizeGeneralModel(type)) return 'Ex: 10';
            if (isPercentageContextGeneralModel(type)) return 'Ex: 80';
            if (isAltitudeGeneralModel(type)) return 'Ex: 2500';
            return type && type.includes('Velocidade') ? 'Ex: 80' : 'Ex: 15';
        }

        function configureGeneralVisualRowControls(type, minInput, maxInput, unitSelect, strategySelect) {
            const isStrategy = isDropdownOnlyGeneralModel(type);
            const isUnitless = isUnitlessGeneralModel(type);
            
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
                unitSelect.style.visibility = isUnitless ? 'hidden' : 'visible';
                unitSelect.style.pointerEvents = isUnitless ? 'none' : '';
                unitSelect.tabIndex = isUnitless ? -1 : 0;
                if (strategySelect) {
                    strategySelect.style.display = 'none';
                    strategySelect.style.gridColumn = '';
                }
                minInput.step = '0.01';
                minInput.min = '0';
                if (isUnitless) unitSelect.value = '';
            }
            minInput.placeholder = getGeneralMinPlaceholder(type);
            maxInput.placeholder = getGeneralMaxPlaceholder(type);
        }

        function createGeneralVisualRow(type = '', minValue = '', unit = '', maxValue = '', gender = GENDER_BOTH, fase = 'Adulto', optionValue = '', sectionKey = '') {
            const row = document.createElement('div');
            row.className = 'general-visual-row';
            const section = getGeneralVisualSectionByKey(sectionKey || getGeneralVisualSectionForType(type).key);
            row.dataset.section = section.key;

            const typeSelect = document.createElement('select');
            typeSelect.className = 'general-visual-type';
            fillGeneralVisualTypeSelect(typeSelect, type, section.key);

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
                const isSeasonal = isSeasonalBehaviorGeneralModel(selectedType);
                const config = isSeasonal ? { placeholder: 'Escolhe o comportamento sazonal' } : getGeneralVisualSelectConfig(selectedType);
                const options = isSeasonal
                    ? getSeasonalBehaviorOptions()
                    : [...getGeneralVisualSelectOptions(selectedType)].sort((a, b) => a.localeCompare(b));
                strategySelect.innerHTML = `<option value="">${config?.placeholder || 'Escolhe uma opção'}</option>` +
                    options.map(option => `<option value="${option}">${option}</option>`).join('');
            }
            populateDropdownSelect(type);
            if (isDropdownOnlyGeneralModel(type)) {
                strategySelect.value = minValue || optionValue;
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
                updateGeneralVisualSectionCounts();
                updateGeneralVisualPreview();
            });

            row.append(typeSelect, minInput, strategySelect, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
            const sectionRows = generalVisualSectionRows.get(section.key) || generalVisualRowsContainer;
            sectionRows.appendChild(row);
            updateGeneralVisualSectionCounts();
            updateGeneralVisualPreview();
        }

        function getGeneralVisualData() {
            return [...generalVisualRowsContainer.querySelectorAll('.general-visual-row')]
                .map(row => {
                    const type = row.querySelector('.general-visual-type')?.value || '';
                    const isStrategy = isDropdownOnlyGeneralModel(type);
                    const optionValue = row.querySelector('.general-visual-strategy')?.value || '';
                    const min = isStrategy
                        ? optionValue
                        : (row.querySelector('.general-visual-min')?.value || '');
                    const max = isStrategy ? '' : (row.querySelector('.general-visual-max')?.value || '');
                    return {
                        tipo: type,
                        valor: min,
                        valorMin: min,
                        valorMax: max,
                        opcao: '',
                        unidade: (isStrategy || isUnitlessGeneralModel(type)) ? '' : (row.querySelector('.general-visual-unit')?.value || ''),
                        genero: normalizeGenderValue(row.querySelector('.general-visual-gender-toggle')?.dataset.value, GENDER_BOTH),
                        fase: row.querySelector('.general-visual-fase-toggle')?.dataset.value || 'Adulto'
                    };
                })
                .filter(item => item.tipo && (item.valorMin || item.valorMax || item.valor));
        }

        function getDefaultGeneralVisualOptions() {
            const hiddenByDefault = new Set([
                'Velocidade média',
                'Força da mordida',
                'Estratégia para obter alimento',
                'Estratégia para obter alimentos',
                'Tempo de Amamentação',
                'Vida útil (cativeiro)',
                'Expetativa média de vida (cativeiro)',
                'Taxa Metabólica Basal média',
                'Profundidade máxima',
                'Profundidade média',
                'Número de dentes',
                'Número de mamas',
                'Termorregulação',
                'Simetria corporal',
                'Abertura dos olhos',
                'Início da marcha',
                'Início da corrida',
                'Saída do esconderijo',
                'Independência',
                'Comportamento sazonal'
            ]);
            const normalizedHidden = new Set([...hiddenByDefault].map(item => normalizeSearchText(item)));
            return generalVisualOptions.filter(option => !normalizedHidden.has(normalizeSearchText(option.tipo)));
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
            buildGeneralVisualSections();
            const normalizedItems = collapseCombinedGenderItems(filterLegacyGeneralMatingItems(items));
            if (!Array.isArray(normalizedItems) || normalizedItems.length === 0) {
                GENERAL_VISUAL_SECTIONS.forEach(section => {
                    section.models.forEach(type => {
                        const option = getGeneralVisualOption(type) || { tipo: type, unidade: getGeneralDefaultUnit(type) };
                        if (type !== 'Velocidade média' && type !== 'Força da mordida') {
                            createGeneralVisualRow(type, '', option.unidade, '', option.genero || GENDER_BOTH, option.fase || 'Adulto', '', section.key);
                        }
                    });
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
                item.fase || 'Adulto',
                item.opcao || '',
                getGeneralVisualSectionForType(item.tipo || '').key
            ));
            updateGeneralVisualPreview();
        }

        function formatGeneralVisualValue(item, fallback = '—') {
            if (!item) return fallback;
            const min = item.valorMin ?? item.valor ?? '';
            const max = item.valorMax ?? '';
            const unit = item.unidade || '';
            const value = min && max ? `${min}-${max}` : `${min || max}`;
            const rangeText = isPercentageContextGeneralModel(item.tipo)
                ? `${value}${value ? ' %' : ''}${unit ? ` • ${unit}` : ''}`.trim()
                : `${value}${unit ? ` ${unit}` : ''}`.trim();
            return [item.opcao || '', rangeText].filter(Boolean).join(' • ') || fallback;
        }

        function getGeneralVisualMeta(type = '') {
            if (isSeasonalBehaviorGeneralModel(type)) {
                return { key: 'comportamento-sazonal', title: type || 'Comportamento sazonal', accent: 'accent-seasonal-behavior' };
            }
            if (isBasalMetabolicRateGeneralModel(type)) {
                return { key: 'taxa-metabolica-basal', title: type || 'Taxa Metabólica Basal média', accent: 'accent-metabolic-rate' };
            }
            if (isDepthGeneralModel(type)) {
                const normalized = normalizeSearchText(type);
                return { key: normalized.includes('maxima') ? 'profundidade-maxima' : 'profundidade-media', title: type || (normalized.includes('maxima') ? 'Profundidade máxima' : 'Profundidade média'), accent: normalized.includes('maxima') ? 'accent-depth-max' : 'accent-depth-average' };
            }
            if (isCaptivityMovementGeneralModel(type)) {
                const normalized = normalizeSearchText(type);
                return {
                    key: normalized.includes('vida util') ? 'vida-util-cativeiro' : 'expectativa-cativeiro',
                    title: type || (normalized.includes('vida util') ? 'Vida útil (cativeiro)' : 'Expetativa média de vida (cativeiro)'),
                    accent: normalized.includes('vida util') ? 'accent-captive-lifespan' : 'accent-captive-life-expectancy'
                };
            }
            if (isLifeExpectancyGeneralModel(type)) {
                return { key: 'expectativa-vida', title: type || 'Expetativa média de vida', accent: 'accent-life-expectancy' };
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
            if (key === 'comportamento-sazonal') {
                return `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 12v10"/><path d="M40 58v10"/><path d="M12 40h10"/><path d="M58 40h10"/><path d="M20 20l7 7"/><path d="M53 53l7 7"/><path d="M60 20l-7 7"/><path d="M27 53l-7 7"/><path d="M40 28c8 0 12 6 12 12s-4 12-12 12s-12-6-12-12s4-12 12-12Z"/><path d="M34 40h12"/></svg>`;
            }
            if (key === 'taxa-metabolica-basal') {
                return `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 10c10 9 18 20 18 34c0 15-8 26-18 26S22 59 22 44c0-14 8-25 18-34Z"/><path d="M40 24v19"/><path d="M31 43h18"/><path d="M34 56c4 3 8 3 12 0"/><path d="M58 32h8M14 32h8"/></svg>`;
            }
            if (key === 'profundidade-maxima') {
                return `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 18h44"/><path d="M18 62h44"/><path d="M40 20v40"/><path d="M32 52l8 8l8-8"/><path d="M32 28l8-8l8 8"/><path d="M24 46c8-6 14-6 22 0s14 6 22 0"/></svg>`;
            }
            if (key === 'profundidade-media') {
                return `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 30c8-6 16-6 24 0s16 6 24 0"/><path d="M16 50c8-6 16-6 24 0s16 6 24 0"/><path d="M40 32v18"/><path d="M34 44l6 6l6-6"/><path d="M28 62h24"/></svg>`;
            }
            if (key === 'vida-util-cativeiro') {
                return `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 58c8-16 20-24 36-24"/><path d="M24 62h36"/><path d="M50 21c8 4 12 12 10 21"/><path d="M20 38c8-10 18-14 30-12"/><path d="M30 22c-4 7-4 13 0 20"/><path d="M38 18c-1 9 1 16 7 22"/><path d="M22 50c6 0 10 4 10 10"/><path d="M47 50c8 0 14 4 17 12"/></svg>`;
            }
            if (key === 'expectativa-cativeiro') {
                return `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M24 12h32"/><path d="M24 68h32"/><path d="M29 12c0 13 8 19 11 24c3-5 11-11 11-24"/><path d="M29 68c0-13 8-19 11-24c3 5 11 11 11 24"/><path d="M18 45c6-9 14-13 24-13"/><path d="M47 34c8 0 14 5 17 13"/><path d="M30 42h20"/></svg>`;
            }
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

        if (addGeneralVisualBtn) addGeneralVisualBtn.addEventListener('click', () => createGeneralVisualRow());
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
