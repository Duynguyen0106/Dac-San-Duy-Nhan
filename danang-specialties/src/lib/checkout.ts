import type { CartItem } from "@/context/CartContext";
import {
  formatPrice,
  formatWeight,
  type Language,
} from "@/lib/products";

import { SHOP_CONTACT } from "@/lib/shopContact";

export const ZALO_ORDER_URL = SHOP_CONTACT.zaloUrl;

export type PaymentMethod = "COD" | "BankTransfer";

export type CheckoutFormValues = {
  name: string;
  phone: string;
  address: string;
  note: string;
  paymentMethod: PaymentMethod;
};

export type CheckoutFormErrors = Partial<
  Record<keyof CheckoutFormValues, string>
>;

const phonePattern =
  /^(?:\+?84|0)\d{8,10}$|^\+\d{8,15}$/;

export function validateCheckoutForm(
  values: CheckoutFormValues,
  language: Language,
): CheckoutFormErrors {
  const isVi = language === "VI";
  const errors: CheckoutFormErrors = {};

  if (!values.name.trim()) {
    errors.name = isVi
      ? "Vui lòng nhập họ và tên."
      : "Please enter your full name.";
  } else if (values.name.trim().length < 2) {
    errors.name = isVi
      ? "Họ tên cần ít nhất 2 ký tự."
      : "Name must be at least 2 characters.";
  }

  const phone = values.phone.replace(/[\s()-]/g, "");
  if (!phone) {
    errors.phone = isVi
      ? "Vui lòng nhập số điện thoại."
      : "Please enter your phone number.";
  } else if (!phonePattern.test(phone)) {
    errors.phone = isVi
      ? "Số điện thoại không hợp lệ. Ví dụ: 0901234567 hoặc +84901234567."
      : "Invalid phone number. Example: 0901234567 or +84901234567.";
  }

  if (!values.address.trim()) {
    errors.address = isVi
      ? "Vui lòng nhập địa chỉ nhận hàng."
      : "Please enter your delivery address.";
  } else if (values.address.trim().length < 8) {
    errors.address = isVi
      ? "Địa chỉ cần chi tiết hơn (số nhà, đường, quận/huyện)."
      : "Please add more detail (street, district, city/country).";
  }

  if (!values.paymentMethod) {
    errors.paymentMethod = isVi
      ? "Vui lòng chọn phương thức thanh toán."
      : "Please select a payment method.";
  }

  return errors;
}

export function composeZaloOrderMessage({
  values,
  items,
  totalPrice,
  totalWeightGrams,
  language,
}: {
  values: CheckoutFormValues;
  items: CartItem[];
  totalPrice: number;
  totalWeightGrams: number;
  language: Language;
}): string {
  const isVi = language === "VI";
  const paymentLabel =
    values.paymentMethod === "COD"
      ? isVi
        ? "COD - Thanh toán khi nhận hàng"
        : "COD - Cash on Delivery"
      : isVi
        ? "Chuyển khoản ngân hàng"
        : "Bank Transfer";

  const lines = [
    isVi
      ? "Xin chào Duy Nhân! Tôi muốn đặt hàng:"
      : "Hello Duy Nhân! I would like to place an order:",
    "",
    isVi ? "=== THÔNG TIN KHÁCH ===" : "=== CUSTOMER INFO ===",
    `${isVi ? "Họ tên" : "Name"}: ${values.name.trim()}`,
    `${isVi ? "SĐT" : "Phone"}: ${values.phone.trim()}`,
    `${isVi ? "Địa chỉ" : "Address"}: ${values.address.trim()}`,
    values.note.trim()
      ? `${isVi ? "Ghi chú" : "Note"}: ${values.note.trim()}`
      : null,
    `${isVi ? "Thanh toán" : "Payment"}: ${paymentLabel}`,
    "",
    isVi ? "=== ĐƠN HÀNG ===" : "=== ORDER ===",
    ...items.map((item) => {
      const name = isVi ? item.product.name : item.product.nameEn;
      const lineTotal = formatPrice(
        item.product.price * item.quantity,
        language,
      );
      return `- ${name} x${item.quantity} (${item.product.weight}) = ${lineTotal}`;
    }),
    "",
    `${isVi ? "Tổng khối lượng" : "Total weight"}: ${formatWeight(totalWeightGrams, language)}`,
    `${isVi ? "Tổng tiền" : "Total"}: ${formatPrice(totalPrice, language)}`,
  ];

  return lines.filter((line) => line !== null).join("\n");
}
