import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DEFAULT_DESCRIPTION_VI, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cửa hàng đặc sản",
  description: `Mua đặc sản Đà Nẵng tại ${SITE_NAME} — lọc theo danh mục, quà biếu và món mang đi. ${DEFAULT_DESCRIPTION_VI}`,
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: `Cửa hàng | ${SITE_NAME}`,
    description:
      "Duyệt hải sản khô, đồ rim, trà, bánh và giỏ quà Đà Nẵng — đóng gói mang về.",
    url: "/shop",
  },
};

export default function ShopLayout({ children }: { children: ReactNode }) {
  return children;
}
