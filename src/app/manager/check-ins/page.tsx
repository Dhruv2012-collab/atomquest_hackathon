import { createClient } from "@/utils/supabase/server";
import { Clock, MessageSquare, TrendingUp } from "lucide-react";

export default async function ManagerCheckInsPage() {
  const supabase = await createClient();

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

  const approvedPlans = mockApprovedPlans as any[];

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
          <h1 className="text-2xl font-bold text-slate-900">Team Check-ins</h1>
          <p className="text-sm text-slate-500 mt-1">Review Q1 FY2026 achievement updates across your team.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{avgScore}{avgScore !== "—" ? "%" : ""}</p>
            <p className="text-xs text-slate-400">Team avg score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{approvedPlans.length}</p>
            <p className="text-xs text-slate-400">Active plans</p>
          </div>
        </div>
      </div>

      {/* Quarter indicator */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
        {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
          <div key={q} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
              q === "Q1" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              {q === "Q1" && <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />}
              {q}
            </div>
            {i < 3 && <div className="w-6 h-px bg-slate-200" />}
          </div>
        ))}
        <span className="ml-auto text-xs text-slate-400 font-medium">Apr – Jun 2026 · Window: <span className="text-emerald-600 font-bold">Open</span></span>
      </div>

      {approvedPlans.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No approved plans yet</p>
          <p className="text-xs text-slate-400 mt-1">Plans appear here once you approve them in the Approvals tab.</p>
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
              <div key={plan.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {/* Plan header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {plan.users?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{plan.users?.name}</p>
                      <p className="text-xs text-slate-400">{plan.users?.email} · {plan.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        scoreNum >= 100 ? "text-emerald-600" : scoreNum >= 70 ? "text-amber-600" : "text-red-600"
                      }`}>{planAvg}%</p>
                      <p className="text-xs text-slate-400">avg score</p>
                    </div>
                    <div className="w-24">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
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
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <th className="text-left px-6 py-2.5">Goal</th>
                        <th className="text-center px-4 py-2.5">Target</th>
                        <th className="text-center px-4 py-2.5">Actual</th>
                        <th className="text-center px-4 py-2.5">Weight</th>
                        <th className="text-center px-4 py-2.5">Score</th>
                        <th className="text-center px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5 min-w-48">Manager Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {goals.map((goal: any) => {
                        const gs = Number(goal.calculated_score || 0).toFixed(1);
                        return (
                          <tr key={goal.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="font-medium text-slate-800 leading-tight">{goal.title}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{goal.thrust_area} · {goal.uom}</p>
                                </div>
                                {goal.is_shared && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded uppercase tracking-wider flex-shrink-0">
                                    🔗 Shared
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-medium text-slate-700">{goal.target_value}</td>
                            <td className="px-4 py-3 text-center font-bold text-blue-600">{goal.actual_value ?? "—"}</td>
                            <td className="px-4 py-3 text-center text-slate-500">{goal.weight}%</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                Number(gs) >= 100 ? "bg-emerald-100 text-emerald-700" :
                                Number(gs) >= 70  ? "bg-amber-100 text-amber-700" :
                                                    "bg-red-100 text-red-700"
                              }`}>{gs}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                goal.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                                goal.status === "On Track"  ? "bg-blue-100 text-blue-700" :
                                                              "bg-slate-100 text-slate-500"
                              }`}>
                                {goal.status || "Not Started"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {goal.manager_comment ? (
                                <div className="flex items-start gap-1.5">
                                  <MessageSquare className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-slate-600 italic">{goal.manager_comment}</p>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-300">No note yet</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
