import type { ShopCategory } from "@/lib/products";

export type ShopViewMode = "grid" | "list";
export type ShopSortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name"
  | "weight-asc";

export type CategoryFilter = "All" | ShopCategory;

export type ShopQuickFilter = "gift" | "tourist" | "shelf-stable" | null;

export function buildShopUrl(params: {
  category?: CategoryFilter;
  query?: string;
  sort?: ShopSortOption;
  minPrice?: number | null;
  maxPrice?: number | null;
  favoritesOnly?: boolean;
  view?: ShopViewMode;
  quickFilter?: ShopQuickFilter;
}): string {
  const search = new URLSearchParams();

  if (params.category && params.category !== "All") {
    search.set("category", params.category);
  }
  if (params.query?.trim()) {
    search.set("q", params.query.trim());
  }
  if (params.sort && params.sort !== "featured") {
    search.set("sort", params.sort);
  }
  if (typeof params.minPrice === "number") {
    search.set("min", String(params.minPrice));
  }
  if (typeof params.maxPrice === "number") {
    search.set("max", String(params.maxPrice));
  }
  if (params.favoritesOnly) {
    search.set("fav", "1");
  }
  if (params.view && params.view === "list") {
    search.set("view", "list");
  }
  if (params.quickFilter) {
    search.set("pick", params.quickFilter);
  }

  const query = search.toString();
  return query ? `/shop?${query}` : "/shop";
}

export function parseOptionalNumber(value: string | null): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function parseQuickFilter(value: string | null): ShopQuickFilter {
  if (value === "gift" || value === "tourist" || value === "shelf-stable") {
    return value;
  }
  return null;
}
