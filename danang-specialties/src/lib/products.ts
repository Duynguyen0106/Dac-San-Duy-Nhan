export type Language = "VI" | "EN";

export type Product = {
  id: number;
  name: string;
  nameEn: string;
  category: string;
  price: number;
  weight: string;
  image: string;
  description: string;
};

export const formatPrice = (price: number, language: Language = "VI") =>
  new Intl.NumberFormat(language === "VI" ? "vi-VN" : "en-US").format(price) +
  "đ";

/** Parse product weight strings like "200g" or "1.5kg" into grams. */
export const parseWeightGrams = (weight: string): number => {
  const normalized = weight.trim().toLowerCase().replace(/\s+/g, "");
  const match = normalized.match(/^([\d.,]+)(kg|g)$/);
  if (!match) return 0;

  const value = Number(match[1].replace(",", "."));
  if (Number.isNaN(value)) return 0;

  return match[2] === "kg" ? Math.round(value * 1000) : Math.round(value);
};

export const formatWeight = (grams: number, language: Language = "VI"): string => {
  if (grams >= 1000) {
    const kg = grams / 1000;
    const formatted = Number.isInteger(kg)
      ? String(kg)
      : kg.toFixed(2).replace(/\.?0+$/, "");
    return language === "VI" ? `${formatted} kg` : `${formatted} kg`;
  }
  return language === "VI" ? `${grams}g` : `${grams}g`;
};

export const SHOP_CATEGORIES = [
  "Dried Seafood",
  "Snacks",
  "Tea",
] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export const categoryLabels: Record<
  ShopCategory,
  { vi: string; en: string }
> = {
  "Dried Seafood": { vi: "Hải Sản Khô", en: "Dried Seafood" },
  Snacks: { vi: "Ăn Vặt", en: "Snacks" },
  Tea: { vi: "Trà", en: "Tea" },
};
