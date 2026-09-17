"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  MessageCircle,
  Scale,
  Truck,
} from "lucide-react";
import Header from "@/components/Header";
import { useLanguage } from "@/components/Providers";
import { useCart } from "@/context/CartContext";
import {
  composeZaloOrderMessage,
  validateCheckoutForm,
  ZALO_ORDER_URL,
  type CheckoutFormErrors,
  type CheckoutFormValues,
} from "@/lib/checkout";
import { formatPrice, formatWeight } from "@/lib/products";

const initialValues: CheckoutFormValues = {
  name: "",
  phone: "",
  address: "",
  note: "",
  paymentMethod: "COD",
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

  const [values, setValues] = useState<CheckoutFormValues>(initialValues);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutFormValues, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const messagePreview = useMemo(
    () =>
      items.length === 0
        ? ""
        : composeZaloOrderMessage({
            values,
            items,
            totalPrice,
            totalWeightGrams,
            language,
          }),
    [values, items, totalPrice, totalWeightGrams, language],
  );

  const setField = <K extends keyof CheckoutFormValues>(
    key: K,
    value: CheckoutFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setStatus("idle");
    if (touched[key] || errors[key]) {
      const nextValues = { ...values, [key]: value };
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
    });
    return Object.keys(nextErrors).length === 0;
  };

  const handleOrderViaZalo = async () => {
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

    const message = composeZaloOrderMessage({
      values,
      items,
      totalPrice,
      totalWeightGrams,
      language,
    });

    try {
      await navigator.clipboard.writeText(message);
      setStatus("copied");
      setStatusMessage(
        isVi
          ? "Đã sao chép đơn hàng. Dán tin nhắn vào Zalo để hoàn tất."
          : "Order copied. Paste the message in Zalo to finish.",
      );
    } catch {
      setStatus("copied");
      setStatusMessage(
        isVi
          ? "Mở Zalo và gửi nội dung đơn hàng bên dưới."
          : "Open Zalo and send the order message shown below.",
      );
    }

    window.open(ZALO_ORDER_URL, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleOrderViaZalo();
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
                ? "Dành cho khách trong nước, Việt kiều và du khách — điền rõ họ tên, SĐT (kèm mã quốc gia nếu ở nước ngoài) và địa chỉ nhận hàng."
                : "For local customers, overseas Vietnamese, and tourists — use clear contact details and include your country code if ordering from abroad."}
            </p>
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

              <div className="mt-6 space-y-5">
                <Field
                  id="name"
                  label={isVi ? "Họ và tên" : "Full name"}
                  hint={
                    isVi
                      ? "Tên người nhận hàng (Full name of recipient)"
                      : "Name of the person receiving the order"
                  }
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
                      ? "Việt Nam: 090… — Quốc tế: +84… / +1…"
                      : "Vietnam: 090… — Overseas: +84… / +1…"
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
                    placeholder={isVi ? "0905747413 hoặc +84905747413" : "+84905747413"}
                    aria-invalid={Boolean(touched.phone && errors.phone)}
                    className={inputClass(Boolean(touched.phone && errors.phone))}
                  />
                </Field>

                <Field
                  id="address"
                  label={isVi ? "Địa chỉ nhận hàng" : "Delivery address"}
                  hint={
                    isVi
                      ? "Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành (hoặc địa chỉ khách sạn nếu là du khách)."
                      : "Street, district, city, country — or hotel name/room if you are visiting."
                  }
                  error={touched.address ? errors.address : undefined}
                >
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    autoComplete="street-address"
                    value={values.address}
                    onChange={(e) => setField("address", e.target.value)}
                    onBlur={() => markTouched("address")}
                    placeholder={
                      isVi
                        ? "123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng"
                        : "123 Nguyen Van Linh, Hai Chau, Da Nang, Vietnam"
                    }
                    aria-invalid={Boolean(touched.address && errors.address)}
                    className={inputClass(Boolean(touched.address && errors.address))}
                  />
                </Field>

                <Field
                  id="note"
                  label={
                    isVi
                      ? "Ghi chú (không bắt buộc)"
                      : "Note (optional)"
                  }
                  hint={
                    isVi
                      ? "Giờ giao, yêu cầu đóng gói quà, hoặc ghi chú tiếng Anh/Việt."
                      : "Delivery time, gift wrap, or bilingual notes welcome."
                  }
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
                        ? "Ví dụ: Gọi trước khi giao / Please call on arrival"
                        : "e.g. Call before delivery / Gift wrap please"
                    }
                    className={inputClass(false)}
                  />
                </Field>
              </div>

              <fieldset className="mt-8">
                <legend className="font-display text-xl font-semibold text-sea-deep">
                  {isVi ? "Phương thức thanh toán" : "Payment method"}
                </legend>
                <p className="mt-1 text-sm text-mist">
                  {isVi
                    ? "Chọn một hình thức phù hợp với bạn."
                    : "Choose the option that works best for you."}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                  <PaymentOption
                    selected={values.paymentMethod === "BankTransfer"}
                    onSelect={() => setField("paymentMethod", "BankTransfer")}
                    icon={Building2}
                    title={isVi ? "Chuyển khoản" : "Bank Transfer"}
                    description={
                      isVi
                        ? "Nhận STK qua Zalo sau khi xác nhận đơn."
                        : "Bank details shared on Zalo after confirmation."
                    }
                  />
                </div>
                {touched.paymentMethod && errors.paymentMethod && (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-red-700" role="alert">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {errors.paymentMethod}
                  </p>
                )}
              </fieldset>

              {status !== "idle" && (
                <div
                  role="status"
                  className={`mt-6 flex items-start gap-2 border px-4 py-3 text-sm ${
                    status === "copied"
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

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 bg-[#0068FF] px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" />
                  {isVi ? "Đặt hàng qua Zalo" : "Order via Zalo"}
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
                {isVi
                  ? "Nút Zalo sẽ sao chép chi tiết đơn hàng và mở chat với Duy Nhân (0905747413). Bạn chỉ cần dán tin nhắn để gửi."
                  : "The Zalo button copies your order details and opens chat with Duy Nhân (0905747413). Paste the message to send."}
              </p>
            </form>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="border border-line bg-card p-5">
                <h2 className="font-display text-xl font-semibold text-sea-deep">
                  {isVi ? "Tóm tắt đơn hàng" : "Order summary"}
                </h2>
                <ul className="mt-4 space-y-3 border-b border-line pb-4">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="flex justify-between gap-3 text-sm">
                      <span className="text-sea-deep">
                        {isVi ? product.name : product.nameEn}{" "}
                        <span className="text-mist">×{quantity}</span>
                      </span>
                      <span className="shrink-0 font-medium text-sea">
                        {formatPrice(product.price * quantity, language)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border border-sea/20 bg-foam px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sea">
                    <Scale className="h-4 w-4" />
                    {isVi ? "Tổng khối lượng" : "Total weight"}
                  </div>
                  <p className="mt-1 font-display text-2xl font-bold text-sea-deep">
                    {formatWeight(totalWeightGrams, language)}
                  </p>
                  <p className="mt-1 text-xs text-mist">
                    {isVi
                      ? `${itemCount} sản phẩm — phí ship tính theo kg`
                      : `${itemCount} items — shipping charged by weight`}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-mist">
                    {isVi ? "Tổng tiền" : "Total"}
                  </span>
                  <span className="font-display text-2xl font-semibold text-sea">
                    {formatPrice(totalPrice, language)}
                  </span>
                </div>
              </div>

              <div className="border border-line bg-card p-5">
                <h3 className="text-sm font-semibold text-sea-deep">
                  {isVi ? "Xem trước tin nhắn Zalo" : "Zalo message preview"}
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

      <footer className="border-t border-line bg-sea-deep text-foam">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-display text-lg font-semibold">Duy Nhân</p>
          <p className="text-sm text-foam/75">
            {isVi
              ? "Đặt hàng nhanh qua Zalo — hỗ trợ Việt & English."
              : "Order quickly via Zalo — Vietnamese & English supported."}
          </p>
        </div>
      </footer>
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
