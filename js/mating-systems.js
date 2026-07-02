export const matingSystems = [
    'Monogamia',
    'Poligamia',
    'Poliginia',
    'Poliandria',
    'Poliginandria'
];

export const matingSystemDescriptions = {
    'Monogamia': 'Forma pares estáveis com um só parceiro de cada vez',
    'Poligamia': 'Um indivíduo pode acasalar com vários parceiros',
    'Poliginia': 'Um macho reproduz-se com várias fêmeas',
    'Poliandria': 'Uma fêmea reproduz-se com vários machos',
    'Poliginandria': 'Vários machos e várias fêmeas cruzam-se dentro do grupo'
};

function normalizeMatingKey(label = '') {
    return String(label).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function getMatingMeta(system = '') {
    const normalized = normalizeMatingKey(system);
    if (normalized.includes('poliginandria')) return { key: 'poliginandria', accent: 'accent-mating-polygynandry' };
    if (normalized.includes('poliginia')) return { key: 'poliginia', accent: 'accent-mating-polygyny' };
    if (normalized.includes('poliandria')) return { key: 'poliandria', accent: 'accent-mating-polyandry' };
    if (normalized.includes('poligamia')) return { key: 'poligamia', accent: 'accent-mating-polygamy' };
    if (normalized.includes('monogamia')) return { key: 'monogamia', accent: 'accent-mating-monogamy' };
    return { key: 'acasalamento', accent: 'accent-generic' };
}

export function getMatingSystemSvg(key = 'acasalamento') {
    const icons = {
        monogamia: `<svg class="metric-model-svg general-model-svg mating-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="28" cy="27" r="8"/><circle cx="52" cy="27" r="8"/><path d="M28 35v10"/><path d="M52 35v10"/><path d="M21 51c3-5 8-8 14-8s11 3 14 8"/><path d="M34 27h12"/><path d="M40 44v10"/><path d="M34 60h12"/></svg>`,
        poligamia: `<svg class="metric-model-svg general-model-svg mating-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="20" r="8"/><circle cx="22" cy="48" r="7"/><circle cx="40" cy="58" r="7"/><circle cx="58" cy="48" r="7"/><path d="M40 28v9"/><path d="M40 37L22 41"/><path d="M40 37v14"/><path d="M40 37l18 4"/></svg>`,
        poliginia: `<svg class="metric-model-svg general-model-svg mating-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="18" r="8"/><circle cx="22" cy="52" r="7"/><circle cx="40" cy="57" r="7"/><circle cx="58" cy="52" r="7"/><path d="M40 26v10"/><path d="M40 36L22 45"/><path d="M40 36v14"/><path d="M40 36l18 9"/><path d="M34 18h12"/></svg>`,
        poliandria: `<svg class="metric-model-svg general-model-svg mating-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="22" cy="22" r="7"/><circle cx="40" cy="17" r="7"/><circle cx="58" cy="22" r="7"/><circle cx="40" cy="57" r="8"/><path d="M22 29l18 15"/><path d="M40 24v20"/><path d="M58 29L40 44"/><path d="M34 57h12"/></svg>`,
        poliginandria: `<svg class="metric-model-svg general-model-svg mating-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="26" cy="22" r="7"/><circle cx="54" cy="22" r="7"/><circle cx="26" cy="58" r="7"/><circle cx="54" cy="58" r="7"/><path d="M26 29v22"/><path d="M54 29v22"/><path d="M33 22h14"/><path d="M33 58h14"/><path d="M31 27l18 26"/><path d="M49 27L31 53"/></svg>`,
        acasalamento: `<svg class="metric-model-svg general-model-svg mating-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="28" cy="30" r="8"/><circle cx="52" cy="30" r="8"/><path d="M28 38v10"/><path d="M52 38v10"/><path d="M22 54c4-5 8-8 14-8"/><path d="M58 54c-4-5-8-8-14-8"/><path d="M36 30h8"/><path d="M44 30h8"/></svg>`
    };
    return icons[key] || icons.acasalamento;
}
