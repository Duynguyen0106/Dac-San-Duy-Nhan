"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice, type Language, type Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  language?: Language;
  variant?: "grid" | "list";
};

export default function ProductCard({
  product,
  language: languageProp,
  variant = "grid",
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t, language: contextLanguage } = useTranslation();
  const language = languageProp ?? contextLanguage;
  const isVi = language === "VI";
  const productName = isVi ? product.name : product.nameEn;
  const productDescription = isVi
    ? product.description
    : product.descriptionEn;
  const categoryLabel =
    t(`product.categories.${product.category}`) || product.category;
  const favorited = isFavorite(product.id);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 1400);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  const handleAdd = () => {
    addItem(product, 1);
    setJustAdded(true);
  };

  const favoriteButton = (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(product.id);
      }}
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
      className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center border transition-colors ${
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
  );

  if (variant === "list") {
    return (
      <article className="group relative grid overflow-hidden border border-line bg-card transition-all duration-300 hover:border-sea/50 sm:grid-cols-[180px_1fr]">
        {favoriteButton}
        <Link
          href={`/products/${product.id}`}
          className="relative block aspect-[4/3] overflow-hidden bg-foam sm:aspect-auto sm:min-h-[160px]"
        >
          <Image
            src={product.image}
            alt={productName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 180px"
            unoptimized
          />
        </Link>
        <div className="flex flex-col justify-between gap-4 p-4 sm:p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-mist">
              {categoryLabel}
            </p>
            <Link href={`/products/${product.id}`}>
              <h3 className="mt-1 font-display text-xl font-semibold text-sea-deep hover:text-sea">
                {productName}
              </h3>
            </Link>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mist">
              {productDescription}
            </p>
            <p className="mt-2 text-sm text-sea-deep/70">{product.weight}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-lg font-semibold text-sea">
              {formatPrice(product.price, language)}
            </p>
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 bg-sea px-4 py-2.5 text-sm font-semibold text-foam transition-colors hover:bg-sea-deep"
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  {isVi ? "Đã thêm" : "Added"}
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  {t("product.addToCart")}
                </>
              )}
            </button>
            <Link
              href={`/products/${product.id}`}
              className="inline-flex items-center justify-center border border-line px-4 py-2.5 text-sm font-medium text-sea-deep transition-colors hover:border-sea hover:text-sea"
            >
              {t("product.viewDetails")}
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden border border-line bg-card transition-all duration-300 hover:-translate-y-1 hover:border-sea/40 hover:shadow-[0_16px_36px_-20px_rgba(15,92,108,0.45)]">
      {favoriteButton}
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-foam"
      >
        <Image
          src={product.image}
          alt={productName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
        />
        <span className="absolute bottom-3 left-3 bg-sea-deep/80 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-foam backdrop-blur-sm">
          {categoryLabel}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-display text-lg font-semibold text-sea-deep hover:text-sea">
            {productName}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-mist">{product.weight}</p>
        <p className="mt-3 text-base font-semibold text-sea">
          {formatPrice(product.price, language)}
        </p>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex w-full items-center justify-center gap-2 bg-sea px-4 py-2.5 text-sm font-semibold text-foam transition-colors hover:bg-sea-deep"
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" />
                {isVi ? "Đã thêm" : "Added"}
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                {t("product.addToCart")}
              </>
            )}
          </button>
          <Link
            href={`/products/${product.id}`}
            className="inline-flex w-full items-center justify-center border border-line px-4 py-2 text-center text-sm font-medium text-sea-deep transition-colors hover:border-sea hover:text-sea"
          >
            {t("product.viewDetails")}
          </Link>
        </div>
      </div>
    </article>
  );
}
