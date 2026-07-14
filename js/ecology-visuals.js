import { ecologicalFunctionCatalog, getEcologicalFunctionMeta, getEcologicalFunctionSvg } from "./ecological-functions.js?v=20260714_ecology_models";

export const ecologyBlockConfigs = [
    {
        key: 'funcaoEcologica',
        label: 'Função Ecológica',
        type: 'function',
        accent: 'accent-bioma',
        iconKey: 'funcao-ecologica',
        placeholder: 'Escolhe uma função ecológica'
    },
    {
        key: 'predadoresNaturais',
        label: 'Predadores naturais',
        type: 'animals',
        accent: 'accent-food',
        iconKey: 'predador',
        placeholder: 'Pesquisar animal...'
    },
    {
        key: 'presas',
        label: 'Presas',
        type: 'animals',
        accent: 'accent-meal',
        iconKey: 'presa',
        placeholder: 'Pesquisar animal...'
    },
    {
        key: 'competidores',
        label: 'Competidores',
        type: 'animals',
        accent: 'accent-climate',
        iconKey: 'competidor',
        placeholder: 'Pesquisar animal...'
    },
    {
        key: 'ameacasNaturais',
        label: 'Ameaças naturais',
        type: 'animals-and-text',
        accent: 'accent-water',
        iconKey: 'ameaça',
        placeholder: 'Pesquisar animal...'
    },
    {
        key: 'relacoesSimbioticas',
        label: 'Relações simbióticas',
        type: 'animals',
        accent: 'accent-mating-polygamy',
        iconKey: 'simbiose',
        placeholder: 'Pesquisar animal...'
    }
];

export function getEcologyFunctionOptions() {
    return ecologicalFunctionCatalog.map(item => item.label);
}

export function normalizeEcologySearch(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[()/-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function getEcologyBlockMeta(key = '') {
    const config = ecologyBlockConfigs.find(item => item.key === key) || ecologyBlockConfigs[0];
    return config;
}

function makeSvg(body) {
    return `<svg class="metric-model-svg reproduction-icon-svg ecological-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">${body}</svg>`;
}

const ecologyVisualMetas = {
    funcaoEcologica: { key: 'funcao', title: 'Função Ecológica', accent: 'accent-ecology-function', configKey: 'funcaoEcologica' },
    predadoresNaturais: { key: 'predadores', title: 'Predadores naturais', accent: 'accent-predator', configKey: 'predadoresNaturais' },
    presas: { key: 'presas', title: 'Presas', accent: 'accent-prey', configKey: 'presas' },
    competidores: { key: 'competidores', title: 'Competidores', accent: 'accent-competitor', configKey: 'competidores' },
    ameacasNaturais: { key: 'ameacas', title: 'Ameaças naturais', accent: 'accent-threat', configKey: 'ameacasNaturais' },
    relacoesSimbioticas: { key: 'simbioticas', title: 'Relações Simbióticas', accent: 'accent-symbiosis', configKey: 'relacoesSimbioticas' },
    ecologia: { key: 'ecologia', title: 'Ecologia', accent: 'accent-ecology-function', configKey: 'ecologia' }
};

const ecologyModelSvgs = {
    funcao: makeSvg('<path d="M40 68V38"/><path d="M40 38c-13 0-22-8-24-22c13 0 22 8 24 22Z"/><path d="M40 38c13 0 22-8 24-22c-13 0-22 8-24 22Z"/><path d="M22 68h36"/>'),
    predadores: makeSvg('<path d="M15 45c10-18 28-26 50-20"/><path d="M63 25l-8-9"/><path d="M63 25l-3 12"/><circle cx="48" cy="31" r="4"/><path d="M24 53c10 10 25 12 40 3"/><path d="M31 54l-5 10"/><path d="M52 57l5 10"/>'),
    presas: makeSvg('<path d="M20 50c7-15 20-23 38-21c7 5 9 13 5 23c-9 8-22 10-38 5"/><circle cx="55" cy="38" r="3"/><path d="M27 57l-7 10"/><path d="M47 59l5 9"/><path d="M18 44l-8-4"/>'),
    competidores: makeSvg('<circle cx="28" cy="35" r="13"/><circle cx="52" cy="35" r="13"/><path d="M28 48v18"/><path d="M52 48v18"/><path d="M20 58h16"/><path d="M44 58h16"/><path d="M36 35h8"/>'),
    ameacas: makeSvg('<path d="M40 10l30 56H10L40 10Z"/><path d="M40 28v18"/><path d="M40 56v2"/>'),
    simbioticas: makeSvg('<circle cx="30" cy="40" r="17"/><circle cx="50" cy="40" r="17"/><path d="M40 28c6 6 6 18 0 24"/><path d="M30 23c5-8 15-8 20 0"/><path d="M30 57c5 8 15 8 20 0"/>'),
    ecologia: makeSvg('<circle cx="40" cy="40" r="25"/><path d="M40 16v48"/><path d="M16 40h48"/><path d="M25 25c10 10 20 10 30 0"/><path d="M25 55c10-10 20-10 30 0"/>')
};

export function getEcologyVisualMeta(type = '') {
    const normalized = normalizeEcologySearch(type);
    if (normalized.includes('funcao')) return ecologyVisualMetas.funcaoEcologica;
    if (normalized.includes('predador')) return ecologyVisualMetas.predadoresNaturais;
    if (normalized.includes('presa')) return ecologyVisualMetas.presas;
    if (normalized.includes('competidor')) return ecologyVisualMetas.competidores;
    if (normalized.includes('ameaca')) return ecologyVisualMetas.ameacasNaturais;
    if (normalized.includes('simbiot')) return ecologyVisualMetas.relacoesSimbioticas;
    return { ...ecologyVisualMetas.ecologia, title: type || ecologyVisualMetas.ecologia.title };
}

export function getEcologyModelSvg(key = 'ecologia') {
    const keyMap = {
        funcaoEcologica: 'funcao',
        predadoresNaturais: 'predadores',
        presas: 'presas',
        competidores: 'competidores',
        ameacasNaturais: 'ameacas',
        relacoesSimbioticas: 'simbioticas'
    };
    const resolvedKey = keyMap[key] || key;
    return ecologyModelSvgs[resolvedKey] || ecologyModelSvgs.ecologia;
}

export function getEcologyBlockSvg(key = 'funcaoEcologica') {
    return getEcologyModelSvg(key);
}

export function getEcologyBlockTitle(key = '') {
    return getEcologyBlockMeta(key).label;
}
