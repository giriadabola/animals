export const feedingTypes = [
    'Herbívoro',
    'Carnívoro',
    'Omnívoro',
    'Insetívoro',
    'Piscívoro',
    'Frugívoro',
    'Granívoro',
    'Nectarívoro',
    'Folívoro',
    'Xilófago',
    'Necrófago',
    'Detritívoro',
    'Coprófago',
    'Filtrador',
    'Hematófago',
    'Planctívoro',
    'Mirmecófago'
];

export const feedingTypeDescriptions = {
    'Herbívoro': 'Baseada em plantas, folhas, caules ou ervas',
    'Carnívoro': 'Baseada em outros animais',
    'Omnívoro': 'Combina alimentos vegetais e animais',
    'Insetívoro': 'Especializada em insetos e pequenos artrópodes',
    'Piscívoro': 'Especializada em peixes',
    'Frugívoro': 'Baseada sobretudo em frutos',
    'Granívoro': 'Baseada em sementes e grãos',
    'Nectarívoro': 'Baseada em néctar',
    'Folívoro': 'Baseada sobretudo em folhas',
    'Xilófago': 'Consome madeira ou tecido lenhoso',
    'Necrófago': 'Consome carcaças',
    'Detritívoro': 'Consome matéria orgânica em decomposição',
    'Coprófago': 'Consome fezes',
    'Filtrador': 'Filtra alimento suspenso na água',
    'Hematófago': 'Alimenta-se de sangue',
    'Planctívoro': 'Alimenta-se de plâncton',
    'Mirmecófago': 'Especializado em formigas e térmitas'
};

function normalizeFeedingKey(label = '') {
    return String(label).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function getFeedingVisualMeta(type = '') {
    const normalized = normalizeFeedingKey(type);
    if (normalized.includes('herbivoro')) return { key: 'herbivoro', title: type || 'Herbívoro', accent: 'accent-wing' };
    if (normalized.includes('carnivoro')) return { key: 'carnivoro', title: type || 'Carnívoro', accent: 'accent-tail' };
    if (normalized.includes('omnivoro')) return { key: 'omnivoro', title: type || 'Omnívoro', accent: 'accent-generic' };
    if (normalized.includes('insetivoro')) return { key: 'insetivoro', title: type || 'Insetívoro', accent: 'accent-leg' };
    if (normalized.includes('piscivoro')) return { key: 'piscivoro', title: type || 'Piscívoro', accent: 'accent-length' };
    if (normalized.includes('frugivoro')) return { key: 'frugivoro', title: type || 'Frugívoro', accent: 'accent-egg' };
    if (normalized.includes('granivoro')) return { key: 'granivoro', title: type || 'Granívoro', accent: 'accent-beak' };
    if (normalized.includes('nectarivoro')) return { key: 'nectarivoro', title: type || 'Nectarívoro', accent: 'accent-egg' };
    if (normalized.includes('folivoro')) return { key: 'folivoro', title: type || 'Folívoro', accent: 'accent-wing' };
    if (normalized.includes('xilofago')) return { key: 'xilofago', title: type || 'Xilófago', accent: 'accent-weight' };
    if (normalized.includes('necrofago')) return { key: 'necrofago', title: type || 'Necrófago', accent: 'accent-tail' };
    if (normalized.includes('detritivoro')) return { key: 'detritivoro', title: type || 'Detritívoro', accent: 'accent-width' };
    if (normalized.includes('coprofago')) return { key: 'coprofago', title: type || 'Coprófago', accent: 'accent-generic' };
    if (normalized.includes('filtrador')) return { key: 'filtrador', title: type || 'Filtrador', accent: 'accent-length' };
    if (normalized.includes('hematofago')) return { key: 'hematofago', title: type || 'Hematófago', accent: 'accent-tail' };
    if (normalized.includes('planctivoro')) return { key: 'planctivoro', title: type || 'Planctívoro', accent: 'accent-width' };
    if (normalized.includes('mirmecofago')) return { key: 'mirmecofago', title: type || 'Mirmecófago', accent: 'accent-leg' };
    return { key: 'alimentacao', title: type || 'Alimentação', accent: 'accent-generic' };
}

export function getFeedingModelSvg(key = 'alimentacao') {
    const icons = {
        herbivoro: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M17 62C30 31 48 18 67 15C64 38 51 57 21 65"/><path d="M23 60C37 49 49 36 61 20"/><path d="M37 48l-9-18"/><path d="M48 36l15 9"/></svg>`,
        carnivoro: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 58c10-18 24-29 42-33"/><path d="M30 44l-7-15"/><path d="M45 35l5-17"/><path d="M59 26l8 13"/><path d="M25 61h35"/></svg>`,
        omnivoro: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 57c9-19 24-31 44-37"/><path d="M50 22c4 8 3 16-2 24"/><circle cx="29" cy="52" r="12"/><path d="M55 54h10"/><path d="M60 49v10"/></svg>`,
        insetivoro: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><ellipse cx="40" cy="42" rx="13" ry="19"/><path d="M40 17v8"/><path d="M25 33L13 25"/><path d="M55 33l12-8"/><path d="M24 48H12"/><path d="M56 48h12"/><path d="M30 59l-8 10"/><path d="M50 59l8 10"/></svg>`,
        piscivoro: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M13 42c10-13 23-19 39-19c9 0 16 3 22 9c-6 13-17 21-32 21S22 49 13 42Z"/><path d="M66 33l9-10v25l-9-10"/><circle cx="31" cy="37" r="3"/></svg>`,
        frugivoro: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M39 27c-8-8-18-2-18 12c0 16 9 29 19 29s19-13 19-29c0-14-10-20-20-12Z"/><path d="M40 27c1-9 6-14 15-16"/><path d="M51 12c-1 8-6 12-14 13"/></svg>`,
        granivoro: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><ellipse cx="28" cy="49" rx="8" ry="15"/><ellipse cx="43" cy="40" rx="8" ry="15"/><ellipse cx="56" cy="53" rx="8" ry="15"/><path d="M24 66h36"/></svg>`,
        nectarivoro: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 16v49"/><path d="M40 32c-11-16-24-13-29 1c12 8 23 7 29-1Z"/><path d="M40 32c11-16 24-13 29 1c-12 8-23 7-29-1Z"/><path d="M30 64h20"/><path d="M35 54h10"/></svg>`,
        folivoro: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M15 58c9-25 27-39 51-43c-3 28-20 45-49 50"/><path d="M20 60c14-11 27-25 40-40"/><path d="M31 49l-7-13"/><path d="M44 36l13 7"/></svg>`,
        xilofago: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M35 12h10c7 0 13 6 13 13v30c0 7-6 13-13 13H35c-7 0-13-6-13-13V25c0-7 6-13 13-13Z"/><path d="M40 12v56"/><path d="M30 28h20"/><path d="M31 44h18"/><path d="M33 58h14"/></svg>`,
        necrofago: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 56c7-18 22-29 43-33l7 9l-8 8c-4 16-17 25-39 27"/><path d="M31 55l10-10"/><path d="M45 42l8-8"/><circle cx="58" cy="29" r="3"/></svg>`,
        detritivoro: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 56c10-13 25-16 45-9"/><path d="M20 42c11-8 22-9 34-3"/><circle cx="27" cy="57" r="5"/><circle cx="43" cy="51" r="4"/><circle cx="57" cy="58" r="5"/></svg>`,
        coprofago: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M23 61h34"/><path d="M27 51c3-9 22-9 26 0"/><path d="M31 41c3-8 15-8 18 0"/><path d="M36 31c2-5 6-5 8 0"/></svg>`,
        filtrador: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M15 25h50"/><path d="M20 39h45"/><path d="M15 53h50"/><path d="M56 17v46c0 6-5 11-11 11H35c-6 0-11-5-11-11V17"/><path d="M30 25l20 40"/><path d="M50 25L30 65"/></svg>`,
        hematofago: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 10c14 17 22 30 22 42c0 12-9 20-22 20s-22-8-22-20c0-12 8-25 22-42Z"/><path d="M32 52c4 5 11 6 17 1"/></svg>`,
        planctivoro: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="23" cy="30" r="6"/><circle cx="50" cy="24" r="4"/><circle cx="58" cy="53" r="7"/><circle cx="31" cy="58" r="4"/><path d="M23 36v13"/><path d="M50 28l7 18"/><path d="M31 62l-8 8"/></svg>`,
        mirmecofago: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="25" cy="42" r="8"/><circle cx="40" cy="42" r="10"/><circle cx="57" cy="42" r="8"/><path d="M20 35l-8-8"/><path d="M60 35l8-8"/><path d="M25 50l-7 11"/><path d="M40 52v14"/><path d="M55 50l7 11"/></svg>`,
        alimentacao: `<svg class="metric-model-svg feeding-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 64h44"/><path d="M25 18v23c0 9 7 16 15 16s15-7 15-16V18"/><path d="M32 18v22"/><path d="M48 18v22"/></svg>`
    };
    return icons[key] || icons.alimentacao;
}
