import { visualFilterPool, getVisualFilterUrl, renderVisualFilterIcon } from '../js/visual-filter-catalog.js';

const grid = document.querySelector('#visualPeriodicGrid');
const visibleFilters = [...visualFilterPool].sort(() => Math.random() - .5).slice(0, 50);
let changedIndex = -1;

function filterKey(item) {
    return `${item.type}|${item.value}`;
}

function render() {
    grid.innerHTML = visibleFilters.map((item, index) => `
        <a class="dimension-model-card visual-periodic-cell ${item.accent} ${index === changedIndex ? 'is-featured' : ''}" href="${getVisualFilterUrl(item)}" title="Filtrar por ${item.name}">
            <div class="dimension-model-icon" aria-hidden="true">${renderVisualFilterIcon(item)}</div>
        </a>
    `).join('');
}

function replaceRandomIcon() {
    const visibleKeys = new Set(visibleFilters.map(filterKey));
    const available = visualFilterPool.filter(item => !visibleKeys.has(filterKey(item)));
    if (!available.length) return;
    const slot = Math.floor(Math.random() * visibleFilters.length);
    visibleFilters[slot] = available[Math.floor(Math.random() * available.length)];
    changedIndex = slot;
    render();
}

render();
window.setInterval(replaceRandomIcon, 5000);
