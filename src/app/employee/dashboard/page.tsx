import { GoalWorkspaceForm } from "@/components/goals/GoalWorkspaceForm";
import { createClient } from "@/utils/supabase/server";

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();
  
  // Hardcoded for 'Dave Dev' testing. In reality, get from auth session.
  const userId = '00000000-0000-0000-0000-000000000101';
  
  // Fetch existing plan
  const { data: plan } = await supabase
    .from("goal_plans")
    .select("*, goals(*)")
    .eq("user_id", userId)
    .eq("period", "Q1 2026")
    .maybeSingle();

  const existingGoals = plan?.goals || [];

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Employee Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back. You are currently in the <strong>Goal Setting Phase</strong>.
        </p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6">
        <GoalWorkspaceForm initialGoals={existingGoals} planStatus={plan?.status || "Draft"} />
      </div>
    </div>
  );
}
