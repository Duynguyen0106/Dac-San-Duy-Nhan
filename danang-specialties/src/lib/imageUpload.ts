import { promises as fs } from "fs";
import path from "path";

export const PRODUCT_IMAGES_DIR = path.join(
  process.cwd(),
  "public",
  "products",
);

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB

const EXT_BY_TYPE: Record<(typeof ALLOWED_IMAGE_TYPES)[number], string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function isAllowedImageType(
  value: string,
): value is (typeof ALLOWED_IMAGE_TYPES)[number] {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(value);
}

export function slugifyFilename(input: string) {
  const base = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "product";
}

export function buildUploadFilename(
  originalName: string,
  mimeType: (typeof ALLOWED_IMAGE_TYPES)[number],
  hint?: string,
) {
  const fromHint = hint ? slugifyFilename(hint) : "";
  const fromFile = slugifyFilename(
    path.parse(originalName).name || "product",
  );
  const stamp = Date.now().toString(36);
  const base = fromHint || fromFile;
  return `${base}-${stamp}${EXT_BY_TYPE[mimeType]}`;
}

export async function ensureProductImagesDir() {
  await fs.mkdir(PRODUCT_IMAGES_DIR, { recursive: true });
}

export async function listProductImageUrls(): Promise<string[]> {
  await ensureProductImagesDir();
  const entries = await fs.readdir(PRODUCT_IMAGES_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `/products/${name}`);
}

export async function saveProductImage(
  bytes: Buffer,
  filename: string,
): Promise<string> {
  await ensureProductImagesDir();
  const safeName = path.basename(filename);
  const target = path.join(PRODUCT_IMAGES_DIR, safeName);
  await fs.writeFile(target, bytes);
  return `/products/${safeName}`;
}
