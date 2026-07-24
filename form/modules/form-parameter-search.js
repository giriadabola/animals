// Pesquisa global de parâmetros e subparâmetros do formulário.
// IMPORTANTE: unidades (cm, m, kg, W, etc.) são deliberadamente excluídas.
(() => {
    const root = document.getElementById('formParameterSearch');
    const input = document.getElementById('formParameterSearchInput');
    const results = document.getElementById('formParameterSearchResults');
    const clearBtn = document.getElementById('formParameterSearchClear');
    const unlockBtn = document.getElementById('formParameterSearchUnlock');
    const originalParent = root.parentNode;
    const originalNextSibling = root.nextSibling;
    if (!root || !input || !results) return;

    const SECTION_META = {
        geral: { label: 'Informações Gerais', icon: 'fa-circle-info' },
        dimensoes: { label: 'Dimensões', icon: 'fa-ruler-combined' },
        alimentacao: { label: 'Alimentação', icon: 'fa-utensils' },
        ecologia: { label: 'Ecologia', icon: 'fa-seedling' },
        reproducao: { label: 'Reprodução', icon: 'fa-heart' },
        plumagem: { label: 'Revestimento corporal', icon: 'fa-feather-pointed' },
        distribuicao: { label: 'Distribuição', icon: 'fa-map-location-dot' },
        curiosidades: { label: 'Curiosidades', icon: 'fa-lightbulb' }
    };

    const UNIT_VALUES = new Set([
        ...(typeof dimensionUnits !== 'undefined' ? dimensionUnits : []),
        'w','w/kg','j/s','kj/dia','kcal/dia','kcal/kg/dia','ml o₂/h','ml o2/h','ml o₂/g/h','ml o2/g/h','l o₂/dia','l o2/dia',
        'g/dia','g/semana','g/mes','g/mês','g/ano','kg/dia','kg/semana','kg/mes','kg/mês','kg/ano',
        'l/dia','l/semana','l/mes','l/mês','l/ano','°c','dias','semanas','meses','anos','horas','minutos','segundos',
        'unidade','unid.','centenas','milhares','milhões'
    ].map(value => normalize(value)));

    let searchEntries = [];
    function setFloatingSearch(isUnlocked) {
        if (isUnlocked && root.parentNode !== document.body) document.body.appendChild(root);
        if (!isUnlocked && root.parentNode === document.body && originalParent) originalParent.insertBefore(root, originalNextSibling);
        root.classList.toggle('is-unlocked', isUnlocked);
        unlockBtn?.setAttribute('aria-pressed', String(isUnlocked));
        if (unlockBtn) {
            unlockBtn.setAttribute('aria-label', isUnlocked ? 'Trancar pesquisa' : 'Destrancar pesquisa');
            unlockBtn.setAttribute('title', isUnlocked ? 'Trancar pesquisa' : 'Destrancar pesquisa');
            unlockBtn.innerHTML = isUnlocked ? '<i class="fa-solid fa-unlock" aria-hidden="true"></i>' : '<i class="fa-solid fa-lock" aria-hidden="true"></i>';
        }
    }
    let activeIndex = -1;

    function normalize(value = '') {
        return String(value)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function asText(value) {
        if (typeof value === 'string' || typeof value === 'number') return String(value);
        return String(value?.label ?? value?.name ?? value?.value ?? value?.tipo ?? '');
    }

    function isExcludedUnit(value = '') {
        const key = normalize(value);
        return !key || UNIT_VALUES.has(key);
    }

    function addEntry(target, entry) {
        const label = asText(entry.label).trim();
        if (!label || isExcludedUnit(label)) return;
        const parent = asText(entry.parent).trim();
        const key = [entry.section, normalize(parent), normalize(label), entry.kind || 'parameter'].join('|');
        if (target._seen.has(key)) return;
        target._seen.add(key);
        target.push({
            section: entry.section,
            label,
            parent,
            kind: entry.kind || (parent ? 'subparameter' : 'parameter'),
            action: entry.action,
            keywords: normalize([label, parent, SECTION_META[entry.section]?.label, ...(entry.keywords || [])].join(' '))
        });
    }

    function optionValues(values = []) {
        return values.map(asText).filter(Boolean).filter(value => !isExcludedUnit(value));
    }

    function buildIndex() {
        const entries = [];
        entries._seen = new Set();

        // Informações gerais: parâmetros e valores secundários dos dropdowns.
        if (typeof GENERAL_VISUAL_SECTIONS !== 'undefined') {
            GENERAL_VISUAL_SECTIONS.forEach(section => {
                (section.models || []).forEach(parameter => {
                    addEntry(entries, {
                        section: 'geral', label: parameter,
                        keywords: [section.title],
                        action: () => createGeneralTarget(parameter, '', section.key)
                    });
                    let options = [];
                    try {
                        if (typeof getCustomGeneralSelectOptions === 'function') {
                            options = getCustomGeneralSelectOptions(parameter) || [];
                        }
                        if (!options.length && typeof isSeasonalBehaviorGeneralModel === 'function' && isSeasonalBehaviorGeneralModel(parameter) && typeof getSeasonalBehaviorOptions === 'function') {
                            options = getSeasonalBehaviorOptions() || [];
                        }
                        if (!options.length) options = getGeneralVisualSelectOptions(parameter) || [];
                    } catch (_) {}
                    optionValues(options).forEach(value => addEntry(entries, {
                        section: 'geral', label: value, parent: parameter,
                        keywords: [section.title],
                        action: () => createGeneralTarget(parameter, value, section.key)
                    }));
                    if (typeof ANATOMICAL_STRUCTURE_DEFINITIONS !== 'undefined' && ANATOMICAL_STRUCTURE_DEFINITIONS[parameter]) {
                        optionValues(ANATOMICAL_STRUCTURE_DEFINITIONS[parameter]).forEach(value => addEntry(entries, {
                            section: 'geral', label: value, parent: parameter,
                            keywords: ['Estruturas anatómicas'],
                            action: () => createGeneralTarget(parameter, value, section.key)
                        }));
                    }
                });
            });
        }

        // Dimensões: catálogo global, mesmo quando uma medida pertence a outra categoria.
        const dimensionCatalog = [
            ...(typeof baseDimensionOptions !== 'undefined' ? baseDimensionOptions : []),
            ...(typeof dimensionOptionsByCategory !== 'undefined' ? Object.values(dimensionOptionsByCategory).flat() : [])
        ];
        dimensionCatalog.forEach(option => {
            const label = asText(option);
            addEntry(entries, { section: 'dimensoes', label, action: () => createDimensionTarget(label) });
        });

        // Alimentação.
        (typeof feedingModelOptions !== 'undefined' ? feedingModelOptions : []).forEach(parameter => {
            addEntry(entries, { section: 'alimentacao', label: parameter, action: () => createFeedingTarget(parameter, '') });
        });
        optionValues(typeof feedingTypes !== 'undefined' ? feedingTypes : []).forEach(value => addEntry(entries, {
            section: 'alimentacao', label: value, parent: 'Tipo de Alimentação',
            action: () => createFeedingTarget('Tipo de Alimentação', value)
        }));
        optionValues(typeof feedingAnimalOptions !== 'undefined' ? feedingAnimalOptions : []).forEach(value => addEntry(entries, {
            section: 'alimentacao', label: value, parent: 'Tipo de Alimentação',
            action: () => createFeedingTarget('Tipo de Alimentação', value)
        }));
        let strategies = [];
        try { strategies = getFeedingStrategyOptions() || []; } catch (_) {}
        optionValues(strategies).forEach(value => addEntry(entries, {
            section: 'alimentacao', label: value, parent: 'Estratégia para obter alimentos',
            action: () => createFeedingTarget('Estratégia para obter alimentos', value)
        }));
        let ingestionOptions = [];
        try { ingestionOptions = getFeedingStrategyOptions('Mecanismo de ingestão') || []; } catch (_) {}
        optionValues(ingestionOptions).forEach(value => addEntry(entries, {
            section: 'alimentacao', label: value, parent: 'Mecanismo de ingestão',
            action: () => createFeedingTarget('Mecanismo de ingestão', value)
        }));

        // Ecologia.
        (typeof ecologyModelOptions !== 'undefined' ? ecologyModelOptions : []).forEach(parameter => {
            addEntry(entries, { section: 'ecologia', label: parameter, action: () => createEcologyTarget(parameter, '') });
        });
        let ecologicalFunctions = [];
        try { ecologicalFunctions = getEcologicalFunctionOptions() || []; } catch (_) {}
        optionValues(ecologicalFunctions).forEach(value => addEntry(entries, {
            section: 'ecologia', label: value, parent: 'Função Ecológica',
            action: () => createEcologyTarget('Função Ecológica', value)
        }));
        if (typeof ECOLOGY_ADVANCED_OPTIONS !== 'undefined') {
            Object.entries(ECOLOGY_ADVANCED_OPTIONS).forEach(([parameter, values]) => {
                optionValues(values).forEach(value => addEntry(entries, {
                    section: 'ecologia', label: value, parent: parameter,
                    action: () => createEcologyTarget(parameter, value)
                }));
            });
        }

        // Reprodução.
        (typeof reproductionDefaultModels !== 'undefined' ? reproductionDefaultModels : []).forEach(parameter => {
            addEntry(entries, { section: 'reproducao', label: parameter, action: () => createReproductionTarget(parameter, '') });
        });
        const reproductionSecondary = new Map();
        reproductionSecondary.set('Acasalamento', optionValues(typeof matingSystems !== 'undefined' ? matingSystems : []));
        reproductionSecondary.set('Sistema sexual', ['Dióico','Monoico','Hermafrodita simultâneo','Hermafrodita sequencial','Protândrico','Protogínico']);
        reproductionSecondary.set('Época de reprodução', ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro','Primavera','Verão','Outono','Inverno']);
        optionValues(typeof getReproductiveLifeHistoryOptions === 'function' ? getReproductiveLifeHistoryOptions() : []).forEach(value => addEntry(entries, {
            section: 'reproducao', label: value, parent: 'Estratégia reprodutiva › Estratégia',
            keywords: ['estratégia reprodutiva', 'semelparidade', 'iteroparidade'],
            action: () => createReproductiveStrategyTarget('lifeHistory', value)
        }));
        optionValues(typeof getReproductiveTimingOptions === 'function' ? getReproductiveTimingOptions() : []).forEach(value => addEntry(entries, {
            section: 'reproducao', label: value, parent: 'Estratégia reprodutiva › Padrão',
            keywords: ['estratégia reprodutiva', 'padrão reprodutivo'],
            action: () => createReproductiveStrategyTarget('timing', value)
        }));
        ['Comprimento dos ovos', 'Largura dos ovos'].forEach(parameter => addEntry(entries, {
            section: 'reproducao', label: parameter, parent: 'Reprodução',
            action: () => createReproductionTarget(parameter, '')
        }));

        let allReproductionTypes = [];
        if (typeof reproductionTypesByCategory !== 'undefined') allReproductionTypes = Object.values(reproductionTypesByCategory).flat();
        if (typeof reproductionTypeOptionsByCategory !== 'undefined') allReproductionTypes.push(...Object.values(reproductionTypeOptionsByCategory).flat());
        if (typeof birdEggVisuals !== 'undefined') allReproductionTypes.push(...birdEggVisuals.map(item => item.label));
        reproductionSecondary.set('Tipo de reprodução', optionValues(allReproductionTypes));
        reproductionSecondary.forEach((values, parent) => values.forEach(value => addEntry(entries, {
            section: 'reproducao', label: value, parent,
            action: () => createReproductionTarget(parent, value)
        })));
        const parentalSearchCatalog = globalThis.formParentalInvestmentSearchCatalog || {};
        Object.entries(parentalSearchCatalog).forEach(([field, values]) => optionValues(values).forEach(value => addEntry(entries, {
            section: 'reproducao', label: value, parent: `Investimento Parental › ${field}`,
            action: () => createParentalInvestmentTarget(field, value)
        })));

        // Revestimento corporal: todos os grupos e opções de todas as categorias.
        if (typeof bodyCoveringCategoryConfig !== 'undefined') {
            Object.entries(bodyCoveringCategoryConfig).forEach(([category, config]) => {
                Object.entries(config.groups || {}).forEach(([group, label]) => {
                    addEntry(entries, {
                        section: 'plumagem', label, keywords: [category, config.title],
                        action: () => createBodyCoveringTarget(group, '', category)
                    });
                    const direct = config.options?.[group];
                    const fallback = String(group).startsWith('cor_') ? config.options?.cor : (group === 'manchas' ? config.options?.manchas : []);
                    optionValues(direct || fallback || []).forEach(value => addEntry(entries, {
                        section: 'plumagem', label: value, parent: label, keywords: [category, config.title],
                        action: () => createBodyCoveringTarget(group, value, category)
                    }));
                });
            });
        }

        // Distribuição.
        [
            ['Países', '#countrySearchInput'],
            ['Descrição da Distribuição', '#infoDistribuicao'],
            ['Regiões Biogeográficas', '#distributionRegionRows']
        ].forEach(([label, selector]) => addEntry(entries, {
            section: 'distribuicao', label,
            action: () => focusDistributionTarget(selector)
        }));
        const regionValues = ['Neotropical','Neártica','Paleártica','Afrotropical','Indomalaia','Australásia','Oceânica','Antártica'];
        regionValues.forEach(value => addEntry(entries, {
            section: 'distribuicao', label: value, parent: 'Regiões Biogeográficas',
            action: () => createDistributionRegionTarget(value)
        }));

        // Curiosidades.
        (typeof curiosidadesTypeOptions !== 'undefined' ? curiosidadesTypeOptions : []).forEach(parameter => {
            addEntry(entries, { section: 'curiosidades', label: parameter, action: () => createCuriosityTarget(parameter, '') });
            if (typeof isRestingPlaceMaterialsCuriosidade === 'function' && isRestingPlaceMaterialsCuriosidade(parameter)) {
                const materials = typeof getRestingPlaceMaterialOptions === 'function' ? getRestingPlaceMaterialOptions() : [];
                optionValues(materials).forEach(material => addEntry(entries, {
                    section: 'curiosidades',
                    label: material,
                    parent: parameter,
                    keywords: [material, 'material', 'local de repouso'],
                    action: () => createCuriosityTarget(parameter, material, { materiais: [material] })
                }));
            }
            if (typeof isRestingPlaceDimensionsCuriosidade === 'function' && isRestingPlaceDimensionsCuriosidade(parameter)) {
                const restingPlaces = typeof getRestingPlaceOptions === 'function' ? getRestingPlaceOptions() : [];
                const dimensions = typeof RESTING_PLACE_DIMENSION_TYPES !== 'undefined' ? RESTING_PLACE_DIMENSION_TYPES : [];
                restingPlaces.forEach(localRepouso => dimensions.forEach(dimensao => addEntry(entries, {
                    section: 'curiosidades',
                    label: `${dimensao} — ${localRepouso}`,
                    parent: parameter,
                    keywords: [localRepouso, dimensao, 'local de repouso'],
                    action: () => createCuriosityTarget(parameter, '', {
                        localRepouso,
                        dimensao,
                        unidade: dimensao === 'Cor' ? 'Sem cor definida' : 'cm'
                    })
                })));
            }
            let options = [];
            try { options = getCuriosidadeValueOptions(parameter) || []; } catch (_) {}
            optionValues(options).forEach(value => addEntry(entries, {
                section: 'curiosidades', label: value, parent: parameter,
                action: () => createCuriosityTarget(parameter, value)
            }));
        });

        delete entries._seen;
        return entries.sort((a, b) => a.label.localeCompare(b.label, 'pt', { sensitivity: 'base' }));
    }

    function switchTab(section) {
        const button = document.querySelector(`.form-tab-nav-btn[data-tab="${section}"]`);
        if (button && button.style.display === 'none') button.style.display = '';
        button?.click();
        const visualSubtab = document.querySelector(`#tabpanel-${section} .form-subtab-nav-btn[data-subtab$="modelo-visual"]`);
        visualSubtab?.click();
    }

    function finishTarget(target) {
        closeResults();
        input.value = '';
        root.classList.remove('has-value');
        window.setTimeout(() => {
            if (!target) return;
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.classList.remove('form-search-target-flash');
            void target.offsetWidth;
            target.classList.add('form-search-target-flash');
            const firstEditable = target.querySelector('input:not([type="hidden"]), select, textarea, button');
            window.setTimeout(() => firstEditable?.focus({ preventScroll: true }), 500);
        }, 90);
    }

    function createGeneralTarget(parameter, value, sectionKey) {
        switchTab('geral');
        const before = new Set(document.querySelectorAll('.general-visual-row'));
        createGeneralVisualRow(parameter, '', '', '', GENDER_BOTH, 'Adulto', value, sectionKey);
        const row = [...document.querySelectorAll('.general-visual-row')].find(item => !before.has(item)) || [...document.querySelectorAll('.general-visual-row')].at(-1);
        finishTarget(row);
    }

    function createDimensionTarget(parameter) {
        switchTab('dimensoes');
        createDimensionRow(parameter);
        finishTarget(dimensionRowsContainer.querySelector('.dimension-row:last-child'));
    }

    function createParentalInvestmentTarget(field, value) {
        switchTab('reproducao');
        createReproductionRow('Investimento Parental');
        const row = reproductionRowsContainer.querySelector('.reproduction-row:last-child');
        const selectors = {
            'Fase': '.parental-stage-select',
            'Tipo de cuidado': '.parental-care-select',
            'Responsável': '.parental-actor-select'
        };
        const applyValue = () => {
            const select = row?.querySelector(selectors[field]);
            if (!select) return false;
            select.value = value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        };
        let attempts = 0;
        const applyWhenReady = () => {
            if (applyValue() || attempts++ >= 10) return;
            window.setTimeout(applyWhenReady, 25);
        };
        applyWhenReady();
        finishTarget(row);
    }

    function createFeedingTarget(parameter, value) {
        switchTab('alimentacao');
        let detail = value;
        if (parameter === 'Tipo de Alimentação' && value && typeof feedingTypes !== 'undefined' && !feedingTypes.includes(value)) {
            detail = value;
        }
        createFeedingRow(parameter, detail);
        finishTarget(feedingRowsContainer.querySelector('.feeding-row:last-child'));
    }

    function createEcologyTarget(parameter, value) {
        switchTab('ecologia');
        const data = parameter === 'Função Ecológica'
            ? { valor: value, detalhe: value, descricao: value }
            : parameter === 'Relações Simbióticas' ? { tipoRelacao: value, relacao: value } : {};
        createEcologyRow(parameter, data);
        const row = ecologyRowsContainer.querySelector('.ecology-row:last-child');
        if (value && row) {
            const control = [...row.querySelectorAll('select, input')].find(el => !/unit|unidade/i.test(el.className) && [...(el.options || [])].some?.(opt => opt.value === value));
            if (control) { control.value = value; control.dispatchEvent(new Event('change', { bubbles: true })); }
        }
        finishTarget(row);
    }

    function createReproductionTarget(parameter, value) {
        switchTab('reproducao');
        createReproductionRow(parameter, value);
        finishTarget(reproductionRowsContainer.querySelector('.reproduction-row:last-child'));
    }

    function createReproductiveStrategyTarget(field, value) {
        switchTab('reproducao');
        const selector = field === 'timing' ? '.reproduction-strategy-timing' : '.reproduction-strategy-life-history';
        let row = [...reproductionRowsContainer.querySelectorAll('.reproduction-row')].find(candidate =>
            candidate.querySelector('.reproduction-row-mode')?.value === 'estrategia_reprodutiva'
            && !candidate.querySelector(selector)?.value
        ) || null;
        if (!row) {
            createReproductionRow('Estratégia reprodutiva', '');
            row = reproductionRowsContainer.querySelector('.reproduction-row:last-child');
        }
        const control = row?.querySelector(selector);
        if (control) {
            control.value = value;
            control.dispatchEvent(new Event('change', { bubbles: true }));
        }
        finishTarget(row);
    }

    function createBodyCoveringTarget(group, value, category) {
        switchTab('plumagem');
        // O modelo é criado mesmo quando a opção pesquisada pertence a outra categoria.
        // Nesse caso, a opção fica preservada como valor personalizado.
        createPlumageRow(group, value, '', { sourceCategory: category });
        finishTarget(plumageRowsContainer?.querySelector('.plumage-row:last-child') || document.querySelector('.plumage-row:last-child'));
    }

    function focusDistributionTarget(selector) {
        switchTab('distribuicao');
        const target = document.querySelector(selector) || document.getElementById('tabpanel-distribuicao');
        finishTarget(target?.closest('.form-group, .distribution-region-editor, section') || target);
    }

    function createDistributionRegionTarget(value) {
        switchTab('distribuicao');
        if (typeof globalThis.addDistributionRegionRow === 'function') globalThis.addDistributionRegionRow(value);
        const target = document.querySelector('#distributionRegionRows > *:last-child') || document.getElementById('distributionRegionRows');
        finishTarget(target);
    }

    function createCuriosityTarget(parameter, value, extra = {}) {
        switchTab('curiosidades');
        const isRestingPlaceTarget = typeof isRestingPlaceDimensionsCuriosidade === 'function'
            && isRestingPlaceDimensionsCuriosidade(parameter)
            && extra.localRepouso;
        const isRestingMaterialsTarget = typeof isRestingPlaceMaterialsCuriosidade === 'function'
            && isRestingPlaceMaterialsCuriosidade(parameter)
            && Array.isArray(extra.materiais)
            && extra.materiais.length;
        let target = null;
        if (isRestingPlaceTarget) {
            target = [...curiosidadesRowsContainer.querySelectorAll('.curiosidades-row')].find(row =>
                row.querySelector('.curiosidade-type')?.value === parameter
                && !row.querySelector('.curiosidade-resting-place')?.value
            ) || null;
        }
        if (!target && isRestingMaterialsTarget) {
            target = [...curiosidadesRowsContainer.querySelectorAll('.curiosidades-row')].find(row =>
                row.querySelector('.curiosidade-type')?.value === parameter
            ) || null;
            if (target) {
                const selectedMaterials = [...target.querySelectorAll('.curiosidade-material-option input:checked')]
                    .map(control => control.value);
                extra.materiais = [...new Set([...selectedMaterials, ...extra.materiais])];
            }
        }
        if (target) {
            renderCuriosidadeValueControls(target, parameter, { valor: value, ...extra });
            updateCuriosidadesPreview();
        } else {
            createCuriosidadeRow(parameter, value, GENDER_BOTH, 'Adulto', extra);
            target = curiosidadesRowsContainer.querySelector('.curiosidades-row:last-child');
        }
        finishTarget(target);
    }

    function scoreEntry(entry, query) {
        const label = normalize(entry.label);
        const parent = normalize(entry.parent);
        if (label === query) return 1000;
        if (label.startsWith(query)) return 800;
        if (label.includes(query)) return 650;
        if (parent === query) return 550;
        if (parent.startsWith(query)) return 480;
        if (entry.keywords.includes(query)) return 300;
        const terms = query.split(' ').filter(Boolean);
        if (terms.every(term => entry.keywords.includes(term))) return 220;
        return 0;
    }

    function search(query) {
        const normalized = normalize(query);
        if (!normalized) return [];
        return searchEntries
            .map(entry => ({ entry, score: scoreEntry(entry, normalized) }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label, 'pt', { sensitivity: 'base' }))
            .slice(0, 30)
            .map(item => item.entry);
    }

    function escapeHtml(value = '') {
        return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
    }

    function renderResults(matches) {
        activeIndex = matches.length ? 0 : -1;
        if (!matches.length) {
            results.innerHTML = '<div class="form-parameter-search-empty">Nenhum parâmetro ou subparâmetro encontrado.</div>';
        } else {
            results.innerHTML = matches.map((entry, index) => {
                const meta = SECTION_META[entry.section] || SECTION_META.geral;
                const path = entry.parent ? `${meta.label} › ${entry.parent}` : meta.label;
                return `<button type="button" class="form-parameter-search-result${index === 0 ? ' is-active' : ''}" role="option" data-result-index="${index}" aria-selected="${index === 0}">
                    <span class="form-parameter-search-result-icon"><i class="fa-solid ${meta.icon}" aria-hidden="true"></i></span>
                    <span class="form-parameter-search-result-copy">
                        <span class="form-parameter-search-result-title">${escapeHtml(entry.label)}</span>
                        <span class="form-parameter-search-result-path">${escapeHtml(path)}</span>
                    </span>
                    <span class="form-parameter-search-result-kind">${entry.parent ? 'Subparâmetro' : 'Parâmetro'}</span>
                </button>`;
            }).join('');
        }
        results.hidden = false;
        input.setAttribute('aria-expanded', 'true');
        results._matches = matches;
    }

    function closeResults() {
        results.hidden = true;
        results.innerHTML = '';
        results._matches = [];
        activeIndex = -1;
        input.setAttribute('aria-expanded', 'false');
    }

    function setActiveResult(index) {
        const buttons = [...results.querySelectorAll('.form-parameter-search-result')];
        if (!buttons.length) return;
        activeIndex = (index + buttons.length) % buttons.length;
        buttons.forEach((button, i) => {
            const active = i === activeIndex;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        buttons[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }

    function choose(index) {
        const entry = results._matches?.[index];
        if (!entry || typeof entry.action !== 'function') return;
        entry.action();
    }

    input.addEventListener('input', () => {
        root.classList.toggle('has-value', !!input.value);
        const matches = search(input.value);
        if (!input.value.trim()) closeResults();
        else renderResults(matches);
    });

    input.addEventListener('focus', () => {
        if (input.value.trim()) renderResults(search(input.value));
    });

    input.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown') { event.preventDefault(); setActiveResult(activeIndex + 1); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); setActiveResult(activeIndex - 1); }
        else if (event.key === 'Enter') { event.preventDefault(); choose(activeIndex); }
        else if (event.key === 'Escape') { closeResults(); input.blur(); }
    });

    results.addEventListener('mousedown', event => event.preventDefault());
    results.addEventListener('click', event => {
        const button = event.target.closest('[data-result-index]');
        if (button) choose(Number(button.dataset.resultIndex));
    });

    clearBtn?.addEventListener('click', () => {
        input.value = '';
        root.classList.remove('has-value');
        closeResults();
        input.focus();
    });

    unlockBtn?.addEventListener('click', () => { setFloatingSearch(!root.classList.contains('is-unlocked')); input.focus(); });

    document.addEventListener('click', event => {
        if (!root.contains(event.target)) closeResults();
    });

    searchEntries = buildIndex();
    window.formParameterSearch = {
        rebuild() { searchEntries = buildIndex(); return searchEntries.length; },
        getEntries() { return [...searchEntries]; }
    };
})();
