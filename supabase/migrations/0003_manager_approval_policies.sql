-- Add UPDATE policy for Managers on goal_plans
CREATE POLICY "Managers can update direct reports plans" ON goal_plans 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = goal_plans.user_id 
        AND users.manager_id = auth.uid()
    )
);

-- Add UPDATE policy for Managers on goals
-- (Managers might need to edit goals for rework before approving)
CREATE POLICY "Managers can update direct reports goals" ON goals 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM goal_plans 
        JOIN users ON users.id = goal_plans.user_id
        WHERE goal_plans.id = goals.plan_id 
        AND users.manager_id = auth.uid()
    )
);
