import vi from "@/locales/vi.json";
import en from "@/locales/en.json";
import type { Language } from "@/lib/products";

export type Dictionary = typeof vi;

const dictionaries: Record<Language, Dictionary> = {
  VI: vi,
  EN: en,
};

export function getDictionary(language: Language): Dictionary {
  return dictionaries[language] ?? dictionaries.VI;
}

export function translate(
  dictionary: Dictionary,
  key: string,
  params?: Record<string, string | number>,
): string {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, dictionary);

  if (typeof value !== "string") {
    return key;
  }

  if (!params) return value;

  return Object.entries(params).reduce(
    (text, [name, replacement]) =>
      text.replaceAll(`{${name}}`, String(replacement)),
    value,
  );
}
