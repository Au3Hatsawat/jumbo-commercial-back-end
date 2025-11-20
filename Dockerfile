# ======================
# Stage 1: Dependencies
# ======================
FROM node:22-alpine AS deps
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# ======================
# Stage 2: Builder
# ======================
FROM node:22-alpine AS builder
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy dependencies from deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy source code (รวมถึง folder src เปล่าๆ หรือไฟล์อื่นๆ)
COPY . .

RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ======================
# Stage 3: Runner (Production)
# ======================
FROM node:22-alpine AS runner
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy necessary files
# 1. Copy dist (Compiled JS)
COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist
# 2. Copy node_modules (Dependencies)
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
# 3. Copy Prisma Schema (Required for runtime engine)
COPY --from=builder --chown=expressjs:nodejs /app/prisma ./prisma
# 4. Copy Package json
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./

COPY --from=builder --chown=expressjs:nodejs /app/src/generated ./src/generated

# Switch to non-root user
USER expressjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Start application
CMD ["node", "dist/index.js"]