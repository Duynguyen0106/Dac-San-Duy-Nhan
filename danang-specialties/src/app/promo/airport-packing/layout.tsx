import type { Metadata } from "next";
import { buildSimplePageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSimplePageMetadata({
  title: "Set mang máy bay Đà Nẵng",
  description:
    "Gợi ý đặc sản khô đóng gói mang máy bay từ kiốt Duy Nhân — hải sản khô, bánh, trà và quà nhẹ.",
  path: "/promo/airport-packing",
  image: "/brand/shop-stall-hero.jpg",
});

export default function AirportPackingPromoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
