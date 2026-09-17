"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice, type Product } from "@/lib/products";

const ZALO_URL = "https://zalo.me/0905747413";

type ProductDetailProps = {
  product: Product;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const { t, language } = useTranslation();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const isVi = language === "VI";

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(99, q + 1));

  const handleBuyNow = () => {
    addItem(product, quantity);
  };

  const productName = isVi ? product.name : product.nameEn;
  const productDescription = isVi
    ? product.description
    : product.descriptionEn;
  const categoryLabel =
    t(`product.categories.${product.category}`) || product.category;

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 bg-[radial-gradient(ellipse_at_top,_#eaf4f2_0%,_#f3f7f6_55%,_#efe8dc_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <nav className="mb-6 text-sm text-mist">
            <Link href="/" className="hover:text-sea">
              {t("common.home")}
            </Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-sea">
              {t("common.shop")}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-sea-deep">{productName}</span>
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
                  className="inline-flex flex-1 items-center justify-center gap-2 bg-sun px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-sun-hover"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t("product.buyNow")}
                </button>
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 border border-sea bg-card px-6 py-3.5 text-sm font-semibold text-sea transition-colors hover:bg-sea hover:text-foam"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t("product.chatZalo")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-line bg-sea-deep text-foam">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-display text-lg font-semibold">
            {t("common.brandShort")}
          </p>
          <p className="text-sm text-foam/75">{t("common.footerTagline")}</p>
        </div>
      </footer>
    </div>
  );
}
