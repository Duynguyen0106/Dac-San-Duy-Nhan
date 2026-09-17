"use client";

import { useState } from "react";
import Image from "next/image";
import { Fish, Cookie, CupSoda, Drumstick } from "lucide-react";
import Header from "@/components/Header";
import { products } from "@/data/products";

type Language = "VI" | "EN";

const categories = [
  {
    id: "dried-seafood",
    nameVi: "Hải Sản Khô",
    nameEn: "Dried Seafood",
    descriptionVi: "Cá, mực và hải sản phơi khô từ biển miền Trung.",
    descriptionEn: "Sun-dried fish, squid, and coastal seafood.",
    icon: Fish,
  },
  {
    id: "jerky-snacks",
    nameVi: "Bò Khô & Ăn Vặt",
    nameEn: "Jerky & Snacks",
    descriptionVi: "Bò khô đậm vị và món ăn vặt mang hương Đà Nẵng.",
    descriptionEn: "Savory jerky and snacks with Da Nang character.",
    icon: Drumstick,
  },
  {
    id: "tea",
    nameVi: "Trà",
    nameEn: "Tea",
    descriptionVi: "Trà sâm dứa và thức uống thanh mát quê nhà.",
    descriptionEn: "Ginseng pineapple tea and refreshing local blends.",
    icon: CupSoda,
  },
  {
    id: "traditional-cakes",
    nameVi: "Bánh Truyền Thống",
    nameEn: "Traditional Cakes",
    descriptionVi: "Bánh đặc sản làm thủ công theo công thức miền Trung.",
    descriptionEn: "Handcrafted cakes from Central Vietnam recipes.",
    icon: Cookie,
  },
];

const formatPrice = (price: number, language: Language) =>
  new Intl.NumberFormat(language === "VI" ? "vi-VN" : "en-US").format(price) +
  "đ";

const bestSellers = products.slice(0, 4);

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1674296067534-0f9769040781?auto=format&fit=crop&w=2400&q=80";

export default function Home() {
  const [language, setLanguage] = useState<Language>("VI");
  const isVi = language === "VI";

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header language={language} onLanguageChange={setLanguage} />

      <main className="flex-1">
        {/* Hero — full-bleed coastal scene */}
        <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden sm:min-h-[calc(100svh-4.5rem)]">
          <div className="absolute inset-0">
            <Image
              src={HERO_IMAGE}
              alt={
                isVi
                  ? "Bãi biển Đà Nẵng lúc bình minh"
                  : "Da Nang beach at sunrise"
              }
              fill
              priority
              className="animate-gentle-zoom object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sea-deep/80 via-sea-deep/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-sea-deep/55 via-transparent to-sea-deep/15" />
          </div>

          <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:min-h-[calc(100svh-4.5rem)] sm:px-6 sm:pb-24">
            <p className="animate-fade-up font-display text-3xl font-semibold tracking-tight text-foam sm:text-4xl md:text-5xl">
              Duy Nhân
            </p>
            <h1 className="animate-fade-up delay-100 mt-3 max-w-2xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              {isVi ? "Hương Vị Biển Cả Đà Nẵng" : "Taste of Da Nang's Sea"}
            </h1>
            <p className="animate-fade-up delay-200 mt-4 max-w-md text-base leading-relaxed text-foam/90 sm:text-lg">
              {isVi
                ? "Đặc sản chọn lọc từ thành phố biển — mang hương vị quê nhà đến tận tay bạn."
                : "Handpicked specialties from the coastal city — hometown flavor, delivered to you."}
            </p>
            <div className="animate-fade-up delay-300 mt-8">
              <a
                href="#best-sellers"
                className="inline-flex items-center bg-sun px-7 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-sun-hover sm:text-base"
              >
                {isVi ? "Mua Ngay" : "Shop Now"}
              </a>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section
          id="categories"
          className="relative border-b border-line bg-[linear-gradient(180deg,#f3f7f6_0%,#e8f1ef_100%)]"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-sea-deep sm:text-4xl">
                {isVi ? "Danh Mục Nổi Bật" : "Featured Categories"}
              </h2>
              <p className="mt-3 text-mist">
                {isVi
                  ? "Khám phá những nhóm đặc sản được yêu thích nhất từ Đà Nẵng."
                  : "Explore the most loved specialty groups from Da Nang."}
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    type="button"
                    className="animate-soft-rise group flex flex-col items-start border border-line bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-sea hover:shadow-[0_12px_32px_-16px_rgba(15,92,108,0.35)]"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <span className="flex h-11 w-11 items-center justify-center bg-foam text-sea transition-colors group-hover:bg-sea group-hover:text-foam">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="mt-5 font-display text-xl font-semibold text-sea-deep">
                      {isVi ? category.nameVi : category.nameEn}
                    </span>
                    <span className="mt-2 text-sm leading-relaxed text-mist">
                      {isVi ? category.descriptionVi : category.descriptionEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Best Sellers */}
        <section
          id="best-sellers"
          className="bg-[radial-gradient(ellipse_at_top,_#eaf4f2_0%,_#f3f7f6_55%,_#efe8dc_100%)]"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-sea-deep sm:text-4xl">
                {isVi ? "Bán Chạy Nhất" : "Best Sellers"}
              </h2>
              <p className="mt-3 text-mist">
                {isVi
                  ? "Những món được khách lựa chọn nhiều nhất tuần này."
                  : "The specialties customers choose most this week."}
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellers.map((product, index) => (
                <article
                  key={product.id}
                  className="animate-soft-rise flex flex-col overflow-hidden border border-line bg-card transition-transform duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="relative aspect-square overflow-hidden bg-foam">
                    <Image
                      src={product.image}
                      alt={isVi ? product.name : product.nameEn}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-lg font-semibold text-sea-deep">
                      {isVi ? product.name : product.nameEn}
                    </h3>
                    <p className="mt-1 text-sm text-mist">{product.weight}</p>
                    <p className="mt-3 text-base font-semibold text-sea">
                      {formatPrice(product.price, language)}
                    </p>
                    <button
                      type="button"
                      className="mt-4 w-full bg-sea px-4 py-2.5 text-sm font-semibold text-foam transition-colors hover:bg-sea-deep"
                    >
                      {isVi ? "Thêm vào giỏ" : "Add to Cart"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
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
