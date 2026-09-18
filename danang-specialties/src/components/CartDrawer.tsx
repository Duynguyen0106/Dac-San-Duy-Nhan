"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Scale, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  CONTACT_PRICING_ENABLED,
  formatPublicPrice,
  formatWeight,
  getContactPricingHint,
  getProductWeightGrams,
  type Language,
} from "@/lib/products";

type CartDrawerProps = {
  language?: Language;
};

export default function CartDrawer({ language = "VI" }: CartDrawerProps) {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalPrice,
    totalWeightGrams,
    itemCount,
  } = useCart();

  const isVi = language === "VI";

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        className={`fixed inset-0 z-[60] bg-sea-deep/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={isVi ? "Giỏ hàng" : "Shopping cart"}
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-line bg-card shadow-[-12px_0_40px_-20px_rgba(10,61,72,0.35)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-sea-deep">
              {isVi ? "Giỏ hàng" : "Your cart"}
            </h2>
            <p className="mt-0.5 text-sm text-mist">
              {isVi
                ? `${itemCount} sản phẩm`
                : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label={isVi ? "Đóng giỏ hàng" : "Close cart"}
            className="rounded-md border border-line p-2 text-sea-deep transition-colors hover:bg-foam"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Weight-first summary for Vietnam shipping */}
        <div className="border-b border-line bg-foam px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center bg-sea text-foam">
              <Scale className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-sea">
                {isVi ? "Tổng khối lượng" : "Total weight"}
              </p>
              <p className="mt-1 font-display text-2xl font-bold tracking-tight text-sea-deep">
                {formatWeight(totalWeightGrams, language)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-mist">
                {isVi
                  ? "Ship VN & quốc tế tính theo kg — xem bảng phí / ước tính ở thanh toán."
                  : "VN & worldwide shipping by kg — see rates / estimate at checkout."}
              </p>
              <Link
                href="/shipping"
                onClick={closeCart}
                className="mt-2 inline-flex text-xs font-medium text-sea hover:text-sea-deep"
              >
                {isVi ? "Ship toàn cầu →" : "Worldwide shipping →"}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-mist">
                {isVi ? "Giỏ hàng đang trống." : "Your cart is empty."}
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="bg-sea px-5 py-2.5 text-sm font-semibold text-foam transition-colors hover:bg-sea-deep"
              >
                {isVi ? "Xem cửa hàng" : "Browse shop"}
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => {
                const lineWeight =
                  getProductWeightGrams(product) * quantity;
                return (
                  <li
                    key={product.id}
                    className="flex gap-3 border border-line bg-background p-3"
                  >
                    <Link
                      href={`/products/${product.id}`}
                      onClick={closeCart}
                      className="relative h-20 w-20 shrink-0 overflow-hidden bg-foam"
                    >
                      <Image
                        src={product.image}
                        alt={isVi ? product.name : product.nameEn}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          onClick={closeCart}
                          className="font-display text-base font-semibold text-sea-deep hover:text-sea"
                        >
                          {isVi ? product.name : product.nameEn}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          aria-label={
                            isVi ? "Xóa sản phẩm" : "Remove item"
                          }
                          className="shrink-0 p-1 text-mist transition-colors hover:text-sea-deep"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-1 text-xs text-mist">
                        {product.weight} × {quantity} ={" "}
                        <span className="font-medium text-sea-deep">
                          {formatWeight(lineWeight, language)}
                        </span>
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center border border-line bg-card">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(product.id, quantity - 1)
                            }
                            aria-label={
                              isVi ? "Giảm số lượng" : "Decrease quantity"
                            }
                            className="p-2 text-sea-deep hover:bg-foam"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-sea-deep">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(product.id, quantity + 1)
                            }
                            aria-label={
                              isVi ? "Tăng số lượng" : "Increase quantity"
                            }
                            className="p-2 text-sea-deep hover:bg-foam"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-sea">
                          {formatPublicPrice(language, product.price * quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line bg-background px-5 py-4">
            <div className="mb-3 flex items-center justify-between gap-3 border border-sea/20 bg-foam px-4 py-3">
              <span className="text-sm font-medium text-sea-deep">
                {isVi ? "Tổng khối lượng" : "Total weight"}
              </span>
              <span className="font-display text-lg font-bold text-sea-deep">
                {formatWeight(totalWeightGrams, language)}
              </span>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-mist">
                  {isVi ? "Giá" : "Price"}
                </span>
                <span className="font-display text-xl font-semibold text-sea">
                  {formatPublicPrice(language, totalPrice)}
                </span>
              </div>
              {CONTACT_PRICING_ENABLED ? (
                <p className="mt-1 text-xs text-mist">
                  {getContactPricingHint(language)}
                </p>
              ) : null}
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-sun py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-sun-hover"
            >
              {isVi ? "Tiến hành đặt hàng" : "Proceed to checkout"}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
