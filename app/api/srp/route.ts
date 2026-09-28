import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getDemoState, generateSrpTelemetry, calculateTemperatureDecay, calculateViscosity } from "@/lib/data/generator";
import { evaluateSrpPerformance } from "@/lib/models/srp";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wellId = searchParams.get("wellId") || "well-bgw-04";

    const well = await prisma.well.findUnique({
      where: { id: wellId },
      include: {
        cssCycles: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!well) {
      return NextResponse.json({ error: "Well not found" }, { status: 404 });
    }

    const demo = getDemoState();
    const activeCycle = well.cssCycles[0];
    const now = new Date();
    const cycleStart = activeCycle ? new Date(activeCycle.start_date) : now;
    const cycleDay = Math.max(1, Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 3600 * 24)));

    const currentTemp = calculateTemperatureDecay(cycleDay);
    const currentVisc = calculateViscosity(currentTemp);

    // If demo rod-floating is active, SPM runs hot at 5.8 or 6.2 with high viscosity
    const isFloating = demo.forceFloating;
    const currentSpm = isFloating ? 5.8 : 5.1;
    const currentStroke = 86.0;

    const srpData = generateSrpTelemetry(currentVisc, currentSpm, currentStroke, isFloating);
    const srpAssessment = evaluateSrpPerformance({
      spm: srpData.spm,
      stroke_length: srpData.stroke_length,
      peak_load: srpData.load,
      min_load: srpData.min_load,
      viscosity_cp: currentVisc,
      frictional_drag: srpData.frictional_drag,
      gearbox_torque_pct: srpData.gearbox_torque_pct,
      rod_floating_flag: srpData.rod_floating_flag,
    });

    // Recent time-series telemetry (last 15 points) for trends
    const recentHistory = [];
    for (let i = 14; i >= 0; i--) {
      const pastTime = new Date(Date.now() - i * 5000);
      const pastFloating = i < 4 && isFloating;
      const pt = generateSrpTelemetry(currentVisc, pastFloating ? 5.8 : 5.1, currentStroke, pastFloating);
      recentHistory.push({
        time: pastTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        spm: pt.spm,
        load: pt.load,
        min_load: pt.min_load,
        gearbox: pt.gearbox_torque_pct,
        drag: pt.frictional_drag,
        floating: pt.rod_floating_flag,
      });
    }

    return NextResponse.json({
      well: { id: well.id, name: well.name },
      telemetry: {
        spm: srpData.spm,
        stroke_length: srpData.stroke_length,
        peak_load_lbs: srpData.load,
        min_load_lbs: srpData.min_load,
        frictional_drag_lbs: srpData.frictional_drag,
        gearbox_torque_pct: srpData.gearbox_torque_pct,
        rod_floating_flag: srpData.rod_floating_flag,
      },
      assessment: srpAssessment,
      dyno_card: JSON.parse(srpData.card_data_json || "[]"),
      recentHistory,
      card_classification: isFloating
        ? "CRITICAL ROD-FLOATING (Delayed Downstroke Load Drop & Rod Compression Plateau)"
        : "NORMAL HEAVY OIL PUMP CYCLE (Full barrel fillage, stable valve transit)",
      demo: {
        elapsedSec: demo.simulatedElapsedSec,
        isFloatingActive: demo.forceFloating,
        manualOverride: demo.manualOverride,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/srp:", error);
    return NextResponse.json({ error: "Failed to fetch SRP telemetry" }, { status: 500 });
  }
}
