import tipsData from "../../data/tips.json";

export type TipPost = {
  slug: string;
  titleVi: string;
  titleEn: string;
  excerptVi: string;
  excerptEn: string;
  date: string;
  coverImage: string;
  category?: string;
  bodyVi: string[];
  bodyEn: string[];
};

export const TIP_POSTS: TipPost[] = tipsData as TipPost[];

export function listTips(): TipPost[] {
  return [...TIP_POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

export function getTipBySlug(slug: string): TipPost | null {
  return TIP_POSTS.find((post) => post.slug === slug) ?? null;
}

export function listTipCategories(): string[] {
  const set = new Set<string>();
  for (const post of TIP_POSTS) {
    if (post.category) set.add(post.category);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
