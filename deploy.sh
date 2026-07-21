#!/usr/bin/env bash
# One-command production deploy/update for NEXUS Financial Twin.
#
#   ./deploy.sh              # HTTP on $APP_PORT (default 8080)
#   DOMAIN=twin.example.com ./deploy.sh   # HTTPS via Caddy + Let's Encrypt
#
# Safe to re-run: pulls latest code, rebuilds images, restarts containers,
# runs migrations, and re-caches Laravel config.

set -euo pipefail
cd "$(dirname "$0")"

COMPOSE=(docker compose -f docker-compose.yml)
if [[ -n "${DOMAIN:-}" ]]; then
  COMPOSE+=(-f docker-compose.https.yml)
fi

# Docker often needs root unless the user is in the docker group.
if ! docker info >/dev/null 2>&1; then
  COMPOSE=(sudo "${COMPOSE[@]}")
fi

echo "==> Pulling latest code"
git pull --ff-only

if [[ ! -f backend/.env ]]; then
  echo "==> Creating backend/.env (first deploy)"
  cp backend/.env.example backend/.env
  sed -i "s|^APP_ENV=local|APP_ENV=production|; s|^APP_DEBUG=true|APP_DEBUG=false|" backend/.env
fi

# The container user cannot write the mounted .env, so keys are set host-side.
if grep -q '^APP_KEY=$' backend/.env; then
  echo "==> Generating APP_KEY"
  sed -i "s|^APP_KEY=$|APP_KEY=base64:$(openssl rand -base64 32)|" backend/.env
fi

echo "==> Ensuring storage permissions (www-data in container = uid 33)"
sudo chown -R 33:33 backend/storage backend/bootstrap/cache

echo "==> Building and starting containers"
"${COMPOSE[@]}" up -d --build --remove-orphans

echo "==> Waiting for backend, then migrating"
"${COMPOSE[@]}" exec -T backend sh -c '
  i=0; until php artisan migrate --force 2>/dev/null; do
    i=$((i+1)); [ $i -gt 30 ] && echo "database never came up" && exit 1
    sleep 2
  done
  php artisan config:cache
'

echo "==> Done"
"${COMPOSE[@]}" ps
