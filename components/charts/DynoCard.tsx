"use client";

import React from "react";
import { DynoPoint } from "@/lib/data/generator";

export interface DynoCardProps {
  data: DynoPoint[];
  strokeLength?: number;
  isFloating?: boolean;
  peakLoad?: number;
  minLoad?: number;
}

export const DynoCard: React.FC<DynoCardProps> = ({
  data = [],
  strokeLength = 86.0,
  isFloating = false,
  peakLoad = 18600,
  minLoad = 5200,
}) => {
  // SVG Dimensions
  const width = 640;
  const height = 360;
  const padding = { top: 30, right: 30, bottom: 40, left: 65 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Scales
  const maxLoad = 26000;
  const minLoadScale = 0;
  const maxPos = Math.max(100, Math.ceil(strokeLength / 10) * 10);

  const scaleX = (pos: number) => padding.left + (pos / maxPos) * plotWidth;
  const scaleY = (load: number) =>
    padding.top + plotHeight - ((load - minLoadScale) / (maxLoad - minLoadScale)) * plotHeight;

  // Build Surface Loop Path
  let surfacePath = "";
  if (data.length > 0) {
    surfacePath = data.reduce((acc, pt, idx) => {
      const x = scaleX(pt.position);
      const y = scaleY(pt.surfaceLoad);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "") + " Z";
  }

  // Build Downhole Loop Path
  let downholePath = "";
  if (data.length > 0 && data[0].downholeLoad) {
    downholePath = data.reduce((acc, pt, idx) => {
      const x = scaleX(pt.position);
      const y = scaleY(pt.downholeLoad);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "") + " Z";
  }

  // Y-axis grid ticks (every 5000 lbs)
  const yTicks = [0, 5000, 10000, 15000, 20000, 25000];
  // X-axis grid ticks (every 20 inches)
  const xTicks = [0, 20, 40, 60, 80, 100];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              Surface & Downhole Dynamometer Card
            </span>
            {isFloating ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold">
                DISTORTED: ROD-FLOATING DETECTED
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                NORMAL FULL CARD
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Polished Rod Load vs Stroke Position (Inches)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-3 h-1 rounded ${isFloating ? "bg-rose-500" : "bg-sky-400"}`}
            ></span>
            <span className="text-slate-300">Surface Card</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-amber-400 border-dashed"></span>
            <span className="text-slate-300">Pump Card</span>
          </div>
        </div>
      </div>

      <div className="w-full aspect-[16/9] max-h-[380px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
          <defs>
            {/* Gradient fill for surface card */}
            <linearGradient id="dynoSurfaceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isFloating ? "#EF4444" : "#38BDF8"}
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor={isFloating ? "#EF4444" : "#38BDF8"}
                stopOpacity="0.03"
              />
            </linearGradient>
            <linearGradient id="dynoDownholeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => {
            const y = scaleY(tick);
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1E293B"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {tick.toLocaleString()}
                </text>
              </g>
            );
          })}

          {xTicks.map((tick) => {
            const x = scaleX(tick);
            return (
              <g key={`x-${tick}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="#1E293B"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {tick}&quot;
                </text>
              </g>
            );
          })}

          {/* Downhole Card Loop */}
          {downholePath && (
            <path
              d={downholePath}
              fill="url(#dynoDownholeGrad)"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          )}

          {/* Surface Card Loop */}
          {surfacePath && (
            <path
              d={surfacePath}
              fill="url(#dynoSurfaceGrad)"
              stroke={isFloating ? "#EF4444" : "#38BDF8"}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          )}

          {/* Peak Load Marker Line */}
          <line
            x1={padding.left}
            y1={scaleY(peakLoad)}
            x2={width - padding.right}
            y2={scaleY(peakLoad)}
            stroke={isFloating ? "#EF4444" : "#0EA5E9"}
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text
            x={width - padding.right}
            y={scaleY(peakLoad) - 4}
            textAnchor="end"
            fill={isFloating ? "#F87171" : "#38BDF8"}
            fontSize="9"
            fontFamily="monospace"
          >
            PEAK: {peakLoad.toLocaleString()} lbs
          </text>

          {/* Min Load Marker Line */}
          <line
            x1={padding.left}
            y1={scaleY(minLoad)}
            x2={width - padding.right}
            y2={scaleY(minLoad)}
            stroke={isFloating ? "#EF4444" : "#10B981"}
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text
            x={width - padding.right}
            y={scaleY(minLoad) + 12}
            textAnchor="end"
            fill={isFloating ? "#F87171" : "#34D399"}
            fontSize="9"
            fontFamily="monospace"
          >
            MIN: {minLoad.toLocaleString()} lbs
          </text>

          {/* Rod floating visual annotation */}
          {isFloating && (
            <g transform={`translate(${scaleX(45)}, ${scaleY(14000)})`}>
              <rect
                x="-110"
                y="-25"
                width="220"
                height="48"
                rx="6"
                fill="#450A0A"
                stroke="#EF4444"
                strokeWidth="1"
              />
              <text
                x="0"
                y="-6"
                textAnchor="middle"
                fill="#FECACA"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
              >
                DELAYED LOAD DROP
              </text>
              <text
                x="0"
                y="10"
                textAnchor="middle"
                fill="#F87171"
                fontSize="8.5"
                fontFamily="monospace"
              >
                Viscous drag impeding rod fall
              </text>
            </g>
          )}

          {/* Axes Labels */}
          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="11"
            fontFamily="monospace"
          >
            Polished Rod Position (inches)
          </text>

          <text
            transform={`rotate(-90)`}
            x={-height / 2}
            y={18}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="11"
            fontFamily="monospace"
          >
            Polished Rod Load (lbs)
          </text>
        </svg>
      </div>

      {/* Summary Footer Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-900 text-xs font-mono text-slate-400">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Peak Load</span>
          <span className={`font-bold ${isFloating ? "text-rose-400" : "text-white"}`}>
            {peakLoad.toLocaleString()} lbs
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Minimum Load</span>
          <span className={`font-bold ${isFloating ? "text-rose-400" : "text-emerald-400"}`}>
            {minLoad.toLocaleString()} lbs
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Stroke Length</span>
          <span className="font-bold text-white">{strokeLength}&quot;</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Load Range</span>
          <span className="font-bold text-slate-300">
            {(peakLoad - minLoad).toLocaleString()} lbs
          </span>
        </div>
      </div>
    </div>
  );
};
