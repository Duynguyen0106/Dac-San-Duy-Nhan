import tipsData from "../../data/tips.json";
import type { Product, ShopCategory } from "@/lib/products";
import { categoryToSlug } from "@/lib/products";

export type TipPost = {
  slug: string;
  titleVi: string;
  titleEn: string;
  excerptVi: string;
  excerptEn: string;
  date: string;
  coverImage: string;
  category?: string;
  /** Optional explicit product picks for “shop this” CTAs. */
  relatedProductIds?: number[];
  bodyVi: string[];
  bodyEn: string[];
};

/** Tip topic → shop catalog category (when one exists). */
export const TIP_CATEGORY_TO_SHOP: Record<string, ShopCategory> = {
  "Dried Seafood": "Dried Seafood",
  Snacks: "Snacks",
  "Cakes & Candy": "Cakes & Candy",
  "Rice Paper": "Rice Paper",
  "Tea & Coffee": "Tea & Coffee",
  "Cold Cuts": "Cold Cuts",
  Condiments: "Condiments",
  "Dried Fruit & Nuts": "Dried Fruit & Nuts",
  Gifts: "Gifts",
};

export const TIP_POSTS: TipPost[] = tipsData as TipPost[];

export function listTips(): TipPost[] {
  return [...TIP_POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

export function getTipBySlug(slug: string): TipPost | null {
  return TIP_POSTS.find((post) => post.slug === slug) ?? null;
}

export function listTipCategories(): string[] {
  const set = new Set<string>();
  for (const post of TIP_POSTS) {
    if (post.category) set.add(post.category);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function getTipShopCategory(tip: TipPost): ShopCategory | null {
  if (!tip.category) return null;
  return TIP_CATEGORY_TO_SHOP[tip.category] ?? null;
}

export function getTipShopHref(tip: TipPost): string {
  const shopCategory = getTipShopCategory(tip);
  if (shopCategory) return `/shop/${categoryToSlug(shopCategory)}`;
  if (tip.category === "Travel" || tip.category === "Local Guide") {
    return "/shop?pick=tourist";
  }
  if (tip.category === "Ordering") return "/how-to-order";
  return "/shop";
}

/** Products to feature under a tip for internal SEO + conversion. */
export function getTipRelatedProducts(
  tip: TipPost,
  catalog: Product[],
  limit = 4,
): Product[] {
  const byId = new Map(catalog.map((product) => [product.id, product]));
  const picked: Product[] = [];
  const seen = new Set<number>();

  const push = (product: Product | undefined) => {
    if (!product || seen.has(product.id) || picked.length >= limit) return;
    seen.add(product.id);
    picked.push(product);
  };

  for (const id of tip.relatedProductIds ?? []) {
    push(byId.get(id));
  }

  const shopCategory = getTipShopCategory(tip);
  if (shopCategory) {
    for (const product of catalog) {
      if (product.category === shopCategory) push(product);
    }
  } else if (tip.category === "Travel" || tip.category === "Local Guide") {
    for (const product of catalog) {
      if (product.tags?.includes("shelf-stable") || product.tags?.includes("tourist")) {
        push(product);
      }
    }
    for (const product of catalog) {
      if (product.tags?.includes("gift")) push(product);
    }
  } else {
    for (const product of catalog) {
      if (product.tags?.includes("gift")) push(product);
    }
  }

  return picked;
}
