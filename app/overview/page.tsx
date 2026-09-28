"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTwinStore } from "@/lib/store/useTwinStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusCard } from "@/components/cards/StatusCard";
import { RiskBadge } from "@/components/cards/RiskBadge";
import { DynoCard } from "@/components/charts/DynoCard";
import { ViscosityCurve } from "@/components/charts/ViscosityCurve";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Droplet,
  Flame,
  Gauge,
  Layers,
  Sliders,
  Thermometer,
  Zap,
} from "lucide-react";

export default function OverviewPage() {
  const { selectedWellId } = useTwinStore();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["well-state", selectedWellId],
    queryFn: async () => {
      const res = await fetch(`/api/well-state?wellId=${selectedWellId}`);
      if (!res.ok) throw new Error("Failed to load well state");
      return res.json();
    },
    refetchInterval: 3500, // Poll every 3.5s
  });

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono">Connecting to Baghewala Field Twin Telemetry...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300">
        <p className="font-bold">Error loading digital twin telemetry</p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { well, activeCycle, reservoir, srp, demo } = data;
  const isEmergency = srp.rod_floating_flag;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${well.name} — Digital Twin Overview`}
        subtitle="Real-time multi-physics telemetry coupling Cyclic Steam Stimulation (CSS) reservoir kinetics with Sucker Rod Pump (SRP) mechanics."
        badge={
          <RiskBadge
            level={srp.risk_level}
            size="md"
            labelOverride={isEmergency ? "CRITICAL ROD-FLOATING" : undefined}
          />
        }
        onRefresh={() => refetch()}
        isFetching={isFetching}
      />

      {/* Primary Key Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Active CSS Cycle"
          value={`Day ${activeCycle?.cycle_day ?? 38}`}
          unit={`/ Cycle #${activeCycle?.cycle_number ?? 3}`}
          secondaryText="Production Phase (Huff-and-Puff)"
          trendText="Cooling Phase"
          trendDirection="neutral"
          icon={Flame}
          statusColor="amber"
        />

        <StatusCard
          title="Bottom-Hole Viscosity"
          value={reservoir.viscosity_cp.toLocaleString()}
          unit="cP"
          secondaryText={`Temp: ${reservoir.temperature_c}°C (Decaying)`}
          trendText={reservoir.viscosity_cp > 750 ? "High Drag" : "Nominal"}
          trendDirection={reservoir.viscosity_cp > 750 ? "warning" : "up"}
          icon={Droplet}
          statusColor={reservoir.viscosity_cp > 800 ? "rose" : "sky"}
        />

        <StatusCard
          title="SRP Operating State"
          value={srp.spm}
          unit="SPM"
          secondaryText={`Stroke: ${srp.stroke_length}" | Load: ${srp.load.toLocaleString()} lbs`}
          trendText={isEmergency ? "Throttling Req." : "Stable Velocity"}
          trendDirection={isEmergency ? "danger" : "up"}
          icon={Activity}
          statusColor={isEmergency ? "rose" : "slate"}
        />

        <StatusCard
          title="Mechanical Twin Risk"
          value={srp.risk_level}
          secondaryText={
            isEmergency
              ? "Rod-floating in heavy crude!"
              : "Clear valve transit & stable fall"
          }
          trendText={isEmergency ? "ACTION NEEDED" : "NORMAL OPS"}
          trendDirection={isEmergency ? "danger" : "up"}
          icon={AlertTriangle}
          statusColor={srp.risk_level === "RED" ? "rose" : srp.risk_level === "AMBER" ? "amber" : "emerald"}
          badge={<RiskBadge level={srp.risk_level} size="sm" />}
        />
      </div>

      {/* Emergency Action Banner if Rod Floating */}
      {isEmergency && (
        <div className="rounded-xl bg-rose-950/60 border border-rose-500/60 p-4 shadow-lg shadow-rose-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulseSlow">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                CRITICAL INTERVENTION REQUIRED: ROD-FLOATING DETECTED
              </h3>
              <p className="text-xs text-rose-200 mt-1 max-w-3xl">
                Heavy oil viscous friction (viscosity {reservoir.viscosity_cp} cP) is resisting downward rod motion.
                Minimum polished rod load has collapsed to {srp.min_load.toLocaleString()} lbs. Risk of rod compression buckling and gearbox impact shock.
              </p>
            </div>
          </div>
          <Link
            href="/optimization"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono uppercase tracking-wider shrink-0 transition-colors"
          >
            <span>View Optimizer Advisory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Secondary Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Reservoir Temp</span>
          <span className="text-lg font-bold font-mono text-orange-400">
            {reservoir.temperature_c}°C
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Peak: 254°C</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Bottom-Hole Press.</span>
          <span className="text-lg font-bold font-mono text-sky-400">
            {reservoir.pressure_bar} bar
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Initial: 48 bar</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Estimated Oil Rate</span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            {reservoir.oil_rate_bpd} bpd
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">15.2° API crude</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Peak Rod Load</span>
          <span className={`text-lg font-bold font-mono ${isEmergency ? "text-rose-400" : "text-white"}`}>
            {srp.load.toLocaleString()} lbs
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Rating: 24,000 lbs</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Min Rod Load</span>
          <span className={`text-lg font-bold font-mono ${isEmergency ? "text-rose-400" : "text-white"}`}>
            {srp.min_load.toLocaleString()} lbs
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Limit: 3,800 lbs</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Gearbox Torque</span>
          <span className={`text-lg font-bold font-mono ${srp.gearbox_torque_pct > 80 ? "text-amber-400" : "text-white"}`}>
            {srp.gearbox_torque_pct}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Permissible: 85%</span>
        </div>
      </div>

      {/* Main Dual Panels: Dyno Preview & Reservoir Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Real-Time Dynamometer Signature</span>
            </h2>
            <Link
              href="/srp-performance"
              className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Detailed Card</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <DynoCard
            data={srp.dyno_card}
            strokeLength={srp.stroke_length}
            isFloating={isEmergency}
            peakLoad={srp.load}
            minLoad={srp.min_load}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Post-Steam Viscosity & Thermal Decay</span>
            </h2>
            <Link
              href="/css-cycle"
              className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Cycle History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ViscosityCurve currentDay={activeCycle?.cycle_day ?? 38} />
        </div>
      </div>

      {/* Quick Navigation to Optimization & KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <Link
          href="/optimization"
          className="group rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-5 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                Optimization Engine
                <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  Rule-Based Advisor
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Calculate recommended SPM & stroke adjustments to eliminate rod-floating and schedule CSS Cycle #4.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </Link>

        <Link
          href="/kpi"
          className="group rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-5 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                KPI & Impact Analysis
                <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  -31.6% SOR Reduction
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Explore before-and-after steam-oil ratio efficiency, kWh/bbl energy savings, and Baghewala Field economics.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
