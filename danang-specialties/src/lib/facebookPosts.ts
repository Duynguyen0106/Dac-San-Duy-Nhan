import type { Language, Product } from "@/lib/products";
import { categoryLabels, formatPrice, type ShopCategory } from "@/lib/products";
import { SHOP_CONTACT } from "@/lib/shopContact";

export const FACEBOOK_PAGE_ID_DEFAULT = "100057455118487";
export const FACEBOOK_GRAPH_VERSION = "v21.0";

export function getFacebookPageId() {
  return (
    process.env.FACEBOOK_PAGE_ID?.trim() ||
    process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID?.trim() ||
    FACEBOOK_PAGE_ID_DEFAULT
  );
}

export function getFacebookPageAccessToken() {
  return process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim() || "";
}

export function isFacebookPostingConfigured() {
  return Boolean(getFacebookPageAccessToken() && getFacebookPageId());
}

export function getPublicSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://localhost:3000";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

export function absolutePublicUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${getPublicSiteUrl()}${path}`;
}

export type FacebookPostDraft = {
  productId: number;
  language: Language;
  caption: string;
  productUrl: string;
  imageUrl: string;
  pageUrl: string;
  shareUrl: string;
};

function categoryLabel(category: string, language: Language) {
  const labels = categoryLabels[category as ShopCategory];
  if (!labels) return category;
  return language === "VI" ? labels.vi : labels.en;
}

function hashtagify(value: string) {
  return (
    "#" +
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "")
  );
}

/** Compose a ready-to-publish Facebook caption for one catalog item. */
export function composeFacebookPost(
  product: Product,
  language: Language = "VI",
): FacebookPostDraft {
  const productUrl = absolutePublicUrl(`/products/${product.id}`);
  const imageUrl = absolutePublicUrl(product.image);
  const pageUrl = SHOP_CONTACT.facebookUrl;
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
  const category = categoryLabel(product.category, language);
  const price = formatPrice(product.price, language);

  const caption =
    language === "VI"
      ? [
          `🌊 ${product.name}`,
          product.nameEn !== product.name ? `(${product.nameEn})` : null,
          "",
          product.description.trim(),
          "",
          `📦 ${product.weight} · ${price}`,
          `🏷️ ${category}`,
          "",
          `📍 ${SHOP_CONTACT.addressVi}`,
          `☎️ Zalo ${SHOP_CONTACT.phoneViDisplay}`,
          `💬 Messenger: ${SHOP_CONTACT.messengerUrl}`,
          "",
          `🛒 Xem & đặt: ${productUrl}`,
          "",
          [
            "#DacSanDaNang",
            "#DuyNhan",
            hashtagify(category),
            "#QuaMangVe",
            "#HaiSanKho",
          ].join(" "),
        ]
          .filter((line) => line !== null)
          .join("\n")
      : [
          `🌊 ${product.nameEn}`,
          product.name !== product.nameEn ? `(${product.name})` : null,
          "",
          product.descriptionEn.trim(),
          "",
          `📦 ${product.weight} · ${price}`,
          `🏷️ ${category}`,
          "",
          `📍 ${SHOP_CONTACT.addressEn}`,
          `💬 WhatsApp ${SHOP_CONTACT.phoneEnDisplay}`,
          `📘 Facebook: ${pageUrl}`,
          "",
          `🛒 Shop link: ${productUrl}`,
          "",
          [
            "#DaNangSpecialties",
            "#DuyNhan",
            hashtagify(category),
            "#TravelGifts",
            "#VietnamFood",
          ].join(" "),
        ]
          .filter((line) => line !== null)
          .join("\n");

  return {
    productId: product.id,
    language,
    caption,
    productUrl,
    imageUrl,
    pageUrl,
    shareUrl,
  };
}

export type FacebookPublishMode = "photo" | "link";

export type FacebookPublishResult = {
  ok: boolean;
  productId: number;
  mode?: FacebookPublishMode;
  postId?: string;
  photoId?: string;
  permalink?: string;
  error?: string;
  draft: FacebookPostDraft;
};

export async function publishFacebookDraft(
  draft: FacebookPostDraft,
  mode: FacebookPublishMode = "photo",
): Promise<FacebookPublishResult> {
  const token = getFacebookPageAccessToken();
  const pageId = getFacebookPageId();

  if (!token) {
    return {
      ok: false,
      productId: draft.productId,
      error:
        "FACEBOOK_PAGE_ACCESS_TOKEN is not configured. Copy the caption or open the share dialog instead.",
      draft,
    };
  }

  const endpoint =
    mode === "photo"
      ? `https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/${pageId}/photos`
      : `https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/${pageId}/feed`;

  const body =
    mode === "photo"
      ? {
          url: draft.imageUrl,
          caption: draft.caption,
          access_token: token,
        }
      : {
          message: draft.caption,
          link: draft.productUrl,
          access_token: token,
        };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as {
      id?: string;
      post_id?: string;
      error?: { message?: string };
    };

    if (!response.ok || data.error) {
      return {
        ok: false,
        productId: draft.productId,
        mode,
        error: data.error?.message || `Facebook API error (${response.status})`,
        draft,
      };
    }

    const postId = data.post_id || data.id;
    return {
      ok: true,
      productId: draft.productId,
      mode,
      postId,
      photoId: mode === "photo" ? data.id : undefined,
      permalink: postId
        ? `https://www.facebook.com/${postId}`
        : draft.pageUrl,
      draft,
    };
  } catch (error) {
    return {
      ok: false,
      productId: draft.productId,
      mode,
      error:
        error instanceof Error ? error.message : "Facebook publish failed.",
      draft,
    };
  }
}
