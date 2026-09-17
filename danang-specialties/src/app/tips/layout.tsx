import type { Metadata } from "next";
import { buildSimplePageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSimplePageMetadata({
  title: "Mẹo & hướng dẫn",
  description:
    "50 bài mẹo đặc sản Đà Nẵng: hải sản khô, bánh kẹo, trà, bánh tráng, gia vị, quà biếu và cách đặt hàng tại Duy Nhân.",
  path: "/tips",
});

export default function TipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
