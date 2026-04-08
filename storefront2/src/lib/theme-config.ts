// ──────────────────────────────────────────────
// Theme Configuration Type System
// ──────────────────────────────────────────────

export interface ThemeConfig {
  identity: {
    storeName: string;
    logoUrl: string | null;
    logoText: string;
    faviconUrl: string | null;
  };

  colors: {
    headingColor: string;
    textColor: string;
    textStrongColor: string;
    accentColor: string;
    linkColor: string;
    borderColor: string;
    backgroundColor: string;
    secondaryBackground: string;
    errorColor: string;
    successColor: string;
    primaryButtonBg: string;
    primaryButtonText: string;
    secondaryButtonBg: string;
    secondaryButtonText: string;
    headerBg: string;
    headerText: string;
    headerLightText: string;
    headerAccent: string;
    footerBg: string;
    footerHeadingText: string;
    footerBodyText: string;
    footerAccent: string;
    onSaleAccent: string;
    inStockColor: string;
    lowStockColor: string;
    soldOutColor: string;
    customLabel1Bg: string;
    customLabel2Bg: string;
    starColor: string;
    menuBarBg: string;
    menuBarText: string;
    announcementBarBg: string;
    announcementBarText: string;
  };

  typography: {
    headingFontFamily: string;
    headingFontWeight: number;
    bodyFontFamily: string;
    bodyFontWeight: number;
    baseFontSize: number;
    underlineLinks: boolean;
  };

  animation: {
    imageZoomOnHover: boolean;
  };

  search: {
    mode: "product" | "product,page" | "product,article" | "product,article,page";
  };

  announcementBar: {
    enabled: boolean;
    text: string;
    linkUrl: string | null;
    linkText: string | null;
  };

  header: {
    navLinks: NavLink[];
  };

  footer: {
    blocks: FooterBlock[];
    socialLinks: SocialLinks;
    copyrightText: string;
    showNewsletter: boolean;
  };

  homeSections: HomeSection[];

  product: {
    showVendor: boolean;
    showSecondaryImage: boolean;
    showDiscount: boolean;
    discountMode: "percentage" | "saving";
    pricePosition: "before_title" | "after_title";
    imageSize: "natural" | "short" | "square" | "tall";
    showColorSwatch: boolean;
    showInventoryQuantity: boolean;
    lowInventoryThreshold: number;
    showReviewsBadge: boolean;
  };

  cart: {
    type: "drawer" | "message" | "page";
    emptyButtonLink: string;
    showCheckoutButton: boolean;
    showFreeShippingThreshold: boolean;
    freeShippingThreshold: number;
  };

  newsletter: {
    enabled: boolean;
    title: string;
    subtitle: string;
    backgroundColor: string;
    textColor: string;
  };

  seo: {
    titleTemplate: string;
    defaultDescription: string;
  };

  installments: {
    percentage: number;
  };
}

export interface NavLink {
  title: string;
  href: string;
  children?: NavLink[];
}

export interface FooterBlock {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  pinterest?: string;
  linkedin?: string;
  snapchat?: string;
  vimeo?: string;
  tumblr?: string;
}

export interface HomeSection {
  id: string;
  type: HomeSectionType;
  enabled: boolean;
  settings: Record<string, unknown>;
}

export type HomeSectionType =
  | "slideshow"
  | "text-with-icons"
  | "mosaic"
  | "featured-collection"
  | "offers"
  | "image-with-text"
  | "collection-list"
  | "info-bar"
  | "logo-list"
  | "video"
  | "rich-text"
  | "brand-showcase";

// ──────────────────────────────────────────────
// Load theme config (static import for build-time)
// ──────────────────────────────────────────────

import defaultConfig from "@/data/theme-config.json";
import fs from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";

// In production (standalone) we write the theme-config to a persistent file
// outside of the bundled src/. Default to /app/data/theme-config.json so it
// survives rebuilds when mounted as a persistent volume.
const CONFIG_FILE =
  process.env.THEME_CONFIG_PATH ||
  (process.env.NODE_ENV === "production"
    ? "/app/data/uploads/.theme-config.json"
    : path.join(process.cwd(), "src/data/theme-config.json"));

let runtimeConfig: ThemeConfig | null = null;

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function getThemeConfig(): ThemeConfig {
  // Opt out of Next.js data cache so every render reads fresh from disk.
  try {
    noStore();
  } catch {
    // noStore may throw if called outside a request context (e.g. at build
    // time or in a script) — safe to ignore.
  }
  if (runtimeConfig) return runtimeConfig;
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(raw) as ThemeConfig;
    }
  } catch {
    // Fall through to bundled default.
  }
  return defaultConfig as unknown as ThemeConfig;
}

export function setRuntimeConfig(config: ThemeConfig): void {
  runtimeConfig = config;
}
