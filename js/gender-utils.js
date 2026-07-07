export const GENDER_MALE = 'M';
export const GENDER_FEMALE = 'F';
export const GENDER_BOTH = 'MF';

const GENDER_CYCLE = [GENDER_BOTH, GENDER_MALE, GENDER_FEMALE];
const COMBINED_GENDER_ALIASES = new Set([
    GENDER_BOTH,
    'FM',
    'M/F',
    'F/M',
    'M-F',
    'F-M',
    'M F',
    'F M',
    'B',
    'BOTH',
    'AMBOS',
    'AMBOS OS SEXOS',
    'MACHO E FEMEA',
    'FEMEA E MACHO',
    'MACHO/FEMEA',
    'FEMEA/MACHO',
    'MACHO-FEMEA',
    'FEMEA-MACHO',
    'MACHO FEMEA',
    'FEMEA MACHO',
    '♂♀',
    '♀♂'
]);

const MALE_GENDER_ALIASES = new Set([
    GENDER_MALE,
    'MACHO',
    'MASCULINO',
    '♂'
]);

const FEMALE_GENDER_ALIASES = new Set([
    GENDER_FEMALE,
    'FEMEA',
    'FEMININO',
    '♀'
]);

function normalizeGenderAlias(value) {
    return String(value ?? '')
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

function getComparableSignature(item = {}, genderKey = 'genero') {
    return JSON.stringify(
        Object.entries(item)
            .filter(([key]) => key !== genderKey)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, value]) => [key, value ?? ''])
    );
}

export function normalizeGenderValue(value, fallback = GENDER_BOTH) {
    const normalized = normalizeGenderAlias(value);
    if (!normalized) return fallback;
    if (MALE_GENDER_ALIASES.has(normalized)) return GENDER_MALE;
    if (FEMALE_GENDER_ALIASES.has(normalized)) return GENDER_FEMALE;
    if (COMBINED_GENDER_ALIASES.has(normalized)) return GENDER_BOTH;
    return fallback;
}

export function getNextGenderValue(value) {
    const normalized = normalizeGenderValue(value, GENDER_BOTH);
    const currentIndex = GENDER_CYCLE.indexOf(normalized);
    return GENDER_CYCLE[(currentIndex + 1) % GENDER_CYCLE.length];
}

export function getGenderUi(value) {
    const normalized = normalizeGenderValue(value, GENDER_BOTH);
    if (normalized === GENDER_MALE) {
        return {
            value: GENDER_MALE,
            title: 'Macho',
            html: '<span style="color: #3b82f6; font-weight: 700;">&#9794;</span>'
        };
    }
    if (normalized === GENDER_FEMALE) {
        return {
            value: GENDER_FEMALE,
            title: 'Fêmea',
            html: '<span style="color: #ec4899; font-weight: 700;">&#9792;</span>'
        };
    }
    return {
        value: GENDER_BOTH,
        title: 'Macho e fêmea',
        html: '<span style="display: inline-flex; align-items: center; gap: 1px; line-height: 1;"><span style="color: #3b82f6; font-weight: 700; font-size: 0.9rem;">&#9794;</span><span style="color: #ec4899; font-weight: 700; font-size: 0.9rem;">&#9792;</span></span>'
    };
}

export function expandGenderVariants(value) {
    const normalized = normalizeGenderValue(value, '');
    if (!normalized) return [];
    if (normalized === GENDER_BOTH) return [GENDER_MALE, GENDER_FEMALE];
    return [normalized];
}

export function collectConcreteGenders(items = []) {
    const genders = new Set();
    items.forEach(item => {
        expandGenderVariants(item?.genero).forEach(gender => genders.add(gender));
    });
    return genders;
}

export function genderMatchesSelection(itemGender, selectedGender) {
    if (!selectedGender) return true;
    const variants = expandGenderVariants(itemGender);
    if (variants.length === 0) return true;
    return variants.includes(selectedGender);
}

export function expandCombinedGenderItems(items = [], genderKey = 'genero') {
    if (!Array.isArray(items)) return [];
    return items.flatMap(item => {
        const normalized = normalizeGenderValue(item?.[genderKey], GENDER_BOTH);
        const genders = normalized === GENDER_BOTH ? [GENDER_MALE, GENDER_FEMALE] : [normalized];
        return genders.map(gender => ({
            ...item,
            [genderKey]: gender
        }));
    });
}

export function collapseCombinedGenderItems(items = [], genderKey = 'genero') {
    if (!Array.isArray(items)) return [];

    const usedIndexes = new Set();
    const collapsed = [];

    items.forEach((item, index) => {
        if (usedIndexes.has(index)) return;

        const normalizedGender = normalizeGenderValue(item?.[genderKey], GENDER_BOTH);
        const normalizedItem = { ...item, [genderKey]: normalizedGender };

        if (normalizedGender !== GENDER_MALE && normalizedGender !== GENDER_FEMALE) {
            collapsed.push({ ...normalizedItem, [genderKey]: GENDER_BOTH });
            return;
        }

        const targetGender = normalizedGender === GENDER_MALE ? GENDER_FEMALE : GENDER_MALE;
        const signature = getComparableSignature(normalizedItem, genderKey);

        const pairIndex = items.findIndex((candidate, candidateIndex) => {
            if (candidateIndex === index || usedIndexes.has(candidateIndex)) return false;
            return (
                normalizeGenderValue(candidate?.[genderKey], GENDER_BOTH) === targetGender &&
                getComparableSignature(candidate, genderKey) === signature
            );
        });

        if (pairIndex >= 0) {
            usedIndexes.add(pairIndex);
            collapsed.push({ ...normalizedItem, [genderKey]: GENDER_BOTH });
            return;
        }

        collapsed.push(normalizedItem);
    });

    return collapsed;
}
