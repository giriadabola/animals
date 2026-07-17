import englishInterface from './en-interface.js?v=20260717_en_complete_4';
import englishBiology from './en-biology.js?v=20260717_en_complete_4';
import spanishInterface from './es-interface.js?v=20260717_es_complete_2';
import spanishBiology from './es-biology.js?v=20260717_es_complete_2';
import frenchInterface from './fr-interface.js?v=20260717_fr_complete_2';
import frenchBiology from './fr-biology.js?v=20260717_fr_complete_2';
import germanInterface from './de-interface.js?v=20260717_de_complete_2';
import germanBiology from './de-biology.js?v=20260717_de_complete_2';
import japaneseInterface from './ja-interface.js?v=20260717_ja_complete_2';
import japaneseBiology from './ja-biology.js?v=20260717_ja_complete_2';
import chineseInterface from './zh-interface.js?v=20260717_zh_complete_2';
import chineseBiology from './zh-biology.js?v=20260717_zh_complete_2';

export const generatedDictionaries = Object.freeze({
    en: Object.freeze({ ...englishInterface, ...englishBiology }),
    es: Object.freeze({ ...spanishInterface, ...spanishBiology }),
    fr: Object.freeze({ ...frenchInterface, ...frenchBiology }),
    de: Object.freeze({ ...germanInterface, ...germanBiology }),
    ja: Object.freeze({ ...japaneseInterface, ...japaneseBiology }),
    zh: Object.freeze({ ...chineseInterface, ...chineseBiology })
});
