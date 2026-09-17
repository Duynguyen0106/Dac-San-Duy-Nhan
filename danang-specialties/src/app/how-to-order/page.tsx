"use client";

import Link from "next/link";
import { MessageCircle, Phone, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useTranslation } from "@/hooks/useTranslation";
import { getShopContact } from "@/lib/shopContact";

export default function HowToOrderPage() {
  const { language } = useTranslation();
  const isVi = language === "VI";
  const contact = getShopContact(language);

  const steps = isVi
    ? [
        {
          title: "1. Chọn món trên web",
          body: "Vào Cửa hàng, lọc theo danh mục hoặc quà mang đi, thêm vào giỏ.",
        },
        {
          title: "2. Gửi đơn qua chat",
          body: "Ở trang thanh toán, gửi tin nhắn Zalo (VI) hoặc WhatsApp (EN) để xác nhận còn hàng.",
        },
        {
          title: "3. Nhận tại kiốt hoặc giao",
          body: "Đến Kiốt số 6, 90 Hùng Vương — hoặc nhờ shop hỗ trợ giao trong nội thành khi có lịch.",
        },
      ]
    : [
        {
          title: "1. Pick items online",
          body: "Browse the shop, filter by category or travel gifts, and add to cart.",
        },
        {
          title: "2. Confirm on chat",
          body: "From checkout, send WhatsApp (EN) or Zalo (VI) so we can confirm stock.",
        },
        {
          title: "3. Pickup or delivery",
          body: "Visit Kiosk No. 6, 90 Hung Vuong — or ask about local delivery when available.",
        },
      ];

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 bg-[linear-gradient(180deg,#f3f7f6_0%,#eaf3f1_50%,#f4efe6_100%)] pb-24 sm:pb-0">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <nav className="text-sm text-mist">
            <Link href="/" className="hover:text-sea">
              {isVi ? "Trang chủ" : "Home"}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-sea-deep">
              {isVi ? "Cách đặt hàng" : "How to order"}
            </span>
          </nav>

          <h1 className="mt-4 font-display text-3xl font-semibold text-sea-deep sm:text-4xl">
            {isVi ? "Cách đặt hàng tại Duy Nhân" : "How to order at Duy Nhan"}
          </h1>
          <p className="mt-3 text-base text-mist">
            {isVi
              ? "Khách Việt: Zalo hoặc gọi điện. Khách quốc tế: WhatsApp. Cùng một kiốt đặc sản Đà Nẵng."
              : "Local guests: Zalo or a phone call. International guests: WhatsApp. Same Da Nang specialty kiosk."}
          </p>

          <ol className="mt-8 space-y-4">
            {steps.map((step) => (
              <li key={step.title} className="border border-line bg-card p-5">
                <h2 className="font-display text-lg font-semibold text-sea-deep">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-sun px-4 py-3 text-sm font-semibold text-white hover:bg-sun-hover"
            >
              <ShoppingBag className="h-4 w-4" />
              {isVi ? "Mua ngay" : "Shop now"}
            </Link>
            <a
              href={contact.phoneTel}
              className="inline-flex items-center justify-center gap-2 border border-line bg-card px-4 py-3 text-sm font-semibold text-sea-deep hover:border-sea"
            >
              <Phone className="h-4 w-4" />
              {contact.phoneDisplay}
            </a>
            <a
              href={contact.chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-sea bg-card px-4 py-3 text-sm font-semibold text-sea hover:bg-sea hover:text-foam"
            >
              <MessageCircle className="h-4 w-4" />
              {isVi ? `Chat ${contact.chatLabel}` : `Chat on ${contact.chatLabel}`}
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
