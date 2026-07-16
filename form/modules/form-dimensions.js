// Modelo visual de dimensões
        function getSelectedCategory() {
            return document.getElementById('categoria').value || '';
        }

        function getDimensionOptionsForCategory(category = getSelectedCategory()) {
            const categoryOptions = dimensionOptionsByCategory[category] || [];
            const merged = [...categoryOptions, ...baseDimensionOptions];
            const seen = new Set();
            return merged.filter(option => {
                if (!option?.label || seen.has(option.label)) return false;
                seen.add(option.label);
                return true;
            });
        }

        function getDimensionOption(metric, category = getSelectedCategory()) {
            return getDimensionOptionsForCategory(category).find(option => option.label === metric) ||
                   Object.values(dimensionOptionsByCategory).flat().find(option => option.label === metric) ||
                   baseDimensionOptions.find(option => option.label === metric);
        }

        function fillDimensionMetricSelect(select, selectedValue = '') {
            const options = [...getDimensionOptionsForCategory()].sort((a, b) => a.label.localeCompare(b.label));
            const hasSelected = selectedValue && options.some(option => option.label === selectedValue);
            select.innerHTML = `<option value="">Escolha uma medida</option>` +
                options.map(option => `<option value="${option.label}">${option.label}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue} — fora desta categoria</option>` : '');
            select.value = selectedValue;
        }

        function updateAllDimensionMetricSelects() {
            dimensionRowsContainer.querySelectorAll('.dimension-row').forEach(row => {
                const metricSelect = row.querySelector('.dimension-metric');
                const currentMetric = metricSelect.value;
                fillDimensionMetricSelect(metricSelect, currentMetric);
            });
        }

        function getDefaultDimensionsForCategory(category = getSelectedCategory()) {
            const defaults = dimensionDefaultsByCategory[category] || ['Altura', 'Peso', 'Comprimento total'];
            return defaults.map(label => {
                const option = getDimensionOption(label, category) || { label, unit: 'cm' };
                return { tipo: option.label, valorMin: '', valorMax: '', unidade: option.unit };
            });
        }

        function createDimensionRow(metric = '', minValue = '', unit = '', maxValue = '', gender = GENDER_BOTH, fase = 'Adulto') {
            const row = document.createElement('div');
            row.className = 'dimension-row';

            const metricSelect = document.createElement('select');
            metricSelect.className = 'dimension-metric';
            fillDimensionMetricSelect(metricSelect, metric);

            const minInput = document.createElement('input');
            minInput.className = 'dimension-min';
            minInput.type = 'number';
            minInput.step = '0.01';
            minInput.min = '0';
            minInput.placeholder = 'Ex: 66';
            minInput.value = minValue;

            const maxInput = document.createElement('input');
            maxInput.className = 'dimension-max';
            maxInput.type = 'number';
            maxInput.step = '0.01';
            maxInput.min = '0';
            maxInput.placeholder = 'Ex: 76';
            maxInput.value = maxValue;
            maxInput.title = 'Opcional. Usa para intervalos, como 66-76 cm.';

            const unitSelect = document.createElement('select');
            unitSelect.className = 'dimension-unit';
            unitSelect.innerHTML = dimensionUnits.map(u => `<option value="${u}">${u}</option>`).join('');
            unitSelect.value = unit || getDimensionOption(metric)?.unit || 'cm';

            const genderBtn = document.createElement('button');
            genderBtn.type = 'button';
            genderBtn.className = 'gender-toggle-btn dimension-gender-toggle';
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
            faseBtn.className = 'fase-toggle-btn dimension-fase-toggle';
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
            removeBtn.title = 'Remover medida';

            metricSelect.addEventListener('change', () => {
                const selected = getDimensionOption(metricSelect.value);
                if (selected && !unitSelect.dataset.userChanged) unitSelect.value = selected.unit;
                updateDimensionPreview();
            });
            minInput.addEventListener('input', updateDimensionPreview);
            maxInput.addEventListener('input', updateDimensionPreview);
            unitSelect.addEventListener('change', () => {
                unitSelect.dataset.userChanged = 'true';
                updateDimensionPreview();
            });
            genderBtn.addEventListener('click', () => {
                genderBtn.dataset.value = getNextGenderValue(genderBtn.dataset.value);
                updateGenderBtnUI();
                updateDimensionPreview();
            });
            faseBtn.addEventListener('click', () => {
                faseBtn.dataset.value = faseBtn.dataset.value === 'Adulto' ? 'Cria' : 'Adulto';
                updateFaseBtnUI();
                updateDimensionPreview();
            });
            removeBtn.addEventListener('click', () => {
                row.remove();
                if (dimensionRowsContainer.children.length === 0) createDimensionRow();
                updateDimensionPreview();
            });

            row.append(metricSelect, minInput, maxInput, unitSelect, genderBtn, faseBtn, removeBtn);
            dimensionRowsContainer.appendChild(row);
            updateDimensionPreview();
        }

        function getDimensionData() {
            return [...dimensionRowsContainer.querySelectorAll('.dimension-row')]
                .map(row => {
                    const min = row.querySelector('.dimension-min')?.value || '';
                    const max = row.querySelector('.dimension-max')?.value || '';
                    return {
                        tipo: row.querySelector('.dimension-metric').value,
                        valor: min,
                        valorMin: min,
                        valorMax: max,
                        unidade: row.querySelector('.dimension-unit').value,
                        genero: normalizeGenderValue(row.querySelector('.dimension-gender-toggle')?.dataset.value, GENDER_BOTH),
                        fase: row.querySelector('.dimension-fase-toggle')?.dataset.value || 'Adulto'
                    };
                })
                .filter(item => item.tipo && (item.valorMin || item.valorMax));
        }

        function setDimensionData(dimensions = [], options = {}) {
            const useDefaults = options.useDefaults !== false;
            dimensionRowsContainer.innerHTML = '';
            const normalizedDimensions = collapseCombinedGenderItems(dimensions);
            if (!useDefaults && (!Array.isArray(normalizedDimensions) || normalizedDimensions.length === 0)) {
                updateDimensionPreview();
                return;
            }
            if (!Array.isArray(normalizedDimensions) || normalizedDimensions.length === 0) {
                getDefaultDimensionsForCategory().forEach(item => createDimensionRow(item.tipo, '', item.unidade, '', item.genero || GENDER_BOTH, item.fase || 'Adulto'));
                return;
            }
            normalizedDimensions.forEach(item => createDimensionRow(
                item.tipo,
                item.valorMin ?? item.valor ?? '',
                item.unidade,
                item.valorMax ?? '',
                item.genero || GENDER_BOTH,
                item.fase || 'Adulto'
            ));
            updateDimensionPreview();
        }

        function findDimension(labels) {
            const labelList = labels.map(label => label.toLowerCase());
            const dimensions = getDimensionData();
            return dimensions.find(item => labelList.includes(item.tipo.toLowerCase())) ||
                   dimensions.find(item => labelList.some(label => item.tipo.toLowerCase().includes(label)));
        }

        function formatDimension(item, fallback) {
            if (!item) return fallback;
            const min = item.valorMin ?? item.valor ?? '';
            const max = item.valorMax ?? '';
            const unit = item.unidade || '';
            const value = min && max ? `${min}-${max}` : `${min || max}`;
            return `${value}${unit ? ` ${unit}` : ''}`.trim() || fallback;
        }

        function normalizeDimensionKey(label = '') {
            return String(label).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        function getDimensionVisualMeta(metric = '') {
            const normalized = normalizeDimensionKey(metric);
            if (normalized.includes('bico') && normalized.includes('peso')) return { key: 'peso-bico', title: metric || 'Peso do bico', accent: 'accent-beak' };
            if (normalized.includes('cauda') && normalized.includes('peso')) return { key: 'peso-cauda', title: metric || 'Peso da cauda', accent: 'accent-tail' };
            if (normalized.includes('altura')) return { key: 'altura', title: metric || 'Altura', accent: 'accent-height' };
            if (normalized.includes('peso')) return { key: 'peso', title: metric || 'Peso', accent: 'accent-weight' };
            if (normalized.includes('envergadura')) return { key: 'envergadura', title: metric || 'Envergadura', accent: 'accent-wing' };
            if (normalized.includes('asa')) return { key: 'asa', title: metric || 'Comprimento da asa', accent: 'accent-wing' };
            if (normalized.includes('bico')) return { key: 'bico', title: metric || 'Comprimento do bico', accent: 'accent-beak' };
            if (normalized.includes('lingua')) return { key: 'lingua', title: metric || 'Comprimento da língua', accent: 'accent-tongue' };
            if (normalized.includes('furcal')) return { key: 'furcal', title: metric || 'Comprimento furcal', accent: 'accent-tail' };
            if (normalized.includes('cauda')) return { key: 'cauda', title: metric || 'Comprimento da cauda', accent: 'accent-tail' };
            if (normalized.includes('molares') || normalized.includes('molar')) return { key: 'molares', title: metric || 'Comprimento de grandes molares', accent: 'accent-beak' };
            if (normalized.includes('pata')) return { key: 'patas', title: metric || 'Comprimento das patas', accent: 'accent-leg' };
            if (normalized.includes('ovo')) return { key: 'ovo', title: metric || 'Tamanho do ovo', accent: 'accent-egg' };
            if (normalized.includes('largura')) return { key: 'largura', title: metric || 'Largura', accent: 'accent-width' };
            if (normalized.includes('diametro')) return { key: 'diametro', title: metric || 'Diâmetro do corpo', accent: 'accent-width' };
            if (normalized.includes('comprimento')) return { key: 'comprimento', title: metric || 'Comprimento', accent: 'accent-length' };
            return { key: 'medida', title: metric || 'Medida', accent: 'accent-generic' };
        }

        function getCategoryModelSvg(category = '') {
            const normalized = normalizeDimensionKey(category);
            const bird = `<svg class="animal-model-svg bird-model-svg real-bird-model" viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path class="bird-shadow" d="M52 102C80 110 133 110 171 99"/>
                <ellipse class="bird-head-fill" cx="69" cy="54" rx="18" ry="15"/>
                <path class="bird-beak-fill" d="M47 53L22 60L47 67L58 60L47 53Z"/>
                <path class="bird-body-fill" d="M79 44C96 30 119 26 142 31C163 35 181 49 189 69C191 75 189 81 184 85L171 95H147L129 106H93L99 93H86C74 93 65 86 62 76C60 67 65 55 79 44Z"/>
                <path class="bird-tail-fill" d="M187 67H214L192 84H172C180 80 185 74 187 67Z"/>
                <path class="bird-wing-fill" d="M96 45C117 45 135 58 145 80C134 83 119 82 106 76C96 71 89 63 86 53C89 49 92 47 96 45Z"/>
                <path class="bird-leg-line" d="M101 92L92 113"/>
                <path class="bird-leg-line" d="M116 92L109 113"/>
                <path class="bird-body-line" d="M58 60C59 48 67 40 78 39C96 30 119 26 142 31C163 35 181 49 189 69H214L192 84H171L154 95H130L116 106H90L96 93H86C74 93 65 86 62 76L47 67L22 60L47 53L58 60Z"/>
                <path class="bird-wing-line" d="M90 53C101 57 112 66 120 80"/>
                <path class="bird-wing-line soft" d="M108 48C122 55 134 67 141 81"/>
                <path class="bird-wing-line soft" d="M125 47C138 53 149 64 156 76"/>
                <path class="bird-body-line" d="M58 60C60 51 66 43 74 40"/>
                <circle class="bird-eye" cx="63" cy="51" r="4"/>
            </svg>`;
            const models = {
                                mamiferos: `<svg class="animal-model-svg mammal-model-svg real-mammal-model" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path class="mammal-shadow" d="M54 101C88 109 147 109 187 100"/>
                    <path class="mammal-body-fill" d="M42 73L26 69L43 63H56L67 50L80 38L92 48C107 42 126 41 144 45C162 49 176 59 184 72L198 80L184 86L173 84C165 94 152 100 137 102H120L113 108H102L106 102H86L81 108H70L74 101H58L51 108H40L48 97C40 93 35 84 37 76L42 73Z"/>
                    <path class="mammal-body-line" d="M42 73L26 69L43 63H56L67 50L80 38L92 48C107 42 126 41 144 45C162 49 176 59 184 72L198 80L184 86L173 84C165 94 152 100 137 102H120L113 108H102L106 102H86L81 108H70L74 101H58L51 108H40L48 97C40 93 35 84 37 76L42 73Z"/>
                    <path class="mammal-snout-line" d="M42 73L21 67L42 62"/>
                    <path class="mammal-ear-line" d="M67 50L79 37L91 47"/>
                    <path class="mammal-back-line" d="M93 48C113 45 135 47 153 56"/>
                    <path class="mammal-tail-line" d="M183 72L204 66"/>
                    <path class="mammal-leg-line" d="M69 100L62 115"/>
                    <path class="mammal-leg-line" d="M88 100L84 115"/>
                    <path class="mammal-leg-line" d="M118 101L116 115"/>
                    <path class="mammal-leg-line" d="M144 100L144 115"/>
                    <circle class="mammal-eye" cx="61" cy="60" r="3.5"/>
                </svg>`,
                aves: bird,
                ave: bird,
                peixes: `<svg class="animal-model-svg fish-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M22 55C39 34 62 24 91 24C121 24 145 35 163 55C145 75 121 86 91 86C62 86 39 76 22 55Z"/><path class="animal-line" d="M22 55C39 34 62 24 91 24C121 24 145 35 163 55C145 75 121 86 91 86C62 86 39 76 22 55Z"/><path class="animal-line" d="M163 55L177 35V75L163 55Z"/><path class="animal-line" d="M87 29L73 10"/><path class="animal-line" d="M87 81L73 100"/><circle class="animal-dot" cx="62" cy="50" r="3.5"/></svg>`,
                                repteis: `<svg class="animal-model-svg reptile-model-svg real-reptile-model" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path class="reptile-shadow" d="M44 101C78 109 143 109 193 99"/>
                    <path class="reptile-body-fill" d="M39 73L24 66L41 59H57C65 47 77 39 91 37C104 28 121 25 139 27C161 30 180 41 190 57L211 54L201 66L189 68C183 79 173 87 160 91H143L133 101H121L126 90H103L98 102H86L91 90H70L60 102H47L55 88C47 86 41 81 39 73Z"/>
                    <path class="reptile-body-line" d="M39 73L24 66L41 59H57C65 47 77 39 91 37C104 28 121 25 139 27C161 30 180 41 190 57L211 54L201 66L189 68C183 79 173 87 160 91H143L133 101H121L126 90H103L98 102H86L91 90H70L60 102H47L55 88C47 86 41 81 39 73Z"/>
                    <path class="reptile-head-line" d="M39 73L18 66L39 59"/>
                    <path class="reptile-back-line" d="M100 36C122 33 144 36 162 47"/>
                    <path class="reptile-tail-line" d="M188 58L214 46"/>
                    <path class="reptile-leg-line" d="M71 89L61 108"/>
                    <path class="reptile-leg-line" d="M95 90L89 108"/>
                    <path class="reptile-leg-line" d="M130 90L126 108"/>
                    <path class="reptile-leg-line" d="M155 88L155 106"/>
                    <circle class="reptile-eye" cx="56" cy="62" r="3.5"/>
                </svg>`,
                anfibios: `<svg class="animal-model-svg amphibian-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M38 64C38 38 59 21 90 21C121 21 142 38 142 64C142 86 125 101 99 101H81C55 101 38 86 38 64Z"/><path class="animal-line" d="M38 64C38 38 59 21 90 21C121 21 142 38 142 64C142 86 125 101 99 101H81C55 101 38 86 38 64Z"/><path class="animal-line" d="M64 86L45 104"/><path class="animal-line" d="M78 91L65 108"/><path class="animal-line" d="M102 91L115 108"/><path class="animal-line" d="M116 86L135 104"/><circle class="animal-line" cx="73" cy="42" r="7"/><circle class="animal-line" cx="107" cy="42" r="7"/></svg>`,
                insetos: `<svg class="animal-model-svg insect-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse class="animal-soft-fill" cx="90" cy="58" rx="22" ry="31"/><ellipse class="animal-line" cx="90" cy="58" rx="22" ry="31"/><path class="animal-line" d="M90 20V31"/><path class="animal-line" d="M58 39L74 49"/><path class="animal-line" d="M122 39L106 49"/><path class="animal-line" d="M59 79L75 68"/><path class="animal-line" d="M121 79L105 68"/><path class="animal-line" d="M75 35C61 21 43 21 31 30C35 50 52 58 75 56"/><path class="animal-line" d="M105 35C119 21 137 21 149 30C145 50 128 58 105 56"/></svg>`,
                crustaceos: `<svg class="animal-model-svg crab-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M55 55C55 36 70 25 90 25C110 25 125 36 125 55C125 77 112 91 90 91C68 91 55 77 55 55Z"/><path class="animal-line" d="M55 55C55 36 70 25 90 25C110 25 125 36 125 55C125 77 112 91 90 91C68 91 55 77 55 55Z"/><path class="animal-line" d="M57 51L26 34L18 19L38 26"/><path class="animal-line" d="M123 51L154 34L162 19L142 26"/><path class="animal-line" d="M66 78L45 98"/><path class="animal-line" d="M82 84L74 104"/><path class="animal-line" d="M98 84L106 104"/><path class="animal-line" d="M114 78L135 98"/><circle class="animal-dot" cx="78" cy="46" r="3"/><circle class="animal-dot" cx="102" cy="46" r="3"/></svg>`,
                aracnideos: `<svg class="animal-model-svg spider-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse class="animal-soft-fill" cx="90" cy="59" rx="25" ry="22"/><ellipse class="animal-line" cx="90" cy="59" rx="25" ry="22"/><circle class="animal-line" cx="90" cy="34" r="13"/><path class="animal-line" d="M66 52L36 34L17 37"/><path class="animal-line" d="M64 61L32 61L14 70"/><path class="animal-line" d="M68 70L40 91L19 94"/><path class="animal-line" d="M114 52L144 34L163 37"/><path class="animal-line" d="M116 61L148 61L166 70"/><path class="animal-line" d="M112 70L140 91L161 94"/></svg>`,
                moluscos: `<svg class="animal-model-svg mollusc-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M38 76C42 45 65 25 94 25C120 25 139 41 142 67C130 87 108 98 76 98C58 98 45 91 38 76Z"/><path class="animal-line" d="M38 76C42 45 65 25 94 25C120 25 139 41 142 67C130 87 108 98 76 98C58 98 45 91 38 76Z"/><path class="animal-line" d="M62 82C74 63 89 47 111 35"/><path class="animal-line" d="M86 96C99 76 116 60 139 50"/><path class="animal-line" d="M39 79L15 92"/><path class="animal-line" d="M47 87L20 104"/></svg>`,
                vermes: `<svg class="animal-model-svg worm-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-line" d="M20 68C42 38 61 89 86 58C111 27 130 78 160 44"/><path class="animal-line" d="M36 53L45 61"/><path class="animal-line" d="M68 73L78 63"/><path class="animal-line" d="M103 44L113 54"/><path class="animal-line" d="M136 59L145 49"/></svg>`,
                microscopicos: `<svg class="animal-model-svg micro-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse class="animal-soft-fill" cx="90" cy="58" rx="38" ry="27"/><ellipse class="animal-line" cx="90" cy="58" rx="38" ry="27"/><path class="animal-line" d="M62 39L50 24"/><path class="animal-line" d="M75 33L72 14"/><path class="animal-line" d="M103 33L108 14"/><path class="animal-line" d="M120 42L136 26"/><path class="animal-line" d="M55 70L38 80"/><path class="animal-line" d="M124 72L143 83"/><circle class="animal-dot" cx="78" cy="55" r="3"/><circle class="animal-dot" cx="100" cy="50" r="3"/><circle class="animal-dot" cx="95" cy="67" r="3"/></svg>`,
                extintos: `<svg class="animal-model-svg dino-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M24 74C34 42 60 27 98 31C122 34 139 46 151 65L170 68L157 82H142C137 96 119 104 92 104H73L67 109H53L58 98H39L33 109H19L29 91C23 86 21 80 24 74Z"/><path class="animal-line" d="M24 74C34 42 60 27 98 31C122 34 139 46 151 65L170 68L157 82H142C137 96 119 104 92 104H73L67 109H53L58 98H39L33 109H19L29 91C23 86 21 80 24 74Z"/><path class="animal-line" d="M96 33L111 12"/><path class="animal-line" d="M111 12L125 25"/><circle class="animal-dot" cx="58" cy="44" r="3.5"/></svg>`
            };
            return models[normalized] || bird;
        }

        function getMetricModelSvg(key = 'medida') {
            const icons = {
                altura: `<svg class="metric-model-svg metric-height" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 10v60"/><path d="M18 10l-7 8"/><path d="M18 10l7 8"/><path d="M18 70l-7-8"/><path d="M18 70l7-8"/><path d="M40 19c10 0 18 9 18 24s-8 24-18 24"/><path d="M40 19c-6 5-9 13-9 24s3 19 9 24"/></svg>`,
                peso: `<svg class="metric-model-svg metric-weight" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M25 68h30"/><path d="M40 13l-12 14h24L40 13Z"/><path d="M28 27h24l9 31H19l9-31Z"/><path d="M40 35v8"/></svg>`,
                'peso-bico': `<svg class="metric-model-svg metric-beak-weight" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M15 43h22l24-15v30L37 43H15Z"/><circle cx="23" cy="36" r="3"/><path d="M58 12v12"/><path d="M50 18h16"/><path d="M53 25h10"/></svg>`,
                comprimento: `<svg class="metric-model-svg metric-length" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M11 45h58"/><path d="M11 45l8-8"/><path d="M11 45l8 8"/><path d="M69 45l-8-8"/><path d="M69 45l-8 8"/><path d="M20 31c12-12 28-12 40 0"/></svg>`,
                largura: `<svg class="metric-model-svg metric-width" viewBox="0 0 80 80" fill="none" aria-hidden="true"><ellipse cx="40" cy="41" rx="21" ry="27"/><path d="M18 41h44"/><path d="M18 41l7-7"/><path d="M18 41l7 7"/><path d="M62 41l-7-7"/><path d="M62 41l-7 7"/></svg>`,
                diametro: `<svg class="metric-model-svg metric-diameter" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="25"/><path d="M15 40h50"/><path d="M15 40l7-7"/><path d="M15 40l7 7"/><path d="M65 40l-7-7"/><path d="M65 40l-7 7"/></svg>`,
                bico: `<svg class="metric-model-svg metric-beak" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M13 44c8-15 22-24 37-22c8 1 13 5 16 11h8L61 44H42l-9 9H18l5-9H13Z"/><path d="M57 33h17"/><path d="M57 44h17"/><circle cx="35" cy="31" r="3"/></svg>`,
                lingua: `<svg class="metric-model-svg metric-tongue" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M15 39c8-13 22-20 37-18c8 1 14 5 17 11"/><path d="M18 49c10 8 25 10 39 3c8-4 13-10 13-18"/><path d="M35 48c7 11 21 16 31 8c6-5 6-14-1-18c-9-5-19 4-24 11"/><path d="M38 52c7 4 15 4 22-1"/><circle cx="35" cy="31" r="3"/></svg>`,
                furcal: `<svg class="metric-model-svg metric-furcal" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M10 42h44"/><path d="M54 42l17-15"/><path d="M54 42l17 15"/><path d="M12 32v20"/><path d="M54 25v34"/><path d="M12 62h42"/><path d="M12 62l7-7M12 62l7 7M54 62l-7-7M54 62l-7 7"/></svg>`,
                cauda: `<svg class="metric-model-svg metric-tail" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 44h19"/><path d="M35 44L66 22"/><path d="M35 44L70 44"/><path d="M35 44L66 66"/><path d="M15 33v22"/><path d="M54 22v44"/></svg>`,
                'peso-cauda': `<svg class="metric-model-svg metric-tail-weight" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M12 44h17"/><path d="M29 44L58 23"/><path d="M29 44L62 44"/><path d="M29 44L58 65"/><path d="M56 13v12"/><path d="M48 19h16"/><path d="M51 26h10"/></svg>`,
                asa: `<svg class="metric-model-svg metric-wing" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M14 55C27 30 44 16 67 13C63 34 51 52 30 66H14V55Z"/><path d="M31 28C38 36 42 46 43 59"/><path d="M45 21C51 30 53 40 53 50"/></svg>`,
                envergadura: `<svg class="metric-model-svg metric-wingspan" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M7 42h66"/><path d="M7 42l8-8"/><path d="M7 42l8 8"/><path d="M73 42l-8-8"/><path d="M73 42l-8 8"/><path d="M17 55c8-13 15-20 23-23"/><path d="M63 55c-8-13-15-20-23-23"/></svg>`,
                patas: `<svg class="metric-model-svg metric-legs" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M28 13v39"/><path d="M52 13v39"/><path d="M24 52l-10 12"/><path d="M28 52l4 13"/><path d="M32 52l12 10"/><path d="M48 52l-10 12"/><path d="M52 52l4 13"/><path d="M56 52l12 10"/></svg>`,
                ovo: `<svg class="metric-model-svg metric-egg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 10c13 0 23 17 23 33c0 15-9 27-23 27S17 58 17 43C17 27 27 10 40 10Z"/><path d="M20 70h40"/></svg>`,
                molares: `<svg class="metric-model-svg metric-molar" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M20 20c0-5 10-10 20-10s20 5 20 10c0 10-5 22-5 35c0 5-5 5-5 5c-5 0-5-10-10-10s-5 10-10 10c0 0-5 0-5-5c0-13-5-25-5-35Z"/><path d="M40 12v18"/></svg>`,
                medida: `<svg class="metric-model-svg metric-generic" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 59L58 17l6 6l-42 42l-8-6Z"/><path d="M26 49l6 6"/><path d="M36 39l6 6"/><path d="M46 29l6 6"/></svg>`
            };
            return icons[key] || icons.medida;
        }

        function getDimensionSortOrder(item) {
            const key = getDimensionVisualMeta(item?.tipo).key;
            const order = {
                altura: 0,
                peso: 1,
                comprimento: 2,
                largura: 3,
                diametro: 4,
                envergadura: 5,
                asa: 6,
                bico: 7,
                lingua: 8,
                'peso-bico': 9,
                furcal: 10,
                cauda: 11,
                'peso-cauda': 12,
                patas: 12,
                ovo: 13,
                medida: 99
            };
            return order[key] ?? 50;
        }

        function renderDimensionModelCard(item) {
            const meta = getDimensionVisualMeta(item.tipo);
            return `
                <article class="dimension-model-card ${meta.accent}">
                    <div class="dimension-model-icon">${getMetricModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${meta.title}</div>
                        <div class="dimension-model-value">${formatDimension(item, '—')}</div>
                    </div>
                </article>`;
        }

        function updateAnimalSilhouette() {
            const category = document.getElementById('categoria').value;
            animalSilhouette.innerHTML = getCategoryModelSvg(category);
        }

        function updateDimensionPreview() {
            updateAnimalSilhouette();
            const allDimensions = getDimensionData();
            const height = findDimension(['Altura', 'Altura ao ombro']);
            const weight = findDimension(['Peso']);
            const length = findDimension(['Comprimento total', 'Comprimento do corpo', 'Envergadura']);

            previewHeightValue.textContent = height ? formatDimension(height, '') : '';
            previewHeightValue.closest('.height-ruler')?.classList.toggle('is-empty', !height);

            previewWeightValue.textContent = weight ? formatDimension(weight, '') : '';
            previewWeightValue.classList.toggle('is-empty', !weight);

            previewLengthValue.textContent = length ? formatDimension(length, '') : '';
            previewLengthValue.classList.toggle('is-empty', !length);

            const ordered = [...allDimensions].sort((a, b) => getDimensionSortOrder(a) - getDimensionSortOrder(b));
            previewDimensionModels.innerHTML = ordered.length
                ? ordered.map(renderDimensionModelCard).join('')
                : '<div class="dimension-model-empty">Adiciona medidas para ver um modelo próprio para cada aspeto.</div>';
        }


        // --- INFORMAÇÃO GERAL E MODELO VISUAL ---
        const generalVisualOptions = [
            { tipo: 'Vida útil', unidade: 'anos' },
            { tipo: 'Velocidade máxima', unidade: 'km/h' },
            { tipo: 'Velocidade média', unidade: 'km/h' },
            { tipo: 'Força da mordida', unidade: 'PSI' },
            { tipo: 'Tempo de Amamentação', unidade: 'meses' },
            { tipo: 'Estratégia para obter alimento', unidade: '' },
            { tipo: 'Tamanho da População', unidade: 'milhares' },
            { tipo: 'Atividade', unidade: '' },
            { tipo: 'Função ecológica', unidade: '' },
            { tipo: 'Locomoção', unidade: '' },
            { tipo: 'Zona Climática', unidade: '' },
            { tipo: 'Bioma', unidade: '' }
        ];

        const generalVisualUnits = ['', 'dias', 'meses', 'anos', 'km/h', 'm/s', 'PSI', 'indivíduos', 'dezenas', 'centenas', 'milhares', 'milhões'];
