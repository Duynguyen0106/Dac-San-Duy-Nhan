import type { Language } from "@/lib/products";

export const SHOP_CONTACT = {
  /** Local Vietnam line for immediate calls / questions (VI). */
  phoneViCall: "0905748413",
  phoneViCallDisplay: "0905 748 413",
  phoneViCallTel: "tel:+84905748413",

  /** Local Vietnam Zalo / shop line. */
  phoneVi: "0905747413",
  phoneViDisplay: "0905 747 413",
  phoneViTel: "tel:+84905747413",
  phoneViAlt: "0983871071",
  phoneViAltDisplay: "0983 871 071",
  zaloUrl: "https://zalo.me/0905747413",

  /** International WhatsApp line (English). */
  phoneEn: "447882843513",
  phoneEnDisplay: "+44 7882 843513",
  phoneEnTel: "tel:+447882843513",
  whatsappUrl: "https://wa.me/447882843513",

  addressVi:
    "Kiốt số 6, 90 đường Hùng Vương, quận Hải Châu, thành phố Đà Nẵng, 55000, Việt Nam",
  addressEn:
    "Kiosk No. 6, 90 Hung Vuong Street, Hai Chau District, Da Nang 55000, Vietnam",
  hoursVi: "07:00 – 21:00",
  hoursEn: "7:00 AM – 9:00 PM",
} as const;

export type ShopChatChannel = "zalo" | "whatsapp";
export type ShopAskChannel = "call" | "whatsapp";

export type LocalizedShopContact = {
  language: Language;
  phone: string;
  phoneDisplay: string;
  phoneTel: string;
  chatUrl: string;
  chatLabel: string;
  chatChannel: ShopChatChannel;
  /** Instant ask: phone call (VI) or WhatsApp (EN). */
  askUrl: string;
  askLabel: string;
  askChannel: ShopAskChannel;
  askDisplay: string;
  address: string;
  hours: string;
};

/** Build a WhatsApp deep link, optionally with a prefilled order message. */
export function buildWhatsAppUrl(message?: string): string {
  if (!message?.trim()) return SHOP_CONTACT.whatsappUrl;
  return `${SHOP_CONTACT.whatsappUrl}?text=${encodeURIComponent(message)}`;
}

/** Contact details switch by UI language: VI → Zalo VN, EN → WhatsApp UK. */
export function getShopContact(language: Language): LocalizedShopContact {
  if (language === "EN") {
    return {
      language,
      phone: SHOP_CONTACT.phoneEn,
      phoneDisplay: SHOP_CONTACT.phoneEnDisplay,
      phoneTel: SHOP_CONTACT.phoneEnTel,
      chatUrl: SHOP_CONTACT.whatsappUrl,
      chatLabel: "WhatsApp",
      chatChannel: "whatsapp",
      askUrl: SHOP_CONTACT.whatsappUrl,
      askLabel: "WhatsApp",
      askChannel: "whatsapp",
      askDisplay: SHOP_CONTACT.phoneEnDisplay,
      address: SHOP_CONTACT.addressEn,
      hours: SHOP_CONTACT.hoursEn,
    };
  }

  return {
    language,
    phone: SHOP_CONTACT.phoneVi,
    phoneDisplay: SHOP_CONTACT.phoneViDisplay,
    phoneTel: SHOP_CONTACT.phoneViTel,
    chatUrl: SHOP_CONTACT.zaloUrl,
    chatLabel: "Zalo",
    chatChannel: "zalo",
    askUrl: SHOP_CONTACT.phoneViCallTel,
    askLabel: "Gọi ngay",
    askChannel: "call",
    askDisplay: SHOP_CONTACT.phoneViCallDisplay,
    address: SHOP_CONTACT.addressVi,
    hours: SHOP_CONTACT.hoursVi,
  };
}

/** @deprecated Use getShopContact(language).phoneTel */
export const phoneTel = SHOP_CONTACT.phoneViTel;
/** @deprecated Use getShopContact(language).chatUrl */
export const zaloUrl = SHOP_CONTACT.zaloUrl;
