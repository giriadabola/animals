import { generalVisualOptions, ecologicalStratumOptions, getGeneralModelSvg, getGeneralVisualMeta, getEcologicalStratumMeta, getEcologicalStratumSvg, getActivityMeta, getActivitySvg, getSocialMeta, getSocialSvg, socialTypes } from './general-visual-catalog.js';
import { feedingStrategies, getFeedingStrategyMeta, getFeedingStrategySvg } from './feeding-strategies.js';
import { feedingTypes, getFeedingVisualMeta, getFeedingModelSvg } from './feeding-visuals.js';
import { locomotionCatalog, getLocomotionSvg } from './locomotion-visuals.js';
import { ecologicalFunctionCatalog, getEcologicalFunctionSvg } from './ecological-functions.js';
import { perceptionTypes, getPerceptionVisualMeta, getPerceptionModelSvg } from './perception-visuals.js';
import { communicationTypeCatalog, getCanonicalCommunicationType } from './communication-catalog.js';
import { getCommunicationModelSvg } from './communication-visuals.js';
import { matingSystems, getMatingMeta, getMatingSystemSvg } from './mating-systems.js';
import { sexualSystems, getSexualSystemSvg } from './sexual-systems.js';
import { ecologyBlockConfigs, getEcologyBlockSvg } from './ecology-visuals.js';
import { biogeographicRegions } from './biogeographic-regions.js';
import { groupCompositionOptions, getGroupCompositionMeta, getGroupCompositionSvg } from './group-composition-visuals.js';
import { kinshipLineageOptions, getKinshipLineageMeta, getKinshipLineageSvg } from './kinship-lineage-visuals.js';

const imageFilters = [
    ...[
        'Bosque de coníferas', 'Bosque temperado', 'Bosque tropical seco', 'Brejo', 'Calota de gelo',
        'Campos inundáveis', 'Campos temperados', 'Campos tropicais', 'Chaparral', 'Delta', 'Deserto frio',
        'Deserto quente', 'Estepa', 'Estepe', 'Floresta decídua temperada', 'Floresta inundável',
        'Floresta mediterrânica', 'Floresta montana', 'Floresta nublada', 'Floresta temperada de coníferas',
        'Floresta temperada pluvial', 'Floresta tropical e subtropical húmida', 'Floresta tropical pluvial',
        'Floresta tropical seca', 'Florestas tropicais de coníferas', 'Lago', 'Manguezal', 'Mar profundo',
        'Matagal tropical', 'Matagal xerófilo', 'Oceano aberto', 'Plataforma continental',
        'Pântano de água doce', 'Recife de coral', 'Riacho', 'Rio', 'Savana tropical', 'Semi-deserto',
        'Taiga', 'Tundra alpina', 'Tundra ártica', 'Tundra', 'Turfeira', 'Várzea - Planície aluvial',
        'Zona abissal', 'Zona batial', 'Zona bentónica', 'Zona nerítica', 'Zona pelágica'
    ].map(value => ['bioma', value, `assets/bioma/${value}.png`, 'accent-bioma']),
    ...[
        'Continental', 'Montanhoso', 'Polar', 'Temperado', 'Tropical', 'Árido'
    ].map(value => ['zona-climatica', value, `assets/zonas-climaticas/${value}.png`, 'accent-climate']),
    ...[
        'Equatorial', 'Monção', 'Savana', 'Desérticos', 'Semiáridos', 'Subtropical Húmido',
        'Oceânico', 'Mediterrânico', 'Continental Húmido', 'Subártico', 'Tundra', 'Glacial'
    ].map(value => ['Zona Climática Secundária', value, `assets/zonas-climaticas-secundario/${value}.png`, 'accent-climate']),
    ...[
        ['Agrícola', 'Agrícola'], ['Ambiente doméstico', 'Ambiente doméstico'], ['Ambiente subterrâneo', 'Ambiente subterrâneo'],
        ['Área degradada', 'Área degradada'], ['Área industrial', 'Área industrial'], ['Áreas rochosas', 'Áreas rochosas'],
        ['Baía', 'Baía'], ['Bioma antropogénico', 'Bioma antropogénico'], ['Bosque', 'Bosque'], ['Campo (bioma)', 'Campo (bioma)'],
        ['Canal ou reservatório artificial', 'Canal ou reservatório artificial'], ['Canal', 'Canal'], ['Caverna', 'Caverna'],
        ['Charco', 'Charco'], ['Costa rochosa', 'Costa rochosa'], ['Costa', 'Costa'], ['Deserto polar', 'Deserto polar'],
        ['Duna', 'Duna'], ['Estuário', 'Estuário'], ['Fauna urbana', 'Fauna urbana'], ['Fiorde', 'Fiorde'],
        ['Floresta de kelp', 'Floresta de kelp'], ['Floresta', 'Floresta'], ['Jardim / Parque', 'Jardim - Parque'],
        ['Lagoa costeira', 'Lagoa costeira'], ['Lagoa', 'Lagoa'], ['Marinho', 'Marinho'], ['Marisma salgada', 'Marisma salgada'],
        ['Matagal mediterrânico', 'Matagal mediterrânico'], ['Mina / Pedreira', 'Mina - Pedreira'], ['Montanha', '11_Montanha'],
        ['Nascente', 'Nascente'], ['Oásis', 'Oásis'], ['Pastagem', 'Pastagem'], ['Planalto', 'Planalto'],
        ['Plantação florestal', 'Plantação florestal'], ['Pântano', '04_Pantano'], ['Pradaria marinha', 'Pradaria marinha'], ['Praia arenosa', 'Praia arenosa'],
        ['Recife rochoso', 'Recife rochoso'], ['Reservatório', 'Reservatório'], ['Rural', 'Rural'], ['Suburbano', 'Suburbano'],
        ['Subúrbio', 'Subúrbio'], ['Urbano', 'Urbano'], ['Vale', 'Vale'], ['Zona entremarés', 'Zona entremarés'],
        ['Zona húmida', 'Zona húmida'], ['Zona ripária', 'Zona ripária']
    ].map(([value, filename]) => ['Habitats', value, `assets/habitat/${filename}.png`, 'accent-bioma'])
];

const activityValues = ['Diurno', 'Noturno', 'Crepuscular', 'Matutino', 'Vespertino', 'Catemeral', 'Arrítmico', 'Ultradiano', 'Sazonal', 'Migratório', 'Hibernante', 'Estivante', 'Brumante', 'Torpidário', 'Subterrâneo/Fossorial', 'Aquático ativo', 'Arborícola ativo', 'Terrestre ativo', 'Aéreo ativo'];

export const visualFilterPool = [
    ...imageFilters.map(([type, value, image, accent]) => ({ type, value, name: value, image, accent })),
    ...generalVisualOptions.map(option => { const meta = getGeneralVisualMeta(option.tipo); return { type: option.tipo, value: '*', name: option.tipo, model: () => getGeneralModelSvg(meta.key), accent: meta.accent }; }),
    ...ecologicalStratumOptions.map(value => { const meta = getEcologicalStratumMeta(value); return { type: 'Estrato ecológico', value, name: value, model: () => getEcologicalStratumSvg(value), accent: meta.accent }; }),
    ...groupCompositionOptions.map(value => { const meta = getGroupCompositionMeta(value); return { type: 'Composição do grupo', value, name: value, model: () => getGroupCompositionSvg(value), accent: meta.accent }; }),
    ...kinshipLineageOptions.map(value => { const meta = getKinshipLineageMeta(value); return { type: 'Parentesco e linhagem social', value, name: value, model: () => getKinshipLineageSvg(value), accent: meta.accent }; }),
    ...activityValues.map(value => { const meta = getActivityMeta(value); return { type: 'atividade', value, name: value, model: () => getActivitySvg(meta.key), accent: meta.accent }; }),
    ...socialTypes.map(item => { const meta = getSocialMeta(item.label); return { type: 'vida social', value: item.label, name: item.label, model: () => getSocialSvg(meta.key), accent: meta.accent }; }),
    ...feedingStrategies.map(value => { const meta = getFeedingStrategyMeta(value); return { type: 'estratégia para obter alimento', value, name: value, model: () => getFeedingStrategySvg(meta.key), accent: meta.accent }; }),
    ...feedingTypes.map(value => { const meta = getFeedingVisualMeta(value); return { type: 'tipo de alimentação', value, name: value, model: () => getFeedingModelSvg(meta.key), accent: meta.accent }; }),
    ...perceptionTypes.map(value => { const meta = getPerceptionVisualMeta(value); return { type: 'tipo de perceção', value, name: value, model: () => getPerceptionModelSvg(meta.key), accent: meta.accent }; }),
    ...communicationTypeCatalog.map(item => ({ type: 'tipo de comunicação', value: getCanonicalCommunicationType(item.label), name: item.label, model: () => getCommunicationModelSvg(item.label), accent: 'accent-mating-polygamy' })),
    ...matingSystems.map(value => { const meta = getMatingMeta(value); return { type: 'acasalamento', value, name: value, model: () => getMatingSystemSvg(meta.key), accent: meta.accent }; }),
    ...sexualSystems.map(value => ({ type: 'sistema sexual', value, name: value, model: () => getSexualSystemSvg(value), accent: 'accent-mating-polyandry' })),
    ...locomotionCatalog.map(item => ({ type: 'locomoção', value: item.label, name: item.label, model: () => getLocomotionSvg(item.key), accent: item.accent })),
    ...ecologicalFunctionCatalog.map(item => ({ type: 'função ecológica', value: item.label, name: item.label, model: () => getEcologicalFunctionSvg(item.key), accent: item.accent })),
    ...ecologyBlockConfigs.map(item => ({ type: item.label, value: '*', name: item.label, model: () => getEcologyBlockSvg(item.key), accent: item.accent })),
    ...biogeographicRegions.map(item => ({ type: 'região biogeográfica', value: item.label, name: item.label, model: () => getGeneralModelSvg('bioma'), accent: 'accent-bioma' }))
];

export function getVisualFilterUrl(item) {
    return `filtros.html?tipo=${encodeURIComponent(item.type)}&valor=${encodeURIComponent(item.value)}`;
}

export function renderVisualFilterIcon(item) {
    return item.image
        ? `<img class="climate-zone-model-image" src="${item.image}" alt="" loading="lazy">`
        : item.model();
}
