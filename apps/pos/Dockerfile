FROM node:20-alpine AS builder
RUN npm install -g pnpm turbo
WORKDIR /app
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/pos/package.json ./apps/pos/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --no-frozen-lockfile
COPY packages/shared ./packages/shared
COPY apps/pos ./apps/pos
# Build with placeholders — replaced at runtime by docker-entrypoint.sh
ENV VITE_API_URL=__VITE_API_URL__
ENV VITE_SOCKET_URL=__VITE_SOCKET_URL__
ENV VITE_TICKET_BASE_URL=__VITE_TICKET_BASE_URL__
RUN pnpm turbo build --filter=pos

FROM nginx:alpine
COPY --from=builder /app/apps/pos/dist /usr/share/nginx/html
COPY apps/pos/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/pos/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
