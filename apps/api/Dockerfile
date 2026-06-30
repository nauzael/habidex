# ─── Builder Stage ─────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY apps/api/package*.json apps/api/
COPY packages/ packages/

# Install dependencies
RUN npm ci

# Copy Prisma schema and generate client
COPY apps/api/prisma/ apps/api/prisma/
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Copy source and build
COPY apps/api/ apps/api/
COPY tsconfig.base.json .
RUN npm run build --workspace=apps/api

# ─── Runner Stage ──────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

WORKDIR /app

# Copy built artifacts
COPY --from=builder --chown=appuser:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/apps/api/package.json ./
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/packages packages/

USER appuser

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', r => {process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

EXPOSE 3000
CMD ["node", "dist/main"]
