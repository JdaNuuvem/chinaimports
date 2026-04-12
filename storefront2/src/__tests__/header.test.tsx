import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";

// Mock dependencies
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock("@/components/Icons", () => ({
  HamburgerIcon: ({ className }: { className?: string }) => <span data-testid="hamburger" className={className} />,
  SearchIcon: ({ className }: { className?: string }) => <span data-testid="search" className={className} />,
  CartIcon: ({ className }: { className?: string }) => <span data-testid="cart" className={className} />,
  UserIcon: ({ className }: { className?: string }) => <span data-testid="user" className={className} />,
}));

vi.mock("@/components/MobileMenu", () => ({
  default: () => <div data-testid="mobile-menu" />,
}));

vi.mock("@/components/MiniCart", () => ({
  default: () => <div data-testid="mini-cart" />,
}));

vi.mock("@/components/SearchBar", () => ({
  default: () => <div data-testid="search-bar" />,
}));

vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ itemCount: 0, cartOpen: false, setCartOpen: vi.fn() }),
}));

vi.mock("@/lib/theme-config", () => ({
  getThemeConfig: () => ({
    header: {
      navLinks: [
        { title: "Home", href: "/" },
        { title: "Shop", href: "/shop" },
      ],
    },
    identity: {
      storeName: "Test Store",
      logoUrl: null,
      logoText: "TEST",
      logoHeight: 40,
      logoHeightMobile: 30,
    },
  }),
}));

import Header from "@/components/Header";

describe("Header", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset scrollY
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  });

  it("renders header element with banner role", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header[role='banner']");
    expect(header).not.toBeNull();
  });

  it("renders without header--hidden class initially", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header");
    expect(header!.className).not.toContain("header--hidden");
  });

  it("adds header--hidden class when scrolling down past 100px", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header");

    // Simulate scrolling down past 100px
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 50, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    // Still visible at 50px
    expect(header!.className).not.toContain("header--hidden");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 150, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    // Hidden at 150px (past 100px threshold and scrolling down)
    expect(header!.className).toContain("header--hidden");
  });

  it("removes header--hidden class when scrolling up", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header");

    // Scroll down
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 200, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header!.className).toContain("header--hidden");

    // Scroll up
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 100, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(header!.className).not.toContain("header--hidden");
  });

  it("injects CSS transition and hidden transform styles", () => {
    const { container } = render(<Header />);
    const style = container.querySelector("style");
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain("header--hidden");
    expect(style!.textContent).toContain("translateY(-100%)");
    expect(style!.textContent).toContain("transition: transform 0.3s ease");
  });

  it("injects logo height CSS with desktop and mobile values", () => {
    const { container } = render(<Header />);
    const style = container.querySelector("style");
    expect(style!.textContent).toContain("height: 40px");
    expect(style!.textContent).toContain("height: 30px");
    expect(style!.textContent).toContain("@media (max-width: 640px)");
  });

  it("renders logo text when no logoUrl", () => {
    const { container } = render(<Header />);
    const logoText = container.querySelector(".header__logo-text");
    expect(logoText).not.toBeNull();
    expect(logoText!.textContent).toBe("TEST");
  });
});
