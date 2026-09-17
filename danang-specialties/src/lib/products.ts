export type Language = "VI" | "EN";

export type ProductTag = "gift" | "tourist" | "shelf-stable";

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
  /** Optional merchandising tags for shop filters. */
  tags?: ProductTag[];
  /**
   * Inventory units remaining.
   * Omit / null = not tracked (treated as available).
   * 0 = sold out.
   */
  stock?: number | null;
};

/** True when the product can be added to cart. */
export function isProductAvailable(product: Product): boolean {
  if (product.stock === undefined || product.stock === null) return true;
  return product.stock > 0;
}

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
    return `${formatted} kg`;
  }
  return `${grams}g`;
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
  "Cold Cuts",
  "Condiments",
  "Tea & Coffee",
  "Cakes & Candy",
  "Rice Paper",
  "Dried Fruit & Nuts",
  "Oils & Souvenirs",
  "Gifts",
] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export const categoryLabels: Record<
  ShopCategory,
  { vi: string; en: string }
> = {
  "Dried Seafood": { vi: "Hải Sản Khô", en: "Dried Seafood" },
  Snacks: { vi: "Đồ Rim & Ăn Vặt", en: "Rim & Snacks" },
  "Cold Cuts": { vi: "Nem Chả & Tré", en: "Cold Cuts" },
  Condiments: { vi: "Mắm & Gia Vị", en: "Sauces & Spices" },
  "Tea & Coffee": { vi: "Trà & Cà Phê", en: "Tea & Coffee" },
  "Cakes & Candy": { vi: "Bánh & Kẹo", en: "Cakes & Candy" },
  "Rice Paper": { vi: "Bánh Tráng", en: "Rice Paper" },
  "Dried Fruit & Nuts": { vi: "Hoa Quả & Hạt", en: "Dried Fruit & Nuts" },
  "Oils & Souvenirs": { vi: "Tinh Dầu & Lưu Niệm", en: "Oils & Souvenirs" },
  Gifts: { vi: "Quà Tặng", en: "Gift Sets" },
};

/** Map homepage category card ids / URL slugs to shop filter values. */
export const HOME_CATEGORY_TO_SHOP: Record<string, ShopCategory> = {
  "dried-seafood": "Dried Seafood",
  snacks: "Snacks",
  "cold-cuts": "Cold Cuts",
  condiments: "Condiments",
  "tea-coffee": "Tea & Coffee",
  "cakes-candy": "Cakes & Candy",
  "rice-paper": "Rice Paper",
  "dried-fruit-nuts": "Dried Fruit & Nuts",
  "oils-souvenirs": "Oils & Souvenirs",
  gifts: "Gifts",
};

export const SHOP_CATEGORY_SLUGS = Object.keys(
  HOME_CATEGORY_TO_SHOP,
) as Array<keyof typeof HOME_CATEGORY_TO_SHOP>;

export function categoryToSlug(category: ShopCategory): string {
  const entry = Object.entries(HOME_CATEGORY_TO_SHOP).find(
    ([, value]) => value === category,
  );
  return entry?.[0] ?? "dried-seafood";
}

export function slugToCategory(slug: string): ShopCategory | null {
  return HOME_CATEGORY_TO_SHOP[slug] ?? null;
}

/** Related items: same category first, then shared tags (gift preferred). */
export function getRelatedProducts(
  product: Product,
  catalog: Product[],
  limit = 4,
): Product[] {
  const others = catalog.filter((item) => item.id !== product.id);
  const sameCategory = others.filter(
    (item) => item.category === product.category,
  );
  const productTags = new Set(product.tags ?? []);
  const scored = others
    .filter((item) => item.category !== product.category)
    .map((item) => {
      const tags = item.tags ?? [];
      const shared = tags.filter((tag) => productTags.has(tag)).length;
      const giftBoost = tags.includes("gift") ? 2 : 0;
      return { item, score: shared * 3 + giftBoost };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);

  const giftFallback = others.filter((item) => item.tags?.includes("gift"));
  const merged = [...sameCategory, ...scored, ...giftFallback];
  const unique: Product[] = [];
  const seen = new Set<number>();
  for (const item of merged) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
    if (unique.length >= limit) break;
  }
  return unique;
}
