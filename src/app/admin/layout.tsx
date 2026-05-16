import { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Calendar, Users, BarChart2,
  Shield, ScrollText, Settings, LogOut, ChevronRight
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Cycles", href: "/admin/cycles", icon: Calendar },
  { label: "Hierarchy", href: "/admin/hierarchy", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "Escalations", href: "/admin/escalations", icon: Shield },
  { label: "Audit Log", href: "/admin/audit", icon: ScrollText },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const { count: escalationCount } = await supabase
    .from("goal_plans")
    .select("id", { count: "exact", head: true })
    .eq("status", "Rework_Required");

  const pending = escalationCount || 0;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 bg-[#1e293b] flex flex-col">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-base font-bold text-white tracking-tight">AtomQuest</span>
          </div>
          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
            Admin / HR
          </span>
        </div>

        {/* Quarter banner */}
        <div className="mx-3 mt-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Q1 FY2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[10px] text-emerald-500/70 mt-0.5">Cycle active</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const showBadge = label === "Escalations" && pending > 0;
            return (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0 text-slate-500 group-hover:text-slate-300" />
                  {label}
                </div>
                {showBadge && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {pending}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-0.5">
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all">
            <Settings className="w-4 h-4 text-slate-500" />
            Settings
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg bg-white/5 border border-white/10">
            <div className="w-7 h-7 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs flex-shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Admin HR</p>
              <p className="text-[10px] text-slate-500 truncate">admin@company.com</p>
            </div>
          </div>
          <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all">
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
            <span>Admin / HR</span>
          </div>
          <div className="flex items-center gap-3">
            {pending > 0 && (
              <Link href="/admin/escalations" className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full hover:bg-rose-100 transition-colors">
                <Shield className="w-3 h-3" />
                {pending} escalation{pending > 1 ? "s" : ""}
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
