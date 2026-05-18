import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import {
  Users, CheckCircle2, ClipboardList, AlertCircle,
  Shield, Download, Lock, ScrollText, TrendingUp, ArrowRight
} from "lucide-react";
import AdminPlanManagementClient from "@/components/admin/AdminPlanManagementClient";
import { OnboardingGuide } from "@/components/dashboard/OnboardingGuide";

function CommandTile({
  label, value, sub, icon: Icon, accent, href,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; accent: string; href?: string;
}) {
  const content = (
    <div className={`bg-[#151515] border border-[#222] rounded-xl p-5 flex flex-col justify-between h-[140px] relative hover:border-[#333] transition-colors ${href ? "cursor-pointer group" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-slate-400">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-semibold text-slate-100 tracking-tight">{value}</p>
        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          {sub}
          {href && <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors ml-1" />}
        </p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch users count
  const { data: dbUsers } = await supabase
    .from("users")
    .select("id");

  // Fetch plans
  const { data: dbPlans } = await supabase
    .from("goal_plans")
    .select(`
      *,
      users (*),
      goals (*)
    `);

  // Fetch goals
  const { data: dbGoals } = await supabase
    .from("goals")
    .select("*");

  // MOCK DATA INJECTION (as fallback if empty)
  const mockUsers = [{ id: "u1" }, { id: "u2" }, { id: "u3" }, { id: "u4" }, { id: "u5" }];
  const mockPlans = [
    { id: "p1", status: "Pending_Approval", period: "Q1 2026", user_id: "u1", users: { name: "Dave Dev", email: "dave@example.com" } },
    { id: "p2", status: "Approved", period: "Q1 2026", user_id: "u2", users: { name: "Eve Engineer", email: "eve@example.com" } },
    { id: "p3", status: "Rework_Required", period: "Q1 2026", user_id: "u3", users: { name: "Bob Smith", email: "bob@example.com" } }
  ];
  const mockGoals = [
    { id: "g1", weight: 50, calculated_score: 0, status: "Not Started", thrust_area: "Innovation" },
    { id: "g2", weight: 50, calculated_score: 0, status: "Not Started", thrust_area: "Operations" },
    { id: "g3", weight: 60, calculated_score: 80, status: "On Track", thrust_area: "Operations" },
    { id: "g4", weight: 40, calculated_score: 106, status: "Completed", thrust_area: "Innovation" },
    { id: "g5", weight: 100, calculated_score: 100, status: "Completed", thrust_area: "Revenue" }
  ];

  const totalEmployees = dbUsers && dbUsers.length > 0 ? dbUsers.length : mockUsers.length;
  const allPlans = dbPlans && dbPlans.length > 0 ? dbPlans : mockPlans as any[];
  const allGoals = dbGoals && dbGoals.length > 0 ? dbGoals : mockGoals as any[];

  const pendingApprovals = allPlans.filter((p: any) => p.status === "Pending_Approval").length;
  const approvedPlans = allPlans.filter((p: any) => p.status === "Approved").length;
  const reworkPlans = allPlans.filter((p: any) => p.status === "Rework_Required").length;
  const submissionRate = allPlans.length > 0
    ? Math.round((allPlans.filter((p: any) => p.status !== "Draft").length / totalEmployees) * 100)
    : 0;

  const completedGoals = allGoals.filter((g: any) => g.status === "Completed").length;
  const totalGoals = allGoals.length;

  const totalWeight = allGoals.reduce((s: number, g: any) => s + Number(g.weight || 0), 0);
  const totalScore = allGoals.reduce((s: number, g: any) => s + Number(g.calculated_score || 0), 0);
  const orgScore = totalWeight > 0 ? ((totalScore / totalWeight) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Admin Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">Organisational overview · Q1 FY2026</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/export"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#121212] border border-[#333] text-slate-300 text-[13px] font-medium rounded-lg hover:bg-[#222] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
          <Link
            href="/admin/audit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#121212] border border-[#333] text-slate-300 text-[13px] font-medium rounded-lg hover:bg-[#222] transition-colors"
          >
            <ScrollText className="w-4 h-4" />
            Audit Log
          </Link>
        </div>
      </div>

      <OnboardingGuide role="admin" />

      {/* ── Command Tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <CommandTile
          label="Total Employees"
          value={totalEmployees}
          sub="Registered in portal"
          icon={Users}
          accent="bg-[#222] text-slate-300 border border-[#333]"
        />
        <CommandTile
          label="Submission Rate"
          value={`${submissionRate}%`}
          sub={`${allPlans.filter((p: any) => p.status !== "Draft").length} of ${allPlans.length} submitted`}
          icon={TrendingUp}
          accent="bg-[#001a2a] text-blue-400 border border-blue-900/50"
        />
        <CommandTile
          label="Pending Approvals"
          value={pendingApprovals}
          sub="Awaiting manager review"
          icon={ClipboardList}
          accent="bg-[#2a1a00] text-amber-500 border border-amber-900/50"
          href="/admin/escalations"
        />
        <CommandTile
          label="Approved Plans"
          value={approvedPlans}
          sub="In active check-in phase"
          icon={CheckCircle2}
          accent="bg-[#062010] text-emerald-500 border border-emerald-900/50"
        />
        <CommandTile
          label="Rework Required"
          value={reworkPlans}
          sub="Returned by managers"
          icon={AlertCircle}
          accent="bg-[#2a0505] text-red-500 border border-red-900/50"
          href="/admin/escalations"
        />
        <CommandTile
          label="Org-Wide Score"
          value={`${orgScore}%`}
          sub={`${completedGoals} / ${totalGoals} goals completed`}
          icon={Shield}
          accent="bg-[#1a0b2e] text-purple-400 border border-purple-900/50"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/cycles"
          className="bg-[#151515] border border-[#222] rounded-xl p-5 hover:border-blue-500/50 transition-all group flex items-center gap-4 shadow-sm"
        >
          <div className="w-10 h-10 bg-[#001a2a] rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-900/50">
            <Lock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">Manage Cycles</p>
            <p className="text-[12px] text-slate-500">Open / lock quarters</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 ml-auto transition-colors" />
        </Link>

        <Link
          href="/admin/audit"
          className="bg-[#151515] border border-[#222] rounded-xl p-5 hover:border-purple-500/50 transition-all group flex items-center gap-4 shadow-sm"
        >
          <div className="w-10 h-10 bg-[#1a0b2e] rounded-lg flex items-center justify-center flex-shrink-0 border border-purple-900/50">
            <ScrollText className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">Audit Trail</p>
            <p className="text-[12px] text-slate-500">Change history feed</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 ml-auto transition-colors" />
        </Link>

        <Link
          href="/admin/escalations"
          className="bg-[#151515] border border-[#222] rounded-xl p-5 hover:border-rose-500/50 transition-all group flex items-center gap-4 shadow-sm"
        >
          <div className="w-10 h-10 bg-[#2a0505] rounded-lg flex items-center justify-center flex-shrink-0 border border-rose-900/50">
            <Shield className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200 group-hover:text-rose-500 transition-colors">Escalations</p>
            <p className="text-[12px] text-slate-500">Review overdue items</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-rose-500 ml-auto transition-colors" />
        </Link>
      </div>

      {/* ── Plan Management Table ── */}
      <div className="bg-[#151515] border border-[#222] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0f0f0f]">
          <div>
            <h2 className="text-[14px] font-semibold text-slate-200">Master Plan Registry</h2>
            <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider">All goal plans with unlock capability</p>
          </div>
        </div>
        <AdminPlanManagementClient initialPlans={allPlans} />
      </div>
    </div>
  );
}
