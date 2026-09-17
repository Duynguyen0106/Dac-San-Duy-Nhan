"use client";

import { MapPin, Phone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getShopContact } from "@/lib/shopContact";

export default function SiteFooter() {
  const { t, language } = useTranslation();
  const contact = getShopContact(language);

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
                {contact.address}
              </span>
            </p>
            <p className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-foam/70" />
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-foam/60">
                  {t("common.phoneLabel")}
                </span>
                <a
                  href={language === "VI" ? contact.askUrl : contact.phoneTel}
                  className="font-medium transition-colors hover:text-white"
                >
                  {language === "VI" ? contact.askDisplay : contact.phoneDisplay}
                </a>
                {language === "VI" && (
                  <>
                    <span className="text-foam/60"> · </span>
                    <a
                      href="tel:+84983871071"
                      className="font-medium transition-colors hover:text-white"
                    >
                      0983 871 071
                    </a>
                  </>
                )}
                <span className="text-foam/60"> · </span>
                <a
                  href={contact.askUrl}
                  target={
                    contact.askChannel === "whatsapp" ? "_blank" : undefined
                  }
                  rel={
                    contact.askChannel === "whatsapp"
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="transition-colors hover:text-white"
                >
                  {contact.askLabel}
                </a>
                {language === "VI" && (
                  <>
                    <span className="text-foam/60"> · </span>
                    <a
                      href={contact.chatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white"
                    >
                      {contact.chatLabel}
                    </a>
                  </>
                )}
              </span>
            </p>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-foam/60">
            {t("common.hoursLabel")}
          </p>
          <p className="mt-1 text-sm text-foam/90">{contact.hours}</p>
        </div>
      </div>
    </footer>
  );
}
