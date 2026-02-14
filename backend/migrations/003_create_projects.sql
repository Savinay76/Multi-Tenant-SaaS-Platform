
CREATE TYPE project_status_enum AS ENUM (
  'active',
  'archived',
  'completed'
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status project_status_enum NOT NULL DEFAULT 'active',

  created_by UUID NOT NULL,

  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_projects_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_projects_creator
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE CASCADE
);


CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
