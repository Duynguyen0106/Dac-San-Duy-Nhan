import type { Metadata } from "next";
import { buildSimplePageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSimplePageMetadata({
  title: "Giỏ quà Tết Đà Nẵng",
  description:
    "Giỏ quà Tết và hộp trà Nam Ô từ kiốt Duy Nhân — biếu đối tác, họ hàng, đóng gói tại 90 Hùng Vương.",
  path: "/promo/tet-gifts",
  image: "/products/gio-qua-tet-real.jpg",
});

export default function TetGiftsPromoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
