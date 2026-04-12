import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

import ImageWithText from "@/components/ImageWithText";

describe("ImageWithText", () => {
  it("injects <style> with default desktop max-height 450px", () => {
    const { container } = render(<ImageWithText />);
    const style = container.querySelector("style");
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain("max-height: 450px");
  });

  it("injects <style> with custom desktop max-height", () => {
    const { container } = render(<ImageWithText imageHeight={600} />);
    const style = container.querySelector("style");
    expect(style!.textContent).toContain("max-height: 600px");
  });

  it("injects <style> with custom mobile max-height via @media", () => {
    const { container } = render(<ImageWithText imageHeight={600} imageHeightMobile={300} />);
    const style = container.querySelector("style");
    expect(style!.textContent).toContain("max-height: 600px");
    expect(style!.textContent).toContain("@media (max-width: 640px)");
    expect(style!.textContent).toContain("max-height: 300px");
  });

  it("falls back mobile height to desktop height when omitted", () => {
    const { container } = render(<ImageWithText imageHeight={700} />);
    const style = container.querySelector("style");
    const matches = style!.textContent!.match(/max-height: 700px/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(2);
  });

  it("uses unique CSS class per instance", () => {
    const { container } = render(
      <div>
        <ImageWithText imageHeight={400} />
        <ImageWithText imageHeight={600} />
      </div>
    );
    const styles = container.querySelectorAll("style");
    expect(styles.length).toBe(2);
    const classNames = Array.from(styles).map((s) => {
      const match = s.textContent!.match(/\.(image-with-text-img-[^ {]+)/);
      return match?.[1];
    });
    expect(classNames[0]).not.toBe(classNames[1]);
  });

  // Mobile centering CSS
  it("injects mobile centering CSS with flex-direction: column", () => {
    const { container } = render(<ImageWithText />);
    const style = container.querySelector("style");
    expect(style!.textContent).toContain("flex-direction: column");
    expect(style!.textContent).toContain("text-align: center");
    expect(style!.textContent).toContain("width: 100%");
  });

  it("renders image on the left by default", () => {
    const { container } = render(<ImageWithText />);
    const flexContainer = container.querySelector("[data-section-type='image-with-text'] .container > div");
    expect(flexContainer).not.toBeNull();
    // First child should be the image wrap
    const firstChild = flexContainer!.firstElementChild as HTMLElement;
    expect(firstChild.tagName).toBe("DIV");
    const img = firstChild.querySelector("img");
    expect(img).not.toBeNull();
  });

  it("renders image on the right when imagePosition is right", () => {
    const { container } = render(<ImageWithText imagePosition="right" />);
    const flexContainer = container.querySelector("[data-section-type='image-with-text'] .container > div");
    // First child should be the text wrap (not image wrap)
    const firstChild = flexContainer!.firstElementChild as HTMLElement;
    const img = firstChild.querySelector("img");
    expect(img).toBeNull(); // text element has no img
  });

  it("renders title and content", () => {
    render(<ImageWithText title="Test Title" content="Test content" />);
    expect(screen.getByText("Test Title")).toBeDefined();
    // content is rendered via dangerouslySetInnerHTML, check container
  });

  it("renders button with link", () => {
    render(<ImageWithText buttonText="Shop Now" buttonLink="/shop" />);
    const link = screen.getByText("Shop Now");
    expect(link).toBeDefined();
    expect(link.closest("a")?.getAttribute("href")).toBe("/shop");
  });
});
