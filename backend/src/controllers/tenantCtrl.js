const pool = require('../config/db');

exports.getTenant = async (req, res) => {
    const { tenantId: paramTenantId } = req.params;
    const { tenantId, isSuperAdmin } = req.tenant;

    if (!isSuperAdmin && paramTenantId !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const result = await pool.query(
        `
    SELECT t.*,
      (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) AS total_users,
      (SELECT COUNT(*) FROM projects WHERE tenant_id = t.id) AS total_projects,
      (SELECT COUNT(*) FROM tasks WHERE tenant_id = t.id) AS total_tasks
    FROM tenants t
    WHERE t.id = $1
    `,
        [paramTenantId]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const t = result.rows[0];

    return res.json({
        success: true,
        data: {
            id: t.id,
            name: t.name,
            subdomain: t.subdomain,
            status: t.status,
            subscriptionPlan: t.subscription_plan,
            maxUsers: t.max_users,
            maxProjects: t.max_projects,
            createdAt: t.created_at,
            stats: {
                totalUsers: Number(t.total_users),
                totalProjects: Number(t.total_projects),
                totalTasks: Number(t.total_tasks),
            },
        },
    });
};


exports.updateTenant = async (req, res) => {
    const { tenantId: paramTenantId } = req.params;
    const { role, tenantId, isSuperAdmin } = { ...req.user, ...req.tenant };

    if (!isSuperAdmin && paramTenantId !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const allowedFields =
        role === 'super_admin'
            ? ['name', 'status', 'subscription_plan', 'max_users', 'max_projects']
            : ['name'];

    const updates = [];
    const values = [];
    let idx = 1;

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = $${idx++}`);
            values.push(req.body[field]);
        }
    }

    if (!updates.length) {
        return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    values.push(paramTenantId);

    const result = await pool.query(
        `
    UPDATE tenants
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING id, name, updated_at
    `,
        values
    );

    return res.json({
        success: true,
        message: 'Tenant updated successfully',
        data: {
            id: result.rows[0].id,
            name: result.rows[0].name,
            updatedAt: result.rows[0].updated_at,
        },
    });
};


exports.listTenants = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const tenantsRes = await pool.query(
        `
    SELECT t.id, t.name, t.subdomain, t.status, t.subscription_plan,
           COUNT(DISTINCT u.id) AS total_users,
           COUNT(DISTINCT p.id) AS total_projects,
           t.created_at
    FROM tenants t
    LEFT JOIN users u ON u.tenant_id = t.id
    LEFT JOIN projects p ON p.tenant_id = t.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
    LIMIT $1 OFFSET $2
    `,
        [limit, offset]
    );

    const countRes = await pool.query(`SELECT COUNT(*) FROM tenants`);

    return res.json({
        success: true,
        data: {
            tenants: tenantsRes.rows.map(t => ({
                id: t.id,
                name: t.name,
                subdomain: t.subdomain,
                status: t.status,
                subscriptionPlan: t.subscription_plan,
                totalUsers: Number(t.total_users),
                totalProjects: Number(t.total_projects),
                createdAt: t.created_at,
            })),
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(countRes.rows[0].count / limit),
                totalTenants: Number(countRes.rows[0].count),
                limit: Number(limit),
            },
        },
    });
};
