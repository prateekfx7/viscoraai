"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Clock,
  FastForward,
  Flame,
  LayoutGrid,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";
import { useTwinStore } from "@/lib/store/useTwinStore";

const navItems = [
  { name: "Overview", href: "/overview", icon: LayoutGrid, description: "Cockpit Twin Overview" },
  { name: "SRP Performance", href: "/srp-performance", icon: Activity, description: "Dyno Card & Drag Telemetry" },
  { name: "Optimization", href: "/optimization", icon: Sliders, description: "Rule-Based Advisor" },
  { name: "KPI & Impact", href: "/kpi", icon: BarChart3, description: "SOR & Energy Metrics" },
  { name: "CSS Cycle", href: "/css-cycle", icon: Flame, description: "Huff-and-Puff Thermal Monitor" },
  { name: "Alerts", href: "/alerts", icon: AlertOctagon, description: "Real-Time Failure Log" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { selectedWellId } = useTwinStore();
  const [demoState, setDemoState] = useState({
    forceFloating: false,
    manualOverride: false,
    simulatedElapsedSec: 0,
  });

  const pollDemo = async () => {
    try {
      const res = await fetch("/api/demo");
      if (res.ok) {
        const data = await res.json();
        setDemoState(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    pollDemo();
    const interval = setInterval(pollDemo, 2500);
    return () => clearInterval(interval);
  }, []);

  const triggerEvent = async (action: string) => {
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setDemoState(data.state);
      }
    } catch (e) {}
  };

  const isFloating = demoState.forceFloating;
  const elapsed = demoState.simulatedElapsedSec;
  const countdown = Math.max(0, 90 - elapsed);

  return (
    <aside className="hidden lg:flex fixed top-0 bottom-0 left-0 w-64 xl:w-72 bg-white border-r border-slate-200/90 flex-col justify-between p-5 z-40 shadow-soft select-none overflow-y-auto">
      {/* Top: Branding & Title */}
      <div>
        <div className="pb-5 border-b border-slate-100">
          <Link href="/overview" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B5E3C] shadow-sm flex items-center justify-center text-white shrink-0">
              <Flame className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold tracking-wider text-[#8B5E3C] uppercase font-sans">
                  OIL INDIA
                </span>
                <span className="text-[9px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-100">
                  SIH26120
                </span>
              </div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
                Well-to-Surface Twin
              </h1>
            </div>
          </Link>

          <div className="mt-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Field: Baghewala</span>
            <span className="text-slate-800 font-bold">15.2° API</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="mt-5 space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
            Twin Navigation
          </span>

          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-[#1A1E26] text-white shadow-darkCard scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    active ? "bg-white/10 text-amber-400" : "text-slate-500 group-hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.name}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                  </div>
                  <span
                    className={`text-[10px] font-normal block truncate ${
                      active ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Center/Bottom: Scripted Demo Scenario Controller Card */}
      <div className="my-4">
        <div
          className={`rounded-2xl p-3.5 border transition-all ${
            isFloating
              ? "bg-rose-50 border-rose-300 shadow-sm animate-pulse"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="font-bold flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${isFloating ? "text-rose-500" : "text-amber-500"}`} />
              <span>T+{elapsed}s</span>
            </span>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                isFloating
                  ? "bg-rose-600 text-white"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {isFloating ? "EVENT ACTIVE" : `AUTO AT 90s`}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-tight mb-2.5">
            {isFloating
              ? "Rod-floating in heavy crude! High viscous drag."
              : `Baseline telemetry. Scenario triggers in ${countdown}s.`}
          </p>

          <div className="flex items-center gap-2">
            {!isFloating ? (
              <button
                onClick={() => triggerEvent("trigger_floating")}
                className="flex-1 py-1.5 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-mono font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-colors"
              >
                <FastForward className="w-3 h-3" />
                <span>Simulate Now</span>
              </button>
            ) : (
              <button
                onClick={() => triggerEvent("clear_floating")}
                className="flex-1 py-1.5 px-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 text-[11px] font-mono font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-colors"
              >
                <Zap className="w-3 h-3 fill-slate-950" />
                <span>Apply Fix</span>
              </button>
            )}

            <button
              onClick={() => triggerEvent("reset")}
              title="Reset simulation to T+0s"
              className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs shadow-soft cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: Operator Badge & Live SCADA Indicator */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-[11px] font-mono mb-2 text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-emerald-700 font-bold">SCADA 3.5s LINK</span>
          </span>
          <span>ONLINE</span>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-[#1A1E26] text-white flex items-center justify-center text-xs font-bold font-mono">
            JM
          </div>
          <div className="truncate">
            <span className="text-xs font-bold text-slate-800 block truncate leading-tight">
              Jitendra Mourya
            </span>
            <span className="text-[10px] text-slate-400 font-mono block truncate">
              Oil India Field Engineer
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
