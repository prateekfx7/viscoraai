/**
 * Reservoir Model for Baghewala Field Heavy Oil (Oil India Limited)
 * Models post-steam thermal dissipation and Andrade-Walther dynamic viscosity.
 */

import { calculateTemperatureDecay, calculateViscosity } from "../data/generator";

export interface ReservoirAssessment {
  current_temp_c: number;
  predicted_viscosity_cp: number;
  decay_rate_c_per_day: number;
  days_to_economic_limit: number;
  thermal_status: "OPTIMAL" | "COOLING_TRANSITION" | "DEPLETED_HIGH_VISCOSITY";
  forecast_30d: Array<{
    day: number;
    temperature_c: number;
    viscosity_cp: number;
    oil_rate_bpd: number;
  }>;
}

export function evaluateReservoirState(
  daysPostSoak: number,
  apiGravity: number = 15.2
): ReservoirAssessment {
  const currentTemp = calculateTemperatureDecay(daysPostSoak);
  const currentVisc = calculateViscosity(currentTemp);

  // Rate of temperature loss (°C/day)
  const tempNextDay = calculateTemperatureDecay(daysPostSoak + 1);
  const decayRate = Number((currentTemp - tempNextDay).toFixed(2));

  // Economic limit occurs when viscosity > 1400 cP or temp < 62°C in Baghewala CSS
  let daysToLimit = 0;
  for (let d = daysPostSoak; d <= 90; d++) {
    const t = calculateTemperatureDecay(d);
    const v = calculateViscosity(t);
    if (v >= 1400 || t <= 62) {
      daysToLimit = Math.max(0, d - daysPostSoak);
      break;
    }
  }

  let thermal_status: ReservoirAssessment["thermal_status"] = "OPTIMAL";
  if (currentVisc > 1100 || currentTemp < 70) {
    thermal_status = "DEPLETED_HIGH_VISCOSITY";
  } else if (currentVisc > 600 || currentTemp < 110) {
    thermal_status = "COOLING_TRANSITION";
  }

  // 30-day forward forecast
  const forecast: ReservoirAssessment["forecast_30d"] = [];
  for (let f = 0; f <= 30; f += 2) {
    const dayIndex = daysPostSoak + f;
    const temp = calculateTemperatureDecay(dayIndex);
    const visc = calculateViscosity(temp);
    const oilRate = Number((210.0 * Math.exp(-0.022 * dayIndex)).toFixed(1));
    forecast.push({
      day: dayIndex,
      temperature_c: temp,
      viscosity_cp: visc,
      oil_rate_bpd: Math.max(25, oilRate),
    });
  }

  return {
    current_temp_c: currentTemp,
    predicted_viscosity_cp: currentVisc,
    decay_rate_c_per_day: decayRate,
    days_to_economic_limit: daysToLimit,
    thermal_status,
    forecast_30d: forecast,
  };
}
