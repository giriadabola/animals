const normalizeMetricText = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const populationUnitMultipliers = {
    individuo: 1,
    individuos: 1,
    unidade: 1,
    unidades: 1,
    dezena: 10,
    dezenas: 10,
    centena: 100,
    centenas: 100,
    milhar: 1000,
    milhares: 1000,
    milhao: 1000000,
    milhoes: 1000000
};

export const POPULATION_RANKING_KEY = 'maior-populacao';

export function isPopulationRankingFilter(type = '', value = '') {
    const normalizedType = normalizeMetricText(type);
    const normalizedValue = normalizeMetricText(value);

    return normalizedType === POPULATION_RANKING_KEY || (
        normalizedType === 'tamanho da populacao' && normalizedValue === 'ranking'
    );
}

export function extractPopulationMetric(details = []) {
    const item = details.find(detail => {
        const type = normalizeMetricText(detail?.tipo);
        return type.includes('tamanho') && type.includes('populacao');
    });

    if (!item) return null;

    const value = item.valor ?? item.valorMin ?? item.valorMax ?? '';
    const number = parseFloat(String(value).replace(',', '.').replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(number)) return null;

    const unit = normalizeMetricText(item.unidade);
    const multiplier = populationUnitMultipliers[unit] || 1;
    const min = item.valorMin ?? item.valor ?? '';
    const max = item.valorMax ?? '';
    const displayValue = min && max && String(min) !== String(max)
        ? `${min}-${max} ${item.unidade || ''}`.trim()
        : `${value} ${item.unidade || ''}`.trim();

    return {
        numericValue: number * multiplier,
        displayValue
    };
}
