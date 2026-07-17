import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectCandidateGroups } from './i18n-source-candidates.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(projectRoot, 'js', 'i18n', 'generated');
const divider = '\uE000';
const languages = {
    en: 'en',
    fr: 'fr',
    es: 'es',
    de: 'de',
    ja: 'ja',
    zh: 'zh-CN'
};
const requestedLanguages = new Set(process.argv.slice(2));
const selectedLanguages = Object.entries(languages)
    .filter(([language]) => !requestedLanguages.size || requestedLanguages.has(language));

function makeBatches(values, maximumLength = 2800) {
    const batches = [];
    let batch = [];
    let length = 0;
    for (const value of values) {
        const addedLength = value.length + divider.length + 2;
        if (batch.length && length + addedLength > maximumLength) {
            batches.push(batch);
            batch = [];
            length = 0;
        }
        batch.push(value);
        length += addedLength;
    }
    if (batch.length) batches.push(batch);
    return batches;
}

async function requestTranslation(text, targetLanguage) {
    const parameters = new URLSearchParams({ client: 'gtx', sl: 'pt', tl: targetLanguage, dt: 't', q: text });
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?${parameters}`);
    if (!response.ok) throw new Error(`Falha HTTP ${response.status} ao traduzir para ${targetLanguage}.`);
    const payload = await response.json();
    return payload[0].map(segment => segment[0]).join('');
}

async function translateBatch(values, targetLanguage) {
    const source = values.join(`\n${divider}\n`);
    const translated = await requestTranslation(source, targetLanguage);
    const parts = translated.split(divider).map(value => value.trim());
    if (parts.length === values.length) return parts;
    console.warn(`O separador não foi preservado em ${targetLanguage}; a repetir ${values.length} entradas individualmente.`);
    return Promise.all(values.map(value => requestTranslation(value, targetLanguage)));
}

function serializeDictionary(dictionary) {
    const entries = Object.entries(dictionary)
        .sort(([left], [right]) => left.localeCompare(right, 'pt-PT'))
        .map(([source, translation]) => `  ${JSON.stringify(source)}: ${JSON.stringify(translation)}`);
    return `// Gerado por scripts/i18n-generate.mjs. As correções manuais ficam nos catálogos principais.\n` +
        `export default Object.freeze({\n${entries.join(',\n')}\n});\n`;
}

const groups = await collectCandidateGroups();
await mkdir(outputRoot, { recursive: true });

for (const [language, targetLanguage] of selectedLanguages) {
    const curated = (await import(`../js/i18n/${language}.js`)).default;
    for (const [group, candidates] of Object.entries(groups)) {
        const values = [...candidates]
            .filter(value => !Object.hasOwn(curated, value))
            .sort((left, right) => left.localeCompare(right, 'pt-PT'));
        const dictionary = {};
        const batches = makeBatches(values);
        console.log(`${language}/${group}: ${values.length} entradas em ${batches.length} lotes.`);
        for (let index = 0; index < batches.length; index += 1) {
            const batch = batches[index];
            const translated = await translateBatch(batch, targetLanguage);
            batch.forEach((source, entryIndex) => { dictionary[source] = translated[entryIndex]; });
            console.log(`  lote ${index + 1}/${batches.length}`);
        }
        await writeFile(path.join(outputRoot, `${language}-${group}.js`), serializeDictionary(dictionary), 'utf8');
    }
}

