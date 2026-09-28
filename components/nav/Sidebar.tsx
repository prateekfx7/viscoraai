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
  Gauge,
  Layers,
  LayoutGrid,
  Power,
  Settings,
  Sliders,
} from "lucide-react";

const railItems = [
  { name: "Overview", href: "/overview", icon: LayoutGrid },
  { name: "SRP Performance", href: "/srp-performance", icon: Activity },
  { name: "Optimization", href: "/optimization", icon: Sliders },
  { name: "KPI Impact", href: "/kpi", icon: BarChart3 },
  { name: "CSS Cycle", href: "/css-cycle", icon: Flame },
  { name: "Alerts", href: "/alerts", icon: AlertOctagon },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed top-[61px] bottom-0 left-0 w-16 bg-white border-r border-slate-200/90 flex-col items-center justify-between py-6 z-30 shadow-soft select-none">
      {/* Top Icons */}
      <div className="flex flex-col items-center gap-3">
        {railItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                active
                  ? "bg-[#1A1E26] text-white shadow-md scale-105"
                  : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>

      {/* Bottom Icons (Settings / System) */}
      <div className="flex flex-col items-center gap-3">
        <button
          title="Field SCADA Settings"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          title="Digital Twin Node"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-colors"
        >
          <Power className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
