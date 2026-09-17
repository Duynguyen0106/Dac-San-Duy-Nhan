"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import ProductReviews from "@/components/ProductReviews";
import RelatedProducts from "@/components/RelatedProducts";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useTranslation } from "@/hooks/useTranslation";
import {
  formatPrice,
  categoryToSlug,
  isProductAvailable,
  type Product,
  type ShopCategory,
} from "@/lib/products";
import type { ReviewSummary } from "@/lib/reviews";
import { getShopContact } from "@/lib/shopContact";

type ProductDetailProps = {
  product: Product;
  related?: Product[];
  reviewSummary?: ReviewSummary;
};

export default function ProductDetail({
  product,
  related = [],
  reviewSummary = { count: 0, average: 0, reviews: [] },
}: ProductDetailProps) {
  const { t, language } = useTranslation();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { trackView } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);
  const isVi = language === "VI";
  const favorited = isFavorite(product.id);

  useEffect(() => {
    trackView(product.id);
  }, [product.id, trackView]);

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(99, q + 1));

  const handleBuyNow = () => {
    if (!isProductAvailable(product)) return;
    addItem(product, quantity);
  };

  const productName = isVi ? product.name : product.nameEn;
  const productDescription = isVi
    ? product.description
    : product.descriptionEn;
  const categoryLabel =
    t(`product.categories.${product.category}`) || product.category;
  const contact = getShopContact(language);
  const available = isProductAvailable(product);

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 bg-[radial-gradient(ellipse_at_top,_#eaf4f2_0%,_#f3f7f6_55%,_#efe8dc_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-8 pb-10 sm:px-6 sm:py-12">
          <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-mist">
            <Link href="/" className="hover:text-sea">
              {t("common.home")}
            </Link>
            <span aria-hidden>/</span>
            <Link href="/shop" className="hover:text-sea">
              {t("common.shop")}
            </Link>
            <span aria-hidden>/</span>
            <Link
              href={`/shop/${categoryToSlug(product.category as ShopCategory)}`}
              className="hover:text-sea"
            >
              {categoryLabel}
            </Link>
            <span aria-hidden className="hidden sm:inline">
              /
            </span>
            <span className="w-full truncate text-sea-deep sm:w-auto">
              {productName}
            </span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="relative aspect-square overflow-hidden border border-line bg-card sm:aspect-[4/3] lg:aspect-square">
              <Image
                src={product.image}
                alt={productName}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                aria-pressed={favorited}
                aria-label={
                  favorited
                    ? isVi
                      ? "Bỏ yêu thích"
                      : "Remove from favorites"
                    : isVi
                      ? "Thêm yêu thích"
                      : "Add to favorites"
                }
                className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center border transition-colors ${
                  favorited
                    ? "border-sun bg-sun text-white"
                    : "border-line/80 bg-card/90 text-sea-deep hover:border-sun hover:text-sun"
                }`}
              >
                <Heart
                  className="h-4 w-4"
                  fill={favorited ? "currentColor" : "none"}
                  strokeWidth={1.75}
                />
              </button>
            </div>

            <div className="flex flex-col">
              <p className="text-sm font-medium uppercase tracking-wide text-mist">
                {categoryLabel}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-sea-deep sm:text-4xl">
                {productName}
              </h1>
              <p className="mt-4 font-display text-2xl font-semibold text-sea sm:text-3xl">
                {formatPrice(product.price, language)}
              </p>
              <p className="mt-2 text-sm text-mist">
                {t("product.weight")}:{" "}
                <span className="font-medium text-sea-deep">{product.weight}</span>
                {" · "}
                <span
                  className={`font-medium ${
                    available ? "text-sea" : "text-red-700"
                  }`}
                >
                  {available
                    ? isVi
                      ? "Còn hàng"
                      : "In stock"
                    : isVi
                      ? "Hết hàng"
                      : "Sold out"}
                </span>
              </p>

              <p className="mt-6 text-base leading-relaxed text-foreground/85">
                {productDescription}
              </p>

              <div className="mt-8">
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-medium text-sea-deep"
                >
                  {t("product.quantity")}
                </label>
                <div className="inline-flex items-center border border-line bg-card">
                  <button
                    type="button"
                    onClick={decrease}
                    aria-label={t("product.decreaseQty")}
                    className="p-3 text-sea-deep transition-colors hover:bg-foam"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min={1}
                    max={99}
                    value={quantity}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (Number.isNaN(value)) return;
                      setQuantity(Math.min(99, Math.max(1, value)));
                    }}
                    className="w-14 border-x border-line bg-transparent py-2.5 text-center text-sm font-semibold text-sea-deep outline-none"
                  />
                  <button
                    type="button"
                    onClick={increase}
                    aria-label={t("product.increaseQty")}
                    className="p-3 text-sea-deep transition-colors hover:bg-foam"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!available}
                  className="inline-flex flex-1 items-center justify-center gap-2 bg-sun px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-sun-hover disabled:cursor-not-allowed disabled:bg-mist/50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {available
                    ? t("product.buyNow")
                    : isVi
                      ? "Hết hàng"
                      : "Sold out"}
                </button>
                <a
                  href={contact.chatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 border border-sea bg-card px-6 py-3.5 text-sm font-semibold text-sea transition-colors hover:bg-sea hover:text-foam"
                >
                  <MessageCircle className="h-4 w-4" />
                  {language === "VI"
                    ? `Chat ${contact.chatLabel}`
                    : `Chat on ${contact.chatLabel}`}
                </a>
              </div>
            </div>
          </div>

          <ProductReviews summary={reviewSummary} language={language} />
          <RelatedProducts products={related} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
