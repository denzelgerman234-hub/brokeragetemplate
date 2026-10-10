"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { translations as allTranslations, LANGUAGE_NAMES } from "@/lib/translations/data";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Translations = Record<string, string>;

type LanguageContextValue = {
  language: string;
  languageNames: Record<string, string>;
  t: Translations;
  setLanguage: (lang: string) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  languageNames: LANGUAGE_NAMES,
  t: allTranslations["en"] ?? {},
  setLanguage: () => undefined,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function LanguageProvider({
  defaultLanguage = "en",
  supportedLanguages = ["en", "es", "zh", "ru", "fr", "de", "pt", "ar"],
  children,
}: {
  defaultLanguage?: string;
  supportedLanguages?: string[];
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState(defaultLanguage);
  const [t, setT] = useState<Translations>(allTranslations[defaultLanguage] ?? allTranslations["en"] ?? {});
  const [languageNames] = useState<Record<string, string>>(LANGUAGE_NAMES);

  const applyLanguage = useCallback((lang: string) => {
    const targetTranslations = allTranslations[lang] ?? allTranslations["en"] ?? {};
    setLanguageState(lang);
    setT(targetTranslations);

    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("language", lang);
      window.dispatchEvent(new CustomEvent("brokerage:language-change", { detail: lang }));
    }
  }, []);

  // Restore persisted language on mount
  useEffect(() => {
    const stored = window.localStorage.getItem("language");
    const resolved = stored && supportedLanguages.includes(stored) ? stored : defaultLanguage;
    if (resolved !== defaultLanguage) {
      applyLanguage(resolved);
    }
  }, [defaultLanguage, supportedLanguages, applyLanguage]);

  const setLanguage = useCallback(
    (lang: string) => {
      applyLanguage(lang);
    },
    [applyLanguage],
  );

  return (
    <LanguageContext.Provider value={{ language, languageNames, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTranslation() {
  return useContext(LanguageContext);
}
