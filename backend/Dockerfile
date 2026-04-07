FROM node:20-alpine

# Install OpenSSL (required by Prisma)
RUN apk add --no-cache openssl wget

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY prisma ./prisma/
COPY scripts ./scripts/

# Install ALL deps (including prisma CLI). postinstall runs prepare-schema + prisma generate
# DATABASE_URL is read from env at this stage so the schema is correctly switched
ARG DATABASE_URL=postgresql://placeholder@localhost:5432/placeholder
ENV DATABASE_URL=${DATABASE_URL}
RUN npm ci

# Copy app source
COPY . .

# Create upload dirs
RUN mkdir -p public/uploads/reviews public/uploads/products

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://localhost:9000/health || exit 1

# Server.js auto-migrates on startup via ensureDbSchema()
# Seed runs only if DB is empty (seed.js is idempotent)
CMD ["sh", "-c", "node scripts/prepare-schema.js && npx prisma db push --skip-generate --accept-data-loss && (node seed.js 2>&1 | tail -5 || true) && node server.js"]
