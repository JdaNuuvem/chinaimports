import fs from "fs";
import path from "path";
import defaultConfig from "@/data/theme-config.json";
import type { ThemeConfig } from "@/lib/theme-config";

// In production (standalone) the theme-config lives on a persistent volume
// next to the uploaded files. In dev we fall back to the committed JSON in
// src/data so local edits keep working.
const CONFIG_FILE =
  process.env.THEME_CONFIG_PATH ||
  (process.env.NODE_ENV === "production"
    ? "/app/data/uploads/.theme-config.json"
    : path.join(process.cwd(), "src/data/theme-config.json"));

export function getConfigPath(): string {
  return CONFIG_FILE;
}

/**
 * Read the active theme config from disk. Falls back to the bundled default
 * if the file is missing or unreadable. Safe to call many times — it does
 * a plain fs read each call so admin edits are picked up immediately.
 */
export function readThemeConfigFromDisk(): ThemeConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(raw) as ThemeConfig;
    }
  } catch {
    // fall through
  }
  return defaultConfig as unknown as ThemeConfig;
}

/**
 * Seed the persistent config file with the bundled default if it does
 * not exist yet. Useful on first boot of a fresh container.
 */
export function ensureConfigFile(): void {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    }
  } catch {
    // Ignored — callers will surface their own errors.
  }
}
