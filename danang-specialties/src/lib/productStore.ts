import { promises as fs } from "fs";
import path from "path";
import type { Product, ProductTag, ShopCategory } from "@/lib/products";
import { SHOP_CATEGORIES } from "@/lib/products";

const DATA_PATH = path.join(process.cwd(), "data", "products.json");

const ALLOWED_TAGS: readonly ProductTag[] = [
  "gift",
  "tourist",
  "shelf-stable",
];

function normalizeTags(value: unknown): ProductTag[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) return undefined;
  const tags = value
    .map((tag) => String(tag))
    .filter((tag): tag is ProductTag =>
      (ALLOWED_TAGS as readonly string[]).includes(tag),
    );
  return tags.length > 0 ? [...new Set(tags)] : undefined;
}

export type ProductInput = {
  name: string;
  nameEn: string;
  category: string;
  price: number;
  weight: string;
  weightGrams?: number;
  image: string;
  description: string;
  descriptionEn: string;
  tags?: Product["tags"];
  /** Omit to leave unset; null clears tracking; number sets quantity. */
  stock?: number | null;
};

function isShopCategory(value: string): value is ShopCategory {
  return (SHOP_CATEGORIES as readonly string[]).includes(value);
}

export function validateProductInput(input: Partial<ProductInput>): {
  ok: true;
  data: ProductInput;
} | {
  ok: false;
  error: string;
} {
  const name = input.name?.trim() ?? "";
  const nameEn = input.nameEn?.trim() ?? "";
  const category = input.category?.trim() ?? "";
  const weight = input.weight?.trim() ?? "";
  const image = input.image?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const descriptionEn = input.descriptionEn?.trim() ?? "";
  const price = Number(input.price);
  const weightGrams =
    input.weightGrams === undefined || input.weightGrams === null
      ? undefined
      : Number(input.weightGrams);

  if (!name || !nameEn) {
    return { ok: false, error: "Name and English name are required." };
  }
  if (!isShopCategory(category)) {
    return {
      ok: false,
      error: `Category must be one of: ${SHOP_CATEGORIES.join(", ")}`,
    };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: "Price must be a non-negative number." };
  }
  if (!weight) {
    return { ok: false, error: "Weight is required." };
  }
  if (
    weightGrams !== undefined &&
    (!Number.isFinite(weightGrams) || weightGrams < 0)
  ) {
    return { ok: false, error: "weightGrams must be a non-negative number." };
  }
  if (!image) {
    return { ok: false, error: "Product image is required." };
  }
  if (!description || !descriptionEn) {
    return {
      ok: false,
      error: "Vietnamese and English descriptions are required.",
    };
  }

  const data: ProductInput = {
    name,
    nameEn,
    category,
    price: Math.round(price),
    weight,
    image,
    description,
    descriptionEn,
  };

  if (weightGrams !== undefined) {
    data.weightGrams = Math.round(weightGrams);
  }

  const tags = normalizeTags(input.tags);
  if (tags) {
    data.tags = tags;
  }

  if (input.stock !== undefined) {
    if (input.stock === null) {
      data.stock = null;
    } else {
      const stock = Number(input.stock);
      if (!Number.isFinite(stock) || stock < 0) {
        return { ok: false, error: "Stock must be a non-negative number or empty." };
      }
      data.stock = Math.round(stock);
    }
  }

  return { ok: true, data };
}

export async function readProducts(): Promise<Product[]> {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const parsed = JSON.parse(raw) as Product[];
  if (!Array.isArray(parsed)) {
    throw new Error("Invalid products data file.");
  }
  return parsed;
}

export async function getProductById(id: number): Promise<Product | null> {
  const products = await readProducts();
  return products.find((product) => product.id === id) ?? null;
}

async function writeProducts(products: Product[]): Promise<void> {
  const payload = `${JSON.stringify(products, null, 2)}\n`;
  await fs.writeFile(DATA_PATH, payload, "utf8");
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const products = await readProducts();
  const nextId =
    products.reduce((max, product) => Math.max(max, product.id), 0) + 1;
  const product: Product = { id: nextId, ...input };
  products.push(product);
  await writeProducts(products);
  return product;
}

export async function updateProduct(
  id: number,
  input: ProductInput,
): Promise<Product | null> {
  const products = await readProducts();
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) return null;

  const updated: Product = { id, ...input };
  if (input.weightGrams === undefined) {
    delete updated.weightGrams;
  }
  if (input.tags === undefined) {
    delete updated.tags;
  }
  if (input.stock === undefined || input.stock === null) {
    delete updated.stock;
  }

  products[index] = updated;
  await writeProducts(products);
  return updated;
}

export async function patchProduct(
  id: number,
  patch: { price?: number; stock?: number | null },
): Promise<Product | null> {
  const products = await readProducts();
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) return null;

  const current = products[index];
  const next: Product = { ...current };

  if (patch.price !== undefined) {
    if (!Number.isFinite(patch.price) || patch.price < 0) {
      throw new Error("Price must be a non-negative number.");
    }
    next.price = Math.round(patch.price);
  }

  if (patch.stock !== undefined) {
    if (patch.stock === null) {
      delete next.stock;
    } else {
      if (!Number.isFinite(patch.stock) || patch.stock < 0) {
        throw new Error("Stock must be a non-negative number.");
      }
      next.stock = Math.round(patch.stock);
    }
  }

  products[index] = next;
  await writeProducts(products);
  return next;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const products = await readProducts();
  const next = products.filter((product) => product.id !== id);
  if (next.length === products.length) return false;
  await writeProducts(next);
  return true;
}
