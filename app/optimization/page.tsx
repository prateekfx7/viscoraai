"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTwinStore } from "@/lib/store/useTwinStore";
import { RiskBadge } from "@/components/cards/RiskBadge";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  Lightbulb,
  ListChecks,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";

export default function OptimizationPage() {
  const { selectedWellId } = useTwinStore();

  // What-if simulator state
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simSpm, setSimSpm] = useState<number>(5.8);
  const [simVisc, setSimVisc] = useState<number>(850);
  const [simForceFloating, setSimForceFloating] = useState<boolean>(true);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["optimizer-output", selectedWellId],
    queryFn: async () => {
      const res = await fetch(`/api/optimize?wellId=${selectedWellId}`);
      if (!res.ok) throw new Error("Failed to run optimization engine");
      return res.json();
    },
    refetchInterval: 3500,
  });

  const simMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSpm: simSpm,
          viscosityCp: simVisc,
          rodFloatingFlag: simForceFloating,
          frictionalDrag: simForceFloating ? 3200 : 1100,
          cycleDay: 38,
        }),
      });
      if (!res.ok) throw new Error("Sandbox run failed");
      return res.json();
    },
  });

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <span className="text-xs font-mono">Running Rule-Based Well-to-Surface Optimizer...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-soft text-slate-800 max-w-lg mx-auto text-center mt-12">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <p className="font-bold text-base">Error executing optimizer engine</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono shadow-md hover:bg-slate-800"
        >
          Retry Engine
        </button>
      </div>
    );
  }

  const { well, optimization } = data;
  const opt = simMutation.data?.optimization || optimization;
  const isEmergency = opt.risk_level === "RED";

  return (
    <DashboardShell title="Auto-Pilot Optimization Advisor">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              Well-to-Surface Optimization Engine
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-1">
              Rule-based, explainable physics advisor coupling reservoir thermal dissipation with sucker rod kinematics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <RiskBadge level={opt.risk_level} size="md" />
            <button
              onClick={() => setSimulatorOpen(!simulatorOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-xs font-mono font-semibold shadow-sm transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>{simulatorOpen ? "Close Sandbox" : "What-If Simulator"}</span>
            </button>
          </div>
        </div>

        {/* What-If Simulator Sandbox */}
        {simulatorOpen && (
          <div className="rounded-2xl bg-card border border-amber-500/40 p-5 sm:p-6 shadow-sm transition-all">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold font-sans text-foreground uppercase">
                  What-If Parameter Sandbox (Interactive Engineering Test)
                </h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                Test how rule-based logic responds to custom viscosity or SPM inputs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">
                  Pump Speed (SPM): <span className="text-foreground font-bold">{simSpm} SPM</span>
                </label>
                <input
                  type="range"
                  min="2.0"
                  max="8.0"
                  step="0.1"
                  value={simSpm}
                  onChange={(e) => setSimSpm(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">
                  Crude Viscosity (cP): <span className="text-foreground font-bold">{simVisc} cP</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="2500"
                  step="25"
                  value={simVisc}
                  onChange={(e) => setSimVisc(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <label className="text-xs font-mono text-foreground flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simForceFloating}
                    onChange={(e) => setSimForceFloating(e.target.checked)}
                    className="rounded bg-muted border-border text-amber-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="font-semibold">Simulate Rod-Floating Trigger</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => simMutation.mutate()}
                disabled={simMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs font-mono uppercase tracking-wider transition-colors shadow-sm"
              >
                {simMutation.isPending ? "Evaluating..." : "Run Sandbox Optimizer"}
              </button>
              {simMutation.data && (
                <button
                  onClick={() => simMutation.reset()}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground underline"
                >
                  Reset to Live Telemetry
                </button>
              )}
            </div>
          </div>
        )}

        {/* CORE HERO CARD: Optimizer Recommendations */}
        <div
          className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 shadow-sm ${
            isEmergency
              ? "bg-rose-500/10 border-rose-500/30 shadow-sm"
              : "bg-card border-border/80"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border/60">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5 mb-1">
                <Cpu className="w-4 h-4" />
                <span>Current Advisory Output</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground font-sans">
                {isEmergency
                  ? "Immediate VFD Speed Throttling Required"
                  : "Parameters Operating Within Thermal Sweet Spot"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <RiskBadge
                level={opt.risk_level}
                size="lg"
                labelOverride={
                  isEmergency
                    ? "CRITICAL: THROTTLE TO 3.2 SPM"
                    : "OPTIMAL PARAMETERS"
                }
              />
            </div>
          </div>

          {/* Triple Parameter Recommendation Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 my-6">
            {/* 1. Recommended SPM */}
            <div className="rounded-2xl bg-slate-900 text-white p-5 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span className="uppercase font-semibold tracking-wider">Recommended SPM</span>
                <Gauge className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums">
                  {opt.recommended_spm}
                </span>
                <span className="text-sm font-semibold font-mono text-slate-400">SPM</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono flex items-center justify-between text-slate-400">
                <span>Current Speed:</span>
                <span className={`font-bold ${isEmergency ? "text-rose-400 line-through" : "text-white"}`}>
                  {opt.current_spm} SPM
                </span>
              </div>
            </div>

            {/* 2. Recommended Stroke Length */}
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                <span className="uppercase font-semibold tracking-wider">Recommended Stroke</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground tabular-nums">
                  {opt.recommended_stroke}&quot;
                </span>
                <span className="text-sm font-semibold font-mono text-muted-foreground">Inches</span>
              </div>
              <div className="mt-3 pt-3 border-t border-border/60 text-xs font-mono flex items-center justify-between text-muted-foreground">
                <span>Current Stroke:</span>
                <span className="font-bold text-foreground">{opt.current_stroke}&quot;</span>
              </div>
            </div>

            {/* 3. Next CSS Trigger */}
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                <span className="uppercase font-semibold tracking-wider">Next CSS Trigger</span>
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-lg font-bold font-mono text-amber-600 leading-tight">
                {opt.next_cycle_trigger.replace(/_/g, " ")}
              </div>
              <div className="mt-3 pt-3 border-t border-border/60 text-xs font-mono flex items-center justify-between text-muted-foreground">
                <span>Active Cycle:</span>
                <span className="font-bold text-foreground">Day {opt.cycle_day}</span>
              </div>
            </div>
          </div>

          {/* Explainable Reasoning Callout Box */}
          <div className="rounded-2xl bg-card border border-border/80 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono font-semibold uppercase tracking-wider text-amber-600">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Explainable Physics Reasoning (Engine Diagnostics)</span>
            </div>
            <p className="text-xs sm:text-sm text-foreground font-mono leading-relaxed bg-muted/40 rounded-xl p-4 border border-border/60">
              &quot;{opt.reasoning}&quot;
            </p>
          </div>
        </div>

        {/* Field Protocol & Impact Action */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <div className="rounded-2xl bg-card border border-border/80 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Operational Action Checklist (Field Protocol)
              </h3>
            </div>

            <div className="space-y-3">
              {opt.action_items.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-muted/40 rounded-xl p-3 border border-border/60 text-xs font-mono text-foreground"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Projected Impact & Vibrant Green CTA */}
          <div className="rounded-2xl bg-card border border-border/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                  Projected Impact on Lifting Performance
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/40 rounded-xl p-3.5 border border-border/60">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                    Power Savings
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold font-mono text-amber-600">
                    {opt.expected_energy_savings_pct}%
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                    -{opt.expected_energy_delta_kwh} kWh/bbl lifted
                  </span>
                </div>

                <div className="bg-muted/40 rounded-xl p-3.5 border border-border/60">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                    SOR Target
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600">
                    3.25 t/t
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                    vs 4.75 conventional baseline
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                Matching SPM directly to heavy crude terminal fall velocity eliminates sucker rod compression buckling, avoiding catastrophic rod parting workovers (average savings: ₹18–25 Lakhs per failure).
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
              <Link
                href="/kpi"
                className="text-xs font-mono font-bold text-muted-foreground hover:text-foreground underline"
              >
                Explore Full KPI Metrics →
              </Link>

              <button
                onClick={() => refetch()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Apply VFD Optimization</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
);
}
