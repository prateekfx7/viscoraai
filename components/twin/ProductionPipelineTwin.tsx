"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Droplet,
  FastForward,
  Flame,
  Gauge,
  Info,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";

export interface ProductionPipelineTwinProps {
  temperatureC: number;
  viscosityCp: number;
  isFloating: boolean;
  spm: number;
  strokeLength: number;
  autoPilotEnabled?: boolean;
  onTriggerShock?: () => void;
  onResetShock?: () => void;
  elapsedSec?: number;
}

export const ProductionPipelineTwin: React.FC<ProductionPipelineTwinProps> = ({
  temperatureC = 94.6,
  viscosityCp = 850,
  isFloating = false,
  spm = 5.2,
  strokeLength = 86,
  autoPilotEnabled = true,
  onTriggerShock,
  onResetShock,
  elapsedSec = 0,
}) => {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  // Financial calculations per hour/day
  // Normal mode: ₹1,240/hr steam, ₹640/hr power, ₹18,500/hr revenue
  // Emergency prevented: ₹35 Lakhs workover replacement saved!
  const hourlySavings = isFloating ? 1420 : 980;
  const powerReductionPercent = 30.2;
  const annualSavingsCr = 5.85;

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-slate-200/90 shadow-soft flex flex-col justify-between select-none">
      {/* 1. Header: Title, Live Status & 1-Click Showstopper Trigger */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                VISCORA DIGITAL TWIN • 4-STAGE PIPELINE
              </span>
              {autoPilotEnabled && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  AUTO-PILOT ACTIVE
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans tracking-tight mt-0.5">
              Production Flow Journey
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Steam Injection → Reservoir Heat → Rod Motion → Surface Tank (Explained in plain English)
            </p>
          </div>

          {/* 1-Click "Thick Oil Emergency" Demo Trigger Button */}
          <div className="flex items-center gap-2">
            {!isFloating ? (
              <button
                onClick={onTriggerShock}
                title="Click to trigger the 90-second cold oil shock scenario"
                className="py-2 px-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-95"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>⚡ Test Thick Oil Shock</span>
              </button>
            ) : (
              <button
                onClick={onResetShock}
                title="Reset simulation to normal baseline"
                className="py-2 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>✓ Return to Normal</span>
              </button>
            )}
          </div>
        </div>

        {/* Emergency Alert Banner (Shown during Thick Oil Shock) */}
        {isFloating && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-950 font-sans uppercase">
                    Stage 3 Intervention: Rod Float Shock Averted
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-mono font-bold">
                    SAVED ₹35,00,000
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed font-sans">
                  <strong>Plain English:</strong> Heavy oil viscosity jumped to <strong>{viscosityCp} cP</strong> (like cold honey).
                  Viscora automatically throttled pump speed from 5.2 SPM down to <strong>3.2 SPM</strong>, preventing the steel rod from buckling or snapping under drag.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-amber-700 block uppercase">Real-Time Benefit</span>
              <span className="text-sm font-extrabold font-mono text-emerald-700 bg-white px-2 py-1 rounded-lg border border-amber-200">
                +₹1,420/hr Saved
              </span>
            </div>
          </div>
        )}

        {/* 2. Linear 4-Stage Horizontal Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {/* STAGE 1: Steam Injection (CSS) */}
          <div
            onClick={() => setActiveStage(activeStage === 1 ? null : 1)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeStage === 1
                ? "bg-slate-900 text-white border-slate-900 shadow-darkCard"
                : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      activeStage === 1 ? "bg-white/10 text-orange-400" : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      activeStage === 1 ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Stage 1
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    activeStage === 1
                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      : "bg-orange-50 text-orange-700 border border-orange-200"
                  }`}
                >
                  {temperatureC}°C Heat
                </span>
              </div>

              <h3 className="text-sm font-bold font-sans">1. Steam Injection</h3>
              <p
                className={`text-[11px] font-sans mt-1 leading-snug ${
                  activeStage === 1 ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Boiling steam (254°C) pumped 1,045m down to soften hardened bitumen underground.
              </p>
            </div>

            {/* Financial Tag */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-mono">
              <span className={activeStage === 1 ? "text-slate-400" : "text-slate-500"}>Steam Cost:</span>
              <span
                className={`font-bold ${
                  activeStage === 1 ? "text-emerald-300" : "text-emerald-700"
                }`}
              >
                ₹1,240 / hr
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Next Soak: ~8 days</span>
              <span>SOR 3.25 t/t</span>
            </div>
          </div>

          {/* STAGE 2: Heavy Oil Reservoir (Thinning) */}
          <div
            onClick={() => setActiveStage(activeStage === 2 ? null : 2)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeStage === 2
                ? "bg-slate-900 text-white border-slate-900 shadow-darkCard"
                : isFloating
                ? "bg-amber-50/90 border-amber-300 ring-1 ring-amber-400"
                : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      activeStage === 2
                        ? "bg-white/10 text-amber-400"
                        : isFloating
                        ? "bg-amber-100 text-amber-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <Droplet className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      activeStage === 2 ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Stage 2
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isFloating
                      ? "bg-rose-100 text-rose-700 border border-rose-200 animate-pulse"
                      : activeStage === 2
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {viscosityCp} cP
                </span>
              </div>

              <h3 className="text-sm font-bold font-sans">2. Reservoir Thinning</h3>
              <p
                className={`text-[11px] font-sans mt-1 leading-snug ${
                  activeStage === 2 ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {isFloating
                  ? "Cold honey shock! Heavy fluid is dragging on the downhole pump components."
                  : "Underground heat melts thick bitumen into flowing syrup like warm honey."}
              </p>
            </div>

            {/* Financial Tag */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-mono">
              <span className={activeStage === 2 ? "text-slate-400" : "text-slate-500"}>Crude Flow Value:</span>
              <span
                className={`font-bold ${
                  activeStage === 2 ? "text-emerald-300" : "text-emerald-700"
                }`}
              >
                +₹18,500 / hr
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Baghewala 15.2° API</span>
              <span>148 bbl/d</span>
            </div>
          </div>

          {/* STAGE 3: Sucker Rod Pump Motion (SRP) */}
          <div
            onClick={() => setActiveStage(activeStage === 3 ? null : 3)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeStage === 3
                ? "bg-slate-900 text-white border-slate-900 shadow-darkCard"
                : isFloating
                ? "bg-amber-50/90 border-amber-300 ring-1 ring-amber-400"
                : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      activeStage === 3
                        ? "bg-white/10 text-sky-400"
                        : isFloating
                        ? "bg-amber-100 text-amber-700"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      activeStage === 3 ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Stage 3
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isFloating
                      ? "bg-amber-600 text-white"
                      : activeStage === 3
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                      : "bg-sky-50 text-sky-700 border border-sky-200"
                  }`}
                >
                  {isFloating ? "3.2 SPM Auto" : `${spm} SPM`}
                </span>
              </div>

              <h3 className="text-sm font-bold font-sans">3. Subsurface Rod Motion</h3>
              <p
                className={`text-[11px] font-sans mt-1 leading-snug ${
                  activeStage === 3 ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {isFloating
                  ? "Rod was floating like a cork! Auto-Pilot throttled to 3.2 SPM to preserve gravity fall."
                  : "Steel rod bobs up and down smoothly; gravity fall easily beats oil drag."}
              </p>
            </div>

            {/* Financial Tag */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-mono">
              <span className={activeStage === 3 ? "text-slate-400" : "text-slate-500"}>Failure Risk:</span>
              <span
                className={`font-bold ${
                  isFloating
                    ? "text-emerald-600 font-extrabold"
                    : activeStage === 3
                    ? "text-emerald-300"
                    : "text-emerald-700"
                }`}
              >
                ₹35L Snap Prevented
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Stroke: {strokeLength}&quot;</span>
              <span>Power: ₹640/hr</span>
            </div>
          </div>

          {/* STAGE 4: Surface Delivery & Tanks */}
          <div
            onClick={() => setActiveStage(activeStage === 4 ? null : 4)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeStage === 4
                ? "bg-slate-900 text-white border-slate-900 shadow-darkCard"
                : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      activeStage === 4 ? "bg-white/10 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      activeStage === 4 ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Stage 4
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    activeStage === 4
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  100% Run-Time
                </span>
              </div>

              <h3 className="text-sm font-bold font-sans">4. Surface Delivery Tank</h3>
              <p
                className={`text-[11px] font-sans mt-1 leading-snug ${
                  activeStage === 4 ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Hot, softened crude is gathered continuously into Oil India surface tanks with zero shutdown.
              </p>
            </div>

            {/* Financial Tag */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-mono">
              <span className={activeStage === 4 ? "text-slate-400" : "text-slate-500"}>Field Profit:</span>
              <span
                className={`font-bold ${
                  activeStage === 4 ? "text-emerald-300" : "text-emerald-700"
                }`}
              >
                ₹{annualSavingsCr} Cr / yr
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Zero Sand Jamming</span>
              <span>12 Field Wells</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Financial Translation Bar */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Financial Translation Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 font-sans">
                Financial Impact Translation:
              </span>
              <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ₹{hourlySavings}/hr Net Savings
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Every physical change in viscosity and pump speed is automatically valued in rupees saved per operating hour.
            </p>
          </div>
        </div>

        {/* Right: Key Stats */}
        <div className="flex items-center gap-4 text-xs font-mono self-end md:self-auto">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Power Saved</span>
            <span className="font-extrabold text-emerald-700 text-sm">-{powerReductionPercent}%</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Workover Risk</span>
            <span className="font-bold text-slate-800 text-sm">0 Breakdowns</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Field ROI</span>
            <span className="font-extrabold text-slate-900 text-sm">₹5.85 Cr/yr</span>
          </div>
        </div>
      </div>
    </div>
  );
};
