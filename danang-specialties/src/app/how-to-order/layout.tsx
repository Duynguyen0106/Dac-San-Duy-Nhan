import type { Metadata } from "next";
import { buildSimplePageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSimplePageMetadata({
  title: "Cách đặt hàng",
  description:
    "Hướng dẫn đặt đặc sản Duy Nhân qua Zalo, gọi điện hoặc WhatsApp — kiốt 90 Hùng Vương, Đà Nẵng.",
  path: "/how-to-order",
});

export default function HowToOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
