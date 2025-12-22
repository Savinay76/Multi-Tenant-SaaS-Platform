const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

(async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  await client.connect();

  const dir = path.join(__dirname, '../../migrations');
  const files = fs.readdirSync(dir).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await client.query(sql);
    console.log(`✔ migrated: ${file}`);
  }

  await client.end();
  process.exit(0);
})().catch(err => {
  console.error('Migration failed', err);
  process.exit(1);
});
