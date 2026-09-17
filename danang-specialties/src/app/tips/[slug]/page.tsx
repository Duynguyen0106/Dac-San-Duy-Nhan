import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TipArticle from "@/components/TipArticle";
import { buildSimplePageMetadata } from "@/lib/seo";
import { getTipBySlug, listTips } from "@/lib/tips";

type TipPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listTips().map((tip) => ({ slug: tip.slug }));
}

export async function generateMetadata({
  params,
}: TipPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tip = getTipBySlug(slug);
  if (!tip) {
    return { title: "Không tìm thấy", robots: { index: false } };
  }
  return buildSimplePageMetadata({
    title: tip.titleVi,
    description: tip.excerptVi,
    path: `/tips/${tip.slug}`,
    image: tip.coverImage,
  });
}

export default async function TipPage({ params }: TipPageProps) {
  const { slug } = await params;
  const tip = getTipBySlug(slug);
  if (!tip) notFound();
  return <TipArticle tip={tip} />;
}
