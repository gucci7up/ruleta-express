#!/bin/sh
find /usr/share/nginx/html -name '*.js' | xargs sed -i \
  -e "s|__VITE_API_URL__|${VITE_API_URL:-http://localhost:3000}|g"

exec nginx -g 'daemon off;'
