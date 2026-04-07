import { describe, it, expect } from "vitest";
import ptBR from "@/data/locales/pt-BR.json";
import en from "@/data/locales/en.json";
import es from "@/data/locales/es.json";

describe("locale files", () => {
  const ptKeys = Object.keys(ptBR);
  const enKeys = Object.keys(en);
  const esKeys = Object.keys(es);

  it("should have all keys in pt-BR", () => {
    expect(ptKeys.length).toBeGreaterThan(100);
  });

  it("should have same keys in en as pt-BR", () => {
    const missing = ptKeys.filter((k) => !enKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it("should have same keys in es as pt-BR", () => {
    const missing = ptKeys.filter((k) => !esKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it("should not have empty values in pt-BR", () => {
    const empty = ptKeys.filter((k) => !(ptBR as Record<string, string>)[k]);
    expect(empty).toEqual([]);
  });

  it("should not have empty values in en", () => {
    const empty = enKeys.filter((k) => !(en as Record<string, string>)[k]);
    expect(empty).toEqual([]);
  });

  it("should not have empty values in es", () => {
    const empty = esKeys.filter((k) => !(es as Record<string, string>)[k]);
    expect(empty).toEqual([]);
  });

  it("should have critical keys", () => {
    const critical = [
      "product.form.add_to_cart",
      "cart.general.checkout",
      "customer.login.submit",
      "search.general.title",
      "checkout.complete",
      "404.general.title",
    ];
    for (const key of critical) {
      expect((ptBR as Record<string, string>)[key]).toBeTruthy();
      expect((en as Record<string, string>)[key]).toBeTruthy();
      expect((es as Record<string, string>)[key]).toBeTruthy();
    }
  });

  it("en translations should be different from pt-BR", () => {
    expect((en as Record<string, string>)["product.form.add_to_cart"])
      .not.toBe((ptBR as Record<string, string>)["product.form.add_to_cart"]);
  });
});
