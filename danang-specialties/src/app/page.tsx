"use client";

import Image from "next/image";
import Link from "next/link";
import { Fish, Cookie, CupSoda, Drumstick } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { useTranslation } from "@/hooks/useTranslation";
import { useProducts } from "@/hooks/useProducts";

const categoryMeta = [
  { id: "dried-seafood", icon: Fish },
  { id: "jerky-snacks", icon: Drumstick },
  { id: "tea", icon: CupSoda },
  { id: "traditional-cakes", icon: Cookie },
] as const;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1674296067534-0f9769040781?auto=format&fit=crop&w=2400&q=80";

export default function Home() {
  const { t, language } = useTranslation();
  const { products } = useProducts();
  const bestSellers = products.slice(0, 4);

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden sm:min-h-[calc(100svh-4.5rem)]">
          <div className="absolute inset-0">
            <Image
              src={HERO_IMAGE}
              alt={t("home.heroAlt")}
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
              {t("common.brandShort")}
            </p>
            <h1 className="animate-fade-up delay-100 mt-3 max-w-2xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              {t("home.heroHeadline")}
            </h1>
            <p className="animate-fade-up delay-200 mt-4 max-w-md text-base leading-relaxed text-foam/90 sm:text-lg">
              {t("home.heroSubtitle")}
            </p>
            <div className="animate-fade-up delay-300 mt-8">
              <Link
                href="/shop"
                className="inline-flex items-center bg-sun px-7 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-sun-hover sm:text-base"
              >
                {t("home.shopNow")}
              </Link>
            </div>
          </div>
        </section>

        <section
          id="categories"
          className="relative border-b border-line bg-[linear-gradient(180deg,#f3f7f6_0%,#e8f1ef_100%)]"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-sea-deep sm:text-4xl">
                {t("home.categoriesTitle")}
              </h2>
              <p className="mt-3 text-mist">{t("home.categoriesSubtitle")}</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categoryMeta.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.id}
                    href="/shop"
                    className="animate-soft-rise group flex flex-col items-start border border-line bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-sea hover:shadow-[0_12px_32px_-16px_rgba(15,92,108,0.35)]"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <span className="flex h-11 w-11 items-center justify-center bg-foam text-sea transition-colors group-hover:bg-sea group-hover:text-foam">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="mt-5 font-display text-xl font-semibold text-sea-deep">
                      {t(`home.categories.${category.id}.name`)}
                    </span>
                    <span className="mt-2 text-sm leading-relaxed text-mist">
                      {t(`home.categories.${category.id}.description`)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="best-sellers"
          className="bg-[radial-gradient(ellipse_at_top,_#eaf4f2_0%,_#f3f7f6_55%,_#efe8dc_100%)]"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-sea-deep sm:text-4xl">
                {t("home.bestSellersTitle")}
              </h2>
              <p className="mt-3 text-mist">{t("home.bestSellersSubtitle")}</p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellers.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  language={language}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
