import i18n from 'i18next'
import de from './de.json'
import en from './en.json'
import deCh from './ch.json'

i18n.init({
  lng: localStorage.getItem('uiLang') || 'en',
  fallbackLng: 'en',
  // debug: true,

  resources: { en, de, 'ch': deCh },

  interpolation: {
    escapeValue: false, // not needed for react
  },

  // react i18next special options (optional)
  react: {
    wait: true,
    bindI18n: 'languageChanged loaded',
    bindStore: 'added removed',
    nsMode: 'default',
  },
})

export default i18n
