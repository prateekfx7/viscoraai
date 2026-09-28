import { NextResponse } from "next/server";
import { getDemoState, setDemoOverride, resetDemoState } from "@/lib/data/generator";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = getDemoState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "reset") {
      resetDemoState();
    } else if (body.action === "trigger_floating") {
      setDemoOverride(true);
    } else if (body.action === "clear_floating") {
      setDemoOverride(false);
    }
    const state = getDemoState();
    return NextResponse.json({ success: true, state });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update demo state" }, { status: 400 });
  }
}
