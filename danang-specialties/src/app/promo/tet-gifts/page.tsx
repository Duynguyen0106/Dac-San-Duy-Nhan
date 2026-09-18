"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { useProducts } from "@/hooks/useProducts";
import { useTranslation } from "@/hooks/useTranslation";

/** Gift baskets + a few shelf-stable add-ons that fill a Tet set. */
const FEATURED_IDS = [72, 71, 70, 73, 42, 23];

export default function TetGiftsPromoPage() {
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
            src="/products/gio-qua-tet-real.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(42,18,12,0.82)_0%,rgba(42,18,12,0.5)_50%,rgba(42,18,12,0.28)_100%)]" />
          <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 sm:pb-20">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-foam/80">
              Duy Nhân
            </p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {isVi
                ? "Giỏ quà Tết đặc sản Đà Nẵng"
                : "Da Nang Tet specialty gift baskets"}
            </h1>
            <p className="mt-4 max-w-xl text-base text-foam/90 sm:text-lg">
              {isVi
                ? "Giỏ Tết, hộp trà sâm dứa và Nam Ô — nhìn chỉn chu khi biếu sếp, đối tác hay họ hàng; đóng tại kiốt 90 Hùng Vương."
                : "Tet baskets, pandan tea boxes, and Nam O sets — polished for bosses, partners, or family; packed at 90 Hung Vuong."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop/gifts"
                className="bg-sun px-5 py-3 text-sm font-semibold text-white hover:bg-sun-hover"
              >
                {isVi ? "Xem quà Tết" : "Browse Tet gifts"}
              </Link>
              <Link
                href="/tips/tet-gift-basket-duy-nhan"
                className="border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                {isVi ? "Gợi ý chọn giỏ" : "Basket tips"}
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#f7f1ea_0%,#f3f7f6_55%,#eaf3f1_100%)] px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl font-semibold text-sea-deep sm:text-3xl">
              {isVi ? "Set biếu đang có" : "Gift sets in stock"}
            </h2>
            <p className="mt-2 max-w-2xl text-mist">
              {isVi
                ? "Chọn giỏ hoặc hộp, thêm vào giỏ, rồi gửi đơn qua Zalo trước cao điểm Tết."
                : "Pick a basket or box, add to cart, then confirm on Zalo before the Tet rush."}
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  language={language}
                />
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/checkout"
                className="bg-sea px-5 py-3 text-sm font-semibold text-foam hover:bg-sea-deep"
              >
                {isVi ? "Đặt hàng ngay" : "Order now"}
              </Link>
              <Link
                href="/tips/corporate-da-nang-gift-sets"
                className="border border-line bg-card px-5 py-3 text-sm font-semibold text-sea-deep hover:border-sea"
              >
                {isVi ? "Quà doanh nghiệp" : "Corporate gift tips"}
              </Link>
              <Link
                href="/promo/airport-packing"
                className="border border-line bg-card px-5 py-3 text-sm font-semibold text-sea-deep hover:border-sea"
              >
                {isVi ? "Set mang máy bay" : "Airport packing set"}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
