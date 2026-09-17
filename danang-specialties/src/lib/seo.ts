import type { Metadata } from "next";
import type { Product } from "@/lib/products";
import { SHOP_CONTACT } from "@/lib/shopContact";

export const SITE_NAME = "Duy Nhân - Đặc Sản Đà Nẵng";
export const SITE_NAME_EN = "Duy Nhan – Da Nang Specialties";

export const DEFAULT_DESCRIPTION_VI =
  "Đặc sản Đà Nẵng chính gốc tại kiốt số 6, 90 Hùng Vương — hải sản khô, bò khô, trà, bánh và quà mang về.";

export const DEFAULT_DESCRIPTION_EN =
  "Authentic Da Nang specialties from Kiosk No. 6, 90 Hung Vuong — dried seafood, jerky, tea, sweets, and travel gifts.";

export const DEFAULT_OG_IMAGE = "/brand/shop-stall-hero.jpg";

/** Public site origin used for canonical, OG, sitemap, and JSON-LD. */
export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://localhost:3000";

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export function absoluteImageUrl(image: string) {
  if (/^https?:\/\//i.test(image)) return image;
  return absoluteUrl(image.startsWith("/") ? image : `/${image}`);
}

export function buildRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION_VI,
    applicationName: SITE_NAME,
    keywords: [
      "đặc sản Đà Nẵng",
      "Duy Nhân",
      "hải sản khô",
      "bò khô",
      "mực rim",
      "trà sâm dứa",
      "quà Đà Nẵng",
      "Da Nang specialties",
      "Hung Vuong",
      "Hai Chau",
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "shopping",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      alternateLocale: ["en_US"],
      url: siteUrl,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION_VI,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "Kiốt đặc sản Duy Nhân tại 90 Hùng Vương, Đà Nẵng",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION_VI,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export function buildProductMetadata(product: Product): Metadata {
  const title = `${product.name} (${product.nameEn})`;
  const description =
    product.description.trim() ||
    `${product.name} — ${product.nameEn}. ${DEFAULT_DESCRIPTION_VI}`;
  const path = `/products/${product.id}`;
  const image = absoluteImageUrl(product.image);

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      alternateLocale: ["en_US"],
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: [
        {
          url: image,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: [image],
    },
  };
}

export function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${getSiteUrl()}/#localbusiness`,
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    description: DEFAULT_DESCRIPTION_VI,
    url: getSiteUrl(),
    image: absoluteImageUrl(DEFAULT_OG_IMAGE),
    telephone: "+84905747413",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kiốt số 6, 90 đường Hùng Vương",
      addressLocality: "Hải Châu",
      addressRegion: "Đà Nẵng",
      postalCode: "55000",
      addressCountry: "VN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "07:00",
        closes: "21:00",
      },
    ],
    sameAs: [
      SHOP_CONTACT.facebookUrl,
      SHOP_CONTACT.zaloUrl,
      SHOP_CONTACT.whatsappUrl,
      SHOP_CONTACT.messengerUrl,
    ],
    priceRange: "₫₫",
    areaServed: {
      "@type": "City",
      name: "Đà Nẵng",
    },
  };
}

export function buildProductJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    alternateName: product.nameEn,
    description: product.description,
    image: [absoluteImageUrl(product.image)],
    sku: String(product.id),
    category: product.category,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.id}`),
      priceCurrency: "VND",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
