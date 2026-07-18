import en from './en.js?v=20260718_footer_labels_1';
import fr from './fr.js?v=20260718_footer_labels_1';
import es from './es.js?v=20260718_footer_labels_1';
import de from './de.js?v=20260718_footer_labels_1';
import ja from './ja.js?v=20260718_footer_labels_1';
import zh from './zh.js?v=20260718_footer_labels_1';
import { priorityDictionaries } from './priority-catalog.js?v=20260717_priority_2';
import { generatedDictionaries } from './generated/index.js?v=20260717_zh_complete_1';

export const languageOptions = [
    { code: 'pt', label: 'Português' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' }
];

const baseDictionaries = { en, fr, es, de, ja, zh };
const dictionaries = Object.fromEntries(Object.entries(baseDictionaries).map(([language, dictionary]) => [
    language, Object.freeze({
        ...(generatedDictionaries[language] || {}),
        ...priorityDictionaries[language],
        ...dictionary
    })
]));
const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const dictionaryIndexes = new WeakMap();
let languageObserver = null;

function normalizeLookupValue(value) {
    return String(value || '')
        .trim()
        .toLocaleLowerCase('pt-PT')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

function getDictionaryIndex(dictionary) {
    if (dictionaryIndexes.has(dictionary)) return dictionaryIndexes.get(dictionary);
    const index = new Map();
    Object.entries(dictionary).forEach(([source, translation]) => {
        const normalized = normalizeLookupValue(source);
        if (!index.has(normalized)) index.set(normalized, translation);
    });
    dictionaryIndexes.set(dictionary, index);
    return index;
}

function findTranslation(value, dictionary) {
    const text = String(value || '').trim();
    if (!text) return '';
    return dictionary[text] || getDictionaryIndex(dictionary).get(normalizeLookupValue(text)) || '';
}

function rememberNode(node) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
}

function rememberAttribute(element, attribute) {
    let values = originalAttributes.get(element);
    if (!values) {
        values = {};
        originalAttributes.set(element, values);
    }
    if (!(attribute in values)) values[attribute] = element.getAttribute(attribute);
}

function translateNumericValue(value, dictionary) {
    const text = String(value || '').trim();
    const match = text.match(/^([<>~?]?\s*[\d.,]+(?:\s*[??-]\s*[\d.,]+)*(?:\s*[?x]\s*[\d.,]+)*\s*)([^\d].*)$/u);
    if (!match) return '';
    const translatedSuffix = findTranslation(match[2], dictionary);
    return translatedSuffix ? `${match[1]}${translatedSuffix}` : '';
}

function translateValue(value, dictionary) {
    const raw = String(value || '');
    const trimmed = raw.trim();
    if (!trimmed) return value;
    const translated = findTranslation(trimmed, dictionary) || translateNumericValue(trimmed, dictionary);
    if (!translated) return value;
    const start = raw.indexOf(trimmed);
    return `${raw.slice(0, start)}${translated}${raw.slice(start + trimmed.length)}`;
}

function translateElement(element, dictionary) {
    [...element.childNodes].forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue.trim()) return;
        rememberNode(node);
        node.nodeValue = translateValue(originalText.get(node), dictionary);
    });
    ['placeholder', 'title', 'aria-label'].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        rememberAttribute(element, attribute);
        const source = originalAttributes.get(element)[attribute];
        element.setAttribute(attribute, translateValue(source, dictionary));
    });
}

function translateTree(root, dictionary) {
    if (root.nodeType === Node.TEXT_NODE) {
        if (!root.nodeValue.trim()) return;
        rememberNode(root);
        root.nodeValue = translateValue(originalText.get(root), dictionary);
        return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) translateElement(root, dictionary);
    root.querySelectorAll('*').forEach(element => translateElement(element, dictionary));
}

function observeDynamicContent() {
    if (languageObserver || !document.body || typeof MutationObserver !== 'function') return;
    languageObserver = new MutationObserver(mutations => {
        const language = getSavedAnimalLanguage();
        if (language === 'pt') return;
        const dictionary = dictionaries[language] || {};
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => translateTree(node, dictionary));
        });
    });
    languageObserver.observe(document.body, { childList: true, subtree: true });
}

export function getSavedAnimalLanguage() {
    const value = localStorage.getItem('animal-page-language') || 'pt';
    return languageOptions.some(option => option.code === value) ? value : 'pt';
}

export function applyAnimalLanguage(root = document, language = getSavedAnimalLanguage()) {
    const dictionary = language === 'pt' ? {} : (dictionaries[language] || {});
    translateTree(root, dictionary);
    document.querySelectorAll('[data-animal-language]').forEach(select => { select.value = language; });
    syncAnimalLanguageControls(language);
    document.documentElement.lang = language === 'pt' ? 'pt-PT' : language;
    localStorage.setItem('animal-page-language', language);
    document.dispatchEvent(new CustomEvent('animal-language-change', { detail: { language } }));
}

export function renderAnimalLanguageSelect() {
    const options = languageOptions.map(option => `<button type="button" class="animal-language-option" data-animal-language-option="${option.code}" role="option" aria-selected="false">${option.label}</button>`).join('');
    return `<div class="animal-language-control" data-animal-language-control><span class="sr-only">Idioma</span><i class="fa-solid fa-language" aria-hidden="true"></i><select data-animal-language aria-hidden="true" tabindex="-1">${languageOptions.map(option => `<option value="${option.code}">${option.label}</option>`).join('')}</select><button type="button" class="animal-language-trigger" data-animal-language-trigger aria-haspopup="listbox" aria-expanded="false" aria-label="Idioma"><span data-animal-language-label></span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button><div class="animal-language-menu" data-animal-language-menu role="listbox">${options}</div></div>`;
}

function syncAnimalLanguageControls(language) {
    const selected = languageOptions.find(option => option.code === language) || languageOptions[0];
    document.querySelectorAll('[data-animal-language-control]').forEach(control => {
        const label = control.querySelector('[data-animal-language-label]');
        if (label) label.textContent = selected.label;
        control.querySelectorAll('[data-animal-language-option]').forEach(option => {
            const active = option.dataset.animalLanguageOption === selected.code;
            option.setAttribute('aria-selected', String(active));
            option.classList.toggle('is-selected', active);
        });
    });
}

export function initAnimalLanguage(root = document) {
    const language = getSavedAnimalLanguage();
    root.querySelectorAll('[data-animal-language]').forEach(select => {
        select.value = language;
        if (select.dataset.animalLanguageReady === 'true') return;
        select.dataset.animalLanguageReady = 'true';
        select.addEventListener('change', event => applyAnimalLanguage(document, event.target.value));
    });
    root.querySelectorAll('[data-animal-language-control]').forEach(control => {
        if (control.dataset.animalLanguageControlReady === 'true') return;
        control.dataset.animalLanguageControlReady = 'true';
        const trigger = control.querySelector('[data-animal-language-trigger]');
        const menu = control.querySelector('[data-animal-language-menu]');
        const select = control.querySelector('[data-animal-language]');
        trigger?.addEventListener('click', () => {
            const open = !control.classList.contains('is-open');
            document.querySelectorAll('[data-animal-language-control].is-open').forEach(other => {
                other.classList.remove('is-open');
                other.querySelector('[data-animal-language-trigger]')?.setAttribute('aria-expanded', 'false');
            });
            control.classList.toggle('is-open', open);
            trigger.setAttribute('aria-expanded', String(open));
        });
        menu?.querySelectorAll('[data-animal-language-option]').forEach(option => option.addEventListener('click', () => {
            if (select) select.value = option.dataset.animalLanguageOption;
            applyAnimalLanguage(document, option.dataset.animalLanguageOption);
            control.classList.remove('is-open');
            trigger?.setAttribute('aria-expanded', 'false');
            trigger?.focus();
        }));
    });
    if (!document.body.dataset.animalLanguageOutsideClickReady) {
        document.body.dataset.animalLanguageOutsideClickReady = 'true';
        document.addEventListener('click', event => {
            if (event.target.closest('[data-animal-language-control]')) return;
            document.querySelectorAll('[data-animal-language-control].is-open').forEach(control => {
                control.classList.remove('is-open');
                control.querySelector('[data-animal-language-trigger]')?.setAttribute('aria-expanded', 'false');
            });
        });
    }
    applyAnimalLanguage(document, language);
    observeDynamicContent();
}
