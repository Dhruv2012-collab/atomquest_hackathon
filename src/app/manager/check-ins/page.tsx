import { createClient } from "@/utils/supabase/server";
import { Clock, MessageSquare, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ManagerCheckInsPage() {
  const supabase = await createClient();

  const { data: plansData } = await supabase
    .from("goal_plans")
    .select(`
      *,
      users (*),
      goals (*)
    `)
    .eq("status", "Approved")
    .order("created_at", { ascending: false });

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

  // Calculate team avg score
  let totalScore = 0, totalWeight = 0;
  approvedPlans.forEach((p: any) => {
    p.goals?.forEach((g: any) => {
      totalScore += Number(g.calculated_score || 0);
      totalWeight += Number(g.weight || 0);
    });
  });
  const avgScore = totalWeight > 0 ? ((totalScore / totalWeight) * 100).toFixed(0) : "—";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Check-ins</h1>
          <p className="text-sm text-slate-400 mt-1">Review Q1 FY2026 achievement updates across your team.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{avgScore}{avgScore !== "—" ? "%" : ""}</p>
            <p className="text-xs text-slate-400">Team avg score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{approvedPlans.length}</p>
            <p className="text-xs text-slate-400">Active plans</p>
          </div>
        </div>
      </div>

      {/* Quarter indicator */}
      <div className="flex items-center gap-3 bg-[#121212] border border-[#333] rounded-xl px-5 py-3 shadow-sm">
        {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
          <div key={q} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
              q === "Q1" ? "bg-emerald-600 text-white" : "bg-[#222] text-slate-400"
            }`}>
              {q === "Q1" && <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />}
              {q}
            </div>
            {i < 3 && <div className="w-6 h-px bg-[#333]" />}
          </div>
        ))}
        <span className="ml-auto text-xs text-slate-400 font-medium">Apr – Jun 2026 · Window: <span className="text-emerald-500 font-bold">Open</span></span>
      </div>

      {approvedPlans.length === 0 ? (
        <div className="bg-[#121212] border border-dashed border-[#333] rounded-xl p-12 text-center">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">No approved plans yet</p>
          <p className="text-xs text-slate-500 mt-1">Plans appear here once you approve them in the Approvals tab.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvedPlans.map((plan: any) => {
            const goals = plan.goals || [];
            const planWeight = goals.reduce((s: number, g: any) => s + Number(g.weight || 0), 0);
            const planScore = goals.reduce((s: number, g: any) => s + Number(g.calculated_score || 0), 0);
            const planAvg = planWeight > 0 ? ((planScore / planWeight) * 100).toFixed(0) : 0;
            const scoreNum = Number(planAvg);

            return (
              <div key={plan.id} className="bg-[#121212] border border-[#333] rounded-xl shadow-sm overflow-hidden">
                {/* Plan header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] border-b border-[#222]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#062010] flex items-center justify-center text-emerald-500 font-bold text-sm border border-emerald-900/50">
                      {plan.users?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{plan.users?.name}</p>
                      <p className="text-xs text-slate-400">{plan.users?.email} · {plan.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        scoreNum >= 100 ? "text-emerald-500" : scoreNum >= 70 ? "text-amber-500" : "text-red-500"
                      }`}>{planAvg}%</p>
                      <p className="text-xs text-slate-400">avg score</p>
                    </div>
                    <div className="w-24">
                      <div className="w-full bg-[#333] rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            scoreNum >= 100 ? "bg-emerald-500" : scoreNum >= 70 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(scoreNum, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Goals table */}
                <div className="overflow-x-auto">
                  <Table className="w-full text-sm">
                    <TableHeader>
                      <TableRow className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#333] hover:bg-transparent">
                        <TableHead className="text-left px-6 py-2.5 h-auto">Goal</TableHead>
                        <TableHead className="text-center px-4 py-2.5 h-auto">Target</TableHead>
                        <TableHead className="text-center px-4 py-2.5 h-auto">Actual</TableHead>
                        <TableHead className="text-center px-4 py-2.5 h-auto">Weight</TableHead>
                        <TableHead className="text-center px-4 py-2.5 h-auto">Score</TableHead>
                        <TableHead className="text-center px-4 py-2.5 h-auto">Status</TableHead>
                        <TableHead className="px-4 py-2.5 min-w-48 h-auto">Manager Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-[#222]">
                      {goals.map((goal: any) => {
                        const gs = Number(goal.calculated_score || 0).toFixed(1);
                        return (
                          <TableRow key={goal.id} className="hover:bg-[#1a1a1a] transition-colors border-b-0">
                            <TableCell className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="font-medium text-slate-200 leading-tight">{goal.title}</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">{goal.thrust_area} · {goal.uom}</p>
                                </div>
                                {goal.is_shared && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#1a0b2e] text-purple-400 border border-purple-900/50 rounded uppercase tracking-wider flex-shrink-0">
                                    🔗 Shared
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center font-medium text-slate-300">{goal.target_value}</TableCell>
                            <TableCell className="px-4 py-3 text-center font-bold text-blue-400">{goal.actual_value ?? "—"}</TableCell>
                            <TableCell className="px-4 py-3 text-center text-slate-400">{goal.weight}%</TableCell>
                            <TableCell className="px-4 py-3 text-center">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                                Number(gs) >= 100 ? "bg-[#062010] text-emerald-500 border-emerald-900/50" :
                                Number(gs) >= 70  ? "bg-[#2a1a00] text-amber-500 border-amber-900/50" :
                                                    "bg-[#2a0505] text-red-500 border-red-900/50"
                              }`}>{gs}</span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                goal.status === "Completed" ? "bg-[#062010] text-emerald-500 border-emerald-900/50" :
                                goal.status === "On Track"  ? "bg-blue-900/30 text-blue-400 border-blue-900/50" :
                                                              "bg-[#222] text-slate-400 border-[#333]"
                              }`}>
                                {goal.status || "Not Started"}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              {goal.manager_comment ? (
                                <div className="flex items-start gap-1.5">
                                  <MessageSquare className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-slate-400 italic">{goal.manager_comment}</p>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-600">No note yet</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
