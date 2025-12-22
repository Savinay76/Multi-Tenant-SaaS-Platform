#!/bin/sh
node src/utils/migrate.js
node src/utils/seed.js
node src/server.js
