import type { Metadata } from "next";
import { buildSimplePageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSimplePageMetadata({
  title: "Ship toàn cầu / Worldwide shipping",
  description:
    "Ship đặc sản Đà Nẵng toàn Việt Nam và quốc tế — ước tính phí theo kg, EMS, đóng gói chống đổ tại kiốt Duy Nhân.",
  path: "/shipping",
});

export default function ShippingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
