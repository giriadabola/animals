import { communicationTypeCatalog } from './communication-catalog.js';

const svg = content => `<svg class="metric-model-svg communication-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">${content}</svg>`;

const communicationModels = {
    voice: svg('<path d="M18 35c5-10 13-15 22-15s17 5 22 15c-5 10-13 15-22 15s-17-5-22-15Z"/><path d="M25 53c5 7 11 10 15 10s10-3 15-10"/><path d="M48 27l9-7M53 35h12M48 43l9 7"/>'),
    sound: svg('<path d="M17 35h13l13-12v24L30 35H17Z"/><path d="M51 28c6 4 6 10 0 14M57 22c11 8 11 18 0 26"/>'),
    frequency: svg('<path d="M12 42h10l6-20 9 36 8-29 7 13h16"/><path d="M12 58h56"/>'),
    intensity: svg('<path d="M16 35h13l13-12v24L29 35H16Z"/><path d="M53 28c5 4 5 10 0 14M59 22c10 8 10 18 0 26"/><circle cx="66" cy="35" r="3" fill="currentColor" stroke="none"/>'),
    visual: svg('<circle cx="40" cy="35" r="21"/><circle cx="40" cy="35" r="8"/><circle cx="40" cy="35" r="3" fill="currentColor" stroke="none"/><path d="M16 59c8-7 16-10 24-10s16 3 24 10"/>'),
    body: svg('<circle cx="40" cy="19" r="7"/><path d="M40 26v23M40 32 22 42M40 32l18 10M40 49l-12 17M40 49l12 17"/><path d="M16 25l-7 9 9 4M64 25l7 9-9 4"/>'),
    colour: svg('<circle cx="40" cy="39" r="18"/><circle cx="24" cy="25" r="6"/><circle cx="56" cy="25" r="6"/><path d="M40 21v36M22 39h36"/><circle cx="40" cy="39" r="5" fill="currentColor" stroke="none"/>'),
    chemical: svg('<path d="M31 14h18M36 14v19L20 57c-3 5 1 9 7 9h26c6 0 10-4 7-9L44 33V14"/><path d="M27 52c9-5 17 6 26 0"/><circle cx="33" cy="45" r="3" fill="currentColor" stroke="none"/>'),
    territory: svg('<path d="M21 30c0-11 8-19 19-19s19 8 19 19c0 14-19 33-19 33S21 44 21 30Z"/><circle cx="40" cy="30" r="6"/><path d="M13 64h54"/>'),
    tactile: svg('<path d="M28 58c-8-7-13-15-13-23 0-4 3-6 6-4l8 8V20c0-4 6-4 6 0v16V16c0-4 6-4 6 0v20V19c0-4 6-4 6 0v18l3-8c2-5 8-3 7 2l-4 17c-3 12-12 18-25 10Z"/>'),
    grooming: svg('<path d="M22 18h36v16H22Z"/><path d="M26 34v24M34 34v24M42 34v24M50 34v24"/><path d="M16 18h48"/><path d="M18 63h44"/>'),
    vibratory: svg('<path d="M12 40c8-18 16-18 24 0s16 18 24 0"/><path d="M12 55c8-18 16-18 24 0s16 18 24 0"/><path d="M12 25c8-18 16-18 24 0s16 18 24 0"/>'),
    seismic: svg('<path d="M12 56h56"/><path d="m14 56 9-21 8 12 8-25 8 27 8-12 11 19"/><path d="M25 64v-8M55 64v-8"/>'),
    electric: svg('<path d="m45 10-25 33h16l-5 27 29-38H43Z"/>'),
    light: svg('<circle cx="40" cy="35" r="13"/><path d="M40 11v9M40 50v9M16 35h9M55 35h9M23 18l6 6M51 52l6 6M57 18l-6 6M29 52l-6 6"/><path d="M34 54h12M35 61h10"/>'),
    acoustic: svg('<path d="M20 27h40v28H20Z"/><path d="M20 35h40M30 27v28M50 27v28"/><path d="M12 21h56M12 59h56"/>'),
    alarm: svg('<path d="m40 12 29 52H11Z"/><path d="M40 30v16"/><circle cx="40" cy="55" r="3" fill="currentColor" stroke="none"/>'),
    contact: svg('<circle cx="24" cy="40" r="11"/><circle cx="56" cy="40" r="11"/><path d="M35 40h10M29 32l22 16M29 48l22-16"/>'),
    mating: svg('<path d="M40 59S16 45 16 29c0-8 10-13 16-5l8 9 8-9c6-8 16-3 16 5c0 16-24 30-24 30Z"/>'),
    threat: svg('<path d="M40 12c15 0 27 12 27 27S55 66 40 66 13 54 13 39 25 12 40 12Z"/><path d="M40 25v19"/><circle cx="40" cy="53" r="3" fill="currentColor" stroke="none"/>'),
    submission: svg('<circle cx="40" cy="20" r="7"/><path d="M40 27v27M40 39 25 47M40 39l15 8M32 65h16"/><path d="M21 57h38"/>'),
    parental: svg('<path d="M13 42c5-15 15-23 27-23s22 8 27 23"/><path d="M17 45c6 9 14 14 23 14s17-5 23-14"/><circle cx="40" cy="39" r="7"/><path d="M28 61h24"/>'),
    social: svg('<circle cx="40" cy="22" r="8"/><circle cx="20" cy="39" r="7"/><circle cx="60" cy="39" r="7"/><path d="M25 62c2-11 8-16 15-16s13 5 15 16M12 60c1-7 4-11 9-11s8 4 9 11M50 60c1-7 4-11 9-11s8 4 9 11"/>'),
    courtship: svg('<path d="M40 61C20 49 15 38 19 27c3-8 14-10 21-2 7-8 18-6 21 2 4 11-1 22-21 34Z"/><path d="M40 25v19M31 34h18"/>'),
    defensive: svg('<path d="M40 11 63 20v18c0 15-10 25-23 31-13-6-23-16-23-31V20Z"/><path d="m29 40 7 7 15-17"/>'),
    multimodal: svg('<circle cx="40" cy="40" r="7"/><circle cx="18" cy="18" r="6"/><circle cx="62" cy="18" r="6"/><circle cx="18" cy="62" r="6"/><circle cx="62" cy="62" r="6"/><path d="M35 35 22 22M45 35l13-13M35 45 22 58M45 45l13 13"/>'),
    distance: svg('<path d="M12 40h56"/><path d="m22 30-10 10 10 10M58 30l10 10-10 10"/><circle cx="40" cy="40" r="7"/>'),
    context: svg('<circle cx="40" cy="40" r="27"/><path d="M40 21v19l13 9"/><path d="M40 8v6M40 66v6M8 40h6M66 40h6"/>'),
    complexity: svg('<circle cx="40" cy="40" r="7"/><circle cx="40" cy="16" r="5"/><circle cx="19" cy="54" r="5"/><circle cx="61" cy="54" r="5"/><path d="M40 33V21M34 45 23 52M46 45l11 7"/>')
};

const modelKeyByLabel = {
    'Vocalizações': 'voice',
    'Sons emitidos': 'sound',
    'Frequência dos sons': 'frequency',
    'Intensidade vocal': 'intensity',
    'Comunicação visual': 'visual',
    'Linguagem corporal': 'body',
    'Sinais de cor': 'colour',
    'Comunicação química / olfativa': 'chemical',
    'Marcação de território': 'territory',
    'Comunicação tátil': 'tactile',
    'Grooming social': 'grooming',
    'Comunicação vibratória': 'vibratory',
    'Comunicação sísmica': 'seismic',
    'Comunicação elétrica': 'electric',
    'Bioluminescência comunicativa': 'light',
    'Comunicação acústica não vocal': 'acoustic',
    'Chamadas de alarme': 'alarm',
    'Chamadas de contacto': 'contact',
    'Chamadas de acasalamento': 'mating',
    'Sinais de ameaça': 'threat',
    'Sinais de submissão': 'submission',
    'Sinais parentais': 'parental',
    'Comunicação social': 'social',
    'Comunicação territorial': 'territory',
    'Comunicação de cortejo': 'courtship',
    'Comunicação defensiva': 'defensive',
    'Comunicação multimodal': 'multimodal',
    'Distância da comunicação': 'distance',
    'Contexto da comunicação': 'context',
    'Complexidade comunicativa': 'complexity'
};

const normalizeCommunicationType = value => String(value).trim().toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function getCommunicationModelSvg(value = '') {
    const catalogItem = communicationTypeCatalog.find(item => normalizeCommunicationType(item.label) === normalizeCommunicationType(value));
    const key = modelKeyByLabel[catalogItem?.label] || 'visual';
    return communicationModels[key];
}

export function getCommunicationGenericModelSvg() {
    return svg('<path d="M16 20h48v30H35L24 61v-11h-8Z"/><path d="M28 31h24M28 40h15"/><path d="M55 14h9v6"/>');
}
