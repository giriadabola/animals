// Contador modular de parâmetros estatísticos preenchidos no formulário.
// "Parâmetros" = tipos únicos preenchidos dentro do catálogo global.
// "Dots" = todas as estatísticas preenchidas, incluindo repetidas.
// O total é reconstruído a partir dos catálogos atuais para incluir automaticamente
// novas opções adicionadas futuramente. 309 é apenas a salvaguarda inicial.
const FORM_STATISTICS_FALLBACK_TOTAL = 309;

const STATIC_FORM_PARAMETER_CATALOG = {
    alimentacao: [
        'Tipo de Alimentação',
        'Alimento Ingerido em Média',
        'Água bebida em Média',
        'Estratégia para obter alimentos'
    ],
    ecologia: [
        'Ameaças naturais',
        'Competidores',
        'Função Ecológica',
        'Predadores naturais',
        'Presas',
        'Relações Simbióticas'
    ],
    reproducao: [
        'Acasalamento',
        'Época de reprodução',
        'Investimento Parental',
        'Maturidade Sexual',
        'Número de Crias',
        'Número de ovos',
        'Tempo até à eclosão',
        'Duração do estro',
        'Frequência de acasalamento durante o estro',
        'Taxa de sucesso reprodutivo',
        'Intervalo entre nascimentos',
        'Idade da metamorfose',
        'Número de mudas',
        'Número de estádios larvais',
        'Sistema sexual',
        'Tempo de Gestação',
        'Tipo de reprodução'
    ],
    distribuicao: [
        'Países',
        'Descrição da Distribuição',
        'Regiões Biogeográficas'
    ]
};
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


function getConfiguredFormParameterTotal() {
    try {
        const catalog = new Set();
        const add = value => {
            const key = canonicalStatisticKey(value);
            if (key) catalog.add(key);
        };

        // Informação Geral: todas as secções e respetivos modelos, incluindo
        // categorias de Estruturas anatómicas.
        if (typeof GENERAL_VISUAL_SECTIONS !== 'undefined') {
            GENERAL_VISUAL_SECTIONS.forEach(section => (section.models || []).forEach(add));
        }

        // Dimensões: junta opções-base e opções de todas as categorias animais,
        // removendo repetições pelo nome.
        if (typeof baseDimensionOptions !== 'undefined') {
            baseDimensionOptions.forEach(option => add(option?.label));
        }
        if (typeof dimensionOptionsByCategory !== 'undefined') {
            Object.values(dimensionOptionsByCategory).flat().forEach(option => add(option?.label));
        }

        // Alimentação, Ecologia, Reprodução e Distribuição têm parâmetros
        // principais estáveis. Acrescenta aqui apenas um novo parâmetro principal;
        // valores internos de dropdown não contam como novos parâmetros.
        Object.values(STATIC_FORM_PARAMETER_CATALOG).flat().forEach(add);

        // Revestimento corporal: os nomes dos grupos mudam por categoria animal.
        if (typeof bodyCoveringCategoryConfig !== 'undefined') {
            Object.values(bodyCoveringCategoryConfig).forEach(config => {
                (config?.groups || []).forEach(add);
            });
        }

        // Curiosidades: catálogo principal usado pelo seletor da secção.
        if (typeof curiosidadesTypeOptions !== 'undefined') {
            curiosidadesTypeOptions.forEach(add);
        }

        return catalog.size || FORM_STATISTICS_FALLBACK_TOTAL;
    } catch (error) {
        console.warn('[FORM][STATS] Não foi possível recalcular o catálogo completo.', error);
        return FORM_STATISTICS_FALLBACK_TOTAL;
    }
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
        parameters: Math.min(uniqueKeys.size, getConfiguredFormParameterTotal()),
        dots: items.length,
        total: getConfiguredFormParameterTotal()
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
