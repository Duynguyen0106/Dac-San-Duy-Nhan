"use client";

import { ShoppingCart } from "lucide-react";

type Language = "VI" | "EN";

type HeaderProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
};

export default function Header({ language, onLanguageChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
        <a href="/" className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sea text-sm font-bold tracking-wide text-foam"
          >
            DN
          </span>
          <span className="truncate font-display text-base font-semibold tracking-tight text-sea-deep sm:text-lg">
            Duy Nhân - Đặc Sản Đà Nẵng
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            role="group"
            aria-label="Language"
            className="flex overflow-hidden rounded-md border border-line bg-card text-sm font-medium"
          >
            <button
              type="button"
              onClick={() => onLanguageChange("VI")}
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
              onClick={() => onLanguageChange("EN")}
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
            aria-label={language === "VI" ? "Giỏ hàng" : "Shopping cart"}
            className="relative rounded-md border border-line bg-card p-2 text-sea-deep transition-colors hover:border-sea hover:text-sea"
          >
            <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-sm bg-sun px-1 text-[10px] font-semibold text-white">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
