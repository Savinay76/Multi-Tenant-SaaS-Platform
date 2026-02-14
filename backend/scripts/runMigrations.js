const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log('Running migrations...');

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running ${file}`);
    await pool.query(sql);
  }

  console.log('Migrations completed');
}

module.exports = runMigrations;
