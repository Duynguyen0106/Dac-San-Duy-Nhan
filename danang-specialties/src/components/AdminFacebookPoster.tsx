"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  CheckSquare,
  Copy,
  ExternalLink,
  LoaderCircle,
  Square,
  Send,
} from "lucide-react";
import {
  composeFacebookPost,
  type FacebookPostDraft,
  type FacebookPublishMode,
} from "@/lib/facebookPosts";
import type { Language, Product } from "@/lib/products";
import { SHOP_CONTACT } from "@/lib/shopContact";

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.2l.8-3H13V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

type FacebookStatus = {
  configured: boolean;
  pageId: string;
  pageUrl: string;
  siteUrl: string;
  canPublishPhotos: boolean;
  warning: string | null;
  setupHint: string | null;
};

type PublishResult = {
  ok: boolean;
  productId: number;
  postId?: string;
  permalink?: string;
  error?: string;
  draft: FacebookPostDraft;
};

type AdminFacebookPosterProps = {
  products: Product[];
  isVi: boolean;
  language: Language;
  focusProductId?: number | null;
};

export default function AdminFacebookPoster({
  products,
  isVi,
  language,
  focusProductId = null,
}: AdminFacebookPosterProps) {
  const [status, setStatus] = useState<FacebookStatus | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [captionLanguage, setCaptionLanguage] = useState<Language>(language);
  const [mode, setMode] = useState<FacebookPublishMode>("photo");
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PublishResult[]>([]);

  useEffect(() => {
    setCaptionLanguage(language);
  }, [language]);

  useEffect(() => {
    if (focusProductId) {
      setSelected([focusProductId]);
      setPreviewId(focusProductId);
    }
  }, [focusProductId]);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await fetch("/api/admin/facebook/status", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as FacebookStatus;
        setStatus(data);
      } catch {
        // Status is optional for draft/copy workflow.
      }
    };
    void loadStatus();
  }, []);

  const sorted = useMemo(
    () => [...products].sort((a, b) => a.id - b.id),
    [products],
  );

  const previewProduct =
    sorted.find((product) => product.id === previewId) ??
    sorted.find((product) => selected.includes(product.id)) ??
    sorted[0] ??
    null;

  const draft = previewProduct
    ? composeFacebookPost(previewProduct, captionLanguage)
    : null;

  const toggle = (id: number) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
    setPreviewId(id);
  };

  const selectAll = () => setSelected(sorted.map((product) => product.id));
  const clearAll = () => setSelected([]);

  const copyCaption = async () => {
    if (!draft?.caption) return;
    try {
      await navigator.clipboard.writeText(draft.caption);
      setMessage(isVi ? "Đã sao chép caption." : "Caption copied.");
      setError(null);
    } catch {
      setError(isVi ? "Không sao chép được." : "Could not copy caption.");
    }
  };

  const openShare = () => {
    if (!draft) return;
    window.open(draft.shareUrl, "_blank", "noopener,noreferrer");
  };

  const openPage = () => {
    window.open(
      status?.pageUrl || SHOP_CONTACT.facebookUrl,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const runPublish = async (previewOnly: boolean) => {
    if (selected.length === 0) {
      setError(
        isVi
          ? "Chọn ít nhất một sản phẩm."
          : "Select at least one product.",
      );
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    setResults([]);

    try {
      const response = await fetch("/api/admin/facebook/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: selected,
          language: captionLanguage,
          mode,
          previewOnly,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        published?: number;
        failed?: number;
        results?: PublishResult[];
      };

      if (!response.ok) {
        throw new Error(
          data.error ||
            (isVi ? "Không tạo được bài đăng." : "Could not create posts."),
        );
      }

      setResults(data.results ?? []);

      if (previewOnly) {
        setMessage(
          isVi
            ? `Đã tạo ${selected.length} caption sẵn sàng đăng.`
            : `Generated ${selected.length} ready-to-post captions.`,
        );
      } else if ((data.failed ?? 0) > 0) {
        setError(
          isVi
            ? `Đăng xong ${data.published ?? 0}, lỗi ${data.failed}.`
            : `Posted ${data.published ?? 0}, failed ${data.failed}.`,
        );
      } else {
        setMessage(
          isVi
            ? `Đã đăng ${data.published ?? selected.length} bài lên Page.`
            : `Published ${data.published ?? selected.length} posts to the Page.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Facebook error");
    } finally {
      setBusy(false);
    }
  };

  if (sorted.length === 0) return null;

  return (
    <section className="mt-8 border border-line bg-card">
      <div className="border-b border-line px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold text-sea-deep">
              <FacebookGlyph className="h-5 w-5 text-[#1877F2]" />
              {isVi ? "Tạo bài Facebook" : "Facebook post tool"}
            </h2>
            <p className="mt-1 text-sm text-mist">
              {isVi
                ? "Tự soạn caption + ảnh cho từng món, rồi đăng lên Page Đặc Sản Đà Nẵng Duy Nhân."
                : "Auto-compose caption + photo for each item, then publish to the Duy Nhan Facebook Page."}
            </p>
          </div>
          <button
            type="button"
            onClick={openPage}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sea hover:text-sea-deep"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {isVi ? "Mở Page" : "Open Page"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span
            className={`inline-flex items-center border px-2.5 py-1 ${
              status?.configured
                ? "border-sea/30 bg-foam text-sea-deep"
                : "border-line bg-background text-mist"
            }`}
          >
            {status?.configured
              ? isVi
                ? "Graph API: đã cấu hình"
                : "Graph API: configured"
              : isVi
                ? "Graph API: chưa cấu hình (vẫn copy/share được)"
                : "Graph API: not configured (copy/share still works)"}
          </span>
          {status?.warning && (
            <span className="inline-flex items-center border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-800">
              {status.warning}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-line p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="inline-flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-xs font-medium text-sea-deep hover:border-sea"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              {isVi ? "Chọn tất cả" : "Select all"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-xs font-medium text-sea-deep hover:border-sea"
            >
              <Square className="h-3.5 w-3.5" />
              {isVi ? "Bỏ chọn" : "Clear"}
            </button>
            <span className="text-xs text-mist">
              {isVi
                ? `Đã chọn ${selected.length}/${sorted.length}`
                : `${selected.length}/${sorted.length} selected`}
            </span>
          </div>

          <ul className="max-h-80 space-y-1 overflow-y-auto pr-1">
            {sorted.map((product) => {
              const checked = selected.includes(product.id);
              return (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => toggle(product.id)}
                    className={`flex w-full items-center gap-3 border px-2.5 py-2 text-left transition ${
                      checked
                        ? "border-sea bg-foam/50"
                        : "border-transparent hover:border-line hover:bg-background"
                    }`}
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden bg-foam">
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-sea-deep">
                        #{product.id} · {product.name}
                      </span>
                      <span className="block truncate text-xs text-mist">
                        {product.nameEn}
                      </span>
                    </span>
                    {checked ? (
                      <CheckSquare className="h-4 w-4 shrink-0 text-sea" />
                    ) : (
                      <Square className="h-4 w-4 shrink-0 text-mist" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            <label className="text-xs font-semibold text-sea-deep">
              {isVi ? "Ngôn ngữ caption" : "Caption language"}
              <select
                value={captionLanguage}
                onChange={(event) =>
                  setCaptionLanguage(event.target.value as Language)
                }
                className="mt-1 block border border-line bg-background px-2.5 py-2 text-sm outline-none focus:border-sea"
              >
                <option value="VI">Tiếng Việt</option>
                <option value="EN">English</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-sea-deep">
              {isVi ? "Kiểu đăng" : "Post type"}
              <select
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value as FacebookPublishMode)
                }
                className="mt-1 block border border-line bg-background px-2.5 py-2 text-sm outline-none focus:border-sea"
              >
                <option value="photo">
                  {isVi ? "Ảnh + caption" : "Photo + caption"}
                </option>
                <option value="link">
                  {isVi ? "Link sản phẩm" : "Product link"}
                </option>
              </select>
            </label>
          </div>

          {draft && previewProduct && (
            <div className="mt-4 border border-line bg-background p-3">
              <div className="flex items-start gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-foam">
                  <Image
                    src={previewProduct.image}
                    alt={previewProduct.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-sea-deep">
                    {isVi ? "Xem trước" : "Preview"} · #{previewProduct.id}
                  </p>
                  <pre className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-sea-deep/90">
                    {draft.caption}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !draft}
              onClick={() => void copyCaption()}
              className="inline-flex items-center gap-2 border border-line bg-card px-3 py-2.5 text-sm font-medium text-sea-deep hover:border-sea disabled:opacity-60"
            >
              <Copy className="h-4 w-4" />
              {isVi ? "Copy caption" : "Copy caption"}
            </button>
            <button
              type="button"
              disabled={busy || !draft}
              onClick={openShare}
              className="inline-flex items-center gap-2 border border-line bg-card px-3 py-2.5 text-sm font-medium text-sea-deep hover:border-sea disabled:opacity-60"
            >
              <ExternalLink className="h-4 w-4" />
              {isVi ? "Mở share Facebook" : "Open Facebook share"}
            </button>
            <button
              type="button"
              disabled={busy || selected.length === 0}
              onClick={() => void runPublish(true)}
              className="inline-flex items-center gap-2 border border-line bg-card px-3 py-2.5 text-sm font-medium text-sea-deep hover:border-sea disabled:opacity-60"
            >
              {busy ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <FacebookGlyph className="h-4 w-4" />
              )}
              {isVi ? "Tạo caption hàng loạt" : "Generate batch captions"}
            </button>
            <button
              type="button"
              disabled={busy || selected.length === 0 || !status?.configured}
              onClick={() => void runPublish(false)}
              className="inline-flex items-center gap-2 bg-[#1877F2] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#166fe5] disabled:opacity-60"
              title={
                status?.configured
                  ? undefined
                  : isVi
                    ? "Cần FACEBOOK_PAGE_ACCESS_TOKEN"
                    : "Requires FACEBOOK_PAGE_ACCESS_TOKEN"
              }
            >
              {busy ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isVi
                ? `Đăng lên Page (${selected.length})`
                : `Post to Page (${selected.length})`}
            </button>
          </div>

          {!status?.configured && (
            <p className="mt-3 text-xs text-mist">
              {status?.setupHint ||
                (isVi
                  ? "Thêm FACEBOOK_PAGE_ACCESS_TOKEN vào môi trường để đăng trực tiếp lên Page. Không có token vẫn copy caption / mở share được."
                  : "Add FACEBOOK_PAGE_ACCESS_TOKEN to enable direct Page publishing. Without it you can still copy captions or open the share dialog.")}
            </p>
          )}

          {(message || error) && (
            <p
              className={`mt-3 text-sm ${
                error ? "text-red-700" : "text-sea-deep"
              }`}
              role={error ? "alert" : "status"}
            >
              {error || message}
            </p>
          )}

          {results.length > 0 && (
            <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto text-xs">
              {results.map((result) => (
                <li
                  key={`${result.productId}-${result.postId || result.error || "draft"}`}
                  className="border border-line bg-background px-2.5 py-2"
                >
                  <span className="font-semibold text-sea-deep">
                    #{result.productId}
                  </span>{" "}
                  {result.ok && result.postId ? (
                    <a
                      href={result.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1877F2] hover:underline"
                    >
                      {isVi ? "Đã đăng" : "Posted"} · {result.postId}
                    </a>
                  ) : result.ok ? (
                    <span className="text-mist">
                      {isVi ? "Caption sẵn sàng" : "Caption ready"}
                    </span>
                  ) : (
                    <span className="text-red-700">{result.error}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
