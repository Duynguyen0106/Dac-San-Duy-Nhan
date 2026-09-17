import { promises as fs } from "fs";
import path from "path";

export type ProductReview = {
  id: string;
  productId: number;
  author: string;
  rating: number;
  textVi: string;
  textEn: string;
  date: string;
};

export type ReviewSummary = {
  count: number;
  average: number;
  reviews: ProductReview[];
};

const DATA_PATH = path.join(process.cwd(), "data", "reviews.json");

export async function readReviews(): Promise<ProductReview[]> {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const parsed = JSON.parse(raw) as ProductReview[];
  return Array.isArray(parsed) ? parsed : [];
}

export async function getReviewsForProduct(
  productId: number,
): Promise<ReviewSummary> {
  const all = await readReviews();
  const reviews = all
    .filter((review) => review.productId === productId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const count = reviews.length;
  const average =
    count === 0
      ? 0
      : Math.round(
          (reviews.reduce((sum, review) => sum + review.rating, 0) / count) * 10,
        ) / 10;
  return { count, average, reviews };
}
