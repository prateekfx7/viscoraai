"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Cpu,
  Flame,
  Gauge,
  Layers,
  Menu,
  Sliders,
  TrendingDown,
  X,
} from "lucide-react";
import { useTwinStore } from "@/lib/store/useTwinStore";

const navItems = [
  {
    name: "Well Overview",
    href: "/overview",
    icon: Gauge,
    description: "Multi-parameter digital twin state",
  },
  {
    name: "SRP Performance",
    href: "/srp-performance",
    icon: Activity,
    description: "Dyno card & rod-floating monitor",
  },
  {
    name: "Optimization Engine",
    href: "/optimization",
    icon: Sliders,
    description: "Rule-based SPM & CSS advisor",
  },
  {
    name: "KPI & Impact",
    href: "/kpi",
    icon: BarChart3,
    description: "SOR & lifting energy savings",
  },
  {
    name: "CSS Cycle Monitor",
    href: "/css-cycle",
    icon: Flame,
    description: "Thermal decay & injection history",
  },
  {
    name: "Alerts & Events",
    href: "/alerts",
    icon: AlertOctagon,
    description: "Real-time mechanical alarms",
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { selectedWellId } = useTwinStore();

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white shadow-lg"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 sm:w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="p-5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase block">
                  OIL INDIA LIMITED
                </span>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Well-to-Surface Twin
                </h2>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 bg-slate-900/90 rounded-md px-2.5 py-1.5 border border-slate-800">
              <span className="text-slate-300">Baghewala Heavy Oil</span>
              <span className="text-amber-400 font-semibold">SIH26120</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Twin Control Modules
            </div>

            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  <div className="flex-1 truncate">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      )}
                    </div>
                    <span className="text-[10px] font-normal text-slate-400 truncate block">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Well Specs Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-[11px] font-mono">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400">ACTIVE WELL:</span>
              <span className="text-amber-400 font-bold">BGW-04</span>
            </div>
            <div className="space-y-1 text-slate-400 text-[10px]">
              <div className="flex justify-between">
                <span>Crude Gravity:</span>
                <span className="text-white">15.2° API (Extra Heavy)</span>
              </div>
              <div className="flex justify-between">
                <span>Reservoir Depth:</span>
                <span className="text-white">1,045 m</span>
              </div>
              <div className="flex justify-between">
                <span>CSS Cycle:</span>
                <span className="text-emerald-400 font-semibold">Cycle 3 (Day 38)</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>SCADA LINK: OK</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              ONLINE
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
