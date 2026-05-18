import { createClient } from "@/utils/supabase/server";
import { GoalWorkspaceForm } from "@/components/goals/GoalWorkspaceForm";
import { ProgressExecutionView } from "@/components/goals/ProgressExecutionView";
import { OnboardingGuide } from "@/components/dashboard/OnboardingGuide";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Lock,
  Scale,
  Target,
  TrendingUp,
  CheckSquare
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// STATUS SYSTEM
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Draft: {
    label: "Draft",
    pill: "bg-[#1c1c1c] text-slate-400 border-[#2a2a2a]",
    banner: null,
  },

  Pending_Approval: {
    label: "Under Review",
    pill: "bg-[#2a1a00] text-amber-500 border-amber-900",

    banner: {
      bg: "bg-[#1f1606] border-amber-900/50",
      icon: Clock3,
      iconColor: "text-amber-500",

      title: "Your plan is currently under review.",

      body: "Your manager will review your goals before the execution window opens.",
    },
  },

  Approved: {
    label: "Approved",
    pill: "bg-[#062010] text-emerald-500 border-emerald-900",

    banner: {
      bg: "bg-[#081a0e] border-emerald-900/50",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",

      title: "Your goals are now active.",

      body: "Quarterly check-ins are available for progress updates and execution tracking.",
    },
  },

  Rework_Required: {
    label: "REVISION REQUIRED",
    pill: "bg-transparent text-[#ff6b6b] border border-[#ff6b6b]/30",

    banner: {
      bg: "bg-[#1a0f0f] border-l-[#ff6b6b] border-[#2a1414]",
      icon: AlertCircle,
      iconColor: "text-[#ff6b6b]",

      title: "Your plan requires changes.",

      body: null,
    },
  },
};

// ─────────────────────────────────────────────────────────────
// METRIC CARD
// ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex-1 flex items-center gap-4 rounded-xl border border-[#222] bg-[#121212] px-5 py-4 transition-all">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a]">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
          {label}
        </p>
        <p className="text-lg font-bold text-slate-200">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();

  // Fetch logged in user's active goal plan from database
  const { data: plansData } = await supabase
    .from("goal_plans")
    .select(`
      *,
      goals (*)
    `)
    .eq("user_id", "00000000-0000-0000-0000-000000000101")
    .order("created_at", { ascending: false });

  const plan = (plansData && plansData.length > 0) ? plansData[0] : null;

  const goals = plan?.goals || [];

  const planStatus =
    (plan?.status as keyof typeof STATUS_CONFIG) || "Draft";

  const statusCfg =
    STATUS_CONFIG[planStatus] || STATUS_CONFIG.Draft;

  const totalWeight = goals.reduce(
    (sum: number, g: any) => sum + Number(g.weight || 0),
    0
  );

  const goalCount = goals.length;

  let avgScore = 0;
  if (goals.length > 0) {
    let totalScore = 0;
    goals.forEach((g: any) => {
      let score = 0;
      const target = Number(g.target_value || 0);
      const actual = Number(g.actual_value || 0);
      const uom = g.uom || "";
      if (uom.includes("Min")) {
        score = target === 0 ? 0 : (actual / target) * 100;
      } else if (uom.includes("Max")) {
        score = actual === 0 ? 100 : (target / actual) * 100;
      } else if (uom.includes("Zero-based") || uom.includes("Zero")) {
        score = actual === 0 ? 100 : 0;
      } else {
        score = actual >= target ? 100 : (actual / (target || 1)) * 100;
      }
      totalScore += Math.min(Math.max(score, 0), 120);
    });
    avgScore = Math.round(totalScore / goals.length);
  }

  return (
    <div className="relative mx-auto max-w-5xl px-6 py-10 space-y-8">
      <OnboardingGuide role="employee" defaultPlanStatus={planStatus} />

        <section id="dashboard" className="scroll-mt-32">
          {/* HEADER */}

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                Performance Dashboard
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
                Track goals, manage quarterly execution, and maintain alignment
                with organizational priorities through a structured workflow system.
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${statusCfg.pill}`}
            >
              {planStatus === "Rework_Required" && (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              {statusCfg.label}
            </div>

          </div>

          {/* STATUS NOTIFICATION */}
          {statusCfg.banner && (
            <div className={`mt-8 rounded-xl border-l-[3px] border ${statusCfg.banner.bg} p-4`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <statusCfg.banner.icon className={`h-4 w-4 ${statusCfg.banner.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-sm font-semibold ${statusCfg.banner.iconColor}`}>{statusCfg.banner.title}</h2>
                  {planStatus === "Rework_Required" && plan?.manager_comment ? (
                    <div className="mt-3 text-sm text-slate-300 bg-[#222] p-3 rounded-lg border border-[#333]">
                      <span className="font-bold text-slate-100 mr-2">Manager Feedback:</span>
                      <span className="italic">{plan.manager_comment}</span>
                    </div>
                  ) : (
                    statusCfg.banner.body && <p className="mt-1 text-sm text-slate-400">{statusCfg.banner.body}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* METRICS */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <MetricCard
              label="Quarter Window"
              value="14 Days Remaining"
              icon={Clock3}
            />
            <MetricCard
              label="Average Progress"
              value={goals.length > 0 ? `${avgScore}% Complete` : "0% Complete"}
              icon={TrendingUp}
            />
            <MetricCard
              label="Active Objectives"
              value={`0${goalCount} / 08`}
              icon={CheckSquare}
            />
          </div>
        </section>


        {/* DRAFT / REWORK */}

        <section id="goals" className="scroll-mt-32 mt-10">
          {(planStatus === "Draft" ||
            planStatus === "Rework_Required") && (
              <div className="overflow-hidden">

                <GoalWorkspaceForm
                  initialGoals={goals}
                  planStatus={planStatus}
                />

              </div>
            )}
        </section>

        {/* APPROVED */}

        <section id="check-in" className="scroll-mt-32">
          {planStatus === "Approved" && (
            <div className="mt-10 overflow-hidden rounded-2xl border border-[#222] bg-[#121212]">

              <div className="flex flex-col gap-5 border-b border-[#222] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">
                    Quarterly Execution
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Log achievements and monitor progress against approved goals.
                  </p>
                </div>
              </div>

              <div className="p-6">
                <ProgressExecutionView goals={goals} />
              </div>

            </div>
          )}
        </section>

        {/* EMPTY */}

        {!plan && (
          <div className="mt-10 rounded-2xl border border-dashed border-[#333] bg-[#121212] p-14 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1a1a]">
              <Target className="h-6 w-6 text-slate-400" />
            </div>

            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-100">
              Start Your Goal Plan
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Create structured quarterly objectives with measurable targets
              and weighted execution priorities.
            </p>

            <a
              href="#goals"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-slate-200"
            >
              Create Goal Sheet
              <ArrowRight className="h-4 w-4" />
            </a>

          </div>
        )}

    </div>
  );
}
