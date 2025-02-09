import { use } from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import zh from './zh'

export default use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh }
    },
    lng: 'zh', // 默认语言
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })
