#!/usr/bin/env node
/**
 * Prepare Prisma schema for the target database.
 *
 * Reads DATABASE_URL and switches the `provider` in schema.prisma to match:
 *   - postgresql:// or postgres://  → "postgresql"
 *   - file:                          → "sqlite"
 *   - mysql://                       → "mysql"
 *
 * Idempotent: only writes if change is needed.
 * Safe: never touches schema if DATABASE_URL is unset.
 *
 * Usage: node scripts/prepare-schema.js
 * Called automatically from `postinstall` and from the Dockerfile.
 */

const fs = require("fs");
const path = require("path");

const SCHEMA_PATH = path.join(__dirname, "..", "prisma", "schema.prisma");

function detectProvider(url) {
  if (!url) return null;
  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) return "postgresql";
  if (url.startsWith("mysql://")) return "mysql";
  if (url.startsWith("file:") || url.startsWith("sqlite:")) return "sqlite";
  return null;
}

function main() {
  const dbUrl = process.env.DATABASE_URL;
  const targetProvider = detectProvider(dbUrl);

  if (!targetProvider) {
    console.log("[prepare-schema] DATABASE_URL not set or unrecognized — skipping");
    return;
  }

  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error("[prepare-schema] schema.prisma not found at", SCHEMA_PATH);
    process.exit(1);
  }

  let schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  // Match `provider = "..."` inside the datasource block
  const providerMatch = schema.match(/(datasource\s+db\s*\{[^}]*?provider\s*=\s*")([^"]+)(")/s);

  if (!providerMatch) {
    console.error("[prepare-schema] could not find datasource provider in schema");
    process.exit(1);
  }

  const currentProvider = providerMatch[2];
  if (currentProvider === targetProvider) {
    console.log(`[prepare-schema] schema already uses ${targetProvider} — no change`);
    return;
  }

  schema = schema.replace(providerMatch[0], `${providerMatch[1]}${targetProvider}${providerMatch[3]}`);
  fs.writeFileSync(SCHEMA_PATH, schema);
  console.log(`[prepare-schema] switched provider: ${currentProvider} → ${targetProvider}`);
}

main();
