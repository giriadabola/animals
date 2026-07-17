const options = [
    'Ramos', 'Galhos', 'Gravetos', 'Pedaços de troncos', 'Folhas', 'Agulhas de pinheiro', 'Gramíneas', 'Ervas secas',
    'Musgos', 'Líquenes', 'Raízes', 'Cascas de árvore', 'Serradura', 'Lenho', 'Canas', 'Juncos', 'Algas',
    'Ervas marinhas', 'Plantas aquáticas', 'Barro', 'Lama', 'Lodo', 'Argila', 'Terra', 'Areia', 'Pedras', 'Seixos',
    'Neve', 'Cristais de gelo', 'Penas', 'Pelos', 'Lã', 'Teias de aranha', 'Seda', 'Cera', 'Saliva', 'Muco salivar',
    'Fluidos ovidutais e cloacais', 'Ar atmosférico', 'Fezes', 'Matéria vegetal em decomposição', 'Serrapilheira',
    'Detritos', 'Resinas vegetais', 'Celulose', 'Conchas', 'Plástico', 'Papel'
].sort((a, b) => a.localeCompare(b, 'pt-PT', { sensitivity: 'base' }));

const baseModels = [
    '<path d="M14 58L62 18M20 26l36 28M28 16l8 48"/>',
    '<path d="M16 54c14-30 31-38 50-24c-8 25-25 33-50 24Z"/><path d="M22 52l36-19"/>',
    '<path d="M14 56l14-24l12 9l11-20l15 35Z"/><path d="M18 60h44"/>',
    '<path d="M40 14c12 14 18 25 18 34c0 11-8 18-18 18s-18-7-18-18c0-9 6-20 18-34Z"/>',
    '<path d="M18 18c12 8 18 20 18 36M62 18c-12 8-18 20-18 36M22 60h36"/>',
    '<path d="M14 48c9-7 18-7 27 0s18 7 27 0M18 60c8-6 16-6 24 0s16 6 24 0"/>',
    '<path d="M20 18h40v44H20Z"/><path d="M28 26h24M28 36h24M28 46h18"/>',
    '<path d="M16 50c8-16 16-24 24-24s16 8 24 24M20 56h40"/><path d="M28 42h24"/>'
];

const detailModels = [
    '<circle cx="40" cy="40" r="6"/>',
    '<path d="M32 48l8-16l8 16Z"/>',
    '<path d="M31 49l18-18M31 31l18 18"/>',
    '<path d="M32 40h16M40 32v16"/>',
    '<circle cx="33" cy="43" r="4"/><circle cx="46" cy="35" r="5"/><circle cx="49" cy="48" r="3"/>',
    '<path d="M29 45c5-13 12-17 22-11c-4 11-11 15-22 11Z"/>'
];

const accents = ['accent-bioma', 'accent-life', 'accent-water', 'accent-climate', 'accent-width', 'accent-generic'];
const meta = new Map(options.map((label, index) => [label, {
    accent: accents[index % accents.length],
    base: baseModels[index % baseModels.length],
    detail: detailModels[Math.floor(index / baseModels.length)]
}]));

export function getRestingPlaceMaterialOptions() { return [...options]; }
export function getRestingPlaceMaterialMeta(value = '') { return meta.get(value) || null; }
export function getRestingPlaceMaterialSvg(value = '') {
    const entry = meta.get(value);
    if (!entry) return '';
    return `<svg class="metric-model-svg general-model-svg resting-place-material-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">${entry.base}${entry.detail}</svg>`;
}