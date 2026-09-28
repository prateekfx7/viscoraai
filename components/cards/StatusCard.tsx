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
  const iconColors = {
    emerald: "text-emerald-600 bg-emerald-50 border border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border border-amber-100",
    rose: "text-rose-600 bg-rose-50 border border-rose-100",
    sky: "text-sky-600 bg-sky-50 border border-sky-100",
    slate: "text-slate-600 bg-slate-100 border border-slate-200",
  }[statusColor];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-5 shadow-soft hover:shadow-card transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {badge}
          {Icon && (
            <div className={`p-2 rounded-xl ${iconColors}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
          {value}
        </span>
        {unit && <span className="text-sm font-semibold text-slate-400 font-mono">{unit}</span>}
      </div>

      <div className="flex items-center justify-between text-xs mt-2 text-slate-500 font-mono">
        {secondaryText && <span className="truncate">{secondaryText}</span>}
        {trendText && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              trendDirection === "danger"
                ? "bg-rose-100 text-rose-700 border border-rose-200"
                : trendDirection === "warning"
                ? "bg-amber-100 text-amber-700 border border-amber-200"
                : trendDirection === "up"
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {trendText}
          </span>
        )}
      </div>
    </div>
  );
};
