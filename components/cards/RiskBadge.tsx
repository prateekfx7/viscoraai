import React from "react";

export interface RiskBadgeProps {
  level: "GREEN" | "AMBER" | "RED" | string;
  size?: "sm" | "md" | "lg";
  labelOverride?: string;
  showPulse?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = "md",
  labelOverride,
  showPulse = true,
}) => {
  const normLevel = level.toUpperCase();

  let bgClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let dotClass = "bg-emerald-400";
  let label = labelOverride || "NORMAL / OPTIMAL";

  if (normLevel === "RED" || normLevel === "CRITICAL") {
    bgClass = "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-950/50 shadow-sm";
    dotClass = "bg-rose-500 animate-ping";
    label = labelOverride || "CRITICAL RISK (ROD-FLOATING)";
  } else if (normLevel === "AMBER" || normLevel === "WARNING") {
    bgClass = "bg-amber-500/15 text-amber-400 border-amber-500/30";
    dotClass = "bg-amber-400";
    label = labelOverride || "ELEVATED RISK";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-2.5 py-1 text-xs font-medium gap-2",
    lg: "px-3.5 py-1.5 text-sm font-semibold gap-2.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase font-mono ${bgClass} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2">
        {showPulse && normLevel === "RED" && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`}></span>
      </span>
      <span>{label}</span>
    </span>
  );
};
