
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TYPE subscription_plan_enum AS ENUM (
  'free',
  'pro',
  'enterprise'
);


CREATE TYPE tenant_status_enum AS ENUM (
  'active',
  'suspended',
  'trial'
);

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(63) NOT NULL UNIQUE,
  status tenant_status_enum NOT NULL DEFAULT 'active',
  subscription_plan subscription_plan_enum NOT NULL DEFAULT 'free',
  max_users INTEGER NOT NULL DEFAULT 5,
  max_projects INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
