import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

import Mosaic from "@/components/Mosaic";

const ITEMS = [
  { id: "1", image: "/img/m.jpg", title: "Masculino", buttonText: "Ver", link: "/masculino" },
  { id: "2", image: "/img/f.jpg", title: "Feminino", buttonText: "Ver", link: "/feminino" },
];

describe("Mosaic", () => {
  it("injects <style> with default desktop height 280px", () => {
    const { container } = render(<Mosaic items={ITEMS} />);
    const style = container.querySelector("style");
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain("height: 280px");
  });

  it("injects <style> with custom desktop height", () => {
    const { container } = render(<Mosaic items={ITEMS} imageHeight={400} />);
    const style = container.querySelector("style");
    expect(style!.textContent).toContain("height: 400px");
  });

  it("injects <style> with custom mobile height via @media", () => {
    const { container } = render(<Mosaic items={ITEMS} imageHeight={400} imageHeightMobile={250} />);
    const style = container.querySelector("style");
    expect(style!.textContent).toContain("height: 400px");
    expect(style!.textContent).toContain("@media (max-width: 640px)");
    expect(style!.textContent).toContain("height: 250px");
  });

  it("falls back mobile height to desktop height when omitted", () => {
    const { container } = render(<Mosaic items={ITEMS} imageHeight={500} />);
    const style = container.querySelector("style");
    // Both desktop and mobile rules should have 500px
    const matches = style!.textContent!.match(/height: 500px/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(2);
  });

  it("uses unique CSS class per instance", () => {
    const { container } = render(
      <div>
        <Mosaic items={ITEMS} imageHeight={300} />
        <Mosaic items={ITEMS} imageHeight={500} />
      </div>
    );
    const styles = container.querySelectorAll("style");
    expect(styles.length).toBe(2);
    const classNames = Array.from(styles).map((s) => {
      const match = s.textContent!.match(/\.(mosaic-card-[^ {]+)/);
      return match?.[1];
    });
    expect(classNames[0]).not.toBe(classNames[1]);
  });

  it("applies sized class to mosaic card links", () => {
    const { container } = render(<Mosaic items={ITEMS} />);
    const links = container.querySelectorAll("a.promo-block");
    expect(links.length).toBe(2);
    const firstLink = links[0];
    expect(firstLink.className).toContain("mosaic-card-");
  });
});
