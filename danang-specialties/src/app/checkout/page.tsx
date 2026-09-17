"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Globe2,
  MapPin,
  MessageCircle,
  Package,
  Scale,
  Truck,
} from "lucide-react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useLanguage } from "@/components/Providers";
import { useCart } from "@/context/CartContext";
import {
  composeOrderMessage,
  getCheckoutShippingEstimate,
  getOrderChatUrl,
  validateCheckoutForm,
  type CheckoutFormErrors,
  type CheckoutFormValues,
} from "@/lib/checkout";
import {
  CONTACT_PRICING_ENABLED,
  formatPrice,
  formatPublicPrice,
  formatWeight,
  getContactPricingHint,
} from "@/lib/products";
import { getShopContact } from "@/lib/shopContact";
import {
  findAirCautionProducts,
  getCountryLabel,
  getShippingNote,
  getZoneEta,
  getZoneLabel,
  SHIPPING_COUNTRIES,
  type DeliveryMethod,
} from "@/lib/shipping";

const initialValues: CheckoutFormValues = {
  name: "",
  phone: "",
  address: "",
  note: "",
  paymentMethod: "COD",
  deliveryMethod: "vietnam",
  countryCode: "VN",
  city: "",
  postalCode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const {
    items,
    totalPrice,
    totalWeightGrams,
    itemCount,
    closeCart,
    clearCart,
  } = useCart();
  const isVi = language === "VI";
  const contact = getShopContact(language);

  const [values, setValues] = useState<CheckoutFormValues>(initialValues);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof CheckoutFormValues, boolean>>
  >({});
  const [status, setStatus] = useState<"idle" | "copied" | "error" | "saving">(
    "idle",
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const shippingEstimate = useMemo(
    () => getCheckoutShippingEstimate(values, totalWeightGrams, totalPrice),
    [values, totalWeightGrams, totalPrice],
  );

  const airCaution = useMemo(
    () => findAirCautionProducts(items.map((item) => item.product)),
    [items],
  );

  const messagePreview = useMemo(
    () =>
      items.length === 0
        ? ""
        : composeOrderMessage({
            values,
            items,
            totalPrice,
            totalWeightGrams,
            language,
            shippingEstimate,
          }),
    [values, items, totalPrice, totalWeightGrams, language, shippingEstimate],
  );

  const setField = <K extends keyof CheckoutFormValues>(
    key: K,
    value: CheckoutFormValues[K],
  ) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "deliveryMethod") {
        const method = value as DeliveryMethod;
        if (method === "international") {
          next.paymentMethod = "BankTransfer";
          if (!next.countryCode || next.countryCode === "VN") {
            next.countryCode = language === "EN" ? "US" : "US";
          }
        } else if (method === "vietnam") {
          next.countryCode = "VN";
        } else if (method === "pickup") {
          next.countryCode = "VN";
          next.paymentMethod = current.paymentMethod;
        }
      }
      return next;
    });
    setStatus("idle");
    if (touched[key] || errors[key]) {
      const nextValues = { ...values, [key]: value } as CheckoutFormValues;
      if (key === "deliveryMethod" && value === "international") {
        nextValues.paymentMethod = "BankTransfer";
      }
      const nextErrors = validateCheckoutForm(nextValues, language);
      setErrors((current) => ({ ...current, [key]: nextErrors[key] }));
    }
  };

  const markTouched = (key: keyof CheckoutFormValues) => {
    setTouched((current) => ({ ...current, [key]: true }));
    const nextErrors = validateCheckoutForm(values, language);
    setErrors((current) => ({ ...current, [key]: nextErrors[key] }));
  };

  const validateAll = () => {
    const nextErrors = validateCheckoutForm(values, language);
    setErrors(nextErrors);
    setTouched({
      name: true,
      phone: true,
      address: true,
      note: true,
      paymentMethod: true,
      deliveryMethod: true,
      countryCode: true,
      city: true,
      postalCode: true,
    });
    return Object.keys(nextErrors).length === 0;
  };

  const saveLead = async (channel: "zalo" | "whatsapp" | "saved_only") => {
    const draftMessage = composeOrderMessage({
      values,
      items,
      totalPrice,
      totalWeightGrams,
      language,
      shippingEstimate,
    });

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        channel,
        customer: values,
        items: items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          nameEn: item.product.nameEn,
          quantity: item.quantity,
          unitPrice: item.product.price,
          weight: item.product.weight,
        })),
        totalPrice,
        totalWeightGrams,
        message: draftMessage,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(data?.error || "Failed to save lead.");
    }

    const data = (await response.json()) as { lead: { id: string } };
    return data.lead.id;
  };

  const handleOrderViaChat = async (openChat: boolean) => {
    closeCart();

    if (items.length === 0) {
      setStatus("error");
      setStatusMessage(
        isVi
          ? "Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước."
          : "Your cart is empty. Please add products first.",
      );
      return;
    }

    if (!validateAll()) {
      setStatus("error");
      setStatusMessage(
        isVi
          ? "Vui lòng kiểm tra lại các trường bị lỗi trước khi gửi."
          : "Please fix the highlighted fields before sending.",
      );
      return;
    }

    setSubmitting(true);
    setStatus("saving");
    setStatusMessage(
      isVi ? "Đang lưu đơn trên web..." : "Saving your order on the website...",
    );

    try {
      const channel = openChat
        ? contact.chatChannel === "whatsapp"
          ? "whatsapp"
          : "zalo"
        : "saved_only";
      const savedLeadId = await saveLead(channel);
      setLeadId(savedLeadId);

      const message = composeOrderMessage({
        values,
        items,
        totalPrice,
        totalWeightGrams,
        language,
        leadId: savedLeadId,
        shippingEstimate,
      });

      if (!openChat) {
        setStatus("copied");
        setStatusMessage(
          isVi
            ? `Đã lưu đơn ${savedLeadId}. Shop sẽ gọi/Zalo lại nếu bạn chưa nhắn được.`
            : `Order ${savedLeadId} saved. We’ll call/message you back if chat isn’t available.`,
        );
        return;
      }

      const chatUrl = getOrderChatUrl(language, message);

      try {
        await navigator.clipboard.writeText(message);
        setStatus("copied");
        setStatusMessage(
          isVi
            ? `Đã lưu đơn ${savedLeadId} và sao chép tin nhắn. Dán vào ${contact.chatLabel} để hoàn tất.`
            : `Saved ${savedLeadId} and copied the message. ${contact.chatLabel} will open with your order.`,
        );
      } catch {
        setStatus("copied");
        setStatusMessage(
          isVi
            ? `Đã lưu đơn ${savedLeadId}. Mở ${contact.chatLabel} và gửi nội dung bên dưới.`
            : `Saved ${savedLeadId}. Open ${contact.chatLabel} and send the message below.`,
        );
      }

      window.open(chatUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : isVi
            ? "Không lưu được đơn. Thử lại hoặc gọi shop."
            : "Could not save the order. Try again or call the shop.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleOrderViaChat(true);
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-full flex-col bg-background text-foreground">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md border border-line bg-card p-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-sea-deep">
              {isVi ? "Giỏ hàng trống" : "Your cart is empty"}
            </h1>
            <p className="mt-3 text-mist">
              {isVi
                ? "Thêm đặc sản vào giỏ trước khi thanh toán."
                : "Add specialties to your cart before checking out."}
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex bg-sea px-6 py-3 text-sm font-semibold text-foam transition-colors hover:bg-sea-deep"
            >
              {isVi ? "Đến cửa hàng" : "Go to shop"}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const intlCountries = SHIPPING_COUNTRIES.filter((c) => c.code !== "VN");

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 bg-[linear-gradient(180deg,#f3f7f6_0%,#e8f1ef_50%,#efe8dc_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <nav className="mb-6 text-sm text-mist">
            <Link href="/" className="hover:text-sea">
              {isVi ? "Trang chủ" : "Home"}
            </Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-sea">
              {isVi ? "Cửa hàng" : "Shop"}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-sea-deep">
              {isVi ? "Thanh toán" : "Checkout"}
            </span>
          </nav>

          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-sea-deep sm:text-4xl">
              {isVi ? "Thanh toán / Checkout" : "Checkout"}
            </h1>
            <p className="mt-3 text-mist">
              {isVi
                ? "Nhận tại kiốt, giao Việt Nam, hoặc ship quốc tế toàn cầu — phí ship ước tính theo kg, xác nhận cuối qua chat."
                : "Pickup, Vietnam delivery, or worldwide shipping — estimate by kg, final quote confirmed on chat."}
            </p>
            <Link
              href="/shipping"
              className="mt-2 inline-flex text-sm font-medium text-sea hover:text-sea-deep"
            >
              {isVi ? "Xem bảng phí ship toàn cầu →" : "View worldwide shipping rates →"}
            </Link>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="border border-line bg-card p-5 sm:p-8"
            >
              <h2 className="font-display text-xl font-semibold text-sea-deep">
                {isVi ? "Thông tin giao hàng" : "Delivery details"}
              </h2>

              <fieldset className="mt-6">
                <legend className="text-sm font-semibold text-sea-deep">
                  {isVi ? "Hình thức nhận hàng" : "Delivery method"}
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <PaymentOption
                    selected={values.deliveryMethod === "pickup"}
                    onSelect={() => setField("deliveryMethod", "pickup")}
                    icon={Package}
                    title={isVi ? "Nhận tại kiốt" : "Kiosk pickup"}
                    description={
                      isVi
                        ? "90 Hùng Vương, Đà Nẵng — miễn phí."
                        : "90 Hung Vuong, Da Nang — free."
                    }
                  />
                  <PaymentOption
                    selected={values.deliveryMethod === "vietnam"}
                    onSelect={() => setField("deliveryMethod", "vietnam")}
                    icon={Truck}
                    title={isVi ? "Giao Việt Nam" : "Ship in Vietnam"}
                    description={
                      isVi
                        ? "Nội thành Đà Nẵng hoặc toàn quốc."
                        : "Da Nang city or nationwide."
                    }
                  />
                  <PaymentOption
                    selected={values.deliveryMethod === "international"}
                    onSelect={() => setField("deliveryMethod", "international")}
                    icon={Globe2}
                    title={isVi ? "Ship quốc tế" : "Worldwide"}
                    description={
                      isVi
                        ? "EMS / bưu chính toàn cầu."
                        : "EMS / postal worldwide."
                    }
                  />
                </div>
              </fieldset>

              <div className="mt-6 space-y-5">
                <Field
                  id="name"
                  label={isVi ? "Họ và tên" : "Full name"}
                  error={touched.name ? errors.name : undefined}
                >
                  <input
                    id="name"
                    name="name"
                    autoComplete="name"
                    value={values.name}
                    onChange={(e) => setField("name", e.target.value)}
                    onBlur={() => markTouched("name")}
                    placeholder={isVi ? "Nguyễn Văn A" : "Jane Nguyen"}
                    aria-invalid={Boolean(touched.name && errors.name)}
                    className={inputClass(Boolean(touched.name && errors.name))}
                  />
                </Field>

                <Field
                  id="phone"
                  label={isVi ? "Số điện thoại" : "Phone number"}
                  hint={
                    isVi
                      ? "Quốc tế: kèm mã quốc gia (+1 / +44 / +61…)"
                      : "Include country code for overseas (+1 / +44 / +61…)"
                  }
                  error={touched.phone ? errors.phone : undefined}
                >
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={values.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    onBlur={() => markTouched("phone")}
                    placeholder={
                      isVi ? "0905747413 hoặc +84905747413" : "+84905747413"
                    }
                    aria-invalid={Boolean(touched.phone && errors.phone)}
                    className={inputClass(Boolean(touched.phone && errors.phone))}
                  />
                </Field>

                {values.deliveryMethod === "vietnam" && (
                  <Field
                    id="vnRegion"
                    label={isVi ? "Khu vực giao" : "Delivery region"}
                  >
                    <select
                      id="vnRegion"
                      value={values.countryCode === "VN-DN" ? "VN-DN" : "VN"}
                      onChange={(e) => setField("countryCode", e.target.value)}
                      className={inputClass(false)}
                    >
                      <option value="VN-DN">
                        {isVi ? "Nội thành Đà Nẵng" : "Da Nang city"}
                      </option>
                      <option value="VN">
                        {isVi ? "Tỉnh/thành khác (toàn quốc)" : "Other Vietnam cities"}
                      </option>
                    </select>
                  </Field>
                )}

                {values.deliveryMethod === "international" && (
                  <>
                    <Field
                      id="countryCode"
                      label={isVi ? "Quốc gia nhận" : "Destination country"}
                      error={touched.countryCode ? errors.countryCode : undefined}
                    >
                      <select
                        id="countryCode"
                        value={values.countryCode}
                        onChange={(e) => setField("countryCode", e.target.value)}
                        onBlur={() => markTouched("countryCode")}
                        className={inputClass(
                          Boolean(touched.countryCode && errors.countryCode),
                        )}
                      >
                        {intlCountries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {getCountryLabel(country, language)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        id="city"
                        label={isVi ? "Thành phố" : "City"}
                        error={touched.city ? errors.city : undefined}
                      >
                        <input
                          id="city"
                          value={values.city}
                          onChange={(e) => setField("city", e.target.value)}
                          onBlur={() => markTouched("city")}
                          className={inputClass(
                            Boolean(touched.city && errors.city),
                          )}
                        />
                      </Field>
                      <Field
                        id="postalCode"
                        label={isVi ? "Mã bưu điện / ZIP" : "Postal / ZIP code"}
                        error={
                          touched.postalCode ? errors.postalCode : undefined
                        }
                      >
                        <input
                          id="postalCode"
                          value={values.postalCode}
                          onChange={(e) =>
                            setField("postalCode", e.target.value)
                          }
                          onBlur={() => markTouched("postalCode")}
                          className={inputClass(
                            Boolean(touched.postalCode && errors.postalCode),
                          )}
                        />
                      </Field>
                    </div>
                  </>
                )}

                <Field
                  id="address"
                  label={
                    values.deliveryMethod === "pickup"
                      ? isVi
                        ? "Ghi chú nhận tại kiốt"
                        : "Pickup note"
                      : isVi
                        ? "Địa chỉ nhận hàng"
                        : "Delivery address"
                  }
                  hint={
                    values.deliveryMethod === "international"
                      ? isVi
                        ? "Số nhà, đường, quận — viết rõ bằng tiếng Anh nếu được."
                        : "Street, district — prefer English for customs labels."
                      : undefined
                  }
                  error={touched.address ? errors.address : undefined}
                >
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={values.address}
                    onChange={(e) => setField("address", e.target.value)}
                    onBlur={() => markTouched("address")}
                    placeholder={
                      values.deliveryMethod === "pickup"
                        ? isVi
                          ? "VD: Đến lấy lúc 16:00, tên Nguyen"
                          : "e.g. Pickup at 4pm, name Nguyen"
                        : isVi
                          ? "Số nhà, đường, phường/quận, tỉnh/thành"
                          : "Street, district, city, country"
                    }
                    aria-invalid={Boolean(touched.address && errors.address)}
                    className={inputClass(
                      Boolean(touched.address && errors.address),
                    )}
                  />
                </Field>

                <Field
                  id="note"
                  label={isVi ? "Ghi chú (tuỳ chọn)" : "Note (optional)"}
                >
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    value={values.note}
                    onChange={(e) => setField("note", e.target.value)}
                    onBlur={() => markTouched("note")}
                    placeholder={
                      isVi
                        ? "VD: Gói quà / Tránh nước mắm trong xách tay"
                        : "e.g. Gift wrap / Keep fish sauce in checked bags"
                    }
                    className={inputClass(false)}
                  />
                </Field>
              </div>

              {values.deliveryMethod === "international" &&
                airCaution.length > 0 && (
                  <div className="mt-6 border border-sun/40 bg-[#fff8f0] px-4 py-3 text-sm text-sea-deep">
                    <p className="font-semibold">
                      {isVi
                        ? "Lưu ý món nước/gia vị khi ship máy bay"
                        : "Liquid/sauce packing note for air shipping"}
                    </p>
                    <p className="mt-1 text-mist">
                      {isVi
                        ? `Giỏ có: ${airCaution.map((p) => p.name).join(", ")}. Shop sẽ bọc chống đổ; một số nước có thể yêu cầu khai hải quan.`
                        : `Cart includes: ${airCaution.map((p) => p.nameEn).join(", ")}. We leak-wrap bottles; some destinations need customs declaration.`}
                    </p>
                  </div>
                )}

              <fieldset className="mt-8">
                <legend className="font-display text-xl font-semibold text-sea-deep">
                  {isVi ? "Phương thức thanh toán" : "Payment method"}
                </legend>
                <p className="mt-1 text-sm text-mist">
                  {values.deliveryMethod === "international"
                    ? isVi
                      ? "Ship quốc tế: chuyển khoản sau khi shop báo phí EMS cuối."
                      : "International: bank transfer after we confirm the final EMS fee."
                    : isVi
                      ? "Chọn một hình thức phù hợp với bạn."
                      : "Choose the option that works best for you."}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {values.deliveryMethod !== "international" && (
                    <PaymentOption
                      selected={values.paymentMethod === "COD"}
                      onSelect={() => setField("paymentMethod", "COD")}
                      icon={Truck}
                      title={isVi ? "COD - Tiền mặt" : "COD - Cash on Delivery"}
                      description={
                        isVi
                          ? "Thanh toán khi nhận hàng tại Việt Nam."
                          : "Pay in cash when the order arrives in Vietnam."
                      }
                    />
                  )}
                  <PaymentOption
                    selected={values.paymentMethod === "BankTransfer"}
                    onSelect={() => setField("paymentMethod", "BankTransfer")}
                    icon={Building2}
                    title={isVi ? "Chuyển khoản" : "Bank Transfer"}
                    description={
                      isVi
                        ? `Nhận STK qua ${contact.chatLabel} sau khi xác nhận đơn.`
                        : `Bank details shared on ${contact.chatLabel} after confirmation.`
                    }
                  />
                </div>
                {touched.paymentMethod && errors.paymentMethod && (
                  <p
                    className="mt-2 flex items-start gap-1.5 text-sm text-red-700"
                    role="alert"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {errors.paymentMethod}
                  </p>
                )}
              </fieldset>

              {status !== "idle" && (
                <div
                  role="status"
                  className={`mt-6 flex items-start gap-2 border px-4 py-3 text-sm ${
                    status === "copied" || status === "saving"
                      ? "border-sea/30 bg-foam text-sea-deep"
                      : "border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  {status === "copied" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
                    contact.chatChannel === "whatsapp"
                      ? "bg-[#25D366]"
                      : "bg-[#0068FF]"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  {submitting
                    ? isVi
                      ? "Đang gửi..."
                      : "Sending..."
                    : isVi
                      ? `Đặt hàng qua ${contact.chatLabel}`
                      : `Order via ${contact.chatLabel}`}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleOrderViaChat(false)}
                  className="inline-flex items-center justify-center border border-line px-6 py-3.5 text-sm font-medium text-sea-deep transition-colors hover:border-sea hover:text-sea disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isVi
                    ? "Lưu đơn (chưa chat được)"
                    : "Save order (can’t chat now)"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/shop")}
                  className="inline-flex items-center justify-center border border-line px-6 py-3.5 text-sm font-medium text-sea-deep transition-colors hover:border-sea hover:text-sea"
                >
                  {isVi ? "Tiếp tục mua" : "Continue shopping"}
                </button>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-mist">
                {getShippingNote(language)}{" "}
                {leadId ? `(${leadId})` : null}
              </p>
            </form>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="border border-line bg-card p-5">
                <h2 className="font-display text-xl font-semibold text-sea-deep">
                  {isVi ? "Tóm tắt đơn hàng" : "Order summary"}
                </h2>
                <ul className="mt-4 space-y-3 border-b border-line pb-4">
                  {items.map(({ product, quantity }) => (
                    <li
                      key={product.id}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="text-sea-deep">
                        {isVi ? product.name : product.nameEn}{" "}
                        <span className="text-mist">×{quantity}</span>
                      </span>
                      <span className="shrink-0 font-medium text-sea">
                        {formatPublicPrice(language, product.price * quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border border-sea/20 bg-foam px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sea">
                    <Scale className="h-4 w-4" />
                    {isVi ? "Khối lượng" : "Weight"}
                  </div>
                  <p className="mt-1 font-display text-xl font-bold text-sea-deep">
                    {formatWeight(totalWeightGrams, language)}
                    <span className="ml-2 text-sm font-medium text-mist">
                      → {formatWeight(shippingEstimate.chargeableWeightGrams, language)}{" "}
                      {isVi ? "tính phí" : "chargeable"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-mist">
                    {itemCount}{" "}
                    {isVi ? "sản phẩm · gồm đệm đóng gói" : "items · incl. packing buffer"}
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  {CONTACT_PRICING_ENABLED ? (
                    <p className="rounded-none border border-sea/15 bg-background px-3 py-2 text-xs leading-relaxed text-mist">
                      {getContactPricingHint(language)}
                    </p>
                  ) : null}
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-mist">
                      {isVi ? "Tạm tính SP" : "Products"}
                    </span>
                    <span className="font-medium text-sea-deep">
                      {formatPublicPrice(language, totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-mist">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {isVi ? "Ship ước tính" : "Est. shipping"}
                      </span>
                      <span className="mt-0.5 block text-xs">
                        {getZoneLabel(shippingEstimate.zone, language)} ·{" "}
                        {getZoneEta(shippingEstimate.zone, language)}
                      </span>
                    </span>
                    <span className="font-medium text-sea-deep">
                      {CONTACT_PRICING_ENABLED
                        ? formatPublicPrice(language)
                        : formatPrice(shippingEstimate.shippingFee, language)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-line pt-3">
                    <span className="font-semibold text-sea-deep">
                      {isVi ? "Tổng ước tính" : "Est. grand total"}
                    </span>
                    <span className="font-display text-2xl font-semibold text-sea">
                      {formatPublicPrice(
                        language,
                        shippingEstimate.grandTotal,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-line bg-card p-5">
                <h3 className="text-sm font-semibold text-sea-deep">
                  {isVi
                    ? `Xem trước tin nhắn ${contact.chatLabel}`
                    : `${contact.chatLabel} message preview`}
                </h3>
                <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-none bg-background p-3 text-xs leading-relaxed text-sea-deep/90">
                  {messagePreview}
                </pre>
                {status === "copied" && (
                  <button
                    type="button"
                    onClick={() => clearCart()}
                    className="mt-3 text-sm font-medium text-sea underline-offset-2 hover:underline"
                  >
                    {isVi ? "Xóa giỏ sau khi đặt" : "Clear cart after ordering"}
                  </button>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `mt-1.5 w-full border bg-background px-3 py-2.5 text-sm text-sea-deep outline-none transition-colors placeholder:text-mist/80 focus:border-sea ${
    hasError ? "border-red-400 focus:border-red-500" : "border-line"
  }`;
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-sea-deep">
        {label}
      </label>
      {hint && <p className="mt-1 text-xs text-mist">{hint}</p>}
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function PaymentOption({
  selected,
  onSelect,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: typeof Truck;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-start gap-3 border p-4 text-left transition-colors ${
        selected
          ? "border-sea bg-foam"
          : "border-line bg-background hover:border-sea/50"
      }`}
    >
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center ${
          selected ? "bg-sea text-foam" : "bg-foam text-sea"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-sea-deep">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-mist">
          {description}
        </span>
      </span>
    </button>
  );
}
