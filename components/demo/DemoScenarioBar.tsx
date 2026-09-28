"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, FastForward, RotateCcw, Zap } from "lucide-react";

export interface DemoStateData {
  startedAt?: number;
  forceFloating: boolean;
  manualOverride: boolean;
  simulatedElapsedSec: number;
}

export const DemoScenarioBar: React.FC = () => {
  const [demoState, setDemoState] = useState<DemoStateData>({
    forceFloating: false,
    manualOverride: false,
    simulatedElapsedSec: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchDemoState = async () => {
    try {
      const res = await fetch("/api/demo");
      if (res.ok) {
        const data = await res.json();
        setDemoState(data);
      }
    } catch (e) {
      console.error("Failed to poll demo state", e);
    }
  };

  useEffect(() => {
    fetchDemoState();
    const interval = setInterval(fetchDemoState, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerEvent = async (action: "trigger_floating" | "reset" | "clear_floating") => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const isFloating = demoState.forceFloating;
  const elapsed = demoState.simulatedElapsedSec;
  const countdownTo90 = Math.max(0, 90 - elapsed);

  return (
    <div
      className={`border rounded-xl p-3 sm:p-4 mb-6 transition-all duration-300 ${
        isFloating
          ? "bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/40"
          : "bg-slate-900/80 border-slate-800"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Status */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isFloating ? "bg-rose-500/20 text-rose-400" : "bg-sky-500/10 text-sky-400"
            }`}
          >
            {isFloating ? (
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                Hackathon Scripted Scenario:
              </span>
              {isFloating ? (
                <span className="bg-rose-500 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                  ROD-FLOATING EVENT ACTIVE
                </span>
              ) : (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded uppercase">
                  Baseline Pumping (Auto-Triggers in {countdownTo90}s)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {isFloating ? (
                <span className="text-rose-200">
                  ⚠️ Heavy crude viscosity (810 cP) has induced rod flotation! Downstroke load dropped to 3,100 lbs.
                  Review corrected SPM in{" "}
                  <Link href="/optimization" className="underline font-bold text-white hover:text-rose-200">
                    /optimization
                  </Link>{" "}
                  and impact in{" "}
                  <Link href="/kpi" className="underline font-bold text-white hover:text-rose-200">
                    /kpi
                  </Link>
                  .
                </span>
              ) : (
                <span>
                  Simulating BGW-04 SCADA telemetry. At T+90s, high viscosity creates delayed downstroke rod drop.
                  Watch the optimizer automatically calculate corrected SPM!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2 self-end lg:self-center shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>T+{elapsed}s</span>
          </div>

          {!isFloating ? (
            <button
              onClick={() => triggerEvent("trigger_floating")}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Trigger Event Now</span>
            </button>
          ) : (
            <button
              onClick={() => triggerEvent("clear_floating")}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Apply Fix / Normal</span>
            </button>
          )}

          <button
            onClick={() => triggerEvent("reset")}
            disabled={loading}
            title="Reset timer to T+0s"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
