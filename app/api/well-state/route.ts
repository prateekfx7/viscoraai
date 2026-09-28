import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getDemoState, generateSrpTelemetry, calculateTemperatureDecay, calculateViscosity } from "@/lib/data/generator";
import { evaluateSrpPerformance } from "@/lib/models/srp";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wellId = searchParams.get("wellId") || "well-bgw-04";

    const wells = await prisma.well.findMany({
      orderBy: { name: "asc" },
    });

    const well = await prisma.well.findUnique({
      where: { id: wellId },
      include: {
        cssCycles: {
          orderBy: { cycle_number: "desc" },
          take: 3,
        },
      },
    });

    if (!well) {
      return NextResponse.json({ error: "Well not found" }, { status: 404 });
    }

    const demo = getDemoState();
    const activeCycle = well.cssCycles.find((c) => c.status === "ACTIVE") || well.cssCycles[0];

    // Compute cycle day
    const now = new Date();
    const cycleStart = activeCycle ? new Date(activeCycle.start_date) : now;
    const cycleDay = Math.max(1, Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 3600 * 24)));

    // Latest reservoir condition
    const currentTemp = calculateTemperatureDecay(cycleDay);
    const currentVisc = calculateViscosity(currentTemp);

    // Dynamic SRP reading reflecting demo state
    const isFloatingActive = demo.forceFloating;
    const baseSpm = isFloatingActive ? 5.8 : 5.2;
    const liveSrp = generateSrpTelemetry(currentVisc, baseSpm, 86.0, isFloatingActive);

    const srpAssessment = evaluateSrpPerformance({
      spm: liveSrp.spm,
      stroke_length: liveSrp.stroke_length,
      peak_load: liveSrp.load,
      min_load: liveSrp.min_load,
      viscosity_cp: currentVisc,
      frictional_drag: liveSrp.frictional_drag,
      gearbox_torque_pct: liveSrp.gearbox_torque_pct,
      rod_floating_flag: liveSrp.rod_floating_flag,
    });

    return NextResponse.json({
      well: {
        id: well.id,
        name: well.name,
        field: well.field,
        api_gravity: well.api_gravity,
        depth_m: well.depth_m,
        formation: well.formation,
        operator: well.operator,
        status: well.status,
      },
      availableWells: wells.map((w) => ({ id: w.id, name: w.name, status: w.status })),
      activeCycle: activeCycle
        ? {
            id: activeCycle.id,
            cycle_number: activeCycle.cycle_number,
            steam_volume: activeCycle.steam_volume,
            injection_pressure: activeCycle.injection_pressure,
            soak_time_days: activeCycle.soak_time_days,
            start_date: activeCycle.start_date,
            status: activeCycle.status,
            cycle_day: cycleDay,
          }
        : null,
      reservoir: {
        temperature_c: currentTemp,
        viscosity_cp: currentVisc,
        pressure_bar: Number((48.0 - cycleDay * 0.35).toFixed(1)),
        oil_rate_bpd: Number((210.0 * Math.exp(-0.022 * cycleDay)).toFixed(1)),
      },
      srp: {
        ...liveSrp,
        risk_level: srpAssessment.risk_level,
        failure_mode: srpAssessment.failure_mode,
        safe_spm_ceiling: srpAssessment.safe_spm_ceiling,
        dyno_card: JSON.parse(liveSrp.card_data_json || "[]"),
      },
      demo: {
        simulatedElapsedSec: demo.simulatedElapsedSec,
        forceFloating: demo.forceFloating,
        manualOverride: demo.manualOverride,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/well-state:", error);
    return NextResponse.json({ error: "Failed to fetch well state" }, { status: 500 });
  }
}
