"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useTranslation } from "@/hooks/useTranslation";
import type { TipPost } from "@/lib/tips";

export default function TipArticle({ tip }: { tip: TipPost }) {
  const { language } = useTranslation();
  const isVi = language === "VI";
  const title = isVi ? tip.titleVi : tip.titleEn;
  const body = isVi ? tip.bodyVi : tip.bodyEn;

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
              href="/shop"
              className="bg-sun px-4 py-3 text-sm font-semibold text-white hover:bg-sun-hover"
            >
              {isVi ? "Xem cửa hàng" : "Browse the shop"}
            </Link>
            <Link
              href="/how-to-order"
              className="border border-line bg-card px-4 py-3 text-sm font-semibold text-sea-deep hover:border-sea"
            >
              {isVi ? "Cách đặt hàng" : "How to order"}
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
