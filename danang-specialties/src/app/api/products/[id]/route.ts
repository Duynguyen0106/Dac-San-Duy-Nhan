import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import {
  deleteProduct,
  getProductById,
  patchProduct,
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

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      price?: unknown;
      stock?: unknown;
    };
    const patch: { price?: number; stock?: number | null } = {};

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { error: "Price must be a non-negative number." },
          { status: 400 },
        );
      }
      patch.price = price;
    }

    if (body.stock !== undefined) {
      if (body.stock === null || body.stock === "") {
        patch.stock = null;
      } else {
        const stock = Number(body.stock);
        if (!Number.isFinite(stock) || stock < 0) {
          return NextResponse.json(
            { error: "Stock must be a non-negative number." },
            { status: 400 },
          );
        }
        patch.stock = stock;
      }
    }

    if (patch.price === undefined && patch.stock === undefined) {
      return NextResponse.json(
        { error: "Provide price and/or stock to patch." },
        { status: 400 },
      );
    }

    const product = await patchProduct(productId, patch);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    revalidateCatalog(String(productId));
    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to patch product.",
      },
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
