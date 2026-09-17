"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import CartDrawer from "@/components/CartDrawer";
import AskButton from "@/components/AskButton";
import type { Language } from "@/lib/products";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within Providers");
  }
  return context;
}

function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("VI");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("duynhan-language");
      if (stored === "VI" || stored === "EN") {
        setLanguageState(stored);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem("duynhan-language", next);
    } catch {
      // ignore storage errors
    }
  };

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      <DocumentLang />
      {children}
    </LanguageContext.Provider>
  );
}

function DocumentLang() {
  const { language } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = language === "VI" ? "vi" : "en";
  }, [language]);
  return null;
}

function CartDrawerHost() {
  const { language } = useLanguage();
  return <CartDrawer language={language} />;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CartProvider>
        <FavoritesProvider>
          {children}
          <CartDrawerHost />
          <AskButton />
        </FavoritesProvider>
      </CartProvider>
    </LanguageProvider>
  );
}
