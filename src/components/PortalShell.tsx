"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "dark" | "light";

interface ThemeCtx {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "dark", toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function PortalShell({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("portal-theme") as Theme | null;
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  const toggleTheme = () =>
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("portal-theme", next);
      return next;
    });

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-portal-theme={theme} className="portal-shell relative min-h-screen overflow-x-hidden transition-colors duration-300">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
