import type { Metadata } from "next";
import { buildSimplePageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSimplePageMetadata({
  title: "Mẹo & hướng dẫn",
  description:
    "Mẹo mang đặc sản Đà Nẵng lên máy bay, gợi ý quà biếu, và cách đặt hàng tại Duy Nhân.",
  path: "/tips",
});

export default function TipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
