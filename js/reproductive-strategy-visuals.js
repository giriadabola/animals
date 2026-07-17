const REPRODUCTIVE_LIFE_HISTORY_OPTIONS = ['Semélparo', 'Iteróparo'];
const REPRODUCTIVE_TIMING_OPTIONS = ['Contínua', 'Sazonal', 'Oportunista', 'Irregular', 'Única', 'Desconhecida'];

const VISUALS = {
    'Semélparo': '<path d="M18 58c8-24 22-38 44-42c-3 21-16 36-38 44"/><path d="M25 55l29-30"/><circle cx="57" cy="20" r="5"/>',
    'Iteróparo': '<path d="M21 29c6-11 16-17 28-14c10 2 17 10 18 20"/><path d="m61 25 6 10-11 3"/><path d="M59 52c-7 11-17 16-29 13c-10-3-16-11-17-21"/><path d="m19 54-6-10 11-3"/>',
    'Contínua': '<circle cx="40" cy="40" r="25"/><path d="M24 40h32M40 24v32"/><path d="M18 40h6M56 40h6"/>',
    'Sazonal': '<circle cx="40" cy="40" r="14"/><path d="M40 10v12M40 58v12M10 40h12M58 40h12M19 19l8 8M53 53l8 8M61 19l-8 8M27 53l-8 8"/>',
    'Oportunista': '<path d="M16 57c14-3 24-11 29-24"/><path d="m39 34 8-4 2 9"/><circle cx="57" cy="22" r="9"/><path d="M57 13v18M48 22h18"/>',
    'Irregular': '<path d="M12 51l12-20 10 12 12-25 9 21 13-9"/><circle cx="24" cy="31" r="3"/><circle cx="46" cy="18" r="3"/><circle cx="68" cy="30" r="3"/>',
    'Única': '<circle cx="40" cy="40" r="24"/><circle cx="40" cy="40" r="9"/><path d="M40 10v13M40 57v13M10 40h13M57 40h13"/>',
    'Desconhecida': '<circle cx="40" cy="40" r="27"/><path d="M31 31c1-7 6-11 13-11c8 0 13 5 13 12c0 8-7 10-12 14c-3 2-4 5-4 9"/><circle cx="41" cy="63" r="2"/>'
};

export function getReproductiveLifeHistoryOptions() {
    return [...REPRODUCTIVE_LIFE_HISTORY_OPTIONS];
}

export function getReproductiveTimingOptions() {
    return [...REPRODUCTIVE_TIMING_OPTIONS];
}

export function getReproductiveStrategySvg(value = '') {
    const body = VISUALS[value] || VISUALS['Desconhecida'];
    return `<svg class="metric-model-svg reproduction-icon-svg reproductive-strategy-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">${body}</svg>`;
}