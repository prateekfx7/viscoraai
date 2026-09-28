import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getDemoState } from "@/lib/data/generator";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wellId = searchParams.get("wellId") || "well-bgw-04";

    const dbAlerts = await prisma.alert.findMany({
      where: { well_id: wellId },
      orderBy: { timestamp: "desc" },
    });

    const demo = getDemoState();
    const alerts = [...dbAlerts];

    // If demo rod-floating scenario is active, insert live Critical Alert at top
    if (demo.forceFloating) {
      alerts.unshift({
        id: "alert-live-floating-auto",
        well_id: wellId,
        type: "ROD_FLOATING",
        severity: "CRITICAL",
        message:
          "EMERGENCY: Sucker rod floating detected on BGW-04. Polished rod downstroke delayed by viscous drag (>800 cP). VFD throttle recommended immediately.",
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    const criticalCount = alerts.filter((a) => a.severity === "CRITICAL" && !a.acknowledged).length;
    const warningCount = alerts.filter((a) => a.severity === "WARNING" && !a.acknowledged).length;
    const infoCount = alerts.filter((a) => a.severity === "INFO" && !a.acknowledged).length;

    return NextResponse.json({
      alerts,
      counts: {
        total: alerts.length,
        critical: criticalCount,
        warning: warningCount,
        info: infoCount,
      },
      hasActiveEmergency: demo.forceFloating,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/alerts GET:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { alertId, acknowledged } = body;

    if (alertId && alertId !== "alert-live-floating-auto") {
      await prisma.alert.update({
        where: { id: alertId },
        data: { acknowledged: acknowledged ?? true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update alert status" }, { status: 400 });
  }
}
