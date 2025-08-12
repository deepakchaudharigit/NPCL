# NPCL Dashboard Dockerfile
# Multi-stage build for an optimized production image (Next.js standalone + Prisma)

# -----------------------------
# Stage 1: Dependencies (for build)
# -----------------------------
FROM node:18-alpine AS deps
WORKDIR /app

# System deps (optional but handy)
RUN apk add --no-cache libc6-compat

# Install ALL deps (dev + prod) needed to build Next.js
COPY package.json package-lock.json* ./
RUN npm ci

# -----------------------------
# Stage 2: Builder
# -----------------------------
FROM node:18-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Bring node_modules from deps and app source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and build Next.js (standalone output)
RUN npx prisma generate
RUN npm run build

# -----------------------------
# Stage 3: Runner
# -----------------------------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Healthcheck needs curl
RUN apk add --no-cache curl

# (Optional) Non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
# We'll switch to user after copying files

# Copy standalone server and assets
# .next/standalone contains server.js and the pruned runtime node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma schema + engines (if used at runtime; safe to include)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port for Postman access
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

# Drop privileges
USER nextjs

# Start Next.js standalone server
# server.js is at the root of the standalone output we copied above
CMD ["node", "server.js"]
