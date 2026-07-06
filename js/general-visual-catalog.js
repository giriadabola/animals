export const generalVisualOptions = [
    { tipo: 'Vida útil', unidade: 'anos' },
    { tipo: 'Velocidade máxima', unidade: 'km/h' },
    { tipo: 'Velocidade média', unidade: 'km/h' },
    { tipo: 'Força da mordida', unidade: 'PSI' },
    { tipo: 'Tamanho da População', unidade: 'milhares' },
    { tipo: 'Estratégia para obter alimento', unidade: '' },
    { tipo: 'Atividade', unidade: '' },
    { tipo: 'Vida Social', unidade: '' },
    { tipo: 'Zona Climática', unidade: '' },
    { tipo: 'Habitat', unidade: '' }
];

export const generalVisualUnits = ['', 'dias', 'meses', 'anos', 'km/h', 'm/s', 'PSI', 'indivíduos', 'dezenas', 'centenas', 'milhares', 'milhões'];

const feedingStrategyOptions = [
    'Caça',
    'Perseguição',
    'Emboscada',
    'Mergulho',
    'Pesca',
    'Filtração',
    'Pastoreio',
    'Ramoneio',
    'Escavação',
    'Raspagem',
    'Sucção',
    'Picagem',
    'Coleta',
    'Procura no solo',
    'Procura em árvores',
    'Necrofagia',
    'Parasitismo',
    'Roubo de alimento',
    'Armadilha',
    'Camuflagem',
    'Cooperação em grupo',
    'Migração para alimento',
    'Armazenamento de alimento'
];

const activityCatalog = [
    { label: 'Diurno', key: 'diurno' },
    { label: 'Noturno', key: 'noturno' },
    { label: 'Crepuscular', key: 'crepuscular' },
    { label: 'Matutino', key: 'matutino' },
    { label: 'Vespertino', key: 'vespertino' },
    { label: 'Catemeral', key: 'catemeral' },
    { label: 'Arrítmico', key: 'arritmico' },
    { label: 'Ultradiano', key: 'ultradiano' },
    { label: 'Sazonal', key: 'sazonal' },
    { label: 'Migratório', key: 'migratorio' },
    { label: 'Hibernante', key: 'hibernante' },
    { label: 'Estivante', key: 'estivante' },
    { label: 'Brumante', key: 'brumante' },
    { label: 'Torpidário', key: 'torpidario' },
    { label: 'Subterrâneo/Fossorial', key: 'subterraneo_fossorial' },
    { label: 'Aquático ativo', key: 'aquatico_ativo' },
    { label: 'Arborícola ativo', key: 'arboricola_ativo' },
    { label: 'Terrestre ativo', key: 'terrestre_ativo' },
    { label: 'Aéreo ativo', key: 'aereo_ativo' }
];

const socialCatalog = [
    { label: 'Solitária', key: 'solitaria' },
    { label: 'Gregária', key: 'gregaria' },
    { label: 'Social', key: 'social' },
    { label: 'Altamente social', key: 'altamente_social' },
    { label: 'Eussocial', key: 'eussocial' },
    { label: 'Colonial', key: 'colonial' },
    { label: 'Comunitária', key: 'comunitaria' },
    { label: 'Familiar', key: 'familiar' },
    { label: 'Monogâmica', key: 'monogamica' },
    { label: 'Poligâmica', key: 'poligamica' },
    { label: 'Poligínica', key: 'poliginica' },
    { label: 'Poliândrica', key: 'poliandrica' },
    { label: 'Cooperativa', key: 'cooperativa' },
    { label: 'Hierárquica', key: 'hierarquica' },
    { label: 'Territorial', key: 'territorial' },
    { label: 'Semi-social', key: 'semi_social' },
    { label: 'Subsocial', key: 'subsocial' },
    { label: 'Tolerante', key: 'tolerante' },
    { label: 'Agregada', key: 'agregada' },
    { label: 'Migratória em grupo', key: 'migratoria_em_grupo' },
    { label: 'Reprodutiva em grupo', key: 'reprodutiva_em_grupo' },
    { label: 'De casal', key: 'casal' },
    { label: 'De bando', key: 'bando' },
    { label: 'De manada', key: 'manada' },
    { label: 'De alcateia', key: 'alcateia' },
    { label: 'De cardume', key: 'cardume' },
    { label: 'De colmeia', key: 'colmeia' },
    { label: 'De formigueiro', key: 'formigueiro' },
    { label: 'De harém', key: 'harem' },
    { label: 'Matriarcal', key: 'matriarcal' },
    { label: 'Patriarcal', key: 'patriarcal' }
];

const climateZoneOptions = [
    'Tropical',
    'Subtropical',
    'Temperada',
    'Polar',
    'Ártica',
    'Antártica',
    'Desértica',
    'Semiárida',
    'Mediterrânica',
    'Montanhosa / Alpina'
];

const habitatOptions = [
    'Áreas rochosas',
    'Bosque',
    'Calota de gelo',
    'Caverna',
    'Chaparral',
    'Costa',
    'Duna',
    'Estepe',
    'Fauna urbana',
    'Floresta',
    'Marinho',
    'Marinho (corais)',
    'Matagal',
    'Montanha',
    'Pântano',
    'Pradaria',
    'Savana'
];

const selectGroups = {
    feedingStrategy: feedingStrategyOptions,
    activity: activityCatalog.map(item => item.label),
    social: socialCatalog.map(item => item.label),
    climateZone: climateZoneOptions,
    habitat: habitatOptions
};

const activityMap = new Map(activityCatalog.map(item => [normalizeGeneralVisualKey(item.label), item]));
const socialMap = new Map(socialCatalog.map(item => [normalizeGeneralVisualKey(item.label), item]));

export function normalizeGeneralVisualKey(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[()/]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function getGeneralVisualOption(type = '') {
    return generalVisualOptions.find(option => option.tipo === type);
}

export function getGeneralVisualSelectConfig(type = '') {
    const normalized = normalizeGeneralVisualKey(type);
    if (normalized.includes('estrategia')) return { group: 'feedingStrategy', placeholder: 'Escolhe uma estratégia' };
    if (normalized.includes('atividade')) return { group: 'activity', placeholder: 'Escolhe um tipo de atividade' };
    if (normalized.includes('vida social')) return { group: 'social', placeholder: 'Escolhe um tipo de vida social' };
    if (normalized.includes('zona climatica')) return { group: 'climateZone', placeholder: 'Escolhe uma zona climática' };
    if (normalized.includes('habitat')) return { group: 'habitat', placeholder: 'Escolhe um habitat' };
    return null;
}

export function getGeneralVisualSelectOptions(type = '') {
    const config = getGeneralVisualSelectConfig(type);
    if (!config) return [];
    return selectGroups[config.group] || [];
}

export function isDropdownOnlyGeneralModel(type = '') {
    return !!getGeneralVisualSelectConfig(type);
}

export function getGeneralVisualMeta(type = '') {
    const normalized = normalizeGeneralVisualKey(type);
    if (normalized.includes('vida')) return { key: 'vida', title: type || 'Vida útil', accent: 'accent-life' };
    if (normalized.includes('maxima')) return { key: 'velocidade-maxima', title: type || 'Velocidade máxima', accent: 'accent-speed-max' };
    if (normalized.includes('media')) return { key: 'velocidade-media', title: type || 'Velocidade média', accent: 'accent-speed-average' };
    if (normalized.includes('mordida')) return { key: 'forca-mordida', title: type || 'Força da mordida', accent: 'accent-generic' };
    if (normalized.includes('tamanho') && normalized.includes('popul')) return { key: 'populacao', title: type || 'Tamanho da População', accent: 'accent-generic' };
    if (normalized.includes('estrategia')) return { key: 'estrategia', title: type || 'Estratégia para obter alimento', accent: 'accent-generic' };
    if (normalized.includes('atividade')) return { key: 'atividade', title: type || 'Atividade', accent: 'accent-climate' };
    if (normalized.includes('vida social')) return { key: 'vida-social', title: type || 'Vida Social', accent: 'accent-mating-polygamy' };
    if (normalized.includes('zona')) return { key: 'zona-climatica', title: type || 'Zona Climática', accent: 'accent-climate' };
    if (normalized.includes('habitat')) return { key: 'habitat', title: type || 'Habitat', accent: 'accent-habitat' };
    return { key: 'geral', title: type || 'Modelo geral', accent: 'accent-generic' };
}

function makeSvg(body, className = 'general-model-svg') {
    return `<svg class="metric-model-svg ${className}" viewBox="0 0 80 80" fill="none" aria-hidden="true">${body}</svg>`;
}

export function getGeneralModelSvg(key = 'geral') {
    const icons = {
        vida: makeSvg('<path d="M28 10h24"/><path d="M28 70h24"/><path d="M31 10c0 15 18 16 18 30S31 55 31 70"/><path d="M49 10c0 15-18 16-18 30s18 15 18 30"/><path d="M34 53h12"/><path d="M37 59h6"/>'),
        'velocidade-maxima': makeSvg('<path d="M14 58a26 26 0 0 1 52 0"/><path d="M24 58h32"/><path d="M40 58l18-24"/><path d="M28 30l-5-6"/><path d="M52 30l5-6"/><path d="M40 24v-9"/><path d="M61 58h7"/>'),
        'velocidade-media': makeSvg('<path d="M13 58a27 27 0 0 1 54 0"/><path d="M22 58h36"/><path d="M40 58l8-18"/><path d="M23 43h8"/><path d="M49 43h8"/><path d="M30 28l-4-7"/><path d="M50 28l4-7"/>'),
        'forca-mordida': makeSvg('<path d="M20 30c0-6 10-10 20-10s20 4 20 10v6H20v-6z"/><path d="M20 50c0 6 10 10 20 10s20-4 20-10v-6H20v6z"/><path d="M28 30l2 6M36 30l1 6M44 30l-1 6M52 30l-2 6"/><path d="M28 50l2-6M36 50l1-6M44 50l-1-6M52 50l-2-6"/>'),
        populacao: makeSvg('<circle cx="24" cy="33" r="7"/><circle cx="40" cy="24" r="8"/><circle cx="56" cy="33" r="7"/><path d="M18 58c2-7 8-12 14-12s12 5 14 12"/><path d="M34 61c2-9 10-15 18-15s16 6 18 15"/><path d="M10 61c2-9 10-15 18-15"/>'),
        atividade: makeSvg('<circle cx="28" cy="29" r="9"/><path d="M52 24c8 0 14 6 14 14c0 7-5 13-12 14"/><path d="M20 57h40"/><path d="M40 14v8"/><path d="M14 29h8"/>', 'general-model-svg activity-model-svg'),
        'vida-social': makeSvg('<circle cx="24" cy="32" r="7"/><circle cx="40" cy="24" r="7"/><circle cx="56" cy="32" r="7"/><path d="M18 58c2-8 8-13 14-13s12 5 14 13"/><path d="M34 58c2-8 8-13 14-13s12 5 14 13"/><path d="M31 29l9-5l9 5"/>', 'general-model-svg social-model-svg'),
        geral: makeSvg('<circle cx="40" cy="40" r="25"/><path d="M40 25v18"/><path d="M40 53v2"/>')
    };
    return icons[key] || icons.geral;
}

export function getActivityMeta(value = '') {
    const match = activityMap.get(normalizeGeneralVisualKey(value));
    if (match) return { key: match.key, title: match.label, accent: 'accent-climate' };
    return { key: 'atividade', title: value || 'Atividade', accent: 'accent-climate' };
}

export function getActivitySvg(key = 'atividade') {
    const icons = {
        atividade: makeSvg('<circle cx="28" cy="29" r="9"/><path d="M52 24c8 0 14 6 14 14c0 7-5 13-12 14"/><path d="M20 57h40"/><path d="M40 14v8"/><path d="M14 29h8"/>', 'general-model-svg activity-model-svg'),
        diurno: makeSvg('<circle cx="40" cy="40" r="13"/><path d="M40 12v9"/><path d="M40 59v9"/><path d="M12 40h9"/><path d="M59 40h9"/><path d="M20 20l6 6"/><path d="M54 54l6 6"/><path d="M54 26l6-6"/><path d="M20 60l6-6"/>', 'general-model-svg activity-model-svg'),
        noturno: makeSvg('<path d="M51 14c-3 3-5 8-5 14c0 15 11 26 26 26c2 0 4 0 6-1c-5 9-15 15-27 15c-18 0-32-14-32-32c0-12 7-23 18-28c4-2 9-3 14-2Z"/>', 'general-model-svg activity-model-svg'),
        crepuscular: makeSvg('<path d="M16 52h48"/><path d="M24 52c4-11 16-19 16-31c0 12 12 20 16 31"/><path d="M26 63h28"/><path d="M40 14v10"/>', 'general-model-svg activity-model-svg'),
        matutino: makeSvg('<path d="M16 52h48"/><path d="M24 52c4-10 11-17 16-21c5 4 12 11 16 21"/><path d="M40 18v8"/><path d="M25 26l5 5"/><path d="M55 26l-5 5"/>', 'general-model-svg activity-model-svg'),
        vespertino: makeSvg('<path d="M16 52h48"/><path d="M24 52c4-8 11-14 16-18c5 4 12 10 16 18"/><path d="M40 18v8"/><path d="M24 23l7 4"/><path d="M56 23l-7 4"/><path d="M26 63h28"/>', 'general-model-svg activity-model-svg'),
        catemeral: makeSvg('<circle cx="26" cy="32" r="10"/><path d="M53 24c7 0 12 5 12 12c0 7-5 12-12 12c-2 0-4 0-6-1c3-3 5-7 5-11s-2-8-5-12c2 0 4 0 6 0Z"/><path d="M18 56h34"/><path d="M58 54h8"/>', 'general-model-svg activity-model-svg'),
        arritmico: makeSvg('<path d="M12 46h12l6-16l10 28l8-17h20"/><path d="M16 62h48"/><circle cx="60" cy="25" r="6"/>', 'general-model-svg activity-model-svg'),
        ultradiano: makeSvg('<path d="M16 56c5-10 9-20 14-20s9 10 14 20s9 20 14 20s9-10 14-20"/><path d="M16 24c5 0 9 4 14 12c5-8 9-12 14-12s9 4 14 12c5-8 9-12 14-12"/>', 'general-model-svg activity-model-svg'),
        sazonal: makeSvg('<rect x="18" y="18" width="44" height="44" rx="8"/><path d="M18 32h44"/><path d="M28 12v12"/><path d="M52 12v12"/><path d="M28 44l6 6l12-12"/><path d="M48 43h8"/>', 'general-model-svg activity-model-svg'),
        migratorio: makeSvg('<path d="M14 54c12-20 30-30 52-30"/><path d="M53 16l13 8l-13 8"/><path d="M18 60h30"/><path d="M34 50l14 10l-14 10"/>', 'general-model-svg activity-model-svg'),
        hibernante: makeSvg('<path d="M18 58h44"/><path d="M24 58c2-18 10-28 24-32c7 7 10 14 10 24"/><path d="M28 26l8-8"/><path d="M52 22l-4-10"/><path d="M54 36l10-4"/>', 'general-model-svg activity-model-svg'),
        estivante: makeSvg('<circle cx="40" cy="22" r="8"/><path d="M16 58h48"/><path d="M24 58c4-12 12-20 16-20s12 8 16 20"/><path d="M22 22l-6-6"/><path d="M58 22l6-6"/><path d="M40 8V2"/>', 'general-model-svg activity-model-svg'),
        brumante: makeSvg('<path d="M18 58h44"/><path d="M24 58c3-15 11-24 24-28"/><path d="M24 24c4-5 8-8 14-8c7 0 12 4 16 11"/><path d="M56 18l10 4"/><path d="M54 30l12-1"/><path d="M54 42l10-4"/>', 'general-model-svg activity-model-svg'),
        torpidario: makeSvg('<circle cx="28" cy="38" r="12"/><path d="M44 38h18"/><path d="M50 28v20"/><path d="M18 58h44"/>', 'general-model-svg activity-model-svg'),
        subterraneo_fossorial: makeSvg('<path d="M14 56h52"/><path d="M22 48c8-7 18-11 30-11"/><path d="M25 56c0-10 6-18 15-18c8 0 14 6 14 14"/><path d="M24 29l-6 7"/><path d="M36 24l-4 9"/><path d="M48 24l2 9"/>', 'general-model-svg activity-model-svg'),
        aquatico_ativo: makeSvg('<path d="M13 48c10-10 22-15 36-15c11 0 20 3 27 10c-7 10-18 16-31 16S22 56 13 48Z"/><path d="M61 43l10-10v22L61 43Z"/><path d="M14 62c5-4 10-4 15 0c5-4 10-4 15 0c5-4 10-4 15 0"/>', 'general-model-svg activity-model-svg'),
        arboricola_ativo: makeSvg('<path d="M40 64V26"/><path d="M40 38l-16-10"/><path d="M40 46l18-11"/><circle cx="26" cy="24" r="9"/><circle cx="55" cy="28" r="10"/><circle cx="40" cy="18" r="11"/>', 'general-model-svg activity-model-svg'),
        terrestre_ativo: makeSvg('<path d="M18 60h44"/><path d="M26 43c4 4 6 8 6 12"/><path d="M36 37c4 4 6 8 6 12"/><path d="M46 43c4 4 6 8 6 12"/><path d="M30 28c4 4 6 8 6 12"/><path d="M50 28c4 4 6 8 6 12"/>', 'general-model-svg activity-model-svg'),
        aereo_ativo: makeSvg('<path d="M13 52c14-25 30-37 54-39c-4 24-17 41-41 52H13V52Z"/><path d="M30 28c7 8 11 18 12 30"/><path d="M45 22c6 8 8 16 8 26"/><path d="M58 18l10-6"/>', 'general-model-svg activity-model-svg')
    };
    return icons[key] || icons.atividade;
}

export function getSocialMeta(value = '') {
    const match = socialMap.get(normalizeGeneralVisualKey(value));
    if (match) return { key: match.key, title: match.label, accent: 'accent-mating-polygamy' };
    return { key: 'social', title: value || 'Vida Social', accent: 'accent-mating-polygamy' };
}

export function getSocialSvg(key = 'social') {
    const icons = {
        social: makeSvg('<circle cx="24" cy="32" r="7"/><circle cx="40" cy="24" r="7"/><circle cx="56" cy="32" r="7"/><path d="M18 58c2-8 8-13 14-13s12 5 14 13"/><path d="M34 58c2-8 8-13 14-13s12 5 14 13"/><path d="M31 29l9-5l9 5"/>', 'general-model-svg social-model-svg'),
        solitaria: makeSvg('<circle cx="40" cy="34" r="14"/><path d="M28 60c3-9 8-14 12-14s9 5 12 14"/><path d="M31 34h18"/>', 'general-model-svg social-model-svg'),
        gregaria: makeSvg('<circle cx="24" cy="34" r="7"/><circle cx="40" cy="28" r="7"/><circle cx="56" cy="34" r="7"/><circle cx="32" cy="50" r="6"/><circle cx="48" cy="50" r="6"/>', 'general-model-svg social-model-svg'),
        altamente_social: makeSvg('<circle cx="40" cy="22" r="6"/><circle cx="24" cy="34" r="6"/><circle cx="56" cy="34" r="6"/><circle cx="30" cy="52" r="6"/><circle cx="50" cy="52" r="6"/><path d="M40 28L24 34L30 52H50L56 34L40 28Z"/>', 'general-model-svg social-model-svg'),
        eussocial: makeSvg('<path d="M28 18h24l12 20l-12 20H28L16 38l12-20Z"/><path d="M28 18l12 20l12-20"/><path d="M16 38h48"/><path d="M28 58l12-20l12 20"/>', 'general-model-svg social-model-svg'),
        colonial: makeSvg('<circle cx="24" cy="28" r="7"/><circle cx="40" cy="22" r="7"/><circle cx="56" cy="28" r="7"/><circle cx="28" cy="50" r="7"/><circle cx="52" cy="50" r="7"/><path d="M18 61h44"/>', 'general-model-svg social-model-svg'),
        comunitaria: makeSvg('<rect x="19" y="19" width="42" height="42" rx="12"/><circle cx="31" cy="31" r="5"/><circle cx="49" cy="31" r="5"/><circle cx="31" cy="49" r="5"/><circle cx="49" cy="49" r="5"/>', 'general-model-svg social-model-svg'),
        familiar: makeSvg('<circle cx="26" cy="28" r="8"/><circle cx="54" cy="28" r="8"/><circle cx="40" cy="45" r="6"/><path d="M18 60c3-8 9-13 16-13s13 5 16 13"/><path d="M30 60c2-6 5-10 10-10s8 4 10 10"/>', 'general-model-svg social-model-svg'),
        monogamica: makeSvg('<circle cx="28" cy="30" r="8"/><circle cx="52" cy="30" r="8"/><path d="M28 38v10"/><path d="M52 38v10"/><path d="M22 54c4-5 8-8 14-8"/><path d="M58 54c-4-5-8-8-14-8"/><path d="M36 30h8"/>', 'general-model-svg social-model-svg'),
        poligamica: makeSvg('<circle cx="40" cy="18" r="8"/><circle cx="22" cy="50" r="7"/><circle cx="40" cy="58" r="7"/><circle cx="58" cy="50" r="7"/><path d="M40 26v10"/><path d="M40 36L22 44"/><path d="M40 36v14"/><path d="M40 36l18 8"/>', 'general-model-svg social-model-svg'),
        poliginica: makeSvg('<circle cx="40" cy="18" r="8"/><circle cx="22" cy="52" r="7"/><circle cx="40" cy="57" r="7"/><circle cx="58" cy="52" r="7"/><path d="M34 18h12"/><path d="M40 26v10"/><path d="M40 36L22 45"/><path d="M40 36l18 9"/>', 'general-model-svg social-model-svg'),
        poliandrica: makeSvg('<circle cx="22" cy="22" r="7"/><circle cx="40" cy="17" r="7"/><circle cx="58" cy="22" r="7"/><circle cx="40" cy="57" r="8"/><path d="M22 29l18 15"/><path d="M40 24v20"/><path d="M58 29L40 44"/>', 'general-model-svg social-model-svg'),
        cooperativa: makeSvg('<circle cx="24" cy="32" r="7"/><circle cx="56" cy="32" r="7"/><circle cx="40" cy="52" r="7"/><path d="M31 38l7 9"/><path d="M49 38l-7 9"/><path d="M24 25l8-8"/><path d="M56 25l-8-8"/>', 'general-model-svg social-model-svg'),
        hierarquica: makeSvg('<path d="M18 60h44"/><path d="M26 46h28"/><path d="M34 32h12"/><circle cx="40" cy="20" r="6"/>', 'general-model-svg social-model-svg'),
        territorial: makeSvg('<path d="M20 60V20h40v40H20Z"/><path d="M32 48l8-20l8 20"/><path d="M40 12v12"/><path d="M52 16h12"/>', 'general-model-svg social-model-svg'),
        semi_social: makeSvg('<circle cx="25" cy="34" r="7"/><circle cx="40" cy="28" r="7"/><circle cx="55" cy="34" r="7"/><path d="M18 58c2-6 7-10 13-10"/><path d="M49 48c6 0 11 4 13 10"/>', 'general-model-svg social-model-svg'),
        subsocial: makeSvg('<circle cx="32" cy="28" r="9"/><circle cx="48" cy="46" r="6"/><path d="M26 58c2-8 8-13 14-13"/><path d="M38 36l7 6"/>', 'general-model-svg social-model-svg'),
        tolerante: makeSvg('<circle cx="31" cy="40" r="13"/><circle cx="49" cy="40" r="13"/><path d="M24 60h32"/>', 'general-model-svg social-model-svg'),
        agregada: makeSvg('<circle cx="24" cy="27" r="5"/><circle cx="38" cy="22" r="5"/><circle cx="54" cy="27" r="5"/><circle cx="30" cy="40" r="5"/><circle cx="46" cy="40" r="5"/><circle cx="24" cy="54" r="5"/><circle cx="40" cy="58" r="5"/><circle cx="56" cy="54" r="5"/>', 'general-model-svg social-model-svg'),
        migratoria_em_grupo: makeSvg('<path d="M12 56c14-24 34-34 56-30"/><path d="M56 18l12 8l-12 8"/><circle cx="23" cy="54" r="4"/><circle cx="36" cy="49" r="4"/><circle cx="49" cy="44" r="4"/>', 'general-model-svg social-model-svg'),
        reprodutiva_em_grupo: makeSvg('<path d="M18 58h44"/><path d="M26 47c6-10 14-16 14-24c0 8 8 14 14 24"/><circle cx="28" cy="32" r="4"/><circle cx="40" cy="26" r="4"/><circle cx="52" cy="32" r="4"/>', 'general-model-svg social-model-svg'),
        casal: makeSvg('<circle cx="28" cy="32" r="8"/><circle cx="52" cy="32" r="8"/><path d="M21 56c3-6 8-9 14-9"/><path d="M59 56c-3-6-8-9-14-9"/><path d="M36 28c2-4 5-6 8-6s6 2 8 6"/>', 'general-model-svg social-model-svg'),
        bando: makeSvg('<path d="M14 48c7-8 14-10 22-6"/><path d="M32 36c7-8 14-10 22-6"/><path d="M50 48c6-7 11-8 16-5"/><path d="M18 58h44"/>', 'general-model-svg social-model-svg'),
        manada: makeSvg('<path d="M16 58h48"/><circle cx="24" cy="46" r="5"/><circle cx="38" cy="42" r="5"/><circle cx="52" cy="46" r="5"/><path d="M24 51v8"/><path d="M38 47v12"/><path d="M52 51v8"/>', 'general-model-svg social-model-svg'),
        alcateia: makeSvg('<path d="M16 58h48"/><path d="M22 46c6-8 14-12 24-12c6 0 12 2 18 6"/><circle cx="28" cy="36" r="5"/><circle cx="44" cy="32" r="5"/><circle cx="58" cy="38" r="5"/>', 'general-model-svg social-model-svg'),
        cardume: makeSvg('<path d="M14 34c6-7 13-10 22-10c6 0 12 2 18 6c-5 8-13 12-22 12c-8 0-14-3-18-8Z"/><path d="M40 44c6-7 13-10 22-10c4 0 8 1 12 4c-5 8-13 12-22 12c-5 0-9-1-12-6Z"/><path d="M20 56h28"/>', 'general-model-svg social-model-svg'),
        colmeia: makeSvg('<path d="M26 20h28l10 18l-10 18H26L16 38l10-18Z"/><path d="M26 20l14 18l14-18"/><path d="M16 38h48"/><path d="M26 56l14-18l14 18"/>', 'general-model-svg social-model-svg'),
        formigueiro: makeSvg('<path d="M18 58h44"/><path d="M24 58c0-12 7-20 18-20c8 0 14 5 14 12"/><circle cx="30" cy="26" r="4"/><circle cx="40" cy="20" r="4"/><circle cx="50" cy="26" r="4"/><path d="M30 30l-6 8"/><path d="M50 30l6 8"/>', 'general-model-svg social-model-svg'),
        harem: makeSvg('<circle cx="40" cy="18" r="8"/><path d="M34 10h12"/><circle cx="22" cy="52" r="7"/><circle cx="40" cy="57" r="7"/><circle cx="58" cy="52" r="7"/><path d="M40 26v10"/><path d="M40 36L22 45"/><path d="M40 36l18 9"/>', 'general-model-svg social-model-svg'),
        matriarcal: makeSvg('<circle cx="28" cy="26" r="8"/><path d="M28 34v18"/><path d="M22 46h12"/><circle cx="48" cy="38" r="6"/><circle cx="60" cy="46" r="5"/><path d="M18 60h44"/>', 'general-model-svg social-model-svg'),
        patriarcal: makeSvg('<circle cx="52" cy="26" r="8"/><path d="M52 18l10-10"/><path d="M58 8h8v8"/><circle cx="32" cy="38" r="6"/><circle cx="20" cy="46" r="5"/><path d="M18 60h44"/>', 'general-model-svg social-model-svg')
    };
    return icons[key] || icons.social;
}
