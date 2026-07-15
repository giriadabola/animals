import { generalVisualOptions, getGeneralModelSvg, getGeneralVisualMeta, getActivityMeta, getActivitySvg, getSocialMeta, getSocialSvg, socialTypes } from './general-visual-catalog.js';
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

const imageFilters = [
    ['bioma', 'Floresta', 'assets/bioma/16_Floresta.png', 'accent-bioma-floresta'],
    ['bioma', 'Marinho', 'assets/bioma/01_Marinho.png', 'accent-bioma-marinho'],
    ['bioma', 'Savana', 'assets/bioma/02_Savana.png', 'accent-bioma-savana'],
    ['zona-climatica', 'Tropical', 'assets/zonas-climaticas/01_Tropical.png', 'accent-climate-tropical'],
    ['zona-climatica', 'Polar', 'assets/zonas-climaticas/04_Polar.png', 'accent-climate-polar'],
    ['zona-climatica', 'Árido', 'assets/zonas-climaticas/07_Desertica.png', 'accent-climate-desertica']
];

const activityValues = ['Diurno', 'Noturno', 'Crepuscular', 'Matutino', 'Vespertino', 'Catemeral', 'Arrítmico', 'Ultradiano', 'Sazonal', 'Migratório', 'Hibernante', 'Estivante', 'Brumante', 'Torpidário', 'Subterrâneo/Fossorial', 'Aquático ativo', 'Arborícola ativo', 'Terrestre ativo', 'Aéreo ativo'];

export const visualFilterPool = [
    ...imageFilters.map(([type, value, image, accent]) => ({ type, value, name: value, image, accent })),
    ...generalVisualOptions.map(option => { const meta = getGeneralVisualMeta(option.tipo); return { type: option.tipo, value: '*', name: option.tipo, model: () => getGeneralModelSvg(meta.key), accent: meta.accent }; }),
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
