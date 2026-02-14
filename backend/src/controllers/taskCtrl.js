const pool = require('../config/db');


exports.createTask = async (req, res) => {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority = 'medium', dueDate } = req.body;
    const { tenantId } = req.tenant;

    if (!title) {
        return res.status(400).json({ success: false, message: 'Title required' });
    }

    const project = await pool.query(
        'SELECT tenant_id FROM projects WHERE id = $1',
        [projectId]
    );

    if (project.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.rows[0].tenant_id !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (assignedTo) {
        const user = await pool.query(
            'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
            [assignedTo, tenantId]
        );
        if (!user.rowCount) {
            return res.status(400).json({
                success: false,
                message: 'Assigned user does not belong to tenant',
            });
        }
    }

    const r = await pool.query(
        `
    INSERT INTO tasks
    (project_id, tenant_id, title, description, priority, assigned_to, due_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, project_id, tenant_id, title, description, status,
              priority, assigned_to, due_date, created_at
    `,
        [projectId, tenantId, title, description, priority, assignedTo || null, dueDate || null]
    );

    const t = r.rows[0];

    return res.status(201).json({
        success: true,
        data: {
            id: t.id,
            projectId: t.project_id,
            tenantId: t.tenant_id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            assignedTo: t.assigned_to,
            dueDate: t.due_date,
            createdAt: t.created_at,
        },
    });
};


exports.listTasks = async (req, res) => {
    const { projectId } = req.params;
    const { tenantId } = req.tenant;
    const { status, assignedTo, priority, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const project = await pool.query(
        'SELECT tenant_id FROM projects WHERE id = $1',
        [projectId]
    );

    if (!project.rowCount || project.rows[0].tenant_id !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    let where = 'WHERE t.project_id = $1';
    const values = [projectId];
    let idx = 2;

    if (status) {
        where += ` AND t.status = $${idx++}`;
        values.push(status);
    }

    if (assignedTo) {
        where += ` AND t.assigned_to = $${idx++}`;
        values.push(assignedTo);
    }

    if (priority) {
        where += ` AND t.priority = $${idx++}`;
        values.push(priority);
    }

    if (search) {
        where += ` AND t.title ILIKE $${idx++}`;
        values.push(`%${search}%`);
    }

    const tasksRes = await pool.query(
        `
    SELECT t.id, t.title, t.description, t.status, t.priority,
           t.due_date, t.created_at,
           u.id AS user_id, u.full_name, u.email
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assigned_to
    ${where}
    ORDER BY
      CASE t.priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        ELSE 3
      END,
      t.due_date ASC NULLS LAST
    LIMIT $${idx} OFFSET $${idx + 1}
    `,
        [...values, limit, offset]
    );

    const countRes = await pool.query(
        `SELECT COUNT(*) FROM tasks t ${where}`,
        values
    );

    return res.json({
        success: true,
        data: {
            tasks: tasksRes.rows.map(t => ({
                id: t.id,
                title: t.title,
                description: t.description,
                status: t.status,
                priority: t.priority,
                assignedTo: t.user_id
                    ? {
                        id: t.user_id,
                        fullName: t.full_name,
                        email: t.email,
                    }
                    : null,
                dueDate: t.due_date,
                createdAt: t.created_at,
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

exports.updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;
    const { tenantId } = req.tenant;

    if (!status) {
        return res.status(400).json({ success: false, message: 'Status required' });
    }

    const r = await pool.query(
        `
    UPDATE tasks
    SET status = $1, updated_at = NOW()
    WHERE id = $2 AND tenant_id = $3
    RETURNING id, status, updated_at
    `,
        [status, taskId, tenantId]
    );

    if (!r.rowCount) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.json({
        success: true,
        data: {
            id: r.rows[0].id,
            status: r.rows[0].status,
            updatedAt: r.rows[0].updated_at,
        },
    });
};



exports.updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { tenantId } = req.tenant;

    const allowed = {
        title: 'title',
        description: 'description',
        status: 'status',
        priority: 'priority',
        assignedTo: 'assigned_to',
        dueDate: 'due_date',
    };

    const updates = [];
    const values = [];
    let idx = 1;

    for (const key in allowed) {
        if (req.body[key] !== undefined) {
            updates.push(`${allowed[key]} = $${idx++}`);
            values.push(req.body[key]);
        }
    }

    if (!updates.length) {
        return res.status(400).json({ success: false, message: 'No updates' });
    }

    values.push(taskId, tenantId);

    const r = await pool.query(
        `
    UPDATE tasks
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${idx++} AND tenant_id = $${idx}
    RETURNING id, title, description, status, priority,
              assigned_to, due_date, updated_at
    `,
        values
    );

    if (!r.rowCount) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const t = r.rows[0];

    let assignedUser = null;
    if (t.assigned_to) {
        const u = await pool.query(
            'SELECT id, full_name, email FROM users WHERE id = $1',
            [t.assigned_to]
        );
        if (u.rowCount) {
            assignedUser = {
                id: u.rows[0].id,
                fullName: u.rows[0].full_name,
                email: u.rows[0].email,
            };
        }
    }

    return res.json({
        success: true,
        message: 'Task updated successfully',
        data: {
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            assignedTo: assignedUser,
            dueDate: t.due_date,
            updatedAt: t.updated_at,
        },
    });
};


exports.deleteTask = async (req, res) => {
    const { taskId } = req.params;
    const { tenantId } = req.tenant;

    const task = await pool.query(
        'SELECT tenant_id FROM tasks WHERE id = $1',
        [taskId]
    );

    if (task.rowCount === 0 || task.rows[0].tenant_id !== tenantId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    return res.json({
        success: true,
        message: 'Task deleted successfully',
    });
};
