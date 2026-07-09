// Contador modular de parâmetros estatísticos preenchidos no formulário.
// "Parâmetros" = tipos únicos preenchidos dentro do catálogo principal de 57.
// "Dots" = todas as estatísticas preenchidas, incluindo repetidas.
        const FORM_STATISTICS_TOTAL_PARAMETERS = 57;
        const formStatisticsSummary = document.getElementById('formStatisticsSummary');
        const formParamsCount = document.getElementById('formParamsCount');
        const formDotsCount = document.getElementById('formDotsCount');

        function normalizeStatisticKey(value = '') {
            return String(value)
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[()\/]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function canonicalStatisticKey(value = '') {
            const key = normalizeStatisticKey(value);
            if (!key) return '';
            if (key.includes('estrategia') && key.includes('alimento')) return 'estrategia para obter alimento';
            if (key.includes('tipo de alimentacao')) return 'tipo de alimentacao';
            if (key.includes('alimento ingerido')) return 'alimento ingerido em media';
            if (key.includes('agua bebida')) return 'agua bebida em media';
            if (key.includes('espetativa media de vida') || key.includes('expectativa media de vida')) return 'expetativa media de vida';
            if (key.includes('taxa metabolica basal')) return 'taxa metabolica basal media';
            if (key.includes('funcao ecologica')) return 'funcao ecologica';
            if (key.includes('tambem conhecido')) return 'tambem conhecido como';
            if (key.includes('importancia economica')) return 'importancia economica para os humanos';
            if (key.includes('epoca de reproducao')) return 'epoca de reproducao';
            if (key.includes('numero de crias')) return 'numero de crias';
            if (key.includes('numero de ovos')) return 'numero de ovos';
            if (key.includes('tempo ate') && key.includes('eclosao')) return 'tempo ate a eclosao';
            if (key.includes('maturidade sexual')) return 'maturidade sexual';
            if (key.includes('tempo de gestacao') || key.includes('gestacao')) return 'tempo de gestacao';
            return key;
        }

        function safeStatisticItems(getterName) {
            try {
                if (typeof globalThis[getterName] === 'function') return globalThis[getterName]() || [];
                if (typeof eval(getterName) === 'function') return eval(getterName)() || [];
            } catch (error) {
                return [];
            }
            return [];
        }

        function readCurrentStatisticItems() {
            return [
                ...safeStatisticItems('getGeneralVisualData'),
                ...safeStatisticItems('getDimensionData'),
                ...safeStatisticItems('getFeedingData'),
                ...safeStatisticItems('getReproductionData'),
                ...safeStatisticItems('getEcologyData'),
                ...safeStatisticItems('getCuriosidadesData')
            ].filter(Boolean);
        }

        function getStatisticType(item = {}) {
            return item.tipo || item.type || item.label || item.categoria || '';
        }

        function calculateFormStatisticsSummary() {
            const items = readCurrentStatisticItems();
            const uniqueKeys = new Set();

            items.forEach(item => {
                const key = canonicalStatisticKey(getStatisticType(item));
                if (key) uniqueKeys.add(key);
            });

            return {
                parameters: Math.min(uniqueKeys.size, FORM_STATISTICS_TOTAL_PARAMETERS),
                dots: items.length,
                total: FORM_STATISTICS_TOTAL_PARAMETERS
            };
        }

        function renderFormStatisticsSummary() {
            if (!formStatisticsSummary || !formParamsCount || !formDotsCount) return;
            const summary = calculateFormStatisticsSummary();
            formParamsCount.textContent = `${summary.parameters}/${summary.total}`;
            formDotsCount.textContent = String(summary.dots);
            formStatisticsSummary.dataset.params = String(summary.parameters);
            formStatisticsSummary.dataset.dots = String(summary.dots);
        }

        let formStatisticsUpdateTimer = null;
        function scheduleFormStatisticsSummaryUpdate() {
            clearTimeout(formStatisticsUpdateTimer);
            formStatisticsUpdateTimer = setTimeout(renderFormStatisticsSummary, 60);
        }

        document.addEventListener('input', scheduleFormStatisticsSummaryUpdate, true);
        document.addEventListener('change', scheduleFormStatisticsSummaryUpdate, true);
        document.addEventListener('click', scheduleFormStatisticsSummaryUpdate, true);

        const statisticObservedContainers = [
            generalVisualRowsContainer,
            dimensionRowsContainer,
            feedingRowsContainer,
            reproductionRowsContainer,
            ecologyRowsContainer,
            curiosidadesRowsContainer
        ].filter(Boolean);

        const formStatisticsObserver = new MutationObserver(scheduleFormStatisticsSummaryUpdate);
        statisticObservedContainers.forEach(container => {
            formStatisticsObserver.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-value', 'value', 'class'] });
        });

        requestAnimationFrame(renderFormStatisticsSummary);
