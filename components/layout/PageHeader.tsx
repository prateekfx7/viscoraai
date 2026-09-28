"use client";

import React from "react";
import { useTwinStore } from "@/lib/store/useTwinStore";
import { Activity, Database, RefreshCw } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  isFetching?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  onRefresh,
  isFetching,
}) => {
  const { selectedWellId, setSelectedWellId } = useTwinStore();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            {title}
          </h1>
          {badge}
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Well Switcher Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400 font-mono">WELL:</span>
          <select
            value={selectedWellId}
            onChange={(e) => setSelectedWellId(e.target.value)}
            className="bg-transparent text-white font-mono font-semibold focus:outline-none cursor-pointer"
          >
            <option value="well-bgw-04" className="bg-slate-900 text-white">
              BGW-04 (Baghewala S)
            </option>
            <option value="well-bgw-07" className="bg-slate-900 text-white">
              BGW-07 (Baghewala C)
            </option>
            <option value="well-bgw-12" className="bg-slate-900 text-white">
              BGW-12 (Baghewala N)
            </option>
          </select>
        </div>

        {/* Live SCADA Polling Pulse */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] text-slate-400">SCADA 3.5s</span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Manual Poll Trigger"
              className="ml-1 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin text-amber-400" : ""}`} />
            </button>
          )}
        </div>

        {actions}
      </div>
    </div>
  );
};
