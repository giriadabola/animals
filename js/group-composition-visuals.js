export const groupCompositionOptions = [
    'Solitário', 'Casal', 'Casal com crias', 'Mãe e crias', 'Pai e crias', 'Adulto e crias',
    'Grupo familiar', 'Grupo familiar alargado', 'Grupo multigeracional', 'Grupo maternal',
    'Grupo paternal', 'Grupo de irmãos / ninhada', 'Grupo apenas de juvenis', 'Grupo apenas de subadultos',
    'Grupo apenas de adultos', 'Grupo apenas de machos', 'Grupo apenas de fêmeas', 'Grupo de machos adultos',
    'Grupo de fêmeas adultas', 'Grupo de crias', 'Grupo de idade mista', 'Grupo misto — machos e fêmeas',
    'Grupo misto — sexo e idade variados', 'Grupo de fêmeas com crias', 'Grupo de machos com crias',
    'Grupo de solteiros / bachelor group', 'Harém', 'Harém com crias', 'Harém invertido', 'Grupo reprodutor',
    'Grupo não reprodutor', 'Colónia reprodutora', 'Colónia não reprodutora', 'Colónia mista',
    'Colónia maternal', 'Colónia com castas', 'Enxame', 'Agregação temporária', 'Agregação sazonal',
    'Dormitório comunal', 'Berçário / creche', 'Subgrupo dentro de sociedade maior', 'Composição variável',
    'Composição variável sazonalmente', 'Unimacho–unifêmea', 'Unimacho–multifêmea', 'Multimacho–unifêmea',
    'Multimacho–multifêmea', 'Multifêmea', 'Multimacho', 'Grupo misto', 'Grupo unissexual', 'Fêmea e crias',
    'Macho e crias', 'Casal e crias', 'Várias gerações', 'Juvenis apenas', 'Adultos apenas', 'Idades mistas',
    'Unidade de um macho', 'Unidade de várias fêmeas', 'Unidade familiar', 'Unidade reprodutora', 'Unidade não reprodutora'
];

const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-PT')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const esc = value => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const svg = body => `<svg class="metric-model-svg group-composition-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">${body}</svg>`;

function person(cx, cy, r = 5) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}"/><path d="M${cx - 8} 64c1-8 4-13 8-13s7 5 8 13"/>`;
}

function getCompositionDescription(label) {
    const value = normalize(label);
    if (value.includes('solitario') || value.includes('unidade de um macho')) return 'Um único indivíduo constitui a unidade social.';
    if (value.includes('casal') || value.includes('unimacho') && value.includes('unifemea')) return 'A unidade é formada por dois adultos, podendo incluir crias.';
    if (value.includes('crias') || value.includes('ninhada') || value.includes('bercario')) return 'A composição inclui adultos responsáveis e indivíduos jovens.';
    if (value.includes('famil') || value.includes('parent')) return 'Grupo formado por indivíduos ligados por relações familiares.';
    if (value.includes('colonia') || value.includes('enxame') || value.includes('agregacao')) return 'Conjunto de indivíduos reunidos numa unidade social comum.';
    if (value.includes('geracoes') || value.includes('idade mista') || value.includes('idades mistas')) return 'Reúne indivíduos de diferentes idades ou gerações.';
    if (value.includes('reprodutor')) return 'Grupo organizado em torno da reprodução ou sem função reprodutora.';
    if (value.includes('variavel') || value.includes('sazonal')) return 'A composição pode mudar ao longo do tempo ou das estações.';
    return 'Composição específica dos indivíduos que formam o grupo.';
}

export function getGroupCompositionMeta(value = '') {
    const label = groupCompositionOptions.find(option => normalize(option) === normalize(value)) || value;
    return { key: normalize(label), title: label || 'Composição do grupo', description: getCompositionDescription(label), accent: 'accent-mating-polygamy' };
}

export function getGroupCompositionSvg(value = '') {
    const label = getGroupCompositionMeta(value).title;
    const key = normalize(label);
    if (key.includes('solitario') || key.includes('unidade de um macho')) return svg(person(40, 30, 7));
    if (key.includes('casal') || key.includes('unimacho') && key.includes('unifemea')) return svg(person(27, 29, 6) + person(53, 29, 6) + '<path d="M34 29h12"/>');
    if (key.includes('crias') || key.includes('ninhada') || key.includes('bercario')) return svg(person(25, 29, 7) + person(55, 29, 7) + '<circle cx="40" cy="45" r="4"/><path d="M34 64c1-7 3-11 6-11s5 4 6 11"/>');
    if (key.includes('colonia') || key.includes('enxame') || key.includes('agregacao')) return svg(person(22, 26, 5) + person(40, 21, 6) + person(58, 26, 5) + person(31, 48, 5) + person(49, 48, 5));
    if (key.includes('harem')) return svg(person(40, 18, 7) + person(22, 51, 5) + person(40, 56, 5) + person(58, 51, 5) + '<path d="M40 25v15M40 40L22 46M40 40v11M40 40l18 6"/>');
    if (key.includes('geracoes') || key.includes('idade mista') || key.includes('idades mistas')) return svg(person(24, 28, 5) + person(40, 21, 7) + person(56, 28, 5) + '<path d="M18 64h44M32 48h16M40 28v20"/>');
    if (key.includes('famil') || key.includes('femea e crias') || key.includes('macho e crias')) return svg(person(28, 24, 7) + person(52, 24, 7) + person(40, 46, 5) + '<path d="M28 31v10M52 31v10M28 41h24M40 41v5"/>');
    if (key.includes('variavel') || key.includes('sazonal')) return svg('<circle cx="40" cy="40" r="22"/><path d="M40 18v12M40 50v12M18 40h12M50 40h12M30 30l20 20M50 30L30 50"/>');
    if (key.includes('reprodutor')) return svg(person(40, 23, 7) + '<path d="M40 31v12M28 64c2-10 6-15 12-15s10 5 12 15M24 36l-8 8M56 36l8 8"/>');
    return svg(person(24, 30, 6) + person(40, 24, 6) + person(56, 30, 6) + '<path d="M24 36v12M40 30v12M56 36v12M24 48h32"/>');
}

export function renderGroupCompositionItem(item, inactive = false) {
    const meta = getGroupCompositionMeta(item.label);
    return `<article class="perception-type-item${inactive ? ' perception-type-catalog-item' : ''}" title="${esc(meta.description)}"><div class="perception-type-popup-icon">${getGroupCompositionSvg(meta.title)}</div><div class="perception-type-popup-copy"><strong>${esc(meta.title)}</strong><p>${esc(meta.description)}</p></div></article>`;
}
