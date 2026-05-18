import { ReactNode } from "react";
import { Orbit, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { PortalShell } from "@/components/PortalShell";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: userData } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", "00000000-0000-0000-0000-000000000101")
    .maybeSingle();

  const userName = "Dave Dev";

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
            <div className="flex items-center gap-8 px-2">
              <a href="#dashboard" className="portal-nav-link text-[15px] font-medium transition-colors">Dashboard</a>
              <a href="#goals"     className="portal-nav-link text-[15px] font-medium transition-colors">Goals</a>
              <a href="#check-in"  className="portal-nav-link text-[15px] font-medium transition-colors">Check In</a>
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
