export type Language = "VI" | "EN";

export type Product = {
  id: number;
  name: string;
  nameEn: string;
  category: string;
  price: number;
  weight: string;
  /** Optional grams override when `weight` is not a simple g/kg string (e.g. "Box of 6"). */
  weightGrams?: number;
  image: string;
  description: string;
  descriptionEn: string;
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

/** Resolve product weight in grams for shipping totals. */
export const getProductWeightGrams = (product: {
  weight: string;
  weightGrams?: number;
}): number => {
  if (typeof product.weightGrams === "number") {
    return product.weightGrams;
  }
  return parseWeightGrams(product.weight);
};

export const SHOP_CATEGORIES = [
  "Dried Seafood",
  "Snacks",
  "Tea",
  "Traditional Cakes",
] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export const categoryLabels: Record<
  ShopCategory,
  { vi: string; en: string }
> = {
  "Dried Seafood": { vi: "Hải Sản Khô", en: "Dried Seafood" },
  Snacks: { vi: "Ăn Vặt", en: "Snacks" },
  Tea: { vi: "Trà", en: "Tea" },
  "Traditional Cakes": { vi: "Bánh Truyền Thống", en: "Traditional Cakes" },
};
