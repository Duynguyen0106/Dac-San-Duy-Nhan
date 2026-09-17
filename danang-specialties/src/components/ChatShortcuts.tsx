"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { SHOP_CONTACT } from "@/lib/shopContact";

type ChatChannel = {
  id: "zalo" | "messenger" | "whatsapp";
  label: string;
  href: string;
  bg: string;
  hover: string;
  icon: "zalo" | "messenger" | "whatsapp";
};

const CHANNELS: ChatChannel[] = [
  {
    id: "zalo",
    label: "Zalo",
    href: SHOP_CONTACT.zaloUrl,
    bg: "bg-[#0068FF]",
    hover: "hover:bg-[#0052cc]",
    icon: "zalo",
  },
  {
    id: "messenger",
    label: "Messenger",
    href: SHOP_CONTACT.messengerUrl,
    bg: "bg-[#0084FF]",
    hover: "hover:bg-[#006aff]",
    icon: "messenger",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: SHOP_CONTACT.whatsappUrl,
    bg: "bg-[#25D366]",
    hover: "hover:bg-[#1ebe57]",
    icon: "whatsapp",
  },
];

function ChannelIcon({ icon }: { icon: ChatChannel["icon"] }) {
  if (icon === "zalo") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
        <path d="M7.2 6.2h9.6v2.05L11.3 15.2h5.7v2.6H7.05v-2.1l5.55-6.95H7.2V6.2z" />
      </svg>
    );
  }
  if (icon === "messenger") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
        <path d="M12 2C6.36 2 2 6.14 2 11.25c0 2.9 1.44 5.49 3.7 7.2V22l3.39-1.86c.95.26 1.96.41 3 .41 5.64 0 10.2-4.14 10.2-9.3C22.29 6.14 17.64 2 12 2zm1.05 12.56-2.67-2.84-5.2 2.84 5.72-6.08 2.72 2.84 5.14-2.84-5.71 6.08z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
      <path d="M12.04 2C6.58 2 2.15 6.2 2.15 11.37c0 2.94 1.52 5.56 3.9 7.27L5.4 22l3.53-1.95c1 .28 2.06.42 3.11.42 5.46 0 9.89-4.2 9.89-9.37S17.5 2 12.04 2zm5.76 13.3c-.24.68-1.4 1.24-1.94 1.32-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.78-4.17-4.93-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.74-2.12 1-2.41.26-.29.57-.36.76-.36h.55c.18 0 .41-.07.64.49.24.58.8 2 .87 2.14.07.15.12.32.02.51-.1.2-.15.32-.3.49-.14.17-.3.38-.43.51-.14.14-.29.29-.12.57.17.28.74 1.22 1.59 1.98 1.1.98 2.02 1.28 2.3 1.42.29.15.45.12.62-.07.17-.2.72-.84.91-1.13.2-.29.39-.24.66-.14.26.1 1.68.79 1.97.94.29.14.48.22.55.34.07.12.07.7-.17 1.38z" />
    </svg>
  );
}

/** Floating shortcuts for Zalo, Facebook Messenger, and WhatsApp. */
export default function ChatShortcuts() {
  const pathname = usePathname();
  const { language } = useTranslation();
  const [open, setOpen] = useState(false);
  const isVi = language === "VI";

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-3 z-[45] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <div
        className={`flex flex-col items-end gap-2 transition-all duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {CHANNELS.map((channel) => (
          <a
            key={channel.id}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              isVi ? `Chat ${channel.label}` : `Chat on ${channel.label}`
            }
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03] ${channel.bg} ${channel.hover}`}
          >
            <ChannelIcon icon={channel.icon} />
            <span>{channel.label}</span>
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={
          open
            ? isVi
              ? "Đóng chat nhanh"
              : "Close chat shortcuts"
            : isVi
              ? "Mở chat nhanh"
              : "Open chat shortcuts"
        }
        className="flex h-12 w-12 items-center justify-center rounded-full bg-sun text-white shadow-[0_10px_30px_rgba(196,98,36,0.35)] transition-transform hover:scale-[1.04] hover:bg-sun-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun sm:h-14 sm:w-14"
      >
        {open ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
        ) : (
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
        )}
      </button>
    </div>
  );
}
