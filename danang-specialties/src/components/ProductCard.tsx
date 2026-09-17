"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice, type Language, type Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  language?: Language;
};

export default function ProductCard({
  product,
  language: languageProp,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { t, language: contextLanguage } = useTranslation();
  const language = languageProp ?? contextLanguage;
  const isVi = language === "VI";
  const productName = isVi ? product.name : product.nameEn;

  return (
    <article className="flex flex-col overflow-hidden border border-line bg-card transition-transform duration-300 hover:-translate-y-1">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-foam"
      >
        <Image
          src={product.image}
          alt={productName}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
        />
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
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => addItem(product, 1)}
            className="inline-flex w-full items-center justify-center gap-2 bg-sea px-4 py-2.5 text-sm font-semibold text-foam transition-colors hover:bg-sea-deep"
          >
            <ShoppingCart className="h-4 w-4" />
            {t("product.addToCart")}
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
