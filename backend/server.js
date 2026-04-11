require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

// Validation helper: parses body via Zod schema, returns 400 on error
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.flatten().fieldErrors,
    });
  }
  req.body = result.data;
  next();
};

// Schemas — email always normalized to lowercase + trimmed
const normalizedEmail = z.string().trim().toLowerCase().pipe(z.string().email());

const customerSignupSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(8).max(128),
  first_name: z.string().min(1).max(80).optional(),
  last_name: z.string().min(1).max(80).optional(),
  phone: z.string().max(40).optional(),
});

const loginSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(1).max(128),
});

const newsletterSchema = z.object({
  email: normalizedEmail,
  name: z.string().max(100).optional(),
});

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: normalizedEmail,
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
});

const reviewSchema = z.object({
  author: z.string().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
});

const cartLineItemSchema = z.object({
  variant_id: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
});

// Accept both snake_case (new clients) and camelCase (legacy clients)
const addressSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  first_name: z.string().min(1).max(80).optional(),
  last_name: z.string().min(1).max(80).optional(),
  address1: z.string().min(1).max(200).optional(),
  address2: z.string().max(200).optional(),
  address_1: z.string().min(1).max(200).optional(),
  address_2: z.string().max(200).optional(),
  city: z.string().min(1).max(120),
  province: z.string().max(120).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  postal_code: z.string().min(1).max(20).optional(),
  country_code: z.string().min(2).max(3).optional(),
  countryCode: z.string().min(2).max(3).optional(),
  phone: z.string().max(40).optional(),
  isDefault: z.boolean().optional(),
}).refine(
  (d) => (d.firstName || d.first_name) && (d.lastName || d.last_name) && (d.address1 || d.address_1) && (d.postalCode || d.postal_code),
  { message: "firstName, lastName, address1/address_1 and postalCode/postal_code are required" }
);

const prisma = new PrismaClient();
const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const STORE_URL = process.env.STORE_URL || "http://localhost:3000";

// Fire-and-forget call to the storefront's /api/revalidate so that a
// newly created/updated/deleted product or collection becomes visible
// immediately without waiting for the ISR revalidate timer.
async function notifyStorefrontRevalidate(payload) {
  if (!STORE_URL) return;
  const secret = process.env.REVALIDATION_SECRET;
  try {
    if (secret) {
      // Authenticated path — revalidates product + listings
      await fetch(`${STORE_URL}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Webhook-Secret": secret },
        body: JSON.stringify(payload),
      }).catch((e) => console.warn("[REVALIDATE→]", e.message));
    }
    // Fallback: public per-product endpoint (no secret required). Always
    // call this for product events so a missing/mismatched secret doesn't
    // leave the PDP stuck on a stale 404 from ISR.
    if (payload?.type === "product" && payload?.handle) {
      await fetch(`${STORE_URL}/api/revalidate-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: payload.handle }),
      }).catch((e) => console.warn("[REVALIDATE-PRODUCT→]", e.message));
    }
  } catch (e) {
    console.warn("[REVALIDATE→]", e.message);
  }
}

// ══════════════════════════════════════
// SETTINGS STORE — DB-backed, fallback to env, in-memory cache
// ══════════════════════════════════════
// Keys that are considered secrets (masked on GET /admin/settings without ?reveal=1)
const SECRET_SETTING_KEYS = new Set([
  "SENTINEL_WEBHOOK_SECRET", "SENTINEL_API_KEY",
  "LUNA_WEBHOOK_SECRET", "LUNA_STORE_UUID",
  "SMTP_PASS", "SMTP_USER",
  "META_API_TOKEN", "STRIPE_SECRET_KEY",
]);
// Keys the storefront can read publicly (non-secret subset)
const PUBLIC_SETTING_KEYS = new Set([
  "SENTINEL_API_KEY", "GA_ID", "FB_PIXEL_ID",
  "WHATSAPP_NUMBER", "STORE_NAME",
]);
// Keys that should NEVER be settable via the admin API (infrastructure/security)
const FORBIDDEN_SETTING_KEYS = new Set([
  "JWT_SECRET", "ADMIN_SECRET", "THEME_ADMIN_PASSWORD", "DATABASE_URL", "PORT", "NODE_ENV",
]);

const settingCache = new Map();
// In-memory fallback when Prisma model not yet generated (runs before migration)
const memorySettingsFallback = new Map();

// Prisma error codes that mean "table missing" — trigger degraded mode
const PRISMA_MISSING_TABLE_CODES = new Set(["P2021", "P2010"]);
let settingModelAvailable = true; // sticky flag — once we hit "table missing" we stop trying

function isPrismaTableMissing(e) {
  if (!e) return false;
  const msg = String(e.message || "");
  return PRISMA_MISSING_TABLE_CODES.has(e.code) || msg.includes("does not exist") || msg.includes("no such table");
}

async function getSetting(key, fallback = null) {
  if (settingCache.has(key)) return settingCache.get(key);
  if (settingModelAvailable && prisma?.setting?.findUnique) {
    try {
      const row = await prisma.setting.findUnique({ where: { key } });
      if (row) {
        const value = JSON.parse(row.value);
        settingCache.set(key, value);
        return value;
      }
    } catch (e) {
      if (isPrismaTableMissing(e)) {
        console.warn("[SETTINGS] Prisma setting table missing — degrading to in-memory. Run `npx prisma db push` to persist.");
        settingModelAvailable = false;
      }
    }
  }
  if (memorySettingsFallback.has(key)) {
    const value = memorySettingsFallback.get(key);
    settingCache.set(key, value);
    return value;
  }
  // Fallback to process.env (allows migration from env → DB transparently)
  const envValue = process.env[key];
  if (envValue !== undefined) {
    settingCache.set(key, envValue);
    return envValue;
  }
  return fallback;
}

async function setSetting(key, value) {
  if (FORBIDDEN_SETTING_KEYS.has(key)) {
    throw new Error(`Setting ${key} cannot be modified via API`);
  }
  const isSecret = SECRET_SETTING_KEYS.has(key);
  if (settingModelAvailable && prisma?.setting?.upsert) {
    try {
      const stringValue = JSON.stringify(value);
      await prisma.setting.upsert({
        where: { key },
        update: { value: stringValue, isSecret },
        create: { key, value: stringValue, isSecret },
      });
    } catch (e) {
      if (isPrismaTableMissing(e)) {
        console.warn("[SETTINGS] Degrading to in-memory (run `npx prisma db push` to persist)");
        settingModelAvailable = false;
        memorySettingsFallback.set(key, value);
      } else {
        throw e;
      }
    }
  } else {
    memorySettingsFallback.set(key, value);
  }
  settingCache.set(key, value);
  if (typeof value === "string") process.env[key] = value;
}

async function deleteSetting(key) {
  if (settingModelAvailable && prisma?.setting?.delete) {
    try { await prisma.setting.delete({ where: { key } }); }
    catch (e) {
      if (isPrismaTableMissing(e)) settingModelAvailable = false;
      /* ignore "not found" errors */
    }
  }
  memorySettingsFallback.delete(key);
  settingCache.delete(key);
  // Also clear process.env override so subsequent reads don't find stale value
  delete process.env[key];
}

async function getAllSettings() {
  if (settingModelAvailable && prisma?.setting?.findMany) {
    try {
      const rows = await prisma.setting.findMany();
      return rows.map((r) => ({
        key: r.key,
        value: JSON.parse(r.value),
        isSecret: r.isSecret,
        updatedAt: r.updatedAt,
      }));
    } catch (e) {
      if (isPrismaTableMissing(e)) settingModelAvailable = false;
      else return [];
    }
  }
  // Degraded mode
  return Array.from(memorySettingsFallback.entries()).map(([key, value]) => ({
    key,
    value,
    isSecret: SECRET_SETTING_KEYS.has(key),
    updatedAt: new Date(),
  }));
}

function maskSecret(v) {
  if (typeof v !== "string" || v.length < 4) return "****";
  return v.slice(0, 3) + "****" + v.slice(-3);
}

// HTML sanitization to prevent XSS
function sanitizeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") result[key] = sanitizeHtml(value);
    else if (Array.isArray(value)) result[key] = value.map(v => typeof v === "string" ? sanitizeHtml(v) : v);
    else result[key] = value;
  }
  return result;
}

// ── Middleware ──
app.use(helmet({ crossOriginResourcePolicy: false }));

// Build allowed origins list from env (ALLOWED_ORIGINS=https://a.com,https://b.com) + STORE_URL + localhost
const allowedOrigins = [
  ...(process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean),
  STORE_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin / server-to-server (no Origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Visitor-Id", "X-Sentinel-Id", "X-Session-Id"],
}));
app.use(express.json({ limit: "10mb" }));

// Serve uploaded review images
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

const generalLimiter = rateLimit({ windowMs: 60_000, max: 200, message: { error: "Too many requests" } });
const authLimiter = rateLimit({ windowMs: 60_000, max: 10, message: { error: "Too many login attempts" } });
const reviewLimiter = rateLimit({ windowMs: 60_000, max: 5, message: { error: "Too many review submissions. Please wait." } });
const writeLimiter = rateLimit({ windowMs: 60_000, max: 5, message: { error: "Too many submissions. Please wait." } });
const signupLimiter = rateLimit({ windowMs: 60 * 60_000, max: 5, message: { error: "Too many signup attempts. Try again later." } });
app.use("/store/", generalLimiter);
app.use("/store/auth", authLimiter);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path !== "/health") console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// ── Auth middleware ──
async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    jwt.verify(auth.slice(7), JWT_SECRET);
    const session = await prisma.session.findUnique({ where: { token: auth.slice(7) }, include: { customer: true } });
    if (!session || session.expiresAt < new Date()) return res.status(401).json({ error: "Session expired" });
    req.customer = session.customer;
    next();
  } catch { return res.status(401).json({ error: "Invalid token" }); }
}

// ── Admin Auth ──
const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.THEME_ADMIN_PASSWORD || "admin123";

// POST /admin/auth - Admin login endpoint
app.post("/admin/auth", authLimiter, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Password required" });
  if (password !== ADMIN_SECRET) return res.status(401).json({ error: "Invalid password" });

  // Generate admin token (24h expiry)
  const token = jwt.sign({ role: "admin", iat: Math.floor(Date.now() / 1000) }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token, expiresIn: 86400 });
});

// Verify admin token
function authenticateAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Admin authentication required" });
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ error: "Admin access required" });
    next();
  } catch { return res.status(401).json({ error: "Invalid or expired admin token" }); }
}

// ── Helpers ──
const productInclude = { variants: true, options: { include: { values: true } }, images: { orderBy: { position: "asc" } }, collections: { include: { collection: true } } };

function formatProduct(p) {
  const col = p.collections?.[0]?.collection || null;
  const optionsList = (p.options || []).map((o) => ({ id: o.id, title: o.title, values: o.values.map((v) => ({ id: v.id, value: v.value })) }));

  return {
    id: p.id, title: p.title, description: p.description, handle: p.handle, thumbnail: p.thumbnail,
    luna_checkout_url: p.lunaCheckoutUrl || null,
    skip_cart: p.skipCart === true,
    images: (p.images || []).map((img) => ({ id: img.id, url: img.url })),
    options: optionsList,
    variants: (p.variants || []).map((v) => {
      // Derive option values from variant title (e.g. "P / Preto" → [{value:"P"},{value:"Preto"}])
      const titleParts = v.title.split(/\s*\/\s*/);
      const variantOptions = titleParts.map((part, i) => ({
        id: `${v.id}_opt_${i}`,
        value: part.trim(),
        option_id: optionsList[i]?.id || `opt_${i}`,
      }));
      return {
        id: v.id, title: v.title, sku: v.sku,
        prices: [{ amount: v.price, currency_code: "BRL" }],
        inventory_quantity: v.inventoryQuantity, original_price: v.compareAtPrice, calculated_price: v.price,
        options: variantOptions,
      };
    }),
    tags: [], collection_id: col?.id || null, collection: col ? { id: col.id, title: col.title, handle: col.handle } : null,
    created_at: p.createdAt.toISOString(), updated_at: p.updatedAt.toISOString(),
  };
}

const cartInclude = { items: { include: { variant: { include: { product: true } } } } };

function formatCart(cart) {
  const items = (cart.items || []).map((item) => ({
    id: item.id, title: item.variant?.product?.title || "Product", description: item.variant?.title || "",
    quantity: item.quantity, variant: item.variant ? { id: item.variant.id, title: item.variant.title, prices: [{ amount: item.variant.price, currency_code: "BRL" }], inventory_quantity: item.variant.inventoryQuantity } : null,
    thumbnail: item.variant?.product?.thumbnail || null, unit_price: item.variant?.price || 0, total: (item.variant?.price || 0) * item.quantity,
  }));
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  return { id: cart.id, items, subtotal, shipping_total: cart.shippingTotal, discount_total: cart.discountTotal, total: subtotal + cart.shippingTotal - cart.discountTotal, region_id: "reg_brasil", shipping_address: cart.shippingAddress ? JSON.parse(cart.shippingAddress) : null, email: cart.email || null };
}

// ── Email helper ──
async function sendOrderEmail(order, type = "confirmation") {
  if (!process.env.SMTP_HOST) return;

  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const address = order.shippingAddress ? JSON.parse(order.shippingAddress) : null;
    const customerEmail = order.customer?.email;
    if (!customerEmail) return;

    const items = order.items || [];
    const itemsHtml = items.map(i =>
      `<p style="margin:4px 0">${i.title} × ${i.quantity} — R$ ${(i.total / 100).toFixed(2).replace(".", ",")}</p>`
    ).join("");

    const subjects = {
      confirmation: `Pedido #${order.displayId} confirmado!`,
      shipped: `Pedido #${order.displayId} enviado!`,
      delivered: `Pedido #${order.displayId} entregue!`,
    };

    const bodies = {
      confirmation: `
        <p>Olá <strong>${address?.first_name || "Cliente"}</strong>,</p>
        <p>Seu pedido <strong>#${order.displayId}</strong> foi confirmado!</p>
        <div style="background:#f6f6f7;border-radius:8px;padding:15px;margin:20px 0">
          <p style="margin:0 0 8px;font-weight:bold">Resumo:</p>
          ${itemsHtml}
          <p style="margin:8px 0 0;font-weight:bold;font-size:16px">Total: R$ ${(order.total / 100).toFixed(2).replace(".", ",")}</p>
        </div>
        <p>Você receberá o código de rastreio assim que o pedido for enviado.</p>
      `,
      shipped: `
        <p>Olá <strong>${address?.first_name || "Cliente"}</strong>,</p>
        <p>Seu pedido <strong>#${order.displayId}</strong> foi enviado!</p>
        <p>Acompanhe seu pedido em: <a href="${STORE_URL}/order-tracking">Rastrear Pedido</a></p>
      `,
      delivered: `
        <p>Olá <strong>${address?.first_name || "Cliente"}</strong>,</p>
        <p>Seu pedido <strong>#${order.displayId}</strong> foi entregue!</p>
        <p>Esperamos que você goste! <a href="${STORE_URL}">Avalie seus produtos</a></p>
      `,
    };

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Loja" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: subjects[type] || subjects.confirmation,
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
          <div style="background:#1e2d7d;color:#fff;padding:20px;text-align:center">
            <h1 style="margin:0;font-size:20px">Under Armour Brasil</h1>
          </div>
          <div style="padding:30px 20px">
            ${bodies[type] || bodies.confirmation}
          </div>
          <div style="background:#f6f6f7;padding:15px;text-align:center;font-size:12px;color:#888">
            Under Armour Brasil · Todos os direitos reservados
          </div>
        </div>
      `,
    });

    console.log(`[EMAIL] ${type} sent to ${customerEmail} for order #${order.displayId}`);
  } catch (err) {
    console.error("[EMAIL ERROR]", err.message);
  }
}

// ══════════════════════════════════════
// REVIEWS (must be before /store/products to avoid route conflict in Express 5)
// ══════════════════════════════════════
app.get("/store/products/:productId/reviews", async (req, res) => {
  try {
    const { limit = "20", offset = "0" } = req.query;
    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = Math.max(0, Number(offset) || 0);
    const where = { productId: req.params.productId, approved: true };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
      prisma.review.count({ where }),
    ]);

    const avgResult = await prisma.review.aggregate({ where, _avg: { rating: true } });
    const averageRating = avgResult._avg.rating ? Math.round(avgResult._avg.rating * 10) / 10 : 0;

    res.json({ reviews, total, averageRating, limit: take, offset: skip });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/store/products/:productId/reviews", reviewLimiter, validate(reviewSchema), async (req, res) => {
  try {
    const { rating, title: rawTitle, body: rawBody, author: rawAuthor, customerEmail: rawEmail, images, source, sourceUrl, originalDate } = req.body;
    if (!rating || !rawTitle || !rawBody || !rawAuthor) return res.status(400).json({ error: "All fields required" });

    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
    }

    if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const title = sanitizeHtml(String(rawTitle).slice(0, 200));
    const body = sanitizeHtml(String(rawBody).slice(0, 2000));
    const author = sanitizeHtml(String(rawAuthor).slice(0, 100));
    const customerEmail = rawEmail ? sanitizeHtml(String(rawEmail).slice(0, 254)) : null;

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: req.params.productId } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const review = await prisma.review.create({
      data: {
        rating: numRating, title, body, author, customerEmail,
        productId: req.params.productId,
        images: images && images.length > 0 ? JSON.stringify(images) : null,
        source: source || null, sourceUrl: sourceUrl || null, originalDate: originalDate || null,
        approved: false, verified: false,
      },
    });
    res.status(201).json({ review });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════
app.get("/store/products", async (req, res) => {
  try {
    const { handle, collection_id, limit = "20", offset = "0", q } = req.query;
    const where = {};
    if (handle) where.handle = handle;
    if (q) where.title = { contains: String(q) };
    if (collection_id) where.collections = { some: { collectionId: collection_id } };
    const [products, count] = await Promise.all([
      prisma.product.findMany({ where, include: productInclude, take: Number(limit), skip: Number(offset), orderBy: { createdAt: "desc" } }),
      prisma.product.count({ where }),
    ]);
    res.json({ products: products.map(formatProduct), count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/store/products/search", async (req, res) => {
  try {
    const { q } = req.body;
    if (!q) return res.json({ hits: [] });
    const products = await prisma.product.findMany({ where: { OR: [{ title: { contains: q } }, { description: { contains: q } }] }, include: productInclude });
    res.json({ hits: products.map(formatProduct) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /store/search?q=...&limit=8 — convenience search endpoint for autocomplete
app.get("/store/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(Number(req.query.limit) || 8, 50);
    if (!q) return res.json({ hits: [], count: 0 });
    const where = {
      OR: [
        { title: { contains: q } },
        { handle: { contains: q } },
        { description: { contains: q } },
      ],
    };
    const [products, count] = await Promise.all([
      prisma.product.findMany({ where, include: productInclude, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.product.count({ where }),
    ]);
    res.json({ hits: products.map(formatProduct), count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// COLLECTIONS
app.get("/store/collections", async (req, res) => {
  try {
    const { handle } = req.query;
    const where = handle ? { handle: String(handle) } : {};
    const collections = await prisma.collection.findMany({
      where,
      include: { products: { select: { productId: true } } },
    });
    res.json({
      collections: collections.map((c) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
        imageUrl: c.imageUrl || null,
        productCount: c.products.length,
      })),
      count: collections.length,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// SCRAPE PRODUCT (from admin panel — server-side)
// ══════════════════════════════════════
app.post("/admin/scrape-product", authenticateAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const https = require("https");
    const http = require("http");

    const fetchPage = (pageUrl) => new Promise((resolve, reject) => {
      const client = pageUrl.startsWith("https") ? https : http;
      client.get(pageUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "Accept-Language": "pt-BR,pt;q=0.9" },
        timeout: 15000,
      }, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          fetchPage(response.headers.location).then(resolve).catch(reject);
          return;
        }
        let data = "";
        response.on("data", (chunk) => data += chunk);
        response.on("end", () => resolve(data));
      }).on("error", reject);
    });

    const fetchJSON = (apiUrl) => new Promise((resolve, reject) => {
      https.get(apiUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        timeout: 10000,
      }, (response) => {
        let data = "";
        response.on("data", (chunk) => data += chunk);
        response.on("end", () => { try { resolve(JSON.parse(data)); } catch { reject(new Error("Invalid JSON")); } });
      }).on("error", reject);
    });

    let product = null;

    if (url.includes("mercadolivre.com.br")) {
      const html = await fetchPage(url);

      // Title
      const titleMatch = html.match(/<h1[^>]*class="ui-pdp-title"[^>]*>([^<]+)</);
      const title = titleMatch ? titleMatch[1].trim() : null;

      // Price — extract from meta or structured data
      const priceMatch = html.match(/"price":\s*(\d+\.?\d*)/);
      const price = priceMatch ? Math.round(parseFloat(priceMatch[1]) * 100) : null;

      // Original price (compare at)
      const origPriceMatch = html.match(/"original_price":\s*(\d+\.?\d*)/);
      const originalPrice = origPriceMatch ? Math.round(parseFloat(origPriceMatch[1]) * 100) : null;

      // Images — extract from ML's pictures JSON (most reliable)
      let finalImages = [];

      // Method 1: Build URLs from "pictures" array IDs (e.g. "id":"899536-MLA94969052452_102025")
      const picturesMatch = html.match(/"pictures":\s*\[([\s\S]*?)\]/);
      if (picturesMatch) {
        const idPattern = /"id":\s*"(\d+-ML[A-Z]?\d+_\d+)"/g;
        let picMatch;
        while ((picMatch = idPattern.exec(picturesMatch[1])) !== null) {
          // Build full-size URL from ID
          const imgId = picMatch[1];
          finalImages.push(`https://http2.mlstatic.com/D_NQ_NP_${imgId}-F.webp`);
        }
      }

      // Method 2: Fallback to regex on all page images
      if (finalImages.length === 0) {
        const imagePattern = /https:\/\/http2\.mlstatic\.com\/D_[A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp)/g;
        const allImages = [...new Set(html.match(imagePattern) || [])];

        const GENERIC_IDS = new Set(["MLA108503820943"]);
        const imageMap = new Map();
        for (const imgUrl of allImages) {
          const idMatch = imgUrl.match(/(ML[A-Z]?\d{8,})/);
          const baseId = idMatch ? idMatch[1] : imgUrl;
          if (GENERIC_IDS.has(baseId)) continue;
          if (imgUrl.includes('-G.')) continue;
          if (!imageMap.has(baseId)) {
            imageMap.set(baseId, imgUrl);
          } else {
            const current = imageMap.get(baseId);
            const score = (u) => (u.includes('2X') ? 4 : 0) + (u.includes('_NQ_') ? 2 : 0) + (u.includes('-F.') ? 1 : 0) + (u.includes('-OO.') ? 3 : 0);
            if (score(imgUrl) > score(current)) imageMap.set(baseId, imgUrl);
          }
        }
        finalImages = [...imageMap.values()];
      }

      finalImages = finalImages.slice(0, 10);

      // Description
      const descMatch = html.match(/<p[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
      let description = "";
      if (descMatch) {
        description = descMatch[1].replace(/<[^>]+>/g, "").trim();
      } else {
        const descAlt = html.match(/"short_description":\s*\{[^}]*"content":\s*"([^"]+)"/);
        if (descAlt) description = descAlt[1];
      }

      // Specs / attributes from JSON-LD or structured data
      const specs = [];
      const specPattern = /"name":\s*"([^"]+)",\s*"value_name":\s*"([^"]+)"/g;
      let sMatch;
      while ((sMatch = specPattern.exec(html)) !== null) {
        specs.push({ key: sMatch[1], value: sMatch[2] });
      }

      // Variations
      const variants = [];
      const varPattern = /"variations":\s*\[([\s\S]*?)\]/;
      const varMatch = html.match(varPattern);
      if (varMatch) {
        const varNamePattern = /"name":\s*"([^"]+)"/g;
        let vn;
        while ((vn = varNamePattern.exec(varMatch[1])) !== null) {
          if (!variants.some(v => v === vn[1])) variants.push(vn[1]);
        }
      }

      // Brand
      const brandMatch = html.match(/"brand":\s*"([^"]+)"/);
      const brand = brandMatch ? brandMatch[1] : specs.find(s => s.key === "Marca")?.value || "";

      product = {
        title,
        description: description.slice(0, 2000),
        price,
        originalPrice: originalPrice !== price ? originalPrice : null,
        images: finalImages,
        specs,
        brand,
        variantNames: variants,
        source: "mercadolivre",
        sourceUrl: url,
      };

    } else if (url.includes("shopee.com.br")) {
      // Support both formats: shopee.com.br/...i.SHOPID.ITEMID and shopee.com.br/product/SHOPID/ITEMID
      let shopeeMatch = url.match(/i\.(\d+)\.(\d+)/);
      if (!shopeeMatch) shopeeMatch = url.match(/product\/(\d+)\/(\d+)/);
      if (!shopeeMatch) return res.status(400).json({ error: "URL da Shopee inválida. Use o formato: shopee.com.br/product/SHOPID/ITEMID" });
      const [, shopId, itemId] = shopeeMatch;

      try {
        const apiUrl = `https://shopee.com.br/api/v2/item/get?itemid=${itemId}&shopid=${shopId}`;
        const data = await fetchJSON(apiUrl);
        const item = data?.item || data?.data;

        if (item) {
          const images = (item.images || []).map((img) => `https://cf.shopee.com.br/file/${img}`);

          // Variants/models
          const models = (item.models || []).map((m) => ({
            name: m.name,
            price: m.price ? Math.round(m.price / 1000) : (item.price ? Math.round(item.price / 1000) : 0),
            stock: m.stock || 0,
          }));

          // Tier variations (size, color etc)
          const tierVariations = (item.tier_variations || []).map((tv) => ({
            name: tv.name,
            options: tv.options || [],
          }));

          product = {
            title: item.name,
            description: (item.description || "").slice(0, 2000),
            price: item.price ? Math.round(item.price / 1000) : (item.price_min ? Math.round(item.price_min / 1000) : 0),
            originalPrice: item.price_before_discount ? Math.round(item.price_before_discount / 1000) : null,
            images,
            specs: (item.attributes || []).map((a) => ({ key: a.name, value: a.value })),
            brand: item.brand || "",
            variantNames: tierVariations.map((tv) => tv.name),
            variants: models,
            tierVariations,
            source: "shopee",
            sourceUrl: url,
            rating: item.item_rating?.rating_star,
            sold: item.sold || item.historical_sold,
          };
        }
      } catch (e) {
        // Shopee API may be blocked — try HTML scraping
        try {
          const html = await fetchPage(url);
          const titleMatch = html.match(/<title>([^|<]+)/);
          const title = titleMatch ? titleMatch[1].trim() : null;

          product = {
            title,
            description: "",
            price: null,
            originalPrice: null,
            images: [],
            specs: [],
            brand: "",
            variantNames: [],
            source: "shopee",
            sourceUrl: url,
            note: "Shopee bloqueou a API. Dados limitados — use a extensão Chrome para dados completos.",
          };
        } catch {
          return res.status(500).json({ error: "Não foi possível acessar o produto na Shopee. Use a extensão Chrome." });
        }
      }
    } else {
      return res.status(400).json({ error: "URL não suportada. Use Shopee ou Mercado Livre." });
    }

    if (!product || !product.title) {
      return res.status(400).json({ error: "Não foi possível extrair dados do produto." });
    }

    res.json({ product });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Import scraped product into store
app.post("/admin/import-product", authenticateAdmin, async (req, res) => {
  try {
    const { title, description, handle, price, originalPrice, images, specs, brand, variants, collectionIds, downloadImages } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    // Generate handle from title if not provided
    const productHandle = handle || title.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      .slice(0, 80);

    // Check if handle already exists
    const existing = await prisma.product.findUnique({ where: { handle: productHandle } });
    if (existing) return res.status(400).json({ error: `Produto com handle "${productHandle}" já existe.` });

    // Download images if requested
    const fs = require("fs");
    const pathModule = require("path");
    let savedImages = images || [];

    if (downloadImages && images?.length > 0) {
      const uploadsDir = pathModule.join(__dirname, "public", "uploads", "products");
      fs.mkdirSync(uploadsDir, { recursive: true });

      savedImages = [];
      for (const imgUrl of images.slice(0, 10)) {
        try {
          const localPath = await new Promise((resolve) => {
            const ext = pathModule.extname(new URL(imgUrl).pathname).split("?")[0] || ".jpg";
            const filename = `${productHandle}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}${ext}`;
            const filePath = pathModule.join(uploadsDir, filename);
            const client = imgUrl.startsWith("https") ? require("https") : require("http");
            const request = client.get(imgUrl, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 15000 }, (response) => {
              if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                resolve(response.headers.location); // skip redirects for now
                return;
              }
              if (response.statusCode !== 200) { resolve(null); return; }
              const stream = fs.createWriteStream(filePath);
              response.pipe(stream);
              stream.on("finish", () => resolve(`/uploads/products/${filename}`));
              stream.on("error", () => resolve(null));
            });
            request.on("error", () => resolve(null));
            request.on("timeout", () => { request.destroy(); resolve(null); });
          });
          if (localPath) savedImages.push(localPath);
        } catch { /* skip */ }
      }
    }

    // Create product with variants
    const productVariants = variants?.length > 0
      ? variants.map((v, i) => ({
          title: v.name || v.title || `Variante ${i + 1}`,
          sku: `${productHandle}-${i}`.toUpperCase().slice(0, 50),
          price: v.price || price || 0,
          compareAtPrice: originalPrice || null,
          inventoryQuantity: v.stock || v.inventoryQuantity || 50,
        }))
      : [{
          title: "Padrão",
          sku: productHandle.toUpperCase().slice(0, 50),
          price: price || 0,
          compareAtPrice: originalPrice || null,
          inventoryQuantity: 50,
        }];

    const product = await prisma.product.create({
      data: {
        title,
        description: description || "",
        handle: productHandle,
        thumbnail: savedImages[0] || images?.[0] || null,
        tags: brand ? JSON.stringify([brand]) : null,
        metaTitle: title,
        metaDescription: description?.slice(0, 160) || "",
        variants: { create: productVariants },
        images: { create: savedImages.map((url, i) => ({ url, position: i })) },
      },
      include: productInclude,
    });

    // Link to collections if specified
    if (collectionIds?.length > 0) {
      for (const colId of collectionIds) {
        await prisma.collectionProduct.create({ data: { productId: product.id, collectionId: colId } }).catch(() => {});
      }
    }

    notifyStorefrontRevalidate({ type: "product", handle: product.handle });

    res.json({ success: true, product: formatProduct(product) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SCRAPE REVIEWS (from admin panel — server-side)
app.post("/admin/scrape-reviews", authenticateAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const reviews = [];

    if (url.includes("mercadolivre.com.br")) {
      // ML: scrape HTML page directly (SSR content)
      const https = require("https");
      const fetchPage = (pageUrl) => new Promise((resolve, reject) => {
        https.get(pageUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Accept-Language": "pt-BR" },
          timeout: 15000,
        }, (response) => {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            fetchPage(response.headers.location).then(resolve).catch(reject);
            return;
          }
          let data = "";
          response.on("data", (chunk) => data += chunk);
          response.on("end", () => resolve(data));
        }).on("error", reject);
      });

      // Prefer ML public API — it returns structured review data with correct per-review photos
      const mlMatch = url.match(/MLB\d+/) || url.match(/p\/(MLB\d+)/);
      const mlId = mlMatch ? (mlMatch[1] || mlMatch[0]) : null;

      if (mlId) {
        try {
          for (let offset = 0; offset < 200; offset += 50) {
            const apiUrl = `https://api.mercadolibre.com/reviews/item/${mlId}?limit=50&offset=${offset}`;
            const apiData = await new Promise((resolve, reject) => {
              https.get(apiUrl, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 10000 }, (response) => {
                let data = "";
                response.on("data", (chunk) => data += chunk);
                response.on("end", () => { try { resolve(JSON.parse(data)); } catch { reject(new Error("Invalid JSON")); } });
              }).on("error", reject);
            });
            if (apiData.reviews && apiData.reviews.length > 0) {
              for (const r of apiData.reviews) {
                reviews.push({
                  rating: r.rate || 5,
                  content: r.content || "",
                  author: r.reviewer?.nickname || "Cliente Mercado Livre",
                  date: r.date_created ? new Date(r.date_created).toLocaleDateString("pt-BR") : "",
                  images: (r.photos || []).map((p) => p.url).filter(Boolean),
                });
              }
            }
            // Stop if we got fewer than requested (no more pages)
            if (!apiData.reviews || apiData.reviews.length < 50) break;
          }
        } catch {}
      }

      // Fallback: parse the SSR HTML directly. ML returns each review as
      // an <article data-testid="comment-component"> with rating, content
      // and a per-comment secondary carousel for the buyer's photos.
      if (reviews.length === 0) {
        try {
          const html = await fetchPage(url);

          // Split the document on each comment-component article opening
          // tag. A simple regex with a `</section>` end-anchor doesn't work
          // because the secondary carousel uses its own <section> elements
          // and would prematurely cut off each card.
          const parts = html.split(/(?=<article[^>]*data-testid="comment-component")/);
          const cards = parts.slice(1).map((part, idx, arr) => {
            // For the last card, trim at the end of the comments section
            // so we don't drag in unrelated DOM (related products, footer).
            if (idx !== arr.length - 1) return part;
            const endMarkers = [
              part.indexOf('data-testid="comments-pagination"'),
              part.indexOf('ui-review-capability-comments__paging'),
              part.indexOf('</section>'),
            ].filter((i) => i > 0);
            const cut = endMarkers.length ? Math.min(...endMarkers) : part.length;
            return part.slice(0, cut);
          });

          const decode = (s) => s
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&nbsp;/g, " ");

          for (const card of cards) {
            // Rating: scope to the rating block to avoid matching the
            // carousel thumb-rating ("Avaliação 4 de 5" inside the photo).
            let rating = 5;
            const ratingBlock = card.match(/comment__rating(?:-container)?[\s\S]*?<\/div>/);
            const ratingMatch = (ratingBlock?.[0] || card).match(/Avaliação\s*(\d)\s*de\s*5/);
            if (ratingMatch) rating = parseInt(ratingMatch[1], 10);

            // Date
            const dateMatch = card.match(/comment__date[^>]*>([^<]+)</);
            const date = dateMatch ? dateMatch[1].trim() : "";

            // Title
            const titleMatch = card.match(/comment__title[^>]*>([^<]+)</);
            const title = titleMatch ? decode(titleMatch[1].trim()) : "";

            // Content (comment text)
            const contentMatch = card.match(/data-testid="comment-content-component"[^>]*>([\s\S]*?)<\/p>/);
            let content = "";
            if (contentMatch) {
              content = decode(contentMatch[1].replace(/<[^>]+>/g, "").trim());
            }

            // Images: only the secondary (per-comment) carousel. Anchor at
            // </article> instead of </section> because the Andes carousel
            // uses nested sections.
            const images = [];
            const secMatch = card.match(/comment__carousel--secondary[\s\S]*?(?=<\/article|$)/);
            if (secMatch) {
              const imgRegex = /<img[^>]*ui-review-capability-carousel__img[^>]*\bsrc="([^"]+)"/g;
              let m;
              while ((m = imgRegex.exec(secMatch[0])) !== null) {
                let src = m[1];
                if (!src.includes("mlstatic.com")) continue;
                src = src
                  .replace(/D_NQ_NP_(?!2X_)/, "D_NQ_NP_2X_")
                  .replace(/\?.*$/, "");
                if (!images.includes(src)) images.push(src);
              }
            }

            if (!content && images.length === 0 && !title) continue;

            reviews.push({
              rating,
              content,
              title,
              author: "Cliente Mercado Livre",
              date,
              images,
            });
          }
        } catch (e) {
          return res.status(500).json({ error: `Erro ao acessar Mercado Livre: ${e.message}` });
        }
      }
    } else if (url.includes("shopee.com.br")) {
      // Shopee: extract shop_id and item_id from URL (both formats)
      let shopeeMatch = url.match(/i\.(\d+)\.(\d+)/);
      if (!shopeeMatch) shopeeMatch = url.match(/product\/(\d+)\/(\d+)/);
      if (!shopeeMatch) return res.status(400).json({ error: "URL da Shopee inválida — deve ser uma página de produto" });

      const [, shopId, itemId] = shopeeMatch;
      const https = require("https");

      const fetchShopee = (apiUrl) => new Promise((resolve, reject) => {
        https.get(apiUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://shopee.com.br/",
            "Accept": "application/json",
          },
          timeout: 15000,
        }, (response) => {
          let data = "";
          response.on("data", (chunk) => data += chunk);
          response.on("end", () => {
            try { resolve(JSON.parse(data)); } catch { reject(new Error("Invalid JSON from Shopee")); }
          });
        }).on("error", reject);
      });

      try {
        // Shopee ratings API
        for (let offset = 0; offset < 200; offset += 20) {
          const apiUrl = `https://shopee.com.br/api/v2/item/get_ratings?filter=0&flag=1&itemid=${itemId}&limit=20&offset=${offset}&shopid=${shopId}&type=0`;
          const shopeeData = await fetchShopee(apiUrl);

          if (!shopeeData.data?.ratings || shopeeData.data.ratings.length === 0) break;

          for (const r of shopeeData.data.ratings) {
            const images = (r.images || []).map((img) => `https://cf.shopee.com.br/file/${img}`);
            const videos = (r.videos || []).map((v) => v.url).filter(Boolean);

            reviews.push({
              rating: r.rating_star || 5,
              content: r.comment || "",
              author: r.author_username || "Cliente Shopee",
              date: r.ctime ? new Date(r.ctime * 1000).toLocaleDateString("pt-BR") : "",
              images: [...images, ...videos.map((v) => v)],
            });
          }
        }
      } catch (e) {
        // Shopee API might be blocked — return what we have or error
        if (reviews.length === 0) {
          return res.status(500).json({
            error: "Shopee bloqueou a requisição. Use a extensão Chrome para importar reviews da Shopee.",
            tip: "A extensão Chrome funciona porque usa seu navegador autenticado.",
          });
        }
      }
    } else {
      return res.status(400).json({ error: "URL não suportada. Use Shopee (shopee.com.br) ou Mercado Livre (mercadolivre.com.br)" });
    }

    res.json({
      reviews,
      total: reviews.length,
      photosTotal: reviews.reduce((s, r) => s + (r.images?.length || 0), 0),
      source: url.includes("shopee") ? "shopee" : "mercadolivre",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// LIST all reviews (admin)
app.get("/admin/reviews", authenticateAdmin, async (req, res) => {
  try {
    const { limit = "50", offset = "0", productId, approved } = req.query;
    const take = Math.min(200, Math.max(1, Number(limit) || 50));
    const skip = Math.max(0, Number(offset) || 0);
    const where = {};
    if (productId) where.productId = String(productId);
    if (approved === "true") where.approved = true;
    if (approved === "false") where.approved = false;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { product: { select: { id: true, title: true, handle: true } } },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.review.count({ where }),
    ]);

    res.json({ reviews, total, limit: take, offset: skip });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// APPROVE / update review (admin)
app.patch("/admin/reviews/:id", authenticateAdmin, async (req, res) => {
  try {
    const { approved, verified } = req.body;
    const data = {};
    if (typeof approved === "boolean") data.approved = approved;
    if (typeof verified === "boolean") data.verified = verified;
    if (Object.keys(data).length === 0) return res.status(400).json({ error: "No valid fields to update" });

    const review = await prisma.review.update({ where: { id: req.params.id }, data });
    res.json({ review });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE review
app.delete("/admin/reviews/:id", authenticateAdmin, async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// IMPORT REVIEWS (from Chrome extension)
app.post("/admin/import-reviews", authenticateAdmin, async (req, res) => {
  try {
    const { rating, title, body, author, images, source, sourceUrl, originalDate, productId } = req.body;
    if (!rating || !title || !body) return res.status(400).json({ error: "Rating, title and body required" });

    // If no productId, assign to first product
    let targetProductId = productId;
    if (!targetProductId) {
      const firstProduct = await prisma.product.findFirst();
      if (!firstProduct) return res.status(400).json({ error: "No products in database" });
      targetProductId = firstProduct.id;
    }

    const review = await prisma.review.create({
      data: {
        rating: Math.min(5, Math.max(1, Number(rating))),
        title: String(title).slice(0, 200),
        body: String(body).slice(0, 2000),
        author: String(author || "Cliente").slice(0, 100),
        images: images && images.length > 0 ? JSON.stringify(images) : null,
        source: source || null,
        sourceUrl: sourceUrl || null,
        originalDate: originalDate || null,
        productId: targetProductId,
        approved: true,
      },
    });
    res.json({ success: true, review: { id: review.id } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Bulk import with optional image download
app.post("/admin/import-reviews/bulk", authenticateAdmin, async (req, res) => {
  try {
    const { reviews, productId, downloadImages } = req.body;
    if (!Array.isArray(reviews)) return res.status(400).json({ error: "reviews must be an array" });

    let targetProductId = productId;
    if (!targetProductId) {
      const firstProduct = await prisma.product.findFirst();
      if (!firstProduct) return res.status(400).json({ error: "No products in database" });
      targetProductId = firstProduct.id;
    }

    const fs = require("fs");
    const path = require("path");
    const https = require("https");
    const http = require("http");
    const uploadsDir = path.join(__dirname, "public", "uploads", "reviews");
    if (downloadImages) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Download a single image, returns local path or null
    async function downloadImage(url) {
      return new Promise((resolve) => {
        try {
          const ext = path.extname(new URL(url).pathname).split("?")[0] || ".jpg";
          const filename = `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
          const filePath = path.join(uploadsDir, filename);
          const client = url.startsWith("https") ? https : http;

          const request = client.get(url, { timeout: 10000, headers: { "User-Agent": "Mozilla/5.0" } }, (response) => {
            // Follow redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
              downloadImage(response.headers.location).then(resolve);
              return;
            }
            if (response.statusCode !== 200) { resolve(null); return; }

            const stream = fs.createWriteStream(filePath);
            response.pipe(stream);
            stream.on("finish", () => resolve(`/uploads/reviews/${filename}`));
            stream.on("error", () => resolve(null));
          });
          request.on("error", () => resolve(null));
          request.on("timeout", () => { request.destroy(); resolve(null); });
        } catch { resolve(null); }
      });
    }

    let imported = 0;
    let photosSaved = 0;

    for (const r of reviews) {
      try {
        let savedImages = [];

        // Download images if requested
        if (downloadImages && r.images && r.images.length > 0) {
          const downloadPromises = r.images.slice(0, 10).map((url) => downloadImage(url));
          const results = await Promise.all(downloadPromises);
          savedImages = results.filter(Boolean);
          photosSaved += savedImages.length;
        } else if (r.images && r.images.length > 0) {
          savedImages = r.images;
        }

        await prisma.review.create({
          data: {
            rating: Math.min(5, Math.max(1, Number(r.rating || 5))),
            title: String(r.title || r.content?.slice(0, 60) || `Avaliação ${r.rating} estrelas`).slice(0, 200),
            body: String(r.body || r.content || "Avaliação importada").slice(0, 2000),
            author: String(r.author || "Cliente").slice(0, 100),
            images: savedImages.length > 0 ? JSON.stringify(savedImages) : null,
            source: r.source || null,
            sourceUrl: r.sourceUrl || null,
            originalDate: r.originalDate || r.date || null,
            productId: targetProductId,
            approved: true,
          },
        });
        imported++;
      } catch { /* skip individual failures */ }
    }

    res.json({ success: true, imported, total: reviews.length, photosSaved });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// CART
app.post("/store/carts", async (req, res) => {
  try {
    // If customer logged in, attach their email + customerId for abandoned cart recovery
    const data = {};
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        jwt.verify(authHeader.slice(7), JWT_SECRET);
        const session = await prisma.session.findUnique({
          where: { token: authHeader.slice(7) },
          include: { customer: { select: { id: true, email: true } } },
        });
        if (session && session.expiresAt > new Date() && session.customer) {
          data.customerId = session.customer.id;
          data.email = session.customer.email;
        }
      } catch { /* invalid token → anonymous cart */ }
    }
    const cart = await prisma.cart.create({ data, include: cartInclude });
    res.json({ cart: formatCart(cart) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/store/carts/:id", async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { id: req.params.id }, include: cartInclude });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.json({ cart: formatCart(cart) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/store/carts/:id", async (req, res) => {
  try {
    const data = {};
    if (req.body.shipping_address) data.shippingAddress = JSON.stringify(req.body.shipping_address);
    if (req.body.billing_address) data.billingAddress = JSON.stringify(req.body.billing_address);
    if (req.body.email && typeof req.body.email === "string") data.email = req.body.email.trim().toLowerCase();
    const cart = await prisma.cart.update({ where: { id: req.params.id }, data, include: cartInclude });
    res.json({ cart: formatCart(cart) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/store/carts/:id/line-items", validate(cartLineItemSchema), async (req, res) => {
  try {
    const { variant_id, quantity = 1 } = req.body;

    // Pre-validate the variant + cart exist so we return clean 4xx errors
    // instead of leaking Prisma FK constraint stack traces.
    const [variantExists, cartExists] = await Promise.all([
      prisma.variant.findUnique({ where: { id: variant_id }, select: { id: true } }),
      prisma.cart.findUnique({ where: { id: req.params.id }, select: { id: true } }),
    ]);
    if (!cartExists) {
      return res.status(404).json({ error: "Cart not found", code: "cart_not_found" });
    }
    if (!variantExists) {
      return res.status(400).json({
        error: "Produto indisponível",
        code: "variant_not_found",
        details: "Esta variante não existe mais. Atualize a página e tente novamente.",
      });
    }

    const existing = await prisma.cartItem.findUnique({ where: { cartId_variantId: { cartId: req.params.id, variantId: variant_id } } });
    if (existing) { await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } }); }
    else { await prisma.cartItem.create({ data: { cartId: req.params.id, variantId: variant_id, quantity } }); }
    const cart = await prisma.cart.findUnique({ where: { id: req.params.id }, include: cartInclude });
    res.json({ cart: formatCart(cart) });
  } catch (e) {
    console.error("[CART LINE-ITEMS]", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/store/carts/:id/line-items/:itemId", async (req, res) => {
  try {
    await prisma.cartItem.update({ where: { id: req.params.itemId }, data: { quantity: req.body.quantity } });
    const cart = await prisma.cart.findUnique({ where: { id: req.params.id }, include: cartInclude });
    res.json({ cart: formatCart(cart) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/store/carts/:id/line-items/:itemId", async (req, res) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    const cart = await prisma.cart.findUnique({ where: { id: req.params.id }, include: cartInclude });
    res.json({ cart: formatCart(cart) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/store/shipping-options/:cartId", async (req, res) => {
  try {
    const dbOptions = await prisma.shippingOption.findMany({ where: { active: true } });
    if (dbOptions.length > 0) {
      res.json({ shipping_options: dbOptions.map((o) => ({ id: o.id, name: o.name, amount: o.price, minDays: o.minDays, maxDays: o.maxDays })) });
    } else {
      // Fallback defaults
      res.json({ shipping_options: [{ id: "so_free", name: "Frete Grátis", amount: 0 }, { id: "so_standard", name: "Frete Padrão", amount: 1990 }] });
    }
  } catch { res.json({ shipping_options: [{ id: "so_free", name: "Frete Grátis", amount: 0 }, { id: "so_standard", name: "Frete Padrão", amount: 1990 }] }); }
});

app.post("/store/carts/:id/shipping-methods", async (req, res) => {
  try {
    const amount = req.body.option_id === "so_free" ? 0 : 1990;
    const cart = await prisma.cart.update({ where: { id: req.params.id }, data: { shippingTotal: amount, shippingMethod: req.body.option_id }, include: cartInclude });
    res.json({ cart: formatCart(cart) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/store/carts/:id/payment-sessions", async (req, res) => {
  try { const cart = await prisma.cart.findUnique({ where: { id: req.params.id }, include: cartInclude }); res.json({ cart: formatCart(cart) }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/store/carts/:id/complete", async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { id: req.params.id }, include: cartInclude });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    const formatted = formatCart(cart);
    const orderCount = await prisma.order.count();
    const order = await prisma.order.create({
      data: {
        displayId: orderCount + 1001, total: formatted.total, subtotal: formatted.subtotal,
        shippingTotal: formatted.shipping_total, shippingAddress: cart.shippingAddress, customerId: cart.customerId,
        items: { create: formatted.items.map((item) => ({ title: `${item.title} - ${item.description}`, quantity: item.quantity, unitPrice: item.unit_price, total: item.total, variantId: item.variant?.id })) },
      },
    });
    // Decrement inventory for each variant
    for (const item of cart.items) {
      if (item.variantId) {
        await prisma.variant.update({
          where: { id: item.variantId },
          data: { inventoryQuantity: { decrement: item.quantity } },
        }).catch(() => {}); // skip if variant not found
      }
    }

    // Increment coupon usage if used
    if (cart.couponCode) {
      await prisma.coupon.update({ where: { code: cart.couponCode }, data: { usedCount: { increment: 1 } } }).catch(() => {});
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.delete({ where: { id: cart.id } });

    // Auto-generate tracking code + auto-advance schedule
    const prefixes = ["NX", "NB", "JT", "SQ", "OJ", "PM", "QA", "RR", "SS", "LB"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const digits = String(Math.floor(Math.random() * 900000000) + 100000000);
    const trackingCode = `${prefix}${digits}BR`;

    const now = new Date();
    const trackingEvents = [
      { status: "posted", date: now.toISOString(), location: "Centro de Distribuição - São Paulo, SP", description: "Objeto postado" },
    ];

    const schedule = { confirmed: 0, processing: 1, shipped: 2, in_transit: 1, out_for_delivery: 3, delivered: 1 };
    let accDays = 0;
    const timeline = [];
    for (const [status, days] of Object.entries(schedule)) {
      accDays += days;
      timeline.push({ status, days, scheduledDate: new Date(now.getTime() + accDays * 86400000).toISOString() });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "confirmed",
        paymentStatus: "captured",
        tags: JSON.stringify({
          tracking: { code: trackingCode, events: trackingEvents, carrier: "Correios" },
          autoAdvance: { enabled: true, schedule, timeline, startedAt: now.toISOString() },
        }),
      },
    });

    res.json({ type: "order", data: { id: order.id, display_id: order.displayId, status: "confirmed", total: order.total, trackingCode } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// AUTH
app.post("/store/customers", signupLimiter, validate(customerSignupSchema), async (req, res) => {
  try {
    const { first_name: rawFirstName, last_name: rawLastName, email: rawEmail, password } = req.body;
    if (!rawEmail || !password || !rawFirstName || !rawLastName) return res.status(400).json({ error: "All fields required" });
    const first_name = sanitizeHtml(rawFirstName);
    const last_name = sanitizeHtml(rawLastName);
    const email = sanitizeHtml(rawEmail);
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 12);
    const customer = await prisma.customer.create({ data: { email, passwordHash, firstName: first_name, lastName: last_name } });
    const token = jwt.sign({ customerId: customer.id, nonce: Math.random().toString(36).slice(2) }, JWT_SECRET, { expiresIn: "7d" });
    await prisma.session.create({ data: { token, customerId: customer.id, expiresAt: new Date(Date.now() + 7 * 86400000) } });
    res.json({ customer: { id: customer.id, first_name: customer.firstName, last_name: customer.lastName, email: customer.email }, token });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/store/auth", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ customerId: customer.id, nonce: Math.random().toString(36).slice(2) }, JWT_SECRET, { expiresIn: "7d" });
    // Clean old sessions, create new
    await prisma.session.deleteMany({ where: { customerId: customer.id, token: { not: { startsWith: "reset_" } } } }).catch(() => {});
    await prisma.session.create({ data: { token, customerId: customer.id, expiresAt: new Date(Date.now() + 7 * 86400000) } });
    res.json({ customer: { id: customer.id, first_name: customer.firstName, last_name: customer.lastName, email: customer.email }, token });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/store/auth/logout", authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization.slice(7);
    await prisma.session.delete({ where: { token } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/store/customers/me", authenticate, (req, res) => {
  res.json({ customer: { id: req.customer.id, first_name: req.customer.firstName, last_name: req.customer.lastName, email: req.customer.email } });
});

app.get("/store/customers/me/orders", authenticate, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ where: { customerId: req.customer.id }, include: { items: true }, orderBy: { createdAt: "desc" } });
    res.json({ orders: orders.map((o) => ({ ...o, created_at: o.createdAt.toISOString(), fulfillment_status: o.fulfillmentStatus })), count: orders.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/store/customers/me/addresses", authenticate, async (req, res) => {
  try { const addresses = await prisma.address.findMany({ where: { customerId: req.customer.id } }); res.json({ addresses }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/store/customers/me/addresses", authenticate, validate(addressSchema), async (req, res) => {
  try {
    // Normalize snake_case → camelCase so both input styles work
    const b = req.body;
    const firstName = b.firstName || b.first_name;
    const lastName = b.lastName || b.last_name;
    const address1 = b.address1 || b.address_1;
    const address2 = b.address2 || b.address_2;
    const postalCode = b.postalCode || b.postal_code;
    const { city, province, phone, isDefault } = b;
    if (!address1 || !city || !province || !postalCode) return res.status(400).json({ error: "Address fields required" });
    if (isDefault) await prisma.address.updateMany({ where: { customerId: req.customer.id }, data: { isDefault: false } });
    const address = await prisma.address.create({ data: { firstName: firstName || req.customer.firstName, lastName: lastName || req.customer.lastName, address1, address2, city, province, postalCode, phone, isDefault: !!isDefault, customerId: req.customer.id } });
    res.json({ address });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/store/customers/me/addresses/:id", authenticate, async (req, res) => {
  try { await prisma.address.delete({ where: { id: req.params.id, customerId: req.customer.id } }); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Wishlist endpoints (per customer, JSON-string array of product ids)
const parseWishlist = (raw) => {
  if (!raw) return [];
  try { const arr = JSON.parse(raw); return Array.isArray(arr) ? arr : []; }
  catch { return []; }
};

app.get("/store/customers/me/wishlist", authenticate, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.customer.id }, select: { wishlist: true } });
    res.json({ wishlist: parseWishlist(customer?.wishlist) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/store/customers/me/wishlist", authenticate, async (req, res) => {
  try {
    const { product_id } = req.body || {};
    if (!product_id || typeof product_id !== "string") return res.status(400).json({ error: "product_id required" });
    const customer = await prisma.customer.findUnique({ where: { id: req.customer.id }, select: { wishlist: true } });
    const list = parseWishlist(customer?.wishlist);
    if (!list.includes(product_id)) list.push(product_id);
    await prisma.customer.update({ where: { id: req.customer.id }, data: { wishlist: JSON.stringify(list) } });
    res.json({ wishlist: list });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/store/customers/me/wishlist/:productId", authenticate, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.customer.id }, select: { wishlist: true } });
    const list = parseWishlist(customer?.wishlist).filter((id) => id !== req.params.productId);
    await prisma.customer.update({ where: { id: req.customer.id }, data: { wishlist: JSON.stringify(list) } });
    res.json({ wishlist: list });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Bulk merge — for syncing localStorage on login
app.post("/store/customers/me/wishlist/sync", authenticate, async (req, res) => {
  try {
    const { product_ids } = req.body || {};
    if (!Array.isArray(product_ids)) return res.status(400).json({ error: "product_ids must be array" });
    const customer = await prisma.customer.findUnique({ where: { id: req.customer.id }, select: { wishlist: true } });
    const existing = parseWishlist(customer?.wishlist);
    const merged = Array.from(new Set([...existing, ...product_ids.filter((x) => typeof x === "string")]));
    await prisma.customer.update({ where: { id: req.customer.id }, data: { wishlist: JSON.stringify(merged) } });
    res.json({ wishlist: merged });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUBLIC — Get single order by displayId (safe, no auth required, limited fields)
app.get("/store/orders/:displayId", async (req, res) => {
  try {
    const displayId = parseInt(req.params.displayId);
    if (isNaN(displayId)) return res.status(400).json({ error: "Invalid order ID" });
    const order = await prisma.order.findFirst({
      where: { displayId },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    // Return only safe fields (no customer email, no internal IDs)
    res.json({
      order: {
        displayId: order.displayId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        total: order.total,
        subtotal: order.subtotal,
        shippingTotal: order.shippingTotal,
        discountTotal: order.discountTotal,
        createdAt: order.createdAt,
        items: order.items.map((i) => ({ title: i.title, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total })),
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
        tags: order.tags ? (() => { try { return JSON.parse(order.tags); } catch { return null; } })() : null,
      },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// NEWSLETTER & CONTACT
app.post("/store/newsletter", writeLimiter, validate(newsletterSchema), async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    if (!rawEmail) return res.status(400).json({ error: "Email required" });
    const email = sanitizeHtml(rawEmail);
    await prisma.newsletterSubscriber.upsert({ where: { email }, create: { email }, update: {} });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/store/contact", writeLimiter, validate(contactSchema), async (req, res) => {
  try {
    const { name: rawName, email: rawEmail, message: rawMessage } = req.body;
    if (!rawName || !rawEmail || !rawMessage) return res.status(400).json({ error: "All fields required" });
    const name = sanitizeHtml(rawName);
    const email = sanitizeHtml(rawEmail);
    const message = sanitizeHtml(rawMessage);
    await prisma.contactMessage.create({ data: { name, email, message } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ADMIN — Products CRUD
// ══════════════════════════════════════
app.get("/admin/products", authenticateAdmin, async (req, res) => {
  try { const products = await prisma.product.findMany({ include: productInclude, orderBy: { createdAt: "desc" } }); res.json({ products: products.map(formatProduct), count: products.length }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/admin/products", authenticateAdmin, async (req, res) => {
  try {
    const { title, description, handle, thumbnail, videoUrl, weight, productType, isFeatured, tags, metaTitle, metaDescription, lunaCheckoutUrl, skipCart, options, variants, images, collectionIds } = req.body;
    if (!title || !handle) return res.status(400).json({ error: "Title and handle required" });
    const product = await prisma.product.create({
      data: {
        title, description, handle, thumbnail, videoUrl, weight: weight || 0,
        productType: productType || "physical", isFeatured: !!isFeatured,
        tags: tags ? JSON.stringify(tags) : null,
        metaTitle, metaDescription,
        lunaCheckoutUrl: lunaCheckoutUrl || null,
        skipCart: skipCart === true,
        options: options ? { create: options.map((o) => ({ title: o.title, values: { create: (o.values || []).map((v) => ({ value: v })) } })) } : undefined,
        variants: variants ? { create: variants.map((v) => ({ title: v.title, sku: v.sku, barcode: v.barcode, price: v.price, compareAtPrice: v.compareAtPrice, inventoryQuantity: v.inventoryQuantity || 0 })) } : undefined,
        images: images ? { create: images.map((img, i) => ({ url: img.url || img, altText: img.altText, position: i })) } : undefined,
      },
      include: productInclude,
    });
    // Link to collections
    if (collectionIds?.length > 0) {
      for (const colId of collectionIds) {
        await prisma.collectionProduct.create({ data: { productId: product.id, collectionId: colId } }).catch(() => {});
      }
    }
    notifyStorefrontRevalidate({ type: "product", handle: product.handle });
    res.json({ product: formatProduct(product) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { title, description, thumbnail, videoUrl, weight, productType, isFeatured, tags, metaTitle, metaDescription, lunaCheckoutUrl, skipCart } = req.body;
    const data = { title, description, thumbnail, videoUrl, weight, productType, isFeatured, tags: tags ? JSON.stringify(tags) : undefined, metaTitle, metaDescription };
    if (lunaCheckoutUrl !== undefined) data.lunaCheckoutUrl = lunaCheckoutUrl || null;
    if (skipCart !== undefined) data.skipCart = skipCart === true;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: productInclude,
    });
    notifyStorefrontRevalidate({ type: "product", handle: product.handle });
    res.json({ product: formatProduct(product) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const prod = await prisma.product.findUnique({ where: { id: req.params.id }, select: { handle: true } }).catch(() => null);
    await prisma.product.delete({ where: { id: req.params.id } });
    notifyStorefrontRevalidate({ type: "product", handle: prod?.handle });
    res.json({ success: true });
  }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Update individual variant (price, stock, SKU)
app.put("/admin/products/:productId/variants/:variantId", authenticateAdmin, async (req, res) => {
  try {
    const { price, compareAtPrice, inventoryQuantity, sku } = req.body;
    const data = {};
    if (price !== undefined) data.price = Number(price);
    if (compareAtPrice !== undefined) data.compareAtPrice = compareAtPrice ? Number(compareAtPrice) : null;
    if (inventoryQuantity !== undefined) data.inventoryQuantity = Number(inventoryQuantity);
    if (sku !== undefined) data.sku = sku || null;
    const variant = await prisma.variant.update({ where: { id: req.params.variantId }, data });
    res.json({ variant });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ADMIN — Collections CRUD
app.post("/admin/collections", authenticateAdmin, async (req, res) => {
  try {
    const { title, handle, imageUrl } = req.body;
    if (!title || !handle) return res.status(400).json({ error: "Title and handle required" });
    const existing = await prisma.collection.findUnique({ where: { handle } });
    if (existing) return res.status(400).json({ error: `Coleção com handle "${handle}" já existe` });
    const col = await prisma.collection.create({ data: { title, handle, imageUrl } });
    res.json({ collection: col });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/admin/collections/:id", authenticateAdmin, async (req, res) => {
  try {
    const { title, imageUrl } = req.body;
    const col = await prisma.collection.update({ where: { id: req.params.id }, data: { title, imageUrl } });
    res.json({ collection: col });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/admin/collections/:id", authenticateAdmin, async (req, res) => {
  try {
    await prisma.collectionProduct.deleteMany({ where: { collectionId: req.params.id } });
    await prisma.collection.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ADMIN — Orders Management
// ══════════════════════════════════════
app.get("/admin/orders", authenticateAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ include: { items: true, customer: true }, orderBy: { createdAt: "desc" } });
    res.json({ orders, count: orders.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Generate fake tracking code
app.post("/admin/orders/:id/tracking", authenticateAdmin, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    // Generate realistic Brazilian tracking code (Correios format: XX123456789BR)
    const prefixes = ["NX", "NB", "JT", "SQ", "OJ", "PM", "QA", "RR", "SS", "LB"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const digits = String(Math.floor(Math.random() * 900000000) + 100000000);
    const trackingCode = `${prefix}${digits}BR`;

    // Build tracking events timeline
    const now = new Date();
    const events = [
      { status: "posted", date: new Date(now.getTime() - 5 * 86400000).toISOString(), location: "Centro de Distribuição - São Paulo, SP", description: "Objeto postado" },
      { status: "in_transit", date: new Date(now.getTime() - 3 * 86400000).toISOString(), location: "Unidade de Tratamento - Barueri, SP", description: "Objeto em trânsito - por favor aguarde" },
      { status: "in_transit", date: new Date(now.getTime() - 2 * 86400000).toISOString(), location: "Unidade de Tratamento - Curitiba, PR", description: "Objeto em trânsito - por favor aguarde" },
      { status: "out_for_delivery", date: new Date(now.getTime() - 1 * 86400000).toISOString(), location: "Unidade de Distribuição - Destino, XX", description: "Objeto saiu para entrega ao destinatário" },
    ];

    // Save tracking to order tags
    const existingTags = order.tags ? JSON.parse(order.tags) : {};
    const updatedTags = { ...existingTags, tracking: { code: trackingCode, events, carrier: "Correios" } };

    await prisma.order.update({
      where: { id: req.params.id },
      data: {
        tags: JSON.stringify(updatedTags),
        fulfillmentStatus: "shipped",
      },
    });

    res.json({ trackingCode, events });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Auto-advance order status with configurable days per step
app.post("/admin/orders/:id/auto-advance", authenticateAdmin, async (req, res) => {
  try {
    const { schedule } = req.body;
    // Default schedule: days to wait before advancing to each status
    const defaultSchedule = {
      confirmed: 0,     // instant
      processing: 1,    // 1 day after confirmed
      shipped: 2,       // 2 days after processing
      in_transit: 1,    // 1 day after shipped
      out_for_delivery: 3, // 3 days after in_transit
      delivered: 1,     // 1 day after out_for_delivery
    };
    const sched = { ...defaultSchedule, ...(schedule || {}) };

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    // Calculate future dates for each status
    const baseDate = new Date();
    let accumulatedDays = 0;
    const timeline = [];

    for (const [status, days] of Object.entries(sched)) {
      accumulatedDays += days;
      const scheduledDate = new Date(baseDate.getTime() + accumulatedDays * 86400000);
      timeline.push({ status, days, scheduledDate: scheduledDate.toISOString() });
    }

    // Save schedule to order tags
    const existingTags = order.tags ? JSON.parse(order.tags) : {};
    const updatedTags = { ...existingTags, autoAdvance: { enabled: true, schedule: sched, timeline, startedAt: baseDate.toISOString() } };

    // Set initial status to confirmed
    await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: "confirmed",
        paymentStatus: "captured",
        tags: JSON.stringify(updatedTags),
      },
    });

    res.json({ success: true, timeline });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Process auto-advance for all orders (call periodically or via cron)
app.post("/admin/orders/process-auto-advance", authenticateAdmin, async (req, res) => {
  try {
    // Only auto-advance confirmed/completed orders — never abandoned/cancelled/pending
    const orders = await prisma.order.findMany({ where: { status: { in: ["confirmed", "completed", "processing", "shipped", "in_transit", "out_for_delivery"] } } });
    let advanced = 0;

    for (const order of orders) {
      if (!order.tags) continue;
      const tags = JSON.parse(order.tags);
      if (!tags.autoAdvance?.enabled) continue;

      const { timeline } = tags.autoAdvance;
      const now = new Date();

      // Find the latest status that should be active based on scheduled dates
      let newStatus = order.status;
      let newFulfillment = order.fulfillmentStatus;

      const statusToFulfillment = {
        confirmed: "not_fulfilled",
        processing: "not_fulfilled",
        shipped: "shipped",
        in_transit: "shipped",
        out_for_delivery: "shipped",
        delivered: "fulfilled",
      };

      for (const step of timeline) {
        if (new Date(step.scheduledDate) <= now) {
          newStatus = step.status;
          newFulfillment = statusToFulfillment[step.status] || order.fulfillmentStatus;
        }
      }

      if (newStatus !== order.status) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: newStatus, fulfillmentStatus: newFulfillment },
        });
        advanced++;
      }
    }

    res.json({ processed: orders.length, advanced });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/admin/orders/:id", authenticateAdmin, async (req, res) => {
  try {
    const { status, fulfillmentStatus, paymentStatus, tags } = req.body;
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status, fulfillmentStatus, paymentStatus, tags: tags ? JSON.stringify(tags) : undefined } });
    res.json({ order });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ADMIN — Customers
// ══════════════════════════════════════
app.get("/admin/customers", authenticateAdmin, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({ include: { orders: { select: { id: true, total: true } }, _count: { select: { orders: true } } }, orderBy: { createdAt: "desc" } });
    res.json({ customers, count: customers.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/admin/customers/:id/tags", authenticateAdmin, async (req, res) => {
  try {
    const { tags } = req.body;
    const customer = await prisma.customer.update({ where: { id: req.params.id }, data: { tags: JSON.stringify(tags) } });
    res.json({ customer });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ADMIN — Dashboard / Analytics
// ══════════════════════════════════════
app.get("/admin/stats", authenticateAdmin, async (req, res) => {
  try {
    // Only count confirmed/completed orders as real revenue
    const realOrderFilter = { status: { in: ["confirmed", "completed"] } };

    const [totalProducts, totalAllOrders, totalConfirmedOrders, totalCustomers, totalRevenue, recentOrders, topProducts, abandonedCarts] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: realOrderFilter }),
      prisma.customer.count(),
      prisma.order.aggregate({ where: realOrderFilter, _sum: { total: true } }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { items: true } }),
      prisma.orderItem.groupBy({
        by: ["title"],
        where: { order: { is: realOrderFilter } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
      prisma.cart.count({ where: { updatedAt: { lt: new Date(Date.now() - 3600000) } } }), // carts older than 1h
    ]);

    // Orders by day (last 30 days) — only confirmed/completed
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const ordersByDay = await prisma.order.findMany({ where: { createdAt: { gte: thirtyDaysAgo }, ...realOrderFilter }, select: { createdAt: true, total: true } });

    const dailyStats = {};
    ordersByDay.forEach((o) => {
      const day = o.createdAt.toISOString().split("T")[0];
      if (!dailyStats[day]) dailyStats[day] = { orders: 0, revenue: 0 };
      dailyStats[day].orders++;
      dailyStats[day].revenue += o.total;
    });

    res.json({
      totalProducts,
      totalOrders: totalConfirmedOrders,
      totalAllOrders,
      totalCustomers,
      totalRevenue: totalRevenue._sum.total || 0,
      averageOrderValue: totalConfirmedOrders > 0 ? Math.round((totalRevenue._sum.total || 0) / totalConfirmedOrders) : 0,
      abandonedCarts,
      recentOrders: recentOrders.map((o) => ({ id: o.id, displayId: o.displayId, total: o.total, status: o.status, createdAt: o.createdAt, itemCount: o.items.length })),
      topProducts: topProducts.map((t) => ({ title: t.title, soldCount: t._sum.quantity, revenue: t._sum.total })),
      dailyStats,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ADMIN — Coupons
// ══════════════════════════════════════
app.get("/admin/coupons", authenticateAdmin, async (req, res) => {
  try { const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }); res.json({ coupons }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/admin/coupons", authenticateAdmin, async (req, res) => {
  try {
    const { code, type, value, minOrderAmount, maxUses, expiresAt } = req.body;
    if (!code || !value) return res.status(400).json({ error: "Code and value required" });
    const coupon = await prisma.coupon.create({ data: { code: code.toUpperCase(), type: type || "percentage", value, minOrderAmount, maxUses, expiresAt: expiresAt ? new Date(expiresAt) : null } });
    res.json({ coupon });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/admin/coupons/:id", authenticateAdmin, async (req, res) => {
  try { await prisma.coupon.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Apply coupon to cart
app.post("/store/carts/:id/apply-coupon", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Coupon code required" });

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.active) return res.status(400).json({ error: "Cupom inválido" });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ error: "Cupom expirado" });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: "Cupom esgotado" });

    const cart = await prisma.cart.findUnique({ where: { id: req.params.id }, include: cartInclude });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const formatted = formatCart(cart);
    if (coupon.minOrderAmount && formatted.subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ error: `Valor mínimo: R$ ${(coupon.minOrderAmount / 100).toFixed(2)}` });
    }

    const discount = coupon.type === "percentage"
      ? Math.round(formatted.subtotal * coupon.value / 100)
      : Math.min(coupon.value, formatted.subtotal);

    const updated = await prisma.cart.update({ where: { id: req.params.id }, data: { discountTotal: discount, couponCode: code.toUpperCase() }, include: cartInclude });
    res.json({ cart: formatCart(updated), discount, couponCode: code.toUpperCase() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ADMIN — Shipping Options (configurable)
// ══════════════════════════════════════
app.get("/admin/shipping-options", authenticateAdmin, async (req, res) => {
  try { const options = await prisma.shippingOption.findMany(); res.json({ shipping_options: options }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/admin/shipping-options", authenticateAdmin, async (req, res) => {
  try {
    const { name, price, minDays, maxDays } = req.body;
    if (!name || price === undefined) return res.status(400).json({ error: "Name and price required" });
    const option = await prisma.shippingOption.create({ data: { name, price, minDays: minDays || 3, maxDays: maxDays || 10 } });
    res.json({ option });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/admin/shipping-options/:id", authenticateAdmin, async (req, res) => {
  try { await prisma.shippingOption.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ADMIN — URL Redirects
// ══════════════════════════════════════
app.get("/admin/redirects", authenticateAdmin, async (req, res) => {
  try { const redirects = await prisma.redirect.findMany(); res.json({ redirects }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/admin/redirects", authenticateAdmin, async (req, res) => {
  try {
    const { fromPath, toPath } = req.body;
    if (!fromPath || !toPath) return res.status(400).json({ error: "fromPath and toPath required" });
    const redirect = await prisma.redirect.create({ data: { fromPath, toPath } });
    res.json({ redirect });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/admin/redirects/:id", authenticateAdmin, async (req, res) => {
  try { await prisma.redirect.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ADMIN — Abandoned Carts
// ══════════════════════════════════════
app.get("/admin/abandoned-carts", authenticateAdmin, async (req, res) => {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const [carts, lunaAbandoned] = await Promise.all([
      prisma.cart.findMany({ where: { updatedAt: { lt: oneHourAgo }, items: { some: {} } }, include: cartInclude, orderBy: { updatedAt: "desc" } }),
      prisma.order.findMany({ where: { status: "abandoned" }, include: { items: true, customer: true }, orderBy: { createdAt: "desc" }, take: 200 }),
    ]);
    // Normalize Luna abandoned orders into the same shape as carts so the
    // admin UI can render both lists together.
    const lunaCarts = lunaAbandoned.map((o) => ({
      id: o.id,
      source: "luna",
      email: o.customer?.email || null,
      total: o.total,
      shipping_total: 0,
      discount_total: 0,
      items: o.items.map((it) => ({
        id: it.id,
        title: it.title,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        total: it.total,
        thumbnail: null,
        variant: { id: "", title: "" },
      })),
      created_at: o.createdAt,
      updated_at: o.createdAt,
      luna_event: o.tags ? (() => { try { return JSON.parse(o.tags).lunaEvent; } catch { return null; } })() : null,
    }));
    const all = [...carts.map(formatCart), ...lunaCarts];
    res.json({ carts: all, count: all.length, local_count: carts.length, luna_count: lunaCarts.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// SENTINEL TRACKING — incoming webhook
// ══════════════════════════════════════

// Sentinel posts conversion events here. Secret is part of the URL path
// (rotated from admin panel) so user can paste into Sentinel dashboard.
app.post("/webhooks/sentinel/:secret", async (req, res) => {
  try {
    // Integration gate — match the admin UI's `isSentinelActive` definition
    // (storefront2/src/components/admin/tabs/IntegrationsTab.tsx) which
    // requires BOTH SENTINEL_API_KEY and SENTINEL_WEBHOOK_SECRET. Clearing
    // either key in the admin disables the integration and we must reject
    // incoming webhooks (no attribution writes to Order tags).
    const apiKey = await getSetting("SENTINEL_API_KEY");
    const expected = await getSetting("SENTINEL_WEBHOOK_SECRET");
    if (!apiKey || !expected) {
      console.warn("[SENTINEL WEBHOOK] rejected: integration disabled (api_key or webhook_secret missing)");
      return res.status(503).json({ error: "Sentinel integration is disabled" });
    }
    if (req.params.secret !== expected) {
      console.warn("[SENTINEL WEBHOOK] Invalid secret attempted");
      return res.status(401).json({ error: "Invalid webhook secret" });
    }

    const { event, data } = req.body || {};
    if (!event) return res.status(400).json({ error: "Missing event field" });

    console.log("[SENTINEL WEBHOOK]", JSON.stringify({
      ts: new Date().toISOString(),
      event,
      data,
    }));

    // Handle known events
    switch (event) {
      case "purchase":
      case "conversion": {
        // Mark order as attributed — store attribution in order.tags (existing field)
        if (data?.order_id) {
          try {
            const existing = await prisma.order.findUnique({ where: { id: data.order_id }, select: { tags: true } });
            const tags = existing?.tags ? JSON.parse(existing.tags) : {};
            tags.sentinel_attribution = data;
            tags.attributed_at = new Date().toISOString();
            await prisma.order.update({
              where: { id: data.order_id },
              data: { tags: JSON.stringify(tags) },
            }).catch(() => {});
          } catch { /* ignore */ }
        }
        break;
      }
      case "refund":
        console.log("[SENTINEL WEBHOOK] Refund tracked");
        break;
      case "lead":
      case "subscribe":
        console.log("[SENTINEL WEBHOOK] Lead tracked");
        break;
      default:
        console.log(`[SENTINEL WEBHOOK] Unknown event: ${event}`);
    }

    res.status(202).json({ received: true, event });
  } catch (e) {
    console.error("[SENTINEL WEBHOOK]", e);
    res.status(500).json({ error: "Internal error" });
  }
});

// GET version — simple health check / "is the webhook reachable?" test from admin
app.get("/webhooks/sentinel/:secret/ping", async (req, res) => {
  const expected = await getSetting("SENTINEL_WEBHOOK_SECRET");
  if (!expected) return res.status(503).json({ ok: false, reason: "not_configured" });
  if (req.params.secret !== expected) return res.status(401).json({ ok: false, reason: "invalid_secret" });
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Admin — generate/rotate Sentinel webhook secret + return current config
app.get("/admin/sentinel/config", authenticateAdmin, async (req, res) => {
  const secret = await getSetting("SENTINEL_WEBHOOK_SECRET");
  const apiKey = await getSetting("SENTINEL_API_KEY");
  res.json({
    secret: secret || null,
    api_key: apiKey || null,
    webhook_base: `${req.protocol}://${req.get("host")}/webhooks/sentinel`,
    configured: !!secret,
  });
});

// Admin — rotate secret (persisted to DB)
app.post("/admin/sentinel/rotate-secret", authenticateAdmin, async (req, res) => {
  try {
    const crypto = require("crypto");
    const newSecret = crypto.randomBytes(24).toString("hex");
    await setSetting("SENTINEL_WEBHOOK_SECRET", newSecret);
    res.json({
      secret: newSecret,
      webhook_url: `${req.protocol}://${req.get("host")}/webhooks/sentinel/${newSecret}`,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// SETTINGS API — generic admin config store
// ══════════════════════════════════════

// GET all settings — secrets are masked unless ?reveal=1 passed
app.get("/admin/settings", authenticateAdmin, async (req, res) => {
  try {
    const reveal = req.query.reveal === "1";
    const rows = await getAllSettings();
    const masked = rows.map((r) => ({
      key: r.key,
      value: r.isSecret && !reveal ? maskSecret(String(r.value)) : r.value,
      isSecret: r.isSecret,
      updatedAt: r.updatedAt,
    }));
    res.json({ settings: masked });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT bulk update { key: value, key2: value2, ... }
app.put("/admin/settings", authenticateAdmin, async (req, res) => {
  try {
    const updates = req.body || {};
    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      if (FORBIDDEN_SETTING_KEYS.has(key)) {
        results.push({ key, status: "forbidden" });
        continue;
      }
      // Empty string/null removes the setting
      if (value === null || value === "") {
        await deleteSetting(key);
        results.push({ key, status: "deleted" });
      } else {
        await setSetting(key, value);
        results.push({ key, status: "updated" });
      }
    }
    res.json({ results });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUBLIC — client-safe settings subset (for SSR layout)
app.get("/store/public-config", async (req, res) => {
  try {
    const config = {};
    for (const key of PUBLIC_SETTING_KEYS) {
      const v = await getSetting(key);
      if (v !== null && v !== undefined) config[key] = v;
    }
    // Cache for 1 minute at edge/CDN
    res.set("Cache-Control", "public, max-age=60, s-maxage=60");
    res.json(config);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public — frontend Web Vitals sink
app.post("/store/web-vitals", async (req, res) => {
  try {
    const { name, value, rating, url, navigationType, timestamp } = req.body || {};
    if (!name) return res.status(400).json({ error: "name required" });
    console.log("[WEB-VITALS]", JSON.stringify({
      ts: timestamp || Date.now(),
      name, value, rating, url, navigationType,
    }));
    res.status(202).json({ received: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public — frontend error tracking sink (lightweight Sentry alternative)
app.post("/store/errors", writeLimiter, async (req, res) => {
  try {
    const { message, stack, url, user_agent, user_id, extra, timestamp } = req.body || {};
    if (!message) return res.status(400).json({ error: "message required" });
    // Log to console (production: pipe to file/Sentry/CloudWatch)
    console.error("[FE-ERROR]", JSON.stringify({
      ts: timestamp || new Date().toISOString(),
      msg: String(message).slice(0, 500),
      url, user_agent, user_id,
      stack: stack ? String(stack).slice(0, 2000) : undefined,
      extra,
    }));
    res.status(202).json({ received: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public — frontend AbandonedCartDetector calls this on inactivity / beforeunload
app.post("/store/carts/:id/mark-abandoned", async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { id: req.params.id } });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    // Touch metadata so admin can list it; reason kept in metadata JSON
    const meta = JSON.parse(cart.metadata || "{}");
    meta.abandoned_at = new Date().toISOString();
    meta.abandon_reason = req.body?.reason || "unknown";
    await prisma.cart.update({ where: { id: cart.id }, data: { metadata: JSON.stringify(meta) } });
    res.status(202).json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Cron-friendly cleanup — purge expired sessions and old anonymous empty carts
app.post("/admin/cleanup", authenticateAdmin, async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

    const expiredSessions = await prisma.session.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    // Old anonymous carts with no items (abandoned shopping starts that never converted)
    const oldEmptyCarts = await prisma.cart.deleteMany({
      where: {
        updatedAt: { lt: sevenDaysAgo },
        customerId: null,
        items: { none: {} },
      },
    });

    res.json({
      sessions_purged: expiredSessions.count,
      empty_carts_purged: oldEmptyCarts.count,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Cron-friendly endpoint — call hourly from cron-job.org / Vercel Cron
// Sends recovery emails for carts abandoned 2-24h ago that don't have recovery_sent flag
app.post("/admin/abandoned-carts/send-recovery", authenticateAdmin, async (req, res) => {
  try {
    const now = Date.now();
    const carts = await prisma.cart.findMany({
      where: {
        updatedAt: { gte: new Date(now - 24 * 3600_000), lt: new Date(now - 2 * 3600_000) },
        items: { some: {} },
        email: { not: null },
      },
      include: cartInclude,
    });

    const RECOVERY_COUPON = process.env.ABANDONED_CART_COUPON || "VOLTEI10";
    const sent = [];
    const skipped = [];

    for (const cart of carts) {
      const meta = JSON.parse(cart.metadata || "{}");
      if (meta.recovery_sent) { skipped.push(cart.id); continue; }
      // TODO: integrar com provider de email (SendGrid/Resend/SMTP)
      console.log(`[ABANDONED-CART] Would send recovery to ${cart.email} for cart ${cart.id} with coupon ${RECOVERY_COUPON}`);
      meta.recovery_sent = new Date().toISOString();
      meta.recovery_coupon = RECOVERY_COUPON;
      await prisma.cart.update({ where: { id: cart.id }, data: { metadata: JSON.stringify(meta) } });
      sent.push({ id: cart.id, email: cart.email });
    }

    res.json({ sent_count: sent.length, skipped_count: skipped.length, sent });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// SENTINEL — server-to-server bridge
// ══════════════════════════════════════
// Forwards an event to the Sentinel ingest API. Best-effort: never throws,
// never blocks the caller, always logs the outcome. Used by the Luna webhook
// handler so off-site checkout conversions still hit the Sentinel pipeline.
async function forwardToSentinel(event, payload) {
  try {
    const apiKey = await getSetting("SENTINEL_API_KEY");
    if (!apiKey) {
      console.log(`[SENTINEL→] skipped ${event}: SENTINEL_API_KEY not configured`);
      return { skipped: true, reason: "no_api_key" };
    }
    const ingestUrl =
      (await getSetting("SENTINEL_INGEST_URL")) ||
      process.env.SENTINEL_INGEST_URL ||
      "https://api.specterfilter.com/sentinel-bff/api/events";

    // Match the exact payload shape the client SDK sends — observed from
    // a real tracker.js request. The Specterfilter API expects these
    // top-level fields and rejects payloads that use alternative names.
    const eventId = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `ev_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Extract visitor_id and attribution (UTM/click_id/etc) from payload
    // if the caller provided them. Otherwise leave empty.
    const { visitor_id, utm, ...customData } = payload || {};
    const attribution = {};
    if (utm && typeof utm === "object") {
      for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "click_id", "pixel_id", "gclid", "fbclid", "ttclid"]) {
        if (utm[k]) attribution[k] = utm[k];
      }
    }

    const body = JSON.stringify({
      api_key: apiKey,
      visitor_id: visitor_id || null,
      event_name: event,
      event_id: eventId,
      timestamp: new Date().toISOString(),
      attribution,
      custom_data: customData,
    });

    const response = await fetch(ingestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    }).catch((e) => ({ ok: false, status: 0, statusText: String(e).slice(0, 100) }));

    if (!response.ok) {
      let detail = "";
      try {
        detail = typeof response.text === "function" ? (await response.text()).slice(0, 200) : "";
      } catch { /* ignore */ }
      console.warn(`[SENTINEL→] ${event} failed: ${response.status} ${response.statusText} ${detail}`);
      return { sent: false, status: response.status };
    }
    console.log(`[SENTINEL→] ${event} forwarded ok`);
    return { sent: true };
  } catch (e) {
    console.error("[SENTINEL→] forward error:", e.message);
    return { sent: false, error: e.message };
  }
}

// Public — storefront proxies client-side Sentinel events here so we can
// add the API key server-side without exposing it to the browser.
const ALLOWED_SENTINEL_EVENTS = new Set([
  "page_view",
  "add_to_cart",
  "init_checkout",
  "purchase",
  "lead",
]);
app.post("/store/sentinel/events", async (req, res) => {
  try {
    const { event, data, ts, url: pageUrl } = req.body || {};
    if (!event) {
      return res.status(400).json({ error: "Missing event field" });
    }
    if (!ALLOWED_SENTINEL_EVENTS.has(event)) {
      console.warn(`[STOREFRONT SENTINEL] ignored unknown event '${event}'`);
      return res.json({ received: true, ignored: true });
    }
    const visitorId = req.headers["x-visitor-id"] || null;
    const userAgent = req.headers["user-agent"] || null;
    const referer = req.headers.referer || pageUrl || null;

    // Fire-and-forget: ack the client immediately so the pageload isn't
    // blocked on Sentinel latency.
    forwardToSentinel(event, {
      source: "storefront_client",
      ts: ts || new Date().toISOString(),
      visitor_id: visitorId,
      user_agent: userAgent,
      referer,
      url: pageUrl,
      ...(data || {}),
    }).catch(() => {});

    res.json({ received: true });
  } catch (e) {
    console.error("[STOREFRONT SENTINEL]", e.message);
    res.status(500).json({ error: "Internal error" });
  }
});

// ══════════════════════════════════════
// LUNA CHECKOUT WEBHOOKS
// ══════════════════════════════════════

// Receive Luna Checkout webhook events
// Luna webhook health check — used by the admin "Test connection" button
app.get("/webhooks/luna/ping", async (req, res) => {
  const secret = await getSetting("LUNA_WEBHOOK_SECRET");
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    signature_required: !!secret,
    accepted_events: [
      "sale_pending", "sale_waiting_payment", "sale_approved", "sale_refused",
      "sale_chargeback", "sale_refunded", "sale_cancelled",
      "sale_cart_abandoned", "sale_cart_recovered",
      "tracking_posted", "tracking_in_transit", "tracking_out_for_delivery",
      "tracking_delivered", "tracking_cancelled", "tracking_returned",
    ],
  });
});

app.post("/webhooks/luna", async (req, res) => {
  try {
    // Integration gate — match the admin UI's `isLunaActive` definition
    // (storefront2/src/components/admin/tabs/IntegrationsTab.tsx). When the
    // admin clears LUNA_CHECKOUT_URL the integration is considered disabled
    // and we must NOT process incoming webhooks: no Order rows, no inventory
    // changes, no Sentinel bridge calls. Return 503 so Luna's retry/visibility
    // semantics treat it as "endpoint unavailable" rather than a 4xx bug.
    const LUNA_CHECKOUT_URL = await getSetting("LUNA_CHECKOUT_URL");
    if (!LUNA_CHECKOUT_URL) {
      console.warn("[LUNA WEBHOOK] rejected: integration disabled (LUNA_CHECKOUT_URL not set)");
      return res.status(503).json({ error: "Luna integration is disabled" });
    }

    // Optional webhook signature validation. The secret can come from the
    // admin Settings page (preferred) or fall back to the LUNA_WEBHOOK_SECRET
    // env var. When empty, signatures are not enforced (dev / Luna doesn't
    // sign yet).
    const LUNA_WEBHOOK_SECRET = await getSetting("LUNA_WEBHOOK_SECRET");
    if (LUNA_WEBHOOK_SECRET) {
      const signature = req.headers["x-luna-signature"] || req.headers["x-webhook-signature"];
      if (!signature) {
        console.warn("[LUNA WEBHOOK] Missing signature header");
        return res.status(401).json({ error: "Missing webhook signature" });
      }
      const crypto = require("crypto");
      const expected = crypto.createHmac("sha256", LUNA_WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest("hex");
      if (signature !== expected) {
        console.warn("[LUNA WEBHOOK] Invalid signature");
        return res.status(401).json({ error: "Invalid webhook signature" });
      }
    }

    const { id, event, client, address, items, amount, method, status, payment, tracking, checkout_url, utm } = req.body;

    if (!event) return res.status(400).json({ error: "Missing event field" });

    console.log(`[LUNA WEBHOOK] ${event} | Order: ${id} | Amount: ${amount} | Method: ${method} | Status: ${status}`);

    // ── Sentinel bridge: the Sentinel API only recognizes the 4 standard
    // ecommerce events (page_view, add_to_cart, init_checkout, purchase)
    // plus `lead`. For Luna we only fire `purchase` on a successful sale;
    // other Luna events are logged but not forwarded (they'd be rejected
    // or land as noise in the Sentinel panel).
    const isPurchaseEvent = event === "sale_approved" || event === "sale_cart_recovered";
    if (isPurchaseEvent && amount) {
      // Sentinel expects items[] with id/name/price/quantity. Keep the
      // keys minimal per the docs examples.
      const itemsForSentinel = (items || []).map((item) => ({
        id: item.id || item.sku || item.name,
        name: item.name,
        quantity: item.quantity || 1,
        price: Number(item.price || 0),
      }));

      // The visitor_id was appended to the Luna URL by
      // Sentinel.redirectWithTracking on the storefront; try to recover
      // it from Luna's utm payload or the checkout_url query string.
      let visitorId = null;
      try {
        if (utm && typeof utm === "object" && utm.visitor_id) visitorId = utm.visitor_id;
        if (!visitorId && checkout_url) {
          const u = new URL(checkout_url);
          visitorId = u.searchParams.get("visitor_id");
        }
      } catch { /* ignore parse errors */ }

      forwardToSentinel("purchase", {
        order_id: id,
        value: Number(amount || 0),
        currency: "BRL",
        items: itemsForSentinel,
        customer: client
          ? {
              name: client.name || null,
              email: client.email || null,
              phone: client.phone || null,
            }
          : undefined,
        payment_method: method || null,
        visitor_id: visitorId,
        utm: utm || null,
        source: "luna_webhook",
      }).catch(() => {});
    }

    // ── Sale events ──
    if (event.startsWith("sale_")) {
      // Find or create customer
      let customerId = null;
      if (client?.email) {
        let customer = await prisma.customer.findUnique({ where: { email: client.email } });
        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              email: client.email,
              firstName: client.name?.split(" ")[0] || "Cliente",
              lastName: client.name?.split(" ").slice(1).join(" ") || "Luna",
              phone: client.phone || null,
              passwordHash: "$luna$no-password",
            },
          });
        }
        customerId = customer.id;
      }

      // Map Luna status to our status
      const statusMap = {
        sale_approved: { status: "confirmed", payment: "captured", fulfillment: "not_fulfilled" },
        sale_pending: { status: "pending", payment: "awaiting", fulfillment: "not_fulfilled" },
        sale_waiting_payment: { status: "pending", payment: "awaiting", fulfillment: "not_fulfilled" },
        sale_refused: { status: "cancelled", payment: "failed", fulfillment: "not_fulfilled" },
        sale_chargeback: { status: "cancelled", payment: "chargeback", fulfillment: "not_fulfilled" },
        sale_refunded: { status: "cancelled", payment: "refunded", fulfillment: "not_fulfilled" },
        sale_cancelled: { status: "cancelled", payment: "failed", fulfillment: "not_fulfilled" },
        sale_cart_abandoned: { status: "abandoned", payment: "awaiting", fulfillment: "not_fulfilled" },
        sale_cart_recovered: { status: "confirmed", payment: "captured", fulfillment: "not_fulfilled" },
      };
      const mapped = statusMap[event] || { status: "pending", payment: "awaiting", fulfillment: "not_fulfilled" };

      // Serialize address
      const shippingAddress = address ? JSON.stringify({
        first_name: client?.name?.split(" ")[0] || "",
        last_name: client?.name?.split(" ").slice(1).join(" ") || "",
        address_1: `${address.street}, ${address.number}`,
        address_2: address.complement || "",
        city: address.city,
        province: address.state,
        postal_code: address.zipcode,
        country_code: "BR",
        phone: client?.phone || "",
      }) : null;

      // Check if order already exists (by luna ID)
      const existingOrder = await prisma.order.findFirst({ where: { stripePaymentId: `luna_${id}` } });

      if (existingOrder) {
        // Update existing order
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: { status: mapped.status, paymentStatus: mapped.payment, fulfillmentStatus: mapped.fulfillment },
        });

        // If approved, decrement inventory
        if (event === "sale_approved" || event === "sale_cart_recovered") {
          const orderItems = await prisma.orderItem.findMany({ where: { orderId: existingOrder.id } });
          for (const item of orderItems) {
            if (item.variantId) {
              await prisma.variant.update({ where: { id: item.variantId }, data: { inventoryQuantity: { decrement: item.quantity } } }).catch(() => {});
            }
          }
        }
      } else {
        // Create new order. We DO create rows for sale_cart_abandoned so the
        // /admin/abandoned-carts endpoint can surface them and the recovery
        // job can email the customer.
        const orderCount = await prisma.order.count();

        // Map Luna items to our order items. Luna sometimes sends
        // numeric fields as strings ("1", "99.75") — coerce to Int/Float
        // before handing to Prisma or it throws PrismaClientValidationError.
        const orderItems = (items || []).map((item) => {
          const qty = parseInt(item.quantity, 10) || 1;
          const price = parseFloat(item.price) || 0;
          return {
            title: `${item.name}${item.variant ? ` - ${item.variant}` : ""}`,
            quantity: qty,
            unitPrice: Math.round(price * 100),
            total: Math.round(price * qty * 100),
          };
        });

        const newOrder = await prisma.order.create({
          data: {
            displayId: orderCount + 1001,
            status: mapped.status,
            paymentStatus: mapped.payment,
            fulfillmentStatus: mapped.fulfillment,
            total: Math.round((amount || 0) * 100),
            subtotal: Math.round((amount || 0) * 100),
            shippingAddress,
            stripePaymentId: `luna_${id}`,
            customerId,
            tags: JSON.stringify({ lunaEvent: event, method, checkout_url, utm }),
            items: { create: orderItems },
          },
        });

        // Auto-generate tracking + auto-advance for new orders
        if (mapped.status === "confirmed") {
          const tPrefixes = ["NX", "NB", "JT", "SQ", "OJ", "PM"];
          const tPrefix = tPrefixes[Math.floor(Math.random() * tPrefixes.length)];
          const tDigits = String(Math.floor(Math.random() * 900000000) + 100000000);
          const tCode = `${tPrefix}${tDigits}BR`;
          const tNow = new Date();
          const tSchedule = { confirmed: 0, processing: 1, shipped: 2, in_transit: 1, out_for_delivery: 3, delivered: 1 };
          let tAcc = 0;
          const tTimeline = Object.entries(tSchedule).map(([s, d]) => { tAcc += d; return { status: s, days: d, scheduledDate: new Date(tNow.getTime() + tAcc * 86400000).toISOString() }; });

          await prisma.order.update({
            where: { id: newOrder.id },
            data: {
              tags: JSON.stringify({
                lunaEvent: event, method, checkout_url, utm,
                tracking: { code: tCode, events: [{ status: "posted", date: tNow.toISOString(), location: "Centro de Distribuição - São Paulo, SP", description: "Objeto postado" }], carrier: "Correios" },
                autoAdvance: { enabled: true, schedule: tSchedule, timeline: tTimeline, startedAt: tNow.toISOString() },
              }),
            },
          });
        }

        // After order creation, if approved send confirmation email
        if (event === "sale_approved" || event === "sale_cart_recovered") {
          const fullOrder = await prisma.order.findUnique({ where: { id: newOrder.id }, include: { items: true, customer: true } });
          if (fullOrder) sendOrderEmail(fullOrder, "confirmation");
        }
      }

      if (event === "sale_cart_abandoned" && client?.email) {
        console.log(`[LUNA] Cart abandoned saved: ${client.email} | ${amount} | Items: ${items?.length}`);
      }
    }

    // ── Tracking events ──
    if (event.startsWith("tracking_")) {
      const order = await prisma.order.findFirst({ where: { stripePaymentId: `luna_${id}` } });
      if (order) {
        const fulfillmentMap = {
          tracking_posted: "shipped",
          tracking_in_transit: "shipped",
          tracking_out_for_delivery: "shipped",
          tracking_delivered: "fulfilled",
          tracking_cancelled: "cancelled",
          tracking_returned: "returned",
        };

        await prisma.order.update({
          where: { id: order.id },
          data: {
            fulfillmentStatus: fulfillmentMap[event] || order.fulfillmentStatus,
            tags: JSON.stringify({
              ...(order.tags ? JSON.parse(order.tags) : {}),
              tracking: tracking || null,
              lastTrackingEvent: event,
            }),
          },
        });

        // Send tracking emails
        if (event === "tracking_delivered") {
          const fullOrder = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true, customer: true } });
          if (fullOrder) sendOrderEmail(fullOrder, "delivered");
        }
        if (event === "tracking_posted" || event === "tracking_in_transit") {
          const fullOrder = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true, customer: true } });
          if (fullOrder) sendOrderEmail(fullOrder, "shipped");
        }
      }
    }

    res.json({ received: true, event, id });
  } catch (e) {
    console.error("[LUNA WEBHOOK ERROR]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Password Reset ──
app.post("/store/auth/reset-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const customer = await prisma.customer.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!customer) return res.json({ success: true });

    // Generate reset token (valid 1 hour)
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Store token in session table with special prefix
    await prisma.session.create({
      data: {
        token: `reset_${resetToken}`,
        customerId: customer.id,
        expiresAt,
      },
    });

    // Send email if SMTP configured
    if (process.env.SMTP_HOST) {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      const resetUrl = `${STORE_URL}/account/reset-password?token=${resetToken}`;
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Loja" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Redefinir sua senha",
        html: `
          <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
            <div style="background:#1e2d7d;color:#fff;padding:20px;text-align:center">
              <h1 style="margin:0;font-size:20px">Redefinir Senha</h1>
            </div>
            <div style="padding:30px 20px">
              <p>Olá <strong>${customer.firstName}</strong>,</p>
              <p>Você solicitou a redefinição da sua senha. Clique no botão abaixo:</p>
              <a href="${resetUrl}" style="display:inline-block;background:#1e2d7d;color:#fff;padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:bold;margin:20px 0">Redefinir Senha</a>
              <p style="font-size:13px;color:#666">Este link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
            </div>
          </div>
        `,
      }).catch((err) => console.error("[EMAIL ERROR]", err.message));
    }

    console.log(`[PASSWORD RESET] Token generated for ${email}`);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Confirm password reset
app.post("/store/auth/reset-password/confirm", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "Token and new password required" });
    if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const session = await prisma.session.findUnique({ where: { token: `reset_${token}` }, include: { customer: true } });
    if (!session || session.expiresAt < new Date()) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.customer.update({ where: { id: session.customerId }, data: { passwordHash } });

    // Delete the reset token
    await prisma.session.delete({ where: { id: session.id } });

    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ADMIN — Reset Store Data
// ══════════════════════════════════════
app.post("/admin/reset-data", authenticateAdmin, async (req, res) => {
  try {
    const { targets } = req.body; // e.g. ["orders", "customers", "carts", "reviews", "all"]
    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({ error: "Informe quais dados apagar: orders, customers, carts, reviews, newsletters, coupons, all" });
    }

    const all = targets.includes("all");
    const deleted = {};

    // Order matters: delete children before parents
    if (all || targets.includes("orders")) {
      const items = await prisma.orderItem.deleteMany({});
      const orders = await prisma.order.deleteMany({});
      deleted.orderItems = items.count;
      deleted.orders = orders.count;
    }

    if (all || targets.includes("carts")) {
      const cartItems = await prisma.cartItem.deleteMany({});
      const carts = await prisma.cart.deleteMany({});
      deleted.cartItems = cartItems.count;
      deleted.carts = carts.count;
    }

    if (all || targets.includes("customers")) {
      // Orders/carts reference customers — delete those first if not already deleted
      if (!all && !targets.includes("orders")) {
        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});
        deleted.orders = "cleared (dependency)";
      }
      if (!all && !targets.includes("carts")) {
        await prisma.cartItem.deleteMany({});
        await prisma.cart.deleteMany({});
        deleted.carts = "cleared (dependency)";
      }
      const customers = await prisma.customer.deleteMany({});
      deleted.customers = customers.count;
    }

    if (all || targets.includes("reviews")) {
      const reviews = await prisma.review.deleteMany({});
      deleted.reviews = reviews.count;
    }

    if (all || targets.includes("newsletters")) {
      const newsletters = await prisma.newsletterSubscriber.deleteMany({});
      deleted.newsletters = newsletters.count;
    }

    if (all || targets.includes("coupons")) {
      const coupons = await prisma.coupon.deleteMany({});
      deleted.coupons = coupons.count;
    }

    if (all || targets.includes("products")) {
      // Products have variants, images, orderItems, cartItems, reviews
      await prisma.orderItem.deleteMany({});
      await prisma.cartItem.deleteMany({});
      await prisma.review.deleteMany({});
      const variants = await prisma.variant.deleteMany({});
      const images = await prisma.productImage.deleteMany({});
      const products = await prisma.product.deleteMany({});
      deleted.variants = variants.count;
      deleted.images = images.count;
      deleted.products = products.count;
    }

    console.log("[ADMIN RESET]", JSON.stringify({ targets, deleted, at: new Date().toISOString() }));
    res.json({ success: true, deleted });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// HEALTH
app.get("/health", async (req, res) => {
  try {
    const [products, orders] = await Promise.all([prisma.product.count(), prisma.order.count()]);
    res.json({ status: "ok", db: "connected", products, orders, uptime: process.uptime() });
  } catch (e) { res.status(500).json({ status: "error", db: "disconnected", error: e.message }); }
});

// ══════════════════════════════════════
// AUTO-MIGRATE — runs `prisma db push` when schema drifts
// ══════════════════════════════════════
async function ensureDbSchema() {
  // Opt-out: AUTO_MIGRATE=false disables automatic migration
  if (process.env.AUTO_MIGRATE === "false") {
    console.log("  ⏭️  AUTO_MIGRATE=false — skipping schema check");
    return;
  }

  // Probe each model added in recent schema updates.
  // If ANY probe throws a "table/column missing" error, run `prisma db push`.
  const probes = [
    { name: "Setting", fn: () => prisma.setting.findFirst().catch(() => { throw new Error("Setting missing"); }) },
    { name: "Customer.wishlist", fn: async () => {
      // SELECT a nonexistent customer but touch the wishlist field — Prisma will fail if field missing
      try { await prisma.customer.findFirst({ select: { id: true, wishlist: true } }); }
      catch (e) { throw e; }
    }},
    { name: "Cart.email", fn: async () => {
      try { await prisma.cart.findFirst({ select: { id: true, email: true, metadata: true } }); }
      catch (e) { throw e; }
    }},
    { name: "Product.lunaCheckoutUrl", fn: async () => {
      try { await prisma.product.findFirst({ select: { id: true, lunaCheckoutUrl: true } }); }
      catch (e) { throw e; }
    }},
  ];

  let needsMigration = false;
  const failed = [];
  for (const probe of probes) {
    try {
      await probe.fn();
    } catch (e) {
      const msg = String(e?.message || e);
      // P2021 = table missing, P2022 = column missing, "does not exist" = SQLite
      if (
        e?.code === "P2021" || e?.code === "P2022" ||
        msg.includes("does not exist") || msg.includes("no such table") ||
        msg.includes("no such column") || msg.includes("Unknown arg") ||
        msg.includes("missing")
      ) {
        needsMigration = true;
        failed.push(probe.name);
      }
    }
  }

  if (!needsMigration) {
    console.log("  ✅ DB schema up to date");
    return;
  }

  console.log(`  🔄 Schema drift detected: [${failed.join(", ")}] — running prisma db push...`);
  const { execSync } = require("child_process");
  try {
    execSync("npx prisma db push --accept-data-loss --skip-generate", {
      cwd: __dirname,
      stdio: "inherit",
      env: { ...process.env },
    });
    console.log("  ✅ Schema pushed. Reconnecting Prisma client...");
    // Disconnect + reconnect so the new schema takes effect in-memory
    try { await prisma.$disconnect(); } catch { /* ignore */ }
    // Note: we don't re-require @prisma/client here — the client was generated
    // from the updated schema at install-time (postinstall), so it already
    // knows about new fields. The disconnect+reconnect flushes any cached state.
    settingModelAvailable = true;
    settingCache.clear();
  } catch (e) {
    console.error("  ❌ Auto-migration failed:", e.message);
    console.error("  ⚠️  Continuing in degraded mode. Run `npx prisma db push` manually.");
  }
}

const PORT = process.env.PORT || 9000;
app.listen(PORT, async () => {
  console.log(`\n  🏪 Under Armour Store API (Production)`);
  console.log(`  📍 http://localhost:${PORT}`);
  await ensureDbSchema();
  try {
    const [products, collections] = await Promise.all([prisma.product.count(), prisma.collection.count()]);
    console.log(`  📦 ${products} products | 📂 ${collections} collections`);
  } catch (e) {
    console.log(`  ⚠️  Could not count products/collections: ${e.message}`);
  }
  console.log(`  🔐 JWT Auth | 🛡️ Helmet | ⏱️ Rate Limited\n`);
});
