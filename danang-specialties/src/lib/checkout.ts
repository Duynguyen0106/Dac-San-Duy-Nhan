import type { CartItem } from "@/context/CartContext";
import {
  formatPrice,
  formatWeight,
  type Language,
} from "@/lib/products";
import { getShopContact } from "@/lib/shopContact";
import {
  buildShippingEstimate,
  getCountryLabel,
  getZoneLabel,
  SHIPPING_COUNTRIES,
  type DeliveryMethod,
  type ShippingEstimate,
  type ShippingZoneId,
} from "@/lib/shipping";

export type PaymentMethod = "COD" | "BankTransfer";

export type CheckoutFormValues = {
  name: string;
  phone: string;
  address: string;
  note: string;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  countryCode: string;
  city: string;
  postalCode: string;
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
      : "Invalid phone number. Example: +447700900123 or +84901234567.";
  }

  if (!values.deliveryMethod) {
    errors.deliveryMethod = isVi
      ? "Vui lòng chọn hình thức nhận hàng."
      : "Please choose how you want to receive the order.";
  }

  if (values.deliveryMethod === "international") {
    if (!values.countryCode.trim()) {
      errors.countryCode = isVi
        ? "Vui lòng chọn quốc gia nhận hàng."
        : "Please select a destination country.";
    }
    if (!values.city.trim() || values.city.trim().length < 2) {
      errors.city = isVi
        ? "Vui lòng nhập thành phố."
        : "Please enter a city.";
    }
    if (!values.postalCode.trim()) {
      errors.postalCode = isVi
        ? "Vui lòng nhập mã bưu điện (postal/ZIP)."
        : "Please enter a postal / ZIP code.";
    }
  }

  if (values.deliveryMethod === "vietnam" && !values.countryCode) {
    // default handled in UI; still require address detail
  }

  if (values.deliveryMethod === "pickup") {
    // address can be short note; still require something for contact logistics
    if (!values.address.trim() || values.address.trim().length < 4) {
      errors.address = isVi
        ? "Ghi chú nhận hàng (tên / giờ đến kiốt)."
        : "Add a short pickup note (name / time at the kiosk).";
    }
  } else if (!values.address.trim()) {
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
  } else if (
    values.deliveryMethod === "international" &&
    values.paymentMethod === "COD"
  ) {
    errors.paymentMethod = isVi
      ? "Ship quốc tế không hỗ trợ COD — chọn chuyển khoản."
      : "International shipping does not support COD — choose bank transfer.";
  }

  return errors;
}

export function getCheckoutShippingEstimate(
  values: CheckoutFormValues,
  productWeightGrams: number,
  productSubtotal: number,
): ShippingEstimate {
  const countryCode =
    values.deliveryMethod === "pickup"
      ? "VN"
      : values.deliveryMethod === "vietnam"
        ? values.countryCode === "VN-DN"
          ? "VN-DN"
          : "VN"
        : values.countryCode || "OTHER";

  return buildShippingEstimate({
    method: values.deliveryMethod,
    countryCode,
    productWeightGrams,
    productSubtotal,
  });
}

export function composeOrderMessage({
  values,
  items,
  totalPrice,
  totalWeightGrams,
  language,
  leadId,
  shippingEstimate,
}: {
  values: CheckoutFormValues;
  items: CartItem[];
  totalPrice: number;
  totalWeightGrams: number;
  language: Language;
  leadId?: string;
  shippingEstimate?: ShippingEstimate;
}): string {
  const isVi = language === "VI";
  const estimate =
    shippingEstimate ??
    getCheckoutShippingEstimate(values, totalWeightGrams, totalPrice);

  const paymentLabel =
    values.paymentMethod === "COD"
      ? isVi
        ? "COD - Thanh toán khi nhận hàng"
        : "COD - Cash on Delivery"
      : isVi
        ? "Chuyển khoản ngân hàng"
        : "Bank Transfer";

  const deliveryLabel =
    values.deliveryMethod === "pickup"
      ? isVi
        ? "Nhận tại kiốt 90 Hùng Vương"
        : "Pickup at 90 Hung Vuong kiosk"
      : values.deliveryMethod === "vietnam"
        ? isVi
          ? "Giao trong Việt Nam"
          : "Delivery within Vietnam"
        : isVi
          ? "Ship quốc tế"
          : "International shipping";

  const country =
    SHIPPING_COUNTRIES.find((item) => item.code === values.countryCode) ??
    (values.countryCode
      ? {
          code: values.countryCode,
          nameVi: values.countryCode,
          nameEn: values.countryCode,
        }
      : null);

  const lines = [
    isVi
      ? "Xin chào Duy Nhân! Tôi muốn đặt hàng:"
      : "Hello Duy Nhân! I would like to place an order:",
    leadId
      ? `${isVi ? "Mã đơn web" : "Web order ID"}: ${leadId}`
      : null,
    "",
    isVi ? "=== THÔNG TIN KHÁCH ===" : "=== CUSTOMER INFO ===",
    `${isVi ? "Họ tên" : "Name"}: ${values.name.trim()}`,
    `${isVi ? "SĐT" : "Phone"}: ${values.phone.trim()}`,
    `${isVi ? "Hình thức" : "Delivery"}: ${deliveryLabel}`,
    country
      ? `${isVi ? "Quốc gia" : "Country"}: ${getCountryLabel(country, language)}`
      : null,
    values.city.trim()
      ? `${isVi ? "Thành phố" : "City"}: ${values.city.trim()}`
      : null,
    values.postalCode.trim()
      ? `${isVi ? "Mã bưu điện" : "Postal code"}: ${values.postalCode.trim()}`
      : null,
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
    `${isVi ? "Tổng khối lượng SP" : "Product weight"}: ${formatWeight(totalWeightGrams, language)}`,
    `${isVi ? "Cân tính phí (ước)" : "Chargeable wt (est.)"}: ${formatWeight(estimate.chargeableWeightGrams, language)}`,
    `${isVi ? "Khu vực ship" : "Shipping zone"}: ${getZoneLabel(estimate.zone, language)} (${estimate.zoneId as ShippingZoneId})`,
    `${isVi ? "Ship ước tính" : "Est. shipping"}: ${formatPrice(estimate.shippingFee, language)}`,
    `${isVi ? "Tạm tính SP" : "Products subtotal"}: ${formatPrice(totalPrice, language)}`,
    `${isVi ? "Tổng ước tính" : "Est. grand total"}: ${formatPrice(estimate.grandTotal, language)}`,
    isVi
      ? "(Phí ship cuối cùng shop xác nhận theo cân thực tế / EMS)"
      : "(Final shipping confirmed by shop after real EMS weighing)",
  ];

  return lines.filter((line) => line !== null).join("\n");
}

/** @deprecated Prefer composeOrderMessage */
export const composeZaloOrderMessage = composeOrderMessage;

export function getOrderChatUrl(language: Language, message?: string) {
  const contact = getShopContact(language);
  if (contact.chatChannel === "whatsapp" && message) {
    return `${contact.chatUrl}?text=${encodeURIComponent(message)}`;
  }
  return contact.chatUrl;
}
