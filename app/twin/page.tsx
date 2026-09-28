"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Wellbore3DTwin } from "@/components/twin/Wellbore3DTwin";
import { NeuralPredictorCard } from "@/components/twin/NeuralPredictorCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FastForward,
  ShieldCheck,
  Sparkles,
  Layers,
  Activity,
  Cpu,
  Thermometer,
  Droplet,
  Gauge,
} from "lucide-react";

export default function TwinPage() {
  const [simulatedShock, setSimulatedShock] = useState(false);
  const [autoPilotEnabled, setAutoPilotEnabled] = useState(true);

  const temperatureC = simulatedShock ? 64.2 : 94.6;
  const viscosityCp = simulatedShock ? 1850 : 850;
  const currentSpm = simulatedShock ? (autoPilotEnabled ? 3.2 : 5.8) : 5.2;
  const strokeLength = simulatedShock ? 100 : 86;
  const terminalFallVelocity = simulatedShock ? 1.15 : 2.45;
  const dragRatio = simulatedShock ? 0.54 : 0.18;

  return (
    <DashboardShell title="3D Wellbore & SRP Digital Twin">
      <div className="flex flex-col gap-6">
        {/* Header with 1-Click Shock Simulator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                THREE.JS WEBGL SIMULATION
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Baghewala Well BGW-04 • Jodhpur Sandstone
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans mt-1">
              Interactive 3D Subsurface & Surface Kinematics Twin
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-0.5">
              Live physics simulation coupling surface SRP beam oscillations, 1,050m sucker rod string descent, and downhole CSS thermal kinetics.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!simulatedShock ? (
              <Button
                onClick={() => setSimulatedShock(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-mono text-xs font-bold gap-2 shadow-sm"
              >
                <FastForward className="size-3.5" />
                <span>⚡ Simulate Cold Sludge Shock</span>
              </Button>
            ) : (
              <Button
                onClick={() => setSimulatedShock(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold gap-2 shadow-sm"
              >
                <ShieldCheck className="size-3.5" />
                <span>✓ Return to Baseline</span>
              </Button>
            )}
          </div>
        </div>

        {/* 3D WebGL Digital Twin Viewport */}
        <Wellbore3DTwin
          spm={currentSpm}
          temperatureC={temperatureC}
          viscosityCp={viscosityCp}
          strokeLength={strokeLength}
          isShockActive={simulatedShock}
          autoPilotEnabled={autoPilotEnabled}
        />

        {/* 4-Item Telemetry Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1">
              <span className="flex items-center gap-1.5 uppercase font-semibold">
                <Gauge className="size-3.5 text-emerald-600" />
                Kinematic Speed (VFD)
              </span>
              <span className="font-bold font-mono text-foreground">{currentSpm.toFixed(1)} SPM</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tabular-nums my-1">
              {currentSpm} <span className="text-xs text-muted-foreground font-mono">SPM</span>
            </div>
            <span className="text-xs text-muted-foreground font-sans">
              {autoPilotEnabled ? "VFD Throttled to match Stokes descent" : "Manual supervisory speed"}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1">
              <span className="flex items-center gap-1.5 uppercase font-semibold">
                <Thermometer className="size-3.5 text-orange-500" />
                Bottom-Hole Temp
              </span>
              <span className="font-bold text-orange-600">{temperatureC}°C</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tabular-nums my-1">
              {temperatureC} <span className="text-xs text-muted-foreground font-mono">°C</span>
            </div>
            <span className="text-xs text-muted-foreground font-sans">
              Native Jodhpur Sandstone: 47°C • CSS Post-soak
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1">
              <span className="flex items-center gap-1.5 uppercase font-semibold">
                <Droplet className="size-3.5 text-amber-500" />
                Walther Viscosity
              </span>
              <span className={`font-bold font-mono ${simulatedShock ? "text-rose-600" : "text-foreground"}`}>
                {viscosityCp} cP
              </span>
            </div>
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums my-1 ${
              simulatedShock ? "text-rose-600" : "text-foreground"
            }`}>
              {viscosityCp} <span className="text-xs text-muted-foreground font-mono">cP</span>
            </div>
            <span className="text-xs text-muted-foreground font-sans">
              17.5° API heavy crude • Cutoff limit: 1,400 cP
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1">
              <span className="flex items-center gap-1.5 uppercase font-semibold">
                <Activity className="size-3.5 text-sky-500" />
                Stokes Terminal Fall
              </span>
              <span className="font-bold text-foreground font-mono">{terminalFallVelocity} ft/s</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground tabular-nums my-1">
              {terminalFallVelocity} <span className="text-xs text-muted-foreground font-mono">ft/s</span>
            </div>
            <span className="text-xs text-muted-foreground font-sans">
              Drag ratio: {(dragRatio * 100).toFixed(0)}% of rod string buoyant weight
            </span>
          </div>
        </div>

        {/* AI/ML Neural Classifier Section */}
        <NeuralPredictorCard
          currentSpm={currentSpm}
          viscosityCp={viscosityCp}
          strokeLength={strokeLength}
          isShockActive={simulatedShock}
        />
      </div>
    </DashboardShell>
  );
}
