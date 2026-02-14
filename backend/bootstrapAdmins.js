const bcrypt = require("bcrypt");
const pool = require("./src/config/db");

// hardcoded system users
const ADMINS = [
  {
    email: "superadmin@system.com",
    password: "Admin@123",
    full_name: "System Super Admin",
    role: "super_admin",
    tenant_id: null,
  },
  {
    email: "admin@demo.com",
    password: "Demo@123",
    full_name: "Demo Tenant Admin",
    role: "tenant_admin",
    tenant_subdomain: "demo",
  },
];

async function ensureAdmin(client, admin) {
  const { email } = admin;

  const existing = await client.query(
    "SELECT id, password_hash FROM users WHERE email = $1",
    [email]
  );

  const passwordHash = await bcrypt.hash(admin.password, 10);

  // User exists → update password if plain-text
  if (existing.rowCount > 0) {
    const stored = existing.rows[0].password_hash;

    // bcrypt hashes always start with $2
    if (!stored.startsWith("$2")) {
      await client.query(
        "UPDATE users SET password_hash = $1 WHERE email = $2",
        [passwordHash, email]
      );
      console.log(`${admin.role} password upgraded to hash`);
    } else {
      console.log(`${admin.role} already hashed`);
    }
    return;
  }

  // User does NOT exist → create
  let tenantId = null;

  if (admin.tenant_subdomain) {
    const tenantRes = await client.query(
      "SELECT id FROM tenants WHERE subdomain = $1",
      [admin.tenant_subdomain]
    );
    tenantId = tenantRes.rows[0].id;
  }

  await client.query(
    `
    INSERT INTO users (
      id, tenant_id, email, password_hash, full_name, role
    )
    VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)
    `,
    [
      tenantId,
      admin.email,
      passwordHash,
      admin.full_name,
      admin.role,
    ]
  );

  console.log(`${admin.role} created`);
}


async function bootstrapAdmins() {
  const client = await pool.connect();
  try {
    for (const admin of ADMINS) {
      await ensureAdmin(client, admin);
    }
  } finally {
    client.release();
  }
}

module.exports = { bootstrapAdmins };
