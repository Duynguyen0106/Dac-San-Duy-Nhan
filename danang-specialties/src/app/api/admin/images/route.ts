import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { listProductImageUrls } from "@/lib/imageUpload";

export const runtime = "nodejs";

export async function GET() {
  const authenticated = await requireAdmin();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const images = await listProductImageUrls();
    return NextResponse.json({ images });
  } catch (error) {
    console.error("List images failed:", error);
    return NextResponse.json(
      { error: "Could not list product images." },
      { status: 500 },
    );
  }
}
