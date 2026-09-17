"use client";

import Link from "next/link";
import { Globe2, Package, Plane, Scale, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useTranslation } from "@/hooks/useTranslation";
import { CONTACT_PRICING_ENABLED, formatPrice, formatWeight } from "@/lib/products";
import {
  getShippingNote,
  getZoneEta,
  getZoneLabel,
  listPublicShippingZones,
} from "@/lib/shipping";

const SAMPLE_WEIGHTS_KG = [0.5, 1, 2, 5];

export default function ShippingPage() {
  const { language } = useTranslation();
  const isVi = language === "VI";
  const zones = listPublicShippingZones();

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
              {isVi ? "Ship & giao hàng" : "Shipping"}
            </span>
          </nav>

          <div className="mt-4 max-w-3xl">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-sea">
              Duy Nhân
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-sea-deep sm:text-5xl">
              {isVi
                ? "Ship đặc sản Đà Nẵng toàn cầu"
                : "Ship Da Nang specialties worldwide"}
            </h1>
            <p className="mt-4 text-base text-mist sm:text-lg">
              {isVi
                ? CONTACT_PRICING_ENABLED
                  ? "Nhận tại kiốt, giao Việt Nam, hoặc EMS/bưu chính quốc tế. Giá SP và phí ship shop báo qua Zalo/Messenger/WhatsApp khi bạn đặt."
                  : "Nhận tại kiốt, giao Việt Nam, hoặc EMS/bưu chính quốc tế. Phí ước tính theo kg — shop xác nhận chính xác qua Zalo/WhatsApp trước khi gửi."
                : CONTACT_PRICING_ENABLED
                  ? "Pickup at the kiosk, deliver in Vietnam, or ship internationally by EMS/post. Product and shipping prices are quoted on Zalo/Messenger/WhatsApp when you order."
                  : "Pickup at the kiosk, deliver in Vietnam, or ship internationally by EMS/post. Estimates are by kg — we confirm the exact quote on Zalo/WhatsApp before dispatch."}
            </p>
            <p className="mt-3 text-sm text-sea-deep/80">{getShippingNote(language)}</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Package,
                title: isVi ? "Đóng gói chống đổ" : "Leak-proof packing",
                body: isVi
                  ? "Nước mắm, mắm, trà và bánh được bọc thêm trước khi gửi."
                  : "Fish sauce, pastes, tea, and sweets get extra wrap before shipping.",
              },
              {
                icon: Scale,
                title: isVi ? "Tính theo kg" : "Charged by weight",
                body: isVi
                  ? "Giỏ hàng hiện cân SP; phí ship cộng đệm đóng gói ~8% + 150g."
                  : "Your cart shows product weight; shipping adds ~8% + 150g packing buffer.",
              },
              {
                icon: Plane,
                title: isVi ? "EMS / bưu chính" : "EMS / postal",
                body: isVi
                  ? "Ưu tiên kênh ổn định từ Việt Nam tới châu Á, Âu, Mỹ, Úc…"
                  : "Reliable channels from Vietnam to Asia, Europe, US, Australia, and more.",
              },
              {
                icon: ShieldCheck,
                title: isVi ? "Xác nhận trước khi gửi" : "Confirm before send",
                body: isVi
                  ? "Bạn nhận báo giá cuối + mã vận đơn qua chat."
                  : "You get a final quote and tracking number on chat.",
              },
            ].map((item) => (
              <div key={item.title} className="border border-line bg-card p-5">
                <item.icon className="h-5 w-5 text-sea" strokeWidth={1.75} />
                <h2 className="mt-3 font-display text-lg font-semibold text-sea-deep">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-mist">{item.body}</p>
              </div>
            ))}
          </div>

          {CONTACT_PRICING_ENABLED ? (
            <section className="mt-12 border border-line bg-card p-6">
              <h2 className="font-display text-2xl font-semibold text-sea-deep sm:text-3xl">
                {isVi ? "Phí ship — liên hệ báo giá" : "Shipping — contact for quote"}
              </h2>
              <p className="mt-3 max-w-2xl text-mist">
                {isVi
                  ? "Phí ship phụ thuộc cân nặng, khu vực và EMS thực tế. Gửi đơn qua Zalo / Messenger / WhatsApp — shop báo giá chính xác trước khi gửi."
                  : "Shipping depends on weight, zone, and real EMS rates. Send your order on Zalo / Messenger / WhatsApp — we confirm the exact quote before dispatch."}
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {zones.map((zone) => (
                  <li
                    key={zone.id}
                    className="border border-line bg-background px-4 py-3"
                  >
                    <p className="font-medium text-sea-deep">
                      {getZoneLabel(zone, language)}
                    </p>
                    <p className="mt-1 text-sm text-mist">
                      {getZoneEta(zone, language)} ·{" "}
                      {isVi ? "Liên hệ" : "Contact"}
                    </p>
                  </li>
                ))}
              </ul>
              <Link
                href="/checkout"
                className="mt-6 inline-block bg-sun px-4 py-2.5 text-sm font-semibold text-white hover:bg-sun-hover"
              >
                {isVi ? "Đặt hàng & chat báo giá" : "Order & chat for a quote"}
              </Link>
            </section>
          ) : (
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-sea-deep sm:text-3xl">
                  {isVi ? "Bảng phí ước tính" : "Estimated rate table"}
                </h2>
                <p className="mt-2 text-mist">
                  {isVi
                    ? "Đơn vị VND. Cân mẫu đã gồm đệm đóng gói."
                    : "Amounts in VND. Sample weights include packing buffer."}
                </p>
              </div>
              <Link
                href="/checkout"
                className="bg-sun px-4 py-2.5 text-sm font-semibold text-white hover:bg-sun-hover"
              >
                {isVi ? "Ước tính trong checkout" : "Estimate at checkout"}
              </Link>
            </div>

            <div className="mt-6 overflow-x-auto border border-line bg-card">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-foam text-sea-deep">
                  <tr>
                    <th className="px-4 py-3 font-semibold">
                      {isVi ? "Khu vực" : "Zone"}
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      {isVi ? "Thời gian" : "ETA"}
                    </th>
                    {SAMPLE_WEIGHTS_KG.map((kg) => (
                      <th key={kg} className="px-4 py-3 font-semibold">
                        {kg} kg
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone) => (
                    <tr key={zone.id} className="border-t border-line">
                      <td className="px-4 py-3 font-medium text-sea-deep">
                        {getZoneLabel(zone, language)}
                      </td>
                      <td className="px-4 py-3 text-mist">
                        {getZoneEta(zone, language)}
                      </td>
                      {SAMPLE_WEIGHTS_KG.map((kg) => {
                        const grams = Math.round(kg * 1000);
                        // reverse buffer roughly for table: show band fee for chargeable kg
                        const band = zone.bands.find((b) => kg <= b.maxKg);
                        return (
                          <td key={kg} className="px-4 py-3 text-sea-deep">
                            {formatPrice(band?.fee ?? 0, language)}
                            <span className="sr-only">
                              {formatWeight(grams, language)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          )}

          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="border border-line bg-card p-6">
              <Globe2 className="h-5 w-5 text-sea" />
              <h2 className="mt-3 font-display text-xl font-semibold text-sea-deep">
                {isVi ? "Hải quan & thuế nhập khẩu" : "Customs & import duties"}
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mist">
                <li>
                  {isVi
                    ? "Phí ship chưa gồm thuế/VAT nước đến — người nhận tự chịu nếu hải quan yêu cầu."
                    : "Shipping quotes exclude destination duties/VAT — the recipient pays if customs applies."}
                </li>
                <li>
                  {isVi
                    ? "Khai đúng thực phẩm khô/đóng gói thương mại; giữ tem gốc trên sản phẩm."
                    : "Declare commercial packed dry foods accurately; keep original product labels."}
                </li>
                <li>
                  {isVi
                    ? "Một số nước hạn chế thực phẩm — shop tư vấn trước khi gửi lô lớn."
                    : "Some countries restrict foods — ask us before large shipments."}
                </li>
              </ul>
            </div>
            <div className="border border-line bg-card p-6">
              <Plane className="h-5 w-5 text-sea" />
              <h2 className="mt-3 font-display text-xl font-semibold text-sea-deep">
                {isVi ? "Món nên / không nên gửi máy bay" : "What travels well by air"}
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mist">
                <li>
                  {isVi
                    ? "Ưu tiên: hải sản khô, bò khô, bánh kẹo, trà, trái cây sấy, hộp quà khô."
                    : "Best: dried seafood, jerky, sweets, tea, dried fruit, dry gift boxes."}
                </li>
                <li>
                  {isVi
                    ? "Cần bọc kỹ: nước mắm, mắm nêm/ruốc — chai nhỏ, túi zip, ký gửi."
                    : "Extra wrap: fish sauce and pastes — small bottles, zip bags, checked-style packing."}
                </li>
                <li>
                  {isVi
                    ? "Hạn chế xa: nem chua, chả/tré tươi nếu hành trình dài không thùng lạnh."
                    : "Limit for long trips: fresh nem/cha/tre without a cold chain."}
                </li>
              </ul>
            </div>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/shop?pick=tourist"
              className="bg-sea px-5 py-3 text-sm font-semibold text-foam hover:bg-sea-deep"
            >
              {isVi ? "Chọn món dễ mang" : "Browse travel-friendly items"}
            </Link>
            <Link
              href="/promo/airport-packing"
              className="border border-line bg-card px-5 py-3 text-sm font-semibold text-sea-deep hover:border-sea"
            >
              {isVi ? "Set mang máy bay" : "Airport packing set"}
            </Link>
            <Link
              href="/how-to-order"
              className="border border-line bg-card px-5 py-3 text-sm font-semibold text-sea-deep hover:border-sea"
            >
              {isVi ? "Cách đặt hàng" : "How to order"}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
