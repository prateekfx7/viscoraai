"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Clock,
  FastForward,
  Flame,
  Gauge,
  RotateCcw,
  Search,
  Sliders,
  User,
  Zap,
} from "lucide-react";
import { useTwinStore } from "@/lib/store/useTwinStore";

const navLinks = [
  { name: "Overview", href: "/overview" },
  { name: "SRP Monitor", href: "/srp-performance" },
  { name: "Optimization", href: "/optimization" },
  { name: "KPI Impact", href: "/kpi" },
  { name: "CSS Cycle", href: "/css-cycle" },
  { name: "Alerts", href: "/alerts" },
];

export const TopNavbar: React.FC = () => {
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
    } catch (e) {
      // ignore
    }
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

  return (
    <header className="w-full bg-[#F0F2F5] border-b border-slate-200/80 px-4 sm:px-8 py-3 select-none">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/overview" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#8B5E3C] shadow-sm flex items-center justify-center text-white font-bold">
              <Flame className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-wider text-[#8B5E3C] uppercase">
                  OIL INDIA
                </span>
                <span className="text-[10px] text-slate-400 font-mono">DIGITAL TWIN</span>
              </div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                Well-to-Surface
              </h1>
            </div>
          </Link>
        </div>

        {/* Center: UPS-Style Floating Pill Navigation */}
        <nav className="flex items-center bg-slate-200/80 p-1 rounded-full shadow-inner text-xs font-medium">
          {navLinks.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-1.5 rounded-full transition-all duration-150 ${
                  active
                    ? "bg-white text-slate-900 font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Demo Trigger Pill, and Operator Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Demo Scenario Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all ${
              isFloating
                ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm animate-pulse"
                : "bg-white border-slate-200 text-slate-700 shadow-soft"
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isFloating ? "text-rose-500" : "text-amber-500"}`} />
            <span className="font-semibold">T+{elapsed}s</span>
            {!isFloating ? (
              <button
                onClick={() => triggerEvent("trigger_floating")}
                title="Force rod-floating scenario now"
                className="ml-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
              >
                <FastForward className="w-3 h-3" />
                <span>Simulate</span>
              </button>
            ) : (
              <button
                onClick={() => triggerEvent("clear_floating")}
                title="Apply fix / reset to normal"
                className="ml-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Fix</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden xl:flex items-center gap-2 bg-white border border-slate-200/90 rounded-full px-3 py-1.5 text-xs text-slate-600 shadow-soft">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search telemetry..."
              className="bg-transparent focus:outline-none w-28 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Notification Bell */}
          <Link
            href="/alerts"
            className="relative w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-soft transition-colors"
          >
            <Bell className="w-4 h-4" />
            {isFloating && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </Link>

          {/* Operator Profile */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-soft">
              JM
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold text-slate-800 block leading-tight">
                J. Mourya
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight font-mono">
                Baghewala Ops
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
