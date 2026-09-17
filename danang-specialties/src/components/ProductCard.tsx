"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Language, type Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  language?: Language;
};

export default function ProductCard({
  product,
  language = "VI",
}: ProductCardProps) {
  const isVi = language === "VI";

  return (
    <article className="flex flex-col overflow-hidden border border-line bg-card transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-foam">
        <Image
          src={product.image}
          alt={isVi ? product.name : product.nameEn}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-display text-lg font-semibold text-sea-deep hover:text-sea">
            {isVi ? product.name : product.nameEn}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-mist">{product.weight}</p>
        <p className="mt-3 text-base font-semibold text-sea">
          {formatPrice(product.price, language)}
        </p>
        <Link
          href={`/products/${product.id}`}
          className="mt-4 inline-flex w-full items-center justify-center bg-sea px-4 py-2.5 text-center text-sm font-semibold text-foam transition-colors hover:bg-sea-deep"
        >
          {isVi ? "Xem chi tiết" : "View details"}
        </Link>
      </div>
    </article>
  );
}
