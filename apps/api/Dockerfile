FROM node:20-slim AS base
RUN npm install -g pnpm prisma@5.22.0
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --no-frozen-lockfile
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm --filter api exec prisma generate --schema=./prisma/schema.prisma
RUN cd apps/api && pnpm exec nest build
RUN test -f /app/apps/api/dist/main.js
# pnpm deploy: crea directorio autónomo con node_modules plana (sin symlinks de workspace)
RUN pnpm deploy --filter=api --prod /prod/api
# Regenerar Prisma client en la carpeta de deploy
RUN cd /prod/api && prisma generate --schema=./prisma/schema.prisma

FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*
RUN npm install -g prisma@5.22.0
COPY --from=builder /app/apps/api/dist /app/dist
COPY --from=builder /prod/api/node_modules ./node_modules
COPY --from=builder /prod/api/prisma ./prisma
EXPOSE 3000
CMD ["sh", "-c", "prisma db push --accept-data-loss --skip-generate && node /app/dist/main.js"]
