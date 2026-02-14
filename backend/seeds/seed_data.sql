INSERT INTO tenants (
  id, name, subdomain, status, subscription_plan, max_users, max_projects
) VALUES (
  uuid_generate_v4(),
  'Demo Company',
  'demo',
  'active',
  'pro',
  25,
  15
);

INSERT INTO users (
  id, tenant_id, email, password_hash, full_name, role
) VALUES (
  uuid_generate_v4(),
  NULL,
  'superadmin@system.com',
  '<HASH_Admin@123>',
  'System Super Admin',
  'super_admin'
)
ON CONFLICT DO NOTHING;

WITH tenant AS (
  SELECT id FROM tenants WHERE subdomain = 'demo'
)
INSERT INTO users (
  id, tenant_id, email, password_hash, full_name, role
)
SELECT
  uuid_generate_v4(),
  tenant.id,
  'admin@demo.com',
  'Demo@123',
  'Demo Admin',
  'tenant_admin'
FROM tenant;

WITH tenant AS (
  SELECT id FROM tenants WHERE subdomain = 'demo'
)
INSERT INTO users (
  id, tenant_id, email, password_hash, full_name, role
)
SELECT uuid_generate_v4(), tenant.id, 'user1@demo.com',
  'User@123', 'Demo User One', 'user'
FROM tenant;

WITH tenant AS (
  SELECT id FROM tenants WHERE subdomain = 'demo'
)
INSERT INTO users (
  id, tenant_id, email, password_hash, full_name, role
)
SELECT uuid_generate_v4(), tenant.id, 'user2@demo.com',
  'User@123', 'Demo User Two', 'user'
FROM tenant;

WITH
tenant AS (SELECT id FROM tenants WHERE subdomain = 'demo'),
admin_user AS (SELECT id FROM users WHERE email = 'admin@demo.com')
INSERT INTO projects (id, tenant_id, name, description, created_by)
SELECT uuid_generate_v4(), tenant.id, 'Project Alpha',
  'First demo project', admin_user.id
FROM tenant, admin_user;

WITH
tenant AS (SELECT id FROM tenants WHERE subdomain = 'demo'),
admin_user AS (SELECT id FROM users WHERE email = 'admin@demo.com')
INSERT INTO projects (id, tenant_id, name, description, created_by)
SELECT uuid_generate_v4(), tenant.id, 'Project Beta',
  'Second demo project', admin_user.id
FROM tenant, admin_user;

-- Task 1
WITH
tenant AS (SELECT id FROM tenants WHERE subdomain = 'demo'),
project AS (SELECT id FROM projects WHERE name = 'Project Alpha' LIMIT 1),
usr AS (SELECT id FROM users WHERE email = 'user1@demo.com')
INSERT INTO tasks (id, project_id, tenant_id, title, priority, assigned_to)
SELECT uuid_generate_v4(), project.id, tenant.id,
  'Design UI', 'high', usr.id
FROM tenant, project, usr;

-- Task 2
WITH
tenant AS (SELECT id FROM tenants WHERE subdomain = 'demo'),
project AS (SELECT id FROM projects WHERE name = 'Project Alpha' LIMIT 1),
usr AS (SELECT id FROM users WHERE email = 'user2@demo.com')
INSERT INTO tasks (id, project_id, tenant_id, title, priority, assigned_to)
SELECT uuid_generate_v4(), project.id, tenant.id,
  'Build API', 'medium', usr.id
FROM tenant, project, usr;

-- Task 3
WITH
tenant AS (SELECT id FROM tenants WHERE subdomain = 'demo'),
project AS (SELECT id FROM projects WHERE name = 'Project Beta' LIMIT 1)
INSERT INTO tasks (id, project_id, tenant_id, title)
SELECT uuid_generate_v4(), project.id, tenant.id,
  'Write Docs'
FROM tenant, project;

-- Task 4
WITH
tenant AS (SELECT id FROM tenants WHERE subdomain = 'demo'),
project AS (SELECT id FROM projects WHERE name = 'Project Beta' LIMIT 1)
INSERT INTO tasks (id, project_id, tenant_id, title)
SELECT uuid_generate_v4(), project.id, tenant.id,
  'Testing'
FROM tenant, project;

-- Task 5
WITH
tenant AS (SELECT id FROM tenants WHERE subdomain = 'demo'),
project AS (SELECT id FROM projects WHERE name = 'Project Beta' LIMIT 1)
INSERT INTO tasks (id, project_id, tenant_id, title)
SELECT uuid_generate_v4(), project.id, tenant.id,
  'Deployment'
FROM tenant, project;
