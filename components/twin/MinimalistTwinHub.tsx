"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  Droplet,
  Flame,
  Gauge,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Zap,
} from "lucide-react";

export interface MinimalistTwinHubProps {
  temperatureC: number;
  viscosityCp: number;
  isFloating: boolean;
  spm: number;
  strokeLength: number;
  autoPilotEnabled?: boolean;
}

export const MinimalistTwinHub: React.FC<MinimalistTwinHubProps> = ({
  temperatureC = 94.6,
  viscosityCp = 850,
  isFloating = false,
  spm = 5.2,
  strokeLength = 86,
  autoPilotEnabled = true,
}) => {
  // Layman Analogy Level Calculations
  // Thickness category: Water (<50), Warm Syrup (50-300), Thick Honey (300-900), Cold Tar (>900)
  let thicknessLabel = "Light Flow (Warm Syrup)";
  let thicknessColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  let thicknessBarWidth = "28%";

  if (viscosityCp > 900) {
    thicknessLabel = "Extremely Thick (Cold Tar)";
    thicknessColor = "text-rose-700 bg-rose-50 border-rose-200";
    thicknessBarWidth = "95%";
  } else if (viscosityCp > 500) {
    thicknessLabel = "Thick Resistance (Heavy Honey)";
    thicknessColor = "text-amber-800 bg-amber-50 border-amber-200";
    thicknessBarWidth = "72%";
  }

  // Rod Gravity Clearance
  const rodDescentScore = isFloating ? 32 : 94; // % freedom of downward fall

  return (
    <div className="w-full h-full bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft flex flex-col justify-between select-none">
      {/* Top Header: Simple Layman Summary */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                VISCORA TWIN HUB
              </span>
              {autoPilotEnabled && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  AUTO-PILOT ACTIVE
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 font-sans tracking-tight mt-0.5">
              Underground Well Status
            </h2>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Well Depth</span>
            <span className="text-sm font-bold font-mono text-slate-800">1,045 Meters</span>
          </div>
        </div>

        {/* Autonomous Intervention Banner (if anomaly detected) */}
        {isFloating && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-soft flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-950 font-sans uppercase">
                  Auto-Pilot Intervention Engaged
                </span>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed font-sans">
                  <strong>Layman explanation:</strong> The oil is as thick as cold honey ({viscosityCp} cP), pushing the pump rod upward like a cork.
                  Viscora automatically throttled pump speed to <strong>3.2 SPM</strong> to let gravity pull the rod down safely.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold shrink-0">
              PROTECTED
            </span>
          </div>
        )}

        {/* 4 Minimalist Visual Gauges & Progress Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {/* Gauge 1: Oil Thickness Meter */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-sans mb-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-amber-600" />
                Oil Thickness
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-900">{viscosityCp} cP</span>
            </div>

            <div className="my-2">
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-500"
                  style={{ width: thicknessBarWidth }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${thicknessColor}`}>
                {thicknessLabel}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Baghewala 15.2° API</span>
            </div>
          </div>

          {/* Gauge 2: Rod Fall Clearance Meter (Gravity vs Drag) */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-sans mb-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
                Rod Gravity Fall
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-900">
                {rodDescentScore}% Free
              </span>
            </div>

            <div className="my-2">
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFloating ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${rodDescentScore}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span
                className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                  isFloating
                    ? "bg-rose-50 text-rose-800 border-rose-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
              >
                {isFloating ? "⚠️ Cork Floating Hazard" : "✓ Smooth Descent"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Stroke: {strokeLength}&quot;</span>
            </div>
          </div>

          {/* Gauge 3: Underground Steam Heat Reserve */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-sans mb-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Underground Steam Heat
              </span>
              <span className="text-[11px] font-mono font-bold text-orange-600">{temperatureC}°C</span>
            </div>

            <div className="my-2">
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, (temperatureC / 250) * 100))}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[10px] text-slate-600 font-mono">Initial: 254°C (Steam Soak)</span>
              <span className="text-[10px] font-bold text-amber-700 font-mono">
                Re-heat in ~8 days
              </span>
            </div>
          </div>

          {/* Gauge 4: Pumping Speed vs Safe Limit */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-sans mb-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-sky-600" />
                Pump Speed (SPM)
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-900">{spm} SPM</span>
            </div>

            <div className="my-2">
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFloating ? "bg-rose-500" : "bg-sky-500"
                  }`}
                  style={{ width: `${Math.min(100, (spm / 7.0) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[10px] text-slate-500 font-mono">Safe Speed Limit: 3.4 SPM</span>
              <span
                className={`text-[10px] font-bold font-mono ${
                  isFloating ? "text-rose-600" : "text-emerald-700"
                }`}
              >
                {isFloating ? "THROTTLING" : "OPTIMAL"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Simplified Summary Pill Bar */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Viscora Physics Guard: Prevents rod parting & gearbox burnout</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">Power Saved:</span>
          <span className="text-emerald-700 font-extrabold text-sm">-30.2%</span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] text-slate-400">Steam Ratio:</span>
          <span className="text-slate-900 font-bold text-sm">3.25 t/t</span>
        </div>
      </div>
    </div>
  );
};
