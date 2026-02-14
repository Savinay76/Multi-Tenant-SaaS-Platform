
CREATE TYPE user_role_enum AS ENUM (
  'super_admin',
  'tenant_admin',
  'user'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role_enum NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_users_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE,

 
  CONSTRAINT unique_email_per_tenant
    UNIQUE (tenant_id, email)
);
