import { createClient } from "@/utils/supabase/server";
import { TrendingUp, Users, Target, CheckCircle2 } from "lucide-react";
import { AnalyticsCharts } from "@/components/manager/AnalyticsCharts";

export default async function ManagerAnalyticsPage() {
  const supabase = await createClient();

  const { data: plansData } = await supabase
    .from("goal_plans")
    .select(`*, users (*), goals (*)`)
    .eq("status", "Approved");

  const mockApprovedPlans = [
    {
      id: "p2", period: "Q1 2026", status: "Approved", user_id: "u2",
      users: { name: "Eve Engineer", email: "eve@example.com" },
      goals: [
        { id: "g3", title: "Improve Uptime", thrust_area: "Operations", uom: "%", target_value: 99.9, weight: 60, is_shared: true, actual_value: 99.5, calculated_score: 80, status: "On Track", manager_comment: "Good progress" },
        { id: "g4", title: "Write Tests", thrust_area: "Innovation", uom: "%", target_value: 80, weight: 40, is_shared: false, actual_value: 85, calculated_score: 106, status: "Completed", manager_comment: null }
      ]
    },
    {
      id: "p3", period: "Q1 2026", status: "Approved", user_id: "u3",
      users: { name: "Alice Marketing", email: "alice@example.com" },
      goals: [
        { id: "g5", title: "Launch Q1 Campaign", thrust_area: "Revenue", uom: "Timeline", target_value: 100, weight: 100, is_shared: false, actual_value: 100, calculated_score: 100, status: "Completed", manager_comment: "Great execution" }
      ]
    }
  ];

  const approvedPlans = (plansData && plansData.length > 0) ? plansData : mockApprovedPlans;

  // Calculate dynamic stats for the tiles
  const totalReports = new Set(approvedPlans.map(p => p.user_id)).size;
  const activeGoals = approvedPlans.reduce((acc, p) => acc + (p.goals?.length || 0), 0);
  
  let totalScore = 0, totalWeight = 0, completedGoals = 0;
  approvedPlans.forEach(p => {
    p.goals?.forEach((g: any) => {
      totalScore += Number(g.calculated_score || 0);
      totalWeight += Number(g.weight || 0);
      if (g.status === "Completed") completedGoals++;
    });
  });

  const avgScore = totalWeight > 0 ? ((totalScore / totalWeight) * 100).toFixed(1) : "0.0";
  const checkinRate = activeGoals > 0 ? ((completedGoals / activeGoals) * 100).toFixed(1) : "0.0";

  const teamPerformance = approvedPlans.map(plan => {
    const goals = plan.goals || [];
    const tWeight = goals.reduce((acc: number, g: any) => acc + Number(g.weight || 0), 0);
    const tScore = goals.reduce((acc: number, g: any) => acc + Number(g.calculated_score || 0), 0);
    const score = tWeight > 0 ? (tScore / tWeight) * 100 : 0;
    
    return {
      name: plan.users?.name?.split(" ")[0] || "Unknown",
      score: Number(score.toFixed(1))
    };
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Team Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Performance trends and KPI distribution for your direct reports.</p>
        </div>
      </div>

      {/* KPI Summary Tiles */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Team Avg Score", value: `${avgScore}%`, sub: "Based on approved weights", icon: TrendingUp, color: "text-emerald-400", bg: "bg-[#062010] border border-emerald-900/50" },
          { label: "Active Goals", value: activeGoals.toString(), sub: `Across ${totalReports} reports`, icon: Target, color: "text-blue-400", bg: "bg-[#001a2a] border border-blue-900/50" },
          { label: "Check-in Rate", value: `${checkinRate}%`, sub: "Completion ratio", icon: CheckCircle2, color: "text-purple-400", bg: "bg-[#1a0b2e] border border-purple-900/50" },
          { label: "Direct Reports", value: totalReports.toString(), sub: "With approved plans", icon: Users, color: "text-amber-400", bg: "bg-[#2a1a00] border border-amber-900/50" },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-[#151515] border border-[#222] rounded-xl p-5 shadow-sm hover:border-[#333] transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                  <h3 className="text-2xl font-bold text-slate-100 mt-1 tracking-tight">{kpi.value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-3">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Component */}
      <AnalyticsCharts teamPerformance={teamPerformance} />
    </div>
  );
}
