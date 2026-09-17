import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { PRODUCT_IMAGES_DIR } from "@/lib/imageUpload";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;
  const safeName = path.basename(filename);

  if (
    safeName !== filename ||
    safeName.includes("..") ||
    !/\.(jpe?g|png|webp)$/i.test(safeName)
  ) {
    return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
  }

  const filePath = path.join(PRODUCT_IMAGES_DIR, safeName);

  try {
    const bytes = await fs.readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }
}
