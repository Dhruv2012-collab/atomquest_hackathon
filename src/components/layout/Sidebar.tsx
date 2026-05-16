"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Target, Users, BarChart2, ScrollText,
  Settings, LogOut, CheckSquare, Shield, Calendar, ChevronRight,
  ClipboardList
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
};

type SidebarProps = {
  role: "employee" | "manager" | "admin";
  userName?: string;
  userEmail?: string;
  pendingCount?: number;
};

const navConfig: Record<string, NavItem[]> = {
  employee: [
    { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
    { label: "My Goals", href: "/employee/goals", icon: Target },
    { label: "Check-ins", href: "/employee/check-ins", icon: CheckSquare },
    { label: "My Team", href: "/employee/team", icon: Users },
  ],
  manager: [
    { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
    { label: "Approvals", href: "/manager/approvals", icon: ClipboardList },
    { label: "Check-ins", href: "/manager/check-ins", icon: CheckSquare },
    { label: "Team", href: "/manager/team", icon: Users },
    { label: "Analytics", href: "/manager/analytics", icon: BarChart2 },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Cycles", href: "/admin/cycles", icon: Calendar },
    { label: "Hierarchy", href: "/admin/hierarchy", icon: Users },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    { label: "Escalations", href: "/admin/escalations", icon: Shield },
    { label: "Audit Log", href: "/admin/audit", icon: ScrollText },
  ],
};

const roleMeta = {
  employee: { label: "Employee", color: "bg-blue-100 text-blue-700" },
  manager: { label: "Manager L1", color: "bg-purple-100 text-purple-700" },
  admin: { label: "Admin / HR", color: "bg-rose-100 text-rose-700" },
};

export function Sidebar({ role, userName = "User", userEmail = "", pendingCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const items = navConfig[role] || [];
  const meta = roleMeta[role];

  const logoutHref = "/login";

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Logo + Role */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">AtomQuest</span>
        </div>
        <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", meta.color)}>
          {meta.label}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const showBadge = item.label === "Approvals" && pendingCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                {item.label}
              </div>
              {showBadge && (
                <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {pendingCount}
                </span>
              )}
              {isActive && <ChevronRight className="w-3 h-3 text-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings + User + Logout */}
      <div className="px-3 py-3 border-t border-slate-100 space-y-0.5">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          Settings
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
          </div>
        </div>
        <Link
          href={logoutHref}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
