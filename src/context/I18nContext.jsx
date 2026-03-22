import { createContext, useContext, useState, useEffect } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';

const I18nContext = createContext();

const translations = {
  fr,
  en
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Récupérer la langue sauvegardée ou la langue du navigateur
    const saved = localStorage.getItem('language');
    if (saved) return saved;
    
    const browserLang = navigator.language.split('-')[0];
    return translations[browserLang] ? browserLang : 'fr';
  });

  // Listen for language changes from PreferencesContext
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const newLanguage = event.detail?.language;
      if (newLanguage && translations[newLanguage]) {
        setLanguage(newLanguage);
      }
    };

    window.addEventListener('language-changed', handleLanguageChange);
    
    return () => {
      window.removeEventListener('language-changed', handleLanguageChange);
    };
  }, []);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
      // Notify PreferencesContext about the change
      window.dispatchEvent(new CustomEvent('language-changed', {
        detail: { language: lang }
      }));
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation doit être utilisé dans un I18nProvider');
  }
  return context;
};
