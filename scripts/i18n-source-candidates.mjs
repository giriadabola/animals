import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsRoot = path.join(projectRoot, 'js');

const domainFiles = new Set([
    'biogeographic-regions.js',
    'communication-catalog.js',
    'digestive-system-visuals.js',
    'ecological-functions.js',
    'ecology-visuals.js',
    'feeding-strategies.js',
    'feeding-visuals.js',
    'general-visual-catalog.js',
    'group-composition-visuals.js',
    'kinship-lineage-visuals.js',
    'leadership-hierarchy-visuals.js',
    'locomotion-visuals.js',
    'mating-systems.js',
    'perception-visuals.js',
    'resting-place-materials.js',
    'resting-place-visuals.js',
    'sexual-systems.js'
]);

const lowercaseWords = new Set([
    'caça', 'crias', 'dias', 'fêmeas', 'horas', 'indivíduos', 'juvenis', 'machos',
    'meses', 'milénios', 'minutos', 'segundos', 'semanas', 'subadultos', 'unidade'
]);

const rejectedPatterns = [
    /[<>{}=;$]|\\[nrt]/,
    /^(?:#|\.|\.\.\/|assets\/|https?:|rgba?\(|linear-gradient|translate|brightness)/i,
    /\.(?:css|html|js|json|png|svg|webp)$/i,
    /^(?:M\d|m\d|url\()/,
    /^(?:border|color|display|font|height|margin|opacity|padding|position|text|transform|width)[-\w]*\s*:/i,
    /[()]\s*(?:&&|\|\||=>)|(?:&&|\|\||=>)\s*[()]/,
    /^(?:currentColor|false|none|object|polite|smooth|string|transparent|true)$/,
    /^(?:Erro|Aviso|\[)|�/,
    /^[),.?&|]/,
    /(?:\.includes|\.join|\.normalize|\.replace|\.split|\.trim|String\(|animalData|item\?\.|render[A-Z]|rgba\()/,
    /^Loaded /,
    /\b(?:addEventListener|querySelector|querySelectorAll|classList|dataset|localeCompare)\b/,
    /^(?:accent|animal-page|conservation-status|dimension-model|fa-|info-|is-|js-|perception-type|reproduction-|visual-model)[\w -]*$/i
];

function decodeHtml(value) {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&times;/g, '×')
        .replace(/\s+/g, ' ')
        .trim();
}

export function isTranslationCandidate(value) {
    const text = decodeHtml(String(value || ''));
    if (text.length < 2 || text.length > 240 || !/[A-Za-zÀ-ÿ]/.test(text)) return false;
    if (rejectedPatterns.some(pattern => pattern.test(text))) return false;
    if (/^[A-Z]{2,4}$/.test(text) || /^[a-z][a-z0-9_-]*$/.test(text) && !lowercaseWords.has(text)) return false;
    if (/^[\w-]+(?: [\w-]+)+$/.test(text) && text === text.toLowerCase()) return false;
    return true;
}

function addCandidate(target, value) {
    const text = decodeHtml(value);
    if (isTranslationCandidate(text)) target.add(text);
}

function decodeJavaScriptString(value) {
    return value
        .replace(/\\u\{([0-9a-f]+)\}/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
        .replace(/\\u([0-9a-f]{4})/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
        .replace(/\\x([0-9a-f]{2})/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
        .replace(/\\(['"\\])/g, '$1');
}

export function extractCandidates(source) {
    const candidates = new Set();

    for (const match of source.matchAll(/(['"])((?:\\[^\r\n]|(?!\1)[^\\\r\n]){2,240})\1/g)) {
        addCandidate(candidates, decodeJavaScriptString(match[2]));
    }
    for (const match of source.matchAll(/>([^<>{}$\r\n]+)</g)) addCandidate(candidates, match[1]);
    for (const match of source.matchAll(/(?:aria-label|placeholder|title)="([^"]+)"/g)) addCandidate(candidates, match[1]);

    return candidates;
}

export async function collectCandidateGroups() {
    const entries = await readdir(jsRoot);
    const popupFiles = entries.filter(name => name.endsWith('-popup.js'));
    const interfaceFiles = [
        path.join(projectRoot, 'animal-page', 'animal-page.js'),
        path.join(projectRoot, 'animal-page', 'scientific-classification-toggle.js'),
        ...popupFiles.map(name => path.join(jsRoot, name)),
        ...['animal-audio.js', 'animal-comparison.js', 'animal-media-block.js', 'profile-favorites.js']
            .map(name => path.join(jsRoot, name))
    ];
    const formCatalogFiles = [
        'form-state-catalogs.js',
        'form-general.js',
        'form-feeding.js',
        'form-ecology.js',
        'form-curiosities-categories.js',
        'form-reproduction.js',
        'form-reproduction-parental-investment.js',
        'form-plumage-editing.js'
    ];
    const biologyFiles = [...domainFiles].map(name => path.join(jsRoot, name)).concat(
        formCatalogFiles.map(name => path.join(projectRoot, 'form', 'modules', name))
    );

    const groups = { interface: new Set(), biology: new Set() };
    for (const [group, files] of Object.entries({ interface: interfaceFiles, biology: biologyFiles })) {
        for (const filename of files) {
            const source = await readFile(filename, 'utf8');
            extractCandidates(source).forEach(value => groups[group].add(value));
        }
    }
    groups.interface.forEach(value => groups.biology.delete(value));
    return groups;
}

