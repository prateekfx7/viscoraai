"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTwinStore } from "@/lib/store/useTwinStore";
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Info,
  ShieldAlert,
  ShieldCheck,
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <span className="text-xs font-mono">Loading Real-Time Failure Prevention Feed...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-soft text-slate-800 max-w-lg mx-auto text-center mt-12">
        <p className="font-bold">Error loading alerts log</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono"
        >
          Retry
        </button>
      </div>
    );
  }

  const { alerts, counts, hasActiveEmergency } = data;

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Alerts & Failure Prevention Log
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-time surveillance of mechanical risks, sucker rod drag anomalies, and scheduled CSS interventions.
          </p>
        </div>
        {hasActiveEmergency ? (
          <span className="bg-rose-500 text-white text-xs font-mono px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider animate-pulse shadow-sm">
            1 ACTIVE EMERGENCY (ROD-FLOATING)
          </span>
        ) : (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-mono px-3.5 py-1.5 rounded-full font-bold">
            SURVEILLANCE NORMAL
          </span>
        )}
      </div>

      {/* Summary Counter Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span className="uppercase">Total Events</span>
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-3xl font-extrabold font-mono text-slate-900">{counts.total}</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between text-xs font-mono text-rose-500 mb-1">
            <span className="uppercase font-bold">Critical Alarms</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-3xl font-extrabold font-mono text-rose-600">{counts.critical}</span>
        </div>

        <div className="bg-white border border-amber-200 rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between text-xs font-mono text-amber-500 mb-1">
            <span className="uppercase font-bold">Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-extrabold font-mono text-amber-600">{counts.warning}</span>
        </div>

        <div className="bg-white border border-sky-200 rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between text-xs font-mono text-sky-500 mb-1">
            <span className="uppercase font-bold">Info / Scheduled</span>
            <Info className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-3xl font-extrabold font-mono text-sky-600">{counts.info}</span>
        </div>
      </div>

      {/* Main Alert Feed Table / List */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
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
                className={`rounded-2xl border p-4 transition-all duration-200 ${
                  isCritical
                    ? "bg-rose-50/70 border-rose-300 shadow-sm"
                    : isWarning
                    ? "bg-amber-50/60 border-amber-200"
                    : "bg-slate-50/70 border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isCritical
                          ? "bg-rose-600 text-white"
                          : isWarning
                          ? "bg-amber-500 text-white"
                          : "bg-sky-500 text-white"
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
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isCritical
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : isWarning
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-sky-100 text-sky-800 border border-sky-200"
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {alert.type.replace(/_/g, " ")}
                        </span>
                        {alert.acknowledged && (
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Acknowledged
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 font-mono leading-relaxed">
                        {alert.message}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-2">
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
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-mono font-semibold transition-colors border border-slate-200 shadow-soft cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-mono text-emerald-600 font-bold">
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
    </div>
  );
}
