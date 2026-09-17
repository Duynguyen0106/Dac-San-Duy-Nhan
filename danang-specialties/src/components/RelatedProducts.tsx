"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useTranslation } from "@/hooks/useTranslation";
import type { Product } from "@/lib/products";

type RelatedProductsProps = {
  products: Product[];
  title?: string;
  subtitle?: string;
};

export default function RelatedProducts({
  products,
  title,
  subtitle,
}: RelatedProductsProps) {
  const { t, language } = useTranslation();
  const isVi = language === "VI";

  if (products.length === 0) return null;

  return (
    <section className="mt-12 border-t border-line pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-sea-deep sm:text-2xl">
            {title ||
              (isVi ? "Gợi ý kèm theo / quà biếu" : "Complete your gift")}
          </h2>
          <p className="mt-1 text-sm text-mist">
            {subtitle ||
              (isVi
                ? "Thêm món cùng danh mục hoặc set quà mang đi."
                : "Add matching specialties or travel-ready gift sets.")}
          </p>
        </div>
        <Link
          href="/shop?pick=gift"
          className="text-sm font-medium text-sea hover:text-sea-deep"
        >
          {isVi ? "Xem thêm quà" : "More gifts"}
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} language={language} />
        ))}
      </div>
    </section>
  );
}
