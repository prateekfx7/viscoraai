"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Layers, Maximize2, Minus, Plus } from "lucide-react";

export interface WellboreCutawayProps {
  depthM?: number;
  temperatureC?: number;
  viscosityCp?: number;
  isFloating?: boolean;
  spm?: number;
  strokeLength?: number;
}

export const WellboreCutaway: React.FC<WellboreCutawayProps> = ({
  depthM = 1045,
  temperatureC = 94.6,
  viscosityCp = 850,
  isFloating = false,
  spm = 5.2,
  strokeLength = 86,
}) => {
  const [activeZone, setActiveZone] = useState<number>(2); // 1: Surface, 2: Rod String, 3: Bottom-Hole Steam

  return (
    <div className="relative w-full h-full bg-[#E5E8EC] rounded-3xl p-5 border border-slate-200/90 flex flex-col justify-between overflow-hidden shadow-soft select-none">
      {/* Left Depth / Zone Controls (Matching 1, 2, 3 in reference image) */}
      <div className="absolute top-5 left-5 z-20 flex flex-col items-center gap-2">
        <button
          onClick={() => setActiveZone(1)}
          className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all ${
            activeZone === 1
              ? "bg-[#1A1D24] text-white shadow-md scale-105"
              : "bg-white/80 text-slate-600 hover:bg-white"
          }`}
          title="Zone 1: Surface Wellhead & Pumping Unit (0 - 300m)"
        >
          1
        </button>

        <button
          onClick={() => setActiveZone(2)}
          className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all ${
            activeZone === 2
              ? "bg-[#1A1D24] text-white shadow-md scale-105"
              : "bg-white/80 text-slate-600 hover:bg-white"
          }`}
          title="Zone 2: Sucker Rod Column & Viscous Drag (300 - 850m)"
        >
          2
        </button>

        <button
          onClick={() => setActiveZone(3)}
          className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all ${
            activeZone === 3
              ? "bg-[#1A1D24] text-white shadow-md scale-105"
              : "bg-white/80 text-slate-600 hover:bg-white"
          }`}
          title="Zone 3: Bottom-Hole Pump & CSS Steam Chamber (850 - 1045m)"
        >
          3
        </button>

        <div className="w-5 h-[1px] bg-slate-300 my-1"></div>

        <button
          className="w-6 h-6 rounded-full bg-white/70 hover:bg-white text-slate-700 flex items-center justify-center text-xs shadow-sm"
          title="Expand View"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          className="w-6 h-6 rounded-full bg-white/70 hover:bg-white text-slate-700 flex items-center justify-center text-xs shadow-sm"
          title="Reset View"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Header Tag */}
      <div className="flex items-center justify-between pl-10 pr-2">
        <div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 block">
            Subsurface Digital Twin Cutaway
          </span>
          <h3 className="text-sm font-bold text-slate-900 font-mono">
            Wellbore Casing & Sucker Rod Profile (1,045m)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isFloating ? (
            <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm">
              <AlertTriangle className="w-3 h-3" />
              <span>ROD FLOATING DETECTED</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>ROD MOTION NORMAL</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Vector Diagram: Wellbore Cutaway Vector Art */}
      <div className="relative my-auto w-full max-w-[340px] mx-auto py-2">
        <svg viewBox="0 0 280 480" className="w-full h-auto drop-shadow-sm select-none">
          <defs>
            {/* Crosshatch pattern for viscous drag zone */}
            <pattern id="hatchDrag" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke={isFloating ? "#EF4444" : "#94A3B8"} strokeWidth="1" strokeOpacity="0.4" />
            </pattern>
            {/* Steam Chamber Heat Plume Gradient */}
            <linearGradient id="steamHeatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="casingGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="50%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>

          {/* Surface Horsehead Outline */}
          <g transform="translate(140, 25)">
            <ellipse cx="0" cy="0" rx="42" ry="12" fill="#1E232A" />
            <rect x="-3" y="10" width="6" height="20" fill="#475569" />
            {/* Polished rod hanger */}
            <circle cx="0" cy="30" r="4" fill="#F59E0B" />
          </g>

          {/* Outer Casing Body (Aerodynamic Capsule Silhouette matching fuselage) */}
          <path
            d="M 100 45 C 100 35, 180 35, 180 45 L 195 140 L 195 380 C 195 440, 180 460, 140 460 C 100 460, 85 440, 85 380 L 85 140 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="2"
          />

          {/* SECTION 1: Surface Casing (0 - 300m) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-90"
            onClick={() => setActiveZone(1)}
          >
            <path
              d="M 102 52 L 178 52 L 186 140 L 94 140 Z"
              fill={activeZone === 1 ? "#F1F5F9" : "#F8FAFC"}
              stroke="#94A3B8"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            <text x="140" y="80" textAnchor="middle" fill="#64748B" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
              SURFACE CASING 0-300m
            </text>
            <text x="140" y="96" textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="monospace">
              Aquifer Isolation Seal
            </text>
            <circle cx="140" cy="115" r="3" fill="#64748B" />
          </g>

          {/* SECTION 2: Sucker Rod Column & Viscous Oil Drag Zone (300 - 850m) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-90"
            onClick={() => setActiveZone(2)}
          >
            <rect
              x="92"
              y="148"
              width="96"
              height="150"
              rx="8"
              fill={isFloating ? "#FEF2F2" : "#F8FAFC"}
              stroke={isFloating ? "#EF4444" : "#94A3B8"}
              strokeWidth={isFloating ? "2" : "1"}
            />
            {/* Crosshatch fill for drag */}
            <rect x="94" y="150" width="92" height="146" rx="6" fill="url(#hatchDrag)" />

            {/* Sucker Rod Center String */}
            <line
              x1="140"
              y1="140"
              x2="140"
              y2="300"
              stroke={isFloating ? "#EF4444" : "#1E293B"}
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Compression Buckle Animation if Rod Floating */}
            {isFloating && (
              <path
                d="M 140 180 Q 148 210, 140 230 Q 132 250, 140 270"
                stroke="#EF4444"
                strokeWidth="4"
                fill="none"
              />
            )}

            {/* Central Badge in Zone 2 */}
            <g transform="translate(140, 220)">
              <rect
                x="-48"
                y="-18"
                width="96"
                height="36"
                rx="8"
                fill={isFloating ? "#1C2028" : "#1E232A"}
                stroke={isFloating ? "#EF4444" : "#334155"}
                strokeWidth="1"
              />
              <text x="0" y="-4" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontFamily="monospace" fontWeight="bold">
                {isFloating ? "ROD-FLOATING" : "ROD STRING"}
              </text>
              <text x="0" y="9" textAnchor="middle" fill={isFloating ? "#F87171" : "#38BDF8"} fontSize="8" fontFamily="monospace">
                {viscosityCp} cP • {spm} SPM
              </text>
            </g>
          </g>

          {/* SECTION 3: Bottom-Hole Pump & Jodhpur Steam Chamber (850 - 1045m) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-90"
            onClick={() => setActiveZone(3)}
          >
            <path
              d="M 94 308 L 186 308 L 180 430 C 170 445, 110 445, 100 430 Z"
              fill={activeZone === 3 ? "url(#steamHeatGrad)" : "#FFF7ED"}
              stroke="#F97316"
              strokeWidth="1.5"
            />
            {/* Traveling / Standing Valve Icon */}
            <g transform="translate(140, 340)">
              <circle cx="0" cy="0" r="10" fill="#1E232A" />
              <circle cx="0" cy="0" r="4" fill="#F59E0B" />
              <text x="0" y="24" textAnchor="middle" fill="#C2410C" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                PUMP BARREL (1045m)
              </text>
              <text x="0" y="36" textAnchor="middle" fill="#EA580C" fontSize="7.5" fontFamily="monospace">
                Steam Temp: {temperatureC}°C
              </text>
            </g>

            {/* Perforations */}
            {[-30, -15, 0, 15, 30].map((offset, i) => (
              <circle key={i} cx={140 + offset} cy={425} r="2.5" fill="#C2410C" />
            ))}
          </g>
        </svg>
      </div>

      {/* Bottom Zone Diagnostic Readout */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 border border-slate-200/90 flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">
            Active Layer: {activeZone === 1 ? "Surface Casing" : activeZone === 2 ? "Rod Drag Section" : "Perforated Steam Zone"}
          </span>
          <span className="font-bold text-slate-800">
            {activeZone === 1 ? "0 - 300m (Aquifer Shield)" : activeZone === 2 ? "300 - 850m (Viscous Resistance)" : "850 - 1,045m (Thermal Matrix)"}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block uppercase">Formation</span>
          <span className="font-semibold text-slate-700">Jodhpur Sandstone</span>
        </div>
      </div>
    </div>
  );
};
