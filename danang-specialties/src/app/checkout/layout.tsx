import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Thanh toán",
  description: "Gửi đơn hàng đặc sản Duy Nhân qua Zalo hoặc WhatsApp.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/checkout",
  },
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
