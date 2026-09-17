import type { MetadataRoute } from "next";
import { SHOP_CATEGORY_SLUGS } from "@/lib/products";
import { readProducts } from "@/lib/productStore";
import { getSiteUrl } from "@/lib/seo";
import { listTips } from "@/lib/tips";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const products = await readProducts();
  const tips = listTips();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/how-to-order`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/tips`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/promo/airport-packing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${siteUrl}/promo/tet-gifts`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
  ];

  const categoryEntries: MetadataRoute.Sitemap = SHOP_CATEGORY_SLUGS.map(
    (slug) => ({
      url: `${siteUrl}/shop/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }),
  );

  const tipEntries: MetadataRoute.Sitemap = tips.map((tip) => ({
    url: `${siteUrl}/tips/${tip.slug}`,
    lastModified: new Date(tip.date),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/products/${product.id}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...tipEntries,
    ...productEntries,
  ];
}
