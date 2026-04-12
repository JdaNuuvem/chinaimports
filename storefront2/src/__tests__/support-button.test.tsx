import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/components/Icons", () => ({
  CloseIcon: ({ className }: { className?: string }) => <span data-testid="close" className={className} />,
  WhatsAppIcon: ({ className }: { className?: string }) => <span data-testid="whatsapp" className={className} />,
}));

import SupportButton from "@/components/SupportButton";

describe("SupportButton", () => {
  it("injects CSS with default bottom: 20px for desktop", () => {
    const { container } = render(<SupportButton />);
    const style = container.querySelector("style");
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain("bottom: 20px");
  });

  it("injects CSS with bottom: 80px for mobile via @media query", () => {
    const { container } = render(<SupportButton />);
    const style = container.querySelector("style");
    expect(style!.textContent).toContain("@media (max-width: 768px)");
    expect(style!.textContent).toContain("bottom: 80px");
  });

  it("renders with support-btn-wrap class", () => {
    const { container } = render(<SupportButton />);
    const wrap = container.querySelector(".support-btn-wrap");
    expect(wrap).not.toBeNull();
  });

  it("renders the toggle button with Suporte aria-label", () => {
    const { container } = render(<SupportButton />);
    const btn = container.querySelector("button[aria-label='Suporte']");
    expect(btn).not.toBeNull();
  });
});
