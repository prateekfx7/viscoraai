import React from "react";
import { LucideIcon } from "lucide-react";

export interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  secondaryText?: string;
  trendText?: string;
  trendDirection?: "up" | "down" | "neutral" | "danger" | "warning";
  statusColor?: "emerald" | "amber" | "rose" | "sky" | "slate";
  icon?: LucideIcon;
  badge?: React.ReactNode;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  unit,
  secondaryText,
  trendText,
  trendDirection = "neutral",
  statusColor = "slate",
  icon: Icon,
  badge,
}) => {
  const borderColors = {
    emerald: "border-emerald-500/30 hover:border-emerald-500/50",
    amber: "border-amber-500/30 hover:border-amber-500/50",
    rose: "border-rose-500/40 hover:border-rose-500/60 bg-rose-950/10",
    sky: "border-sky-500/30 hover:border-sky-500/50",
    slate: "border-slate-800 hover:border-slate-700",
  }[statusColor];

  const iconColors = {
    emerald: "text-emerald-400 bg-emerald-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    rose: "text-rose-400 bg-rose-500/15",
    sky: "text-sky-400 bg-sky-500/10",
    slate: "text-slate-400 bg-slate-800/60",
  }[statusColor];

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900/90 backdrop-blur-sm border p-5 transition-all duration-200 ${borderColors}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {badge}
          {Icon && (
            <div className={`p-2 rounded-lg ${iconColors}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {unit && <span className="text-sm font-semibold text-slate-400 font-mono">{unit}</span>}
      </div>

      <div className="flex items-center justify-between text-xs mt-2 text-slate-400">
        {secondaryText && <span className="truncate">{secondaryText}</span>}
        {trendText && (
          <span
            className={`font-mono text-xs px-1.5 py-0.5 rounded font-medium ${
              trendDirection === "danger"
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                : trendDirection === "warning"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                : trendDirection === "up"
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {trendText}
          </span>
        )}
      </div>
    </div>
  );
};
