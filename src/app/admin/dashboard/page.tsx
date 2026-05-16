import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import {
  Users, CheckCircle2, ClipboardList, AlertCircle,
  Shield, Download, Lock, ScrollText, TrendingUp, ArrowRight
} from "lucide-react";
import AdminPlanManagementClient from "@/components/admin/AdminPlanManagementClient";

function CommandTile({
  label, value, sub, icon: Icon, accent, href,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; accent: string; href?: string;
}) {
  const content = (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start gap-4 ${href ? "hover:border-slate-300 hover:shadow-md transition-all group cursor-pointer" : ""}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-0.5 leading-none">{value}</p>
        <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
      </div>
      {href && <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 mt-1 transition-colors flex-shrink-0" />}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // MOCK DATA INJECTION
  const mockUsers = [{ id: "u1" }, { id: "u2" }, { id: "u3" }, { id: "u4" }, { id: "u5" }];
  const mockPlans = [
    { id: "p1", status: "Pending_Approval", period: "Q1 2026", user_id: "u1", users: { name: "Dave Dev", email: "dave@example.com" } },
    { id: "p2", status: "Approved", period: "Q1 2026", user_id: "u2", users: { name: "Eve Engineer", email: "eve@example.com" } },
    { id: "p3", status: "Rework_Required", period: "Q1 2026", user_id: "u3", users: { name: "Bob Smith", email: "bob@example.com" } }
  ];
  const mockGoals = [
    { id: "g1", weight: 50, calculated_score: 0, status: "Not_Started", thrust_area: "Innovation" },
    { id: "g2", weight: 50, calculated_score: 0, status: "Not_Started", thrust_area: "Operations" },
    { id: "g3", weight: 60, calculated_score: 80, status: "On Track", thrust_area: "Operations" },
    { id: "g4", weight: 40, calculated_score: 106, status: "Completed", thrust_area: "Innovation" },
    { id: "g5", weight: 100, calculated_score: 100, status: "Completed", thrust_area: "Revenue" }
  ];

  const totalEmployees = mockUsers.length;
  const allPlans = mockPlans as any[];
  const allGoals = mockGoals as any[];

  const pendingApprovals = allPlans.filter((p) => p.status === "Pending_Approval").length;
  const approvedPlans = allPlans.filter((p) => p.status === "Approved").length;
  const reworkPlans = allPlans.filter((p) => p.status === "Rework_Required").length;
  const submissionRate = allPlans.length > 0
    ? Math.round((allPlans.filter(p => p.status !== "Draft").length / mockUsers.length) * 100)
    : 0;

  const completedGoals = allGoals.filter((g) => g.status === "Completed").length;
  const totalGoals = allGoals.length;

  // Weighted org score
  const totalWeight = allGoals.reduce((s, g) => s + Number(g.weight || 0), 0);
  const totalScore = allGoals.reduce((s, g) => s + Number(g.calculated_score || 0), 0);
  const orgScore = totalWeight > 0 ? ((totalScore / totalWeight) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">Organisational overview · Q1 FY2026</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/export"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
          <Link
            href="/admin/audit"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ScrollText className="w-4 h-4" />
            Audit Log
          </Link>
        </div>
      </div>

      {/* ── Command Tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <CommandTile
          label="Total Employees"
          value={totalEmployees}
          sub="Registered in portal"
          icon={Users}
          accent="bg-slate-100 text-slate-600"
        />
        <CommandTile
          label="Submission Rate"
          value={`${submissionRate}%`}
          sub={`${allPlans.filter(p => p.status !== "Draft").length} of ${allPlans.length} submitted`}
          icon={TrendingUp}
          accent="bg-blue-50 text-blue-600"
        />
        <CommandTile
          label="Pending Approvals"
          value={pendingApprovals}
          sub="Awaiting manager review"
          icon={ClipboardList}
          accent="bg-amber-50 text-amber-600"
          href="/admin/escalations"
        />
        <CommandTile
          label="Approved Plans"
          value={approvedPlans}
          sub="In active check-in phase"
          icon={CheckCircle2}
          accent="bg-emerald-50 text-emerald-600"
        />
        <CommandTile
          label="Rework Required"
          value={reworkPlans}
          sub="Returned by managers"
          icon={AlertCircle}
          accent="bg-red-50 text-red-600"
          href="/admin/escalations"
        />
        <CommandTile
          label="Org-Wide Score"
          value={`${orgScore}%`}
          sub={`${completedGoals} / ${totalGoals} goals completed`}
          icon={Shield}
          accent="bg-purple-50 text-purple-600"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/admin/cycles"
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all group flex items-center gap-4"
        >
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Manage Cycles</p>
            <p className="text-xs text-slate-500">Open / lock quarters</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 ml-auto transition-colors" />
        </Link>

        <Link
          href="/admin/audit"
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all group flex items-center gap-4"
        >
          <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <ScrollText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Audit Trail</p>
            <p className="text-xs text-slate-500">Change history feed</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 ml-auto transition-colors" />
        </Link>

        <Link
          href="/admin/escalations"
          className="bg-white border border-slate-200 rounded-xl p-4 hover:border-rose-300 hover:shadow-md transition-all group flex items-center gap-4"
        >
          <div className="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Escalations</p>
            <p className="text-xs text-slate-500">Review overdue items</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 ml-auto transition-colors" />
        </Link>
      </div>

      {/* ── Plan Management Table ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">Master Plan Registry</h2>
            <p className="text-xs text-slate-500 mt-0.5">All goal plans with unlock capability</p>
          </div>
        </div>
        <AdminPlanManagementClient initialPlans={allPlans} />
      </div>
    </div>
  );
}
