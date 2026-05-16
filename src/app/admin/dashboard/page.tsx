import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import AdminPlanManagementClient from "@/components/admin/AdminPlanManagementClient";

export default async function ExecutiveDashboardPage() {
  const supabase = await createClient();

  const { data: goals } = await supabase.from("goals").select("calculated_score, weight, status");
  const { data: plans } = await supabase.from("goal_plans").select("id, period, status, user_id, users:user_id(name, email)");

  const totalGoals = goals?.length || 0;
  const completedGoals = goals?.filter(g => g.status === 'Completed').length || 0;
  
  // A simplistic organization-wide completion score
  // Sum of all calculated_score vs sum of all weights
  const totalWeight = goals?.reduce((sum, g) => sum + Number(g.weight), 0) || 1;
  const totalScore = goals?.reduce((sum, g) => sum + Number(g.calculated_score), 0) || 0;
  
  const orgCompletionPercent = ((totalScore / totalWeight) * 100).toFixed(1);

  const approvedPlans = plans?.filter(p => p.status === 'Approved').length || 0;
  const totalPlans = plans?.length || 0;

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
          <p className="text-muted-foreground mt-2">
            Real-time organizational performance metrics.
          </p>
        </div>
        <a href="/api/export">
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Org-Wide Goal Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{orgCompletionPercent}%</div>
            <p className="text-xs text-muted-foreground mt-1">Weighted average across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Goals Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{completedGoals} / {totalGoals}</div>
            <p className="text-xs text-muted-foreground mt-1">Individual targets hit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Plans Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{approvedPlans} / {totalPlans}</div>
            <p className="text-xs text-muted-foreground mt-1">Lock-in rate for Q1</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Management & Governance Table */}
      <AdminPlanManagementClient initialPlans={plans || []} />
    </div>
  );
}
