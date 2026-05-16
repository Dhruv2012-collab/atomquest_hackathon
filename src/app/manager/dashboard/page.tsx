import { createClient } from "@/utils/supabase/server";
import ManagerReviewClient from "@/components/manager/ManagerReviewClient";

export default async function ManagerDashboardPage() {
  const supabase = await createClient();

  // Hardcoded Manager ID for 'Sarah Lead' from seed.sql
  const managerId = '00000000-0000-0000-0000-000000000011';

  // Fetch all direct reports' goal plans
  const { data: plans, error } = await supabase
    .from("goal_plans")
    .select(`
      id,
      period,
      status,
      user_id,
      users:user_id (name, email),
      goals (*)
    `)
    // Normally we'd rely on RLS, but for explicit querying:
    .neq("status", "Draft"); // Managers usually don't review Drafts until submitted, but we'll show everything for now or filter.
    
    // In our schema, RLS limits this to direct reports automatically!

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Manager Command Center</h1>
        <p className="text-muted-foreground mt-2">
          Review, edit, and approve your team's Goal Sheets for Q1 2026.
        </p>
      </div>

      <ManagerReviewClient initialPlans={plans || []} />
    </div>
  );
}
