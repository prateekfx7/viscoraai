import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { runOptimizationEngine, OptimizerInput } from "@/lib/models/optimizer";
import { getDemoState, calculateTemperatureDecay, calculateViscosity } from "@/lib/data/generator";

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

    const isFloating = demo.forceFloating;
    const currentSpm = isFloating ? 5.8 : 5.1;
    const currentStroke = 86.0;
    const peakLoad = isFloating ? 22100 : 18500;
    const minLoad = isFloating ? 3200 : 5300;
    const frictionalDrag = isFloating ? 3400 : 1200;

    const optimizerInput: OptimizerInput = {
      wellId: well.id,
      cycleDay,
      soakTimeDays: activeCycle ? activeCycle.soak_time_days : 7,
      currentSpm,
      currentStroke,
      peakLoad,
      minLoad,
      frictionalDrag,
      temperatureC: currentTemp,
      viscosityCp: currentVisc,
      rodFloatingFlag: isFloating,
    };

    const result = runOptimizationEngine(optimizerInput);

    return NextResponse.json({
      well: { id: well.id, name: well.name },
      optimization: result,
      status: "SUCCESS",
      engine: "Baghewala Well-to-Surface Physics-Informed Twin Engine v2.4",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/optimize GET:", error);
    return NextResponse.json({ error: "Optimization engine execution failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const optimizerInput: OptimizerInput = {
      cycleDay: body.cycleDay ?? 38,
      soakTimeDays: body.soakTimeDays ?? 7,
      currentSpm: body.currentSpm ?? 5.2,
      currentStroke: body.currentStroke ?? 86.0,
      peakLoad: body.peakLoad ?? 18500,
      minLoad: body.minLoad ?? 5200,
      frictionalDrag: body.frictionalDrag ?? 1200,
      temperatureC: body.temperatureC,
      viscosityCp: body.viscosityCp,
      rodFloatingFlag: body.rodFloatingFlag ?? false,
    };

    const result = runOptimizationEngine(optimizerInput);

    return NextResponse.json({
      optimization: result,
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/optimize POST:", error);
    return NextResponse.json({ error: "Failed to process custom optimization parameters" }, { status: 400 });
  }
}
