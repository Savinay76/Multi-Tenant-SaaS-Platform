const { Client } = require('pg');
const bcrypt = require('bcrypt');

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
    VALUES ('superadmin@system.com', $1, 'Super Admin', 'super_admin')
    ON CONFLICT DO NOTHING
  `, [hash]);

  console.log('✔ seed data inserted');
  await client.end();
  process.exit(0);
})().catch(err => {
  console.error('Seed failed', err);
  process.exit(1);
});
