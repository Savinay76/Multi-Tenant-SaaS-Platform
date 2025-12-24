#!/bin/sh

echo "Waiting for database..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  sleep 2
done

echo "Database is ready"

node src/utils/migrate.js
node src/utils/seed.js
node src/server.js
