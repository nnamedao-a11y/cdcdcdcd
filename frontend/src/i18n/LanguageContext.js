/**
 * Language Context
 * 
 * Provides language switching functionality for the app
 * Default language: BG (Bulgarian) for Bulgaria market
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    // Get from localStorage or default to 'bg'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bibi_lang') || 'bg';
    }
    return 'bg';
  });

  // Save language preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bibi_lang', lang);
    }
  }, [lang]);

  // Translation function
  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  // Toggle between languages
  const toggleLang = () => {
    setLang(prev => prev === 'bg' ? 'en' : 'bg');
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return fallback if used outside provider
    return {
      lang: 'bg',
      setLang: () => {},
      t: (key) => translations['bg']?.[key] || key,
      toggleLang: () => {},
    };
  }
  return context;
};

export default LanguageContext;
