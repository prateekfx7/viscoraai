"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTwinStore } from "@/lib/store/useTwinStore";
import { RiskBadge } from "@/components/cards/RiskBadge";
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
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Well-to-Surface Optimization Engine
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Rule-based, explainable physics advisor coupling reservoir thermal dissipation with sucker rod kinematics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RiskBadge level={opt.risk_level} size="md" />
          <button
            onClick={() => setSimulatorOpen(!simulatorOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-mono font-semibold shadow-soft transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span>{simulatorOpen ? "Close Sandbox" : "What-If Simulator"}</span>
          </button>
        </div>
      </div>

      {/* What-If Simulator Sandbox */}
      {simulatorOpen && (
        <div className="rounded-3xl bg-white border border-amber-300 p-6 shadow-card transition-all">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold font-sans text-slate-900 uppercase">
                What-If Parameter Sandbox (Interactive Engineering Test)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Test how the rule-based logic responds to custom viscosity or SPM inputs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
            <div>
              <label className="text-xs font-mono text-slate-600 block mb-1.5">
                Pump Speed (SPM): <span className="text-slate-900 font-bold">{simSpm} SPM</span>
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
              <label className="text-xs font-mono text-slate-600 block mb-1.5">
                Crude Viscosity (cP): <span className="text-slate-900 font-bold">{simVisc} cP</span>
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
              <label className="text-xs font-mono text-slate-700 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simForceFloating}
                  onChange={(e) => setSimForceFloating(e.target.checked)}
                  className="rounded bg-slate-100 border-slate-300 text-amber-600 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold">Simulate Rod-Floating Trigger</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => simMutation.mutate()}
              disabled={simMutation.isPending}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-mono uppercase tracking-wider transition-colors shadow-md"
            >
              {simMutation.isPending ? "Evaluating..." : "Run Sandbox Optimizer"}
            </button>
            {simMutation.data && (
              <button
                onClick={() => simMutation.reset()}
                className="text-xs font-mono text-slate-500 hover:text-slate-900 underline"
              >
                Reset to Live Telemetry
              </button>
            )}
          </div>
        </div>
      )}

      {/* CORE HERO CARD: Optimizer Recommendations */}
      <div
        className={`rounded-3xl border p-6 transition-all duration-300 shadow-soft ${
          isEmergency
            ? "bg-rose-50/70 border-rose-300 shadow-card"
            : "bg-white border-slate-200/90"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5 mb-1">
              <Cpu className="w-4 h-4" />
              <span>Current Advisory Output</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {/* 1. Recommended SPM */}
          <div className="rounded-2xl bg-[#1A1E26] text-white p-5 shadow-darkCard">
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
            <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono flex items-center justify-between text-slate-400">
              <span>Current Speed:</span>
              <span className={`font-bold ${isEmergency ? "text-rose-400 line-through" : "text-white"}`}>
                {opt.current_spm} SPM
              </span>
            </div>
          </div>

          {/* 2. Recommended Stroke Length */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-soft">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="uppercase">Recommended Stroke</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-slate-900">
                {opt.recommended_stroke}&quot;
              </span>
              <span className="text-sm font-semibold font-mono text-slate-400">Inches</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-mono flex items-center justify-between text-slate-500">
              <span>Current Stroke:</span>
              <span className="font-bold text-slate-900">{opt.current_stroke}&quot;</span>
            </div>
          </div>

          {/* 3. Next CSS Trigger */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-soft">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="uppercase">Next CSS Trigger</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-lg font-bold font-mono text-amber-700 leading-tight">
              {opt.next_cycle_trigger.replace(/_/g, " ")}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-mono flex items-center justify-between text-slate-500">
              <span>Active Cycle:</span>
              <span className="font-bold text-slate-900">Day {opt.cycle_day}</span>
            </div>
          </div>
        </div>

        {/* Explainable Reasoning Callout Box */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-700">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Explainable Physics Reasoning (Engine Diagnostics)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 font-mono leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            &quot;{opt.reasoning}&quot;
          </p>
        </div>
      </div>

      {/* Field Protocol & Impact Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
              Operational Action Checklist (Field Protocol)
            </h3>
          </div>

          <div className="space-y-3">
            {opt.action_items.map((item: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs font-mono text-slate-700"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  {idx + 1}
                </div>
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projected Impact & Vibrant Green CTA */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
                Projected Impact on Lifting Performance
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">
                  Power Savings
                </span>
                <span className="text-xl font-extrabold font-mono text-amber-600">
                  {opt.expected_energy_savings_pct}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  -{opt.expected_energy_delta_kwh} kWh/bbl lifted
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">
                  SOR Target
                </span>
                <span className="text-xl font-extrabold font-mono text-emerald-600">
                  3.25 t/t
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  vs 4.75 conventional baseline
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Matching SPM directly to heavy crude terminal fall velocity eliminates sucker rod compression buckling, avoiding catastrophic rod parting workovers (average savings: ₹18–25 Lakhs per failure).
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/kpi"
              className="text-xs font-mono font-bold text-slate-700 hover:text-slate-900 underline"
            >
              Explore Full KPI Metrics →
            </Link>

            <button
              onClick={() => refetch()}
              className="px-6 py-3 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Apply VFD Optimization</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
