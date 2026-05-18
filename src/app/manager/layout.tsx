import { ReactNode } from "react";
import Link from "next/link";
import { Orbit, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { PortalShell } from "@/components/PortalShell";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  const pending = pendingCount || 0;

  return (
    <>
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <PortalShell>
        {/* ── Floating Navbar ── */}
        <nav className="portal-nav fixed top-6 left-1/2 -translate-x-1/2 z-50 flex h-[60px] items-center justify-between rounded-[30px] p-1.5 w-[90%] max-w-4xl shadow-2xl border">

          <div className="flex items-center gap-8">
            {/* Logo Circle */}
            <div className="portal-logo-circle flex h-12 w-12 items-center justify-center rounded-full shrink-0 transition-colors duration-300">
              <Orbit className="h-6 w-6" />
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 px-2">
              <Link href="/manager/dashboard" className="portal-nav-link text-[15px] font-medium transition-colors">Dashboard</Link>
              <Link href="/manager/approvals" className="portal-nav-link text-[15px] font-medium transition-colors flex items-center gap-1.5">
                Approvals
                {pending > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {pending}
                  </span>
                )}
              </Link>
              <Link href="/manager/check-ins" className="portal-nav-link text-[15px] font-medium transition-colors">Check-ins</Link>
              <Link href="/manager/team"      className="portal-nav-link text-[15px] font-medium transition-colors">Team</Link>
              <Link href="/manager/analytics" className="portal-nav-link text-[15px] font-medium transition-colors">Analytics</Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="portal-user-pill flex h-12 items-center justify-center rounded-full px-6 transition-colors duration-300">
              <span className="text-[15px] font-medium">{userName}</span>
            </div>
            <ThemeToggle />
            <a
              href="/login"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors border border-white/5"
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
