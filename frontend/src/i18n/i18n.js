import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// İngilizce çeviri dosyamızı import ediyoruz (bir sonraki adımda oluşturacağız)
import translationEN from './locales/en.json';

// Çeviri kaynakları
const resources = {
  en: {
    translation: translationEN
  }
};

i18n
  .use(initReactI18next) // i18next'i react'e bağlar
  .init({
    resources,
    lng: 'en', // Başlangıç dili
    fallbackLng: 'en', // Eğer seçilen dilde çeviri yoksa kullanılacak dil

    interpolation: {
      escapeValue: false // React zaten XSS'e karşı koruma sağlar
    }
  });

export default i18n;