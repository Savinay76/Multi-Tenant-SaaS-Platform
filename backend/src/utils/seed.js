const bcrypt = require('bcrypt');
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

  const hash = await bcrypt.hash('Admin@123', 10);

  await client.query(`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT DO NOTHING
  `, [
    'superadmin@system.com',
    hash,
    'Super Admin',
    'super_admin'
  ]);

  await client.end();
})();
