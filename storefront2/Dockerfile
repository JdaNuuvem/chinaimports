FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Public backend URL — must be set to the externally reachable backend URL
# In Coolify: set as build argument (e.g. https://api.yourdomain.com)
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=${NEXT_PUBLIC_MEDUSA_BACKEND_URL:-http://localhost:9000}

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

# wget for healthcheck
RUN apk add --no-cache wget

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Persistent data dir. Mount a Coolify volume at /app/data/uploads to keep
# uploaded files AND the mutable theme-config.json across redeploys. The
# config lives alongside the uploads as a dotfile so it piggybacks on the
# same volume (the /uploads/:path* route handler blocks dotfiles).
RUN mkdir -p /app/data/uploads && chown -R nextjs:nodejs /app/data
ENV UPLOADS_DIR=/app/data/uploads
ENV THEME_CONFIG_PATH=/app/data/uploads/.theme-config.json

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
