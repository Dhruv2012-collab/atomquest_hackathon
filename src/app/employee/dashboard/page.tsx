import { createClient } from "@/utils/supabase/server";
import { GoalWorkspaceForm } from "@/components/goals/GoalWorkspaceForm";
import { ProgressExecutionView } from "@/components/goals/ProgressExecutionView";
import {
  AlertCircle, Clock, CheckCircle2, Lock,
  Target, Scale, FileText, ArrowRight
} from "lucide-react";

// ── Status config ──────────────────────────────────────────────
const STATUS_CONFIG = {
  Draft: {
    label: "Draft",
    pill: "bg-slate-100 text-slate-600",
    banner: null,
  },
  Pending_Approval: {
    label: "Pending Approval",
    pill: "bg-amber-100 text-amber-700",
    banner: {
      bg: "bg-amber-50 border-amber-200",
      icon: Clock,
      iconColor: "text-amber-500",
      title: "Your goal sheet is under review",
      body: "Sarah Lead (Manager) will review and approve your plan. You will be notified once a decision is made.",
    },
  },
  Approved: {
    label: "Approved",
    pill: "bg-emerald-100 text-emerald-700",
    banner: {
      bg: "bg-emerald-50 border-emerald-200",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      title: "Goal plan approved",
      body: "Your goal sheet has been approved. You can now log your quarterly achievements in the Check-ins tab.",
    },
  },
  Rework_Required: {
    label: "Rework Required",
    pill: "bg-red-100 text-red-700",
    banner: {
      bg: "bg-red-50 border-red-200",
      icon: AlertCircle,
      iconColor: "text-red-500",
      title: "Your plan needs revision",
      body: null, // injected dynamically with manager comment
    },
  },
};

// ── Metric Strip Tile ──────────────────────────────────────────
function MetricTile({
  label, value, sub, icon: Icon, iconBg, valueColor,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; iconBg: string; valueColor?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className={`text-xl font-bold mt-0.5 ${valueColor || "text-slate-900"}`}>{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default async function EmployeeDashboardPage() {
  const supabase = await createClient();

  // MOCK DATA INJECTION
  const mockPlan = {
    id: "p_emp1",
    status: "Rework_Required",
    period: "Q1 2026",
    manager_comment: "Please adjust the weightings to focus more on Operations.",
    goals: [
      { id: "g1", title: "Ship Feature X", description: "Launch the new reporting engine", thrust_area: "Innovation", uom: "Numeric", target_value: 1, weight: 60, is_shared: false, actual_value: 0, calculated_score: 0, status: "Not_Started" },
      { id: "g2", title: "Fix 20 Bugs", description: "Reduce backlog", thrust_area: "Operations", uom: "Numeric", target_value: 20, weight: 30, is_shared: false, actual_value: 0, calculated_score: 0, status: "Not_Started" }
    ]
  };

  const plan = mockPlan as any;
  const goals = plan?.goals || [];
  const planStatus = (plan?.status as keyof typeof STATUS_CONFIG) || "Draft";
  const statusCfg = STATUS_CONFIG[planStatus] || STATUS_CONFIG.Draft;

  const totalWeight = goals.reduce((sum: number, g: any) => sum + Number(g.weight || 0), 0);
  const goalCount = goals.length;

  const weightColor =
    totalWeight === 100 ? "text-emerald-600" :
    totalWeight > 100 ? "text-red-600" : "text-amber-600";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Q1 FY2026 · Goal Setting &amp; Performance Phase</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${statusCfg.pill}`}>
          {planStatus === "Pending_Approval" && <Clock className="w-3 h-3" />}
          {planStatus === "Approved" && <CheckCircle2 className="w-3 h-3" />}
          {planStatus === "Rework_Required" && <AlertCircle className="w-3 h-3" />}
          {statusCfg.label}
        </span>
      </div>

      {/* ── Metric Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricTile
          label="Plan Status"
          value={statusCfg.label}
          sub="Current cycle"
          icon={FileText}
          iconBg="bg-slate-100"
        />
        <MetricTile
          label="Goals Added"
          value={`${goalCount} / 8`}
          sub={goalCount >= 8 ? "Maximum reached" : `${8 - goalCount} slots remaining`}
          icon={Target}
          iconBg={goalCount >= 8 ? "bg-red-50" : "bg-blue-50"}
          valueColor={goalCount >= 8 ? "text-red-600" : undefined}
        />
        <MetricTile
          label="Weight Allocated"
          value={`${totalWeight}%`}
          sub={totalWeight === 100 ? "Target met ✓" : totalWeight > 100 ? "Exceeds 100%" : `${100 - totalWeight}% remaining`}
          icon={Scale}
          iconBg={totalWeight === 100 ? "bg-emerald-50" : "bg-amber-50"}
          valueColor={weightColor}
        />
        <MetricTile
          label="Quarter Window"
          value="14 days"
          sub="Closing 31 May 2026"
          icon={Clock}
          iconBg="bg-orange-50"
          valueColor="text-orange-600"
        />
      </div>

      {/* ── Status Banner (context-sensitive) ── */}
      {statusCfg.banner && (
        <div className={`flex items-start gap-4 p-4 rounded-xl border ${statusCfg.banner.bg}`}>
          <statusCfg.banner.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${statusCfg.banner.iconColor}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">{statusCfg.banner.title}</p>
            {statusCfg.banner.body && (
              <p className="text-sm text-slate-600 mt-1">{statusCfg.banner.body}</p>
            )}
            {/* Rework: show manager comment from plan */}
            {planStatus === "Rework_Required" && plan?.manager_comment && (
              <div className="mt-2 p-3 bg-white rounded-lg border border-red-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Manager Feedback</p>
                <p className="text-sm text-slate-700 italic">"{plan.manager_comment}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Locked State (Pending Approval) ── */}
      {planStatus === "Pending_Approval" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <h2 className="font-semibold text-slate-800">Goal Sheet — Submitted</h2>
            </div>
            <span className="text-xs text-slate-400">Read-only while under review</span>
          </div>
          <div className="divide-y divide-slate-50">
            {goals.map((goal: any) => (
              <div key={goal.id} className="px-6 py-4 flex items-start justify-between gap-4 opacity-75">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {goal.thrust_area}
                    </span>
                    {goal.is_shared && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                        🔗 Shared
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-800 truncate">{goal.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Target: {goal.target_value} · {goal.uom}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-700">{goal.weight}%</p>
                  <p className="text-[10px] text-slate-400">weight</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-slate-50 rounded-b-xl flex items-center justify-between">
            <p className="text-xs text-slate-500">{goalCount} goals · {totalWeight}% total weight</p>
            <button className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium">
              Withdraw submission
            </button>
          </div>
        </div>
      )}

      {/* ── Draft / Rework State: Goal Creation Form ── */}
      {(planStatus === "Draft" || planStatus === "Rework_Required") && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Goal Sheet</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {planStatus === "Rework_Required"
                  ? "Address manager feedback and resubmit your plan"
                  : "Define your objectives for Q1 FY2026"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Total weight must equal 100%</span>
              <span className={`font-bold ${weightColor}`}>{totalWeight}/100%</span>
            </div>
          </div>
          <div className="p-6">
            <GoalWorkspaceForm initialGoals={goals} planStatus={planStatus} />
          </div>
        </div>
      )}

      {/* ── Approved State: Progress Execution View ── */}
      {planStatus === "Approved" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Active Check-In Pulse</h2>
              <p className="text-xs text-slate-500 mt-0.5">Log your quarterly achievements for Q1 FY2026</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Window Open
            </div>
          </div>
          <div className="p-6">
            <ProgressExecutionView goals={goals} />
          </div>
        </div>
      )}

      {/* ── Empty state: no plan yet ── */}
      {!plan && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">No goal plan yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Start by defining your Q1 objectives. You can add up to 8 goals with a combined weight of exactly 100%.
          </p>
          <a
            href="/employee/goals"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Goal Sheet <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
