-- Core Enums
CREATE TYPE user_role AS ENUM ('Employee', 'Manager', 'Admin');
CREATE TYPE uom_type AS ENUM ('Numeric', '%', 'Timeline', 'Zero-based');
CREATE TYPE goal_status AS ENUM ('Not Started', 'On Track', 'Completed');
CREATE TYPE plan_status AS ENUM ('Draft', 'Pending_Approval', 'Approved', 'Rework_Required');

-- Core Tables
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'Employee',
    manager_id UUID REFERENCES users(id),
    dept_id UUID REFERENCES departments(id)
);

CREATE TABLE goal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    period TEXT NOT NULL, -- e.g. Q1 2026
    status plan_status DEFAULT 'Draft'
);

CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES goal_plans(id),
    title TEXT NOT NULL,
    description TEXT,
    thrust_area TEXT NOT NULL,
    uom uom_type NOT NULL,
    target_value NUMERIC NOT NULL,
    weight NUMERIC NOT NULL CHECK (weight >= 10), -- BRD Min Weight Limit
    status goal_status DEFAULT 'Not Started',
    is_shared BOOLEAN DEFAULT FALSE,
    primary_owner_id UUID REFERENCES users(id)
);

-- RLS setup (Enable RLS)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Everyone can read departments, Users can read their own profiles and their reports)
CREATE POLICY "Public departments" ON departments FOR SELECT USING (true);

-- Users can see themselves and anyone they manage (recursive can be complex, let's keep it simple for now: see all users to allow shared goals logic, or restrict later)
CREATE POLICY "Users can see all other users for assignment" ON users FOR SELECT USING (true);

-- Goal plans: owners and their managers can read. Owners can create/update.
CREATE POLICY "Users can manage their own plans" ON goal_plans 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Managers can read direct reports plans" ON goal_plans 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = goal_plans.user_id AND users.manager_id = auth.uid())
);

-- Goals: Same as plans
CREATE POLICY "Users can manage their own goals" ON goals 
FOR ALL USING (
    EXISTS (SELECT 1 FROM goal_plans WHERE goal_plans.id = goals.plan_id AND goal_plans.user_id = auth.uid())
);

CREATE POLICY "Managers can read direct reports goals" ON goals 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM goal_plans 
        JOIN users ON users.id = goal_plans.user_id
        WHERE goal_plans.id = goals.plan_id AND users.manager_id = auth.uid()
    )
);

-- Freeze goals post-approval (from Act III)
CREATE POLICY "Freeze goals post-approval"
ON goals
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM goal_plans 
        WHERE goal_plans.id = goals.plan_id 
        AND goal_plans.status != 'Approved'
    )
    OR (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'Admin'
);
