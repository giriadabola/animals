export const perceptionTypes = [
    'Visual',
    'Tátil',
    'Química',
    'Olfativa',
    'Acústica',
    'Ultravioleta',
    'Elétrica / eletroreceção',
    'Vibrações',
    'Eco-localização',
    'Pressão da água',
    'Temperatura',
    'Magnetorreceção'
];

export const perceptionDescriptions = {
    'Visual': 'Deteta luz, formas, movimento e cores.',
    'Tátil': 'Deteta contacto, textura e deformações através do corpo.',
    'Química': 'Deteta substâncias químicas dissolvidas no ambiente.',
    'Olfativa': 'Deteta moléculas transportadas pelo ar ou pela água.',
    'Acústica': 'Deteta sons e variações de pressão no ambiente.',
    'Ultravioleta': 'Deteta radiação ultravioleta para localizar sinais e recursos.',
    'Elétrica / eletroreceção': 'Deteta campos elétricos produzidos pelo ambiente ou por outros animais.',
    'Vibrações': 'Deteta vibrações transmitidas pelo solo, pela água ou por estruturas.',
    'Eco-localização': 'Usa ecos para localizar objetos e calcular distâncias.',
    'Pressão da água': 'Deteta alterações de pressão e movimento na água.',
    'Temperatura': 'Deteta diferenças de temperatura no ambiente.',
    'Magnetorreceção': 'Deteta o campo magnético da Terra para orientação e navegação.'
};

const perceptionMeta = new Map([
    ['Visual', { key: 'visual', accent: 'accent-eye' }],
    ['Tátil', { key: 'tatil', accent: 'accent-width' }],
    ['Química', { key: 'quimica', accent: 'accent-bioma' }],
    ['Olfativa', { key: 'olfativa', accent: 'accent-generic' }],
    ['Acústica', { key: 'acustica', accent: 'accent-climate' }],
    ['Ultravioleta', { key: 'ultravioleta', accent: 'accent-wing' }],
    ['Elétrica / eletroreceção', { key: 'eletrica', accent: 'accent-speed-max' }],
    ['Vibrações', { key: 'vibracoes', accent: 'accent-tail' }],
    ['Eco-localização', { key: 'eco-localizacao', accent: 'accent-water' }],
    ['Pressão da água', { key: 'pressao-agua', accent: 'accent-water' }],
    ['Temperatura', { key: 'temperatura', accent: 'accent-metabolic-rate' }],
    ['Magnetorreceção', { key: 'magnetorrececao', accent: 'accent-climate' }]
]);

const normalizePerceptionKey = (value = '') => String(value)
    .trim()
    .toLocaleLowerCase('pt-PT')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function getPerceptionVisualMeta(value = '') {
    const normalized = normalizePerceptionKey(value);
    const entry = perceptionTypes.find(type => normalizePerceptionKey(type) === normalized);
    const label = entry || String(value || '').trim() || 'Tipo de perceção';
    const meta = perceptionMeta.get(entry) || { key: 'visual', accent: 'accent-eye' };
    return { ...meta, title: label };
}

function makeSvg(body) {
    return `<svg class="metric-model-svg perception-model-svg" viewBox="0 0 80 80" fill="none" aria-hidden="true">${body}</svg>`;
}

export function getPerceptionModelSvg(key = 'visual') {
    const icons = {
        visual: makeSvg('<path d="M12 40c8-13 18-20 28-20s20 7 28 20c-8 13-18 20-28 20S20 53 12 40Z"/><circle cx="40" cy="40" r="8"/><circle cx="40" cy="40" r="3"/>'),
        tatil: makeSvg('<circle cx="27" cy="28" r="6"/><circle cx="40" cy="22" r="6"/><circle cx="53" cy="28" r="6"/><path d="M18 61c2-13 8-21 16-21s14 8 16 21"/><path d="M40 40v21"/>'),
        quimica: makeSvg('<path d="M31 14h18M36 14v20L20 60c-3 5 1 9 7 9h26c6 0 10-4 7-9L44 34V14"/><path d="M27 55h26"/><circle cx="34" cy="47" r="2"/><circle cx="45" cy="51" r="2"/>'),
        olfativa: makeSvg('<path d="M23 30c0-10 7-16 17-16s17 6 17 16v16c0 8-5 14-12 14H35c-7 0-12-6-12-14V30Z"/><path d="M40 39v12M34 54h12"/><path d="M25 22l-7-6M55 22l7-6"/>'),
        acustica: makeSvg('<path d="M16 34h12l12-10v32L28 46H16Z"/><path d="M51 30c6 5 6 15 0 20M58 24c10 9 10 23 0 32"/>'),
        ultravioleta: makeSvg('<circle cx="40" cy="40" r="12"/><path d="M40 10v12M40 58v12M10 40h12M58 40h12M19 19l8 8M53 53l8 8M61 19l-8 8M27 53l-8 8"/><path d="M32 40h16"/>'),
        eletrica: makeSvg('<path d="M45 10L22 43h17l-4 27l23-35H41Z"/><path d="M15 27h10M55 53h10M18 58h10M52 22h10"/>'),
        vibracoes: makeSvg('<path d="M12 40h12l6-16l10 32l10-32l6 16h12"/><path d="M16 62h48"/>'),
        'eco-localizacao': makeSvg('<circle cx="40" cy="40" r="6"/><path d="M40 12v16M40 52v16M12 40h16M52 40h16"/><path d="M24 24a23 23 0 0 1 0 32M56 24a23 23 0 0 0 0 32"/>'),
        'pressao-agua': makeSvg('<path d="M12 28c8-6 16-6 24 0s16 6 24 0"/><path d="M12 43c8-6 16-6 24 0s16 6 24 0"/><path d="M12 58c8-6 16-6 24 0s16 6 24 0"/>'),
        temperatura: makeSvg('<path d="M34 16a6 6 0 0 1 12 0v28a15 15 0 1 1-12 0V16Z"/><path d="M40 25v28"/><circle cx="40" cy="58" r="7"/><path d="M54 22h10M54 32h7M54 42h10"/>'),
        magnetorrececao: makeSvg('<circle cx="40" cy="40" r="23"/><path d="M40 17v46M17 40h46"/><path d="M28 28l24 24M52 28L28 52"/><path d="M40 10v7M40 63v7"/>')
    };
    return icons[key] || icons.visual;
}
