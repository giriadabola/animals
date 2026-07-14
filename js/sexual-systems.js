export const sexualSystems = [
    'Dióico',
    'Hermafrodita sequencial',
    'Hermafrodita simultâneo',
    'Monoico',
    'Protândrico',
    'Protogínico'
];

export const sexualSystemDescriptions = {
    'Dióico': 'Cada indivíduo é macho ou fêmea.',
    'Hermafrodita sequencial': 'O indivíduo muda de sexo ao longo da vida.',
    'Hermafrodita simultâneo': 'O indivíduo apresenta os dois sexos ao mesmo tempo.',
    'Monoico': 'O mesmo indivíduo possui estruturas reprodutoras masculinas e femininas.',
    'Protândrico': 'Começa a vida como macho e pode tornar-se fêmea.',
    'Protogínico': 'Começa a vida como fêmea e pode tornar-se macho.'
};

export function normalizeSexualSystemKey(value = '') {
    return String(value).trim().toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function getSexualSystemSvg(value = '') {
    const key = normalizeSexualSystemKey(value);
    const icons = {
        dioico: `<svg class="metric-model-svg sexual-system-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="27" cy="27" r="11"/><path d="M27 38v25M18 52h18"/><circle cx="53" cy="53" r="11"/><path d="M61 45l10-10M63 35h8v8"/></svg>`,
        hermafroditaSequencial: `<svg class="metric-model-svg sexual-system-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="24" cy="40" r="12"/><path d="M36 40h18"/><path d="M48 32l8 8l-8 8"/><circle cx="64" cy="40" r="8"/></svg>`,
        hermafroditaSimultaneo: `<svg class="metric-model-svg sexual-system-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="18"/><path d="M40 22v36M22 40h36"/><circle cx="40" cy="40" r="5"/></svg>`,
        monoico: `<svg class="metric-model-svg sexual-system-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 64V24"/><path d="M40 34c-15-4-24 4-24 17c10 2 19-2 24-10"/><path d="M40 45c15-4 24 4 24 17c-10 2-19-2-24-10"/><circle cx="40" cy="18" r="6"/></svg>`,
        protandrico: `<svg class="metric-model-svg sexual-system-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="22" cy="40" r="11"/><path d="M33 40h18"/><path d="M45 32l8 8l-8 8"/><circle cx="62" cy="40" r="9"/><path d="M62 31v18M53 40h18"/></svg>`,
        protoginico: `<svg class="metric-model-svg sexual-system-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="22" cy="40" r="11"/><path d="M33 40h18"/><path d="M45 32l8 8l-8 8"/><circle cx="62" cy="40" r="9"/><path d="M62 31l-8 8M54 31l8 8"/></svg>`
    };
    const keyMap = {
        'hermafrodita sequencial': 'hermafroditaSequencial',
        'hermafrodita simultaneo': 'hermafroditaSimultaneo',
        protandrico: 'protandrico',
        protoginico: 'protoginico'
    };
    return icons[keyMap[key] || key] || icons.dioico;
}
