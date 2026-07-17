const options = [
    'Ninho', 'Montículo', 'Cabana de ramos e lama', 'Tenda de folhas', 'Folha enrolada ou unida', 'Abrigo de folhas', 'Leito vegetal', 'Plataforma de repouso', 'Abrigo flutuante ou jangada', 'Abrigo de barro ou lama', 'Abrigo subaquático', 'Abrigo de seda ou teia', 'Tubo de seda', 'Casulo ou invólucro', 'Estojo protetor portátil', 'Abrigo de espuma', 'Ninho de bolhas (Bolha de ar subaquática)', 'Toca', 'Covil', 'Câmara subterrânea', 'Galeria ou túnel', 'Poço vertical', 'Depressão no solo', 'Câmara de colónia', 'Caverna', 'Gruta submarina', 'Fenda rochosa', 'Saliência rochosa', 'Covil de neve', 'Cavidade em árvore', 'Tronco oco', 'Toco oco', 'Cavidade em caule ou planta', 'Buraco ou galeria em madeira', 'Cavidade em recife ou coral', 'Cavidade em termiteira ou formigueiro', 'Concha própria', 'Concha vazia reutilizada', 'No interior ou sobre um hospedeiro', 'Sob pedra', 'Sob tronco caído', 'Sob raízes', 'Entre detritos ou folhada', 'Vegetação densa', 'Entre juncos ou canaviais', 'Entre algas ou ervas marinhas', 'Ramo ou poleiro', 'Copa de árvore', 'Superfície rochosa', 'Solo exposto', 'Fundo aquático', 'Neve ou gelo', 'Sem abrigo fixo', 'Dormitório comunal', 'Sobre ou junto de outros indivíduos', 'Estrutura humana'
].sort((a, b) => a.localeCompare(b, 'pt-PT', { sensitivity: 'base' }));

const baseModels = [
    '<path d="M16 54c7-13 15-19 24-19s17 6 24 19"/><path d="M20 58h40"/>',
    '<path d="M14 58c8-22 17-32 26-32s18 10 26 32"/><path d="M18 58h44"/>',
    '<path d="M16 38l24-20l24 20v24H16Z"/><path d="M33 62V44h14v18"/>',
    '<path d="M14 52c16-24 34-30 52-20c-9 23-26 32-52 20Z"/><path d="M20 51l38-16"/>',
    '<path d="M12 60c5-24 14-36 28-36s23 12 28 36"/><path d="M28 60V47c0-8 4-12 12-12s12 4 12 12v13"/>',
    '<path d="M12 30h56"/><path d="M24 30c0 18 5 28 16 34c11-6 16-16 16-34"/><path d="M40 30v34"/>',
    '<path d="M12 48c9-7 18-7 27 0s18 7 29 0"/><path d="M16 60c8-6 16-6 24 0s16 6 24 0"/><path d="M40 18v25"/>',
    '<path d="M40 14v50"/><path d="M40 28L20 20M40 34l20-12M40 46L22 58M40 48l20 10"/>'
];

const detailModels = [
    '<circle cx="40" cy="40" r="7"/>',
    '<path d="M32 48l8-16l8 16Z"/>',
    '<path d="M32 40h16M40 32v16"/>',
    '<path d="M31 49l18-18M31 31l18 18"/>',
    '<path d="M31 45c4-12 10-16 18-12c-2 10-8 15-18 12Z"/>',
    '<circle cx="34" cy="42" r="4"/><circle cx="44" cy="34" r="5"/><circle cx="49" cy="47" r="3"/>',
    '<circle cx="40" cy="40" r="13"/><path d="M27 40h26M40 27v26M31 31l18 18M49 31L31 49"/>'
];

const accentNames = ['accent-bioma', 'accent-water', 'accent-life', 'accent-climate', 'accent-generic'];
const keyFor = value => `local-repouso-${value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const meta = new Map(options.map((label, index) => [label, {
    key: keyFor(label),
    accent: accentNames[index % accentNames.length],
    base: baseModels[index % baseModels.length],
    detail: detailModels[Math.floor(index / baseModels.length)]
}]));

export function getRestingPlaceOptions() { return [...options]; }
export function getRestingPlaceVisualMeta(value = '') { return meta.get(value) || null; }
export function getRestingPlaceVisualSvg(value = '') {
    const entry = meta.get(value);
    if (!entry) return '';
    return `<svg class="metric-model-svg general-model-svg resting-place-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">${entry.base}${entry.detail}</svg>`;
}