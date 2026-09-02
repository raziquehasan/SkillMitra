"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import enTranslations from "@/locales/en.json";
import mrTranslations from "@/locales/mr.json";
import hiTranslations from "@/locales/hi.json";

type Language = "en" | "mr" | "hi";
type Translations = typeof enTranslations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  en: enTranslations,
  mr: mrTranslations,
  hi: hiTranslations,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load language from localStorage on mount, default to English if not set
  useEffect(() => {
    const savedLang = localStorage.getItem("skillmitra_language") as Language;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
    } else {
      // Ensure English is set as default if no saved language
      localStorage.setItem("skillmitra_language", "en");
      document.documentElement.lang = "en";
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("skillmitra_language", lang);
    document.documentElement.lang = lang;
  };

  // Translation function
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}