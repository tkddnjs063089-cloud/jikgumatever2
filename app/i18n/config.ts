import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import koTranslations from './locales/ko.json';
import enTranslations from './locales/en.json';
import jaTranslations from './locales/ja.json';
import zhTranslations from './locales/zh.json';
import esTranslations from './locales/es.json';

// localStorage에서 저장된 언어 가져오기
const getStoredLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language');
    return stored || 'ko';
  }
  return 'ko';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: koTranslations },
      en: { translation: enTranslations },
      ja: { translation: jaTranslations },
      zh: { translation: zhTranslations },
      es: { translation: esTranslations },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

