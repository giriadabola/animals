export const digestiveSystemOptions = ['Presente', 'Reduzido', 'Ausente'];

const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const svg = body => `<svg class="metric-model-svg digestive-system-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">${body}</svg>`;

export function getDigestiveSystemMeta(value = '') {
    const label = digestiveSystemOptions.find(option => normalize(option) === normalize(value)) || value;
    return { label: label || 'Presença/ausência de sistema digestivo', accent: 'accent-life' };
}

export function getDigestiveSystemDescription(value = '') {
    const key = normalize(value);
    if (key === 'presente') return 'Existe um sistema digestivo funcional para processar os alimentos.';
    if (key === 'reduzido') return 'Existe um sistema digestivo simplificado ou parcialmente especializado.';
    if (key === 'ausente') return 'Não existe um sistema digestivo especializado; a digestão ocorre por mecanismos alternativos.';
    return 'Estado do sistema digestivo deste animal.';
}

export function getDigestiveSystemSvg(value = '') {
    const key = normalize(value);
    if (key === 'presente') return svg('<path d="M31 14c-4 4-5 8-4 12c1 4 4 6 4 10v8c0 7-4 12-10 16"/><path d="M47 14c4 4 5 8 4 12c-1 4-4 6-4 10v10c0 8 5 12 10 14"/><path d="M33 36h14"/><path d="M28 58c4-3 8-4 12-4s8 1 12 4"/>');
    if (key === 'reduzido') return svg('<path d="M25 18c8 5 12 11 12 18s-4 13-12 18"/><path d="M55 18c-8 5-12 11-12 18s4 13 12 18"/><path d="M37 36h6"/><path d="M29 62h22"/><path d="M36 28h8"/>');
    if (key === 'ausente') return svg('<path d="M18 18l44 44M62 18L18 62"/><path d="M28 28h24M28 52h24"/><circle cx="40" cy="40" r="26"/>');
    return svg('<circle cx="40" cy="40" r="24"/><path d="M40 25v30M25 40h30"/>');
}
