// Plumagem, autocomplete, edição e importação taxonómica
        function getPlumageOptions(group = 'plumagem') {
            return plumageOptionsByGroup[group] || [];
        }

        function fillPlumageTypeSelect(select, group = 'plumagem', selectedValue = '') {
            const options = [...getPlumageOptions(group)].sort((a, b) => a.localeCompare(b));
            const hasSelected = selectedValue && options.includes(selectedValue);
            select.innerHTML = `<option value="">Escolhe um tipo</option>` +
                options.map(option => `<option value="${option}">${option}</option>`).join('') +
                (selectedValue && !hasSelected ? `<option value="${selectedValue}">${selectedValue} — personalizado</option>` : '');
            select.value = selectedValue;
        }

        function getPlumageVisualMeta(type = '', group = 'plumagem') {
            const asset = plumageVisualAssets[type] || plumageVisualAssets['Rémiges'];
            return {
                label: type || 'Modelo visual',
                groupLabel: plumageVisualGroups[group] || 'Plumagem',
                image: asset.image,
                description: plumageTypeDescriptions[type] || 'Representação visual desta característica.'
            };
        }

        function createPlumageRow(group = 'plumagem', type = '', detail = '') {
            const row = document.createElement('div');
            row.className = 'plumage-row';

            const groupSelect = document.createElement('select');
            groupSelect.className = 'plumage-group';
            groupSelect.innerHTML = `
                <option value="plumagem">Tipo de plumagem</option>
                <option value="pena">Tipo de pena</option>
            `;
            groupSelect.value = group;

            const typeSelect = document.createElement('select');
            typeSelect.className = 'plumage-type';
            fillPlumageTypeSelect(typeSelect, group, type);

            const detailInput = document.createElement('input');
            detailInput.type = 'text';
            detailInput.className = 'plumage-detail';
            detailInput.placeholder = 'Ex: isolante, ornamental, voo...';
            detailInput.value = detail;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-dimension-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.setAttribute('aria-label', 'Remover tipo de plumagem');

            groupSelect.addEventListener('change', () => {
                fillPlumageTypeSelect(typeSelect, groupSelect.value);
                updatePlumagePreview();
            });
            typeSelect.addEventListener('change', updatePlumagePreview);
            detailInput.addEventListener('input', updatePlumagePreview);
            removeBtn.addEventListener('click', () => {
                row.remove();
                if (plumageRowsContainer.children.length === 0) createPlumageRow();
                updatePlumagePreview();
            });

            row.append(groupSelect, typeSelect, detailInput, removeBtn);
            plumageRowsContainer.appendChild(row);
            updatePlumagePreview();
        }

        function getPlumageData() {
            return [...plumageRowsContainer.querySelectorAll('.plumage-row')].map(row => ({
                grupo: row.querySelector('.plumage-group')?.value || 'plumagem',
                tipo: row.querySelector('.plumage-type')?.value || '',
                detalhe: row.querySelector('.plumage-detail')?.value.trim() || ''
            })).filter(item => item.tipo || item.detalhe);
        }

        function setPlumageData(items = []) {
            plumageRowsContainer.innerHTML = '';
            if (!Array.isArray(items) || items.length === 0) {
                createPlumageRow();
                return;
            }
            items.forEach(item => createPlumageRow(item.grupo || 'plumagem', item.tipo || '', item.detalhe || ''));
            updatePlumagePreview();
        }

        function renderPlumageModelCard(item, isSuggestion = false) {
            const group = item.grupo || item.group || 'plumagem';
            const type = item.tipo || item;
            const meta = getPlumageVisualMeta(type, group);
            const detail = item.detalhe || meta.description;
            return `
                <article class="plumage-model-card${isSuggestion ? ' is-suggestion' : ''}">
                    <div class="plumage-model-figure">
                        <img src="${meta.image}" alt="${meta.label}">
                    </div>
                    <div class="plumage-model-copy">
                        <div class="plumage-model-label">${meta.label}</div>
                        <div class="plumage-model-value">${detail}</div>
                        <div class="plumage-model-meta">${meta.groupLabel}</div>
                    </div>
                </article>`;
        }

        function updatePlumagePreview() {
            const selected = getPlumageData();
            const isBird = getSelectedCategory() === 'Aves';
            const hero = selected[0] || { grupo: 'pena', tipo: 'Rémiges' };
            const heroMeta = getPlumageVisualMeta(hero.tipo || 'Rémiges', hero.grupo || 'pena');
            plumageHeroImage.src = heroMeta.image;
            plumageHeroImage.alt = heroMeta.label;
            plumageHeroTitle.textContent = heroMeta.label;
            plumageHeroText.textContent = selected[0]?.detalhe || heroMeta.description;

            if (!isBird) {
                previewPlumageModels.innerHTML = '<div class="dimension-model-empty">A secção de plumagem só fica ativa quando a categoria é <strong>Aves</strong>.</div>';
                return;
            }

            if (selected.length) {
                previewPlumageModels.innerHTML = selected.map(item => renderPlumageModelCard(item)).join('');
                return;
            }

            const suggestions = [
                { grupo: 'pena', tipo: 'Rémiges' },
                { grupo: 'pena', tipo: 'Retrizes' },
                { grupo: 'pena', tipo: 'Tectrizes' },
                { grupo: 'pena', tipo: 'Penugem' },
                { grupo: 'pena', tipo: 'Filoplumas' },
                { grupo: 'plumagem', tipo: 'Plumagem nupcial' },
                { grupo: 'plumagem', tipo: 'Plumagem de camuflagem' },
                { grupo: 'plumagem', tipo: 'Plumagem ornamental' }
            ];
            previewPlumageModels.innerHTML = suggestions.map(item => renderPlumageModelCard(item, true)).join('');
        }

        addPlumageBtn.addEventListener('click', () => createPlumageRow());
        setPlumageData();

        // --- BUSCA AUTOMÁTICA DE VÍDEOS VIA YOUTUBE API ---
        const YOUTUBE_API_KEY = "AIzaSyAum4ZdzQbhJbTVQG1bjV-xrKBkratnsWk";
        let debounceTimer;
        const debounce = (callback, time) => {
            window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(callback, time);
        };

        const searchAndFillVideos = async () => {
            if (isEditMode) return;
            const searchTerm = nomeCientificoInput.value.trim();
            if (searchTerm.length < 3) return;
            const api_url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&maxResults=5&type=video&key=${YOUTUBE_API_KEY}`;
            try {
                const response = await fetch(api_url);
                if (!response.ok) { throw new Error('Erro na API do YouTube'); }
                const data = await response.json();
                for (let i = 1; i <= 5; i++) { document.getElementById(`video${i}`).value = ''; }
                if (data.items) {
                    data.items.forEach((item, index) => {
                        if (index < 5) { document.getElementById(`video${index + 1}`).value = `https://www.youtube.com/watch?v=${item.id.videoId}`; }
                    });
                }
            } catch (error) { console.error("Erro ao pesquisar vídeos:", error); }
        };
        nomeCientificoInput.addEventListener('input', () => {
            updateRecordDuplicateWarning();
            updateScientificNameGate();
            debounce(searchAndFillVideos, 800);
        });

        // --- AUTOCOMPLETE DE FAMÍLIA E CAMPOS AVANÇADOS ---
        async function loadExistingFamilies() {
            existingFamilies.clear();
            existingReinos.clear();
            existingFilos.clear();
            existingSubfilos.clear();
            existingClasses.clear();
            existingSuperordens.clear();
            existingOrdens.clear();
            existingSubordens.clear();
            existingInfraordens.clear();
            existingGeneros.clear();
            existingEspeciesList.clear();
            allAnimals.forEach(animal => {
                if (animal.familia) existingFamilies.add(animal.familia);
                if (animal.reino) existingReinos.add(animal.reino);
                if (animal.filo) existingFilos.add(animal.filo);
                if (animal.subfilo) existingSubfilos.add(animal.subfilo);
                if (animal.classe) existingClasses.add(animal.classe);
                if (animal.superordem) existingSuperordens.add(animal.superordem);
                if (animal.ordem) existingOrdens.add(animal.ordem);
                if (animal.subordem) existingSubordens.add(animal.subordem);
                if (animal.infraordem) existingInfraordens.add(animal.infraordem);
                if (animal.genero) existingGeneros.add(animal.genero);
                if (animal.especie) existingEspeciesList.add(animal.especie);
            });
        }

        function setupAutocomplete(inputEl, resultsContainer, cacheSet) {
            inputEl.addEventListener('input', () => {
                const searchTerm = inputEl.value.toLowerCase().trim();
                if (!searchTerm) {
                    resultsContainer.style.display = 'none';
                    return;
                }
                const filtered = [...cacheSet].filter(val => val.toLowerCase().includes(searchTerm));
                resultsContainer.innerHTML = '';
                if (filtered.length > 0) {
                    filtered.forEach(value => {
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.textContent = value;
                        item.addEventListener('click', () => {
                            inputEl.value = value;
                            resultsContainer.style.display = 'none';
                        });
                        resultsContainer.appendChild(item);
                    });
                    resultsContainer.style.display = 'block';
                } else {
                    resultsContainer.style.display = 'none';
                }
            });

            // Fechar ao clicar fora
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.autocomplete-container') && e.target !== inputEl) {
                    resultsContainer.style.display = 'none';
                }
            });
        }

        // Configurar todos os autocompletes de texto
        setupAutocomplete(familiaInput, familiaResultsContainer, existingFamilies);
        setupAutocomplete(reinoInput, reinoResultsContainer, existingReinos);
        setupAutocomplete(filoInput, filoResultsContainer, existingFilos);
        setupAutocomplete(subfiloInput, subfiloResultsContainer, existingSubfilos);
        setupAutocomplete(classeInput, classeResultsContainer, existingClasses);
        setupAutocomplete(superordemInput, superordemResultsContainer, existingSuperordens);
        setupAutocomplete(ordemInput, ordemResultsContainer, existingOrdens);
        setupAutocomplete(subordemInput, subordemResultsContainer, existingSubordens);
        setupAutocomplete(infraordemInput, infraordemResultsContainer, existingInfraordens);
        setupAutocomplete(generoInput, generoResultsContainer, existingGeneros);
        setupAutocomplete(especiesInput, especiesResultsContainer, existingEspeciesList);

        // Lógica de Subespécies de (outros animais)
        subespeciesDeSearchInput.addEventListener('input', () => {
            const searchTerm = subespeciesDeSearchInput.value.toLowerCase().trim();
            if (!searchTerm) {
                subespeciesDeResultsContainer.style.display = 'none';
                return;
            }
            const filtered = allAnimals.filter(animal => {
                if (isEditMode && animal.id === currentEditingId) return false;
                const nome = (animal.nome || '').toLowerCase();
                const cientifico = (animal.nomeCientifico || '').toLowerCase();
                return nome.includes(searchTerm) || cientifico.includes(searchTerm);
            });

            subespeciesDeResultsContainer.innerHTML = '';
            if (filtered.length > 0) {
                filtered.forEach(animal => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.textContent = `${animal.nome} (${animal.nomeCientifico})`;
                    item.addEventListener('click', () => {
                        addSubespecie(animal.id, animal.nome);
                        subespeciesDeSearchInput.value = '';
                        subespeciesDeResultsContainer.style.display = 'none';
                    });
                    subespeciesDeResultsContainer.appendChild(item);
                });
                subespeciesDeResultsContainer.style.display = 'block';
            } else {
                subespeciesDeResultsContainer.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target !== subespeciesDeSearchInput) {
                subespeciesDeResultsContainer.style.display = 'none';
            }
        });

        function addSubespecie(id, nome) {
            if (!selectedSubespecies.includes(id)) {
                selectedSubespecies.push(id);
                renderSubespeciesTags();
            }
        }

        function removeSubespecie(id) {
            selectedSubespecies = selectedSubespecies.filter(sid => sid !== id);
            renderSubespeciesTags();
        }

        function renderSubespeciesTags() {
            selectedSubespeciesList.innerHTML = '';
            selectedSubespecies.forEach(id => {
                const animal = allAnimals.find(a => a.id === id);
                const nome = animal ? animal.nome : id;
                
                const tag = document.createElement('span');
                tag.className = 'country-tag';
                tag.innerHTML = `${nome} <i class="fa-solid fa-xmark" style="cursor: pointer; margin-left: 5px;"></i>`;
                tag.querySelector('i').addEventListener('click', () => removeSubespecie(id));
                selectedSubespeciesList.appendChild(tag);
            });
        }

        // CONTROLAR EXIBIÇÃO DE CAMPOS AVANÇADOS
        toggleAdvancedBtn.addEventListener('click', () => {
            const isHidden = advancedFieldsContainer.style.display === 'none';
            if (isHidden) {
                advancedFieldsContainer.style.display = 'grid';
                toggleAdvancedBtn.classList.add('active');
            } else {
                advancedFieldsContainer.style.display = 'none';
                toggleAdvancedBtn.classList.remove('active');
            }
        });

        // --- CONTROLO DO MODAL DE EDIÇÃO ---
        function normalizeString(str) {
            if (!str) return '';
            return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '');
        }

        function getEditModalSourceAnimals() {
            const source = [];
            const seen = new Set();
            const addAnimal = (animal) => {
                if (!animal?.id || seen.has(animal.id)) return;
                seen.add(animal.id);
                source.push(animal);
            };

            if (Array.isArray(editModalAnimals)) editModalAnimals.forEach(addAnimal);
            if (Array.isArray(allAnimals)) allAnimals.forEach(addAnimal);
            return source;
        }

        function getAnimalQualityLevel(animal = {}) {
            return normalizeQualityLevel(animal.nivelQualidade || animal.qualidadeRegisto?.nivel || animal.qualidadeRegisto?.id || 'basico');
        }

        function getEditFilteredAnimals() {
            const normalizedSearchTerm = normalizeString(editSearchInput.value.trim());
            return getEditModalSourceAnimals().filter(animal => {
                const matchesSearch = !normalizedSearchTerm ||
                    normalizeString(animal.nome).includes(normalizedSearchTerm) ||
                    normalizeString(animal.nomeCientifico).includes(normalizedSearchTerm);
                const matchesQuality = !activeEditQualityFilter || getAnimalQualityLevel(animal) === activeEditQualityFilter;
                return matchesSearch && matchesQuality;
            });
        }

        function renderCategoryWithQuality(animal, catDisplay) {
            const qualityLevel = getAnimalQualityLevel(animal);
            const qualityMeta = getQualityLevelMeta(qualityLevel);
            const categoryText = catDisplay || 'Sem categoria';
            return `<span class="edit-category-text">${categoryText}</span><span class="quality-mini-icon ${qualityMeta.className}" title="${qualityMeta.label}" aria-label="${qualityMeta.label}"><i class="${qualityMeta.icon}"></i></span>`;
        }

        function populateEditList(animals) {
            editListContainer.innerHTML = '';
            if (animals.length === 0) {
                editListContainer.innerHTML = '<p style="padding: 15px; text-align: center; color: var(--text-secondary);">Nenhum animal encontrado.</p>';
                return;
            }
            animals.forEach(animal => {
                let catDisplay = '';
                if (typeof animal.categoria === 'string') {
                    catDisplay = animal.categoria;
                } else if (animal.categoria && typeof animal.categoria === 'object') {
                    catDisplay = Object.keys(animal.categoria)
                        .filter(key => animal.categoria[key] === true)
                        .join(', ');
                }

                const item = document.createElement('div');
                item.className = 'edit-item';
                item.innerHTML = `
                    <div class="edit-item-info">
                        <div class="nome">${animal.nome} (${animal.nomeCientifico})</div>
                        <div class="categoria edit-item-category-line">${renderCategoryWithQuality(animal, catDisplay)}</div>
                    </div>
                    <button class="edit-item-btn" data-id="${animal.id}">Editar</button>`;
                editListContainer.appendChild(item);
            });
        }

        function refreshEditList() {
            populateEditList(getEditFilteredAnimals());
        }

        let editModalFullSearchLoaded = false;
        let editModalFullSearchPromise = null;
        let editModalSearchDebounceTimer = null;

        function mergeAnimalsIntoEditCache(animals = []) {
            if (!Array.isArray(animals) || !animals.length) return;
            if (!Array.isArray(editModalAnimals)) editModalAnimals = [];
            if (!Array.isArray(allAnimals)) allAnimals = [];

            const upsert = (list, animal) => {
                if (!animal?.id) return;
                const index = list.findIndex(item => item.id === animal.id);
                if (index >= 0) {
                    list[index] = { ...list[index], ...animal };
                } else {
                    list.push(animal);
                }
            };

            animals.forEach(animal => {
                upsert(editModalAnimals, animal);
                upsert(allAnimals, animal);
            });
        }

        async function ensureEditModalFullSearchLoaded() {
            if (editModalFullSearchLoaded) return;
            if (editModalFullSearchPromise) return editModalFullSearchPromise;

            editModalFullSearchPromise = (async () => {
                const startTime = performance.now();
                logEditModal('Pesquisa global: a carregar todos os animais para procurar fora dos últimos 15...');
                const querySnapshot = await withEditModalTimeout(
                    getDocs(collection(db, "animais")),
                    12000,
                    'getDocs pesquisa global de animais'
                );

                const fetchedAnimals = [];
                querySnapshot.forEach(doc => fetchedAnimals.push({ id: doc.id, ...doc.data() }));
                mergeAnimalsIntoEditCache(fetchedAnimals);
                editModalFullSearchLoaded = true;

                logEditModal('Pesquisa global: concluída.', {
                    total: fetchedAnimals.length,
                    ms: Math.round(performance.now() - startTime)
                });
            })().finally(() => {
                editModalFullSearchPromise = null;
            });

            return editModalFullSearchPromise;
        }

        async function refreshEditListWithGlobalSearch() {
            const searchTerm = editSearchInput.value.trim();

            refreshEditList();

            // O popup abre rápido com os últimos 15. Só quando o utilizador pesquisa é que
            // carregamos o resto da coleção, para encontrar animais que não estão nessa lista.
            if (searchTerm.length < 2 || editModalFullSearchLoaded) return;

            const currentToken = normalizeString(searchTerm);
            const currentResults = getEditFilteredAnimals();
            if (currentResults.length) return;

            editListContainer.innerHTML = '<p style="padding: 15px; text-align: center; color: var(--text-secondary);">A procurar na base de dados...</p>';

            try {
                await ensureEditModalFullSearchLoaded();
            } catch (error) {
                warnEditModal('Pesquisa global falhou. A manter resultados já carregados.', error);
            }

            // Se o utilizador mudou a pesquisa durante o carregamento, não repomos resultados antigos.
            if (normalizeString(editSearchInput.value.trim()) !== currentToken) return;
            refreshEditList();
        }

        editSearchInput.addEventListener('input', () => {
            clearTimeout(editModalSearchDebounceTimer);
            editModalSearchDebounceTimer = setTimeout(refreshEditListWithGlobalSearch, 220);
        });

        const editQualityFilterBtn = document.getElementById('editQualityFilterBtn');
        const editQualityFilterPanel = document.getElementById('editQualityFilterPanel');
        editQualityFilterBtn?.addEventListener('click', () => {
            editQualityFilterPanel.style.display = editQualityFilterPanel.style.display === 'none' ? 'flex' : 'none';
        });
        editQualityFilterPanel?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-quality-filter]');
            if (!btn) return;

            const selectedFilter = btn.dataset.qualityFilter || '';
            const isClearButton = !selectedFilter || btn.classList.contains('quality-filter-clear');

            activeEditQualityFilter = isClearButton ? '' : normalizeQualityLevel(selectedFilter);
            editQualityFilterPanel.querySelectorAll('.quality-filter-choice').forEach(item => {
                item.classList.toggle('active', !!activeEditQualityFilter && item.dataset.qualityFilter === activeEditQualityFilter);
            });

            if (isClearButton) {
                editQualityFilterPanel.style.display = 'none';
            }

            refreshEditList();
        });

        function loadDataIntoForm(animalId) {
            const animal = allAnimals.find(a => a.id === animalId) || editModalAnimals.find(a => a.id === animalId);
            if (!animal) return;
            if (!allAnimals.some(a => a.id === animal.id)) {
                allAnimals.push(animal);
                loadExistingFamilies();
            }
            document.getElementById('nomeAnimal').value = animal.nome || '';
            document.getElementById('nomeCientifico').value = animal.nomeCientifico || '';
            document.getElementById('familia').value = animal.familia || '';
            document.getElementById('imagemUrl').value = animal.imagemUrl || '';
            document.getElementById('imagemObjectPosition').value = animal.imagemObjectPosition || 'center center';
            if (typeof setProfilePhotosData === 'function') setProfilePhotosData(animal);
            setCategoryData(animal.categoria);
            setRecordTypeData(animal);
            setQualityLevelData(animal);
            
            // Carregar campos avançados
            document.getElementById('reino').value = animal.reino || '';
            document.getElementById('filo').value = animal.filo || '';
            document.getElementById('subfilo').value = animal.subfilo || '';
            document.getElementById('classe').value = animal.classe || '';
            if (typeof window.syncCategoryFromScientificClass === 'function') {
                window.syncCategoryFromScientificClass();
            }
            if (document.getElementById('infraclasse')) document.getElementById('infraclasse').value = animal.infraclasse || '';
            document.getElementById('superordem').value = animal.superordem || '';
            document.getElementById('ordem').value = animal.ordem || '';
            document.getElementById('subordem').value = animal.subordem || '';
            document.getElementById('infraordem').value = animal.infraordem || '';
            if (document.getElementById('subfamilia')) document.getElementById('subfamilia').value = animal.subfamilia || '';
            document.getElementById('genero').value = animal.genero || '';
            if (document.getElementById('subgenero')) document.getElementById('subgenero').value = animal.subgenero || '';
            document.getElementById('especies').value = animal.especie || '';
            if (document.getElementById('autoridadeTaxonomica')) document.getElementById('autoridadeTaxonomica').value = animal.autoridadeTaxonomica || '';
            selectedSubespecies = animal.subespeciesDe || [];
            renderSubespeciesTags();

            const generalVisualData = animal.informacao.geralDetalhada || [];
            const legacyMatingItems = extractLegacyGeneralMatingItems(generalVisualData);
            const legacyEcologyItems = extractLegacyEcologyItems(generalVisualData);
            const cleanGeneralVisualData = filterLegacyEcologyItems(generalVisualData);

            document.getElementById('infoGeral').value = animal.informacao.geral || '';
            setGeneralVisualData(cleanGeneralVisualData);
            document.getElementById('infoDimensoes').value = animal.informacao.dimensoes || '';
            setDimensionData(animal.informacao.dimensoesDetalhadas || []);
            document.getElementById('infoAlimentacao').value = animal.informacao.alimentacao || '';
            const rawAlimentacaoDetalhada = animal.informacao.alimentacaoDetalhada || [];
            const rawReproducaoDetalhada = animal.informacao.reproducaoDetalhada || [];
            const legacyNutritionItems = rawReproducaoDetalhada.filter(item => ['Tipo de Alimentação', 'Alimento Ingerido em Média', 'Água bebida em Média'].includes(item.tipo || ''));
            const cleanedReproducaoDetalhada = rawReproducaoDetalhada.filter(item => !['Tipo de Alimentação', 'Alimento Ingerido em Média', 'Água bebida em Média'].includes(item.tipo || ''));
            setFeedingData([...rawAlimentacaoDetalhada, ...legacyNutritionItems]);
            const ecoData = animal.informacao.ecologia || {};
            setEcologyData(normalizeEcologyData(ecoData, legacyEcologyItems));
            document.getElementById('infoEcologia').value = ecoData.resumo || ecoData.texto || '';
            document.getElementById('infoReproducao').value = animal.informacao.reproducao || '';
            document.getElementById('infoPlumagem').value = animal.informacao.plumagem || '';
            setReproductionData(mergeUniqueReproductionItems([...cleanedReproducaoDetalhada, ...legacyMatingItems]));
            setPlumageData(animal.informacao.plumagemDetalhada || []);
            
            const distData = animal.informacao.distribuicao || { paises: [], paisesDetalhes: {}, descricao: '', regioesBiogeograficas: [] };
            selectedCountries = distData.paises || [];
            paisesDetalhes = distData.paisesDetalhes || {};
            document.getElementById('infoDistribuicao').value = distData.descricao || '';
            if (typeof window.setDistributionRegionsData === 'function') {
                window.setDistributionRegionsData(distData.regioesBiogeograficas || distData.regioes || []);
            }
            renderSelectedCountries();
            if (mapForm) {
                mapForm.setSelectedRegions(selectedCountries);
                setTimeout(() => {
                    selectedCountries.forEach(code => {
                        applySubregionGradient(code, paisesDetalhes[code] || 'inteiro');
                    });
                }, 100);
            }

            const curiData = animal.informacao.curiosidades || { cor: '', estadoConservacao: '', texto: '' };
            const ecologyLegacyImportance = animal.informacao.ecologia?.importanciaEconomicaHumanos || '';
            const normalizedCuriData = {
                ...curiData,
                importanciaEconomicaHumanos: curiData.importanciaEconomicaHumanos || ecologyLegacyImportance
            };
            setCuriosidadesData(normalizeCuriosidadesData(normalizedCuriData));
            document.getElementById('infoCuriosidades').value = curiData.texto || '';
            updateCuriosidadesPreview();

            let hasVideos = false;
            for (let i = 0; i < 5; i++) {
                const videoVal = animal.videos && animal.videos[i] ? animal.videos[i] : '';
                document.getElementById(`video${i + 1}`).value = videoVal;
                if (videoVal) hasVideos = true;
            }
            const audioVal = String(
                animal.xenoCantoAudioId ||
                animal.audioXenoCantoId ||
                animal.xenoCantoId ||
                animal.informacao?.xenoCantoAudioId ||
                animal.informacao?.audioXenoCantoId ||
                animal.informacao?.audio?.codigo ||
                ''
            ).replace(/\D/g, '');
            const audioInput = document.getElementById('xenoCantoAudioId');
            if (audioInput) audioInput.value = audioVal;
            toggleVideosFieldset(hasVideos || Boolean(audioVal));
            closeModal();
            switchToEditMode(animalId);
            updatePlumagemTabVisibility();
        }

        function switchToEditMode(animalId) {
            isEditMode = true;
            currentEditingId = animalId;
            formTitle.style.display = 'block';
            formSubtitle.style.display = 'block';
            formTitle.textContent = "Editar Animal";
            formSubtitle.textContent = `A editar: ${document.getElementById('nomeAnimal').value}`;
            saveButton.textContent = "Atualizar Dados";
            document.getElementById('nomeCientifico').disabled = true;
            document.body.classList.add('edit-theme');
            updateScientificNameGate();
        }

        function switchToCreateMode() {
            isEditMode = false;
            currentEditingId = null;
            animalForm.reset();
            setRecordTypeData();
            resetQualityLevelData();
            setCategoryData('');
            selectedSubespecies = [];
            renderSubespeciesTags();
            advancedFieldsContainer.style.display = 'none';
            toggleAdvancedBtn.classList.remove('active');
            
            document.getElementById('infoPlumagem').value = '';
            document.getElementById('imagemObjectPosition').value = 'center center';
            if (typeof resetProfilePhotosData === 'function') resetProfilePhotosData();
            setGeneralVisualData();
            setDimensionData();
            setFeedingData();
            setEcologyData();
            document.getElementById('infoEcologia').value = '';
            setReproductionData();
            setPlumageData();
            updatePlumagemTabVisibility();
            
            setCuriosidadesData();
            document.getElementById('infoCuriosidades').value = '';
            updateCuriosidadesPreview();
            
            selectedCountries = [];
            paisesDetalhes = {};
            document.getElementById('infoDistribuicao').value = '';
            if (typeof window.setDistributionRegionsData === 'function') {
                window.setDistributionRegionsData([]);
            }
            renderSelectedCountries();
            if (mapForm) {
                mapForm.setSelectedRegions([]);
            }
            const formMapPaths = document.querySelectorAll('#distributionMapForm [data-code]');
            formMapPaths.forEach(path => {
                path.removeAttribute('fill');
                path.style.fill = '';
            });
            const svgDefs = document.querySelector('#aurora-gradient-svg defs');
            if (svgDefs) {
                const grads = svgDefs.querySelectorAll('linearGradient[id^="grad-"]');
                grads.forEach(g => g.remove());
            }

            const geralBtn = document.querySelector('[data-tab="geral"]');
            if (geralBtn) geralBtn.click();
            formTitle.style.display = 'none';
            formSubtitle.style.display = 'none';
            formTitle.textContent = "Gerir Grandes Projetos";
            formSubtitle.textContent = "Formulário de Criação de Animais";
            saveButton.textContent = "Gravar Novo Animal";
            document.getElementById('nomeCientifico').disabled = false;
            nomeCientificoWarning.style.display = 'none';
            statusMessage.style.display = 'none';
            document.body.classList.remove('edit-theme');
            toggleVideosFieldset(false);
            updateScientificNameGate({ focusScientificField: true });
        }

        let editModalLoadPromise = null;

        function logEditModal(...args) {
            console.log('[FORM][EDIT-MODAL]', ...args);
        }
        function warnEditModal(...args) {
            console.warn('[FORM][EDIT-MODAL]', ...args);
        }
        function errorEditModal(...args) {
            console.error('[FORM][EDIT-MODAL]', ...args);
        }
        function withEditModalTimeout(promise, ms, label) {
            return Promise.race([
                promise,
                new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`${label} demorou mais de ${ms}ms`)), ms);
                })
            ]);
        }

        async function loadAllAnimalsForEditModal() {
            const startTime = performance.now();
            logEditModal('loadAllAnimalsForEditModal: início', { cached: editModalAnimals.length, allAnimals: allAnimals.length });

            if (editModalAnimals.length) {
                logEditModal('A usar cache editModalAnimals.', { total: editModalAnimals.length });
                return editModalAnimals;
            }

            if (editModalLoadPromise) {
                logEditModal('Já existe carregamento em curso. A reutilizar a mesma Promise.');
                return editModalLoadPromise;
            }

            editListContainer.innerHTML = '<p style="padding: 15px; text-align: center; color: var(--text-secondary);">A carregar os últimos 15 animais...</p>';

            editModalLoadPromise = (async () => {
                try {
                    let querySnapshot = null;

                    try {
                        logEditModal('Firestore: tentativa 1 — últimos 15 por timestamp...', { collection: 'animais', orderBy: 'timestamp desc', limit: 15 });
                        querySnapshot = await withEditModalTimeout(
                            getDocs(firestoreQuery(collection(db, "animais"), orderBy("timestamp", "desc"), limit(15))),
                            5000,
                            'getDocs últimos 15 por timestamp'
                        );
                    } catch (primaryError) {
                        warnEditModal('Tentativa 1 falhou/demorou. Vou tentar fallback sem orderBy timestamp.', primaryError);
                        querySnapshot = await withEditModalTimeout(
                            getDocs(firestoreQuery(collection(db, "animais"), limit(15))),
                            5000,
                            'getDocs fallback limit(15) sem orderBy'
                        );
                    }

                    editModalAnimals = [];
                    querySnapshot.forEach(doc => { editModalAnimals.push({ id: doc.id, ...doc.data() }); });
                    editModalAnimals.sort((a, b) => {
                        const ta = typeof a.timestamp?.toMillis === 'function' ? a.timestamp.toMillis() : (a.timestamp || 0);
                        const tb = typeof b.timestamp?.toMillis === 'function' ? b.timestamp.toMillis() : (b.timestamp || 0);
                        return tb - ta;
                    });

                    logEditModal('Firestore: popup carregado.', {
                        total: editModalAnimals.length,
                        ms: Math.round(performance.now() - startTime),
                        ids: editModalAnimals.map(a => a.id)
                    });

                    return editModalAnimals;
                } finally {
                    editModalLoadPromise = null;
                }
            })();

            return editModalLoadPromise;
        }

        async function openModal() {
            logEditModal('Clique no botão Procurar p/ Editar.', {
                disabled: openEditModalBtn?.disabled,
                allAnimals: allAnimals.length,
                cachedEditAnimals: editModalAnimals.length
            });

            editModalOverlay.style.display = 'flex';
            editSearchInput.value = '';
            activeEditQualityFilter = '';
            document.getElementById('editQualityFilterPanel').style.display = 'none';
            document.querySelectorAll('.quality-filter-choice').forEach(item => item.classList.remove('active'));

            try {
                await loadAllAnimalsForEditModal();
                refreshEditList();
                logEditModal('Lista renderizada.', { rendered: getEditFilteredAnimals().length });
            } catch (error) {
                errorEditModal('Erro ao carregar os últimos 15 animais para edição. Vou usar allAnimals como fallback.', error);
                if (Array.isArray(allAnimals) && allAnimals.length) {
                    populateEditList(allAnimals);
                    warnEditModal('Fallback allAnimals usado.', { total: allAnimals.length });
                } else {
                    editListContainer.innerHTML = '<p style="padding: 15px; text-align: center; color: var(--text-secondary);">Não foi possível carregar a lista. Vê a consola para o motivo.</p>';
                }
            } finally {
                requestAnimationFrame(() => editSearchInput.focus());
            }
        }
        function closeModal() { editModalOverlay.style.display = 'none'; }
        
        openEditModalBtn.addEventListener('click', openModal);
        closeEditModalBtn.addEventListener('click', closeModal);
        editModalOverlay.addEventListener('click', (e) => { if (e.target === editModalOverlay) closeModal(); });
        editListContainer.addEventListener('click', (e) => { if (e.target.classList.contains('edit-item-btn')) { loadDataIntoForm(e.target.dataset.id); } });
        document.addEventListener('click', (e) => { if (!e.target.closest('.autocomplete-container')) { familiaResultsContainer.style.display = 'none'; } });

        // --- IMPORTAÇÃO DE CLASSIFICAÇÃO CIENTÍFICA ---
        const importTaxModalOverlay = document.getElementById('importTaxModalOverlay');
        const btnOpenImportTaxModal = document.getElementById('btnOpenImportTaxModal');
        const closeImportTaxModalBtn = document.getElementById('closeImportTaxModalBtn');
        const confirmImportTaxBtn = document.getElementById('confirmImportTaxBtn');
        const importTaxTextarea = document.getElementById('importTaxTextarea');

        if (btnOpenImportTaxModal) {
            btnOpenImportTaxModal.addEventListener('click', () => {
                importTaxTextarea.value = '';
                importTaxModalOverlay.style.display = 'flex';
                importTaxTextarea.focus();
            });
        }

        const closeImportTaxModal = () => {
            importTaxModalOverlay.style.display = 'none';
        };

        if (closeImportTaxModalBtn) {
            closeImportTaxModalBtn.addEventListener('click', closeImportTaxModal);
        }
        if (importTaxModalOverlay) {
            importTaxModalOverlay.addEventListener('click', (e) => {
                if (e.target === importTaxModalOverlay) closeImportTaxModal();
            });
        }

        if (confirmImportTaxBtn) {
            confirmImportTaxBtn.addEventListener('click', () => {
                const rawText = importTaxTextarea.value;
                if (!rawText.trim()) {
                    closeImportTaxModal();
                    return;
                }

                const parsed = parseClassificationText(rawText);
                
                const keyToDomId = {
                    'reino': 'reino',
                    'filo': 'filo',
                    'subfilo': 'subfilo',
                    'classe': 'classe',
                    'infraclasse': 'infraclasse',
                    'superordem': 'superordem',
                    'ordem': 'ordem',
                    'subordem': 'subordem',
                    'infraordem': 'infraordem',
                    'família': 'familia',
                    'familia': 'familia',
                    'subfamilia': 'subfamilia',
                    'género': 'genero',
                    'genero': 'genero',
                    'subgenero': 'subgenero',
                    'espécie': 'especies',
                    'espécies': 'especies',
                    'especie': 'especies',
                    'especies': 'especies',
                    'autoridade taxonómica': 'autoridadeTaxonomica',
                    'autoridade taxonomica': 'autoridadeTaxonomica',
                    'autoridadetaxonomica': 'autoridadeTaxonomica',
                    'taxonomic authority': 'autoridadeTaxonomica',
                    'authority': 'autoridadeTaxonomica'
                };

                for (const [key, value] of Object.entries(parsed)) {
                    const domId = keyToDomId[key.toLowerCase()];
                    if (domId) {
                        const el = document.getElementById(domId);
                        if (el) {
                            el.value = value;
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                }

                closeImportTaxModal();
            });
        }

        function parseClassificationText(text) {
            const lines = String(text || '')
                .replace(/\r/g, '')
                .split('\n')
                .map(line => line.replace(/\u00a0/g, ' ').trim())
                .filter(Boolean);

            const result = {};
            const aliases = {
                reino: 'reino', kingdom: 'reino',
                filo: 'filo', phylum: 'filo',
                subfilo: 'subfilo', subphylum: 'subfilo',
                classe: 'classe', class: 'classe',
                infraclasse: 'infraclasse', infraclass: 'infraclasse',
                superordem: 'superordem', superorder: 'superordem',
                ordem: 'ordem', order: 'ordem',
                subordem: 'subordem', suborder: 'subordem',
                infraordem: 'infraordem', infraorder: 'infraordem',
                familia: 'familia', family: 'familia',
                subfamilia: 'subfamilia', subfamily: 'subfamilia',
                genero: 'genero', genus: 'genero',
                subgenero: 'subgenero', subgenus: 'subgenero',
                especie: 'especies', especies: 'especies', species: 'especies',
                autoridadetaxonomica: 'autoridadeTaxonomica', taxonomicauthority: 'autoridadeTaxonomica', authority: 'autoridadeTaxonomica'
            };

            const normalizeKey = (value = '') => String(value)
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[.:\-–—]+$/g, '')
                .replace(/\s+/g, '')
                .trim();

            const savePair = (rawKey, rawValue) => {
                const key = aliases[normalizeKey(rawKey)];
                const value = String(rawValue || '').replace(/^[:\-–—\t\s]+/, '').trim();
                if (key && value) result[key] = value;
                return !!(key && value);
            };

            // Formatos "Kingdom: Animalia", com dois-pontos, hífen ou tabulação.
            for (const line of lines) {
                const separatorMatch = line.match(/^(.+?)(?:\s*:\s*|\s+\t+\s*|\s+[–—-]\s+)(.+)$/);
                if (separatorMatch) savePair(separatorMatch[1], separatorMatch[2]);
            }

            // Formato em linhas alternadas: Kingdom / Animalia / Phylum / Chordata.
            for (let index = 0; index < lines.length; index++) {
                const canonicalKey = aliases[normalizeKey(lines[index])];
                if (!canonicalKey) continue;

                let valueIndex = index + 1;
                while (valueIndex < lines.length && !lines[valueIndex]) valueIndex++;
                if (valueIndex < lines.length && !aliases[normalizeKey(lines[valueIndex])]) {
                    result[canonicalKey] = lines[valueIndex].replace(/^[:\-–—\t\s]+/, '').trim();
                    index = valueIndex;
                }
            }

            // Expande abreviaturas de espécie, por exemplo "B. quarlesi" → "Bubalus quarlesi".
            if (result.especies && result.genero) {
                const abbreviated = result.especies.match(/^([A-Za-z])\.\s*(.+)$/);
                if (abbreviated && result.genero.charAt(0).toLowerCase() === abbreviated[1].toLowerCase()) {
                    result.especies = `${result.genero} ${abbreviated[2].trim()}`;
                }
            }

            return result;
        }

        // --- CONTROLO DAS ABAS DO FORMULÁRIO ---
        const tabButtons = document.querySelectorAll('.form-tab-nav-btn');
        const tabPanels = document.querySelectorAll('.form-tab-panel');
        const subTabButtons = document.querySelectorAll('.form-subtab-nav-btn');
        const subTabPanels = document.querySelectorAll('.form-subtab-panel');
        const tabsWrapper = document.querySelector('.form-tabs-wrapper');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Update active tab theme class on wrapper
                tabsWrapper.classList.remove('active-geral', 'active-dimensoes', 'active-alimentacao', 'active-reproducao', 'active-plumagem', 'active-distribuicao', 'active-curiosidades');
                tabsWrapper.classList.add(`active-${targetTab}`);
                
                tabButtons.forEach(b => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
                });

                tabPanels.forEach(panel => {
                    const isActive = panel.id === `tabpanel-${targetTab}`;
                    panel.classList.toggle('active', isActive);
                });

                if (targetTab === 'distribuicao') {
                    setTimeout(() => {
                        if (!mapForm) {
                            initMapForm();
                        } else {
                            mapForm.updateSize();
                        }
                    }, 50);
                }
            });
        });

        subTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetSubTab = btn.dataset.subtab;
                const scope = btn.closest('.form-tab-panel');
                const scopedButtons = scope.querySelectorAll('.form-subtab-nav-btn');
                const scopedPanels = scope.querySelectorAll('.form-subtab-panel');

                scopedButtons.forEach(b => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
                });

                scopedPanels.forEach(panel => {
                    const isActive = panel.id === `subtabpanel-${targetSubTab}`;
                    panel.classList.toggle('active', isActive);
                });
            });
        });

        // --- CONTROLO DO FIELDSET COLAPSÁVEL DE VÍDEOS ---
        function toggleVideosFieldset(open = null) {
            const fieldset = document.getElementById('videosFieldset');
            const content = fieldset.querySelector('.fieldset-content');
            const chevron = document.getElementById('videosLegend').querySelector('i');
            
            const shouldOpen = open !== null ? open : fieldset.classList.contains('collapsed');
            
            if (shouldOpen) {
                fieldset.classList.remove('collapsed');
                content.style.display = 'grid';
                chevron.style.transform = 'rotate(180deg)';
            } else {
                fieldset.classList.add('collapsed');
                content.style.display = 'none';
                chevron.style.transform = 'rotate(0deg)';
            }
        }
        document.getElementById('videosLegend').addEventListener('click', () => toggleVideosFieldset());

        // --- VISIBILIDADE DA ABA PLUMAGEM PARA AVES ---
        const categorySelect = document.getElementById('categoria');
        const tabBtnPlumagem = document.getElementById('tab-btn-plumagem');

        function updatePlumagemTabVisibility() {
            if (categorySelect.value === 'Aves') {
                tabBtnPlumagem.style.display = 'inline-block';
            } else {
                tabBtnPlumagem.style.display = 'none';
                if (tabBtnPlumagem.classList.contains('active')) {
                    const dimensoesBtn = document.querySelector('[data-tab="dimensoes"]');
                    if (dimensoesBtn) dimensoesBtn.click();
                }
            }
        }

        categorySelect.addEventListener('change', updatePlumagemTabVisibility);
        categorySelect.addEventListener('change', () => {
            updateReproductionPreview();
            updatePlumagePreview();
        });

        // --- CURIOSIDADES E MODELO VISUAL ---
        const curiosidadesTypeOptions = [
            'Cor do animal',
            'Distância Percorrida',
            'Estado de Conservação',
            'Horas de Sono',
            'Importância económica para os humanos',
            'Maior peso registado',
            'Relação com Humanos',
            'Também conhecido como',
            'Temperatura do Ambiente',
            'Tipo de Comunicação'
        ];
        const curiosidadesColorMap = {
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

        const curiosidadesCommunicationDescriptions = {
            'Vocalizações': 'Sons produzidos pela boca, garganta, laringe ou estruturas semelhantes. Ex.: rugidos, cantos, grunhidos, assobios.',
            'Sons emitidos': 'Lista concreta dos sons conhecidos da espécie. Ex.: guinchos, estalos, zumbidos, roncos, chiados, uivos.',
            'Frequência dos sons': 'Tipo de frequência sonora usada: audível, infrassónica, ultrassónica ou baixa frequência.',
            'Intensidade vocal': 'Indica se o animal é silencioso, pouco vocal, moderadamente vocal ou muito vocal.',
            'Comunicação visual': 'Uso de sinais visíveis, como cores, padrões, posturas, movimentos, exibições ou mudanças corporais.',
            'Linguagem corporal': 'Posturas e movimentos usados para comunicar intenção, ameaça, submissão, cortejo, medo ou dominância.',
            'Sinais de cor': 'Cores ou padrões corporais usados como aviso, camuflagem, atração sexual ou reconhecimento entre indivíduos.',
            'Comunicação química / olfativa': 'Comunicação através de cheiros, feromonas, urina, fezes ou secreções glandulares.',
            'Marcação de território': 'Uso de cheiro, urina, fezes, arranhões, vocalizações ou sinais visuais para indicar posse de território.',
            'Comunicação tátil': 'Comunicação por contacto físico. Ex.: toques, lambidelas, grooming, roçar o corpo, antenas ou bicadas suaves.',
            'Grooming social': 'Limpeza ou cuidado corporal entre indivíduos, muitas vezes usado para reforçar laços sociais.',
            'Comunicação vibratória': 'Uso de vibrações transmitidas pelo solo, água, folhas, troncos ou teias.',
            'Comunicação sísmica': 'Tipo específico de comunicação vibratória feita através do solo. Ex.: elefantes, insetos e alguns roedores.',
            'Comunicação elétrica': 'Uso de campos ou impulsos elétricos para orientação, reconhecimento ou comunicação. Comum em alguns peixes.',
            'Bioluminescência comunicativa': 'Produção de luz para atrair parceiros, confundir predadores, sinalizar ou reconhecer indivíduos.',
            'Comunicação acústica não vocal': 'Sons produzidos sem vocalização direta. Ex.: bater asas, tamborilar, estalar mandíbulas, bater cauda.',
            'Chamadas de alarme': 'Sinais usados para avisar outros indivíduos sobre predadores ou perigo.',
            'Chamadas de contacto': 'Sinais usados para manter ligação entre membros do grupo, crias e progenitores ou parceiros.',
            'Chamadas de acasalamento': 'Sinais usados para atrair parceiros durante a época reprodutiva.',
            'Sinais de ameaça': 'Comportamentos usados para intimidar rivais ou predadores. Ex.: eriçar pelo, abrir asas, mostrar dentes.',
            'Sinais de submissão': 'Posturas ou sons usados para reduzir conflito e mostrar que o animal não representa ameaça.',
            'Sinais parentais': 'Comunicação entre progenitores e crias, incluindo chamamentos, toques, alimentação ou proteção.',
            'Comunicação social': 'Sinais usados para coordenar o grupo, manter hierarquias ou reforçar relações sociais.',
            'Comunicação territorial': 'Sinais usados para defender área, ninho, toca, recursos ou parceiro.',
            'Comunicação de cortejo': 'Danças, cantos, cores, ofertas, exibições ou movimentos usados para atrair parceiro.',
            'Comunicação defensiva': 'Sinais usados para afastar predadores. Ex.: cores de aviso, silvos, bufos, fingir ser maior.',
            'Comunicação multimodal': 'Uso de vários tipos de comunicação ao mesmo tempo. Ex.: canto + dança + cores + cheiro.',
            'Distância da comunicação': 'Indica se os sinais funcionam a curta, média ou longa distância.',
            'Contexto da comunicação': 'Situação em que a comunicação ocorre: alarme, acasalamento, alimentação, território, cuidado parental ou vida social.',
            'Complexidade comunicativa': 'Grau de variedade e sofisticação dos sinais: simples, moderada ou complexa.'
        };

        const curiosidadesHumanRelationOptions = [
            'Companhia',
            'Agrícola / Pecuário',
            'Trabalho',
            'Laboratório',
            'Cativeiro / Zoológico',
            'Exótico de companhia'
        ];

        const curiosidadesStatusMeta = {
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

