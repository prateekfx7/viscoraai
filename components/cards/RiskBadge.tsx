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

  let bgClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
  let dotClass = "bg-emerald-500";
  let label = labelOverride || "NORMAL / OPTIMAL";

  if (normLevel === "RED" || normLevel === "CRITICAL") {
    bgClass = "bg-rose-50 text-rose-800 border-rose-300 shadow-sm";
    dotClass = "bg-rose-500 animate-ping";
    label = labelOverride || "CRITICAL RISK (ROD-FLOATING)";
  } else if (normLevel === "AMBER" || normLevel === "WARNING") {
    bgClass = "bg-amber-50 text-amber-800 border-amber-300";
    dotClass = "bg-amber-500";
    label = labelOverride || "ELEVATED RISK";
  }

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[10px] gap-1.5",
    md: "px-3 py-1 text-xs font-semibold gap-2",
    lg: "px-4 py-1.5 text-xs font-bold gap-2.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase font-mono shadow-soft ${bgClass} ${sizeClasses}`}
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
