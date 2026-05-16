-- Migration: System Audit Logs

CREATE TABLE system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure admin read-only access (RLS)
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON system_audit_logs 
FOR SELECT USING (
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'Admin'
);

-- Trigger Function
CREATE OR REPLACE FUNCTION log_goal_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO system_audit_logs(table_name, record_id, action, new_data, changed_by)
        VALUES ('goals', NEW.id, 'INSERT', row_to_json(NEW)::jsonb, auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO system_audit_logs(table_name, record_id, action, old_data, new_data, changed_by)
        VALUES ('goals', NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO system_audit_logs(table_name, record_id, action, old_data, changed_by)
        VALUES ('goals', OLD.id, 'DELETE', row_to_json(OLD)::jsonb, auth.uid());
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_audit_goals
AFTER INSERT OR UPDATE OR DELETE ON goals
FOR EACH ROW EXECUTE FUNCTION log_goal_changes();

CREATE TRIGGER trg_audit_plans
AFTER INSERT OR UPDATE OR DELETE ON goal_plans
FOR EACH ROW EXECUTE FUNCTION log_goal_changes();
