"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTwinStore } from "@/lib/store/useTwinStore";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusCard } from "@/components/cards/StatusCard";
import { ViscosityCurve } from "@/components/charts/ViscosityCurve";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Droplet,
  Flame,
  Layers,
  Thermometer,
  Timer,
  Zap,
} from "lucide-react";

export default function CssCyclePage() {
  const { selectedWellId } = useTwinStore();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["css-cycle-data", selectedWellId],
    queryFn: async () => {
      const res = await fetch(`/api/css-cycle?wellId=${selectedWellId}`);
      if (!res.ok) throw new Error("Failed to load CSS cycle data");
      return res.json();
    },
    refetchInterval: 3500,
  });

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono">Loading CSS Huff-and-Puff Thermal Kinetics...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300">
        <p className="font-bold">Error loading CSS cycle telemetry</p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    cycles,
    activeCycle,
    currentCycleDay,
    reservoirAssessment,
    historyTimeline,
    forecastTimeline,
    economicCutoff,
  } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cyclic Steam Stimulation (CSS) Monitor"
        subtitle="Tracking multi-cycle Huff-and-Puff thermal kinetics, bottom-hole dissipation, and predictive economic cutoff scheduling for Baghewala Field."
        badge={
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono px-3 py-1 rounded-full font-semibold">
            CYCLE #{activeCycle?.cycle_number ?? 3} ACTIVE (DAY {currentCycleDay})
          </span>
        }
        onRefresh={() => refetch()}
        isFetching={isFetching}
      />

      {/* Top Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Active Production Phase"
          value={`Day ${currentCycleDay}`}
          unit={`of Cycle #${activeCycle?.cycle_number ?? 3}`}
          secondaryText="Post-soak continuous pumping"
          trendText="Cooling"
          trendDirection="neutral"
          icon={Timer}
          statusColor="amber"
        />

        <StatusCard
          title="Current Temperature"
          value={reservoirAssessment.current_temp_c}
          unit="°C"
          secondaryText={`Decay Rate: -${reservoirAssessment.decay_rate_c_per_day} °C/day`}
          trendText="Thermal Dissipation"
          trendDirection="warning"
          icon={Thermometer}
          statusColor="amber"
        />

        <StatusCard
          title="Predicted Viscosity"
          value={reservoirAssessment.predicted_viscosity_cp.toLocaleString()}
          unit="cP"
          secondaryText="Andrade-Walther heavy crude model"
          trendText={reservoirAssessment.predicted_viscosity_cp > 750 ? "High Drag" : "Optimal"}
          trendDirection={reservoirAssessment.predicted_viscosity_cp > 750 ? "danger" : "up"}
          icon={Droplet}
          statusColor={reservoirAssessment.predicted_viscosity_cp > 750 ? "rose" : "sky"}
        />

        <StatusCard
          title="Days to Economic Limit"
          value={economicCutoff.days_remaining}
          unit="Days"
          secondaryText="Threshold: 1,400 cP / 62°C cutoff"
          trendText={economicCutoff.days_remaining <= 14 ? "PLAN CYCLE #4" : "SAFE WINDOW"}
          trendDirection={economicCutoff.days_remaining <= 14 ? "warning" : "up"}
          icon={Calendar}
          statusColor={economicCutoff.days_remaining <= 14 ? "amber" : "emerald"}
        />
      </div>

      {/* Main Thermal & Viscosity Trajectory Chart */}
      <ViscosityCurve
        historyData={historyTimeline}
        forecastData={forecastTimeline}
        currentDay={currentCycleDay}
      />

      {/* Historical Cycles Table */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300">
              Cyclic Steam Stimulation History (Well BGW-04, Jodhpur Formation)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Total Injected: 5,980 Tonnes Steam
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Cycle</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Steam Vol (t)</th>
                <th className="py-2.5 px-3">Inj. Press (bar)</th>
                <th className="py-2.5 px-3">Soak Period</th>
                <th className="py-2.5 px-3">Peak Temp</th>
                <th className="py-2.5 px-3">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {cycles.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-3 text-white font-bold">
                    Cycle #{c.cycle_number}
                  </td>
                  <td className="py-3 px-3">
                    {c.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                        PRODUCING (DAY {currentCycleDay})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        COMPLETED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-200">
                    {c.steam_volume.toLocaleString()} tonnes
                  </td>
                  <td className="py-3 px-3 text-sky-400">{c.injection_pressure} bar</td>
                  <td className="py-3 px-3 text-slate-300">{c.soak_time_days} days</td>
                  <td className="py-3 px-3 text-orange-400">{c.peak_temp_c}°C</td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(c.start_date).toLocaleDateString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Physics & Operational Methodology Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-400">
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-4">
          <h4 className="font-bold text-slate-200 uppercase mb-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Huff-and-Puff (CSS) Mechanism</span>
          </h4>
          <p className="leading-relaxed text-[11px]">
            In Baghewala heavy crude, native reservoir temperature (45°C) yields an immobile fluid (&gt;10,000 cP).
            High-pressure steam injection superheats the matrix to ~260°C, lowering viscosity below 30 cP.
            After a 7-day soak to allow conductive heat penetration into the sandstone, production begins with SRP artificial lift.
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-4">
          <h4 className="font-bold text-slate-200 uppercase mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Economic Cutoff Rule</span>
          </h4>
          <p className="leading-relaxed text-[11px]">
            As heat diffuses radially into overburden and produced fluids carry enthalpy away, bottom-hole temperature decays.
            When temperature drops below ~62°C and viscosity crosses 1,400 cP, lifting energy spikes sharply and rod-floating risk increases exponentially.
            The digital twin triggers the next steam cycle command automatically prior to this threshold.
          </p>
        </div>
      </div>
    </div>
  );
}
