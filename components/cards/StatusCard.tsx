import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  secondaryText?: string;
  trendText?: string;
  trendDirection?: "up" | "down" | "neutral" | "danger" | "warning";
  statusColor?: "emerald" | "amber" | "rose" | "sky" | "slate";
  status?: "ok" | "warning" | "danger";
  icon?: LucideIcon;
  badge?: React.ReactNode;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  secondaryText,
  trendText,
  trendDirection = "neutral",
  statusColor,
  status,
  icon: Icon,
  badge,
}) => {
  const resolvedColor = status === "danger" ? "rose" : status === "warning" ? "amber" : statusColor || "slate";

  const iconColors = {
    emerald: "text-emerald-600 bg-emerald-500/10 border border-emerald-500/20",
    amber: "text-amber-600 bg-amber-500/10 border border-amber-500/20",
    rose: "text-rose-600 bg-rose-500/10 border border-rose-500/20",
    sky: "text-sky-600 bg-sky-500/10 border border-sky-500/20",
    slate: "text-muted-foreground bg-muted border border-border",
  }[resolvedColor];

  const sub = secondaryText || subtitle;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <div className="flex items-center gap-2">
            {badge}
            {Icon && (
              <div className={cn("p-2 rounded-xl", iconColors)}>
                <Icon className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono tabular-nums">
            {value}
          </span>
          {unit && <span className="text-sm font-semibold text-muted-foreground font-mono">{unit}</span>}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mt-2 text-muted-foreground font-sans">
        {sub && <span className="truncate">{sub}</span>}
        {trendText && (
          <span
            className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
              trendDirection === "danger"
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                : trendDirection === "warning"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                : trendDirection === "up"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-muted text-muted-foreground border border-border"
            )}
          >
            {trendText}
          </span>
        )}
      </div>
    </div>
  );
};
