"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getShopContact } from "@/lib/shopContact";

/** Floating quick-ask control: call (VI) or WhatsApp (EN). */
export default function AskButton() {
  const { language } = useTranslation();
  const contact = getShopContact(language);
  const isCall = contact.askChannel === "call";

  return (
    <a
      href={contact.askUrl}
      target={isCall ? undefined : "_blank"}
      rel={isCall ? undefined : "noopener noreferrer"}
      aria-label={
        isCall
          ? `Gọi hỏi hàng ${contact.askDisplay}`
          : `Ask on WhatsApp ${contact.askDisplay}`
      }
      className="fixed bottom-5 right-4 z-[60] flex items-center gap-2 rounded-full bg-sun px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(196,98,36,0.35)] transition-transform hover:scale-[1.03] hover:bg-sun-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun sm:bottom-6 sm:right-6"
    >
      {isCall ? (
        <Phone className="h-5 w-5 shrink-0" strokeWidth={2} />
      ) : (
        <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={2} />
      )}
      <span className="pr-0.5">
        {isCall ? "Gọi hỏi hàng" : "Ask on WhatsApp"}
      </span>
    </a>
  );
}
