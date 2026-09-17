"use client";

import { Suspense, useEffect, useMemo, useState, type ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Beef,
  Cookie,
  CupSoda,
  Droplets,
  Fish,
  Gift,
  Heart,
  LayoutGrid,
  List,
  Luggage,
  Package,
  RotateCcw,
  ScrollText,
  Search,
  SlidersHorizontal,
  Drumstick,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { useFavorites } from "@/context/FavoritesContext";
import { useLanguage } from "@/components/Providers";
import { useProducts } from "@/hooks/useProducts";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import {
  CONTACT_PRICING_ENABLED,
  SHOP_CATEGORIES,
  categoryLabels,
  formatPrice,
  getProductWeightGrams,
  type ShopCategory,
} from "@/lib/products";
import {
  buildShopUrl,
  parseOptionalNumber,
  parseQuickFilter,
  type CategoryFilter,
  type ShopQuickFilter,
  type ShopSortOption,
  type ShopViewMode,
} from "@/lib/shopFilters";

const CATEGORY_ICONS: Record<
  ShopCategory,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  "Dried Seafood": Fish,
  Snacks: Drumstick,
  "Cold Cuts": Beef,
  Condiments: Droplets,
  "Tea & Coffee": CupSoda,
  "Cakes & Candy": Cookie,
  "Rice Paper": ScrollText,
  "Dried Fruit & Nuts": Package,
  Gifts: Gift,
};

function isShopCategory(value: string | null): value is ShopCategory {
  return Boolean(
    value && (SHOP_CATEGORIES as readonly string[]).includes(value),
  );
}

function isSortOption(value: string | null): value is ShopSortOption {
  return (
    value === "featured" ||
    value === "price-asc" ||
    value === "price-desc" ||
    value === "name" ||
    value === "weight-asc"
  );
}

function ShopSkeleton({ view }: { view: ShopViewMode }) {
  if (view === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse border border-line bg-card/70"
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="aspect-[3/4] animate-pulse border border-line bg-card/70"
        />
      ))}
    </div>
  );
}

function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const { products, loading, error, refresh } = useProducts();
  const { favoriteIds, isFavorite } = useFavorites();
  const { ids: recentIds } = useRecentlyViewed();
  const isVi = language === "VI";

  const categoryFromUrl = searchParams.get("category");
  const queryFromUrl = searchParams.get("q") ?? "";
  const sortFromUrl = searchParams.get("sort");
  const viewFromUrl = searchParams.get("view");
  const minFromUrl = parseOptionalNumber(searchParams.get("min"));
  const maxFromUrl = parseOptionalNumber(searchParams.get("max"));
  const favFromUrl = searchParams.get("fav") === "1";
  const pickFromUrl = parseQuickFilter(searchParams.get("pick"));

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(
    isShopCategory(categoryFromUrl) ? categoryFromUrl : "All",
  );
  const [query, setQuery] = useState(queryFromUrl);
  const [sort, setSort] = useState<ShopSortOption>(
    isSortOption(sortFromUrl) ? sortFromUrl : "featured",
  );
  const [view, setView] = useState<ShopViewMode>(
    viewFromUrl === "list" ? "list" : "grid",
  );
  const [minPrice, setMinPrice] = useState<string>(
    minFromUrl != null ? String(minFromUrl) : "",
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    maxFromUrl != null ? String(maxFromUrl) : "",
  );
  const [favoritesOnly, setFavoritesOnly] = useState(favFromUrl);
  const [quickFilter, setQuickFilter] = useState<ShopQuickFilter>(pickFromUrl);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setActiveCategory(
      isShopCategory(categoryFromUrl) ? categoryFromUrl : "All",
    );
    setQuery(queryFromUrl);
    setSort(isSortOption(sortFromUrl) ? sortFromUrl : "featured");
    setView(viewFromUrl === "list" ? "list" : "grid");
    setMinPrice(minFromUrl != null ? String(minFromUrl) : "");
    setMaxPrice(maxFromUrl != null ? String(maxFromUrl) : "");
    setFavoritesOnly(favFromUrl);
    setQuickFilter(pickFromUrl);
  }, [
    categoryFromUrl,
    queryFromUrl,
    sortFromUrl,
    viewFromUrl,
    minFromUrl,
    maxFromUrl,
    favFromUrl,
    pickFromUrl,
  ]);

  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((p) => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  const parsedMin = parseOptionalNumber(minPrice || null);
  const parsedMax = parseOptionalNumber(maxPrice || null);

  const syncUrl = (next: {
    category?: CategoryFilter;
    query?: string;
    sort?: ShopSortOption;
    minPrice?: number | null;
    maxPrice?: number | null;
    favoritesOnly?: boolean;
    view?: ShopViewMode;
    quickFilter?: ShopQuickFilter;
  }) => {
    const url = buildShopUrl({
      category: next.category ?? activeCategory,
      query: next.query ?? query,
      sort: next.sort ?? sort,
      minPrice:
        next.minPrice !== undefined
          ? next.minPrice
          : parseOptionalNumber(minPrice || null),
      maxPrice:
        next.maxPrice !== undefined
          ? next.maxPrice
          : parseOptionalNumber(maxPrice || null),
      favoritesOnly: next.favoritesOnly ?? favoritesOnly,
      view: next.view ?? view,
      quickFilter:
        next.quickFilter !== undefined ? next.quickFilter : quickFilter,
    });
    router.replace(url, { scroll: false });
  };

  const filters: { id: CategoryFilter; label: string }[] = [
    { id: "All", label: isVi ? "Tất cả" : "All" },
    ...SHOP_CATEGORIES.map((category) => ({
      id: category as CategoryFilter,
      label: isVi ? categoryLabels[category].vi : categoryLabels[category].en,
    })),
  ];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    for (const category of SHOP_CATEGORIES) {
      counts[category] = products.filter((p) => p.category === category).length;
    }
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    let next = products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      if (!matchesCategory) return false;

      if (favoritesOnly && !isFavorite(product.id)) return false;

      if (quickFilter && !product.tags?.includes(quickFilter)) return false;

      if (
        !CONTACT_PRICING_ENABLED &&
        parsedMin != null &&
        product.price < parsedMin
      ) {
        return false;
      }
      if (
        !CONTACT_PRICING_ENABLED &&
        parsedMax != null &&
        product.price > parsedMax
      ) {
        return false;
      }

      if (!normalizedQuery) return true;

      const haystack = [
        product.name,
        product.nameEn,
        product.category,
        product.description,
        product.descriptionEn,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    next = [...next];
    if (sort === "price-asc" && !CONTACT_PRICING_ENABLED) {
      next.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc" && !CONTACT_PRICING_ENABLED) {
      next.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
      next.sort((a, b) => {
        const left = isVi ? a.name : a.nameEn;
        const right = isVi ? b.name : b.nameEn;
        return left.localeCompare(right, isVi ? "vi" : "en");
      });
    } else if (sort === "weight-asc") {
      next.sort(
        (a, b) => getProductWeightGrams(a) - getProductWeightGrams(b),
      );
    } else {
      next.sort((a, b) => a.id - b.id);
    }

    return next;
  }, [
    products,
    activeCategory,
    query,
    sort,
    isVi,
    favoritesOnly,
    isFavorite,
    quickFilter,
    parsedMin,
    parsedMax,
  ]);

  const recentProducts = useMemo(() => {
    return recentIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is NonNullable<typeof product> =>
        Boolean(product),
      )
      .slice(0, 4);
  }, [recentIds, products]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];

    if (activeCategory !== "All") {
      chips.push({
        key: "category",
        label: isVi
          ? categoryLabels[activeCategory].vi
          : categoryLabels[activeCategory].en,
        clear: () => {
          setActiveCategory("All");
          syncUrl({ category: "All" });
        },
      });
    }
    if (query.trim()) {
      chips.push({
        key: "query",
        label: `“${query.trim()}”`,
        clear: () => {
          setQuery("");
          syncUrl({ query: "" });
        },
      });
    }
    if (!CONTACT_PRICING_ENABLED && parsedMin != null) {
      chips.push({
        key: "min",
        label: isVi
          ? `Từ ${formatPrice(parsedMin, language)}`
          : `From ${formatPrice(parsedMin, language)}`,
        clear: () => {
          setMinPrice("");
          syncUrl({ minPrice: null });
        },
      });
    }
    if (!CONTACT_PRICING_ENABLED && parsedMax != null) {
      chips.push({
        key: "max",
        label: isVi
          ? `Đến ${formatPrice(parsedMax, language)}`
          : `To ${formatPrice(parsedMax, language)}`,
        clear: () => {
          setMaxPrice("");
          syncUrl({ maxPrice: null });
        },
      });
    }
    if (favoritesOnly) {
      chips.push({
        key: "fav",
        label: isVi ? "Yêu thích" : "Favorites",
        clear: () => {
          setFavoritesOnly(false);
          syncUrl({ favoritesOnly: false });
        },
      });
    }
    if (quickFilter === "gift") {
      chips.push({
        key: "pick",
        label: isVi ? "Quà biếu" : "Gift picks",
        clear: () => {
          setQuickFilter(null);
          syncUrl({ quickFilter: null });
        },
      });
    } else if (quickFilter === "tourist") {
      chips.push({
        key: "pick",
        label: isVi ? "Cho khách du lịch" : "Travel picks",
        clear: () => {
          setQuickFilter(null);
          syncUrl({ quickFilter: null });
        },
      });
    } else if (quickFilter === "shelf-stable") {
      chips.push({
        key: "pick",
        label: isVi ? "Dễ mang đi" : "Travel-friendly",
        clear: () => {
          setQuickFilter(null);
          syncUrl({ quickFilter: null });
        },
      });
    }

    return chips;
  }, [
    activeCategory,
    query,
    parsedMin,
    parsedMax,
    favoritesOnly,
    quickFilter,
    isVi,
    language,
  ]);

  const clearAllFilters = () => {
    setActiveCategory("All");
    setQuery("");
    setSort("featured");
    setMinPrice("");
    setMaxPrice("");
    setFavoritesOnly(false);
    setQuickFilter(null);
    setView("grid");
    router.replace("/shop", { scroll: false });
  };

  const selectCategory = (category: CategoryFilter) => {
    setActiveCategory(category);
    syncUrl({ category });
    setMobileFiltersOpen(false);
  };

  const applyPriceFilter = () => {
    syncUrl({
      minPrice: parseOptionalNumber(minPrice || null),
      maxPrice: parseOptionalNumber(maxPrice || null),
    });
  };

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-sea-deep">
          {isVi ? "Danh mục" : "Categories"}
        </h2>
        <ul className="mt-3 space-y-1 border border-line bg-card p-2">
          {filters.map((filter) => {
            const isActive = activeCategory === filter.id;
            const count = categoryCounts[filter.id] ?? 0;
            const Icon =
              filter.id === "All"
                ? LayoutGrid
                : CATEGORY_ICONS[filter.id as ShopCategory];
            return (
              <li key={filter.id}>
                <button
                  type="button"
                  onClick={() => selectCategory(filter.id)}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sea text-foam"
                      : "text-sea-deep hover:bg-foam"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span className="min-w-0 flex-1 truncate">{filter.label}</span>
                  <span
                    className={`tabular-nums text-xs ${
                      isActive ? "text-foam/80" : "text-mist"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {!CONTACT_PRICING_ENABLED ? (
        <div className="border border-line bg-card p-4">
          <h3 className="text-sm font-semibold text-sea-deep">
            {isVi ? "Khoảng giá" : "Price range"}
          </h3>
          <p className="mt-1 text-xs text-mist">
            {isVi
              ? `Catalog: ${formatPrice(priceBounds.min, language)} – ${formatPrice(priceBounds.max, language)}`
              : `Catalog: ${formatPrice(priceBounds.min, language)} – ${formatPrice(priceBounds.max, language)}`}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="block text-xs text-mist">
              {isVi ? "Từ" : "Min"}
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={applyPriceFilter}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyPriceFilter();
                }}
                placeholder={String(priceBounds.min || "")}
                className="mt-1 w-full border border-line bg-background px-2.5 py-2 text-sm text-sea-deep outline-none focus:border-sea"
              />
            </label>
            <label className="block text-xs text-mist">
              {isVi ? "Đến" : "Max"}
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={applyPriceFilter}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyPriceFilter();
                }}
                placeholder={String(priceBounds.max || "")}
                className="mt-1 w-full border border-line bg-background px-2.5 py-2 text-sm text-sea-deep outline-none focus:border-sea"
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="border border-line bg-card p-4">
          <h3 className="text-sm font-semibold text-sea-deep">
            {isVi ? "Giá" : "Pricing"}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            {isVi
              ? "Giá liên hệ — shop báo qua Zalo / Messenger / WhatsApp khi bạn đặt hàng."
              : "Contact for price — we quote on Zalo / Messenger / WhatsApp when you order."}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          const next = !favoritesOnly;
          setFavoritesOnly(next);
          syncUrl({ favoritesOnly: next });
        }}
        className={`flex w-full items-center justify-between gap-3 border px-3 py-3 text-sm font-medium transition-colors ${
          favoritesOnly
            ? "border-sun bg-sun text-white"
            : "border-line bg-card text-sea-deep hover:border-sun hover:text-sun"
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <Heart
            className="h-4 w-4"
            fill={favoritesOnly ? "currentColor" : "none"}
          />
          {isVi ? "Chỉ yêu thích" : "Favorites only"}
        </span>
        <span className="tabular-nums text-xs opacity-80">
          {favoriteIds.length}
        </span>
      </button>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-sea-deep">
          {isVi ? "Gợi ý mua" : "Shopping picks"}
        </h3>
        {(
          [
            {
              id: "gift" as const,
              icon: Gift,
              label: isVi ? "Quà biếu" : "Gift picks",
            },
            {
              id: "tourist" as const,
              icon: Luggage,
              label: isVi ? "Cho khách du lịch" : "Travel picks",
            },
            {
              id: "shelf-stable" as const,
              icon: Package,
              label: isVi ? "Dễ mang đi" : "Travel-friendly",
            },
          ] as const
        ).map((pick) => {
          const Icon = pick.icon;
          const active = quickFilter === pick.id;
          return (
            <button
              key={pick.id}
              type="button"
              onClick={() => {
                const next = active ? null : pick.id;
                setQuickFilter(next);
                syncUrl({ quickFilter: next });
              }}
              className={`flex w-full items-center gap-2 border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                active
                  ? "border-sea bg-sea text-foam"
                  : "border-line bg-card text-sea-deep hover:border-sea"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {pick.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 bg-[linear-gradient(180deg,#f3f7f6_0%,#e8f1ef_40%,#efe8dc_100%)]">
        <section className="relative min-h-[16rem] overflow-hidden border-b border-line/70 sm:min-h-[18rem]">
          <div className="absolute inset-0">
            <Image
              src="/brand/shop-stall-hero.jpg"
              alt={
                isVi
                  ? "Quầy đặc sản Duy Nhân tại Chợ Cồn"
                  : "Duy Nhân specialty stall at Chợ Cồn"
              }
              fill
              priority
              className="object-cover object-[center_30%]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sea-deep/88 via-sea-deep/65 to-sea-deep/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-sea-deep/50 via-transparent to-sea-deep/20" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
            <nav className="mb-5 text-sm text-foam/75">
              <Link href="/" className="hover:text-white">
                {isVi ? "Trang chủ" : "Home"}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foam">
                {isVi ? "Cửa hàng" : "Shop"}
              </span>
            </nav>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-sun">
                  Duy Nhân · Kiốt số 6
                </p>
                <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {isVi ? "Cửa Hàng Đặc Sản" : "Specialty Shop"}
                </h1>
                <p className="mt-3 max-w-xl text-foam/90">
                  {isVi
                    ? "Lọc theo danh mục và yêu thích — giá liên hệ qua Zalo / Messenger / WhatsApp."
                    : "Filter by category and favorites — prices confirmed on Zalo / Messenger / WhatsApp."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="border border-foam/30 bg-sea-deep/40 px-3 py-2 text-foam backdrop-blur-sm">
                  {loading
                    ? "…"
                    : isVi
                      ? `${products.length} món trong catalog`
                      : `${products.length} items in catalog`}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="sticky top-[6.5rem] z-30 -mx-4 border-y border-line/70 bg-background/95 px-4 py-3 backdrop-blur-md sm:top-[7rem] sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
            <div className="flex flex-col gap-3 lg:flex-row">
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    const value = e.target.value;
                    setQuery(value);
                    syncUrl({ query: value });
                  }}
                  placeholder={
                    isVi
                      ? "Tìm theo tên, mô tả..."
                      : "Search by name or description..."
                  }
                  className="w-full border border-line bg-card py-2.5 pl-10 pr-10 text-sm text-sea-deep outline-none focus:border-sea"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      syncUrl({ query: "" });
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-mist hover:text-sea-deep"
                    aria-label={isVi ? "Xóa tìm kiếm" : "Clear search"}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>

              <div className="flex flex-wrap gap-2">
                <label className="relative min-w-[11rem] flex-1 sm:flex-none">
                  <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
                  <select
                    value={sort}
                    onChange={(e) => {
                      const next = e.target.value as ShopSortOption;
                      setSort(next);
                      syncUrl({ sort: next });
                    }}
                    className="w-full appearance-none border border-line bg-card py-2.5 pl-10 pr-8 text-sm text-sea-deep outline-none focus:border-sea"
                  >
                    <option value="featured">
                      {isVi ? "Nổi bật" : "Featured"}
                    </option>
                    {!CONTACT_PRICING_ENABLED ? (
                      <>
                        <option value="price-asc">
                          {isVi ? "Giá thấp → cao" : "Price: low to high"}
                        </option>
                        <option value="price-desc">
                          {isVi ? "Giá cao → thấp" : "Price: high to low"}
                        </option>
                      </>
                    ) : null}
                    <option value="name">
                      {isVi ? "Tên A → Z" : "Name A → Z"}
                    </option>
                    <option value="weight-asc">
                      {isVi ? "Nhẹ → nặng" : "Light → heavy"}
                    </option>
                  </select>
                </label>

                <div className="flex overflow-hidden border border-line bg-card">
                  <button
                    type="button"
                    onClick={() => {
                      setView("grid");
                      syncUrl({ view: "grid" });
                    }}
                    aria-pressed={view === "grid"}
                    aria-label={isVi ? "Lưới" : "Grid view"}
                    className={`px-3 py-2.5 transition-colors ${
                      view === "grid"
                        ? "bg-sea text-foam"
                        : "text-sea-deep hover:bg-foam"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView("list");
                      syncUrl({ view: "list" });
                    }}
                    aria-pressed={view === "list"}
                    aria-label={isVi ? "Danh sách" : "List view"}
                    className={`px-3 py-2.5 transition-colors ${
                      view === "list"
                        ? "bg-sea text-foam"
                        : "text-sea-deep hover:bg-foam"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex items-center gap-2 border border-line bg-card px-3 py-2.5 text-sm font-medium text-sea-deep lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {isVi ? "Bộ lọc" : "Filters"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {(
              [
                {
                  id: "tourist" as const,
                  label: isVi ? "Du lịch" : "Travel",
                },
                {
                  id: "gift" as const,
                  label: isVi ? "Quà biếu" : "Gifts",
                },
                {
                  id: "shelf-stable" as const,
                  label: isVi ? "Dễ mang" : "Easy pack",
                },
              ] as const
            ).map((pick) => {
              const active = quickFilter === pick.id;
              return (
                <button
                  key={pick.id}
                  type="button"
                  onClick={() => {
                    const next = active ? null : pick.id;
                    setQuickFilter(next);
                    syncUrl({ quickFilter: next });
                  }}
                  className={`shrink-0 border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-sea bg-sea text-foam"
                      : "border-line bg-card text-sea-deep"
                  }`}
                >
                  {pick.label}
                </button>
              );
            })}
          </div>

          {activeChips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  className="inline-flex items-center gap-1.5 border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-sea-deep transition-colors hover:border-sea"
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-sea hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                {isVi ? "Xóa lọc" : "Clear filters"}
              </button>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-10">
            <aside className="hidden w-full shrink-0 lg:block lg:w-64">
              {filterPanel}
            </aside>

            <section className="min-w-0 flex-1">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-mist">
                  {loading
                    ? isVi
                      ? "Đang tải..."
                      : "Loading..."
                    : isVi
                      ? `${filteredProducts.length} sản phẩm`
                      : `${filteredProducts.length} products`}
                </p>
                {error && (
                  <button
                    type="button"
                    onClick={() => void refresh()}
                    className="text-sm font-medium text-sea hover:underline"
                  >
                    {isVi ? "Thử lại" : "Retry"}
                  </button>
                )}
              </div>

              {error ? (
                <p className="border border-red-200 bg-red-50 p-8 text-center text-sm text-red-800">
                  {error}
                </p>
              ) : loading ? (
                <ShopSkeleton view={view} />
              ) : filteredProducts.length === 0 ? (
                <div className="border border-line bg-card px-6 py-12 text-center">
                  <p className="font-display text-xl text-sea-deep">
                    {isVi
                      ? "Không tìm thấy sản phẩm phù hợp."
                      : "No matching products found."}
                  </p>
                  <p className="mt-2 text-sm text-mist">
                    {isVi
                      ? "Thử đổi từ khóa hoặc danh mục."
                      : "Try a different keyword or category."}
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-5 inline-flex items-center gap-2 bg-sea px-5 py-2.5 text-sm font-semibold text-foam hover:bg-sea-deep"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {isVi ? "Xóa tất cả bộ lọc" : "Clear all filters"}
                  </button>
                </div>
              ) : (
                <div
                  className={
                    view === "list"
                      ? "space-y-4"
                      : "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                  }
                >
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-soft-rise"
                      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
                    >
                      <ProductCard
                        product={product}
                        language={language}
                        variant={view}
                      />
                    </div>
                  ))}
                </div>
              )}

              {recentProducts.length > 0 && (
                <div className="mt-12 border-t border-line pt-10">
                  <div className="mb-5 flex items-end justify-between gap-3">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-sea-deep">
                        {isVi ? "Vừa xem" : "Recently viewed"}
                      </h2>
                      <p className="mt-1 text-sm text-mist">
                        {isVi
                          ? "Tiếp tục từ những món bạn vừa mở."
                          : "Pick up where you left off."}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {recentProducts.map((product) => (
                      <ProductCard
                        key={`recent-${product.id}`}
                        product={product}
                        language={language}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label={isVi ? "Đóng bộ lọc" : "Close filters"}
            className="absolute inset-0 bg-sea-deep/45"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="font-display text-lg font-semibold text-sea-deep">
                {isVi ? "Bộ lọc" : "Filters"}
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-mist hover:text-sea-deep"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{filterPanel}</div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-col bg-background text-foreground">
          <Header />
          <main className="flex-1 bg-[linear-gradient(180deg,#f3f7f6_0%,#e8f1ef_45%,#efe8dc_100%)]">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              <p className="text-mist">Loading shop...</p>
            </div>
          </main>
          <SiteFooter />
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
