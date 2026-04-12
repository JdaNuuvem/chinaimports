import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, className, ...rest }: { href: string; children: React.ReactNode; className?: string; [k: string]: unknown }) => (
    <a href={href} className={className} {...rest}>{children}</a>
  ),
}));

import Offers from "@/components/Offers";

const OFFERS_WITH_IMAGE = [
  { id: "1", title: "20% OFF", description: "Cupom", link: "/promo", image: "/img/promo.jpg", backgroundColor: "#1e2d7d", textColor: "#fff" },
];

const OFFERS_NO_IMAGE = [
  { id: "1", title: "Frete Gratis", description: "Acima de R$ 299", link: "/all", backgroundColor: "#e22120", textColor: "#fff" },
];

describe("Offers", () => {
  it("returns null when offers is empty", () => {
    const { container } = render(<Offers offers={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("injects <style> with default desktop min-height 220px", () => {
    const { container } = render(<Offers offers={OFFERS_WITH_IMAGE} />);
    const style = container.querySelector("style");
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain("min-height: 220px");
  });

  it("injects <style> with custom desktop min-height", () => {
    const { container } = render(<Offers offers={OFFERS_WITH_IMAGE} imageHeight={350} />);
    const style = container.querySelector("style");
    expect(style!.textContent).toContain("min-height: 350px");
  });

  it("injects <style> with custom mobile min-height via @media", () => {
    const { container } = render(
      <Offers offers={OFFERS_WITH_IMAGE} imageHeight={350} imageHeightMobile={200} />
    );
    const style = container.querySelector("style");
    expect(style!.textContent).toContain("min-height: 350px");
    expect(style!.textContent).toContain("@media (max-width: 640px)");
    expect(style!.textContent).toContain("min-height: 200px");
  });

  it("falls back mobile height to desktop height when omitted", () => {
    const { container } = render(<Offers offers={OFFERS_WITH_IMAGE} imageHeight={400} />);
    const style = container.querySelector("style");
    const matches = style!.textContent!.match(/min-height: 400px/g);
    expect(matches).not.toBeNull();
    // 4 occurrences: 2 for desktop (container + inner), 2 for mobile (container + inner)
    expect(matches!.length).toBe(4);
  });

  it("uses unique CSS class per instance", () => {
    const { container } = render(
      <div>
        <Offers offers={OFFERS_WITH_IMAGE} imageHeight={300} />
        <Offers offers={OFFERS_WITH_IMAGE} imageHeight={500} />
      </div>
    );
    const styles = container.querySelectorAll("style");
    expect(styles.length).toBe(2);
    const classNames = Array.from(styles).map((s) => {
      const match = s.textContent!.match(/\.(offers-tile-[^ {]+)/);
      return match?.[1];
    });
    expect(classNames[0]).not.toBe(classNames[1]);
  });

  it("applies sized class only to offers with images", () => {
    const { container } = render(<Offers offers={OFFERS_NO_IMAGE} />);
    const link = container.querySelector("a");
    // No image => className should not contain the sized class
    expect(link?.className || "").not.toContain("offers-tile-");
  });

  it("applies sized class to offers with images", () => {
    const { container } = render(<Offers offers={OFFERS_WITH_IMAGE} />);
    const link = container.querySelector("a");
    expect(link?.className || "").toContain("offers-tile-");
  });
});
