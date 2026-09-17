"use client";

import { MapPin, Phone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { SHOP_CONTACT } from "@/lib/shopContact";

export default function SiteFooter() {
  const { t, language } = useTranslation();
  const isVi = language === "VI";
  const address = isVi ? SHOP_CONTACT.addressVi : SHOP_CONTACT.addressEn;

  return (
    <footer className="border-t border-line bg-sea-deep text-foam">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-[1fr_auto] sm:px-6 sm:py-10">
        <div>
          <p className="font-display text-lg font-semibold">
            {t("common.brandShort")}
          </p>
          <p className="mt-1 text-sm text-foam/75">{t("common.footerTagline")}</p>

          <div className="mt-5 space-y-3 text-sm text-foam/90">
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-foam/70" />
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-foam/60">
                  {t("common.addressLabel")}
                </span>
                {address}
              </span>
            </p>
            <p className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-foam/70" />
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-foam/60">
                  {t("common.phoneLabel")}
                </span>
                <a
                  href={SHOP_CONTACT.phoneTel}
                  className="font-medium transition-colors hover:text-white"
                >
                  {SHOP_CONTACT.phoneDisplay}
                </a>
                <span className="text-foam/60"> · </span>
                <a
                  href={SHOP_CONTACT.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Zalo
                </a>
              </span>
            </p>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-foam/60">
            {t("common.hoursLabel")}
          </p>
          <p className="mt-1 text-sm text-foam/90">
            {isVi ? SHOP_CONTACT.hoursVi : SHOP_CONTACT.hoursEn}
          </p>
        </div>
      </div>
    </footer>
  );
}
