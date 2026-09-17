"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  LogOut,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import AdminFacebookPoster from "@/components/AdminFacebookPoster";
import AdminImageField from "@/components/AdminImageField";
import Header from "@/components/Header";
import { useTranslation } from "@/hooks/useTranslation";
import {
  SHOP_CATEGORIES,
  formatPrice,
  isProductAvailable,
  type Product,
  type ShopCategory,
} from "@/lib/products";
import AdminLeadsPanel from "@/components/AdminLeadsPanel";

type FormState = {
  name: string;
  nameEn: string;
  category: ShopCategory;
  price: string;
  stock: string;
  weight: string;
  weightGrams: string;
  image: string;
  description: string;
  descriptionEn: string;
  tags: Product["tags"];
};

const emptyForm: FormState = {
  name: "",
  nameEn: "",
  category: "Dried Seafood",
  price: "",
  stock: "",
  weight: "",
  weightGrams: "",
  image: "",
  description: "",
  descriptionEn: "",
  tags: undefined,
};

function toFormState(product: Product): FormState {
  return {
    name: product.name,
    nameEn: product.nameEn,
    category: product.category as ShopCategory,
    price: String(product.price),
    stock:
      product.stock === undefined || product.stock === null
        ? ""
        : String(product.stock),
    weight: product.weight,
    weightGrams:
      product.weightGrams === undefined ? "" : String(product.weightGrams),
    image: product.image,
    description: product.description,
    descriptionEn: product.descriptionEn,
    tags: product.tags,
  };
}

function toPayload(form: FormState) {
  const payload: Record<string, unknown> = {
    name: form.name,
    nameEn: form.nameEn,
    category: form.category,
    price: Number(form.price),
    weight: form.weight,
    image: form.image,
    description: form.description,
    descriptionEn: form.descriptionEn,
  };

  if (form.weightGrams.trim() !== "") {
    payload.weightGrams = Number(form.weightGrams);
  }

  if (form.stock.trim() === "") {
    payload.stock = null;
  } else {
    payload.stock = Number(form.stock);
  }

  if (form.tags && form.tags.length > 0) {
    payload.tags = form.tags;
  }

  return payload;
}

export default function AdminPage() {
  const { t, language } = useTranslation();
  const isVi = language === "VI";

  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [facebookFocusId, setFacebookFocusId] = useState<number | null>(null);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.id - b.id),
    [products],
  );

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const data = (await response.json()) as {
        products?: Product[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to load products.");
      }
      setProducts(data.products ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const data = (await response.json()) as { authenticated?: boolean };
        setAuthenticated(Boolean(data.authenticated));
        if (data.authenticated) {
          await loadProducts();
        }
      } finally {
        setAuthChecked(true);
      }
    };
    void checkSession();
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(
        data.error ||
          (isVi ? "Đăng nhập thất bại." : "Login failed."),
      );
      return;
    }
    setAuthenticated(true);
    setPassword("");
    setMessage(isVi ? "Đăng nhập thành công." : "Logged in.");
    await loadProducts();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setIsCreating(false);
    setEditingId(null);
    setForm(emptyForm);
    setMessage(isVi ? "Đã đăng xuất." : "Logged out.");
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setMessage(null);
  };

  const startEdit = (product: Product) => {
    setIsCreating(false);
    setEditingId(product.id);
    setForm(toFormState(product));
    setError(null);
    setMessage(null);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.image.trim()) {
      setError(
        isVi
          ? "Vui lòng tải ảnh sản phẩm hoặc chọn từ thư viện."
          : "Please upload a product photo or pick one from the library.",
      );
      return;
    }

    const payload = toPayload(form);
    const isEdit = editingId !== null;
    const response = await fetch(
      isEdit ? `/api/products/${editingId}` : "/api/products",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = (await response.json()) as { error?: string; product?: Product };

    if (!response.ok) {
      setError(data.error || (isVi ? "Không lưu được." : "Could not save."));
      return;
    }

    setMessage(
      isEdit
        ? isVi
          ? "Đã cập nhật sản phẩm."
          : "Product updated."
        : isVi
          ? "Đã thêm sản phẩm mới."
          : "Product created.",
    );
    cancelForm();
    await loadProducts();
  };

  const handleDelete = async (product: Product) => {
    const label = isVi ? product.name : product.nameEn;
    const confirmed = window.confirm(
      isVi
        ? `Xóa sản phẩm "${label}"? Thao tác này không hoàn tác.`
        : `Delete "${label}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setError(null);
    setMessage(null);
    const response = await fetch(`/api/products/${product.id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || (isVi ? "Không xóa được." : "Could not delete."));
      return;
    }

    if (editingId === product.id) cancelForm();
    setMessage(isVi ? "Đã xóa sản phẩm." : "Product deleted.");
    await loadProducts();
  };

  const quickPatchProduct = async (
    product: Product,
    patch: { price?: number; stock?: number | null },
  ) => {
    setError(null);
    setMessage(null);
    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = (await response.json()) as {
      error?: string;
      product?: Product;
    };
    if (!response.ok) {
      setError(
        data.error || (isVi ? "Không cập nhật được." : "Could not update."),
      );
      return;
    }
    setMessage(
      isVi
        ? `Đã cập nhật #${product.id} (giá/tồn).`
        : `Updated #${product.id} (price/stock).`,
    );
    await loadProducts();
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center p-8 text-mist">
          {isVi ? "Đang tải..." : "Loading..."}
        </main>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-full flex-col bg-background text-foreground">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md border border-line bg-card p-8"
          >
            <h1 className="font-display text-2xl font-semibold text-sea-deep">
              {isVi ? "Quản trị sản phẩm" : "Product admin"}
            </h1>
            <p className="mt-2 text-sm text-mist">
              {isVi
                ? "Đăng nhập để thêm, sửa hoặc xóa sản phẩm Duy Nhân."
                : "Sign in to add, edit, or remove Duy Nhân products."}
            </p>
            <label className="mt-6 block text-sm font-semibold text-sea-deep">
              {isVi ? "Mật khẩu" : "Password"}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full border border-line bg-background px-3 py-2.5 text-sm outline-none focus:border-sea"
                autoComplete="current-password"
                required
              />
            </label>
            {error && (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="mt-6 w-full bg-sea py-3 text-sm font-semibold text-foam hover:bg-sea-deep"
            >
              {isVi ? "Đăng nhập" : "Sign in"}
            </button>
            {process.env.NODE_ENV === "development" && (
              <p className="mt-4 text-xs text-mist">
                {isVi
                  ? "Dev local: duynhan2026 (đổi bằng ADMIN_PASSWORD)."
                  : "Dev local: duynhan2026 (override with ADMIN_PASSWORD)."}
              </p>
            )}
          </form>
        </main>
      </div>
    );
  }

  const showForm = isCreating || editingId !== null;

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 bg-[linear-gradient(180deg,#f3f7f6_0%,#e8f1ef_50%,#efe8dc_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 text-sm text-mist hover:text-sea"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("common.shop")}
              </Link>
              <h1 className="mt-2 font-display text-3xl font-semibold text-sea-deep">
                {isVi ? "Quản lý sản phẩm" : "Manage products"}
              </h1>
              <p className="mt-1 text-sm text-mist">
                {isVi
                  ? "Thêm, sửa, xóa sản phẩm — tải ảnh, và tạo bài Facebook cho từng món."
                  : "Add, edit, delete products — upload photos, and create Facebook posts for each item."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 bg-sea px-4 py-2.5 text-sm font-semibold text-foam hover:bg-sea-deep"
              >
                <Plus className="h-4 w-4" />
                {isVi ? "Thêm sản phẩm" : "Add product"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 border border-line bg-card px-4 py-2.5 text-sm font-medium text-sea-deep hover:border-sea"
              >
                <LogOut className="h-4 w-4" />
                {isVi ? "Đăng xuất" : "Log out"}
              </button>
            </div>
          </div>

          {(message || error) && (
            <div
              className={`mt-6 border px-4 py-3 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-sea/20 bg-foam text-sea-deep"
              }`}
              role={error ? "alert" : "status"}
            >
              {error || message}
            </div>
          )}

          {showForm && (
            <form
              onSubmit={handleSave}
              className="mt-8 border border-line bg-card p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-sea-deep">
                  {isCreating
                    ? isVi
                      ? "Sản phẩm mới"
                      : "New product"
                    : isVi
                      ? `Sửa #${editingId}`
                      : `Edit #${editingId}`}
                </h2>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="p-2 text-mist hover:text-sea-deep"
                  aria-label={isVi ? "Đóng" : "Close"}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label={isVi ? "Tên (VI)" : "Name (VI)"}>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label={isVi ? "Tên (EN)" : "Name (EN)"}>
                  <input
                    required
                    value={form.nameEn}
                    onChange={(e) =>
                      setForm({ ...form, nameEn: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label={isVi ? "Danh mục" : "Category"}>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as ShopCategory,
                      })
                    }
                    className={inputClass}
                  >
                    {SHOP_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={isVi ? "Giá (VND)" : "Price (VND)"}>
                  <input
                    required
                    type="number"
                    min={0}
                    step={1000}
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field
                  label={
                    isVi
                      ? "Tồn kho (để trống = không theo dõi)"
                      : "Stock (blank = untracked)"
                  }
                >
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    placeholder={isVi ? "VD: 12" : "e.g. 12"}
                    className={inputClass}
                  />
                </Field>
                <Field label={isVi ? "Khối lượng hiển thị" : "Display weight"}>
                  <input
                    required
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    placeholder="250g / Box of 6"
                    className={inputClass}
                  />
                </Field>
                <Field
                  label={
                    isVi
                      ? "Gram ship (tuỳ chọn)"
                      : "Shipping grams (optional)"
                  }
                >
                  <input
                    type="number"
                    min={0}
                    value={form.weightGrams}
                    onChange={(e) =>
                      setForm({ ...form, weightGrams: e.target.value })
                    }
                    placeholder="300"
                    className={inputClass}
                  />
                </Field>

                <AdminImageField
                  value={form.image}
                  onChange={(image) => setForm({ ...form, image })}
                  isVi={isVi}
                  nameHint={form.name || form.nameEn}
                />
              </div>

              <div className="mt-4 grid gap-4">
                <Field label={isVi ? "Mô tả (VI)" : "Description (VI)"}>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label={isVi ? "Mô tả (EN)" : "Description (EN)"}>
                  <textarea
                    required
                    rows={3}
                    value={form.descriptionEn}
                    onChange={(e) =>
                      setForm({ ...form, descriptionEn: e.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <button
                type="submit"
                className="mt-6 inline-flex items-center gap-2 bg-sun px-5 py-3 text-sm font-semibold text-white hover:bg-sun-hover"
              >
                <Save className="h-4 w-4" />
                {isVi ? "Lưu sản phẩm" : "Save product"}
              </button>
            </form>
          )}

          <AdminLeadsPanel
            isVi={isVi}
            language={language}
            enabled={authenticated}
          />

          <div className="mt-8 border border-line bg-card">
            <div className="border-b border-line px-4 py-3 sm:px-5">
              <h2 className="font-display text-lg font-semibold text-sea-deep">
                {isVi
                  ? `Danh sách (${sortedProducts.length})`
                  : `Catalog (${sortedProducts.length})`}
              </h2>
            </div>

            {loading ? (
              <p className="p-6 text-sm text-mist">
                {isVi ? "Đang tải..." : "Loading..."}
              </p>
            ) : sortedProducts.length === 0 ? (
              <p className="p-6 text-sm text-mist">
                {isVi
                  ? "Chưa có sản phẩm. Hãy thêm món đầu tiên."
                  : "No products yet. Add your first item."}
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {sortedProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-5"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-line bg-foam sm:h-24 sm:w-24">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-semibold text-sea-deep">
                        #{product.id} · {product.name}
                      </p>
                      <p className="text-sm text-mist">
                        {product.nameEn} · {product.category} · {product.weight}
                      </p>
                      <div className="mt-2 flex flex-wrap items-end gap-3">
                        <label className="text-xs text-mist">
                          {isVi ? "Giá" : "Price"}
                          <input
                            type="number"
                            min={0}
                            step={1000}
                            defaultValue={product.price}
                            key={`price-${product.id}-${product.price}`}
                            onBlur={(event) => {
                              const next = Number(event.target.value);
                              if (
                                !Number.isFinite(next) ||
                                next === product.price
                              ) {
                                return;
                              }
                              void quickPatchProduct(product, { price: next });
                            }}
                            className="mt-1 block w-28 border border-line bg-background px-2 py-1.5 text-sm text-sea-deep"
                          />
                        </label>
                        <label className="text-xs text-mist">
                          {isVi ? "Tồn" : "Stock"}
                          <input
                            type="number"
                            min={0}
                            step={1}
                            defaultValue={
                              product.stock === undefined ||
                              product.stock === null
                                ? ""
                                : product.stock
                            }
                            key={`stock-${product.id}-${product.stock ?? "x"}`}
                            placeholder="∞"
                            onBlur={(event) => {
                              const raw = event.target.value.trim();
                              const next =
                                raw === "" ? null : Number(raw);
                              const current =
                                product.stock === undefined
                                  ? null
                                  : product.stock;
                              if (raw !== "" && !Number.isFinite(next)) return;
                              if (next === current) return;
                              void quickPatchProduct(product, {
                                stock: next as number | null,
                              });
                            }}
                            className="mt-1 block w-20 border border-line bg-background px-2 py-1.5 text-sm text-sea-deep"
                          />
                        </label>
                        <span
                          className={`mb-1.5 text-xs font-medium ${
                            isProductAvailable(product)
                              ? "text-sea"
                              : "text-red-700"
                          }`}
                        >
                          {isProductAvailable(product)
                            ? isVi
                              ? "Còn bán"
                              : "Available"
                            : isVi
                              ? "Hết hàng"
                              : "Sold out"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFacebookFocusId(product.id);
                          document
                            .getElementById("admin-facebook-tool")
                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="inline-flex items-center gap-1.5 border border-[#1877F2]/30 px-3 py-2 text-sm font-medium text-[#1877F2] hover:bg-[#1877F2]/5"
                      >
                        <FacebookGlyph className="h-3.5 w-3.5" />
                        FB
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(product)}
                        className="inline-flex items-center gap-1.5 border border-line px-3 py-2 text-sm font-medium text-sea-deep hover:border-sea"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {isVi ? "Sửa" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="inline-flex items-center gap-1.5 border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {isVi ? "Xóa" : "Delete"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div id="admin-facebook-tool">
            <AdminFacebookPoster
              products={sortedProducts}
              isVi={isVi}
              language={language}
              focusProductId={facebookFocusId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

const inputClass =
  "mt-1.5 w-full border border-line bg-background px-3 py-2.5 text-sm text-sea-deep outline-none focus:border-sea";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-sea-deep">
      {label}
      {children}
    </label>
  );
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.2l.8-3H13V9c0-.6.4-1 1-1z" />
    </svg>
  );
}
