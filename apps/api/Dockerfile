FROM node:20-alpine AS base
RUN npm install -g pnpm turbo

FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --no-frozen-lockfile
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm --filter api exec prisma generate --schema=./prisma/schema.prisma
RUN pnpm turbo build --filter=api

FROM node:20-slim AS runner
WORKDIR /app
RUN npm install -g pnpm prisma@5.22.0
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate && node dist/main.js"]
