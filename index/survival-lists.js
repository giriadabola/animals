function getFirstActiveCategory(categoria) {
    if (typeof categoria === 'string') return categoria;
    if (categoria && typeof categoria === 'object') {
        const active = Object.keys(categoria).filter(k => categoria[k] === true);
        return active[0] || '';
    }
    return '';
}

function translateCategory(cat) {
    const translations = {
        'Mamiferos': 'Mamíferos',
        'Aves': 'Aves',
        'Peixes': 'Peixes',
        'Moluscos': 'Moluscos',
        'Crustaceos': 'Crustáceos',
        'Aracnideos': 'Aracnídeos',
        'Vermes': 'Vermes',
        'Repteis': 'Répteis',
        'Anfibios': 'Anfíbios',
        'Insetos': 'Insetos',
        'Microscopicos': 'Microscópicos',
        'Extintos': 'Extintos'
    };
    return translations[cat] || cat;
}

export async function populateSurvivalLists(allAnimals, db, searchResultsContainer, getDoc, doc) {
    const container = document.getElementById('dynamic-sections-container');
    if (!container) return;
    container.innerHTML = '';

    let order = ["pesquisa-globo", "explorar-biomas", "estrategia-alimento", "acasalamento", "zona-climatica", "categoria", "familia", "classificacao-cientifica-niveis", "estatisticas"];
    let subClassificationOrder = ["reino", "filo", "subfilo", "classe", "superordem", "subordem", "ordem", "familia-sub", "genero", "especie"];
    let subStatsOrder = ["mais-velozes", "mais-vida-util", "mais-altos", "mais-pesados", "mais-largo", "mais-espesso", "maior-envergadura", "gestacao-longa", "mais-crias", "mais-longos", "forca-mordida", "maior-populacao"];
    let active = {
        "pesquisa-globo": true,
        "explorar-biomas": true,
        "estrategia-alimento": true,
        "acasalamento": false,
        "zona-climatica": false,
        "categoria": false,
        "familia": false,
        "classificacao-cientifica-niveis": false,
        "estatisticas": true,
        "reino": false,
        "filo": false,
        "subfilo": false,
        "classe": false,
        "superordem": false,
        "subordem": false,
        "ordem": false,
        "familia-sub": false,
        "genero": false,
        "especie": false,
        "mais-velozes": false,
        "mais-vida-util": false,
        "mais-altos": false,
        "mais-pesados": false,
        "mais-largo": false,
        "mais-espesso": false,
        "maior-envergadura": false,
        "gestacao-longa": false,
        "mais-crias": false,
        "mais-longos": false,
        "forca-mordida": false,
        "maior-populacao": false
    };
    let cardLimits = {
        "acasalamento": 12,
        "categoria": 12,
        "familia": 12,
        "reino": 12,
        "filo": 12,
        "subfilo": 12,
        "classe": 12,
        "superordem": 12,
        "subordem": 12,
        "ordem": 12,
        "familia-sub": 12,
        "genero": 12,
        "especie": 12
    };

    try {
        const settingsSnap = await getDoc(doc(db, "settings", "index-lists"));
        if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            if (data.order) order = data.order;
            if (data.subClassificationOrder) subClassificationOrder = data.subClassificationOrder;
            if (data.subStatsOrder) subStatsOrder = data.subStatsOrder;
            if (data.active) active = data.active;
            if (data.cardLimits) cardLimits = data.cardLimits;
        }
    } catch (err) {
        console.error("Erro ao carregar settings do index:", err);
    }

    function extractNumericMetric(details, searchKeys, exactMatch = false) {
        const item = details.find(d => {
            if (!d.tipo) return false;
            const normalized = d.tipo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            if (exactMatch) return normalized === searchKeys[0];
            return searchKeys.every(key => normalized.includes(key));
        });
        if (!item) return null;
        const valStr = item.valor || item.valorMin || '';
        const cleanVal = valStr.replace(',', '.');
        const num = parseFloat(cleanVal.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return null;

        const unit = (item.unidade || '').toLowerCase().trim();
        let normalizedValue = num;

        if (searchKeys.includes('altura') || searchKeys.includes('largura') || searchKeys.includes('espessura') || searchKeys.includes('envergadura') || searchKeys.includes('comprimento')) {
            if (unit === 'm' || unit === 'metro' || unit === 'metros') normalizedValue = num * 100;
            else if (unit === 'mm' || unit === 'milimetro' || unit === 'milimetros') normalizedValue = num / 10;
        }
        else if (searchKeys.includes('peso')) {
            if (unit === 'kg' || unit === 'quilo' || unit === 'quilos') normalizedValue = num * 1000;
            else if (unit === 't' || unit === 'tonelada') normalizedValue = num * 1000000;
        }

        return { numericValue: normalizedValue, displayValue: `${valStr} ${item.unidade || ''}`.trim() };
    }

    const listsConfig = [
        { key: 'estrategia-alimento', title: 'Estratégias Alimentares', tag: 'Estratégia', icon: 'fa-utensils', gradientClass: 'gradient-purple', extract: (animal) => (animal.informacao?.geralDetalhada || []).find(d => d.tipo?.toLowerCase().includes('estrategia') && d.tipo?.toLowerCase().includes('alimento'))?.valor },
        { key: 'acasalamento', title: 'Sistemas de Acasalamento', tag: 'Acasalamento', icon: 'fa-heart', gradientClass: 'gradient-teal', extract: (animal) => (animal.informacao?.geralDetalhada || []).find(d => d.tipo?.toLowerCase().includes('acasalamento'))?.valor },
        { key: 'zona-climatica', title: 'Zonas Climáticas', tag: 'Clima', icon: 'fa-cloud-sun', gradientClass: 'gradient-cyan', extract: (animal) => (animal.informacao?.geralDetalhada || []).find(d => d.tipo?.toLowerCase().includes('clima'))?.valor },
        { key: 'categoria', title: 'Categorias de Animais', tag: 'Categoria', icon: 'fa-paw', gradientClass: 'gradient-rose', extract: (animal) => getFirstActiveCategory(animal.categoria) },
        { key: 'familia', title: 'Famílias de Animais', tag: 'Família', icon: 'fa-users', gradientClass: 'gradient-orange', extract: (animal) => animal.familia },
        { key: 'familia-sub', title: 'Famílias de Animais', tag: 'Família', icon: 'fa-dna', gradientClass: 'gradient-purple', extract: (animal) => animal.familia },
        { key: 'reino', title: 'Reino de Animais', tag: 'Reino', icon: 'fa-dna', gradientClass: 'gradient-purple', extract: (animal) => animal.reino },
        { key: 'filo', title: 'Filo de Animais', tag: 'Filo', icon: 'fa-dna', gradientClass: 'gradient-purple', extract: (animal) => animal.filo },
        { key: 'subfilo', title: 'Subfilo de Animais', tag: 'Subfilo', icon: 'fa-dna', gradientClass: 'gradient-purple', extract: (animal) => animal.subfilo },
        { key: 'classe', title: 'Classe de Animais', tag: 'Classe', icon: 'fa-dna', gradientClass: 'gradient-purple', extract: (animal) => animal.classe },
        { key: 'superordem', title: 'Superordem de Animais', tag: 'Superordem', icon: 'fa-dna', gradientClass: 'gradient-purple', extract: (animal) => animal.superordem },
        { key: 'subordem', title: 'Subordem de Animais', tag: 'Subordem', icon: 'fa-dna', gradientClass: 'gradient-purple', extract: (animal) => animal.subordem },
        { key: 'ordem', title: 'Ordem de Animais', tag: 'Ordem', icon: 'fa-dna', gradientClass: 'gradient-purple', extract: (animal) => animal.ordem },
        { key: 'genero', title: 'Género de Animais', tag: 'Género', icon: 'fa-dna', gradientClass: 'gradient-purple', extract: (animal) => animal.genero },
        { key: 'especie', title: 'Espécie de Animais', tag: 'Espécie', icon: 'fa-dna', gradientClass: 'gradient-purple', extract: (animal) => animal.especie },
        { key: 'mais-velozes', title: 'Os Mais Velozes', tag: 'Velocidade', icon: 'fa-bolt', isRanking: true, extractRanking: (animal) => extractNumericMetric(animal.informacao?.geralDetalhada || [], ['velocidade']) },
        { key: 'mais-vida-util', title: 'Com mais Vida Útil', tag: 'Longevidade', icon: 'fa-hourglass-half', isRanking: true, extractRanking: (animal) => extractNumericMetric(animal.informacao?.geralDetalhada || [], ['vida', 'util']) },
        { key: 'mais-altos', title: 'Os Mais Altos', tag: 'Altura', icon: 'fa-arrows-up-down', isRanking: true, extractRanking: (animal) => extractNumericMetric(animal.informacao?.dimensoesDetalhadas || [], ['altura']) },
        { key: 'mais-pesados', title: 'Os Mais Pesados', tag: 'Peso', icon: 'fa-weight-hanging', isRanking: true, extractRanking: (animal) => extractNumericMetric(animal.informacao?.dimensoesDetalhadas || [], ['peso'], true) },
        { key: 'mais-largo', title: 'Mais Largo', tag: 'Largura', icon: 'fa-arrows-left-right', isRanking: true, extractRanking: (animal) => extractNumericMetric(animal.informacao?.dimensoesDetalhadas || [], ['largura']) },
        { key: 'mais-espesso', title: 'Mais Espesso', tag: 'Espessura', icon: 'fa-ruler-combined', isRanking: true, extractRanking: (animal) => extractNumericMetric(animal.informacao?.dimensoesDetalhadas || [], ['espessura']) },
        { key: 'maior-envergadura', title: 'Maior Envergadura', tag: 'Envergadura', icon: 'fa-feather', isRanking: true, extractRanking: (animal) => extractNumericMetric(animal.informacao?.dimensoesDetalhadas || [], ['envergadura']) },
        { key: 'mais-longos', title: 'Os Mais Longos', tag: 'Comprimento', icon: 'fa-ruler-horizontal', isRanking: true, extractRanking: (animal) => extractNumericMetric(animal.informacao?.dimensoesDetalhadas || [], ['comprimento']) },
        { key: 'forca-mordida', title: 'Força da Mordida', tag: 'Mordida', icon: 'fa-tooth', isRanking: true, extractRanking: (animal) => extractNumericMetric(animal.informacao?.geralDetalhada || [], ['mordida']) }
    ];

    function createSectionGridWrapper(innerSectionEl) {
        const mainLayoutDiv = document.createElement('div');
        mainLayoutDiv.className = 'main-layout';
        const leftPanelDiv = document.createElement('div');
        leftPanelDiv.className = 'left-panel';
        leftPanelDiv.appendChild(innerSectionEl);
        const rightPanelDiv = document.createElement('div');
        rightPanelDiv.className = 'right-panel';
        rightPanelDiv.innerHTML = `<div class="searchResultsClone" style="display: none;"></div>`;
        mainLayoutDiv.appendChild(leftPanelDiv);
        mainLayoutDiv.appendChild(rightPanelDiv);
        return mainLayoutDiv;
    }

    const globeCard = document.getElementById('globeSearchCard');
    const biomaExplorerCard = document.getElementById('biomaExplorerCard');

    order.forEach(key => {
        if (!active[key]) {
            if (key === 'pesquisa-globo' && globeCard) {
                globeCard.style.display = 'none';
            }
            if (key === 'explorar-biomas' && biomaExplorerCard) {
                biomaExplorerCard.style.display = 'none';
            }
            return;
        }

        if (key === 'pesquisa-globo') {
            if (globeCard) {
                globeCard.style.display = 'flex';
                globeCard.style.maxWidth = '960px';
                globeCard.style.marginLeft = 'auto';
                globeCard.style.marginRight = 'auto';
                container.appendChild(globeCard);
            }
            return;
        }

        if (key === 'explorar-biomas') {
            if (biomaExplorerCard) {
                biomaExplorerCard.style.display = 'flex';
                container.appendChild(biomaExplorerCard);
            }
            return;
        }

        if (key === 'estatisticas') {
            const activeRankings = [];
            const usedAnimalIds = new Set();
            subStatsOrder.forEach(subKey => {
                if (!active[subKey]) return;
                const config = listsConfig.find(c => c.key === subKey);
                if (!config) return;

                const ranked = [];
                allAnimals.forEach(animal => {
                    const res = config.extractRanking(animal);
                    if (res) {
                        ranked.push({
                            animal,
                            numericValue: res.numericValue,
                            displayValue: res.displayValue
                        });
                    }
                });

                if (ranked.length > 0) {
                    ranked.sort((a, b) => b.numericValue - a.numericValue);
                    
                    let selected = ranked[0];
                    for (let i = 0; i < ranked.length; i++) {
                        if (!usedAnimalIds.has(ranked[i].animal.id)) {
                            selected = ranked[i];
                            break;
                        }
                    }
                    usedAnimalIds.add(selected.animal.id);

                    activeRankings.push({
                        config,
                        topAnimal: selected.animal,
                        displayValue: selected.displayValue
                    });
                }
            });

            if (activeRankings.length === 0) return;

            const section = document.createElement('div');
            section.className = 'lists-section';
            section.innerHTML = `
                <h2 class="section-title">Estatísticas</h2>
                <div class="lists-container" id="estatisticas-container"></div>
            `;
            const listContainer = section.querySelector('.lists-container');

            activeRankings.forEach(item => {
                const card = document.createElement('a');
                card.className = 'list-card';
                card.href = `filtros.html?tipo=${item.config.key}&valor=ranking`;
                card.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(9, 9, 20, 0.95)), url('${item.topAnimal.imagemUrl}')`;
                card.style.backgroundPosition = item.topAnimal.imagemObjectPosition || 'center center';
                
                card.innerHTML = `
                    <div class="list-card-content">
                        <span class="list-card-tag"><i class="fa-solid ${item.config.icon}"></i> ${item.config.tag}</span>
                        <h3 class="list-card-title">${item.config.title}</h3>
                        <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${item.topAnimal.nome}</span>
                    </div>
                `;
                listContainer.appendChild(card);
            });

            container.appendChild(createSectionGridWrapper(section));
        } 
        else if (key === 'classificacao-cientifica-niveis') {
            const activeClassificationCards = [];
            
            subClassificationOrder.forEach(subKey => {
                if (!active[subKey]) return;
                
                const config = listsConfig.find(c => c.key === subKey);
                if (!config) return;

                const valuesForThisLevel = new Set();
                allAnimals.forEach(animal => {
                    const val = config.extract(animal);
                    if (val && val.trim()) {
                        valuesForThisLevel.add(val.trim());
                    }
                });

                const maxCards = (cardLimits && cardLimits[subKey] !== undefined) ? parseInt(cardLimits[subKey]) : 12;
                let renderedCount = 0;
                
                const sortedValuesForThisLevel = [...valuesForThisLevel].sort((a, b) =>
                    a.localeCompare(b, 'pt-PT', { sensitivity: 'base', numeric: true })
                );

                for (const val of sortedValuesForThisLevel) {
                    if (renderedCount >= maxCards) break;
                    
                    activeClassificationCards.push({
                        config,
                        value: val,
                        dbType: subKey === 'familia-sub' ? 'familia' : subKey
                    });
                    renderedCount++;
                }
            });

            if (activeClassificationCards.length === 0) return;

            const section = document.createElement('div');
            section.className = 'lists-section';
            section.innerHTML = `
                <div class="categories-container" id="classificacao-cientifica-container" style="display: grid; margin-top: 20px; max-width: 100%;"></div>
            `;
            const listContainer = section.querySelector('#classificacao-cientifica-container');

            activeClassificationCards.forEach(item => {
                const card = document.createElement('a');
                card.className = 'category-link';
                card.href = `filtros.html?tipo=${item.dbType}&valor=${encodeURIComponent(item.value)}`;
                
                card.innerHTML = `
                    <span class="category-emoji"><i class="fa-solid ${item.config.icon}"></i></span>
                    <span>${item.value}</span>
                `;
                listContainer.appendChild(card);
            });

            container.appendChild(createSectionGridWrapper(section));
        } 
        else {
            const config = listsConfig.find(c => c.key === key);
            if (!config) return;

            const strategyMap = new Map();
            allAnimals.forEach(animal => {
                const value = config.extract(animal);
                if (value && value.trim()) {
                    const cleanValue = value.trim();
                    if (!strategyMap.has(cleanValue) && animal.imagemUrl) {
                        strategyMap.set(cleanValue, {
                            imagemUrl: animal.imagemUrl,
                            objectPos: animal.imagemObjectPosition || 'center center'
                        });
                    }
                }
            });

            if (strategyMap.size === 0) return;

            const maxCards = (cardLimits && cardLimits[key] !== undefined) ? parseInt(cardLimits[key]) : 999;
            if (maxCards === 0) return;

            const section = document.createElement('div');
            section.className = 'lists-section';
            section.innerHTML = `
                <h2 class="section-title ${config.gradientClass || 'gradient-purple'}">${config.title}</h2>
                <div class="lists-container"></div>
            `;
            const listContainer = section.querySelector('.lists-container');

            let renderedCount = 0;
            const sortedStrategyEntries = [...strategyMap.entries()].sort(([valueA], [valueB]) =>
                valueA.localeCompare(valueB, 'pt-PT', { sensitivity: 'base', numeric: true })
            );

            for (const [val, data] of sortedStrategyEntries) {
                if (renderedCount >= maxCards) break;

                const card = document.createElement('a');
                card.className = 'list-card';
                card.href = `filtros.html?tipo=${config.key}&valor=${encodeURIComponent(val)}`;
                card.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(9, 9, 20, 0.95)), url('${data.imagemUrl}')`;
                card.style.backgroundPosition = data.objectPos;
                
                card.innerHTML = `
                    <div class="list-card-content">
                        <span class="list-card-tag"><i class="fa-solid ${config.icon}"></i> ${config.tag}</span>
                        <h3 class="list-card-title">${val}</h3>
                    </div>
                `;
                listContainer.appendChild(card);
                renderedCount++;
            }

            if (renderedCount > 0) {
                container.appendChild(createSectionGridWrapper(section));
            }
        }
    });

    // A pesquisa principal fica fixa dentro do card inicial do index.
    // Mantemos esta guarda para projetos antigos onde o contentor ainda não esteja ancorado no hero.
    const mainLayout = document.querySelector('.main-layout');
    const searchResultsIsAnchoredInHero = searchResultsContainer?.dataset?.searchResultsAnchor === 'hero';
    if (mainLayout && searchResultsContainer && !searchResultsIsAnchoredInHero) {
        const rightPanel = mainLayout.querySelector('.right-panel');
        if (rightPanel) {
            rightPanel.innerHTML = '';
            rightPanel.appendChild(searchResultsContainer);
        }
    }
}
