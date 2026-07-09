// Curiosidades, categorias, arranque e imagem
        function getCuriosidadeValueOptions(type = '') {
            if (type === 'Cor do animal') return Object.keys(curiosidadesColorMap);
            if (type === 'Estado de Conservação') {
                return Object.entries(curiosidadesStatusMeta).map(([code, meta]) => ({ value: code, label: `${meta.name} (${code})` }));
            }
            if (type === 'Tipo de Comunicação') return Object.keys(curiosidadesCommunicationDescriptions).sort((a, b) => a.localeCompare(b));
            if (type === 'Relação com Humanos') return curiosidadesHumanRelationOptions;
            if (type === 'Importância económica para os humanos') return ['Negativo', 'Positivo', 'Negativo/Positivo', 'Neutro'];
            return [];
        }

        function fillCuriosidadeTypeSelect(select, selectedValue = '') {
            const hasSelected = selectedValue && curiosidadesTypeOptions.includes(selectedValue);
            select.innerHTML = '<option value="">Escolhe uma propriedade</option>' +
                curiosidadesTypeOptions.map(option => `<option value="${option}">${option}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue}</option>` : '');
            select.value = selectedValue;
        }

        function fillCuriosidadeValueSelect(select, type = '', selectedValue = '') {
            const options = getCuriosidadeValueOptions(type);
            const hasSelected = selectedValue && options.some(option => (option.value || option) === selectedValue);
            const placeholder = type ? 'Escolhe um valor' : 'Seleciona primeiro a propriedade';
            select.innerHTML = `<option value="">${placeholder}</option>` + options.map(option => {
                if (typeof option === 'string') return `<option value="${option}">${option}</option>`;
                return `<option value="${option.value}">${option.label}</option>`;
            }).join('') + (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue}</option>` : '');
            select.value = selectedValue;
            select.disabled = !type;
        }

        function updateCuriosidadeFaseBtnUI(button) {
            if (!button) return;
            if (button.dataset.value === 'Adulto') {
                button.innerHTML = '<i class="fa-solid fa-paw" style="color: #10b981; font-size: 0.9rem;"></i>';
                button.title = 'Adulto';
            } else {
                button.innerHTML = '<i class="fa-solid fa-baby" style="color: #f59e0b; font-size: 0.9rem;"></i>';
                button.title = 'Cria';
            }
        }

        function parseCuriosidadeTemperature(item = {}) {
            const raw = String(item.valor || item.detalhe || '').trim();
            const result = { min: item.valorMin || '', max: item.valorMax || '', unit: item.unidade || '°C' };
            if ((!result.min && !result.max) && raw) {
                const match = raw.match(/(-?\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(-?\d+(?:[.,]\d+)?))?/);
                if (match) {
                    result.min = match[1] || '';
                    result.max = match[2] || '';
                }
            }
            return result;
        }

        function buildCuriosidadeTemperatureValue(min = '', max = '') {
            const minVal = String(min || '').trim();
            const maxVal = String(max || '').trim();
            if (minVal && maxVal) return `${minVal}-${maxVal} °C`;
            if (minVal) return `${minVal} °C`;
            if (maxVal) return `${maxVal} °C`;
            return '';
        }

        function isSleepHoursCuriosidade(type = '') {
            return normalizeSearchText(type).includes('horas de sono');
        }

        function isDistanceCuriosidade(type = '') {
            return normalizeSearchText(type).includes('distancia percorrida');
        }

        function getCuriosidadeMetricUnits(type = '') {
            if (isSleepHoursCuriosidade(type)) return ['horas/dia', 'horas/semana', 'horas/mes', 'horas/ano'];
            if (isDistanceCuriosidade(type)) return ['m/dia', 'm/semana', 'm/mes', 'm/ano', 'km/dia', 'km/semana', 'km/mes', 'km/ano'];
            return [];
        }

        function getCuriosidadeDefaultMetricUnit(type = '') {
            if (isSleepHoursCuriosidade(type)) return 'horas/dia';
            if (isDistanceCuriosidade(type)) return 'km/dia';
            return '';
        }

        function parseCuriosidadeMetric(item = {}, type = '') {
            const raw = String(item.valor || item.detalhe || '').trim();
            const units = getCuriosidadeMetricUnits(type);
            const defaultUnit = getCuriosidadeDefaultMetricUnit(type);
            const result = { min: item.valorMin || '', max: item.valorMax || '', unit: item.unidade || defaultUnit };
            if ((!result.min && !result.max) && raw) {
                const match = raw.match(/(-?\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(-?\d+(?:[.,]\d+)?))?\s*([^0-9]+)?$/);
                if (match) {
                    result.min = match[1] || '';
                    result.max = match[2] || '';
                    const rawUnit = String(match[3] || '').trim();
                    if (rawUnit && units.includes(rawUnit)) result.unit = rawUnit;
                }
            }
            if (!units.includes(result.unit)) result.unit = defaultUnit;
            return result;
        }

        function buildCuriosidadeMetricValue(min = '', max = '', unit = '') {
            const minVal = String(min || '').trim();
            const maxVal = String(max || '').trim();
            const unitVal = String(unit || '').trim();
            const value = minVal && maxVal ? `${minVal}-${maxVal}` : `${minVal || maxVal}`;
            return `${value}${unitVal ? ` ${unitVal}` : ''}`.trim();
        }

        function renderCuriosidadeValueControls(row, type = '', data = {}) {
            const oldWrapper = row.querySelector('.curiosidade-value-wrapper');
            if (oldWrapper) oldWrapper.remove();

            const wrapper = document.createElement('div');
            wrapper.className = 'curiosidade-value-wrapper';

            if (type === 'Temperatura do Ambiente') {
                wrapper.classList.add('temperature-controls');
                const parsed = parseCuriosidadeTemperature(data);
                const minInput = document.createElement('input');
                minInput.type = 'number';
                minInput.step = '0.1';
                minInput.className = 'curiosidade-temp-min';
                minInput.placeholder = 'Mín.';
                minInput.value = parsed.min;
                const maxInput = document.createElement('input');
                maxInput.type = 'number';
                maxInput.step = '0.1';
                maxInput.className = 'curiosidade-temp-max';
                maxInput.placeholder = 'Máx.';
                maxInput.value = parsed.max;
                const unitBadge = document.createElement('div');
                unitBadge.className = 'curiosidade-unit-badge';
                unitBadge.textContent = '°C';
                minInput.addEventListener('input', updateCuriosidadesPreview);
                maxInput.addEventListener('input', updateCuriosidadesPreview);
                wrapper.append(minInput, maxInput, unitBadge);
            } else if (isSleepHoursCuriosidade(type) || isDistanceCuriosidade(type)) {
                wrapper.classList.add('temperature-controls', 'metric-controls');
                const parsed = parseCuriosidadeMetric(data, type);
                const minInput = document.createElement('input');
                minInput.type = 'number';
                minInput.step = '0.01';
                minInput.min = '0';
                minInput.className = 'curiosidade-metric-min';
                minInput.placeholder = isDistanceCuriosidade(type) ? 'Mín.' : 'Valor';
                minInput.value = parsed.min;
                const maxInput = document.createElement('input');
                maxInput.type = 'number';
                maxInput.step = '0.01';
                maxInput.min = '0';
                maxInput.className = 'curiosidade-metric-max';
                maxInput.placeholder = 'Máx.';
                maxInput.value = parsed.max;
                maxInput.style.display = isSleepHoursCuriosidade(type) ? 'none' : '';
                const unitSelect = document.createElement('select');
                unitSelect.className = 'curiosidade-metric-unit';
                unitSelect.innerHTML = getCuriosidadeMetricUnits(type).map(unit => `<option value="${unit}">${unit}</option>`).join('');
                unitSelect.value = parsed.unit;
                minInput.addEventListener('input', updateCuriosidadesPreview);
                maxInput.addEventListener('input', updateCuriosidadesPreview);
                unitSelect.addEventListener('change', updateCuriosidadesPreview);
                wrapper.append(minInput, maxInput, unitSelect);
            } else {
                const valueSelect = document.createElement('select');
                valueSelect.className = 'curiosidade-value';
                fillCuriosidadeValueSelect(valueSelect, type, data.valor || '');
                valueSelect.addEventListener('change', updateCuriosidadesPreview);
                wrapper.append(valueSelect);
            }

            const anchor = row.querySelector('.curiosidade-gender-toggle');
            row.insertBefore(wrapper, anchor);
        }

        function createCuriosidadeRow(type = '', value = '', gender = GENDER_BOTH, fase = 'Adulto', extra = {}) {
            const row = document.createElement('div');
            row.className = 'curiosidades-row';

            const typeSelect = document.createElement('select');
            typeSelect.className = 'curiosidade-type';
            fillCuriosidadeTypeSelect(typeSelect, type);

            const genderBtn = document.createElement('button');
            genderBtn.type = 'button';
            genderBtn.className = 'gender-toggle-btn curiosidade-gender-toggle';
            genderBtn.dataset.value = normalizeGenderValue(gender, GENDER_BOTH);
            const syncGenderBtn = () => {
                const ui = getGenderUi(genderBtn.dataset.value);
                genderBtn.dataset.value = ui.value;
                genderBtn.innerHTML = ui.html;
                genderBtn.title = ui.title;
            };
            syncGenderBtn();

            const faseBtn = document.createElement('button');
            faseBtn.type = 'button';
            faseBtn.className = 'fase-toggle-btn curiosidade-fase-toggle';
            faseBtn.dataset.value = fase || 'Adulto';
            updateCuriosidadeFaseBtnUI(faseBtn);

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remover campo';

            typeSelect.addEventListener('change', () => {
                renderCuriosidadeValueControls(row, typeSelect.value, {});
                updateCuriosidadesPreview();
            });
            genderBtn.addEventListener('click', () => {
                genderBtn.dataset.value = getNextGenderValue(genderBtn.dataset.value);
                syncGenderBtn();
                updateCuriosidadesPreview();
            });
            faseBtn.addEventListener('click', () => {
                faseBtn.dataset.value = faseBtn.dataset.value === 'Adulto' ? 'Cria' : 'Adulto';
                updateCuriosidadeFaseBtnUI(faseBtn);
                updateCuriosidadesPreview();
            });
            removeBtn.addEventListener('click', () => {
                row.remove();
                if (curiosidadesRowsContainer.children.length === 0) setCuriosidadesData();
                else updateCuriosidadesPreview();
            });

            row.append(typeSelect, genderBtn, faseBtn, removeBtn);
            curiosidadesRowsContainer.appendChild(row);
            renderCuriosidadeValueControls(row, type, { valor: value, ...extra });
            updateCuriosidadesPreview();
        }

        function getCuriosidadesData() {
            return [...curiosidadesRowsContainer.querySelectorAll('.curiosidades-row')]
                .map(row => {
                    const tipo = row.querySelector('.curiosidade-type')?.value || '';
                    let valor = row.querySelector('.curiosidade-value')?.value || '';
                    const item = {
                        tipo,
                        valor,
                        descricao: tipo === 'Tipo de Comunicação' ? (curiosidadesCommunicationDescriptions[valor] || '') : '',
                        genero: normalizeGenderValue(row.querySelector('.curiosidade-gender-toggle')?.dataset.value, GENDER_BOTH),
                        fase: row.querySelector('.curiosidade-fase-toggle')?.dataset.value || 'Adulto'
                    };
                    if (tipo === 'Temperatura do Ambiente') {
                        const min = row.querySelector('.curiosidade-temp-min')?.value || '';
                        const max = row.querySelector('.curiosidade-temp-max')?.value || '';
                        valor = buildCuriosidadeTemperatureValue(min, max);
                        item.valor = valor;
                        item.valorMin = min;
                        item.valorMax = max;
                        item.unidade = '°C';
                    }
                    if (isSleepHoursCuriosidade(tipo) || isDistanceCuriosidade(tipo)) {
                        const min = row.querySelector('.curiosidade-metric-min')?.value || '';
                        const max = row.querySelector('.curiosidade-metric-max')?.value || '';
                        const unit = row.querySelector('.curiosidade-metric-unit')?.value || getCuriosidadeDefaultMetricUnit(tipo);
                        valor = buildCuriosidadeMetricValue(min, max, unit);
                        item.valor = valor;
                        item.valorMin = min;
                        item.valorMax = max;
                        item.unidade = unit;
                    }
                    return item;
                })
                .filter(item => item.tipo && item.valor);
        }

        function getDefaultCuriosidadesRows() {
            return [
                { tipo: 'Cor do animal', valor: '', genero: GENDER_BOTH, fase: 'Adulto' },
                { tipo: 'Estado de Conservação', valor: '', genero: GENDER_BOTH, fase: 'Adulto' },
                { tipo: 'Temperatura do Ambiente', valor: '', valorMin: '', valorMax: '', unidade: '°C', genero: GENDER_BOTH, fase: 'Adulto' },
                { tipo: 'Relação com Humanos', valor: '', genero: GENDER_BOTH, fase: 'Adulto' }
            ];
        }

        function normalizeCuriosidadesData(curiosidades = {}) {
            if (Array.isArray(curiosidades?.detalhes) && curiosidades.detalhes.length) {
                return collapseCombinedGenderItems(curiosidades.detalhes).map(item => ({
                    tipo: item.tipo || '',
                    valor: item.valor || '',
                    valorMin: item.valorMin || '',
                    valorMax: item.valorMax || '',
                    unidade: item.unidade || (item.tipo === 'Temperatura do Ambiente' ? '°C' : getCuriosidadeDefaultMetricUnit(item.tipo || '')),
                    descricao: item.descricao || (item.tipo === 'Tipo de Comunicação' ? (curiosidadesCommunicationDescriptions[item.valor] || '') : ''),
                    genero: item.genero || GENDER_BOTH,
                    fase: item.fase || 'Adulto'
                }));
            }
            const legacyItems = [];
            if (curiosidades?.cor) legacyItems.push({ tipo: 'Cor do animal', valor: curiosidades.cor, genero: GENDER_BOTH, fase: 'Adulto' });
            if (curiosidades?.estadoConservacao) legacyItems.push({ tipo: 'Estado de Conservação', valor: curiosidades.estadoConservacao, genero: GENDER_BOTH, fase: 'Adulto' });
            if (curiosidades?.tipoComunicacao) legacyItems.push({
                tipo: 'Tipo de Comunicação',
                valor: curiosidades.tipoComunicacao,
                descricao: curiosidades.tipoComunicacaoDescricao || curiosidadesCommunicationDescriptions[curiosidades.tipoComunicacao] || '',
                genero: GENDER_BOTH,
                fase: 'Adulto'
            });
            if (curiosidades?.temperaturaAmbiente) {
                const parsed = parseCuriosidadeTemperature({ valor: curiosidades.temperaturaAmbiente });
                legacyItems.push({ tipo: 'Temperatura do Ambiente', valor: curiosidades.temperaturaAmbiente, valorMin: parsed.min, valorMax: parsed.max, unidade: '°C', genero: GENDER_BOTH, fase: 'Adulto' });
            }
            if (curiosidades?.relacaoHumanos) legacyItems.push({ tipo: 'Relação com Humanos', valor: curiosidades.relacaoHumanos, genero: GENDER_BOTH, fase: 'Adulto' });
            if (curiosidades?.importanciaEconomicaHumanos) legacyItems.push({ tipo: 'Importância económica para os humanos', valor: curiosidades.importanciaEconomicaHumanos, genero: GENDER_BOTH, fase: 'Adulto' });
            if (curiosidades?.horasSono) {
                const parsed = parseCuriosidadeMetric({ valor: curiosidades.horasSono }, 'Horas de Sono');
                legacyItems.push({ tipo: 'Horas de Sono', valor: curiosidades.horasSono, valorMin: parsed.min, valorMax: parsed.max, unidade: parsed.unit, genero: GENDER_BOTH, fase: 'Adulto' });
            }
            if (curiosidades?.distanciaPercorrida) {
                const parsed = parseCuriosidadeMetric({ valor: curiosidades.distanciaPercorrida }, 'Distância Percorrida');
                legacyItems.push({ tipo: 'Distância Percorrida', valor: curiosidades.distanciaPercorrida, valorMin: parsed.min, valorMax: parsed.max, unidade: parsed.unit, genero: GENDER_BOTH, fase: 'Adulto' });
            }
            return legacyItems;
        }

        function setCuriosidadesData(items = []) {
            curiosidadesRowsContainer.innerHTML = '';
            const normalizedItems = Array.isArray(items) && items.length ? items : getDefaultCuriosidadesRows();
            normalizedItems.forEach(item => createCuriosidadeRow(
                item.tipo || '',
                item.valor || '',
                item.genero || GENDER_BOTH,
                item.fase || 'Adulto',
                { valorMin: item.valorMin || '', valorMax: item.valorMax || '', unidade: item.unidade || '' }
            ));
            updateCuriosidadesPreview();
        }

        function getPreferredCuriosidadeValue(items, type) {
            const preferred = items.find(item => item.tipo === type && item.genero === GENDER_BOTH && item.fase === 'Adulto');
            if (preferred) return preferred.valor || '';
            return items.find(item => item.tipo === type)?.valor || '';
        }

        function getPreferredCuriosidadeDescription(items, type) {
            const preferred = items.find(item => item.tipo === type && item.genero === GENDER_BOTH && item.fase === 'Adulto');
            const selected = preferred || items.find(item => item.tipo === type);
            if (!selected) return '';
            return selected.descricao || (type === 'Tipo de Comunicação' ? (curiosidadesCommunicationDescriptions[selected.valor] || '') : '');
        }

        function renderCuriosidadeMeta(item) {
            const genderUi = getGenderUi(item.genero || GENDER_BOTH);
            const faseHtml = item.fase === 'Cria'
                ? '<i class="fa-solid fa-baby" style="color: #f59e0b;"></i><span>Cria</span>'
                : '<i class="fa-solid fa-paw" style="color: #10b981;"></i><span>Adulto</span>';
            return `
                <div class="curiosidades-preview-meta">
                    <span class="curiosidades-preview-badge">${genderUi.html}<span>${genderUi.title}</span></span>
                    <span class="curiosidades-preview-badge">${faseHtml}</span>
                </div>
            `;
        }

        function renderCuriosidadePreviewCard(item) {
            if (item.tipo === 'Cor do animal') {
                const hexColor = curiosidadesColorMap[item.valor] || '#cccccc';
                const circleBorder = (item.valor === 'Branco' || item.valor === 'Creme') ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.1)';
                return `
                    <div class="curiosidades-preview-item">
                        <div class="color-preview-circle-wrapper"><div class="color-preview-circle" style="background-color: ${hexColor}; border: ${circleBorder};"></div></div>
                        <div class="curiosidades-preview-info">
                            <span class="preview-label">Cor do Animal</span>
                            <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.valor}</strong>
                            ${renderCuriosidadeMeta(item)}
                        </div>
                    </div>`;
            }

            if (item.tipo === 'Tipo de Comunicação') {
                return `
                    <div class="curiosidades-preview-item communication-preview-item">
                        <div class="communication-preview-icon"><i class="fa-solid fa-comments"></i></div>
                        <div class="curiosidades-preview-info">
                            <span class="preview-label">Tipo de Comunicação</span>
                            <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.valor}</strong>
                            <div class="communication-preview-desc">A descrição fica guardada para a página do animal.</div>
                            ${renderCuriosidadeMeta(item)}
                        </div>
                    </div>`;
            }

            if (item.tipo === 'Temperatura do Ambiente') {
                return `
                    <div class="curiosidades-preview-item environment-preview-item">
                        <div class="environment-preview-icon"><i class="fa-solid fa-temperature-half"></i></div>
                        <div class="curiosidades-preview-info">
                            <span class="preview-label">Temperatura do Ambiente</span>
                            <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.valor}</strong>
                            ${renderCuriosidadeMeta(item)}
                        </div>
                    </div>`;
            }

            if (item.tipo === 'Relação com Humanos') {
                return `
                    <div class="curiosidades-preview-item human-relation-preview-item">
                        <div class="human-relation-preview-icon"><i class="fa-solid fa-handshake-angle"></i></div>
                        <div class="curiosidades-preview-info">
                            <span class="preview-label">Relação com Humanos</span>
                            <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.valor}</strong>
                            <div class="communication-preview-desc">Modelo visual próprio desta relação.</div>
                            ${renderCuriosidadeMeta(item)}
                        </div>
                    </div>`;
            }

            if (item.tipo === 'Importância económica para os humanos') {
                return `
                    <div class="curiosidades-preview-item economic-importance-preview-item">
                        <div class="communication-preview-icon"><i class="fa-solid fa-scale-balanced"></i></div>
                        <div class="curiosidades-preview-info">
                            <span class="preview-label">Importância económica para os humanos</span>
                            <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.valor}</strong>
                            <div class="communication-preview-desc">Modelo visual próprio da relação económica com humanos.</div>
                            ${renderCuriosidadeMeta(item)}
                        </div>
                    </div>`;
            }

            if (item.tipo === 'Horas de Sono') {
                return `
                    <div class="curiosidades-preview-item sleep-preview-item">
                        <div class="communication-preview-icon"><i class="fa-solid fa-moon"></i></div>
                        <div class="curiosidades-preview-info">
                            <span class="preview-label">Horas de Sono</span>
                            <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.valor}</strong>
                            <div class="communication-preview-desc">Modelo visual próprio do descanso diário ou sazonal.</div>
                            ${renderCuriosidadeMeta(item)}
                        </div>
                    </div>`;
            }

            if (item.tipo === 'Distância Percorrida') {
                return `
                    <div class="curiosidades-preview-item distance-preview-item">
                        <div class="communication-preview-icon"><i class="fa-solid fa-route"></i></div>
                        <div class="curiosidades-preview-info">
                            <span class="preview-label">Distância Percorrida</span>
                            <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${item.valor}</strong>
                            <div class="communication-preview-desc">Modelo visual próprio de deslocação e movimento.</div>
                            ${renderCuriosidadeMeta(item)}
                        </div>
                    </div>`;
            }

            const statusMeta = curiosidadesStatusMeta[item.valor] || { bg: '#666', text: '#fff', name: item.valor };
            return `
                <div class="curiosidades-preview-item">
                    <div class="status-preview-badge" style="background-color: ${statusMeta.bg}; color: ${statusMeta.text};">${item.valor}</div>
                    <div class="curiosidades-preview-info">
                        <span class="preview-label">Estado de Conservação</span>
                        <strong style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${statusMeta.name}</strong>
                        ${renderCuriosidadeMeta(item)}
                    </div>
                </div>`;
        }

        function updateCuriosidadesPreview() {
            const selected = getCuriosidadesData();
            const emptyPreview = document.getElementById('curiosidadesEmptyPreview');
            if (!selected.length) {
                curiosidadesPreviewList.innerHTML = '';
                emptyPreview.style.display = 'flex';
                return;
            }
            curiosidadesPreviewList.innerHTML = selected.map(renderCuriosidadePreviewCard).join('');
            emptyPreview.style.display = 'none';
        }

        addCuriosidadesBtn.addEventListener('click', () => createCuriosidadeRow());
        setCuriosidadesData();

        // --- LÓGICA DO SELETOR DE CATEGORIAS MÚLTIPLAS ---
        function getSelectedCategoriesMap() {
            const categoriesMap = {};
            document.querySelectorAll('.categoria-checkbox').forEach(cb => {
                categoriesMap[cb.value] = cb.checked;
            });
            return categoriesMap;
        }

        function getSelectedCategoryLabels() {
            return Array.from(document.querySelectorAll('.categoria-checkbox:checked'))
                .map(cb => cb.getAttribute('data-label'));
        }

        function updateCategorySelectionUI() {
            const checkedBoxes = Array.from(document.querySelectorAll('.categoria-checkbox:checked'));
            const labels = checkedBoxes.map(cb => cb.getAttribute('data-label'));
            
            const labelEl = document.getElementById('multiselect-label');
            if (labels.length > 0) {
                labelEl.textContent = labels.join(', ');
            } else {
                labelEl.textContent = 'Selecione Categorias';
            }
            
            // Compatibilidade com código legado e silhuetas que esperam um único valor no input oculto #categoria
            const selectEl = document.getElementById('categoria');
            selectEl.value = checkedBoxes.length > 0 ? checkedBoxes[0].value : '';
            selectEl.dispatchEvent(new Event('change'));
        }

        function setCategoryData(categoria) {
            document.querySelectorAll('.categoria-checkbox').forEach(cb => {
                cb.checked = false;
            });
            
            if (typeof categoria === 'string') {
                const cb = document.querySelector(`.categoria-checkbox[value="${categoria}"]`);
                if (cb) cb.checked = true;
            } else if (categoria && typeof categoria === 'object') {
                Object.keys(categoria).forEach(key => {
                    const cb = document.querySelector(`.categoria-checkbox[value="${key}"]`);
                    if (cb) cb.checked = !!categoria[key];
                });
            }
            
            updateCategorySelectionUI();
        }

        document.getElementById('multiselect-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('multiselect-options').classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            const options = document.getElementById('multiselect-options');
            if (options && !document.getElementById('categoria-multiselect').contains(e.target)) {
                options.classList.remove('show');
            }
        });
        
        document.querySelectorAll('.categoria-checkbox').forEach(cb => {
            cb.addEventListener('change', updateCategorySelectionUI);
        });

        // --- INICIALIZAÇÃO ---
        async function initializePage() {
            try {
                allAnimals = [];
                const animalsQuery = firestoreQuery(collection(db, "animais"), orderBy("timestamp", "desc"), limit(40));
                const querySnapshot = await getDocs(animalsQuery);
                querySnapshot.forEach(doc => { allAnimals.push({ id: doc.id, ...doc.data() }); });
                allAnimals.sort((a, b) => {
                    const dateA = a.timestamp || 0;
                    const dateB = b.timestamp || 0;
                    return dateB - dateA;
                });
                await loadExistingFamilies();
                
                // Carregar lista de países
                const countriesRes = await fetch('../js/countries.json');
                countryList = await countriesRes.json();
                
                openEditModalBtn.disabled = false;
                openEditModalBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass" style="margin-right: 8px;"></i> Procurar p/ Editar';
            } catch (error) {
                console.error("Erro fatal na inicialização:", error);
                openEditModalBtn.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="margin-right: 8px;"></i> Erro';
            }
        }

        // --- CONTROLO DA PERSPETIVA DA IMAGEM ---
        const btnPreviewImage = document.getElementById('btnPreviewImage');
        const perspectiveModalOverlay = document.getElementById('perspectiveModalOverlay');
        const closePerspectiveModalBtn = document.getElementById('closePerspectiveModalBtn');
        const confirmPerspectiveBtn = document.getElementById('confirmPerspectiveBtn');
        const perspectivePreviewImg = document.getElementById('perspectivePreviewImg');
        const perspectivePreviewImgMobile = document.getElementById('perspectivePreviewImgMobile');
        const posXSlider = document.getElementById('posXSlider');
        const posYSlider = document.getElementById('posYSlider');
        const posXVal = document.getElementById('posXVal');
        const posYVal = document.getElementById('posYVal');
        const hiddenObjectPositionInput = document.getElementById('imagemObjectPosition');
        const previewCardTitle = document.getElementById('previewCardTitle');
        const previewCardSubtitle = document.getElementById('previewCardSubtitle');
        const previewCardTitleMobile = document.getElementById('previewCardTitleMobile');
        const previewCardSubtitleMobile = document.getElementById('previewCardSubtitleMobile');
        const cardPreviewContainer = document.querySelector('.animal-list-item-preview-card');
        const cardPreviewContainerMobile = document.querySelector('.animal-list-item-preview-card-mobile');

        function getScientificNameGateControls() {
            return [...animalForm.querySelectorAll('input, textarea, select, button')]
                .filter(element => {
                    if (element === nomeCientificoInput) return false;
                    if (element.type === 'hidden') return false;
                    return true;
                });
        }

        function updateScientificNameGate({ focusScientificField = false } = {}) {
            const shouldLock = !isEditMode && !nomeCientificoInput.value.trim();
            animalForm.classList.toggle('scientific-gate-active', shouldLock);
            scientificPriorityGroup?.classList.toggle('is-active', shouldLock);

            getScientificNameGateControls().forEach(control => {
                control.disabled = shouldLock;
            });

            if (shouldLock && focusScientificField) {
                nomeCientificoInput.focus();
            }
        }

        btnPreviewImage.addEventListener('click', () => {
            const imgUrl = document.getElementById('imagemUrl').value.trim();
            if (!imgUrl) {
                alert("Por favor, introduza primeiro o URL de uma imagem.");
                return;
            }

            perspectivePreviewImg.src = imgUrl;
            perspectivePreviewImgMobile.src = imgUrl;
            
            const animalName = document.getElementById('nomeAnimal').value.trim() || 'Nome do Animal';
            const scientificName = document.getElementById('nomeCientifico').value.trim() || 'Nome científico';
            previewCardTitle.textContent = animalName;
            previewCardSubtitle.textContent = `(${scientificName})`;
            previewCardTitleMobile.textContent = animalName;
            previewCardSubtitleMobile.textContent = `(${scientificName})`;

            const currentPosition = hiddenObjectPositionInput.value || 'center center';
            let x = 50;
            let y = 50;
            
            const parts = currentPosition.split(' ');
            if (parts.length === 2) {
                const parsePart = (part) => {
                    if (part.endsWith('%')) return parseInt(part);
                    if (part === 'left' || part === 'top') return 0;
                    if (part === 'right' || part === 'bottom') return 100;
                    if (part === 'center') return 50;
                    return 50;
                };
                x = parsePart(parts[0]);
                y = parsePart(parts[1]);
            }

            posXSlider.value = x;
            posYSlider.value = y;
            posXVal.textContent = `${x}%`;
            posYVal.textContent = `${y}%`;

            updatePreviewPosition();
            perspectiveModalOverlay.style.display = 'flex';
        });

        closePerspectiveModalBtn.addEventListener('click', () => {
            perspectiveModalOverlay.style.display = 'none';
        });

        perspectiveModalOverlay.addEventListener('click', (e) => {
            if (e.target === perspectiveModalOverlay) {
                perspectiveModalOverlay.style.display = 'none';
            }
        });

        confirmPerspectiveBtn.addEventListener('click', () => {
            const x = posXSlider.value;
            const y = posYSlider.value;
            hiddenObjectPositionInput.value = `${x}% ${y}%`;
            perspectiveModalOverlay.style.display = 'none';
        });

        posXSlider.addEventListener('input', () => {
            posXVal.textContent = `${posXSlider.value}%`;
            updatePreviewPosition();
        });

        posYSlider.addEventListener('input', () => {
            posYVal.textContent = `${posYSlider.value}%`;
            updatePreviewPosition();
        });

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const x = btn.dataset.x;
                const y = btn.dataset.y;
                posXSlider.value = x;
                posYSlider.value = y;
                posXVal.textContent = `${x}%`;
                posYVal.textContent = `${y}%`;
                updatePreviewPosition();
            });
        });

        function updatePreviewPosition() {
            perspectivePreviewImg.style.objectPosition = `${posXSlider.value}% ${posYSlider.value}%`;
            perspectivePreviewImgMobile.style.objectPosition = `${posXSlider.value}% ${posYSlider.value}%`;
        }

        // Dragging implementation
        let isDragging = false;
        let startX, startY;
        let startPosXSliderVal, startPosYSliderVal;
        let activeDragContainer = null;

        const onMouseDown = (e, container) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startPosXSliderVal = parseInt(posXSlider.value);
            startPosYSliderVal = parseInt(posYSlider.value);
            container.style.cursor = 'grabbing';
            activeDragContainer = container;
        };

        cardPreviewContainer.addEventListener('mousedown', (e) => onMouseDown(e, cardPreviewContainer));
        cardPreviewContainerMobile.addEventListener('mousedown', (e) => onMouseDown(e, cardPreviewContainerMobile));

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            const sensitivity = 0.4;
            let newX = startPosXSliderVal - Math.round(deltaX * sensitivity);
            let newY = startPosYSliderVal - Math.round(deltaY * sensitivity);

            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            posXSlider.value = newX;
            posYSlider.value = newY;
            posXVal.textContent = `${newX}%`;
            posYVal.textContent = `${newY}%`;
            updatePreviewPosition();
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                if (activeDragContainer) {
                    activeDragContainer.style.cursor = 'move';
                    activeDragContainer = null;
                }
            }
        });

        const onTouchStart = (e) => {
            if (e.touches.length !== 1) return;
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startPosXSliderVal = parseInt(posXSlider.value);
            startPosYSliderVal = parseInt(posYSlider.value);
        };

        cardPreviewContainer.addEventListener('touchstart', onTouchStart, { passive: true });
        cardPreviewContainerMobile.addEventListener('touchstart', onTouchStart, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;

            const sensitivity = 0.4;
            let newX = startPosXSliderVal - Math.round(deltaX * sensitivity);
            let newY = startPosYSliderVal - Math.round(deltaY * sensitivity);

            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            posXSlider.value = newX;
            posYSlider.value = newY;
            posXVal.textContent = `${newX}%`;
            posYVal.textContent = `${newY}%`;
            updatePreviewPosition();
        }, { passive: true });

        // --- DISTRIBUIÇÃO E MAPA ---
