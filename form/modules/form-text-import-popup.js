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
        if (!['Informações Gerais', 'Dimensões', 'Alimentação', 'Ecologia', 'Distribuição', 'Curiosidades'].includes(category) || !parameter) return null;
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

    function normalizeImportedOption(parameter, value) {
        const parameterKey = normalize(parameter);
        const valueKey = normalize(value);

        if (parameterKey === 'tipo de comunicacao') {
            const communicationAliases = {
                'tatil': 'Comunicação tátil',
                'comunicacao tatil': 'Comunicação tátil',
                'quimica': 'Comunicação química / olfativa',
                'quimico': 'Comunicação química / olfativa',
                'olfativa': 'Comunicação química / olfativa',
                'olfativo': 'Comunicação química / olfativa',
                'quimica / olfativa': 'Comunicação química / olfativa',
                'comunicacao quimica': 'Comunicação química / olfativa',
                'comunicacao olfativa': 'Comunicação química / olfativa',
                'comunicacao quimica / olfativa': 'Comunicação química / olfativa',
                'visual': 'Comunicação visual',
                'comunicacao visual': 'Comunicação visual',
                'vibratoria': 'Comunicação vibratória',
                'comunicacao vibratoria': 'Comunicação vibratória',
                'sismica': 'Comunicação sísmica',
                'comunicacao sismica': 'Comunicação sísmica',
                'eletrica': 'Comunicação elétrica',
                'comunicacao eletrica': 'Comunicação elétrica'
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
        const values = !row.second && row.first.includes(';')
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
        let distributionText = '';

        rows.forEach(row => {
            const base = { genero: row.gender, fase: row.phase };
            if (row.category === 'Informações Gerais') general.push({ tipo: row.parameter, valor: row.first, valorMin: row.first, valorMax: row.second, unidade: row.unit, ...base });
            if (row.category === 'Dimensões') dimensions.push({ tipo: row.parameter.replace(/^Comprimento Total$/i, 'Comprimento total'), valor: row.first, valorMin: row.first, valorMax: row.second, unidade: row.unit, ...base });
            if (row.category === 'Alimentação') feeding.push({ tipo: row.parameter, detalhe: row.first, ...base });
            if (row.category === 'Ecologia') ecology.push({ tipo: row.parameter, animais: [], texto: row.first, ...base });
            if (row.category === 'Distribuição' && normalize(row.parameter).includes('descricao')) distributionText = row.first;
            if (row.category === 'Curiosidades') curiosities.push({ tipo: row.parameter.replace('Importância económica para humanos', 'Importância económica para os humanos'), valor: row.first, ...base });
        });

        if (general.length) setGeneralVisualData(mergeUnique(getGeneralVisualData(), general, item => `${normalize(item.tipo)}|${item.valorMin || item.valor || ''}|${item.valorMax || ''}|${item.genero}|${item.fase}`));
        if (dimensions.length) setDimensionData(mergeUnique(getDimensionData(), dimensions, item => `${normalize(item.tipo)}|${item.valorMin || item.valor || ''}|${item.valorMax || ''}|${item.genero}|${item.fase}`));
        if (feeding.length) setFeedingData(mergeUnique(getFeedingData(), feeding, item => `${normalize(item.tipo)}|${normalize(item.detalhe)}|${item.genero}|${item.fase}`));
        if (ecology.length) setEcologyData(mergeUnique(getEcologyData(), ecology, item => `${normalize(item.tipo)}|${normalize(item.texto || item.valor)}|${item.genero}|${item.fase}`));
        if (curiosities.length) setCuriosidadesData(mergeUnique(getCuriosidadesData(), curiosities, item => `${normalize(item.tipo)}|${normalize(item.valor)}|${item.genero}|${item.fase}`));
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
