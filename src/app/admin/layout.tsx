import { ReactNode } from "react";
import Link from "next/link";
import { Orbit, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { PortalShell } from "@/components/PortalShell";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const { count: escalationCount } = await supabase
    .from("goal_plans")
    .select("id", { count: "exact", head: true })
    .eq("status", "Rework_Required");

  const pending = escalationCount || 0;

  return (
    <>
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <PortalShell>
        {/* ── Floating Navbar ── */}
        <nav className="portal-nav fixed top-6 left-1/2 -translate-x-1/2 z-50 flex h-[60px] items-center justify-between rounded-[30px] p-1.5 w-[90%] max-w-5xl shadow-2xl border">

          <div className="flex items-center gap-6">
            {/* Logo Circle — rose accent for admin */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white shrink-0">
              <Orbit className="h-6 w-6" />
            </div>

            {/* Links */}
            <div className="flex items-center gap-4 px-2">
              <Link href="/admin/dashboard"  className="portal-nav-link text-[14px] font-medium transition-colors">Dashboard</Link>
              <Link href="/admin/entra-sync" className="portal-nav-link text-[14px] font-medium transition-colors">Entra Sync</Link>
              <Link href="/admin/cycles"     className="portal-nav-link text-[14px] font-medium transition-colors">Cycles</Link>
              <Link href="/admin/hierarchy"  className="portal-nav-link text-[14px] font-medium transition-colors">Hierarchy</Link>
              <Link href="/admin/analytics"  className="portal-nav-link text-[14px] font-medium transition-colors">Analytics</Link>
              <Link href="/admin/escalations" className="portal-nav-link text-[14px] font-medium transition-colors flex items-center gap-1.5">
                Escalations
                {pending > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {pending}
                  </span>
                )}
              </Link>
              <Link href="/admin/audit"      className="portal-nav-link text-[14px] font-medium transition-colors">Audit</Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-12 items-center justify-center rounded-full bg-rose-500/10 px-5 border border-rose-500/20">
              <span className="text-[14px] font-semibold text-rose-400">Admin / HR</span>
            </div>
            <ThemeToggle />
            <a
              href="/login"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-rose-500/20 text-gray-400 hover:text-rose-500 transition-colors border border-white/5"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </a>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="pt-24 pb-12 w-full">
          {children}
        </main>
      </PortalShell>
    </>
  );
}
