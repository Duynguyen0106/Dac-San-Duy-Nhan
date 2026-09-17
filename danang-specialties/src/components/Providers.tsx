"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
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
  const [language, setLanguage] = useState<Language>("VI");
  const value = useMemo(
    () => ({ language, setLanguage }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

function CartDrawerHost() {
  const { language } = useLanguage();
  return <CartDrawer language={language} />;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CartProvider>
        {children}
        <CartDrawerHost />
      </CartProvider>
    </LanguageProvider>
  );
}
