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
          title: "2. Chọn ship: kiốt / Việt Nam / quốc tế",
          body: "Ở trang thanh toán chọn nhận tại kiốt, giao trong nước, hoặc ship toàn cầu — xem phí ước tính theo kg.",
        },
        {
          title: "3. Gửi đơn qua chat",
          body: "Zalo (VI) hoặc WhatsApp (EN) để xác nhận còn hàng và phí EMS cuối cùng.",
        },
        {
          title: "4. Nhận hàng / tracking",
          body: "Lấy tại Kiốt số 6, 90 Hùng Vương — hoặc nhận mã vận đơn khi gửi tỉnh / quốc tế.",
        },
      ]
    : [
        {
          title: "1. Pick items online",
          body: "Browse the shop, filter by category or travel gifts, and add to cart.",
        },
        {
          title: "2. Choose pickup / Vietnam / worldwide",
          body: "At checkout pick kiosk pickup, domestic delivery, or international shipping — see the kg estimate.",
        },
        {
          title: "3. Confirm on chat",
          body: "WhatsApp (EN) or Zalo (VI) to confirm stock and the final EMS fee.",
        },
        {
          title: "4. Receive / track",
          body: "Pickup at Kiosk No. 6, 90 Hung Vuong — or get a tracking number for domestic/international parcels.",
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

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-sun px-4 py-3 text-sm font-semibold text-white hover:bg-sun-hover"
            >
              <ShoppingBag className="h-4 w-4" />
              {isVi ? "Mua ngay" : "Shop now"}
            </Link>
            <Link
              href="/shipping"
              className="inline-flex items-center justify-center gap-2 border border-line bg-card px-4 py-3 text-sm font-semibold text-sea-deep hover:border-sea"
            >
              {isVi ? "Ship toàn cầu" : "Worldwide shipping"}
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
