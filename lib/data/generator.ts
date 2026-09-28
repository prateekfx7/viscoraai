/**
 * Synthetic Data Generator for Baghewala Field Heavy Oil Wells (Oil India Limited)
 * Simulates Cyclic Steam Stimulation (CSS) thermal decay and Sucker Rod Pump (SRP) dynamics.
 */

export interface DynoPoint {
  position: number;    // Stroke position in inches (0 to Stroke Length)
  surfaceLoad: number; // Surface polished rod load in lbs
  downholeLoad: number;// Downhole pump load in lbs
}

export interface GeneratorConfig {
  wellId: string;
  wellName: string;
  apiGravity: number;
  currentCycle: number;
  daysSinceSteamSoak: number;
}

// Global in-memory demo state tracker for live simulation
export interface DemoState {
  startedAt: number; // timestamp in ms
  forceFloating: boolean;
  manualOverride: boolean;
  simulatedElapsedSec: number;
}

const globalForDemo = globalThis as unknown as {
  globalDemoState: DemoState | undefined;
};

const defaultDemoState: DemoState = {
  startedAt: Date.now(),
  forceFloating: false,
  manualOverride: false,
  simulatedElapsedSec: 0,
};

const activeDemoState: DemoState =
  globalForDemo.globalDemoState ?? defaultDemoState;

if (!globalForDemo.globalDemoState) {
  globalForDemo.globalDemoState = activeDemoState;
}

export function getDemoState(): DemoState {
  const state = globalForDemo.globalDemoState || activeDemoState;
  const now = Date.now();
  if (!state.manualOverride) {
    state.simulatedElapsedSec = Math.floor((now - state.startedAt) / 1000);
    // Automatic demo hook: trigger rod floating around 90 seconds (e.g. between 85s and 220s)
    if (state.simulatedElapsedSec >= 85 && state.simulatedElapsedSec <= 220) {
      state.forceFloating = true;
    } else if (state.simulatedElapsedSec > 220) {
      state.forceFloating = false;
    }
  }
  return { ...state };
}

export function setDemoOverride(forceFloating: boolean): void {
  const state = globalForDemo.globalDemoState || activeDemoState;
  state.manualOverride = true;
  state.forceFloating = forceFloating;
}

export function resetDemoState(): void {
  const state = globalForDemo.globalDemoState || activeDemoState;
  state.startedAt = Date.now();
  state.manualOverride = false;
  state.forceFloating = false;
  state.simulatedElapsedSec = 0;
}

/**
 * Predicts bottom-hole temperature based on days post-soak in CSS production phase.
 * Baghewala typical: Peak steam temp ~260°C decays toward native reservoir ~45°C.
 */
export function calculateTemperatureDecay(daysPostSoak: number): number {
  const T_res = 45.0; // Native reservoir temp (°C)
  const T_peak = 255.0; // Peak temp after steam injection & 7-day soak (°C)
  const decayConstant = 0.038; // Thermal diffusion rate in Jodhpur sandstone
  return Number((T_res + (T_peak - T_res) * Math.exp(-decayConstant * daysPostSoak)).toFixed(1));
}

/**
 * Calculates dynamic viscosity (cP) using Andrade-Walther heavy oil relation for Baghewala crude (15° API).
 * Low temp (~45°C) -> 7,000+ cP
 * Day 38 (~94°C) -> ~850 cP (elevated drag & rod-floating hazard)
 * High temp (~250°C) -> 15-28 cP
 */
export function calculateViscosity(tempCelsius: number): number {
  const T_kelvin = tempCelsius + 273.15;
  // Calibrated for Baghewala 15.2° API heavy crude
  const A = -6.85;
  const B = 5000.0;
  const lnVisc = A + B / T_kelvin;
  const visc = Math.exp(lnVisc);
  return Number(Math.max(15, Math.min(35000, visc)).toFixed(1));
}

/**
 * Generates an accurate 24-point Surface & Downhole Dynamometer Card.
 * Normal: classic parallelogram / trapezoid showing clean fluid load pickup and release.
 * Rod Floating: classic Baghewala failure mode where high viscosity causes severe drag on downstroke,
 * delaying valve opening, creating severe load drop delay, and rod buckling/compression.
 */
export function generateDynoCard(strokeLength: number, isFloating: boolean, spm: number): DynoPoint[] {
  const points: DynoPoint[] = [];
  const numSteps = 24; // 12 upstroke, 12 downstroke

  const peakNormal = 19500;
  const minNormal = 5200;

  for (let i = 0; i <= numSteps; i++) {
    const fraction = i / numSteps;
    let position = 0;
    let surfaceLoad = 0;
    let downholeLoad = 0;

    if (fraction <= 0.5) {
      // UPSTROKE: position moves from 0 to strokeLength
      const upProgress = fraction / 0.5;
      position = Number((upProgress * strokeLength).toFixed(1));

      // Quick load pickup at beginning of upstroke
      const pickupFactor = Math.sin((upProgress * Math.PI) / 2);
      const noise = (Math.random() - 0.5) * 280;

      if (isFloating) {
        // Higher peak load due to viscous drag on rod string
        surfaceLoad = minNormal + (peakNormal - minNormal + 2400) * pickupFactor + noise;
        downholeLoad = minNormal + 1000 + (peakNormal - minNormal + 1500) * pickupFactor;
      } else {
        surfaceLoad = minNormal + (peakNormal - minNormal) * pickupFactor + noise;
        downholeLoad = minNormal + 800 + (peakNormal - minNormal - 800) * pickupFactor;
      }
    } else {
      // DOWNSTROKE: position moves from strokeLength down to 0
      const downProgress = (fraction - 0.5) / 0.5;
      position = Number(((1 - downProgress) * strokeLength).toFixed(1));
      const dropFactor = Math.cos((downProgress * Math.PI) / 2);
      const noise = (Math.random() - 0.5) * 280;

      if (isFloating) {
        // ROD FLOATING SIGNATURE:
        // Rod does not drop freely; viscous resistance holds the rod up,
        // so surface load stays artificially elevated during early downstroke,
        // then collapses sharply or shows compressive buckle near bottom.
        const delayedDrop = Math.pow(dropFactor, 0.35); // stays high much longer
        surfaceLoad = 3800 + (peakNormal - 3800) * delayedDrop + noise;
        downholeLoad = 4200 + (peakNormal - 5200) * delayedDrop;

        // If high SPM while floating, rod catches up violently at the bottom
        if (downProgress > 0.8) {
          surfaceLoad = Math.max(2900, surfaceLoad - 1500);
        }
      } else {
        // Normal quick release of fluid load to standing valve
        surfaceLoad = minNormal + (peakNormal - minNormal) * dropFactor + noise;
        downholeLoad = minNormal + (peakNormal - minNormal - 800) * dropFactor;
      }
    }

    points.push({
      position,
      surfaceLoad: Math.round(surfaceLoad),
      downholeLoad: Math.round(downholeLoad),
    });
  }

  return points;
}

/**
 * Generates synthetic SRP reading with telemetry parameters
 */
export function generateSrpTelemetry(
  viscosity: number,
  baseSpm: number = 5.2,
  baseStroke: number = 86.0,
  forceFloating?: boolean
) {
  // Floating condition occurs if viscosity > 850 cP AND spm > 4.2, or explicitly forced
  const isFloating = forceFloating ?? (viscosity > 850 && baseSpm >= 4.5);

  const noiseSpm = (Math.random() - 0.5) * 0.15;
  const currentSpm = Number((baseSpm + noiseSpm).toFixed(2));

  const peakLoad = isFloating
    ? Math.round(21800 + (Math.random() - 0.5) * 600)
    : Math.round(18600 + (Math.random() - 0.5) * 400);

  const minLoad = isFloating
    ? Math.round(3100 + (Math.random() - 0.5) * 350) // Severe load depression
    : Math.round(5400 + (Math.random() - 0.5) * 300);

  const frictionalDrag = isFloating
    ? Math.round(3200 + (Math.random() - 0.5) * 400)
    : Math.round(1100 + (Math.random() - 0.5) * 150);

  const gearboxTorquePct = isFloating
    ? Math.round(88 + (Math.random() - 0.5) * 6)
    : Math.round(64 + (Math.random() - 0.5) * 4);

  const dynoCard = generateDynoCard(baseStroke, isFloating, currentSpm);

  return {
    spm: currentSpm,
    stroke_length: baseStroke,
    load: peakLoad,
    min_load: minLoad,
    rod_floating_flag: isFloating,
    frictional_drag: frictionalDrag,
    gearbox_torque_pct: Math.min(99, Math.max(30, gearboxTorquePct)),
    card_data_json: JSON.stringify(dynoCard),
  };
}

/**
 * Historical KPI trends generator (SOR, Energy, Production)
 */
export function generateKpiHistory(totalDays: number = 30) {
  const history = [];
  const now = new Date();

  for (let i = totalDays; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    // Baseline unoptimized vs optimized transition
    const isRecentOptimized = i <= 7;
    // Without twin: SOR degrades to 4.8 - 5.5 as cycles get mistimed
    // With twin optimization: SOR drops to 3.1 - 3.4
    const sor = isRecentOptimized
      ? Number((3.25 + (Math.random() - 0.5) * 0.25).toFixed(2))
      : Number((4.75 + (Math.random() - 0.5) * 0.45).toFixed(2));

    const energy_per_bbl = isRecentOptimized
      ? Number((68.5 + (Math.random() - 0.5) * 4.0).toFixed(1)) // kWh/bbl
      : Number((98.2 + (Math.random() - 0.5) * 6.5).toFixed(1));

    const production_bbl = isRecentOptimized
      ? Number((148.0 + (Math.random() - 0.5) * 12.0).toFixed(1))
      : Number((112.0 + (Math.random() - 0.5) * 15.0).toFixed(1));

    history.push({
      date: d,
      sor,
      energy_per_bbl,
      production_bbl,
      optimized: isRecentOptimized,
    });
  }

  return history;
}
