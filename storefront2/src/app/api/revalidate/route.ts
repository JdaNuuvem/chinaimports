import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const secret = request.headers.get("x-webhook-secret");
  if (!REVALIDATION_SECRET || secret !== REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, handle } = body as { type?: string; handle?: string };

    const revalidated: string[] = [];

    if (type === "product" && handle) {
      revalidatePath(`/product/${handle}`);
      revalidated.push(`/product/${handle}`);
      // Also revalidate home (featured products may have changed)
      revalidatePath("/");
      revalidated.push("/");
    }

    if (type === "collection" && handle) {
      revalidatePath(`/collections/${handle}`);
      revalidated.push(`/collections/${handle}`);
      revalidatePath("/collections");
      revalidated.push("/collections");
      revalidatePath("/");
      revalidated.push("/");
    }

    if (type === "product" && !handle) {
      // Product created/deleted without specific handle — revalidate listings
      revalidatePath("/");
      revalidatePath("/collections");
      revalidated.push("/", "/collections");
    }

    return NextResponse.json({
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
