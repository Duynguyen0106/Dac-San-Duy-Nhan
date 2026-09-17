import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { getProductById, readProducts } from "@/lib/productStore";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const products = await readProducts();
  return products.map((product) => ({
    id: String(product.id),
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
