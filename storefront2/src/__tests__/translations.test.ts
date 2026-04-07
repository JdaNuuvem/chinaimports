import { describe, it, expect } from "vitest";
import { translate, t } from "@/data/translations";

describe("translations", () => {
  it("should return translated text for known key", () => {
    expect(translate("product.form.add_to_cart")).toBe("COMPRAR AGORA");
  });

  it("should return the key itself for unknown keys", () => {
    expect(translate("nonexistent.key")).toBe("nonexistent.key");
  });

  it("should replace template variables", () => {
    const result = translate("collection.product.discount_html", { savings: "20%" });
    expect(result).toBe("20% OFF");
  });

  it("should have all critical translation keys", () => {
    const criticalKeys = [
      "product.form.add_to_cart",
      "product.form.sold_out",
      "cart.general.title",
      "cart.general.empty",
      "cart.general.checkout",
      "customer.login.login",
      "customer.register.create_account",
      "search.general.title",
      "404.general.title",
    ];
    for (const key of criticalKeys) {
      expect((t as Record<string, string>)[key]).toBeDefined();
    }
  });
});
