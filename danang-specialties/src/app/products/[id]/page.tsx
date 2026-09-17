import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ProductDetail from "@/components/ProductDetail";
import { getProductById, readProducts } from "@/lib/productStore";
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

  return (
    <>
      <JsonLd data={buildProductJsonLd(product)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Trang chủ", path: "/" },
          { name: "Cửa hàng", path: "/shop" },
          { name: product.name, path: `/products/${product.id}` },
        ])}
      />
      <ProductDetail product={product} />
    </>
  );
}
