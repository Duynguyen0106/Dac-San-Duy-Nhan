import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import {
  deleteProduct,
  getProductById,
  updateProduct,
  validateProductInput,
} from "@/lib/productStore";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function revalidateCatalog(id?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/products", "layout");
  revalidatePath("/admin");
  if (id) revalidatePath(`/products/${id}`);
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  const product = await getProductById(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validated = validateProductInput(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const product = await updateProduct(productId, validated.data);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    revalidateCatalog(String(productId));
    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  try {
    const deleted = await deleteProduct(productId);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    revalidateCatalog(String(productId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete product." },
      { status: 500 },
    );
  }
}
