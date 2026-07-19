import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import he from './locales/he.json';

export const LANGUAGES = [
  { code: 'en', label: 'EN', dir: 'ltr' },
  { code: 'he', label: 'עב', dir: 'rtl' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'he'],
    interpolation: {
      // React already escapes rendered values
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'fitai-lang',
    },
  });

export function dirFor(lng: string): 'rtl' | 'ltr' {
  return lng === 'he' ? 'rtl' : 'ltr';
}

export default i18n;
