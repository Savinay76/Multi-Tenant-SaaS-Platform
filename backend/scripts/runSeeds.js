const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function runSeeds() {
  const seedFile = path.join(__dirname, '../seeds/seed_data.sql');

  if (!fs.existsSync(seedFile)) {
    console.log('No seed file found, skipping');
    return;
  }

  console.log('Running seed data...');
  const sql = fs.readFileSync(seedFile, 'utf8');
  await pool.query(sql);
  console.log('Seed data completed');
}

module.exports = runSeeds;
