import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  buildUploadFilename,
  isAllowedImageType,
  saveProductImage,
} from "@/lib/imageUpload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authenticated = await requireAdmin();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing image file." },
      { status: 400 },
    );
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      {
        error: `Unsupported file type. Use ${ALLOWED_IMAGE_TYPES.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image must be under 4MB." },
      { status: 400 },
    );
  }

  const hint = String(formData.get("hint") ?? "").trim();
  const filename = buildUploadFilename(file.name, file.type, hint || undefined);
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const url = await saveProductImage(bytes, filename);
    return NextResponse.json({
      url,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { error: "Could not save image." },
      { status: 500 },
    );
  }
}
