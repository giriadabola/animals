import { db } from "../js/firebase-config.js?v=5";
import { applyAnimalLanguage, initAnimalLanguage, renderAnimalLanguageSelect, getSavedAnimalLanguage } from "../js/i18n/index.js?v=20260718_footer_labels_1";
import { getWikidataLocalizedNames } from "../js/wikidata-search.js?v=20260717_localized_names_1";
        import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
        import { feedingTypeDescriptions, getFeedingVisualMeta, getFeedingModelSvg } from "../js/feeding-visuals.js";
        import { feedingAnimalOptions } from "../js/feeding-animal-options.js?v=2";
        import { feedingStrategyDescriptions, getFeedingStrategyMeta, getFeedingStrategySvg } from "../js/feeding-strategies.js";
        import { matingSystems, getMatingMeta, getMatingSystemSvg } from "../js/mating-systems.js?v=3";
        import { sexualSystems } from "../js/sexual-systems.js?v=1";
        import { ecologyBlockConfigs, getEcologyBlockSvg } from "../js/ecology-visuals.js?v=20260714_ecology_models";
        import { getGeneralVisualMeta as getGeneralVisualCatalogMeta, getGeneralModelSvg as getGeneralCatalogModelSvg, getActivityMeta, getActivitySvg, getSocialMeta, getSocialSvg, getEcologicalFunctionMeta, getEcologicalFunctionSvg, getLocomotionMeta, getLocomotionSvg, isDropdownOnlyGeneralModel as isDropdownOnlyGeneralCatalogModel, normalizeGeneralVisualKey } from "../js/general-visual-catalog.js?v=20260714_ecology_models";
        import { getRestingPlaceMaterialSvg } from "../js/resting-place-materials.js?v=1";
        import { collapseCombinedGenderItems, collectConcreteGenders, genderMatchesSelection, normalizeGenderValue } from "../js/gender-utils.js?v=3";
        import { renderAnimalMediaBlock, initAnimalMediaBlock, initFooterAnatomyTabs } from "../js/animal-media-block.js?v=3";
        import { renderAnimalAudioThumbnail, initAnimalAudioControls, pauseAllAnimalAudio, getAnimalAudioId } from "../js/animal-audio.js?v=20260710_audio_4";
        import { initAnimalProfileActions } from "../js/profile-favorites.js?v=4";
import { POPULATION_RANKING_KEY } from "../js/ranking-metrics.js?v=1";
import { getConservationStatusMeta, initConservationStatusPopup } from "../js/conservation-status-popup.js?v=1";
import { fetchDynamicDistribution } from "../js/dynamic-distribution.js?v=20260719_dynamic_fallback_1";
import { initFeedingTypePopup } from "../js/feeding-type-popup.js?v=20260716_relations_table";
import { initPerceptionTypePopup } from "../js/perception-type-popup.js?v=1";
import { initSocialTypePopup } from "../js/social-type-popup.js?v=1";
import { initSkeletonTypePopup } from "../js/skeleton-type-popup.js?v=1";
import { initThermoregulationPopup } from "../js/thermoregulation-popup.js?v=1";
import { initBodySymmetryPopup } from "../js/body-symmetry-popup.js?v=1";
import { initEcologicalStratumPopup } from "../js/ecological-stratum-popup.js?v=1";
import { initGroupCompositionPopup } from "../js/group-composition-popup.js?v=1";
import { initLocomotionPopup } from "../js/locomotion-popup.js?v=1";
import { initKinshipLineagePopup } from "../js/kinship-lineage-popup.js?v=1";
import { initLeadershipHierarchyPopup } from "../js/leadership-hierarchy-popup.js?v=1";
import { initDigestiveSystemPopup } from "../js/digestive-system-popup.js?v=1";
import { initActivityPopup } from "../js/activity-popup.js?v=1";
import { initTerritorySizePopup } from "../js/territory-size-popup.js?v=1";
import { initFeedingStrategyPopup } from "../js/feeding-strategy-popup.js?v=20260714_strategy_popup_layout";
import { initEcologicalFunctionPopup } from "../js/ecological-function-popup.js?v=2";
import { initMatingSystemPopup } from "../js/mating-system-popup.js?v=2";
import { initSexualSystemPopup } from "../js/sexual-system-popup.js?v=1";
import { initBiogeographicRegionPopup } from "../js/biogeographic-regions-popup.js?v=1";
import { getCommunicationGenericModelSvg, getCommunicationModelSvg } from "../js/communication-visuals.js?v=3";
import { initCommunicationTypePopup } from "../js/communication-type-popup.js?v=1";
import { initEcologyRelationsPopup } from "../js/ecology-relations-popup.js?v=1";
import { initEnvironmentVisualPopup } from "../js/environment-visual-popup.js?v=1";
import { getEnvironmentImageMeta } from "../js/environment-image-catalog.js?v=1";
import { initClimateZoneMapPopup } from "../js/climate-zone-map-popup.js?v=1";
import { initScientificClassificationToggles } from "./scientific-classification-toggle.js?v=1";
import { initAnimalComparison } from "../js/animal-comparison.js?v=2";
import { initDistributionCountryPopup } from "../js/distribution-country-popup.js?v=1";
import { renderAnimalGallery } from "../js/animal-gallery.js?v=2";
        
        const mainContent = document.getElementById('main-content-area');

        // Helpers de compatibilidade de categorias (Suporte a String e Map)
        function getFirstActiveCategory(categoria) {
            if (typeof categoria === 'string') return categoria;
            if (categoria && typeof categoria === 'object') {
                const active = Object.keys(categoria).filter(k => categoria[k] === true);
                return active[0] || '';
            }
            return '';
        }

        function hasCategory(categoria, target) {
            if (typeof categoria === 'string') return categoria === target;
            if (categoria && typeof categoria === 'object') return !!categoria[target];
            return false;
        }

        let countryList = {};
        function normalizeCountryCode(value = '') {
            if (value && typeof value === 'object') {
                return String(value.codigo || value.code || value.iso2 || value.iso || value.id || '').trim().toUpperCase();
            }
            return String(value || '').trim().toUpperCase();
        }

        function getCountryRecord(code) {
            const normalizedCode = normalizeCountryCode(code);
            const record = countryList[normalizedCode];
            return record && typeof record === 'object' ? record : { nome: record || normalizedCode };
        }

        function getCountryFlagEmoji(code) {
            const normalizedCode = normalizeCountryCode(code);
            if (!/^[A-Z]{2}$/.test(normalizedCode)) return '🌐';
            return [...normalizedCode].map(character => String.fromCodePoint(127397 + character.charCodeAt(0))).join('');
        }

        async function loadCountryList() {
            try {
                const response = await fetch('../js/countries.json');
                countryList = await response.json();
            } catch (error) {
                console.error("Erro ao carregar lista de países:", error);
            }
        }


        function getInfoSectionIconSvg(type = 'geral') {
            const icons = {
                geral: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="24"/><circle cx="23" cy="21" r="4.2"/><circle cx="32" cy="16.5" r="4.2"/><circle cx="41" cy="21" r="4.2"/><circle cx="47" cy="29" r="4"/><path d="M21 41c0-6 5-11 11-11c4 0 6 2 8 4c2-2 4-4 8-4c5 0 9 4 9 9c0 7-6 12-14 12H31c-6 0-10-4-10-10Z"/></svg>`,
                medidas: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M13 46L46 13l8 8L21 54H13V46Z"/><path d="M28 31l5 5M34 25l5 5M40 19l5 5M22 37l5 5"/></svg>`,
                dimensoes: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="19" y="19" width="26" height="26" rx="2"/><path d="M12 19v26M8 23l4-4l4 4M8 41l4 4l4-4M19 12h26M23 8l-4 4l4 4M41 8l4 4l-4 4"/></svg>`,
                alimentacao: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M21 8v20"/><path d="M13 8v17c0 6 4 10 8 10s8-4 8-10V8"/><path d="M21 35v21"/><path d="M44 8c6 7 8 15 8 24c0 8-3 14-8 17v7"/><path d="M44 8v48"/></svg>`,
                reproducao: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M32 8c12 10 19 20 19 32c0 10-8 17-19 17s-19-7-19-17C13 28 20 18 32 8Z"/><circle cx="32" cy="39" r="9"/><path d="M32 30v-8"/></svg>`,
                plumagem: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M42 6L14 34c-4 4-4 10 0 14s10 4 14 0l28-28c4-4 4-10 0-14s-10-4-14 0Z"/><path d="M28 20l12 12"/><path d="M18 30l10 10"/><path d="M38 10l12 12"/><path d="M14 50l-8 8"/></svg>`,
                ecologia: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="23" r="5" fill="currentColor"/><circle cx="32" cy="18" r="5" fill="currentColor"/><circle cx="42" cy="23" r="5" fill="currentColor"/><path d="M32 53c-9 0-16-5-16-12c0-5 3-9 8-9c3 0 5 1 8 4c3-3 5-4 8-4c5 0 8 4 8 9c0 7-7 12-16 12Z" fill="currentColor"/></svg>`,
                distribuicao: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="4"/><path d="M10 32h44M32 8v48M14 20h36M14 44h36M22 8c4 8 4 40 0 48M42 8c-4 8-4 40 0 48" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
                curiosidades: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M32 10C21 10 16 18 16 26c0 7 4 12 7 15c2 2 3 5 3 8h12c0-3 1-6 3-8c3-3 7-8 7-15c0-8-5-16-16-16Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M26 55h12M28 60h8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`
            };
            return icons[type] || icons.geral;
        }

        function getYouTubeVideoId(url) {
            if(!url) return null;
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        }
        
        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
        }

        function normalizeDimensionKey(label = '') {
            return String(label).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        function buildFilterPageLink(filterType, filterValue) {
            const params = new URLSearchParams({
                tipo: filterType,
                valor: filterValue
            });
            return `filtros.html?${params.toString()}`;
        }

        function renderClassificationFilterValue(filterType, value, { italic = false } = {}) {
            const linkStyle = [
                'color: var(--text-primary)',
                'font-weight: 500',
                italic ? 'font-style: italic' : '',
                'text-decoration: none',
                'border-bottom: none',
                'display: inline-block'
            ].filter(Boolean).join('; ');
            return `<a href="${buildFilterPageLink(filterType, value)}" style="${linkStyle}">${escapeHtml(value)}</a>`;
        }

        function hasGenderData(items = []) {
            return items.some(item => !!normalizeGenderValue(item?.genero, ''));
        }

        function hasSpecificGenderItems(items = []) {
            return items.some(item => {
                const normalizedGender = normalizeGenderValue(item?.genero, '');
                return normalizedGender === 'M' || normalizedGender === 'F';
            });
        }

        function getGenderTabsHTML(allItems) {
            const genders = collectConcreteGenders(allItems);
            const phases = new Set(allItems.map(item => item.fase).filter(Boolean));
            const hasGenders = hasGenderData(allItems);
            const showSplitGenderToggle = hasSpecificGenderItems(allItems);
            const hasPhases = phases.has('Cria');
            
            if (!hasGenders && !hasPhases) return '';
            
            const defaultGender = genders.has('M') ? 'M' : 'F';
            let html = `<span class="info-gender-tabs" style="display: inline-flex; gap: 10px; align-items: center; vertical-align: middle;">`;
            
            // Abas de Fase (à esquerda)
            if (hasPhases) {
                html += `
                    <span class="glass-pill-toggle phase-toggle-container" style="display: inline-flex; background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 30px; padding: 3px; gap: 2px; align-items: center; box-shadow: inset 0 1px 1px rgba(255,255,255,0.05);">
                        <button class="phase-tab-btn active" data-phase="Adulto" style="color: #10b981; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 20px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; outline: none; padding: 0;"><i class="fa-solid fa-paw" style="font-size: 0.95rem;"></i></button>
                        <button class="phase-tab-btn" data-phase="Cria" style="color: rgba(255,255,255,0.4); background: transparent; border: 1px solid transparent; border-radius: 20px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; outline: none; padding: 0;"><i class="fa-solid fa-baby" style="font-size: 0.95rem;"></i></button>
                    </span>
                `;
                if (hasGenders) {
                    html += `<span style="width: 1px; height: 28px; background: rgba(255,255,255,0.12);"></span>`;
                }
            }
            
            // Abas de Género (? direita)
            if (hasGenders) {
                html += `
                    <span class="glass-pill-toggle gender-toggle-container" style="display: inline-flex; background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 30px; padding: 3px; gap: 2px; align-items: center; box-shadow: inset 0 1px 1px rgba(255,255,255,0.05);">
                        ${showSplitGenderToggle
                            ? `<button class="gender-tab-btn active" data-gender="" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; outline: none; padding: 0; line-height: 1;"><span style="display: inline-flex; align-items: center; gap: 1px; line-height: 1;"><span style="color: #3b82f6; font-weight: 700; font-size: 0.8rem;">&#9794;</span><span style="color: #ec4899; font-weight: 700; font-size: 0.8rem;">&#9792;</span></span></button>${genders.has('M') ? `<button class="gender-tab-btn" data-gender="M" style="color: rgba(255,255,255,0.4); background: transparent; border: 1px solid transparent; border-radius: 20px; width: 36px; height: 36px; font-weight: bold; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; outline: none; padding: 0; line-height: 1;">♂</button>` : ''}${genders.has('F') ? `<button class="gender-tab-btn" data-gender="F" style="color: rgba(255,255,255,0.4); background: transparent; border: 1px solid transparent; border-radius: 20px; width: 36px; height: 36px; font-weight: bold; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; outline: none; padding: 0; line-height: 1;">♀</button>` : ''}`
                            : `<span style="display: inline-flex; align-items: center; justify-content: center; gap: 2px; border-radius: 20px; width: 36px; height: 36px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.14), rgba(236, 72, 153, 0.14)); border: 1px solid rgba(255,255,255,0.1);"><span style="color: #3b82f6; font-weight: 700; font-size: 0.95rem; line-height: 1;">&#9794;</span><span style="color: #ec4899; font-weight: 700; font-size: 0.95rem; line-height: 1;">&#9792;</span></span>`}
                    </span>
                `;
            }
            
            html += `</span>`;
            return html;
        }

        function getCategoryModelSvg(category = '') {
            const normalized = normalizeDimensionKey(category);
            const bird = `<svg class="animal-model-svg bird-model-svg real-bird-model" viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path class="bird-shadow" d="M52 102C80 110 133 110 171 99"/>
                <ellipse class="bird-head-fill" cx="69" cy="54" rx="18" ry="15"/>
                <path class="bird-beak-fill" d="M47 53L22 60L47 67L58 60L47 53Z"/>
                <path class="bird-body-fill" d="M79 44C96 30 119 26 142 31C163 35 181 49 189 69C191 75 189 81 184 85L171 95H147L129 106H93L99 93H86C74 93 65 86 62 76C60 67 65 55 79 44Z"/>
                <path class="bird-tail-fill" d="M187 67H214L192 84H172C180 80 185 74 187 67Z"/>
                <path class="bird-wing-fill" d="M96 45C117 45 135 58 145 80C134 83 119 82 106 76C96 71 89 63 86 53C89 49 92 47 96 45Z"/>
                <path class="bird-leg-line" d="M101 92L92 113"/>
                <path class="bird-leg-line" d="M116 92L109 113"/>
                <path class="bird-body-line" d="M58 60C59 48 67 40 78 39C96 30 119 26 142 31C163 35 181 49 189 69H214L192 84H171L154 95H130L116 106H90L96 93H86C74 93 65 86 62 76L47 67L22 60L47 53L58 60Z"/>
                <path class="bird-wing-line" d="M90 53C101 57 112 66 120 80"/>
                <path class="bird-wing-line soft" d="M108 48C122 55 134 67 141 81"/>
                <path class="bird-wing-line soft" d="M125 47C138 53 149 64 156 76"/>
                <path class="bird-body-line" d="M58 60C60 51 66 43 74 40"/>
                <circle class="bird-eye" cx="63" cy="51" r="4"/>
            </svg>`;
            const models = {
                                mamiferos: `<svg class="animal-model-svg mammal-model-svg real-mammal-model" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path class="mammal-shadow" d="M54 101C88 109 147 109 187 100"/>
                    <path class="mammal-body-fill" d="M42 73L26 69L43 63H56L67 50L80 38L92 48C107 42 126 41 144 45C162 49 176 59 184 72L198 80L184 86L173 84C165 94 152 100 137 102H120L113 108H102L106 102H86L81 108H70L74 101H58L51 108H40L48 97C40 93 35 84 37 76L42 73Z"/>
                    <path class="mammal-body-line" d="M42 73L26 69L43 63H56L67 50L80 38L92 48C107 42 126 41 144 45C162 49 176 59 184 72L198 80L184 86L173 84C165 94 152 100 137 102H120L113 108H102L106 102H86L81 108H70L74 101H58L51 108H40L48 97C40 93 35 84 37 76L42 73Z"/>
                    <path class="mammal-snout-line" d="M42 73L21 67L42 62"/>
                    <path class="mammal-ear-line" d="M67 50L79 37L91 47"/>
                    <path class="mammal-back-line" d="M93 48C113 45 135 47 153 56"/>
                    <path class="mammal-tail-line" d="M183 72L204 66"/>
                    <path class="mammal-leg-line" d="M69 100L62 115"/>
                    <path class="mammal-leg-line" d="M88 100L84 115"/>
                    <path class="mammal-leg-line" d="M118 101L116 115"/>
                    <path class="mammal-leg-line" d="M144 100L144 115"/>
                    <circle class="mammal-eye" cx="61" cy="60" r="3.5"/>
                </svg>`,
                aves: bird,
                ave: bird,
                peixes: `<svg class="animal-model-svg fish-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M22 55C39 34 62 24 91 24C121 24 145 35 163 55C145 75 121 86 91 86C62 86 39 76 22 55Z"/><path class="animal-line" d="M22 55C39 34 62 24 91 24C121 24 145 35 163 55C145 75 121 86 91 86C62 86 39 76 22 55Z"/><path class="animal-line" d="M163 55L177 35V75L163 55Z"/><path class="animal-line" d="M87 29L73 10"/><path class="animal-line" d="M87 81L73 100"/><circle class="animal-dot" cx="62" cy="50" r="3.5"/></svg>`,
                                repteis: `<svg class="animal-model-svg reptile-model-svg real-reptile-model" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path class="reptile-shadow" d="M44 101C78 109 143 109 193 99"/>
                    <path class="reptile-body-fill" d="M39 73L24 66L41 59H57C65 47 77 39 91 37C104 28 121 25 139 27C161 30 180 41 190 57L211 54L201 66L189 68C183 79 173 87 160 91H143L133 101H121L126 90H103L98 102H86L91 90H70L60 102H47L55 88C47 86 41 81 39 73Z"/>
                    <path class="reptile-body-line" d="M39 73L24 66L41 59H57C65 47 77 39 91 37C104 28 121 25 139 27C161 30 180 41 190 57L211 54L201 66L189 68C183 79 173 87 160 91H143L133 101H121L126 90H103L98 102H86L91 90H70L60 102H47L55 88C47 86 41 81 39 73Z"/>
                    <path class="reptile-head-line" d="M39 73L18 66L39 59"/>
                    <path class="reptile-back-line" d="M100 36C122 33 144 36 162 47"/>
                    <path class="reptile-tail-line" d="M188 58L214 46"/>
                    <path class="reptile-leg-line" d="M71 89L61 108"/>
                    <path class="reptile-leg-line" d="M95 90L89 108"/>
                    <path class="reptile-leg-line" d="M130 90L126 108"/>
                    <path class="reptile-leg-line" d="M155 88L155 106"/>
                    <circle class="reptile-eye" cx="56" cy="62" r="3.5"/>
                </svg>`,
                anfibios: `<svg class="animal-model-svg amphibian-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M38 64C38 38 59 21 90 21C121 21 142 38 142 64C142 86 125 101 99 101H81C55 101 38 86 38 64Z"/><path class="animal-line" d="M38 64C38 38 59 21 90 21C121 21 142 38 142 64C142 86 125 101 99 101H81C55 101 38 86 38 64Z"/><path class="animal-line" d="M64 86L45 104"/><path class="animal-line" d="M78 91L65 108"/><path class="animal-line" d="M102 91L115 108"/><path class="animal-line" d="M116 86L135 104"/><circle class="animal-line" cx="73" cy="42" r="7"/><circle class="animal-line" cx="107" cy="42" r="7"/></svg>`,
                insetos: `<svg class="animal-model-svg insect-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse class="animal-soft-fill" cx="90" cy="58" rx="22" ry="31"/><ellipse class="animal-line" cx="90" cy="58" rx="22" ry="31"/><path class="animal-line" d="M90 20V31"/><path class="animal-line" d="M58 39L74 49"/><path class="animal-line" d="M122 39L106 49"/><path class="animal-line" d="M59 79L75 68"/><path class="animal-line" d="M121 79L105 68"/><path class="animal-line" d="M75 35C61 21 43 21 31 30C35 50 52 58 75 56"/><path class="animal-line" d="M105 35C119 21 137 21 149 30C145 50 128 58 105 56"/></svg>`,
                crustaceos: `<svg class="animal-model-svg crab-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M55 55C55 36 70 25 90 25C110 25 125 36 125 55C125 77 112 91 90 91C68 91 55 77 55 55Z"/><path class="animal-line" d="M55 55C55 36 70 25 90 25C110 25 125 36 125 55C125 77 112 91 90 91C68 91 55 77 55 55Z"/><path class="animal-line" d="M57 51L26 34L18 19L38 26"/><path class="animal-line" d="M123 51L154 34L162 19L142 26"/><path class="animal-line" d="M66 78L45 98"/><path class="animal-line" d="M82 84L74 104"/><path class="animal-line" d="M98 84L106 104"/><path class="animal-line" d="M114 78L135 98"/><circle class="animal-dot" cx="78" cy="46" r="3"/><circle class="animal-dot" cx="102" cy="46" r="3"/></svg>`,
                aracnideos: `<svg class="animal-model-svg spider-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse class="animal-soft-fill" cx="90" cy="59" rx="25" ry="22"/><ellipse class="animal-line" cx="90" cy="59" rx="25" ry="22"/><circle class="animal-line" cx="90" cy="34" r="13"/><path class="animal-line" d="M66 52L36 34L17 37"/><path class="animal-line" d="M64 61L32 61L14 70"/><path class="animal-line" d="M68 70L40 91L19 94"/><path class="animal-line" d="M114 52L144 34L163 37"/><path class="animal-line" d="M116 61L148 61L166 70"/><path class="animal-line" d="M112 70L140 91L161 94"/></svg>`,
                moluscos: `<svg class="animal-model-svg mollusc-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M38 76C42 45 65 25 94 25C120 25 139 41 142 67C130 87 108 98 76 98C58 98 45 91 38 76Z"/><path class="animal-line" d="M38 76C42 45 65 25 94 25C120 25 139 41 142 67C130 87 108 98 76 98C58 98 45 91 38 76Z"/><path class="animal-line" d="M62 82C74 63 89 47 111 35"/><path class="animal-line" d="M86 96C99 76 116 60 139 50"/><path class="animal-line" d="M39 79L15 92"/><path class="animal-line" d="M47 87L20 104"/></svg>`,
                vermes: `<svg class="animal-model-svg worm-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-line" d="M20 68C42 38 61 89 86 58C111 27 130 78 160 44"/><path class="animal-line" d="M36 53L45 61"/><path class="animal-line" d="M68 73L78 63"/><path class="animal-line" d="M103 44L113 54"/><path class="animal-line" d="M136 59L145 49"/></svg>`,
                microscopicos: `<svg class="animal-model-svg micro-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse class="animal-soft-fill" cx="90" cy="58" rx="38" ry="27"/><ellipse class="animal-line" cx="90" cy="58" rx="38" ry="27"/><path class="animal-line" d="M62 39L50 24"/><path class="animal-line" d="M75 33L72 14"/><path class="animal-line" d="M103 33L108 14"/><path class="animal-line" d="M120 42L136 26"/><path class="animal-line" d="M55 70L38 80"/><path class="animal-line" d="M124 72L143 83"/><circle class="animal-dot" cx="78" cy="55" r="3"/><circle class="animal-dot" cx="100" cy="50" r="3"/><circle class="animal-dot" cx="95" cy="67" r="3"/></svg>`,
                extintos: `<svg class="animal-model-svg dino-model-svg" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="animal-soft-fill" d="M24 74C34 42 60 27 98 31C122 34 139 46 151 65L170 68L157 82H142C137 96 119 104 92 104H73L67 109H53L58 98H39L33 109H19L29 91C23 86 21 80 24 74Z"/><path class="animal-line" d="M24 74C34 42 60 27 98 31C122 34 139 46 151 65L170 68L157 82H142C137 96 119 104 92 104H73L67 109H53L58 98H39L33 109H19L29 91C23 86 21 80 24 74Z"/><path class="animal-line" d="M96 33L111 12"/><path class="animal-line" d="M111 12L125 25"/><circle class="animal-dot" cx="58" cy="44" r="3.5"/></svg>`
            };
            return models[normalized] || bird;
        }

        function getDimensionVisualMeta(metric = '') {
            const normalized = normalizeDimensionKey(metric);
            if (normalized.includes('bico') && normalized.includes('peso')) return { key: 'peso-bico', title: metric || 'Peso do bico', accent: 'accent-beak' };
            if (normalized.includes('cauda') && normalized.includes('peso')) return { key: 'peso-cauda', title: metric || 'Peso da cauda', accent: 'accent-tail' };
            if (normalized.includes('altura')) return { key: 'altura', title: metric || 'Altura', accent: 'accent-height' };
            if (normalized.includes('peso')) return { key: 'peso', title: metric || 'Peso', accent: 'accent-weight' };
            if (normalized.includes('envergadura')) return { key: 'envergadura', title: metric || 'Envergadura', accent: 'accent-wing' };
            if (normalized.includes('asa')) return { key: 'asa', title: metric || 'Comprimento da asa', accent: 'accent-wing' };
            if (normalized.includes('bico')) return { key: 'bico', title: metric || 'Comprimento do bico', accent: 'accent-beak' };
            if (normalized.includes('furcal')) return { key: 'furcal', title: metric || 'Comprimento furcal', accent: 'accent-tail' };
            if (normalized.includes('cauda')) return { key: 'cauda', title: metric || 'Comprimento da cauda', accent: 'accent-tail' };
            if (normalized.includes('pata')) return { key: 'patas', title: metric || 'Comprimento das patas', accent: 'accent-leg' };
            if (normalized.includes('ovo')) return { key: 'ovo', title: metric || 'Tamanho do ovo', accent: 'accent-egg' };
            if (normalized.includes('largura')) return { key: 'largura', title: metric || 'Largura', accent: 'accent-width' };
            if (normalized.includes('diametro')) return { key: 'diametro', title: metric || 'Diâmetro do corpo', accent: 'accent-width' };
            if (normalized.includes('comprimento')) return { key: 'comprimento', title: metric || 'Comprimento', accent: 'accent-length' };
            return { key: 'medida', title: metric || 'Medida', accent: 'accent-generic' };
        }

        function getMetricModelSvg(key = 'medida') {
            const icons = {
                altura: `<svg class="metric-model-svg metric-height" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 10v60"/><path d="M18 10l-7 8"/><path d="M18 10l7 8"/><path d="M18 70l-7-8"/><path d="M18 70l7-8"/><path d="M40 19c10 0 18 9 18 24s-8 24-18 24"/><path d="M40 19c-6 5-9 13-9 24s3 19 9 24"/></svg>`,
                peso: `<svg class="metric-model-svg metric-weight" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M25 68h30"/><path d="M40 13l-12 14h24L40 13Z"/><path d="M28 27h24l9 31H19l9-31Z"/><path d="M40 35v8"/></svg>`,
                'peso-bico': `<svg class="metric-model-svg metric-beak-weight" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M15 43h22l24-15v30L37 43H15Z"/><circle cx="23" cy="36" r="3"/><path d="M58 12v12"/><path d="M50 18h16"/><path d="M53 25h10"/></svg>`,
                comprimento: `<svg class="metric-model-svg metric-length" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M11 45h58"/><path d="M11 45l8-8"/><path d="M11 45l8 8"/><path d="M69 45l-8-8"/><path d="M69 45l-8 8"/><path d="M20 31c12-12 28-12 40 0"/></svg>`,
                largura: `<svg class="metric-model-svg metric-width" viewBox="0 0 80 80" fill="none" aria-hidden="true"><ellipse cx="40" cy="41" rx="21" ry="27"/><path d="M18 41h44"/><path d="M18 41l7-7"/><path d="M18 41l7 7"/><path d="M62 41l-7-7"/><path d="M62 41l-7 7"/></svg>`,
                diametro: `<svg class="metric-model-svg metric-diameter" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="25"/><path d="M15 40h50"/><path d="M15 40l7-7"/><path d="M15 40l7 7"/><path d="M65 40l-7-7"/><path d="M65 40l-7 7"/></svg>`,
                bico: `<svg class="metric-model-svg metric-beak" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M13 44c8-15 22-24 37-22c8 1 13 5 16 11h8L61 44H42l-9 9H18l5-9H13Z"/><path d="M57 33h17"/><path d="M57 44h17"/><circle cx="35" cy="31" r="3"/></svg>`,
                furcal: `<svg class="metric-model-svg metric-furcal" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M10 42h44"/><path d="M54 42l17-15"/><path d="M54 42l17 15"/><path d="M12 32v20"/><path d="M54 25v34"/><path d="M12 62h42"/><path d="M12 62l7-7M12 62l7 7M54 62l-7-7M54 62l-7 7"/></svg>`,
                cauda: `<svg class="metric-model-svg metric-tail" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 44h19"/><path d="M35 44L66 22"/><path d="M35 44L70 44"/><path d="M35 44L66 66"/><path d="M15 33v22"/><path d="M54 22v44"/></svg>`,
                'peso-cauda': `<svg class="metric-model-svg metric-tail-weight" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M12 44h17"/><path d="M29 44L58 23"/><path d="M29 44L62 44"/><path d="M29 44L58 65"/><path d="M56 13v12"/><path d="M48 19h16"/><path d="M51 26h10"/></svg>`,
                asa: `<svg class="metric-model-svg metric-wing" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M14 55C27 30 44 16 67 13C63 34 51 52 30 66H14V55Z"/><path d="M31 28C38 36 42 46 43 59"/><path d="M45 21C51 30 53 40 53 50"/></svg>`,
                envergadura: `<svg class="metric-model-svg metric-wingspan" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M7 42h66"/><path d="M7 42l8-8"/><path d="M7 42l8 8"/><path d="M73 42l-8-8"/><path d="M73 42l-8 8"/><path d="M17 55c8-13 15-20 23-23"/><path d="M63 55c-8-13-15-20-23-23"/></svg>`,
                patas: `<svg class="metric-model-svg metric-legs" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M28 13v39"/><path d="M52 13v39"/><path d="M24 52l-10 12"/><path d="M28 52l4 13"/><path d="M32 52l12 10"/><path d="M48 52l-10 12"/><path d="M52 52l4 13"/><path d="M56 52l12 10"/></svg>`,
                ovo: `<svg class="metric-model-svg metric-egg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 10c13 0 23 17 23 33c0 15-9 27-23 27S17 58 17 43C17 27 27 10 40 10Z"/><path d="M20 70h40"/></svg>`,
                medida: `<svg class="metric-model-svg metric-generic" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M16 59L58 17l6 6l-42 42l-8-6Z"/><path d="M26 49l6 6"/><path d="M36 39l6 6"/><path d="M46 29l6 6"/></svg>`
            };
            return icons[key] || icons.medida;
        }

        function getDimensionByLabel(dimensions, labels) {
            const labelList = labels.map(label => label.toLowerCase());
            return dimensions.find(item => labelList.includes(String(item.tipo || '').toLowerCase())) ||
                   dimensions.find(item => labelList.some(label => String(item.tipo || '').toLowerCase().includes(label)));
        }

        function getDimensionSortOrder(item) {
            const key = getDimensionVisualMeta(item?.tipo).key;
            const order = {
                altura: 0,
                peso: 1,
                comprimento: 2,
                largura: 3,
                diametro: 4,
                envergadura: 5,
                asa: 6,
                bico: 7,
                'peso-bico': 8,
                cauda: 9,
                'peso-cauda': 10,
                patas: 11,
                ovo: 12,
                medida: 99
            };
            return order[key] ?? 50;
        }

        function formatDimension(item, fallback) {
            if (!item) return fallback;
            const min = item.valorMin ?? item.valor ?? '';
            const max = item.valorMax ?? '';
            const unit = item.unidade || '';
            const value = min && max ? `${min}-${max}` : `${min || max}`;
            return `${escapeHtml(value)}${unit ? ` ${escapeHtml(unit)}` : ''}`;
        }

        function renderDimensionModelCard(item) {
            const meta = getDimensionVisualMeta(item.tipo);
            const inlineGenderSymbol = renderInlineGenderSymbol(item);
            return `
                <article class="dimension-model-card ${meta.accent}" data-gender="${item.genero || ''}" data-phase="${item.fase || 'Adulto'}" data-info-group="dimensoes">
                    <div class="dimension-model-icon">${getMetricModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label${inlineGenderSymbol ? ' with-gender' : ''}">${formatDimension(item, '—')}${inlineGenderSymbol}</div>
                        <div class="dimension-model-value">${escapeHtml(meta.title)}</div>
                    </div>
                </article>`;
        }

        function getInitialVisualItemVisibility(item, filterContext = {}) {
            const genders = filterContext.genders || new Set();
            const phases = filterContext.phases || new Set();
            const hasBothGenders = genders.has('M') && genders.has('F');
            const hasCriaPhase = phases.has('Cria');
            const defaultGender = '';
            const itemGender = item.genero || '';
            const itemPhase = item.fase || 'Adulto';

            return (!hasBothGenders || genderMatchesSelection(itemGender, defaultGender)) &&
                (!hasCriaPhase || itemPhase === 'Adulto');
        }

        function renderDimensionModelGroup(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getDimensionVisualMeta(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const rows = items.map(item => `
                <div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="dimensoes"${getInitialVisualItemVisibility(item, filterContext) ? '' : ' style="display: none;"'}>
                    ${renderInlineGenderSymbol(item)}${formatDimension(item, '—')}
                </div>`).join('');

            return `
                <article class="dimension-model-card visual-model-group-card ${meta.accent}" data-info-group="dimensoes"${visible ? '' : ' style="display: none;"'}>
                    <div class="dimension-model-icon">${getMetricModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="general-model-values dimension-model-label">${rows}</div>
                        <div class="dimension-model-value">${escapeHtml(meta.title)}</div>
                    </div>
                </article>`;
        }

        function getInfoGroupForGeneralType(type = '') {
            const normalized = String(type || '').trim();
            
            const estiloVidaModels = new Set([
                'Atividade', 'Comportamento sazonal', 'Locomoção', 'Vida social', 'Vida Social',
                'Composição do grupo social', 'Composição do grupo', 'Organização social',
                'Liderança e hierarquia', 'Parentesco e linhagem social', 'Tipo de Comunicação',
                'Construção de local de repouso', 'Autoinfeção'
            ]);
            
            const anatomiaModels = new Set([
                'Força da mordida', 'Número de dentes', 'Número de mamas', 'Simetria corporal', 
                'Número de segmentos', 'Número de patas', 'Número de poros', 'Número de brânquias', 
                'Número de barbatanas', 'Número de vértebras', 'Número de escamas', 'Número de miómeros', 
                'Tipo de esqueleto', 'Presença/ausência de sistema digestivo', 
                'Lado corporal da estrutura', 'Forma da estrutura'
            ]);
            
            const fisiologiaModels = new Set([
                'Termorregulação', 'Tipo de perceção'
            ]);
            
            const desenvolvimentoModels = new Set([
                'Transformações do desenvolvimento', 'Capacidade de regeneração'
            ]);
            
            const estruturasAnatomicasModels = new Set([
                'Estruturas gerais do corpo', 'Estruturas da cabeça e face', 
                'Estruturas bucais e alimentares', 'Dentes e estruturas semelhantes', 
                'Cornos, hastes e protuberâncias', 'Cristas, pregas, bolsas e expansões', 
                'Apêndices locomotores', 'Estruturas de fixação e aderência', 
                'Estruturas das patas e extremidades', 'Estruturas da cauda', 
                'Estruturas respiratórias', 'Estruturas aquáticas especiais', 
                'Estruturas sensoriais', 'Estruturas oculares', 
                'Estruturas auditivas e de equilíbrio', 'Estruturas de defesa e ataque', 
                'Estruturas produtoras ou inoculadoras de veneno', 'Estruturas glandulares', 
                'Estruturas produtoras de seda, muco ou secreções', 
                'Estruturas elétricas, luminosas e térmicas', 'Estruturas de reprodução', 
                'Estruturas de incubação e cuidado parental', 'Estruturas das aves', 
                'Estruturas dos mamíferos', 'Estruturas dos répteis e anfíbios', 
                'Estruturas dos artrópodes', 'Estruturas dos moluscos', 
                'Estruturas dos anelídeos', 'Estruturas dos equinodermes', 
                'Estruturas dos cnidários', 'Estruturas dos poríferos'
            ]);
            
            if (estiloVidaModels.has(normalized)) return 'estilo-vida';
            if (anatomiaModels.has(normalized)) return 'anatomia';
            if (fisiologiaModels.has(normalized)) return 'fisiologia';
            if (desenvolvimentoModels.has(normalized)) return 'desenvolvimento';
            if (estruturasAnatomicasModels.has(normalized)) return 'estruturas-anatomicas';
            
            return 'estilo-vida';
        }

        const GENERAL_FORM_MEASURE_TYPES = new Set([
            'Expetativa média de vida', 'Expetativa média de vida (cativeiro)',
            'Profundidade máxima', 'Profundidade média', 'Tamanho da População',
            'Taxa Metabólica Basal média', 'Velocidade máxima', 'Velocidade média',
            'Vida útil', 'Vida útil (cativeiro)', 'Tamanho do grupo social',
            'Tamanho do território', 'Taxa de sucesso da caça', 'Taxa de mortalidade',
            'Taxa de mortalidade (cativeiro)', 'Altitude mínima', 'Altitude máxima',
            'Duração do mergulho', 'Percentagem de gordura corporal',
            'Espessura da camada de gordura', 'Número de fases do ciclo de vida',
            'Tempo à superfície', 'Tempo de recuperação entre mergulhos',
            'Frequência de mergulho', 'Alcance de deteção', 'Taxa de emissão de sinais'
        ].map(value => normalizeDimensionKey(value)));

        function getGeneralFormTabForType(type = '') {
            return GENERAL_FORM_MEASURE_TYPES.has(normalizeDimensionKey(type)) ? 'medidas' : 'geral';
        }

        function getInfoGroupFilterIconSvg(group = 'estilo-vida') {
            const icons = {
                'estilo-vida': `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 14c1.2-2.6 3.5-4 6.8-4h1.4c3.3 0 5.6 1.4 6.8 4"/><circle cx="8" cy="8" r="1.5"/><circle cx="12" cy="6.5" r="1.5"/><circle cx="16" cy="8" r="1.5"/><path d="M9 17.5c.9 1 1.9 1.5 3 1.5s2.1-.5 3-1.5"/></svg>`,
                medidas: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16h16"/><path d="M7 16V8"/><path d="M12 16V5"/><path d="M17 16v-6"/><path d="M4 20h16"/></svg>`,
                dimensoes: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17L17 5l3 3L8 20H5v-3Z"/><path d="M14 8l2 2M11 11l2 2M8 14l2 2"/></svg>`,
                anatomia: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M6 18l12-12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="8" cy="20" r="2.5"/><circle cx="20" cy="8" r="2.5"/></svg>`,
                fisiologia: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
                desenvolvimento: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 8a4 4 0 0 0-4 4v9h2v-9a2 2 0 0 1 2-2h2V8h-2zM7 12a4 4 0 0 0-4 4v5h2v-5a2 2 0 0 1 2-2h2v-2H7zM11 2v20h2V2h-2z"/></svg>`,
                'estruturas-anatomicas': `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="4.5" cy="6.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><circle cx="4.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="6.5" r="1.5"/><path d="M4.5 6.5l12 11M4.5 17.5l12-11" stroke="currentColor" stroke-width="2"/></svg>`
            };
            return icons[group] || icons['estilo-vida'];
        }

        function getInfoGroupFiltersHTML(allItems = []) {
            const activeGroups = new Set(allItems.map(item => item.isDimension ? 'dimensoes' : getInfoGroupForGeneralType(item.tipo)));
            const groups = [
                { key: 'estilo-vida', label: 'Estilo de Vida' },
                { key: 'medidas', label: 'Medidas' },
                { key: 'dimensoes', label: 'Dimensões' },
                { key: 'anatomia', label: 'Anatomia' },
                { key: 'fisiologia', label: 'Fisiologia' },
                { key: 'desenvolvimento', label: 'Desenvolvimento' },
                { key: 'estruturas-anatomicas', label: 'Estruturas anatómicas' }
            ].filter(group => activeGroups.has(group.key));

            if (groups.length <= 1 && !activeGroups.has('dimensoes')) return '';

            return `
                <div class="info-group-filters" aria-label="Filtrar informações gerais">
                    ${groups.map(group => `
                        <button type="button" class="info-group-filter-btn" data-group="${group.key}" title="${group.label}" aria-label="${group.label}">
                            ${getInfoGroupFilterIconSvg(group.key)}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        function renderInlineGenderSymbol(item) {
            if (!item) return '';
            const normalizedGender = normalizeGenderValue(item.genero || '', '');
            if (normalizedGender === 'M') {
                return '<span class="dimension-model-gender-symbol male-symbol" aria-label="Macho" title="Macho">&#9794;</span>';
            }
            if (normalizedGender === 'F') {
                return '<span class="dimension-model-gender-symbol female-symbol" aria-label="Fêmea" title="Fêmea">&#9792;</span>';
            }
            return '';
        }

        function renderInlineGenderPhaseSymbol(item) {
            if (!item) return '';
            let html = '';
            
            // Gender
            const normalizedGender = normalizeGenderValue(item.genero || '', '');
            if (normalizedGender === 'M') {
                html += ' <span class="dimension-model-gender-symbol male-symbol" aria-label="Macho" title="Macho" style="font-size: 1rem; margin-left: 4px;">&#9794;</span>';
            } else if (normalizedGender === 'F') {
                html += ' <span class="dimension-model-gender-symbol female-symbol" aria-label="Fêmea" title="Fêmea" style="font-size: 1rem; margin-left: 4px;">&#9792;</span>';
            }

            // Phase
            const phase = String(item.fase || '').trim().toLowerCase();
            if (phase === 'cria') {
                html += ' <span class="parental-investment-phase-symbol young-symbol" aria-label="Cria" title="Cria" style="font-size: 0.82rem; margin-left: 4px; opacity: 0.8;"><i class="fa-solid fa-baby"></i></span>';
            } else if (phase === 'adulto') {
                html += ' <span class="parental-investment-phase-symbol adult-symbol" aria-label="Adulto" title="Adulto" style="font-size: 0.82rem; margin-left: 4px; opacity: 0.8;"><i class="fa-solid fa-paw"></i></span>';
            }

            return html;
        }

        function isParentalInvestmentItem(item) {
            if (!item) return false;
            const type = String(item.tipo || '').trim();
            return type === 'Investimento Parental' || type === 'parental_investment';
        }

        function getParentalStageValue(item) {
            return String(item?.etapa || item?.valorMin || item?.min || '').trim();
        }

        function getParentalCareValue(item) {
            return String(item?.cuidado || item?.valorMax || item?.max || item?.detalhe || '').trim();
        }

        function getParentalResponsibleValue(item) {
            return String(item?.responsavel || item?.unidade || item?.unit || '').trim();
        }

        function renderParentalActorMarker(item) {
            const responsible = getParentalResponsibleValue(item);
            if (!responsible || normalizeDimensionKey(responsible) === 'nenhum') return '';
            const normalized = normalizeDimensionKey(responsible);
            let html = '';

            const hasMale = normalized.includes('macho') || normalized.includes('pai') || normalized.includes('masculino') || normalized.includes('casal') || normalized.includes('ambos');
            const hasFemale = normalized.includes('femea') || normalized.includes('mae') || normalized.includes('feminino') || normalized.includes('casal') || normalized.includes('ambos');

            if (hasMale) {
                html += '<span class="dimension-model-gender-symbol male-symbol" aria-label="Macho" title="Macho">&#9794;</span>';
            }
            if (hasFemale) {
                html += '<span class="dimension-model-gender-symbol female-symbol" aria-label="Fêmea" title="Fêmea">&#9792;</span>';
            }
            if (!html && (normalized.includes('cria') || normalized.includes('juvenil'))) {
                html = '<span class="parental-investment-phase-symbol young-symbol" aria-label="Cria" title="Cria"><i class="fa-solid fa-baby"></i></span>';
            }
            if (!html && (normalized.includes('adulto') || normalized.includes('progenitor') || normalized.includes('reprodutor'))) {
                html = '<span class="parental-investment-phase-symbol adult-symbol" aria-label="Adulto" title="Adulto"><i class="fa-solid fa-paw"></i></span>';
            }
            if (html) return html;

            return `<span class="parental-investment-actor-text">${escapeHtml(responsible)}</span>`;
        }

        function renderParentalInvestmentGroupCard(group) {
            const stage = group.stage || 'Fase não definida';
            const seen = new Set();
            const careRows = group.items.map(item => {
                const care = getParentalCareValue(item) || 'Cuidado parental';
                const responsible = getParentalResponsibleValue(item);
                const dedupeKey = `${normalizeDimensionKey(care)}|${normalizeDimensionKey(responsible)}`;
                if (seen.has(dedupeKey)) return '';
                seen.add(dedupeKey);
                return `<div class="parental-investment-care-row"><span>${escapeHtml(care)}</span>${renderParentalActorMarker(item)}</div>`;
            }).filter(Boolean).join('');

            return `
                <article class="dimension-model-card reproduction-model-card parental-investment-card accent-parental-investment">
                    <div class="dimension-model-icon">${getReproductionModelSvg('investimentoParental')}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label parental-investment-stage">${escapeHtml(stage)}</div>
                        <div class="parental-investment-care-list">${careRows || '<div class="parental-investment-care-row"><span>Cuidado parental</span></div>'}</div>
                        <div class="dimension-model-value">Investimento Parental</div>
                    </div>
                </article>`;
        }

        function groupParentalInvestmentItems(items) {
            const groups = new Map();
            items.forEach(item => {
                const stage = getParentalStageValue(item) || 'Fase não definida';
                const key = normalizeDimensionKey(stage) || '__sem_fase__';
                if (!groups.has(key)) groups.set(key, { stage, items: [] });
                groups.get(key).items.push(item);
            });
            return Array.from(groups.values());
        }

        function formatGeneralVisualValue(item, fallback = '—') {
            if (!item) return fallback;
            const min = item.valorMin ?? item.valor ?? '';
            const max = item.valorMax ?? '';
            const unit = item.unidade || '';
            const value = min && max ? `${min}-${max}` : `${min || max}`;
            if (!value) return fallback;
            const normalizedType = normalizeDimensionKey(item.tipo || '');
            const isPercentageContext = normalizedType.includes('taxa de sucesso da caca') || normalizedType.includes('taxa de mortalidade');
            return isPercentageContext
                ? `${escapeHtml(value)} %${unit ? ` – ${escapeHtml(unit)}` : ''}`.trim()
                : `${escapeHtml(value)}${unit ? ` ${escapeHtml(unit)}` : ''}`.trim();
        }

        function getGeneralVisualMeta(type = '') {
            const normalized = normalizeDimensionKey(type);
            if (normalized.includes('vida util cativeiro')) {
                return { key: 'vida-cativeiro', title: type || 'Vida útil (cativeiro)', accent: 'accent-captive-life' };
            }
            if (normalized.includes('amament')) {
                return { key: 'amamentacao', title: type || 'Tempo de Amamentação', accent: 'accent-life' };
            }
            if (normalized.includes('tipo de perce')) {
                return { key: 'tipo-percecao', title: type || 'Tipo de perceção', accent: 'accent-eye' };
            }
            return getGeneralVisualCatalogMeta(type);
        }

        function getClimateZoneMeta(value = '') {
            const normalized = normalizeDimensionKey(value).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            const zones = {
                tropical: { image: 'assets/zonas-climaticas/Tropical.png', accent: 'accent-climate-tropical' },
                subtropical: { image: 'assets/zonas-climaticas/Tropical.png', accent: 'accent-climate-subtropical' },
                arido: { image: 'assets/zonas-climaticas/Árido.png', accent: 'accent-climate-desertica' },
                temperado: { image: 'assets/zonas-climaticas/Temperado.png', accent: 'accent-climate-temperada' },
                temperada: { image: 'assets/zonas-climaticas/Temperado.png', accent: 'accent-climate-temperada' },
                continental: { image: 'assets/zonas-climaticas/Continental.png', accent: 'accent-climate-temperada' },
                polar: { image: 'assets/zonas-climaticas/Polar.png', accent: 'accent-climate-polar' },
                artica: { image: 'assets/zonas-climaticas/Polar.png', accent: 'accent-climate-artica' },
                antartica: { image: 'assets/zonas-climaticas/Polar.png', accent: 'accent-climate-antartica' },
                desertica: { image: 'assets/zonas-climaticas/Árido.png', accent: 'accent-climate-desertica' },
                semiarida: { image: 'assets/zonas-climaticas/Árido.png', accent: 'accent-climate-semiarida' },
                mediterranica: { image: 'assets/zonas-climaticas/Temperado.png', accent: 'accent-climate-temperada' },
                montanhoso: { image: 'assets/zonas-climaticas/Montanhoso.png', accent: 'accent-climate-montanhosa' },
                montanhosa_alpina: { image: 'assets/zonas-climaticas/Montanhoso.png', accent: 'accent-climate-montanhosa' }
            };
            if (normalized.includes('montanhos') || normalized.includes('alpina')) return zones.montanhoso;
            return zones[normalized] || null;
        }

        function getBiomaMeta(value = '') {
            return getEnvironmentImageMeta(value, 'bioma', 'assets');
        }

        function getHabitatMeta(value = '') {
            return getEnvironmentImageMeta(value, 'habitat', 'assets');
        }

        function getGeneralModelSvg(key = 'geral') {
            if (key === 'vida-cativeiro') {
                return `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 58V28l22-14l22 14v30"/><path d="M26 58V34h28v24"/><path d="M34 58V44h12v14"/><path d="M40 24v10"/><path d="M34 29h12"/><path d="M18 58h44"/></svg>`;
            }
            if (key === 'amamentacao') {
                return `<svg class="metric-model-svg general-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M26 20c8 0 14 6 14 14v8c0 8-6 14-14 14s-14-6-14-14v-8c0-8 6-14 14-14Z"/><path d="M54 30c7 0 12 5 12 12s-5 12-12 12"/><path d="M40 38h12"/><path d="M52 34v16"/><path d="M24 58h30"/></svg>`;
            }
            return getGeneralCatalogModelSvg(key);
        }

        function isLegacyGeneralMatingItem(item = {}) {
            return normalizeDimensionKey(item?.tipo || '').includes('acasalamento') && !!(item?.valor || item?.valorMin || item?.valorMax);
        }

        function getLegacyGeneralMatingReproductionItems(models = []) {
            return collapseCombinedGenderItems(
                Array.isArray(models) ? models.filter(item => isLegacyGeneralMatingItem(item)) : []
            )
                .map(item => ({
                    tipo: 'Acasalamento',
                    detalhe: item.valorMin || item.valor || item.valorMax || ''
                }))
                .filter(item => item.detalhe);
        }

        function getGeneralVisualCardPresentation(item) {
            const meta = getGeneralVisualMeta(item.tipo);
            const normalizedType = normalizeDimensionKey(item.tipo);
            const value = item.valorMin || item.valor || '';
            const strategyMeta = normalizedType.includes('estrategia') ? getFeedingStrategyMeta(value) : null;
            const activityMeta = normalizedType.includes('atividade') ? getActivityMeta(value) : null;
            const socialMeta = normalizedType.includes('vida social') ? getSocialMeta(value) : null;
            const ecologicalMeta = normalizedType.includes('funcao ecologica') ? getEcologicalFunctionMeta(value) : null;
            const locomotionMeta = normalizedType.includes('locomocao') ? getLocomotionMeta(value) : null;
            const climateMeta = normalizedType.includes('zona') ? getClimateZoneMeta(value) : null;
            const habitatMeta = (normalizedType.includes('habitat') || normalizedType.includes('bioma')) ? getHabitatMeta(value) : null;
            const biomaMeta = normalizedType.includes('bioma') && !habitatMeta ? getBiomaMeta(value) : null;
            const displayMeta = habitatMeta ? { ...meta, title: 'Habitats' } : meta;
            const icon = climateMeta
                ? `<img class="climate-zone-model-image" src="${climateMeta.image}" alt="Zona climatica ${escapeHtml(value)}" loading="lazy">`
                : habitatMeta
                    ? `<img class="climate-zone-model-image" src="${habitatMeta.image}" alt="Habitat ${escapeHtml(value)}" loading="lazy">`
                : biomaMeta
                    ? `<img class="climate-zone-model-image" src="${biomaMeta.image}" alt="Bioma ${escapeHtml(value)}" loading="lazy">`
                    : ecologicalMeta
                        ? getEcologicalFunctionSvg(ecologicalMeta.key)
                    : locomotionMeta
                        ? getLocomotionSvg(locomotionMeta.key)
                    : strategyMeta
                        ? getFeedingStrategySvg(strategyMeta.key)
                        : activityMeta
                            ? getActivitySvg(activityMeta.key)
                            : socialMeta
                                ? getSocialSvg(socialMeta.key)
                            : getGeneralModelSvg(meta.key);

            return {
                meta,
                icon,
                accent: climateMeta?.accent || habitatMeta?.accent || biomaMeta?.accent || ecologicalMeta?.accent || locomotionMeta?.accent || strategyMeta?.accent || activityMeta?.accent || socialMeta?.accent || displayMeta.accent,
                climateMeta,
                biomaMeta,
                habitatMeta,
                meta: displayMeta
            };
        }

        function isPerceptionTypeModel(type = '') {
            const normalized = normalizeDimensionKey(type);
            return normalized.includes('tipo de perce');
        }

        function getPerceptionTypesFromItems(items = []) {
            return [...new Set(items
                .map(item => item.valorMin || item.valor || item.opcao || '')
                .map(value => String(value).trim())
                .filter(Boolean))];
        }

        function renderPerceptionTypeCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = getPerceptionTypesFromItems(items);
            const rows = items.map(item => {
                const inlineGenderSymbol = renderInlineGenderSymbol(item);
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `
                    <div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>
                        ${inlineGenderSymbol}${escapeHtml(value)}
                    </div>`;
            }).join('');

            const card = `
                <button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-perception-type-popup data-perception-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver os tipos de perceção e respetivos modelos visuais"${visible ? '' : ' style="display: none;"'}>
                    <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy perception-model-copy">
                        <div class="general-model-values dimension-model-label">${rows}</div>
                        <div class="dimension-model-value">${escapeHtml(meta.title)}</div>
                    </div>
                </button>`;
            return card;
        }

        function isSocialLifeModel(type = '') {
            return normalizeDimensionKey(type).includes('vida social');
        }

        function isSkeletonTypeModel(type = '') {
            return normalizeDimensionKey(type).includes('tipo de esqueleto');
        }

        function isThermoregulationModel(type = '') {
            return normalizeDimensionKey(type).includes('termorregulacao');
        }

        function isBodySymmetryModel(type = '') {
            return normalizeDimensionKey(type).includes('simetria corporal');
        }

        function isEcologicalStratumModel(type = '') {
            return normalizeDimensionKey(type).includes('estrato ecologico');
        }

        function isGroupCompositionModel(type = '') {
            return normalizeDimensionKey(type).includes('composicao do grupo') && !normalizeDimensionKey(type).includes('social');
        }

        function isLocomotionModel(type = '') {
            return normalizeDimensionKey(type).includes('locomocao');
        }

        function isKinshipLineageModel(type = '') {
            return normalizeDimensionKey(type).includes('parentesco e linhagem social');
        }

        function isLeadershipHierarchyModel(type = '') {
            return normalizeDimensionKey(type).includes('lideranca e hierarquia');
        }

        function isDigestiveSystemModel(type = '') {
            return normalizeDimensionKey(type).replace(/[()/]/g, ' ').replace(/\s+/g, ' ').trim().includes('presenca ausencia de sistema digestivo');
        }

        function isActivityModel(type = '') {
            return normalizeDimensionKey(type) === 'atividade';
        }

        function isTerritorySizeModel(type = '') {
            return normalizeDimensionKey(type).includes('tamanho do territorio');
        }

        function getSocialTypesFromItems(items = []) {
            return [...new Set(items
                .map(item => item.valorMin || item.valor || item.opcao || '')
                .map(value => String(value).trim())
                .filter(Boolean))];
        }

        function renderSocialTypeCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = getSocialTypesFromItems(items);
            const rows = items.map(item => {
                const inlineGenderSymbol = renderInlineGenderSymbol(item);
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `
                    <div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>
                        ${inlineGenderSymbol}${escapeHtml(value)}
                    </div>`;
            }).join('');

            return `
                <button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger social-type-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-social-type-popup data-social-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver os tipos de vida social e respetivos modelos visuais"${visible ? '' : ' style="display: none;"'}>
                    <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy perception-model-copy">
                        <div class="general-model-values dimension-model-label">${rows}</div>
                        <div class="dimension-model-value">${escapeHtml(meta.title)}</div>
                    </div>
                </button>`;
        }

        function renderSkeletonTypeCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = [...new Set(items.map(item => item.valorMin || item.valor || item.opcao || '').map(value => String(value).trim()).filter(Boolean))];
            const rows = items.map(item => {
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `<div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>${renderInlineGenderSymbol(item)}${escapeHtml(value)}</div>`;
            }).join('');
            return `<button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-skeleton-type-popup data-skeleton-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver os tipos de esqueleto e respetivas explicações"${visible ? '' : ' style="display: none;"'}>
                <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div>
                <div class="dimension-model-copy perception-model-copy"><div class="general-model-values dimension-model-label">${rows}</div><div class="dimension-model-value">${escapeHtml(meta.title)}</div></div>
            </button>`;
        }

        function renderThermoregulationCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = [...new Set(items.map(item => item.valorMin || item.valor || item.opcao || '').map(value => String(value).trim()).filter(Boolean))];
            const rows = items.map(item => {
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `<div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>${renderInlineGenderSymbol(item)}${escapeHtml(value)}</div>`;
            }).join('');
            return `<button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-thermoregulation-popup data-thermoregulation-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver os tipos de termorregulação e respetivas explicações"${visible ? '' : ' style="display: none;"'}>
                <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div>
                <div class="dimension-model-copy perception-model-copy"><div class="general-model-values dimension-model-label">${rows}</div><div class="dimension-model-value">${escapeHtml(meta.title)}</div></div>
            </button>`;
        }

        function renderBodySymmetryCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = [...new Set(items.map(item => item.valorMin || item.valor || item.opcao || '').map(value => String(value).trim()).filter(Boolean))];
            const rows = items.map(item => {
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `<div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>${renderInlineGenderSymbol(item)}${escapeHtml(value)}</div>`;
            }).join('');
            return `<button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-body-symmetry-popup data-body-symmetry-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver os tipos de simetria corporal e respetivas explicações"${visible ? '' : ' style="display: none;"'}>
                <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div>
                <div class="dimension-model-copy perception-model-copy"><div class="general-model-values dimension-model-label">${rows}</div><div class="dimension-model-value">${escapeHtml(meta.title)}</div></div>
            </button>`;
        }

        function renderEcologicalStratumCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = [...new Set(items.map(item => item.valorMin || item.valor || item.opcao || '').map(value => String(value).trim()).filter(Boolean))];
            const rows = items.map(item => {
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `<div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>${renderInlineGenderSymbol(item)}${escapeHtml(value)}</div>`;
            }).join('');
            return `<button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-ecological-stratum-popup data-ecological-stratum-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver os estratos ecológicos e respetivas explicações"${visible ? '' : ' style="display: none;"'}>
                <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div><div class="dimension-model-copy perception-model-copy"><div class="general-model-values dimension-model-label">${rows}</div><div class="dimension-model-value">${escapeHtml(meta.title)}</div></div>
            </button>`;
        }

        function renderGroupCompositionCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = [...new Set(items.map(item => item.valorMin || item.valor || item.opcao || '').map(value => String(value).trim()).filter(Boolean))];
            const rows = items.map(item => {
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `<div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>${renderInlineGenderSymbol(item)}${escapeHtml(value)}</div>`;
            }).join('');
            return `<button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-group-composition-popup data-group-composition-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver as composições de grupo e respetivas explicações"${visible ? '' : ' style="display: none;"'}>
                <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div><div class="dimension-model-copy perception-model-copy"><div class="general-model-values dimension-model-label">${rows}</div><div class="dimension-model-value">${escapeHtml(meta.title)}</div></div>
            </button>`;
        }

        function renderLocomotionCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = [...new Set(items.map(item => item.valorMin || item.valor || item.opcao || '').map(value => String(value).trim()).filter(Boolean))];
            const rows = items.map(item => {
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `<div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>${renderInlineGenderSymbol(item)}${escapeHtml(value)}</div>`;
            }).join('');
            return `<button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-locomotion-popup data-locomotion-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver os tipos de locomoção e respetivas explicações"${visible ? '' : ' style="display: none;"'}>
                <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div><div class="dimension-model-copy perception-model-copy"><div class="general-model-values dimension-model-label">${rows}</div><div class="dimension-model-value">${escapeHtml(meta.title)}</div></div>
            </button>`;
        }

        function renderKinshipLineageCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = [...new Set(items.map(item => item.valorMin || item.valor || item.opcao || '').map(value => String(value).trim()).filter(Boolean))];
            const rows = items.map(item => {
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `<div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>${renderInlineGenderSymbol(item)}${escapeHtml(value)}</div>`;
            }).join('');
            return `<button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-kinship-lineage-popup data-kinship-lineage-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver os tipos de parentesco e linhagem social e respetivas explicações"${visible ? '' : ' style="display: none;"'}>
                <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div><div class="dimension-model-copy perception-model-copy"><div class="general-model-values dimension-model-label">${rows}</div><div class="dimension-model-value">${escapeHtml(meta.title)}</div></div>
            </button>`;
        }

        function renderLeadershipHierarchyCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = [...new Set(items.map(item => item.valorMin || item.valor || item.opcao || '').map(value => String(value).trim()).filter(Boolean))];
            const rows = items.map(item => {
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `<div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>${renderInlineGenderSymbol(item)}${escapeHtml(value)}</div>`;
            }).join('');
            return `<button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-leadership-hierarchy-popup data-leadership-hierarchy-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver os tipos de liderança e hierarquia e respetivas explicações"${visible ? '' : ' style="display: none;"'}>
                <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div><div class="dimension-model-copy perception-model-copy"><div class="general-model-values dimension-model-label">${rows}</div><div class="dimension-model-value">${escapeHtml(meta.title)}</div></div>
            </button>`;
        }

        function renderDigestiveSystemCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = [...new Set(items.map(item => item.valorMin || item.valor || item.opcao || '').map(value => String(value).trim()).filter(Boolean))];
            const rows = items.map(item => {
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `<div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>${renderInlineGenderSymbol(item)}${escapeHtml(value)}</div>`;
            }).join('');
            return `<button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-digestive-system-popup data-digestive-system-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver os estados do sistema digestivo e respetivas explicações"${visible ? '' : ' style="display: none;"'}>
                <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div><div class="dimension-model-copy perception-model-copy"><div class="general-model-values dimension-model-label">${rows}</div><div class="dimension-model-value">${escapeHtml(meta.title)}</div></div>
            </button>`;
        }

        function renderActivityCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = [...new Set(items.map(item => item.valorMin || item.valor || item.opcao || '').map(value => String(value).trim()).filter(Boolean))];
            const rows = items.map(item => {
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `<div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>${renderInlineGenderSymbol(item)}${escapeHtml(value)}</div>`;
            }).join('');
            return `<button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-activity-popup data-activity-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver os tipos de atividade e respetivas explicações"${visible ? '' : ' style="display: none;"'}>
                <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div>
                <div class="dimension-model-copy perception-model-copy"><div class="general-model-values dimension-model-label">${rows}</div><div class="dimension-model-value">${escapeHtml(meta.title)}</div></div>
            </button>`;
        }

        function renderTerritorySizeCard(items, filterContext = {}) {
            const firstItem = items[0];
            const meta = getGeneralVisualMeta(firstItem.tipo);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const values = items.map(item => ({ valor: item.valor, valorMin: item.valorMin, valorMax: item.valorMax, unidade: item.unidade || 'km²' }));
            const rows = items.map(item => {
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `<div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>${renderInlineGenderSymbol(item)}${formatGeneralVisualValue(item)}</div>`;
            }).join('');
            return `<button type="button" class="dimension-model-card general-model-card visual-model-group-card perception-type-popup-trigger territory-size-popup-trigger ${meta.accent}" data-info-group="${infoGroup}" data-territory-size-popup data-territory-values="${escapeHtml(JSON.stringify(values))}" aria-haspopup="dialog" aria-label="Comparar o tamanho do território com um campo de futebol"${visible ? '' : ' style="display: none;"'}>
                <div class="dimension-model-icon">${getGeneralModelSvg(meta.key)}</div><div class="dimension-model-copy perception-model-copy"><div class="general-model-values dimension-model-label">${rows}</div><div class="dimension-model-value">${escapeHtml(meta.title)}</div></div>
            </button>`;
        }

        function isCommunicationTypeModel(type = '') {
            return normalizeDimensionKey(type) === 'tipo de comunicacao';
        }

        function getCommunicationTypesFromItems(items = []) {
            return [...new Set(items
                .flatMap(item => item.opcao || item.valorMin || item.valor || '')
                .flatMap(value => String(value).split(' + '))
                .map(value => value.trim())
                .filter(Boolean))];
        }

        function renderCommunicationTypeCard(items, filterContext = {}) {
            const firstItem = items[0];
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            const selectedTypes = getCommunicationTypesFromItems(items);
            const rows = items.map(item => {
                const inlineGenderSymbol = renderInlineGenderSymbol(item);
                const value = item.valorMin || item.valor || item.opcao || '—';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `
                    <div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>
                        ${inlineGenderSymbol}${escapeHtml(value)}
                    </div>`;
            }).join('');

            return `
                <button type="button" class="dimension-model-card general-model-card visual-model-group-card communication-type-popup-trigger" data-info-group="${infoGroup}" data-communication-type-popup data-communication-types="${escapeHtml(JSON.stringify(selectedTypes))}" aria-haspopup="dialog" aria-label="Ver os tipos de comunicação e respetivas explicações"${visible ? '' : ' style="display: none;"'}>
                    <div class="dimension-model-icon">${getCommunicationGenericModelSvg()}</div>
                    <div class="dimension-model-copy perception-model-copy">
                        <div class="general-model-values dimension-model-label">${rows}</div>
                        <div class="dimension-model-value">Tipo de Comunicação</div>
                    </div>
                </button>`;
        }

        function renderGeneralVisualCard(item) {
            const meta = getGeneralVisualMeta(item.tipo);
            const inlineGenderSymbol = renderInlineGenderSymbol(item);
            const normalizedType = normalizeDimensionKey(item.tipo);
            if (isPerceptionTypeModel(item.tipo)) return renderPerceptionTypeCard([item]);
            if (isSocialLifeModel(item.tipo)) return renderSocialTypeCard([item]);
            if (isSkeletonTypeModel(item.tipo)) return renderSkeletonTypeCard([item]);
            if (isThermoregulationModel(item.tipo)) return renderThermoregulationCard([item]);
            if (isBodySymmetryModel(item.tipo)) return renderBodySymmetryCard([item]);
            if (isEcologicalStratumModel(item.tipo)) return renderEcologicalStratumCard([item]);
            if (isGroupCompositionModel(item.tipo)) return renderGroupCompositionCard([item]);
            if (isLocomotionModel(item.tipo)) return renderLocomotionCard([item]);
            if (isKinshipLineageModel(item.tipo)) return renderKinshipLineageCard([item]);
            if (isLeadershipHierarchyModel(item.tipo)) return renderLeadershipHierarchyCard([item]);
            if (isDigestiveSystemModel(item.tipo)) return renderDigestiveSystemCard([item]);
            if (isActivityModel(item.tipo)) return renderActivityCard([item]);
            if (isTerritorySizeModel(item.tipo)) return renderTerritorySizeCard([item]);
            if (isCommunicationTypeModel(item.tipo)) return renderCommunicationTypeCard([item]);
            const isStrategy = normalizedType.includes('estrategia');
            if (isStrategy) return renderFeedingStrategyPopupCard([item]);
            const isActivity = normalizedType.includes('atividade');
            const isSocial = normalizedType.includes('vida social');
            const isEcologicalFunction = normalizedType.includes('funcao ecologica');
            const isLocomotion = normalizedType.includes('locomocao');
            const isClimateZone = normalizedType.includes('zona');
            const isBioma = normalizedType.includes('bioma');
            const isHabitat = normalizedType.includes('habitat');
            const value = item.valorMin || item.valor || '';
            const mixedOption = item.opcao || '';
            const strategyMeta = isStrategy ? getFeedingStrategyMeta(value) : null;
            const activityMeta = isActivity ? getActivityMeta(value) : null;
            const socialMeta = isSocial ? getSocialMeta(value) : null;
            const ecologicalMeta = isEcologicalFunction ? getEcologicalFunctionMeta(value) : null;
            const locomotionMeta = isLocomotion ? getLocomotionMeta(value) : null;
            const climateMeta = isClimateZone ? getClimateZoneMeta(value) : null;
            const habitatMeta = (isHabitat || isBioma) ? getHabitatMeta(value) : null;
            const biomaMeta = isBioma && !habitatMeta ? getBiomaMeta(value) : null;
            const displayMeta = habitatMeta ? { ...meta, title: 'Habitats' } : meta;
            const icon = climateMeta
                ? `<img class="climate-zone-model-image" src="${climateMeta.image}" alt="Zona climática ${escapeHtml(value)}" loading="lazy">`
                : habitatMeta
                    ? `<img class="climate-zone-model-image" src="${habitatMeta.image}" alt="Habitat ${escapeHtml(value)}" loading="lazy">`
                : biomaMeta
                    ? `<img class="climate-zone-model-image" src="${biomaMeta.image}" alt="Bioma ${escapeHtml(value)}" loading="lazy">`
                    : ecologicalMeta
                        ? getEcologicalFunctionSvg(ecologicalMeta.key)
                    : locomotionMeta
                        ? getLocomotionSvg(locomotionMeta.key)
                    : strategyMeta
                        ? getFeedingStrategySvg(strategyMeta.key)
                        : activityMeta
                            ? getActivitySvg(activityMeta.key)
                            : socialMeta
                                ? getSocialSvg(socialMeta.key)
                            : getGeneralModelSvg(meta.key);
            return `
                <article class="dimension-model-card general-model-card ${climateMeta?.accent || habitatMeta?.accent || biomaMeta?.accent || ecologicalMeta?.accent || locomotionMeta?.accent || strategyMeta?.accent || activityMeta?.accent || socialMeta?.accent || displayMeta.accent}" data-gender="${item.genero || ''}" data-phase="${item.fase || 'Adulto'}" data-info-group="${getInfoGroupForGeneralType(item.tipo)}">
                    <div class="dimension-model-icon ${climateMeta || habitatMeta || biomaMeta ? 'climate-zone-model-icon' : ''}">${icon}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label${inlineGenderSymbol ? ' with-gender' : ''}">${mixedOption ? `${escapeHtml(mixedOption)} – ` : ''}${formatGeneralVisualValue(item)}${inlineGenderSymbol}</div>
                        <div class="dimension-model-value">${escapeHtml(displayMeta.title)}</div>
                    </div>
                </article>`;
        }

        function renderGeneralVisualGroup(items, filterContext = {}) {
            const firstItem = items[0];
            const presentation = getGeneralVisualCardPresentation(firstItem);
            const infoGroup = getInfoGroupForGeneralType(firstItem.tipo);
            const visible = items.some(item => getInitialVisualItemVisibility(item, filterContext));
            if (isPerceptionTypeModel(firstItem.tipo)) return renderPerceptionTypeCard(items, filterContext);
            if (isSocialLifeModel(firstItem.tipo)) return renderSocialTypeCard(items, filterContext);
            if (isSkeletonTypeModel(firstItem.tipo)) return renderSkeletonTypeCard(items, filterContext);
            if (isThermoregulationModel(firstItem.tipo)) return renderThermoregulationCard(items, filterContext);
            if (isBodySymmetryModel(firstItem.tipo)) return renderBodySymmetryCard(items, filterContext);
            if (isEcologicalStratumModel(firstItem.tipo)) return renderEcologicalStratumCard(items, filterContext);
            if (isGroupCompositionModel(firstItem.tipo)) return renderGroupCompositionCard(items, filterContext);
            if (isLocomotionModel(firstItem.tipo)) return renderLocomotionCard(items, filterContext);
            if (isKinshipLineageModel(firstItem.tipo)) return renderKinshipLineageCard(items, filterContext);
            if (isLeadershipHierarchyModel(firstItem.tipo)) return renderLeadershipHierarchyCard(items, filterContext);
            if (isDigestiveSystemModel(firstItem.tipo)) return renderDigestiveSystemCard(items, filterContext);
            if (isActivityModel(firstItem.tipo)) return renderActivityCard(items, filterContext);
            if (isTerritorySizeModel(firstItem.tipo)) return renderTerritorySizeCard(items, filterContext);
            if (isCommunicationTypeModel(firstItem.tipo)) return renderCommunicationTypeCard(items, filterContext);
            if (normalizeDimensionKey(firstItem.tipo).includes('estrategia')) {
                const strategyCard = renderFeedingStrategyPopupCard(items);
                return visible
                    ? strategyCard
                    : strategyCard.replace(/<(article|button) class="/, '<$1 style="display: none;" class="');
            }
            const rows = items.map(item => {
                const inlineGenderSymbol = renderInlineGenderSymbol(item);
                const mixedOption = item.opcao || '';
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                return `
                    <div class="general-model-value-row" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}" data-info-group="${infoGroup}"${isVisible ? '' : ' style="display: none;"'}>
                        ${inlineGenderSymbol}${mixedOption ? `${escapeHtml(mixedOption)} &bull; ` : ''}${formatGeneralVisualValue(item)}
                    </div>`;
            }).join('');

            return `
                <article class="dimension-model-card general-model-card visual-model-group-card ${presentation.accent}" data-info-group="${infoGroup}"${visible ? '' : ' style="display: none;"'}>
                    <div class="dimension-model-icon ${presentation.climateMeta || presentation.biomaMeta ? 'climate-zone-model-icon' : ''}">${presentation.icon}</div>
                    <div class="dimension-model-copy">
                        <div class="general-model-values dimension-model-label">${rows}</div>
                        <div class="dimension-model-value">${escapeHtml(presentation.meta.title)}</div>
                    </div>
                </article>`;
        }

        function groupVisualModelItems(items = []) {
            const groups = new Map();
            items.forEach(item => {
                const key = `${item.isDimension ? 'dimension' : 'general'}:${normalizeDimensionKey(item.tipo)}`;
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(item);
            });
            return Array.from(groups.values());
        }

        function renderVisualModelCards(items = [], filterContext = {}) {
            return groupVisualModelItems(items).map(group => {
                if (group.length > 1) {
                    return group[0].isDimension
                        ? renderDimensionModelGroup(group, filterContext)
                        : renderGeneralVisualGroup(group, filterContext);
                }

                const item = group[0];
                const cardHtml = item.isDimension ? renderDimensionModelCard(item) : renderGeneralVisualCard(item);
                return getInitialVisualItemVisibility(item, filterContext)
                    ? cardHtml
                    : cardHtml.replace(/<(article|button) class="/, '<$1 style="display: none;" class="');
            }).join('');
        }

        function renderModelSection({ id, title, icon, items = [], filterContext = {}, mobile = false, marginTop = false, showGroupFilters = false }) {
            if (!items.length) return '';
            const sectionClass = mobile ? 'info-section mobile-only visual-models-info-section' : 'info-section-card visual-models-info-section';
            const style = mobile
                ? 'margin-bottom: 20px;'
                : (marginTop ? 'margin-top: 16px;' : '');
            const sortedItems = [...items].sort((a, b) => String(a.tipo || '').localeCompare(String(b.tipo || ''), 'pt-PT'));
            const genderTabs = getGenderTabsHTML(items);
            const groupFilters = showGroupFilters ? getInfoGroupFiltersHTML(items) : '';

            return `
                <div class="${sectionClass}" id="${id}"${style ? ` style="${style}"` : ''}>
                    <h3 class="visual-models-section-heading" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <span class="visual-models-section-title" style="display: flex; align-items: center;"><span class="icon svg-icon">${icon}</span>${title}</span>
                    </h3>
                    ${(groupFilters || genderTabs) ? `<div class="visual-models-section-controls">${groupFilters}${genderTabs}</div>` : ''}
                    <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px;${mobile ? ' margin-top: 15px;' : ''}">
                        ${renderVisualModelCards(sortedItems, filterContext)}
                    </div>
                </div>`;
        }

        function renderTopCardTabbedModelSection({ id, generalText = '', dimensionText = '', infoModelItems = [], dimensionModelItems = [], animalData = {}, mobile = false, onlyHeader = false, onlyPanes = false }) {
            const style = mobile ? 'margin-bottom: 20px;' : '';
            const sectionClass = mobile ? 'info-section mobile-only visual-models-info-section' : 'info-section-card visual-models-info-section';

            const estiloVidaItems = infoModelItems.filter(item => getGeneralFormTabForType(item.tipo) !== 'medidas' && getInfoGroupForGeneralType(item.tipo) === 'estilo-vida');
            const anatomiaItems = infoModelItems.filter(item => getGeneralFormTabForType(item.tipo) !== 'medidas' && getInfoGroupForGeneralType(item.tipo) === 'anatomia');
            const fisiologiaItems = infoModelItems.filter(item => getGeneralFormTabForType(item.tipo) !== 'medidas' && getInfoGroupForGeneralType(item.tipo) === 'fisiologia');
            const desenvolvimentoItems = infoModelItems.filter(item => getGeneralFormTabForType(item.tipo) !== 'medidas' && getInfoGroupForGeneralType(item.tipo) === 'desenvolvimento');
            const estruturasAnatomicasItems = infoModelItems.filter(item => getGeneralFormTabForType(item.tipo) !== 'medidas' && getInfoGroupForGeneralType(item.tipo) === 'estruturas-anatomicas');
            const measureItems = infoModelItems.filter(item => getGeneralFormTabForType(item.tipo) === 'medidas');
            const dimensionItems = dimensionModelItems;

            const tabs = [];
            tabs.push({ key: 'general', label: 'Geral' });
            if (estiloVidaItems.length) tabs.push({ key: 'estilo-vida', label: 'Estilo de Vida' });
            if (anatomiaItems.length || estruturasAnatomicasItems.length || fisiologiaItems.length || desenvolvimentoItems.length) tabs.push({ key: 'anatomia', label: 'Anatomia' });

            const hasAlimentacaoText = animalData.informacao?.alimentacao && animalData.informacao.alimentacao.trim() !== "";
            const hasAlimentacaoVisual = (Array.isArray(animalData.informacao?.alimentacaoDetalhada) && animalData.informacao.alimentacaoDetalhada.some(item => item?.tipo || item?.detalhe)) ||
                (Array.isArray(animalData.informacao?.alimentacaoEstrategias) && animalData.informacao.alimentacaoEstrategias.some(item => item?.estrategia || item?.tipo || item?.detalhe));
            const hasAlimentacao = hasAlimentacaoText || hasAlimentacaoVisual;
            if (hasAlimentacao) tabs.push({ key: 'alimentacao', label: 'Alimentação' });

            const hasBirdEggVisual = hasCategory(animalData.categoria, 'Aves') && (animalData.informacao?.ovo || (Array.isArray(animalData.informacao?.reproducaoDetalhada) && animalData.informacao.reproducaoDetalhada.some(item => getBirdEggVisualByLabel(item.tipo))));
            const hasReproducaoText = animalData.informacao?.reproducao && animalData.informacao.reproducao.trim() !== "";
            const hasReproducaoVisual =
                (Array.isArray(animalData.informacao?.reproducaoDetalhada) && animalData.informacao.reproducaoDetalhada.length > 0) ||
                getLegacyGeneralMatingReproductionItems(animalData.informacao?.geralDetalhada || []).length > 0;
            const hasReproducao = hasReproducaoText || hasReproducaoVisual || hasBirdEggVisual;
            if (hasReproducao) tabs.push({ key: 'reproducao', label: 'Reprodução' });

            if (measureItems.length) tabs.push({ key: 'measures', label: 'Medidas' });
            if (dimensionItems.length || String(dimensionText || '').trim()) tabs.push({ key: 'dimensions', label: 'Dimensões' });

            const allItemsForFilters = [...infoModelItems, ...dimensionModelItems];
            const hasGenders = collectConcreteGenders(allItemsForFilters).size > 0;
            const hasPhases = new Set(allItemsForFilters.map(item => item.fase).filter(Boolean)).has('Cria');

            if (!tabs.length) return '';

            const renderPane = (tabKey) => {
                if (tabKey === 'general') {
                    const findModelCardValue = (typeKeyword) => {
                        const items = infoModelItems.filter(i => String(i.tipo || '').toLowerCase().includes(typeKeyword.toLowerCase()));
                        if (items.length === 0) return { text: 'N/D', raw: [] };
                        
                        const activeCats = [];
                        items.forEach(item => {
                            const val = item.valorMin || item.valor || item.opcao || '';
                            if (val) {
                                activeCats.push(val);
                            }
                            if (typeof item.categoria === 'object') {
                                Object.entries(item.categoria).forEach(([k, v]) => {
                                    if (v === true) activeCats.push(k);
                                });
                            } else if (item.categoria) {
                                activeCats.push(item.categoria);
                            }
                        });

                        const uniqueCats = [...new Set(activeCats.map(c => String(c).trim()).filter(Boolean))];
                        const text = uniqueCats.length > 0 ? uniqueCats.slice(0, 2).join('<br>') : 'N/D';
                        return { text, raw: uniqueCats };
                    };

                    const activityObj = findModelCardValue('Atividade');
                    const locomocaoObj = findModelCardValue('Locomoção');
                    const stratumObj = findModelCardValue('Estrato');
                    
                    let feedingObj = { text: 'N/D', raw: [] };
                    const specFeeding = (animalData.informacao?.alimentacaoDetalhada || [])
                        .filter(i => i.tipo === 'Tipo de Alimentação' && i.detalhe);
                    if (specFeeding.length > 0) {
                        const activeCats = specFeeding.map(i => i.detalhe);
                        feedingObj = {
                            text: activeCats.slice(0, 2).join('<br>'),
                            raw: activeCats
                        };
                    } else {
                        feedingObj = findModelCardValue('Alimentação');
                        if (feedingObj.text === 'N/D') {
                            const strat = findModelCardValue('Estratégia');
                            if (strat.text !== 'N/D') {
                                feedingObj.text = strat.text;
                                feedingObj.raw = strat.raw;
                            }
                        }
                    }

                    let reproductionObj = { text: 'N/D', raw: [] };
                    const specRepro = (animalData.informacao?.reproducaoDetalhada || [])
                        .filter(i => (i.tipo === 'Acasalamento' || i.tipo === 'Sistema sexual') && i.detalhe);
                    if (specRepro.length > 0) {
                        const activeCats = specRepro.map(i => i.detalhe);
                        reproductionObj = {
                            text: activeCats.slice(0, 2).join('<br>'),
                            raw: activeCats
                        };
                    } else {
                        reproductionObj = findModelCardValue('Reprodução');
                        if (reproductionObj.text === 'N/D') {
                            const mating = findModelCardValue('Acasalamento');
                            if (mating.text !== 'N/D') {
                                reproductionObj.text = mating.text;
                                reproductionObj.raw = mating.raw;
                            }
                        }
                    }

                    const getActIcon = () => {
                        const val = activityObj.raw[0];
                        const actMeta = val ? getActivityMeta(val) : null;
                        return actMeta ? getActivitySvg(actMeta.key) : getGeneralCatalogModelSvg('atividade');
                    };

                    const getFeedingIcon = () => {
                        const val = feedingObj.raw[0];
                        const feedMeta = val ? getFeedingVisualMeta(val) : null;
                        return feedMeta ? getFeedingModelSvg(feedMeta.key) : getGeneralCatalogModelSvg('alimentacao');
                    };

                    const getReproIcon = () => {
                        const val = reproductionObj.raw[0];
                        const reproMeta = val ? getMatingMeta(val) : null;
                        return reproMeta ? getMatingSystemSvg(reproMeta.key) : getGeneralCatalogModelSvg('reproducao');
                    };

                    const getLocomotionIcon = () => {
                        const val = locomocaoObj.raw[0];
                        const locMeta = val ? getLocomotionMeta(val) : null;
                        return locMeta ? getLocomotionSvg(locMeta.key) : getGeneralCatalogModelSvg('locomocao');
                    };

                    // Extração para os 3 novos cards abaixo
                    const commItems = (animalData.informacao?.geralDetalhada || [])
                        .filter(i => String(i.tipo || '').toLowerCase().includes('comunicação') || String(i.tipo || '').toLowerCase().includes('comunicacao'));
                    const selectedCommTypes = getCommunicationTypesFromItems(commItems);

                    let socialObj = findModelCardValue('Composição do grupo');
                    if (socialObj.text === 'N/D') {
                        socialObj = findModelCardValue('Organização');
                    }
                    if (socialObj.text === 'N/D') {
                        socialObj = findModelCardValue('Vida social');
                    }

                    let sazonalObj = findModelCardValue('Comportamento');
                    if (sazonalObj.text === 'N/D') {
                        sazonalObj = findModelCardValue('Sazonal');
                    }

                    const envModels = animalData.informacao?.geralDetalhada || [];
                    const envQuickData = collapseCombinedGenderItems(
                        Array.isArray(envModels) ? envModels.filter(item => item.tipo && (item.valor || item.valorMin || item.valorMax) && isGeneralEnvironmentModel(item)) : []
                    );

                    const findEnvCardValue = (typeKeyword) => {
                        const items = envQuickData.filter(i => String(i.tipo || '').toLowerCase().includes(typeKeyword.toLowerCase()));
                        if (items.length === 0) return { text: 'N/D', raw: [] };
                        
                        const activeCats = [];
                        items.forEach(item => {
                            const val = item.valorMin || item.valor || item.opcao || '';
                            if (val) {
                                activeCats.push(val);
                            }
                            if (typeof item.categoria === 'object') {
                                Object.entries(item.categoria).forEach(([k, v]) => {
                                    if (v === true) activeCats.push(k);
                                });
                            } else if (item.categoria) {
                                activeCats.push(item.categoria);
                            }
                        });

                        const uniqueCats = [...new Set(activeCats.map(c => String(c).trim()).filter(Boolean))];
                        const text = uniqueCats.length > 0 ? uniqueCats.slice(0, 2).join('<br>') : 'N/D';
                        return { text, raw: uniqueCats };
                    };

                    let climaObj = findEnvCardValue('Zona climática');
                    if (climaObj.text === 'N/D') {
                        climaObj = findEnvCardValue('Clima');
                    }
                    let climaSecObj = findEnvCardValue('Zona climática secundária');
                    let biomasObj = findEnvCardValue('Bioma');
                    if (biomasObj.text === 'N/D') {
                        biomasObj = findEnvCardValue('Biomas');
                    }
                    let habitatsObj = findEnvCardValue('Habitats');
                    if (habitatsObj.text === 'N/D') {
                        habitatsObj = findEnvCardValue('Habitat');
                    }

                    const biomesList = biomasObj.raw.flatMap(val => String(val).split(' + ')).map(v => v.trim()).filter(Boolean);
                    const habitatsList = habitatsObj.raw.flatMap(val => String(val).split(' + ')).map(v => v.trim()).filter(Boolean);

                    const distData = animalData.informacao?.distribuicao || {};
                    const distRegions = typeof normalizeDistributionRegions === 'function' ? normalizeDistributionRegions(distData) : [];
                    const distRegionValues = distRegions.map(item => item.valor);
                    const distRegionValuesData = escapeHtml(JSON.stringify(distRegionValues));
                    const topMapId = mobile ? 'distributionMapCardTopMobile' : 'distributionMapCardTopDesktop';

                    const getSocialIcon = () => {
                        const val = socialObj.raw[0] || '';
                        const normalized = normalizeGeneralVisualKey(val);
                        return getSocialSvg ? getSocialSvg(normalized) : getGeneralCatalogModelSvg('organizacao-social');
                    };

                    return `<div class="visual-model-tab-pane" data-visual-model-pane="general">
                        ${generalText ? `<div class="visual-model-general-copy" style="margin-bottom: 20px;"><p>${generalText}</p></div>` : ''}
                        <div class="right-column-top-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-top: 10px; width: 100%;">
                            
                            <button type="button" class="summary-metric-card" data-activity-popup data-activity-types="${escapeHtml(JSON.stringify(activityObj.raw))}" aria-haspopup="dialog" style="--card-accent: #eab308; text-align: left; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 12px; cursor: pointer; width: 100%; font-family: inherit;">
                                <div class="summary-metric-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="color: var(--card-accent); display: flex; align-items: center; justify-content: center; width: 18px; height: 18px;">${getActIcon()}</span>
                                        <span style="font-weight: 500; font-size: 0.85rem; color: rgba(255,255,255,0.7);">Atividade</span>
                                    </div>
                                    <i class="fa-solid fa-chevron-right" style="color: rgba(255,255,255,0.4); font-size: 0.8rem;"></i>
                                </div>
                                <span class="summary-metric-value">${activityObj.text}</span>
                                <div class="summary-metric-watermark">${getActIcon()}</div>
                            </button>

                            <button type="button" class="summary-metric-card" data-feeding-type-popup data-feeding-types="${escapeHtml(JSON.stringify(feedingObj.raw))}" aria-haspopup="dialog" style="--card-accent: #ef4444; text-align: left; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 12px; cursor: pointer; width: 100%; font-family: inherit;">
                                <div class="summary-metric-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="color: var(--card-accent); display: flex; align-items: center; justify-content: center; width: 18px; height: 18px;">${getFeedingIcon()}</span>
                                        <span style="font-weight: 500; font-size: 0.85rem; color: rgba(255,255,255,0.7);">Tipo de alimentação</span>
                                    </div>
                                    <i class="fa-solid fa-chevron-right" style="color: rgba(255,255,255,0.4); font-size: 0.8rem;"></i>
                                </div>
                                <span class="summary-metric-value">${feedingObj.text}</span>
                                <div class="summary-metric-watermark">${getFeedingIcon()}</div>
                            </button>

                            <button type="button" class="summary-metric-card" data-mating-system-popup data-mating-systems="${escapeHtml(JSON.stringify(reproductionObj.raw))}" aria-haspopup="dialog" style="--card-accent: #ec4899; text-align: left; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 12px; cursor: pointer; width: 100%; font-family: inherit;">
                                <div class="summary-metric-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="color: var(--card-accent); display: flex; align-items: center; justify-content: center; width: 18px; height: 18px;">${getReproIcon()}</span>
                                        <span style="font-weight: 500; font-size: 0.85rem; color: rgba(255,255,255,0.7);">Tipo de reprodução</span>
                                    </div>
                                    <i class="fa-solid fa-chevron-right" style="color: rgba(255,255,255,0.4); font-size: 0.8rem;"></i>
                                </div>
                                <span class="summary-metric-value">${reproductionObj.text}</span>
                                <div class="summary-metric-watermark">${getReproIcon()}</div>
                            </button>

                            <button type="button" class="summary-metric-card" data-locomotion-popup data-locomotion-types="${escapeHtml(JSON.stringify(locomocaoObj.raw))}" aria-haspopup="dialog" style="--card-accent: #3b82f6; text-align: left; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 12px; cursor: pointer; width: 100%; font-family: inherit;">
                                <div class="summary-metric-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="color: var(--card-accent); display: flex; align-items: center; justify-content: center; width: 18px; height: 18px;">${getLocomotionIcon()}</span>
                                        <span style="font-weight: 500; font-size: 0.85rem; color: rgba(255,255,255,0.7);">Locomoção</span>
                                    </div>
                                    <i class="fa-solid fa-chevron-right" style="color: rgba(255,255,255,0.4); font-size: 0.8rem;"></i>
                                </div>
                                <span class="summary-metric-value">${locomocaoObj.text}</span>
                                <div class="summary-metric-watermark">${getLocomotionIcon()}</div>
                            </button>

                            <button type="button" class="summary-metric-card" data-ecological-stratum-popup data-ecological-strata="${escapeHtml(JSON.stringify(stratumObj.raw))}" aria-haspopup="dialog" style="--card-accent: #10b981; text-align: left; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 12px; cursor: pointer; width: 100%; font-family: inherit;">
                                <div class="summary-metric-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="color: var(--card-accent); display: flex; align-items: center; justify-content: center; width: 18px; height: 18px;">${getGeneralModelSvg('estrato-ecologico')}</span>
                                        <span style="font-weight: 500; font-size: 0.85rem; color: rgba(255,255,255,0.7);">Estrato ecológico</span>
                                    </div>
                                    <i class="fa-solid fa-chevron-right" style="color: rgba(255,255,255,0.4); font-size: 0.8rem;"></i>
                                </div>
                                <span class="summary-metric-value">${stratumObj.text}</span>
                                <div class="summary-metric-watermark">${getGeneralModelSvg('estrato-ecologico')}</div>
                            </button>

                        </div>

                        <div class="right-column-bottom-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 12px; width: 100%;">
                            
                            <button type="button" class="summary-metric-card taller-metric-card" data-communication-type-popup data-communication-types="${escapeHtml(JSON.stringify(selectedCommTypes))}" aria-haspopup="dialog" style="--card-accent: #06b6d4; text-align: left; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 14px; cursor: pointer; width: 100%; font-family: inherit; min-height: 140px;">
                                <div class="summary-metric-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="color: var(--card-accent); display: flex; align-items: center; justify-content: center; width: 18px; height: 18px;">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                                                <path d="M12 2v20M17 5v14M22 9v6M7 5v14M2 9v6"/>
                                            </svg>
                                        </span>
                                        <span style="font-weight: 500; font-size: 0.85rem; color: rgba(255,255,255,0.7);">Tipo de Comunicação</span>
                                    </div>
                                    <i class="fa-solid fa-chevron-right" style="color: rgba(255,255,255,0.4); font-size: 0.8rem;"></i>
                                </div>
                                <div class="communication-tags-container" style="display: flex; flex-wrap: wrap; gap: 8px; z-index: 2;">
                                    ${['Vocalizações', 'Química', 'Visual', 'Tátil'].map(label => {
                                        const isSelected = selectedCommTypes.some(type => type.toLowerCase().includes(label.toLowerCase()));
                                        return `
                                            <div class="communication-tag ${isSelected ? 'active' : 'inactive'}" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; font-family: inherit; transition: all 0.2s ease;">
                                                <span class="comm-tag-icon" style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; opacity: ${isSelected ? 1 : 0.4}; color: var(--card-accent);">${getCommunicationModelSvg(label)}</span>
                                                <span style="opacity: ${isSelected ? 1 : 0.6}; color: ${isSelected ? '#fff' : 'rgba(255,255,255,0.5)'};">${label}</span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                <div class="summary-metric-watermark" style="opacity: 0.04;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M12 2v20M17 5v14M22 9v6M7 5v14M2 9v6"/>
                                    </svg>
                                </div>
                            </button>

                            <button type="button" class="summary-metric-card taller-metric-card" data-social-type-popup data-social-types="${escapeHtml(JSON.stringify(socialObj.raw))}" aria-haspopup="dialog" style="--card-accent: #a855f7; text-align: left; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 14px; cursor: pointer; width: 100%; font-family: inherit; min-height: 140px;">
                                <div class="summary-metric-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="color: var(--card-accent); display: flex; align-items: center; justify-content: center; width: 18px; height: 18px;">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                <circle cx="9" cy="7" r="4"/>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                            </svg>
                                        </span>
                                        <span style="font-weight: 500; font-size: 0.85rem; color: rgba(255,255,255,0.7);">Organização social</span>
                                    </div>
                                    <i class="fa-solid fa-chevron-right" style="color: rgba(255,255,255,0.4); font-size: 0.8rem;"></i>
                                </div>
                                <span class="summary-metric-value">${socialObj.text}</span>
                                <div class="summary-metric-watermark">${getSocialIcon()}</div>
                            </button>

                            <button type="button" class="summary-metric-card taller-metric-card" data-activity-popup data-activity-types="${escapeHtml(JSON.stringify(sazonalObj.raw))}" aria-haspopup="dialog" style="--card-accent: #38bdf8; text-align: left; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 14px; cursor: pointer; width: 100%; font-family: inherit; min-height: 140px;">
                                <div class="summary-metric-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="color: var(--card-accent); display: flex; align-items: center; justify-content: center; width: 18px; height: 18px;">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                                                <path d="M2 12h20M12 2v20M20 16l-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/>
                                            </svg>
                                        </span>
                                        <span style="font-weight: 500; font-size: 0.85rem; color: rgba(255,255,255,0.7);">Comportamento sazonal</span>
                                    </div>
                                    <i class="fa-solid fa-chevron-right" style="color: rgba(255,255,255,0.4); font-size: 0.8rem;"></i>
                                </div>
                                <span class="summary-metric-value">${sazonalObj.text}</span>
                                <div class="summary-metric-watermark">${getGeneralCatalogModelSvg('sazonal')}</div>
                            </button>

                        </div>

                        <!-- Secção de Ambiente & Distribuição (Tamanho duplo: Clima/Biomas/Habitats à esquerda, Mapa de Distribuição à direita) -->
                        <div class="right-column-env-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-top: 12px; width: 100%;">
                            
                            <!-- Card 1: Clima, Biomas & Habitats -->
                            <div class="summary-metric-card env-large-card" style="--card-accent: #10b981; text-align: left; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 18px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; width: 100%; min-height: 220px; font-family: inherit;">
                                <div class="summary-metric-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="color: var(--card-accent); display: flex; align-items: center; justify-content: center; width: 16px; height: 16px;">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                                                <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M17.66 17.66l1.41 1.41M12 20v2M6.34 17.66l-1.41 1.41M2 12h2M6.34 6.34l-1.41-1.41"/>
                                                <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>
                                            </svg>
                                        </span>
                                        <span style="font-weight: 500; font-size: 0.8rem; color: rgba(255,255,255,0.7);">Clima, Biomas & Habitats</span>
                                    </div>
                                </div>
                                
                                <div style="display: flex; flex-direction: column; gap: 4px; z-index: 2;">
                                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5); font-weight: 500;">Clima</div>
                                    <button type="button" data-climate-zone-map-popup data-popup-label="${escapeHtml(climaObj.raw[0] || '')}" data-info-group="habitat" style="font-size: 0.95rem; color: var(--card-accent); margin: 0; padding: 4px 10px; font-weight: 700; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; cursor: pointer; text-align: left; width: fit-content; font-family: inherit;">
                                        ${[climaObj.text, climaSecObj.text].filter(t => t && t !== 'N/D').join(' / ') || 'N/D'}
                                    </button>
                                </div>

                                <div style="display: flex; flex-direction: column; gap: 6px; z-index: 2; flex: 1;">
                                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5); font-weight: 500;">Biomas</div>
                                    <div class="env-images-row" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; width: 100%;">
                                        ${biomesList.length > 0 ? biomesList.map(biome => {
                                            const imgMeta = getBiomaMeta(biome);
                                            if (!imgMeta) return '';
                                            return `
                                                <button type="button" class="env-image-card" data-environment-visual-popup data-popup-kind="biome" data-popup-label="${escapeHtml(biome)}" data-popup-image="${escapeHtml(imgMeta.image)}" style="display: flex; flex-direction: column; gap: 4px; min-width: 65px; max-width: 75px; background: none; border: none; padding: 0; cursor: pointer; text-align: left; font-family: inherit;">
                                                    <div class="env-image-wrapper" style="position: relative; aspect-ratio: 1/1; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); width: 100%;">
                                                        <img src="${imgMeta.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${biome}" />
                                                    </div>
                                                    <span style="font-size: 0.65rem; font-weight: 600; color: rgba(255, 255, 255, 0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px; width: 100%;" title="${biome}">${biome}</span>
                                                </button>
                                            `;
                                        }).join('') : `<span style="font-size: 0.75rem; color: rgba(255,255,255,0.4);">Sem biomas registados</span>`}
                                    </div>
                                </div>

                                <div style="display: flex; flex-direction: column; gap: 6px; z-index: 2; flex: 1; margin-top: 2px;">
                                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5); font-weight: 500;">Habitats</div>
                                    <div class="env-images-row" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; width: 100%;">
                                        ${habitatsList.length > 0 ? habitatsList.map(habitat => {
                                            const imgMeta = getHabitatMeta(habitat);
                                            if (!imgMeta) return '';
                                            return `
                                                <button type="button" class="env-image-card" data-environment-visual-popup data-popup-kind="habitat" data-popup-label="${escapeHtml(habitat)}" data-popup-image="${escapeHtml(imgMeta.image)}" style="display: flex; flex-direction: column; gap: 4px; min-width: 65px; max-width: 75px; background: none; border: none; padding: 0; cursor: pointer; text-align: left; font-family: inherit;">
                                                    <div class="env-image-wrapper" style="position: relative; aspect-ratio: 1/1; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); width: 100%;">
                                                        <img src="${imgMeta.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${habitat}" />
                                                    </div>
                                                    <span style="font-size: 0.65rem; font-weight: 600; color: rgba(255, 255, 255, 0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px; width: 100%;" title="${habitat}">${habitat}</span>
                                                </button>
                                            `;
                                        }).join('') : `<span style="font-size: 0.75rem; color: rgba(255,255,255,0.4);">Sem habitats registados</span>`}
                                    </div>
                                </div>

                                <div class="summary-metric-watermark" style="opacity: 0.04; width: 60px; height: 60px;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M17.66 17.66l1.41 1.41M12 20v2M6.34 17.66l-1.41 1.41M2 12h2M6.34 6.34l-1.41-1.41"/>
                                        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>
                                    </svg>
                                </div>
                            </div>

                            <!-- Card 2: Distribuição & Mapa -->
                            <div class="summary-metric-card env-large-card" style="--card-accent: #6366f1; text-align: left; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 18px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; width: 100%; min-height: 220px; font-family: inherit;">
                                <div class="summary-metric-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                    <button type="button" data-biogeographic-region-popup data-biogeographic-regions="${distRegionValuesData}" aria-haspopup="dialog" style="background: none; border: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; justify-content: space-between; width: 100%; font-family: inherit;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span style="color: var(--card-accent); display: flex; align-items: center; justify-content: center; width: 16px; height: 16px;">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2 12h20"/>
                                                </svg>
                                            </span>
                                            <span style="font-weight: 500; font-size: 0.8rem; color: rgba(255,255,255,0.7);">Distribuição geográfica</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right" style="color: rgba(255,255,255,0.4); font-size: 0.8rem;"></i>
                                    </button>
                                </div>

                                <div style="flex: 1; min-height: 140px; height: 140px; position: relative; z-index: 2; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08);">
                                    <div class="map-container" id="${topMapId}" style="width: 100%; height: 100%; min-height: 140px; background: rgba(0,0,0,0.15);"></div>
                                </div>

                                <div class="summary-metric-watermark" style="opacity: 0.04; width: 60px; height: 60px;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2 12h20"/>
                                    </svg>
                                </div>
                            </div>
                            
                        </div>
                    </div>`;
                }
                let paneItems = [];
                let isDimension = false;
                let paneText = '';
                if (tabKey === 'estilo-vida') paneItems = estiloVidaItems;
                else if (tabKey === 'anatomia') paneItems = [...anatomiaItems, ...estruturasAnatomicasItems, ...fisiologiaItems, ...desenvolvimentoItems];
                else if (tabKey === 'measures') paneItems = measureItems;
                else if (tabKey === 'dimensions') {
                    paneItems = dimensionItems;
                    isDimension = true;
                    paneText = dimensionText;
                }

                const filterContext = { genders: collectConcreteGenders(paneItems), phases: new Set(paneItems.map(item => item.fase).filter(Boolean)) };

                if (tabKey === 'anatomia') {
                    const sortedAnatomia = [...paneItems.filter(item => getInfoGroupForGeneralType(item.tipo) === 'anatomia')].sort((a, b) => String(a.tipo || '').localeCompare(String(b.tipo || ''), 'pt-PT'));
                    const sortedEstruturas = [...paneItems.filter(item => getInfoGroupForGeneralType(item.tipo) === 'estruturas-anatomicas')].sort((a, b) => String(a.tipo || '').localeCompare(String(b.tipo || ''), 'pt-PT'));
                    const sortedFisiologia = [...paneItems.filter(item => getInfoGroupForGeneralType(item.tipo) === 'fisiologia')].sort((a, b) => String(a.tipo || '').localeCompare(String(b.tipo || ''), 'pt-PT'));
                    const sortedDesenvolvimento = [...paneItems.filter(item => getInfoGroupForGeneralType(item.tipo) === 'desenvolvimento')].sort((a, b) => String(a.tipo || '').localeCompare(String(b.tipo || ''), 'pt-PT'));

                    return `<div class="visual-model-tab-pane" data-visual-model-pane="anatomia" hidden>
                        ${sortedAnatomia.length ? `
                            <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px;${mobile ? ' margin-top: 15px;' : ''}">
                                ${renderVisualModelCards(sortedAnatomia, filterContext)}
                            </div>
                        ` : ''}

                        ${sortedEstruturas.length ? `
                            <h4 style="margin: 20px 0 10px; font-size: 0.95rem; font-weight: 700; color: rgba(255, 255, 255, 0.6); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 6px;">Estruturas anatómicas</h4>
                            <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px;${mobile && !sortedAnatomia.length ? ' margin-top: 15px;' : ''}">
                                ${renderVisualModelCards(sortedEstruturas, filterContext)}
                            </div>
                        ` : ''}

                        ${sortedFisiologia.length ? `
                            <h4 style="margin: 20px 0 10px; font-size: 0.95rem; font-weight: 700; color: rgba(255, 255, 255, 0.6); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 6px;">Fisiologia</h4>
                            <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px;${mobile && !sortedAnatomia.length && !sortedEstruturas.length ? ' margin-top: 15px;' : ''}">
                                ${renderVisualModelCards(sortedFisiologia, filterContext)}
                            </div>
                        ` : ''}

                        ${sortedDesenvolvimento.length ? `
                            <h4 style="margin: 20px 0 10px; font-size: 0.95rem; font-weight: 700; color: rgba(255, 255, 255, 0.6); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 6px;">Desenvolvimento</h4>
                            <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px;${mobile && !sortedAnatomia.length && !sortedEstruturas.length && !sortedFisiologia.length ? ' margin-top: 15px;' : ''}">
                                ${renderVisualModelCards(sortedDesenvolvimento, filterContext)}
                            </div>
                        ` : ''}
                    </div>`;
                }

                if (tabKey === 'alimentacao') {
                    return `<div class="visual-model-tab-pane" data-visual-model-pane="alimentacao" hidden>
                        ${animalData.informacao?.alimentacao ? `<div class="visual-model-general-copy"><p>${animalData.informacao.alimentacao}</p></div>` : ''}
                        ${renderFeedingVisual(animalData)}
                    </div>`;
                }

                if (tabKey === 'reproducao') {
                    return `<div class="visual-model-tab-pane" data-visual-model-pane="reproducao" hidden>
                        ${animalData.informacao?.reproducao ? `<div class="visual-model-general-copy"><p>${animalData.informacao.reproducao}</p></div>` : ''}
                        ${renderReproductionVisual(animalData)}
                    </div>`;
                }

                const sortedItems = [...paneItems].sort((a, b) => String(a.tipo || '').localeCompare(String(b.tipo || ''), 'pt-PT'));

                return `<div class="visual-model-tab-pane" data-visual-model-pane="${tabKey}" hidden>
                    ${paneText ? `<div class="visual-model-general-copy"><p>${paneText}</p></div>` : ''}
                    <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px;${mobile ? ' margin-top: 15px;' : ''}">
                        ${renderVisualModelCards(sortedItems, filterContext)}
                    </div>
                </div>`;
            };

            if (onlyHeader) {
                return `
                    <h3 class="visual-models-section-heading" style="display: flex; align-items: center; justify-content: space-between; width: 100%; border: none !important; padding: 0 !important; background: transparent !important; margin-bottom: 0px !important;">
                        <span class="visual-model-section-tablist" role="tablist" aria-label="Separadores de informação" style="display: flex; flex-wrap: wrap; gap: 4px; border: none; margin: 0; flex: 1 1 auto; align-items: center; width: 100%;">
                            ${tabs.map((tab, idx) => `
                                <button type="button" class="visual-model-section-tab ${idx === 0 ? 'is-active' : ''}" data-visual-model-tab="${tab.key}" role="tab" aria-selected="${idx === 0 ? 'true' : 'false'}" style="flex: 0 0 auto; min-width: max-content;">
                                    <span class="icon svg-icon">${
                                        tab.key === 'alimentacao' || tab.key === 'reproducao'
                                            ? getInfoSectionIconSvg(tab.key)
                                            : getInfoGroupFilterIconSvg(tab.key === 'general' ? 'estilo-vida' : tab.key === 'measures' ? 'medidas' : tab.key === 'dimensions' ? 'dimensoes' : tab.key)
                                    }</span>${tab.label}
                                </button>
                            `).join('')}
                            ${hasGenders || hasPhases ? `<span class="visual-models-tablist-controls" style="margin: 0 5px 0 auto !important; display: inline-flex !important; align-items: center; gap: 8px; border: none !important; background: transparent !important; padding: 0 !important; box-shadow: none !important; flex: 0 0 auto;">${getGenderTabsHTML(allItemsForFilters)}</span>` : ''}
                        </span>
                    </h3>`;
            }

            if (onlyPanes) {
                return tabs.map((tab, idx) => {
                    const paneHTML = renderPane(tab.key);
                    if (idx === 0) {
                        return paneHTML.replace('class="visual-model-tab-pane"', 'class="visual-model-tab-pane is-active"').replace('hidden', '');
                    }
                    return paneHTML;
                }).join('');
            }

            return `
                <div class="${sectionClass} visual-model-tabs" id="${id}" data-visual-model-tabs${style ? ` style="${style}"` : ''}>
                    <h3 class="visual-models-section-heading" style="display: flex; align-items: center; justify-content: space-between; width: 100%; border-bottom: 1px solid rgba(148, 163, 184, 0.38); padding-bottom: 6px; flex-wrap: wrap; gap: 12px;">
                        <span class="visual-model-section-tablist" role="tablist" aria-label="Separadores de informação" style="display: flex; flex-wrap: wrap; gap: 4px; border: none; margin: 0; flex: 1 1 auto; align-items: center; width: 100%;">
                            ${tabs.map((tab, idx) => `
                                <button type="button" class="visual-model-section-tab ${idx === 0 ? 'is-active' : ''}" data-visual-model-tab="${tab.key}" role="tab" aria-selected="${idx === 0 ? 'true' : 'false'}" style="flex: 0 0 auto; min-width: max-content;">
                                    <span class="icon svg-icon">${
                                        tab.key === 'alimentacao' || tab.key === 'reproducao'
                                            ? getInfoSectionIconSvg(tab.key)
                                            : getInfoGroupFilterIconSvg(tab.key === 'general' ? 'estilo-vida' : tab.key === 'measures' ? 'medidas' : tab.key === 'dimensions' ? 'dimensoes' : tab.key)
                                    }</span>${tab.label}
                                </button>
                            `).join('')}
                            ${hasGenders || hasPhases ? `<span class="visual-models-tablist-controls" style="margin: 0 5px 0 auto !important; display: inline-flex !important; align-items: center; gap: 8px; border: none !important; background: transparent !important; padding: 0 !important; box-shadow: none !important; flex: 0 0 auto;">${getGenderTabsHTML(allItemsForFilters)}</span>` : ''}
                        </span>
                    </h3>
                    ${tabs.map((tab, idx) => {
                        const paneHTML = renderPane(tab.key);
                        if (idx === 0) {
                            return paneHTML.replace('class="visual-model-tab-pane"', 'class="visual-model-tab-pane is-active"').replace('hidden', '');
                        }
                        return paneHTML;
                    }).join('')}
                </div>`;
        }

        function renderTabbedModelSection({ id, generalText = '', dimensionText = '', generalItems = [], measureItems = [], dimensionItems = [], generalFilterContext = {}, measureFilterContext = {}, dimensionFilterContext = {}, mobile = false }) {
            if (!String(generalText || '').trim() && !String(dimensionText || '').trim() && !generalItems.length && !measureItems.length && !dimensionItems.length) return '';

            const sectionClass = mobile ? 'info-section mobile-only visual-models-info-section' : 'info-section-card visual-models-info-section';
            const style = mobile ? 'margin-bottom: 20px;' : '';
            const generalSortedItems = [...generalItems].sort((a, b) => String(a.tipo || '').localeCompare(String(b.tipo || ''), 'pt-PT'));
            const measureSortedItems = [...measureItems].sort((a, b) => String(a.tipo || '').localeCompare(String(b.tipo || ''), 'pt-PT'));
            const dimensionSortedItems = [...dimensionItems].sort((a, b) => String(a.tipo || '').localeCompare(String(b.tipo || ''), 'pt-PT'));
            const generalControls = `${getInfoGroupFiltersHTML(generalItems)}${getGenderTabsHTML(generalItems)}`;
            const measureControls = getGenderTabsHTML(measureItems);
            const dimensionControls = getGenderTabsHTML(dimensionItems);
            const hasGeneralPane = Boolean(String(generalText || '').trim());

            return `
                <div class="${sectionClass} visual-model-tabs" id="${id}" data-visual-model-tabs${style ? ` style="${style}"` : ''}>
                    <h3 class="visual-models-section-heading" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <span class="visual-model-section-tablist" role="tablist" aria-label="Separadores de informação">
                            <button type="button" class="visual-model-section-tab is-active" data-visual-model-tab="general" role="tab" aria-selected="true">
                                <span class="icon svg-icon">${getInfoSectionIconSvg('geral')}</span>Geral
                            </button>
                            <button type="button" class="visual-model-section-tab" data-visual-model-tab="measures" role="tab" aria-selected="false">
                                <span class="icon svg-icon">${getInfoSectionIconSvg('medidas')}</span><span class="visual-tab-label visual-tab-label--short" data-label-pt="Medidas" data-label-en="Meas." data-label-fr="Mesures" data-label-es="Medidas" data-label-de="Messwerte" data-label-ja="測定値" data-label-zh="测量">Medidas</span>
                            </button>
                            <button type="button" class="visual-model-section-tab" data-visual-model-tab="dimensions" role="tab" aria-selected="false">
                                <span class="icon svg-icon">${getInfoSectionIconSvg('dimensoes')}</span><span class="visual-tab-label visual-tab-label--short" data-label-pt="Dimensões" data-label-en="Dimensions" data-label-fr="Dimensions" data-label-es="Dimensiones" data-label-de="Abm." data-label-ja="寸法" data-label-zh="尺寸">Dimensões</span>
                            </button>
                        </span>
                    </h3>
                    <div class="visual-model-tab-pane is-active" data-visual-model-pane="general">
                        ${hasGeneralPane ? `<div class="visual-model-general-copy"><p>${generalText}</p></div>` : ''}
                        ${generalControls ? `<div class="visual-models-section-controls">${generalControls}</div>` : ''}
                        <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px;${mobile ? ' margin-top: 15px;' : ''}">
                            ${renderVisualModelCards(generalSortedItems, generalFilterContext)}
                        </div>
                    </div>
                    <div class="visual-model-tab-pane" data-visual-model-pane="measures" hidden>
                        ${measureControls ? `<div class="visual-models-section-controls">${measureControls}</div>` : ''}
                        <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px;${mobile ? ' margin-top: 15px;' : ''}">
                            ${renderVisualModelCards(measureSortedItems, measureFilterContext)}
                        </div>
                    </div>
                    <div class="visual-model-tab-pane" data-visual-model-pane="dimensions" hidden>
                        ${dimensionText ? `<div class="visual-model-general-copy"><p>${dimensionText}</p></div>` : ''}
                        ${dimensionControls ? `<div class="visual-models-section-controls">${dimensionControls}</div>` : ''}
                        <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px;${mobile ? ' margin-top: 15px;' : ''}">
                            ${renderVisualModelCards(dimensionSortedItems, dimensionFilterContext)}
                        </div>
                    </div>
                </div>`;
        }

        function renderEnvironmentVisualCards(items = [], filterContext = {}) {
            return items.map(item => {
                const value = item.valorMin || item.valor || item.opcao || '';
                const type = normalizeDimensionKey(item.tipo);
                const isBiome = type === 'bioma';
                const isHabitat = type.includes('habitat');
                const meta = isBiome ? getBiomaMeta(value) : isHabitat ? getHabitatMeta(value) : null;
                const popupAttributes = meta
                    ? ` data-environment-visual-popup data-popup-kind="${isHabitat ? 'habitat' : 'biome'}" data-popup-label="${escapeHtml(value)}" data-popup-image="${escapeHtml(meta?.image || '')}"`
                    : '';
                const cardHtml = renderGeneralVisualCard(item).replace('<article ', `<article${popupAttributes} `);
                return getInitialVisualItemVisibility(item, filterContext)
                    ? cardHtml
                    : cardHtml.replace(/<(article|button) class="/, '<$1 style="display: none;" class="');
            }).join('');
        }

        const CLIMATE_BIOME_GROUPS = {
            tropical: ['Floresta tropical pluvial', 'Floresta tropical e subtropical húmida', 'Floresta tropical seca', 'Bosque tropical seco', 'Florestas tropicais de coníferas', 'Campos tropicais', 'Savana', 'Savana tropical', 'Matagal tropical'],
            arido: ['Deserto quente', 'Deserto frio', 'Semi-deserto', 'Matagal xerófilo', 'Estepe'],
            temperado: ['Floresta decídua temperada', 'Bosque temperado', 'Floresta temperada pluvial', 'Floresta temperada de coníferas', 'Pradaria', 'Campos temperados', 'Floresta mediterrânica', 'Matagal mediterrânico', 'Chaparral'],
            continental: ['Taiga', 'Bosque de coníferas'],
            polar: ['Tundra', 'Tundra ártica', 'Tundra alpina', 'Calota de gelo']
        };

        function getClimateBiomeItems(primaryValue = '', biomeItems = []) {
            const climateKey = normalizeDimensionKey(primaryValue).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            return biomeItems.filter(item => {
                const value = item.valorMin || item.valor || item.opcao || '';
                return (CLIMATE_BIOME_GROUPS[climateKey] || []).some(label => normalizeDimensionKey(label) === normalizeDimensionKey(value));
            });
        }

        function renderClimateZoneEnvironmentCard(items = [], biomeItems = [], filterContext = {}) {
            const primaryItems = items.filter(item => normalizeDimensionKey(item.tipo) === 'zona climatica');
            const secondaryItems = items.filter(item => normalizeDimensionKey(item.tipo) === 'zona climatica secundaria');
            const secondaryToPrimary = {
                equatorial: 'Tropical', moncao: 'Tropical', savana: 'Tropical',
                deserticos: 'Árido', semiaridos: 'Árido',
                subtropical_humido: 'Tropical', oceanico: 'Tropical', mediterranico: 'Tropical',
                continental_humido: 'Continental', subartico: 'Continental',
                tundra: 'Polar', glacial: 'Polar'
            };
            const fallbackSecondary = secondaryItems[0]?.valorMin || secondaryItems[0]?.valor || secondaryItems[0]?.opcao || '';
            const fallbackPrimary = secondaryToPrimary[normalizeDimensionKey(fallbackSecondary).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')];
            const primary = primaryItems[0] || (fallbackPrimary ? { valor: fallbackPrimary } : null);
            if (!primary) return '';

            const primaryValue = primary.valorMin || primary.valor || primary.opcao || '';
            const climateMeta = getClimateZoneMeta(primaryValue);
            if (!climateMeta) return '';

            const matchingBiomes = getClimateBiomeItems(primaryValue, biomeItems);
            const visible = [...items, ...matchingBiomes].some(item => getInitialVisualItemVisibility(item, filterContext));
            const secondaryRows = secondaryItems.map(item => {
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                const value = item.valorMin || item.valor || item.opcao || '—';
                return `<div class="general-model-value-row secondary-climate-zone-row" data-environment-visual-popup data-popup-kind="secondary-climate" data-popup-label="${escapeHtml(value)}" data-popup-image="assets/zonas-climaticas-secundario/${escapeHtml(value)}.png" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}"${isVisible ? '' : ' style="display: none;"'}>${renderInlineGenderSymbol(item)}${escapeHtml(value)}</div>`;
            }).join('');
            const biomeRows = matchingBiomes.map(item => {
                const isVisible = getInitialVisualItemVisibility(item, filterContext);
                const value = item.valorMin || item.valor || item.opcao || '—';
                const biomeMeta = getBiomaMeta(value);
                const biomeIcon = biomeMeta ? `<img class="climate-biome-model-image" src="${biomeMeta.image}" alt="Bioma ${escapeHtml(value)}" loading="lazy">` : '';
                return `<div class="climate-biome-mini-card ${biomeMeta?.accent || ''}" data-environment-visual-popup data-popup-kind="biome" data-popup-label="${escapeHtml(value)}" data-popup-image="${escapeHtml(biomeMeta?.image || '')}" data-gender="${escapeHtml(item.genero || '')}" data-phase="${escapeHtml(item.fase || 'Adulto')}"${isVisible ? '' : ' style="display: none;"'}>
                    <div class="climate-biome-mini-icon">${biomeIcon}</div>
                    <div class="climate-biome-mini-copy"><div class="climate-biome-mini-label">Bioma</div><div class="climate-biome-mini-value">${escapeHtml(value)}</div></div>
                </div>`;
            }).join('');

            return `<article class="dimension-model-card general-model-card climate-zone-summary-card ${climateMeta.accent}" data-climate-zone-map-popup data-popup-label="${escapeHtml(primaryValue)}" data-info-group="habitat"${visible ? '' : ' style="display: none;"'}>
                <div class="dimension-model-icon climate-zone-model-icon"><img class="climate-zone-model-image" src="${climateMeta.image}" alt="Zona climática ${escapeHtml(primaryValue)}" loading="lazy"></div>
                <div class="dimension-model-copy">
                    <div class="dimension-model-label">Zona Climática</div>
                    <div class="dimension-model-value">${escapeHtml(primaryValue)}</div>
                    ${secondaryRows ? `<div class="secondary-climate-zone-list"><div class="secondary-climate-zone-heading">Zonas Climáticas Secundárias</div>${secondaryRows}</div>` : ''}
                    ${biomeRows ? `<div class="secondary-climate-zone-list climate-biome-list">${biomeRows}</div>` : ''}
                </div>
            </article>`;
        }

        function renderEnvironmentSections(items = [], filterContext = {}, { id = 'info-ambiente', mobile = false } = {}) {
            if (!items.length) return '';

            const wrapperStyle = mobile ? 'margin-bottom: 20px;' : 'margin-top: 20px;';
            const climateItems = items.filter(item => {
                const type = normalizeDimensionKey(item.tipo);
                return type === 'zona climatica' || type === 'zona climatica secundaria';
            });
            const biomeItems = items.filter(item => normalizeDimensionKey(item.tipo) === 'bioma');
            const habitatItems = items.filter(item => normalizeDimensionKey(item.tipo).includes('habitat'));
            const otherEnvironmentItems = items.filter(item => !climateItems.includes(item) && !biomeItems.includes(item) && !habitatItems.includes(item));
            const primaryClimate = climateItems.find(item => normalizeDimensionKey(item.tipo) === 'zona climatica');
            const primaryClimateValue = primaryClimate?.valorMin || primaryClimate?.valor || primaryClimate?.opcao || '';
            const climateBiomes = getClimateBiomeItems(primaryClimateValue, biomeItems);
            const remainingBiomes = biomeItems.filter(item => !climateBiomes.includes(item));

            return `
                <div class="info-section-card" id="${id}" style="${wrapperStyle}">
                    <h3 class="environment-section-heading"><span class="icon svg-icon">${getInfoSectionIconSvg('distribuicao')}</span><span class="environment-section-heading-title">Zona Climática, Biomas &amp; Habitats</span></h3>
                    <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px;">
                        ${renderClimateZoneEnvironmentCard(climateItems, biomeItems, filterContext)}
                        ${remainingBiomes.length ? `<div class="environment-subsection-heading">Biomas</div>${renderEnvironmentVisualCards(remainingBiomes.map(item => ({ ...item, isDimension: false })), filterContext)}` : ''}
                        ${otherEnvironmentItems.length ? renderEnvironmentVisualCards(otherEnvironmentItems.map(item => ({ ...item, isDimension: false })), filterContext) : ''}
                        ${habitatItems.length ? `<div class="environment-subsection-heading">Habitats</div>${renderEnvironmentVisualCards(habitatItems.map(item => ({ ...item, isDimension: false })), filterContext)}` : ''}
                    </div>
                </div>`;
        }

        function isGeneralEnvironmentModel(item = {}) {
            const type = normalizeDimensionKey(item.tipo || '');
            return type === 'zona climatica'
                || type === 'zona climatica secundaria'
                || type === 'bioma'
                || type === 'habitats'
                || type === 'habitat';
        }

        function getGeneralVisualModels(animalData = {}) {
            const models = Array.isArray(animalData.informacao?.geralDetalhada)
                ? [...animalData.informacao.geralDetalhada]
                : [];
            const curiosidades = animalData.informacao?.curiosidades || {};
            const legacyCommunication = Array.isArray(curiosidades.detalhes)
                ? curiosidades.detalhes.filter(item => normalizeDimensionKey(item?.tipo || '') === 'tipo de comunicacao' && String(item?.valor || item?.valorMin || '').trim())
                : [];
            if (curiosidades.tipoComunicacao && !legacyCommunication.some(item => (item.valor || item.valorMin) === curiosidades.tipoComunicacao)) {
                legacyCommunication.push({ tipo: 'Tipo de Comunicação', valor: curiosidades.tipoComunicacao, genero: 'MF', fase: 'Adulto' });
            }
            return [...models, ...legacyCommunication.map(item => ({ ...item, tipo: 'Tipo de Comunicação' }))];
        }

        function renderGeneralVisual(animalData) {
            const models = getGeneralVisualModels(animalData);
            const isEnv = isGeneralEnvironmentModel;
            const valid = collapseCombinedGenderItems(
                Array.isArray(models) ? models.filter(item => item.tipo && (item.valor || item.valorMin || item.valorMax) && !isEnv(item)) : []
            );
            const envItems = collapseCombinedGenderItems(
                Array.isArray(models) ? models.filter(item => item.tipo && (item.valor || item.valorMin || item.valorMax) && isEnv(item)) : []
            );
            
            const genders = collectConcreteGenders(valid);
            const phases = new Set(valid.map(i => i.fase).filter(Boolean));
            
            let html = '';
            if (valid.length) {
                const cardsHTML = renderVisualModelCards(
                    valid.map(item => ({ ...item, isDimension: false })),
                    { genders, phases }
                );

                html += `
                <div class="general-visual-card">
                    <div class="general-visual-title" style="display: flex; align-items: center; justify-content: space-between;">
                        <strong>Dados rápidos</strong>
                        ${getGenderTabsHTML(valid)}
                    </div>
                    <div class="general-visual-models">
                        ${cardsHTML}
                    </div>
                </div>`;
            }
            if (envItems.length) {
                html += renderEnvironmentSections(envItems, { genders, phases }, { id: 'general-environment-sections' });
            }
            return html;
        }

        function renderClimateZoneBadge(animalData) {
            const models = animalData.informacao?.geralDetalhada || [];
            const climateItem = Array.isArray(models) ? models.find(item => item.tipo && normalizeDimensionKey(item.tipo) === 'zona climatica') : null;
            if (!climateItem || !climateItem.valor) return '';

            const value = climateItem.valor;
            const climateMeta = getClimateZoneMeta(value);
            if (!climateMeta) return '';

            return `
                <div class="animal-climate-zone ${climateMeta.accent}">
                    <div class="climate-zone-info">
                        <span class="climate-zone-label">Zona Climática</span>
                        <span class="climate-zone-name">${escapeHtml(value)}</span>
                    </div>
                    <div class="climate-zone-divider"></div>
                    <img src="${climateMeta.image}" alt="Zona climática: ${escapeHtml(value)}" class="climate-zone-badge-image">
                </div>
            `;
        }

        function renderBiomaBadge(animalData) {
            const models = animalData.informacao?.geralDetalhada || [];
            const biomaItems = Array.isArray(models) ? models.filter(item => item.tipo && normalizeDimensionKey(item.tipo).includes('bioma')) : [];
            if (biomaItems.length === 0) return '';

            const contentHTML = biomaItems.map((item, idx) => {
                const value = item.valor || item.valorMin || '';
                const biomaMeta = getBiomaMeta(value);
                if (!biomaMeta) return '';

                return `
                    ${idx > 0 ? '<div class="climate-zone-divider" style="margin: 20px 0;"></div>' : '<div class="climate-zone-divider"></div>'}
                    <div class="climate-zone-info">
                        <span class="climate-zone-name">${escapeHtml(value)}</span>
                    </div>
                    <div class="climate-zone-divider"></div>
                    <img src="${biomaMeta.image}" alt="Bioma: ${escapeHtml(value)}" class="climate-zone-badge-image">
                `;
            }).filter(html => html !== '').join('');

            if (!contentHTML) return '';

            const firstValue = biomaItems[0].valor || biomaItems[0].valorMin || '';
            const firstMeta = getBiomaMeta(firstValue);
            const accentClass = firstMeta ? firstMeta.accent : '';

            return `
                <div class="animal-climate-zone animal-bioma-badge ${accentClass}">
                    <div class="climate-zone-info">
                        <span class="climate-zone-label">Bioma</span>
                    </div>
                    ${contentHTML}
                </div>
            `;
        }

        function renderDimensionsVisual(animalData) {
            const rawDimensions = animalData.informacao?.dimensoesDetalhadas || [];
            const filteredDimensions = rawDimensions.filter(item => item.tipo && (String(item.valor ?? '').trim() !== '' || String(item.valorMin ?? '').trim() !== '' || String(item.valorMax ?? '').trim() !== ''));
            const dimensions = collapseCombinedGenderItems(filteredDimensions);
            if (!Array.isArray(dimensions) || dimensions.length === 0) return '';

            const height = getDimensionByLabel(dimensions, ['Altura', 'Altura ao ombro']);
            const weight = getDimensionByLabel(dimensions, ['Peso']);
            const length = getDimensionByLabel(dimensions, ['Comprimento total', 'Comprimento do corpo', 'Envergadura']);
            const ordered = [...dimensions].sort((a, b) => getDimensionSortOrder(a) - getDimensionSortOrder(b));

            return `
                <div class="dimensions-visual-card">
                    <div class="general-visual-title" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; padding: 0 10px;">
                        <strong>Dados rápidos</strong>
                        ${getGenderTabsHTML(ordered)}
                    </div>
                    <div class="visual-stage">
                        ${height ? `<div class="visual-height"><span>${formatDimension(height, '')}</span></div>` : ''}
                        <div class="visual-icon">${getCategoryModelSvg(getFirstActiveCategory(animalData.categoria))}</div>
                        ${length ? `<div class="visual-length">${formatDimension(length, '')}</div>` : ''}
                    </div>
                    <div class="dimension-model-grid mobile-only">
                        ${ordered.map(renderDimensionModelCard).join('')}
                    </div>
                </div>`;
        }

        function renderDimensionsVisualOnlyStage(animalData) {
            const rawDimensions = animalData.informacao?.dimensoesDetalhadas || [];
            const dimensions = rawDimensions.filter(item => item.tipo && (String(item.valor ?? '').trim() !== '' || String(item.valorMin ?? '').trim() !== '' || String(item.valorMax ?? '').trim() !== ''));
            if (!Array.isArray(dimensions) || dimensions.length === 0) return '';

            const height = getDimensionByLabel(dimensions, ['Altura', 'Altura ao ombro']);
            const length = getDimensionByLabel(dimensions, ['Comprimento total', 'Comprimento do corpo', 'Envergadura']);

            return `
                <div class="dimensions-visual-card" style="border: none; background: transparent; padding: 0; box-shadow: none; margin-bottom: 0;">
                    <div class="visual-stage" style="margin-top: 15px;">
                        ${height ? `<div class="visual-height"><span>${formatDimension(height, '')}</span></div>` : ''}
                        <div class="visual-icon">${getCategoryModelSvg(getFirstActiveCategory(animalData.categoria))}</div>
                        ${length ? `<div class="visual-length">${formatDimension(length, '')}</div>` : ''}
                    </div>
                </div>`;
        }

        function normalizeFeedingAnimalLabel(label = '') {
            return String(label).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        function getFeedingAnimalOption(label = '') {
            const normalizedLabel = normalizeFeedingAnimalLabel(label);
            return feedingAnimalOptions.find(option => normalizeFeedingAnimalLabel(option.label) === normalizedLabel);
        }

        function groupFeedingItems(items = []) {
            const groups = new Map();

            items.forEach(item => {
                const type = item.tipo || 'Alimentação';
                const detail = (item.detalhe || '').trim();
                const animalOption = getFeedingAnimalOption(detail);

                if (!groups.has(type)) {
                    groups.set(type, { type, details: [], animals: [], foods: [], relationGroups: [] });
                }

                const group = groups.get(type);
                const relationAnimals = Array.isArray(item.animais) ? item.animais : [];
                const relationFoods = Array.isArray(item.alimentos) ? item.alimentos : [];
                if (relationAnimals.length || relationFoods.length) {
                    const relationTitle = String((item.detalhe || '').split(' | ')[0] || type).trim();
                    let relationGroup = group.relationGroups.find(entry => normalizeFeedingAnimalLabel(entry.title) === normalizeFeedingAnimalLabel(relationTitle));
                    if (!relationGroup) {
                        relationGroup = { title: relationTitle, animals: [], foods: [] };
                        group.relationGroups.push(relationGroup);
                    }
                    relationGroup.animals.push(...relationAnimals);
                    relationGroup.foods.push(...relationFoods);
                }
                (Array.isArray(item.animais) ? item.animais : []).forEach(animal => {
                    const key = animal.id || normalizeFeedingAnimalLabel(animal.nomeCientifico || animal.nome || '');
                    if (key && !group.animals.some(existing => (existing.id || normalizeFeedingAnimalLabel(existing.nomeCientifico || existing.nome || '')) === key)) group.animals.push(animal);
                });
                (Array.isArray(item.alimentos) ? item.alimentos : []).forEach(food => {
                    const key = food.id || normalizeFeedingAnimalLabel(food.nome || food);
                    if (key && !group.foods.some(existing => (existing.id || normalizeFeedingAnimalLabel(existing.nome || existing)) === key)) group.foods.push(food);
                });
                if (animalOption) {
                    if (!group.animals.some(existing => existing.label === animalOption.label)) {
                        group.animals.push(animalOption);
                    }
                } else if (detail && !group.details.includes(detail)) {
                    group.details.push(detail);
                }
            });

            return [...groups.values()];
        }

        function getFeedingNutritionMeta(type = '') {
            const normalized = normalizeDimensionKey(type);
            if (normalized.includes('tipo de alimentacao') || normalized.includes('tipo de alimentação')) {
                return { key: 'alimentacaoTipo', title: 'Tipo de Alimentação', accent: 'accent-food' };
            }
            if (normalized.includes('alimento ingerido')) {
                return { key: 'alimentoMedio', title: 'Alimento Ingerido em Média', accent: 'accent-meal' };
            }
            if (normalized.includes('agua bebida') || normalized.includes('água bebida')) {
                return { key: 'aguaMedia', title: 'Água bebida em Média', accent: 'accent-water' };
            }
            return null;
        }

        function getFeedingNutritionModelSvg(nutritionMeta) {
            return nutritionMeta
                ? getReproductionModelSvg(nutritionMeta.key)
                : getFeedingModelSvg('alimentacao');
        }

        function parseFeedingDetail(detail = '') {
            const raw = String(detail || '').trim();
            if (!raw) return { primary: '', secondary: '', display: '' };
            if (raw.includes(' | ')) {
                const [primary, ...rest] = raw.split(' | ');
                const secondary = rest.join(' | ').trim();
                return {
                    primary: primary.trim(),
                    secondary,
                    display: primary.trim()
                };
            }
            return { primary: raw, secondary: '', display: raw };
        }

        function renderFeedingTypeCard(group) {
            const nutritionMeta = getFeedingNutritionMeta(group.type);
            if (nutritionMeta && group.type === 'Tipo de Alimenta??o') {
                const entries = group.details
                    .map(parseFeedingDetail)
                    .filter(entry => entry.display)
                    .filter((entry, index, list) => list.findIndex(candidate => candidate.display === entry.display) === index);
                const firstEntry = entries[0] || { primary: '', secondary: '', display: '' };
                const heroIcon = getFeedingNutritionModelSvg(nutritionMeta);
                const valuesHtml = entries.length > 1
                    ? `
                        <div class="feeding-multi-value-list feeding-multi-value-list-visual">
                            ${entries.map(entry => {
                                const entryMeta = getFeedingVisualMeta(entry.primary || nutritionMeta.title);
                                return `
                                    <div class="feeding-multi-value-line feeding-multi-value-line-visual">
                                        <span class="feeding-multi-value-icon">${getFeedingModelSvg(entryMeta.key)}</span>
                                        <span class="feeding-multi-value-text">${escapeHtml(entry.display)}</span>
                                    </div>`;
                            }).join('')}
                        </div>`
                    : `<div class="dimension-model-label">${escapeHtml(firstEntry.display || 'Tipo de dieta')}</div>`;
                const secondaryHtml = entries.length === 1 && firstEntry.secondary
                    ? `<div class="dimension-model-meta">${escapeHtml(firstEntry.secondary)}</div>`
                    : '';
                return `
                    <article class="dimension-model-card feeding-model-card feeding-type-highlight-card ${nutritionMeta.accent}">
                        <div class="dimension-model-icon">${heroIcon}</div>
                        <div class="dimension-model-copy">
                            ${valuesHtml}
                            <div class="dimension-model-value">${nutritionMeta.title}</div>
                            ${secondaryHtml}
                        </div>
                    </article>`;
            }

            if (nutritionMeta) {
                const detailData = parseFeedingDetail(group.details[0] || '');
                const resolvedValue = detailData.display || group.details[0] || 'Modelo visual';
                return `
                    <article class="dimension-model-card feeding-model-card feeding-type-highlight-card ${nutritionMeta.accent}">
                        <div class="dimension-model-icon">${getReproductionModelSvg(nutritionMeta.key)}</div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-label">${escapeHtml(resolvedValue)}</div>
                            <div class="dimension-model-value">${nutritionMeta.title}</div>
                            ${detailData.secondary ? `<div class="dimension-model-meta">${escapeHtml(detailData.secondary)}</div>` : ''}
                        </div>
                    </article>`;
            }

            const meta = getFeedingVisualMeta(group.type);
            const detail = group.details[0] || feedingTypeDescriptions[group.type] || 'Modelo visual';
            return `
                <article class="dimension-model-card feeding-model-card feeding-type-highlight-card ${meta.accent}">
                    <div class="dimension-model-icon">${getFeedingModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${escapeHtml(detail)}</div>
                        <div class="dimension-model-value">${escapeHtml(meta.title)}</div>
                    </div>
                </article>`;
        }
        function renderFeedingAnimalCard(animal) {
            return `
                <article class="feeding-prey-card">
                    <img class="feeding-prey-image" src="${animal.src}" alt="${escapeHtml(animal.label)}" loading="lazy">
                    <div class="feeding-prey-name">${escapeHtml(animal.label)}</div>
                </article>`;
        }

        function renderFeedingGroup(group) {
            return `
                <div class="feeding-type-group">
                    ${renderFeedingTypeCardImproved(group)}
                </div>`;
        }

        function renderFeedingTypeCardImproved(group) {
            const nutritionMeta = getFeedingNutritionMeta(group.type);
            const normalizedType = normalizeDimensionKey(group.type);
            const rawDetails = Array.isArray(group.details) ? group.details : [];
            const entries = rawDetails
                .map(parseFeedingDetail)
                .filter(entry => entry.display)
                .filter((entry, index, list) => list.findIndex(candidate => candidate.display === entry.display) === index);

            if (normalizedType.includes('estrategia')) {
                return renderFeedingStrategyPopupCard(
                    entries.map(entry => ({
                        tipo: group.type,
                        detalhe: entry.display
                    }))
                );
            }

            if (nutritionMeta && normalizedType.includes('tipo de alimentacao')) {
                const entryTypes = entries.map(entry => entry.primary || entry.display).filter(Boolean);
                const fallbackTypes = Array.isArray(group.animals) ? group.animals.map(animal => animal.feedingType).filter(Boolean) : [];
                const selectedFeedingTypes = [...new Set((entryTypes.length ? entryTypes : fallbackTypes)
                    .map(value => String(value || '').trim())
                    .filter(Boolean))];
                const selectedFeedingTypesData = JSON.stringify(selectedFeedingTypes);
                const feedingRelationsData = JSON.stringify({ animals: group.animals || [], foods: group.foods || [], groups: group.relationGroups || [] });
                const firstEntry = entries[0] || { primary: '', secondary: '', display: '' };
                const firstTypeMeta = getFeedingVisualMeta(firstEntry.primary || '');
                const heroIcon = firstEntry.primary ? getFeedingModelSvg(firstTypeMeta.key) : getFeedingNutritionModelSvg(nutritionMeta);
                const listHtml = entries.length > 1
                    ? `
                        <div class="feeding-multi-value-list feeding-multi-value-list-visual">
                            ${entries.map(entry => {
                                const entryMeta = getFeedingVisualMeta(entry.primary || nutritionMeta.title);
                                return `
                                    <div class="feeding-multi-value-line feeding-multi-value-line-visual">
                                        <span class="feeding-multi-value-icon">${getFeedingModelSvg(entryMeta.key)}</span>
                                        <span class="feeding-multi-value-text">${escapeHtml(entry.display)}</span>
                                    </div>`;
                            }).join('')}
                        </div>`
                    : `<div class="dimension-model-label">${escapeHtml(firstEntry.display || 'Tipo de dieta')}</div>`;
                const secondaryHtml = entries.length === 1 && firstEntry.secondary
                    ? `<div class="dimension-model-meta">${escapeHtml(firstEntry.secondary)}</div>`
                    : '';

                return `
                    <button type="button" class="dimension-model-card feeding-model-card feeding-type-highlight-card feeding-type-popup-trigger ${nutritionMeta.accent}" data-feeding-type-popup data-feeding-types="${escapeHtml(selectedFeedingTypesData)}" data-feeding-relations="${escapeHtml(feedingRelationsData)}" aria-haspopup="dialog" aria-label="Ver o tipo de alimentação e os animais e alimentos associados" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                        <div class="dimension-model-icon">${heroIcon}</div>
                        <div class="dimension-model-copy">
                            ${listHtml}
                            <div class="dimension-model-value">${nutritionMeta.title}</div>
                            ${secondaryHtml}
                        </div>
                    </button>`;
            }

            if (nutritionMeta) {
                const detailData = parseFeedingDetail(rawDetails[0] || '');
                const resolvedValue = detailData.display || rawDetails[0] || 'Modelo visual';
                return `
                    <article class="dimension-model-card feeding-model-card feeding-type-highlight-card ${nutritionMeta.accent}">
                        <div class="dimension-model-icon">${getFeedingNutritionModelSvg(nutritionMeta)}</div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-label">${escapeHtml(resolvedValue)}</div>
                            <div class="dimension-model-value">${nutritionMeta.title}</div>
                            ${detailData.secondary ? `<div class="dimension-model-meta">${escapeHtml(detailData.secondary)}</div>` : ''}
                        </div>
                    </article>`;
            }

            const meta = getFeedingVisualMeta(group.type);
            const detail = rawDetails[0] || feedingTypeDescriptions[group.type] || 'Modelo visual';
            return `
                <article class="dimension-model-card feeding-model-card feeding-type-highlight-card ${meta.accent}">
                    <div class="dimension-model-icon">${getFeedingModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${escapeHtml(detail)}</div>
                        <div class="dimension-model-value">${escapeHtml(meta.title)}</div>
                    </div>
                </article>`;
        }

        function renderFeedingModelCard(item) {
            const type = item.tipo || '';
            const nutritionMeta = getFeedingNutritionMeta(type);
            if (nutritionMeta) {
                const detailData = parseFeedingDetail(item.detalhe || '');
                const resolvedValue = detailData.display || item.detalhe || feedingTypeDescriptions[type] || 'Modelo visual';
                const icon = type === 'Tipo de Alimenta??o'
                    ? getFeedingModelSvg(getFeedingVisualMeta(detailData.primary || resolvedValue).key)
                    : getReproductionModelSvg(nutritionMeta.key);
                return `
                    <article class="dimension-model-card feeding-model-card ${nutritionMeta.accent}">
                        <div class="dimension-model-icon">${icon}</div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-label">${escapeHtml(resolvedValue)}</div>
                            <div class="dimension-model-value">${nutritionMeta.title}</div>
                            ${detailData.secondary ? `<div class="dimension-model-meta">${escapeHtml(detailData.secondary)}</div>` : ''}
                        </div>
                    </article>`;
            }

            const meta = getFeedingVisualMeta(type);
            const detail = item.detalhe || feedingTypeDescriptions[type] || 'Modelo visual';
            const inlineGenderSymbol = renderInlineGenderSymbol(item);
            return `
                <article class="dimension-model-card feeding-model-card ${meta.accent}">
                    <div class="dimension-model-icon">${getFeedingModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${escapeHtml(detail)}</div>
                        <div class="dimension-model-value${inlineGenderSymbol ? ' with-gender' : ''}">${escapeHtml(meta.title)}${inlineGenderSymbol}</div>
                    </div>
                </article>`;
        }
        function renderFeedingStrategyCard(item) {
            const strategy = item.estrategia || item.tipo || '';
            const meta = getFeedingStrategyMeta(strategy);
            const detail = item.detalhe || feedingStrategyDescriptions[strategy] || 'Estratégia alimentar';
            return `
                <button type="button" class="dimension-model-card feeding-strategy-card feeding-type-popup-trigger feeding-strategy-popup-trigger ${meta.accent}" data-feeding-strategy-popup data-feeding-strategies="${escapeHtml(JSON.stringify([strategy]))}" aria-haspopup="dialog" aria-label="Ver as estratégias para obter alimentos e respetivas explicações" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                    <div class="dimension-model-icon">${getFeedingStrategySvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${escapeHtml(strategy)}</div>
                        <div class="dimension-model-value">${escapeHtml(detail)}</div>
                    </div>
                    <span class="feeding-strategy-popup-open-indicator" aria-hidden="true">&#8599;&#65038;</span>
                    </button>`;
        }

        function renderFeedingStrategyPopupCard(items = []) {
            const selectedStrategies = items
                .map(item => {
                    const normalizedItemType = normalizeDimensionKey(item.tipo);
                    const name = String(item.estrategia || (normalizedItemType.includes('estrategia')
                        ? item.valorMin || item.valor || item.detalhe
                        : item.tipo) || '').trim();
                    if (!name) return null;
                    const meta = getFeedingStrategyMeta(name);
                    return {
                        name,
                    detail: String(item.detalhe || feedingStrategyDescriptions[name] || 'Estratégia alimentar').trim(),
                        meta
                    };
                })
                .filter(Boolean)
                .filter((item, index, list) => list.findIndex(candidate => normalizeDimensionKey(candidate.name) === normalizeDimensionKey(item.name)) === index);
            if (!selectedStrategies.length) return '';

            const selectedNames = JSON.stringify(selectedStrategies.map(item => item.name));
            const heroIcon = selectedStrategies.length === 1
                ? getFeedingStrategySvg(selectedStrategies[0].meta.key)
                : getFeedingModelSvg('alimentacao');
            const valueHtml = selectedStrategies.length === 1
                ? `<div class="dimension-model-label">${escapeHtml(selectedStrategies[0].name)}</div><div class="dimension-model-value">Estratégia para obter alimentos</div>`
                : `<div class="feeding-multi-value-list feeding-multi-value-list-visual">${selectedStrategies.map(item => `
                    <div class="feeding-multi-value-line feeding-multi-value-line-visual">
                        <span class="feeding-multi-value-icon">${getFeedingStrategySvg(item.meta.key)}</span>
                        <span class="feeding-multi-value-text">${escapeHtml(item.name)}</span>
                    </div>`).join('')}</div><div class="dimension-model-value">Estratégias seleccionadas</div>`;

            return `
                <button type="button" class="dimension-model-card feeding-strategy-card feeding-type-popup-trigger feeding-strategy-popup-trigger ${selectedStrategies[0].meta.accent}" data-feeding-strategy-popup data-feeding-strategies="${escapeHtml(selectedNames)}" aria-haspopup="dialog" aria-label="Ver as estratégias para obter alimentos e respetivas explicações" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                    <div class="dimension-model-icon">${heroIcon}</div>
                    <div class="dimension-model-copy">
                        ${valueHtml}
                    </div>
                    <span class="feeding-strategy-popup-open-indicator" aria-hidden="true">&#8599;&#65038;</span>
                </button>`;
        }

        function renderFeedingVisual(animalData) {
            const feeding = animalData.informacao?.alimentacaoDetalhada || [];
            const valid = Array.isArray(feeding) ? feeding.filter(item => item.tipo || item.detalhe) : [];
            const strategies = animalData.informacao?.alimentacaoEstrategias || [];
            const validStrategies = Array.isArray(strategies) ? strategies.filter(item => item.estrategia || item.tipo || item.detalhe) : [];
            if (!valid.length && !validStrategies.length) return '';

            return `
                <div class="reproduction-visual-card feeding-animal-visual-card">
                    <div class="reproduction-model-grid feeding-model-grid">
                        ${groupFeedingItems(valid).map(renderFeedingGroup).join('')}
                        ${renderFeedingStrategyPopupCard(validStrategies)}
                    </div>
                </div>`;
        }

        function normalizeEcologyAnimalEntry(item = {}) {
            if (typeof item === 'string') {
                const raw = String(item || '').trim();
                return { id: raw, nome: raw, nomeCientifico: '' };
            }
            return {
                id: String(item.id || item.animalId || '').trim(),
                nome: String(item.nome || item.label || item.name || '').trim(),
                nomeCientifico: String(item.nomeCientifico || item.scientificName || '').trim()
            };
        }

        function getEcologyAnimalLabel(item = {}) {
            const normalized = normalizeEcologyAnimalEntry(item);
            if (normalized.nome && normalized.nomeCientifico) return `${normalized.nome} (${normalized.nomeCientifico})`;
            return normalized.nome || normalized.nomeCientifico || normalized.id || 'Animal';
        }

        function normalizeEcologyList(items = []) {
            const seen = new Set();
            return (Array.isArray(items) ? items : []).map(normalizeEcologyAnimalEntry).filter(item => {
                const key = `${item.id}|${item.nome}|${item.nomeCientifico}`;
                if (seen.has(key) || (!item.id && !item.nome && !item.nomeCientifico)) return false;
                seen.add(key);
                return true;
            });
        }

        function normalizeEcologyLabel(value = '') {
            return String(value || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, ' ')
                .trim();
        }

        function getEcologyVisualConfig(tipo = '') {
            const normalized = normalizeEcologyLabel(tipo);
            return ecologyBlockConfigs.find(entry => normalizeEcologyLabel(entry.label) === normalized)
                || ecologyBlockConfigs.find(entry => normalizeEcologyLabel(entry.key) === normalized)
                || { key: 'funcaoEcologica', label: tipo || 'Ecologia', accent: 'accent-bioma' };
        }

        function renderEcologyBlockCard(title, value, icon, accent, meta = '', popupFunctions = []) {
            const isInteractive = popupFunctions.length > 0;
            const tagName = isInteractive ? 'button' : 'article';
            const interactiveClass = isInteractive ? ' ecology-function-popup-trigger' : '';
            const interactiveAttributes = isInteractive
                ? ` type="button" data-ecology-function-popup data-ecology-functions="${escapeHtml(JSON.stringify(popupFunctions))}" aria-haspopup="dialog" aria-label="Ver as funções ecológicas e respetivas explicações" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;"`
                : '';
            return `
                <${tagName} class="dimension-model-card ecology-model-card ${accent}${interactiveClass}"${interactiveAttributes}>
                    <div class="dimension-model-icon">${icon}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${escapeHtml(value)}</div>
                        <div class="dimension-model-value">${escapeHtml(title)}</div>
                        ${meta ? `<div class="dimension-model-meta">${meta}</div>` : ''}
                    </div>
                </${tagName}>
            `;
        }

        function renderEcologyRelationCard(config, refs = [], freeText = '') {
            const validRefs = normalizeEcologyList(refs);
            const isInteractive = validRefs.length > 0;
            const tagName = isInteractive ? 'button' : 'article';
            const interactiveClass = isInteractive ? ' ecology-relation-popup-trigger' : '';
            const interactiveAttributes = isInteractive
                ? ` type="button" data-ecology-relations="${escapeHtml(JSON.stringify(validRefs))}" data-ecology-relation-key="${escapeHtml(config.key)}" data-ecology-relation-title="${escapeHtml(config.label)}" aria-haspopup="dialog" aria-label="Ver ${escapeHtml(config.label.toLowerCase())}"`
                : '';
            const countLabel = validRefs.length
                ? `${validRefs.length} ${validRefs.length === 1 ? 'animal' : 'animais'}`
                : (freeText || 'Por preencher');
            const metaHtml = freeText && validRefs.length
                ? `<div class="dimension-model-meta">${escapeHtml(freeText)}</div>`
                : '';
            return `
                <${tagName} class="dimension-model-card ecology-model-card ${config.accent}${interactiveClass}"${interactiveAttributes}>
                    <div class="dimension-model-icon">${getEcologyBlockSvg(config.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${escapeHtml(countLabel)}</div>
                        <div class="dimension-model-value">${escapeHtml(config.label)}</div>
                        ${metaHtml}
                    </div>
                </${tagName}>
            `;
        }

        function isValidEcologyDetail(item = {}) {
            const type = item?.tipo || '';
            if (!type) return false;
            if (type === 'Função Ecológica') return Boolean(String(item.valor || item.detalhe || '').trim());
            const animals = normalizeEcologyList(item.animais || item.animalIds || []);
            const text = String(item.texto || item.detalhe || '').trim();
            return animals.length > 0 || (type === 'Ameaças naturais' && Boolean(text));
        }

        function renderEcologyVisual(animalData) {
            const ecology = animalData.informacao?.ecologia || {};
            const ecologyText = String(ecology.resumo || ecology.texto || '').trim();
            const detailItems = Array.isArray(ecology.detalhes)
                ? ecology.detalhes.filter(isValidEcologyDetail)
                : [];

            const legacyItems = [];
            const functionValue = ecology.funcaoEcologica || ecology.funcao || '';
            if (String(functionValue).trim()) {
                legacyItems.push({ tipo: 'Função Ecológica', valor: functionValue });
            }

            const legacyMap = [
                ['Predadores naturais', ecology.predadoresNaturais || ecology.predadores || []],
                ['Presas', ecology.presas || []],
                ['Competidores', ecology.competidores || []],
                ['Ameaças naturais', ecology.ameacasNaturais || ecology.ameacas || [], ecology.ameacasNaturaisTexto || ecology.ameacasTexto || ''],
                ['Relações Simbióticas', ecology.relacoesSimbioticas || ecology.relacoes || []]
            ];
            legacyMap.forEach(([tipo, animais, texto = '']) => {
                const refs = normalizeEcologyList(animais || []);
                const freeText = String(texto || '').trim();
                if (refs.length || (tipo === 'Ameaças naturais' && freeText)) {
                    legacyItems.push({ tipo, animais: refs, texto: freeText });
                }
            });

            const itemsToRender = detailItems.length ? detailItems : legacyItems;
            if (!itemsToRender.length && !ecologyText) return '';

            const selectedEcologicalFunctions = [...new Set(itemsToRender
                .filter(item => normalizeDimensionKey(item.tipo) === 'funcao ecologica')
                .map(item => item.valor || item.detalhe || '')
                .map(value => String(value).trim())
                .filter(Boolean))];

            const cards = itemsToRender.map(item => {
                if (normalizeDimensionKey(item.tipo) === 'funcao ecologica') {
                    const value = item.valor || item.detalhe || '';
                    const functionMeta = getEcologicalFunctionMeta(value || '');
                    return renderEcologyBlockCard(
                        'Função Ecológica',
                        value,
                        getEcologicalFunctionSvg(functionMeta.key),
                        functionMeta.accent,
                        '',
                        selectedEcologicalFunctions
                    );
                }

                const config = getEcologyVisualConfig(item.tipo);
                const refs = normalizeEcologyList(item.animais || item.animalIds || []);
                const freeText = String(item.texto || item.detalhe || '').trim();
                return renderEcologyRelationCard(config, refs, freeText);
            });

            return `
                <div class="reproduction-visual-card ecology-visual-card">
                    ${cards.length ? `
                    <div class="reproduction-model-grid ecology-model-grid">
                        ${cards.join('')}
                    </div>` : ''}
                    ${ecologyText ? `<p style="margin-top: 16px; line-height: 1.6;">${escapeHtml(ecologyText)}</p>` : ''}
                </div>`;
        }
        
        function getReproductionVisualMeta(type = '') {
            const normalized = normalizeDimensionKey(type);
            if (normalized.includes('investimento parental')) return { key: 'investimentoParental', title: type || 'Investimento Parental', accent: 'accent-parental-investment' };
            if (normalized.includes('acasalamento')) return { key: 'acasalamento', title: type || 'Acasalamento', accent: 'accent-generic' };
            if (normalized.includes('cria') || normalized.includes('filhote')) return { key: 'cuidado', title: type || 'Número de Crias', accent: 'accent-tail' };
            if (normalized.includes('duracao do estro')) return { key: 'duracaoEstro', title: type || 'Duração do estro', accent: 'accent-mating-polygamy' };
            if (normalized.includes('sistema sexual')) return { key: 'sistemaSexual', title: type || 'Sistema sexual', accent: 'accent-width' };
            if (normalized.includes('frequencia de acasalamento durante o estro')) return { key: 'frequenciaAcasalamentoEstro', title: type || 'Frequência de acasalamento durante o estro', accent: 'accent-speed-average' };
            if (normalized.includes('taxa de sucesso reprodutivo')) return { key: 'taxaSucessoReprodutivo', title: type || 'Taxa de sucesso reprodutivo', accent: 'accent-life' };
            if (normalized.includes('intervalo entre nascimentos')) return { key: 'intervaloNascimentos', title: type || 'Intervalo entre nascimentos', accent: 'accent-maturity' };
            if (normalized.includes('idade da metamorfose')) return { key: 'idadeMetamorfose', title: type || 'Idade da metamorfose', accent: 'accent-wing' };
            if (normalized.includes('numero de mudas')) return { key: 'numeroMudas', title: type || 'Número de mudas', accent: 'accent-tail' };
            if (normalized.includes('numero de estadios larvais')) return { key: 'numeroEstadiosLarvais', title: type || 'Número de estádios larvais', accent: 'accent-egg' };
            if (normalized.includes('gestacao') || normalized.includes('gestação') || normalized.includes('gravidez') || normalized.includes('tempo')) return { key: 'gestacao', title: type || 'Gestação', accent: 'accent-weight' };
            if (normalized.includes('oviparo') || normalized.includes('ovo')) return { key: 'ovo', title: type || 'Ovíparo', accent: 'accent-egg' };
            if (normalized.includes('viviparo') || normalized.includes('placental')) return { key: 'viviparo', title: type || 'Vivíparo', accent: 'accent-weight' };
            if (normalized.includes('marsupial')) return { key: 'marsupial', title: type || 'Marsupial', accent: 'accent-tail' };
            if (normalized.includes('larvar') || normalized.includes('metamorfose') || normalized.includes('girino') || normalized.includes('ninfa') || normalized.includes('pupa')) return { key: 'metamorfose', title: type || 'Metamorfose', accent: 'accent-wing' };
            if (normalized.includes('fertilizacao') || normalized.includes('sexuada') || normalized.includes('sexos separados')) return { key: 'fertilizacao', title: type || 'Fertilização', accent: 'accent-length' };
            if (normalized.includes('hermafrodita') || normalized.includes('partenogenese')) return { key: 'hermafrodita', title: type || 'Hermafrodita', accent: 'accent-width' };
            if (normalized.includes('divisao') || normalized.includes('assexuada') || normalized.includes('brotamento') || normalized.includes('conjugacao') || normalized.includes('multiplicacao') || normalized.includes('esporulacao') || normalized.includes('fragmentacao') || normalized.includes('regeneracao')) return { key: 'celular', title: type || 'Reprodução celular', accent: 'accent-generic' };
            if (normalized.includes('fossil') || normalized.includes('provavel') || normalized.includes('desconhecido') || normalized.includes('estimado')) return { key: 'fossil', title: type || 'Estimado', accent: 'accent-beak' };
            if (normalized.includes('parental') || normalized.includes('ninho') || normalized.includes('nidicola') || normalized.includes('nidifugo') || normalized.includes('saco')) return { key: 'cuidado', title: type || 'Cuidado parental', accent: 'accent-leg' };
            return { key: 'reproducao', title: type || 'Reprodução', accent: 'accent-generic' };
        }

        function getReproductionModelSvg(key = 'reproducao') {
            const icons = {
                idadeMetamorfose: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="22" cy="25" r="8"/><path d="M17 51c9-17 24-24 42-17"/><path d="M53 27l9 8l-10 5"/><path d="M43 55c6 9 16 11 24 4"/><path d="M50 64l-8 5"/></svg>`,
                numeroMudas: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M19 40c0-13 9-23 21-23s21 10 21 23s-9 23-21 23S19 53 19 40Z"/><path d="M28 30c8 7 16 7 24 0"/><path d="M28 50c8-7 16-7 24 0"/><path d="M40 17v46"/></svg>`,
                numeroEstadiosLarvais: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="18" cy="40" r="6"/><circle cx="34" cy="40" r="8"/><circle cx="54" cy="40" r="10"/><path d="M24 40h2M42 40h2"/><path d="M62 32l8 8l-8 8"/></svg>`,
                sistemaSexual: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="27" cy="28" r="12"/><path d="M27 40v23M18 52h18"/><circle cx="54" cy="50" r="12"/><path d="M62 42l10-10M64 32h8v8"/></svg>`,
                duracaoEstro: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M24 18h32v44H24V18Z"/><path d="M24 30h32"/><path d="M32 12v12M48 12v12"/><path d="M33 46c0-5 3-9 7-9s7 4 7 9s-3 10-7 15c-4-5-7-10-7-15Z"/><path d="M17 67h46"/></svg>`,
                frequenciaAcasalamentoEstro: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 42c8-14 18-21 30-21c8 0 14 3 19 9"/><path d="M18 55c8-10 17-15 28-15c9 0 16 4 21 11"/><path d="M18 29h9M14 35h13M22 22h8"/><circle cx="57" cy="27" r="8"/><path d="M57 19v16M49 27h16"/></svg>`,
                taxaSucessoReprodutivo: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="40" r="27"/><path d="M25 55l30-30"/><circle cx="29" cy="29" r="5"/><circle cx="51" cy="51" r="5"/><path d="M31 42l7 7l13-16"/></svg>`,
                intervaloNascimentos: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M18 20h44v42H18V20Z"/><path d="M18 32h44"/><path d="M29 13v14M51 13v14"/><circle cx="31" cy="46" r="6"/><circle cx="51" cy="46" r="6"/><path d="M37 46h8"/><path d="M41 42l4 4l-4 4"/></svg>`,
                gestacao: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M22 26h36v36H22V26Z"/><path d="M22 38h36"/><path d="M31 16v10"/><path d="M49 16v10"/><circle cx="40" cy="50" r="7"/><path d="M40 46v4h4"/></svg>`,
                ovo: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 10c13 0 23 17 23 33c0 15-9 27-23 27S17 58 17 43C17 27 27 10 40 10Z"/><path d="M29 47c7 5 15 5 22 0"/></svg>`,
                viviparo: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 12c15 12 24 24 24 38c0 13-10 22-24 22S16 63 16 50c0-14 9-26 24-38Z"/><circle cx="40" cy="48" r="12"/><path d="M40 36v-9"/></svg>`,
                marsupial: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M20 62c2-26 13-43 33-48c9 9 13 19 11 32c-2 13-11 22-26 27"/><path d="M28 48c7 12 20 14 31 3"/><circle cx="42" cy="51" r="6"/></svg>`,
                metamorfose: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M17 54c12-18 29-23 46-14"/><path d="M57 34l8 8l-10 4"/><circle cx="25" cy="25" r="8"/><path d="M43 59c5 9 15 10 22 3"/><path d="M49 65l-8 5"/></svg>`,
                fertilizacao: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="28" cy="39" r="13"/><circle cx="52" cy="39" r="13"/><path d="M40 25v28"/><path d="M26 63h28"/></svg>`,
                hermafrodita: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="40" cy="34" r="15"/><path d="M40 49v21"/><path d="M29 60h22"/><path d="M50 24l14-14"/><path d="M54 10h10v10"/></svg>`,
                celular: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><circle cx="30" cy="40" r="18"/><circle cx="50" cy="40" r="18"/><path d="M40 23v34"/><circle cx="30" cy="40" r="4"/><circle cx="50" cy="40" r="4"/></svg>`,
                fossil: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M19 59c12-25 31-39 52-42c-3 22-17 39-42 52L19 59Z"/><path d="M31 56L58 29"/><path d="M23 67h35"/></svg>`,
                cuidado: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M14 43c6-16 18-25 36-24c11 1 20 7 25 17"/><path d="M21 47c8 13 20 20 36 20"/><circle cx="39" cy="47" r="8"/><path d="M55 35l12-4"/></svg>`,
                investimentoParental: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M17 48c5-14 15-22 29-22c13 0 23 8 28 22"/><path d="M22 52c7 11 17 17 31 17c10 0 18-4 24-12"/><circle cx="39" cy="43" r="8"/><path d="M39 35V22"/><path d="M30 22h18"/><path d="M16 32c5-8 12-12 21-12"/><path d="M64 32c-5-8-12-12-21-12"/></svg>`,
                alimentacaoTipo: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M22 20c13 0 23 8 23 21c0 12-9 20-23 20V20Z"/><path d="M48 23c8 3 13 10 13 19s-5 16-13 19"/><path d="M18 38h44"/><path d="M29 31c3 5 3 13 0 18"/></svg>`,
                alimentoMedio: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M24 28h32l-4 35H28L24 28Z"/><path d="M20 28h40"/><path d="M31 28c0-8 18-8 18 0"/><path d="M33 43h14"/><path d="M33 53h10"/></svg>`,
                aguaMedia: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 10c12 16 22 29 22 42c0 12-9 20-22 20S18 64 18 52c0-13 10-26 22-42Z"/><path d="M30 55c4 6 11 8 18 4"/><path d="M50 27c7 9 10 16 9 24"/></svg>`,
                reproducao: `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M40 13c15 0 27 12 27 27S55 67 40 67S13 55 13 40S25 13 40 13Z"/><path d="M40 25v30"/><path d="M25 40h30"/></svg>`
            };
            return icons[key] || icons.reproducao;
        }

        function renderReproductionModelCard(item, animalData = {}, popupMatingSystems = [], popupSexualSystems = []) {
            const egg = hasCategory(animalData.categoria, 'Aves') ? getBirdEggVisualByLabel(item.tipo) : null;
            const inlineGenderSymbol = renderInlineGenderSymbol(item);
            if (isParentalInvestmentItem(item)) {
                return renderParentalInvestmentGroupCard({
                    stage: getParentalStageValue(item) || 'Fase não definida',
                    items: [item]
                });
            }
            if (egg) {
                return `
                    <article class="dimension-model-card reproduction-model-card bird-egg-selected-card">
                        <div class="bird-egg-selected-image"><img src="${egg.image}" alt="Ovo ${escapeHtml(egg.label)}" loading="lazy"></div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-label${inlineGenderSymbol ? ' with-gender' : ''}">${escapeHtml(item.detalhe || egg.average)}${inlineGenderSymbol}</div>
                            <div class="dimension-model-value">${escapeHtml(egg.label)}</div>
                        </div>
                    </article>`;
            }

            const sexualValue = normalizeDimensionKey(item.tipo || '').includes('sistema sexual')
                ? (item.detalhe || item.valor || '')
                : '';
            if (sexualValue) {
                const isInteractive = popupSexualSystems.length > 0 && sexualSystems.some(system => normalizeDimensionKey(system) === normalizeDimensionKey(sexualValue));
                const cardTag = isInteractive ? 'button' : 'article';
                const interactiveClass = isInteractive ? ' sexual-system-popup-trigger' : '';
                const interactiveAttributes = isInteractive
                    ? ` type="button" data-sexual-system-popup data-sexual-systems="${escapeHtml(JSON.stringify(popupSexualSystems))}" aria-haspopup="dialog" aria-controls="sexual-system-modal" aria-label="Ver as opções de sistema sexual"`
                    : '';
                return `
                <${cardTag} class="dimension-model-card reproduction-model-card accent-width${interactiveClass}"${interactiveAttributes}>
                    <div class="dimension-model-icon">${getReproductionModelSvg('sistemaSexual')}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${escapeHtml(sexualValue)}</div>
                        <div class="dimension-model-value">Sistema Sexual</div>
                    </div>
                </${cardTag}>`;
            }

            const matingValue = normalizeDimensionKey(item.tipo || '').includes('acasalamento')
                ? (item.detalhe || '')
                : (getMatingMeta(item.tipo || '').key !== 'acasalamento' ? (item.tipo || '') : '');
            if (matingValue) {
                const meta = getMatingMeta(matingValue);
                const isInteractive = popupMatingSystems.length > 0 && matingSystems.some(system => normalizeDimensionKey(system) === normalizeDimensionKey(matingValue));
                const cardTag = isInteractive ? 'button' : 'article';
                const interactiveClass = isInteractive ? ' mating-system-popup-trigger' : '';
                const interactiveAttributes = isInteractive
                    ? ` type="button" data-mating-system-popup data-mating-systems="${escapeHtml(JSON.stringify(popupMatingSystems))}" aria-haspopup="dialog" aria-controls="mating-system-modal" aria-label="Ver as opções de acasalamento"`
                    : '';
                return `
                <${cardTag} class="dimension-model-card reproduction-model-card ${meta.accent}${interactiveClass}"${interactiveAttributes}>
                    <div class="dimension-model-icon">${getMatingSystemSvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label${inlineGenderSymbol ? ' with-gender' : ''}">${escapeHtml(matingValue)}${inlineGenderSymbol}</div>
                        <div class="dimension-model-value">Acasalamento</div>
                    </div>
                </${cardTag}>`;
            }

            const meta = getReproductionVisualMeta(item.tipo);
            const detail = (item.detalhe || '').trim();
            const label = detail ? meta.title : 'Tipo de Reprodu\u00e7\u00e3o';
            const value = detail || meta.title;
            return `
                <article class="dimension-model-card reproduction-model-card ${meta.accent}">
                    <div class="dimension-model-icon">${getReproductionModelSvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label${inlineGenderSymbol ? ' with-gender' : ''}">${escapeHtml(value)}${inlineGenderSymbol}</div>
                        <div class="dimension-model-value">${escapeHtml(label)}</div>
                    </div>
                </article>`;
        }
        function renderReproductionVisual(animalData) {
            const reproduction = [
                ...(animalData.informacao?.reproducaoDetalhada || []),
                ...getLegacyGeneralMatingReproductionItems(animalData.informacao?.geralDetalhada || [])
            ];
            const valid = Array.isArray(reproduction) ? reproduction.filter(item => {
                if (!item || !item.tipo) return false;
                const normalized = normalizeDimensionKey(item.tipo);
                if (normalized === 'investimento parental') {
                    return Boolean(String(item.etapa || '').trim()) || Boolean(String(item.cuidado || '').trim()) || Boolean(String(item.responsavel || '').trim());
                }
                if (normalized === 'tipo de reproducao') {
                    return Boolean(String(item.detalhe || '').trim());
                }
                if (hasCategory(animalData.categoria, 'Aves') && getBirdEggVisualByLabel(item.tipo)) {
                    return true;
                }
                return Boolean(String(item.detalhe || '').trim()) || 
                       Boolean(String(item.valor || '').trim()) || 
                       Boolean(String(item.valorMin || '').trim()) || 
                       Boolean(String(item.valorMax || '').trim());
            }) : [];
            if (!valid.length) return '';

            const selectedMatingSystems = [...new Set(valid.flatMap(item => {
                const type = String(item.tipo || '').trim();
                const normalizedType = normalizeDimensionKey(type);
                if (normalizedType.includes('acasalamento')) {
                    return [String(item.detalhe || item.valor || '').trim()];
                }
                return matingSystems.some(system => normalizeDimensionKey(system) === normalizedType) ? [type] : [];
            }).filter(value => value && matingSystems.some(system => normalizeDimensionKey(system) === normalizeDimensionKey(value))))];
            const selectedSexualSystems = [...new Set(valid.flatMap(item => {
                const type = String(item.tipo || '').trim();
                if (!normalizeDimensionKey(type).includes('sistema sexual')) return [];
                return [String(item.detalhe || item.valor || '').trim()];
            }).filter(value => value && sexualSystems.some(system => normalizeDimensionKey(system) === normalizeDimensionKey(value))))];

            const parentalItems = valid.filter(isParentalInvestmentItem);
            const regularItems = valid.filter(item => !isParentalInvestmentItem(item));
            const cards = [
                ...regularItems.map(item => renderReproductionModelCard(item, animalData, selectedMatingSystems, selectedSexualSystems)),
                ...groupParentalInvestmentItems(parentalItems).map(renderParentalInvestmentGroupCard)
            ].join('');

            return `
                <div class="reproduction-visual-card">
                    <div class="reproduction-model-grid">
                        ${cards}
                    </div>
                </div>`;
        }
        

        const birdEggVisuals = [
            { label: 'Branco', image: 'assets/ovos/ovo_branco.png', average: '2-5 ovos' },
            { label: 'Creme', image: 'assets/ovos/ovo_creme.png', average: '2-5 ovos' },
            { label: 'Bege salpicado', image: 'assets/ovos/ovo_bege_salpicado.png', average: '2-5 ovos' },
            { label: 'Castanho', image: 'assets/ovos/ovo_castanho.png', average: '2-5 ovos' },
            { label: 'Azul claro', image: 'assets/ovos/ovo_azul_claro.png', average: '2-5 ovos' },
            { label: 'Azul-esverdeado', image: 'assets/ovos/ovo_azul_esverdeado_salpicado.png', average: '2-5 ovos' },
            { label: 'Manchado', image: 'assets/ovos/ovo_manchado_escuro.png', average: '2-5 ovos' },
            { label: 'Camuflado', image: 'assets/ovos/ovo_camuflado_moteado.png', average: '2-5 ovos' }
        ];

        function getBirdEggVisualByLabel(label = '') {
            return birdEggVisuals.find(egg => egg.label === label);
        }

        const bodyCoveringTitles = {
            Aves: 'Plumagem', Mamiferos: 'Pelagem', Peixes: 'Escamas e coloração', Repteis: 'Escamas e coloração',
            Anfibios: 'Pele e coloração', Insetos: 'Exoesqueleto e coloração', Aracnideos: 'Exoesqueleto e coloração',
            Crustaceos: 'Carapaça e coloração', Moluscos: 'Concha, pele e coloração', Vermes: 'Pele e revestimento',
            Microscopicos: 'Revestimento corporal'
        };
        const bodyCoveringIcons = {
            Aves:'fa-feather-pointed', Mamiferos:'fa-paw', Peixes:'fa-fish-fins', Repteis:'fa-dragon', Anfibios:'fa-frog',
            Insetos:'fa-bug', Aracnideos:'fa-spider', Crustaceos:'fa-shrimp', Moluscos:'fa-shell', Vermes:'fa-wave-square', Microscopicos:'fa-microscope'
        };
        const bodyCoveringTypeIcons = {
            'Penugem':'fa-cloud','Plumagem juvenil':'fa-egg','Plumagem adulta':'fa-feather','Plumagem nupcial':'fa-heart','Plumagem de eclipse':'fa-moon','Plumagem de inverno':'fa-snowflake','Plumagem de verão':'fa-sun','Plumagem de camuflagem':'fa-leaf','Plumagem ornamental':'fa-gem','Plumagem impermeável':'fa-droplet','Plumagem sexualmente dimórfica':'fa-venus-mars','Rémiges':'fa-plane','Retrizes':'fa-arrows-left-right','Tectrizes':'fa-shield-halved','Semiplumas':'fa-wind','Filoplumas':'fa-lines-leaning','Cerdas':'fa-grip-lines',
            'Pelagem curta':'fa-scissors','Pelagem longa':'fa-wave-square','Pelagem densa':'fa-layer-group','Pelagem lanosa':'fa-cloud','Pelagem impermeável':'fa-umbrella','Pelagem sazonal':'fa-arrows-rotate','Pelagem de camuflagem':'fa-leaf','Pelagem com riscas':'fa-bars','Pelagem com manchas':'fa-circle-dot','Pelo liso':'fa-minus','Pelo ondulado':'fa-water','Pelo encaracolado':'fa-hurricane','Pelo áspero':'fa-grip-lines','Subpelo isolante':'fa-temperature-half','Vibrissas':'fa-lines-leaning','Espinhos modificados':'fa-burst','Sem pelo aparente':'fa-ban',
            'Escamas placoides':'fa-tooth','Escamas ganoides':'fa-gem','Escamas cicloides':'fa-circle-notch','Escamas ctenoides':'fa-fan','Escamas reduzidas':'fa-compress','Sem escamas':'fa-ban','Pele mucosa':'fa-droplet','Placas dérmicas':'fa-shield','Dentículos dérmicos':'fa-teeth','Bioluminescência':'fa-lightbulb','Coloração iridescente':'fa-wand-magic-sparkles','Mudança de cor':'fa-palette',
            'Pele lisa':'fa-circle','Pele rugosa':'fa-braille','Pele granulosa':'fa-grip','Pele húmida':'fa-droplet','Pele verrugosa':'fa-circle-nodes','Pele translúcida':'fa-eye','Glândulas mucosas':'fa-water','Glândulas de veneno':'fa-flask','Dobras cutâneas':'fa-wave-square','Tubérculos':'fa-circle-dot','Coloração aposemática':'fa-triangle-exclamation',
            'Exoesqueleto rígido':'fa-shield-halved','Exoesqueleto flexível':'fa-link','Exoesqueleto quitinoso':'fa-shield','≥ litros':'fa-door-closed','Cutícula cerosa':'fa-droplet','Muda do exoesqueleto':'fa-arrows-rotate','Cerdas sensoriais':'fa-satellite-dish','Espinhos':'fa-burst','Placas':'fa-table-cells','Brilho metálico':'fa-bolt','Pelos urticantes':'fa-fire','Carapaça calcificada':'fa-gem','Carapaça rígida':'fa-shield','Carapaça flexível':'fa-link','Exoesqueleto segmentado':'fa-layer-group','Muda da carapaça':'fa-arrows-rotate','Pinças especializadas':'fa-scissors',
            'Manchas':'fa-circle-dot',
            'Concha univalve':'fa-circle-notch','Concha bivalve':'fa-book-open','Concha espiral':'fa-hurricane','Concha interna':'fa-circle-half-stroke','Sem concha externa':'fa-ban','Manto':'fa-sheet-plastic','Cromatóforos':'fa-palette','Pele segmentada':'fa-grip-lines','Cutícula':'fa-layer-group','Pele ciliada':'fa-lines-leaning','Anéis corporais':'fa-ring','Membrana celular':'fa-circle','Película':'fa-circle-notch','Parede externa':'fa-border-all','Cápsula':'fa-capsules','Carapaça microscópica':'fa-shield','Cílios':'fa-lines-leaning','Flagelos':'fa-wave-square','Pseudópodes':'fa-hand','Espículas':'fa-burst'
        };

        const bodyCoveringGroupLabels = {
            cor_plumagem:'Cor da plumagem', cor_pelagem:'Cor da pelagem', cor_escamas:'Cor das escamas',
            cor_pele:'Cor da pele', cor_carapaca:'Cor da carapaça', cor_exoesqueleto:'Cor do exoesqueleto',
            cor_concha:'Cor da concha', cor_manto:'Cor do manto', cor_penas_ornamentais:'Cor das penas ornamentais',
            cor_barbatanas:'Cor das barbatanas', cor_asas:'Cor das asas', cor_ventre:'Cor do ventre',
            cor_dorso:'Cor do dorso', cor_cabeca:'Cor da cabeça', cor_membros:'Cor dos membros', cor_cauda:'Cor da cauda',
            manchas:'Manchas'
        };

        const bodyCoveringColorMap = {
            'Preto':'#111111','Branco':'#fcfcfc','Cinzento':'#8c8c8c','Castanho':'#6b4423','Bege':'#e8d8c8','Creme':'#fffbcf',
            'Amarelo':'#ffd000','Dourado':'#d4af37','Laranja':'#ff7700','Vermelho':'#e01b1b','Rosa':'#ff94b8',
            'Azul':'#1a5fb4','Verde':'#2ec27e','Roxo':'#9141ac','Prateado':'#c0c0c0'
        };

        function getAnimalPrimaryCategory(animalData={}) {
            const raw = animalData.categoria;
            if (Array.isArray(raw)) return raw.find(c => bodyCoveringTitles[c]) || raw[0] || 'Microscopicos';
            return bodyCoveringTitles[raw] ? raw : 'Microscopicos';
        }
        function getBodyCoveringTitle(animalData={}) { return bodyCoveringTitles[getAnimalPrimaryCategory(animalData)] || 'Revestimento corporal'; }
        function getPlumageVisualMeta(type = '', group = '', animalData={}) {
            const category = getAnimalPrimaryCategory(animalData);
            return { label: type || getBodyCoveringTitle(animalData), group: bodyCoveringGroupLabels[group] || group || getBodyCoveringTitle(animalData), icon: bodyCoveringTypeIcons[type] || (String(group).startsWith('cor_') || group === 'cor' ? 'fa-palette' : bodyCoveringIcons[category]), description: 'Característica do revestimento corporal.' };
        }
        function escapeBodyCoveringSvgText(value = '') {
            return String(value || '').replace(/[&<>"']/g, char => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            }[char]));
        }

        function getBodyCoveringModelColors(type = '', group = '') {
            const normalized = String(type || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const namedColors = {
                preto: '#20242d', branco: '#f4f2ea', cinzento: '#8a9099', castanho: '#8a5a3b', bege: '#d8c3a5',
                amarelo: '#f4c542', laranja: '#e8792e', vermelho: '#d94b4b', rosa: '#dd7fa5', verde: '#4f9d69',
                azul: '#3978c5', roxo: '#7554a8', dourado: '#d8aa34', translucida: '#9fd8dc', translucido: '#9fd8dc',
                incolor: '#dfe8ea', multicolor: '#9a6bd2', metalica: '#84919f', iridescente: '#7a8fe8'
            };
            const direct = namedColors[normalized];
            if (direct) return { primary: direct, secondary: normalized === 'branco' ? '#b9bec7' : '#ffffff', accent: '#6d4aff' };
            let hash = 0;
            for (const char of `${group}:${type}`) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
            const hue = Math.abs(hash) % 360;
            return {
                primary: `hsl(${hue} 64% 43%)`,
                secondary: `hsl(${(hue + 42) % 360} 70% 63%)`,
                accent: `hsl(${(hue + 205) % 360} 72% 48%)`
            };
        }

        function renderBodyCoveringSvg(type = '', group = '', extraClass = '', categoryTitle = '', selectedColor = '') {
            const label = escapeBodyCoveringSvgText(type || 'Revestimento corporal');
            const n = String(type || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const g = String(group || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const colorSource = selectedColor || (g === 'cor' || g.startsWith('cor_') ? type : '');
            const modelColors = getBodyCoveringModelColors(colorSource || type, group);
            const start = `<svg class="body-covering-custom-svg ${extraClass}" style="color:${modelColors.primary} !important" viewBox="0 0 64 64" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">`;
            let art = '';
            if (g === 'cor' || g.startsWith('cor_')) {
                if (g.includes('penas_ornamentais')) art = `<path d="M12 50c8-22 20-35 39-38-2 19-12 34-31 40Z"/><path d="m17 47 29-30M24 39l-8-2m17-8-8-5"/><path d="M45 10l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="currentColor" stroke="none"/>`;
                else if (g.includes('plumagem')) art = `<path d="M15 49c5-20 15-33 34-38 1 18-9 32-34 38Z"/><path d="m19 45 25-29M27 36l-8-1m16-9-7-4"/><circle cx="49" cy="47" r="6" fill="currentColor" stroke="none"/>`;
                else if (g.includes('pelagem')) art = `<path d="M15 51c4-24 11-39 17-39s13 15 17 39"/><path d="M20 50c7-13-4-24 5-37M31 50c7-14-4-25 5-38M42 50c6-12-3-22 4-34"/><circle cx="50" cy="47" r="6" fill="currentColor" stroke="none"/>`;
                else if (g.includes('escamas')) art = `<path d="M11 19h39v27H11Z"/><path d="M11 26c4-6 8-6 12 0 4-6 8-6 12 0 4-6 8-6 15 0M11 35c4-6 8-6 12 0 4-6 8-6 12 0 4-6 8-6 15 0M11 44c4-6 8-6 12 0 4-6 8-6 12 0 4-6 8-6 15 0"/><circle cx="52" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                else if (g.includes('pele')) art = `<path d="M10 24c9-12 35-12 44 0v17c-9 12-35 12-44 0Z"/><path d="M16 29c8-4 24-4 32 0M16 38c8-4 24-4 32 0"/><circle cx="50" cy="48" r="5" fill="currentColor" stroke="none"/>`;
                else if (g.includes('carapaca')) art = `<path d="M10 42c2-18 10-28 22-28s20 10 22 28Z"/><path d="M15 35h34M22 19v23M32 14v28M42 19v23"/><circle cx="51" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                else if (g.includes('exoesqueleto')) art = `<path d="M19 18c7-8 19-8 26 0l6 15-7 18H20l-7-18Z"/><path d="M32 13v38M17 29h30M19 42h26"/><circle cx="52" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                else if (g.includes('concha')) art = `<path d="M10 46c2-22 14-34 30-32 13 2 18 13 12 24-6 10-18 14-42 8Z"/><path d="M38 21c8 0 13 6 10 13-3 6-11 9-17 5-5-3-5-10-1-14 4-3 9-2 12 2"/><circle cx="51" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                else if (g.includes('manto')) art = `<path d="M18 48c-3-17 2-31 14-38 12 7 17 21 14 38-8 5-20 5-28 0Z"/><path d="M23 49l-5 7M30 50l-2 7M37 50l2 7M44 49l5 7"/><circle cx="51" cy="18" r="5" fill="currentColor" stroke="none"/>`;
                else if (g.includes('barbatanas')) art = `<path d="M12 35c9-13 24-17 39-8-8 3-13 9-15 18-7-8-15-11-24-10Z"/><path d="M37 24 32 10c8 2 13 7 16 14M37 44l-3 11c7-2 12-6 15-12"/><circle cx="52" cy="50" r="5" fill="currentColor" stroke="none"/>`;
                else if (g.includes('asas')) art = `<path d="M31 48C15 44 8 33 12 17c10 4 17 12 20 23M33 48c16-4 23-15 19-31-10 4-17 12-20 23"/><path d="M18 25l12 17M46 25 34 42"/><circle cx="52" cy="51" r="5" fill="currentColor" stroke="none"/>`;
                else if (g.includes('ventre')) art = `<path d="M20 13c-7 12-8 28-2 39h28c6-11 5-27-2-39-7 5-17 5-24 0Z"/><path d="M23 27c6 4 12 4 18 0M21 39c7 4 15 4 22 0"/><circle cx="52" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                else if (g.includes('dorso')) art = `<path d="M10 43c8-20 18-30 22-30s14 10 22 30"/><path d="M16 39c10-8 22-8 32 0M22 29c7-5 13-5 20 0"/><circle cx="52" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                else if (g.includes('cabeca')) art = `<circle cx="31" cy="31" r="18"/><path d="M19 21 14 12l12 5M43 21l5-9-12 5M24 34h1M38 34h1M26 43c4 3 8 3 12 0"/><circle cx="52" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                else if (g.includes('membros')) art = `<path d="M20 12v25c0 8-4 12-9 15M44 12v25c0 8 4 12 9 15M20 29h24M25 52h-14M39 52h14"/><circle cx="52" cy="17" r="5" fill="currentColor" stroke="none"/>`;
                else if (g.includes('cauda')) art = `<path d="M14 18c18 1 30 9 34 23 2 8-4 14-12 11-7-3-9-11-5-17 3-5 9-6 14-3"/><path d="M14 18c7 5 12 11 15 18"/><circle cx="52" cy="49" r="5" fill="currentColor" stroke="none"/>`;
                else art = `<path d="M12 23c10-12 30-12 40 0v18c-10 11-30 11-40 0Z"/><circle cx="51" cy="49" r="6" fill="currentColor" stroke="none"/>`;
            } else if (n === 'penugem') {
                art = `<path d="M18 43c-5-2-7-8-4-12 2-4 6-5 10-3-1-6 3-11 9-11 5 0 9 3 10 8 5-1 10 3 10 9 0 6-5 10-11 10H20"/>`;
            } else if (n.includes('juvenil')) {
                art = `<path d="M32 10c10 8 15 17 15 27 0 9-6 16-15 16s-15-7-15-16c0-10 5-19 15-27Z"/><path d="M23 29h18M21 38h22M26 47h12"/>`;
            } else if (n.includes('adulta')) {
                art = `<path d="M16 51c4-19 13-34 32-40 2 18-8 34-32 40Z"/><path d="m19 47 25-30M27 37l-8-1m16-9-7-4m14-1-5-6"/>`;
            } else if (n.includes('nupcial')) {
                art = `<path d="M32 52C14 39 13 26 21 22c5-3 9 0 11 5 2-5 6-8 11-5 8 4 7 17-11 30Z"/><path d="M32 27v17M25 35h14"/>`;
            } else if (n.includes('eclipse')) {
                art = `<circle cx="29" cy="30" r="15"/><path d="M39 19a15 15 0 1 0 0 22M17 50c9-4 20-4 30 0"/>`;
            } else if (n.includes('inverno')) {
                art = `<path d="M32 10v44M13 21l38 22M51 21 13 43M21 13l22 38M43 13 21 51"/><circle cx="32" cy="32" r="5"/>`;
            } else if (n.includes('verao')) {
                art = `<circle cx="32" cy="32" r="10"/><path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M49 15l-6 6M21 43l-6 6"/>`;
            } else if (n.includes('remiges')) {
                art = `<path d="M13 48c8-22 20-34 39-37-3 18-12 33-30 41Z"/><path d="m18 48 28-31M25 38l-9-1m17-8-9-4m17-1-6-7"/>`;
            } else if (n.includes('retrizes')) {
                art = `<path d="M31 52 15 15c10 4 16 12 18 25M32 52 27 11c9 7 12 17 9 29M33 52 43 14c7 9 7 19 1 30M34 52l17-30c3 10 0 19-9 27"/><circle cx="33" cy="53" r="3"/>`;
            } else if (n.includes('tectrizes')) {
                art = `<path d="M11 27c5-9 12-14 20-14 0 9-4 16-11 22Z"/><path d="M28 26c5-9 12-14 20-14 0 9-4 16-11 22Z"/><path d="M19 44c5-9 12-14 20-14 0 9-4 16-11 22Z"/><path d="M36 43c5-9 12-14 20-14 0 9-4 16-11 22Z"/>`;
            } else if (n.includes('semiplumas')) {
                art = `<path d="M17 51c4-19 12-34 30-40 3 17-5 33-30 40Z"/><path d="m20 48 24-32M27 37c-6 3-9 6-10 10M34 28c-5 1-9 4-12 8M39 21c4 1 8 3 11 6"/>`;
            } else if (n.includes('filoplumas')) {
                art = `<path d="M32 53c0-19 2-31 7-42M24 53c1-14 0-23-3-31M42 53c-1-13 1-22 4-29"/><circle cx="39" cy="11" r="3"/><circle cx="36" cy="19" r="2"/>`;
            } else if (n.includes('cerdas')) {
                art = `<path d="m16 52 9-38M28 53l5-42M40 53V15M52 51l-5-33"/><circle cx="25" cy="14" r="2"/><circle cx="33" cy="11" r="2"/><circle cx="40" cy="15" r="2"/><circle cx="47" cy="18" r="2"/>`;
            } else if (g === 'manchas') {
                const pattern = n;
                const base = `<path d="M10 19c8-7 36-7 44 0v26c-8 7-36 7-44 0Z"/>`;
                if (pattern.includes('tigrado')) art = `${base}<path d="M17 19l5 26M28 18l3 28M40 18l-2 28M49 20l-5 24"/>`;
                else if (pattern.includes('reticulado')) art = `${base}<path d="M14 24h36M14 33h36M14 42h36M20 19v26M32 18v28M44 19v26"/>`;
                else if (pattern.includes('anel') || pattern.includes('ocelo')) art = `${base}<circle cx="22" cy="29" r="6"/><circle cx="22" cy="29" r="2"/><circle cx="41" cy="37" r="7"/><circle cx="41" cy="37" r="2.5"/>`;
                else if (pattern.includes('roseta')) art = `${base}<path d="M18 30c3-6 9-6 12 0-3 6-9 6-12 0ZM35 38c3-7 10-7 13 0-3 7-10 7-13 0Z"/><circle cx="24" cy="30" r="1.5" fill="currentColor" stroke="none"/><circle cx="41.5" cy="38" r="1.5" fill="currentColor" stroke="none"/>`;
                else if (pattern.includes('marmoreado') || pattern.includes('mesclado') || pattern.includes('merle')) art = `${base}<path d="M14 28c8-8 12 8 20 0s12 8 17 0M13 39c7-7 12 7 19 0s13 7 20 0"/>`;
                else if (pattern.includes('sela')) art = `${base}<path d="M18 20c3 8 3 16 0 24M46 20c-3 8-3 16 0 24M18 31h28"/>`;
                else if (pattern.includes('tricolor') || pattern.includes('arlequim') || pattern.includes('tartaruga')) art = `${base}<path d="M10 31h44M31 19v26M19 31l12-12M33 45l11-14"/>`;
                else art = `${base}<circle cx="20" cy="28" r="3" fill="currentColor" stroke="none"/><circle cx="33" cy="23" r="2.5" fill="currentColor" stroke="none"/><circle cx="43" cy="35" r="4" fill="currentColor" stroke="none"/><circle cx="27" cy="41" r="2" fill="currentColor" stroke="none"/>`;
            } else if (g.includes('escama')) {
                art = `<path d="M13 18h38v28H13Z"/><path d="M13 25c4-6 8-6 12 0 4-6 8-6 12 0 4-6 8-6 14 0M13 34c4-6 8-6 12 0 4-6 8-6 12 0 4-6 8-6 14 0M13 43c4-6 8-6 12 0 4-6 8-6 12 0 4-6 8-6 14 0"/>`;
            } else if (g.includes('pelo') || g.includes('pelagem')) {
                art = `<path d="M15 52c4-25 12-40 17-40s13 15 17 40"/><path d="M20 51c8-13-5-24 5-38M31 51c8-14-5-25 5-39M42 51c7-12-4-22 4-35"/>`;
            } else if (g.includes('pele') || g.includes('revestimento')) {
                art = `<path d="M11 23c10-12 32-12 42 0v18c-10 12-32 12-42 0Z"/><path d="M15 29c9-6 25-6 34 0M15 38c9-6 25-6 34 0"/><circle cx="22" cy="33" r="2"/><circle cx="39" cy="42" r="2"/>`;
            } else if (g.includes('concha')) {
                art = `<path d="M10 47c2-23 14-36 31-34 14 2 19 14 13 26-6 11-19 15-44 8Z"/><path d="M39 21c9 0 14 7 11 14-3 7-12 10-19 6-6-4-6-12-1-16 4-4 10-3 13 1 2 4 0 8-4 9-3 1-6-1-6-4"/><path d="M10 48h43"/>`;
            } else if (g.includes('carapaca') || g.includes('exoesqueleto')) {
                art = `<path d="M11 33c0-14 9-22 21-22s21 8 21 22v17H11Z"/><path d="M11 33h42M18 17c4 6 8 9 14 9s10-3 14-9M22 20v30M32 26v24M42 20v30"/><circle cx="19" cy="31" r="2"/><circle cx="45" cy="31" r="2"/>`;
            } else if (g.includes('estrutura') || g.includes('extern')) {
                art = `<circle cx="32" cy="32" r="9"/><path d="M32 23V8M32 56V41M23 32H8M56 32H41M26 26 15 15M49 49 38 38M49 15 38 26M26 38 15 49"/>`;
            } else {
                art = `<path d="M14 45c6-20 16-31 36-34-1 18-11 31-36 34Z"/><path d="m18 42 27-27"/>`;
            }
            return `${start}${art}</svg>`;
        }

        function renderPlumageModelCard(item, animalData) {
            const meta = getPlumageVisualMeta(item.tipo, item.grupo, animalData);
            const detail = item.grupo === 'manchas' ? [item.tipo, item.cor ? `Cor: ${item.cor}` : String(item.detalhe || '').replace(/^Cor:\s*/i,'')].filter(Boolean).join(' · ') : (item.detalhe || meta.description);
            const isSpots = item.tipo === 'Manchas' || item.grupo === 'manchas';
            const title = getBodyCoveringTitle(animalData);
            const visualType = item.tipo;
            const figure = `<div class="plumage-model-figure body-covering-display-icon">${renderBodyCoveringSvg(visualType, item.grupo, '', title, item.cor || '')}</div>`;
            const normalizedGender = String(item.genero || 'MF').toUpperCase();
            const genderHtml = normalizedGender === 'M'
                ? '<span class="curiosidades-card-symbol gender-symbol"><span class="male-symbol">&#9794;</span></span>'
                : normalizedGender === 'F'
                    ? '<span class="curiosidades-card-symbol gender-symbol"><span class="female-symbol">&#9792;</span></span>'
                    : '<span class="curiosidades-card-symbol gender-symbol"><span class="male-symbol">&#9794;</span><span class="female-symbol">&#9792;</span></span>';
            const phaseHtml = item.fase === 'Cria'
                ? '<span class="curiosidades-card-symbol"><i class="fa-solid fa-baby phase-icon"></i></span>'
                : '<span class="curiosidades-card-symbol"><i class="fa-solid fa-paw phase-icon"></i></span>';
            const metaHtml = `<div class="curiosidades-card-meta">${genderHtml}${phaseHtml}</div>`;
            return `<article class="plumage-model-card${isSpots ? ' body-spots-card' : ''}">${figure}<div class="plumage-model-copy"><div class="plumage-model-label">${escapeHtml(meta.label)}</div><div class="plumage-model-value">${escapeHtml(detail)}</div><div class="plumage-model-meta">${escapeHtml(meta.group)} ${metaHtml}</div></div></article>`;
        }
        function renderPlumageVisual(animalData) {
            const plumage = animalData.informacao?.plumagemDetalhada || [];
            if (!Array.isArray(plumage) || plumage.length === 0) return '';
            const valid = plumage.filter(item => item.tipo && (String(item.detalhe || '').trim() !== '' || String(item.cor || '').trim() !== ''));
            if (!valid.length) return '';
            const title = getBodyCoveringTitle(animalData);
            const hero = valid[0];
            const heroMeta = getPlumageVisualMeta(hero.tipo, hero.grupo, animalData);
            return `<div class="plumage-visual-card"><div class="plumage-preview-stage compact"><div class="plumage-hero-figure compact body-covering-display-hero">${renderBodyCoveringSvg(hero.tipo, hero.grupo, 'body-covering-hero-icon', title, hero.cor || '')}</div><div class="plumage-hero-copy compact"><span>Modelo visual de ${escapeHtml(title.toLowerCase())}</span><strong>${escapeHtml(heroMeta.label)}</strong><p>${escapeHtml(hero.grupo === 'manchas' ? [hero.tipo, hero.cor ? `Cor: ${hero.cor}` : String(hero.detalhe || '').replace(/^Cor:\s*/i,'')].filter(Boolean).join(' · ') : (hero.detalhe || heroMeta.description))}</p></div></div><div class="plumage-model-grid">${valid.map(item => renderPlumageModelCard(item, animalData)).join('')}</div></div>`;
        }

        function renderCuriosidadesVisual(animalData) {
            const curiosidades = animalData.informacao?.curiosidades;
            if (!curiosidades) return '';

            const colorMap = {
                'Preto': '#111111',
                'Branco': '#fcfcfc',
                'Cinzento': '#8c8c8c',
                'Castanho': '#6b4423',
                'Bege': '#e8d8c8',
                'Creme': '#fffbcf',
                'Amarelo': '#ffd000',
                'Dourado': '#d4af37',
                'Laranja': '#ff7700',
                'Vermelho': '#e01b1b',
                'Rosa': '#ff94b8',
                'Azul': '#1a5fb4',
                'Verde': '#2ec27e',
                'Roxo': '#9141ac',
                'Prateado': '#c0c0c0'
            };

            const statusColors = {
                'NE': { bg: '#5c6773', text: '#ffffff', name: 'Não Avaliado' },
                'DD': { bg: '#835d90', text: '#ffffff', name: 'Dados Insuficientes' },
                'LC': { bg: '#007a5e', text: '#ffffff', name: 'Pouco Preocupante' },
                'NT': { bg: '#85bb65', text: '#000000', name: 'Quase Ameaçado' },
                'VU': { bg: '#e69f00', text: '#000000', name: 'Vulnerável' },
                'EN': { bg: '#d55e00', text: '#ffffff', name: 'Em Perigo' },
                'CR': { bg: '#c00000', text: '#ffffff', name: 'Criticamente em Perigo' },
                'EW': { bg: '#542788', text: '#ffffff', name: 'Extinto na Natureza' },
                'EX': { bg: '#000000', text: '#ffffff', name: 'Extinto' }
            };

            const detailItems = Array.isArray(curiosidades.detalhes) && curiosidades.detalhes.length
                ? curiosidades.detalhes.filter(item => {
                    if (!item?.tipo || normalizeDimensionKey(item.tipo) === 'tipo de comunicacao') return false;
                    const hasValue = item.valor !== undefined && item.valor !== null && String(item.valor).trim() !== '' && (item.unidade ? String(item.valor).trim() !== String(item.unidade).trim() : true);
                    const hasMin = item.valorMin !== undefined && item.valorMin !== null && String(item.valorMin).trim() !== '';
                    const hasMax = item.valorMax !== undefined && item.valorMax !== null && String(item.valorMax).trim() !== '';
                    return hasValue || hasMin || hasMax;
                })
                : [
                    curiosidades.cor ? { tipo: 'Cor do animal', valor: curiosidades.cor, genero: 'MF', fase: 'Adulto' } : null,
                    curiosidades.estadoConservacao ? { tipo: 'Estado de Conservação', valor: curiosidades.estadoConservacao, genero: 'MF', fase: 'Adulto' } : null,
                    curiosidades.relacaoHumanos ? { tipo: 'Relação com Humanos', valor: curiosidades.relacaoHumanos, genero: 'MF', fase: 'Adulto' } : null,
                    curiosidades.importanciaEconomicaHumanos ? { tipo: 'Importância económica para os humanos', valor: curiosidades.importanciaEconomicaHumanos, genero: 'MF', fase: 'Adulto' } : null,
                    curiosidades.distanciaPercorrida ? { tipo: 'Distância Percorrida', valor: curiosidades.distanciaPercorrida, genero: 'MF', fase: 'Adulto' } : null,
                    curiosidades.horasSono ? { tipo: 'Horas de Sono', valor: curiosidades.horasSono, genero: 'MF', fase: 'Adulto' } : null,
                    curiosidades.maiorPesoRegistado ? { tipo: 'Maior peso registado', valor: curiosidades.maiorPesoRegistado, genero: 'MF', fase: 'Adulto' } : null,
                    curiosidades.maiorIdadeRegistada ? { tipo: 'Maior idade registada', valor: curiosidades.maiorIdadeRegistada, genero: 'MF', fase: 'Adulto' } : null,
                    curiosidades.maiorComprimentoRegistado ? { tipo: 'Maior comprimento registado', valor: curiosidades.maiorComprimentoRegistado, genero: 'MF', fase: 'Adulto' } : null,
                    curiosidades.maiorAlturaRegistada ? { tipo: 'Maior altura registada', valor: curiosidades.maiorAlturaRegistada, genero: 'MF', fase: 'Adulto' } : null,
                    curiosidades.maiorEnvergaduraRegistada ? { tipo: 'Maior envergadura registada', valor: curiosidades.maiorEnvergaduraRegistada, genero: 'MF', fase: 'Adulto' } : null,
                    Array.isArray(curiosidades.tambemConhecidoComo) && curiosidades.tambemConhecidoComo.length ? { tipo: 'Também conhecido como', valor: curiosidades.tambemConhecidoComo.join(', '), genero: 'MF', fase: 'Adulto' } : null,
                    curiosidades.temperaturaAmbiente ? { tipo: 'Temperatura do Ambiente', valor: curiosidades.temperaturaAmbiente, genero: 'MF', fase: 'Adulto' } : null
                ].filter(Boolean);

            if (!detailItems.length) return '';

            const renderMetaSymbols = (item) => {
                const normalizedGender = normalizeGenderValue(item.genero || 'MF', 'MF');
                const genderSymbolHtml = normalizedGender === 'M'
                    ? '<span class="curiosidades-card-symbol gender-symbol"><span class="male-symbol">&#9794;</span></span>'
                    : normalizedGender === 'F'
                        ? '<span class="curiosidades-card-symbol gender-symbol"><span class="female-symbol">&#9792;</span></span>'
                        : '<span class="curiosidades-card-symbol gender-symbol"><span class="male-symbol">&#9794;</span><span class="female-symbol">&#9792;</span></span>';
                const phaseSymbolHtml = item.fase === 'Cria'
                    ? '<span class="curiosidades-card-symbol"><i class="fa-solid fa-baby phase-icon"></i></span>'
                    : '<span class="curiosidades-card-symbol"><i class="fa-solid fa-paw phase-icon"></i></span>';
                return `<div class="curiosidades-card-meta">${genderSymbolHtml}${phaseSymbolHtml}</div>`;
            };

            const getGenderLabel = (gender) => {
                if (gender === 'M') return '♂ Macho';
                if (gender === 'F') return '♀ Fêmea';
                return '♂♀ Macho e fêmea';
            };

            const renderMeta = (item) => `
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
                    <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.72); font-size: 0.72rem; font-weight: 600;">${escapeHtml(getGenderLabel(item.genero || 'MF'))}</span>
                    <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.72); font-size: 0.72rem; font-weight: 600;">${item.fase === 'Cria' ? 'Cria' : 'Adulto'}</span>
                </div>
            `;

            const buildCuriosidadeValue = (item = {}) => {
                if (item.valor !== undefined && item.valor !== null && String(item.valor).trim()) return String(item.valor).trim();
                const min = item.valorMin !== undefined && item.valorMin !== null ? String(item.valorMin).trim() : '';
                const max = item.valorMax !== undefined && item.valorMax !== null ? String(item.valorMax).trim() : '';
                const unit = item.unidade ? ` ${String(item.unidade).trim()}` : '';
                if (min && max) return min === max ? `${min}${unit}` : `${min}—${max}${unit}`;
                if (min) return `${min}${unit}`;
                if (max) return `${max}${unit}`;
                return '';
            };

            const groupedDetailItems = detailItems.reduce((groups, item) => {
                const tipo = item.tipo || '';
                const key = tipo;
                const value = buildCuriosidadeValue(item);
                if (!value) return groups;
                if (!groups[key]) {
                    groups[key] = {
                        ...item,
                        tipo,
                        valor: value,
                        valores: [],
                        genero: item.genero || 'MF',
                        fase: item.fase || 'Adulto'
                    };
                }
                if (!groups[key].valores.includes(value)) groups[key].valores.push(value);
                groups[key].valor = groups[key].valores.join(' + ');
                return groups;
            }, {});

            const groupedItems = Object.values(groupedDetailItems);
            const communicationTypeValues = [...new Set(groupedItems
                .filter(item => normalizeDimensionKey(item.tipo) === 'tipo de comunicacao')
                .flatMap(item => Array.isArray(item.valores) && item.valores.length ? item.valores : [item.valor])
                .map(value => String(value || '').trim())
                .filter(Boolean))];

            const renderValuesHtml = (item) => {
                const values = Array.isArray(item.valores) && item.valores.length ? item.valores : [item.valor];
                if (values.length === 1) return escapeHtml(values[0]);
                return `<span class="curiosidades-multi-values">${values.map(value => `<span>${escapeHtml(value)}</span>`).join('')}</span>`;
            };

            const toxicityMeta = {
                danger: {
                    icon: 'fa-triangle-exclamation',
                    accent: '#f87171',
                    background: 'rgba(239, 68, 68, 0.18)'
                },
                toxinType: {
                    icon: 'fa-vial-circle-check',
                    accent: '#f472b6',
                    background: 'rgba(236, 72, 153, 0.18)'
                },
                'Via de administração da toxina': {
                    icon: 'fa-syringe',
                    accent: '#38bdf8',
                    background: 'rgba(14, 165, 233, 0.18)'
                },
                'Antídoto disponível': {
                    icon: 'fa-kit-medical',
                    accent: '#34d399',
                    background: 'rgba(16, 185, 129, 0.18)'
                }
            };

            const renderConservationStatusCard = (item) => {
                const status = getConservationStatusMeta(item.valor);
                return `
                    <button type="button" class="dimension-model-card curiosidades-model-card conservation-status-card" data-conservation-status="${escapeHtml(status.code)}" aria-haspopup="dialog" aria-label="Ver todos os Estados de Conservação. Selecionado: ${escapeHtml(status.name)}" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                        <div class="dimension-model-icon" style="flex-shrink: 0; background: ${status.bg}; color: ${status.text}; font-weight: 800; font-size: 1.05rem; text-transform: uppercase; display: flex; align-items: center; justify-content: center;">
                            ${escapeHtml(item.valor)}
                        </div>
                        <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                            <div class="curiosidades-card-head">
                                <span class="dimension-model-label">${escapeHtml(status.name)}</span>
                                ${renderMetaSymbols(item)}
                                <span class="curiosidades-card-open-indicator" aria-hidden="true">↗</span>
                            </div>
                            <strong class="dimension-model-value">Estado de Conservação</strong>
                        </div>
                    </button>`;
            };

            const cardsHtml = groupedItems.map(item => {
                if (normalizeDimensionKey(item.tipo).includes('estado de conserva')) {
                    return renderConservationStatusCard(item);
                }
                const valuesHtml = renderValuesHtml(item);
                const normalizedTipo = (item.tipo || '').trim().toLowerCase();
                const isHorasSono = normalizedTipo === 'horas de sono' || normalizedTipo === 'horas sono' || normalizedTipo.includes('sono');
                const toxicityType = normalizedTipo.includes('periculos')
                    ? 'danger'
                    : normalizedTipo === 'tipo de toxina'
                        ? 'toxinType'
                        : normalizedTipo.includes('administra') && normalizedTipo.includes('toxina')
                            ? 'Via de administra??o da toxina'
                            : normalizedTipo.includes('doto') && normalizedTipo.includes('disp')
                                ? 'Ant?doto dispon?vel'
                                : '';
                if (item.tipo === 'Também conhecido como') {
                    return `
                        <article class="dimension-model-card curiosidades-model-card" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                            <div class="dimension-model-icon" style="flex-shrink: 0; background: rgba(96, 165, 250, 0.18); color: #bfdbfe; display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-tags"></i>
                            </div>
                            <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <div class="curiosidades-card-head">
                                <span class="dimension-model-label">${valuesHtml}</span>
                                ${renderMetaSymbols(item)}
                            </div>
                                <strong class="dimension-model-value">Também conhecido como</strong>
                            </div>
                        </article>
                    `;
                }

                if (item.tipo === 'Relação com Humanos') {
                    return `
                        <article class="dimension-model-card curiosidades-model-card" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                            <div class="dimension-model-icon" style="flex-shrink: 0; background: linear-gradient(135deg, rgba(14, 165, 233, 0.24), rgba(16, 185, 129, 0.18)); color: #67e8f9; display: flex; align-items: center; justify-content: center;">
                                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" style="width: 28px; height: 28px;">
                                    <path d="M12 40c5-10 13-16 20-16s15 6 20 16" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M18 42c3 7 9 12 14 12s11-5 14-12" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                    <circle cx="24" cy="24" r="6" stroke="currentColor" stroke-width="4"/>
                                    <circle cx="40" cy="22" r="6" stroke="currentColor" stroke-width="4"/>
                                    <path d="M30 31l5 5l5-5" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <div class="curiosidades-card-head">
                                    <span class="dimension-model-label">${valuesHtml}</span>
                                    ${renderMetaSymbols(item)}
                                </div>
                                <strong class="dimension-model-value">Relação com Humanos</strong>
                            </div>
                        </article>
                    `;
                }

                if (item.tipo === 'Importância económica para os humanos') {
                    return `
                        <article class="dimension-model-card curiosidades-model-card" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                            <div class="dimension-model-icon" style="flex-shrink: 0; background: rgba(245, 158, 11, 0.18); color: #fbbf24; display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-scale-balanced"></i>
                            </div>
                            <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <div class="curiosidades-card-head">
                                    <span class="dimension-model-label">${valuesHtml}</span>
                                    ${renderMetaSymbols(item)}
                                </div>
                                <strong class="dimension-model-value">Importância económica para os humanos</strong>
                            </div>
                        </article>
                    `;
                }

                if (item.tipo === 'Cor do animal') {
                    const hexColor = colorMap[item.valor] || '#cccccc';
                    const circleBorder = (item.valor === 'Branco' || item.valor === 'Creme') ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.1)';
                    return `
                        <article class="dimension-model-card curiosidades-model-card" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                            <div class="dimension-model-icon" style="flex-shrink: 0; background: rgba(0,0,0,0.3); border: 2px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center;">
                                <div style="width: 22px; height: 22px; border-radius: 50%; border: ${circleBorder}; background-color: ${hexColor};"></div>
                            </div>
                            <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <div class="curiosidades-card-head">
                                    <span class="dimension-model-label">${valuesHtml}</span>
                                    ${renderMetaSymbols(item)}
                                </div>
                                <strong class="dimension-model-value">Cor do Animal</strong>
                            </div>
                        </article>
                    `;
                }

                if (normalizeDimensionKey(item.tipo) === 'materiais de local de repouso') {
                    const materialNames = Array.isArray(item.materiais) && item.materiais.length
                        ? item.materiais
                        : String(item.valor || '').split(',').map(value => value.trim()).filter(Boolean);
                    const material = materialNames[0] || '';
                    const materialIcon = getRestingPlaceMaterialSvg(material);
                    return `
                        <article class="dimension-model-card curiosidades-model-card resting-place-materials-card" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                            <div class="dimension-model-icon" style="flex-shrink: 0; background: rgba(16, 185, 129, 0.18); color: #6ee7b7; display: flex; align-items: center; justify-content: center;">
                                ${materialIcon || '<i class="fa-solid fa-leaf" aria-hidden="true"></i>'}
                            </div>
                            <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <div class="curiosidades-card-head">
                                    <span class="dimension-model-label">${valuesHtml}</span>
                                    ${renderMetaSymbols(item)}
                                </div>
                                <strong class="dimension-model-value">Materiais de local de repouso</strong>
                            </div>
                        </article>
                    `;
                }
                if (normalizeDimensionKey(item.tipo) === 'dimensoes do local de repouso') {
                    return `
                        <article class="dimension-model-card curiosidades-model-card resting-place-dimensions-card" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                            <div class="dimension-model-icon" style="flex-shrink: 0; background: rgba(14, 165, 233, 0.18); color: #7dd3fc; display: flex; align-items: center; justify-content: center;">
                                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" style="width: 30px; height: 30px;">
                                    <path d="M10 45c8-13 16-19 22-19s14 6 22 19" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M16 45h32" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
                                    <path d="M12 53h40M20 53v-5M44 53v-5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                                    <path d="M54 18v24M50 22l4-4l4 4M50 38l4 4l4-4" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <div class="curiosidades-card-head">
                                    <span class="dimension-model-label">${valuesHtml}</span>
                                    ${renderMetaSymbols(item)}
                                </div>
                                <strong class="dimension-model-value">Dimensões do local de repouso</strong>
                            </div>
                        </article>
                    `;
                }
                if (normalizeDimensionKey(item.tipo) === 'tipo de comunicacao') {
                    const communicationTypesData = escapeHtml(JSON.stringify(communicationTypeValues));
                    return `
                        <button type="button" class="dimension-model-card curiosidades-model-card communication-type-popup-trigger" data-communication-type-popup data-communication-types="${communicationTypesData}" aria-haspopup="dialog" aria-controls="communication-type-modal" aria-label="Ver os tipos de comunicação e respetivas explicações" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                            <div class="dimension-model-icon" style="flex-shrink: 0; background: rgba(32, 201, 151, 0.18); color: #67e8f9; display: flex; align-items: center; justify-content: center;">
                                ${getCommunicationGenericModelSvg()}
                            </div>
                            <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <div class="curiosidades-card-head">
                                <span class="dimension-model-label">${valuesHtml}</span>
                                ${renderMetaSymbols(item)}
                                <span class="curiosidades-card-open-indicator" aria-hidden="true">↗</span>
                                </div>
                                <strong class="dimension-model-value">Tipo de Comunicação</strong>
                            </div>
                        </button>
                    `;
                }

                if (item.tipo === 'Maior peso registado') {
                    return `
                        <article class="dimension-model-card curiosidades-model-card record-weight-card" style="width:100%;box-sizing:border-box;display:flex;align-items:center;">
                            <div class="dimension-model-icon record-site-icon record-weight-site-icon" style="flex-shrink:0;display:flex;align-items:center;justify-content:center;"><svg class="record-custom-svg" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 12h28v7c0 13-6 21-14 21s-14-8-14-21Z"/><path d="M18 16H9v5c0 9 5 14 13 14M46 16h9v5c0 9-5 14-13 14"/><path d="M32 40v7M22 56h20M25 47h14l3 9H22Z"/><path d="m32 18 3 6h7l-5 4 2 7-7-4-7 4 2-7-5-4h7Z"/></svg></div>
                            <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <div class="curiosidades-card-head">
                                    <span class="dimension-model-label" style="color:#fde68a; font-weight:800;">${valuesHtml}</span>
                                    ${renderMetaSymbols(item)}
                                </div>
                                <strong class="dimension-model-value" style="color:#facc15;">Maior peso registado</strong>
                            </div>
                        </article>
                    `;
                }


                if (item.tipo === 'Maior idade registada') {
                    return `
                        <article class="dimension-model-card curiosidades-model-card record-age-card" style="width:100%;box-sizing:border-box;display:flex;align-items:center;">
                            <div class="dimension-model-icon record-site-icon record-age-site-icon" style="flex-shrink:0;display:flex;align-items:center;justify-content:center;"><svg class="record-custom-svg" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9h24M20 55h24"/><path d="M23 12c0 11 4 16 9 20-5 4-9 9-9 20h18c0-11-4-16-9-20 5-4 9-9 9-20Z"/><path d="M27 18h10M27 46h10"/><path d="m46 8 2 4 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1Z"/></svg></div>
                            <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <div class="curiosidades-card-head">
                                    <span class="dimension-model-label" style="color:#ddd6fe; font-weight:800;">${valuesHtml}</span>
                                    ${renderMetaSymbols(item)}
                                </div>
                                <strong class="dimension-model-value" style="color:#c4b5fd;">Maior idade registada</strong>
                            </div>
                        </article>
                    `;
                }

                if (item.tipo === 'Maior comprimento registado') {
                    return `<article class="dimension-model-card curiosidades-model-card" style="width:100%;box-sizing:border-box;display:flex;align-items:center;"><div class="dimension-model-icon" style="flex-shrink:0;color:#38bdf8;background:rgba(56,189,248,.16);"><svg class="record-custom-svg" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 20h44v24H10z"/><path d="M16 20v9M23 20v6M30 20v9M37 20v6M44 20v9M51 20v6"/><path d="M8 50h48"/><path d="m8 50 6-5M8 50l6 5M56 50l-6-5M56 50l-6 5"/></svg></div><div class="dimension-model-copy"><div class="curiosidades-card-head"><span class="dimension-model-label" style="color:#7dd3fc;font-weight:800;">${valuesHtml}</span>${renderMetaSymbols(item)}</div><strong class="dimension-model-value" style="color:#38bdf8;">Maior comprimento registado</strong></div></article>`;
                }
                if (item.tipo === 'Maior altura registada') {
                    return `<article class="dimension-model-card curiosidades-model-card" style="width:100%;box-sizing:border-box;display:flex;align-items:center;"><div class="dimension-model-icon" style="flex-shrink:0;color:#34d399;background:rgba(52,211,153,.16);"><svg class="record-custom-svg" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10h20v44H22z"/><path d="M22 16h8M22 23h5M22 30h8M22 37h5M22 44h8"/><path d="M14 10v44"/><path d="m14 10-5 6M14 10l5 6M14 54l-5-6M14 54l5-6"/></svg></div><div class="dimension-model-copy"><div class="curiosidades-card-head"><span class="dimension-model-label" style="color:#6ee7b7;font-weight:800;">${valuesHtml}</span>${renderMetaSymbols(item)}</div><strong class="dimension-model-value" style="color:#34d399;">Maior altura registada</strong></div></article>`;
                }
                if (item.tipo === 'Maior envergadura registada') {
                    return `<article class="dimension-model-card curiosidades-model-card" style="width:100%;box-sizing:border-box;display:flex;align-items:center;"><div class="dimension-model-icon" style="flex-shrink:0;color:#fb7185;background:rgba(251,113,133,.16);"><svg class="record-custom-svg" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 32c-7-9-15-14-25-15c4 10 11 17 21 21"/><path d="M32 32c7-9 15-14 25-15c-4 10-11 17-21 21"/><path d="M32 26v22"/><path d="M8 52h48"/><path d="m8 52 6-5M8 52l6 5M56 52l-6-5M56 52l-6 5"/></svg></div><div class="dimension-model-copy"><div class="curiosidades-card-head"><span class="dimension-model-label" style="color:#fda4af;font-weight:800;">${valuesHtml}</span>${renderMetaSymbols(item)}</div><strong class="dimension-model-value" style="color:#fb7185;">Maior envergadura registada</strong></div></article>`;
                }

                if (normalizeDimensionKey(item.tipo) === 'distancia percorrida') {
                    return `
                        <article class="dimension-model-card curiosidades-model-card" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                            <div class="dimension-model-icon" style="flex-shrink: 0; background: rgba(14, 165, 233, 0.18); color: #7dd3fc; display: flex; align-items: center; justify-content: center;">
                                <svg class="record-custom-svg distance-route-svg" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 48c8-14 14-24 26-24c8 0 10 8 16 8c4 0 7-3 10-8"/>
                                    <path d="M48 16h16v16"/>
                                    <path d="M12 48h10"/>
                                    <circle cx="12" cy="48" r="4"/>
                                </svg>
                            </div>
                            <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <div class="curiosidades-card-head">
                                    <span class="dimension-model-label">${valuesHtml}</span>
                                    ${renderMetaSymbols(item)}
                                </div>
                                <strong class="dimension-model-value">Distância Percorrida</strong>
                            </div>
                        </article>
                    `;
                }

                if (isHorasSono) {
                    return `
                        <article class="dimension-model-card curiosidades-model-card sleep-card" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                            <div class="dimension-model-icon" style="flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" style="width: 28px; height: 28px;">
                                    <path d="M14 41h36" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                                    <path d="M16 41V24c0-4 3-7 7-7h8c4 0 7 3 7 7v17" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M38 29h10c4 0 7 3 7 7v5" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M22 29h10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                                    <path d="M48 14h8l-8 9h8" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <div class="curiosidades-card-head">
                                    <span class="dimension-model-label">${valuesHtml}</span>
                                    ${renderMetaSymbols(item)}
                                </div>
                                <strong class="dimension-model-value">Horas de Sono</strong>
                            </div>
                        </article>
                    `;
                }

                if (item.tipo === 'Temperatura do Ambiente') {
                    return `
                        <article class="dimension-model-card curiosidades-model-card" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                            <div class="dimension-model-icon" style="flex-shrink: 0; background: rgba(245, 158, 11, 0.18); color: #fbbf24; display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-temperature-three-quarters"></i>
                            </div>
                            <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                <div class="curiosidades-card-head">
                                    <span class="dimension-model-label">${valuesHtml}</span>
                                    ${renderMetaSymbols(item)}
                                </div>
                                <strong class="dimension-model-value">Temperatura do Ambiente</strong>
                            </div>
                        </article>
                    `;
                }

                if (item.tipo === 'Tendência populacional') {
                    const trendIcon = item.valor === 'A aumentar' ? 'fa-arrow-trend-up' : item.valor === 'A diminuir' ? 'fa-arrow-trend-down' : item.valor === 'Estável' ? 'fa-minus' : 'fa-question';
                    return `
                        <article class="dimension-model-card curiosidades-model-card" style="width:100%;box-sizing:border-box;display:flex;align-items:center;">
                            <div class="dimension-model-icon" style="flex-shrink:0;background:rgba(34,197,94,.18);color:#86efac;display:flex;align-items:center;justify-content:center;"><i class="fa-solid ${trendIcon}"></i></div>
                            <div class="dimension-model-copy"><div class="curiosidades-card-head"><span class="dimension-model-label">${valuesHtml}</span>${renderMetaSymbols(item)}</div><strong class="dimension-model-value">Tendência populacional</strong></div>
                        </article>`;
                }
                if (item.tipo === 'Dependência de áreas protegidas') {
                    return `
                        <article class="dimension-model-card curiosidades-model-card" style="width:100%;box-sizing:border-box;display:flex;align-items:center;">
                            <div class="dimension-model-icon" style="flex-shrink:0;background:rgba(16,185,129,.18);color:#6ee7b7;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-shield-halved"></i></div>
                            <div class="dimension-model-copy"><div class="curiosidades-card-head"><span class="dimension-model-label">${valuesHtml}</span>${renderMetaSymbols(item)}</div><strong class="dimension-model-value">Dependência de áreas protegidas</strong></div>
                        </article>`;
                }

                if (toxicityType && toxicityMeta[toxicityType]) {
                    const meta = toxicityMeta[toxicityType];
                    return `
                        <article class="dimension-model-card curiosidades-model-card" style="width:100%;box-sizing:border-box;display:flex;align-items:center;">
                            <div class="dimension-model-icon" style="flex-shrink:0;background:${meta.background};color:${meta.accent};display:flex;align-items:center;justify-content:center;"><i class="fa-solid ${meta.icon}"></i></div>
                            <div class="dimension-model-copy" style="display:flex;flex-direction:column;align-items:flex-start;text-align:left;">
                                <div class="curiosidades-card-head">
                                    <span class="dimension-model-label">${valuesHtml}</span>
                                    ${renderMetaSymbols(item)}
                                </div>
                                <strong class="dimension-model-value">${escapeHtml(item.tipo)}</strong>
                            </div>
                        </article>
                    `;
                }

                if (item.tipo !== 'Estado de Conserva??o' && item.tipo !== 'Estado de Conservação') {
                    return `
                        <article class="dimension-model-card curiosidades-model-card" style="width:100%;box-sizing:border-box;display:flex;align-items:center;">
                            <div class="dimension-model-icon" style="flex-shrink:0;background:rgba(148, 163, 184, 0.16);color:#cbd5e1;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-sparkles"></i></div>
                            <div class="dimension-model-copy" style="display:flex;flex-direction:column;align-items:flex-start;text-align:left;">
                                <div class="curiosidades-card-head">
                                    <span class="dimension-model-label">${valuesHtml}</span>
                                    ${renderMetaSymbols(item)}
                                </div>
                                <strong class="dimension-model-value">${escapeHtml(item.tipo || 'Curiosidade')}</strong>
                            </div>
                        </article>
                    `;
                }

                const sColor = getConservationStatusMeta(item.valor);
                return `
                    <button type="button" class="dimension-model-card curiosidades-model-card conservation-status-card" data-conservation-status="${escapeHtml(sColor.code)}" aria-haspopup="dialog" aria-label="Ver todos os Estados de Conservação. Selecionado: ${escapeHtml(sColor.name)}" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                        <div class="dimension-model-icon" style="flex-shrink: 0; background: ${sColor.bg}; color: ${sColor.text}; font-weight: 800; font-size: 1.05rem; text-transform: uppercase; display: flex; align-items: center; justify-content: center;">
                            ${escapeHtml(item.valor)}
                        </div>
                        <div class="dimension-model-copy" style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                            <div class="curiosidades-card-head">
                                <span class="dimension-model-label">${escapeHtml(sColor.name)}</span>
                                ${renderMetaSymbols(item)}
                                <span class="curiosidades-card-open-indicator" aria-hidden="true">↗</span>
                            </div>
                            <strong class="dimension-model-value">Estado de Conservação</strong>
                        </div>
                    </button>
                `;
            }).join('' );

            return `
                <div class="curiosidades-model-grid" style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px; width: 100%; box-sizing: border-box;">
                    ${cardsHtml}
                </div>
            `;
        }

        function playVideo(videoUrl, thumbnailElement) {
            const videoId = getYouTubeVideoId(videoUrl);
            if (!videoId) return;

            pauseAllAnimalAudio({ reset: false });
            
            // Remover classe active de outras thumbnails e adicionar nesta
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            if(thumbnailElement) thumbnailElement.classList.add('active');

            const videoContainer = document.getElementById('main-video-container');
            const iframe = videoContainer.querySelector('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
            videoContainer.style.display = 'block';
        }

        async function fetchAndRenderSubspeciesParents(subespeciesDe = []) {
            const container = document.getElementById('subspecies-parent-animals-container');
            const containerMobile = document.getElementById('subspecies-parent-animals-container-mobile');
            if (container) container.style.display = 'none';
            if (containerMobile) containerMobile.style.display = 'none';

            const parentIds = Array.isArray(subespeciesDe)
                ? [...new Set(subespeciesDe.map(id => String(id || '').trim()).filter(Boolean))]
                : [];

            if (parentIds.length === 0 || (!container && !containerMobile)) return;

            try {
                const parentAnimals = (await Promise.all(parentIds.map(async (parentId) => {
                    try {
                        const parentDoc = await getDoc(doc(db, "animais", parentId));
                        if (!parentDoc.exists()) return null;
                        return { id: parentDoc.id, ...parentDoc.data() };
                    } catch (error) {
                        console.error("Erro ao carregar animal anexado em Subespécies de:", error);
                        return null;
                    }
                }))).filter(Boolean);

                if (parentAnimals.length === 0) return;

                parentAnimals.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt'));

                let listHTML = '<ul class="related-list subspecies-parent-list">';
                parentAnimals.forEach(animal => {
                    const objectPos = animal.imagemObjectPosition || 'center center';
                    listHTML += `
                        <li class="related-item subspecies-parent-item">
                            <a href="animal.html?id=${animal.id}">
                                <img src="${escapeHtml(animal.imagemUrl || '')}" alt="${escapeHtml(animal.nome || '')}" style="object-position: ${escapeHtml(objectPos)};">
                                <span>${escapeHtml(animal.nome || 'Animal')}</span>
                            </a>
                        </li>
                    `;
                });
                listHTML += '</ul>';

                const sectionHTML = `<h3>Subespécie de</h3>${listHTML}`;
                if (container) {
                    container.innerHTML = sectionHTML;
                    container.style.display = 'block';
                }
                if (containerMobile) {
                    containerMobile.innerHTML = sectionHTML;
                    containerMobile.style.display = 'block';
                }
            } catch (error) {
                console.error("Erro ao renderizar animais anexados em Subespécies de:", error);
            }
        }

        async function fetchAndRenderRelatedAnimals(subfamilia, currentAnimalId, tribo = '') {
            const container = document.getElementById('related-animals-container');
            const containerMobile = document.getElementById('related-animals-container-mobile');
            if (container) container.style.display = 'none';
            if (containerMobile) containerMobile.style.display = 'none';
            if (!subfamilia || (!container && !containerMobile)) return;

            const familyUrl = `family.html?subfamilia=${encodeURIComponent(subfamilia)}`;
            const portalHTML = `
                <a class="family-portal-link" href="${familyUrl}" aria-label="Visitar a subfamília ${escapeHtml(subfamilia)}">
                    <div class="family-portal-content">
                        <span class="family-portal-eyebrow">Visite a Subfamília</span>
                        <span class="family-portal-name">${escapeHtml(subfamilia)} <i class="fa-solid fa-arrow-right"></i></span>
                    </div>
                </a>`;

            try {
                const q = query(collection(db, "animais"), where("subfamilia", "==", subfamilia));
                const querySnapshot = await getDocs(q);                const hasRelatedSubfamily = querySnapshot.size >= 2;
                let tribePortalHTML = '';
                if (tribo) {
                    const tribeSnapshot = await getDocs(query(collection(db, "animais"), where("tribo", "==", tribo)));
                    if (tribeSnapshot.size >= 2) {
                        const tribeUrl = `family.html?tribo=${encodeURIComponent(tribo)}`;
                        tribePortalHTML = `<a class="family-portal-link tribe-portal-link" href="${tribeUrl}" aria-label="Visitar a tribo ${escapeHtml(tribo)}"><div class="family-portal-content"><span class="family-portal-eyebrow">Visite a Tribo</span><span class="family-portal-name">${escapeHtml(tribo)} <i class="fa-solid fa-arrow-right"></i></span></div></a>`;
                    }
                }
                if (!hasRelatedSubfamily && !tribePortalHTML) return;

                const relatedAnimals = [];
                querySnapshot.forEach(resultDoc => {
                    if (resultDoc.id !== currentAnimalId) relatedAnimals.push({ id: resultDoc.id, ...resultDoc.data() });
                });
                relatedAnimals.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt'));

                let listHTML = '';
                if (relatedAnimals.length) {
                    listHTML = '<div class="related-family-list-block"><h3>Da mesma família</h3><ul class="related-list">' + relatedAnimals.map(animal => {
                        const objectPos = animal.imagemObjectPosition || 'center center';
                        return `<li class="related-item"><a href="animal.html?id=${encodeURIComponent(animal.id)}"><img src="${escapeHtml(animal.imagemUrl || '')}" alt="${escapeHtml(animal.nome || '')}" style="object-position:${escapeHtml(objectPos)}"><span>${escapeHtml(animal.nome || 'Animal')}</span></a></li>`;
                    }).join('') + '</ul></div>';
                }
                const html = `<div class="related-family-shell">${hasRelatedSubfamily ? portalHTML : ""}${tribePortalHTML}${hasRelatedSubfamily ? listHTML : ""}</div>`;
                if (container) { container.innerHTML = html; container.style.display = 'block'; }
                if (containerMobile) { containerMobile.innerHTML = html; containerMobile.style.display = 'block'; }
            } catch (error) {
                console.error("Erro ao buscar animais relacionados:", error);
            }
        }

        function normalizeDistributionRegions(distributionData = {}) {
            const raw = distributionData.regioesBiogeograficas || distributionData.regioes || [];
            if (!Array.isArray(raw)) return [];
            return raw
                .map(item => {
                    if (!item) return null;
                    const tipo = String(item.tipo || item.type || 'Regiões Biogeográficas').trim() || 'Regiões Biogeográficas';
                    const valor = String(item.valor || item.regiao || item.region || '').trim();
                    if (!valor) return null;
                    return { tipo: 'Regiões Biogeográficas', valor };
                })
                .filter(Boolean)
                .filter((item, index, arr) => arr.findIndex(other => other.tipo === item.tipo && other.valor === item.valor) === index)
                .sort((a, b) => a.valor.localeCompare(b.valor, 'pt-PT'));
        }

        function renderCountriesCollapse() {
            return `
                <details class="distribution-countries-collapse">
                    <summary>
                        <span>Países assinalados:</span>
                        <i class="fa-solid fa-chevron-down"></i>
                    </summary>
                    <div class="distribution-countries-body">
                        <div class="highlightedCountriesNames distribution-country-list">Carregando...</div>
                    </div>
                </details>`;
        }

        function getBiogeographicRegionSvg() {
            return `<svg class="metric-model-svg reproduction-icon-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="27"/>
                <path d="M13 40h54"/>
                <path d="M40 13c8 7 13 16 13 27S48 60 40 67"/>
                <path d="M40 13c-8 7-13 16-13 27s5 20 13 27"/>
                <path d="M21 24c10 5 28 5 38 0"/>
                <path d="M21 56c10-5 28-5 38 0"/>
                <path d="M34 32l6-4l7 3l-2 6l-8 1l-3-6Z"/>
                <path d="M27 45l7-2l5 5l-3 7l-8-2l-1-8Z"/>
            </svg>`;
        }

        function renderDistributionRegionsCard(distributionData = {}) {
            const regions = normalizeDistributionRegions(distributionData);
            if (!regions.length) return '';
            const regionValues = regions.map(item => item.valor);
            const regionValuesData = escapeHtml(JSON.stringify(regionValues));
            return `
                <div class="distribution-regions-card reproduction-visual-card">
                    <div class="reproduction-model-grid">
                        ${regions.map(item => `
                            <button type="button" class="dimension-model-card reproduction-model-card accent-biogeographic-region biogeographic-region-popup-trigger" data-biogeographic-region-popup data-biogeographic-regions="${regionValuesData}" aria-haspopup="dialog" aria-controls="biogeographic-region-modal" aria-label="Ver as regiões biogeográficas e o mapa-mundo">
                                <div class="dimension-model-icon">${getBiogeographicRegionSvg()}</div>
                                <div class="dimension-model-copy">
                                    <div class="dimension-model-label">${escapeHtml(item.valor)}</div>
                                    <div class="dimension-model-value">Regiões Biogeográficas</div>
                                </div>
                            </button>
                        `).join('')}
                    </div>
                </div>`;
        }

        function renderDistributionAreasLegend(distributionData = {}) {
            const areas = window.DistributionAreas?.normalizeDistributionAreas?.(distributionData.areas || []) || [];
            const points = window.DistributionAreas?.normalizeDistributionPoints?.(distributionData.pontos || []) || [];
            if (!areas.length && !points.length) return '';
            const getColor = window.DistributionAreas?.getDistributionAreaColor;
            return `
                <div class="distribution-areas-legend" aria-label="Legenda das áreas de distribuição">
                    <span class="distribution-areas-legend-title">Áreas e pontos representados</span>
                    ${areas.map(area => `
                        <span class="distribution-area-legend-item">
                            <i style="background:${getColor?.(area.tipo) || '#ef4444'}"></i>
                            ${escapeHtml(area.nome)}
                        </span>
                    `).join('')}
                    ${points.map(point => `
                        <span class="distribution-area-legend-item">
                            <i style="background:${getColor?.(point.tipo) || '#ef4444'}"></i>
                            ${escapeHtml(point.nome)}
                        </span>
                    `).join('')}
                </div>`;
        }

        function initFooterBiomaSlider(root = document) {
            root.querySelectorAll('[data-footer-bioma-slider]').forEach(slider => {
                if (slider.dataset.footerBiomaReady === 'true') return;

                const track = slider.querySelector('[data-footer-bioma-track]');
                const previousButton = slider.querySelector('[data-footer-bioma-prev]');
                const nextButton = slider.querySelector('[data-footer-bioma-next]');
                const countLabel = slider.querySelector('[data-footer-bioma-count]');
                if (!track || !previousButton || !nextButton) return;

                const totalBiomas = Number(countLabel?.textContent?.split('/').pop()?.trim() || 0);
                if (totalBiomas < 2) return;

                slider.dataset.footerBiomaReady = 'true';
                let slideIndex = 1;

                const updateCount = () => {
                    if (!countLabel) return;
                    const visibleIndex = ((slideIndex - 1 + totalBiomas) % totalBiomas) + 1;
                    countLabel.textContent = `${visibleIndex} / ${totalBiomas}`;
                };

                const setTrackPosition = (animate = true) => {
                    if (!animate) track.style.transition = 'none';
                    track.style.transform = `translateX(-${slideIndex * 100}%)`;
                    if (!animate) {
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                track.style.transition = '';
                            });
                        });
                    }
                    updateCount();
                };

                previousButton.addEventListener('click', () => {
                    slideIndex -= 1;
                    setTrackPosition();
                });

                nextButton.addEventListener('click', () => {
                    slideIndex += 1;
                    setTrackPosition();
                });

                track.addEventListener('transitionend', event => {
                    if (event.propertyName !== 'transform') return;

                    if (slideIndex === 0) {
                        slideIndex = totalBiomas;
                        setTrackPosition(false);
                    } else if (slideIndex === totalBiomas + 1) {
                        slideIndex = 1;
                        setTrackPosition(false);
                    }
                });

                updateCount();
            });
        }

        async function initAnimalNameLocalization(animalData = {}) {
            const portugueseName = String(animalData.nome || '').trim();
            const scientificName = String(animalData.nomeCientifico || '').trim();
            const localizedNames = { pt: portugueseName };
            let requestSequence = 0;

            const updateName = async language => {
                const currentRequest = ++requestSequence;
                let name = portugueseName;
                if (language !== 'pt' && scientificName) {
                    if (!localizedNames[language]) {
                        const names = await getWikidataLocalizedNames(scientificName);
                        Object.assign(localizedNames, names);
                    }
                    name = localizedNames[language] || localizedNames['en'] || portugueseName;
                }
                if (currentRequest !== requestSequence) return;
                document.querySelectorAll('[data-animal-common-name]').forEach(element => { element.textContent = name; });
                document.title = `${name} - Grandes Projetos`;
            };

            document.addEventListener('animal-language-change', event => {
                updateName(event.detail?.language || 'pt');
            });
            const initialLanguage = document.documentElement.lang === 'pt-PT' ? 'pt' : document.documentElement.lang;
            updateName(initialLanguage);
        }

        async function renderAnimalData(animalData, animalId) {
            console.log("Loaded animalData in browser:", animalData);
            document.title = `${animalData.nome} - Grandes Projetos`;
            let thumbnailsHTML = '';
            if (animalData.videos && animalData.videos.length > 0) {
                animalData.videos.forEach(videoUrl => {
                    const videoId = getYouTubeVideoId(videoUrl);
                    if (videoId) {
                        thumbnailsHTML += `
                            <div class="thumbnail" data-video-url="${videoUrl}">
                                <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="Miniatura de vídeo">
                                <div class="play-icon"><i class="fa-solid fa-play" style="transform: translateX(1px);"></i></div>
                            </div>`;
                    }
                });
            }
            thumbnailsHTML += renderAnimalAudioThumbnail(animalData);

            const hasGeralText = animalData.informacao && animalData.informacao.geral && animalData.informacao.geral.trim() !== "";
            const hasGeralVisual = getGeneralVisualModels(animalData).some(item => item?.tipo && (item?.valor || item?.valorMin || item?.valorMax) && !isLegacyGeneralMatingItem(item));
            const hasGeral = hasGeralText || hasGeralVisual;
            const hasDimensoesText = animalData.informacao?.dimensoes && animalData.informacao.dimensoes.trim() !== "";
            const hasDimensoesVisual = Array.isArray(animalData.informacao?.dimensoesDetalhadas) && animalData.informacao.dimensoesDetalhadas.some(item => item?.tipo && [item?.valor, item?.valorMin, item?.valorMax].some(value => String(value ?? '').trim() !== ''));
            const hasDimensoes = hasDimensoesText || hasDimensoesVisual;

            const hasAlimentacaoText = animalData.informacao?.alimentacao && animalData.informacao.alimentacao.trim() !== "";
            const hasAlimentacaoVisual = (Array.isArray(animalData.informacao?.alimentacaoDetalhada) && animalData.informacao.alimentacaoDetalhada.some(item => item?.tipo || item?.detalhe)) ||
                (Array.isArray(animalData.informacao?.alimentacaoEstrategias) && animalData.informacao.alimentacaoEstrategias.some(item => item?.estrategia || item?.tipo || item?.detalhe));
            const hasAlimentacao = hasAlimentacaoText || hasAlimentacaoVisual;

            const ecologyData = animalData.informacao?.ecologia || {};
            const hasEcologiaText = Boolean(String(ecologyData.resumo || ecologyData.texto || '').trim());
            const hasEcologiaVisual = Boolean(
                (Array.isArray(ecologyData.detalhes) && ecologyData.detalhes.some(isValidEcologyDetail)) ||
                ecologyData.funcaoEcologica ||
                ecologyData.funcao ||
                (Array.isArray(ecologyData.predadoresNaturais) && ecologyData.predadoresNaturais.length > 0) ||
                (Array.isArray(ecologyData.predadores) && ecologyData.predadores.length > 0) ||
                (Array.isArray(ecologyData.presas) && ecologyData.presas.length > 0) ||
                (Array.isArray(ecologyData.competidores) && ecologyData.competidores.length > 0) ||
                (Array.isArray(ecologyData.ameacasNaturais) && ecologyData.ameacasNaturais.length > 0) ||
                ecologyData.ameacasNaturaisTexto ||
                ecologyData.ameacasTexto ||
                (Array.isArray(ecologyData.relacoesSimbioticas) && ecologyData.relacoesSimbioticas.length > 0) ||
                (Array.isArray(ecologyData.relacoes) && ecologyData.relacoes.length > 0)
            );
            const hasEcologia = hasEcologiaText || hasEcologiaVisual;

            const hasReproducaoText = animalData.informacao?.reproducao && animalData.informacao.reproducao.trim() !== "";
            const hasReproducaoVisual =
                (Array.isArray(animalData.informacao?.reproducaoDetalhada) && animalData.informacao.reproducaoDetalhada.length > 0) ||
                getLegacyGeneralMatingReproductionItems(animalData.informacao?.geralDetalhada || []).length > 0;
            const hasBirdEggVisual = hasCategory(animalData.categoria, 'Aves');
            const hasReproducao = hasReproducaoText || hasReproducaoVisual || hasBirdEggVisual;

            const hasPlumagemText = animalData.informacao && animalData.informacao.plumagem && animalData.informacao.plumagem.trim() !== "";
            const hasPlumagemVisual = Array.isArray(animalData.informacao?.plumagemDetalhada) && animalData.informacao.plumagemDetalhada.some(item => item?.tipo || item?.detalhe);
            const hasPlumagem = hasPlumagemText || hasPlumagemVisual;
            
            const distributionInfo = animalData.informacao?.distribuicao || {};
            const distributionRegions = normalizeDistributionRegions(distributionInfo);
            const distributionAreas = window.DistributionAreas?.normalizeDistributionAreas?.(distributionInfo.areas || []) || [];
            let distributionPoints = window.DistributionAreas?.normalizeDistributionPoints?.(distributionInfo.pontos || []) || [];
            const savedDistributionCountries = Array.isArray(distributionInfo.paises) ? distributionInfo.paises : [];
            const hasManualDistribution = distributionAreas.length > 0 || distributionPoints.length > 0 || savedDistributionCountries.length > 0;
            let hasDynamicDistribution = false;
            if (!hasManualDistribution && animalData.nomeCientifico) {
                try {
                    const dynamicDistribution = await fetchDynamicDistribution(animalData.nomeCientifico);
                    distributionPoints = dynamicDistribution.points;
                    hasDynamicDistribution = dynamicDistribution.points.length > 0 || dynamicDistribution.countryCodes.length > 0;
                    if (dynamicDistribution.countryCodes.length) distributionInfo.paises = dynamicDistribution.countryCodes;
                    animalData.informacao = animalData.informacao || {};
                    animalData.informacao.distribuicao = distributionInfo;
                } catch (error) {
                    console.warn('Distribuição dinâmica indisponível:', error);
                }
            }
            const hasDistribicaoText = distributionInfo.descricao && distributionInfo.descricao.trim() !== '';
            const hasDistribicao = hasManualDistribution || hasDynamicDistribution || Boolean(hasDistribicaoText) || distributionRegions.length > 0;

            const hasCuriosidadesText = animalData.informacao?.curiosidades?.texto && animalData.informacao.curiosidades.texto.trim() !== "";
            const hasCuriosidadesVisual = animalData.informacao?.curiosidades && (
                animalData.informacao.curiosidades.cor ||
                animalData.informacao.curiosidades.estadoConservacao ||
                animalData.informacao.curiosidades.tipoComunicacao ||
                animalData.informacao.curiosidades.temperaturaAmbiente ||
                animalData.informacao.curiosidades.distanciaPercorrida ||
                animalData.informacao.curiosidades.horasSono ||
                animalData.informacao.curiosidades.maiorPesoRegistado ||
                animalData.informacao.curiosidades.relacaoHumanos ||
                (Array.isArray(animalData.informacao.curiosidades.tambemConhecidoComo) && animalData.informacao.curiosidades.tambemConhecidoComo.length > 0) ||
                (Array.isArray(animalData.informacao.curiosidades.detalhes) && animalData.informacao.curiosidades.detalhes.some(item => {
                    if (!item?.tipo) return false;
                    const hasValue = item.valor !== undefined && item.valor !== null && String(item.valor).trim() !== "";
                    const hasMin = item.valorMin !== undefined && item.valorMin !== null && String(item.valorMin).trim() !== "";
                    const hasMax = item.valorMax !== undefined && item.valorMax !== null && String(item.valorMax).trim() !== "";
                    return hasValue || hasMin || hasMax;
                }))
            );
            const hasCuriosidades = hasCuriosidadesText || hasCuriosidadesVisual;

            console.log("Section flags:", {
                hasGeralText,
                hasGeralVisual,
                hasGeral,
                hasDimensoesText,
                hasDimensoesVisual,
                hasDimensoes,
                hasAlimentacaoText,
                hasAlimentacaoVisual,
                hasAlimentacao,
                hasEcologiaText,
                hasEcologiaVisual,
                hasEcologia,
                hasReproducaoText,
                hasReproducaoVisual,
                hasReproducao,
                hasPlumagemText,
                hasPlumagemVisual,
                hasPlumagem,
                hasDistribicaoText,
                hasDistribicao,
                hasCuriosidades
            });

            // Preparar as estatísticas da secção de dimensões
            const dimensoes = animalData.informacao?.dimensoesDetalhadas || [];
            const hasMetricValue = item => [item?.valor, item?.valorMin, item?.valorMax]
                .some(value => String(value ?? '').trim() !== '');
            const validDimensoes = collapseCombinedGenderItems(
                Array.isArray(dimensoes) ? dimensoes.filter(item => item.tipo && hasMetricValue(item)) : []
            );

            const models = animalData.informacao?.geralDetalhada || [];
            const isEnv = isGeneralEnvironmentModel;
            const validQuickData = collapseCombinedGenderItems(
                Array.isArray(models) ? models.filter(item => item.tipo && (item.valor || item.valorMin || item.valorMax) && !isEnv(item) && !isLegacyGeneralMatingItem(item)) : []
            );
            const envQuickData = collapseCombinedGenderItems(
                Array.isArray(models) ? models.filter(item => item.tipo && (item.valor || item.valorMin || item.valorMax) && isEnv(item)) : []
            );

            const allItems = [...validDimensoes, ...validQuickData];
            const genders = collectConcreteGenders(allItems);
            const phases = new Set(allItems.map(i => i.fase).filter(Boolean));
            const infoModelItems = validQuickData.map(item => ({ ...item, isDimension: false }));
            const dimensionModelItems = validDimensoes.map(item => ({ ...item, isDimension: true }));
            const useInfoTabs = Boolean(hasGeralText || infoModelItems.length || dimensionModelItems.length);
            const generalModelItems = infoModelItems.filter(item => getGeneralFormTabForType(item.tipo) === 'geral');
            const measureModelItems = infoModelItems.filter(item => getGeneralFormTabForType(item.tipo) === 'medidas');

            const navItems = [];
            if (useInfoTabs) {
                navItems.push({ desktopHref: '#info-modelos-visuais', mobileHref: '#info-modelos-visuais-mobile', visualTab: 'general', label: 'Geral' });
                if (infoModelItems.length) navItems.push({ desktopHref: '#info-modelos-visuais', mobileHref: '#info-modelos-visuais-mobile', visualTab: 'measures', label: 'Medidas' });
                if (hasDimensoesText || hasDimensoesVisual) navItems.push({ desktopHref: '#info-modelos-visuais', mobileHref: '#info-modelos-visuais-mobile', visualTab: 'dimensions', label: 'Dimensões' });
            }
            if (hasAlimentacao) navItems.push({ href: '#info-alimentacao', label: 'Alimentação' });
            if (hasEcologia) navItems.push({ href: '#info-ecologia', label: 'Ecologia' });
            if (hasReproducao) navItems.push({ href: '#info-reproducao', label: 'Reprodução' });
            if (hasPlumagem) navItems.push({ href: '#info-plumagem', label: getBodyCoveringTitle(animalData) });
            if (hasDistribicao) navItems.push({ href: '#info-distribuicao', label: 'Distribuição' });
            if (hasCuriosidades) navItems.push({ href: '#info-curiosidades', label: 'Curiosidades' });

            const navHTMLDesktop = navItems.map((item, idx) => {
                const desktopHref = item.desktopHref || item.href;
                const tabAttribute = item.visualTab ? ` data-visual-model-tab-target="${item.visualTab}"` : '';
                return `<a href="${desktopHref}" class="nav-anchor ${idx === 0 ? 'active' : ''}"${tabAttribute}>${item.label}</a>`;
            }).join('');
            const navHTMLMobile = navItems.map((item, idx) => {
                const desktopHref = item.desktopHref || item.href;
                const mobileHref = item.mobileHref || `${desktopHref}-mobile`;
                const tabAttribute = item.visualTab ? ` data-visual-model-tab-target="${item.visualTab}"` : '';
                return `<a href="${mobileHref}" class="nav-anchor ${idx === 0 ? 'active' : ''}"${tabAttribute}>${item.label}</a>`;
            }).join('');

            const hasScientificClassification = Boolean(
                animalData.reino ||
                animalData.filo ||
                animalData.subfilo ||
                animalData.classe ||
                animalData.subclasse ||
                animalData.infraclasse ||
                animalData.magnordem ||
                animalData.superordem ||
                animalData.ordem ||
                animalData.subordem ||
                animalData.infraordem ||
                animalData.parvordem ||
                animalData.superfamilia ||
                animalData.familia ||
                animalData.subfamilia ||
                animalData.tribo ||
                animalData.genero ||
                animalData.subgenero ||
                animalData.especie ||
                animalData.autoridadeTaxonomica ||
                (Array.isArray(animalData.subespeciesDe) && animalData.subespeciesDe.length > 0)
            );

            const classificationRow = (filterType, label, value, options = {}) =>
                value
                    ? `<div class="scientific-classification-row"><strong>${label}</strong><span>${renderClassificationFilterValue(filterType, value, options)}</span></div>`
                    : '';

            const classificationEntries = [
                ['reino', 'Reino:', animalData.reino],
                ['filo', 'Filo:', animalData.filo],
                ['subfilo', 'Subfilo:', animalData.subfilo],
                ['classe', 'Classe:', animalData.classe],
                ['subclasse', 'Subclasse:', animalData.subclasse],
                ['infraclasse', 'Infraclasse:', animalData.infraclasse],
                ['magnordem', 'Magnordem:', animalData.magnordem],
                ['superordem', 'Superordem:', animalData.superordem],
                ['ordem', 'Ordem:', animalData.ordem],
                ['subordem', 'Subordem:', animalData.subordem],
                ['infraordem', 'Infraordem:', animalData.infraordem],
                ['parvordem', 'Parvordem:', animalData.parvordem],
                ['superfamilia', 'Superfamília:', animalData.superfamilia],
                ['familia', 'Família:', animalData.familia],
                ['subfamilia', 'Subfamília:', animalData.subfamilia],
                ['tribo', 'Tribo:', animalData.tribo],
                ['genero', 'Género:', animalData.genero, { italic: true }],
                ['subgenero', 'Subgénero:', animalData.subgenero, { italic: true }],
                ['especie', 'Espécie:', animalData.especie, { italic: true }],
                ['autoridadeTaxonomica', 'Autoridade taxonómica:', animalData.autoridadeTaxonomica]
            ];
            const primaryClassificationTypes = new Set([
                'reino', 'filo', 'subfilo', 'classe', 'infraclasse',
                'ordem', 'familia', 'subfamilia', 'genero', 'especie'
            ]);
            const renderClassificationEntries = entries => entries
                .map(([filterType, label, value, options]) => classificationRow(filterType, label, value, options))
                .join('');
            const scientificClassificationPrimaryRowsLinkedHTML = renderClassificationEntries(
                classificationEntries.filter(([filterType]) => primaryClassificationTypes.has(filterType))
            );
            const scientificClassificationRowsLinkedHTML = renderClassificationEntries(classificationEntries) + ((Array.isArray(animalData.subespeciesDe) && animalData.subespeciesDe.length > 0) ? `
                <div class="scientific-classification-row">
                    <strong>Subespécie de:</strong>
                    <span class="subespecies-names">Carregando...</span>
                </div>` : '');
            const hasExpandedClassification = classificationEntries.some(([filterType, , value]) =>
                value && !primaryClassificationTypes.has(filterType)
            ) || (Array.isArray(animalData.subespeciesDe) && animalData.subespeciesDe.length > 0);

            const classificationToggleHTML = detailsId => hasExpandedClassification ? `
                <button type="button" class="scientific-classification-toggle" data-classification-toggle aria-expanded="false" aria-label="Ver classificação completa" title="Ver classificação completa" aria-controls="${detailsId}">
                    <span class="scientific-classification-toggle-label" data-classification-toggle-label>Ver classificação completa</span>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </button>` : '';

            const scientificClassificationSectionDesktopHTML = hasScientificClassification ? `
                <div class="info-section-card desktop-only scientific-classification-card" id="info-classificacao" style="margin-top: 24px; border-color: rgba(139, 92, 246, 0.3); background: linear-gradient(135deg, rgba(6, 182, 212, 0.04), rgba(236, 72, 153, 0.04), rgba(9, 9, 20, 0.85)); padding: 24px; box-shadow: 0 8px 32px rgba(139, 92, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.02);">
                    <h3 style="font-size: 1.25rem; margin-bottom: 14px; padding-bottom: 8px; display: flex; align-items: center; border-bottom: 1px solid var(--border-color); color: var(--text-primary);">
                        <span class="icon" style="margin-right: 10px; display: inline-flex;"><i class="fa-solid fa-dna" style="font-size: 1.1rem; background: linear-gradient(135deg, #06b6d4, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i></span>Classificação científica
                    </h3>
                    <div class="classification-grid scientific-classification-primary" style="display: flex; flex-direction: column; gap: 8px; font-size: 0.95rem;">
                        ${scientificClassificationPrimaryRowsLinkedHTML}
                    </div>
                    <div class="classification-grid scientific-classification-expanded" id="scientific-classification-details-desktop" data-classification-details hidden>
                        ${scientificClassificationRowsLinkedHTML}
                    </div>
                    ${classificationToggleHTML('scientific-classification-details-desktop')}
                </div>
            ` : '';

            const scientificClassificationSectionMobileHTML = hasScientificClassification ? `
                <div class="info-section scientific-classification-card" id="info-classificacao-mobile">
                    <h3><span class="icon" style="margin-right: 10px; display: inline-flex;"><i class="fa-solid fa-dna" style="font-size: 1.1rem; background: linear-gradient(135deg, #06b6d4, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i></span>Classificação científica</h3>
                    <div class="classification-grid scientific-classification-primary" style="display: flex; flex-direction: column; gap: 8px; font-size: 0.95rem; margin-top: 15px;">
                        ${scientificClassificationPrimaryRowsLinkedHTML}
                    </div>
                    <div class="classification-grid scientific-classification-expanded" id="scientific-classification-details-mobile" data-classification-details hidden>
                        ${scientificClassificationRowsLinkedHTML}
                    </div>
                    ${classificationToggleHTML('scientific-classification-details-mobile')}
                </div>
            ` : '';

            const sanitizeScientificClassificationHtml = (html = '') => html
                .replaceAll('Classificação científica', 'Classificação científica')
                .replaceAll('Família:', 'Família:')
                .replaceAll('Género:', 'Género:')
                .replaceAll('Espécie:', 'Espécie:')
                .replaceAll('Subespécie de:', 'Subespécie de:')
                .replaceAll('Família:', 'Família:')
                .replaceAll('Género:', 'Género:')
                .replaceAll('Espécie:', 'Espécie:')
                .replaceAll('Subespécie de:', 'Subespécie de:');
            const scientificClassificationSectionDesktopCleanHTML = sanitizeScientificClassificationHtml(scientificClassificationSectionDesktopHTML);
            const scientificClassificationSectionMobileCleanHTML = sanitizeScientificClassificationHtml(scientificClassificationSectionMobileHTML);
            const forceScientificClassificationHtml = (html = '') => html
                .replace(/Classifica[^<]*cient[^<]*fica/g, 'Classifica\u00e7\u00e3o cient\u00edfica')
                .replace(/Fam[^<]*lia:/g, 'Fam\u00edlia:')
                .replace(/G[^<]*nero:/g, 'G\u00e9nero:')
                .replace(/Esp[^<]*cie:/g, 'Esp\u00e9cie:')
                .replace(/Subesp[^<]*cie de:/g, 'Subesp\u00e9cie de:');
            const scientificClassificationSectionDesktopFinalHTML = forceScientificClassificationHtml(scientificClassificationSectionDesktopCleanHTML);
            const scientificClassificationSectionMobileFinalHTML = forceScientificClassificationHtml(scientificClassificationSectionMobileCleanHTML);

            const feedSections = {
                imagem: true,
                classificacao: true,
                feedEnabled: true,
                subespecies: true,
                relacionados: true,
                galeria: true,
                geral: true,
                dimensoes: true,
                alimentacao: true,
                ecologia: true,
                reproducao: true,
                plumagem: true,
                distribuicao: true,
                curiosidades: true,
                modelos: true,
                ambiente: true,
                pageNav: true,
                ...(animalData.feedSections || {})
            };

            const applyAnimalFeedVisibility = () => {
                const selectors = {
                    imagem: ['.top-card-media-col > .anatomy-widget', '.left-column > .anatomy-widget'],
                    classificacao: ['#info-classificacao', '#info-classificacao-mobile'],
                    subespecies: ['#subspecies-parent-animals-container', '#subspecies-parent-animals-container-mobile'],
                    relacionados: ['#related-animals-container', '#related-animals-container-mobile'],
                    galeria: ['#animal-gallery', '#animal-gallery-mobile'],
                    geral: ['#info-geral', '#info-geral-mobile'],
                    dimensoes: ['#info-dimensoes', '#info-dimensoes-mobile'],
                    alimentacao: ['#info-alimentacao', '#info-alimentacao-mobile'],
                    ecologia: ['#info-ecologia', '#info-ecologia-mobile'],
                    reproducao: ['#info-reproducao', '#info-reproducao-mobile'],
                    plumagem: ['#info-plumagem', '#info-plumagem-mobile'],
                    distribuicao: ['#info-distribuicao', '#info-distribuicao-mobile'],
                    curiosidades: ['#info-curiosidades', '#info-curiosidades-mobile'],
                    modelos: ['#info-modelos-visuais', '#info-modelos-visuais-mobile', '#info-modelos-visuais-top', '#info-modelos-visuais-top-mobile'],
                    ambiente: ['#info-ambiente', '#info-ambiente-mobile'],
                    pageNav: ['.page-nav']
                };

                Object.entries(selectors).forEach(([key, sectionSelectors]) => {
                    if (feedSections[key] !== false) return;
                    sectionSelectors.flatMap(selector => [...document.querySelectorAll(selector)]).forEach(section => {
                        section.hidden = true;
                        section.setAttribute('aria-hidden', 'true');
                        section.style.setProperty('display', 'none', 'important');
                    });
                });
                if (feedSections.geral === false) {
                    document.querySelectorAll('[data-visual-model-tab="general"], [data-visual-model-pane="general"]').forEach(element => { element.hidden = true; });
                }
                if (feedSections.dimensoes === false) {
                    document.querySelectorAll('[data-visual-model-tab="dimensions"], [data-visual-model-pane="dimensions"]').forEach(element => { element.hidden = true; });
                }
                if (feedSections.feedEnabled === false) {
                    document.querySelectorAll('.top-card-tabs-col').forEach(element => {
                        element.hidden = true;
                        element.setAttribute('aria-hidden', 'true');
                    });
                    document.querySelectorAll('.animal-top-card').forEach(element => {
                        element.style.display = 'block';
                        element.style.maxWidth = '368px';
                        element.style.margin = '0 auto 28px';
                    });
                }
            };

            setTimeout(applyAnimalFeedVisibility, 0);
            
            // Extract quick parameters dynamically
            const allCombinedItems = [
                ...(animalData.informacao?.geralDetalhada || []),
                ...(animalData.informacao?.dimensoesDetalhadas || []),
                ...(animalData.informacao?.curiosidades?.detalhes || []),
                ...(infoModelItems || []),
                ...(dimensionModelItems || [])
            ];
            
            function findQuickMetric(items, keywords) {
                return items.find(item => {
                    const tipo = String(item.tipo || '').toLowerCase();
                    return keywords.some(k => tipo.includes(k));
                });
            }

            const heightItem = findQuickMetric(allCombinedItems, ['altura']);
            const weightItem = findQuickMetric(allCombinedItems, ['peso']);
            const lengthItem = findQuickMetric(allCombinedItems, ['comprimento total', 'comprimento']);
            const lifeItem = findQuickMetric(allCombinedItems, ['vida útil', 'esperança de vida', 'expectativa de vida', 'longevidade']);

            const heightVal = formatDimension(heightItem, 'N/D');
            const weightVal = formatDimension(weightItem, 'N/D');
            const lengthVal = formatDimension(lengthItem, 'N/D');
            const lifeVal = formatDimension(lifeItem, 'N/D');

            const iucnStatusValue = animalData.informacao?.curiosidades?.estadoConservacao || animalData.estadoConservacao || 'LC';
            const iucnMeta = getConservationStatusMeta(iucnStatusValue);
            const taxonomyParts = [
                animalData.reino ? `Reino ${animalData.reino}` : 'Reino Animalia',
                animalData.classe ? `Classe ${animalData.classe}` : 'Classe Mammalia',
                animalData.ordem ? `Ordem ${animalData.ordem}` : 'Ordem Artiodactyla'
            ].filter(Boolean).join(' &bull; ');

            const audioId = getAnimalAudioId(animalData);

            const findModelCardValue = (typeKeyword) => {
                const item = infoModelItems.find(i => String(i.tipo || '').toLowerCase().includes(typeKeyword.toLowerCase()));
                if (!item) return 'N/D';
                const activeCats = [];
                if (typeof item.categoria === 'object') {
                    Object.entries(item.categoria).forEach(([k, v]) => {
                        if (v === true) activeCats.push(k);
                    });
                } else if (item.categoria) {
                    activeCats.push(item.categoria);
                }
                return activeCats.length > 0 ? activeCats.join(' / ') : 'N/D';
            };

            const atividadeVal = findModelCardValue('Atividade');
            const locomocaoVal = findModelCardValue('Locomoção');
            const estratoVal = findModelCardValue('Estrato');
            const orgSocialVal = findModelCardValue('Organização');
            const compSazonalVal = findModelCardValue('Comportamento') || 'Nómada';

            mainContent.innerHTML = `
                <div class="video-section">
                    <div id="video-thumbnails">${thumbnailsHTML}</div>
                    <div id="main-video-container">
                        <iframe frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
                
                <nav class="page-nav desktop-only" data-page-nav>
                    <a class="page-nav-home" href="index.html" aria-label="Página inicial"><i class="fa-solid fa-paw" aria-hidden="true"></i></a>
                    ${navHTMLDesktop}
                </nav>
                
                <!-- Redesigned Top Card Container -->
                <div class="animal-top-card-container desktop-only">
                    <div class="animal-top-card-redesign" data-visual-model-tabs>
                        
                        <!-- Top Navigation Tabs spanning full width -->
                        ${useInfoTabs
                            ? `
                            <div class="top-card-redesign-header" style="margin-bottom: 0px;">
                                ${renderTopCardTabbedModelSection({
                                    id: 'info-modelos-visuais-top-header',
                                    generalText: animalData.informacao?.geral || '',
                                    dimensionText: animalData.informacao?.dimensoes || '',
                                    infoModelItems: infoModelItems,
                                    dimensionModelItems: dimensionModelItems,
                                    animalData: animalData,
                                    onlyHeader: true
                                })}
                            </div>
                            `
                            : ''
                        }
                        
                        <div class="top-card-redesign-body">
                            <!-- Left Column: Image, taxonomy, iucn, quick params, footer actions -->
                            <div class="top-card-left-col">
                                <section class="anatomy-widget">
                                    <div class="animal-image-top">
                                        <div class="profile-image-loader" style="display: none; position: absolute; inset: 0; align-items: center; justify-content: center; background: rgba(9, 9, 20, 0.45); backdrop-filter: blur(6px); z-index: 5; border-radius: 18px;">
                                            <i class="fa-solid fa-paw fa-fade" style="font-size: 3rem; color: #10b981;"></i>
                                        </div>
                                        <img data-profile-main-image src="${escapeHtml(animalData.imagemUrl || '')}" alt="${escapeHtml(animalData.nome || 'Animal')}" style="object-position: ${escapeHtml(animalData.imagemObjectPosition || 'center center')};">
                                        <div class="image-pager"><i class="fa-regular fa-image"></i> <span>1/12</span></div>
                                    </div>
                                </section>
                                
                                <div class="left-column-details">
                                    <div class="name-row">
                                        <h1 data-animal-common-name>${animalData.nome}</h1>
                                        <button type="button" class="bookmark-btn" aria-label="Favorito"><i class="fa-regular fa-bookmark"></i></button>
                                    </div>
                                    
                                    <div class="scientific-name-row">
                                        <h2 class="scientific-name">${animalData.nomeCientifico}</h2>
                                        ${audioId ? `
                                            <button type="button" class="audio-btn-inline" data-animal-audio-panel-toggle data-audio-id="${escapeHtml(audioId)}" aria-label="Áudio" title="Áudio">
                                                <i class="fa-solid fa-volume-high"></i>
                                            </button>
                                        ` : ''}
                                        <button type="button" class="badge-accepted" data-conservation-status="${escapeHtml(iucnStatusValue)}" style="cursor: pointer; background: color-mix(in srgb, ${iucnMeta.bg} 15%, transparent); border: 1px solid color-mix(in srgb, ${iucnMeta.bg} 35%, transparent); color: color-mix(in srgb, ${iucnMeta.bg} 90%, #ffffff); font-family: inherit;">
                                            <i class="fa-solid fa-shield-halved"></i> ${iucnMeta.code}
                                        </button>
                                    </div>
                                    <div class="top-card-divider"></div>
                                    <div class="quick-params-grid">
                                        <div class="quick-param-card">
                                            <div class="quick-param-icon">${getMetricModelSvg('altura')}</div>
                                            <div class="quick-param-info">
                                                <span class="quick-param-label">Altura</span>
                                                <span class="quick-param-value">${heightVal}</span>
                                            </div>
                                        </div>
                                        <div class="quick-param-card">
                                            <div class="quick-param-icon">${getMetricModelSvg('peso')}</div>
                                            <div class="quick-param-info">
                                                <span class="quick-param-label">Peso</span>
                                                <span class="quick-param-value">${weightVal}</span>
                                            </div>
                                        </div>
                                        <div class="quick-param-card">
                                            <div class="quick-param-icon">${getMetricModelSvg('comprimento')}</div>
                                            <div class="quick-param-info">
                                                <span class="quick-param-label">Comprimento</span>
                                                <span class="quick-param-value">${lengthVal}</span>
                                            </div>
                                        </div>
                                        <div class="quick-param-card">
                                            <div class="quick-param-icon">${getGeneralCatalogModelSvg('vida')}</div>
                                            <div class="quick-param-info">
                                                <span class="quick-param-label">Vida útil</span>
                                                <span class="quick-param-value">${lifeVal}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="top-card-divider"></div>
                                    <div class="left-column-actions">
                                        <button type="button" class="left-action-btn" aria-label="Gostar"><i class="fa-regular fa-heart"></i></button>
                                        <button type="button" class="left-action-btn" aria-label="Lista"><i class="fa-solid fa-list-ul"></i></button>
                                        <button type="button" class="left-action-btn" aria-label="Partilhar"><i class="fa-solid fa-share-nodes"></i></button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Right Column: Top metrics & Tabs section -->
                            <div class="top-card-right-col">
                                <div class="top-card-tabs-wrapper">
                                    ${useInfoTabs
                                        ? renderTopCardTabbedModelSection({
                                            id: 'info-modelos-visuais-top-panes',
                                            generalText: animalData.informacao?.geral || '',
                                            dimensionText: animalData.informacao?.dimensoes || '',
                                            infoModelItems: infoModelItems,
                                            dimensionModelItems: dimensionModelItems,
                                            animalData: animalData,
                                            onlyPanes: true
                                        })
                                        : ''
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Original 3-Column Content Grid Below -->
                <div class="content-grid has-3-cols">
                    <!-- Column 1: Related Animals & Subspecies -->
                    <div class="left-column">
                        ${renderAnimalMediaBlock(animalData, animalId)}
                        <div id="animal-profile-actions"></div>
                        ${scientificClassificationSectionDesktopFinalHTML}
                        <div id="subspecies-parent-animals-container" class="desktop-only" style="display: none;"></div>
                        <div id="related-animals-container" class="desktop-only" style="display: none;"></div>
                    </div>
                    
                    <!-- Column 2: Full Detailed Sections -->
                    <div class="middle-column desktop-only">
                        ${renderAnimalGallery(animalData.nomeCientifico)}
                        ${hasGeralText && !useInfoTabs ? `
                        <div class="info-section-card" id="info-geral">
                            <h3><span class="icon svg-icon">${getInfoSectionIconSvg('geral')}</span>Informação Geral</h3>
                            <p>${animalData.informacao.geral}</p>
                        </div>` : ''}

                        ${hasDimensoesText && !useInfoTabs ? `
                        <div class="info-section-card" id="info-dimensoes">
                            <h3><span class="icon svg-icon">${getInfoSectionIconSvg('dimensoes')}</span><span>Dimensões</span></h3>
                            <p>${animalData.informacao.dimensoes}</p>
                        </div>` : ''}

                        ${hasAlimentacao ? `
                        <div class="info-section-card" id="info-alimentacao">
                            <h3><span class="icon svg-icon">${getInfoSectionIconSvg('alimentacao')}</span>Alimentação</h3>
                            ${animalData.informacao.alimentacao ? `<p>${animalData.informacao.alimentacao}</p>` : ''}
                            ${renderFeedingVisual(animalData)}
                        </div>` : ''}

                        ${hasEcologia ? `
                        <div class="info-section-card" id="info-ecologia">
                            <h3><span class="icon svg-icon">${getInfoSectionIconSvg('ecologia')}</span>Ecologia</h3>
                            ${renderEcologyVisual(animalData)}
                        </div>` : ''}

                        ${hasReproducao ? `
                        <div class="info-section-card" id="info-reproducao">
                            <h3><span class="icon svg-icon">${getInfoSectionIconSvg('reproducao')}</span>Reprodução</h3>
                            ${animalData.informacao.reproducao ? `<p>${animalData.informacao.reproducao}</p>` : ''}
                            ${renderReproductionVisual(animalData)}
                        </div>` : ''}

                        ${hasPlumagem ? `
                        <div class="info-section-card" id="info-plumagem">
                            <h3><span class="icon svg-icon">${getInfoSectionIconSvg('plumagem')}</span>${escapeHtml(getBodyCoveringTitle(animalData))}</h3>
                            ${animalData.informacao.plumagem ? `<p>${animalData.informacao.plumagem}</p>` : ''}
                            ${renderPlumageVisual(animalData)}
                        </div>` : ''}

                        ${hasDistribicao ? `
                        <div class="info-section-card" id="info-distribuicao">
                            <h3><span class="icon svg-icon">${getInfoSectionIconSvg('distribuicao')}</span>Distribuição</h3>
                            <div class="distribution-stacked-layout" style="margin-top: 20px; display: flex; flex-direction: column; gap: 16px;">
                                ${hasDistribicaoText ? `<p>${animalData.informacao.distribuicao.descricao}</p>` : ''}
                                    <div class="map-container-wrapper">
                                        <div class="map-container" id="distributionMapDetailDesktop" style="height: 320px;"></div>
                                    </div>
                                    ${renderDistributionAreasLegend(animalData.informacao.distribuicao)}
                                    ${renderCountriesCollapse()}
                                    ${renderDistributionRegionsCard(animalData.informacao.distribuicao)}
                            </div>
                        </div>` : ''}

                        ${hasCuriosidades ? `
                        <div class="info-section-card" id="info-curiosidades">
                            <h3><span class="icon svg-icon">${getInfoSectionIconSvg('curiosidades')}</span>Curiosidades</h3>
                            ${renderCuriosidadesVisual(animalData)}
                            ${hasCuriosidadesText ? `<p style="margin-top: 15px; line-height: 1.6;">${animalData.informacao.curiosidades.texto}</p>` : ''}
                        </div>` : ''}
                    </div>

                    <!-- Column 3: Visual Models & Climate Zone -->
                    <div class="column-3 desktop-only">
                        ${useInfoTabs
                            ? renderTabbedModelSection({
                                id: 'info-modelos-visuais',
                                generalText: animalData.informacao?.geral || '',
                                dimensionText: animalData.informacao?.dimensoes || '',
                                generalItems: generalModelItems,
                                measureItems: measureModelItems,
                                dimensionItems: dimensionModelItems,
                                generalFilterContext: { genders: collectConcreteGenders(generalModelItems), phases: new Set(generalModelItems.map(item => item.fase).filter(Boolean)) },
                                measureFilterContext: { genders: collectConcreteGenders(measureModelItems), phases: new Set(measureModelItems.map(item => item.fase).filter(Boolean)) },
                                dimensionFilterContext: { genders: collectConcreteGenders(dimensionModelItems), phases: new Set(dimensionModelItems.map(item => item.fase).filter(Boolean)) }
                            })
                            : renderModelSection({
                                id: 'info-modelos-visuais',
                                title: 'Infos',
                                icon: getInfoSectionIconSvg('geral'),
                                items: [...infoModelItems, ...dimensionModelItems],
                                filterContext: { genders, phases },
                                showGroupFilters: true
                            })}

                        ${envQuickData.length > 0
                            ? renderEnvironmentSections(envQuickData, { genders, phases }, { id: 'info-ambiente' })
                            : ''}
                    </div>
                </div>
                <!-- Stacked Mobile Version -->
                <div class="animal-details mobile-only">
                    <div class="header mobile-only">
                        ${renderAnimalLanguageSelect()}
                        <h1 data-animal-common-name>${animalData.nome}</h1>
                        <h2 class="scientific-name">(${animalData.nomeCientifico})</h2>
                    </div>
                    <nav class="page-nav" data-page-nav>
                        <a class="page-nav-home" href="index.html" aria-label="Página inicial"><i class="fa-solid fa-paw" aria-hidden="true"></i></a>
                        ${navHTMLMobile}
                    </nav>
                    <div class="animal-top-card-container mobile-only">
                        <div class="animal-top-card">
                            <div class="top-card-media-col">
                                ${renderAnimalMediaBlock(animalData, animalId)}
                                <div id="animal-profile-actions"></div>
                            </div>
                            <div class="top-card-tabs-col">
                                ${useInfoTabs
                                    ? renderTopCardTabbedModelSection({
                                        id: 'info-modelos-visuais-top-mobile',
                                        generalText: animalData.informacao?.geral || '',
                                        dimensionText: animalData.informacao?.dimensoes || '',
                                        infoModelItems: infoModelItems,
                                        dimensionModelItems: dimensionModelItems,
                                        animalData: animalData,
                                        mobile: true
                                    })
                                    : ''
                                }
                            </div>
                        </div>
                    </div>
                    <div class="info-sections">
                        ${useInfoTabs
                            ? renderTabbedModelSection({
                                id: 'info-modelos-visuais-mobile',
                                generalText: animalData.informacao?.geral || '',
                                dimensionText: animalData.informacao?.dimensoes || '',
                                generalItems: generalModelItems,
                                measureItems: measureModelItems,
                                dimensionItems: dimensionModelItems,
                                generalFilterContext: { genders: collectConcreteGenders(generalModelItems), phases: new Set(generalModelItems.map(item => item.fase).filter(Boolean)) },
                                measureFilterContext: { genders: collectConcreteGenders(measureModelItems), phases: new Set(measureModelItems.map(item => item.fase).filter(Boolean)) },
                                dimensionFilterContext: { genders: collectConcreteGenders(dimensionModelItems), phases: new Set(dimensionModelItems.map(item => item.fase).filter(Boolean)) },
                                mobile: true
                            })
                            : renderModelSection({
                                id: 'info-modelos-visuais-mobile',
                                title: 'Infos',
                                icon: getInfoSectionIconSvg('geral'),
                                items: [...infoModelItems, ...dimensionModelItems],
                                filterContext: { genders, phases },
                                mobile: true,
                                showGroupFilters: true
                            })}
                            ${envQuickData.length > 0
                                ? renderEnvironmentSections(envQuickData, { genders, phases }, { id: 'info-ambiente-mobile', mobile: true })
                                : ''}

                            ${renderAnimalGallery(animalData.nomeCientifico, true)}

                            ${hasGeralText && !useInfoTabs ? `
                            <div class="info-section" id="info-geral-mobile">
                                <h3><span class="icon svg-icon">${getInfoSectionIconSvg('geral')}</span>Informação Geral</h3>
                                <p>${animalData.informacao.geral}</p>
                            </div>` : ''}

                            ${hasDimensoesText && !useInfoTabs ? `
                            <div class="info-section" id="info-dimensoes-mobile">
                                <h3><span class="icon svg-icon">${getInfoSectionIconSvg('dimensoes')}</span><span>Dimensões</span></h3>
                                <p>${animalData.informacao.dimensoes || ''}</p>
                            </div>` : ''}

                            ${hasAlimentacao ? `
                            <div class="info-section" id="info-alimentacao-mobile">
                                <h3><span class="icon svg-icon">${getInfoSectionIconSvg('alimentacao')}</span>Alimentação</h3>
                                ${hasAlimentacaoText ? `<p>${animalData.informacao.alimentacao}</p>` : ''}
                                ${renderFeedingVisual(animalData)}
                            </div>` : ''}
                            ${hasEcologia ? `
                            <div class="info-section" id="info-ecologia-mobile">
                                <h3><span class="icon svg-icon">${getInfoSectionIconSvg('ecologia')}</span>Ecologia</h3>
                                ${renderEcologyVisual(animalData)}
                            </div>` : ''}
                            ${hasReproducao ? `
                            <div class="info-section" id="info-reproducao-mobile">
                                <h3><span class="icon svg-icon">${getInfoSectionIconSvg('reproducao')}</span>Reprodução</h3>
                                <p>${animalData.informacao.reproducao || ''}</p>
                                ${renderReproductionVisual(animalData)}
                            </div>` : ''}
                            ${hasPlumagem ? `
                            <div class="info-section" id="info-plumagem-mobile">
                                <h3><span class="icon svg-icon">${getInfoSectionIconSvg('plumagem')}</span>${escapeHtml(getBodyCoveringTitle(animalData))}</h3>
                                <p>${animalData.informacao.plumagem || 'Sem detalhes sobre a plumagem.'}</p>
                                ${renderPlumageVisual(animalData)}
                            </div>` : ''}
                            ${hasDistribicao ? `
                            <div class="info-section" id="info-distribuicao-mobile">
                                <h3><span class="icon svg-icon">${getInfoSectionIconSvg('distribuicao')}</span>Distribuição</h3>
                                <div class="distribution-stacked-layout" style="margin-top: 20px; display: flex; flex-direction: column; gap: 16px;">
                                    ${animalData.informacao.distribuicao.descricao && animalData.informacao.distribuicao.descricao.trim() !== "" ? `<p>${animalData.informacao.distribuicao.descricao}</p>` : ''}
                                    <div class="map-container-wrapper">
                                        <div class="map-container" id="distributionMapDetailMobile" style="height: 320px;"></div>
                                    </div>
                                    ${renderDistributionAreasLegend(animalData.informacao.distribuicao)}
                                    ${renderCountriesCollapse()}
                                    ${renderDistributionRegionsCard(animalData.informacao.distribuicao)}
                                </div>
                            </div>` : ''}

                            ${hasCuriosidades ? `
                            <div class="info-section" id="info-curiosidades-mobile">
                                <h3><span class="icon svg-icon">${getInfoSectionIconSvg('curiosidades')}</span>Curiosidades</h3>
                                ${renderCuriosidadesVisual(animalData)}
                                ${hasCuriosidadesText ? `<p style="margin-top: 15px; line-height: 1.6;">${animalData.informacao.curiosidades.texto}</p>` : ''}
                            </div>` : ''}
                            ${scientificClassificationSectionMobileFinalHTML}
                            <div id="subspecies-parent-animals-container-mobile" class="info-section mobile-only" style="margin-top: 24px; display: none;"></div>
                            <div id="related-animals-container-mobile" class="info-section mobile-only" style="margin-top: 24px; display: none;"></div>
                        </div>
                    </div>
                </div>
                ${(() => {
                    const hasFooterImage = !!animalData.imagemRodape;
                    const hasFooterComparison = animalData.rodapeComparacaoOn !== false;
                    const hasEsqueleto = !!animalData.rodapeHasEsqueleto;
                    const hasAnatomia = !!animalData.rodapeHasAnatomia;
                    const cleanSciName = String(animalData.nomeCientifico || '').trim().replace(/\s+/g, '_');

                    const models = animalData.informacao?.geralDetalhada || [];
                    const footerBiomaBackgroundFiles = {
                        agricola: 'Agrícola.png',
                        areas_rochosas: 'Áreas rochosas.png',
                        bioma_antropogenico: 'Bioma antropogénico.png',
                        bosque: 'bosque.png',
                        floresta: 'floresta.png',
                        campo_bioma: 'Campo (bioma).png',
                        campos_temperados: 'Campos temperados.png',
                        calota_de_gelo: 'calota de gelo.png',
                        caverna: 'caverna.png',
                        chaparral: 'chaparral.png',
                        costa: 'costa.png',
                        duna: 'duna.png',
                        estuario: 'Estuário.png',
                        estepe: 'estepe.png',
                        fauna_urbana: 'fauna urbana.png',
                        floresta_decidua_temperada: 'Floresta decídua temperada.png',
                        floresta_temperada_de_coniferas: 'Floresta temperada de coníferas.png',
                        floresta_tropical_e_subtropical_humida: 'Floresta tropical e subtropical húmida.png',
                        floresta_tropical_seca: 'Floresta tropical seca.png',
                        florestas_tropicais_de_coniferas: 'Florestas tropicais de coníferas.png',
                        lago: 'Lago.png',
                        manguezal: 'Manguezal.png',
                        marinho: 'marinho.png',
                        marinho_corais: 'Marinho (corais).png',
                        matagal: 'matagal.png',
                        montanha: 'montanha.png',
                        pantano: 'pântano.png',
                        pradaria: 'pradaria.png',
                        rio: 'Rio.png',
                        savana: 'savana.png',
                        savana_tropical: 'Savana tropical.png',
                        suburbio: 'Subúrbio.png',
                        taiga: 'Taiga.png',
                        tundra: 'Tundra.png',
                        zona_entremareas: 'Zona entremarés.png',
                        zona_entremare_s: 'Zona entremarés.png',
                        zona_humida: 'Zona húmida.png',
                        zona_neritica: 'Zona nerítica.png',
                        zona_pelagica: 'Zona pelágica.png',
                        zona_riparia: 'Zona ripária.png'
                    };
                    const biomaValues = [];
                    if (Array.isArray(models)) {
                        models
                            .filter(item => item?.tipo && normalizeDimensionKey(item.tipo).includes('bioma'))
                            .forEach(item => {
                                const rawValue = item.valor || item.valorMin || item.valorMax || '';
                                const values = Array.isArray(rawValue) ? rawValue : String(rawValue).split(/[,;|]/);
                                values
                                    .map(value => String(value).trim())
                                    .filter(Boolean)
                                    .forEach(value => {
                                        if (!biomaValues.some(existing => normalizeDimensionKey(existing) === normalizeDimensionKey(value))) {
                                            biomaValues.push(value);
                                        }
                                    });
                            });
                    }
                    const footerBiomas = biomaValues
                        .map(value => {
                            const key = normalizeDimensionKey(value).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
                            return { value, meta: getBiomaMeta(value), backgroundFile: footerBiomaBackgroundFiles[key] };
                        })
                        .filter(item => item.backgroundFile);
                    const rodapeParamsOn = animalData.rodapeParamsOn || [];
                    const footerCards = [];
                    
                    if (rodapeParamsOn.length > 0) {
                        const allDetails = [];
                        const addSafe = (arr) => {
                            if (Array.isArray(arr)) {
                                allDetails.push(...arr.filter(Boolean));
                            }
                        };
                        
                        addSafe(animalData.informacao?.geralDetalhada);
                        addSafe(animalData.informacao?.dimensoesDetalhadas);
                        addSafe(animalData.informacao?.alimentacaoDetalhada);
                        addSafe(animalData.informacao?.reproducaoDetalhada);
                        addSafe(animalData.informacao?.plumagemDetalhada);
                        
                        const cur = animalData.informacao?.curiosidades;
                        if (cur) {
                            if (Array.isArray(cur)) {
                                allDetails.push(...cur);
                            } else if (Array.isArray(cur.detalhes)) {
                                allDetails.push(...cur.detalhes);
                            }
                        }
                        
                        const ecologyItems = animalData.informacao?.ecologia;
                        if (ecologyItems && typeof ecologyItems === 'object') {
                            if (Array.isArray(ecologyItems)) {
                                allDetails.push(...ecologyItems);
                            } else {
                                Object.keys(ecologyItems).forEach(k => {
                                    const val = ecologyItems[k];
                                    if (val && typeof val === 'object') {
                                        allDetails.push({ tipo: k, ...val });
                                    } else if (typeof val === 'string') {
                                        allDetails.push({ tipo: k, valor: val });
                                    }
                                });
                            }
                        }

                        const getDisplayVal = (item) => {
                            if (!item) return '';
                            if (item.valor) return item.valor;
                            if (item.detalhe) return item.detalhe;
                            if (item.texto) return item.texto;
                            if (item.valorMin || item.valorMax) {
                                const min = item.valorMin || '';
                                const max = item.valorMax || '';
                                const unit = item.unidade || '';
                                if (min && max) return `${min}-${max} ${unit}`.trim();
                                return `${min || max} ${unit}`.trim();
                            }
                            if (item.animais && item.animais.length) {
                                return item.animais.map(a => a.nome || a.id).join(', ');
                            }
                            return '';
                        };
                        
                        const isNumericParam = (paramName, item) => {
                            const normalizedParamName = normalizeDimensionKey(paramName);
                            const primaryValue = item?.valor ?? item?.valorMin ?? '';
                            const isTextualValue = typeof primaryValue === 'string' && primaryValue.trim() !== '' && !/^-?\d+(?:[.,]\d+)?(?:-\d+(?:[.,]\d+)?)?$/.test(primaryValue.trim());
                            const isDropdownOnly = isDropdownOnlyGeneralCatalogModel(paramName) || (
                                !item?.unidade &&
                                (item?.valorMax === undefined || String(item.valorMax).trim() === '') &&
                                isTextualValue
                            );

                            if (isDropdownOnly) return false;

                            if (item && (item.valorMin !== undefined || item.valorMax !== undefined || item.unidade)) {
                                return true;
                            }
                            const label = normalizedParamName;
                            const numericKeywords = [
                                'vida', 'velocidade', 'tamanho', 'populacao', 'peso', 'comprimento', 'altura',
                                'largura', 'espessura', 'sono', 'distancia', 'temperatura', 'envergadura', 
                                'metabolica', 'muda', 'estadio', 'ovo', 'cria', 'nascimento', 'gestacao', 'eclosao', 'idade'
                            ];
                            return numericKeywords.some(kw => label.includes(kw));
                        };
                        
                        const getRankingUrl = (paramName) => {
                            const name = String(paramName || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                            if (name.includes('vida') || name.includes('longevidade')) {
                                return 'filtros.html?tipo=mais-vida-util&valor=Com%20mais%20Vida%20%C3%BAtil';
                            }
                            if (name.includes('velocidade') || name.includes('veloz')) {
                                return 'filtros.html?tipo=mais-velozes&valor=Os%20Mais%20Velozes';
                            }
                            if (name.includes('altura')) {
                                return 'filtros.html?tipo=mais-altos&valor=Os%20Mais%20Altos';
                            }
                            if (name.includes('peso')) {
                                return 'filtros.html?tipo=mais-pesados&valor=Os%20Mais%20Pesados';
                            }
                            if (name.includes('largura') || name.includes('envergadura')) {
                                return 'filtros.html?tipo=mais-largo&valor=Mais%20Largo';
                            }
                            if (name.includes('espessura')) {
                                return 'filtros.html?tipo=mais-espesso&valor=Mais%20Espesso';
                            }
                            if (name.includes('tamanho') && name.includes('popul')) {
                                return `filtros.html?tipo=${POPULATION_RANKING_KEY}&valor=ranking`;
                            }
                            return `filtros.html?tipo=${encodeURIComponent(paramName)}&valor=ranking`;
                        };

                        rodapeParamsOn.forEach(paramName => {
                            const foundItem = allDetails.find(item => {
                                if (!item) return false;
                                const label = item.tipo || item.type || item.label || item.categoria || '';
                                return label.toLowerCase().trim() === paramName.toLowerCase().trim();
                            });
                            if (foundItem) {
                                const valStr = getDisplayVal(foundItem);
                                if (valStr) {
                                    const numeric = isNumericParam(paramName, foundItem);
                                    if (numeric) {
                                        footerCards.push({
                                            label: paramName,
                                            value: '',
                                            isRanking: true,
                                            url: getRankingUrl(paramName)
                                        });
                                    } else {
                                        footerCards.push({
                                            label: paramName,
                                            value: valStr,
                                            isRanking: false,
                                            url: `filtros.html?tipo=${encodeURIComponent(paramName)}&valor=${encodeURIComponent(valStr)}`
                                        });
                                    }
                                }
                            }
                        });
                    }

                    if (!hasFooterImage && !hasEsqueleto && !hasAnatomia && !hasFooterComparison && footerCards.length === 0) return '';

                    return `
                        <div class="footer-anatomy-section">
                            ${(hasEsqueleto || hasAnatomia) ? `
                                <div class="footer-anatomy-svgs-row">
                                    ${hasEsqueleto ? `
                                        <div class="footer-svg-container" data-svg-url="assets/anatomy/${cleanSciName}_esqueleto_interativo.svg">
                                            <div class="footer-svg-title">Esqueleto</div>
                                            <div class="svg-content-wrapper">
                                                <div class="svg-loading-placeholder">A carregar esqueleto...</div>
                                            </div>
                                        </div>
                                    ` : ''}
                                    ${hasAnatomia ? `
                                        <div class="footer-svg-container" data-svg-url="assets/anatomy/${cleanSciName}_orgaos_interativo.svg">
                                            <div class="footer-svg-title">Anatomia</div>
                                            <div class="svg-content-wrapper">
                                                <div class="svg-loading-placeholder">A carregar anatomia...</div>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}
                            ${hasFooterComparison ? `
                                <div class="footer-comparison-layout">
                                    <section class="animal-comparison-section" data-animal-comparison aria-labelledby="animal-comparison-title">
                                        <div class="animal-comparison-heading">
                                            <div>
                                                <span class="animal-comparison-kicker">Comparação visual</span>
                                                <h2 id="animal-comparison-title"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> Comparar com outro animal</h2>
                                            </div>
                                            <a class="animal-comparison-open-button" href="vs.html?id=${encodeURIComponent(animalId)}" aria-label="Abrir página de comparação" title="Abrir página de comparação">
                                                <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                                                Abrir comparação completa
                                            </a>
                                            <div class="animal-comparison-search">
                                                <label class="animal-comparison-select-label" for="animal-comparison-search-input">Animal</label>
                                                <input id="animal-comparison-search-input" data-comparison-search type="search" autocomplete="off" placeholder="Pesquisar por nome comum ou científico..." aria-label="Pesquisar animal para comparar" aria-controls="animal-comparison-search-results" aria-expanded="false">
                                                <div id="animal-comparison-search-results" class="animal-comparison-search-results" data-comparison-search-results role="listbox" hidden></div>
                                            </div>
                                        </div>
                                        <div data-comparison-table>
                                            <p class="animal-comparison-empty">A preparar a comparação...</p>
                                        </div>
                                    </section>
                                    <div class="footer-comparison-promos" aria-label="Explorar outros temas de comparação">
                                        <div class="footer-comparison-promo-item">
                                            <a href="vs.html?id=${encodeURIComponent(animalId)}" class="footer-comparison-promo footer-comparison-promo-footprints" aria-label="Pegadas de leão e elefante na praia" style="display: block;">
                                                <span class="footer-comparison-promo-label label-orange">Comparar animais</span>
                                            </a>
                                        </div>
                                        <div class="footer-comparison-promo-item">
                                            <a href="lab.html?id=${encodeURIComponent(animalId)}" class="footer-comparison-promo footer-comparison-promo-mushrooms" aria-label="Visitar o laboratório deste animal">
                                                <span class="footer-comparison-promo-label">Visite o laboratório</span>
                                            </a>
                                        </div>
                                        <div class="footer-comparison-promo-item">
                                            <article class="footer-comparison-promo footer-comparison-promo-metamorphosis" aria-label="Metamorfose de uma borboleta">
                                                <span class="footer-comparison-promo-label">Metamorfose</span>
                                            </article>
                                        </div>
                                    </div>
</div>
                            ` : ''}                            ${(hasFooterImage || footerCards.length > 0) ? `
                                <div class="footer-image-row" style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap; justify-content: center; width: 100%;">
                                    ${hasFooterImage ? `
                                        <div class="footer-image-card ${footerBiomas.length ? 'has-cartoon-bg' : ''}" style="margin: 0;"${footerBiomas.length > 1 ? ' data-footer-bioma-slider' : ''}>
                                            ${footerBiomas.length ? (() => {
                                                const slides = footerBiomas.length > 1
                                                    ? [footerBiomas[footerBiomas.length - 1], ...footerBiomas, footerBiomas[0]]
                                                    : footerBiomas;
                                                const initialSlide = footerBiomas.length > 1 ? 1 : 0;
                                                return `
                                                    <div class="footer-cartoon-track" data-footer-bioma-track data-slide-index="${initialSlide}" style="transform: translateX(-${initialSlide * 100}%);">
                                                        ${slides.map(item => `
                                                            <div class="footer-cartoon-slide">
                                                                <img src="assets/biomas_cartoon/${item.backgroundFile}" class="footer-cartoon-slide-image" alt="" loading="lazy" aria-hidden="true">
                                                            </div>
                                                        `).join('')}
                                                    </div>
                                                    ${footerBiomas.length > 1 ? `
                                                        <button type="button" class="footer-bioma-arrow footer-bioma-arrow-left" data-footer-bioma-prev aria-label="Bioma anterior">
                                                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
                                                        </button>
                                                        <button type="button" class="footer-bioma-arrow footer-bioma-arrow-right" data-footer-bioma-next aria-label="Bioma seguinte">
                                                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
                                                        </button>
                                                        <span class="footer-bioma-count" data-footer-bioma-count aria-live="polite">1 / ${footerBiomas.length}</span>
                                                    ` : ''}
                                                `;
                                            })() : ''}
                                            <img src="${escapeHtml(animalData.imagemRodape)}" alt="Imagem de rodapé de ${escapeHtml(animalData.nome)}" class="footer-main-image">
                                        </div>
                                    ` : ''}
                                    ${footerCards.length > 0 ? (() => {
                                        const gradients = [
                                            'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',   // Blue
                                            'linear-gradient(135deg, #059669 0%, #047857 100%)',   // Emerald
                                            'linear-gradient(135deg, #d97706 0%, #b45309 100%)',   // Amber
                                            'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',    // Red
                                            'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',   // Purple
                                            'linear-gradient(135deg, #db2777 0%, #be185d 100%)',   // Pink
                                            'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',    // Cyan
                                            'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',   // Orange
                                            'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',  // Teal
                                            'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'    // Indigo
                                        ];
                                        const borderColors = [
                                            '#1e40af',
                                            '#065f46',
                                            '#92400e',
                                            '#991b1b',
                                            '#5b21b6',
                                            '#9d174d',
                                            '#155e75',
                                            '#9a3412',
                                            '#115e59',
                                            '#3730a3'
                                        ];
                                        return `
                                            <div class="footer-collection-cards" style="display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 280px; max-width: 450px; text-align: left;">
                                                ${footerCards.slice(0, 8).map((card, idx) => {
                                                    const bgGrad = gradients[idx % gradients.length];
                                                    const borderColor = borderColors[idx % borderColors.length];
                                                    const cardText = card.isRanking 
                                                        ? `Coleção ${escapeHtml(card.label)}`
                                                        : `<strong style="color: #ffffff; text-decoration: underline; text-underline-offset: 3px;">${escapeHtml(card.value)}</strong> <span style="opacity: 0.92;">— Coleção ${escapeHtml(card.label)}</span>`;
                                                    return `
                                                        <a href="${card.url}" class="footer-collection-card" style="display: flex; align-items: center; padding: 12px 18px; background: ${bgGrad}; border: 1px solid ${borderColor}; border-radius: 10px; text-decoration: none; color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); font-size: 0.92rem; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.2);" onmouseover="this.style.filter='brightness(1.15) saturate(1.1)'; this.style.transform='translateX(4px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.25)';" onmouseout="this.style.filter='none'; this.style.transform='none'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
                                                            <i class="fa-solid fa-tags" style="margin-right: 12px; color: #ffffff; opacity: 0.9; font-size: 1rem;"></i>
                                                            <span>${cardText}</span>
                                                        </a>
                                                    `;
                                                }).join('')}
                                            </div>
                                        `;
                                    })() : ''}
                                </div>
                            ` : ''}
                        </div>
                    `;
                })()}
            `;

            initAnimalLanguage(mainContent);
            initAnimalNameLocalization(animalData);

            initScientificClassificationToggles(mainContent);
            initAnimalMediaBlock(mainContent);
            initFooterAnatomyTabs(mainContent);
            initAnimalComparison(mainContent, animalData, animalId);
            initFooterBiomaSlider(mainContent);
            initAnimalAudioControls(mainContent);
            initAnimalProfileActions({ animalId });
            initConservationStatusPopup(mainContent);
            initFeedingTypePopup(mainContent);
            initPerceptionTypePopup(mainContent);
            initSocialTypePopup(mainContent);
            initSkeletonTypePopup(mainContent);
            initThermoregulationPopup(mainContent);
            initBodySymmetryPopup(mainContent);
            initEcologicalStratumPopup(mainContent);
            initGroupCompositionPopup(mainContent);
            initLocomotionPopup(mainContent);
            initKinshipLineagePopup(mainContent);
            initLeadershipHierarchyPopup(mainContent);
            initDigestiveSystemPopup(mainContent);
            initActivityPopup(mainContent);
            initTerritorySizePopup(mainContent);
            initFeedingStrategyPopup(mainContent);
            initEcologicalFunctionPopup(mainContent);
            initMatingSystemPopup(mainContent);
            initSexualSystemPopup(mainContent);
            initBiogeographicRegionPopup(mainContent);
            initCommunicationTypePopup(mainContent);
            initEcologyRelationsPopup(mainContent);
            initEnvironmentVisualPopup(mainContent);
            initClimateZoneMapPopup(mainContent);
            
            if (hasDistribicao) {
                const selectedCodes = (animalData.informacao.distribuicao.paises || [])
                    .map(normalizeCountryCode)
                    .filter(Boolean);
                const automaticCodes = new Set(
                    Array.isArray(animalData.informacao.distribuicao.paisesAutomaticos)
                        ? animalData.informacao.distribuicao.paisesAutomaticos.map(normalizeCountryCode)
                        : []
                );
                const highlightedCodes = selectedCodes.filter(code => !automaticCodes.has(code));
                const paisesDetalhes = animalData.informacao.distribuicao.paisesDetalhes || {};

                function applySubregionGradient(code, subregion, mapId) {
                    const svgDefs = document.querySelector('#aurora-gradient-svg defs');
                    if (!svgDefs) return;

                    const existingGrad = document.getElementById(`grad-${code}`);
                    if (!existingGrad) {
                        const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
                        grad.setAttribute('id', `grad-${code}`);
                        
                        let stopColor1 = '#f59e0b';
                        let stopColor2 = '#2e2e38';
                        let offset = '50%';
                        let x1 = '0%', y1 = '0%', x2 = '0%', y2 = '0%';

                        if (subregion === 'esquerdo') { // Oeste
                            x2 = '100%';
                            if (code === 'US') {
                                offset = '60%';
                            }
                        } else if (subregion === 'direito') { // Este
                            x2 = '100%';
                            if (code === 'US') {
                                offset = '60%';
                            }
                            stopColor1 = '#2e2e38';
                            stopColor2 = '#f59e0b';
                        } else if (subregion === 'cima') { // Norte
                            y2 = '100%';
                            if (code === 'US') {
                                offset = '65%';
                            }
                        } else if (subregion === 'baixo') { // Sul
                            y2 = '100%';
                            if (code === 'US') {
                                offset = '65%';
                            }
                            stopColor1 = '#2e2e38';
                            stopColor2 = '#f59e0b';
                        }

                        grad.setAttribute('x1', x1);
                        grad.setAttribute('y1', y1);
                        grad.setAttribute('x2', x2);
                        grad.setAttribute('y2', y2);

                        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
                        stop1.setAttribute('offset', offset);
                        stop1.setAttribute('stop-color', stopColor1);

                        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
                        stop2.setAttribute('offset', offset);
                        stop2.setAttribute('stop-color', stopColor2);

                        grad.appendChild(stop1);
                        grad.appendChild(stop2);

                        svgDefs.appendChild(grad);
                    }

                    setTimeout(() => {
                        const container = document.getElementById(mapId);
                        if (!container) return;
                        const paths = container.querySelectorAll(`[data-code="${code}"]`);
                        paths.forEach(path => {
                            if (subregion === 'inteiro') {
                                path.setAttribute('fill', '#f59e0b');
                                path.style.fill = '#f59e0b';
                            } else {
                                path.setAttribute('fill', `url(#grad-${code})`);
                                path.style.fill = `url(#grad-${code})`;
                            }
                        });
                    }, 80);
                }

                const mapIds = ['distributionMapDetailDesktop', 'distributionMapDetailMobile', 'distributionMapCardTopDesktop', 'distributionMapCardTopMobile'];
                
                function initMap(mapId) {
                    const container = document.getElementById(mapId);
                    if (!container) return;
                    if (container.classList.contains('jsvectormap-init-done')) return;

                    let attempts = 0;
                    const initInterval = setInterval(() => {
                        attempts++;
                        if (attempts > 50) { // Limit attempts to 5 seconds
                            clearInterval(initInterval);
                            return;
                        }
                        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                            clearInterval(initInterval);
                            if (container.classList.contains('jsvectormap-init-done')) return;

                            try {
                                const mapDetail = new jsVectorMap({
                                    selector: `#${mapId}`,
                                    map: 'world',
                                    regionsSelectable: false,
                                    selectedRegions: highlightedCodes,
                                    zoomButtons: false,
                                    zoomOnScroll: false,
                                    regionStyle: {
                                        initial: {
                                            fill: '#2e2e38',
                                            fillOpacity: 1,
                                            stroke: '#3b3b4f',
                                            strokeWidth: 0.5
                                        },
                                        selected: {
                                            fill: '#f59e0b',
                                            fillOpacity: 1
                                        }
                                    }
                                });

                                const createAreaOverlay = window.DistributionAreas?.createDistributionAreaOverlay;
                                if (typeof createAreaOverlay === 'function') {
                                    const areaOverlay = createAreaOverlay(container, {
                                        areas: distributionAreas,
                                        points: distributionPoints
                                    });
                                    areaOverlay?.render(distributionAreas, [], distributionPoints);
                                }

                                container.classList.add('jsvectormap-init-done');

                                // Apply gradients on loaded regions
                                highlightedCodes.forEach(code => {
                                    applySubregionGradient(code, paisesDetalhes[code] || 'inteiro', mapId);
                                });

                                // Polling focus handler: waits for map container to have actual size in browser layout
                                const hasDrawnGeometry = distributionAreas.length > 0 || distributionPoints.length > 0;
                                if (hasDrawnGeometry || highlightedCodes.length > 0) {
                                    let focusAttempts = 0;
                                    const focusInterval = setInterval(() => {
                                        focusAttempts++;
                                        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                                            const focusGeometry = window.DistributionAreas?.focusDistributionGeometry;
                                            const geometryFocused = typeof focusGeometry === 'function' && focusGeometry(
                                                mapDetail,
                                                container,
                                                distributionAreas,
                                                distributionPoints,
                                                { animate: false, padding: 0.35, maximumZoom: 7 }
                                            );
                                            if (geometryFocused) {
                                                clearInterval(focusInterval);
                                                return;
                                            }

                                            if (highlightedCodes.length === 0) {
                                                clearInterval(focusInterval);
                                                return;
                                            }

                                            try {
                                                mapDetail.setFocus({ regions: highlightedCodes, animate: false });
                                                clearInterval(focusInterval);
                                            } catch (e) {
                                                try {
                                                    mapDetail.setFocus({ region: highlightedCodes[0], animate: false });
                                                    clearInterval(focusInterval);
                                                } catch (err) {
                                                    console.error("Erro ao focar regiões:", err);
                                                    clearInterval(focusInterval);
                                                }
                                            }
                                        }
                                        if (focusAttempts > 20) {
                                            clearInterval(focusInterval);
                                        }
                                    }, 80);
                                }
                            } catch (error) {
                                console.error("Erro ao inicializar o mapa jvectormap:", error);
                            }
                        }
                    }, 100);
                }

                // Initial attempts to render the visible map
                setTimeout(() => {
                    mapIds.forEach(initMap);
                }, 120);

                // Also initialize on resize in case user rotates or changes layout size
                window.addEventListener('resize', () => {
                    mapIds.forEach(initMap);
                });

                initDistributionCountryPopup({
                    db,
                    containers: mapIds.map(mapId => document.getElementById(mapId)),
                    countryList,
                    currentAnimalId: animalId
                });

                const namesSpans = document.querySelectorAll('.highlightedCountriesNames');
                namesSpans.forEach(namesSpan => {
                    const subLabels = {
                        'inteiro': 'País inteiro',
                        'esquerdo': 'Lado esquerdo',
                        'direito': 'Lado direito',
                        'cima': 'Lado de cima',
                        'baixo': 'Lado de baixo'
                    };
                    const countryCards = selectedCodes.map(code => {
                        const country = getCountryRecord(code);
                        const name = country.nome || country.name || code;
                        const subregion = paisesDetalhes[code] || 'inteiro';
                        return `
                            <article class="distribution-country-card">
                                <span class="distribution-country-flag" aria-hidden="true">${getCountryFlagEmoji(code)}</span>
                                <span class="distribution-country-copy">
                                    <strong>${escapeHtml(name)}</strong>
                                    <small>${escapeHtml(subLabels[subregion] || subregion)}</small>
                                </span>
                            </article>`;
                    });
                    namesSpan.innerHTML = countryCards.length > 0
                        ? countryCards.join('')
                        : '<p class="distribution-country-empty">Nenhum país selecionado.</p>';
                });
            }

            // Carregar nomes das subespécies de
            if (Array.isArray(animalData.subespeciesDe) && animalData.subespeciesDe.length > 0) {
                const namesContainers = document.querySelectorAll('.subespecies-names');
                if (namesContainers.length > 0) {
                    Promise.all(animalData.subespeciesDe.map(async (parentId) => {
                        try {
                            const parentDoc = await getDoc(doc(db, "animais", parentId));
                            if (parentDoc.exists()) {
                                const data = parentDoc.data();
                                return `<a href="animal.html?id=${parentId}" style="color: var(--primary-color); text-decoration: underline;">${escapeHtml(data.nome)}</a>`;
                            }
                        } catch (e) {
                            console.error(e);
                        }
                        return null;
                    })).then(links => {
                        const validLinks = links.filter(Boolean);
                        const linksHTML = validLinks.length > 0 ? validLinks.join(', ') : 'Desconhecido';
                        namesContainers.forEach(container => {
                            container.innerHTML = linksHTML;
                        });
                    });
                }
            }

            document.querySelectorAll('.thumbnail[data-video-url]').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    playVideo(thumb.dataset.videoUrl, thumb);
                });
            });

            // Lógica para abas de género (Macho/Fêmea) e fase (Adulto/Cria)
            function applyCombinedFilters(container) {
                if (!container) return;
                
                const activeGenderBtn = container.querySelector('.gender-tab-btn.active');
                const activePhaseBtn = container.querySelector('.phase-tab-btn.active');
                const activeGroupBtn = container.querySelector('.info-group-filter-btn.active');
                
                const selectedGender = activeGenderBtn ? activeGenderBtn.dataset.gender : null;
                const selectedPhase = activePhaseBtn ? activePhaseBtn.dataset.phase : 'Adulto';
                const selectedGroup = activeGroupBtn ? activeGroupBtn.dataset.group : '';
                
                const groupedCards = container.querySelectorAll('.visual-model-group-card');
                groupedCards.forEach(groupCard => {
                    const groupRows = groupCard.querySelectorAll('.general-model-value-row');
                    let visibleRows = 0;
                    groupRows.forEach(row => {
                        const rowGender = row.dataset.gender || '';
                        const rowPhase = row.dataset.phase || 'Adulto';
                        const rowGroup = row.dataset.infoGroup || groupCard.dataset.infoGroup || '';
                        const matchesGender = genderMatchesSelection(rowGender, selectedGender);
                        const matchesPhase = rowPhase === selectedPhase;
                        const matchesGroup = !selectedGroup || rowGroup === selectedGroup;
                        const isVisible = matchesGender && matchesPhase && matchesGroup;
                        row.style.display = isVisible ? '' : 'none';
                        if (isVisible) visibleRows += 1;
                    });
                    groupCard.style.display = visibleRows > 0 ? '' : 'none';
                });

                const cards = container.querySelectorAll('.dimension-model-card:not(.visual-model-group-card)');
                cards.forEach(card => {
                    const cardGender = card.dataset.gender || '';
                    const cardPhase = card.dataset.phase || 'Adulto';
                    const cardGroup = card.dataset.infoGroup || '';
                    
                    const matchesGender = genderMatchesSelection(cardGender, selectedGender);
                    const matchesPhase = cardPhase === selectedPhase;
                    const matchesGroup = !selectedGroup || cardGroup === selectedGroup;
                    
                    if (matchesGender && matchesPhase && matchesGroup) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }

            document.querySelectorAll('.info-group-filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const isActive = btn.classList.contains('active');
                    btn.parentElement.querySelectorAll('.info-group-filter-btn').forEach(button => {
                        button.classList.remove('active');
                    });
                    if (!isActive) btn.classList.add('active');
                    const container = btn.closest('.visual-model-tab-pane') || btn.closest('.info-section-card') || btn.closest('.info-section');
                    applyCombinedFilters(container);
                });
            });

            document.querySelectorAll('[data-visual-model-tab]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const section = btn.closest('[data-visual-model-tabs]');
                    if (!section) return;

                    const selectedTab = btn.dataset.visualModelTab;
                    section.classList.toggle('is-dimensions-active', selectedTab === 'dimensions');
                    section.querySelectorAll('[data-visual-model-pane]').forEach(pane => {
                        pane.toggleAttribute('hidden', pane.dataset.visualModelPane !== selectedTab);
                        pane.classList.toggle('is-active', pane.dataset.visualModelPane === selectedTab);
                    });
                    section.querySelectorAll('[data-visual-model-tab]').forEach(tab => {
                        const isActive = tab.dataset.visualModelTab === btn.dataset.visualModelTab;
                        tab.classList.toggle('is-active', isActive);
                        tab.setAttribute('aria-selected', String(isActive));
                    });
                });
            });

            // Registrar cliques nas abas de género
            document.querySelectorAll('.gender-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const selectedGender = btn.dataset.gender;
                    const tabbedSection = btn.closest('.visual-model-tabs');
                    
                    const handleButtonState = (mBtn) => {
                        mBtn.parentElement.querySelectorAll('.gender-tab-btn').forEach(b => {
                            b.classList.remove('active');
                            b.style.background = 'transparent';
                            b.style.borderColor = 'transparent';
                            b.style.color = 'rgba(255, 255, 255, 0.4)';
                            const spans = b.querySelectorAll('span');
                            if (spans.length >= 2) {
                                spans[0].style.color = 'rgba(255, 255, 255, 0.3)';
                                spans[1].style.color = 'rgba(255, 255, 255, 0.3)';
                            }
                        });
                        mBtn.classList.add('active');
                        if (selectedGender === 'M') {
                            mBtn.style.color = '#3b82f6';
                            mBtn.style.background = 'rgba(59, 130, 246, 0.12)';
                            mBtn.style.borderColor = 'rgba(59, 130, 246, 0.15)';
                        } else if (selectedGender === 'F') {
                            mBtn.style.color = '#ec4899';
                            mBtn.style.background = 'rgba(236, 72, 153, 0.12)';
                            mBtn.style.borderColor = 'rgba(236, 72, 153, 0.15)';
                        } else {
                            mBtn.style.color = 'rgba(255, 255, 255, 0.9)';
                            mBtn.style.background = 'rgba(255, 255, 255, 0.08)';
                            mBtn.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                            const spans = mBtn.querySelectorAll('span');
                            if (spans.length >= 2) {
                                spans[0].style.color = '#3b82f6';
                                spans[1].style.color = '#ec4899';
                            }
                        }
                    };

                    if (tabbedSection) {
                        const matchingButtons = tabbedSection.querySelectorAll(`.gender-tab-btn[data-gender="${selectedGender}"]`);
                        matchingButtons.forEach(mBtn => {
                            handleButtonState(mBtn);
                            const container = mBtn.closest('.visual-model-tab-pane') || mBtn.closest('.info-section-card') || mBtn.closest('.general-visual-card') || mBtn.closest('.dimensions-visual-card') || mBtn.closest('.info-section');
                            applyCombinedFilters(container);
                        });
                    } else {
                        handleButtonState(btn);
                        const container = btn.closest('.visual-model-tab-pane') || btn.closest('.info-section-card') || btn.closest('.general-visual-card') || btn.closest('.dimensions-visual-card') || btn.closest('.info-section');
                        applyCombinedFilters(container);
                    }
                });
            });

            // Registrar cliques nas abas de fase
            document.querySelectorAll('.phase-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const selectedPhase = btn.dataset.phase;
                    const tabbedSection = btn.closest('.visual-model-tabs');
                    
                    if (tabbedSection) {
                        const matchingButtons = tabbedSection.querySelectorAll(`.phase-tab-btn[data-phase="${selectedPhase}"]`);
                        matchingButtons.forEach(mBtn => {
                            mBtn.parentElement.querySelectorAll('.phase-tab-btn').forEach(b => {
                                b.classList.remove('active');
                                b.style.background = 'transparent';
                                b.style.borderColor = 'transparent';
                                b.style.color = 'rgba(255, 255, 255, 0.4)';
                            });
                            mBtn.classList.add('active');
                            mBtn.style.color = selectedPhase === 'Adulto' ? '#10b981' : '#f59e0b';
                            mBtn.style.background = selectedPhase === 'Adulto' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)';
                            mBtn.style.borderColor = selectedPhase === 'Adulto' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';
                            
                            const container = mBtn.closest('.visual-model-tab-pane') || mBtn.closest('.info-section-card') || mBtn.closest('.general-visual-card') || mBtn.closest('.dimensions-visual-card') || mBtn.closest('.info-section');
                            applyCombinedFilters(container);
                        });
                    } else {
                        btn.parentElement.querySelectorAll('.phase-tab-btn').forEach(b => {
                            b.classList.remove('active');
                            b.style.background = 'transparent';
                            b.style.borderColor = 'transparent';
                            b.style.color = 'rgba(255, 255, 255, 0.4)';
                        });
                        btn.classList.add('active');
                        btn.style.color = selectedPhase === 'Adulto' ? '#10b981' : '#f59e0b';
                        btn.style.background = selectedPhase === 'Adulto' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)';
                        btn.style.borderColor = selectedPhase === 'Adulto' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';
                        
                        const container = btn.closest('.visual-model-tab-pane') || btn.closest('.info-section-card') || btn.closest('.general-visual-card') || btn.closest('.dimensions-visual-card') || btn.closest('.info-section');
                        applyCombinedFilters(container);
                    }
                });
            });

            // Header button handlers to sync with phase and gender switches
            const headerPawBtn = document.querySelector('.nav-header-controls .paw-btn');
            const headerGenderBtn = document.querySelector('.nav-header-controls .gender-btn');

            if (headerPawBtn) {
                let currentPhase = 'Adulto';
                headerPawBtn.addEventListener('click', () => {
                    currentPhase = currentPhase === 'Adulto' ? 'Cria' : 'Adulto';
                    headerPawBtn.classList.toggle('active', currentPhase === 'Adulto');
                    const targetBtn = document.querySelector(`.phase-tab-btn[data-phase="${currentPhase}"]`) || 
                                      document.querySelector(`.profile-image-badge.phase-switch [data-phase-option="${currentPhase}"]`);
                    if (targetBtn) {
                        targetBtn.click();
                    } else {
                        document.querySelectorAll('.visual-model-tab-pane, .info-section-card, .general-visual-card').forEach(container => {
                            applyCombinedFilters(container);
                        });
                    }
                });
            }

            if (headerGenderBtn) {
                let genderIndex = 0; // 0: Both, 1: Male, 2: Female
                const genders = ['', 'M', 'F'];
                headerGenderBtn.addEventListener('click', () => {
                    genderIndex = (genderIndex + 1) % 3;
                    const selectedGender = genders[genderIndex];
                    
                    headerGenderBtn.classList.remove('active-m', 'active-f');
                    if (selectedGender === 'M') {
                        headerGenderBtn.classList.add('active-m');
                        headerGenderBtn.textContent = '♂';
                    } else if (selectedGender === 'F') {
                        headerGenderBtn.classList.add('active-f');
                        headerGenderBtn.textContent = '♀';
                    } else {
                        headerGenderBtn.textContent = '♂/♀';
                    }
                    
                    const targetBtn = document.querySelector(`.gender-tab-btn[data-gender="${selectedGender}"]`) ||
                                      document.querySelector(`.profile-image-badge[data-profile-badge-key="gender:${selectedGender}"]`);
                    if (targetBtn) {
                        targetBtn.click();
                    } else {
                        document.querySelectorAll('.visual-model-tab-pane, .info-section-card, .general-visual-card').forEach(container => {
                            applyCombinedFilters(container);
                        });
                    }
                });
            }

            // Lógica para navegação interna ativa
            const pageNavs = document.querySelectorAll('[data-page-nav]');
            const desktopPageNav = document.querySelector('.page-nav.desktop-only[data-page-nav]');
            const headerSearchWrapper = document.querySelector('.global-header .header-search-wrapper');
            const headerSearchPlaceholder = headerSearchWrapper?.parentElement
                ? document.createComment('local original da pesquisa do cabeçalho')
                : null;

            if (headerSearchWrapper && headerSearchPlaceholder) {
                headerSearchWrapper.parentElement.insertBefore(headerSearchPlaceholder, headerSearchWrapper);
            }

            const updateFloatingPageNavs = () => {
                const isDesktop = window.matchMedia('(min-width: 993px)').matches;
                pageNavs.forEach(nav => {
                    const top = nav.getBoundingClientRect().top;
                    const isFloating = window.scrollY > 0 && top <= 22;
                    nav.classList.toggle('is-floating', isFloating);

                    if (nav === desktopPageNav && headerSearchWrapper && headerSearchPlaceholder) {
                        const shouldMoveSearch = isDesktop && isFloating;
                        if (shouldMoveSearch && headerSearchWrapper.parentElement !== nav) {
                            nav.appendChild(headerSearchWrapper);
                            headerSearchWrapper.classList.add('page-nav-search');
                        } else if (!shouldMoveSearch && headerSearchWrapper.parentElement === nav) {
                            headerSearchPlaceholder.parentElement.insertBefore(headerSearchWrapper, headerSearchPlaceholder);
                            headerSearchWrapper.classList.remove('page-nav-search');
                        }
                    }
                });
            };
            updateFloatingPageNavs();
            const navAnchors = document.querySelectorAll('.nav-anchor');
            const sections = document.querySelectorAll('.middle-column .info-section-card, .middle-column .animal-gallery-section, .info-sections .info-section, .info-sections .animal-gallery-section');

            const makeActive = (link) => {
                navAnchors.forEach(a => a.classList.remove('active'));
                link.classList.add('active');
            };

            navAnchors.forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = anchor.getAttribute('href');
                    const targetSection = targetId ? document.querySelector(targetId) : null;
                    if (anchor.dataset.visualModelTabTarget) {
                        const targetTab = targetSection?.querySelector(`[data-visual-model-tab="${anchor.dataset.visualModelTabTarget}"]`);
                        if (targetTab && !targetTab.classList.contains('is-active')) targetTab.click();
                    }
                    makeActive(anchor);
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            // Seletor dinâmico baseado no scroll usando getBoundingClientRect
            window.addEventListener('scroll', () => {
                updateFloatingPageNavs();
                let current = '';
                
                // Encontrar a primeira secção visível cujo fundo ultrapasse o topo/cabeçalho da página
                for (const section of sections) {
                    // Ignorar secções ocultas no layout atual
                    if (section.offsetWidth === 0 || section.offsetHeight === 0) continue;
                    
                    const rect = section.getBoundingClientRect();
                    // Se o fundo da secção está abaixo do limiar (150px do topo do visor)
                    if (rect.bottom > 150) {
                        current = section.getAttribute('id');
                        break; // Primeira secção correspondente encontrada, interrompe a procura
                    }
                }
                
                if (current) {
                    navAnchors.forEach(anchor => {
                        anchor.classList.remove('active');
                        if (anchor.getAttribute('href') === `#${current}`) {
                            anchor.classList.add('active');
                        }
                    });
                }
            });
        }

        const animalLoadingAnimations = [
            { src: 'assets/loading/coruja_loader_site/coruja_escolher_livro_biblioteca.svg', alt: 'Coruja a escolher um livro' },
            { src: 'assets/loading/macaco_loader_site/macaco_trepar_arvore.svg', alt: 'Macaco a trepar uma árvore' },
            { src: 'assets/loading/polvo_loader_site/polvo_teclar_computador.svg', alt: 'Polvo a teclar num computador' },
            { src: 'assets/loading/camaleao_shy_loader_site/camaleao_envergonhado_floresta.svg', alt: 'Camaleão envergonhado na floresta' },
            { src: 'assets/loading/caranguejo_loader_site/caranguejo_fita_metrica_praia.svg', alt: 'Caranguejo com fita métrica na praia' },
            { src: 'assets/loading/garca_loader_site/garca_voar_biblioteca.svg', alt: 'Garça a voar na biblioteca' }
        ];

        function renderAnimalLoadingState() {
            const animation = animalLoadingAnimations[Math.floor(Math.random() * animalLoadingAnimations.length)];
            return `<div class="animal-page-loading" role="status" aria-live="polite"><img src="${animation.src}" alt="${animation.alt}"><span class="animal-page-loading-text">A carregar dados do animal...</span></div>`;
        }

        async function loadPage() {
            mainContent.innerHTML = renderAnimalLoadingState();
            const params = new URLSearchParams(window.location.search);
            const animalId = params.get('id');
            if (!animalId) {
                mainContent.innerHTML = `<p class="error">Erro: ID do animal não fornecido.</p>`;
                return;
            }
            try {
                await loadCountryList();
                const docRef = doc(db, "animais", animalId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const animalData = docSnap.data();
                    
                    // Await Wikidata name translations for the saved language if it's not Portuguese
                    const currentLang = getSavedAnimalLanguage();
                    if (currentLang !== 'pt' && animalData.nomeCientifico) {
                        try {
                            await getWikidataLocalizedNames(animalData.nomeCientifico);
                        } catch (e) {
                            console.warn("Erro ao pré-carregar nomes do Wikidata:", e);
                        }
                    }

                    await renderAnimalData(animalData, animalId);
                    fetchAndRenderSubspeciesParents(animalData.subespeciesDe);
                    fetchAndRenderRelatedAnimals(animalData.subfamilia, animalId, animalData.tribo);
                } else {
                    mainContent.innerHTML = `<p class="error">Erro: Animal não encontrado.</p>`;
                }
            } catch (error) {
                console.error("Erro ao carregar dados do animal:", error);
                mainContent.innerHTML = `<p class="error">Ocorreu um erro ao carregar os dados. Tente novamente.</p>`;
            }
        }
        
        loadPage();



