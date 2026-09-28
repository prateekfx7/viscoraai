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
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Gauge,
  HelpCircle,
  ShieldAlert,
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
    refetchInterval: 3500,
  });

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <span className="text-xs font-mono">Acquiring SRP SCADA Telemetry & Dyno Stream...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-soft text-slate-800 max-w-lg mx-auto text-center mt-12">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <p className="font-bold text-base">Error loading SRP telemetry stream</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono shadow-md hover:bg-slate-800"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { telemetry, assessment, dyno_card, recentHistory, card_classification } = data;
  const isFloating = telemetry.rod_floating_flag || assessment.is_rod_floating;

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            SRP Performance & Dynamometer Telemetry
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Continuous load vs position card acquisition, downstroke drag analysis, and real-time rod-floating detection for Baghewala heavy crude.
          </p>
        </div>
        <div>
          <RiskBadge level={assessment.risk_level} size="md" />
        </div>
      </div>

      {/* Critical Rod-Floating Alert Banner */}
      {isFloating ? (
        <div className="rounded-3xl bg-rose-50 border border-rose-300 p-5 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-600 text-white shrink-0 shadow-sm">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-rose-900 font-sans uppercase tracking-wide">
                    ROD-FLOATING SIGNATURE CONFIRMED (DOWNSTROKE DRAG)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold">
                    CRITICAL
                  </span>
                </div>
                <p className="text-xs text-rose-800 mt-1 max-w-3xl leading-relaxed">
                  The sucker rod string is descending slower than the carrier bar due to intense viscous friction (frictional drag:{" "}
                  <strong>{telemetry.frictional_drag_lbs} lbs</strong>). Minimum load collapsed to{" "}
                  <strong>{telemetry.min_load_lbs} lbs</strong>. Continued operation at {telemetry.spm} SPM will cause rod buckling, fatigue parting, and gearbox impact shock.
                </p>
              </div>
            </div>

            <Link
              href="/optimization"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider shrink-0 shadow-md transition-all"
            >
              <span>View Recommended SPM Fix</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200/90 p-4 shadow-soft flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 font-sans">
                Normal Rod Motion & Stable Valve Transfer
              </span>
              <p className="text-[11px] text-slate-500 font-mono">
                Buoyant rod string descent matches beam velocity. No rod buckling or compression anomalies.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
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
          secondaryText={`Drag Ratio: ${(assessment.diagnostics.viscous_drag_ratio * 100).toFixed(1)}%`}
          trendText={assessment.drag_severity}
          trendDirection={assessment.drag_severity === "SEVERE" ? "danger" : "neutral"}
          icon={Zap}
          statusColor={assessment.drag_severity === "SEVERE" ? "rose" : "slate"}
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
          <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <span>Card Classification & Diagnostics</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase">Classification</span>
                <span className={`font-bold block mt-0.5 ${isFloating ? "text-rose-600" : "text-emerald-700"}`}>
                  {card_classification}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase">Gearbox Torque</span>
                  <span className={`text-base font-extrabold ${telemetry.gearbox_torque_pct > 80 ? "text-amber-600" : "text-slate-900"}`}>
                    {telemetry.gearbox_torque_pct}%
                  </span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase">Safe SPM Ceiling</span>
                  <span className="text-base font-extrabold text-sky-600">
                    {assessment.safe_spm_ceiling} SPM
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 text-[11px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Downstroke Compression:</span>
                  <span className={isFloating ? "text-rose-600 font-bold" : "text-emerald-600"}>
                    {isFloating ? "ACTIVE (Plateau)" : "NONE"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Traveling Valve Delay:</span>
                  <span className={isFloating ? "text-rose-600 font-bold" : "text-emerald-600"}>
                    {isFloating ? "420 ms (LAG)" : "Normal (<80ms)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Physics Explainer */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-soft">
            <h4 className="text-xs font-bold text-amber-700 uppercase font-sans flex items-center gap-1.5 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Physics: Rod Floating in Heavy Crude</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              Baghewala crude (15.2° API) has extreme viscosity (&gt;750 cP) during CSS cooling.
              When pumping speed exceeds Stokes terminal fall velocity, upward viscous friction
              counteracts rod gravity weight. The polished rod floats, delaying downstroke load release and causing severe rod buckling.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Time-Series Telemetry Trends */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
              Recent Polished Rod Load History (SCADA 3.5s Ticks)
            </span>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Live monitoring of Peak Load vs Minimum Load depression signature
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-sky-600">
              <span className="w-2.5 h-0.5 bg-sky-500"></span> Peak Load (lbs)
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2.5 h-0.5 bg-rose-500"></span> Min Load (lbs)
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-2.5 h-0.5 bg-amber-500"></span> Frictional Drag (lbs)
            </span>
          </div>
        </div>

        <div className="w-full h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentHistory} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} fontFamily="monospace" />
              <YAxis
                stroke="#94A3B8"
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
                      <div className="bg-white border border-slate-200 rounded-2xl p-3 text-xs font-mono shadow-card">
                        <p className="text-slate-400 mb-1">{pt.time}</p>
                        <p className="text-sky-600">
                          Peak Load: <span className="text-slate-900 font-bold">{pt.load} lbs</span>
                        </p>
                        <p className="text-rose-600">
                          Min Load: <span className="text-slate-900 font-bold">{pt.min_load} lbs</span>
                        </p>
                        <p className="text-amber-600">
                          Drag: <span className="text-slate-900 font-bold">{pt.drag} lbs</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="load" stroke="#0284C7" strokeWidth={2} dot={false} name="Peak Load" />
              <Line type="monotone" dataKey="min_load" stroke="#EF4444" strokeWidth={2} dot={false} name="Min Load" />
              <Line type="monotone" dataKey="drag" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Drag" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
