// Opção modular: Reprodução > Investimento Parental
(function initParentalInvestmentOption() {
    const PARENTAL_TYPE = 'Investimento Parental';

    const collator = new Intl.Collator('pt-PT', { sensitivity: 'base' });
    const sortPt = (items) => [...items].sort((a, b) => collator.compare(a, b));

    const parentalStages = sortPt([
        'Pré-fertilização',
        'Pré-postura',
        'Pré-eclosão',
        'Pré-nascimento',
        'Pós-eclosão',
        'Pós-nascimento',
        'Pré-desmame',
        'Desmame',
        'Pré-independência',
        'Pós-independência',
        'Juvenil',
        'Adulto jovem'
    ]);

    const parentalCareTypes = sortPt([
        'Nenhum cuidado parental',
        'Abastecimento',
        'Alimentação das crias',
        'Proteção das crias',
        'Incubação dos ovos',
        'Gestação',
        'Amamentação',
        'Transporte das crias',
        'Limpeza das crias',
        'Aquecimento das crias',
        'Arrefecimento das crias',
        'Construção de ninho',
        'Construção de toca',
        'Preparação do local de postura',
        'Defesa do ninho',
        'Defesa do território',
        'Vigilância contra predadores',
        'Camuflagem ou ocultação das crias',
        'Guarda dos ovos',
        'Guarda das crias',
        'Ensino / aprendizagem',
        'Acompanhamento das crias',
        'Condução das crias',
        'Regurgitação de alimento',
        'Produção de alimento especial',
        'Cuidado comunitário',
        'Adoção ou cuidado aloparental',
        'Associação pós-independência com os pais',
        'Abandono após postura',
        'Abandono após nascimento',
        'Transporte no dorso',
        'Alimentação das larvas',
        'Manutenção do ninho',
        'Construção coletiva do ninho',
        'Defesa coletiva do ninho',
        'Cuidado por irmãos',
        'Cuidado por operárias',
        'Preparação de células larvares',
        'Postura individual fixada a substrato',
        'Proteção gelatinosa dos ovos'
    ]);

    const parentalActors = sortPt([
        'Fêmea',
        'Macho',
        'Ambos',
        'Mãe',
        'Pai',
        'Casal reprodutor',
        'Grupo familiar',
        'Grupo social',
        'Comunidade / colónia',
        'Irmãos mais velhos',
        'Fêmeas auxiliares',
        'Machos auxiliares',
        'Indivíduos não progenitores',
        'Nenhum',
        'Rainha',
        'Operárias',
        'Primeira geração de descendentes',
        'Colónia'
    ]);

    const parentalIconSvg = `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M17 48c5-14 15-22 29-22c13 0 23 8 28 22"/><path d="M22 52c7 11 17 17 31 17c10 0 18-4 24-12"/><circle cx="39" cy="43" r="8"/><path d="M39 35V22"/><path d="M30 22h18"/><path d="M16 32c5-8 12-12 21-12"/><path d="M64 32c-5-8-12-12-21-12"/></svg>`;

    function addParentalTypeToCatalogs() {
        if (typeof reproductionTypeDescriptions === 'object' && reproductionTypeDescriptions) {
            reproductionTypeDescriptions[PARENTAL_TYPE] = 'Fase, tipo de cuidado e responsável pelo cuidado parental';
        }
    }

    function optionHtml(options, selectedValue = '', placeholder = 'Selecionar...') {
        const selected = String(selectedValue || '').trim();
        return [`<option value="">${placeholder}</option>`, ...options.map((value) => {
            const safeValue = String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<option value="${safeValue}"${value === selected ? ' selected' : ''}>${safeValue}</option>`;
        })].join('');
    }

    function replaceWithParentalSelect(field, options, placeholder, extraClass) {
        if (!field || field.tagName === 'SELECT' && field.classList.contains('parental-investment-select')) {
            if (field && !field.dataset.parentalHydrated) {
                field.dataset.parentalHydrated = '1';
            }
            return field;
        }

        const previousValue = field?.value || '';
        const select = document.createElement('select');
        select.className = `${field.className || ''} parental-investment-select ${extraClass || ''}`.trim();
        select.setAttribute('aria-label', placeholder);
        select.dataset.parentalHydrated = '1';
        select.innerHTML = optionHtml(options, previousValue, placeholder);
        select.value = options.includes(previousValue) ? previousValue : '';

        if (field?.id) select.id = field.id;
        if (field?.name) select.name = field.name;
        field.replaceWith(select);
        select.addEventListener('change', () => {
            if (typeof updateReproductionPreview === 'function') updateReproductionPreview();
            document.dispatchEvent(new CustomEvent('form-statistics-updated'));
        });
        return select;
    }

    function ensureTypeOption(select) {
        if (!select || select.dataset.parentalTypeReady === '1') return;

        const currentValue = select.value;
        const hasOption = [...select.options].some((option) => option.value === PARENTAL_TYPE || option.textContent.trim() === PARENTAL_TYPE);
        if (!hasOption) {
            const option = document.createElement('option');
            option.value = PARENTAL_TYPE;
            option.textContent = PARENTAL_TYPE;
            select.appendChild(option);
        }

        const options = [...select.options].sort((a, b) => {
            if (!a.value) return -1;
            if (!b.value) return 1;
            return collator.compare(a.textContent.trim(), b.textContent.trim());
        });
        options.forEach((option) => select.appendChild(option));

        if (currentValue && [...select.options].some((option) => option.value === currentValue)) {
            select.value = currentValue;
        }

        select.dataset.parentalTypeReady = '1';
    }

    function getRowSelects(row) {
        return [...row.querySelectorAll('select')];
    }

    function getTypeSelect(row) {
        if (!row) return null;
        return row.querySelector('.reproduction-type') || row.querySelector('.reproduction-row-mode') || null;
    }

    function getEditableFields(row, typeSelect) {
        const selects = getRowSelects(row).filter((select) => select !== typeSelect);
        return {
            minField: row.querySelector('.reproduction-gestation-min, .reproduction-min, [data-field="min"]') || selects[0] || row.querySelector('input'),
            maxField: row.querySelector('.reproduction-gestation-max, .reproduction-max, [data-field="max"]') || selects[1] || row.querySelectorAll('input')[1],
            unitField: row.querySelector('.reproduction-gestation-unit, .reproduction-unit, [data-field="unit"]') || selects[2]
        };
    }

    function rowContainsMisplacedParentalType(row, typeSelect) {
        return getRowSelects(row)
            .filter((select) => select !== typeSelect)
            .some((select) => select.value === PARENTAL_TYPE || select.textContent.includes(PARENTAL_TYPE));
    }

    function normalizeParentalRow(row) {
        if (!row) return;
        const typeSelect = getTypeSelect(row);
        
        if (typeSelect && typeSelect.classList.contains('reproduction-type')) {
            ensureTypeOption(typeSelect);
            if (rowContainsMisplacedParentalType(row, typeSelect)) {
                typeSelect.value = PARENTAL_TYPE;
            }
        }

        const isParental = typeSelect && (typeSelect.value === PARENTAL_TYPE || typeSelect.value === 'parental_investment');
        row.classList.toggle('reproduction-parental-row', Boolean(isParental));
        if (!isParental) return;

        const { minField, maxField, unitField } = getEditableFields(row, typeSelect);

        replaceWithParentalSelect(minField, parentalStages, 'Selecionar fase...', 'parental-stage-select');
        replaceWithParentalSelect(maxField, parentalCareTypes, 'Selecionar cuidado...', 'parental-care-select');
        replaceWithParentalSelect(unitField, parentalActors, 'Selecionar responsável...', 'parental-actor-select');
    }

    function refreshParentalRows() {
        document.querySelectorAll('#reproductionRows .reproduction-row').forEach(normalizeParentalRow);
    }

    function patchPreviewModelHelpers() {
        if (typeof getReproductionVisualMeta === 'function' && !getReproductionVisualMeta.__parentalPatched) {
            const originalGetReproductionVisualMeta = getReproductionVisualMeta;
            getReproductionVisualMeta = function patchedGetReproductionVisualMeta(type = '') {
                if (String(type || '').trim() === PARENTAL_TYPE) {
                    return { key: 'investimentoParental', title: PARENTAL_TYPE, accent: 'accent-parental-investment' };
                }
                return originalGetReproductionVisualMeta(type);
            };
            getReproductionVisualMeta.__parentalPatched = true;
        }

        if (typeof getReproductionModelSvg === 'function' && !getReproductionModelSvg.__parentalPatched) {
            const originalGetReproductionModelSvg = getReproductionModelSvg;
            getReproductionModelSvg = function patchedGetReproductionModelSvg(key = 'reproducao') {
                if (key === 'investimentoParental') return parentalIconSvg;
                return originalGetReproductionModelSvg(key);
            };
            getReproductionModelSvg.__parentalPatched = true;
        }

        if (typeof getReproductionData === 'function' && !getReproductionData.__parentalPatched) {
            const originalGetReproductionData = getReproductionData;
            getReproductionData = function patchedGetReproductionData() {
                const items = originalGetReproductionData();
                const rows = [...document.querySelectorAll('#reproductionRows .reproduction-row')];
                return (Array.isArray(items) ? items : []).map((item, index) => {
                    if (!item || item.tipo !== PARENTAL_TYPE) return item;
                    const row = rows[index];
                    const etapa = row?.querySelector('.parental-stage-select, .reproduction-gestation-min')?.value || item.etapa || item.valorMin || '';
                    const cuidado = row?.querySelector('.parental-care-select, .reproduction-gestation-max')?.value || item.cuidado || item.valorMax || '';
                    const responsavel = row?.querySelector('.parental-actor-select, .reproduction-gestation-unit')?.value || item.responsavel || item.unidade || '';
                    return {
                        ...item,
                        tipo: PARENTAL_TYPE,
                        etapa,
                        cuidado,
                        responsavel,
                        valorMin: etapa,
                        valorMax: cuidado,
                        unidade: responsavel,
                        detalhe: [etapa, cuidado, responsavel].filter(Boolean).join(' • ')
                    };
                });
            };
            getReproductionData.__parentalPatched = true;
        }
    }

    addParentalTypeToCatalogs();
    patchPreviewModelHelpers();
    refreshParentalRows();

    reproductionRowsContainer?.addEventListener('pointerdown', (event) => {
        const row = event.target?.closest?.('.reproduction-row');
        const typeSelect = getTypeSelect(row);
        if (event.target === typeSelect) ensureTypeOption(typeSelect);
    }, true);

    reproductionRowsContainer?.addEventListener('focusin', (event) => {
        const row = event.target?.closest?.('.reproduction-row');
        const typeSelect = getTypeSelect(row);
        if (event.target === typeSelect) ensureTypeOption(typeSelect);
    });

    reproductionRowsContainer?.addEventListener('change', (event) => {
        const row = event.target?.closest?.('.reproduction-row');
        if (!row) return;
        const typeSelect = getTypeSelect(row);
        if (event.target === typeSelect || event.target?.classList?.contains('reproduction-type')) {
            if (typeSelect) typeSelect.dataset.parentalTypeReady = '';
            normalizeParentalRow(row);
        }
    });

    const observer = new MutationObserver(() => {
        if (!reproductionRowsContainer) return;
        observer.disconnect();
        try {
            addParentalTypeToCatalogs();
            patchPreviewModelHelpers();
            refreshParentalRows();
        } finally {
            observer.observe(reproductionRowsContainer, { childList: true, subtree: true });
        }
    });

    if (reproductionRowsContainer) {
        observer.observe(reproductionRowsContainer, { childList: true, subtree: true });
    }

    // Algumas rotinas antigas repopulam o dropdown de Propriedade depois de a linha ser criada.
    // Mantém a opção no primeiro dropdown, em vez de ela cair nas colunas Mín./Máx./Unidade.
    let refreshAttempts = 0;
    const refreshTimer = window.setInterval(() => {
        refreshParentalRows();
        refreshAttempts += 1;
        if (refreshAttempts >= 20) window.clearInterval(refreshTimer);
    }, 250);
})();
