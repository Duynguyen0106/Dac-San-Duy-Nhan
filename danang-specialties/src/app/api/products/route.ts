import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import {
  createProduct,
  readProducts,
  validateProductInput,
} from "@/lib/productStore";

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/products", "layout");
  revalidatePath("/admin");
}

export async function GET() {
  try {
    const products = await readProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load products." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validated = validateProductInput(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const product = await createProduct(validated.data);
    revalidateCatalog();
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 },
    );
  }
}
