import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ addItem: vi.fn(), loading: false, itemCount: 0, cartOpen: false, setCartOpen: vi.fn() }),
}));

vi.mock("@/lib/utils", () => ({
  formatMoney: (v: number) => `R$ ${(v / 100).toFixed(2)}`,
  calculateDiscount: (orig: number, curr: number) => Math.round(((orig - curr) / orig) * 100),
}));

const mockShowShippingCalculator = { value: true };

vi.mock("@/lib/theme-config", () => ({
  getThemeConfig: () => ({
    identity: { storeName: "Test Store" },
    product: {
      showShippingCalculator: mockShowShippingCalculator.value,
    },
  }),
}));

vi.mock("@/components/ShippingEstimate", () => ({
  default: () => <div data-testid="shipping-estimate">ShippingEstimate</div>,
}));

import ProductInfo from "@/components/ProductInfo";

const PRODUCT = {
  id: "prod_1",
  title: "Camiseta Esportiva",
  handle: "camiseta-esportiva",
  description: "Uma camiseta de alta performance para treinos intensos.",
  thumbnail: "/img/thumb.jpg",
  images: [],
  options: [
    {
      id: "opt_1",
      title: "Tamanho",
      values: [
        { id: "val_1", value: "P" },
        { id: "val_2", value: "M" },
      ],
    },
  ],
  variants: [
    {
      id: "var_1",
      title: "P",
      prices: [{ amount: 19900, currency_code: "BRL" }],
      inventory_quantity: 10,
      options: [{ value: "P" }],
    },
    {
      id: "var_2",
      title: "M",
      prices: [{ amount: 19900, currency_code: "BRL" }],
      inventory_quantity: 5,
      options: [{ value: "M" }],
    },
  ],
  tags: [],
  collection: null,
};

describe("ProductInfo - showShippingCalculator toggle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockShowShippingCalculator.value = true;
    // Mock fetch for review count
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ total: 0, averageRating: 0, reviews: [] }),
    });
  });

  it("renders ShippingEstimate when showShippingCalculator is true", () => {
    mockShowShippingCalculator.value = true;
    const { container } = render(<ProductInfo product={PRODUCT as never} />);
    const shipping = container.querySelector("[data-testid='shipping-estimate']");
    expect(shipping).not.toBeNull();
  });

  it("does not render ShippingEstimate when showShippingCalculator is false", () => {
    mockShowShippingCalculator.value = false;
    const { container } = render(<ProductInfo product={PRODUCT as never} />);
    const shipping = container.querySelector("[data-testid='shipping-estimate']");
    expect(shipping).toBeNull();
  });
});
