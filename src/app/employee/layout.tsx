import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Target, CheckSquare, Users, Settings, LogOut, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

const navItems = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "My Goals", href: "/employee/goals", icon: Target },
  { label: "Check-ins", href: "/employee/check-ins", icon: CheckSquare },
  { label: "My Team", href: "/employee/team", icon: Users },
];

export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  // Fetch user info server-side
  const supabase = await createClient();
  const { data: userData } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", "00000000-0000-0000-0000-000000000101")
    .maybeSingle();

  const userName = userData?.name || "Employee";
  const userEmail = userData?.email || "employee@company.com";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">AtomQuest</span>
          </div>
          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
            Employee Portal
          </span>
        </div>

        {/* Quarter status banner */}
        <div className="mx-3 mt-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Q1 FY2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5">Goal window active</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                {label}
              </div>
            </Link>
          ))}
        </nav>

        {/* User + Settings */}
        <div className="px-3 pb-4 border-t border-slate-100 pt-3 space-y-0.5">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            Settings
          </Link>

          {/* User tile */}
          <div className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-800">Performance Portal</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Employee</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              ● Q1 FY2026 · Goal Window Open
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
