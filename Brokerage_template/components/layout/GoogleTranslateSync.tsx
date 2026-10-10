"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "@/context/LanguageContext";

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay?: boolean; includedLanguages?: string },
          elementId: string
        ) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

export function GoogleTranslateSync() {
  const { language } = useTranslation();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once on client
    if (initializedRef.current) return;
    initializedRef.current = true;

    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              autoDisplay: false,
              includedLanguages: "en,es,zh-CN,ru,fr,de,pt,ar",
            },
            "google_translate_element"
          );
        }
      } catch {
        // Suppress any script init race
      }
    };

    // Load google translate script
    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const targetCode = language === "zh" ? "zh-CN" : language;
    const hostname = window.location.hostname;

    // Set translation cookies for current domain and path
    const val = `/en/${targetCode}`;
    document.cookie = `googtrans=${val}; path=/;`;
    if (hostname) {
      document.cookie = `googtrans=${val}; path=/; domain=${hostname};`;
      if (hostname.includes(".")) {
        document.cookie = `googtrans=${val}; path=/; domain=.${hostname};`;
      }
    }

    // Trigger select element if already rendered
    const applyCombo = () => {
      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (combo) {
        if (combo.value !== targetCode) {
          combo.value = targetCode;
          combo.dispatchEvent(new Event("change"));
        }
        return true;
      }
      return false;
    };

    if (!applyCombo()) {
      // Retry in case widget script is still loading
      const interval = setInterval(() => {
        if (applyCombo()) {
          clearInterval(interval);
        }
      }, 300);
      const timer = setTimeout(() => clearInterval(interval), 4000);
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [language]);

  return <div id="google_translate_element" style={{ display: "none" }} aria-hidden="true" />;
}
