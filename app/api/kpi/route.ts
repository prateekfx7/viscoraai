import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getDemoState } from "@/lib/data/generator";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wellId = searchParams.get("wellId") || "well-bgw-04";

    const snapshots = await prisma.kpiSnapshot.findMany({
      where: { well_id: wellId },
      orderBy: { date: "asc" },
    });

    const demo = getDemoState();

    // Calculate baseline averages vs optimized averages
    const baselineRecords = snapshots.filter((s) => !s.optimized);
    const optimizedRecords = snapshots.filter((s) => s.optimized);

    const avgBaselineSor =
      baselineRecords.length > 0
        ? Number((baselineRecords.reduce((acc, r) => acc + r.sor, 0) / baselineRecords.length).toFixed(2))
        : 4.75;

    const avgOptimizedSor =
      optimizedRecords.length > 0
        ? Number((optimizedRecords.reduce((acc, r) => acc + r.sor, 0) / optimizedRecords.length).toFixed(2))
        : 3.25;

    const avgBaselineEnergy =
      baselineRecords.length > 0
        ? Number((baselineRecords.reduce((acc, r) => acc + r.energy_per_bbl, 0) / baselineRecords.length).toFixed(1))
        : 98.2;

    const avgOptimizedEnergy =
      optimizedRecords.length > 0
        ? Number((optimizedRecords.reduce((acc, r) => acc + r.energy_per_bbl, 0) / optimizedRecords.length).toFixed(1))
        : 68.5;

    const avgBaselineProd =
      baselineRecords.length > 0
        ? Number((baselineRecords.reduce((acc, r) => acc + r.production_bbl, 0) / baselineRecords.length).toFixed(1))
        : 112.0;

    const avgOptimizedProd =
      optimizedRecords.length > 0
        ? Number((optimizedRecords.reduce((acc, r) => acc + r.production_bbl, 0) / optimizedRecords.length).toFixed(1))
        : 148.0;

    // Relative percentage improvements
    const sorImprovementPct = Number((((avgBaselineSor - avgOptimizedSor) / avgBaselineSor) * 100).toFixed(1));
    const energySavingsPct = Number((((avgBaselineEnergy - avgOptimizedEnergy) / avgBaselineEnergy) * 100).toFixed(1));
    const productionLiftPct = Number((((avgOptimizedProd - avgBaselineProd) / avgBaselineProd) * 100).toFixed(1));

    // Field scale annualized projections for Baghewala Field (12 active heavy oil wells)
    const annualizedSteamSavedTonnes = 14200; // tonnes steam saved per year
    const annualizedInrSavedCrores = 5.85; // crores INR saved in fuel/water/workover

    // Formatted timeline for Recharts
    const trendTimeline = snapshots.map((s, idx) => ({
      day: `D-${snapshots.length - idx}`,
      date: new Date(s.date).toLocaleDateString([], { month: "short", day: "numeric" }),
      sor: s.sor,
      energy_per_bbl: s.energy_per_bbl,
      production_bbl: s.production_bbl,
      optimized: s.optimized,
      baseline_benchmark_sor: 4.75,
      baseline_benchmark_energy: 98.0,
    }));

    return NextResponse.json({
      summary: {
        baseline: {
          sor: avgBaselineSor,
          energy_kwh_bbl: avgBaselineEnergy,
          production_bpd: avgBaselineProd,
        },
        optimized: {
          sor: avgOptimizedSor,
          energy_kwh_bbl: avgOptimizedEnergy,
          production_bpd: avgOptimizedProd,
        },
        improvements: {
          sor_reduction_pct: sorImprovementPct,
          energy_savings_pct: energySavingsPct,
          production_lift_pct: productionLiftPct,
        },
        fieldEconomics: {
          steam_saved_tonnes_yr: annualizedSteamSavedTonnes,
          cost_savings_inr_cr: annualizedInrSavedCrores,
          payback_period_months: 2.4,
        },
      },
      trendTimeline,
      demoScenarioActive: demo.forceFloating,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/kpi GET:", error);
    return NextResponse.json({ error: "Failed to fetch KPI data" }, { status: 500 });
  }
}
