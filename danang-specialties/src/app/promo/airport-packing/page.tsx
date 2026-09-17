"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { useProducts } from "@/hooks/useProducts";
import { useTranslation } from "@/hooks/useTranslation";

const FEATURED_IDS = [1, 15, 23, 42, 63, 70];

export default function AirportPackingPromoPage() {
  const { language } = useTranslation();
  const { products } = useProducts();
  const isVi = language === "VI";

  const featured = FEATURED_IDS.map((id) =>
    products.find((product) => product.id === id),
  ).filter((product): product is NonNullable<typeof product> => Boolean(product));

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <section className="relative min-h-[70vh] overflow-hidden">
          <Image
            src="/brand/shop-stall-hero.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,42,48,0.78)_0%,rgba(8,42,48,0.45)_55%,rgba(8,42,48,0.25)_100%)]" />
          <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 sm:pb-20">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-foam/80">
              Duy Nhân
            </p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {isVi
                ? "Set mang máy bay từ Đà Nẵng"
                : "Airport packing set from Da Nang"}
            </h1>
            <p className="mt-4 max-w-xl text-base text-foam/90 sm:text-lg">
              {isVi
                ? "Hải sản khô, bánh mè, trà và trái cây sấy — nhẹ vali, dễ giải thích, đóng gói tại kiốt 90 Hùng Vương."
                : "Dried seafood, sesame crisps, tea, and dried fruit — light for luggage, easy to explain, packed at 90 Hung Vuong."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop?pick=tourist"
                className="bg-sun px-5 py-3 text-sm font-semibold text-white hover:bg-sun-hover"
              >
                {isVi ? "Xem món mang đi" : "Browse travel picks"}
              </Link>
              <Link
                href="/tips/pack-da-nang-specialties-for-flights"
                className="border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                {isVi ? "Mẹo đóng gói" : "Packing tips"}
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#f3f7f6_0%,#eaf3f1_50%,#f5efe6_100%)] px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl font-semibold text-sea-deep sm:text-3xl">
              {isVi ? "Gợi ý trong set" : "Suggested for the set"}
            </h2>
            <p className="mt-2 max-w-2xl text-mist">
              {isVi
                ? "Chọn vài món khô, thêm vào giỏ, rồi gửi đơn qua Zalo/WhatsApp trước giờ bay."
                : "Pick a few dry items, add to cart, then confirm on Zalo/WhatsApp before your flight."}
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} language={language} />
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/shop/gifts"
                className="bg-sea px-5 py-3 text-sm font-semibold text-foam hover:bg-sea-deep"
              >
                {isVi ? "Xem hộp quà" : "See gift boxes"}
              </Link>
              <Link
                href="/how-to-order"
                className="border border-line bg-card px-5 py-3 text-sm font-semibold text-sea-deep hover:border-sea"
              >
                {isVi ? "Cách đặt hàng" : "How to order"}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
