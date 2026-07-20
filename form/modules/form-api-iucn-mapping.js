(function () {
  const REALM_OPTIONS = [
    'Afrotropical',
    'Antártica',
    'Australásia',
    'Indomalaia',
    'Neártica',
    'Neotropical',
    'Oceânica',
    'Paleártica'
  ];

  const REALM_ALIASES = {
    afrotropical: 'Afrotropical',
    antarctic: 'Antártica',
    antartica: 'Antártica',
    australasian: 'Australásia',
    australasia: 'Australásia',
    indomalayan: 'Indomalaia',
    indomalaya: 'Indomalaia',
    nearctic: 'Neártica',
    neartica: 'Neártica',
    neotropical: 'Neotropical',
    oceanian: 'Oceânica',
    oceania: 'Oceânica',
    palearctic: 'Paleártica',
    paleartica: 'Paleártica'
  };

  function textOf(value) {
    if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
    if (!value || typeof value !== 'object') return '';
    return String(
      value.description?.pt
      || value.description?.en
      || value.description
      || value.name
      || value.label
      || value.text
      || value.type
      || value.code
      || ''
    ).trim();
  }

  function asItems(value) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];
    for (const key of ['data', 'items', 'records', 'results']) {
      if (Array.isArray(value[key])) return value[key];
    }
    return [value];
  }

  function numberText(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    const match = String(value ?? '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    return match ? match[0] : '';
  }

  function firstNumber(value, keys) {
    if (value == null || typeof value !== 'object') return numberText(value);
    for (const key of keys) {
      if (value[key] != null) {
        const number = numberText(value[key]);
        if (number) return number;
      }
    }
    return '';
  }

  function parseMetric(value) {
    if (value == null) return null;
    if (typeof value !== 'object') {
      const number = numberText(value);
      return number ? { min: number, max: '', unit: '' } : null;
    }

    const min = firstNumber(value, ['minimum', 'min', 'lower', 'from', 'value', 'estimate', 'number', 'count', 'amount']);
    const max = firstNumber(value, ['maximum', 'max', 'upper', 'to']);
    if (!min && !max) return null;
    return {
      min,
      max,
      unit: textOf(value.unit || value.units || value.unit_name || '')
    };
  }

  function findMetricByKey(value, keyPattern, depth = 0) {
    if (depth > 6 || value == null) return null;
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findMetricByKey(item, keyPattern, depth + 1);
        if (found) return found;
      }
      return null;
    }
    if (typeof value !== 'object') return null;

    for (const [key, item] of Object.entries(value)) {
      if (keyPattern.test(String(key))) {
        const metric = parseMetric(item);
        if (metric) return metric;
      }
    }
    for (const item of Object.values(value)) {
      const found = findMetricByKey(item, keyPattern, depth + 1);
      if (found) return found;
    }
    return null;
  }

  function findMetricByLabel(value, labelPattern, depth = 0) {
    if (depth > 6 || value == null) return null;
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findMetricByLabel(item, labelPattern, depth + 1);
        if (found) return found;
      }
      return null;
    }
    if (typeof value !== 'object') return null;

    const labels = [value.name, value.label, value.description, value.type, value.parameter, value.field, value.measure]
      .map(textOf)
      .join(' ');
    if (labelPattern.test(labels)) {
      const metric = parseMetric(value);
      if (metric) return metric;
    }
    for (const item of Object.values(value)) {
      const found = findMetricByLabel(item, labelPattern, depth + 1);
      if (found) return found;
    }
    return null;
  }

  function normalizePopulationUnit(unit) {
    const key = textOf(unit).toLowerCase();
    if (key.includes('million') || key.includes('milh')) return 'milhões';
    if (key.includes('thousand') || key.includes('milhar')) return 'milhares';
    if (key.includes('hundred') || key.includes('centen')) return 'centenas';
    if (key.includes('ten') || key.includes('dezen')) return 'dezenas';
    return 'indivíduos';
  }

  function populationMetric(assessment) {
    const sources = [assessment?.assessment_points, assessment?.population, assessment];
    const keyPattern = /mature[_\s-]*individual|number[_\s-]*of[_\s-]*mature|population[_\s-]*(?:size|estimate|number)/i;
    const labelPattern = /mature\s+individual|population\s+(?:size|estimate|number)/i;
    for (const source of sources) {
      const metric = findMetricByKey(source, keyPattern) || findMetricByLabel(source, labelPattern);
      if (metric) return metric;
    }
    return null;
  }

  function depthMetric(assessment) {
    const source = assessment?.assessment_ranges || assessment?.depth || assessment;
    return findMetricByKey(source, /depth/i) || findMetricByLabel(source, /depth|profundidade/i);
  }

  function habitatLabels(assessment) {
    return [...new Set(asItems(assessment?.habitats).map(textOf).filter(Boolean))];
  }

  function realmKey(value) {
    return textOf(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  function normalizeRealm(value) {
    const key = realmKey(value);
    if (REALM_ALIASES[key]) return REALM_ALIASES[key];
    return REALM_OPTIONS.find(option => realmKey(option) === key) || '';
  }

  function realmLabels(assessment) {
    return [...new Set(asItems(assessment?.biogeographical_realms)
      .map(normalizeRealm)
      .filter(Boolean))];
  }

  function generalRows(assessment) {
    const rows = [];
    const population = populationMetric(assessment);
    if (population) {
      rows.push({
        tipo: 'Tamanho da População',
        valorMin: population.min || population.max,
        valorMax: population.max ? population.max : '',
        unidade: normalizePopulationUnit(population.unit),
        genero: 'Ambos',
        fase: 'Adulto'
      });
    }

    const depth = depthMetric(assessment);
    if (depth) {
      rows.push({
        tipo: 'Profundidade máxima',
        valorMin: depth.max || depth.min,
        valorMax: '',
        unidade: 'm',
        genero: 'Ambos',
        fase: 'Adulto'
      });
    }

    for (const habitat of habitatLabels(assessment)) {
      rows.push({
        tipo: 'Habitats',
        valorMin: habitat,
        valor: habitat,
        valorMax: '',
        unidade: '',
        genero: 'Ambos',
        fase: 'Adulto'
      });
    }
    return rows;
  }

  function generalKey(item) {
    return [item?.tipo, item?.valorMin || item?.valor || '', item?.valorMax || '', item?.unidade || ''].join('|');
  }

  function regionKey(item) {
    return [item?.tipo || 'Regiões Biogeográficas', item?.valor || ''].join('|');
  }

  window.formIucnMapping = {
    textOf,
    generalRows,
    realmLabels,
    generalKey,
    regionKey
  };
})();
