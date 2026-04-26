"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Bell,
  ClipboardCheck,
  LayoutDashboard,
  Moon,
  Stethoscope,
  Sun,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface ClinicalShellProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patient/882910", label: "Patient Detail", icon: UserRound },
  { href: "/approvals", label: "Approvals", icon: ClipboardCheck },
  { href: "/system-health", label: "System Health", icon: Activity },
];

export function ClinicalShell({ children }: ClinicalShellProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("vitalsflow-theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);


  const toggleTheme = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.add("theme-transition");
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("vitalsflow-theme", next ? "dark" : "light");
    setTimeout(
      () => document.documentElement.classList.remove("theme-transition"),
      500
    );
  }, [isDark]);

  return (
    <div className="min-h-dvh text-(--text-primary)">
      <header
        className="sticky top-0 z-20 w-full"
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div className="mx-auto flex w-full max-w-[2400px] items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center" style={{ background: "var(--accent-blue-dim)" }}>
              <Stethoscope className="h-5 w-5" style={{ color: "var(--accent-blue)" }} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-outfit)", color: "var(--text-primary)" }}>
                VitalsFlow
              </h1>
              <p className="text-[10px] font-medium tracking-wide" style={{ color: "var(--text-muted)" }}>
                AI Clinical Triage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="icon-btn press-scale"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button className="icon-btn press-scale relative" aria-label="View notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-critical)" }} />
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-[2400px] gap-3 overflow-x-auto px-5 pt-4 pb-4 sm:px-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-pill transition-all duration-200 text-xs",
                  isActive && "active ring-2 ring-offset-1",
                  isActive && "ring-[var(--accent-blue)]/30"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[2400px] px-5 pb-8 pt-6 sm:px-8">
        {children}
      </main>
    </div>
  );
}