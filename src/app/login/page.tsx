"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Target, CheckCircle2, TrendingUp, Users } from "lucide-react";

const DEMO_CREDENTIALS = [
  { label: "Employee", email: "dave@company.com", role: "employee", href: "/employee/dashboard" },
  { label: "Manager", email: "sarah.manager@company.com", role: "manager", href: "/manager/dashboard" },
  { label: "Admin / HR", email: "admin@company.com", role: "admin", href: "/admin/dashboard" },
];

const FEATURES = [
  { icon: Target, text: "Structured goal setting with weight enforcement" },
  { icon: CheckCircle2, text: "Manager approval & review workflows" },
  { icon: TrendingUp, text: "Quarterly check-ins & performance scoring" },
  { icon: Users, text: "Shared departmental KPI alignment" },
];

function routeForEmail(email: string): string {
  if (email.includes("admin")) return "/admin/dashboard";
  if (email.includes("manager")) return "/manager/dashboard";
  return "/employee/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      router.push(routeForEmail(email));
    }, 900);
  };

  const handleDemoLogin = (href: string, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo1234");
    setLoading(true);
    setTimeout(() => router.push(href), 700);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#1e3a5f] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-400 translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-400 -translate-x-24 translate-y-24" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-white text-xl font-bold tracking-tight">AtomQuest</span>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Performance that<br />
              <span className="text-blue-300">moves with purpose.</span>
            </h1>
            <p className="mt-4 text-slate-300 text-lg leading-relaxed max-w-md">
              A structured goal-setting and tracking portal built for organisations that take accountability seriously.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-300" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="relative z-10 text-slate-500 text-xs">
          © 2026 AtomQuest · Internal Performance Portal
        </p>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-slate-900 font-bold text-lg">AtomQuest</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-1 text-sm">Sign in to your performance portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs text-slate-400 font-medium">DEMO ACCESS</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Role Quick-Access */}
          <div className="space-y-2">
            {DEMO_CREDENTIALS.map((cred) => (
              <button
                key={cred.role}
                type="button"
                onClick={() => handleDemoLogin(cred.href, cred.email)}
                disabled={loading}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all text-sm group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    cred.role === "employee" ? "bg-blue-500" :
                    cred.role === "manager" ? "bg-purple-500" : "bg-rose-500"
                  }`} />
                  <span className="font-medium text-slate-700">Continue as {cred.label}</span>
                </div>
                <span className="text-slate-400 text-xs group-hover:text-blue-500 transition-colors">
                  {cred.email}
                </span>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Having trouble? Contact{" "}
            <span className="text-blue-600 cursor-pointer hover:underline">HR Support</span>
          </p>
        </div>
      </div>
    </div>
  );
}
