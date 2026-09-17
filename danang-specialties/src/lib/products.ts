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
