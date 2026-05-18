import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import {
  ClipboardList, ArrowUpRight, ArrowDownRight, TrendingUp, CheckCircle2,
  AlertCircle, ArrowRight, Settings, Plus, LayoutList,
  MoreVertical, FileText
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ManagerChart } from "@/components/manager/ManagerChart";
import { OnboardingGuide } from "@/components/dashboard/OnboardingGuide";

type PlanStatus = "Draft" | "Pending_Approval" | "Approved" | "Rework_Required";

const STATUS_STYLE: Record<PlanStatus, { color: string; label: string; icon: React.ElementType }> = {
  Draft: { color: "text-slate-400", label: "Draft", icon: FileText },
  Pending_Approval: { color: "text-amber-500", label: "Pending Review", icon: AlertCircle },
  Approved: { color: "text-emerald-500", label: "Approved", icon: CheckCircle2 },
  Rework_Required: { color: "text-[#ff6b6b]", label: "Rework Required", icon: AlertCircle },
};

function StatCard({
  label, value, trend, isUp, sub, desc
}: {
  label: string; value: string | number; trend: string; isUp: boolean; sub: string; desc: string;
}) {
  return (
    <div className="bg-[#151515] border border-[#222] rounded-xl p-5 flex flex-col justify-between h-[150px] relative hover:border-[#333] transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-slate-400">{label}</p>
        <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${isUp
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span>{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-3xl font-semibold text-slate-100 tracking-tight">{value}</p>
      </div>
      <div>
        <p className="text-[12px] font-medium text-slate-300 flex items-center gap-1.5">
          {sub} {isUp ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export default async function ManagerDashboardPage() {
  const supabase = await createClient();

  const { data: plansData } = await supabase
    .from("goal_plans")
    .select(`
      *,
      users (*),
      goals (*)
    `)
    .order("created_at", { ascending: false });

  // MOCK DATA INJECTION
  const mockPlans = [
    { id: "p1", status: "Pending_Approval", period: "Q1 2026", user_id: "u1", users: { name: "Dave Dev", email: "Engineering" }, goals: [{ id: "g1", weight: 50 }, { id: "g2", weight: 50 }] },
    { id: "p2", status: "Approved", period: "Q1 2026", user_id: "u2", users: { name: "Eve Engineer", email: "Product" }, goals: [{ id: "g3", weight: 60, calculated_score: 80 }, { id: "g4", weight: 40, calculated_score: 106 }] },
    { id: "p3", status: "Rework_Required", period: "Q1 2026", user_id: "u3", users: { name: "Bob Smith", email: "Marketing" }, goals: [{ id: "g5", weight: 100 }] },
    { id: "p4", status: "Approved", period: "Q1 2026", user_id: "u4", users: { name: "Alice Adams", email: "Sales" }, goals: [{ id: "g6", weight: 100, calculated_score: 95 }] }
  ];

  const allPlans = (plansData && plansData.length > 0) ? plansData : mockPlans;

  const pendingCount = allPlans.filter((p: any) => p.status === "Pending_Approval").length;
  const approvedCount = allPlans.filter((p: any) => p.status === "Approved").length;
  const reworkCount = allPlans.filter((p: any) => p.status === "Rework_Required").length;
  const totalGoals = allPlans.reduce((acc: number, p: any) => acc + (p.goals?.length || 0), 0);

  let totalScore = 0, totalWeight = 0;
  allPlans.forEach((p: any) => {
    if (p.status === "Approved") {
      p.goals?.forEach((g: any) => {
        totalScore += Number(g.calculated_score || 0);
        totalWeight += Number(g.weight || 0);
      });
    }
  });
  const avgScore = totalWeight > 0 ? ((totalScore / totalWeight) * 100).toFixed(1) : "—";

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">

      {/* ── Top Nav (Mocking the inner Dashboard header) ── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center">
            <LayoutList className="w-4 h-4 text-slate-300" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">Team Dashboard</h1>
        </div>
        <div className="text-sm font-medium text-slate-400">
          AtomQuest Portal
        </div>
      </div>

      <OnboardingGuide role="manager" />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Active Goals"
          value={totalGoals}
          trend="+12.5%"
          isUp={true}
          sub="Across all reports"
          desc="Goal activity for the last 6 months"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingCount}
          trend="-20%"
          isUp={false}
          sub="Down 20% this period"
          desc="Manager review needs attention"
        />
        <StatCard
          label="Avg Team Score"
          value={avgScore === "—" ? "—" : `${avgScore}%`}
          trend="+12.5%"
          isUp={true}
          sub="Strong performance retention"
          desc="Engagement exceeds targets"
        />
        <StatCard
          label="Check-in Rate"
          value="84.5%"
          trend="+4.5%"
          isUp={true}
          sub="Steady completion increase"
          desc="Meets operational projections"
        />
      </div>

      {/* ── Chart Section ── */}
      <div className="bg-[#151515] border border-[#222] rounded-xl p-5 w-full mt-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-200">Execution Velocity</h2>
            <p className="text-[12px] text-slate-500 mt-1">Goal updates for the last 3 months</p>
          </div>
          <div className="flex bg-[#0f0f0f] border border-[#222] rounded-lg p-1">
            <button className="text-[11px] font-medium px-3 py-1.5 bg-[#2a2a2a] text-slate-200 rounded-md">Last 3 months</button>
            <button className="text-[11px] font-medium px-3 py-1.5 text-slate-400 hover:text-slate-200">Last 30 days</button>
            <button className="text-[11px] font-medium px-3 py-1.5 text-slate-400 hover:text-slate-200">Last 7 days</button>
          </div>
        </div>
        <div className="h-[250px] w-full">
          <ManagerChart />
        </div>
      </div>

      {/* ── Filters & Actions ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-2 gap-4 mt-4">
        <div className="flex flex-wrap items-center gap-2 bg-[#0f0f0f] p-1 rounded-full border border-[#222]">
          <button className="px-4 py-1.5 text-[12px] font-medium bg-[#2a2a2a] text-slate-200 rounded-full border border-[#333]">All Reports</button>
          <button className="px-4 py-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-200 bg-transparent rounded-full flex items-center gap-1.5">
            Rework Required <span className="bg-[#222] text-slate-300 rounded px-1.5 py-0.5 text-[10px]">{reworkCount}</span>
          </button>
          <button className="px-4 py-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-200 bg-transparent rounded-full flex items-center gap-1.5">
            Pending <span className="bg-[#222] text-slate-300 rounded px-1.5 py-0.5 text-[10px]">{pendingCount}</span>
          </button>
          <button className="px-4 py-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-200 bg-transparent rounded-full flex items-center gap-1.5">
            Approved <span className="bg-[#222] text-slate-300 rounded px-1.5 py-0.5 text-[10px]">{approvedCount}</span>
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-1.5 text-[12px] font-medium text-slate-300 border border-[#333] bg-[#121212] rounded-lg hover:bg-[#222] transition-colors">
            <Settings className="w-3 h-3" /> Customize
          </button>
          <Link href="/manager/approvals" className="flex items-center gap-2 px-4 py-1.5 text-[12px] font-medium text-slate-300 border border-[#333] bg-[#121212] rounded-lg hover:bg-[#222] transition-colors">
            <ArrowRight className="w-3 h-3" /> Go to Approvals
          </Link>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#151515] border border-[#222] rounded-xl overflow-hidden w-full mt-4">
        <Table>
          <TableHeader className="bg-[#0f0f0f] border-b border-[#222]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[40px] pl-5"><input type="checkbox" className="rounded bg-[#222] border-[#444] cursor-pointer" /></TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 py-3 uppercase tracking-wider">Employee</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 py-3 uppercase tracking-wider">Department</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 py-3 uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 text-right py-3 uppercase tracking-wider">Total Goals</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 text-right py-3 uppercase tracking-wider">Avg Score</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 py-3 uppercase tracking-wider">Last Reviewer</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allPlans.map((plan: any) => {
              const s = plan.status as PlanStatus;
              const cfg = STATUS_STYLE[s] || STATUS_STYLE.Draft;
              const Icon = cfg.icon;

              let planScore = 0, planWeight = 0;
              plan.goals?.forEach((g: any) => {
                planScore += Number(g.calculated_score || 0);
                planWeight += Number(g.weight || 0);
              });
              const scoreDisplay = planWeight > 0 && s === "Approved"
                ? `${((planScore / planWeight) * 100).toFixed(0)}%`
                : "—";

              return (
                <TableRow key={plan.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors group">
                  <TableCell className="pl-5 py-4">
                    <input type="checkbox" className="rounded bg-[#222] border-[#444] cursor-pointer" />
                  </TableCell>
                  <TableCell className="font-medium text-slate-200 text-sm">
                    {plan.users?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-400 text-[11px] px-2 py-1 rounded-md border border-[#333] bg-[#0a0a0a]">
                      {plan.users?.department || plan.users?.email || "General"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1.5 text-[12px] font-medium ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-slate-300 text-[13px] font-medium">
                    {plan.goals?.length || 0}
                  </TableCell>
                  <TableCell className="text-right text-slate-300 text-[13px] font-bold">
                    {scoreDisplay}
                  </TableCell>
                  <TableCell className="text-slate-400 text-[13px]">
                    You
                  </TableCell>
                  <TableCell>
                    <Link href={`/manager/approvals`} className="text-emerald-500 hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-end">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
