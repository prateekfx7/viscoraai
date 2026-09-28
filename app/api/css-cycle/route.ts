import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { evaluateReservoirState } from "@/lib/models/reservoir";
import { calculateTemperatureDecay, calculateViscosity } from "@/lib/data/generator";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wellId = searchParams.get("wellId") || "well-bgw-04";

    const cycles = await prisma.cssCycle.findMany({
      where: { well_id: wellId },
      orderBy: { cycle_number: "asc" },
    });

    const activeCycle = cycles.find((c) => c.status === "ACTIVE") || cycles[cycles.length - 1];
    const now = new Date();
    const cycleStart = activeCycle ? new Date(activeCycle.start_date) : now;
    const cycleDay = Math.max(1, Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 3600 * 24)));

    // Historical 38-day readings
    const historicalReadings = await prisma.reservoirReading.findMany({
      where: { well_id: wellId },
      orderBy: { timestamp: "asc" },
      take: 45,
    });

    const historyTimeline = historicalReadings.map((r, idx) => ({
      day: idx,
      temperature: r.temperature,
      viscosity: r.predicted_viscosity,
      pressure: r.pressure_bar,
      oil_rate: r.oil_rate_bpd,
      phase: idx <= 7 ? "SOAK" : "PRODUCTION",
    }));

    // Forward assessment
    const reservoirAssessment = evaluateReservoirState(cycleDay);

    // Merge history + forward forecast for continuous charting
    const forecastTimeline = reservoirAssessment.forecast_30d.map((f) => ({
      day: f.day,
      predicted_temperature: f.temperature_c,
      predicted_viscosity: f.viscosity_cp,
      predicted_oil_rate: f.oil_rate_bpd,
      economic_cutoff_temp: 62.0,
      economic_cutoff_visc: 1400.0,
    }));

    return NextResponse.json({
      cycles,
      activeCycle,
      currentCycleDay: cycleDay,
      reservoirAssessment,
      historyTimeline,
      forecastTimeline,
      economicCutoff: {
        min_temp_c: 62.0,
        max_viscosity_cp: 1400.0,
        days_remaining: reservoirAssessment.days_to_economic_limit,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/css-cycle:", error);
    return NextResponse.json({ error: "Failed to fetch CSS cycle data" }, { status: 500 });
  }
}
