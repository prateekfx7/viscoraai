"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTwinStore } from "@/lib/store/useTwinStore";
import { WellboreCutaway } from "@/components/twin/WellboreCutaway";
import { DynoCard } from "@/components/charts/DynoCard";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Database,
  Droplet,
  Flame,
  Gauge,
  Layers,
  MapPin,
  RefreshCw,
  Sliders,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";

export default function OverviewPage() {
  const { selectedWellId, setSelectedWellId } = useTwinStore();
  const [selectedTab, setSelectedTab] = useState<"mechanical" | "thermal" | "economics">("mechanical");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["well-state", selectedWellId],
    queryFn: async () => {
      const res = await fetch(`/api/well-state?wellId=${selectedWellId}`);
      if (!res.ok) throw new Error("Failed to load well state");
      return res.json();
    },
    refetchInterval: 3500, // 3.5s SCADA polling
  });

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 text-slate-500">
        <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <span className="text-xs font-mono">Syncing Baghewala Twin Cockpit Telemetry...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-soft text-slate-800 max-w-lg mx-auto text-center mt-12">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="font-bold text-base">Error connecting to telemetry stream</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono shadow-md hover:bg-slate-800"
        >
          Retry SCADA Stream
        </button>
      </div>
    );
  }

  const { well, availableWells, activeCycle, reservoir, srp } = data;
  const isEmergency = srp.rod_floating_flag;

  return (
    <div className="space-y-5 pb-8">
      {/* Hero Header matching screenshot ("Cargo Distribution" style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <Link
            href="/overview"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-soft transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              Baghewala Well Operations
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Field: Baghewala (Bikaner-Nagaur Basin) • Heavy Oil 15.2° API • Cyclic Steam Stimulation & SRP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-soft text-xs font-mono text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SCADA 3.5s LIVE</span>
            <button
              onClick={() => refetch()}
              title="Manual Poll Trigger"
              className="ml-1 text-slate-400 hover:text-slate-700"
            >
              <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin text-amber-600" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Cockpit Layout: 4 Columns (Matching Reference Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* COLUMN 1 (Width ~ 3 cols): Available Wells Feed */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-soft flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 font-sans">
                  Available Wells
                </span>
                <span className="text-[10px] font-mono text-slate-400">Rank: P50</span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-100 pb-2 mb-3 px-1">
                <span>WELL ID</span>
                <span>API</span>
                <span>DEPTH</span>
                <span>PRODUCTION</span>
              </div>

              {/* Wells List */}
              <div className="space-y-2.5">
                {/* Well 1: BGW-04 (Active - Dark Sleek Card matching reference image) */}
                <div
                  onClick={() => setSelectedWellId("well-bgw-04")}
                  className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 ${
                    selectedWellId === "well-bgw-04"
                      ? "bg-[#1A1E26] text-white shadow-darkCard"
                      : "bg-[#F8FAFC] border border-slate-200 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>15.2° API</span>
                    <span>1,045m</span>
                    <span className={selectedWellId === "well-bgw-04" ? "text-amber-400" : "text-slate-500"}>
                      Cycle #3
                    </span>
                  </div>

                  <div className="flex items-center justify-between my-1">
                    <span className="text-base font-extrabold font-mono tracking-tight">
                      BGW-04
                    </span>
                    <span className="text-xs font-mono font-bold flex items-center gap-1 text-emerald-400">
                      <span>→</span>
                      <span>148 bpd</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 mt-2">
                    <span className="truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>Baghewala South</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${isEmergency ? "text-rose-400" : "text-emerald-400"}`}>
                      {isEmergency ? "ROD-FLOATING" : "PRODUCING"}
                    </span>
                  </div>
                </div>

                {/* Well 2: BGW-07 */}
                <div
                  onClick={() => setSelectedWellId("well-bgw-07")}
                  className={`cursor-pointer rounded-2xl p-3.5 transition-all duration-200 ${
                    selectedWellId === "well-bgw-07"
                      ? "bg-[#1A1E26] text-white shadow-darkCard"
                      : "bg-[#F8FAFC] border border-slate-200/90 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>14.8° API</span>
                    <span>1,080m</span>
                    <span>Cycle #2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono">BGW-07</span>
                    <span className="text-xs font-mono text-slate-600">→ 112 bpd</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    Baghewala Central • Stable
                  </div>
                </div>

                {/* Well 3: BGW-12 */}
                <div
                  onClick={() => setSelectedWellId("well-bgw-12")}
                  className={`cursor-pointer rounded-2xl p-3.5 transition-all duration-200 ${
                    selectedWellId === "well-bgw-12"
                      ? "bg-[#1A1E26] text-white shadow-darkCard"
                      : "bg-[#F8FAFC] border border-slate-200/90 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>15.5° API</span>
                    <span>1,020m</span>
                    <span>Cycle #1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono">BGW-12</span>
                    <span className="text-xs font-mono text-amber-600">Soaking (Day 5)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    Baghewala North • Heat Ingestion
                  </div>
                </div>
              </div>
            </div>

            {/* Field Bottom Summary */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex justify-between">
              <span>Total Field Production:</span>
              <span className="font-bold text-slate-900">260 bbl/d</span>
            </div>
          </div>
        </div>

        {/* COLUMN 2 (Width ~ 3.5 cols): Centerpiece Wellbore Cutaway Vector Twin */}
        <div className="lg:col-span-4 min-h-[520px]">
          <WellboreCutaway
            depthM={well.depth_m}
            temperatureC={reservoir.temperature_c}
            viscosityCp={reservoir.viscosity_cp}
            isFloating={isEmergency}
            spm={srp.spm}
            strokeLength={srp.stroke_length}
          />
        </div>

        {/* COLUMN 3 (Width ~ 2.5 cols): Stages & Dynamometer Center */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Cycle Timeline Card (Matching flight milestone route in screenshot) */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 font-sans">
                CSS Huff-and-Puff
              </span>
              <span className="text-[10px] font-mono text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Cycle #3
              </span>
            </div>

            {/* Stages Arc */}
            <div className="relative py-2">
              <div className="h-1 bg-slate-200 rounded-full w-full"></div>
              <div className="absolute top-2 left-0 h-1 bg-amber-500 rounded-full w-3/4"></div>

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2">
                <span className="font-bold text-slate-800">INJ</span>
                <span className="font-bold text-slate-800">SOAK</span>
                <span className="font-bold text-amber-600">PROD (D-38)</span>
                <span className="text-slate-400">CUTOFF</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Bottom Temp:</span>
              <span className="font-bold text-orange-600">{reservoir.temperature_c}°C</span>
            </div>
          </div>

          {/* Dynamometer Card Preview */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-soft flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 font-sans">
                  Dynamometer
                </span>
                <Link
                  href="/srp-performance"
                  className="text-[10px] font-mono text-amber-600 hover:underline flex items-center gap-0.5"
                >
                  <span>Full</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="rounded-2xl bg-slate-950 p-2.5 overflow-hidden">
                <DynoCard
                  data={srp.dyno_card}
                  strokeLength={srp.stroke_length}
                  isFloating={isEmergency}
                  peakLoad={srp.load}
                  minLoad={srp.min_load}
                />
              </div>
            </div>

            <div className="mt-3 text-[10px] font-mono text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Peak Load:</span>
                <span className={`font-bold ${isEmergency ? "text-rose-600" : "text-slate-800"}`}>
                  {srp.load.toLocaleString()} lbs
                </span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Load:</span>
                <span className={`font-bold ${isEmergency ? "text-rose-600" : "text-emerald-600"}`}>
                  {srp.min_load.toLocaleString()} lbs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 4 (Width ~ 3 cols): Well Parameters & Green Checkout CTA */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-soft flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 font-sans">
                  Well Parameters
                </h3>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  BGW-04
                </span>
              </div>

              {/* Segmented Pill Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-full text-[11px] font-mono mb-4 text-slate-600">
                <button
                  onClick={() => setSelectedTab("mechanical")}
                  className={`flex-1 py-1 rounded-full text-center transition-all ${
                    selectedTab === "mechanical" ? "bg-white text-slate-900 font-semibold shadow-sm" : ""
                  }`}
                >
                  Mechanical
                </button>
                <button
                  onClick={() => setSelectedTab("thermal")}
                  className={`flex-1 py-1 rounded-full text-center transition-all ${
                    selectedTab === "thermal" ? "bg-white text-slate-900 font-semibold shadow-sm" : ""
                  }`}
                >
                  Thermal
                </button>
                <button
                  onClick={() => setSelectedTab("economics")}
                  className={`flex-1 py-1 rounded-full text-center transition-all ${
                    selectedTab === "economics" ? "bg-white text-slate-900 font-semibold shadow-sm" : ""
                  }`}
                >
                  Impact
                </button>
              </div>

              {/* Telemetry Row Items */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Crude Viscosity</span>
                  <span className="font-bold text-slate-900">{reservoir.viscosity_cp} cP</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Reservoir Temp</span>
                  <span className="font-bold text-orange-600">{reservoir.temperature_c}°C</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Pump Speed</span>
                  <span className={`font-bold ${isEmergency ? "text-rose-600" : "text-slate-900"}`}>
                    {srp.spm} SPM
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Stroke Length</span>
                  <span className="font-bold text-slate-900">{srp.stroke_length}&quot;</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Viscous Drag</span>
                  <span className={`font-bold ${isEmergency ? "text-rose-600" : "text-slate-900"}`}>
                    {srp.frictional_drag} lbs
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">Gearbox Torque</span>
                  <span className="font-bold text-slate-900">{srp.gearbox_torque_pct}%</span>
                </div>
              </div>
            </div>

            {/* Bottom Checkout Card (Matching the bottom right green checkout in reference screenshot) */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-baseline justify-between mb-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Lifting Power</span>
                  <span className="font-bold text-slate-800 text-sm">68.5 kWh/bbl</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Target SOR</span>
                  <span className="font-bold text-slate-800 text-sm">3.25 t/t</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Field OPEX</span>
                  <span className="font-extrabold text-slate-900 text-base">₹5.85 Cr/yr</span>
                </div>
              </div>

              {/* Big Vibrant Green CTA Button matching reference image */}
              <Link
                href="/optimization"
                className="w-full py-3 px-4 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>{isEmergency ? "Apply 3.2 SPM Fix" : "Execute Twin Optimization"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
