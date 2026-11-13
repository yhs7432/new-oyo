import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import messages from './local/index';

export const SUPPORTED_LANGUAGES = ['en', 'th', 'ko'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'th',
    lng: 'th',
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    debug: false,
    resources: messages,
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'oyo-golf-lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.resolvedLanguage || 'th';
}

export default i18n;