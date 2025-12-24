const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { signToken } = require('../utils/jwt');

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    await client.connect();

    const tenant = tenantSubdomain
      ? await client.query('SELECT id FROM tenants WHERE subdomain=$1', [tenantSubdomain])
      : { rows: [{ id: null }] };

    if (!tenant.rows[0]) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const userRes = await client.query(
      `SELECT id, password_hash, role, tenant_id
       FROM users
       WHERE email=$1 AND (tenant_id=$2 OR tenant_id IS NULL)`,
      [email, tenant.rows[0].id]
    );

    if (!userRes.rows[0]) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, userRes.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken({
      userId: userRes.rows[0].id,
      tenantId: userRes.rows[0].tenant_id,
      role: userRes.rows[0].role
    });

    return res.json({ success: true, data: { token, expiresIn: 86400 } });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  } finally {
    await client.end();
  }
};

/* ================= ME ================= */
exports.me = async (req, res) => {
  res.json({ success: true, data: req.user });
};

/* ================= REGISTER TENANT ================= */
exports.registerTenant = async (req, res) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

  if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    await client.connect();
    await client.query('BEGIN');

    const exists = await client.query(
      'SELECT id FROM tenants WHERE subdomain=$1',
      [subdomain]
    );

    if (exists.rows.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Subdomain exists' });
    }

    const tenantRes = await client.query(
      `INSERT INTO tenants
       (name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1,$2,'active','free',5,3)
       RETURNING id, subdomain`,
      [tenantName, subdomain]
    );

    const hash = await bcrypt.hash(adminPassword, 10);

    const adminRes = await client.query(
      `INSERT INTO users
       (tenant_id, email, password_hash, full_name, role)
       VALUES ($1,$2,$3,$4,'tenant_admin')
       RETURNING id, email, full_name, role`,
      [tenantRes.rows[0].id, adminEmail, hash, adminFullName]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenantId: tenantRes.rows[0].id,
        subdomain: tenantRes.rows[0].subdomain,
        adminUser: adminRes.rows[0]
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  } finally {
    await client.end();
  }
};
