"use client";

import React, { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  Droplet,
  FastForward,
  FileText,
  Flame,
  Gauge,
  Info,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Thermometer,
  Users,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/app-1-utils/sidebar";

import {
  app1Activity,
  app1Chart,
  app1ChartConfig,
  app1Projects,
  app1User,
} from "@/components/ui/app-1-utils/app-1-data";
import { App1Sidebar } from "@/components/ui/app-1-utils/app-1-sidebar";
import { Wellbore3DTwin } from "@/components/twin/Wellbore3DTwin";
import { NeuralPredictorCard } from "@/components/twin/NeuralPredictorCard";

const STATS = [
  {
    label: "Active Field Wells",
    value: "12",
    hint: "Jodhpur Sandstone (17–19° API)",
    icon: Database,
  },
  {
    label: "Extraction Throughput",
    value: "260 bbl/d",
    hint: "+18 bbl/d via VFD optimization",
    icon: Activity,
  },
  {
    label: "Thermal Steam Ratio",
    value: "3.25 t/t",
    hint: "Down from 4.75 baseline SOR",
    icon: Flame,
  },
  {
    label: "Net Business Impact",
    value: "₹5.85 Cr/yr",
    hint: "Zero ₹35L rod parting workovers",
    icon: ShieldCheck,
  },
];

const STATUS_VARIANT = {
  "In progress": "default",
  "In review": "secondary",
  Planning: "outline",
} as const;

export function App1() {
  const [autoPilotEnabled, setAutoPilotEnabled] = useState(true);
  const [simulatedShock, setSimulatedShock] = useState(false);

  // Dynamic values depending on simulation
  const temperatureC = simulatedShock ? 64.2 : 94.6;
  const viscosityCp = simulatedShock ? 1850 : 850;
  const currentSpm = simulatedShock ? (autoPilotEnabled ? 3.2 : 5.8) : 5.2;
  const terminalFallVelocity = simulatedShock ? 1.15 : 2.45;
  const dragRatio = simulatedShock ? 0.54 : 0.18;
  const rodFloatingHazard = simulatedShock;

  return (
    <SidebarProvider>
      <App1Sidebar />
      <SidebarInset className="min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger aria-label="Toggle navigation" />
          <div className="flex items-center gap-2 truncate">
            <h1 className="truncate text-lg font-bold tracking-tight text-foreground font-sans">
              Welcome back, {app1User.name.split(" ")[0]}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
              SIH26120 • OIL INDIA LTD
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Auto-Pilot Toggle Pill */}
            <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-full text-xs font-mono shadow-sm">
              <span className={`w-2 h-2 rounded-full ${autoPilotEnabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <span className="text-[11px] font-medium hidden md:inline">
                {autoPilotEnabled ? "Auto-Pilot: Active" : "Manual Supervisory"}
              </span>
              <button
                onClick={() => setAutoPilotEnabled(!autoPilotEnabled)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                  autoPilotEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-800"
                }`}
              >
                {autoPilotEnabled ? "ON" : "OFF"}
              </button>
            </div>

            <Button variant="ghost" size="icon" aria-label="Search" className="size-8">
              <Search className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="size-8">
              <Bell className="size-4" />
            </Button>
            <Avatar className="ml-1 size-8">
              <AvatarImage
                src={app1User.avatar}
                alt={app1User.name}
                className="object-[50%_15%]"
              />
              <AvatarFallback>{app1User.initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {/* Section 1: Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {STATS.map((stat) => (
              <Card key={stat.label} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </span>
                    <stat.icon
                      aria-hidden
                      className="size-4 text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight font-mono text-foreground">
                    {stat.value}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground font-sans mt-2">{stat.hint}</p>
              </Card>
            ))}
          </div>

          {/* Section 2: Problem Statement 26120 Core Solution — Well-to-Surface Coupled Twin */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      PS26120 DIGITAL TWIN ENGINE
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Baghewala Well BGW-04 • Jodhpur Sandstone (17.5° API)
                    </span>
                  </div>
                  <CardTitle className="text-xl font-extrabold mt-1">
                    Well-to-Surface Integrated Optimization (CSS + SRP)
                  </CardTitle>
                  <CardDescription>
                    Coupling post-steam reservoir thermal dissipation, Walther viscosity surge, and Stokes rod-fall dynamics into closed-loop VFD control.
                  </CardDescription>
                </div>

                {/* 1-Click Showstopper Interactive Demo Button */}
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

              {/* Dynamic Emergency Intervention Banner */}
              {rodFloatingHazard && (
                <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-amber-950 dark:text-amber-300 font-sans uppercase">
                          Rod Floating Hazard Prevented via Closed-Loop VFD
                        </span>
                        <Badge variant="default" className="bg-emerald-600 text-white text-[9px] font-mono">
                          SAVED ₹35,00,000
                        </Badge>
                      </div>
                      <p className="text-xs text-amber-900 dark:text-amber-400 mt-0.5 font-sans leading-relaxed">
                        Crude viscosity spiked to <strong>{viscosityCp} cP</strong> (approaching 1,400 cP cutoff). Buoyant drag threatened rod unsetting and impact loading. Viscora automatically throttled surface VFD from 5.8 SPM down to <strong>3.2 SPM</strong>, preserving gravity descent.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase block">Power & Failure Savings</span>
                    <span className="text-xs font-mono font-extrabold text-emerald-600 bg-background px-2.5 py-1 rounded-lg border border-border inline-block">
                      +₹1,420/hr Net
                    </span>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Meter 1: CSS Thermal Kinetics */}
                <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Thermometer className="size-3.5 text-orange-500" />
                        Reservoir Heat (CSS)
                      </span>
                      <span className="font-bold text-orange-600">{temperatureC}°C</span>
                    </div>
                    <div className="my-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(10, ((temperatureC - 47) / (255 - 47)) * 100))}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mt-2 pt-2 border-t border-border/50">
                    <span>Native: 47°C (Jodhpur)</span>
                    <span className="text-amber-600 font-bold">Cutoff: ~8 days</span>
                  </div>
                </div>

                {/* Meter 2: Walther Viscosity */}
                <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Droplet className="size-3.5 text-amber-500" />
                        Fluid Viscosity (Walther)
                      </span>
                      <span className={`font-bold font-mono ${rodFloatingHazard ? "text-rose-600" : "text-foreground"}`}>
                        {viscosityCp} cP
                      </span>
                    </div>
                    <div className="my-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rodFloatingHazard ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, (viscosityCp / 2000) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mt-2 pt-2 border-t border-border/50">
                    <span>17.5° API Sandstone</span>
                    <span className="font-semibold text-emerald-600">Limit: 1,400 cP</span>
                  </div>
                </div>

                {/* Meter 3: Stokes Rod Drag */}
                <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Activity className="size-3.5 text-sky-500" />
                        Stokes Terminal Fall
                      </span>
                      <span className="font-bold text-foreground font-mono">{terminalFallVelocity} ft/s</span>
                    </div>
                    <div className="my-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rodFloatingHazard ? "bg-amber-500" : "bg-sky-500"
                        }`}
                        style={{ width: `${Math.min(100, (terminalFallVelocity / 3.0) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mt-2 pt-2 border-t border-border/50">
                    <span>Drag Ratio: {(dragRatio * 100).toFixed(0)}%</span>
                    <span className={`font-bold ${rodFloatingHazard ? "text-amber-600" : "text-emerald-600"}`}>
                      {rodFloatingHazard ? "Buoyant Drag" : "Clean Descent"}
                    </span>
                  </div>
                </div>

                {/* Meter 4: Closed-Loop VFD SPM */}
                <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Gauge className="size-3.5 text-emerald-600" />
                        VFD Speed Ceiling
                      </span>
                      <span className="font-bold text-foreground font-mono">{currentSpm} SPM</span>
                    </div>
                    <div className="my-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(currentSpm / 7.0) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mt-2 pt-2 border-t border-border/50">
                    <span>Stroke Length: 86&quot;</span>
                    <span className="font-bold text-emerald-600">
                      {autoPilotEnabled ? "VFD SYNCHRONIZED" : "MANUAL"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3D WebGL Interactive Wellbore & SRP Digital Twin */}
          <Wellbore3DTwin
            spm={currentSpm}
            temperatureC={temperatureC}
            viscosityCp={viscosityCp}
            strokeLength={simulatedShock ? 100 : 86}
            isShockActive={rodFloatingHazard}
            autoPilotEnabled={autoPilotEnabled}
          />

          {/* Section 3: Dual Intelligence Grid — Production Throughput Chart + Edge AI Neural Classifier */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Production Throughput & Steam Efficiency</CardTitle>
                    <CardDescription>
                      Weekly thermal steam injected (bbl/d equiv) against heavy crude lifted in Baghewala Field
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    Target SOR: 3.25 t/t
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={app1ChartConfig} className="h-64 w-full">
                  <AreaChart
                    data={app1Chart}
                    margin={{ left: 4, right: 4, top: 8 }}
                    accessibilityLayer
                  >
                    <defs>
                      <linearGradient
                        id="app1Completed"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--color-completed)"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--color-completed)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="week"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis tickLine={false} axisLine={false} width={32} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      dataKey="opened"
                      type="monotone"
                      stroke="var(--color-opened)"
                      strokeDasharray="4 4"
                      fill="none"
                      strokeWidth={2}
                    />
                    <Area
                      dataKey="completed"
                      type="monotone"
                      stroke="var(--color-completed)"
                      fill="url(#app1Completed)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Edge AI Neural Classifier Card */}
            <NeuralPredictorCard
              currentSpm={currentSpm}
              viscosityCp={viscosityCp}
              strokeLength={simulatedShock ? 100 : 86}
              isShockActive={rodFloatingHazard}
            />
          </div>

          {/* Section 4: Active Wells & Real-time Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Field Wells (Jodhpur Sandstone)</CardTitle>
                    <CardDescription>Baghewala heavy oil wells status & CSS cycle progress</CardDescription>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">17–19° API</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {app1Projects.map((project) => (
                  <div key={project.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold">
                        {project.name}
                      </h3>
                      <Badge variant={STATUS_VARIANT[project.status]}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={project.progress}
                        aria-label={`${project.name} progress`}
                      />
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums font-mono">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1">
                        {project.team.map((member) => (
                          <Avatar key={member.name} className="size-6">
                            <AvatarImage
                              src={member.avatar}
                              alt={member.name}
                              className="object-[50%_15%]"
                            />
                            <AvatarFallback className="text-[10px]">
                              {member.initials}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        Due {project.dueDate}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-Time Operations & Closed-Loop SCADA Log</CardTitle>
                <CardDescription>Autonomous Twin & Field Engineers Event Log</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-4">
                  {app1Activity.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-3">
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage
                          src={entry.person.avatar}
                          alt={entry.person.name}
                          className="object-[50%_15%]"
                        />
                        <AvatarFallback className="text-xs">
                          {entry.person.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug">
                          <span className="font-semibold text-foreground">
                            {entry.person.name}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {entry.action}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {entry.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App1;
