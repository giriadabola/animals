// Popup para receber texto extraído de fontes externas.
(() => {
    const overlay = document.getElementById('formTextImportModalOverlay');
    const trigger = document.getElementById('openFormTextImportBtn');
    const textarea = document.getElementById('formTextImportTextarea');
    const closeButton = document.getElementById('closeFormTextImportBtn');
    const closeBottomButton = document.getElementById('closeFormTextImportBtnBottom');
    const pasteButton = document.getElementById('pasteFromClipboardBtn');
    const automateButton = document.getElementById('automateFormTextImportBtn');
    const preview = document.getElementById('formTextImportPreview');
    const previewList = document.getElementById('formTextImportPreviewList');
    const previewCount = document.getElementById('formTextImportPreviewCount');
    const status = document.getElementById('formTextImportStatus');
    if (!overlay || !trigger || !textarea) return;

    let lastFocusedElement = null;
    let parsedRows = [];

    const normalize = value => String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const isMissing = value => !String(value || '').trim() || ['nao especificado', 'sem unidade', 'n/a', '—', '-'].includes(normalize(value));
    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

    function normalizeCategory(value) {
        const key = normalize(value);
        if (key.includes('informac')) return 'Informações Gerais';
        if (key.includes('dimens')) return 'Dimensões';
        if (key.includes('aliment')) return 'Alimentação';
        if (key.includes('ecolog')) return 'Ecologia';
        if (key.includes('reprod')) return 'Reprodução';
        if (key.includes('revest') || key.includes('plumag') || key.includes('pelag')) return 'Revestimento corporal';
        if (key.includes('distrib')) return 'Distribuição';
        if (key.includes('curios')) return 'Curiosidades';
        return String(value || '').trim();
    }

    function normalizeGender(value) {
        const key = normalize(value);
        if (key === 'macho' || key === 'masculino') return 'M';
        if (key === 'femea' || key === 'feminino') return 'F';
        return GENDER_BOTH;
    }

    function normalizePhase(value) {
        const key = normalize(value);
        return key.includes('cria') || key.includes('juven') ? 'Cria' : 'Adulto';
    }

    function parseLine(line, index) {
        const parts = line.split(/\s*>\s*/).map(part => part.trim());
        if (parts.length < 3) return null;
        const [rawCategory, parameter, first = '', second = '', unit = '', gender = '', phase = '', context = '', valueType = '', ...sourceParts] = parts;
        const category = normalizeCategory(rawCategory);
        if (!['Informações Gerais', 'Dimensões', 'Alimentação', 'Ecologia', 'Reprodução', 'Revestimento corporal', 'Distribuição', 'Curiosidades'].includes(category) || !parameter) return null;
        return {
            id: index,
            category,
            parameter,
            first: isMissing(first) ? '' : first,
            second: isMissing(second) ? '' : second,
            unit: isMissing(unit) ? '' : (unit === 'unid.' ? 'unidade' : unit),
            gender: normalizeGender(gender),
            phase: normalizePhase(phase),
            context: isMissing(context) ? '' : context,
            valueType: isMissing(valueType) ? '' : valueType,
            source: sourceParts.join(' > ').trim()
        };
    }

    function buildImportedGeneralItem(row) {
        const parameterKey = normalize(row.parameter);
        const valueKey = normalize(row.first);
        const biomaOnlyValues = new Set(['rio', 'delta', 'lago', 'mar profundo', 'oceano aberto', 'plataforma continental', 'zona abissal', 'zona batial', 'zona bentonica', 'zona neritica', 'zona pelagica']);
        const tipo = parameterKey === 'habitats' && biomaOnlyValues.has(valueKey) ? 'Bioma' : row.parameter;
        return { tipo, valor: row.first, valorMin: row.first, valorMax: row.second, unidade: row.unit, genero: row.gender, fase: row.phase };
    }

    function normalizeImportedReproductionParameter(parameter) {
        const key = normalize(parameter);
        const aliases = {
            'sistema de acasalamento': 'Acasalamento',
            'acasalamento': 'Acasalamento',
            'epoca de reproducao': 'Época de reprodução',
            'temporada de reproducao': 'Época de reprodução',
            'numero de ovos': 'Número de ovos',
            'tempo ate a eclosao': 'Tempo até à eclosão',
            'maturidade sexual': 'Maturidade Sexual',
            'sistema sexual': 'Sistema sexual',
            'tipo de reproducao': 'Tipo de reprodução',
            'investimento parental': 'Investimento Parental',
            'intervalo reprodutivo': 'Intervalo entre nascimentos',
            'intervalo entre nascimentos': 'Intervalo entre nascimentos',
            'numero de crias': 'Número de Crias',
            'duracao do estro': 'Duração do estro',
            'frequencia de acasalamento durante o estro': 'Frequência de acasalamento durante o estro',
            'taxa de sucesso reprodutivo': 'Taxa de sucesso reprodutivo',
            'idade da metamorfose': 'Idade da metamorfose',
            'numero de mudas': 'Número de mudas',
            'numero de estadios larvais': 'Número de estádios larvais',
            'tempo de gestacao': 'Tempo de Gestação'
        };
        return aliases[key] || String(parameter || '').trim();
    }

    function normalizeImportedReproductionValue(parameter, value) {
        const parameterKey = normalize(parameter);
        const valueKey = normalize(value);
        if (parameterKey === 'acasalamento') {
            const matingAliases = {
                'monogamico': 'Monogamia',
                'monogamica': 'Monogamia',
                'poligamico': 'Poligamia',
                'poliginico': 'Poliginia',
                'poliandrico': 'Poliandria',
                'promiscuo': 'Promíscuo'
            };
            return matingAliases[valueKey] || String(value || '').trim();
        }
        if (parameterKey === 'sistema sexual') {
            const sexualAliases = {
                'gonocorico': 'Dióico',
                'gonocoristico': 'Dióico',
                'dioico': 'Dióico',
                'sexos separados': 'Dióico'
            };
            return sexualAliases[valueKey] || String(value || '').trim();
        }
        if (parameterKey === 'tipo de reproducao') {
            const reproductionAliases = {
                'oviparo': 'Ovíparo',
                'oviparos': 'Ovíparo',
                'viviparo': 'Vivíparo',
                'viviparos': 'Vivíparo',
                'ovoviviparo': 'Ovovivíparo'
            };
            return reproductionAliases[valueKey] || String(value || '').trim();
        }
        return String(value || '').trim();
    }

    function normalizeImportedEcologyType(parameter) {
        const key = normalize(parameter);
        if (key.includes('predador')) return 'Predadores naturais';
        if (key.includes('presa')) return 'Presas';
        if (key.includes('competidor')) return 'Competidores';
        if (key.includes('ameaca')) return 'Ameaças naturais';
        if (key.includes('simbiot')) return 'Relações Simbióticas';
        if (key.includes('funcao ecologica')) return 'Função Ecológica';
        if (key.includes('importancia economica')) return 'Importância económica para os humanos';
        return String(parameter || '').trim();
    }

    function extractImportedScientificRefs(value) {
        const text = String(value || '');
        const candidates = [];
        const parenthetical = [...text.matchAll(/\(([A-Z][A-Za-z-]+\s+[a-z][A-Za-z-]+)\)/g)];
        parenthetical.forEach(match => candidates.push(match[1]));
        if (!candidates.length) {
            const scientificPairs = [...text.matchAll(/\b([A-Z][A-Za-z-]+\s+[a-z][A-Za-z-]+)\b/g)];
            scientificPairs.forEach(match => candidates.push(match[1]));
        }
        return [...new Set(candidates.map(value => value.trim()).filter(Boolean))]
            .map(nomeCientifico => ({ nomeCientifico }));
    }

    function buildImportedEcologyItem(row) {
        const tipo = normalizeImportedEcologyType(row.parameter);
        const relationTypes = new Set(['Predadores naturais', 'Presas', 'Competidores', 'Ameaças naturais', 'Relações Simbióticas']);
        if (relationTypes.has(tipo)) {
            const animais = extractImportedScientificRefs(row.first);
            return { tipo, animais, texto: animais.length ? '' : row.first, genero: row.gender, fase: row.phase };
        }
        if (tipo === 'Função Ecológica' || tipo === 'Importância económica para os humanos') {
            return { tipo, valor: row.first, genero: row.gender, fase: row.phase };
        }
        return { tipo, animais: [], texto: row.first, genero: row.gender, fase: row.phase };
    }

    function buildImportedReproductionItem(row) {
        const parameter = normalizeImportedReproductionParameter(row.parameter);
        const parameterKey = normalize(parameter);
        let value = normalizeImportedReproductionValue(parameter, row.first);

        if (parameterKey === 'epoca de reproducao' && value.includes(';')) {
            const months = value.split(';').map(part => part.trim()).filter(Boolean);
            value = months.length > 1 ? `${months[0]}-${months[months.length - 1]}` : months[0] || '';
        }
        if (parameterKey === 'investimento parental' && value.includes(';')) {
            value = value.split(';').map(part => part.trim()).filter(Boolean).join(' • ');
        }

        const numericParameter = [
            'numero de ovos', 'tempo ate a eclosao', 'maturidade sexual',
            'intervalo entre nascimentos', 'numero de crias', 'duracao do estro',
            'frequencia de acasalamento durante o estro', 'taxa de sucesso reprodutivo',
            'idade da metamorfose', 'numero de mudas', 'numero de estadios larvais',
            'tempo de gestacao'
        ].includes(parameterKey);
        const detail = numericParameter
            ? `${row.first || row.second || ''}${row.second ? `-${row.second}` : ''}${row.unit ? ` ${row.unit}` : ''}`.trim()
            : value;

        if (parameterKey === 'tipo de reproducao') {
            return { tipo: value, detalhe: value, genero: row.gender, fase: row.phase };
        }
        if (parameterKey === 'investimento parental') {
            const etapa = row.first || '';
            const cuidado = row.second || '';
            const responsavel = row.unit || '';
            const parentalParts = [etapa, cuidado, responsavel].filter(Boolean);
            return { tipo: parameter, detalhe: parentalParts.join(' • '), etapa, cuidado, responsavel, valorMin: etapa, valorMax: cuidado, unidade: responsavel, genero: row.gender, fase: row.phase };
        }
        return { tipo: parameter, detalhe: detail, genero: row.gender, fase: row.phase };
    }

    function normalizeImportedBodyCoveringCategory(value = '') {
        const key = normalize(value);
        const aliases = { aves: 'Aves', passaros: 'Aves', mamiferos: 'Mamiferos', mamiferos: 'Mamiferos', peixes: 'Peixes', repteis: 'Repteis', anfibios: 'Anfibios', insetos: 'Insetos', aracnideos: 'Aracnideos', crustaceos: 'Crustaceos', moluscos: 'Moluscos', vermes: 'Vermes', microscopicos: 'Microscopicos' };
        return aliases[key] || (typeof getActiveBodyCoveringCategory === 'function' ? getActiveBodyCoveringCategory() : 'Aves');
    }

    function normalizeImportedPlumageGroup(parameter, category = 'Aves') {
        const key = normalize(parameter);
        const aliases = {
            'tipo de plumagem': 'plumagem', 'plumagem': 'plumagem', 'tipo de pena': 'pena', 'pena': 'pena',
            'cor da plumagem': 'cor_plumagem', 'cor das penas ornamentais': 'cor_penas_ornamentais', 'cor das asas': 'cor_asas',
            'cor do ventre': 'cor_ventre', 'cor do dorso': 'cor_dorso', 'cor da cabeca': 'cor_cabeca', 'cor dos membros': 'cor_membros',
            'cor da cauda': 'cor_cauda', 'estrutura das penas': 'estrutura_penas', 'numero de penas primarias': 'estrutura_penas',
            'quantidade de penas primarias': 'estrutura_penas', 'manchas': 'manchas'
        };
        if (aliases[key]) return aliases[key];
        if (typeof getBodyCoveringConfig === 'function') {
            const config = getBodyCoveringConfig(normalizeImportedBodyCoveringCategory(category));
            const entry = Object.entries(config.groups || {}).find(([, label]) => normalize(label) === key);
            if (entry) return entry[0];
        }
        return '';
    }

    function canonicalImportedCatalogValue(group, value, category = 'Aves') {
        const raw = String(value || '').trim();
        if (!raw || typeof getBodyCoveringConfig !== 'function') return '';
        const config = getBodyCoveringConfig(normalizeImportedBodyCoveringCategory(category));
        const fallbackGroup = String(group).startsWith('cor_') ? 'cor' : group === 'manchas' ? 'manchas' : group;
        const options = config?.options?.[group] || config?.options?.[fallbackGroup] || [];
        const match = options.find(option => normalize(option) === normalize(raw));
        return match || '';
    }

    function buildImportedPlumageItem(row) {
        const category = normalizeImportedBodyCoveringCategory(row.context);
        const grupo = normalizeImportedPlumageGroup(row.parameter, category);
        if (!grupo) return null;
        const tipo = canonicalImportedCatalogValue(grupo, row.first, category);
        if (grupo === 'estrutura_penas' && row.first) {
            const valorMin = row.first || '';
            const valorMax = row.second || row.first || '';
            const unidade = row.unit || 'unid.';
            return { grupo, tipo: 'Número de penas primárias', detalhe: `${valorMin}${valorMax && valorMax !== valorMin ? `–${valorMax}` : ''} ${unidade}`.trim(), valorMin, valorMax, unidade, genero: row.gender, fase: row.phase };
        }
        if (!tipo) return null;
        const detail = grupo === 'manchas' ? `Cor: ${tipo}` : tipo;
        const spotColor = grupo === 'manchas' ? canonicalImportedCatalogValue('cor', row.second, category) : '';
        return { grupo, tipo, detalhe: detail, ...(grupo === 'manchas' ? { cor: spotColor } : {}), genero: row.gender, fase: row.phase };
    }

    function isImportedPlumageParameter(parameter) {
        return !!normalizeImportedPlumageGroup(parameter, 'Aves');
    }

    function buildImportedFeedingItem(row) {
        const parameterKey = normalize(row.parameter);
        const numeric = parameterKey === 'alimento ingerido em media' || parameterKey === 'agua bebida em media';
        if (numeric) {
            const value = `${row.first || row.second || ''}${row.second && row.second !== row.first ? `-${row.second}` : ''}${row.unit ? ` ${row.unit}` : ''}`.trim();
            return { tipo: row.parameter, detalhe: value, genero: row.gender, fase: row.phase };
        }
        return { tipo: row.parameter, detalhe: row.first, genero: row.gender, fase: row.phase };
    }

    function buildImportedCuriosityItem(row) {
        const tipo = row.parameter.replace('Importância económica para humanos', 'Importância económica para os humanos');
        const metricTypes = new Set(['distancia percorrida','horas de sono','maior peso registado','maior idade registada','maior comprimento registado','maior altura registada','maior envergadura registada','temperatura do ambiente']);
        const key=normalize(tipo);
        if (key === 'dimensoes do local de repouso') {
            const contextParts = String(row.context || '').split(/\s*[|]\s*/).map(value => value.trim()).filter(Boolean);
            const localRepouso = contextParts[0] || '';
            const dimensao = contextParts[1] || (['diametro','altura','comprimento','largura','profundidade','altitude','cor'].includes(normalize(row.valueType)) ? row.valueType : '');
            const valorMin = row.first || '';
            const valorMax = row.second || '';
            const unidade = row.unit || '';
            const medida = dimensao === 'Cor' ? unidade : `${valorMin}${valorMax && valorMax !== valorMin ? `-${valorMax}` : ''}${unidade ? ` ${unidade}` : ''}`.trim();
            return { tipo, valor: [localRepouso, dimensao, medida].filter(Boolean).join(' • '), valorMin, valorMax, unidade, localRepouso, dimensao, genero: row.gender, fase: row.phase };
        }
        if (metricTypes.has(key)) {
            const valorMin=row.first||''; const valorMax=row.second||''; const unidade=row.unit||(key==='temperatura do ambiente'?'°C':'');
            const valor=`${valorMin}${valorMax&&valorMax!==valorMin?`-${valorMax}`:''}${unidade?` ${unidade}`:''}`.trim();
            return {tipo,valor,valorMin,valorMax,unidade,genero:row.gender,fase:row.phase};
        }
        return {tipo,valor:row.first,genero:row.gender,fase:row.phase};
    }
    function resolveImportedCountryCode(value) {
        const raw=normalize(value); if(!raw||typeof countryList==='undefined'||!countryList)return '';
        const entry=Object.entries(countryList).find(([code,item])=>[code,item?.nome,item?.name,item?.portugues,item?.pt,item?.pais].some(name=>normalize(name)===raw));
        return entry?entry[0]:'';
    }

    function normalizeImportedOption(parameter, value) {
        const parameterKey = normalize(parameter);
        const valueKey = normalize(value);

        if (parameterKey === 'tipo de comunicacao') {
            const communicationAliases = {
                'tatil': 'Tátil',
                'comunicacao tatil': 'Tátil',
                'quimica': 'Química',
                'quimico': 'Química',
                'olfativa': 'Olfativa',
                'olfativo': 'Olfativa',
                'quimica / olfativa': 'Química',
                'comunicacao quimica': 'Química',
                'comunicacao olfativa': 'Olfativa',
                'comunicacao quimica / olfativa': 'Química',
                'visual': 'Visual',
                'comunicacao visual': 'Visual',
                'vibratoria': 'Vibratória',
                'comunicacao vibratoria': 'Vibratória',
                'sismica': 'Sísmica',
                'comunicacao sismica': 'Sísmica',
                'eletrica': 'Elétrica',
                'comunicacao eletrica': 'Elétrica',
                'acustica nao vocal': 'Acústica não vocal',
                'comunicacao acustica nao vocal': 'Acústica não vocal',
                'social': 'Social',
                'comunicacao social': 'Social',
                'territorial': 'Territorial',
                'comunicacao territorial': 'Territorial',
                'cortejo': 'Cortejo',
                'comunicacao de cortejo': 'Cortejo',
                'defensiva': 'Defensiva',
                'comunicacao defensiva': 'Defensiva',
                'multimodal': 'Multimodal',
                'comunicacao multimodal': 'Multimodal'
            };
            return communicationAliases[valueKey] || String(value || '').trim();
        }

        return String(value || '').trim();
    }

    function expandParsedRow(row) {
        if (!row) return [];

        // Um valor textual com várias opções (ex.: "Tátil; Química") representa
        // vários modelos independentes do mesmo parâmetro, não uma única opção.
        // Só dividimos o valor principal; intervalos numéricos continuam intactos.
        const isFreeText = (row.category === 'Distribuição' && normalize(row.parameter).includes('descricao')) ||
            (row.category === 'Curiosidades' && normalize(row.parameter).includes('tambem conhecido'));
        const shouldSplit = !isFreeText && !row.second && row.first.includes(';') && (
            row.category !== 'Reprodução' || normalize(row.parameter) === 'tipo de reproducao'
        );
        const values = shouldSplit
            ? row.first.split(';').map(value => value.trim()).filter(Boolean)
            : [row.first];

        return values.map((value, optionIndex) => ({
            ...row,
            id: `${row.id}-${optionIndex}`,
            first: normalizeImportedOption(row.parameter, value)
        }));
    }

    function parseText(text) {
        return String(text || '')
            .split(/\r?\n/)
            .flatMap((line, index) => expandParsedRow(parseLine(line.trim(), index)))
            .filter(Boolean);
    }

    function displayValue(row) {
        const value = row.first && row.second && row.first !== row.second ? `${row.first} – ${row.second}` : (row.first || row.second || '—');
        return [value, row.unit, row.gender === 'M' ? 'Macho' : row.gender === 'F' ? 'Fêmea' : '', row.phase, row.context].filter(Boolean).join(' · ');
    }

    function updatePreview() {
        parsedRows = parseText(textarea.value);
        if (automateButton) automateButton.disabled = parsedRows.length === 0;
        if (!preview || !previewList) return;
        preview.hidden = false;
        if (previewCount) previewCount.textContent = `${parsedRows.length} ${parsedRows.length === 1 ? 'campo' : 'campos'}`;
        previewList.innerHTML = parsedRows.length
            ? parsedRows.map(row => `<div class="form-text-import-preview-item"><span class="form-text-import-preview-category">${escapeHtml(row.category)}</span><span class="form-text-import-preview-parameter">${escapeHtml(row.parameter)}</span><span class="form-text-import-preview-value">${escapeHtml(displayValue(row))}</span></div>`).join('')
            : '<p class="form-text-import-preview-empty">Ainda não foi reconhecido nenhum campo. Cole uma linha no formato indicado.</p>';
    }

    function mergeUnique(existing, imported, signature) {
        const result = [...existing];
        imported.forEach(item => {
            const key = signature(item);
            const emptyIndex = result.findIndex(current => normalize(current.tipo) === normalize(item.tipo) && !signature(current).replace(normalize(current.tipo), ''));
            if (!result.some(current => signature(current) === key)) {
                if (emptyIndex >= 0) result.splice(emptyIndex, 1, item);
                else result.push(item);
            }
        });
        return result;
    }

    function applyParsedRows(rows) {
        const general = [];
        const dimensions = [];
        const feeding = [];
        const ecology = [];
        const curiosities = [];
        const reproduction = [];
        const plumage = [];
        const plumageText = [];
        let distributionText = '';
        const distributionRegions = [];

        rows.forEach(row => {
            const base = { genero: row.gender, fase: row.phase };
            if (row.category === 'Informações Gerais') general.push(buildImportedGeneralItem(row));
            if (row.category === 'Dimensões' && (isImportedPlumageParameter(row.parameter) || /plumag|penugem|pena|mancha|color/i.test(row.parameter))) {
                const plumageItem = buildImportedPlumageItem(row);
                if (plumageItem) plumage.push(plumageItem);
                else if (row.first) plumageText.push(`${row.parameter}: ${row.first}`);
            } else if (row.category === 'Dimensões') dimensions.push({ tipo: row.parameter.replace(/^Comprimento Total$/i, 'Comprimento total'), valor: row.first, valorMin: row.first, valorMax: row.second, unidade: row.unit, ...base });
            if (row.category === 'Alimentação') feeding.push(buildImportedFeedingItem(row));
            if (row.category === 'Ecologia') ecology.push(buildImportedEcologyItem(row));
            if (row.category === 'Reprodução') reproduction.push(buildImportedReproductionItem(row));
            if (row.category === 'Revestimento corporal') {
                const plumageItem = buildImportedPlumageItem(row);
                if (plumageItem) plumage.push(plumageItem);
                else if (row.first) plumageText.push(`${row.parameter}: ${row.first}`);
            }
            if (row.category === 'Distribuição') {
                const distributionKey=normalize(row.parameter);
                if(distributionKey.includes('regioes biogeograficas')||distributionKey==='regioes') distributionRegions.push(row.first);
            }
            if (row.category === 'Curiosidades') curiosities.push(buildImportedCuriosityItem(row));
        });

        if (general.length) setGeneralVisualData(mergeUnique(getGeneralVisualData(), general, item => `${normalize(item.tipo)}|${item.valorMin || item.valor || ''}|${item.valorMax || ''}|${item.genero}|${item.fase}`));
        if (dimensions.length) setDimensionData(mergeUnique(getDimensionData(), dimensions, item => `${normalize(item.tipo)}|${item.valorMin || item.valor || ''}|${item.valorMax || ''}|${item.genero}|${item.fase}`));
        if (feeding.length) setFeedingData(mergeUnique(getFeedingData(), feeding, item => `${normalize(item.tipo)}|${normalize(item.detalhe)}|${item.genero}|${item.fase}`));
        if (ecology.length) setEcologyData(mergeUnique(getEcologyData(), ecology, item => `${normalize(item.tipo)}|${normalize(item.texto || item.valor)}|${item.genero}|${item.fase}`));
        if (curiosities.length) setCuriosidadesData(mergeUnique(getCuriosidadesData(), curiosities, item => `${normalize(item.tipo)}|${item.valorMin || item.valor || ''}|${item.valorMax || ''}|${item.unidade || ''}|${item.genero}|${item.fase}`));
        const importedRegions=distributionRegions.map(valor=>({tipo:'Regiões Biogeográficas',valor})).filter(item=>item.valor);
        if(importedRegions.length&&typeof window.setDistributionRegionsData==='function') {
            const existing=typeof window.getDistributionRegionsData==='function'?window.getDistributionRegionsData():[];
            window.setDistributionRegionsData(mergeUnique(existing,importedRegions,item=>`${normalize(item.tipo)}|${normalize(item.valor)}`));
        }
        if (plumage.length && typeof setPlumageData === 'function') {
            const existing = typeof getPlumageData === 'function' ? getPlumageData() : [];
            const imported = mergeUnique(existing, plumage, item => `${normalize(item.grupo)}|${normalize(item.tipo)}|${normalize(item.detalhe)}|${item.genero}|${item.fase}`);
            setPlumageData(imported, { useDefaults: false });
        }
        if (reproduction.length && typeof setReproductionData === 'function') {
            const existing = typeof getReproductionData === 'function' ? getReproductionData() : [];
            const imported = mergeUnique(existing, reproduction, item => `${normalize(item.tipo)}|${normalize(item.detalhe)}|${item.genero}|${item.fase}`);
            setReproductionData(imported, { useDefaults: false });
        }
        if (plumageText.length) {
            const input = document.getElementById('infoPlumagem');
            if (input) {
                const existing = String(input.value || '').trim();
                input.value = [existing, ...plumageText].filter(Boolean).join('\n');
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        if (distributionText) {
            const input = document.getElementById('infoDistribuicao');
            if (input) {
                input.value = distributionText;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        document.dispatchEvent(new CustomEvent('form:text-imported', { detail: { count: rows.length } }));
    }

    function setStatus(message = '') {
        if (!status) return;
        status.textContent = message;
        status.hidden = !message;
    }

    function openModal() {
        lastFocusedElement = document.activeElement;
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('form-text-import-open');
        setStatus('');
        updatePreview();
        window.setTimeout(() => textarea.focus(), 40);
    }

    function closeModal() {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('form-text-import-open');
        setStatus('');
        lastFocusedElement?.focus?.({ preventScroll: true });
    }

    trigger.addEventListener('click', openModal);
    closeButton?.addEventListener('click', closeModal);
    closeBottomButton?.addEventListener('click', closeModal);
    overlay.addEventListener('click', event => {
        if (event.target === overlay) closeModal();
    });

    pasteButton?.addEventListener('click', async () => {
        if (!navigator.clipboard?.readText) {
            setStatus('A colagem automática não está disponível neste navegador. Use Ctrl+V na caixa de texto.');
            textarea.focus();
            return;
        }

        try {
            const text = await navigator.clipboard.readText();
            textarea.value = text;
            setStatus(text ? 'Texto colado com sucesso.' : 'A área de transferência está vazia.');
            updatePreview();
            textarea.focus();
        } catch (_) {
            setStatus('Não foi possível aceder à área de transferência. Use Ctrl+V na caixa de texto.');
            textarea.focus();
        }
    });

    textarea.addEventListener('input', updatePreview);
    textarea.addEventListener('paste', () => window.setTimeout(updatePreview, 0));

    automateButton?.addEventListener('click', () => {
        if (!parsedRows.length) {
            setStatus('Não foi reconhecido nenhum campo para preencher.');
            return;
        }
        try {
            applyParsedRows(parsedRows);
            const count = parsedRows.length;
            closeModal();
            window.setTimeout(() => window.alert(`${count} ${count === 1 ? 'campo foi preenchido' : 'campos foram preenchidos'} automaticamente.`), 30);
        } catch (error) {
            console.error('Erro ao automatizar texto extraído:', error);
            setStatus('Não foi possível preencher os campos. Verifica o formato do texto e tenta novamente.');
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && overlay.style.display === 'flex') closeModal();
    });
})();
