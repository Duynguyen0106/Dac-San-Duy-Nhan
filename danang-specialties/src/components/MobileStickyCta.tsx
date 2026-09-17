"use client";

import { usePathname } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getShopContact } from "@/lib/shopContact";

/** Fixed bottom bar on mobile for call + chat (hidden on admin). */
export default function MobileStickyCta() {
  const pathname = usePathname();
  const { language } = useTranslation();
  const contact = getShopContact(language);
  const isVi = language === "VI";

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-line bg-card/95 px-3 py-2.5 backdrop-blur-md sm:hidden">
      <div className="mx-auto flex max-w-6xl gap-2">
        <a
          href={contact.phoneTel}
          className="inline-flex flex-1 items-center justify-center gap-2 border border-line bg-background px-3 py-3 text-sm font-semibold text-sea-deep"
        >
          <Phone className="h-4 w-4" />
          {isVi ? "Gọi" : "Call"}
        </a>
        <a
          href={contact.chatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 bg-sea px-3 py-3 text-sm font-semibold text-foam"
        >
          <MessageCircle className="h-4 w-4" />
          {isVi ? `Chat ${contact.chatLabel}` : `Chat ${contact.chatLabel}`}
        </a>
      </div>
    </div>
  );
}
