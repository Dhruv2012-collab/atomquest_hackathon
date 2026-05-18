"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./PortalShell";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="theme-toggle-btn flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 border"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
