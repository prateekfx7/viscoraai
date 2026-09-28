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
  ShieldCheck,
  Sliders,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useTwinStore } from "@/lib/store/useTwinStore";

const navItems = [
  { name: "Live Cockpit", href: "/overview", icon: LayoutGrid, description: "Overview & Gauges" },
  { name: "Executive Hub", href: "/app-1", icon: Users, description: "Field Overview & Stats" },
  { name: "Pump Health", href: "/srp-performance", icon: Activity, description: "Rod Float & Load Cards" },
  { name: "Auto-Pilot Advisor", href: "/optimization", icon: Sliders, description: "Speed & Heat Optimizer" },
  { name: "Savings & Impact", href: "/kpi", icon: BarChart3, description: "SOR & Energy Metrics" },
  { name: "Steam Cycles", href: "/css-cycle", icon: Flame, description: "Huff-and-Puff Heat Map" },
  { name: "Safety Alarms", href: "/alerts", icon: AlertOctagon, description: "Active Prevention Feed" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { selectedWellId } = useTwinStore();
  const [autoPilotActive, setAutoPilotActive] = useState(true);
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
      {/* Top: Viscora Brand Title */}
      <div>
        <div className="pb-5 border-b border-slate-100">
          <Link href="/overview" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 shadow-sm flex items-center justify-center text-white shrink-0">
              <Zap className="w-5 h-5 fill-emerald-400 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none font-sans">
                Viscora
              </h1>
            </div>
          </Link>

          <p className="text-[11px] text-slate-500 font-sans mt-2 leading-tight">
            Autonomous Heavy Oil Well-to-Surface Twin
          </p>

          {/* Auto-Pilot Toggle Pill */}
          <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 font-sans block leading-none">
                  Auto-Pilot
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {autoPilotActive ? "Autonomous Throttling ON" : "Manual Approval Only"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setAutoPilotActive(!autoPilotActive)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                autoPilotActive ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                  autoPilotActive ? "left-5" : "left-1"
                }`}
              ></span>
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="mt-5 space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1.5">
            Modules
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
                    ? "bg-[#1A1E26] text-white shadow-darkCard scale-[1.01]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    active ? "bg-white/10 text-emerald-400" : "text-slate-500 group-hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.name}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
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

      {/* Scripted Demo Scenario Controller Card */}
      <div className="my-4">
        <div
          className={`rounded-2xl p-3.5 border transition-all ${
            isFloating
              ? "bg-amber-50 border-amber-300 shadow-sm"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="font-bold flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${isFloating ? "text-amber-600" : "text-slate-500"}`} />
              <span>T+{elapsed}s</span>
            </span>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                isFloating ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {isFloating ? "THICK OIL SHOCK" : `AUTO AT 90s`}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-tight mb-2.5 font-sans">
            {isFloating
              ? "Cold oil floating rod! Auto-Pilot adjusted speed."
              : `Simulates thick oil floating event in ${countdown}s.`}
          </p>

          <div className="flex items-center gap-2">
            {!isFloating ? (
              <button
                onClick={() => triggerEvent("trigger_floating")}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-mono font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-colors"
              >
                <FastForward className="w-3 h-3" />
                <span>Simulate Shock</span>
              </button>
            ) : (
              <button
                onClick={() => triggerEvent("clear_floating")}
                className="flex-1 py-1.5 px-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 text-[11px] font-mono font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Reset Baseline</span>
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
            <span className="text-emerald-700 font-bold">SCADA 3.5s FEED</span>
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
              Baghewala Field Ops
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
