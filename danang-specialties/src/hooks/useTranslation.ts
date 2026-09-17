"use client";

import { useCallback, useMemo } from "react";
import { useLanguage } from "@/components/Providers";
import { getDictionary, translate } from "@/lib/i18n";

export function useTranslation() {
  const { language, setLanguage } = useLanguage();
  const dictionary = useMemo(() => getDictionary(language), [language]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(dictionary, key, params),
    [dictionary],
  );

  return {
    t,
    language,
    setLanguage,
    dictionary,
    locale: language === "VI" ? "vi" : "en",
  };
}
