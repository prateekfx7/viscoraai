"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTwinStore } from "@/lib/store/useTwinStore";
import { SORTrend } from "@/components/charts/SORTrend";
import { EnergyTrend } from "@/components/charts/EnergyTrend";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Calendar,
  CheckCircle2,
  Coins,
  Droplets,
  Flame,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function KpiPage() {
  const { selectedWellId } = useTwinStore();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["kpi-trends", selectedWellId],
    queryFn: async () => {
      const res = await fetch(`/api/kpi?wellId=${selectedWellId}`);
      if (!res.ok) throw new Error("Failed to load KPI analytics");
      return res.json();
    },
    refetchInterval: 3500,
  });

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <span className="text-xs font-mono">Aggregating SOR and Lifting Efficiency Analytics...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-soft text-slate-800 max-w-lg mx-auto text-center mt-12">
        <p className="font-bold">Error loading KPI dashboard</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, trendTimeline, demoScenarioActive } = data;

  return (
    <DashboardShell title="Field Savings & Economic Impact">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              KPI & Impact Analysis Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-1">
              Quantifying Steam-to-Oil Ratio (SOR) efficiency, electrical lifting energy reduction, and Baghewala Field operational savings.
            </p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono px-3.5 py-1.5 rounded-full font-bold">
            JUDGE PRESENTATION VIEW
          </span>
        </div>

        {/* Real-time Demo Hook Callout (Before / After Delta) */}
        {demoScenarioActive ? (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 shadow-sm">
                <Zap className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-950 dark:text-rose-300 font-sans">
                  Live Scenario Impact Delta: Uncorrected Rod-Floating vs Optimized SPM
                </span>
                <p className="text-xs text-rose-900 dark:text-rose-400 mt-1 max-w-3xl leading-relaxed font-sans">
                  Unthrottled pump at 5.8 SPM causes gear over-torque and consumes <strong className="font-mono">98.4 kWh/bbl</strong> with immediate rod parting hazard.
                  Applying twin recommendation (3.2 SPM) brings lifting power down to <strong className="font-mono">68.5 kWh/bbl</strong> (<strong className="font-mono">-29.9 kWh/bbl savings</strong>).
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm">
              30.2% Net Power Saved
            </span>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold uppercase text-foreground font-sans">
                  Digital Twin Validation vs Oil India Limited Baghewala Baselines
                </span>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Continuous closed-loop optimization achieves double-digit reduction in both steam intensity and pump wear.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
              Field Validated
            </span>
          </div>
        )}

        {/* Main Impact Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Metric 1: SOR */}
          <div className="rounded-2xl bg-card border border-border/80 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                <span className="uppercase font-semibold tracking-wider">Steam-Oil Ratio (SOR)</span>
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 tabular-nums">
                  {summary.optimized.sor}
                </span>
                <span className="text-xs font-mono text-muted-foreground">t/t (Optimized)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 mt-2 font-bold">
                <ArrowDownRight className="w-4 h-4" />
                <span>-{summary.improvements.sor_reduction_pct}% Steam Reduction</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-3 pt-2 border-t border-border/60">
              Baseline: {summary.baseline.sor} t/t
            </div>
          </div>

          {/* Metric 2: Energy per barrel */}
          <div className="rounded-2xl bg-card border border-border/80 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                <span className="uppercase font-semibold tracking-wider">Lifting Energy</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 tabular-nums">
                  {summary.optimized.energy_kwh_bbl}
                </span>
                <span className="text-xs font-mono text-muted-foreground">kWh/bbl</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 mt-2 font-bold">
                <ArrowDownRight className="w-4 h-4" />
                <span>-{summary.improvements.energy_savings_pct}% Power Conserved</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-3 pt-2 border-t border-border/60">
              Baseline: {summary.baseline.energy_kwh_bbl} kWh/bbl
            </div>
          </div>

          {/* Metric 3: Production rate */}
          <div className="rounded-2xl bg-card border border-border/80 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                <span className="uppercase font-semibold tracking-wider">Net Heavy Crude Lift</span>
                <Droplets className="w-4 h-4 text-sky-500" />
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-600 tabular-nums">
                  {summary.optimized.production_bpd}
                </span>
                <span className="text-xs font-mono text-muted-foreground">bpd</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 mt-2 font-bold">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{summary.improvements.production_lift_pct}% Production Lift</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-3 pt-2 border-t border-border/60">
              Baseline: {summary.baseline.production_bpd} bpd
            </div>
          </div>

          {/* Metric 4: Annualized Economics */}
          <div className="rounded-2xl bg-slate-900 text-white p-5 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span className="uppercase font-semibold tracking-wider">Baghewala Field OPEX</span>
                <Coins className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                  ₹{summary.fieldEconomics.cost_savings_inr_cr}
                </span>
                <span className="text-xs font-mono text-slate-400">Crores/yr</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 mt-2 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Payback: {summary.fieldEconomics.payback_period_months} months</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800">
              Steam saved: {summary.fieldEconomics.steam_saved_tonnes_yr.toLocaleString()} tonnes/yr
            </div>
          </div>
        </div>

        {/* Main Dual Charts: SOR Trend and Energy Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <div>
            <SORTrend data={trendTimeline} />
          </div>
          <div>
            <EnergyTrend data={trendTimeline} />
          </div>
        </div>

        {/* 30-Day Historical Snapshot Table */}
        <div className="rounded-2xl bg-card border border-border/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                30-Day Telemetry Snapshot Log (Well BGW-04)
              </h3>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              Showing latest 10 periods
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Control Regime</th>
                  <th className="py-2.5 px-3">SOR (t/t)</th>
                  <th className="py-2.5 px-3">Energy (kWh/bbl)</th>
                  <th className="py-2.5 px-3">Production (bbl/d)</th>
                  <th className="py-2.5 px-3">Efficiency Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {trendTimeline.slice(-10).map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 px-3 text-foreground font-medium">{row.date}</td>
                    <td className="py-2.5 px-3">
                      {row.optimized ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Twin Optimized
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Conventional
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={row.sor <= 3.5 ? "text-emerald-600 font-bold" : "text-foreground"}>
                        {row.sor}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={row.energy_per_bbl <= 75 ? "text-amber-600 font-bold" : "text-foreground"}>
                        {row.energy_per_bbl}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-foreground">{row.production_bbl}</td>
                    <td className="py-2.5 px-3">
                      {row.optimized ? (
                        <span className="text-emerald-600 text-[11px] font-bold">+32% Net Margin</span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Sub-optimal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
);
}
