import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Homepage", () => {
  test("should load homepage with key sections", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Under Armour Brasil/);

    // Header
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByRole("link", { name: "Masculino" }).first()).toBeVisible();

    // Products section
    await expect(page.getByRole("heading", { name: "Lançamentos" })).toBeVisible();

    // Footer
    await expect(page.locator("footer")).toBeVisible();
  });

  test("should navigate to collection from nav", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole("link", { name: "Masculino" }).first().click();
    await expect(page).toHaveURL(/\/collections\/masculino/);
  });
});

test.describe("Product Page", () => {
  test("should display product details", async ({ page }) => {
    await page.goto(`${BASE_URL}/product/camiseta-ua-tech-2`);
    await expect(page).toHaveTitle(/Camiseta UA Tech 2.0/);

    // Product info
    await expect(page.getByRole("heading", { name: "Camiseta UA Tech 2.0" })).toBeVisible();

    // Price
    await expect(page.getByText("R$ 199,00")).toBeVisible();

    // Buy button
    await expect(page.getByRole("button", { name: /COMPRAR AGORA/i })).toBeVisible();

    // Trust badges
    await expect(page.getByText("Compra Segura")).toBeVisible();
  });

  test("should have breadcrumb navigation", async ({ page }) => {
    await page.goto(`${BASE_URL}/product/camiseta-ua-tech-2`);
    await expect(page.getByText("Todos os produtos")).toBeVisible();
  });
});

test.describe("Collection Page", () => {
  test("should show products in collection", async ({ page }) => {
    await page.goto(`${BASE_URL}/collections/masculino`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should have product cards
    const productLinks = page.locator(".product-item");
    await expect(productLinks.first()).toBeVisible();
  });

  test("should have filters", async ({ page }) => {
    await page.goto(`${BASE_URL}/collections/masculino`);
    await expect(page.getByText("Filtros")).toBeVisible();
  });
});

test.describe("Cart Flow", () => {
  test("should add product to cart", async ({ page }) => {
    await page.goto(`${BASE_URL}/product/camiseta-ua-tech-2`);

    // Click buy
    await page.getByRole("button", { name: /COMPRAR AGORA/i }).click();

    // Cart should open or show confirmation
    await page.waitForTimeout(1000);

    // Navigate to cart
    await page.goto(`${BASE_URL}/cart`);
    await expect(page.getByText("Meu carrinho")).toBeVisible();
  });
});

test.describe("Search", () => {
  test("should navigate to search results", async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=camiseta`);
    await expect(page).toHaveURL(/search/);
  });
});

test.describe("Account Pages", () => {
  test("should show login page", async ({ page }) => {
    await page.goto(`${BASE_URL}/account/login`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should show register page", async ({ page }) => {
    await page.goto(`${BASE_URL}/account/register`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should show reset password page", async ({ page }) => {
    await page.goto(`${BASE_URL}/account/reset-password`);
    await expect(page.getByText("Recuperar Senha")).toBeVisible();
  });
});

test.describe("Static Pages", () => {
  test("should load about page", async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await expect(page).toHaveTitle(/Under Armour/);
  });

  test("should load FAQ page", async ({ page }) => {
    await page.goto(`${BASE_URL}/faq`);
    await expect(page.getByText("Perguntas Frequentes")).toBeVisible();
  });

  test("should load contact page", async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await expect(page).toHaveTitle(/Under Armour/);
  });

  test("should load blog page", async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    await expect(page).toHaveTitle(/Under Armour/);
  });

  test("should load privacy policy", async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/privacidade`);
    await expect(page.getByText("Política de Privacidade")).toBeVisible();
  });

  test("should load terms page", async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/termos`);
    await expect(page.getByText("Termos de Uso")).toBeVisible();
  });

  test("should load exchanges page", async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/trocas`);
    await expect(page.getByText("Trocas e Devoluções")).toBeVisible();
  });

  test("should load shipping policy", async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/envio`);
    await expect(page.getByText("Política de Envio")).toBeVisible();
  });
});

test.describe("Order Tracking", () => {
  test("should show tracking page", async ({ page }) => {
    await page.goto(`${BASE_URL}/order-tracking`);
    await expect(page.getByText("Rastrear Pedido")).toBeVisible();
  });
});

test.describe("Admin", () => {
  test("should show login screen", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/theme`);
    await expect(page.getByText("Painel Administrativo")).toBeVisible();
  });
});

test.describe("404", () => {
  test("should show custom 404 page", async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page-xyz`);
    await expect(page.getByText("404")).toBeVisible();
  });
});

test.describe("SEO", () => {
  test("should have proper meta tags on homepage", async ({ page }) => {
    await page.goto(BASE_URL);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", /Under Armour/);
  });

  test("should have robots.txt", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/robots.txt`);
    expect(response?.status()).toBe(200);
  });

  test("should have sitemap.xml", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/sitemap.xml`);
    expect(response?.status()).toBe(200);
  });
});
