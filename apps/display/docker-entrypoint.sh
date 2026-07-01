#!/bin/sh
find /usr/share/nginx/html -name '*.js' | xargs sed -i \
  -e "s|__VITE_API_URL__|${VITE_API_URL:-http://localhost:3000}|g" \
  -e "s|__VITE_SOCKET_URL__|${VITE_SOCKET_URL:-http://localhost:3000}|g" \
  -e "s|__VITE_BRANCH_ID__|${VITE_BRANCH_ID:-1}|g"

exec nginx -g 'daemon off;'
