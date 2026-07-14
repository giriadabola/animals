const PERIODS_PER_DAY = {
    dia: 1,
    semana: 7,
    mes: 30,
    ano: 365
};

export const DISTANCE_UNITS = [
    'km/ano',
    'km/dia',
    'km/mes',
    'km/semana',
    'm/ano',
    'm/dia',
    'm/mes',
    'm/semana'
];

function normalizeText(value = '') {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function normalizeUnit(unit = '') {
    const value = normalizeText(unit).replace(/\s+/g, '');
    if (value === 'km/mes' || value === 'km/mês') return 'km/mes';
    if (value === 'm/mes' || value === 'm/mês') return 'm/mes';
    return value;
}

function parseNumber(value) {
    const match = String(value ?? '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
}

function parseRange(item = {}) {
    const min = parseNumber(item.valorMin ?? item.min);
    const max = parseNumber(item.valorMax ?? item.max);
    if (min !== null || max !== null) {
        return { min: min ?? max, max: max ?? min };
    }

    const values = String(item.valor ?? item.value ?? '')
        .replace(',', '.')
        .match(/-?\d+(?:\.\d+)?/g)
        ?.map(Number)
        .filter(Number.isFinite) || [];

    if (!values.length) return null;
    return { min: values[0], max: values[1] ?? values[0] };
}

function toKmPerDay(value, unit) {
    const normalizedUnit = normalizeUnit(unit || 'km/dia');
    const [distanceUnit, period] = normalizedUnit.split('/');
    const metres = distanceUnit === 'm' ? value / 1000 : value;
    return metres / (PERIODS_PER_DAY[period] || 1);
}

function fromKmPerDay(value, unit) {
    const normalizedUnit = normalizeUnit(unit || 'km/dia');
    const [distanceUnit, period] = normalizedUnit.split('/');
    const factor = PERIODS_PER_DAY[period] || 1;
    const kilometres = value * factor;
    return distanceUnit === 'm' ? kilometres * 1000 : kilometres;
}

function formatNumber(value) {
    if (!Number.isFinite(value)) return '—';
    return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2 }).format(value);
}

export function getDistanceMetricFromAnimal(animal = {}) {
    const information = animal.informacao || {};
    const details = [];
    const add = value => Array.isArray(value) && details.push(...value.filter(Boolean));
    add(information.geralDetalhada);
    add(information.dimensoesDetalhadas);
    add(information.curiosidadesDetalhadas);
    add(information.curiosidades?.detalhes);
    if (Array.isArray(information.curiosidades)) add(information.curiosidades);
    if (information.curiosidades?.distanciaPercorrida) {
        details.push({
            tipo: 'Distância Percorrida',
            valor: information.curiosidades.distanciaPercorrida,
            unidade: information.curiosidades.distanciaPercorridaUnidade
        });
    }

    const items = details.filter(entry => normalizeText(
        entry?.tipo || entry?.type || entry?.label || entry?.categoria
    ) === 'distancia percorrida');
    const parsedItems = items.map(item => {
        const range = parseRange(item);
        if (!range) return null;
        const unit = DISTANCE_UNITS.includes(normalizeUnit(item.unidade))
            ? normalizeUnit(item.unidade)
            : 'km/dia';
        const baseMin = toKmPerDay(range.min, unit);
        const baseMax = toKmPerDay(range.max, unit);
        return { unit, baseMin: Math.min(baseMin, baseMax), baseMax: Math.max(baseMin, baseMax) };
    }).filter(Boolean);
    if (!parsedItems.length) return null;

    const unit = parsedItems[0].unit;
    const baseMin = Math.min(...parsedItems.map(item => item.baseMin));
    const baseMax = Math.max(...parsedItems.map(item => item.baseMax));
    const displayMin = fromKmPerDay(baseMin, unit);
    const displayMax = fromKmPerDay(baseMax, unit);

    return {
        min: displayMin,
        max: displayMax,
        unit,
        baseMin,
        baseMax,
        displayValue: displayMin === displayMax
            ? `${formatNumber(displayMin)} ${unit}`
            : `${formatNumber(displayMin)}–${formatNumber(displayMax)} ${unit}`
    };
}

function uniqueMarks(records, unit, limit = 7) {
    const values = [...new Set(records
        .flatMap(record => [record.distanceMetric.baseMin, record.distanceMetric.baseMax])
        .map(value => Number(fromKmPerDay(value, unit).toFixed(2)))
        .filter(Number.isFinite))]
        .sort((a, b) => a - b);

    if (values.length <= limit) return values;
    const marks = [];
    for (let index = 0; index < limit; index += 1) {
        const position = Math.round(index * (values.length - 1) / (limit - 1));
        if (!marks.includes(values[position])) marks.push(values[position]);
    }
    return marks;
}

function createMarkButton(value, unit, min, max, onSelect) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'distance-range-mark';
    button.style.left = `${max === min ? 50 : ((value - min) / (max - min)) * 100}%`;
    button.textContent = formatNumber(value);
    button.title = `Mostrar animais a partir de ${formatNumber(value)} ${unit}`;
    button.setAttribute('aria-label', button.title);
    button.addEventListener('click', () => onSelect(value));
    return button;
}

export function initDistanceFilterPanel(container, records, onFilter) {
    if (!container) return null;
    const source = records.filter(record => record?.distanceMetric);
    if (!source.length) {
        container.hidden = false;
        container.innerHTML = `
            <div class="distance-filter-header">
                <div>
                    <span class="distance-filter-kicker">ESCALA DE MOVIMENTO</span>
                    <h2>Distância Percorrida</h2>
                    <p>Ainda não existem valores de distância registados.</p>
                </div>
            </div>
        `;
        return { refresh() {} };
    }
    let selectedMinimum = null;
    let currentUnit = 'km/dia';

    container.hidden = false;
    container.innerHTML = `
        <div class="distance-filter-header">
            <div>
                <span class="distance-filter-kicker">ESCALA DE MOVIMENTO</span>
                <h2>Distância Percorrida</h2>
                <p>Escolha um valor para filtrar os animais apresentados abaixo.</p>
            </div>
            <label class="distance-unit-control">
                <span>Unidade</span>
                <select aria-label="Unidade da distância">
                    ${DISTANCE_UNITS.map(unit => `<option value="${unit}"${unit === currentUnit ? ' selected' : ''}>${unit}</option>`).join('')}
                </select>
            </label>
        </div>
        <div class="distance-range-summary">
            <div class="distance-range-labels">
                <strong data-distance-min></strong>
                <span>—</span>
                <strong data-distance-max></strong>
            </div>
            <div class="distance-range-rail" data-distance-rail></div>
        </div>
        <div class="distance-filter-options">
            <span class="distance-options-label">Filtrar por valor mínimo</span>
            <div class="distance-filter-chips" data-distance-chips></div>
        </div>
        <p class="distance-filter-status" data-distance-status></p>
    `;

    const unitSelect = container.querySelector('select');
    const minLabel = container.querySelector('[data-distance-min]');
    const maxLabel = container.querySelector('[data-distance-max]');
    const rail = container.querySelector('[data-distance-rail]');
    const chips = container.querySelector('[data-distance-chips]');
    const status = container.querySelector('[data-distance-status]');

    const render = () => {
        const values = source.flatMap(record => [record.distanceMetric.baseMin, record.distanceMetric.baseMax]);
        const min = fromKmPerDay(Math.min(...values), currentUnit);
        const max = fromKmPerDay(Math.max(...values), currentUnit);
        const marks = uniqueMarks(source, currentUnit);

        minLabel.textContent = `${formatNumber(min)} ${currentUnit}`;
        maxLabel.textContent = `${formatNumber(max)} ${currentUnit}`;
        rail.innerHTML = '';
        marks.forEach(value => rail.appendChild(createMarkButton(value, currentUnit, min, max, valueSelected)));

        chips.innerHTML = '';
        const allButton = document.createElement('button');
        allButton.type = 'button';
        allButton.className = `distance-filter-chip ${selectedMinimum === null ? 'active' : ''}`;
        allButton.textContent = 'Todos';
        allButton.addEventListener('click', () => {
            selectedMinimum = null;
            valueSelected();
        });
        chips.appendChild(allButton);

        marks.forEach(value => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = `distance-filter-chip ${selectedMinimum === value ? 'active' : ''}`;
            chip.textContent = `≥ ${formatNumber(value)} ${currentUnit}`;
            chip.addEventListener('click', () => {
                selectedMinimum = value;
                valueSelected();
            });
            chips.appendChild(chip);
        });

        const selectedBase = selectedMinimum === null ? null : toKmPerDay(selectedMinimum, currentUnit);
        status.textContent = selectedBase === null
            ? `${source.length} animal(is) com dados de distância.`
            : `A mostrar animais com pelo menos ${formatNumber(selectedMinimum)} ${currentUnit}.`;
    };

    function valueSelected() {
        const selectedBase = selectedMinimum === null ? null : toKmPerDay(selectedMinimum, currentUnit);
        onFilter(selectedBase);
        render();
    }

    unitSelect.addEventListener('change', () => {
        currentUnit = unitSelect.value;
        selectedMinimum = null;
        onFilter(null);
        render();
    });

    render();
    return { refresh: render };
}
