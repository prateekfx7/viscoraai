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
import { DashboardShell } from "@/components/layout/DashboardShell";

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
    <DashboardShell title="Safety Alarms & Prevention Feed">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              Alerts & Failure Prevention Log
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-1">
              Real-time surveillance of mechanical risks, sucker rod drag anomalies, and scheduled CSS interventions.
            </p>
          </div>
          {hasActiveEmergency ? (
            <span className="bg-rose-600 text-white text-xs font-mono px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider animate-pulse shadow-sm">
              1 ACTIVE EMERGENCY (ROD-FLOATING)
            </span>
          ) : (
            <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono px-3.5 py-1.5 rounded-full font-bold">
              SURVEILLANCE NORMAL
            </span>
          )}
        </div>

        {/* Summary Counter Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1">
              <span className="uppercase font-semibold tracking-wider">Total Events</span>
              <Bell className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tabular-nums">{counts.total}</span>
          </div>

          <div className="bg-card border border-rose-500/30 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-rose-600 mb-1">
              <span className="uppercase font-bold tracking-wider">Critical Alarms</span>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-600 tabular-nums">{counts.critical}</span>
          </div>

          <div className="bg-card border border-amber-500/30 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-amber-600 mb-1">
              <span className="uppercase font-bold tracking-wider">Warnings</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 tabular-nums">{counts.warning}</span>
          </div>

          <div className="bg-card border border-sky-500/30 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-sky-600 mb-1">
              <span className="uppercase font-bold tracking-wider">Info / Scheduled</span>
              <Info className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-600 tabular-nums">{counts.info}</span>
          </div>
        </div>

        {/* Main Alert Feed Table / List */}
        <div className="rounded-2xl bg-card border border-border/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Live Event Feed (SCADA & Model Generated)
              </h3>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
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
                      ? "bg-rose-500/10 border-rose-500/30 shadow-sm"
                      : isWarning
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-muted/40 border-border/80"
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
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200"
                                : isWarning
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200"
                                : "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200"
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <span className="text-xs font-mono font-bold text-foreground">
                            {alert.type.replace(/_/g, " ")}
                          </span>
                          {alert.acknowledged && (
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                              Acknowledged
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-foreground font-mono leading-relaxed">
                          {alert.message}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-2">
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
                          className="px-3.5 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-mono font-semibold transition-colors border border-border shadow-sm cursor-pointer"
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
    </DashboardShell>
);
}
