const pool = require("../config/db");
const password = require("../utils/password");
const jwt = require("../utils/jwt");

exports.registerTenant = async (req, res) => {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

    if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const existingTenant = await client.query(
            'SELECT id FROM tenants WHERE subdomain = $1',
            [subdomain]
        );

        if (existingTenant.rowCount > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: 'Subdomain already exists' });
        }

        const tenantRes = await client.query(
            `INSERT INTO tenants (name, subdomain)
       VALUES ($1, $2)
       RETURNING id, subdomain`,
            [tenantName, subdomain]
        );

        const passwordHash = await password.hashPassword(adminPassword);

        const userRes = await client.query(
            `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'tenant_admin')
       RETURNING id, email, full_name, role`,
            [tenantRes.rows[0].id, adminEmail, passwordHash, adminFullName]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Tenant registered successfully',
            data: {
                tenantId: tenantRes.rows[0].id,
                subdomain: tenantRes.rows[0].subdomain,
                adminUser: {
                    id: userRes.rows[0].id,
                    email: userRes.rows[0].email,
                    fullName: userRes.rows[0].full_name,
                    role: userRes.rows[0].role,
                },
            },
        });
    } catch (err) {
        await client.query('ROLLBACK');
        return res.status(500).json({ success: false, message: 'Registration failed' });
    } finally {
        client.release();
    }
};


const { comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

exports.login = async (req, res) => {
    const { email, password, tenantSubdomain } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required",
        });
    }

    try {
        /* ============================
           STEP 1: FIND USER BY EMAIL
        ============================ */
        const userResult = await pool.query(
            `
      SELECT id, email, password_hash, full_name, role, is_active, tenant_id
      FROM users
      WHERE email = $1
      `,
            [email]
        );

        if (userResult.rowCount === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const user = userResult.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive",
            });
        }

        const passwordMatch = await comparePassword(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        /* ============================
           STEP 2: SUPER ADMIN LOGIN
           (NO TENANT REQUIRED)
        ============================ */
        if (user.role === "super_admin") {
            const token = signToken({
                userId: user.id,
                tenantId: null,
                role: user.role,
            });

            return res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.full_name,
                        role: user.role,
                        tenantId: null,
                    },
                    token,
                    expiresIn: 86400,
                },
            });
        }

        /* ============================
           STEP 3: TENANT USER LOGIN
           (tenantSubdomain REQUIRED)
        ============================ */
        if (!tenantSubdomain) {
            return res.status(400).json({
                success: false,
                message: "tenantSubdomain is required for tenant users",
            });
        }

        const tenantResult = await pool.query(
            `
      SELECT id, status
      FROM tenants
      WHERE subdomain = $1
      `,
            [tenantSubdomain]
        );

        if (tenantResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Tenant not found",
            });
        }

        const tenant = tenantResult.rows[0];

        if (tenant.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Tenant is not active",
            });
        }

        if (user.tenant_id !== tenant.id) {
            return res.status(403).json({
                success: false,
                message: "User does not belong to this tenant",
            });
        }

        const token = signToken({
            userId: user.id,
            tenantId: tenant.id,
            role: user.role,
        });

        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role,
                    tenantId: tenant.id,
                },
                token,
                expiresIn: 86400,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};


exports.getMe = async (req, res) => {
    const { userId } = req.user;

    try {
        const result = await pool.query(
            `
      SELECT u.id, u.email, u.full_name, u.role, u.is_active,
             t.id AS tenant_id, t.name, t.subdomain,
             t.subscription_plan, t.max_users, t.max_projects
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = $1
      `,
            [userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const row = result.rows[0];

        return res.status(200).json({
            success: true,
            data: {
                id: row.id,
                email: row.email,
                fullName: row.full_name,
                role: row.role,
                isActive: row.is_active,
                tenant: row.tenant_id
                    ? {
                        id: row.tenant_id,
                        name: row.name,
                        subdomain: row.subdomain,
                        subscriptionPlan: row.subscription_plan,
                        maxUsers: row.max_users,
                        maxProjects: row.max_projects,
                    }
                    : null,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
        });
    }
};

