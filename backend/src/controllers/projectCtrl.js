const pool = require('../config/db');

exports.createProject = async (req, res) => {
    const { tenantId } = req.tenant;
    const { userId } = req.user;
    const { name, description, status = 'active' } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Name required' });
    }

    const tenant = await pool.query(
        'SELECT max_projects FROM tenants WHERE id = $1',
        [tenantId]
    );

    const count = await pool.query(
        'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
        [tenantId]
    );

    if (Number(count.rows[0].count) >= tenant.rows[0].max_projects) {
        return res.status(403).json({ success: false, message: 'Project limit reached' });
    }

    const r = await pool.query(
        `
    INSERT INTO projects (tenant_id, name, description, status, created_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, tenant_id, name, description, status, created_by, created_at
    `,
        [tenantId, name, description, status, userId]
    );

    const p = r.rows[0];

    return res.status(201).json({
        success: true,
        data: {
            id: p.id,
            tenantId: p.tenant_id,
            name: p.name,
            description: p.description,
            status: p.status,
            createdBy: p.created_by,
            createdAt: p.created_at,
        },
    });
};


exports.listProjects = async (req, res) => {
    const { tenantId } = req.tenant;
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;


    let where = 'WHERE p.tenant_id = $1';
    const values = [tenantId];
    let idx = 2;

    if (status) {
        where += ` AND p.status = $${idx++}`;
        values.push(status);
    }

    if (search) {
        where += ` AND p.name ILIKE $${idx++}`;
        values.push(`%${search}%`);
    }


    const projectsRes = await pool.query(
        `
    SELECT p.id, p.name, p.description, p.status, p.created_at,
           u.id AS creator_id, u.full_name,
           COUNT(t.id) AS task_count,
           COUNT(t.id) FILTER (WHERE t.status = 'completed') AS completed_tasks
    FROM projects p
    JOIN users u ON u.id = p.created_by
    LEFT JOIN tasks t ON t.project_id = p.id
    ${where}
    GROUP BY p.id, u.id
    ORDER BY p.created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
    `,
        [...values, limit, offset]
    );


    let countWhere = 'WHERE tenant_id = $1';
    const countValues = [tenantId];
    let countIdx = 2;

    if (status) {
        countWhere += ` AND status = $${countIdx++}`;
        countValues.push(status);
    }

    if (search) {
        countWhere += ` AND name ILIKE $${countIdx++}`;
        countValues.push(`%${search}%`);
    }

    const countRes = await pool.query(
        `
    SELECT COUNT(*) FROM projects
    ${countWhere}
    `,
        countValues
    );

    const total = Number(countRes.rows[0].count);


    return res.json({
        success: true,
        data: {
            projects: projectsRes.rows.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                status: p.status,
                createdBy: {
                    id: p.creator_id,
                    fullName: p.full_name,
                },
                taskCount: Number(p.task_count),
                completedTaskCount: Number(p.completed_tasks),
                createdAt: p.created_at,
            })),
            total,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                limit: Number(limit),
            },
        },
    });
};


exports.updateProject = async (req, res) => {
    const { projectId } = req.params;
    const { tenantId } = req.tenant;
    const { userId, role } = req.user;

    const project = await pool.query(
        'SELECT tenant_id, created_by FROM projects WHERE id = $1',
        [projectId]
    );

    if (!project.rowCount) {
        return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.rows[0].tenant_id !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (role !== 'tenant_admin' && project.rows[0].created_by !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const fields = ['name', 'description', 'status'];
    const updates = [];
    const values = [];
    let idx = 1;

    for (const f of fields) {
        if (req.body[f] !== undefined) {
            updates.push(`${f} = $${idx++}`);
            values.push(req.body[f]);
        }
    }

    if (!updates.length) {
        return res.status(400).json({ success: false, message: 'No updates' });
    }

    values.push(projectId);

    const r = await pool.query(
        `
    UPDATE projects
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING id, name, description, status, updated_at
    `,
        values
    );

    return res.json({
        success: true,
        message: 'Project updated successfully',
        data: {
            id: r.rows[0].id,
            name: r.rows[0].name,
            description: r.rows[0].description,
            status: r.rows[0].status,
            updatedAt: r.rows[0].updated_at,
        },
    });
};


exports.deleteProject = async (req, res) => {
    const { projectId } = req.params;
    const { tenantId } = req.tenant;
    const { userId, role } = req.user;

    const project = await pool.query(
        'SELECT tenant_id, created_by FROM projects WHERE id = $1',
        [projectId]
    );

    if (project.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.rows[0].tenant_id !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (role !== 'tenant_admin' && project.rows[0].created_by !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);

    return res.json({
        success: true,
        message: 'Project deleted successfully',
    });
};
