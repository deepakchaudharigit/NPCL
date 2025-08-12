#!/usr/bin/env sh
set -e

# Optional: wait for Postgres on Docker network
# (adjust host if needed)
if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for database..."
  for i in $(seq 1 30); do
    nc -z npcl-postgres 5432 && break
    sleep 1
  done
fi

# Optional: apply migrations if prisma is available
# (safe to skip in standalone if you migrate outside)
if command -v npx >/dev/null 2>&1; then
  echo "Running prisma migrate deploy (if available)..."
  npx prisma migrate deploy || echo "Skip/failed prisma migrate (ok if handled elsewhere)"
fi

# Run the Next.js standalone server
exec "$@"
