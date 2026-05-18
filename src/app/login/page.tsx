'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AtSignIcon,
  ChevronLeftIcon,
  KeyIcon,
} from 'lucide-react';

const DEMO_CREDENTIALS = [
  { label: "Employee", email: "dave@company.com", role: "employee", href: "/employee/dashboard" },
  { label: "Manager", email: "sarah.manager@company.com", role: "manager", href: "/manager/dashboard" },
  { label: "Admin / HR", email: "admin@company.com", role: "admin", href: "/admin/dashboard" },
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MOCK_MS_AUTH_SUCCESS') {
        const email = event.data.email;
        setLoading(true);
        setTimeout(() => {
          router.push(routeForEmail(email));
        }, 500);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  const handleOAuthLogin = () => {
    const width = 450;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      '/auth/microsoft-login',
      'Microsoft Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 dark bg-black text-white">
      <div className="bg-zinc-950 relative hidden h-full flex-col border-r border-zinc-800 p-10 lg:flex">
        <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />

        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;Trackerz has transformed how we set goals and track
              performance across the entire enterprise.&rdquo;
            </p>
            <footer className="font-mono text-sm font-semibold">
              ~ Internal Platform
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>
      
      <div className="relative flex min-h-screen flex-col justify-center p-4">
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(0,0,0,0.06)_0,hsla(0,0%,55%,.02)_50%,rgba(0,0,0,0.01)_80%)] absolute top-0 right-0 h-[80rem] w-[35rem] -translate-y-[21rem] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0.04)_0,rgba(0,0,0,0.01)_80%,transparent_100%)] absolute top-0 right-0 h-[80rem] w-[15rem] [translate:5%_-50%] rounded-full" />
        </div>
        <Button variant="ghost" className="absolute top-7 left-5 hover:bg-zinc-800 hover:text-white" onClick={() => router.push('/')}>
          <ChevronLeftIcon className='size-4 me-2' />
          Home
        </Button>
        <div className="mx-auto space-y-4 w-full sm:w-[400px]">

          <div className="flex flex-col space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-wide">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-base">
              Sign in to your performance portal.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2 mt-4">
            <Button type="button" size="lg" className="w-full bg-[#2F2F2F] hover:bg-[#1f1f1f] text-white" onClick={handleOAuthLogin} disabled={loading}>
              <MicrosoftIcon className='size-4 me-2' />
              Continue with Microsoft (SSO)
            </Button>
          </div>

          <AuthSeparator />

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  placeholder="your.email@example.com"
                  className="peer ps-9"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <AtSignIcon className="size-4" aria-hidden="true" />
                </div>
              </div>
              <div className="relative">
                <Input
                  placeholder="Password"
                  className="peer ps-9"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <KeyIcon className="size-4" aria-hidden="true" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <span>{loading ? "Signing in..." : "Continue With Email"}</span>
            </Button>
          </form>

          <AuthSeparator text="DEMO ACCESS" />

          <div className="space-y-2">
            {DEMO_CREDENTIALS.map((cred) => (
              <Button
                key={cred.role}
                type="button"
                variant="outline"
                className="w-full justify-between hover:border-blue-300 transition-colors"
                onClick={() => handleDemoLogin(cred.href, cred.email)}
                disabled={loading}
              >
                <span>Continue as {cred.label}</span>
                <span className="text-xs text-muted-foreground">{cred.email}</span>
              </Button>
            ))}
          </div>
          
          <p className="text-muted-foreground mt-8 text-sm text-center">
            Having trouble? Contact{' '}
            <a
              href="#"
              className="hover:text-primary underline underline-offset-4"
            >
              HR Support
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(255,255,255,${0.05 + i * 0.02})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-slate-950 dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const MicrosoftIcon = (props: React.ComponentProps<'svg'>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21" {...props}>
    <path fill="#f25022" d="M1 1h9v9H1z"/>
    <path fill="#00a4ef" d="M1 11h9v9H1z"/>
    <path fill="#7fba00" d="M11 1h9v9h-9z"/>
    <path fill="#ffb900" d="M11 11h9v9h-9z"/>
  </svg>
);

const AuthSeparator = ({ text = "OR" }: { text?: string }) => {
  return (
    <div className="flex w-full items-center justify-center my-6">
      <div className="bg-border h-px w-full" />
      <span className="text-muted-foreground px-4 text-xs font-medium whitespace-nowrap">{text}</span>
      <div className="bg-border h-px w-full" />
    </div>
  );
};
