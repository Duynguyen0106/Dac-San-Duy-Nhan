import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ProductDetail from "@/components/ProductDetail";
import { getRelatedProducts } from "@/lib/products";
import { getProductById, readProducts } from "@/lib/productStore";
import { getReviewsForProduct } from "@/lib/reviews";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildProductMetadata,
} from "@/lib/seo";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const products = await readProducts();
  return products.map((product) => ({
    id: String(product.id),
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm",
      robots: { index: false, follow: false },
    };
  }
  return buildProductMetadata(product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) {
    notFound();
  }

  const catalog = await readProducts();
  const related = getRelatedProducts(product, catalog, 4);
  const reviewSummary = await getReviewsForProduct(product.id);

  return (
    <>
      <JsonLd
        data={buildProductJsonLd(
          product,
          reviewSummary.count > 0
            ? { average: reviewSummary.average, count: reviewSummary.count }
            : null,
        )}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Trang chủ", path: "/" },
          { name: "Cửa hàng", path: "/shop" },
          { name: product.name, path: `/products/${product.id}` },
        ])}
      />
      <ProductDetail
        product={product}
        related={related}
        reviewSummary={reviewSummary}
      />
    </>
  );
}
