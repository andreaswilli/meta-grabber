import i18n from 'i18next';
import de from './de.json';
import en from './en.json';

i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  // debug: true,

  resources: { en, de },

  interpolation: {
    escapeValue: false, // not needed for react
  },

  // react i18next special options (optional)
  react: {
    wait: true,
    bindI18n: 'languageChanged loaded',
    bindStore: 'added removed',
    nsMode: 'default'
  }
});

export default i18n;
