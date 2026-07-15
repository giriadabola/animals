import { ecologicalFunctionCatalog, getEcologicalFunctionMeta, getEcologicalFunctionSvg } from "./ecological-functions.js?v=20260714_ecology_models";
import { locomotionCatalog, getLocomotionMeta, getLocomotionSvg } from "./locomotion-visuals.js";

export const generalVisualOptions = [
    { tipo: 'Vida útil', unidade: 'anos' },
    { tipo: 'Espetativa média de vida', unidade: 'anos' },
    { tipo: 'Velocidade máxima', unidade: 'km/h' },
    { tipo: 'Velocidade média', unidade: 'km/h' },
    { tipo: 'Força da mordida', unidade: 'PSI' },
    { tipo: 'Número de dentes', unidade: '' },
    { tipo: 'Número de mamas', unidade: '' },
    { tipo: 'Termorregulação', unidade: '' },
    { tipo: 'Simetria corporal', unidade: '' },
    { tipo: 'Abertura dos olhos', unidade: 'meses' },
    { tipo: 'Início da marcha', unidade: 'meses' },
    { tipo: 'Início da corrida', unidade: 'meses' },
    { tipo: 'Saída do esconderijo', unidade: 'meses' },
    { tipo: 'Independência', unidade: 'meses' },
    { tipo: 'Início do voo', unidade: 'meses' },
    { tipo: 'Primeira alimentação sólida', unidade: 'meses' },
    { tipo: 'Saída do ninho', unidade: 'meses' },
    { tipo: 'Saída da toca', unidade: 'meses' },
    { tipo: 'Desmame', unidade: 'meses' },
    { tipo: 'Primeira vocalização', unidade: 'meses' },
    { tipo: 'Maturidade física', unidade: 'meses' },
    { tipo: 'Tamanho do grupo social', unidade: 'centenas' },
    { tipo: 'Composição do grupo social', unidade: '' },
    { tipo: 'Composição do grupo', unidade: '' },
    { tipo: 'Tipo de agrupamento social', unidade: '' },
    { tipo: 'Tamanho do território', unidade: 'km²' },
    { tipo: 'Taxa de sucesso da caça', unidade: 'caça individual' },
    { tipo: 'Taxa de mortalidade', unidade: 'mortalidade adulta' },
    { tipo: 'Taxa de mortalidade (cativeiro)', unidade: 'mortalidade adulta' },
    { tipo: 'Altitude mínima', unidade: 'm' },
    { tipo: 'Altitude máxima', unidade: 'm' },
    { tipo: 'Transformações do desenvolvimento', unidade: '' },
    { tipo: 'Número de segmentos', unidade: 'centenas' },
    { tipo: 'Número de patas', unidade: 'centenas' },
    { tipo: 'Número de poros', unidade: 'centenas' },
    { tipo: 'Número de brânquias', unidade: 'centenas' },
    { tipo: 'Número de barbatanas', unidade: 'centenas' },
    { tipo: 'Número de vértebras', unidade: 'centenas' },
    { tipo: 'Número de escamas', unidade: 'centenas' },
    { tipo: 'Número de miômeros', unidade: 'centenas' },
    { tipo: 'Tipo de esqueleto', unidade: '' },
    { tipo: 'Tamanho da População', unidade: 'milhares' },
    { tipo: 'Estratégia para obter alimento', unidade: '' },
    { tipo: 'Atividade', unidade: '' },
    { tipo: 'Vida social', unidade: '' },
    { tipo: 'Organização social', unidade: '' },
    { tipo: 'Liderança e hierarquia', unidade: '' },
    { tipo: 'Parentesco e linhagem social', unidade: '' },
    { tipo: 'Tipo de Comunicação', unidade: '' },
    { tipo: 'Função ecológica', unidade: '' },
    { tipo: 'Locomoção', unidade: '' },
    { tipo: 'Zona Climática', unidade: '' },
    { tipo: 'Bioma', unidade: '' },
    { tipo: 'Estrato ecológico', unidade: '' }
];

export const generalVisualUnits = ['', 'segundos', 'minutos', 'horas', 'dias', 'semanas', 'meses', 'anos', 'milénios', 'km/h', 'm/s', 'PSI', 'indivíduos', 'dezenas', 'centenas', 'milhares', 'milhões', 'machos adultos', 'fêmeas adultas', 'subadultos', 'juvenis', 'crias', 'm²', 'hectares', 'km²', 'caça individual', 'caça em grupo', 'mortalidade adulta', 'mortalidade das crias', 'cm', 'm', 'km', 'unidade'];

const feedingStrategyOptions = [
    'Caça',
    'Perseguição',
    'Emboscada',
    'Mergulho',
    'Pesca',
    'Filtração',
    'Pastoreio',
    'Ramoneio',
    'Escavação',
    'Raspagem',
    'Sucção',
    'Picagem',
    'Coleta',
    'Procura no solo',
    'Procura em árvores',
    'Necrofagia',
    'Parasitismo',
    'Roubo de alimento',
    'Armadilha',
    'Camuflagem',
    'Cooperação em grupo',
    'Migração para alimento',
    'Armazenamento de alimento'
];

const activityCatalog = [
    { label: 'Diurno', key: 'diurno' },
    { label: 'Noturno', key: 'noturno' },
    { label: 'Crepuscular', key: 'crepuscular' },
    { label: 'Matutino', key: 'matutino' },
    { label: 'Vespertino', key: 'vespertino' },
    { label: 'Catemeral', key: 'catemeral' },
    { label: 'Arrítmico', key: 'arritmico' },
    { label: 'Ultradiano', key: 'ultradiano' },
    { label: 'Sazonal', key: 'sazonal' },
    { label: 'Migratório', key: 'migratorio' },
    { label: 'Hibernante', key: 'hibernante' },
    { label: 'Estivante', key: 'estivante' },
    { label: 'Brumante', key: 'brumante' },
    { label: 'Torpidário', key: 'torpidario' },
    { label: 'Subterrâneo/Fossorial', key: 'subterraneo_fossorial' },
    { label: 'Aquático ativo', key: 'aquatico_ativo' },
    { label: 'Arborícola ativo', key: 'arboricola_ativo' },
    { label: 'Terrestre ativo', key: 'terrestre_ativo' },
    { label: 'Aéreo ativo', key: 'aereo_ativo' }
];

const socialCatalog = [
    { label: 'Solitária', key: 'solitaria' },
    { label: 'Social', key: 'social' },
    { label: 'Altamente social', key: 'altamente_social' },
    { label: 'Gregária', key: 'gregaria' },
    { label: 'Semi-social', key: 'semi_social' },
    { label: 'Cooperativa', key: 'cooperativa' },
    { label: 'Comunitária', key: 'comunitaria' },
    { label: 'Familiar', key: 'familiar' },
    { label: 'Territorial', key: 'territorial' },
    { label: 'Tolerante', key: 'tolerante' },
    { label: 'Agregada', key: 'agregada' },
    { label: 'Migratória em grupo', key: 'migratoria_em_grupo' }
];

export const socialTypes = socialCatalog;

const climateZoneOptions = [
    'Tropical',
    'Árido',
    'Temperado',
    'Continental',
    'Polar',
    'Montanhoso'
];

const biomaOptions = [
    'Áreas rochosas',
    'Bosque',
    'Calota de gelo',
    'Caverna',
    'Chaparral',
    'Costa',
    'Duna',
    'Estepe',
    'Fauna urbana',
    'Floresta',
    'Marinho',
    'Marinho (corais)',
    'Matagal',
    'Montanha',
    'Pântano',
    'Pradaria',
    'Savana'
];

const thermoregulationOptions = ['Endotérmico', 'Ectotérmico', 'Heterotérmico', 'Homeotérmico', 'Poiquilotérmico', 'Regionalmente endotérmico'];
const bodySymmetryOptions = ['Bilateral', 'Radial', 'Birradial', 'Assimétrica', 'Pentarradial'];
const developmentTransformationOptions = ['Muda', 'Metamorfose', 'Neotenia', 'Hermafroditismo sequencial', 'Troca de plumagem', 'Troca de pelagem'];
const skeletonTypeOptions = ['Ósseo', 'Cartilagíneo', 'Exoesqueleto', 'Hidroesqueleto', 'Ausente'];

const ecologicalStratumOptions = [
    'Arbustivo',
    'Bentónico',
    'Copa',
    'Litoral',
    'Nerítico',
    'Oceânico',
    'Pelágico',
    'Solo',
    'Subterrâneo'
];

const selectGroups = {
    feedingStrategy: feedingStrategyOptions,
    activity: activityCatalog.map(item => item.label),
    social: socialCatalog.map(item => item.label),
    ecologicalFunction: ecologicalFunctionCatalog.map(item => item.label),
    locomotion: locomotionCatalog.map(item => item.label),
    climateZone: climateZoneOptions,
    bioma: biomaOptions,
    thermoregulation: thermoregulationOptions,
    bodySymmetry: bodySymmetryOptions,
    developmentTransformation: developmentTransformationOptions,
    skeletonType: skeletonTypeOptions,
    ecologicalStratum: ecologicalStratumOptions
};

const anatomicalCategoryMeta = {
    'estruturas gerais do corpo': { key: 'anatomia-corpo-geral', accent: 'accent-length' },
    'estruturas da cabeca e face': { key: 'anatomia-cabeca-face', accent: 'accent-generic' },
    'estruturas bucais e alimentares': { key: 'anatomia-bucal-alimentar', accent: 'accent-generic' },
    'dentes e estruturas semelhantes': { key: 'anatomia-dentes', accent: 'accent-generic' },
    'cornos hastes e protuberancias': { key: 'anatomia-cornos', accent: 'accent-maturity' },
    'cristas pregas bolsas e expansoes': { key: 'anatomia-cristas-pregas', accent: 'accent-wing' },
    'apendices locomotores': { key: 'anatomia-apendices', accent: 'accent-leg' },
    'estruturas de fixacao e aderencia': { key: 'anatomia-fixacao', accent: 'accent-width' },
    'estruturas das patas e extremidades': { key: 'anatomia-patas-extremidades', accent: 'accent-leg' },
    'estruturas da cauda': { key: 'anatomia-cauda', accent: 'accent-tail' },
    'estruturas respiratorias': { key: 'anatomia-respiratoria', accent: 'accent-water' },
    'estruturas aquaticas especiais': { key: 'anatomia-aquatica', accent: 'accent-water' },
    'estruturas sensoriais': { key: 'anatomia-sensorial', accent: 'accent-eye' },
    'estruturas oculares': { key: 'anatomia-ocular', accent: 'accent-eye' },
    'estruturas auditivas e de equilibrio': { key: 'anatomia-auditiva', accent: 'accent-climate' },
    'estruturas de defesa e ataque': { key: 'anatomia-defesa-ataque', accent: 'accent-speed-max' },
    'estruturas produtoras ou inoculadoras de veneno': { key: 'anatomia-veneno', accent: 'accent-generic' },
    'estruturas glandulares': { key: 'anatomia-glandular', accent: 'accent-life' },
    'estruturas produtoras de seda muco ou secrecoes': { key: 'anatomia-secrecoes', accent: 'accent-bioma' },
    'estruturas eletricas luminosas e termicas': { key: 'anatomia-eletrica-luminosa', accent: 'accent-climate' },
    'estruturas de reproducao': { key: 'anatomia-reproducao', accent: 'accent-mating-polygamy' },
    'estruturas de incubacao e cuidado parental': { key: 'anatomia-incubacao', accent: 'accent-life' },
    'estruturas das aves': { key: 'anatomia-aves', accent: 'accent-wing' },
    'estruturas dos mamiferos': { key: 'anatomia-mamiferos', accent: 'accent-life' },
    'estruturas dos repteis e anfibios': { key: 'anatomia-repteis-anfibios', accent: 'accent-width' },
    'estruturas dos artropodes': { key: 'anatomia-artropodes', accent: 'accent-leg' },
    'estruturas dos moluscos': { key: 'anatomia-moluscos', accent: 'accent-bioma' },
    'estruturas dos anelideos': { key: 'anatomia-anelideos', accent: 'accent-tail' },
    'estruturas dos equinodermes': { key: 'anatomia-equinodermes', accent: 'accent-water' },
    'estruturas dos cnidarios': { key: 'anatomia-cnidarios', accent: 'accent-climate' },
    'estruturas dos poriferos': { key: 'anatomia-poriferos', accent: 'accent-bioma' }
};

const uniqueGeneralVisualMeta = {
    'duracao do mergulho': { key: 'duracao-mergulho', accent: 'accent-depth-max' },
    'percentagem de gordura corporal': { key: 'gordura-corporal', accent: 'accent-life' },
    'espessura da camada de gordura': { key: 'camada-gordura', accent: 'accent-width' },
    'tempo a superficie': { key: 'tempo-superficie', accent: 'accent-water' },
    'tempo de recuperacao entre mergulhos': { key: 'recuperacao-mergulhos', accent: 'accent-metabolic-rate' },
    'frequencia de mergulho': { key: 'frequencia-mergulho', accent: 'accent-depth-average' },
    'alcance de detecao': { key: 'alcance-detecao', accent: 'accent-eye' },
    'taxa de emissao de sinais': { key: 'emissao-sinais', accent: 'accent-climate' },
    'organizacao social': { key: 'organizacao-social', accent: 'accent-mating-polygamy' },
    'composicao do grupo': { key: 'composicao-grupo', accent: 'accent-mating-polygamy' },
    'lideranca e hierarquia': { key: 'lideranca-hierarquia', accent: 'accent-mating-polygamy' },
    'parentesco e linhagem social': { key: 'parentesco-linhagem', accent: 'accent-mating-polygamy' },
    'tipo de comunicacao': { key: 'tipo-comunicacao', accent: 'accent-mating-polygamy' },
    'autoinfeccao': { key: 'autoinfeccao', accent: 'accent-generic' },
    'construcao de local de repouso': { key: 'local-repouso', accent: 'accent-bioma' },
    'presenca ausencia de sistema digestivo': { key: 'sistema-digestivo', accent: 'accent-life' },
    'lado corporal da estrutura': { key: 'lado-estrutura', accent: 'accent-width' },
    'forma da estrutura': { key: 'forma-estrutura', accent: 'accent-generic' },
    'tipo de percecao': { key: 'tipo-percecao', accent: 'accent-eye' },
    'capacidade de regeneracao': { key: 'regeneracao', accent: 'accent-life' }
};

const activityMap = new Map(activityCatalog.map(item => [normalizeGeneralVisualKey(item.label), item]));
const socialMap = new Map(socialCatalog.map(item => [normalizeGeneralVisualKey(item.label), item]));

export function normalizeGeneralVisualKey(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[()/]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function getGeneralVisualOption(type = '') {
    return generalVisualOptions.find(option => option.tipo === type);
}

export function getGeneralVisualSelectConfig(type = '') {
    const normalized = normalizeGeneralVisualKey(type);
    if (normalized.includes('estrategia')) return { group: 'feedingStrategy', placeholder: 'Escolhe uma estratégia' };
    if (normalized.includes('atividade')) return { group: 'activity', placeholder: 'Escolhe um tipo de atividade' };
    if (normalized.includes('vida social')) return { group: 'social', placeholder: 'Escolhe um tipo de vida social' };
    if (normalized.includes('funcao ecologica')) return { group: 'ecologicalFunction', placeholder: 'Escolhe uma função ecológica' };
    if (normalized.includes('locomocao')) return { group: 'locomotion', placeholder: 'Escolhe um tipo de locomoção' };
    if (normalized.includes('zona climatica')) return { group: 'climateZone', placeholder: 'Escolhe uma zona climática' };
    if (normalized.includes('bioma')) return { group: 'bioma', placeholder: 'Escolhe um bioma' };
    if (normalized.includes('termorregulacao')) return { group: 'thermoregulation', placeholder: 'Escolhe a termorregulação' };
    if (normalized.includes('simetria corporal')) return { group: 'bodySymmetry', placeholder: 'Escolhe a simetria corporal' };
    if (normalized.includes('transformacoes do desenvolvimento')) return { group: 'developmentTransformation', placeholder: 'Escolhe a transformação do desenvolvimento' };
    if (normalized.includes('tipo de esqueleto')) return { group: 'skeletonType', placeholder: 'Escolhe o tipo de esqueleto' };
    if (normalized.includes('estrato ecologico')) return { group: 'ecologicalStratum', placeholder: 'Escolhe um estrato ecológico' };
    return null;
}

export function getGeneralVisualSelectOptions(type = '') {
    const config = getGeneralVisualSelectConfig(type);
    if (!config) return [];
    return selectGroups[config.group] || [];
}

export function isDropdownOnlyGeneralModel(type = '') {
    return !!getGeneralVisualSelectConfig(type);
}

export function getGeneralVisualMeta(type = '') {
    const normalized = normalizeGeneralVisualKey(type);
    const anatomicalMeta = anatomicalCategoryMeta[normalized];
    if (anatomicalMeta) {
        return { key: anatomicalMeta.key, title: type || 'Estrutura anatómica', accent: anatomicalMeta.accent };
    }
    const uniqueMeta = uniqueGeneralVisualMeta[normalized];
    if (uniqueMeta) {
        return { key: uniqueMeta.key, title: type || 'Modelo visual', accent: uniqueMeta.accent };
    }
    if (normalized.includes('espetativa media de vida') || normalized.includes('expectativa media de vida')) {
        return { key: 'espetativa-vida', title: type || 'Espetativa média de vida', accent: 'accent-life' };
    }
    if (normalized.includes('vida')) return { key: 'vida', title: type || 'Vida útil', accent: 'accent-life' };
    if (normalized.includes('maxima')) return { key: 'velocidade-maxima', title: type || 'Velocidade máxima', accent: 'accent-speed-max' };
    if (normalized.includes('media')) return { key: 'velocidade-media', title: type || 'Velocidade média', accent: 'accent-speed-average' };
    if (normalized.includes('mordida')) return { key: 'forca-mordida', title: type || 'Força da mordida', accent: 'accent-generic' };
    if (normalized.includes('dentes')) return { key: 'numero-dentes', title: type || 'Número de dentes', accent: 'accent-generic' };
    if (normalized.includes('mamas')) return { key: 'numero-mamas', title: type || 'Número de mamas', accent: 'accent-life' };
    if (normalized.includes('termorregulacao')) return { key: 'termorregulacao', title: type || 'Termorregulação', accent: 'accent-metabolic-rate' };
    if (normalized.includes('simetria corporal')) return { key: 'simetria-corporal', title: type || 'Simetria corporal', accent: 'accent-width' };
    if (normalized.includes('transformacoes do desenvolvimento')) return { key: 'transformacoes-desenvolvimento', title: type || 'Transformações do desenvolvimento', accent: 'accent-wing' };
    if (normalized.includes('numero de segmentos')) return { key: 'numero-segmentos', title: type || 'Número de segmentos', accent: 'accent-tail' };
    if (normalized.includes('numero de patas')) return { key: 'numero-patas', title: type || 'Número de patas', accent: 'accent-leg' };
    if (normalized.includes('numero de poros')) return { key: 'numero-poros', title: type || 'Número de poros', accent: 'accent-generic' };
    if (normalized.includes('numero de branquias')) return { key: 'numero-branquias', title: type || 'Número de brânquias', accent: 'accent-water' };
    if (normalized.includes('numero de barbatanas')) return { key: 'numero-barbatanas', title: type || 'Número de barbatanas', accent: 'accent-wing' };
    if (normalized.includes('numero de vertebras')) return { key: 'numero-vertebras', title: type || 'Número de vértebras', accent: 'accent-length' };
    if (normalized.includes('numero de escamas')) return { key: 'numero-escamas', title: type || 'Número de escamas', accent: 'accent-width' };
    if (normalized.includes('numero de miomeros')) return { key: 'numero-miomeros', title: type || 'Número de miômeros', accent: 'accent-speed-average' };
    if (normalized.includes('tipo de esqueleto')) return { key: 'tipo-esqueleto', title: type || 'Tipo de esqueleto', accent: 'accent-generic' };
    if (normalized.includes('estrato ecologico')) return { key: 'estrato-ecologico', title: type || 'Estrato ecológico', accent: 'accent-bioma' };
    if (normalized.includes('altitude minima')) return { key: 'altitude-minima', title: type || 'Altitude mínima', accent: 'accent-depth-average' };
    if (normalized.includes('altitude maxima')) return { key: 'altitude-maxima', title: type || 'Altitude máxima', accent: 'accent-depth-max' };
    if (normalized.includes('abertura dos olhos')) return { key: 'abertura-olhos', title: type || 'Abertura dos olhos', accent: 'accent-eye' };
    if (normalized.includes('inicio da marcha')) return { key: 'inicio-marcha', title: type || 'Início da marcha', accent: 'accent-leg' };
    if (normalized.includes('inicio da corrida')) return { key: 'inicio-corrida', title: type || 'Início da corrida', accent: 'accent-speed-average' };
    if (normalized.includes('saida do esconderijo')) return { key: 'saida-esconderijo', title: type || 'Saída do esconderijo', accent: 'accent-depth-average' };
    if (normalized.includes('independencia')) return { key: 'independencia', title: type || 'Independência', accent: 'accent-life' };
    if (normalized.includes('inicio do voo')) return { key: 'inicio-voo', title: type || 'Início do voo', accent: 'accent-speed-max' };
    if (normalized.includes('primeira alimentacao solida')) return { key: 'primeira-alimentacao-solida', title: type || 'Primeira alimentação sólida', accent: 'accent-bioma' };
    if (normalized.includes('saida do ninho')) return { key: 'saida-ninho', title: type || 'Saída do ninho', accent: 'accent-width' };
    if (normalized.includes('saida da toca')) return { key: 'saida-toca', title: type || 'Saída da toca', accent: 'accent-depth-average' };
    if (normalized.includes('desmame')) return { key: 'desmame', title: type || 'Desmame', accent: 'accent-life' };
    if (normalized.includes('primeira vocalizacao')) return { key: 'primeira-vocalizacao', title: type || 'Primeira vocalização', accent: 'accent-climate' };
    if (normalized.includes('maturidade fisica')) return { key: 'maturidade-fisica', title: type || 'Maturidade física', accent: 'accent-maturity' };
    if (normalized.includes('composicao do grupo social')) return { key: 'composicao-grupo-social', title: 'Composição do grupo social', accent: 'accent-mating-polygamy' };
    if (normalized.includes('tipo de agrupamento social')) return { key: 'tipo-agrupamento-social', title: 'Tipo de agrupamento social', accent: 'accent-mating-polygamy' };
    if (normalized.includes('tamanho do grupo social')) return { key: 'tamanho-grupo-social', title: type || 'Tamanho do grupo social', accent: 'accent-mating-polygamy' };
    if (normalized.includes('taxa de sucesso da caca')) return { key: 'sucesso-caca', title: type || 'Taxa de sucesso da caça', accent: 'accent-speed-max' };
    if (normalized.includes('taxa de mortalidade') && normalized.includes('cativeiro')) return { key: 'mortalidade-cativeiro', title: type || 'Taxa de mortalidade (cativeiro)', accent: 'accent-life' };
    if (normalized.includes('taxa de mortalidade')) return { key: 'mortalidade', title: type || 'Taxa de mortalidade', accent: 'accent-generic' };
    if (normalized.includes('tamanho do territorio')) return { key: 'tamanho-territorio', title: type || 'Tamanho do território', accent: 'accent-bioma' };
    if (normalized.includes('tamanho') && normalized.includes('popul')) return { key: 'populacao', title: type || 'Tamanho da População', accent: 'accent-generic' };
    if (normalized.includes('estrategia')) return { key: 'estrategia', title: type || 'Estratégia para obter alimento', accent: 'accent-generic' };
    if (normalized.includes('atividade')) return { key: 'atividade', title: type || 'Atividade', accent: 'accent-climate' };
    if (normalized.includes('vida social')) return { key: 'vida-social', title: 'Vida social', accent: 'accent-mating-polygamy' };
    if (normalized.includes('funcao ecologica')) return { key: 'funcao-ecologica', title: type || 'Função ecológica', accent: 'accent-bioma' };
    if (normalized.includes('locomocao')) return { key: 'locomocao', title: type || 'Locomoção', accent: 'accent-climate' };
    if (normalized.includes('zona')) return { key: 'zona-climatica', title: type || 'Zona Climática', accent: 'accent-climate' };
    if (normalized.includes('bioma')) return { key: 'bioma', title: type || 'Bioma', accent: 'accent-bioma' };
    return { key: 'geral', title: type || 'Modelo geral', accent: 'accent-generic' };
}

function makeSvg(body, className = 'general-model-svg') {
    return `<svg class="metric-model-svg ${className}" viewBox="0 0 80 80" fill="none" aria-hidden="true">${body}</svg>`;
}

export function getGeneralModelSvg(key = 'geral') {
    const icons = {
        'duracao-mergulho': makeSvg('<path d="M16 52c8-12 16-18 24-18s16 6 24 18"/><path d="M16 58h48"/><circle cx="56" cy="24" r="10"/><path d="M56 24v-5"/><path d="M56 24l4 3"/><path d="M26 30c4 3 8 3 12 0"/>'),
        'gordura-corporal': makeSvg('<path d="M28 18c8 0 12 7 12 14v16c0 8-5 14-12 14s-12-6-12-14V32c0-7 4-14 12-14Z"/><path d="M48 22c7 0 12 5 12 12v12c0 7-5 12-12 12"/><path d="M28 34h12"/><path d="M26 50c6-5 10-5 16 0"/><path d="M54 28l6 20"/><path d="M61 28l-14 20"/>'),
        'camada-gordura': makeSvg('<path d="M14 24c8-10 44-10 52 0"/><path d="M14 38c8-10 44-10 52 0"/><path d="M14 52c8-10 44-10 52 0"/><path d="M20 30h40"/><path d="M20 44h40"/><path d="M20 58h40"/>'),
        'tempo-superficie': makeSvg('<path d="M14 26c8-6 16-6 24 0s16 6 24 0"/><path d="M18 58h44"/><path d="M40 52V26"/><path d="M33 34l7-8l7 8"/><circle cx="54" cy="48" r="7"/>'),
        'recuperacao-mergulhos': makeSvg('<path d="M16 56h48"/><path d="M18 34c4-8 10-12 18-12c6 0 10 3 14 8c3-5 7-8 13-8c7 0 13 5 13 13c0 8-7 13-15 19"/><path d="M25 42c0 8 6 14 15 20"/><path d="M52 16c6 1 11 6 12 12"/><path d="M61 14l4 4l-5 3"/>'),
        'frequencia-mergulho': makeSvg('<path d="M16 22c8-6 16-6 24 0s16 6 24 0"/><path d="M16 40c8-6 16-6 24 0s16 6 24 0"/><path d="M16 58c8-6 16-6 24 0s16 6 24 0"/><path d="M26 16v12"/><path d="M50 34v12"/><path d="M38 52v12"/>'),
        'alcance-detecao': makeSvg('<circle cx="40" cy="40" r="6"/><path d="M40 12v10M12 40h10M58 40h10M40 58v10"/><path d="M24 40a16 16 0 0 1 16-16"/><path d="M56 40a16 16 0 0 0-16-16"/><path d="M18 40a22 22 0 0 1 22-22"/><path d="M62 40a22 22 0 0 0-22-22"/>'),
        'emissao-sinais': makeSvg('<circle cx="24" cy="40" r="6"/><path d="M32 40h10"/><path d="M46 30c6 4 10 10 10 18"/><path d="M46 50c6-4 10-10 10-18"/><path d="M54 24c9 6 14 15 14 26"/><path d="M54 56c9-6 14-15 14-26"/>'),
        'organizacao-social': makeSvg('<circle cx="22" cy="28" r="6"/><circle cx="40" cy="20" r="7"/><circle cx="58" cy="28" r="6"/><circle cx="31" cy="50" r="6"/><circle cx="49" cy="50" r="6"/><path d="M22 34l9 10l9-17l18 7"/><path d="M31 50h18"/>'),
        autoinfeccao: makeSvg('<circle cx="40" cy="40" r="16"/><path d="M40 24c7 0 13 5 15 12"/><path d="M54 28l3 8l-8 1"/><path d="M40 56c-7 0-13-5-15-12"/><path d="M26 52l-3-8l8-1"/><path d="M36 36c2-3 6-4 9-2c3 2 4 6 2 9c-2 3-6 4-9 2c-3-2-4-6-2-9Z"/>'),
        'local-repouso': makeSvg('<path d="M14 54c8-12 17-18 26-18s18 6 26 18"/><path d="M20 54h40"/><path d="M24 42l6-10l8 8l8-12l10 14"/><path d="M18 58h44"/>'),
        'sistema-digestivo': makeSvg('<path d="M33 14c-4 4-5 8-4 12c1 4 4 6 4 10v8c0 7-4 12-10 16"/><path d="M47 14c4 4 5 8 4 12c-1 4-4 6-4 10v10c0 8 5 12 10 14"/><path d="M33 36h14"/><path d="M28 58c4-3 8-4 12-4s8 1 12 4"/>'),
        'lado-estrutura': makeSvg('<path d="M40 12v56"/><path d="M24 24c6-4 10-4 16 0v32c-6-4-10-4-16 0Z"/><path d="M56 24c-6-4-10-4-16 0v32c6-4 10-4 16 0Z"/><path d="M18 40h8M54 40h8"/>'),
        'forma-estrutura': makeSvg('<path d="M16 56c0-12 8-20 20-20"/><path d="M44 20h18v18H44Z"/><path d="M50 42c6 0 10 4 10 10s-4 10-10 10s-10-4-10-10s4-10 10-10Z"/><path d="M20 22l14 14l-14 14"/>'),
        'tipo-percecao': makeSvg('<path d="M12 40c8-13 18-20 28-20s20 7 28 20c-8 13-18 20-28 20S20 53 12 40Z"/><circle cx="40" cy="40" r="8"/><path d="M58 20l8-8M60 32h10M58 44l8 8"/>'),
        regeneracao: makeSvg('<path d="M24 56c8-16 18-24 30-24"/><path d="M46 20c8 2 14 8 16 16"/><path d="M54 16l8 4l-5 7"/><path d="M22 50c2-6 7-10 14-10"/><path d="M20 60l6-8l6 6"/><path d="M34 52c4 4 8 4 12 0"/>'),
        'anatomia-corpo-geral': makeSvg('<path d="M20 20h40v40H20Z"/><path d="M30 12v16M50 12v16M30 52v16M50 52v16"/><path d="M20 40h40"/>'),
        'anatomia-cabeca-face': makeSvg('<circle cx="40" cy="32" r="18"/><path d="M32 30h4M44 30h4"/><path d="M34 42c4 3 8 3 12 0"/><path d="M24 56c4-7 10-11 16-11s12 4 16 11"/>'),
        'anatomia-bucal-alimentar': makeSvg('<path d="M18 34c0-8 10-14 22-14s22 6 22 14v6H18Z"/><path d="M22 40h36"/><path d="M26 46l6 10M54 46l-6 10"/><path d="M40 20v12"/>'),
        'anatomia-dentes': makeSvg('<path d="M18 30c0-7 10-12 22-12s22 5 22 12v7H18v-7Z"/><path d="M18 49c0 7 10 13 22 13s22-6 22-13v-7H18v7Z"/><path d="M24 37v8M32 37v10M40 37v10M48 37v10M56 37v8"/>'),
        'anatomia-cornos': makeSvg('<path d="M24 56c2-18 8-28 16-28s14 10 16 28"/><path d="M26 28c-6-5-8-11-8-18"/><path d="M54 28c6-5 8-11 8-18"/><path d="M18 10c6 2 10 7 12 14"/><path d="M62 10c-6 2-10 7-12 14"/>'),
        'anatomia-cristas-pregas': makeSvg('<path d="M18 58h44"/><path d="M24 58c2-18 8-30 16-36c8 6 14 18 16 36"/><path d="M28 28l6-10l6 10l6-10l6 10"/><path d="M40 22V12"/>'),
        'anatomia-apendices': makeSvg('<path d="M40 18v44"/><path d="M40 30L20 20"/><path d="M40 30l20-10"/><path d="M40 46L22 58"/><path d="M40 46l18 12"/>'),
        'anatomia-fixacao': makeSvg('<circle cx="40" cy="40" r="18"/><path d="M40 22v36"/><path d="M22 40h36"/><path d="M28 28l24 24"/><path d="M52 28L28 52"/>'),
        'anatomia-patas-extremidades': makeSvg('<path d="M18 58h44"/><path d="M28 24v20M40 18v26M52 24v20"/><path d="M24 58l4-10l4 10"/><path d="M36 58l4-12l4 12"/><path d="M48 58l4-10l4 10"/>'),
        'anatomia-cauda': makeSvg('<path d="M16 40c12-12 24-16 36-14"/><path d="M52 26c8 4 12 10 12 18s-4 14-12 18"/><path d="M20 52c12 2 24-2 36-14"/><path d="M56 30l8-8M56 50l8 8"/>'),
        'anatomia-respiratoria': makeSvg('<path d="M28 18v22c0 10 5 18 12 22"/><path d="M52 18v22c0 10-5 18-12 22"/><path d="M28 24c-8 3-12 10-12 18s4 15 12 18"/><path d="M52 24c8 3 12 10 12 18s-4 15-12 18"/>'),
        'anatomia-aquatica': makeSvg('<path d="M14 40c14-16 33-20 48-7l7-10v34l-7-10c-15 13-34 9-48-7Z"/><circle cx="33" cy="35" r="3"/><path d="M20 60c5-4 10-4 15 0c5-4 10-4 15 0c5-4 10-4 15 0"/>'),
        'anatomia-sensorial': makeSvg('<path d="M14 40c8-13 18-20 26-20s18 7 26 20c-8 13-18 20-26 20S22 53 14 40Z"/><circle cx="40" cy="40" r="8"/><path d="M40 10v10M10 40h10M60 40h10"/>'),
        'anatomia-ocular': makeSvg('<path d="M12 40c8-13 18-20 28-20s20 7 28 20c-8 13-18 20-28 20S20 53 12 40Z"/><circle cx="40" cy="40" r="10"/><circle cx="40" cy="40" r="4"/>'),
        'anatomia-auditiva': makeSvg('<path d="M28 22c-6 2-10 8-10 16v8c0 8 4 14 10 16"/><path d="M52 22c6 2 10 8 10 16v8c0 8-4 14-10 16"/><path d="M28 40h10"/><path d="M52 40H42"/><circle cx="40" cy="40" r="6"/>'),
        'anatomia-defesa-ataque': makeSvg('<path d="M18 58l20-40l6 14l18-10l-14 28l-10-4l-6 12Z"/><path d="M18 58h18"/><path d="M50 18l12 4"/>'),
        'anatomia-veneno': makeSvg('<path d="M40 14c10 10 16 20 16 31c0 13-7 21-16 21s-16-8-16-21c0-11 6-21 16-31Z"/><path d="M40 26v20"/><path d="M32 38h16"/><path d="M48 14l8-8"/>'),
        'anatomia-glandular': makeSvg('<path d="M24 24c8 0 14 6 14 14s-6 14-14 14s-14-6-14-14s6-14 14-14Z"/><path d="M56 28c6 0 10 5 10 10s-4 10-10 10"/><path d="M24 52v12"/><path d="M56 48v16"/><path d="M34 38h18"/>'),
        'anatomia-secrecoes': makeSvg('<path d="M24 18c8 0 14 6 14 14c0 10-14 24-14 24S10 42 10 32c0-8 6-14 14-14Z"/><path d="M54 24c6 0 10 5 10 10c0 8-10 18-10 18S44 42 44 34c0-5 4-10 10-10Z"/><path d="M24 58v8M54 54v12"/>'),
        'anatomia-eletrica-luminosa': makeSvg('<path d="M36 12L20 42h12l-4 26l20-34H36Z"/><circle cx="58" cy="24" r="6"/><path d="M58 12v4M58 32v4M46 24h4M66 24h4"/>'),
        'anatomia-reproducao': makeSvg('<circle cx="30" cy="30" r="8"/><circle cx="50" cy="30" r="8"/><path d="M30 38v12"/><path d="M50 38v12"/><path d="M24 56c3-5 7-8 12-8"/><path d="M56 56c-3-5-7-8-12-8"/><path d="M38 30h4"/>'),
        'anatomia-incubacao': makeSvg('<path d="M18 54c8-14 16-20 22-20s14 6 22 20"/><path d="M22 54h36"/><ellipse cx="40" cy="42" rx="8" ry="10"/><path d="M40 18v8"/>'),
        'anatomia-aves': makeSvg('<path d="M14 50c14-24 30-34 52-36c-4 22-16 37-38 48H14Z"/><path d="M30 28c6 8 10 18 12 28"/><path d="M46 22c5 7 7 14 8 24"/>'),
        'anatomia-mamiferos': makeSvg('<path d="M18 54c2-16 10-26 22-26s20 10 22 26"/><circle cx="28" cy="24" r="6"/><circle cx="52" cy="24" r="6"/><path d="M24 58l4-10l4 10"/><path d="M48 58l4-10l4 10"/>'),
        'anatomia-repteis-anfibios': makeSvg('<path d="M14 44c10-12 24-18 40-14c6 2 10 6 12 10c-2 4-6 8-12 10c-16 4-30-2-40-14Z"/><path d="M26 34l-6-8M26 46l-6 8"/><path d="M54 38l10-4"/>'),
        'anatomia-artropodes': makeSvg('<path d="M26 22h28l8 18l-8 18H26l-8-18Z"/><path d="M24 30L12 20M22 40H8M24 50L12 60M56 30l12-10M58 40h14M56 50l12 10"/>'),
        'anatomia-moluscos': makeSvg('<path d="M24 58c0-22 8-36 24-36c10 0 18 8 18 18c0 12-10 18-18 18Z"/><path d="M30 52c4-8 12-14 24-14"/><path d="M26 40c6-10 14-16 24-16"/>'),
        'anatomia-anelideos': makeSvg('<path d="M16 42c8-12 16-18 24-18s16 6 24 18c-8 12-16 18-24 18S24 54 16 42Z"/><path d="M24 32v20M34 28v24M46 28v24M56 32v20"/>'),
        'anatomia-equinodermes': makeSvg('<path d="M40 14l7 16l17 2l-13 11l4 17l-15-9l-15 9l4-17l-13-11l17-2Z"/>'),
        'anatomia-cnidarios': makeSvg('<path d="M28 20c8 0 14 6 14 14v8c0 8-6 14-14 14"/><path d="M52 20c-8 0-14 6-14 14v8c0 8 6 14 14 14"/><path d="M28 56c0 6-3 10-6 14M36 56c0 6-1 10-1 14M44 56c0 6 1 10 1 14M52 56c0 6 3 10 6 14"/>'),
        'anatomia-poriferos': makeSvg('<path d="M26 18h28l6 14v18l-6 14H26l-6-14V32Z"/><circle cx="40" cy="24" r="3"/><circle cx="32" cy="36" r="3"/><circle cx="48" cy="36" r="3"/><circle cx="40" cy="50" r="4"/>'),
        'altitude-minima': makeSvg('<path d="M10 62h60"/><path d="M18 58l17-27l10 15l8-12l15 24"/><path d="M18 69h24"/><path d="M30 65v8"/><path d="M15 69l6-4v8Z"/>'),
        'altitude-maxima': makeSvg('<path d="M10 62h60"/><path d="M18 58l17-27l10 15l8-12l15 24"/><path d="M48 16v22"/><path d="M44 20l4-6l4 6"/>'),
        'transformacoes-desenvolvimento': makeSvg('<path d="M18 48c8-15 20-22 36-19"/><path d="M49 22l8 7l-9 5"/><circle cx="23" cy="25" r="7"/><path d="M43 52c6 9 16 11 24 4"/><path d="M50 61l-8 5"/><path d="M31 43c4 4 8 7 13 8"/>'),
        'numero-segmentos': makeSvg('<path d="M14 40h52"/><path d="M20 28v24M30 25v30M40 23v34M50 25v30M60 28v24"/><path d="M14 34c8-10 44-10 52 0M14 46c8 10 44 10 52 0"/>'),
        'numero-patas': makeSvg('<path d="M30 22h20l7 18l-7 18H30l-7-18Z"/><path d="M28 30L14 18M25 40H10M28 50L14 62M52 30l14-12M55 40h15M52 50l14 12"/>'),
        'numero-poros': makeSvg('<circle cx="40" cy="40" r="25"/><circle cx="29" cy="29" r="3"/><circle cx="45" cy="27" r="3"/><circle cx="54" cy="40" r="3"/><circle cx="42" cy="48" r="3"/><circle cx="27" cy="49" r="3"/>'),
        'numero-branquias': makeSvg('<path d="M18 40c9-14 24-20 40-12c-8 4-12 12-12 24c-12 4-22 0-28-12Z"/><path d="M46 31c7 3 12 8 16 15M42 36c7 3 12 8 15 14M40 43c6 2 10 6 13 11"/>'),
        'numero-barbatanas': makeSvg('<path d="M13 40c14-16 33-20 48-7l7-10v34l-7-10c-15 13-34 9-48-7Z"/><path d="M35 31l5-13l8 15M36 49l5 13l8-15"/>'),
        'numero-vertebras': makeSvg('<path d="M16 40h48"/><rect x="18" y="32" width="8" height="16" rx="3"/><rect x="29" y="31" width="8" height="18" rx="3"/><rect x="40" y="31" width="8" height="18" rx="3"/><rect x="51" y="32" width="8" height="16" rx="3"/>'),
        'numero-escamas': makeSvg('<path d="M13 40c14-16 33-20 48-7l7-10v34l-7-10c-15 13-34 9-48-7Z"/><path d="M25 34c3 4 3 8 0 12M35 31c4 6 4 12 0 18M46 31c4 6 4 12 0 18M56 34c3 4 3 8 0 12"/>'),
        'numero-miomeros': makeSvg('<path d="M12 40c14-17 35-20 52-8l6-9v34l-6-9c-17 12-38 9-52-8Z"/><path d="M24 30l7 10l-7 10M34 27l8 13l-8 13M45 27l8 13l-8 13M56 31l6 9l-6 9"/>'),
        'tipo-esqueleto': makeSvg('<circle cx="29" cy="26" r="8"/><circle cx="51" cy="26" r="8"/><path d="M35 31l10 18M45 31L35 49M29 34v30M51 34v30M24 47h32M24 64h32"/>'),
        vida: makeSvg('<path d="M28 10h24"/><path d="M28 70h24"/><path d="M31 10c0 15 18 16 18 30S31 55 31 70"/><path d="M49 10c0 15-18 16-18 30s18 15 18 30"/><path d="M34 53h12"/><path d="M37 59h6"/>'),
        'espetativa-vida': makeSvg('<path d="M40 16c-13 0-24 11-24 24s11 24 24 24s24-11 24-24S53 16 40 16Z"/><path d="M40 26v15l10 6"/><path d="M24 14l-6-6"/><path d="M56 14l6-6"/><path d="M18 66l8-8"/><path d="M62 58l-8-8"/>'),
        'velocidade-maxima': makeSvg('<path d="M14 58a26 26 0 0 1 52 0"/><path d="M24 58h32"/><path d="M40 58l18-24"/><path d="M28 30l-5-6"/><path d="M52 30l5-6"/><path d="M40 24v-9"/><path d="M61 58h7"/>'),
        'velocidade-media': makeSvg('<path d="M13 58a27 27 0 0 1 54 0"/><path d="M22 58h36"/><path d="M40 58l8-18"/><path d="M23 43h8"/><path d="M49 43h8"/><path d="M30 28l-4-7"/><path d="M50 28l4-7"/>'),
        'forca-mordida': makeSvg('<path d="M20 30c0-6 10-10 20-10s20 4 20 10v6H20v-6z"/><path d="M20 50c0 6 10 10 20 10s20-4 20-10v-6H20v6z"/><path d="M28 30l2 6M36 30l1 6M44 30l-1 6M52 30l-2 6"/><path d="M28 50l2-6M36 50l1-6M44 50l-1-6M52 50l-2-6"/>'),
        'numero-dentes': makeSvg('<path d="M18 30c0-7 10-12 22-12s22 5 22 12v7H18v-7Z"/><path d="M18 49c0 7 10 13 22 13s22-6 22-13v-7H18v7Z"/><path d="M24 37v8"/><path d="M32 37v10"/><path d="M40 37v10"/><path d="M48 37v10"/><path d="M56 37v8"/>'),
        'numero-mamas': makeSvg('<path d="M24 18c9 0 16 7 16 16v12c0 9-7 16-16 16S8 55 8 46V34c0-9 7-16 16-16Z"/><path d="M56 18c9 0 16 7 16 16v12c0 9-7 16-16 16S40 55 40 46V34c0-9 7-16 16-16Z"/><circle cx="24" cy="43" r="4"/><circle cx="56" cy="43" r="4"/><path d="M32 18c4-5 12-5 16 0"/>'),
        'estrato-ecologico': makeSvg('<path d="M14 64h52"/><path d="M20 64V48l9-8l9 8v16"/><path d="M42 64V31l10-9l10 9v33"/><path d="M25 39V23"/><path d="M18 30c2-9 8-14 16-14s14 5 16 14"/><path d="M46 22c1-8 6-13 14-13s13 5 14 13"/>'),
        termorregulacao: makeSvg('<path d="M35 16a7 7 0 0 1 14 0v28a16 16 0 1 1-14 0V16Z"/><path d="M42 24v27"/><circle cx="42" cy="57" r="7"/><path d="M56 21h10M56 31h7M56 41h10"/>'),
        'simetria-corporal': makeSvg('<path d="M40 10v60"/><path d="M40 18c-13 4-22 15-22 28s9 22 22 26"/><path d="M40 18c13 4 22 15 22 28s-9 22-22 26"/><path d="M27 34l13 6l13-6"/><path d="M27 55l13-6l13 6"/>'),
        'abertura-olhos': makeSvg('<path d="M12 40c8-13 18-20 28-20s20 7 28 20c-8 13-18 20-28 20S20 53 12 40Z"/><circle cx="40" cy="40" r="9"/><path d="M40 31v18"/>'),
        'inicio-marcha': makeSvg('<path d="M18 61h44"/><circle cx="30" cy="24" r="8"/><path d="M30 32l8 12l-7 17"/><path d="M38 44l13-7"/><path d="M38 44l12 13"/>'),
        'inicio-corrida': makeSvg('<path d="M12 61h56"/><circle cx="35" cy="21" r="7"/><path d="M35 28l8 13l-12 8"/><path d="M43 41l16-6"/><path d="M31 49l-13 11"/><path d="M43 42l10 18"/><path d="M16 29h12M10 38h15"/>'),
        'saida-esconderijo': makeSvg('<path d="M12 62h56"/><path d="M20 62V26h40v36"/><path d="M28 62V38h24v24"/><circle cx="40" cy="49" r="6"/><path d="M52 30l12-8M56 38h12"/>'),
        independencia: makeSvg('<circle cx="27" cy="28" r="8"/><circle cx="53" cy="28" r="8"/><path d="M18 59c2-10 8-16 17-16"/><path d="M62 59c-2-10-8-16-17-16"/><path d="M34 40l12 0"/><path d="M40 34v12"/>'),
        'inicio-voo': makeSvg('<path d="M12 46c10-2 18-8 28-20c10 12 18 18 28 20"/><path d="M40 26v34"/><path d="M28 40l12 8l12-8"/><path d="M18 58h44"/>'),
        'primeira-alimentacao-solida': makeSvg('<path d="M16 54h48"/><path d="M22 54c2-14 10-24 18-24s16 10 18 24"/><path d="M40 30V18"/><path d="M34 22h12"/><circle cx="31" cy="45" r="3"/><circle cx="40" cy="40" r="3"/><circle cx="49" cy="45" r="3"/>'),
        'saida-ninho': makeSvg('<path d="M14 58c8-16 18-24 26-24s18 8 26 24"/><path d="M20 58h40"/><path d="M40 34V18"/><path d="M40 18l10 8"/><path d="M40 18l-10 8"/>'),
        'saida-toca': makeSvg('<path d="M10 62h60"/><path d="M18 62c2-20 12-32 22-32s20 12 22 32"/><circle cx="40" cy="48" r="7"/><path d="M50 24l10-8"/>'),
        desmame: makeSvg('<path d="M20 22c10 0 20 8 20 20s-10 20-20 20"/><path d="M60 22c-10 0-20 8-20 20s10 20 20 20"/><path d="M40 18v44"/><path d="M31 35l18 10"/><path d="M49 35L31 45"/>'),
        'primeira-vocalizacao': makeSvg('<path d="M18 32h12l12-10v36L30 48H18z"/><path d="M50 30c6 5 6 15 0 20"/><path d="M58 24c10 9 10 23 0 32"/>'),
        'maturidade-fisica': makeSvg('<circle cx="40" cy="20" r="8"/><path d="M40 28v18"/><path d="M24 38h32"/><path d="M40 46l-14 18"/><path d="M40 46l14 18"/><path d="M18 16h10M52 16h10"/>'),
        'tamanho-grupo-social': makeSvg('<circle cx="24" cy="30" r="6"/><circle cx="40" cy="22" r="7"/><circle cx="56" cy="30" r="6"/><path d="M12 60c2-10 8-16 16-16"/><path d="M68 60c-2-10-8-16-16-16"/><path d="M24 60c2-12 8-20 16-20s14 8 16 20"/><path d="M12 68h56"/>'),
        'composicao-grupo-social': makeSvg('<circle cx="20" cy="28" r="5"/><circle cx="34" cy="22" r="6"/><circle cx="48" cy="28" r="5"/><circle cx="60" cy="34" r="4"/><path d="M10 58c2-9 7-14 14-14"/><path d="M22 60c2-11 8-18 16-18"/><path d="M38 60c2-9 7-14 14-14"/><path d="M52 60c1-7 5-11 10-11"/>'),
        'sucesso-caca': makeSvg('<path d="M40 12v10M40 58v10M12 40h10M58 40h10"/><circle cx="40" cy="40" r="21"/><circle cx="40" cy="40" r="11"/><path d="M40 40l18-18"/><path d="M51 22h7v7"/>'),
        mortalidade: makeSvg('<path d="M18 18l44 44M62 18L18 62"/><circle cx="40" cy="40" r="25"/><path d="M28 32h24M28 48h24"/>'),
        'mortalidade-cativeiro': makeSvg('<path d="M18 14v52M30 14v52M42 14v52M54 14v52"/><path d="M12 22h48M12 58h48"/><path d="M22 30l36 28M58 30L22 58"/>'),
        'tamanho-territorio': makeSvg('<path d="M14 22l20-8l18 8l14-6v42l-14 6l-18-8l-20 8z"/><path d="M34 14v42"/><path d="M52 22v42"/><path d="M22 48l10-10l8 6l12-14l8 8"/>'),
        populacao: makeSvg('<circle cx="24" cy="33" r="7"/><circle cx="40" cy="24" r="8"/><circle cx="56" cy="33" r="7"/><path d="M18 58c2-7 8-12 14-12s12 5 14 12"/><path d="M34 61c2-9 10-15 18-15s16 6 18 15"/><path d="M10 61c2-9 10-15 18-15"/>'),
        atividade: makeSvg('<circle cx="28" cy="29" r="9"/><path d="M52 24c8 0 14 6 14 14c0 7-5 13-12 14"/><path d="M20 57h40"/><path d="M40 14v8"/><path d="M14 29h8"/>', 'general-model-svg activity-model-svg'),
        'vida-social': makeSvg('<circle cx="24" cy="32" r="7"/><circle cx="40" cy="24" r="7"/><circle cx="56" cy="32" r="7"/><path d="M18 58c2-8 8-13 14-13s12 5 14 13"/><path d="M34 58c2-8 8-13 14-13s12 5 14 13"/><path d="M31 29l9-5l9 5"/>', 'general-model-svg social-model-svg'),
        'funcao-ecologica': makeSvg('<circle cx="40" cy="40" r="18"/><path d="M40 22v36"/><path d="M22 40h36"/><path d="M28 28c6 8 18 8 24 0"/><path d="M28 52c6-8 18-8 24 0"/>', 'general-model-svg ecological-model-svg'),
        'composicao-grupo': makeSvg('<circle cx="40" cy="20" r="7"/><circle cx="22" cy="38" r="6"/><circle cx="58" cy="38" r="6"/><circle cx="40" cy="58" r="6"/><path d="M40 27v8M28 38h24M27 42l9 11M53 42l-9 11"/>'),
        'tipo-agrupamento-social': makeSvg('<circle cx="25" cy="28" r="6"/><circle cx="40" cy="20" r="7"/><circle cx="55" cy="28" r="6"/><circle cx="32" cy="51" r="6"/><circle cx="48" cy="51" r="6"/><path d="M31 30l5 3M49 30l-5 3M32 45l5-11M48 45l-5-11"/>'),
        estrategia: makeSvg('<circle cx="40" cy="40" r="22"/><circle cx="40" cy="40" r="10"/><path d="M40 12v10M40 58v10M12 40h10M58 40h10M40 40l14-14"/>'),
        'lideranca-hierarquia': makeSvg('<circle cx="40" cy="17" r="7"/><circle cx="22" cy="53" r="6"/><circle cx="40" cy="53" r="6"/><circle cx="58" cy="53" r="6"/><path d="M40 24v14M22 38h36M22 38v9M40 38v9M58 38v9"/>'),
        'parentesco-linhagem': makeSvg('<circle cx="40" cy="18" r="7"/><circle cx="24" cy="56" r="6"/><circle cx="40" cy="56" r="6"/><circle cx="56" cy="56" r="6"/><path d="M40 25v14M24 39h32M24 39v11M40 39v11M56 39v11"/>'),
        'tipo-comunicacao': makeSvg('<path d="M14 25c0-6 5-10 11-10h30c6 0 11 4 11 10v19c0 6-5 10-11 10H35l-11 9v-9h-1c-5 0-9-4-9-10Z"/><path d="M27 34h26M27 43h16"/>'),
        'zona-climatica': makeSvg('<circle cx="40" cy="40" r="27"/><path d="M13 40h54M40 13c8 8 12 17 12 27s-4 19-12 27M40 13c-8 8-12 17-12 27s4 19 12 27M18 25c13 6 31 6 44 0M18 55c13-6 31-6 44 0"/>'),
        bioma: makeSvg('<path d="M12 62h56"/><path d="M18 62V40l10-10l10 10v22M42 62V27l10-11l10 11v35"/><path d="M28 30V18M52 16V8M22 48h12M46 38h12"/>'),
        locomocao: makeSvg('<path d="M16 58h48"/><path d="M22 46c8-10 18-16 30-18"/><path d="M28 58l8-12"/><path d="M46 58l8-12"/><path d="M58 30l8-6"/>', 'general-model-svg locomotion-model-svg'),
        geral: makeSvg('<circle cx="40" cy="40" r="25"/><path d="M40 25v18"/><path d="M40 53v2"/>')
    };
    return icons[key] || icons.geral;
}

export function getActivityMeta(value = '') {
    const match = activityMap.get(normalizeGeneralVisualKey(value));
    if (match) return { key: match.key, title: match.label, accent: 'accent-climate' };
    return { key: 'atividade', title: value || 'Atividade', accent: 'accent-climate' };
}

export function getActivitySvg(key = 'atividade') {
    const icons = {
        atividade: makeSvg('<circle cx="28" cy="29" r="9"/><path d="M52 24c8 0 14 6 14 14c0 7-5 13-12 14"/><path d="M20 57h40"/><path d="M40 14v8"/><path d="M14 29h8"/>', 'general-model-svg activity-model-svg'),
        diurno: makeSvg('<circle cx="40" cy="40" r="13"/><path d="M40 12v9"/><path d="M40 59v9"/><path d="M12 40h9"/><path d="M59 40h9"/><path d="M20 20l6 6"/><path d="M54 54l6 6"/><path d="M54 26l6-6"/><path d="M20 60l6-6"/>', 'general-model-svg activity-model-svg'),
        noturno: makeSvg('<path d="M51 14c-3 3-5 8-5 14c0 15 11 26 26 26c2 0 4 0 6-1c-5 9-15 15-27 15c-18 0-32-14-32-32c0-12 7-23 18-28c4-2 9-3 14-2Z"/>', 'general-model-svg activity-model-svg'),
        crepuscular: makeSvg('<path d="M16 52h48"/><path d="M24 52c4-11 16-19 16-31c0 12 12 20 16 31"/><path d="M26 63h28"/><path d="M40 14v10"/>', 'general-model-svg activity-model-svg'),
        matutino: makeSvg('<path d="M16 52h48"/><path d="M24 52c4-10 11-17 16-21c5 4 12 11 16 21"/><path d="M40 18v8"/><path d="M25 26l5 5"/><path d="M55 26l-5 5"/>', 'general-model-svg activity-model-svg'),
        vespertino: makeSvg('<path d="M16 52h48"/><path d="M24 52c4-8 11-14 16-18c5 4 12 10 16 18"/><path d="M40 18v8"/><path d="M24 23l7 4"/><path d="M56 23l-7 4"/><path d="M26 63h28"/>', 'general-model-svg activity-model-svg'),
        catemeral: makeSvg('<circle cx="26" cy="32" r="10"/><path d="M53 24c7 0 12 5 12 12c0 7-5 12-12 12c-2 0-4 0-6-1c3-3 5-7 5-11s-2-8-5-12c2 0 4 0 6 0Z"/><path d="M18 56h34"/><path d="M58 54h8"/>', 'general-model-svg activity-model-svg'),
        arritmico: makeSvg('<path d="M12 46h12l6-16l10 28l8-17h20"/><path d="M16 62h48"/><circle cx="60" cy="25" r="6"/>', 'general-model-svg activity-model-svg'),
        ultradiano: makeSvg('<path d="M16 56c5-10 9-20 14-20s9 10 14 20s9 20 14 20s9-10 14-20"/><path d="M16 24c5 0 9 4 14 12c5-8 9-12 14-12s9 4 14 12c5-8 9-12 14-12"/>', 'general-model-svg activity-model-svg'),
        sazonal: makeSvg('<rect x="18" y="18" width="44" height="44" rx="8"/><path d="M18 32h44"/><path d="M28 12v12"/><path d="M52 12v12"/><path d="M28 44l6 6l12-12"/><path d="M48 43h8"/>', 'general-model-svg activity-model-svg'),
        migratorio: makeSvg('<path d="M14 54c12-20 30-30 52-30"/><path d="M53 16l13 8l-13 8"/><path d="M18 60h30"/><path d="M34 50l14 10l-14 10"/>', 'general-model-svg activity-model-svg'),
        hibernante: makeSvg('<path d="M18 58h44"/><path d="M24 58c2-18 10-28 24-32c7 7 10 14 10 24"/><path d="M28 26l8-8"/><path d="M52 22l-4-10"/><path d="M54 36l10-4"/>', 'general-model-svg activity-model-svg'),
        estivante: makeSvg('<circle cx="40" cy="22" r="8"/><path d="M16 58h48"/><path d="M24 58c4-12 12-20 16-20s12 8 16 20"/><path d="M22 22l-6-6"/><path d="M58 22l6-6"/><path d="M40 8V2"/>', 'general-model-svg activity-model-svg'),
        brumante: makeSvg('<path d="M18 58h44"/><path d="M24 58c3-15 11-24 24-28"/><path d="M24 24c4-5 8-8 14-8c7 0 12 4 16 11"/><path d="M56 18l10 4"/><path d="M54 30l12-1"/><path d="M54 42l10-4"/>', 'general-model-svg activity-model-svg'),
        torpidario: makeSvg('<circle cx="28" cy="38" r="12"/><path d="M44 38h18"/><path d="M50 28v20"/><path d="M18 58h44"/>', 'general-model-svg activity-model-svg'),
        subterraneo_fossorial: makeSvg('<path d="M14 56h52"/><path d="M22 48c8-7 18-11 30-11"/><path d="M25 56c0-10 6-18 15-18c8 0 14 6 14 14"/><path d="M24 29l-6 7"/><path d="M36 24l-4 9"/><path d="M48 24l2 9"/>', 'general-model-svg activity-model-svg'),
        aquatico_ativo: makeSvg('<path d="M13 48c10-10 22-15 36-15c11 0 20 3 27 10c-7 10-18 16-31 16S22 56 13 48Z"/><path d="M61 43l10-10v22L61 43Z"/><path d="M14 62c5-4 10-4 15 0c5-4 10-4 15 0c5-4 10-4 15 0"/>', 'general-model-svg activity-model-svg'),
        arboricola_ativo: makeSvg('<path d="M40 64V26"/><path d="M40 38l-16-10"/><path d="M40 46l18-11"/><circle cx="26" cy="24" r="9"/><circle cx="55" cy="28" r="10"/><circle cx="40" cy="18" r="11"/>', 'general-model-svg activity-model-svg'),
        terrestre_ativo: makeSvg('<path d="M18 60h44"/><path d="M26 43c4 4 6 8 6 12"/><path d="M36 37c4 4 6 8 6 12"/><path d="M46 43c4 4 6 8 6 12"/><path d="M30 28c4 4 6 8 6 12"/><path d="M50 28c4 4 6 8 6 12"/>', 'general-model-svg activity-model-svg'),
        aereo_ativo: makeSvg('<path d="M13 52c14-25 30-37 54-39c-4 24-17 41-41 52H13V52Z"/><path d="M30 28c7 8 11 18 12 30"/><path d="M45 22c6 8 8 16 8 26"/><path d="M58 18l10-6"/>', 'general-model-svg activity-model-svg')
    };
    return icons[key] || icons.atividade;
}

export function getSocialMeta(value = '') {
    const match = socialMap.get(normalizeGeneralVisualKey(value));
    if (match) return { key: match.key, title: match.label, accent: 'accent-mating-polygamy' };
    return { key: 'social', title: value || 'Vida social', accent: 'accent-mating-polygamy' };
}

export function getSocialSvg(key = 'social') {
    const icons = {
        social: makeSvg('<circle cx="24" cy="32" r="7"/><circle cx="40" cy="24" r="7"/><circle cx="56" cy="32" r="7"/><path d="M18 58c2-8 8-13 14-13s12 5 14 13"/><path d="M34 58c2-8 8-13 14-13s12 5 14 13"/><path d="M31 29l9-5l9 5"/>', 'general-model-svg social-model-svg'),
        solitaria: makeSvg('<circle cx="40" cy="34" r="14"/><path d="M28 60c3-9 8-14 12-14s9 5 12 14"/><path d="M31 34h18"/>', 'general-model-svg social-model-svg'),
        gregaria: makeSvg('<circle cx="24" cy="34" r="7"/><circle cx="40" cy="28" r="7"/><circle cx="56" cy="34" r="7"/><circle cx="32" cy="50" r="6"/><circle cx="48" cy="50" r="6"/>', 'general-model-svg social-model-svg'),
        altamente_social: makeSvg('<circle cx="40" cy="22" r="6"/><circle cx="24" cy="34" r="6"/><circle cx="56" cy="34" r="6"/><circle cx="30" cy="52" r="6"/><circle cx="50" cy="52" r="6"/><path d="M40 28L24 34L30 52H50L56 34L40 28Z"/>', 'general-model-svg social-model-svg'),
        eussocial: makeSvg('<path d="M28 18h24l12 20l-12 20H28L16 38l12-20Z"/><path d="M28 18l12 20l12-20"/><path d="M16 38h48"/><path d="M28 58l12-20l12 20"/>', 'general-model-svg social-model-svg'),
        colonial: makeSvg('<circle cx="24" cy="28" r="7"/><circle cx="40" cy="22" r="7"/><circle cx="56" cy="28" r="7"/><circle cx="28" cy="50" r="7"/><circle cx="52" cy="50" r="7"/><path d="M18 61h44"/>', 'general-model-svg social-model-svg'),
        comunitaria: makeSvg('<rect x="19" y="19" width="42" height="42" rx="12"/><circle cx="31" cy="31" r="5"/><circle cx="49" cy="31" r="5"/><circle cx="31" cy="49" r="5"/><circle cx="49" cy="49" r="5"/>', 'general-model-svg social-model-svg'),
        familiar: makeSvg('<circle cx="26" cy="28" r="8"/><circle cx="54" cy="28" r="8"/><circle cx="40" cy="45" r="6"/><path d="M18 60c3-8 9-13 16-13s13 5 16 13"/><path d="M30 60c2-6 5-10 10-10s8 4 10 10"/>', 'general-model-svg social-model-svg'),
        monogamica: makeSvg('<circle cx="28" cy="30" r="8"/><circle cx="52" cy="30" r="8"/><path d="M28 38v10"/><path d="M52 38v10"/><path d="M22 54c4-5 8-8 14-8"/><path d="M58 54c-4-5-8-8-14-8"/><path d="M36 30h8"/>', 'general-model-svg social-model-svg'),
        poligamica: makeSvg('<circle cx="40" cy="18" r="8"/><circle cx="22" cy="50" r="7"/><circle cx="40" cy="58" r="7"/><circle cx="58" cy="50" r="7"/><path d="M40 26v10"/><path d="M40 36L22 44"/><path d="M40 36v14"/><path d="M40 36l18 8"/>', 'general-model-svg social-model-svg'),
        poliginica: makeSvg('<circle cx="40" cy="18" r="8"/><circle cx="22" cy="52" r="7"/><circle cx="40" cy="57" r="7"/><circle cx="58" cy="52" r="7"/><path d="M34 18h12"/><path d="M40 26v10"/><path d="M40 36L22 45"/><path d="M40 36l18 9"/>', 'general-model-svg social-model-svg'),
        poliandrica: makeSvg('<circle cx="22" cy="22" r="7"/><circle cx="40" cy="17" r="7"/><circle cx="58" cy="22" r="7"/><circle cx="40" cy="57" r="8"/><path d="M22 29l18 15"/><path d="M40 24v20"/><path d="M58 29L40 44"/>', 'general-model-svg social-model-svg'),
        cooperativa: makeSvg('<circle cx="24" cy="32" r="7"/><circle cx="56" cy="32" r="7"/><circle cx="40" cy="52" r="7"/><path d="M31 38l7 9"/><path d="M49 38l-7 9"/><path d="M24 25l8-8"/><path d="M56 25l-8-8"/>', 'general-model-svg social-model-svg'),
        hierarquica: makeSvg('<path d="M18 60h44"/><path d="M26 46h28"/><path d="M34 32h12"/><circle cx="40" cy="20" r="6"/>', 'general-model-svg social-model-svg'),
        territorial: makeSvg('<path d="M20 60V20h40v40H20Z"/><path d="M32 48l8-20l8 20"/><path d="M40 12v12"/><path d="M52 16h12"/>', 'general-model-svg social-model-svg'),
        semi_social: makeSvg('<circle cx="25" cy="34" r="7"/><circle cx="40" cy="28" r="7"/><circle cx="55" cy="34" r="7"/><path d="M18 58c2-6 7-10 13-10"/><path d="M49 48c6 0 11 4 13 10"/>', 'general-model-svg social-model-svg'),
        subsocial: makeSvg('<circle cx="32" cy="28" r="9"/><circle cx="48" cy="46" r="6"/><path d="M26 58c2-8 8-13 14-13"/><path d="M38 36l7 6"/>', 'general-model-svg social-model-svg'),
        tolerante: makeSvg('<circle cx="31" cy="40" r="13"/><circle cx="49" cy="40" r="13"/><path d="M24 60h32"/>', 'general-model-svg social-model-svg'),
        agregada: makeSvg('<circle cx="24" cy="27" r="5"/><circle cx="38" cy="22" r="5"/><circle cx="54" cy="27" r="5"/><circle cx="30" cy="40" r="5"/><circle cx="46" cy="40" r="5"/><circle cx="24" cy="54" r="5"/><circle cx="40" cy="58" r="5"/><circle cx="56" cy="54" r="5"/>', 'general-model-svg social-model-svg'),
        migratoria_em_grupo: makeSvg('<path d="M12 56c14-24 34-34 56-30"/><path d="M56 18l12 8l-12 8"/><circle cx="23" cy="54" r="4"/><circle cx="36" cy="49" r="4"/><circle cx="49" cy="44" r="4"/>', 'general-model-svg social-model-svg'),
        reprodutiva_em_grupo: makeSvg('<path d="M18 58h44"/><path d="M26 47c6-10 14-16 14-24c0 8 8 14 14 24"/><circle cx="28" cy="32" r="4"/><circle cx="40" cy="26" r="4"/><circle cx="52" cy="32" r="4"/>', 'general-model-svg social-model-svg'),
        casal: makeSvg('<circle cx="28" cy="32" r="8"/><circle cx="52" cy="32" r="8"/><path d="M21 56c3-6 8-9 14-9"/><path d="M59 56c-3-6-8-9-14-9"/><path d="M36 28c2-4 5-6 8-6s6 2 8 6"/>', 'general-model-svg social-model-svg'),
        bando: makeSvg('<path d="M14 48c7-8 14-10 22-6"/><path d="M32 36c7-8 14-10 22-6"/><path d="M50 48c6-7 11-8 16-5"/><path d="M18 58h44"/>', 'general-model-svg social-model-svg'),
        manada: makeSvg('<path d="M16 58h48"/><circle cx="24" cy="46" r="5"/><circle cx="38" cy="42" r="5"/><circle cx="52" cy="46" r="5"/><path d="M24 51v8"/><path d="M38 47v12"/><path d="M52 51v8"/>', 'general-model-svg social-model-svg'),
        alcateia: makeSvg('<path d="M16 58h48"/><path d="M22 46c6-8 14-12 24-12c6 0 12 2 18 6"/><circle cx="28" cy="36" r="5"/><circle cx="44" cy="32" r="5"/><circle cx="58" cy="38" r="5"/>', 'general-model-svg social-model-svg'),
        cardume: makeSvg('<path d="M14 34c6-7 13-10 22-10c6 0 12 2 18 6c-5 8-13 12-22 12c-8 0-14-3-18-8Z"/><path d="M40 44c6-7 13-10 22-10c4 0 8 1 12 4c-5 8-13 12-22 12c-5 0-9-1-12-6Z"/><path d="M20 56h28"/>', 'general-model-svg social-model-svg'),
        colmeia: makeSvg('<path d="M26 20h28l10 18l-10 18H26L16 38l10-18Z"/><path d="M26 20l14 18l14-18"/><path d="M16 38h48"/><path d="M26 56l14-18l14 18"/>', 'general-model-svg social-model-svg'),
        formigueiro: makeSvg('<path d="M18 58h44"/><path d="M24 58c0-12 7-20 18-20c8 0 14 5 14 12"/><circle cx="30" cy="26" r="4"/><circle cx="40" cy="20" r="4"/><circle cx="50" cy="26" r="4"/><path d="M30 30l-6 8"/><path d="M50 30l6 8"/>', 'general-model-svg social-model-svg'),
        harem: makeSvg('<circle cx="40" cy="18" r="8"/><path d="M34 10h12"/><circle cx="22" cy="52" r="7"/><circle cx="40" cy="57" r="7"/><circle cx="58" cy="52" r="7"/><path d="M40 26v10"/><path d="M40 36L22 45"/><path d="M40 36l18 9"/>', 'general-model-svg social-model-svg'),
        matriarcal: makeSvg('<circle cx="28" cy="26" r="8"/><path d="M28 34v18"/><path d="M22 46h12"/><circle cx="48" cy="38" r="6"/><circle cx="60" cy="46" r="5"/><path d="M18 60h44"/>', 'general-model-svg social-model-svg'),
        patriarcal: makeSvg('<circle cx="52" cy="26" r="8"/><path d="M52 18l10-10"/><path d="M58 8h8v8"/><circle cx="32" cy="38" r="6"/><circle cx="20" cy="46" r="5"/><path d="M18 60h44"/>', 'general-model-svg social-model-svg')
    };
    return icons[key] || icons.social;
}

export { getEcologicalFunctionMeta, getEcologicalFunctionSvg, getLocomotionMeta, getLocomotionSvg };
