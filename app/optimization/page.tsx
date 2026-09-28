"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTwinStore } from "@/lib/store/useTwinStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { RiskBadge } from "@/components/cards/RiskBadge";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  Lightbulb,
  ListChecks,
  RotateCcw,
  Sliders,
  Sparkles,
  TrendingDown,
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
    refetchInterval: 3500, // Sync with SCADA polling
  });

  // What-if sandbox mutation
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono">Running Rule-Based Well-to-Surface Optimizer...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300">
        <p className="font-bold">Error executing optimizer engine</p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono"
        >
          Retry Engine
        </button>
      </div>
    );
  }

  const { well, optimization, engine } = data;
  const opt = simMutation.data?.optimization || optimization;
  const isEmergency = opt.risk_level === "RED";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Well-to-Surface Optimization Engine"
        subtitle="Rule-based, explainable physics advisor coupling reservoir thermal dissipation with sucker rod kinematics for Baghewala Field heavy oil wells."
        badge={<RiskBadge level={opt.risk_level} size="md" />}
        onRefresh={() => refetch()}
        isFetching={isFetching}
        actions={
          <button
            onClick={() => setSimulatorOpen(!simulatorOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{simulatorOpen ? "Close What-If Sandbox" : "What-If Simulator"}</span>
          </button>
        }
      />

      {/* What-If Simulator Sandbox Drawer */}
      {simulatorOpen && (
        <div className="rounded-xl bg-slate-900 border border-amber-500/40 p-5 shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold font-mono text-white uppercase">
                What-If Parameter Sandbox (Interactive Engineering Test)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Test how the rule-based logic responds to custom viscosity or SPM inputs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Pump Speed (SPM): <span className="text-white font-bold">{simSpm} SPM</span>
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
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Crude Viscosity (cP): <span className="text-white font-bold">{simVisc} cP</span>
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
              <label className="text-xs font-mono text-slate-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simForceFloating}
                  onChange={(e) => setSimForceFloating(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Simulate Rod-Floating Trigger</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => simMutation.mutate()}
              disabled={simMutation.isPending}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-colors shadow-md"
            >
              {simMutation.isPending ? "Executing Model..." : "Run Sandbox Optimizer"}
            </button>
            {simMutation.data && (
              <button
                onClick={() => simMutation.reset()}
                className="text-xs font-mono text-slate-400 hover:text-white underline"
              >
                Reset to Live Telemetry
              </button>
            )}
          </div>
        </div>
      )}

      {/* CORE HERO CARD: Optimizer Recommendations */}
      <div
        className={`rounded-2xl border p-6 transition-all duration-300 ${
          isEmergency
            ? "bg-rose-950/30 border-rose-500/50 shadow-2xl shadow-rose-950/40"
            : "bg-slate-900/90 border-slate-800"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
              <Cpu className="w-4 h-4" />
              <span>Current Advisory Output</span>
            </span>
            <h2 className="text-2xl font-bold text-white font-mono">
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
                  ? "CRITICAL ROD-FLOATING (THROTTLE REQUIRED)"
                  : opt.risk_level === "AMBER"
                  ? "ELEVATED DRAG (PREVENTIVE ADJUSTMENT)"
                  : "OPTIMAL PARAMETERS"
              }
            />
          </div>
        </div>

        {/* Triple Parameter Recommendation Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {/* 1. Recommended SPM */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="uppercase">Recommended SPM</span>
              <Gauge className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-white">
                {opt.recommended_spm}
              </span>
              <span className="text-sm font-semibold font-mono text-slate-400">SPM</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-900 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-400">Current Speed:</span>
              <span className={`font-bold ${isEmergency ? "text-rose-400 line-through" : "text-slate-300"}`}>
                {opt.current_spm} SPM
              </span>
            </div>
          </div>

          {/* 2. Recommended Stroke Length */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="uppercase">Recommended Stroke</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-white">
                {opt.recommended_stroke}&quot;
              </span>
              <span className="text-sm font-semibold font-mono text-slate-400">Inches</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-900 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-400">Current Stroke:</span>
              <span className="font-bold text-slate-300">{opt.current_stroke}&quot;</span>
            </div>
          </div>

          {/* 3. Next CSS Trigger */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="uppercase">Next CSS Trigger</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-lg font-bold font-mono text-amber-300 leading-tight">
              {opt.next_cycle_trigger.replace(/_/g, " ")}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-900 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-400">Active Cycle:</span>
              <span className="font-bold text-white">Day {opt.cycle_day}</span>
            </div>
          </div>
        </div>

        {/* Explainable Reasoning Callout Box */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            <Lightbulb className="w-4 h-4" />
            <span>Explainable Physics Reasoning (Engine Diagnostics)</span>
          </div>
          <p className="text-sm text-slate-200 font-mono leading-relaxed bg-slate-900/60 rounded-lg p-4 border border-slate-800">
            &quot;{opt.reasoning}&quot;
          </p>
        </div>
      </div>

      {/* Action Items Checklist for Field Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300">
              Operational Action Checklist (Field Protocol)
            </h3>
          </div>

          <div className="space-y-3">
            {opt.action_items.map((item: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-slate-900/80 rounded-lg p-3 border border-slate-800/80 text-xs font-mono text-slate-300"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 text-[10px] font-bold">
                  {idx + 1}
                </div>
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projected Impact & Field Economics */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold uppercase text-slate-300">
                Projected Impact on Lifting Performance
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Power Savings
                </span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  {opt.expected_energy_savings_pct}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  -{opt.expected_energy_delta_kwh} kWh/bbl lifted
                </span>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  SOR Target
                </span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  3.25 t/t
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  vs 4.75 conventional baseline
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              By matching SPM directly to heavy crude terminal fall velocity, polished rod downstroke shock
              is eradicated, preventing costly sucker rod parting workovers (average savings: ₹18–25 Lakhs per avoided failure).
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">View detailed metrics</span>
            <Link
              href="/kpi"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold"
            >
              <span>Explore KPI & Impact Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
