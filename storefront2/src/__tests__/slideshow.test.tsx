import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

import Slideshow from "@/components/Slideshow";

const SLIDES = [
  { id: "s1", image: "/img/1.jpg", title: "Slide 1", link: "/promo" },
  { id: "s2", image: "/img/2.jpg", title: "Slide 2", mobileImage: "/img/2m.jpg" },
];

describe("Slideshow", () => {
  it("returns null when slides is empty array", () => {
    const { container } = render(<Slideshow slides={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when slides prop is explicit empty", () => {
    const { container } = render(<Slideshow slides={[]} autoPlay={false} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders slides when provided", () => {
    const { container } = render(<Slideshow slides={SLIDES} autoPlay={false} />);
    const section = container.querySelector("[data-section-type='slideshow']");
    expect(section).not.toBeNull();
  });

  it("injects <style> with default desktop height 500px", () => {
    const { container } = render(<Slideshow slides={SLIDES} autoPlay={false} />);
    const style = container.querySelector("style");
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain("max-height: 500px");
  });

  it("injects <style> with custom desktop height", () => {
    const { container } = render(<Slideshow slides={SLIDES} autoPlay={false} imageHeight={700} />);
    const style = container.querySelector("style");
    expect(style!.textContent).toContain("max-height: 700px");
  });

  it("injects <style> with custom mobile height via @media", () => {
    const { container } = render(
      <Slideshow slides={SLIDES} autoPlay={false} imageHeight={600} imageHeightMobile={350} />
    );
    const style = container.querySelector("style");
    expect(style!.textContent).toContain("max-height: 600px");
    expect(style!.textContent).toContain("@media (max-width: 640px)");
    expect(style!.textContent).toContain("max-height: 350px");
  });

  it("falls back mobile height to desktop height when imageHeightMobile is omitted", () => {
    const { container } = render(
      <Slideshow slides={SLIDES} autoPlay={false} imageHeight={800} />
    );
    const style = container.querySelector("style");
    // Both desktop and mobile should be 800px
    const matches = style!.textContent!.match(/max-height: 800px/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(2);
  });

  it("uses a unique CSS class per instance (useId)", () => {
    const { container } = render(
      <div>
        <Slideshow slides={SLIDES} autoPlay={false} imageHeight={400} />
        <Slideshow slides={SLIDES} autoPlay={false} imageHeight={600} />
      </div>
    );
    const styles = container.querySelectorAll("style");
    expect(styles.length).toBe(2);
    // Each style tag should have a different class name
    const classNames = Array.from(styles).map((s) => {
      const match = s.textContent!.match(/\.(slideshow-img-[^ {]+)/);
      return match?.[1];
    });
    expect(classNames[0]).toBeDefined();
    expect(classNames[1]).toBeDefined();
    expect(classNames[0]).not.toBe(classNames[1]);
  });

  it("applies sized class to img elements", () => {
    const { container } = render(<Slideshow slides={SLIDES} autoPlay={false} />);
    const imgs = container.querySelectorAll("img.slideshow__image");
    expect(imgs.length).toBeGreaterThan(0);
    // Each img should have the sized class
    const firstImg = imgs[0];
    expect(firstImg.className).toContain("slideshow-img-");
  });

  it("does not render dots for single slide", () => {
    const { container } = render(
      <Slideshow slides={[SLIDES[0]]} autoPlay={false} />
    );
    const dots = container.querySelectorAll(".slideshow__dot");
    expect(dots.length).toBe(0);
  });

  it("renders dots for multiple slides", () => {
    const { container } = render(
      <Slideshow slides={SLIDES} autoPlay={false} />
    );
    const dots = container.querySelectorAll(".slideshow__dot");
    expect(dots.length).toBe(2);
  });
});
