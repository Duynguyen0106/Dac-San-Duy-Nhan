import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import {
  composeFacebookPost,
  publishFacebookDraft,
  type FacebookPublishMode,
  type FacebookPublishResult,
} from "@/lib/facebookPosts";
import type { Language } from "@/lib/products";
import { getProductById, readProducts } from "@/lib/productStore";

type PostBody = {
  productIds?: number[];
  language?: Language;
  mode?: FacebookPublishMode;
  /** If true, only compose drafts (no Graph API call). */
  previewOnly?: boolean;
  /** Delay between batch posts in ms (default 1200). */
  delayMs?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const authenticated = await requireAdmin();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const language: Language = body.language === "EN" ? "EN" : "VI";
  const mode: FacebookPublishMode = body.mode === "link" ? "link" : "photo";
  const previewOnly = Boolean(body.previewOnly);
  const delayMs = Math.min(
    Math.max(Number(body.delayMs ?? 1200) || 1200, 0),
    10_000,
  );

  const requestedIds = Array.isArray(body.productIds)
    ? body.productIds.map(Number).filter((id) => Number.isFinite(id) && id > 0)
    : [];

  if (requestedIds.length === 0) {
    return NextResponse.json(
      { error: "Select at least one product." },
      { status: 400 },
    );
  }

  if (requestedIds.length > 40) {
    return NextResponse.json(
      { error: "Batch limit is 40 products per request." },
      { status: 400 },
    );
  }

  const catalog = await readProducts();
  const byId = new Map(catalog.map((product) => [product.id, product]));

  const results: FacebookPublishResult[] = [];

  for (let index = 0; index < requestedIds.length; index += 1) {
    const productId = requestedIds[index];
    const product =
      byId.get(productId) ?? (await getProductById(productId));

    if (!product) {
      results.push({
        ok: false,
        productId,
        error: "Product not found.",
        draft: {
          productId,
          language,
          caption: "",
          productUrl: "",
          imageUrl: "",
          pageUrl: "",
          shareUrl: "",
        },
      });
      continue;
    }

    const draft = composeFacebookPost(product, language);

    if (previewOnly) {
      results.push({
        ok: true,
        productId,
        draft,
      });
    } else {
      const published = await publishFacebookDraft(draft, mode);
      results.push(published);
      if (index < requestedIds.length - 1 && delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }

  const published = results.filter((item) => item.ok && item.postId).length;
  const failed = results.filter((item) => !item.ok).length;

  return NextResponse.json({
    ok: failed === 0,
    previewOnly,
    mode,
    language,
    count: results.length,
    published,
    failed,
    results,
  });
}
