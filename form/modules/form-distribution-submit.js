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
        let distributionAreas = [];
        let distributionPoints = [];
        let habitatAreaOverlay = null;
        let habitatDraftPoints = [];
        let habitatDrawMode = false;
        const manualSelectedCountryCodes = new Set();
        const autoSelectedCountryCodes = new Set();

        const habitatAreaList = document.getElementById('habitatAreaList');
        const habitatPointList = document.getElementById('habitatPointList');
        const toggleHabitatDrawBtn = document.getElementById('toggleHabitatDrawBtn');
        const toggleHabitatPointBtn = document.getElementById('toggleHabitatPointBtn');
        const clearHabitatAreasBtn = document.getElementById('clearHabitatAreasBtn');
        const closeDistributionMapBtn = document.getElementById('closeDistributionMapBtn');
        const habitatDrawStatus = document.getElementById('habitatDrawStatus');
        let distributionMapPlaceholder = null;

        function getDistributionMapWrapper() {
            return document.querySelector('.map-container-wrapper.distribution-map-expanded') ||
                document.querySelector('#tabpanel-distribuicao .map-container-wrapper');
        }

        const getAreaHelpers = () => window.DistributionAreas || {};

        function getHighlightedCountryCodes() {
            return selectedCountries.filter(code =>
                !autoSelectedCountryCodes.has(code) || manualSelectedCountryCodes.has(code)
            );
        }

        function createHabitatAreaId() {
            return `area-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        }

        function createHabitatPointId() {
            return `point-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        }

        function updateHabitatDrawStatus(message = '') {
            if (habitatDrawStatus) habitatDrawStatus.textContent = message;
        }

        function renderHabitatAreaList() {
            if (!habitatAreaList) return;
            habitatAreaList.innerHTML = '';

            distributionAreas.forEach(area => {
                const item = document.createElement('div');
                item.className = 'habitat-area-item';
                item.dataset.areaId = area.id;

                const swatch = document.createElement('span');
                swatch.className = 'habitat-area-swatch';
                swatch.style.background = getAreaHelpers().getDistributionAreaColor?.(area.tipo) || '#ef4444';

                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.value = area.nome;
                nameInput.placeholder = 'Nome da área';
                nameInput.setAttribute('aria-label', 'Nome da área de habitat');
                nameInput.addEventListener('input', () => {
                    area.nome = nameInput.value;
                });

                const typeSelect = document.createElement('select');
                typeSelect.setAttribute('aria-label', 'Tipo da área de habitat');
                typeSelect.innerHTML = getAreaHelpers().getDistributionAreaTypeOptions?.(area.tipo) || '';
                typeSelect.addEventListener('change', () => {
                    area.tipo = typeSelect.value;
                    renderHabitatAreaList();
                    renderHabitatAreas();
                });

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'habitat-area-remove';
                removeButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
                removeButton.title = 'Remover área';
                removeButton.addEventListener('click', () => {
                    distributionAreas = distributionAreas.filter(current => current.id !== area.id);
                    renderHabitatAreaList();
                    renderHabitatAreas();
                    syncCountriesFromHabitatAreas();
                });

                item.append(swatch, nameInput, typeSelect, removeButton);
                habitatAreaList.appendChild(item);
            });
        }

        function renderHabitatPointList() {
            if (!habitatPointList) return;
            habitatPointList.innerHTML = '';

            distributionPoints.forEach(pointData => {
                const item = document.createElement('div');
                item.className = 'habitat-area-item';
                item.dataset.pointId = pointData.id;

                const swatch = document.createElement('span');
                swatch.className = 'habitat-area-swatch';
                swatch.style.background = getAreaHelpers().getDistributionAreaColor?.(pointData.tipo) || '#ef4444';

                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.value = pointData.nome;
                nameInput.placeholder = 'Nome do ponto';
                nameInput.setAttribute('aria-label', 'Nome do ponto de distribuição');
                nameInput.addEventListener('input', () => {
                    pointData.nome = nameInput.value;
                });

                const typeSelect = document.createElement('select');
                typeSelect.setAttribute('aria-label', 'Tipo do ponto de distribuição');
                typeSelect.innerHTML = getAreaHelpers().getDistributionAreaTypeOptions?.(pointData.tipo) || '';
                typeSelect.addEventListener('change', () => {
                    pointData.tipo = typeSelect.value;
                    renderHabitatPointList();
                    renderHabitatAreas();
                });

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'habitat-area-remove';
                removeButton.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
                removeButton.title = 'Remover ponto';
                removeButton.addEventListener('click', () => {
                    distributionPoints = distributionPoints.filter(current => current.id !== pointData.id);
                    renderHabitatPointList();
                    renderHabitatAreas();
                });

                item.append(swatch, nameInput, typeSelect, removeButton);
                habitatPointList.appendChild(item);
            });
        }

        function renderHabitatAreas() {
            if (habitatAreaOverlay) {
                habitatAreaOverlay.render(distributionAreas, habitatDraftPoints, distributionPoints);
            }
            renderHabitatAreaList();
            renderHabitatPointList();
        }

        function focusDistributionMapContent(attempt = 0) {
            if (!mapForm) return;

            const mapContainer = document.getElementById('distributionMapForm');
            if ((!mapContainer || mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) && attempt < 15) {
                setTimeout(() => focusDistributionMapContent(attempt + 1), 80);
                return;
            }

            const focusGeometry = getAreaHelpers().focusDistributionGeometry;
            if (typeof focusGeometry === 'function' && focusGeometry(
                mapForm,
                mapContainer,
                distributionAreas,
                distributionPoints,
                { animate: false, padding: 0.35, maximumZoom: 7 }
            )) return;

            const highlightedCodes = getHighlightedCountryCodes();
            if (!highlightedCodes.length || typeof mapForm.setFocus !== 'function') return;

            try {
                mapForm.setFocus({ regions: highlightedCodes, animate: false });
            } catch (error) {
                try {
                    mapForm.setFocus({ region: highlightedCodes[0], animate: false });
                } catch (fallbackError) {
                    console.warn('Não foi possível focar a distribuição no mapa.', fallbackError);
                }
            }
        }

        function syncCountriesFromHabitatAreas() {
            const detectCountries = getAreaHelpers().getCountriesCoveredByArea;
            const mapContainer = document.getElementById('distributionMapForm');
            if (!mapContainer || typeof detectCountries !== 'function') return;

            const detectedCodes = new Set();
            distributionAreas.forEach(area => {
                detectCountries(mapContainer, area.pontos).forEach(code => detectedCodes.add(code));
            });

            detectedCodes.forEach(code => {
                if (!selectedCountries.includes(code)) {
                    selectedCountries.push(code);
                    paisesDetalhes[code] = 'inteiro';
                    autoSelectedCountryCodes.add(code);
                } else if (!manualSelectedCountryCodes.has(code)) {
                    autoSelectedCountryCodes.add(code);
                }
            });

            [...autoSelectedCountryCodes].forEach(code => {
                if (!detectedCodes.has(code) && !manualSelectedCountryCodes.has(code)) {
                    selectedCountries = selectedCountries.filter(current => current !== code);
                    delete paisesDetalhes[code];
                    autoSelectedCountryCodes.delete(code);
                }
            });

            if (mapForm) mapForm.setSelectedRegions(getHighlightedCountryCodes());
            renderSelectedCountries();
            focusDistributionMapContent();
        }

        function toggleExpandedDistributionMap(expanded) {
            const wrapper = getDistributionMapWrapper();
            if (!wrapper) return;

            if (expanded && !distributionMapPlaceholder) {
                distributionMapPlaceholder = document.createComment('Lugar original do mapa de distribuição');
                wrapper.parentNode.insertBefore(distributionMapPlaceholder, wrapper);
            }

            if (expanded && wrapper.parentNode !== document.body) {
                document.body.appendChild(wrapper);
            }

            wrapper.classList.toggle('distribution-map-expanded', expanded);
            document.body.classList.toggle('distribution-map-modal-open', expanded);
            document.documentElement.classList.toggle('distribution-map-modal-open', expanded);

            if (!expanded && distributionMapPlaceholder?.parentNode) {
                distributionMapPlaceholder.parentNode.insertBefore(wrapper, distributionMapPlaceholder.nextSibling);
                distributionMapPlaceholder.remove();
                distributionMapPlaceholder = null;
            }

            setTimeout(() => {
                mapForm?.updateSize();
                renderHabitatAreas();
                focusDistributionMapContent();
            }, 80);
        }

        function setHabitatDrawMode(mode = false) {
            habitatDrawMode = mode === 'area' || mode === 'point' ? mode : false;
            if (habitatDrawMode !== 'area') habitatDraftPoints = [];
            habitatAreaOverlay?.setDrawing(Boolean(habitatDrawMode));
            if (toggleHabitatDrawBtn) {
                toggleHabitatDrawBtn.innerHTML = habitatDrawMode === 'area'
                    ? '<i class="fa-solid fa-check"></i> Terminar área'
                    : '<i class="fa-solid fa-draw-polygon"></i> Desenhar área';
                toggleHabitatDrawBtn.classList.toggle('active', habitatDrawMode === 'area');
            }
            if (toggleHabitatPointBtn) {
                toggleHabitatPointBtn.innerHTML = habitatDrawMode === 'point'
                    ? '<i class="fa-solid fa-check"></i> Terminar pontos'
                    : '<i class="fa-solid fa-location-dot"></i> Desenhar pontos';
                toggleHabitatPointBtn.classList.toggle('active', habitatDrawMode === 'point');
            }
            const status = habitatDrawMode === 'area'
                ? 'Modo de desenho activo: marque pelo menos três pontos no mapa.'
                : habitatDrawMode === 'point'
                    ? 'Modo de pontos activo: clique no mapa para adicionar cada ponto.'
                    : '';
            updateHabitatDrawStatus(status);
            renderHabitatAreas();
        }

        function finishHabitatArea() {
            if (habitatDraftPoints.length < 3) {
                updateHabitatDrawStatus('A área precisa de pelo menos três pontos.');
                return;
            }

            distributionAreas.push({
                id: createHabitatAreaId(),
                nome: `Área de habitat ${distributionAreas.length + 1}`,
                tipo: 'actual',
                pontos: habitatDraftPoints.map(point => [...point])
            });
            habitatDraftPoints = [];
            setHabitatDrawMode(false);
            syncCountriesFromHabitatAreas();
            updateHabitatDrawStatus('Área adicionada. Pode alterar o nome e o tipo abaixo do mapa.');
        }

        function zoomHabitatMap(event) {
            if (!mapForm || typeof mapForm._setScale !== 'function') return;

            const currentScale = Number(mapForm.scale) || 1;
            const zoomStep = Number(mapForm.params?.zoomStep) || 1.5;
            const direction = event.deltaY < 0 ? zoomStep : 1 / zoomStep;
            const minimum = Number(mapForm.params?.zoomMin) || 1;
            const maximum = Number(mapForm.params?.zoomMax) || 12;
            const nextScale = Math.min(maximum, Math.max(minimum, currentScale * direction));
            if (nextScale === currentScale) return;

            const container = document.getElementById('distributionMapForm');
            const rect = container?.getBoundingClientRect();
            const x = rect ? event.clientX - rect.left : (Number(mapForm._width) || 0) / 2;
            const y = rect ? event.clientY - rect.top : (Number(mapForm._height) || 0) / 2;
            mapForm._setScale(nextScale, x, y, false, mapForm.params?.zoomAnimate !== false);
        }

        function initHabitatAreaOverlay() {
            const container = document.getElementById('distributionMapForm');
            const createOverlay = getAreaHelpers().createDistributionAreaOverlay;
            if (!container || typeof createOverlay !== 'function') return;
            habitatAreaOverlay = createOverlay(container, {
                areas: distributionAreas,
                points: distributionPoints,
                onWheel: zoomHabitatMap,
                onPoint: point => {
                    if (habitatDrawMode === 'area') {
                        habitatDraftPoints.push(point);
                    } else if (habitatDrawMode === 'point') {
                        distributionPoints.push({
                            id: createHabitatPointId(),
                            nome: `Ponto ${distributionPoints.length + 1}`,
                            tipo: 'actual',
                            ponto: [...point]
                        });
                    } else {
                        return;
                    }
                    renderHabitatAreas();
                }
            });
            renderHabitatAreas();
            syncCountriesFromHabitatAreas();
        }

        toggleHabitatDrawBtn?.addEventListener('click', () => {
            if (habitatDrawMode === 'area') finishHabitatArea();
            else {
                toggleExpandedDistributionMap(true);
                setHabitatDrawMode('area');
            }
        });

        toggleHabitatPointBtn?.addEventListener('click', () => {
            if (habitatDrawMode === 'point') setHabitatDrawMode(false);
            else {
                toggleExpandedDistributionMap(true);
                setHabitatDrawMode('point');
            }
        });

        clearHabitatAreasBtn?.addEventListener('click', () => {
            distributionAreas = [];
            distributionPoints = [];
            habitatDraftPoints = [];
            setHabitatDrawMode(false);
            syncCountriesFromHabitatAreas();
            updateHabitatDrawStatus('Todas as áreas e pontos foram removidos.');
        });

        closeDistributionMapBtn?.addEventListener('click', () => {
            if (habitatDrawMode) setHabitatDrawMode(false);
            toggleExpandedDistributionMap(false);
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                if (habitatDrawMode) setHabitatDrawMode(false);
                toggleExpandedDistributionMap(false);
            }
        });

        window.getDistributionAreasData = () => distributionAreas.map(area => ({
            id: area.id,
            nome: area.nome,
            tipo: area.tipo,
            // O Firestore não aceita arrays aninhados. O leitor normaliza
            // objetos { x, y } para o mesmo formato interno [x, y].
            pontos: area.pontos.map(point => ({ x: point[0], y: point[1] }))
        }));

        window.getDistributionPointsData = () => distributionPoints.map(point => ({
            id: point.id,
            nome: point.nome,
            tipo: point.tipo,
            ponto: { x: point.ponto[0], y: point.ponto[1] }
        }));

        window.getAutoDetectedDistributionCountryCodes = () => [...autoSelectedCountryCodes]
            .filter(code => selectedCountries.includes(code) && !manualSelectedCountryCodes.has(code));

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
                manualSelectedCountryCodes.add(activeModalCountryCode);
                autoSelectedCountryCodes.delete(activeModalCountryCode);
                paisesDetalhes[activeModalCountryCode] = choice;
                mapForm?.setSelectedRegions(getHighlightedCountryCodes());
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
                draggable: true,
                zoomButtons: true,
                zoomOnScroll: true,
                zoomOnScrollSpeed: 3,
                zoomMax: 12,
                zoomMin: 1,
                zoomAnimate: true,
                regionsSelectable: true,
                regionsSelectableOne: false,
                selectedRegions: getHighlightedCountryCodes(),
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
                    if (habitatDrawMode) {
                        window.isUpdatingMapSelection = true;
                        mapForm?.setSelectedRegions(getHighlightedCountryCodes());
                        window.isUpdatingMapSelection = false;
                        return;
                    }
                    if (isSelected) {
                        if (!selectedCountries.includes(code)) {
                            selectedCountries.push(code);
                            paisesDetalhes[code] = 'inteiro';
                            manualSelectedCountryCodes.add(code);
                            autoSelectedCountryCodes.delete(code);
                            renderSelectedCountries();
                            applySubregionGradient(code, 'inteiro');
                            openSubregionModal(code);
                        } else if (autoSelectedCountryCodes.has(code)) {
                            manualSelectedCountryCodes.add(code);
                            autoSelectedCountryCodes.delete(code);
                            mapForm.setSelectedRegions(getHighlightedCountryCodes());
                            applySubregionGradient(code, paisesDetalhes[code] || 'inteiro');
                            renderSelectedCountries();
                            openSubregionModal(code);
                        }
                    } else {
                        if (selectedCountries.includes(code)) {
                            // User clicked an already selected country, so it was deselected.
                            // We want to KEEP it selected and open the modal!
                            window.isUpdatingMapSelection = true;
                            mapForm.setSelectedRegions(getHighlightedCountryCodes());
                            window.isUpdatingMapSelection = false;
                            applySubregionGradient(code, paisesDetalhes[code] || 'inteiro');
                            openSubregionModal(code);
                        }
                    }
                },
                onRegionClick: function(event, code) {
                    if (habitatDrawMode) return;
                    if (selectedCountries.includes(code)) {
                        openSubregionModal(code);
                    }
                }
            });
            setTimeout(initHabitatAreaOverlay, 0);
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
            }
            manualSelectedCountryCodes.add(code);
            autoSelectedCountryCodes.delete(code);
            renderSelectedCountries();
            if (mapForm) mapForm.setSelectedRegions(getHighlightedCountryCodes());
            applySubregionGradient(code, paisesDetalhes[code] || 'inteiro');
            openSubregionModal(code);
        }

        window.addImportedDistributionCountry = (code) => {
            if (countryList && countryList[code]) addCountrySilently(code);
        };

        function addCountrySilently(code) {
            if (!selectedCountries.includes(code)) {
                selectedCountries.push(code);
                paisesDetalhes[code] = 'inteiro';
            }
            manualSelectedCountryCodes.add(code);
            autoSelectedCountryCodes.delete(code);
            renderSelectedCountries();
            if (mapForm) mapForm.setSelectedRegions(getHighlightedCountryCodes());
            applySubregionGradient(code, paisesDetalhes[code] || 'inteiro');
        }

        function removeCountry(code) {
            selectedCountries = selectedCountries.filter(c => c !== code);
            delete paisesDetalhes[code];
            manualSelectedCountryCodes.delete(code);
            autoSelectedCountryCodes.delete(code);
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
                mapForm.setSelectedRegions(getHighlightedCountryCodes());
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
                const isAutoDetected = autoSelectedCountryCodes.has(code) && !manualSelectedCountryCodes.has(code);
                const tag = document.createElement('div');
                tag.className = 'country-tag';
                tag.style.cursor = 'pointer';
                tag.innerHTML = `
                    <span>${name} (${subLabels[subregion]})${isAutoDetected ? ' · detectado pela área' : ''}</span>
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

    
