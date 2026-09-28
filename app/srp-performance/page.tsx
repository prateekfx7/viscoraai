"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTwinStore } from "@/lib/store/useTwinStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusCard } from "@/components/cards/StatusCard";
import { RiskBadge } from "@/components/cards/RiskBadge";
import { DynoCard } from "@/components/charts/DynoCard";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Gauge,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function SrpPerformancePage() {
  const { selectedWellId } = useTwinStore();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["srp-telemetry", selectedWellId],
    queryFn: async () => {
      const res = await fetch(`/api/srp?wellId=${selectedWellId}`);
      if (!res.ok) throw new Error("Failed to fetch SRP telemetry");
      return res.json();
    },
    refetchInterval: 3500, // 3.5s real-time SCADA polling
  });

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono">Acquiring SRP SCADA Telemetry & Dyno Stream...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300">
        <p className="font-bold">Error loading SRP telemetry stream</p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { telemetry, assessment, dyno_card, recentHistory, card_classification, demo } = data;
  const isFloating = telemetry.rod_floating_flag || assessment.is_rod_floating;

  return (
    <div className="space-y-6">
      <PageHeader
        title="SRP Performance & Dynamometer Telemetry"
        subtitle="Continuous load vs position card acquisition, downstroke drag analysis, and real-time rod-floating detection for Baghewala heavy crude."
        badge={<RiskBadge level={assessment.risk_level} size="md" />}
        onRefresh={() => refetch()}
        isFetching={isFetching}
      />

      {/* Critical Rod-Floating Alert Banner */}
      {isFloating ? (
        <div className="rounded-xl bg-rose-950/50 border border-rose-500/60 p-4 sm:p-5 shadow-xl shadow-rose-950/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                    ROD-FLOATING SIGNATURE CONFIRMED
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500 text-white font-bold">
                    CRITICAL
                  </span>
                </div>
                <p className="text-xs text-rose-200 mt-1 max-w-3xl leading-relaxed">
                  The sucker rod string is descending slower than the carrier bar due to intense viscous drag (frictional drag:{" "}
                  <strong>{telemetry.frictional_drag_lbs} lbs</strong>). Minimum load has dropped to{" "}
                  <strong>{telemetry.min_load_lbs} lbs</strong>. Continued operation at {telemetry.spm} SPM will cause rod buckling, fatigue parting, and gearbox damage.
                </p>
              </div>
            </div>

            <Link
              href="/optimization"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono uppercase tracking-wider shrink-0 transition-colors shadow-md"
            >
              <span>View Recommended SPM Fix</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-semibold text-emerald-300">
                Normal Rod Motion & Stable Valve Transfer
              </span>
              <p className="text-[11px] text-slate-400">
                Buoyant rod string descent matches beam velocity. No rod buckling or compression anomalies.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            SAFE ENVELOPE
          </span>
        </div>
      )}

      {/* Main KPI Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Pump Speed (SPM)"
          value={telemetry.spm}
          unit="SPM"
          secondaryText={`Safe Ceiling: ${assessment.safe_spm_ceiling} SPM`}
          trendText={isFloating ? "EXCEEDS LIMIT" : "WITHIN LIMIT"}
          trendDirection={isFloating ? "danger" : "up"}
          icon={Gauge}
          statusColor={isFloating ? "rose" : "slate"}
        />

        <StatusCard
          title="Peak Polished Rod Load"
          value={telemetry.peak_load_lbs.toLocaleString()}
          unit="lbs"
          secondaryText="Structure Capacity: 24,000 lbs"
          trendText={telemetry.peak_load_lbs > 21000 ? "Overload Stress" : "Nominal"}
          trendDirection={telemetry.peak_load_lbs > 21000 ? "danger" : "up"}
          icon={Activity}
          statusColor={telemetry.peak_load_lbs > 21000 ? "rose" : "slate"}
        />

        <StatusCard
          title="Minimum Downstroke Load"
          value={telemetry.min_load_lbs.toLocaleString()}
          unit="lbs"
          secondaryText="Alarm Floor: 3,800 lbs"
          trendText={isFloating ? "SEVERE DROP" : "STABLE"}
          trendDirection={isFloating ? "danger" : "up"}
          icon={AlertTriangle}
          statusColor={isFloating ? "rose" : "emerald"}
        />

        <StatusCard
          title="Frictional Viscous Drag"
          value={telemetry.frictional_drag_lbs.toLocaleString()}
          unit="lbs"
          secondaryText={`Drag/Weight Ratio: ${(assessment.diagnostics.viscous_drag_ratio * 100).toFixed(1)}%`}
          trendText={assessment.drag_severity}
          trendDirection={assessment.drag_severity === "SEVERE" ? "danger" : "neutral"}
          icon={Zap}
          statusColor={assessment.drag_severity === "SEVERE" ? "rose" : assessment.drag_severity === "MODERATE" ? "amber" : "slate"}
        />
      </div>

      {/* Central Dynamometer Card Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DynoCard
            data={dyno_card}
            strokeLength={telemetry.stroke_length}
            isFloating={isFloating}
            peakLoad={telemetry.peak_load_lbs}
            minLoad={telemetry.min_load_lbs}
          />
        </div>

        {/* Diagnostic Panel & Baghewala Physics Explanation */}
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Card Classification & Diagnostics</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Classification</span>
                <span className={`font-semibold block mt-0.5 ${isFloating ? "text-rose-400" : "text-emerald-400"}`}>
                  {card_classification}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Gearbox Torque</span>
                  <span className={`text-sm font-bold ${telemetry.gearbox_torque_pct > 80 ? "text-amber-400" : "text-white"}`}>
                    {telemetry.gearbox_torque_pct}%
                  </span>
                </div>
                <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Safe SPM Ceiling</span>
                  <span className="text-sm font-bold text-sky-400">
                    {assessment.safe_spm_ceiling} SPM
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Downstroke Compression:</span>
                  <span className={isFloating ? "text-rose-400 font-bold" : "text-emerald-400"}>
                    {isFloating ? "ACTIVE (Plateau)" : "NONE"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Traveling Valve Delay:</span>
                  <span className={isFloating ? "text-rose-400 font-bold" : "text-emerald-400"}>
                    {isFloating ? "420 ms (LAG)" : "Normal (<80ms)"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Rod Fatigue Stress Index:</span>
                  <span className={isFloating ? "text-rose-400 font-bold" : "text-slate-300"}>
                    {isFloating ? "HIGH (88/100)" : "LOW (32/100)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Physics Explainer */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Physics: Rod Floating in Baghewala Heavy Crude</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Baghewala crude (15.2° API) has severe viscosity (&gt;750 cP) during CSS cooling.
              When pumping speed exceeds Stokes terminal fall velocity, upward viscous skin friction
              counteracts rod gravity weight. The polished rod floats, delaying downstroke load release and causing severe rod buckling.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Time-Series Telemetry Trends */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-xs font-mono font-semibold uppercase text-slate-300">
              Recent Polished Rod Load History (SCADA 3.5s Ticks)
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live monitoring of Peak Load vs Minimum Load depression signature
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-0.5 bg-sky-400"></span> Peak Load (lbs)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-0.5 bg-rose-400"></span> Min Load (lbs)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-0.5 bg-amber-400"></span> Frictional Drag (lbs)
            </span>
          </div>
        </div>

        <div className="w-full h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentHistory} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={10} fontFamily="monospace" />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                domain={[0, 25000]}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                fontFamily="monospace"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-mono shadow-xl">
                        <p className="text-slate-400 mb-1">{pt.time}</p>
                        <p className="text-sky-400">
                          Peak Load: <span className="text-white font-bold">{pt.load} lbs</span>
                        </p>
                        <p className="text-rose-400">
                          Min Load: <span className="text-white font-bold">{pt.min_load} lbs</span>
                        </p>
                        <p className="text-amber-400">
                          Frictional Drag: <span className="text-white font-bold">{pt.drag} lbs</span>
                        </p>
                        <p className="text-slate-300">
                          SPM: <span className="text-white font-bold">{pt.spm}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="load" stroke="#38BDF8" strokeWidth={2} dot={false} name="Peak Load" />
              <Line type="monotone" dataKey="min_load" stroke="#EF4444" strokeWidth={2} dot={false} name="Min Load" />
              <Line type="monotone" dataKey="drag" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Drag" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
