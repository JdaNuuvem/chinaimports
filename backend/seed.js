const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, "data/seed.json"), "utf-8"));

async function main() {
  // Idempotency guard: skip the entire seed (including the destructive
  // deleteMany block below) if the DB already has products. This file is
  // invoked from the Dockerfile CMD on every container startup, so
  // without this check every redeploy wipes imported products, orders,
  // customers, etc.
  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    console.log(`🌱 Seed skipped — DB already has ${existingProducts} products.`);
    return;
  }

  console.log("🌱 Seeding database (empty DB detected)...");

  // Clear existing data (safe — the guard above ensures we only get here
  // when the DB is effectively empty; this deleteMany is just cleanup of
  // partial/leftover rows from a failed previous seed).
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.session.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.collectionProduct.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productOptionValue.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.contactMessage.deleteMany();

  // Create collections
  const collectionData = [
    { title: "Masculino", handle: "masculino" },
    { title: "Feminino", handle: "feminino" },
    { title: "Infantil", handle: "infantil" },
    { title: "Calçados", handle: "calcados" },
    { title: "Acessórios", handle: "acessorios" },
    { title: "Outlet", handle: "outlet" },
    { title: "Lançamentos", handle: "lancamentos" },
    { title: "Mais Vendidos", handle: "mais-vendidos" },
  ];

  const collections = {};
  for (const col of collectionData) {
    const created = await prisma.collection.create({ data: col });
    collections[col.handle] = created.id;
  }
  console.log(`  ✓ ${collectionData.length} collections`);

  // Create products from seed
  const productCollectionMap = {
    "camiseta-ua-tech-2": ["masculino", "lancamentos"],
    "bermuda-ua-launch-run": ["masculino", "mais-vendidos"],
    "tenis-ua-charged-pursuit-3": ["calcados", "mais-vendidos"],
    "regata-ua-streaker": ["masculino", "outlet"],
    "legging-ua-heatgear-feminina": ["feminino", "lancamentos"],
    "mochila-ua-hustle-5": ["acessorios"],
  };

  for (const p of seedData.products) {
    const product = await prisma.product.create({
      data: {
        title: p.title,
        description: p.description,
        handle: p.handle,
        thumbnail: `https://placehold.co/600x600/1e2d7d/ffffff?text=${encodeURIComponent(p.title.slice(0, 20))}`,
        weight: p.weight || 0,
        images: {
          create: [
            { url: `https://placehold.co/600x600/1e2d7d/ffffff?text=${encodeURIComponent(p.title.slice(0, 15))}`, position: 0 },
            { url: "https://placehold.co/600x600/00badb/ffffff?text=Detalhe", position: 1 },
            { url: "https://placehold.co/600x600/333333/ffffff?text=Costas", position: 2 },
          ],
        },
      },
    });

    // Options
    for (const opt of p.options || []) {
      const uniqueValues = [...new Set(p.variants.flatMap((v) => v.options.filter((_, i) => i === p.options.indexOf(opt)).map((o) => o.value)))];
      await prisma.productOption.create({
        data: {
          title: opt.title,
          productId: product.id,
          values: { create: uniqueValues.map((v) => ({ value: v })) },
        },
      });
    }

    // Variants
    for (let vi = 0; vi < p.variants.length; vi++) {
      const v = p.variants[vi];
      await prisma.variant.create({
        data: {
          title: v.title,
          sku: `${p.handle}-${vi}`.toUpperCase(),
          price: v.prices[0]?.amount || 0,
          compareAtPrice: Math.round((v.prices[0]?.amount || 0) * 1.25),
          inventoryQuantity: v.inventory_quantity || 0,
          productId: product.id,
        },
      });
    }

    // Collection associations
    const colHandles = productCollectionMap[p.handle] || [];
    for (const handle of colHandles) {
      if (collections[handle]) {
        await prisma.collectionProduct.create({
          data: { productId: product.id, collectionId: collections[handle] },
        });
      }
    }
  }
  console.log(`  ✓ ${seedData.products.length} products with variants and images`);

  // Create demo customer
  const hash = await bcrypt.hash("demo123", 12);
  await prisma.customer.create({
    data: {
      email: "demo@underarmour.com.br",
      passwordHash: hash,
      firstName: "Cliente",
      lastName: "Demo",
      addresses: {
        create: {
          firstName: "Cliente",
          lastName: "Demo",
          address1: "Rua Augusta, 1234",
          city: "São Paulo",
          province: "SP",
          postalCode: "01310-100",
          isDefault: true,
        },
      },
    },
  });
  console.log("  ✓ Demo customer (demo@underarmour.com.br / demo123)");

  // Demo reviews
  const products = await prisma.product.findMany({ take: 3 });
  const reviewData = [
    { rating: 5, title: "Excelente qualidade", body: "Material muito bom, caimento perfeito. Já é minha terceira compra.", author: "João S." },
    { rating: 4, title: "Muito bom", body: "Gostei muito do produto, apenas o prazo de entrega poderia ser melhor.", author: "Maria L." },
    { rating: 5, title: "Recomendo", body: "Produto de alta qualidade, vale cada centavo.", author: "Carlos R." },
  ];
  for (let i = 0; i < Math.min(products.length, reviewData.length); i++) {
    await prisma.review.create({
      data: { ...reviewData[i], productId: products[i].id, approved: true },
    });
  }
  console.log("  ✓ 3 demo reviews");

  console.log("\n🎉 Seed completed!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
