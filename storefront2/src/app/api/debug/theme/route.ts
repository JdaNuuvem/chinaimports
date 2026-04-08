import { NextResponse } from "next/server";
import fs from "fs";
import { getConfigPath, getThemeConfig } from "@/lib/theme-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const configPath = getConfigPath();
  const exists = fs.existsSync(configPath);
  let diskLogo: string | null = null;
  let diskRaw: string | null = null;
  if (exists) {
    try {
      diskRaw = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(diskRaw);
      diskLogo = parsed?.identity?.logoUrl ?? null;
    } catch (e) {
      diskRaw = `read error: ${(e as Error).message}`;
    }
  }
  const fromHelper = getThemeConfig();
  return NextResponse.json({
    configPath,
    exists,
    diskLogo,
    helperLogo: fromHelper?.identity?.logoUrl ?? null,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      UPLOADS_DIR: process.env.UPLOADS_DIR,
      THEME_CONFIG_PATH: process.env.THEME_CONFIG_PATH,
    },
    cwd: process.cwd(),
    diskRawPreview: diskRaw?.slice(0, 200) ?? null,
  });
}
