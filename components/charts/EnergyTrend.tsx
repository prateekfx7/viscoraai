"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export interface EnergyTrendProps {
  data: Array<{
    date: string;
    energy_per_bbl: number;
    production_bbl: number;
    optimized: boolean;
  }>;
}

export const EnergyTrend: React.FC<EnergyTrendProps> = ({ data = [] }) => {
  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase text-slate-300">
            Lifting Energy Intensity Trend
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Electrical power consumed per barrel lifted (kWh/bbl)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-0.5 bg-rose-400 border-dashed"></span> Baseline (98.2 kWh/bbl)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-1.5 rounded-sm bg-amber-500"></span> Twin Optimized (68.5 kWh/bbl)
          </span>
        </div>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
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
              domain={[50, 120]}
              tickFormatter={(v) => `${v.toFixed(0)}`}
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
                      <p className="text-amber-400">
                        Energy: <span className="font-semibold text-white">{item.energy_per_bbl} kWh/bbl</span>
                      </p>
                      <p className="text-slate-400">
                        Production: <span className="text-white">{item.production_bbl} bbl/d</span>
                      </p>
                      <p className="text-emerald-400 font-bold mt-1">
                        Savings: -{(((98.2 - item.energy_per_bbl) / 98.2) * 100).toFixed(1)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine
              y={98.2}
              stroke="#EF4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "CONVENTIONAL (98.2 kWh/bbl)",
                fill: "#EF4444",
                fontSize: 9,
                position: "insideTopRight",
              }}
            />

            <Area
              type="monotone"
              dataKey="energy_per_bbl"
              stroke="#F59E0B"
              strokeWidth={2.5}
              fill="url(#energyGrad)"
              name="Energy (kWh/bbl)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
