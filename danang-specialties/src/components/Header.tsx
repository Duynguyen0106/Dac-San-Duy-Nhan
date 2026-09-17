"use client";

import Link from "next/link";
import { Phone, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/hooks/useTranslation";
import { getShopContact } from "@/lib/shopContact";

export default function Header() {
  const { t, language, setLanguage } = useTranslation();
  const { itemCount, openCart } = useCart();
  const contact = getShopContact(language);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-background/90 backdrop-blur-md">
      <div className="border-b border-line/50 bg-foam/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 text-xs text-sea-deep sm:px-6">
          <a
            href={contact.askUrl}
            target={contact.askChannel === "whatsapp" ? "_blank" : undefined}
            rel={
              contact.askChannel === "whatsapp"
                ? "noopener noreferrer"
                : undefined
            }
            className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-sea"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>{contact.askDisplay}</span>
            <span className="hidden text-mist sm:inline">
              · {contact.askLabel}
            </span>
          </a>
          <p className="max-w-full truncate text-mist sm:max-w-[70%]">
            {contact.address}
          </p>
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sea text-sm font-bold tracking-wide text-foam"
            >
              DN
            </span>
            <span className="truncate font-display text-base font-semibold tracking-tight text-sea-deep sm:text-lg">
              {t("common.brand")}
            </span>
          </Link>
          <Link
            href="/shop"
            className="hidden text-sm font-medium text-sea-deep transition-colors hover:text-sea sm:inline"
          >
            {t("common.shop")}
          </Link>
          <Link
            href="/admin"
            className="hidden text-sm font-medium text-mist transition-colors hover:text-sea md:inline"
          >
            Admin
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/shop"
            className="text-sm font-medium text-sea-deep transition-colors hover:text-sea sm:hidden"
          >
            {t("common.shop")}
          </Link>
          <div
            role="group"
            aria-label={t("common.language")}
            className="flex overflow-hidden rounded-md border border-line bg-card text-sm font-medium"
          >
            <button
              type="button"
              onClick={() => setLanguage("VI")}
              className={`px-2.5 py-1.5 transition-colors sm:px-3 ${
                language === "VI"
                  ? "bg-sea text-foam"
                  : "text-sea-deep hover:bg-foam"
              }`}
            >
              VI
            </button>
            <button
              type="button"
              onClick={() => setLanguage("EN")}
              className={`px-2.5 py-1.5 transition-colors sm:px-3 ${
                language === "EN"
                  ? "bg-sea text-foam"
                  : "text-sea-deep hover:bg-foam"
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={openCart}
            aria-label={t("common.cart")}
            className="relative rounded-md border border-line bg-card p-2 text-sea-deep transition-colors hover:border-sea hover:text-sea"
          >
            <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-sm bg-sun px-1 text-[10px] font-semibold text-white">
              {itemCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
