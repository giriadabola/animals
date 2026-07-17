const BIOME_IMAGE_NAMES = [
    'Bosque de coníferas','Bosque temperado','Bosque tropical seco','Brejo','Calota de gelo',
    'Campos inundáveis','Campos temperados','Campos tropicais','Chaparral','Delta','Deserto frio',
    'Deserto quente','Estepa','Estepe','Floresta decídua temperada','Floresta inundável',
    'Floresta mediterrânica','Floresta montana','Floresta nublada','Floresta temperada de coníferas',
    'Floresta temperada pluvial','Floresta tropical e subtropical húmida','Floresta tropical pluvial',
    'Floresta tropical seca','Florestas tropicais de coníferas','Jardim - Parque','Lago','Manguezal',
    'Mar profundo','Matagal tropical','Matagal xerófilo','Mina - Pedreira','Oceano aberto',
    'Pântano de água doce','Plataforma continental','Recife de coral','Riacho','Rio','Savana tropical',
    'Semi-deserto','Taiga','Tundra alpina','Tundra ártica','Tundra','Turfeira',
    'Várzea - Planície aluvial','Zona abissal','Zona batial','Zona bentónica','Zona nerítica','Zona pelágica'
];

const HABITAT_IMAGE_NAMES = [
    'Água doce',
    'Agrícola','Água salobra','Ambiente doméstico','Ambiente subterrâneo','Área degradada',
    'Área industrial','Áreas rochosas','Baía','Bioma antropogénico','Bosque','Campo (bioma)',
    'Canal ou reservatório artificial','Canal','Caverna','Charco','Costa rochosa','Costa',
    'Deserto polar','Duna','Estuário','Fauna urbana','Fiorde','Floresta de kelp','Floresta',
    'Jardim - Parque','Lagoa costeira','Lagoa','Marinho','Marisma salgada','Matagal mediterrânico',
    'Mina - Pedreira','Nascente','Oásis','Pastagem','Planalto','Plantação florestal',
    'Pradaria marinha','Praia arenosa','Recife rochoso','Reservatório','Rural','Suburbano',
    'Subúrbio','Urbano','Vale','Zona entremarés','Zona húmida','Zona ripária'
];

function normalizeEnvironmentImageKey(value = '') {
    return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

const makeCatalog = (folder, names) => new Map(names.map(name => [
    normalizeEnvironmentImageKey(name),
    { folder, filename: `${name}.png` }
]));

const biomeCatalog = makeCatalog('bioma', BIOME_IMAGE_NAMES);
const habitatCatalog = makeCatalog('habitat', HABITAT_IMAGE_NAMES);
const aliases = new Map([
    ['agua doce', { folder: 'bioma', filename: 'Pântano de água doce.png' }],
    ['pantano', { folder: 'bioma', filename: 'Pântano de água doce.png' }],
    ['pradaria', { folder: 'habitat', filename: 'Pastagem.png' }],
    ['savana', { folder: 'bioma', filename: 'Savana tropical.png' }],
    ['montanha', { folder: 'bioma', filename: 'Floresta montana.png' }],
    ['marinho corais', { folder: 'bioma', filename: 'Recife de coral.png' }],
    ['costeiro', { folder: 'habitat', filename: 'Costa.png' }],
    ['oceanico', { folder: 'habitat', filename: 'Marinho.png' }],
    ['matagal', { folder: 'habitat', filename: 'Matagal mediterrânico.png' }]
]);

export function getEnvironmentImageMeta(value = '', preferredKind = 'habitat', assetRoot = 'assets') {
    const key = normalizeEnvironmentImageKey(value);
    if (!key) return null;
    const preferred = preferredKind === 'bioma' ? biomeCatalog : habitatCatalog;
    const secondary = preferredKind === 'bioma' ? habitatCatalog : biomeCatalog;
    const match = preferred.get(key) || aliases.get(key) || secondary.get(key);
    if (!match) return null;
    return {
        image: `${assetRoot}/${match.folder}/${match.filename}`,
        accent: preferredKind === 'bioma' ? 'accent-bioma' : 'accent-bioma'
    };
}

export function getEnvironmentImageCatalogCounts() {
    return { biomas: biomeCatalog.size, habitats: habitatCatalog.size };
}