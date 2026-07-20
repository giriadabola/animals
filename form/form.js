import { db, auth } from "../js/firebase-config.js?v=5";
        import { doc, setDoc, collection, getDocs, getDoc, addDoc, updateDoc, arrayUnion, writeBatch, query as firestoreQuery, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
        import { feedingTypes, feedingTypeDescriptions, getFeedingVisualMeta, getFeedingModelSvg } from "../js/feeding-visuals.js";
        import { getFeedingStrategyMeta, getFeedingStrategySvg } from "../js/feeding-strategies.js";
        import { matingSystems, getMatingMeta, getMatingSystemSvg } from "../js/mating-systems.js?v=3";
        import { getReproductiveLifeHistoryOptions, getReproductiveTimingOptions, getReproductiveStrategySvg } from "../js/reproductive-strategy-visuals.js?v=1";
        import { generalVisualOptions as generalVisualCatalogOptions, generalVisualUnits as generalVisualCatalogUnits, getGeneralVisualMeta as getGeneralVisualCatalogMeta, getGeneralVisualOption as getGeneralVisualCatalogOption, getGeneralVisualSelectConfig, getGeneralVisualSelectOptions, getGeneralModelSvg as getGeneralCatalogModelSvg, getActivityMeta, getActivitySvg, getSocialMeta, getSocialSvg, getEcologicalFunctionMeta, getEcologicalFunctionSvg, getLocomotionMeta, getLocomotionSvg, isDropdownOnlyGeneralModel as isGeneralVisualCatalogDropdownOnly } from "../js/general-visual-catalog.js";
        import { getRestingPlaceOptions, getRestingPlaceVisualMeta, getRestingPlaceVisualSvg } from "../js/resting-place-visuals.js?v=2";
        import { getRestingPlaceMaterialOptions, getRestingPlaceMaterialMeta, getRestingPlaceMaterialSvg } from "../js/resting-place-materials.js?v=1";
        import { GENDER_BOTH, collapseCombinedGenderItems, expandCombinedGenderItems, getGenderUi, getNextGenderValue, normalizeGenderValue } from "../js/gender-utils.js?v=2";
        import { getEcologyVisualMeta as getSharedEcologyVisualMeta, getEcologyModelSvg as getSharedEcologyModelSvg } from "../js/ecology-visuals.js?v=2";
        import { getEnvironmentImageMeta } from "../js/environment-image-catalog.js?v=1";

const FORM_JS_VERSION = '65_inat_canonical_name';

const FORM_MODULE_FILES = [
    './modules/form-dropdown-polish.js',
    './modules/form-state-catalogs.js',
    './modules/form-record-type.js',
    './modules/form-quality-level.js',
    './modules/form-profile-photos.js',
    './modules/form-profile-link.js',
    './modules/form-dimensions.js',
    './modules/form-general.js',
    './modules/form-feeding.js',
    './modules/form-ecology.js',
    './modules/form-reproduction.js',
    './modules/form-reproduction-parental-investment.js',
    './modules/form-plumage-editing.js',
    './modules/form-curiosities-categories.js',
    './modules/form-advanced-parameters.js',
    './modules/form-statistics-counter.js',
    './modules/form-parameter-search.js',
    './modules/form-text-import-popup.js',
    './modules/form-api-config.js',
    './modules/form-api-iucn-mapping.js',
    './modules/form-api-auto-fill.js',
    './modules/form-taxonomy-source-import.js',
    './modules/form-distribution-submit.js',
    './modules/form-distribution-gbif.js',
    './modules/form-rodape-tab.js',
    './modules/form-feed-tab.js',
    './modules/form-languages.js'
];

async function loadFormModules() {
    const baseUrl = new URL('.', import.meta.url);
    const moduleSources = [];
    const missingModules = [];

    for (const file of FORM_MODULE_FILES) {
        const url = new URL(`${file}?v=${FORM_JS_VERSION}`, baseUrl);

        try {
            const response = await fetch(url, { cache: 'no-store' });

            if (!response.ok) {
                missingModules.push(`${file} (${response.status})`);
                console.warn(`Form: módulo não encontrado, a continuar sem bloquear: ${file}`);
                continue;
            }

            const source = await response.text();
            moduleSources.push(`\n// ===== ${file} =====\n${source}`);
        } catch (error) {
            missingModules.push(`${file} (${error.message})`);
            console.warn(`Form: falha ao carregar módulo, a continuar sem bloquear: ${file}`, error);
        }
    }

    if (!moduleSources.length) {
        throw new Error('Nenhum módulo do formulário foi carregado.');
    }

    // Mantém a execução na mesma ordem e no mesmo escopo dos imports acima.
    eval(moduleSources.join('\n'));

    if (missingModules.length) {
        console.warn('Form: alguns módulos opcionais/core não foram carregados:', missingModules);
    }

    document.dispatchEvent(new CustomEvent('form:modules-loaded', { detail: { missingModules } }));
}

loadFormModules().catch((error) => {
    console.error('Erro ao inicializar módulos do form:', error);
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        statusMessage.textContent = 'Erro ao carregar o formulário. Verifica a consola.';
        statusMessage.className = 'error';
    }
    document.dispatchEvent(new CustomEvent('form:modules-error', { detail: { error } }));
});
