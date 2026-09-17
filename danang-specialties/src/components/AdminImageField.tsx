"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import Image from "next/image";
import {
  FolderOpen,
  ImagePlus,
  Link2,
  LoaderCircle,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";

type AdminImageFieldProps = {
  value: string;
  onChange: (value: string) => void;
  isVi: boolean;
  nameHint?: string;
};

export default function AdminImageField({
  value,
  onChange,
  isVi,
  nameHint = "",
}: AdminImageFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [library, setLibrary] = useState<string[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [previewBroken, setPreviewBroken] = useState(false);

  useEffect(() => {
    setPreviewBroken(false);
  }, [value]);

  const loadLibrary = async () => {
    setLibraryLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/images", { cache: "no-store" });
      const data = (await response.json()) as {
        images?: string[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(
          data.error ||
            (isVi ? "Không tải được thư viện ảnh." : "Could not load library."),
        );
      }
      setLibrary(data.images ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Library error");
    } finally {
      setLibraryLoading(false);
    }
  };

  const openLibrary = async () => {
    const next = !showLibrary;
    setShowLibrary(next);
    if (next && library.length === 0) {
      await loadLibrary();
    }
  };

  const uploadFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      if (nameHint.trim()) body.append("hint", nameHint.trim());

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(
          data.error ||
            (isVi ? "Tải ảnh lên thất bại." : "Upload failed."),
        );
      }
      onChange(data.url);
      setShowUrl(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void uploadFile(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  const hasImage = Boolean(value.trim()) && !previewBroken;

  return (
    <div className="sm:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-sea-deep">
          {isVi ? "Ảnh sản phẩm" : "Product photo"}
        </p>
        <p className="text-xs text-mist">
          JPG / PNG / WebP · {isVi ? "tối đa 4MB" : "max 4MB"}
        </p>
      </div>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
        className={`mt-2 overflow-hidden border transition-colors ${
          dragging
            ? "border-sea bg-foam/60"
            : "border-line bg-background"
        }`}
      >
        <div className="grid gap-0 md:grid-cols-[220px_1fr]">
          <div className="relative aspect-square bg-[linear-gradient(145deg,#e8f1ef,#f7f3ea)] md:aspect-auto md:min-h-[220px]">
            {hasImage ? (
              <Image
                src={value}
                alt={isVi ? "Xem trước ảnh sản phẩm" : "Product image preview"}
                fill
                className="object-cover"
                sizes="220px"
                unoptimized
                onError={() => setPreviewBroken(true)}
              />
            ) : (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 px-4 text-center text-mist">
                <ImagePlus className="h-8 w-8 opacity-70" />
                <p className="text-sm">
                  {isVi ? "Chưa có ảnh" : "No photo yet"}
                </p>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-sea-deep/55 text-foam">
                <LoaderCircle className="h-7 w-7 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-3 p-4 sm:p-5">
            <div>
              <p className="font-display text-lg font-semibold text-sea-deep">
                {isVi ? "Tải ảnh lên" : "Upload a photo"}
              </p>
              <p className="mt-1 text-sm text-mist">
                {isVi
                  ? "Kéo thả ảnh vào đây, hoặc chọn từ máy / thư viện sẵn có."
                  : "Drag and drop a photo here, or choose from your device / library."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-sea px-3.5 py-2.5 text-sm font-semibold text-foam hover:bg-sea-deep disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                {hasImage
                  ? isVi
                    ? "Đổi ảnh"
                    : "Replace photo"
                  : isVi
                    ? "Chọn ảnh"
                    : "Choose photo"}
              </button>

              <button
                type="button"
                disabled={uploading}
                onClick={() => void openLibrary()}
                className="inline-flex items-center gap-2 border border-line bg-card px-3.5 py-2.5 text-sm font-medium text-sea-deep hover:border-sea disabled:opacity-60"
              >
                <FolderOpen className="h-4 w-4" />
                {isVi ? "Thư viện" : "Library"}
              </button>

              <button
                type="button"
                disabled={uploading}
                onClick={() => setShowUrl((open) => !open)}
                className="inline-flex items-center gap-2 border border-line bg-card px-3.5 py-2.5 text-sm font-medium text-sea-deep hover:border-sea disabled:opacity-60"
              >
                <Link2 className="h-4 w-4" />
                {isVi ? "URL" : "URL"}
              </button>

              {value.trim() && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    onChange("");
                    setError(null);
                  }}
                  className="inline-flex items-center gap-2 border border-red-200 px-3.5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {isVi ? "Xóa ảnh" : "Clear"}
                </button>
              )}
            </div>

            {value.trim() && (
              <p className="truncate font-mono text-xs text-mist" title={value}>
                {value}
              </p>
            )}

            <input
              ref={fileInputRef}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={onFileChange}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {showUrl && (
        <label className="mt-3 block text-sm font-semibold text-sea-deep">
          {isVi ? "Hoặc dán URL ảnh" : "Or paste an image URL"}
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/products/muc-rim-me-real.jpg"
            className="mt-1.5 w-full border border-line bg-background px-3 py-2.5 text-sm text-sea-deep outline-none focus:border-sea"
          />
        </label>
      )}

      {showLibrary && (
        <div className="mt-3 border border-line bg-card p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-sea-deep">
              {isVi
                ? `Ảnh có sẵn (${library.length})`
                : `Existing photos (${library.length})`}
            </p>
            <button
              type="button"
              onClick={() => void loadLibrary()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sea hover:text-sea-deep"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {isVi ? "Làm mới" : "Refresh"}
            </button>
          </div>

          {libraryLoading ? (
            <p className="py-6 text-center text-sm text-mist">
              {isVi ? "Đang tải thư viện..." : "Loading library..."}
            </p>
          ) : library.length === 0 ? (
            <p className="py-6 text-center text-sm text-mist">
              {isVi
                ? "Chưa có ảnh trong public/products."
                : "No photos in public/products yet."}
            </p>
          ) : (
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5 md:grid-cols-6">
              {library.map((url) => {
                const selected = value === url;
                return (
                  <button
                    key={url}
                    type="button"
                    onClick={() => {
                      onChange(url);
                      setShowLibrary(false);
                      setError(null);
                    }}
                    className={`relative aspect-square overflow-hidden border transition ${
                      selected
                        ? "border-sea ring-2 ring-sea/30"
                        : "border-line hover:border-sea"
                    }`}
                    title={url}
                    aria-label={url}
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
