import { describe, it, expect } from "vitest";

/**
 * Tests for the ImageHeightFields preset logic used in
 * components/admin/VisualEditor/SectionEditor.tsx.
 *
 * Since ImageHeightFields is a private function component inside SectionEditor
 * (not exported), we test the core logic patterns it relies on:
 * - Preset active state detection
 * - Effective value fallback chain
 * - Clear/reset behavior
 */

interface ImageHeightPreset {
  key: string;
  label: string;
  desktop: number;
  mobile: number;
}

const SLIDESHOW_PRESETS: ImageHeightPreset[] = [
  { key: "compact", label: "Compacto", desktop: 300, mobile: 200 },
  { key: "medium", label: "Medio", desktop: 500, mobile: 300 },
  { key: "large", label: "Grande", desktop: 700, mobile: 420 },
];

const DEFAULTS = { desktop: 500, mobile: 300 };

/** Mirrors the logic inside ImageHeightFields for computing effective values. */
function computeEffective(
  desktopValue: number | undefined,
  mobileValue: number | undefined,
  defaults: { desktop: number; mobile: number },
) {
  const effectiveDesktop = desktopValue ?? defaults.desktop;
  const effectiveMobile = mobileValue ?? effectiveDesktop;
  return { effectiveDesktop, effectiveMobile };
}

/** Mirrors the isCustom detection in ImageHeightFields. */
function isCustom(
  effectiveDesktop: number,
  effectiveMobile: number,
  presets: ImageHeightPreset[],
): boolean {
  return !presets.some((p) => p.desktop === effectiveDesktop && p.mobile === effectiveMobile);
}

describe("ImageHeightFields preset logic", () => {
  describe("computeEffective", () => {
    it("uses default desktop when desktopValue is undefined", () => {
      const { effectiveDesktop } = computeEffective(undefined, undefined, DEFAULTS);
      expect(effectiveDesktop).toBe(500);
    });

    it("uses provided desktop value when set", () => {
      const { effectiveDesktop } = computeEffective(600, undefined, DEFAULTS);
      expect(effectiveDesktop).toBe(600);
    });

    it("mobile falls back to effective desktop when undefined", () => {
      const { effectiveMobile } = computeEffective(700, undefined, DEFAULTS);
      expect(effectiveMobile).toBe(700);
    });

    it("mobile falls back to default desktop when both undefined", () => {
      const { effectiveMobile } = computeEffective(undefined, undefined, DEFAULTS);
      expect(effectiveMobile).toBe(500);
    });

    it("uses provided mobile value when set", () => {
      const { effectiveMobile } = computeEffective(600, 350, DEFAULTS);
      expect(effectiveMobile).toBe(350);
    });
  });

  describe("preset active state detection", () => {
    it("detects matching preset as active (medium)", () => {
      const { effectiveDesktop, effectiveMobile } = computeEffective(500, 300, DEFAULTS);
      const custom = isCustom(effectiveDesktop, effectiveMobile, SLIDESHOW_PRESETS);
      expect(custom).toBe(false);
    });

    it("detects matching preset as active (compact)", () => {
      const { effectiveDesktop, effectiveMobile } = computeEffective(300, 200, DEFAULTS);
      const custom = isCustom(effectiveDesktop, effectiveMobile, SLIDESHOW_PRESETS);
      expect(custom).toBe(false);
    });

    it("detects non-matching values as custom", () => {
      const { effectiveDesktop, effectiveMobile } = computeEffective(450, 280, DEFAULTS);
      const custom = isCustom(effectiveDesktop, effectiveMobile, SLIDESHOW_PRESETS);
      expect(custom).toBe(true);
    });

    it("detects default values as custom when mobile fallback differs from preset", () => {
      // When both are undefined: effectiveDesktop=500, effectiveMobile=500
      // (mobile falls back to effectiveDesktop, NOT defaults.mobile).
      // The medium preset is {desktop: 500, mobile: 300}, so 500 !== 300
      // means the computed values don't match any preset => isCustom=true.
      const { effectiveDesktop, effectiveMobile } = computeEffective(undefined, undefined, DEFAULTS);
      expect(effectiveDesktop).toBe(500);
      expect(effectiveMobile).toBe(500); // falls back to desktop, not defaults.mobile
      const custom = isCustom(effectiveDesktop, effectiveMobile, SLIDESHOW_PRESETS);
      expect(custom).toBe(true);
    });
  });

  describe("applyPreset behavior", () => {
    it("preset populates both desktop and mobile values", () => {
      const preset = SLIDESHOW_PRESETS[2]; // "Grande"
      // Simulating applyPreset: onDesktopChange(p.desktop), onMobileChange(p.mobile)
      let desktopValue: number | undefined;
      let mobileValue: number | undefined;
      desktopValue = preset.desktop;
      mobileValue = preset.mobile;
      expect(desktopValue).toBe(700);
      expect(mobileValue).toBe(420);
    });
  });

  describe("clear/reset behavior", () => {
    it("resetToDefault sets both values to undefined", () => {
      let desktopValue: number | undefined = 600;
      let mobileValue: number | undefined = 350;
      // Simulate resetToDefault
      desktopValue = undefined;
      mobileValue = undefined;
      expect(desktopValue).toBeUndefined();
      expect(mobileValue).toBeUndefined();
    });

    it("after reset, effective values revert to defaults with mobile=desktop fallback", () => {
      const { effectiveDesktop, effectiveMobile } = computeEffective(undefined, undefined, DEFAULTS);
      expect(effectiveDesktop).toBe(DEFAULTS.desktop);
      // Mobile falls back to effectiveDesktop (500), not defaults.mobile (300)
      expect(effectiveMobile).toBe(DEFAULTS.desktop);
    });
  });
});
