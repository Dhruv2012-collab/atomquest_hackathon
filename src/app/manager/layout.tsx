import { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard, ClipboardList, CheckSquare,
  Users, BarChart2, Settings, LogOut, ChevronRight
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";

const navItems = [
  { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
  { label: "Approvals", href: "/manager/approvals", icon: ClipboardList, hasBadge: true },
  { label: "Check-ins", href: "/manager/check-ins", icon: CheckSquare },
  { label: "Team", href: "/manager/team", icon: Users },
  { label: "Analytics", href: "/manager/analytics", icon: BarChart2 },
];

export default async function ManagerLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const managerId = "00000000-0000-0000-0000-000000000011";

  const { data: userData } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", managerId)
    .maybeSingle();

  const { count: pendingCount } = await supabase
    .from("goal_plans")
    .select("id", { count: "exact", head: true })
    .eq("status", "Pending_Approval");

  const userName = userData?.name || "Manager";
  const userEmail = userData?.email || "manager@company.com";
  const userInitial = userName.charAt(0).toUpperCase();
  const pending = pendingCount || 0;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">AtomQuest</span>
          </div>
          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
            Manager L1
          </span>
        </div>

        {/* Quarter banner */}
        <div className="mx-3 mt-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Q1 FY2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5">Approval window active</p>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon, hasBadge }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                {label}
              </div>
              {hasBadge && pending > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {pending}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-slate-100 pt-3 space-y-0.5">
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
            <Settings className="w-4 h-4 text-slate-400" />
            Settings
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>
          <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-800">Performance Portal</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Manager</span>
          </div>
          <div className="flex items-center gap-3">
            {pending > 0 && (
              <Link
                href="/manager/approvals"
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full hover:bg-amber-100 transition-colors"
              >
                <ClipboardList className="w-3 h-3" />
                {pending} pending approval{pending > 1 ? "s" : ""}
              </Link>
            )}
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              ● Q1 FY2026 · Active
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
