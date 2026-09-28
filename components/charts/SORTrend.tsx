"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export interface SORTrendProps {
  data: Array<{
    date: string;
    sor: number;
    optimized: boolean;
    baseline_benchmark_sor?: number;
  }>;
}

export const SORTrend: React.FC<SORTrendProps> = ({ data = [] }) => {
  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Steam-Oil Ratio (SOR) Efficiency Trend
          </span>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Tonnes steam injected per tonne heavy oil produced (Lower is better)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-0.5 bg-rose-400 border-dashed"></span> Baseline (4.75)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-1.5 rounded-sm bg-emerald-500"></span> Twin Optimized (3.25)
          </span>
        </div>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="sorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              interval={4}
              fontFamily="monospace"
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              domain={[2.0, 6.0]}
              tickFormatter={(v) => `${v.toFixed(1)}`}
              fontFamily="monospace"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono shadow-xl">
                      <p className="text-white font-bold mb-1 border-b border-slate-800 pb-1">
                        {item.date} {item.optimized ? "(Twin Optimized)" : "(Conventional)"}
                      </p>
                      <p className="text-emerald-400">
                        Actual SOR: <span className="font-semibold text-white">{item.sor} t/t</span>
                      </p>
                      <p className="text-slate-400">
                        Baseline Benchmark: 4.75 t/t
                      </p>
                      <p className="text-emerald-300 font-bold mt-1">
                        Efficiency Gain: {(( (4.75 - item.sor) / 4.75) * 100).toFixed(1)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine
              y={4.75}
              stroke="#EF4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "CONVENTIONAL BASELINE (4.75)",
                fill: "#EF4444",
                fontSize: 9,
                position: "insideTopRight",
              }}
            />

            <ReferenceLine
              y={3.25}
              stroke="#10B981"
              strokeDasharray="2 2"
              strokeWidth={1}
              label={{
                value: "TWIN TARGET (3.25)",
                fill: "#10B981",
                fontSize: 9,
                position: "insideBottomRight",
              }}
            />

            <Area
              type="monotone"
              dataKey="sor"
              stroke="#10B981"
              strokeWidth={2.5}
              fill="url(#sorGrad)"
              name="SOR"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
