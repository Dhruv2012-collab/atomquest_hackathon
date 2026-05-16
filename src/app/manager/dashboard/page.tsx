import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import {
  ClipboardList, UserX, Clock, TrendingUp,
  CheckCircle2, AlertCircle, FileText, ArrowRight, Users
} from "lucide-react";

type PlanStatus = "Draft" | "Pending_Approval" | "Approved" | "Rework_Required";

const STATUS_STYLE: Record<PlanStatus, { pill: string; label: string; icon: React.ElementType }> = {
  Draft: { pill: "bg-slate-100 text-slate-600", label: "Draft", icon: FileText },
  Pending_Approval: { pill: "bg-amber-100 text-amber-700", label: "Pending Review", icon: Clock },
  Approved: { pill: "bg-emerald-100 text-emerald-700", label: "Approved", icon: CheckCircle2 },
  Rework_Required: { pill: "bg-red-100 text-red-700", label: "Rework Required", icon: AlertCircle },
};

function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

export default async function ManagerDashboardPage() {
  const supabase = await createClient();
  const managerId = "00000000-0000-0000-0000-000000000011";

  // MOCK DATA INJECTION
  const mockPlans = [
    { id: "p1", status: "Pending_Approval", period: "Q1 2026", user_id: "u1", users: { name: "Dave Dev", email: "dave@example.com" }, goals: [{ id: "g1", weight: 50 }, { id: "g2", weight: 50 }] },
    { id: "p2", status: "Approved", period: "Q1 2026", user_id: "u2", users: { name: "Eve Engineer", email: "eve@example.com" }, goals: [{ id: "g3", weight: 60, calculated_score: 80 }, { id: "g4", weight: 40, calculated_score: 106 }] },
    { id: "p3", status: "Rework_Required", period: "Q1 2026", user_id: "u3", users: { name: "Bob Smith", email: "bob@example.com" }, goals: [{ id: "g5", weight: 100 }] }
  ];

  const allPlans = mockPlans as any[];

  const pendingCount = allPlans.filter((p) => p.status === "Pending_Approval").length;
  const approvedCount = allPlans.filter((p) => p.status === "Approved").length;
  const reworkCount = allPlans.filter((p) => p.status === "Rework_Required").length;

  // Calculate avg team score across approved plans
  let totalScore = 0, totalWeight = 0;
  allPlans.forEach((p: any) => {
    if (p.status === "Approved") {
      p.goals?.forEach((g: any) => {
        totalScore += Number(g.calculated_score || 0);
        totalWeight += Number(g.weight || 0);
      });
    }
  });
  const avgScore = totalWeight > 0 ? ((totalScore / totalWeight) * 100).toFixed(0) : "—";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manager Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Team overview · Q1 FY2026</p>
        </div>
        <Link
          href="/manager/approvals"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
        >
          <ClipboardList className="w-4 h-4" />
          Review Approvals
          {pendingCount > 0 && (
            <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Pending Approvals"
          value={pendingCount}
          sub="Awaiting your review"
          icon={ClipboardList}
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Approved Plans"
          value={approvedCount}
          sub="Active in check-in"
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Returned for Rework"
          value={reworkCount}
          sub="Awaiting resubmission"
          icon={AlertCircle}
          accent="bg-red-50 text-red-600"
        />
        <StatCard
          label="Team Avg Score"
          value={avgScore === "—" ? "—" : `${avgScore}%`}
          sub="Across approved goals"
          icon={TrendingUp}
          accent="bg-blue-50 text-blue-600"
        />
      </div>

      {/* ── Team Status Table ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-800">Direct Reports</h2>
          </div>
          <span className="text-xs text-slate-400">{allPlans.length} employees</span>
        </div>

        {allPlans.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No submitted plans found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {allPlans.map((plan: any) => {
              const s = plan.status as PlanStatus;
              const cfg = STATUS_STYLE[s] || STATUS_STYLE.Draft;
              const Icon = cfg.icon;
              const goalsCount = plan.goals?.length || 0;

              // Per-plan score
              let planScore = 0, planWeight = 0;
              plan.goals?.forEach((g: any) => {
                planScore += Number(g.calculated_score || 0);
                planWeight += Number(g.weight || 0);
              });
              const scoreDisplay = planWeight > 0 && s === "Approved"
                ? `${((planScore / planWeight) * 100).toFixed(0)}%`
                : "—";

              return (
                <div key={plan.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                    {plan.users?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{plan.users?.name || "Unknown"}</p>
                    <p className="text-xs text-slate-400 truncate">{plan.users?.email}</p>
                  </div>

                  {/* Goals count */}
                  <div className="text-center w-16 hidden sm:block">
                    <p className="text-sm font-medium text-slate-700">{goalsCount}</p>
                    <p className="text-[10px] text-slate-400">goals</p>
                  </div>

                  {/* Score */}
                  <div className="text-center w-16 hidden md:block">
                    <p className="text-sm font-medium text-slate-700">{scoreDisplay}</p>
                    <p className="text-[10px] text-slate-400">score</p>
                  </div>

                  {/* Status pill */}
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.pill}`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>

                  {/* Action */}
                  <Link
                    href={`/manager/approvals`}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                      s === "Pending_Approval"
                        ? "bg-amber-600 text-white hover:bg-amber-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {s === "Pending_Approval" ? "Review" : "View"}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/manager/check-ins"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <p className="font-semibold text-slate-800 text-sm">Team Check-ins</p>
          <p className="text-xs text-slate-500 mt-1">Review Q1 achievement updates and add structured feedback.</p>
        </Link>

        <Link
          href="/manager/analytics"
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
          </div>
          <p className="font-semibold text-slate-800 text-sm">Team Analytics</p>
          <p className="text-xs text-slate-500 mt-1">Goal distribution, completion trends, and score breakdowns.</p>
        </Link>
      </div>
    </div>
  );
}
