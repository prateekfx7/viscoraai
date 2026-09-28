"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Database,
  Flame,
  Layers,
  LayoutGrid,
  ShieldCheck,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";
import { useSidebar } from "@/components/ui/app-1-utils/sidebar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Live Cockpit", href: "/overview", icon: LayoutGrid, tag: "SCADA" },
  { name: "3D Wellbore Twin", href: "/twin", icon: Layers, tag: "3D" },
  { name: "Pump Health", href: "/srp-performance", icon: Activity, tag: "Stokes" },
  { name: "Auto-Pilot Advisor", href: "/optimization", icon: Sliders, tag: "Optimizer" },
  { name: "Savings & Impact", href: "/kpi", icon: BarChart3, tag: "ROI" },
  { name: "Steam Cycles", href: "/css-cycle", icon: Flame, tag: "CSS" },
  { name: "Safety Alarms", href: "/alerts", icon: AlertOctagon, tag: "Alerts" },
];

export function App1Sidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-border bg-card p-4 transition-all duration-300 md:static",
        open ? "w-64" : "w-0 -translate-x-full md:w-16 md:translate-x-0 md:p-2"
      )}
    >
      <div>
        {/* Brand Header */}
        <Link href="/overview" className="flex items-center gap-3 px-2 py-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Zap className="size-4.5 fill-emerald-400 text-emerald-400" />
          </div>
          {open && (
            <div className="flex flex-col truncate">
              <span className="text-lg font-black tracking-tight text-foreground leading-tight">
                Viscora
              </span>
              <span className="text-[10px] font-mono text-muted-foreground truncate">
                Well-to-Surface Twin
              </span>
            </div>
          )}
        </Link>

        {/* Auto-Pilot Active Badge */}
        {open ? (
          <div className="mt-3 mx-2 flex items-center justify-between rounded-xl bg-emerald-500/10 px-2.5 py-1.5 border border-emerald-500/20 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold">Auto-Pilot Active</span>
            </span>
            <span className="text-[10px] uppercase font-bold">3.2 SPM</span>
          </div>
        ) : (
          <div className="mt-3 flex justify-center">
            <span className="size-2 rounded-full bg-emerald-500" title="Auto-Pilot Active" />
          </div>
        )}

        {/* Navigation List */}
        <nav className="mt-5 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={!open ? item.name : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {open && (
                  <span className="flex flex-1 items-center justify-between truncate">
                    <span>{item.name}</span>
                    <span
                      className={cn(
                        "text-[9px] font-mono px-1.5 py-0.5 rounded",
                        active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {item.tag}
                    </span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="border-t border-border pt-3">
        {open ? (
          <div className="px-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>Baghewala Field</span>
              <span className="font-bold text-emerald-600">P50 Online</span>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground/80 truncate">
              Oil India Ltd • SIH26120
            </p>
          </div>
        ) : (
          <div className="flex justify-center text-muted-foreground">
            <Database className="size-4" />
          </div>
        )}
      </div>
    </aside>
  );
}
