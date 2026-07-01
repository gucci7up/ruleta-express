FROM node:20-alpine AS builder
RUN npm install -g pnpm turbo
WORKDIR /app
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/display/package.json ./apps/display/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --no-frozen-lockfile
COPY packages/shared ./packages/shared
COPY apps/display ./apps/display
ENV VITE_API_URL=__VITE_API_URL__
ENV VITE_SOCKET_URL=__VITE_SOCKET_URL__
ENV VITE_BRANCH_ID=__VITE_BRANCH_ID__
RUN pnpm turbo build --filter=display

FROM nginx:alpine
COPY --from=builder /app/apps/display/dist /usr/share/nginx/html
COPY apps/display/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/display/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
