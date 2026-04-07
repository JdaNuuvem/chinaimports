/**
 * Backend API Integration Tests
 * Run with: node __tests__/api.test.js
 * Requires backend running on PORT specified in BACKEND_URL
 */

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:7500";

let passed = 0;
let failed = 0;
let authToken = null;
let adminToken = null;

async function fetchAPI(path, options = {}) {
  // Auto-attach admin token for /admin/* paths if available, else customer token
  const isAdminPath = path.startsWith("/admin/");
  const token = isAdminPath && adminToken ? adminToken : authToken;
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data, ok: res.ok };
}

async function loginAdmin() {
  const password = process.env.ADMIN_SECRET || process.env.THEME_ADMIN_PASSWORD || "admin123";
  const res = await fetch(`${BACKEND_URL}/admin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => null);
  if (data?.token) {
    adminToken = data.token;
    console.log("  🔐 Admin token acquired");
  } else {
    console.log("  ⚠️  Admin login failed — admin tests will be skipped");
  }
}

function assert(name, condition, detail) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function testHealth() {
  console.log("\n🏥 Health Check");
  const { data } = await fetchAPI("/health");
  assert("health returns ok", data?.status === "ok");
  assert("health has db status", data?.db === "connected");
  assert("health has product count", typeof data?.products === "number");
  assert("health has uptime", typeof data?.uptime === "number");
}

async function testProducts() {
  console.log("\n📦 Products");
  const { data } = await fetchAPI("/store/products?limit=3");
  assert("returns products array", Array.isArray(data?.products));
  assert("returns count", typeof data?.count === "number");
  assert("respects limit", data?.products?.length <= 3);

  if (data?.products?.length > 0) {
    const p = data.products[0];
    assert("product has id", !!p.id);
    assert("product has title", !!p.title);
    assert("product has handle", !!p.handle);
    assert("product has variants", Array.isArray(p.variants) && p.variants.length > 0);
    assert("variant has price", p.variants[0]?.prices?.[0]?.amount > 0);
    assert("product has images", Array.isArray(p.images));
    assert("product has created_at", !!p.created_at);

    // Test by handle
    const { data: d2 } = await fetchAPI(`/store/products?handle=${p.handle}`);
    assert("filter by handle works", d2?.products?.length === 1);
    assert("handle filter returns correct product", d2?.products?.[0]?.id === p.id);
  }
}

async function testProductSearch() {
  console.log("\n🔍 Product Search");
  const { data } = await fetchAPI("/store/products/search", { method: "POST", body: JSON.stringify({ q: "camiseta" }) });
  assert("search returns hits", Array.isArray(data?.hits));

  const { data: d2 } = await fetchAPI("/store/products/search", { method: "POST", body: JSON.stringify({ q: "" }) });
  assert("empty search returns empty", d2?.hits?.length === 0);

  const { data: d3 } = await fetchAPI("/store/products/search", { method: "POST", body: JSON.stringify({ q: "xyznonexistent" }) });
  assert("no results for gibberish", d3?.hits?.length === 0);
}

async function testCollections() {
  console.log("\n📂 Collections");
  const { data } = await fetchAPI("/store/collections");
  assert("returns collections", Array.isArray(data?.collections));
  assert("has at least 1 collection", data?.collections?.length > 0);

  if (data?.collections?.length > 0) {
    const col = data.collections[0];
    assert("collection has id", !!col.id);
    assert("collection has title", !!col.title);
    assert("collection has handle", !!col.handle);
  }
}

async function testCart() {
  console.log("\n🛒 Cart");
  // Create cart
  const { data: d1 } = await fetchAPI("/store/carts", { method: "POST" });
  assert("creates cart", !!d1?.cart?.id);
  const cartId = d1?.cart?.id;
  assert("cart has empty items", d1?.cart?.items?.length === 0);
  assert("cart total is 0", d1?.cart?.total === 0);

  // Get variant to add
  const { data: prods } = await fetchAPI("/store/products?limit=1");
  const variantId = prods?.products?.[0]?.variants?.[0]?.id;
  if (!variantId || !cartId) return;

  // Add item
  const { data: d2 } = await fetchAPI(`/store/carts/${cartId}/line-items`, { method: "POST", body: JSON.stringify({ variant_id: variantId, quantity: 2 }) });
  assert("adds item to cart", d2?.cart?.items?.length === 1);
  assert("item has correct quantity", d2?.cart?.items?.[0]?.quantity === 2);
  assert("cart total > 0", d2?.cart?.total > 0);

  // Update quantity
  const itemId = d2?.cart?.items?.[0]?.id;
  const { data: d3 } = await fetchAPI(`/store/carts/${cartId}/line-items/${itemId}`, { method: "POST", body: JSON.stringify({ quantity: 5 }) });
  assert("updates quantity", d3?.cart?.items?.[0]?.quantity === 5);

  // Remove item
  const { data: d4 } = await fetchAPI(`/store/carts/${cartId}/line-items/${itemId}`, { method: "DELETE" });
  assert("removes item", d4?.cart?.items?.length === 0);
  assert("cart total is 0 after remove", d4?.cart?.total === 0);
}

async function testShipping() {
  console.log("\n🚚 Shipping");
  const { data } = await fetchAPI("/store/shipping-options/any-cart-id");
  assert("returns shipping options", Array.isArray(data?.shipping_options));
  assert("has at least 1 option", data?.shipping_options?.length > 0);

  if (data?.shipping_options?.length > 0) {
    const opt = data.shipping_options[0];
    assert("option has name", !!opt.name);
    assert("option has amount", typeof opt.amount === "number");
  }
}

async function testAuth() {
  console.log("\n🔐 Auth");

  // Register
  const email = `test-${Date.now()}@test.com`;
  const { data: d1, status: s1 } = await fetchAPI("/store/customers", { method: "POST", body: JSON.stringify({ first_name: "Test", last_name: "User", email, password: "test123456" }) });
  assert("register returns customer", !!d1?.customer?.id);
  assert("register returns token", !!d1?.token);

  // Login
  const { data: d2 } = await fetchAPI("/store/auth", { method: "POST", body: JSON.stringify({ email, password: "test123456" }) });
  assert("login returns customer", !!d2?.customer?.id);
  assert("login returns token", !!d2?.token);
  authToken = d2?.token;

  // Get me
  const { data: d3 } = await fetchAPI("/store/customers/me");
  assert("get me returns customer", !!d3?.customer?.email);
  assert("customer email matches", d3?.customer?.email === email);

  // Wrong password
  const { status: s4 } = await fetchAPI("/store/auth", { method: "POST", body: JSON.stringify({ email, password: "wrong" }) });
  assert("wrong password returns 401", s4 === 401);

  // Duplicate email
  const { status: s5 } = await fetchAPI("/store/customers", { method: "POST", body: JSON.stringify({ first_name: "Test", last_name: "User", email, password: "test123456" }) });
  assert("duplicate email returns 400", s5 === 400);
}

async function testAddresses() {
  console.log("\n📍 Addresses");
  if (!authToken) { console.log("  ⏭️ Skipped (no auth token)"); return; }

  const { data: d1 } = await fetchAPI("/store/customers/me/addresses", { method: "POST", body: JSON.stringify({ first_name: "Test", last_name: "User", address_1: "Rua Teste 123", city: "São Paulo", province: "SP", postal_code: "01310-100" }) });
  assert("creates address", !!d1?.address?.id);

  const { data: d2 } = await fetchAPI("/store/customers/me/addresses");
  assert("lists addresses", Array.isArray(d2?.addresses));
  assert("has at least 1 address", d2?.addresses?.length > 0);

  if (d1?.address?.id) {
    const { data: d3 } = await fetchAPI(`/store/customers/me/addresses/${d1.address.id}`, { method: "DELETE" });
    assert("deletes address", d3?.success === true);
  }
}

async function testReviews() {
  console.log("\n⭐ Reviews");
  const { data: prods } = await fetchAPI("/store/products?limit=1");
  const productId = prods?.products?.[0]?.id;
  if (!productId) return;

  const { data: d1 } = await fetchAPI(`/store/products/${productId}/reviews`);
  assert("returns reviews array", Array.isArray(d1?.reviews));

  // Create review
  const { data: d2 } = await fetchAPI(`/store/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating: 5, title: "Test Review", body: "This is a test review", author: "Test Bot" }),
  });
  assert("creates review", !!d2?.review?.id);

  // Missing fields
  const { status: s3 } = await fetchAPI(`/store/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating: 5 }),
  });
  assert("rejects incomplete review", s3 === 400);
}

async function testCoupons() {
  console.log("\n🎟️ Coupons");
  // Create coupon
  const code = `TEST${Date.now()}`;
  const { data: d1 } = await fetchAPI("/admin/coupons", { method: "POST", body: JSON.stringify({ code, type: "percentage", value: 15, minOrderAmount: 5000 }) });
  assert("creates coupon", !!d1?.coupon?.id);

  // List coupons
  const { data: d2 } = await fetchAPI("/admin/coupons");
  assert("lists coupons", Array.isArray(d2?.coupons));

  // Apply coupon
  const { data: cart } = await fetchAPI("/store/carts", { method: "POST" });
  const { data: prods } = await fetchAPI("/store/products?limit=1");
  const variantId = prods?.products?.[0]?.variants?.[0]?.id;
  if (cart?.cart?.id && variantId) {
    await fetchAPI(`/store/carts/${cart.cart.id}/line-items`, { method: "POST", body: JSON.stringify({ variant_id: variantId, quantity: 3 }) });
    const { data: d3 } = await fetchAPI(`/store/carts/${cart.cart.id}/apply-coupon`, { method: "POST", body: JSON.stringify({ code }) });
    assert("applies coupon", d3?.discount > 0);
    assert("coupon code returned", d3?.couponCode === code);
  }

  // Invalid coupon
  const { status: s4 } = await fetchAPI(`/store/carts/${cart?.cart?.id}/apply-coupon`, { method: "POST", body: JSON.stringify({ code: "INVALID999" }) });
  assert("rejects invalid coupon", s4 === 400);

  // Delete coupon
  if (d1?.coupon?.id) {
    const { data: d5 } = await fetchAPI(`/admin/coupons/${d1.coupon.id}`, { method: "DELETE" });
    assert("deletes coupon", d5?.success === true);
  }
}

async function testAdminStats() {
  console.log("\n📊 Admin Stats");
  const { data } = await fetchAPI("/admin/stats");
  assert("returns totalProducts", typeof data?.totalProducts === "number");
  assert("returns totalOrders", typeof data?.totalOrders === "number");
  assert("returns totalCustomers", typeof data?.totalCustomers === "number");
  assert("returns totalRevenue", typeof data?.totalRevenue === "number");
  assert("returns averageOrderValue", typeof data?.averageOrderValue === "number");
  assert("returns abandonedCarts", typeof data?.abandonedCarts === "number");
  assert("returns recentOrders", Array.isArray(data?.recentOrders));
  assert("returns topProducts", Array.isArray(data?.topProducts));
  assert("returns dailyStats", typeof data?.dailyStats === "object");
}

async function testAdminProducts() {
  console.log("\n📦 Admin Product CRUD");
  // Create
  const handle = `test-product-${Date.now()}`;
  const { data: d1 } = await fetchAPI("/admin/products", {
    method: "POST",
    body: JSON.stringify({
      title: "Test Product",
      handle,
      description: "Test description",
      productType: "physical",
      isFeatured: true,
      tags: ["test", "automated"],
      variants: [{ title: "P", price: 9900, inventoryQuantity: 10, sku: `${handle}-P`, barcode: "12345" }],
    }),
  });
  assert("creates product", !!d1?.product?.id);
  assert("product has title", d1?.product?.title === "Test Product");

  // Update
  if (d1?.product?.id) {
    const { data: d2 } = await fetchAPI(`/admin/products/${d1.product.id}`, {
      method: "PUT",
      body: JSON.stringify({ title: "Updated Test Product", isFeatured: false }),
    });
    assert("updates product", d2?.product?.title === "Updated Test Product");

    // Delete
    const { data: d3 } = await fetchAPI(`/admin/products/${d1.product.id}`, { method: "DELETE" });
    assert("deletes product", d3?.success === true);
  }
}

async function testAdminOrders() {
  console.log("\n📋 Admin Orders");
  const { data } = await fetchAPI("/admin/orders");
  assert("returns orders array", Array.isArray(data?.orders));
  assert("returns count", typeof data?.count === "number");
}

async function testShippingOptions() {
  console.log("\n🚚 Shipping Options CRUD");
  const { data: d1 } = await fetchAPI("/admin/shipping-options", { method: "POST", body: JSON.stringify({ name: "Test Express", price: 3500, minDays: 1, maxDays: 3 }) });
  assert("creates shipping option", !!d1?.option?.id);

  const { data: d2 } = await fetchAPI("/admin/shipping-options");
  assert("lists shipping options", Array.isArray(d2?.shipping_options));

  if (d1?.option?.id) {
    const { data: d3 } = await fetchAPI(`/admin/shipping-options/${d1.option.id}`, { method: "DELETE" });
    assert("deletes shipping option", d3?.success === true);
  }
}

async function testRedirects() {
  console.log("\n🔀 Redirects");
  const { data: d1 } = await fetchAPI("/admin/redirects", { method: "POST", body: JSON.stringify({ fromPath: "/old-page", toPath: "/new-page" }) });
  assert("creates redirect", !!d1?.redirect?.id);

  const { data: d2 } = await fetchAPI("/admin/redirects");
  assert("lists redirects", Array.isArray(d2?.redirects));

  if (d1?.redirect?.id) {
    const { data: d3 } = await fetchAPI(`/admin/redirects/${d1.redirect.id}`, { method: "DELETE" });
    assert("deletes redirect", d3?.success === true);
  }
}

async function testNewsletter() {
  console.log("\n📬 Newsletter");
  const { data } = await fetchAPI("/store/newsletter", { method: "POST", body: JSON.stringify({ email: `test-${Date.now()}@test.com` }) });
  assert("subscribes to newsletter", data?.success === true);

  const { status } = await fetchAPI("/store/newsletter", { method: "POST", body: JSON.stringify({}) });
  assert("rejects empty email", status === 400);
}

async function testContact() {
  console.log("\n📩 Contact");
  const { data } = await fetchAPI("/store/contact", { method: "POST", body: JSON.stringify({ name: "Test", email: "test@test.com", message: "Test message" }) });
  assert("sends contact message", data?.success === true);

  const { status } = await fetchAPI("/store/contact", { method: "POST", body: JSON.stringify({ name: "Test" }) });
  assert("rejects incomplete contact", status === 400);
}

async function testSettings() {
  console.log("\n⚙️  Settings Store");

  // Public config (no auth)
  const { status: pubStatus, data: pubData } = await fetchAPI("/store/public-config");
  assert("GET /store/public-config returns 200", pubStatus === 200);
  assert("public config is an object", typeof pubData === "object" && pubData !== null);

  if (!adminToken) {
    console.log("  ⚠️  Skipping admin endpoints (no admin token)");
    return;
  }

  // Set a key
  const { status: setStatus, data: setData } = await fetchAPI("/admin/settings", {
    method: "PUT",
    body: JSON.stringify({ GA_ID: "G-TEST", FB_PIXEL_ID: "12345" }),
  });
  assert("PUT /admin/settings returns 200", setStatus === 200);
  assert("PUT returns results array", Array.isArray(setData?.results));
  assert("GA_ID marked as updated", setData?.results?.some((r) => r.key === "GA_ID" && r.status === "updated"));

  // Check public config now includes it
  const { data: pubData2 } = await fetchAPI("/store/public-config");
  assert("public-config reflects new GA_ID", pubData2?.GA_ID === "G-TEST");
  assert("public-config reflects new FB_PIXEL_ID", pubData2?.FB_PIXEL_ID === "12345");

  // Admin settings list (masked)
  const { data: listData } = await fetchAPI("/admin/settings");
  assert("GET /admin/settings returns settings array", Array.isArray(listData?.settings));

  // Admin settings revealed
  const { data: revealData } = await fetchAPI("/admin/settings?reveal=1");
  assert("GET ?reveal=1 returns full values", Array.isArray(revealData?.settings));

  // Forbidden keys
  const { data: forbiddenData } = await fetchAPI("/admin/settings", {
    method: "PUT",
    body: JSON.stringify({ JWT_SECRET: "x", ADMIN_SECRET: "y", DATABASE_URL: "z" }),
  });
  assert("JWT_SECRET blocked", forbiddenData?.results?.find((r) => r.key === "JWT_SECRET")?.status === "forbidden");
  assert("ADMIN_SECRET blocked", forbiddenData?.results?.find((r) => r.key === "ADMIN_SECRET")?.status === "forbidden");
  assert("DATABASE_URL blocked", forbiddenData?.results?.find((r) => r.key === "DATABASE_URL")?.status === "forbidden");

  // Delete via empty string
  const { data: delData } = await fetchAPI("/admin/settings", {
    method: "PUT",
    body: JSON.stringify({ GA_ID: "" }),
  });
  assert("empty string deletes key", delData?.results?.find((r) => r.key === "GA_ID")?.status === "deleted");

  const { data: pubData3 } = await fetchAPI("/store/public-config");
  assert("deleted key removed from public-config", !pubData3?.GA_ID);
}

async function testSentinel() {
  console.log("\n🛰️  Sentinel Tracking");

  if (!adminToken) {
    console.log("  ⚠️  Skipping admin endpoints (no admin token)");
  } else {
    const { data: cfg } = await fetchAPI("/admin/sentinel/config");
    assert("GET /admin/sentinel/config returns shape", cfg && "configured" in cfg);

    // Rotate secret (in-memory only — safe for tests)
    const { data: rotated } = await fetchAPI("/admin/sentinel/rotate-secret", { method: "POST" });
    assert("POST /admin/sentinel/rotate-secret returns secret", !!rotated?.secret);
    assert("rotate-secret returns webhook_url", typeof rotated?.webhook_url === "string");

    if (rotated?.secret) {
      // Ping endpoint with correct secret
      const { status: pingOk, data: pingData } = await fetchAPI(`/webhooks/sentinel/${rotated.secret}/ping`);
      assert("GET ping with correct secret returns 200", pingOk === 200);
      assert("ping returns ok:true", pingData?.ok === true);

      // Ping with wrong secret
      const { status: pingBad } = await fetchAPI(`/webhooks/sentinel/wrongsecret/ping`);
      assert("GET ping with wrong secret returns 401", pingBad === 401);

      // POST webhook with correct secret
      const { status: postOk, data: postData } = await fetchAPI(`/webhooks/sentinel/${rotated.secret}`, {
        method: "POST",
        body: JSON.stringify({ event: "test", data: { ts: new Date().toISOString() } }),
      });
      assert("POST webhook with correct secret returns 202", postOk === 202);
      assert("webhook POST returns received:true", postData?.received === true);

      // POST webhook without event field
      const { status: missingEvent } = await fetchAPI(`/webhooks/sentinel/${rotated.secret}`, {
        method: "POST",
        body: JSON.stringify({ data: {} }),
      });
      assert("POST webhook without event returns 400", missingEvent === 400);

      // POST webhook with wrong secret
      const { status: wrongPost } = await fetchAPI(`/webhooks/sentinel/nope`, {
        method: "POST",
        body: JSON.stringify({ event: "test" }),
      });
      assert("POST webhook with wrong secret returns 401", wrongPost === 401);

      // Purchase event (should store attribution, even if order doesn't exist it should not crash)
      const { status: purchaseOk } = await fetchAPI(`/webhooks/sentinel/${rotated.secret}`, {
        method: "POST",
        body: JSON.stringify({
          event: "purchase",
          data: { order_id: "fake_order_id", utm_source: "google", gclid: "xyz" },
        }),
      });
      assert("purchase event accepted (202)", purchaseOk === 202);
    }
  }
}

async function testCompleteOrderFlow() {
  console.log("\n🛍️ Complete Order Flow");
  // Create cart
  const { data: d1 } = await fetchAPI("/store/carts", { method: "POST" });
  const cartId = d1?.cart?.id;
  assert("1. create cart", !!cartId);

  // Add item
  const { data: prods } = await fetchAPI("/store/products?limit=1");
  const variant = prods?.products?.[0]?.variants?.[0];
  if (!variant || !cartId) return;

  const initialStock = variant.inventory_quantity;
  const { data: d2 } = await fetchAPI(`/store/carts/${cartId}/line-items`, { method: "POST", body: JSON.stringify({ variant_id: variant.id, quantity: 1 }) });
  assert("2. add item", d2?.cart?.items?.length === 1);

  // Add address
  const { data: d3 } = await fetchAPI(`/store/carts/${cartId}`, { method: "POST", body: JSON.stringify({ shipping_address: { first_name: "Test", last_name: "User", address_1: "Rua Teste", city: "SP", province: "SP", postal_code: "01310-100", country_code: "BR" } }) });
  assert("3. add address", !!d3?.cart);

  // Select shipping
  const { data: d4 } = await fetchAPI(`/store/carts/${cartId}/shipping-methods`, { method: "POST", body: JSON.stringify({ option_id: "so_free" }) });
  assert("4. select shipping", d4?.cart?.shipping_total === 0);

  // Payment session
  const { data: d5 } = await fetchAPI(`/store/carts/${cartId}/payment-sessions`, { method: "POST" });
  assert("5. create payment", !!d5?.cart);

  // Complete
  const { data: d6 } = await fetchAPI(`/store/carts/${cartId}/complete`, { method: "POST" });
  assert("6. complete order", d6?.type === "order");
  assert("7. order has display_id", typeof d6?.data?.display_id === "number");
  assert("8. order has total", d6?.data?.total > 0);

  // Verify inventory decremented
  const { data: prodsAfter } = await fetchAPI(`/store/products?handle=${prods?.products?.[0]?.handle}`);
  const newStock = prodsAfter?.products?.[0]?.variants?.[0]?.inventory_quantity;
  assert("9. inventory decremented", newStock < initialStock);
}

// ── Run all tests ──
async function main() {
  console.log(`\n${"═".repeat(50)}`);
  console.log("  BACKEND API INTEGRATION TESTS");
  console.log(`  ${BACKEND_URL}`);
  console.log(`${"═".repeat(50)}`);

  try {
    await testHealth();
    await loginAdmin();
    await testProducts();
    await testProductSearch();
    await testCollections();
    await testCart();
    await testShipping();
    await testAuth();
    await testAddresses();
    await testReviews();
    await testCoupons();
    await testAdminStats();
    await testAdminProducts();
    await testAdminOrders();
    await testShippingOptions();
    await testRedirects();
    await testNewsletter();
    await testContact();
    await testSettings();
    await testSentinel();
    await testCompleteOrderFlow();
  } catch (err) {
    console.error("\n💥 Fatal error:", err.message);
    failed++;
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`  RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log(`${"═".repeat(50)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
