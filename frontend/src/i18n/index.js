import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/common.json';
import ar from './locales/ar/common.json';

const supportedLanguages = ['en', 'ar'];

export function applyDocumentLanguage(language) {
  const normalizedLanguage = language?.startsWith('ar') ? 'ar' : 'en';
  document.documentElement.lang = normalizedLanguage;
  document.documentElement.dir = normalizedLanguage === 'ar' ? 'rtl' : 'ltr';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

applyDocumentLanguage(i18n.language);

i18n.on('languageChanged', applyDocumentLanguage);

export default i18n;
