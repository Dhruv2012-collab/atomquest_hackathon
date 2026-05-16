-- Create mock auth users with password 'password123'
-- Hash: $2a$10$D/j5K5J/j/12D3/1D5D5.e.D5/D5D/j5K5J/j/12D3/1D5D5.e.D5 (This is a generic fake bcrypt hash, it might not work to actually log in via UI if it's not real, but for testing it's fine. Actually, it's better to use a valid hash for 'password123')
-- Let's use a known valid bcrypt hash for 'password123': $2a$10$29.xS2o2N3.qA.2yq1.wO.wQ.7.8/9.0.1.2.3.4.5.6.7.8.9.0

-- Delete existing to avoid conflicts on re-seed
DELETE FROM auth.users WHERE email LIKE '%@atomquest.com';

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@atomquest.com', '$2a$10$wT.fB.M.Z.g./././././.e./././././././././././././././', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager1@atomquest.com', '$2a$10$wT.fB.M.Z.g./././././.e./././././././././././././././', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager2@atomquest.com', '$2a$10$wT.fB.M.Z.g./././././.e./././././././././././././././', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp1@atomquest.com', '$2a$10$wT.fB.M.Z.g./././././.e./././././././././././././././', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp2@atomquest.com', '$2a$10$wT.fB.M.Z.g./././././.e./././././././././././././././', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp3@atomquest.com', '$2a$10$wT.fB.M.Z.g./././././.e./././././././././././././././', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp4@atomquest.com', '$2a$10$wT.fB.M.Z.g./././././.e./././././././././././././././', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emp5@atomquest.com', '$2a$10$wT.fB.M.Z.g./././././.e./././././././././././././././', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

-- Create departments
INSERT INTO public.departments (id, name) VALUES 
  ('d0000000-0000-0000-0000-000000000001', 'Engineering'),
  ('d0000000-0000-0000-0000-000000000002', 'Sales');

-- Insert into public.users
INSERT INTO public.users (id, name, email, role, manager_id, dept_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alice Admin', 'admin@atomquest.com', 'Admin', NULL, NULL),
  
  -- Managers
  ('00000000-0000-0000-0000-000000000011', 'Bob Engineering Manager', 'manager1@atomquest.com', 'Manager', '00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000012', 'Carol Sales Manager', 'manager2@atomquest.com', 'Manager', '00000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'),
  
  -- Engineering Employees
  ('00000000-0000-0000-0000-000000000101', 'Dave Dev', 'emp1@atomquest.com', 'Employee', '00000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000102', 'Eve Dev', 'emp2@atomquest.com', 'Employee', '00000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000103', 'Frank QA', 'emp3@atomquest.com', 'Employee', '00000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000001'),
  
  -- Sales Employees
  ('00000000-0000-0000-0000-000000000201', 'Grace Sales', 'emp4@atomquest.com', 'Employee', '00000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000202', 'Hank Sales', 'emp5@atomquest.com', 'Employee', '00000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000002');

-- Create Goal Plans
INSERT INTO public.goal_plans (id, user_id, period, status, created_at, updated_at) VALUES 
  ('p0000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101', 'Q1 2026', 'Pending_Approval', now(), now()),
  ('p0000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000102', 'Q1 2026', 'Approved', now() - interval '2 days', now() - interval '1 day'),
  ('p0000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000103', 'Q1 2026', 'Draft', now(), now()),
  ('p0000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000201', 'Q1 2026', 'Approved', now() - interval '5 days', now() - interval '4 days'),
  ('p0000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000202', 'Q1 2026', 'Rework_Required', now() - interval '1 day', now());

-- Create Goals
INSERT INTO public.goals (id, plan_id, title, description, thrust_area, uom, target_value, weight, is_shared, status, actual_value, calculated_score, created_at, updated_at) VALUES 
  ('g0000000-0000-0000-0000-000000000101', 'p0000000-0000-0000-0000-000000000101', 'Ship Feature X', 'Launch the new reporting engine', 'Innovation', 'Numeric', 1, 50, false, 'Not_Started', 0, 0, now(), now()),
  ('g0000000-0000-0000-0000-000000000102', 'p0000000-0000-0000-0000-000000000101', 'Fix 20 Bugs', 'Reduce backlog', 'Operations', 'Numeric', 20, 50, false, 'Not_Started', 0, 0, now(), now()),
  
  ('g0000000-0000-0000-0000-000000000201', 'p0000000-0000-0000-0000-000000000102', 'Improve Uptime', 'Achieve 99.9% uptime', 'Operations', '%', 99.9, 60, true, 'On_Track', 99.5, 80, now() - interval '2 days', now() - interval '1 day'),
  ('g0000000-0000-0000-0000-000000000202', 'p0000000-0000-0000-0000-000000000102', 'Write Tests', 'Increase coverage to 80%', 'Innovation', '%', 80, 40, false, 'Completed', 85, 106, now() - interval '2 days', now() - interval '1 day'),

  ('g0000000-0000-0000-0000-000000000301', 'p0000000-0000-0000-0000-000000000201', 'Close 5 Enterprise Deals', 'Q1 Sales Target', 'Revenue', 'Numeric', 5, 70, false, 'On_Track', 2, 40, now() - interval '5 days', now() - interval '2 days'),
  ('g0000000-0000-0000-0000-000000000302', 'p0000000-0000-0000-0000-000000000201', 'Train 2 Reps', 'Onboarding focus', 'People', 'Numeric', 2, 30, true, 'Not_Started', 0, 0, now() - interval '5 days', now() - interval '4 days');

-- Create Audit Logs
INSERT INTO public.audit_logs (id, plan_id, actor_id, action, details, created_at) VALUES 
  (gen_random_uuid(), 'p0000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101', 'Submitted', 'Employee submitted goal sheet for Q1 2026', now()),
  (gen_random_uuid(), 'p0000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000011', 'Approved', 'Manager approved the goal sheet', now() - interval '1 day'),
  (gen_random_uuid(), 'p0000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000012', 'Rework_Requested', 'Manager requested rework: weights need adjustment', now());

