
CREATE TYPE task_status_enum AS ENUM (
  'todo',
  'in_progress',
  'completed'
);


CREATE TYPE task_priority_enum AS ENUM (
  'low',
  'medium',
  'high'
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  project_id UUID NOT NULL,
  tenant_id UUID NOT NULL,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  status task_status_enum NOT NULL DEFAULT 'todo',
  priority task_priority_enum NOT NULL DEFAULT 'medium',

  assigned_to UUID NULL,
  due_date DATE NULL,

  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_tasks_project
    FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_tasks_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_tasks_assigned_user
    FOREIGN KEY (assigned_to)
    REFERENCES users(id)
    ON DELETE SET NULL
);


CREATE INDEX idx_tasks_tenant_project
  ON tasks(tenant_id, project_id);
