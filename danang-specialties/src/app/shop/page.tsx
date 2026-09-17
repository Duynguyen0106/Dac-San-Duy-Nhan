"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/components/Providers";
import { useProducts } from "@/hooks/useProducts";
import {
  SHOP_CATEGORIES,
  categoryLabels,
  type ShopCategory,
} from "@/lib/products";

type CategoryFilter = "All" | ShopCategory;
type SortOption = "featured" | "price-asc" | "price-desc" | "name";

export default function ShopPage() {
  const { language } = useLanguage();
  const { products, loading, error, refresh } = useProducts();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");
  const isVi = language === "VI";

  const filters: { id: CategoryFilter; label: string }[] = [
    { id: "All", label: isVi ? "Tất cả" : "All" },
    ...SHOP_CATEGORIES.map((category) => ({
      id: category as CategoryFilter,
      label: isVi ? categoryLabels[category].vi : categoryLabels[category].en,
    })),
  ];

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    let next = products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      if (!matchesCategory) return false;
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
    if (sort === "price-asc") {
      next.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      next.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
      next.sort((a, b) => {
        const left = isVi ? a.name : a.nameEn;
        const right = isVi ? b.name : b.nameEn;
        return left.localeCompare(right, isVi ? "vi" : "en");
      });
    } else {
      next.sort((a, b) => a.id - b.id);
    }

    return next;
  }, [products, activeCategory, query, sort, isVi]);

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 bg-[linear-gradient(180deg,#f3f7f6_0%,#e8f1ef_45%,#efe8dc_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <nav className="mb-6 text-sm text-mist">
            <Link href="/" className="hover:text-sea">
              {isVi ? "Trang chủ" : "Home"}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-sea-deep">
              {isVi ? "Cửa hàng" : "Shop"}
            </span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-sea-deep sm:text-4xl">
                {isVi ? "Cửa Hàng Đặc Sản" : "Specialty Shop"}
              </h1>
              <p className="mt-3 text-mist">
                {isVi
                  ? "Tìm kiếm, lọc danh mục và sắp xếp toàn bộ sản phẩm Duy Nhân."
                  : "Search, filter, and sort the full Duy Nhân catalog."}
              </p>
            </div>
            <Link
              href="/admin"
              className="text-sm font-medium text-sea underline-offset-2 hover:underline"
            >
              {isVi ? "Quản trị sản phẩm" : "Manage products"}
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isVi
                    ? "Tìm theo tên, mô tả..."
                    : "Search by name or description..."
                }
                className="w-full border border-line bg-card py-2.5 pl-10 pr-3 text-sm text-sea-deep outline-none focus:border-sea"
              />
            </label>
            <label className="relative sm:w-56">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="w-full appearance-none border border-line bg-card py-2.5 pl-10 pr-8 text-sm text-sea-deep outline-none focus:border-sea"
              >
                <option value="featured">
                  {isVi ? "Nổi bật" : "Featured"}
                </option>
                <option value="price-asc">
                  {isVi ? "Giá thấp → cao" : "Price: low to high"}
                </option>
                <option value="price-desc">
                  {isVi ? "Giá cao → thấp" : "Price: high to low"}
                </option>
                <option value="name">
                  {isVi ? "Tên A → Z" : "Name A → Z"}
                </option>
              </select>
            </label>
          </div>

          <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:gap-10">
            <aside className="w-full shrink-0 lg:w-56">
              <h2 className="font-display text-lg font-semibold text-sea-deep">
                {isVi ? "Danh mục" : "Categories"}
              </h2>
              <ul className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:border lg:border-line lg:bg-card lg:p-2 lg:pb-2">
                {filters.map((filter) => {
                  const isActive = activeCategory === filter.id;
                  return (
                    <li key={filter.id} className="shrink-0 lg:block">
                      <button
                        type="button"
                        onClick={() => setActiveCategory(filter.id)}
                        className={`w-full px-3 py-2.5 text-left text-sm font-medium transition-colors lg:w-full ${
                          isActive
                            ? "bg-sea text-foam"
                            : "border border-line bg-card text-sea-deep hover:bg-foam lg:border-0"
                        }`}
                      >
                        {filter.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
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
              ) : filteredProducts.length === 0 && !loading ? (
                <p className="border border-line bg-card p-8 text-center text-mist">
                  {isVi
                    ? "Không tìm thấy sản phẩm phù hợp."
                    : "No matching products found."}
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      language={language}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-line bg-sea-deep text-foam">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-display text-lg font-semibold">Duy Nhân</p>
          <p className="text-sm text-foam/75">
            {isVi
              ? "Đặc sản Đà Nẵng — mang biển cả về nhà."
              : "Da Nang specialties — bring the coast home."}
          </p>
        </div>
      </footer>
    </div>
  );
}
