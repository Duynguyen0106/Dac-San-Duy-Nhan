"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Fish,
  Cookie,
  CupSoda,
  Drumstick,
  Beef,
  Droplets,
  ScrollText,
  Package,
  Gift,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { useTranslation } from "@/hooks/useTranslation";
import { useProducts } from "@/hooks/useProducts";

const categoryMeta = [
  { id: "dried-seafood", icon: Fish },
  { id: "snacks", icon: Drumstick },
  { id: "cold-cuts", icon: Beef },
  { id: "condiments", icon: Droplets },
  { id: "tea-coffee", icon: CupSoda },
  { id: "cakes-candy", icon: Cookie },
  { id: "rice-paper", icon: ScrollText },
  { id: "dried-fruit-nuts", icon: Package },
  { id: "oils-souvenirs", icon: Sparkles },
  { id: "gifts", icon: Gift },
] as const;

const HERO_IMAGE = "/brand/shop-stall-hero.jpg";
const STALL_IMAGE = "/brand/shop-stall-enhanced.jpg";

export default function Home() {
  const { t, language } = useTranslation();
  const { products } = useProducts();
  const bestSellers = products.slice(0, 8);
  const travelPicks = products
    .filter((product) => product.tags?.includes("tourist"))
    .slice(0, 4);

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
              className="animate-gentle-zoom object-cover object-[center_35%]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sea-deep/85 via-sea-deep/50 to-sea-deep/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-sea-deep/70 via-transparent to-sea-deep/25" />
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

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryMeta.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.id}
                    href={`/shop/${category.id}`}
                    className="animate-soft-rise group flex flex-col items-start border border-line bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-sea hover:shadow-[0_12px_32px_-16px_rgba(15,92,108,0.35)]"
                    style={{ animationDelay: `${index * 0.06}s` }}
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
          id="travel-gifts"
          className="border-b border-line bg-[linear-gradient(135deg,#0f5c6c_0%,#0a3d48_55%,#1b4a3a_100%)]"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {t("home.giftTitle")}
                </h2>
                <p className="mt-3 text-foam/85">{t("home.giftSubtitle")}</p>
              </div>
              <Link
                href="/shop?pick=tourist"
                className="inline-flex items-center bg-sun px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sun-hover"
              >
                {t("home.giftCta")}
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {travelPicks.map((product) => (
                <ProductCard
                  key={`gift-${product.id}`}
                  product={product}
                  language={language}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          id="visit-stall"
          className="relative overflow-hidden border-b border-line"
        >
          <div className="absolute inset-0">
            <Image
              src={STALL_IMAGE}
              alt={t("home.stallAlt")}
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sea-deep/88 via-sea-deep/55 to-sea-deep/20" />
          </div>
          <div className="relative mx-auto flex min-h-[22rem] max-w-6xl flex-col justify-end px-4 py-14 sm:min-h-[26rem] sm:px-6 sm:py-16">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-sun">
              {t("home.stallEyebrow")}
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("home.stallTitle")}
            </h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-foam/90">
              {t("home.stallSubtitle")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center bg-sun px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sun-hover"
              >
                {t("home.stallCta")}
              </Link>
              <Link
                href="/shop?pick=tourist"
                className="inline-flex items-center border border-foam/40 bg-sea-deep/30 px-6 py-3 text-sm font-semibold text-foam backdrop-blur-sm transition-colors hover:border-foam hover:bg-sea-deep/50"
              >
                {t("home.giftCta")}
              </Link>
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
