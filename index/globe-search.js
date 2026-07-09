let countriesMap = {};

async function loadCountriesForGlobe() {
    try {
        const res = await fetch('js/countries.json');
        countriesMap = await res.json();
    } catch (err) {
        console.error("Erro ao carregar countries.json:", err);
    }
}

function codeToFlag(code) {
    return code.toUpperCase().replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function initGlobeSearch() {
    const globeInput = document.getElementById('globeCountryInput');
    const globeResults = document.getElementById('globeSearchResults');

    function handleGlobeSearch() {
        if (!globeResults) return;
        const query = removeAccents(globeInput.value.toLowerCase().trim());
        globeResults.innerHTML = '';

        if (!query) {
            globeResults.classList.remove('active');
            return;
        }

        const matches = [];
        for (const [code, name] of Object.entries(countriesMap)) {
            const normalizedName = removeAccents(name.toLowerCase());
            if (normalizedName.includes(query)) {
                matches.push({ code, name });
            }
        }

        if (matches.length === 0) {
            globeResults.innerHTML = '<div class="globe-search-no-results">Nenhum país encontrado</div>';
            globeResults.classList.add('active');
            return;
        }

        // Limita a 20 resultados para performance
        matches.slice(0, 20).forEach(({ code, name }) => {
            const item = document.createElement('a');
            item.className = 'globe-search-result-item';
            item.href = `filtros.html?tipo=pais&valor=${encodeURIComponent(code)}&nome=${encodeURIComponent(name)}`;
            item.innerHTML = `
                <span class="flag-emoji">${codeToFlag(code)}</span>
                <span class="country-name">${name}</span>
                <span class="country-code">${code}</span>
            `;
            globeResults.appendChild(item);
        });

        globeResults.classList.add('active');
    }

    if (globeInput) {
        globeInput.addEventListener('input', handleGlobeSearch);
    }

    document.addEventListener('click', (event) => {
        if (globeResults && !event.target.closest('.globe-search-wrapper')) {
            globeResults.classList.remove('active');
        }
    });

    loadCountriesForGlobe();
}
