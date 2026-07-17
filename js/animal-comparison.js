import { db } from './firebase-config.js?v=5';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import { findLocalAnimalsByWikidata } from './wikidata-search.js?v=1';

const STATISTICS = [
    { key: 'altura', label: 'Altura', source: 'dimensoes' },
    { key: 'peso', label: 'Peso', source: 'dimensoes' },
    { key: 'comprimento', label: 'Comprimento total', source: 'dimensoes' },
    { key: 'vida-util', label: 'Vida útil', source: 'geral' },
    { key: 'dieta', label: 'Dieta', source: 'alimentacao' }
];

function normalize(value = '') {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
}

function getItemValue(item = {}) {
    if (Array.isArray(item.valor)) return item.valor.join(', ');
    if (item.valor !== undefined && item.valor !== null && String(item.valor).trim()) return String(item.valor).trim();
    if (item.opcao !== undefined && item.opcao !== null && String(item.opcao).trim()) return String(item.opcao).trim();
    if (item.detalhe !== undefined && item.detalhe !== null && String(item.detalhe).trim()) return String(item.detalhe).trim();
    if (item.texto !== undefined && item.texto !== null && String(item.texto).trim()) return String(item.texto).trim();
    const min = item.valorMin ?? '';
    const max = item.valorMax ?? '';
    if (String(min).trim() || String(max).trim()) {
        const range = min && max && String(min) !== String(max) ? `${min}–${max}` : (min || max);
        return `${range}${item.unidade ? ` ${item.unidade}` : ''}`.trim();
    }
    return '';
}

function findDetail(animal = {}, statistic) {
    const info = animal.informacao || {};
    if (statistic.source === 'alimentacao') {
        const details = Array.isArray(info.alimentacaoDetalhada) ? info.alimentacaoDetalhada : [];
        const value = details.map(getItemValue).find(Boolean);
        return value || String(info.alimentacao || '').trim() || '—';
    }

    const details = statistic.source === 'dimensoes'
        ? (Array.isArray(info.dimensoesDetalhadas) ? info.dimensoesDetalhadas : [])
        : (Array.isArray(info.geralDetalhada) ? info.geralDetalhada : []);
    const match = details.find(item => {
        const type = normalize(item?.tipo);
        if (statistic.key === 'altura') return type.includes('altura');
        if (statistic.key === 'peso') return type.includes('peso');
        if (statistic.key === 'comprimento') return type.includes('comprimento total') || type === 'comprimento';
        if (statistic.key === 'vida-util') return type.includes('vida util') || type.includes('expectativa media de vida');
        return false;
    });
    return match ? getItemValue(match) || '—' : '—';
}

function getAnimalName(animal = {}) {
    return animal.nome || animal.nomeCientifico || 'Animal sem nome';
}

function renderTable(currentAnimal, selectedAnimal) {
    return `
        <div class="animal-comparison-table-wrap">
            <table class="animal-comparison-table">
                <thead><tr><th>Estatística</th><th>${escapeHtml(getAnimalName(currentAnimal))}</th><th>${escapeHtml(selectedAnimal ? getAnimalName(selectedAnimal) : 'Outro animal')}</th></tr></thead>
                <tbody>${STATISTICS.map(statistic => `
                    <tr>
                        <th scope="row">${escapeHtml(statistic.label)}</th>
                        <td>${escapeHtml(findDetail(currentAnimal, statistic))}</td>
                        <td>${escapeHtml(selectedAnimal ? findDetail(selectedAnimal, statistic) : '—')}</td>
                    </tr>
                `).join('')}</tbody>
            </table>
        </div>
    `;
}

export async function initAnimalComparison(root, currentAnimal = {}, currentAnimalId = '') {
    const section = root?.querySelector('[data-animal-comparison]');
    if (!section) return;

    const searchInput = section.querySelector('[data-comparison-search]');
    const searchResults = section.querySelector('[data-comparison-search-results]');
    const select = searchInput;
    const tableContainer = section.querySelector('[data-comparison-table]');
    if (!searchInput || !searchResults || !tableContainer) return;

    try {
        const snapshot = await getDocs(collection(db, 'animais'));
        const animals = snapshot.docs
            .map(snapshotDoc => ({ id: snapshotDoc.id, ...snapshotDoc.data() }))
            .filter(animal => animal.id !== currentAnimalId)
            .sort((left, right) => getAnimalName(left).localeCompare(getAnimalName(right), 'pt-PT'));

        const animalMap = new Map(animals.map(animal => [animal.id, animal]));
        const update = animal => {
            tableContainer.innerHTML = renderTable(currentAnimal, animal);
        };
        const closeResults = () => {
            searchResults.hidden = true;
            searchInput.setAttribute('aria-expanded', 'false');
        };
        const renderResults = async () => {
            const term = normalize(searchInput.value);
            let matches = term
                ? animals.filter(animal => normalize(animal.nome).includes(term) || normalize(animal.nomeCientifico).includes(term))
                : [];
            if (term) {
                try {
                    const remoteMatches = await findLocalAnimalsByWikidata(term, animals);
                    const ids = new Set(matches.map(animal => animal.id));
                    remoteMatches.forEach(animal => { if (!ids.has(animal.id)) matches.push(animal); });
                } catch (error) {
                    console.warn('Wikidata: pesquisa indisponível', error);
                }
                matches = matches.slice(0, 12);
            }
            searchResults.innerHTML = matches.length
                ? matches.map(animal => `<button type="button" class="animal-comparison-search-result" data-comparison-animal-id="${escapeHtml(animal.id)}" role="option"><strong>${escapeHtml(getAnimalName(animal))}</strong>${animal.nomeCientifico && animal.nomeCientifico !== animal.nome ? `<small>${escapeHtml(animal.nomeCientifico)}</small>` : ''}</button>`).join('')
                : (term ? '<p class="animal-comparison-search-empty">Nenhum animal encontrado.</p>' : '');
            searchResults.hidden = !term;
            searchInput.setAttribute('aria-expanded', String(Boolean(term)));
        };
        searchInput.addEventListener('input', renderResults);
        searchResults.addEventListener('click', event => {
            const result = event.target.closest('[data-comparison-animal-id]');
            if (!result) return;
            const animal = animalMap.get(result.dataset.comparisonAnimalId);
            if (!animal) return;
            searchInput.value = getAnimalName(animal);
            closeResults();
            update(animal);
        });
        searchInput.addEventListener('keydown', event => {
            if (event.key === 'Escape') closeResults();
        });
        document.addEventListener('click', event => {
            if (!section.contains(event.target)) closeResults();
        });
        update(null);
    } catch (error) {
        console.error('Não foi possível carregar os animais para comparação:', error);
        select.innerHTML = '<option value="">Não foi possível carregar os animais</option>';
        searchInput.disabled = true;
        tableContainer.innerHTML = '<p class="animal-comparison-empty">Não foi possível carregar a comparação.</p>';
    }
}
