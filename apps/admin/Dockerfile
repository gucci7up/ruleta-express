FROM node:20-alpine AS builder
RUN npm install -g pnpm turbo
WORKDIR /app
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --no-frozen-lockfile
COPY packages/shared ./packages/shared
COPY apps/admin ./apps/admin
ENV VITE_API_URL=__VITE_API_URL__
RUN pnpm turbo build --filter=admin

FROM nginx:alpine
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/admin/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
