"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import RelatedProducts from "@/components/RelatedProducts";
import SiteFooter from "@/components/SiteFooter";
import { useProducts } from "@/hooks/useProducts";
import { useTranslation } from "@/hooks/useTranslation";
import {
  getTipRelatedProducts,
  getTipShopCategory,
  getTipShopHref,
  type TipPost,
} from "@/lib/tips";

export default function TipArticle({ tip }: { tip: TipPost }) {
  const { language } = useTranslation();
  const { products } = useProducts();
  const isVi = language === "VI";
  const title = isVi ? tip.titleVi : tip.titleEn;
  const body = isVi ? tip.bodyVi : tip.bodyEn;
  const shopHref = getTipShopHref(tip);
  const shopCategory = getTipShopCategory(tip);
  const related = getTipRelatedProducts(tip, products, 4);

  const shopLabel = (() => {
    if (shopCategory) {
      return isVi
        ? `Xem ${shopCategory} trong cửa hàng`
        : `Shop ${shopCategory}`;
    }
    if (tip.category === "Ordering") {
      return isVi ? "Cách đặt hàng" : "How to order";
    }
    if (tip.category === "Travel" || tip.category === "Local Guide") {
      return isVi ? "Gợi ý mang đi / khách du lịch" : "Travel & tourist picks";
    }
    return isVi ? "Xem cửa hàng" : "Browse the shop";
  })();

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 bg-[linear-gradient(180deg,#f3f7f6_0%,#eef4f2_50%,#f5efe6_100%)] pb-24 sm:pb-0">
        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <nav className="text-sm text-mist">
            <Link href="/" className="hover:text-sea">
              {isVi ? "Trang chủ" : "Home"}
            </Link>
            <span className="mx-2">/</span>
            <Link href="/tips" className="hover:text-sea">
              {isVi ? "Mẹo & hướng dẫn" : "Tips"}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-sea-deep">{title}</span>
          </nav>

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-mist">
            {tip.date}
            {tip.category ? ` · ${tip.category}` : ""}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-sea-deep sm:text-4xl">
            {title}
          </h1>

          <div className="relative mt-6 aspect-[16/9] overflow-hidden border border-line bg-foam">
            <Image
              src={tip.coverImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              unoptimized
            />
          </div>

          <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/90">
            {body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={shopHref}
              className="bg-sun px-4 py-3 text-sm font-semibold text-white hover:bg-sun-hover"
            >
              {shopLabel}
            </Link>
            <Link
              href="/shop"
              className="border border-line bg-card px-4 py-3 text-sm font-semibold text-sea-deep hover:border-sea"
            >
              {isVi ? "Toàn bộ cửa hàng" : "Full shop"}
            </Link>
            <Link
              href="/how-to-order"
              className="border border-line bg-card px-4 py-3 text-sm font-semibold text-sea-deep hover:border-sea"
            >
              {isVi ? "Cách đặt hàng" : "How to order"}
            </Link>
          </div>

          <RelatedProducts
            products={related}
            title={
              isVi ? "Mua món liên quan tại Duy Nhân" : "Shop related items at Duy Nhan"
            }
            subtitle={
              isVi
                ? "Liên kết nội bộ tới sản phẩm / danh mục — chọn nhanh sau khi đọc mẹo."
                : "Internal links to matching products — pick them up after reading."
            }
          />
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
