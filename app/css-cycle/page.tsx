"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTwinStore } from "@/lib/store/useTwinStore";
import { StatusCard } from "@/components/cards/StatusCard";
import { ViscosityCurve } from "@/components/charts/ViscosityCurve";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Droplet,
  Flame,
  Thermometer,
  Timer,
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <span className="text-xs font-mono">Loading CSS Huff-and-Puff Thermal Kinetics...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-soft text-slate-800 max-w-lg mx-auto text-center mt-12">
        <p className="font-bold">Error loading CSS cycle telemetry</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono"
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
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Cyclic Steam Stimulation (CSS) Monitor
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Tracking multi-cycle Huff-and-Puff thermal kinetics, bottom-hole dissipation, and predictive economic cutoff scheduling.
          </p>
        </div>
        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono px-3.5 py-1.5 rounded-full font-bold">
          CYCLE #{activeCycle?.cycle_number ?? 3} ACTIVE (DAY {currentCycleDay})
        </span>
      </div>

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
      <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
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
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Cycle</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Steam Vol (t)</th>
                <th className="py-2.5 px-3">Inj. Press (bar)</th>
                <th className="py-2.5 px-3">Soak Period</th>
                <th className="py-2.5 px-3">Peak Temp</th>
                <th className="py-2.5 px-3">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cycles.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-slate-900 font-bold">
                    Cycle #{c.cycle_number}
                  </td>
                  <td className="py-3 px-3">
                    {c.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-900 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-300 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                        PRODUCING (DAY {currentCycleDay})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        COMPLETED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {c.steam_volume.toLocaleString()} tonnes
                  </td>
                  <td className="py-3 px-3 text-sky-600 font-bold">{c.injection_pressure} bar</td>
                  <td className="py-3 px-3 text-slate-600">{c.soak_time_days} days</td>
                  <td className="py-3 px-3 text-orange-600 font-bold">{c.peak_temp_c}°C</td>
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
    </div>
  );
}
