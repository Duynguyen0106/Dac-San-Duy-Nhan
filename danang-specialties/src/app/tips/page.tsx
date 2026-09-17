"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useTranslation } from "@/hooks/useTranslation";
import { listTips } from "@/lib/tips";

export default function TipsIndexPage() {
  const { language } = useTranslation();
  const isVi = language === "VI";
  const tips = listTips();

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 bg-[linear-gradient(180deg,#f3f7f6_0%,#eaf3f1_45%,#f5efe6_100%)] pb-24 sm:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <nav className="text-sm text-mist">
            <Link href="/" className="hover:text-sea">
              {isVi ? "Trang chủ" : "Home"}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-sea-deep">
              {isVi ? "Mẹo & hướng dẫn" : "Tips & guides"}
            </span>
          </nav>
          <h1 className="mt-4 font-display text-3xl font-semibold text-sea-deep sm:text-4xl">
            {isVi ? "Mẹo mang đặc sản về nhà" : "Tips for bringing specialties home"}
          </h1>
          <p className="mt-3 max-w-2xl text-mist">
            {isVi
              ? "Đóng gói lên máy bay, chọn quà biếu, và cách đặt hàng tại kiốt Duy Nhân."
              : "Packing for flights, gift ideas, and how to order at the Duy Nhan kiosk."}
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tips.map((tip) => (
              <Link
                key={tip.slug}
                href={`/tips/${tip.slug}`}
                className="group overflow-hidden border border-line bg-card transition hover:border-sea"
              >
                <div className="relative aspect-[16/10] bg-foam">
                  <Image
                    src={tip.coverImage}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-mist">{tip.date}</p>
                  <h2 className="mt-1 font-display text-lg font-semibold text-sea-deep">
                    {isVi ? tip.titleVi : tip.titleEn}
                  </h2>
                  <p className="mt-2 text-sm text-mist">
                    {isVi ? tip.excerptVi : tip.excerptEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
