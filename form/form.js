import { db, auth } from "../js/firebase-config.js?v=5";
        import { doc, setDoc, collection, getDocs, updateDoc, arrayUnion, writeBatch, query as firestoreQuery, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
        import { feedingTypes, feedingTypeDescriptions, getFeedingVisualMeta, getFeedingModelSvg } from "../js/feeding-visuals.js";
        import { feedingAnimalOptions } from "../js/feeding-animal-options.js?v=2";
        import { getFeedingStrategyMeta, getFeedingStrategySvg } from "../js/feeding-strategies.js";
        import { matingSystems, getMatingMeta, getMatingSystemSvg } from "../js/mating-systems.js";
        import { generalVisualOptions as generalVisualCatalogOptions, generalVisualUnits as generalVisualCatalogUnits, getGeneralVisualMeta as getGeneralVisualCatalogMeta, getGeneralVisualOption as getGeneralVisualCatalogOption, getGeneralVisualSelectConfig, getGeneralVisualSelectOptions, getGeneralModelSvg as getGeneralCatalogModelSvg, getActivityMeta, getActivitySvg, getSocialMeta, getSocialSvg, getEcologicalFunctionMeta, getEcologicalFunctionSvg, getLocomotionMeta, getLocomotionSvg, isDropdownOnlyGeneralModel as isGeneralVisualCatalogDropdownOnly } from "../js/general-visual-catalog.js";
        import { GENDER_BOTH, collapseCombinedGenderItems, expandCombinedGenderItems, getGenderUi, getNextGenderValue, normalizeGenderValue } from "../js/gender-utils.js?v=2";
        import { getEcologyVisualMeta as getSharedEcologyVisualMeta, getEcologyModelSvg as getSharedEcologyModelSvg } from "../js/ecology-visuals.js?v=2";

const FORM_JS_VERSION = '18';

const FORM_MODULE_FILES = [
    './modules/form-state-catalogs.js',
    './modules/form-dimensions.js',
    './modules/form-general.js',
    './modules/form-feeding.js',
    './modules/form-ecology.js',
    './modules/form-reproduction.js',
    './modules/form-plumage-editing.js',
    './modules/form-curiosities-categories.js',
    './modules/form-distribution-submit.js'
];

async function loadFormModules() {
    const baseUrl = new URL('.', import.meta.url);
    const moduleSources = [];

    for (const file of FORM_MODULE_FILES) {
        const url = new URL(`${file}?v=${FORM_JS_VERSION}`, baseUrl);
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`Falha ao carregar ${file}: ${response.status} ${response.statusText}`);
        }

        const source = await response.text();
        moduleSources.push(`\n// ===== ${file} =====\n${source}`);
    }

    // Mantém a execução na mesma ordem e no mesmo escopo dos imports acima.
    // Os blocos foram separados em ficheiros pequenos para facilitar manutenção,
    // sem alterar a lógica original do formulário.
    eval(moduleSources.join('\n'));
}

loadFormModules().catch((error) => {
    console.error('Erro ao inicializar módulos do form:', error);
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        statusMessage.textContent = 'Erro ao carregar o formulário. Verifica a consola.';
        statusMessage.className = 'error';
    }
});
