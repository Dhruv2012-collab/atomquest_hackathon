-- Add Escalation Logs Table
CREATE TABLE IF NOT EXISTS public.escalation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    target_role TEXT NOT NULL, -- 'Employee', 'Manager', 'HR'
    reason TEXT NOT NULL,
    escalation_level INTEGER DEFAULT 1, -- 1: Employee, 2: Manager, 3: HR
    status TEXT DEFAULT 'Open', -- 'Open', 'Resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.escalation_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access for admins and the specific user
CREATE POLICY "Users can read own escalations" ON public.escalation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all escalations" ON public.escalation_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'Admin'
        )
    );

-- Allow server/admin to insert logs
CREATE POLICY "Admins can insert escalations" ON public.escalation_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'Admin'
        )
    );
