import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import {
  SHOP_CATEGORY_SLUGS,
  categoryLabels,
  categoryToSlug,
  slugToCategory,
  type ShopCategory,
} from "@/lib/products";
import { readProducts } from "@/lib/productStore";
import {
  buildBreadcrumbJsonLd,
  buildSimplePageMetadata,
} from "@/lib/seo";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

const CATEGORY_BLURBS: Record<
  ShopCategory,
  { vi: string; en: string }
> = {
  "Dried Seafood": {
    vi: "Mực một nắng, cá chỉ vàng, tôm khô và rong biển — đóng gói mang về.",
    en: "One-sun squid, golden threadfin, dried shrimp, and seaweed — packed to go.",
  },
  Snacks: {
    vi: "Mực rim me, bò khô, ghẹ sữa và đồ ăn vặt đậm vị miền Trung.",
    en: "Tamarind squid, jerky, soft-shell crab, and central Vietnam snacks.",
  },
  "Cold Cuts": {
    vi: "Chả bò, tré, nem chua và chả cá sẵn sàng cho bữa sáng hoặc biếu.",
    en: "Beef roll, tre, nem chua, and fish cake for breakfast or gifting.",
  },
  Condiments: {
    vi: "Nước mắm Nam Ô, mắm nêm Dì Cẩn, muối ớt và tỏi Lý Sơn.",
    en: "Nam O fish sauce, Di Can mam nem, chili salt, and Ly Son garlic.",
  },
  "Tea & Coffee": {
    vi: "Trà sâm dứa, trà cung đình, trà gừng và cà phê phin Đà Nẵng.",
    en: "Pandan-ginseng tea, imperial tea, ginger brew, and phin coffee.",
  },
  "Cakes & Candy": {
    vi: "Bánh khô mè Cẩm Lệ, bánh in, kẹo mè xửng và món ngọt mang đi.",
    en: "Cam Le sesame crisps, banh in, sesame candy, and sweets for travel.",
  },
  "Rice Paper": {
    vi: "Bánh tráng Đại Lộc, mè nướng, tôm hành và set cuốn tiện lợi.",
    en: "Dai Loc sheets, sesame toast, shrimp scallion, and roll sets.",
  },
  "Dried Fruit & Nuts": {
    vi: "Xoài sấy, chuối sấy, hạt điều và mứt tắc mật ong.",
    en: "Dried mango, banana chips, cashews, and honey cumquat candy.",
  },
  Gifts: {
    vi: "Hộp trà, set Nam Ô và giỏ quà Tết — chọn sẵn để biếu.",
    en: "Tea boxes, Nam O sets, and Tet baskets — ready-made gifts.",
  },
};

export function generateStaticParams() {
  return SHOP_CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = slugToCategory(slug);
  if (!category) {
    return { title: "Danh mục", robots: { index: false } };
  }
  const label = categoryLabels[category];
  return buildSimplePageMetadata({
    title: label.vi,
    description: CATEGORY_BLURBS[category].vi,
    path: `/shop/${slug}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = slugToCategory(slug);
  if (!category) notFound();

  const products = (await readProducts()).filter(
    (product) => product.category === category,
  );
  const label = categoryLabels[category];
  const blurb = CATEGORY_BLURBS[category];

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Trang chủ", path: "/" },
          { name: "Cửa hàng", path: "/shop" },
          { name: label.vi, path: `/shop/${categoryToSlug(category)}` },
        ])}
      />
      <Header />
      <main className="flex-1 bg-[linear-gradient(180deg,#0f5c6c_0%,#0a3d48_42%,#f3f7f6_42%,#f3f7f6_100%)] pb-24 sm:pb-0">
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 text-foam sm:px-6 sm:pb-12 sm:pt-12">
          <nav className="text-sm text-foam/70">
            <Link href="/" className="hover:text-white">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-white">
              Cửa hàng
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{label.vi}</span>
          </nav>
          <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
            {label.vi}
          </h1>
          <p className="mt-2 max-w-2xl text-foam/85">{blurb.vi}</p>
          <p className="mt-1 text-sm text-foam/65">{label.en} · {blurb.en}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/shop?category=${encodeURIComponent(category)}`}
              className="bg-sun px-4 py-2.5 text-sm font-semibold text-white hover:bg-sun-hover"
            >
              Lọc trong cửa hàng
            </Link>
            <Link
              href="/how-to-order"
              className="border border-foam/40 px-4 py-2.5 text-sm font-semibold text-foam hover:bg-foam/10"
            >
              Cách đặt hàng
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          {products.length === 0 ? (
            <p className="rounded-none border border-line bg-card p-6 text-sm text-mist">
              Chưa có sản phẩm trong danh mục này.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
