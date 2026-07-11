// Distribuição, mapa e submissão
        let countryList = {};

        function getCountryName(codeOrEntry, fallback = '') {
            const entry = typeof codeOrEntry === 'string' && countryList[codeOrEntry] ? countryList[codeOrEntry] : codeOrEntry;
            if (entry && typeof entry === 'object') return entry.nome || fallback;
            return entry || fallback;
        }

        function getCountryContinent(codeOrEntry) {
            const entry = typeof codeOrEntry === 'string' && countryList[codeOrEntry] ? countryList[codeOrEntry] : codeOrEntry;
            return entry && typeof entry === 'object' ? (entry.continente || '') : '';
        }

        let selectedCountries = [];
        let paisesDetalhes = {};
        let mapForm = null;

        // Elementos do Modal de Subregião
        const subregionModalOverlay = document.getElementById('subregionModalOverlay');
        const subregionSelectModal = document.getElementById('subregionSelectModal');
        const subregionModalTitle = document.getElementById('subregionModalTitle');
        const closeSubregionModalBtn = document.getElementById('closeSubregionModalBtn');
        const saveSubregionModalBtn = document.getElementById('saveSubregionModalBtn');
        let activeModalCountryCode = null;

         const removeSubregionCountryBtn = document.getElementById('removeSubregionCountryBtn');

        function openSubregionModal(code) {
            activeModalCountryCode = code;
            const countryName = getCountryName(code, code);
            subregionModalTitle.textContent = `Área - ${countryName}`;
            subregionSelectModal.value = paisesDetalhes[code] || 'inteiro';
            subregionModalOverlay.style.display = 'flex';
        }

        function closeSubregionModal() {
            subregionModalOverlay.style.display = 'none';
            activeModalCountryCode = null;
        }

        closeSubregionModalBtn.addEventListener('click', closeSubregionModal);
        subregionModalOverlay.addEventListener('click', (e) => { if (e.target === subregionModalOverlay) closeSubregionModal(); });

        saveSubregionModalBtn.addEventListener('click', () => {
            if (activeModalCountryCode) {
                const choice = subregionSelectModal.value;
                paisesDetalhes[activeModalCountryCode] = choice;
                applySubregionGradient(activeModalCountryCode, choice);
                renderSelectedCountries();
            }
            closeSubregionModal();
        });

        removeSubregionCountryBtn.addEventListener('click', () => {
            if (activeModalCountryCode) {
                removeCountry(activeModalCountryCode);
            }
            closeSubregionModal();
        });

        function applySubregionGradient(code, subregion) {
            const svgDefs = document.querySelector('#aurora-gradient-svg defs');
            if (!svgDefs) return;

            const existingGrad = document.getElementById(`grad-${code}`);
            if (existingGrad) existingGrad.remove();

            if (subregion === 'inteiro') {
                const paths = document.querySelectorAll(`[data-code="${code}"]`);
                paths.forEach(path => {
                    path.setAttribute('fill', '#f59e0b');
                    path.style.fill = '#f59e0b';
                });
                return;
            }

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

            setTimeout(() => {
                const paths = document.querySelectorAll(`[data-code="${code}"]`);
                paths.forEach(path => {
                    path.setAttribute('fill', `url(#grad-${code})`);
                    path.style.fill = `url(#grad-${code})`;
                });
            }, 80);
        }

        function initMapForm() {
            const container = document.getElementById('distributionMapForm');
            if (!container) return;
            container.innerHTML = '';
            
            mapForm = new jsVectorMap({
                selector: '#distributionMapForm',
                map: 'world',
                regionsSelectable: true,
                regionsSelectableOne: false,
                selectedRegions: selectedCountries,
                regionStyle: {
                    initial: {
                        fill: '#2e2e38',
                        fillOpacity: 1,
                        stroke: '#3b3b4f',
                        strokeWidth: 0.5
                    },
                    hover: {
                        fill: '#f59e0b',
                        fillOpacity: 0.5,
                        cursor: 'pointer'
                    },
                    selected: {
                        fill: '#f59e0b',
                        fillOpacity: 1
                    }
                },
                onRegionSelected: function(code, isSelected) {
                    if (window.isUpdatingMapSelection) return;
                    if (isSelected) {
                        if (!selectedCountries.includes(code)) {
                            selectedCountries.push(code);
                            paisesDetalhes[code] = 'inteiro';
                            renderSelectedCountries();
                            applySubregionGradient(code, 'inteiro');
                            openSubregionModal(code);
                        }
                    } else {
                        if (selectedCountries.includes(code)) {
                            // User clicked an already selected country, so it was deselected.
                            // We want to KEEP it selected and open the modal!
                            window.isUpdatingMapSelection = true;
                            mapForm.setSelectedRegions(selectedCountries);
                            window.isUpdatingMapSelection = false;
                            applySubregionGradient(code, paisesDetalhes[code] || 'inteiro');
                            openSubregionModal(code);
                        }
                    }
                },
                onRegionClick: function(event, code) {
                    if (selectedCountries.includes(code)) {
                        openSubregionModal(code);
                    }
                }
            });
        }

        const countrySearchInput = document.getElementById('countrySearchInput');
        const countryAutocompleteDropdown = document.getElementById('countryAutocompleteDropdown');
        const selectedCountriesList = document.getElementById('selectedCountriesList');

        const normalizeStr = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        let englishNames;
        try {
            englishNames = new Intl.DisplayNames(['en'], { type: 'region' });
        } catch (e) {
            console.error("Intl.DisplayNames is not supported in this browser.", e);
        }

        function findCountryCode(searchText) {
            const clean = (s) => {
                return normalizeStr(s)
                    .replace(/[\s\-().,]+/g, ' ')
                    .replace(/\b(de|do|da|dos|das|o|a|os|as|of|the|and|e)\b/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            };

            const valClean = clean(searchText);
            if (!valClean) return null;

            const entries = Object.entries(countryList).map(([code, entry]) => {
                const name = getCountryName(entry, code);
                let enName = '';
                if (englishNames) {
                    try {
                        enName = englishNames.of(code.toUpperCase()) || '';
                    } catch (e) {}
                }
                return {
                    code,
                    ptClean: clean(name),
                    enClean: clean(enName),
                    codeClean: clean(code)
                };
            });

            // 1. Exact match on cleaned name
            let match = entries.find(e => e.ptClean === valClean || e.enClean === valClean || e.codeClean === valClean);
            if (match) return match.code;

            // 2. StartsWith or includes
            match = entries.find(e => e.ptClean.includes(valClean) || valClean.includes(e.ptClean) || e.enClean.includes(valClean) || valClean.includes(e.enClean));
            if (match) return match.code;

            // Common custom variants & typo mappings
            const normalizedVal = normalizeStr(searchText);
            if (normalizedVal.includes("burquina fass") || normalizedVal.includes("burkina fas")) {
                return "BF";
            }
            if (normalizedVal.includes("democratica do congo") || normalizedVal.includes("congo dem") || normalizedVal.includes("dr congo")) {
                return "CD";
            }
            if (normalizedVal.includes("republica do congo") || normalizedVal.includes("congo republica")) {
                return "CG";
            }
            if (normalizedVal.includes("marfim") || normalizedVal.includes("ivory coast")) {
                return "CI";
            }
            if (normalizedVal.includes("centro-africana") || normalizedVal.includes("centro africana") || normalizedVal.includes("central african")) {
                return "CF";
            }
            if (normalizedVal.includes("guine-bissau") || normalizedVal.includes("guine bissau")) {
                return "GW";
            }
            if (normalizedVal.includes("guine equatorial") || normalizedVal.includes("equatorial guinea")) {
                return "GQ";
            }

            return null;
        }

        countrySearchInput.addEventListener('input', () => {
            const rawVal = countrySearchInput.value;
            if (rawVal.includes(',')) {
                const parts = rawVal.split(',').map(p => p.trim()).filter(Boolean);
                parts.forEach(part => {
                    const code = findCountryCode(part);
                    if (code) {
                        addCountrySilently(code);
                    }
                });
                countrySearchInput.value = '';
                countryAutocompleteDropdown.style.display = 'none';
                return;
            }

            const val = normalizeStr(rawVal.trim());
            if (!val) {
                countryAutocompleteDropdown.style.display = 'none';
                return;
            }

            const matches = Object.entries(countryList).filter(([code, entry]) => {
                const name = getCountryName(entry, code);
                let enName = '';
                if (englishNames) {
                    try {
                        enName = englishNames.of(code.toUpperCase()) || '';
                    } catch (e) {}
                }
                return normalizeStr(name).includes(val) || 
                       normalizeStr(code).includes(val) || 
                       normalizeStr(enName).includes(val);
            }).slice(0, 10);

            if (matches.length === 0) {
                countryAutocompleteDropdown.style.display = 'none';
                return;
            }

            countryAutocompleteDropdown.innerHTML = '';
            matches.forEach(([code, entry]) => {
                const name = getCountryName(entry, code);
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = name;
                item.addEventListener('click', () => {
                    addCountry(code);
                    countrySearchInput.value = '';
                    countryAutocompleteDropdown.style.display = 'none';
                });
                countryAutocompleteDropdown.appendChild(item);
            });
            countryAutocompleteDropdown.style.display = 'block';
        });

        document.addEventListener('click', (e) => {
            if (e.target !== countrySearchInput) {
                countryAutocompleteDropdown.style.display = 'none';
            }
        });

        function addCountry(code) {
            if (!selectedCountries.includes(code)) {
                selectedCountries.push(code);
                paisesDetalhes[code] = 'inteiro';
                renderSelectedCountries();
                if (mapForm) {
                    mapForm.setSelectedRegions(selectedCountries);
                }
                openSubregionModal(code);
            }
        }

        function addCountrySilently(code) {
            if (!selectedCountries.includes(code)) {
                selectedCountries.push(code);
                paisesDetalhes[code] = 'inteiro';
                renderSelectedCountries();
                if (mapForm) {
                    mapForm.setSelectedRegions(selectedCountries);
                }
                applySubregionGradient(code, 'inteiro');
            }
        }

        function removeCountry(code) {
            selectedCountries = selectedCountries.filter(c => c !== code);
            delete paisesDetalhes[code];
            const existingGrad = document.getElementById(`grad-${code}`);
            if (existingGrad) existingGrad.remove();
            
            // Reset path styles for the removed country
            const paths = document.querySelectorAll(`[data-code="${code}"]`);
            paths.forEach(path => {
                path.removeAttribute('fill');
                path.style.fill = '';
            });

            renderSelectedCountries();
            if (mapForm) {
                mapForm.setSelectedRegions(selectedCountries);
            }
        }

        function renderSelectedCountries() {
            selectedCountriesList.innerHTML = '';
            selectedCountries.forEach(code => {
                const name = getCountryName(code, code);
                const subLabels = {
                    'inteiro': 'País inteiro',
                    'esquerdo': 'Lado esquerdo',
                    'direito': 'Lado direito',
                    'cima': 'Lado de cima',
                    'baixo': 'Lado de baixo'
                };
                const subregion = paisesDetalhes[code] || 'inteiro';
                const tag = document.createElement('div');
                tag.className = 'country-tag';
                tag.style.cursor = 'pointer';
                tag.innerHTML = `
                    <span>${name} (${subLabels[subregion]})</span>
                    <button type="button" data-code="${code}">&times;</button>
                `;
                tag.querySelector('span').addEventListener('click', (e) => {
                    e.stopPropagation();
                    openSubregionModal(code);
                });
                tag.querySelector('button').addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeCountry(code);
                });
                selectedCountriesList.appendChild(tag);
            });
        }

        async function loadEditParamAnimalIfNeeded() {
            const params = new URLSearchParams(window.location.search);
            const animalIdFromUrl = params.get('edit') || params.get('id') || params.get('animal');
            if (!animalIdFromUrl) return;

            let animal = allAnimals.find(item => item.id === animalIdFromUrl) ||
                (Array.isArray(editModalAnimals) ? editModalAnimals.find(item => item.id === animalIdFromUrl) : null);

            if (!animal) {
                try {
                    const snap = await getDoc(doc(db, 'animais', animalIdFromUrl));
                    if (snap.exists()) {
                        animal = { id: snap.id, ...snap.data() };
                        allAnimals.unshift(animal);
                        if (Array.isArray(editModalAnimals)) editModalAnimals.unshift(animal);
                        await loadExistingFamilies();
                    }
                } catch (error) {
                    console.error('Erro ao carregar animal pelo parâmetro de edição:', error);
                }
            }

            if (animal) {
                loadDataIntoForm(animal.id);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }

        async function bootFormWhenScientificSectionIsReady() {
            try {
                await initializePage();
                updateScientificNameGate({ focusScientificField: true });
                await loadEditParamAnimalIfNeeded();
                document.documentElement.dataset.formScientificReady = 'true';
                window.dispatchEvent(new CustomEvent('form:scientificGateReady'));
            } catch (error) {
                console.error('Erro ao preparar o formulário:', error);
                document.documentElement.dataset.formScientificReady = 'error';
                window.dispatchEvent(new CustomEvent('form:scientificGateReady'));
            }
        }

        bootFormWhenScientificSectionIsReady();

    
