import { db } from "../js/firebase-config.js?v=5";
        import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
        import { feedingTypeDescriptions, getFeedingVisualMeta, getFeedingModelSvg } from "../js/feeding-visuals.js";
        import { feedingAnimalOptions } from "../js/feeding-animal-options.js?v=2";
        import { feedingStrategyDescriptions, getFeedingStrategyMeta, getFeedingStrategySvg } from "../js/feeding-strategies.js";
        import { matingSystems, getMatingMeta, getMatingSystemSvg } from "../js/mating-systems.js?v=2";
        import { sexualSystems } from "../js/sexual-systems.js?v=1";
        import { ecologyBlockConfigs, getEcologyBlockSvg } from "../js/ecology-visuals.js?v=1";
        import { getGeneralVisualMeta as getGeneralVisualCatalogMeta, getGeneralModelSvg as getGeneralCatalogModelSvg, getActivityMeta, getActivitySvg, getSocialMeta, getSocialSvg, getEcologicalFunctionMeta, getEcologicalFunctionSvg, getLocomotionMeta, getLocomotionSvg, isDropdownOnlyGeneralModel as isDropdownOnlyGeneralCatalogModel } from "../js/general-visual-catalog.js";
        import { collapseCombinedGenderItems, collectConcreteGenders, genderMatchesSelection, normalizeGenderValue } from "../js/gender-utils.js?v=2";
        import { renderAnimalMediaBlock, initAnimalMediaBlock, initFooterAnatomyTabs } from "../js/animal-media-block.js?v=3";
        import { renderAnimalAudioThumbnail, initAnimalAudioControls, pauseAllAnimalAudio } from "../js/animal-audio.js?v=20260710_audio_4";
        import { initAnimalProfileActions } from "../js/profile-favorites.js?v=4";
import { POPULATION_RANKING_KEY } from "../js/ranking-metrics.js?v=1";
import { getConservationStatusMeta, initConservationStatusPopup } from "../js/conservation-status-popup.js?v=1";
import { initFeedingTypePopup } from "../js/feeding-type-popup.js?v=2";
import { initEcologicalFunctionPopup } from "../js/ecological-function-popup.js?v=2";
import { initMatingSystemPopup } from "../js/mating-system-popup.js?v=1";
import { initSexualSystemPopup } from "../js/sexual-system-popup.js?v=1";
import { initBiogeographicRegionPopup } from "../js/biogeographic-regions-popup.js?v=1";
import { getCommunicationGenericModelSvg } from "../js/communication-visuals.js?v=2";
import { initCommunicationTypePopup } from "../js/communication-type-popup.js?v=1";
        
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
            if (!/^[A-Z]{2}$/.test(normalizedCode)) return '🌍';
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
                dimensoes: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M12 48L48 12l8 8l-36 36H12v-8Z"/><path d="M41 19l4 4"/><path d="M35 25l4 4"/><path d="M29 31l4 4"/><path d="M23 37l4 4"/><path d="M17 43l4 4"/></svg>`,
                alimentacao: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M21 8v20"/><path d="M13 8v17c0 6 4 10 8 10s8-4 8-10V8"/><path d="M21 35v21"/><path d="M44 8c6 7 8 15 8 24c0 8-3 14-8 17v7"/><path d="M44 8v48"/></svg>`,
                reproducao: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M32 8c12 10 19 20 19 32c0 10-8 17-19 17s-19-7-19-17C13 28 20 18 32 8Z"/><circle cx="32" cy="39" r="9"/><path d="M32 30v-8"/></svg>`,
                plumagem: `<svg class="section-title-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M42 6L14 34c-4 4-4 10 0 14s10 4 14 0l28-28c4-4 4-10 0-14s-10-4-14 0Z"/><path d="M28 20l12 12"/><path d="M18 30l10 10"/><path d="M38 10l12 12"/><path d="M14 50l-8 8"/></svg>`,
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
            
            // Abas de Fase (Ã  esquerda)
            if (hasPhases) {
                html += `
                    <span class="glass-pill-toggle phase-toggle-container" style="display: inline-flex; background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 30px; padding: 3px; gap: 2px; align-items: center; box-shadow: inset 0 1px 1px rgba(255,255,255,0.05);">
                        <button class="phase-tab-btn active" data-phase="Adulto" style="color: #10b981; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 20px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; outline: none; padding: 0;"><i class="fa-solid fa-paw" style="font-size: 0.95rem;"></i></button>
                        <button class="phase-tab-btn" data-phase="Cria" style="color: rgba(255,255,255,0.4); background: transparent; border: 1px solid transparent; border-radius: 20px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; outline: none; padding: 0;"><i class="fa-solid fa-baby" style="font-size: 0.95rem;"></i></button>
                    </span>
                `;
                if (hasGenders) {
                    html += `<span style="width: 1px; height: 18px; background: rgba(255,255,255,0.12);"></span>`;
                }
            }
            
            // Abas de Género (Ã  direita)
            if (hasGenders) {
                html += `
                    <span class="glass-pill-toggle gender-toggle-container" style="display: inline-flex; background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 30px; padding: 3px; gap: 2px; align-items: center; box-shadow: inset 0 1px 1px rgba(255,255,255,0.05);">
                        ${showSplitGenderToggle
                            ? `${genders.has('M') ? `<button class="gender-tab-btn ${defaultGender === 'M' ? 'active' : ''}" data-gender="M" style="color: ${defaultGender === 'M' ? '#3b82f6' : 'rgba(255,255,255,0.4)'}; background: ${defaultGender === 'M' ? 'rgba(59, 130, 246, 0.12)' : 'transparent'}; border: 1px solid ${defaultGender === 'M' ? 'rgba(59, 130, 246, 0.15)' : 'transparent'}; border-radius: 20px; width: 36px; height: 36px; font-weight: bold; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; outline: none; padding: 0; line-height: 1;">♂</button>` : ''}${genders.has('F') ? `<button class="gender-tab-btn ${defaultGender === 'F' ? 'active' : ''}" data-gender="F" style="color: ${defaultGender === 'F' ? '#ec4899' : 'rgba(255,255,255,0.4)'}; background: ${defaultGender === 'F' ? 'rgba(236, 72, 153, 0.12)' : 'transparent'}; border: 1px solid ${defaultGender === 'F' ? 'rgba(236, 72, 153, 0.15)' : 'transparent'}; border-radius: 20px; width: 36px; height: 36px; font-weight: bold; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; outline: none; padding: 0; line-height: 1;">♀</button>` : ''}`
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
                        <div class="dimension-model-label${inlineGenderSymbol ? ' with-gender' : ''}">${escapeHtml(meta.title)}${inlineGenderSymbol}</div>
                        <div class="dimension-model-value">${formatDimension(item, '—')}</div>
                    </div>
                </article>`;
        }

        function getInfoGroupForGeneralType(type = '') {
            const normalized = String(type || '').trim();
            
            const estiloVidaModels = new Set([
                'Atividade', 'Comportamento sazonal', 'Locomoção', 'Vida Social', 
                'Composição do grupo social', 'Organização social', 
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
            
            return 'medidas';
        }

        function getInfoGroupFilterIconSvg(group = 'estilo-vida') {
            const icons = {
                'estilo-vida': `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 14c1.2-2.6 3.5-4 6.8-4h1.4c3.3 0 5.6 1.4 6.8 4"/><circle cx="8" cy="8" r="1.5"/><circle cx="12" cy="6.5" r="1.5"/><circle cx="16" cy="8" r="1.5"/><path d="M9 17.5c.9 1 1.9 1.5 3 1.5s2.1-.5 3-1.5"/></svg>`,
                medidas: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16h16"/><path d="M7 16V8"/><path d="M12 16V5"/><path d="M17 16v-6"/><path d="M4 20h16"/></svg>`,
                dimensoes: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9V5h4"/><path d="M19 15v4h-4"/><path d="M19 9V5h-4"/><path d="M5 15v4h4"/><path d="M7 17L17 7"/></svg>`,
                anatomia: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M6 18l12-12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="8" cy="20" r="2.5"/><circle cx="20" cy="8" r="2.5"/></svg>`,
                fisiologia: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
                desenvolvimento: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 8a4 4 0 0 0-4 4v9h2v-9a2 2 0 0 1 2-2h2V8h-2zM7 12a4 4 0 0 0-4 4v5h2v-5a2 2 0 0 1 2-2h2v-2H7zM11 2v20h2V2h-2z"/></svg>`,
                'estruturas-anatomicas': `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="4.5" cy="6.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><circle cx="4.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="6.5" r="1.5"/><path d="M4.5 6.5l12 11M4.5 17.5l12-11" stroke="currentColor" stroke-width="2"/></svg>`
            };
            return icons[group] || icons['estilo-vida'];
        }

        function getInfoGroupFiltersHTML(allItems = []) {
            const activeGroups = new Set();
            allItems.forEach(item => {
                const group = item.isDimension
                    ? 'dimensoes' 
                    : getInfoGroupForGeneralType(item.tipo);
                activeGroups.add(group);
            });

            const groups = [
                { key: 'estilo-vida', label: 'Estilo de Vida' },
                { key: 'medidas', label: 'Medidas' },
                { key: 'dimensoes', label: 'Dimensões' },
                { key: 'anatomia', label: 'Anatomia' },
                { key: 'fisiologia', label: 'Fisiologia' },
                { key: 'desenvolvimento', label: 'Desenvolvimento' },
                { key: 'estruturas-anatomicas', label: 'Estruturas anatómicas' }
            ].filter(g => activeGroups.has(g.key));

            if (groups.length <= 1) return '';

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
                ? `${escapeHtml(value)} %${unit ? ` • ${escapeHtml(unit)}` : ''}`.trim()
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
            return getGeneralVisualCatalogMeta(type);
        }

        function getClimateZoneMeta(value = '') {
            const normalized = normalizeDimensionKey(value).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            const zones = {
                tropical: { image: 'assets/zonas-climaticas/01_Tropical.png', accent: 'accent-climate-tropical' },
                subtropical: { image: 'assets/zonas-climaticas/02_Subtropical.png', accent: 'accent-climate-subtropical' },
                arido: { image: 'assets/zonas-climaticas/07_Desertica.png', accent: 'accent-climate-desertica' },
                temperado: { image: 'assets/zonas-climaticas/03_Temperada.png', accent: 'accent-climate-temperada' },
                temperada: { image: 'assets/zonas-climaticas/03_Temperada.png', accent: 'accent-climate-temperada' },
                continental: { image: 'assets/zonas-climaticas/03_Temperada.png', accent: 'accent-climate-temperada' },
                polar: { image: 'assets/zonas-climaticas/04_Polar.png', accent: 'accent-climate-polar' },
                artica: { image: 'assets/zonas-climaticas/05_Artica.png', accent: 'accent-climate-artica' },
                antartica: { image: 'assets/zonas-climaticas/06_Antartica.png', accent: 'accent-climate-antartica' },
                desertica: { image: 'assets/zonas-climaticas/07_Desertica.png', accent: 'accent-climate-desertica' },
                semiarida: { image: 'assets/zonas-climaticas/08_Semiarida.png', accent: 'accent-climate-semiarida' },
                mediterranica: { image: 'assets/zonas-climaticas/09_Mediterranica.png', accent: 'accent-climate-mediterranica' },
                montanhoso: { image: 'assets/zonas-climaticas/10_Montanhosa_Alpina.png', accent: 'accent-climate-montanhosa' },
                montanhosa_alpina: { image: 'assets/zonas-climaticas/10_Montanhosa_Alpina.png', accent: 'accent-climate-montanhosa' }
            };
            if (normalized.includes('montanhos') || normalized.includes('alpina')) return zones.montanhoso;
            return zones[normalized] || null;
        }

        function getBiomaMeta(value = '') {
            const normalized = normalizeDimensionKey(value).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            const biomas = {
                bosque: { image: 'assets/bioma/03_Bosque.png', accent: 'accent-bioma-bosque' },
                calota_de_gelo: { image: 'assets/bioma/07_Calota_de_Gelo.png', accent: 'accent-bioma-calota-gelo' },
                caverna: { image: 'assets/bioma/05_Caverna.png', accent: 'accent-bioma-caverna' },
                chaparral: { image: 'assets/bioma/10_Chaparral.png', accent: 'accent-bioma-chaparral' },
                duna: { image: 'assets/bioma/06_Duna.png', accent: 'accent-bioma-duna' },
                estepe: { image: 'assets/bioma/09_Estepe.png', accent: 'accent-bioma-estepe' },
                fauna_urbana: { image: 'assets/bioma/12_Fauna_Urbana.png', accent: 'accent-bioma-fauna-urbana' },
                marinho: { image: 'assets/bioma/01_Marinho.png', accent: 'accent-bioma-marinho' },
                montanha: { image: 'assets/bioma/11_Montanha.png', accent: 'accent-bioma-montanha' },
                pantano: { image: 'assets/bioma/04_Pantano.png', accent: 'accent-bioma-pantano' },
                pradaria: { image: 'assets/bioma/08_Pradaria.png', accent: 'accent-bioma-pradaria' },
                savana: { image: 'assets/bioma/02_Savana.png', accent: 'accent-bioma-savana' },
                floresta: { image: 'assets/bioma/16_Floresta.png', accent: 'accent-bioma-floresta' },
                matagal: { image: 'assets/bioma/17_Matagal.png', accent: 'accent-bioma-matagal' },
                costa: { image: 'assets/bioma/14_Costa.png', accent: 'accent-bioma-costa' },
                areas_rochosas: { image: 'assets/bioma/15_Areas_Rochosas.png', accent: 'accent-bioma-areas-rochosas' },
                marinho_corais: { image: 'assets/bioma/13_Marinho_corais.png', accent: 'accent-bioma-marinho-corais' }
            };
            return biomas[normalized] || null;
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

        function renderGeneralVisualCard(item) {
            const meta = getGeneralVisualMeta(item.tipo);
            const inlineGenderSymbol = renderInlineGenderSymbol(item);
            const normalizedType = normalizeDimensionKey(item.tipo);
            const isStrategy = normalizedType.includes('estrategia');
            const isActivity = normalizedType.includes('atividade');
            const isSocial = normalizedType.includes('vida social');
            const isEcologicalFunction = normalizedType.includes('funcao ecologica');
            const isLocomotion = normalizedType.includes('locomocao');
            const isClimateZone = normalizedType.includes('zona');
            const isBioma = normalizedType.includes('bioma');
            const value = item.valorMin || item.valor || '';
            const mixedOption = item.opcao || '';
            const strategyMeta = isStrategy ? getFeedingStrategyMeta(value) : null;
            const activityMeta = isActivity ? getActivityMeta(value) : null;
            const socialMeta = isSocial ? getSocialMeta(value) : null;
            const ecologicalMeta = isEcologicalFunction ? getEcologicalFunctionMeta(value) : null;
            const locomotionMeta = isLocomotion ? getLocomotionMeta(value) : null;
            const climateMeta = isClimateZone ? getClimateZoneMeta(value) : null;
            const biomaMeta = isBioma ? getBiomaMeta(value) : null;
            const icon = climateMeta
                ? `<img class="climate-zone-model-image" src="${climateMeta.image}" alt="Zona climática ${escapeHtml(value)}" loading="lazy">`
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
                <article class="dimension-model-card general-model-card ${climateMeta?.accent || biomaMeta?.accent || ecologicalMeta?.accent || locomotionMeta?.accent || strategyMeta?.accent || activityMeta?.accent || socialMeta?.accent || meta.accent}" data-gender="${item.genero || ''}" data-phase="${item.fase || 'Adulto'}" data-info-group="${getInfoGroupForGeneralType(item.tipo)}">
                    <div class="dimension-model-icon ${climateMeta || biomaMeta ? 'climate-zone-model-icon' : ''}">${icon}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label${inlineGenderSymbol ? ' with-gender' : ''}">${escapeHtml(meta.title)}${inlineGenderSymbol}</div>
                        <div class="dimension-model-value">${mixedOption ? `${escapeHtml(mixedOption)} • ` : ''}${formatGeneralVisualValue(item)}</div>
                    </div>
                </article>`;
        }

        function renderGeneralVisual(animalData) {
            const models = animalData.informacao?.geralDetalhada || [];
            const isEnv = item => normalizeDimensionKey(item.tipo).includes('zona') || normalizeDimensionKey(item.tipo).includes('bioma');
            const valid = collapseCombinedGenderItems(
                Array.isArray(models) ? models.filter(item => item.tipo && (item.valor || item.valorMin || item.valorMax) && !isEnv(item)) : []
            );
            const envItems = collapseCombinedGenderItems(
                Array.isArray(models) ? models.filter(item => item.tipo && (item.valor || item.valorMin || item.valorMax) && isEnv(item)) : []
            );
            
            const genders = collectConcreteGenders(valid);
            const phases = new Set(valid.map(i => i.fase).filter(Boolean));
            
            const hasBothGenders = genders.has('M') && genders.has('F');
            const hasCriaPhase = phases.has('Cria');
            
            const defaultGender = genders.has('M') ? 'M' : 'F';
            const defaultPhase = 'Adulto';

            let html = '';
            if (valid.length) {
                const cardsHTML = valid.map(item => {
                    const cardHtml = renderGeneralVisualCard(item);
                    const itemGender = item.genero || '';
                    const itemPhase = item.fase || 'Adulto';
                    
                    const matchesGender = !hasBothGenders || genderMatchesSelection(itemGender, defaultGender);
                    const matchesPhase = !hasCriaPhase || itemPhase === defaultPhase;
                    
                    if (matchesGender && matchesPhase) {
                        return cardHtml;
                    }
                    return cardHtml.replace('<article class="', '<article style="display: none;" class="');
                }).join('');

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
                html += `
                <div class="general-visual-card" style="margin-top: 15px;">
                    <div class="general-visual-title">
                        <strong>Zona Climática & Bioma</strong>
                    </div>
                    <div class="general-visual-models">
                        ${envItems.map(renderGeneralVisualCard).join('')}
                    </div>
                </div>`;
            }
            return html;
        }

        function renderClimateZoneBadge(animalData) {
            const models = animalData.informacao?.geralDetalhada || [];
            const climateItem = Array.isArray(models) ? models.find(item => item.tipo && normalizeDimensionKey(item.tipo).includes('zona')) : null;
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
                    groups.set(type, { type, details: [], animals: [] });
                }

                const group = groups.get(type);
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
            if (nutritionMeta && group.type === 'Tipo de AlimentaÃ§Ã£o') {
                const entries = group.details
                    .map(parseFeedingDetail)
                    .filter(entry => entry.display)
                    .filter((entry, index, list) => list.findIndex(candidate => candidate.display === entry.display) === index);
                const firstEntry = entries[0] || { primary: '', secondary: '', display: '' };
                const firstMeta = getFeedingVisualMeta(firstEntry.primary || nutritionMeta.title);
                const heroIcon = entries.length === 1
                    ? getFeedingModelSvg(firstMeta.key)
                    : getReproductionModelSvg(nutritionMeta.key);
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
                    : `<div class="dimension-model-value">${escapeHtml(firstEntry.display || 'Tipo de dieta')}</div>`;
                const secondaryHtml = entries.length === 1 && firstEntry.secondary
                    ? `<div class="dimension-model-meta">${escapeHtml(firstEntry.secondary)}</div>`
                    : '';
                return `
                    <article class="dimension-model-card feeding-model-card feeding-type-highlight-card ${nutritionMeta.accent}">
                        <div class="dimension-model-icon">${heroIcon}</div>
                        <div class="dimension-model-copy">
                            ${valuesHtml}
                            <div class="dimension-model-label">${nutritionMeta.title}</div>
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
                            <div class="dimension-model-value">${escapeHtml(resolvedValue)}</div>
                            <div class="dimension-model-label">${nutritionMeta.title}</div>
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
                        <div class="dimension-model-value">${escapeHtml(detail)}</div>
                        <div class="dimension-model-label">${escapeHtml(meta.title)}</div>
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
                    ${group.animals.length ? `
                        <div class="feeding-prey-grid">
                            ${group.animals.map(renderFeedingAnimalCard).join('')}
                        </div>
                    ` : ''}
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

            if (nutritionMeta && normalizedType.includes('tipo de alimentacao')) {
                const entryTypes = entries.map(entry => entry.primary || entry.display).filter(Boolean);
                const fallbackTypes = Array.isArray(group.animals) ? group.animals.map(animal => animal.feedingType).filter(Boolean) : [];
                const selectedFeedingTypes = [...new Set((entryTypes.length ? entryTypes : fallbackTypes)
                    .map(value => String(value || '').trim())
                    .filter(Boolean))];
                const selectedFeedingTypesData = JSON.stringify(selectedFeedingTypes);
                const firstEntry = entries[0] || { primary: '', secondary: '', display: '' };
                const firstMeta = getFeedingVisualMeta(firstEntry.primary || nutritionMeta.title);
                const heroIcon = getFeedingModelSvg(entries.length > 1 ? 'alimentacao' : firstMeta.key);
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
                    : `<div class="dimension-model-value">${escapeHtml(firstEntry.display || 'Tipo de dieta')}</div>`;
                const secondaryHtml = entries.length === 1 && firstEntry.secondary
                    ? `<div class="dimension-model-meta">${escapeHtml(firstEntry.secondary)}</div>`
                    : '';

                return `
                    <button type="button" class="dimension-model-card feeding-model-card feeding-type-highlight-card feeding-type-popup-trigger ${nutritionMeta.accent}" data-feeding-type-popup data-feeding-types="${escapeHtml(selectedFeedingTypesData)}" aria-haspopup="dialog" aria-label="Ver os tipos de alimentação e respetivas explicações" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                        <div class="dimension-model-icon">${heroIcon}</div>
                        <div class="dimension-model-copy">
                            ${listHtml}
                            <div class="dimension-model-label">${nutritionMeta.title}</div>
                            ${secondaryHtml}
                        </div>
                    </button>`;
            }

            if (nutritionMeta) {
                const detailData = parseFeedingDetail(rawDetails[0] || '');
                const resolvedValue = detailData.display || rawDetails[0] || 'Modelo visual';
                const detailMeta = getFeedingVisualMeta(detailData.primary || nutritionMeta.title);
                return `
                    <article class="dimension-model-card feeding-model-card feeding-type-highlight-card ${nutritionMeta.accent}">
                        <div class="dimension-model-icon">${getFeedingModelSvg(detailMeta.key)}</div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-value">${escapeHtml(resolvedValue)}</div>
                            <div class="dimension-model-label">${nutritionMeta.title}</div>
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
                        <div class="dimension-model-value">${escapeHtml(detail)}</div>
                        <div class="dimension-model-label">${escapeHtml(meta.title)}</div>
                    </div>
                </article>`;
        }

        function renderFeedingModelCard(item) {
            const type = item.tipo || '';
            const nutritionMeta = getFeedingNutritionMeta(type);
            if (nutritionMeta) {
                const detailData = parseFeedingDetail(item.detalhe || '');
                const resolvedValue = detailData.display || item.detalhe || feedingTypeDescriptions[type] || 'Modelo visual';
                const icon = type === 'Tipo de AlimentaÃ§Ã£o'
                    ? getFeedingModelSvg(getFeedingVisualMeta(detailData.primary || resolvedValue).key)
                    : getReproductionModelSvg(nutritionMeta.key);
                return `
                    <article class="dimension-model-card feeding-model-card ${nutritionMeta.accent}">
                        <div class="dimension-model-icon">${icon}</div>
                        <div class="dimension-model-copy">
                            <div class="dimension-model-value">${escapeHtml(resolvedValue)}</div>
                            <div class="dimension-model-label">${nutritionMeta.title}</div>
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
                        <div class="dimension-model-value">${escapeHtml(detail)}</div>
                        <div class="dimension-model-label${inlineGenderSymbol ? ' with-gender' : ''}">${escapeHtml(meta.title)}${inlineGenderSymbol}</div>
                    </div>
                </article>`;
        }
        function renderFeedingStrategyCard(item) {
            const strategy = item.estrategia || item.tipo || '';
            const meta = getFeedingStrategyMeta(strategy);
            const detail = item.detalhe || feedingStrategyDescriptions[strategy] || 'Estratï¿½gia alimentar';
            return `
                <article class="dimension-model-card feeding-strategy-card ${meta.accent}">
                    <div class="dimension-model-icon">${getFeedingStrategySvg(meta.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${escapeHtml(strategy)}</div>
                        <div class="dimension-model-value">${escapeHtml(detail)}</div>
                    </div>
                </article>`;
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
                        ${validStrategies.map(renderFeedingStrategyCard).join('')}
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

        function renderEcologyAnimalLink(item = {}) {
            const normalized = normalizeEcologyAnimalEntry(item);
            const label = getEcologyAnimalLabel(normalized);
            if (normalized.id) {
                return `<a class="ecology-animal-link" href="animal.html?id=${encodeURIComponent(normalized.id)}">${escapeHtml(label)}</a>`;
            }
            return `<span class="ecology-animal-link ecology-animal-link-static">${escapeHtml(label)}</span>`;
        }

        function renderEcologyAnimalLinks(items = []) {
            const valid = normalizeEcologyList(items);
            if (!valid.length) return '';
            return `<div class="ecology-linked-animals">${valid.map(renderEcologyAnimalLink).join('')}</div>`;
        }

        function renderEcologyAnimalChips(items = []) {
            const valid = normalizeEcologyList(items);
            if (!valid.length) return '<span class="ecology-empty-pill">Sem animais adicionados.</span>';
            return valid.map(item => `
                <span class="country-tag ecology-tag">
                    ${escapeHtml(getEcologyAnimalLabel(item))}
                </span>
            `).join('');
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
            const countLabel = validRefs.length
                ? `${config.label} (${validRefs.length} ${validRefs.length === 1 ? 'animal' : 'animais'})`
                : config.label;
            const valueHtml = validRefs.length
                ? renderEcologyAnimalLinks(validRefs)
                : `<span class="ecology-animal-link ecology-animal-link-static">${escapeHtml(freeText || 'Por preencher')}</span>`;
            const metaHtml = freeText && validRefs.length
                ? `<div class="dimension-model-meta">${escapeHtml(freeText)}</div>`
                : '';
            return `
                <article class="dimension-model-card ecology-model-card ${config.accent}">
                    <div class="dimension-model-icon">${getEcologyBlockSvg(config.key)}</div>
                    <div class="dimension-model-copy">
                        <div class="dimension-model-label">${valueHtml}</div>
                        <div class="dimension-model-value">${escapeHtml(countLabel)}</div>
                        ${metaHtml}
                    </div>
                </article>
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
            'Exoesqueleto rígido':'fa-shield-halved','Exoesqueleto flexível':'fa-link','Exoesqueleto quitinoso':'fa-shield','Élitros':'fa-door-closed','Cutícula cerosa':'fa-droplet','Muda do exoesqueleto':'fa-arrows-rotate','Cerdas sensoriais':'fa-satellite-dish','Espinhos':'fa-burst','Placas':'fa-table-cells','Brilho metálico':'fa-bolt','Pelos urticantes':'fa-fire','Carapaça calcificada':'fa-gem','Carapaça rígida':'fa-shield','Carapaça flexível':'fa-link','Exoesqueleto segmentado':'fa-layer-group','Muda da carapaça':'fa-arrows-rotate','Pinças especializadas':'fa-scissors',
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
                    if (!item?.tipo) return false;
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
                    <span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.72); font-size: 0.72rem; font-weight: 600;">${item.fase === 'Cria' ? '👶 Cria' : '🐾 Adulto'}</span>
                </div>
            `;

            const buildCuriosidadeValue = (item = {}) => {
                if (item.valor !== undefined && item.valor !== null && String(item.valor).trim()) return String(item.valor).trim();
                const min = item.valorMin !== undefined && item.valorMin !== null ? String(item.valorMin).trim() : '';
                const max = item.valorMax !== undefined && item.valorMax !== null ? String(item.valorMax).trim() : '';
                const unit = item.unidade ? ` ${String(item.unidade).trim()}` : '';
                if (min && max) return min === max ? `${min}${unit}` : `${min}–${max}${unit}`;
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
                            ? 'Via de administraÃ§Ã£o da toxina'
                            : normalizedTipo.includes('doto') && normalizedTipo.includes('disp')
                                ? 'AntÃ­doto disponÃ­vel'
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

                if (item.tipo === 'Distância Percorrida') {
                    return `
                        <article class="dimension-model-card curiosidades-model-card" style="width: 100%; box-sizing: border-box; display: flex; align-items: center;">
                            <div class="dimension-model-icon" style="flex-shrink: 0; background: rgba(14, 165, 233, 0.18); color: #7dd3fc; display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-route"></i>
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

                if (item.tipo !== 'Estado de ConservaÃ§Ã£o' && item.tipo !== 'Estado de Conservação') {
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

        async function fetchAndRenderRelatedAnimals(subfamilia, currentAnimalId) {
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
                const querySnapshot = await getDocs(q);

                if (querySnapshot.size < 2) {
                    return;
                }

                const relatedAnimals = [];
                querySnapshot.forEach(resultDoc => {
                    if (resultDoc.id !== currentAnimalId) relatedAnimals.push({ id: resultDoc.id, ...resultDoc.data() });
                });
                relatedAnimals.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt'));

                let listHTML = '';
                if (relatedAnimals.length) {
                    listHTML = '<div class="related-family-list-block"><h3>Da mesma subfamília</h3><ul class="related-list">' + relatedAnimals.map(animal => {
                        const objectPos = animal.imagemObjectPosition || 'center center';
                        return `<li class="related-item"><a href="animal.html?id=${encodeURIComponent(animal.id)}"><img src="${escapeHtml(animal.imagemUrl || '')}" alt="${escapeHtml(animal.nome || '')}" style="object-position:${escapeHtml(objectPos)}"><span>${escapeHtml(animal.nome || 'Animal')}</span></a></li>`;
                    }).join('') + '</ul></div>';
                }
                const html = `<div class="related-family-shell">${portalHTML}${listHTML}</div>`;
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

        function renderAnimalData(animalData, animalId) {
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
            const hasGeralVisual = Array.isArray(animalData.informacao?.geralDetalhada) && animalData.informacao.geralDetalhada.some(item => item?.tipo && (item?.valor || item?.valorMin || item?.valorMax) && !isLegacyGeneralMatingItem(item));
            const hasGeral = hasGeralText || hasGeralVisual;
            const hasDimensoesText = animalData.informacao?.dimensoes && animalData.informacao.dimensoes.trim() !== "";
            const hasDimensoesVisual = Array.isArray(animalData.informacao?.dimensoesDetalhadas) && animalData.informacao.dimensoesDetalhadas.length > 0;
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
            
            const distributionRegions = normalizeDistributionRegions(animalData.informacao?.distribuicao || {});
            const distributionAreas = window.DistributionAreas?.normalizeDistributionAreas?.(animalData.informacao?.distribuicao?.areas || []) || [];
            const distributionPoints = window.DistributionAreas?.normalizeDistributionPoints?.(animalData.informacao?.distribuicao?.pontos || []) || [];
            const hasDistribicaoText = animalData.informacao?.distribuicao?.descricao && animalData.informacao.distribuicao.descricao.trim() !== "";
            const hasDistribicao = animalData.informacao?.distribuicao && 
                                   ((Array.isArray(animalData.informacao.distribuicao.paises) && animalData.informacao.distribuicao.paises.length > 0) || 
                                    hasDistribicaoText ||
                                    distributionRegions.length > 0 ||
                                    distributionAreas.length > 0 ||
                                    distributionPoints.length > 0);

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

            const navItems = [];
            if (hasGeralText) navItems.push({ desktopHref: '#info-geral', mobileHref: '#info-geral-mobile', label: 'Geral' });
            if (hasDimensoesText) navItems.push({ href: '#info-dimensoes', label: 'Dimensões' });
            if (hasAlimentacao) navItems.push({ href: '#info-alimentacao', label: 'Alimentação' });
            if (hasEcologia) navItems.push({ href: '#info-ecologia', label: 'Ecologia' });
            if (hasReproducao) navItems.push({ href: '#info-reproducao', label: 'Reprodução' });
            if (hasPlumagem) navItems.push({ href: '#info-plumagem', label: getBodyCoveringTitle(animalData) });
            if (hasDistribicao) navItems.push({ href: '#info-distribuicao', label: 'Distribuição' });
            if (hasCuriosidades) navItems.push({ href: '#info-curiosidades', label: 'Curiosidades' });
            const navHTMLDesktop = navItems.map((item, idx) => {
                const desktopHref = item.desktopHref || item.href;
                return `<a href="${desktopHref}" class="nav-anchor ${idx === 0 ? 'active' : ''}">${item.label}</a>`;
            }).join('');
            const navHTMLMobile = navItems.map((item, idx) => {
                const desktopHref = item.desktopHref || item.href;
                const mobileHref = item.mobileHref || `${desktopHref}-mobile`;
                return `<a href="${mobileHref}" class="nav-anchor ${idx === 0 ? 'active' : ''}">${item.label}</a>`;
            }).join('');

            // Build horizontal metrics bar for desktop
            const dimensoes = animalData.informacao?.dimensoesDetalhadas || [];
            const validDimensoes = collapseCombinedGenderItems(
                Array.isArray(dimensoes) ? dimensoes.filter(item => item.tipo && (item.valor || item.valorMin || item.valorMax)) : []
            );

            const models = animalData.informacao?.geralDetalhada || [];
            const isEnv = item => normalizeDimensionKey(item.tipo).includes('zona') || normalizeDimensionKey(item.tipo).includes('bioma');
            const validQuickData = collapseCombinedGenderItems(
                Array.isArray(models) ? models.filter(item => item.tipo && (item.valor || item.valorMin || item.valorMax) && !isEnv(item) && !isLegacyGeneralMatingItem(item)) : []
            );
            const envQuickData = collapseCombinedGenderItems(
                Array.isArray(models) ? models.filter(item => item.tipo && (item.valor || item.valorMin || item.valorMax) && isEnv(item)) : []
            );

            const allItems = [...validDimensoes, ...validQuickData];
            const genderIconsHTML = getGenderTabsHTML(allItems);

            const genders = collectConcreteGenders(allItems);
            const phases = new Set(allItems.map(i => i.fase).filter(Boolean));
            const hasBothGenders = genders.has('M') && genders.has('F');
            const hasCriaPhase = phases.has('Cria');
            const defaultGender = genders.has('M') ? 'M' : 'F';
            const defaultPhase = 'Adulto';

            const horizontalMetricsHTML = (validDimensoes.length > 0 || validQuickData.length > 0) ? `
                <div class="metrics-horizontal-bar desktop-only">
                    ${validDimensoes.map(renderDimensionModelCard).join('')}
                    ${validQuickData.map(renderGeneralVisualCard).join('')}
                </div>` : '';

            const hasScientificClassification = Boolean(
                animalData.reino ||
                animalData.filo ||
                animalData.subfilo ||
                animalData.classe ||
                animalData.infraclasse ||
                animalData.superordem ||
                animalData.ordem ||
                animalData.subordem ||
                animalData.infraordem ||
                animalData.familia ||
                animalData.subfamilia ||
                animalData.genero ||
                animalData.subgenero ||
                animalData.especie ||
                animalData.autoridadeTaxonomica ||
                (Array.isArray(animalData.subespeciesDe) && animalData.subespeciesDe.length > 0)
            );

            const classificationRow = (filterType, label, value, options = {}) =>
                value
                    ? `<div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;"><strong style="color: var(--text-secondary);">${label}</strong> <span>${renderClassificationFilterValue(filterType, value, options)}</span></div>`
                    : '';

            const scientificClassificationRowsLinkedHTML = hasScientificClassification ? [
                ['reino', 'Reino:', animalData.reino],
                ['filo', 'Filo:', animalData.filo],
                ['subfilo', 'Subfilo:', animalData.subfilo],
                ['classe', 'Classe:', animalData.classe],
                ['infraclasse', 'Infraclasse:', animalData.infraclasse],
                ['superordem', 'Superordem:', animalData.superordem],
                ['ordem', 'Ordem:', animalData.ordem],
                ['subordem', 'Subordem:', animalData.subordem],
                ['infraordem', 'Infraordem:', animalData.infraordem],
                ['familia', 'Família:', animalData.familia],
                ['subfamilia', 'Subfamília:', animalData.subfamilia],
                ['genero', 'Género:', animalData.genero, { italic: true }],
                ['subgenero', 'Subgénero:', animalData.subgenero, { italic: true }],
                ['especie', 'Espécie:', animalData.especie, { italic: true }],
                ['autoridadeTaxonomica', 'Autoridade taxonómica:', animalData.autoridadeTaxonomica]
            ].map(([filterType, label, value, options]) => {
                return classificationRow(filterType, label, value, options);
            }).join('') + ((Array.isArray(animalData.subespeciesDe) && animalData.subespeciesDe.length > 0) ? `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">
                    <strong style="color: var(--text-secondary);">Subespécie de:</strong>
                    <span class="subespecies-names" style="color: var(--text-primary); font-weight: 500;">Carregando...</span>
                </div>` : '') : '';

            const scientificClassificationSectionDesktopHTML = hasScientificClassification ? `
                <div class="info-section-card desktop-only" id="info-classificacao" style="margin-top: 24px; border-color: rgba(139, 92, 246, 0.3); background: linear-gradient(135deg, rgba(6, 182, 212, 0.04), rgba(236, 72, 153, 0.04), rgba(9, 9, 20, 0.85)); padding: 24px; box-shadow: 0 8px 32px rgba(139, 92, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.02);">
                    <h3 style="font-size: 1.25rem; margin-bottom: 14px; padding-bottom: 8px; display: flex; align-items: center; border-bottom: 1px solid var(--border-color); color: var(--text-primary);">
                        <span class="icon" style="margin-right: 10px; display: inline-flex;"><i class="fa-solid fa-dna" style="font-size: 1.1rem; background: linear-gradient(135deg, #06b6d4, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i></span>Classificação científica
                    </h3>
                    <div class="classification-grid" style="display: flex; flex-direction: column; gap: 8px; font-size: 0.95rem;">
                        ${scientificClassificationRowsLinkedHTML}
                    </div>
                </div>
            ` : '';

            const scientificClassificationSectionMobileHTML = hasScientificClassification ? `
                <div class="info-section" id="info-classificacao-mobile">
                    <h3><span class="icon" style="margin-right: 10px; display: inline-flex;"><i class="fa-solid fa-dna" style="font-size: 1.1rem; background: linear-gradient(135deg, #06b6d4, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i></span>Classificação científica</h3>
                    <div class="classification-grid" style="display: flex; flex-direction: column; gap: 8px; font-size: 0.95rem; margin-top: 15px;">
                        ${scientificClassificationRowsLinkedHTML}
                    </div>
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

            mainContent.innerHTML = `
                <div class="video-section">
                    <div id="video-thumbnails">${thumbnailsHTML}</div>
                    <div id="main-video-container">
                        <iframe frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
                <div class="animal-header-card desktop-only">
                    <div class="header-titles">
                        <h1>${animalData.nome}</h1>
                        <h2 class="scientific-name">(${animalData.nomeCientifico})</h2>
                    </div>
                </div>
                <nav class="page-nav desktop-only">
                    ${navHTMLDesktop}
                </nav>
                <div class="content-grid has-3-cols">
                    <!-- Column 1: Image & Related Animals -->
                    <div class="left-column">
                        ${renderAnimalMediaBlock(animalData, animalId)}
                        <div id="animal-profile-actions"></div>
                        ${scientificClassificationSectionDesktopFinalHTML}
                        <div id="subspecies-parent-animals-container" class="desktop-only" style="display: none;"></div>
                        <div id="related-animals-container" class="desktop-only" style="display: none;"></div>
                    </div>
                    
                    <!-- Column 2: Sections (Geral, Dimensões, Alimentação, Reprodução, Plumagem, Distribuição) -->
                    <div class="middle-column desktop-only">
                        ${hasGeralText ? `
                        <div class="info-section-card" id="info-geral">
                            <h3><span class="icon svg-icon">${getInfoSectionIconSvg('geral')}</span>Informação Geral</h3>
                            <p>${animalData.informacao.geral}</p>
                        </div>` : ''}

                        ${hasDimensoesText ? `
                        <div class="info-section-card" id="info-dimensoes">
                            <h3><span class="icon svg-icon">${getInfoSectionIconSvg('dimensoes')}</span>Dimensões</h3>
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
                            <h3><span class="icon svg-icon">${getEcologicalFunctionSvg('funcao-ecologica')}</span>Ecologia</h3>
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
                        ${(validDimensoes.length > 0 || validQuickData.length > 0) ? (() => {
                            const combined = [
                                ...validDimensoes.map(item => ({ ...item, isDimension: true })),
                                ...validQuickData.map(item => ({ ...item, isDimension: false }))
                            ];
                            const sorted = combined.sort((a, b) => a.tipo.localeCompare(b.tipo));
                            const genders = collectConcreteGenders(allItems);
                            const phases = new Set(allItems.map(i => i.fase).filter(Boolean));
                            
                            const hasBothGenders = genders.has('M') && genders.has('F');
                            const hasCriaPhase = phases.has('Cria');
                            
                            const defaultGender = genders.has('M') ? 'M' : 'F';
                            const defaultPhase = 'Adulto';
                            
                            const cardsHTML = sorted.map(item => {
                                const cardHtml = item.isDimension ? renderDimensionModelCard(item) : renderGeneralVisualCard(item);
                                const itemGender = item.genero || '';
                                const itemPhase = item.fase || 'Adulto';
                                
                                const matchesGender = !hasBothGenders || genderMatchesSelection(itemGender, defaultGender);
                                const matchesPhase = !hasCriaPhase || itemPhase === defaultPhase;
                                
                                if (matchesGender && matchesPhase) {
                                    return cardHtml;
                                }
                                return cardHtml.replace('<article class="', '<article style="display: none;" class="');
                            }).join('');
                            return `
                            <div class="info-section-card" id="info-modelos-visuais">
                                <h3 style="display: flex; align-items: center; justify-content: space-between; width: 100%;"><span style="display: flex; align-items: center;"><span class="icon svg-icon">${getInfoSectionIconSvg('geral')}</span>Infos</span>${genderIconsHTML}</h3>
                                ${getInfoGroupFiltersHTML(combined)}
                                <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px;">
                                    ${cardsHTML}
                                </div>
                            </div>`;
                        })() : ''}

                        ${envQuickData.length > 0 ? `
                        <div class="info-section-card" id="info-ambiente" style="margin-top: 20px;">
                            <h3><span class="icon svg-icon">${getInfoSectionIconSvg('distribuicao')}</span>Zona Climática & Bioma</h3>
                            <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px;">
                                ${envQuickData.map(renderGeneralVisualCard).join('')}
                            </div>
                        </div>` : ''}
                    </div>
                </div>

                    <!-- Stacked Mobile Version -->
                    <div class="animal-details mobile-only">
                        <div class="header mobile-only">
                            <h1>${animalData.nome}</h1>
                            <h2 class="scientific-name">(${animalData.nomeCientifico})</h2>
                        </div>
                        <nav class="page-nav">
                            ${navHTMLMobile}
                        </nav>
                        <div class="info-sections">
                            ${(validDimensoes.length > 0 || validQuickData.length > 0) ? (() => {
                                const combined = [
                                    ...validDimensoes.map(item => ({ ...item, isDimension: true })),
                                    ...validQuickData.map(item => ({ ...item, isDimension: false }))
                                ];
                                const sorted = combined.sort((a, b) => a.tipo.localeCompare(b.tipo));
                                const cardsHTML = sorted.map(item => {
                                    const cardHtml = item.isDimension ? renderDimensionModelCard(item) : renderGeneralVisualCard(item);
                                    const itemGender = item.genero || '';
                                    const itemPhase = item.fase || 'Adulto';
                                    
                                    const matchesGender = !hasBothGenders || genderMatchesSelection(itemGender, defaultGender);
                                    const matchesPhase = !hasCriaPhase || itemPhase === defaultPhase;
                                    
                                    if (matchesGender && matchesPhase) {
                                        return cardHtml;
                                    }
                                    return cardHtml.replace('<article class="', '<article style="display: none;" class="');
                                }).join('');
                                
                                return `
                                <div class="info-section mobile-only" id="info-modelos-visuais-mobile" style="margin-bottom: 20px;">
                                    <h3 style="display: flex; align-items: center; justify-content: space-between; width: 100%;"><span style="display: flex; align-items: center;"><span class="icon svg-icon">${getInfoSectionIconSvg('geral')}</span>Infos</span>${genderIconsHTML}</h3>
                                    ${getInfoGroupFiltersHTML(combined)}
                                    <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px; margin-top: 15px;">
                                        ${cardsHTML}
                                    </div>
                                </div>`;
                            })() : ''}
                            ${envQuickData.length > 0 ? `
                            <div class="info-section mobile-only" id="info-ambiente-mobile" style="margin-bottom: 20px;">
                                <h3><span class="icon svg-icon">${getInfoSectionIconSvg('distribuicao')}</span>Zona Climática & Bioma</h3>
                                <div class="visual-models-grid" style="display: flex; flex-direction: column; gap: 14px; margin-top: 15px;">
                                    ${envQuickData.map(renderGeneralVisualCard).join('')}
                                </div>
                            </div>` : ''}

                            ${hasGeralText ? `
                            <div class="info-section" id="info-geral-mobile">
                                <h3><span class="icon svg-icon">${getInfoSectionIconSvg('geral')}</span>Informação Geral</h3>
                                <p>${animalData.informacao.geral}</p>
                            </div>` : ''}

                            ${hasDimensoesText ? `
                            <div class="info-section" id="info-dimensoes-mobile">
                                <h3><span class="icon svg-icon">${getInfoSectionIconSvg('dimensoes')}</span>Dimensões</h3>
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
                                <h3><span class="icon svg-icon">${getEcologicalFunctionSvg('funcao-ecologica')}</span>Ecologia</h3>
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
                    const hasEsqueleto = !!animalData.rodapeHasEsqueleto;
                    const hasAnatomia = !!animalData.rodapeHasAnatomia;
                    const cleanSciName = String(animalData.nomeCientifico || '').trim().replace(/\s+/g, '_');

                    const models = animalData.informacao?.geralDetalhada || [];
                    const footerBiomaBackgroundFiles = {
                        bosque: 'bosque.png',
                        floresta: 'floresta.png',
                        marinho: 'marinho.png',
                        matagal: 'matagal.png',
                        montanha: 'montanha.png',
                        pantano: 'pântano.png',
                        savana: 'savana.png'
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
                        .filter(item => item.meta && item.backgroundFile);
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
                                return 'filtros.html?tipo=mais-vida-util&valor=Com%20mais%20Vida%20Útil';
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

                    if (!hasFooterImage && !hasEsqueleto && !hasAnatomia && footerCards.length === 0) return '';

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
                            ${(hasFooterImage || footerCards.length > 0) ? `
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

            initAnimalMediaBlock(mainContent);
            initFooterAnatomyTabs(mainContent);
            initFooterBiomaSlider(mainContent);
            initAnimalAudioControls(mainContent);
            initAnimalProfileActions({ animalId });
            initConservationStatusPopup(mainContent);
            initFeedingTypePopup(mainContent);
            initEcologicalFunctionPopup(mainContent);
            initMatingSystemPopup(mainContent);
            initSexualSystemPopup(mainContent);
            initBiogeographicRegionPopup(mainContent);
            initCommunicationTypePopup(mainContent);
            
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

                const mapIds = ['distributionMapDetailDesktop', 'distributionMapDetailMobile'];
                
                function initMap(mapId) {
                    const container = document.getElementById(mapId);
                    if (!container) return;
                    if (container.classList.contains('jsvectormap-init-done')) return;

                    // Only initialize map if container is visible in viewport/layout
                    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
                        return;
                    }

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
                            let attempts = 0;
                            const focusInterval = setInterval(() => {
                                attempts++;
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
                                        }
                                    }
                                }
                                if (attempts > 15) {
                                    clearInterval(focusInterval);
                                }
                            }, 80);
                        }
                    } catch (error) {
                        console.error("Erro ao inicializar o mapa jvectormap:", error);
                    }
                }

                // Initial attempts to render the visible map
                setTimeout(() => {
                    mapIds.forEach(initMap);
                }, 120);

                // Also initialize on resize in case user rotates or changes layout size
                window.addEventListener('resize', () => {
                    mapIds.forEach(initMap);
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
                
                const cards = container.querySelectorAll('.dimension-model-card');
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
                    if (!isActive) {
                        btn.classList.add('active');
                    }
                    const container = btn.closest('.info-section-card') || btn.closest('.info-section');
                    applyCombinedFilters(container);
                });
            });

            // Registrar cliques nas abas de género
            document.querySelectorAll('.gender-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    btn.parentElement.querySelectorAll('.gender-tab-btn').forEach(b => {
                        b.classList.remove('active');
                        b.style.background = 'transparent';
                        b.style.borderColor = 'transparent';
                        b.style.color = 'rgba(255, 255, 255, 0.4)';
                    });
                    btn.classList.add('active');
                    btn.style.color = btn.dataset.gender === 'M' ? '#3b82f6' : '#ec4899';
                    btn.style.background = btn.dataset.gender === 'M' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(236, 72, 153, 0.12)';
                    btn.style.borderColor = btn.dataset.gender === 'M' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(236, 72, 153, 0.15)';
                    
                    const container = btn.closest('.info-section-card') || btn.closest('.general-visual-card') || btn.closest('.dimensions-visual-card') || btn.closest('.info-section');
                    applyCombinedFilters(container);
                });
            });

            // Registrar cliques nas abas de fase
            document.querySelectorAll('.phase-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    btn.parentElement.querySelectorAll('.phase-tab-btn').forEach(b => {
                        b.classList.remove('active');
                        b.style.background = 'transparent';
                        b.style.borderColor = 'transparent';
                        b.style.color = 'rgba(255, 255, 255, 0.4)';
                    });
                    btn.classList.add('active');
                    btn.style.color = btn.dataset.phase === 'Adulto' ? '#10b981' : '#f59e0b';
                    btn.style.background = btn.dataset.phase === 'Adulto' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)';
                    btn.style.borderColor = btn.dataset.phase === 'Adulto' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';
                    
                    const container = btn.closest('.info-section-card') || btn.closest('.general-visual-card') || btn.closest('.dimensions-visual-card') || btn.closest('.info-section');
                    applyCombinedFilters(container);
                });
            });

            // Lógica para navegação interna ativa
            const navAnchors = document.querySelectorAll('.nav-anchor');
            const sections = document.querySelectorAll('.middle-column .info-section-card, .info-sections .info-section');

            const makeActive = (link) => {
                navAnchors.forEach(a => a.classList.remove('active'));
                link.classList.add('active');
            };

            navAnchors.forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = anchor.getAttribute('href');
                    const targetSection = targetId ? document.querySelector(targetId) : null;
                    makeActive(anchor);
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            // Seletor dinâmico baseado no scroll usando getBoundingClientRect
            window.addEventListener('scroll', () => {
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

        async function loadPage() {
            mainContent.innerHTML = `<p class="loading">A carregar dados do animal...</p>`;
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
                    renderAnimalData(animalData, animalId);
                    fetchAndRenderSubspeciesParents(animalData.subespeciesDe);
                    fetchAndRenderRelatedAnimals(animalData.subfamilia, animalId);
                } else {
                    mainContent.innerHTML = `<p class="error">Erro: Animal não encontrado.</p>`;
                }
            } catch (error) {
                console.error("Erro ao carregar dados do animal:", error);
                mainContent.innerHTML = `<p class="error">Ocorreu um erro ao carregar os dados. Tente novamente.</p>`;
            }
        }
        
        loadPage();

