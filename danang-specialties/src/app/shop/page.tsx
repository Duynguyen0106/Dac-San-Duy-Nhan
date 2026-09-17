"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import {
  SHOP_CATEGORIES,
  categoryLabels,
  type Language,
  type ShopCategory,
} from "@/lib/products";

type CategoryFilter = "All" | ShopCategory;

export default function ShopPage() {
  const [language, setLanguage] = useState<Language>("VI");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const isVi = language === "VI";

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const filters: { id: CategoryFilter; label: string }[] = [
    { id: "All", label: isVi ? "Tất cả" : "All" },
    ...SHOP_CATEGORIES.map((category) => ({
      id: category as CategoryFilter,
      label: isVi ? categoryLabels[category].vi : categoryLabels[category].en,
    })),
  ];

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header language={language} onLanguageChange={setLanguage} />

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

          <div className="max-w-xl">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-sea-deep sm:text-4xl">
              {isVi ? "Cửa Hàng Đặc Sản" : "Specialty Shop"}
            </h1>
            <p className="mt-3 text-mist">
              {isVi
                ? "Lọc theo danh mục và khám phá toàn bộ sản phẩm từ Đà Nẵng."
                : "Filter by category and browse every specialty from Da Nang."}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:gap-10">
            <aside className="w-full shrink-0 lg:w-56">
              <h2 className="font-display text-lg font-semibold text-sea-deep">
                {isVi ? "Danh mục" : "Categories"}
              </h2>
              <ul className="mt-4 space-y-1 border border-line bg-card p-2">
                {filters.map((filter) => {
                  const isActive = activeCategory === filter.id;
                  return (
                    <li key={filter.id}>
                      <button
                        type="button"
                        onClick={() => setActiveCategory(filter.id)}
                        className={`w-full px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-sea text-foam"
                            : "text-sea-deep hover:bg-foam"
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
              <p className="mb-4 text-sm text-mist">
                {isVi
                  ? `${filteredProducts.length} sản phẩm`
                  : `${filteredProducts.length} products`}
              </p>

              {filteredProducts.length === 0 ? (
                <p className="border border-line bg-card p-8 text-center text-mist">
                  {isVi
                    ? "Không có sản phẩm trong danh mục này."
                    : "No products in this category."}
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
