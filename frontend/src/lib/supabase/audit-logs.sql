-- Audit logs schema for Dashboard Daddy
-- Tracks who did what when + IP + user agent

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_name TEXT,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  target TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_role ON audit_logs(actor_role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Access policy: only Admin/Security can read audit logs (customize as needed)
CREATE POLICY "audit_logs_read_admin" ON audit_logs
  FOR SELECT TO authenticated
  USING (coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role', '') IN ('admin', 'security'));

-- Insert policy: any authenticated user can write audit events (e.g., from the app)
CREATE POLICY "audit_logs_write_authenticated" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Optional: enable realtime for audit logs
-- ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
