const pool = require('../config/db');
const { hashPassword } = require('../utils/password');


exports.addUser = async (req, res) => {
    const { tenantId: paramTenantId } = req.params;
    const { tenantId } = req.tenant;

    if (paramTenantId !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { email, password, fullName, role = 'user' } = req.body;

    if (!email || !password || !fullName) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const tenant = await pool.query(
        'SELECT max_users FROM tenants WHERE id = $1',
        [tenantId]
    );

    const userCount = await pool.query(
        'SELECT COUNT(*) FROM users WHERE tenant_id = $1',
        [tenantId]
    );

    if (Number(userCount.rows[0].count) >= tenant.rows[0].max_users) {
        return res.status(403).json({
            success: false,
            message: 'Subscription limit reached',
        });
    }

    const passwordHash = await hashPassword(password);

    try {
        const r = await pool.query(
            `
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, role, is_active, created_at
      `,
            [tenantId, email, passwordHash, fullName, role]
        );

        const u = r.rows[0];

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: u.id,
                email: u.email,
                fullName: u.full_name,
                role: u.role,
                tenantId,
                isActive: u.is_active,
                createdAt: u.created_at,
            },
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Email already exists in this tenant',
            });
        }
        throw err;
    }
};


exports.listUsers = async (req, res) => {
    const { tenantId: paramTenantId } = req.params;
    const { tenantId } = req.tenant;

    if (paramTenantId !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { search, role, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let where = 'WHERE tenant_id = $1';
    const values = [tenantId];
    let idx = 2;

    if (search) {
        where += ` AND (email ILIKE $${idx} OR full_name ILIKE $${idx})`;
        values.push(`%${search}%`);
        idx++;
    }

    if (role) {
        where += ` AND role = $${idx}`;
        values.push(role);
        idx++;
    }

    const usersRes = await pool.query(
        `
    SELECT id, email, full_name, role, is_active, created_at
    FROM users
    ${where}
    ORDER BY created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
    `,
        [...values, limit, offset]
    );

    const countRes = await pool.query(
        `SELECT COUNT(*) FROM users ${where}`,
        values
    );

    return res.json({
        success: true,
        data: {
            users: usersRes.rows.map(u => ({
                id: u.id,
                email: u.email,
                fullName: u.full_name,
                role: u.role,
                isActive: u.is_active,
                createdAt: u.created_at,
            })),
            total: Number(countRes.rows[0].count),
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(countRes.rows[0].count / limit),
                limit: Number(limit),
            },
        },
    });
};



exports.updateUser = async (req, res) => {
    const { userId } = req.params;
    const { userId: currentUserId, role: currentRole } = req.user;
    const { tenantId } = req.tenant;

    const user = await pool.query(
        'SELECT tenant_id FROM users WHERE id = $1',
        [userId]
    );

    if (!user.rowCount) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.rows[0].tenant_id !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (currentRole !== 'tenant_admin' && userId !== currentUserId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const allowed =
        currentRole === 'tenant_admin'
            ? ['full_name', 'role', 'is_active']
            : ['full_name'];

    const updates = [];
    const values = [];
    let idx = 1;

    for (const f of allowed) {
        if (req.body[f] !== undefined) {
            updates.push(`${f} = $${idx++}`);
            values.push(req.body[f]);
        }
    }

    if (!updates.length) {
        return res.status(400).json({ success: false, message: 'No updates' });
    }

    values.push(userId);

    const r = await pool.query(
        `
    UPDATE users
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING id, full_name, role, updated_at
    `,
        values
    );

    return res.json({
        success: true,
        message: 'User updated successfully',
        data: {
            id: r.rows[0].id,
            fullName: r.rows[0].full_name,
            role: r.rows[0].role,
            updatedAt: r.rows[0].updated_at,
        },
    });
};


exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    const { userId: currentUserId } = req.user;
    const { tenantId } = req.tenant;

    if (userId === currentUserId) {
        return res.status(403).json({
            success: false,
            message: 'Cannot delete yourself',
        });
    }

    const user = await pool.query(
        'SELECT tenant_id FROM users WHERE id = $1',
        [userId]
    );

    if (user.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.rows[0].tenant_id !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await pool.query(
        'UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1',
        [userId]
    );

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    return res.json({
        success: true,
        message: 'User deleted successfully',
    });
};
