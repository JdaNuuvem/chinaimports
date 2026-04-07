import { describe, it, expect } from "vitest";
import { getThemeConfig, setRuntimeConfig } from "@/lib/theme-config";
import type { ThemeConfig } from "@/lib/theme-config";

describe("theme-config", () => {
  it("should return default config from JSON", () => {
    const config = getThemeConfig();
    expect(config).toBeDefined();
    expect(config.identity.storeName).toBe("Imports China Brasil");
  });

  it("should have all required color properties", () => {
    const config = getThemeConfig();
    expect(config.colors.headingColor).toBeDefined();
    expect(config.colors.accentColor).toBeDefined();
    expect(config.colors.headerBg).toBeDefined();
    expect(config.colors.footerBg).toBeDefined();
    expect(config.colors.onSaleAccent).toBeDefined();
  });

  it("should have valid typography settings", () => {
    const config = getThemeConfig();
    expect(config.typography.baseFontSize).toBeGreaterThanOrEqual(12);
    expect(config.typography.baseFontSize).toBeLessThanOrEqual(20);
    expect(config.typography.headingFontWeight).toBeGreaterThanOrEqual(100);
  });

  it("should have home sections configured", () => {
    const config = getThemeConfig();
    expect(config.homeSections.length).toBeGreaterThan(0);
    expect(config.homeSections[0].type).toBeDefined();
    expect(config.homeSections[0].enabled).toBeDefined();
  });

  it("should have header nav links", () => {
    const config = getThemeConfig();
    expect(config.header.navLinks.length).toBeGreaterThan(0);
    expect(config.header.navLinks[0].title).toBeDefined();
    expect(config.header.navLinks[0].href).toBeDefined();
  });

  it("should have footer blocks", () => {
    const config = getThemeConfig();
    expect(config.footer.blocks.length).toBeGreaterThan(0);
  });

  it("should allow runtime config override", () => {
    const custom = {
      ...getThemeConfig(),
      identity: { storeName: "Custom Store", logoUrl: null, logoText: "CUSTOM", faviconUrl: null },
    } as ThemeConfig;
    setRuntimeConfig(custom);
    expect(getThemeConfig().identity.storeName).toBe("Custom Store");

    // Reset
    setRuntimeConfig(null as unknown as ThemeConfig);
  });

  it("should have valid product settings", () => {
    const config = getThemeConfig();
    expect(typeof config.product.showVendor).toBe("boolean");
    expect(["percentage", "saving"]).toContain(config.product.discountMode);
    expect(["natural", "short", "square", "tall"]).toContain(config.product.imageSize);
  });

  it("should have valid cart settings", () => {
    const config = getThemeConfig();
    expect(["drawer", "message", "page"]).toContain(config.cart.type);
    expect(config.cart.freeShippingThreshold).toBeGreaterThanOrEqual(0);
  });
});
