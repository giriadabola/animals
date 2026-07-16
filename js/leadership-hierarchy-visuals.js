export const leadershipHierarchyOptions = [
    'Sem hierarquia definida', 'Hierárquica', 'Hierarquia de dominância', 'Hierarquia linear',
    'Hierarquia não linear', 'Hierarquia despótica', 'Hierarquia tolerante', 'Hierarquia igualitária',
    'Hierarquia por idade', 'Hierarquia por tamanho', 'Matriarcal', 'Patriarcal', 'Liderança partilhada',
    'Liderança temporária', 'Liderança por experiência', 'Liderança por reprodução'
];

const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const svg = body => `<svg class="metric-model-svg leadership-hierarchy-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">${body}</svg>`;
const person = (cx, cy, r = 6) => `<circle cx="${cx}" cy="${cy}" r="${r}"/><path d="M${cx - 8} 64c1-8 4-13 8-13s7 5 8 13"/>`;

export function getLeadershipHierarchyMeta(value = '') {
    const label = leadershipHierarchyOptions.find(option => normalize(option) === normalize(value)) || value;
    return { label: label || 'Liderança e hierarquia', accent: 'accent-mating-polygamy' };
}

export function getLeadershipHierarchyDescription(value = '') {
    const key = normalize(value);
    if (key === 'sem hierarquia definida' || key === 'hierarquia igualitaria') return 'As relações sociais não apresentam uma hierarquia de liderança marcada.';
    if (key.includes('dominancia')) return 'A posição social depende de relações de dominância entre os indivíduos.';
    if (key.includes('linear')) return 'Os indivíduos ocupam posições ordenadas numa sequência hierárquica.';
    if (key.includes('nao linear')) return 'As relações de dominância formam uma rede sem uma sequência única.';
    if (key.includes('despotica')) return 'Um indivíduo ou pequeno grupo concentra o controlo sobre os restantes.';
    if (key.includes('tolerante')) return 'A hierarquia existe, mas as relações são relativamente permissivas.';
    if (key.includes('idade')) return 'A posição hierárquica é influenciada pela idade dos indivíduos.';
    if (key.includes('tamanho')) return 'A posição hierárquica é influenciada pelo tamanho corporal.';
    if (key === 'matriarcal') return 'A liderança é exercida principalmente por uma fêmea ou por fêmeas.';
    if (key === 'patriarcal') return 'A liderança é exercida principalmente por um macho ou por machos.';
    if (key.includes('partilhada')) return 'A liderança é distribuída por vários indivíduos.';
    if (key.includes('temporaria')) return 'A liderança muda de acordo com o contexto ou durante um período limitado.';
    if (key.includes('experiencia')) return 'A experiência acumulada contribui para a posição de liderança.';
    if (key.includes('reproducao')) return 'A liderança está associada ao papel reprodutor dentro do grupo.';
    if (key === 'hierarquica') return 'O grupo apresenta posições sociais diferenciadas.';
    return 'Estrutura de liderança e relações hierárquicas deste grupo.';
}

export function getLeadershipHierarchySvg(value = '') {
    const key = normalize(value);
    if (key === 'sem hierarquia definida' || key === 'hierarquia igualitaria') return svg(person(24, 30, 5) + person(40, 30, 5) + person(56, 30, 5) + '<path d="M18 48h12M34 48h12M50 48h12"/>');
    if (key.includes('linear') && !key.includes('nao')) return svg(person(40, 18, 7) + person(28, 49, 5) + person(52, 49, 5) + '<path d="M40 25v15M28 40h24M28 40v9M52 40v9"/>');
    if (key.includes('nao linear')) return svg(person(22, 25, 5) + person(40, 20, 6) + person(58, 25, 5) + '<path d="M22 31l18 9l18-9M22 31l18-11l18 11M40 26v14"/>');
    if (key.includes('dominancia') || key.includes('despotica') || key === 'hierarquica') return svg(person(40, 17, 8) + person(22, 53, 5) + person(40, 53, 5) + person(58, 53, 5) + '<path d="M40 25v16M22 41h36M22 41v8M40 41v8M58 41v8"/>');
    if (key.includes('idade')) return svg('<circle cx="40" cy="20" r="10"/><circle cx="25" cy="48" r="6"/><circle cx="55" cy="48" r="4"/><path d="M40 30v10M40 40H25M40 40h15M25 54v10M55 54v10"/>');
    if (key.includes('tamanho')) return svg(person(40, 19, 9) + person(24, 51, 5) + person(56, 51, 4) + '<path d="M40 28v14M40 42H24M40 42h16"/>');
    if (key === 'matriarcal') return svg(person(40, 18, 8) + person(24, 53, 5) + person(40, 53, 5) + person(56, 53, 5) + '<path d="M40 26v15M24 41h32M40 12v-6"/>');
    if (key === 'patriarcal') return svg(person(40, 18, 8) + person(24, 53, 5) + person(40, 53, 5) + person(56, 53, 5) + '<path d="M40 26v15M24 41h32M40 12h10"/>');
    if (key.includes('partilhada') || key.includes('tolerante')) return svg(person(24, 25, 7) + person(56, 25, 7) + person(40, 53, 5) + '<path d="M30 31l10 14M50 31L40 45M30 25h20"/>');
    if (key.includes('temporaria')) return svg('<circle cx="40" cy="40" r="24"/><path d="M40 16v12M40 52v12M16 40h12M52 40h12M33 34l7 7l9-12"/>');
    if (key.includes('experiencia') || key.includes('reproducao')) return svg(person(40, 18, 8) + '<path d="M40 26v18M24 64c2-11 8-17 16-17s14 6 16 17"/><path d="M28 35h24"/>');
    return svg(person(40, 18, 7) + person(24, 53, 5) + person(56, 53, 5) + '<path d="M40 25v16M24 41h32M24 41v8M56 41v8"/>');
}
