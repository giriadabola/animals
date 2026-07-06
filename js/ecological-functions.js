export const ecologicalFunctionCatalog = [
    { label: 'Predador', key: 'predador', accent: 'accent-habitat' },
    { label: 'Presa', key: 'presa', accent: 'accent-habitat' },
    { label: 'Herbívoro controlador de vegetação', key: 'herbivoro_controlador_vegetacao', accent: 'accent-habitat' },
    { label: 'Polinizador', key: 'polinizador', accent: 'accent-habitat' },
    { label: 'Dispersor de sementes', key: 'dispersor_de_sementes', accent: 'accent-habitat' },
    { label: 'Necrófago', key: 'necrofago', accent: 'accent-habitat' },
    { label: 'Decompositor', key: 'decompositor', accent: 'accent-habitat' },
    { label: 'Filtrador', key: 'filtrador', accent: 'accent-habitat' },
    { label: 'Engenheiro do ecossistema', key: 'engenheiro_do_ecossistema', accent: 'accent-habitat' },
    { label: 'Controlador de pragas', key: 'controlador_de_pragas', accent: 'accent-habitat' },
    { label: 'Hospedeiro', key: 'hospedeiro', accent: 'accent-habitat' },
    { label: 'Parasita', key: 'parasita', accent: 'accent-habitat' },
    { label: 'Mutualista', key: 'mutualista', accent: 'accent-habitat' },
    { label: 'Comensal', key: 'comensal', accent: 'accent-habitat' },
    { label: 'Competidor', key: 'competidor', accent: 'accent-habitat' },
    { label: 'Bioindicador', key: 'bioindicador', accent: 'accent-habitat' },
    { label: 'Espécie-chave', key: 'especie_chave', accent: 'accent-habitat' },
    { label: 'Espécie invasora', key: 'especie_invasora', accent: 'accent-habitat' },
    { label: 'Migrador', key: 'migrador', accent: 'accent-habitat' },
    { label: 'Navegador / orientador', key: 'navegador_orientador', accent: 'accent-habitat' },
    { label: 'Construtor de habitat', key: 'construtor_de_habitat', accent: 'accent-habitat' }
];

function makeSvg(body, className = 'general-model-svg ecological-model-svg') {
    return `<svg class="metric-model-svg ${className}" viewBox="0 0 80 80" fill="none" aria-hidden="true">${body}</svg>`;
}

export function normalizeEcologicalFunctionKey(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[()/-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const ecologicalFunctionMap = new Map(
    ecologicalFunctionCatalog.flatMap(item => {
        const entries = [[normalizeEcologicalFunctionKey(item.label), item]];
        if (item.key) entries.push([normalizeEcologicalFunctionKey(item.key.replace(/_/g, ' ')), item]);
        return entries;
    })
);

export function getEcologicalFunctionMeta(value = '') {
    const normalized = normalizeEcologicalFunctionKey(value);
    const match = ecologicalFunctionMap.get(normalized);
    if (match) return { key: match.key, title: match.label, accent: match.accent };
    return { key: 'funcao-ecologica', title: value || 'Função ecológica', accent: 'accent-habitat' };
}

export function getEcologicalFunctionSvg(key = 'funcao-ecologica') {
    const icons = {
        'funcao-ecologica': makeSvg('<circle cx="40" cy="40" r="18"/><path d="M40 22v36"/><path d="M22 40h36"/><path d="M28 28c6 8 18 8 24 0"/><path d="M28 52c6-8 18-8 24 0"/>'),
        predador: makeSvg('<path d="M18 56c6-16 18-27 34-30"/><path d="M52 26l12-8"/><path d="M48 38l18-4"/><path d="M34 58l8-14"/><path d="M44 62l8-16"/><path d="M24 62l4-10"/>'),
        presa: makeSvg('<path d="M18 58c7-18 20-30 37-32"/><circle cx="27" cy="56" r="6"/><circle cx="52" cy="36" r="10"/><circle cx="55" cy="33" r="2.5"/><path d="M59 42l9 8"/>'),
        herbivoro_controlador_vegetacao: makeSvg('<path d="M18 58h44"/><path d="M30 58c0-15 8-27 22-34"/><path d="M38 52c2-10 8-17 18-22"/><path d="M44 30c-8 1-14 7-16 15c8-1 14-7 16-15Z"/><path d="M57 18c-8 1-14 7-16 15c8-1 14-7 16-15Z"/>'),
        polinizador: makeSvg('<circle cx="40" cy="40" r="5"/><circle cx="40" cy="23" r="6"/><circle cx="56" cy="32" r="6"/><circle cx="52" cy="50" r="6"/><circle cx="28" cy="50" r="6"/><circle cx="24" cy="32" r="6"/><path d="M40 45v15"/><path d="M32 60h16"/>'),
        dispersor_de_sementes: makeSvg('<path d="M16 54c10-12 20-19 32-22"/><path d="M48 32l14-10"/><path d="M46 44l18 2"/><path d="M25 60l8-8"/><path d="M42 54c6 0 11 5 11 11c-7 0-11-4-11-11Z"/><path d="M56 50c5 0 9 4 9 9c-6 0-9-3-9-9Z"/>'),
        necrofago: makeSvg('<path d="M18 58h44"/><circle cx="30" cy="34" r="8"/><circle cx="50" cy="34" r="8"/><path d="M30 42v10"/><path d="M50 42v10"/><path d="M24 52h32"/><path d="M14 22l10 10"/><path d="M56 32l10-10"/>'),
        decompositor: makeSvg('<path d="M18 58h44"/><path d="M28 58c0-13 6-22 12-22s12 9 12 22"/><path d="M24 42c4-9 10-14 16-14s12 5 16 14"/><path d="M32 22c0 6 3 9 8 12"/><path d="M48 22c0 6-3 9-8 12"/>'),
        filtrador: makeSvg('<path d="M16 28h48"/><path d="M20 38h40"/><path d="M24 48h32"/><path d="M28 58h24"/><path d="M18 18c7 5 13 5 20 0c7 5 13 5 20 0"/><path d="M18 68c7-5 13-5 20 0c7-5 13-5 20 0"/>'),
        engenheiro_do_ecossistema: makeSvg('<path d="M16 58h48"/><path d="M24 58V34"/><path d="M40 58V22"/><path d="M56 58V30"/><path d="M24 44h16"/><path d="M40 34h16"/><path d="M20 22l8 6"/><path d="M52 18l8 6"/>'),
        controlador_de_pragas: makeSvg('<path d="M40 16l20 8v14c0 13-8 22-20 28c-12-6-20-15-20-28V24l20-8Z"/><path d="M32 34h16"/><path d="M40 26v16"/><path d="M26 48l8-8"/><path d="M54 48l-8-8"/>'),
        hospedeiro: makeSvg('<circle cx="40" cy="30" r="10"/><path d="M24 60c4-10 10-16 16-16s12 6 16 16"/><circle cx="40" cy="30" r="3"/><path d="M34 24l12 12"/><path d="M46 24L34 36"/>'),
        parasita: makeSvg('<path d="M24 20c12 0 18 7 18 18s-6 18-18 18"/><path d="M42 38h14"/><path d="M56 24c6 6 6 22 0 28"/><path d="M24 56l-8 8"/><path d="M24 20l-8-8"/>'),
        mutualista: makeSvg('<circle cx="28" cy="40" r="14"/><circle cx="52" cy="40" r="14"/><path d="M28 40h24"/><path d="M40 28v24"/>'),
        comensal: makeSvg('<circle cx="30" cy="42" r="14"/><circle cx="54" cy="34" r="8"/><path d="M18 58h22"/><path d="M48 46h12"/>'),
        competidor: makeSvg('<path d="M18 58h44"/><path d="M24 46l12-12"/><path d="M36 46L24 34"/><path d="M56 46L44 34"/><path d="M44 46l12-12"/><path d="M40 24v18"/>'),
        bioindicador: makeSvg('<path d="M24 58c0-16 8-28 22-34"/><path d="M46 24c-10 2-17 10-18 20c10-2 17-10 18-20Z"/><path d="M18 58h44"/><path d="M50 52h14"/><path d="M54 46l4 6l6-12"/>'),
        especie_chave: makeSvg('<circle cx="28" cy="36" r="10"/><path d="M38 36h18"/><path d="M56 36v10"/><path d="M48 46h16"/><path d="M28 46v12"/><path d="M22 58h12"/>'),
        especie_invasora: makeSvg('<circle cx="40" cy="40" r="20"/><path d="M24 56l32-32"/><path d="M44 24h12v12"/><path d="M20 20l10 10"/><path d="M50 50l10 10"/>'),
        migrador: makeSvg('<path d="M14 54c12-20 30-30 52-30"/><path d="M53 16l13 8l-13 8"/><path d="M20 62h24"/><path d="M32 50l12 12l-12 12"/>'),
        navegador_orientador: makeSvg('<circle cx="40" cy="40" r="22"/><path d="M40 18v8"/><path d="M40 54v8"/><path d="M18 40h8"/><path d="M54 40h8"/><path d="M30 50l8-20l12 12l-20 8Z"/>'),
        construtor_de_habitat: makeSvg('<path d="M18 58h44"/><path d="M24 58V36l16-12l16 12v22"/><path d="M34 58V44h12v14"/><path d="M24 36l-6-6"/><path d="M56 36l6-6"/>')
    };

    return icons[key] || icons['funcao-ecologica'];
}
