"use client";

import { Star } from "lucide-react";
import type { Language } from "@/lib/products";
import type { ReviewSummary } from "@/lib/reviews";

type ProductReviewsProps = {
  summary: ReviewSummary;
  language: Language;
};

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index + 1 <= Math.round(value);
        return (
          <Star
            key={index}
            className={`h-3.5 w-3.5 ${
              filled ? "text-sun" : "text-line"
            }`}
            fill={filled ? "currentColor" : "none"}
            strokeWidth={1.75}
          />
        );
      })}
    </span>
  );
}

export default function ProductReviews({
  summary,
  language,
}: ProductReviewsProps) {
  const isVi = language === "VI";
  if (summary.count === 0) return null;

  return (
    <section className="mt-10 border-t border-line pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-sea-deep">
            {isVi ? "Đánh giá khách hàng" : "Customer reviews"}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-mist">
            <Stars value={summary.average} />
            <span>
              {summary.average.toFixed(1)} · {summary.count}{" "}
              {isVi ? "đánh giá" : "reviews"}
            </span>
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-4">
        {summary.reviews.map((review) => (
          <li key={review.id} className="border border-line bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-sea-deep">
                {review.author}
              </p>
              <Stars value={review.rating} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              {isVi ? review.textVi : review.textEn}
            </p>
            <p className="mt-2 text-xs text-mist">{review.date}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
