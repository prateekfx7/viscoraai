/**
 * Sucker Rod Pump (SRP) Model & Rod-Floating Rule-Based Detector
 * Baghewala Field Heavy Oil Wells (Oil India Limited)
 */

export interface SrpAssessment {
  is_rod_floating: boolean;
  risk_level: "GREEN" | "AMBER" | "RED";
  drag_severity: "NORMAL" | "MODERATE" | "SEVERE";
  current_spm: number;
  safe_spm_ceiling: number;
  downstroke_load_depression_lbs: number;
  frictional_drag_lbs: number;
  gearbox_torque_pct: number;
  failure_mode: string;
  diagnostics: {
    viscous_drag_ratio: number; // Drag / Buoyant rod weight
    min_load_alarm: boolean;
    peak_load_overload: boolean;
    gearbox_warning: boolean;
  };
}

export interface EvaluateSrpInput {
  spm: number;
  stroke_length: number;
  peak_load: number;
  min_load: number;
  viscosity_cp: number;
  frictional_drag?: number;
  gearbox_torque_pct?: number;
  rod_floating_flag?: boolean;
}

export function evaluateSrpPerformance(input: EvaluateSrpInput): SrpAssessment {
  const {
    spm,
    stroke_length,
    peak_load,
    min_load,
    viscosity_cp,
    frictional_drag = 1200,
    gearbox_torque_pct = 65,
    rod_floating_flag = false,
  } = input;

  // Approximate buoyant weight of 1-inch rod string in 1050m well: ~9,800 lbs
  const buoyantRodWeight = 9800;
  const viscousDragRatio = Number((frictional_drag / buoyantRodWeight).toFixed(3));

  // Safe SPM ceiling based on Stokes drag fall velocity:
  // As viscosity increases, rod falls slower; high SPM overtakes gravity fall!
  let safeSpmCeiling = 6.8;
  if (viscosity_cp > 1200) {
    safeSpmCeiling = 2.8;
  } else if (viscosity_cp > 800) {
    safeSpmCeiling = 3.4;
  } else if (viscosity_cp > 500) {
    safeSpmCeiling = 4.4;
  } else if (viscosity_cp > 300) {
    safeSpmCeiling = 5.2;
  }

  // Diagnostic conditions
  const minLoadAlarm = min_load < 3800;
  const peakLoadOverload = peak_load > 21000;
  const gearboxWarning = gearbox_torque_pct > 80;

  // Rule 1: Explicit flag from generator or live SCADA hook
  let isRodFloating = rod_floating_flag;

  // Rule 2: Physical telemetry signature
  // (high viscosity + high SPM) OR (severe load depression + elevated drag)
  if (!isRodFloating) {
    if (viscosity_cp >= 800 && spm > safeSpmCeiling + 0.5) {
      isRodFloating = true;
    } else if (minLoadAlarm && viscousDragRatio > 0.28) {
      isRodFloating = true;
    }
  }

  let risk_level: "GREEN" | "AMBER" | "RED" = "GREEN";
  let drag_severity: "NORMAL" | "MODERATE" | "SEVERE" = "NORMAL";
  let failure_mode = "Normal steady-state pumping. Good valve clearance.";

  if (isRodFloating) {
    risk_level = "RED";
    drag_severity = "SEVERE";
    failure_mode =
      "CRITICAL: Rod-Floating Active. Downstroke velocity exceeds viscous fall speed. High risk of rod buckling and severe bottom shock.";
  } else if (viscosity_cp > 600 || spm > safeSpmCeiling || gearboxWarning || viscousDragRatio > 0.18) {
    risk_level = "AMBER";
    drag_severity = "MODERATE";
    failure_mode =
      "ELEVATED DRAG: High fluid viscosity causing delayed rod descent. Approaching critical flotation velocity.";
  }

  return {
    is_rod_floating: isRodFloating,
    risk_level,
    drag_severity,
    current_spm: spm,
    safe_spm_ceiling: safeSpmCeiling,
    downstroke_load_depression_lbs: Math.max(0, 5200 - min_load),
    frictional_drag_lbs: frictional_drag,
    gearbox_torque_pct,
    failure_mode,
    diagnostics: {
      viscous_drag_ratio: viscousDragRatio,
      min_load_alarm: minLoadAlarm,
      peak_load_overload: peakLoadOverload,
      gearbox_warning: gearboxWarning,
    },
  };
}
