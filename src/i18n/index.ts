import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import zh from './locales/zh.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en',    label: 'English',   flag: '🇺🇸' },
  { code: 'es',    label: 'Español',   flag: '🇪🇸' },
  { code: 'fr',    label: 'Français',  flag: '🇫🇷' },
  { code: 'de',    label: 'Deutsch',   flag: '🇩🇪' },
  { code: 'zh',    label: '中文',       flag: '🇨🇳' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      en:      { translation: en  },
      es:      { translation: es  },
      fr:      { translation: fr  },
      de:      { translation: de  },
      zh:      { translation: zh  },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en', 'es', 'fr', 'de', 'zh'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
