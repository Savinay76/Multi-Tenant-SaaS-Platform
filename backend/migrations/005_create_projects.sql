CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  tenant_id UUID NOT NULL
    REFERENCES tenants(id) ON DELETE CASCADE,

  created_by_id UUID
    REFERENCES users(id) ON DELETE SET NULL,

  name VARCHAR(255) NOT NULL,
  description TEXT,

  status enum_projects_status DEFAULT 'active',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
