import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { revalidatePath } from "next/cache";
import { verifyToken } from "../admin/auth/route";
import { getConfigPath, ensureConfigFile } from "@/lib/theme-config.server";

const CONFIG_PATH = getConfigPath();
const ADMIN_PASSWORD = process.env.THEME_ADMIN_PASSWORD || "admin123";

function authenticate(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const [scheme, token] = auth.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return false;
  // Accept JWT token OR legacy password
  const jwt = verifyToken(token);
  if (jwt && jwt.role === "admin") return true;
  return token === ADMIN_PASSWORD;
}

export async function GET() {
  try {
    ensureConfigFile();
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Config not found" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    ensureConfigFile();
    const updates = await request.json();
    const existing = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));

    // Deep merge (1 level deep)
    const merged = { ...existing };
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        merged[key] = { ...existing[key], ...value };
      } else {
        merged[key] = value;
      }
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2));

    // Invalidate cached pages so the storefront picks up the new config.
    try {
      revalidatePath("/", "layout");
    } catch {
      // revalidatePath is best-effort — ignore errors
    }

    return NextResponse.json({ success: true, config: merged });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update config", details: (err as Error).message },
      { status: 500 }
    );
  }
}
