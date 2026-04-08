import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * Public endpoint the storefront calls from the client when it detects a
 * stale ISR product page (e.g. the add-to-cart flow came back with
 * variant_not_found). It clears the RSC cache for /product/[handle] so
 * the next request re-fetches fresh data from the backend.
 *
 * No secret required — this only clears a single product's cache and
 * has zero destructive side effects, so it's safe to expose.
 */
export async function POST(request: NextRequest) {
  try {
    const { handle } = (await request.json()) as { handle?: string };
    if (!handle || typeof handle !== "string" || handle.length > 200 || /[^a-zA-Z0-9-_]/.test(handle)) {
      return NextResponse.json({ ok: false, reason: "invalid_handle" }, { status: 400 });
    }
    revalidatePath(`/product/${handle}`);
    return NextResponse.json({ ok: true, path: `/product/${handle}` });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
