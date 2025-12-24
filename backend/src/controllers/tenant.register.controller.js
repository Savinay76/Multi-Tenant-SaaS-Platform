const { Client } = require('pg');

exports.getTenantDetails = async (req, res) => {
  const { tenantId } = req.params;
  const { role, tenantId: userTenantId } = req.user;

  // 🔒 Authorization
  if (role !== 'super_admin' && tenantId !== userTenantId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access'
    });
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

    // Tenant info
    const tenantRes = await client.query(
      `SELECT id, name, subdomain, status, subscription_plan,
              max_users, max_projects, created_at
       FROM tenants
       WHERE id = $1`,
      [tenantId]
    );

    if (!tenantRes.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Stats
    const usersCount = await client.query(
      'SELECT COUNT(*) FROM users WHERE tenant_id = $1',
      [tenantId]
    );

    const projectsCount = await client.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    const tasksCount = await client.query(
      'SELECT COUNT(*) FROM tasks WHERE tenant_id = $1',
      [tenantId]
    );

    return res.json({
      success: true,
      data: {
        ...tenantRes.rows[0],
        stats: {
          totalUsers: Number(usersCount.rows[0].count),
          totalProjects: Number(projectsCount.rows[0].count),
          totalTasks: Number(tasksCount.rows[0].count)
        }
      }
    });

  } catch (err) {
    console.error('GET TENANT ERROR:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant details'
    });
  } finally {
    await client.end();
  }
};
