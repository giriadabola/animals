export const kinshipLineageOptions = [
    'Matrilinear', 'Patrilinear', 'Bilinear', 'Bilateral', 'Matrilocal', 'Patrilocal',
    'Filopatria feminina', 'Filopatria masculina', 'Dispersão feminina', 'Dispersão masculina',
    'Grupo de aparentados', 'Grupo de não aparentados', 'Grupo de parentesco misto', 'Sem parentesco predominante'
];

const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-PT')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const svg = body => `<svg class="metric-model-svg kinship-lineage-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">${body}</svg>`;
const person = (cx, cy, r = 6) => `<circle cx="${cx}" cy="${cy}" r="${r}"/><path d="M${cx - 8} 64c1-8 4-13 8-13s7 5 8 13"/>`;

export function getKinshipLineageMeta(value = '') {
    const label = kinshipLineageOptions.find(option => normalize(option) === normalize(value)) || value;
    return { label: label || 'Parentesco e linhagem social', accent: 'accent-mating-polygamy' };
}

export function getKinshipLineageDescription(value = '') {
    const key = normalize(value);
    if (key === 'matrilinear') return 'A descendência e a pertença à linhagem são seguidas pela linha materna.';
    if (key === 'patrilinear') return 'A descendência e a pertença à linhagem são seguidas pela linha paterna.';
    if (key === 'bilinear' || key === 'bilateral') return 'A relação de parentesco considera as linhas materna e paterna.';
    if (key === 'matrilocal') return 'Após a formação do par, os descendentes permanecem junto da família materna.';
    if (key === 'patrilocal') return 'Após a formação do par, os descendentes permanecem junto da família paterna.';
    if (key.includes('filopatria feminina')) return 'As fêmeas permanecem no grupo natal e os machos tendem a dispersar-se.';
    if (key.includes('filopatria masculina')) return 'Os machos permanecem no grupo natal e as fêmeas tendem a dispersar-se.';
    if (key.includes('dispersao feminina')) return 'As fêmeas dispersam-se do grupo natal para estabelecer novas associações.';
    if (key.includes('dispersao masculina')) return 'Os machos dispersam-se do grupo natal para estabelecer novas associações.';
    if (key.includes('aparentados')) return 'O grupo é constituído sobretudo por indivíduos com relações de parentesco.';
    if (key.includes('nao aparentados')) return 'O grupo é constituído sobretudo por indivíduos sem parentesco directo.';
    if (key.includes('misto')) return 'O grupo combina indivíduos aparentados e não aparentados.';
    return 'Não existe uma relação de parentesco predominante identificada.';
}

export function getKinshipLineageSvg(value = '') {
    const key = normalize(value);
    if (key === 'matrilinear' || key === 'matrilocal' || key.includes('filopatria feminina')) return svg(person(40, 18, 7) + person(24, 55, 5) + person(40, 55, 5) + person(56, 55, 5) + '<path d="M40 25v17M40 42H24M40 42h16M24 42v8M40 42v8M56 42v8"/>');
    if (key === 'patrilinear' || key === 'patrilocal' || key.includes('filopatria masculina')) return svg(person(40, 18, 7) + person(24, 55, 5) + person(40, 55, 5) + person(56, 55, 5) + '<path d="M40 25v17M40 42H24M40 42h16M24 42v8M40 42v8M56 42v8"/><path d="M32 31h16"/>');
    if (key === 'bilinear' || key === 'bilateral') return svg(person(24, 22, 6) + person(56, 22, 6) + person(40, 52, 6) + '<path d="M24 29v12h32M56 29v12M40 41v11M24 41h32"/>');
    if (key.includes('dispersao feminina')) return svg(person(40, 24, 7) + person(24, 55, 5) + person(56, 55, 5) + '<path d="M40 31v12M40 43L24 50M40 43l16 7M18 64h-8M62 64h8M14 60l-6 4l6 4M66 60l6 4l-6 4"/>');
    if (key.includes('dispersao masculina')) return svg(person(24, 24, 7) + person(56, 24, 7) + person(40, 55, 5) + '<path d="M24 31v12M56 31v12M24 43h32M40 43v12M18 16l-8-6M62 16l8-6"/>');
    if (key.includes('aparentados')) return svg(person(24, 27, 6) + person(40, 21, 6) + person(56, 27, 6) + '<path d="M24 34v14M40 28v20M56 34v14M24 48h32"/>');
    if (key.includes('nao aparentados')) return svg(person(22, 27, 6) + person(40, 27, 6) + person(58, 27, 6) + '<path d="M16 60h12M34 60h12M52 60h12"/>');
    if (key.includes('misto')) return svg(person(24, 27, 6) + person(40, 21, 6) + person(56, 27, 6) + '<path d="M24 34v14M40 28v20M56 34v14M24 48h32M40 10v8"/>');
    return svg(person(24, 29, 6) + person(40, 23, 6) + person(56, 29, 6) + '<path d="M18 62h44M32 43h16"/>');
}
