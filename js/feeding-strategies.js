export const feedingStrategies = [
    'Armadilha',
    'Armazenamento de alimento',
    'Caça',
    'Camuflagem',
    'Coleta',
    'Cooperação em grupo',
    'Emboscada',
    'Escavação',
    'Filtração',
    'Mergulho',
    'Migração para alimento',
    'Necrofagia',
    'Parasitismo',
    'Pastoreio',
    'Pesca',
    'Picagem',
    'Procura em árvores',
    'Procura no solo',
    'Perseguição',
    'Ramoneio',
    'Raspagem',
    'Roubo de alimento',
    'Sucção'
];

export const feedingStrategyDescriptions = {
    'Armadilha': 'Captura usando teias, fossas ou estruturas preparadas',
    'Armazenamento de alimento': 'Guarda alimento para consumir mais tarde',
    'Caça': 'Localiza e captura presas ativamente',
    'Camuflagem': 'Aproxima-se ou espera sem ser detetado',
    'Coleta': 'Recolhe alimento disponível no ambiente',
    'Cooperação em grupo': 'Obtém alimento com coordenação social',
    'Emboscada': 'Espera escondido e ataca de surpresa',
    'Escavação': 'Procura alimento debaixo do solo ou sedimento',
    'Filtração': 'Filtra partículas alimentares suspensas',
    'Mergulho': 'Obtém alimento submerso',
    'Migração para alimento': 'Desloca-se sazonalmente até áreas ricas em alimento',
    'Necrofagia': 'Consome carcaças ou restos animais',
    'Parasitismo': 'Obtém alimento a partir de um hospedeiro',
    'Pastoreio': 'Consome ervas e vegetação rasteira',
    'Pesca': 'Captura alimento aquático à superfície ou em águas rasas',
    'Picagem': 'Usa bico, ferrão ou peças bucais para perfurar',
    'Procura em árvores': 'Explora troncos, ramos, folhas ou frutos',
    'Procura no solo': 'Procura alimento no chão, folhada ou areia',
    'Perseguição': 'Segue e alcança presas em movimento',
    'Ramoneio': 'Alimenta-se de folhas, rebentos e ramos altos',
    'Raspagem': 'Raspa superfícies para remover alimento',
    'Roubo de alimento': 'Tira alimento capturado ou guardado por outro animal',
    'Sucção': 'Absorve líquidos, néctar, seiva ou sangue'
};

function normalizeStrategyKey(label = '') {
    return String(label).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function getFeedingStrategyMeta(strategy = '') {
    const normalized = normalizeStrategyKey(strategy);
    if (normalized.includes('armadilha')) return { key: 'armadilha', accent: 'accent-width' };
    if (normalized.includes('armazenamento')) return { key: 'armazenamento', accent: 'accent-weight' };
    if (normalized.includes('caca')) return { key: 'caca', accent: 'accent-tail' };
    if (normalized.includes('camuflagem')) return { key: 'camuflagem', accent: 'accent-wing' };
    if (normalized.includes('coleta')) return { key: 'coleta', accent: 'accent-generic' };
    if (normalized.includes('cooperacao')) return { key: 'cooperacao', accent: 'accent-leg' };
    if (normalized.includes('emboscada')) return { key: 'emboscada', accent: 'accent-tail' };
    if (normalized.includes('escavacao')) return { key: 'escavacao', accent: 'accent-weight' };
    if (normalized.includes('filtracao')) return { key: 'filtracao', accent: 'accent-length' };
    if (normalized.includes('mergulho')) return { key: 'mergulho', accent: 'accent-length' };
    if (normalized.includes('migracao')) return { key: 'migracao', accent: 'accent-beak' };
    if (normalized.includes('necrofagia')) return { key: 'necrofagia', accent: 'accent-tail' };
    if (normalized.includes('parasitismo')) return { key: 'parasitismo', accent: 'accent-leg' };
    if (normalized.includes('pastoreio')) return { key: 'pastoreio', accent: 'accent-wing' };
    if (normalized.includes('pesca')) return { key: 'pesca', accent: 'accent-length' };
    if (normalized.includes('picagem')) return { key: 'picagem', accent: 'accent-beak' };
    if (normalized.includes('arvores')) return { key: 'arvores', accent: 'accent-wing' };
    if (normalized.includes('solo')) return { key: 'solo', accent: 'accent-weight' };
    if (normalized.includes('perseguicao')) return { key: 'perseguicao', accent: 'accent-speed-max' };
    if (normalized.includes('ramoneio')) return { key: 'ramoneio', accent: 'accent-wing' };
    if (normalized.includes('raspagem')) return { key: 'raspagem', accent: 'accent-beak' };
    if (normalized.includes('roubo')) return { key: 'roubo', accent: 'accent-tail' };
    if (normalized.includes('succao') || normalized.includes('sucao')) return { key: 'succao', accent: 'accent-egg' };
    return { key: 'estrategia', accent: 'accent-generic' };
}

export function getFeedingStrategySvg(key = 'estrategia') {
    const icons = {
        armadilha: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 58c10-22 34-22 44 0"/><path d="M20 58h40"/><path d="M27 50l-8-9"/><path d="M53 50l8-9"/><circle cx="40" cy="48" r="7"/></svg>`,
        armazenamento: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M22 31h36l-4 36H26L22 31Z"/><path d="M30 31c0-9 4-15 10-15s10 6 10 15"/><path d="M31 45h18"/><path d="M31 56h14"/></svg>`,
        caca: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 56c14-20 30-32 48-36"/><path d="M53 18h12v12"/><circle cx="28" cy="52" r="8"/><path d="M44 38l13 13"/></svg>`,
        camuflagem: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 58c12-27 29-40 50-43c-3 27-20 43-50 50"/><path d="M20 59c14-12 27-25 41-40"/><path d="M28 47h10"/><path d="M45 34h10"/></svg>`,
        coleta: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M21 29h38l-4 36H25L21 29Z"/><path d="M30 29c0-8 4-13 10-13s10 5 10 13"/><circle cx="33" cy="47" r="4"/><circle cx="48" cy="52" r="4"/></svg>`,
        cooperacao: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="24" cy="34" r="8"/><circle cx="56" cy="34" r="8"/><circle cx="40" cy="53" r="8"/><path d="M31 40l5 6"/><path d="M49 40l-5 6"/></svg>`,
        emboscada: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M15 58h50"/><path d="M21 58c8-18 20-29 36-34"/><path d="M58 24v16h-16"/><path d="M33 50l-10-9"/></svg>`,
        escavacao: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 62h44"/><path d="M24 51c8-8 24-8 32 0"/><path d="M42 17l15 15l-22 22l-15-15L42 17Z"/><path d="M35 24l15 15"/></svg>`,
        filtracao: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 22h44"/><path d="M23 38h34"/><path d="M28 54h24"/><path d="M24 22l16 44l16-44"/></svg>`,
        mergulho: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M17 25c10 8 20 8 30 0s20-8 30 0"/><path d="M40 18v42"/><path d="M27 47l13 13l13-13"/><circle cx="58" cy="47" r="4"/></svg>`,
        migracao: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 56c16-26 34-36 54-30"/><path d="M58 18l12 8l-12 8"/><path d="M20 38h28"/><path d="M36 28l12 10l-12 10"/></svg>`,
        necrofagia: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 57c10-18 26-29 48-33"/><path d="M28 57l24-24"/><path d="M39 50l-8-8"/><path d="M55 35l-7-7"/><circle cx="60" cy="27" r="3"/></svg>`,
        parasitismo: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><ellipse cx="40" cy="42" rx="17" ry="24"/><path d="M25 34l-13-7"/><path d="M55 34l13-7"/><path d="M26 51H13"/><path d="M54 51h13"/><path d="M40 18v-8"/></svg>`,
        pastoreio: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M15 60h50"/><path d="M22 60V42"/><path d="M35 60V34"/><path d="M48 60V40"/><path d="M61 60V31"/></svg>`,
        pesca: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M20 17v24c0 9 7 16 16 16h9"/><path d="M45 57l9-8v16l-9-8Z"/><path d="M54 49c6 1 10 4 12 8c-2 4-6 7-12 8"/><circle cx="59" cy="55" r="2"/></svg>`,
        picagem: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 54l30-30l14 14l-30 30H18V54Z"/><path d="M45 27l8-12"/><path d="M54 36l12-8"/></svg>`,
        arvores: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 65V25"/><path d="M40 38l-14-12"/><path d="M40 47l16-14"/><circle cx="26" cy="24" r="10"/><circle cx="56" cy="30" r="11"/><circle cx="40" cy="20" r="12"/></svg>`,
        solo: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M14 60h52"/><path d="M20 48c13-8 27-8 40 0"/><circle cx="29" cy="42" r="5"/><circle cx="50" cy="41" r="4"/></svg>`,
        perseguicao: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 55h20"/><path d="M22 42h28"/><path d="M34 29h30"/><path d="M56 20l10 9l-10 9"/></svg>`,
        ramoneio: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M22 65c3-22 15-37 36-45"/><path d="M39 37c-11-14-23-10-27 2c11 7 21 6 27-2Z"/><path d="M45 31c13-15 25-10 29 3c-12 7-23 6-29-3Z"/></svg>`,
        raspagem: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 60h44"/><path d="M27 51l25-25l9 9l-25 25"/><path d="M25 38h16"/><path d="M20 47h16"/></svg>`,
        roubo: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M23 34h35l-4 30H27l-4-30Z"/><path d="M31 34c0-8 4-13 10-13s10 5 10 13"/><path d="M17 20h17"/><path d="M25 12l-8 8l8 8"/></svg>`,
        succao: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M42 12c12 14 19 25 19 36c0 11-8 19-19 19s-19-8-19-19c0-11 7-22 19-36Z"/><path d="M16 31h16"/><path d="M24 23v16"/></svg>`,
        estrategia: `<svg class="metric-model-svg feeding-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="25"/><path d="M40 20v20l14 8"/></svg>`
    };
    return icons[key] || icons.estrategia;
}
