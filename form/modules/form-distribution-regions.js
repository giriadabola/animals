const BIOGEOGRAPHIC_REGION_OPTIONS = [
    'Afrotropical',
    'Antártica',
    'Australásia',
    'Indomalaia',
    'Neártica',
    'Neotropical',
    'Oceânica',
    'Paleártica'
];

let distributionRegionsData = [];

function normalizeDistributionRegionItem(item) {
    if (!item) return null;
    const tipo = String(item.tipo || item.type || 'Regiões Biogeográficas').trim() || 'Regiões Biogeográficas';
    const valor = String(item.valor || item.regiao || item.region || '').trim();
    if (!valor) return null;
    return { tipo: 'Regiões Biogeográficas', valor };
}

function getDistributionRegionsData() {
    return distributionRegionsData
        .map(normalizeDistributionRegionItem)
        .filter(Boolean)
        .filter((item, index, arr) => arr.findIndex(other => other.tipo === item.tipo && other.valor === item.valor) === index);
}

function setDistributionRegionsData(items = []) {
    distributionRegionsData = (Array.isArray(items) ? items : [])
        .map(normalizeDistributionRegionItem)
        .filter(Boolean);
    renderDistributionRegionRows();
}

function createDistributionRegionSelect(value = '') {
    const select = document.createElement('select');
    select.className = 'distribution-region-value';
    select.innerHTML = `<option value="">Selecionar região...</option>${BIOGEOGRAPHIC_REGION_OPTIONS.map(region => `<option value="${region}">${region}</option>`).join('')}`;
    select.value = value || '';
    return select;
}

function renderDistributionRegionRows() {
    const rowsContainer = document.getElementById('distributionRegionRows');
    if (!rowsContainer) return;

    rowsContainer.innerHTML = '';

    distributionRegionsData.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'distribution-region-row';
        row.dataset.index = String(index);

        const typeSelect = document.createElement('select');
        typeSelect.className = 'distribution-region-type';
        typeSelect.innerHTML = '<option value="Regiões Biogeográficas">Regiões Biogeográficas</option>';
        typeSelect.value = 'Regiões Biogeográficas';

        const valueSelect = createDistributionRegionSelect(item.valor);
        valueSelect.addEventListener('change', () => {
            distributionRegionsData[index] = { tipo: 'Regiões Biogeográficas', valor: valueSelect.value };
        });

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-distribution-region-btn';
        removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        removeBtn.setAttribute('aria-label', 'Apagar região biogeográfica');
        removeBtn.addEventListener('click', () => {
            distributionRegionsData.splice(index, 1);
            renderDistributionRegionRows();
        });

        row.append(typeSelect, valueSelect, removeBtn);
        rowsContainer.appendChild(row);
    });
}

function addDistributionRegionRow(initialValue = '') {
    distributionRegionsData.push({ tipo: 'Regiões Biogeográficas', valor: initialValue });
    renderDistributionRegionRows();
}

function initDistributionRegionsControls() {
    const addBtn = document.getElementById('addDistributionRegionBtn');
    const rowsContainer = document.getElementById('distributionRegionRows');
    if (!addBtn || !rowsContainer) return;

    if (!rowsContainer.dataset.initialized) {
        rowsContainer.dataset.initialized = '1';
        renderDistributionRegionRows();
    }

    if (!addBtn.dataset.initialized) {
        addBtn.dataset.initialized = '1';
        addBtn.addEventListener('click', () => addDistributionRegionRow(''));
    }
}

document.addEventListener('DOMContentLoaded', initDistributionRegionsControls);
