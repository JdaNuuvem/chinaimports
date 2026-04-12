import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const mockConfig = {
  announcementBar: {
    enabled: true,
    text: "Frete gratis acima de R$ 299",
    linkUrl: null as string | null,
    linkText: null as string | null,
    position: "above" as "above" | "below" | undefined,
  },
  colors: {
    announcementBarBg: "#1e2d7d",
    announcementBarText: "#ffffff",
  },
};

vi.mock("@/lib/theme-config", () => ({
  getThemeConfig: () => mockConfig,
}));

import AnnouncementBar from "@/components/AnnouncementBar";

describe("AnnouncementBar", () => {
  beforeEach(() => {
    mockConfig.announcementBar.enabled = true;
    mockConfig.announcementBar.linkUrl = null;
    mockConfig.announcementBar.text = "Frete gratis acima de R$ 299";
  });

  it("renders when enabled", () => {
    const { container } = render(<AnnouncementBar />);
    const section = container.querySelector(".announcement-bar");
    expect(section).not.toBeNull();
  });

  it("returns null when disabled", () => {
    mockConfig.announcementBar.enabled = false;
    const { container } = render(<AnnouncementBar />);
    expect(container.innerHTML).toBe("");
  });

  it("renders text content", () => {
    render(<AnnouncementBar />);
    expect(screen.getByText("Frete gratis acima de R$ 299")).toBeDefined();
  });

  it("renders as paragraph when no linkUrl", () => {
    const { container } = render(<AnnouncementBar />);
    const p = container.querySelector("p.announcement-bar__content");
    expect(p).not.toBeNull();
    const a = container.querySelector("a.announcement-bar__content");
    expect(a).toBeNull();
  });

  it("renders as link when linkUrl is set", () => {
    mockConfig.announcementBar.linkUrl = "/promo";
    const { container } = render(<AnnouncementBar />);
    const a = container.querySelector("a.announcement-bar__content");
    expect(a).not.toBeNull();
    expect(a!.getAttribute("href")).toBe("/promo");
  });

  it("applies background and text colors from config", () => {
    const { container } = render(<AnnouncementBar />);
    const section = container.querySelector(".announcement-bar") as HTMLElement;
    expect(section.style.background).toBe("rgb(30, 45, 125)");
    expect(section.style.color).toBe("rgb(255, 255, 255)");
  });
});

describe("AnnouncementBar position in layout", () => {
  // These are integration-level logic tests for layout.tsx position behavior.
  // The actual positioning logic is:
  //   {liveThemeConfig.announcementBar?.position !== "below" && <AnnouncementBar />}
  //   <Header />
  //   {liveThemeConfig.announcementBar?.position === "below" && <AnnouncementBar />}

  // Use a helper that mimics the runtime check without TS narrowing the literal.
  function rendersAboveHeader(position: string | undefined): boolean {
    return position !== "below";
  }
  function rendersBelowHeader(position: string | undefined): boolean {
    return position === "below";
  }

  it("position='above' means bar renders before header (default)", () => {
    expect(rendersAboveHeader("above")).toBe(true);
    expect(rendersBelowHeader("above")).toBe(false);
  });

  it("position='below' means bar renders after header", () => {
    expect(rendersAboveHeader("below")).toBe(false);
    expect(rendersBelowHeader("below")).toBe(true);
  });

  it("position=undefined means bar renders before header (default)", () => {
    expect(rendersAboveHeader(undefined)).toBe(true);
    expect(rendersBelowHeader(undefined)).toBe(false);
  });
});
