"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

export interface ViscosityCurveProps {
  historyData?: Array<{
    day: number;
    temperature: number;
    viscosity: number;
  }>;
  forecastData?: Array<{
    day: number;
    predicted_temperature: number;
    predicted_viscosity: number;
  }>;
  currentDay?: number;
}

export const ViscosityCurve: React.FC<ViscosityCurveProps> = ({
  historyData = [],
  forecastData = [],
  currentDay = 38,
}) => {
  // Combine into single continuous series
  const combined = [];

  // Historical points
  for (const h of historyData) {
    combined.push({
      day: `D-${h.day}`,
      dayNum: h.day,
      temperature: h.temperature,
      viscosity: h.viscosity,
      type: "historical",
    });
  }

  // Forecast points
  for (const f of forecastData) {
    if (f.day >= currentDay) {
      combined.push({
        day: `D-${f.day}`,
        dayNum: f.day,
        predTemperature: f.predicted_temperature,
        predViscosity: f.predicted_viscosity,
        cutoffVisc: 1400,
        type: "forecast",
      });
    }
  }

  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase text-slate-300">
            CSS Thermal Dissipation & Walther Viscosity Trajectory
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Reservoir Bottom-Hole Temp Decay (°C) vs Dynamic Viscosity (cP) with 30-Day Forward Twin Forecast
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-orange-400">
            <span className="w-2.5 h-0.5 bg-orange-400"></span> Temp (°C)
          </span>
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2.5 h-0.5 bg-sky-400"></span> Viscosity (cP)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-0.5 bg-rose-400 border-dashed"></span> Economic Limit (1400 cP)
          </span>
        </div>
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combined} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              interval={4}
              fontFamily="monospace"
            />
            {/* Left Y-axis: Temperature in °C */}
            <YAxis
              yAxisId="temp"
              orientation="left"
              stroke="#F97316"
              fontSize={10}
              domain={[30, 270]}
              tickFormatter={(v) => `${v}°C`}
              fontFamily="monospace"
            />
            {/* Right Y-axis: Viscosity in cP (log-like visual domain) */}
            <YAxis
              yAxisId="visc"
              orientation="right"
              stroke="#38BDF8"
              fontSize={10}
              domain={[0, 2000]}
              tickFormatter={(v) => `${v} cP`}
              fontFamily="monospace"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono shadow-xl">
                      <p className="text-white font-bold mb-1 border-b border-slate-800 pb-1">
                        Cycle Day {data.dayNum} ({data.type === "historical" ? "Actual" : "Twin Forecast"})
                      </p>
                      {data.temperature !== undefined && (
                        <p className="text-orange-400">
                          Temp: <span className="font-semibold text-white">{data.temperature}°C</span>
                        </p>
                      )}
                      {data.predTemperature !== undefined && (
                        <p className="text-orange-300">
                          Pred Temp: <span className="font-semibold text-white">{data.predTemperature}°C</span>
                        </p>
                      )}
                      {data.viscosity !== undefined && (
                        <p className="text-sky-400">
                          Viscosity: <span className="font-semibold text-white">{data.viscosity} cP</span>
                        </p>
                      )}
                      {data.predViscosity !== undefined && (
                        <p className="text-sky-300">
                          Pred Viscosity: <span className="font-semibold text-white">{data.predViscosity} cP</span>
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Current Day Reference */}
            <ReferenceLine
              x={`D-${currentDay}`}
              stroke="#10B981"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              label={{
                value: `TODAY (Day ${currentDay})`,
                fill: "#10B981",
                fontSize: 10,
                position: "insideTopLeft",
              }}
            />

            {/* Economic Cutoff Limit */}
            <ReferenceLine
              yAxisId="visc"
              y={1400}
              stroke="#EF4444"
              strokeDasharray="4 4"
              label={{
                value: "CSS RE-INJECTION CUTOFF (1400 cP)",
                fill: "#EF4444",
                fontSize: 9,
                position: "insideBottomRight",
              }}
            />

            {/* History Curves */}
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke="#F97316"
              strokeWidth={2.5}
              dot={false}
              name="Historical Temp"
            />
            <Line
              yAxisId="visc"
              type="monotone"
              dataKey="viscosity"
              stroke="#38BDF8"
              strokeWidth={2.5}
              dot={false}
              name="Historical Viscosity"
            />

            {/* Forecast Curves (Dashed) */}
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="predTemperature"
              stroke="#FB923C"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="Forecast Temp"
            />
            <Line
              yAxisId="visc"
              type="monotone"
              dataKey="predViscosity"
              stroke="#7DD3FC"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="Forecast Viscosity"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
