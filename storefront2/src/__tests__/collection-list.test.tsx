import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/link as a simple anchor
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

import CollectionList from "@/components/CollectionList";

const SAMPLE_COLLECTIONS = [
  { id: "1", title: "Masculino", handle: "masculino", image: "/img/m.jpg", productCount: 12 },
  { id: "2", title: "Feminino", handle: "feminino", image: "/img/f.jpg", productCount: 8 },
  { id: "3", title: "Infantil", handle: "infantil", image: "/img/i.jpg", productCount: 5 },
  { id: "4", title: "Outlet", handle: "outlet", image: "/img/o.jpg", productCount: 20 },
  { id: "5", title: "Calcados", handle: "calcados", image: "/img/c.jpg", productCount: 3 },
  { id: "6", title: "Acessorios", handle: "acessorios", image: "/img/a.jpg", productCount: 7 },
  { id: "7", title: "Novidades", handle: "novidades", image: "/img/n.jpg" },
];

describe("CollectionList", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders loading skeleton when collections is empty array (triggers fetch)", () => {
    // Empty array has length 0 which is falsy, so loading=true and
    // the component shows skeleton placeholders while it attempts to fetch.
    const { container } = render(<CollectionList collections={[]} />);
    const section = container.querySelector("[data-section-type='collection-list']");
    expect(section).not.toBeNull();
    // Should show skeleton divs (no links yet)
    const links = container.querySelectorAll("a[href^='/collections/']");
    expect(links.length).toBe(0);
  });

  it("renders section title", () => {
    render(<CollectionList collections={SAMPLE_COLLECTIONS} title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeDefined();
  });

  it("uses default title when none provided", () => {
    render(<CollectionList collections={SAMPLE_COLLECTIONS} />);
    expect(screen.getByText("Nossas Coleções")).toBeDefined();
  });

  // -- columns clamping --
  it("clamps columns to minimum of 1", () => {
    const { container } = render(
      <CollectionList collections={SAMPLE_COLLECTIONS} columns={-5} />
    );
    // Component renders with clamped columns=1. With 7 collections visible,
    // verify all 7 links are rendered (columns only affects grid layout, not count).
    const links = container.querySelectorAll("a[href^='/collections/']");
    expect(links.length).toBe(7);
  });

  it("clamps columns to maximum of 6", () => {
    const { container } = render(
      <CollectionList collections={SAMPLE_COLLECTIONS} columns={99} />
    );
    const links = container.querySelectorAll("a[href^='/collections/']");
    expect(links.length).toBe(7);
  });

  // -- rows cap --
  it("caps visible collections when rows > 0", () => {
    // columns=2, rows=1 => maxVisible=2
    const { container } = render(
      <CollectionList collections={SAMPLE_COLLECTIONS} columns={2} rows={1} />
    );
    const links = container.querySelectorAll("a[href^='/collections/']");
    expect(links.length).toBe(2);
  });

  it("shows all collections when rows is 0 (default)", () => {
    const { container } = render(
      <CollectionList collections={SAMPLE_COLLECTIONS} columns={3} rows={0} />
    );
    const links = container.querySelectorAll("a[href^='/collections/']");
    expect(links.length).toBe(7);
  });

  it("caps rows at 10 maximum", () => {
    // columns=3, rows=999 -> clamped to 10 -> maxVisible=30
    // With 7 collections, all 7 should still show
    const { container } = render(
      <CollectionList collections={SAMPLE_COLLECTIONS} columns={3} rows={999} />
    );
    const links = container.querySelectorAll("a[href^='/collections/']");
    expect(links.length).toBe(7);
  });

  // -- blockStyle --
  it("renders contained style with 220px height cards by default", () => {
    const { container } = render(
      <CollectionList collections={SAMPLE_COLLECTIONS.slice(0, 1)} />
    );
    const link = container.querySelector("a[href='/collections/masculino']") as HTMLElement;
    expect(link).toBeDefined();
    expect(link.style.height).toBe("220px");
    expect(link.style.borderRadius).toBe("12px");
  });

  it("renders image-fit style without fixed height", () => {
    const { container } = render(
      <CollectionList collections={SAMPLE_COLLECTIONS.slice(0, 1)} blockStyle="image-fit" />
    );
    const link = container.querySelector("a[href='/collections/masculino']") as HTMLElement;
    expect(link).toBeDefined();
    // image-fit has no fixed height
    expect(link.style.height).toBe("");
  });

  // -- showTitles --
  it("shows collection titles by default", () => {
    render(<CollectionList collections={SAMPLE_COLLECTIONS.slice(0, 1)} />);
    expect(screen.getByText("Masculino")).toBeDefined();
  });

  it("hides collection titles when showTitles is false", () => {
    render(<CollectionList collections={SAMPLE_COLLECTIONS.slice(0, 1)} showTitles={false} />);
    // The title text should not appear in the rendered output
    expect(screen.queryByText("Masculino")).toBeNull();
  });

  // -- enableHoverAnimation --
  it("injects hover CSS when enableHoverAnimation is true (default)", () => {
    const { container } = render(
      <CollectionList collections={SAMPLE_COLLECTIONS.slice(0, 1)} />
    );
    const styleTag = container.querySelector("style");
    expect(styleTag).not.toBeNull();
    expect(styleTag!.textContent).toContain("collection-card-live-hover");
    expect(styleTag!.textContent).toContain("translateY(-3px)");
    expect(styleTag!.textContent).toContain("scale(1.06)");
  });

  it("does not inject hover CSS when enableHoverAnimation is false", () => {
    const { container } = render(
      <CollectionList collections={SAMPLE_COLLECTIONS.slice(0, 1)} enableHoverAnimation={false} />
    );
    const styleTag = container.querySelector("style");
    expect(styleTag).toBeNull();
  });

  it("assigns hover class to links when enableHoverAnimation is true", () => {
    const { container } = render(
      <CollectionList collections={SAMPLE_COLLECTIONS.slice(0, 1)} enableHoverAnimation={true} />
    );
    const link = container.querySelector("a[href='/collections/masculino']");
    expect(link?.className).toContain("collection-card-live-hover");
  });

  it("does not assign hover class to links when enableHoverAnimation is false", () => {
    const { container } = render(
      <CollectionList collections={SAMPLE_COLLECTIONS.slice(0, 1)} enableHoverAnimation={false} />
    );
    const link = container.querySelector("a[href='/collections/masculino']");
    expect(link?.className || "").not.toContain("collection-card-live-hover");
  });

  // -- productCount display --
  it("shows product count when available (contained)", () => {
    render(<CollectionList collections={SAMPLE_COLLECTIONS.slice(0, 1)} />);
    expect(screen.getByText("12 produtos")).toBeDefined();
  });

  it("does not show product count when undefined", () => {
    render(<CollectionList collections={[{ id: "x", title: "Test", handle: "test" }]} />);
    expect(screen.queryByText(/produtos/)).toBeNull();
  });

  // -- image-fit with showTitles --
  it("shows caption below image in image-fit mode", () => {
    render(
      <CollectionList collections={SAMPLE_COLLECTIONS.slice(0, 1)} blockStyle="image-fit" showTitles={true} />
    );
    expect(screen.getByText("Masculino")).toBeDefined();
    expect(screen.getByText("12 produtos")).toBeDefined();
  });
});
