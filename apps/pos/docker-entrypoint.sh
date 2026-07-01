#!/bin/sh
# Replace runtime env vars in the built JS files
find /usr/share/nginx/html -name '*.js' | xargs sed -i \
  -e "s|__VITE_API_URL__|${VITE_API_URL:-http://localhost:3000}|g" \
  -e "s|__VITE_SOCKET_URL__|${VITE_SOCKET_URL:-http://localhost:3000}|g" \
  -e "s|__VITE_TICKET_BASE_URL__|${VITE_TICKET_BASE_URL:-http://localhost:4001}|g"

exec nginx -g 'daemon off;'
