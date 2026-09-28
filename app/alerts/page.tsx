"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTwinStore } from "@/lib/store/useTwinStore";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function AlertsPage() {
  const { selectedWellId } = useTwinStore();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["alerts-feed", selectedWellId],
    queryFn: async () => {
      const res = await fetch(`/api/alerts?wellId=${selectedWellId}`);
      if (!res.ok) throw new Error("Failed to load alerts feed");
      return res.json();
    },
    refetchInterval: 3000,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, acknowledged: true }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts-feed"] });
    },
  });

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-mono">Loading Real-Time Failure Prevention Feed...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300">
        <p className="font-bold">Error loading alerts log</p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono"
        >
          Retry
        </button>
      </div>
    );
  }

  const { alerts, counts, hasActiveEmergency } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Failure Prevention Log"
        subtitle="Real-time surveillance of mechanical risks, sucker rod drag anomalies, and scheduled CSS cycle interventions."
        badge={
          hasActiveEmergency ? (
            <span className="bg-rose-500 text-white text-xs font-mono px-3 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">
              1 ACTIVE EMERGENCY
            </span>
          ) : (
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono px-3 py-1 rounded-full font-semibold">
              SURVEILLANCE NORMAL
            </span>
          )
        }
        onRefresh={() => refetch()}
        isFetching={isFetching}
      />

      {/* Summary Counter Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span className="uppercase">Total Events</span>
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-white">{counts.total}</span>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-mono text-rose-400 mb-1">
            <span className="uppercase">Critical Alarms</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-rose-400">{counts.critical}</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-1">
            <span className="uppercase">Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-400">{counts.warning}</span>
        </div>

        <div className="bg-slate-900 border border-sky-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-mono text-sky-400 mb-1">
            <span className="uppercase">Info / Scheduled</span>
            <Info className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-sky-400">{counts.info}</span>
        </div>
      </div>

      {/* Main Alert Feed Table / List */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300">
              Live Event Feed (SCADA & Model Generated)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Real-time feed with 3.5s push sync
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert: any) => {
            const isCritical = alert.severity === "CRITICAL";
            const isWarning = alert.severity === "WARNING";

            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 transition-all duration-200 ${
                  isCritical
                    ? "bg-rose-950/30 border-rose-500/50 shadow-md shadow-rose-950/30"
                    : isWarning
                    ? "bg-amber-950/20 border-amber-500/30"
                    : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isCritical
                          ? "bg-rose-500/20 text-rose-400"
                          : isWarning
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-sky-500/20 text-sky-400"
                      }`}
                    >
                      {isCritical ? (
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isCritical
                              ? "bg-rose-500 text-white"
                              : isWarning
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-300">
                          {alert.type.replace(/_/g, " ")}
                        </span>
                        {alert.acknowledged && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Acknowledged
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(alert.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        <span>•</span>
                        <span>Well: BGW-04</span>
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-center shrink-0">
                    {!alert.acknowledged ? (
                      <button
                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                        disabled={acknowledgeMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors border border-slate-700 cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-mono text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Cleared
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Failure Prevention Knowledge Matrix */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-mono font-bold uppercase text-slate-300">
            Baghewala Field Failure Mode Mitigation Matrix (Digital Twin Logic)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="rounded-lg bg-slate-900/70 border border-slate-800 p-3.5">
            <span className="text-rose-400 font-bold block mb-1 uppercase text-[11px]">
              1. Sucker Rod Parting / Buckling
            </span>
            <p className="text-slate-400 leading-relaxed text-[10px]">
              Occurs when heavy crude viscous friction exceeds buoyant rod weight, holding the rod while the horsehead drops.
              Twin detects delayed load drop and mandates instant SPM throttling.
            </p>
          </div>

          <div className="rounded-lg bg-slate-900/70 border border-slate-800 p-3.5">
            <span className="text-amber-400 font-bold block mb-1 uppercase text-[11px]">
              2. Gearbox Over-Torque Fatigue
            </span>
            <p className="text-slate-400 leading-relaxed text-[10px]">
              High fluid viscosity causes peak rod loads over 21,000 lbs, straining gear teeth.
              The digital twin dynamically caps speed to keep torque below 80% rated capacity.
            </p>
          </div>

          <div className="rounded-lg bg-slate-900/70 border border-slate-800 p-3.5">
            <span className="text-sky-400 font-bold block mb-1 uppercase text-[11px]">
              3. Premature / Mistimed CSS Steam Injection
            </span>
            <p className="text-slate-400 leading-relaxed text-[10px]">
              Re-injecting steam too early wastes thousands of tonnes of boiler fuel; injecting too late damages the SRP string.
              Twin predicts the exact day of economic cutoff (1,400 cP).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
