export const biogeographicRegions = [
    {
        label: 'Afrotropical',
        description: 'África subsaariana, Madagáscar e ilhas próximas.',
        continents: ['África'],
        countries: ['AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'CI', 'DJ', 'GQ', 'ER', 'ET', 'GA', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'MG', 'MW', 'ML', 'MR', 'MU', 'MZ', 'NA', 'NE', 'NG', 'RW', 'SC', 'SL', 'SN', 'SO', 'SS', 'ST', 'SZ', 'TZ', 'TG', 'UG', 'ZA', 'ZM', 'ZW', 'RE', 'YT']
    },
    {
        label: 'Antártica',
        description: 'Continente antártico e ilhas subantárticas.',
        continents: ['Antártida'],
        countries: ['AQ']
    },
    {
        label: 'Australásia',
        description: 'Austrália, Nova Zelândia, Nova Guiné e ilhas próximas.',
        continents: ['Oceânia'],
        countries: ['AU', 'NZ', 'PG', 'NC', 'FJ', 'VU', 'SB', 'WS', 'TO', 'TV', 'KI', 'NR', 'PW', 'FM', 'MH']
    },
    {
        label: 'Indomalaia',
        description: 'Sul e sudeste da Ásia, incluindo o arquipélago malaio.',
        continents: ['Ásia'],
        countries: ['IN', 'BD', 'BT', 'NP', 'LK', 'MM', 'TH', 'LA', 'VN', 'KH', 'MY', 'SG', 'ID', 'PH', 'BN', 'TL']
    },
    {
        label: 'Neártica',
        description: 'América do Norte e Gronelândia.',
        continents: ['América do Norte'],
        countries: ['CA', 'US', 'GL', 'BM']
    },
    {
        label: 'Neotropical',
        description: 'América Central, Caraíbas e América do Sul.',
        continents: ['América do Norte', 'América do Sul'],
        countries: ['MX', 'GT', 'BZ', 'HN', 'SV', 'NI', 'CR', 'PA', 'CO', 'VE', 'GY', 'SR', 'GF', 'EC', 'PE', 'BO', 'BR', 'PY', 'CL', 'AR', 'UY', 'CU', 'DO', 'HT', 'JM', 'PR', 'FK']
    },
    {
        label: 'Oceânica',
        description: 'Ilhas e arquipélagos do Pacífico e de outras áreas oceânicas.',
        continents: ['Oceânia'],
        countries: ['FJ', 'NC', 'VU', 'SB', 'WS', 'TO', 'TV', 'KI', 'NR', 'PW', 'FM', 'MH', 'GU', 'MP', 'PF', 'PN', 'CK', 'NU', 'TK']
    },
    {
        label: 'Paleártica',
        description: 'Europa, norte de África e grande parte da Ásia temperada.',
        continents: ['Europa', 'Ásia', 'África'],
        countries: ['IS', 'NO', 'SE', 'FI', 'DK', 'IE', 'GB', 'NL', 'BE', 'LU', 'DE', 'PL', 'CZ', 'SK', 'AT', 'CH', 'FR', 'ES', 'PT', 'IT', 'SI', 'HR', 'BA', 'RS', 'ME', 'AL', 'MK', 'GR', 'BG', 'RO', 'MD', 'UA', 'BY', 'LT', 'LV', 'EE', 'RU', 'KZ', 'MN', 'JP', 'KR', 'TR', 'GE', 'AM', 'AZ', 'AF', 'IR', 'IQ', 'SY', 'LB', 'IL', 'JO', 'SA', 'AE', 'OM', 'YE', 'MA', 'DZ', 'TN', 'LY', 'EG']
    }
];

export const normalizeBiogeographicRegion = (value = '') => String(value).trim().toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function resolveBiogeographicRegion(value = '') {
    const label = String(value || '').trim();
    return biogeographicRegions.find(region => normalizeBiogeographicRegion(region.label) === normalizeBiogeographicRegion(label)) || null;
}
