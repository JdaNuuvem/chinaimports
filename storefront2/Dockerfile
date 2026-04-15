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

# Public backend URL — MUST be passed as `--build-arg` at docker build time.
# Next.js inlines `process.env.NEXT_PUBLIC_*` into client bundles during
# `next build`; changing this value at container runtime has ZERO effect on
# the already-compiled JS shipped to the browser.
#
# In Coolify: mark the variable as "Available at Buildtime" so it's forwarded
# to `docker build --build-arg ...`. Missing this checkbox (or rebuilding with
# stale cache) produces a bundle that silently falls back to `localhost:9000`,
# which Chromium then blocks with a Private Network Access error from any
# HTTPS origin. We hit that exact bug in production on 2026-04-11 — hence the
# hard failure below, so we never ship a broken bundle again.
#
# Local docker builds must pass the arg explicitly, e.g.:
#   docker build --build-arg NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000 .
# For day-to-day local dev, use `npm run dev` (no Docker) instead.
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
RUN test -n "$NEXT_PUBLIC_MEDUSA_BACKEND_URL" \
    || (echo "FATAL: NEXT_PUBLIC_MEDUSA_BACKEND_URL build-arg is required." \
        && echo "See comment above this RUN in storefront2/Dockerfile." \
        && exit 1)
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=${NEXT_PUBLIC_MEDUSA_BACKEND_URL}

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
