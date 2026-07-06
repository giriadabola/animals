export const locomotionCatalog = [
    { label: 'Quadrúpede', key: 'quadrupede', accent: 'accent-climate' },
    { label: 'Bípede', key: 'bipede', accent: 'accent-climate' },
    { label: 'Saltador', key: 'saltador', accent: 'accent-climate' },
    { label: 'Rastejante', key: 'rastejante', accent: 'accent-climate' },
    { label: 'Serpentino', key: 'serpentino', accent: 'accent-climate' },
    { label: 'Nadador', key: 'nadador', accent: 'accent-climate' },
    { label: 'Voador', key: 'voador', accent: 'accent-climate' },
    { label: 'Planador', key: 'planador', accent: 'accent-climate' },
    { label: 'Trepador', key: 'trepador', accent: 'accent-climate' },
    { label: 'Escavador / Fossorial', key: 'escavador_fossorial', accent: 'accent-climate' },
    { label: 'Cursorial', key: 'cursorial', accent: 'accent-climate' },
    { label: 'Ambulante', key: 'ambulante', accent: 'accent-climate' },
    { label: 'Sésil', key: 'sesil', accent: 'accent-climate' }
];

function makeSvg(body, className = 'general-model-svg locomotion-model-svg') {
    return `<svg class="metric-model-svg ${className}" viewBox="0 0 80 80" fill="none" aria-hidden="true">${body}</svg>`;
}

export function normalizeLocomotionKey(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[()/-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const locomotionMap = new Map(
    locomotionCatalog.flatMap(item => {
        const entries = [[normalizeLocomotionKey(item.label), item]];
        if (item.key) entries.push([normalizeLocomotionKey(item.key.replace(/_/g, ' ')), item]);
        return entries;
    })
);

export function getLocomotionMeta(value = '') {
    const normalized = normalizeLocomotionKey(value);
    const match = locomotionMap.get(normalized);
    if (match) return { key: match.key, title: match.label, accent: match.accent };
    return { key: 'locomocao', title: value || 'Locomoção', accent: 'accent-climate' };
}

export function getLocomotionSvg(key = 'locomocao') {
    const icons = {
        locomocao: makeSvg('<path d="M16 58h48"/><path d="M22 46c8-10 18-16 30-18"/><path d="M28 58l8-12"/><path d="M46 58l8-12"/><path d="M58 30l8-6"/>'),
        quadrupede: makeSvg('<path d="M16 58h48"/><path d="M22 48c6-10 15-15 28-15c8 0 14 2 20 6"/><path d="M26 48v10"/><path d="M38 45v13"/><path d="M52 46v12"/><path d="M62 43v15"/>'),
        bipede: makeSvg('<circle cx="40" cy="18" r="6"/><path d="M40 24v18"/><path d="M40 30l-10 10"/><path d="M40 30l12 8"/><path d="M40 42l-8 16"/><path d="M40 42l10 16"/>'),
        saltador: makeSvg('<path d="M18 58h44"/><path d="M26 50c4-12 12-20 22-24"/><path d="M42 26l10 4"/><path d="M34 38l-8 12"/><path d="M38 40l14 18"/><path d="M24 58l10-4"/>'),
        rastejante: makeSvg('<path d="M14 54c8-8 16-10 24-6c8 4 16 2 28-6"/><path d="M18 58h44"/><path d="M20 44l6 4"/><path d="M54 36l6 4"/>'),
        serpentino: makeSvg('<path d="M14 48c8-10 16-10 24 0c8 10 16 10 28 0"/><path d="M18 60c8-10 16-10 24 0c8 10 16 10 24 0"/><circle cx="62" cy="48" r="2.5"/>'),
        nadador: makeSvg('<path d="M12 46c10-10 22-15 36-15c11 0 20 3 27 10c-7 10-18 16-31 16S21 54 12 46Z"/><path d="M60 41l10-10v22L60 41Z"/><path d="M14 62c5-4 10-4 15 0c5-4 10-4 15 0c5-4 10-4 15 0"/>'),
        voador: makeSvg('<path d="M12 52c14-24 30-36 54-38c-4 24-17 40-41 52H12V52Z"/><path d="M30 28c7 8 11 18 12 30"/><path d="M45 22c6 8 8 16 8 26"/><path d="M58 18l10-6"/>'),
        planador: makeSvg('<path d="M12 42c14-14 28-20 48-20c2 0 6 0 8 1c-8 18-24 31-46 39H12V42Z"/><path d="M24 52h34"/><path d="M38 28v12"/>'),
        trepador: makeSvg('<path d="M40 16v48"/><path d="M32 24l8 8l8-8"/><path d="M28 42l12-10l12 10"/><path d="M30 58l10-8"/><path d="M50 58l-10-8"/>'),
        escavador_fossorial: makeSvg('<path d="M14 56h52"/><path d="M22 48c8-7 18-11 30-11"/><path d="M25 56c0-10 6-18 15-18c8 0 14 6 14 14"/><path d="M24 29l-6 7"/><path d="M36 24l-4 9"/><path d="M48 24l2 9"/>'),
        cursorial: makeSvg('<path d="M16 58h48"/><path d="M22 46c8-12 18-18 30-18"/><path d="M30 46l-10 12"/><path d="M42 44l-4 14"/><path d="M54 42l8 16"/><path d="M58 30l10-8"/>'),
        ambulante: makeSvg('<path d="M18 58h44"/><path d="M24 44c4-6 10-10 18-10c7 0 13 2 18 6"/><path d="M28 46v12"/><path d="M40 44v14"/><path d="M52 45v13"/>'),
        sesil: makeSvg('<path d="M18 58h44"/><path d="M40 58V36"/><path d="M28 36c0-8 5-14 12-14s12 6 12 14"/><path d="M24 44c0-6 4-10 8-10"/><path d="M56 44c0-6-4-10-8-10"/>')
    };

    return icons[key] || icons.locomocao;
}
