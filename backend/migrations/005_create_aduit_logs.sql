CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  tenant_id UUID NULL,
  user_id UUID NULL,

  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,

  ip_address VARCHAR(45),

  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_audit_tenant
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE SET NULL,

  CONSTRAINT fk_audit_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);


CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
