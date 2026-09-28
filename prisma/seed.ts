import { PrismaClient } from "@prisma/client";
import {
  calculateTemperatureDecay,
  calculateViscosity,
  generateSrpTelemetry,
  generateKpiHistory,
} from "../lib/data/generator";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Baghewala Field Digital Twin database seed...");

  // Clear existing records
  await prisma.alert.deleteMany();
  await prisma.kpiSnapshot.deleteMany();
  await prisma.srpReading.deleteMany();
  await prisma.reservoirReading.deleteMany();
  await prisma.cssCycle.deleteMany();
  await prisma.well.deleteMany();

  // 1. Create Wells (Oil India Limited - Baghewala Field)
  const wellPrimary = await prisma.well.create({
    data: {
      id: "well-bgw-04",
      name: "BGW-04 (Baghewala South)",
      field: "Baghewala (Bikaner-Nagaur Basin)",
      api_gravity: 15.2,
      depth_m: 1045.0,
      formation: "Jodhpur Sandstone (Heavy Oil)",
      operator: "Oil India Limited",
      status: "PRODUCING",
    },
  });

  const wellSecondary = await prisma.well.create({
    data: {
      id: "well-bgw-07",
      name: "BGW-07 (Baghewala Central)",
      field: "Baghewala (Bikaner-Nagaur Basin)",
      api_gravity: 14.8,
      depth_m: 1080.0,
      formation: "Jodhpur Sandstone (Heavy Oil)",
      operator: "Oil India Limited",
      status: "PRODUCING",
    },
  });

  const wellTertiary = await prisma.well.create({
    data: {
      id: "well-bgw-12",
      name: "BGW-12 (Baghewala North)",
      field: "Baghewala (Bikaner-Nagaur Basin)",
      api_gravity: 15.5,
      depth_m: 1020.0,
      formation: "Jodhpur Sandstone (Heavy Oil)",
      operator: "Oil India Limited",
      status: "SOAKING",
    },
  });

  console.log("✓ Seeded Wells: BGW-04, BGW-07, BGW-12");

  // 2. Seed CSS Cycles for BGW-04
  const cycle1Date = new Date();
  cycle1Date.setDate(cycle1Date.getDate() - 190);

  const cycle2Date = new Date();
  cycle2Date.setDate(cycle2Date.getDate() - 105);

  const cycle3Date = new Date();
  cycle3Date.setDate(cycle3Date.getDate() - 38); // Day 38 of current production

  await prisma.cssCycle.createMany({
    data: [
      {
        id: "css-bgw04-c1",
        well_id: wellPrimary.id,
        cycle_number: 1,
        steam_volume: 2150.0,
        injection_pressure: 96.0,
        soak_time_days: 8,
        start_date: cycle1Date,
        end_date: new Date(cycle1Date.getTime() + 80 * 24 * 3600 * 1000),
        status: "COMPLETED",
        steam_quality: 0.78,
        peak_temp_c: 262.0,
      },
      {
        id: "css-bgw04-c2",
        well_id: wellPrimary.id,
        cycle_number: 2,
        steam_volume: 1980.0,
        injection_pressure: 92.5,
        soak_time_days: 7,
        start_date: cycle2Date,
        end_date: new Date(cycle2Date.getTime() + 65 * 24 * 3600 * 1000),
        status: "COMPLETED",
        steam_quality: 0.76,
        peak_temp_c: 258.0,
      },
      {
        id: "css-bgw04-c3",
        well_id: wellPrimary.id,
        cycle_number: 3,
        steam_volume: 1850.0,
        injection_pressure: 89.0,
        soak_time_days: 7,
        start_date: cycle3Date,
        status: "ACTIVE", // Current active cycle on day 38
        steam_quality: 0.75,
        peak_temp_c: 254.0,
      },
    ],
  });

  console.log("✓ Seeded CSS Cycles (Cycle 1, 2, 3 Active)");

  // 3. Seed Reservoir Readings for BGW-04 (Past 38 days)
  const reservoirReadings = [];
  for (let day = 0; day <= 38; day++) {
    const readingTime = new Date(cycle3Date.getTime() + day * 24 * 3600 * 1000);
    const temp = calculateTemperatureDecay(day);
    const visc = calculateViscosity(temp);
    // Pressure declines as reservoir fluid is produced
    const pressure = Number((48.0 - day * 0.35 + (Math.random() - 0.5) * 0.8).toFixed(1));
    // Oil rate is high when hot, drops as viscosity rises
    const oilRate = Number((210.0 * Math.exp(-0.022 * day) + (Math.random() - 0.5) * 6).toFixed(1));

    reservoirReadings.push({
      well_id: wellPrimary.id,
      timestamp: readingTime,
      temperature: temp,
      predicted_viscosity: visc,
      pressure_bar: Math.max(22.0, pressure),
      oil_rate_bpd: Math.max(35.0, oilRate),
    });
  }

  await prisma.reservoirReading.createMany({
    data: reservoirReadings,
  });

  console.log(`✓ Seeded ${reservoirReadings.length} historical reservoir readings`);

  // 4. Seed SRP Readings
  // Current day 38: Temp ~94°C, Viscosity ~780 cP
  const srpReadings = [];
  const currentTemp = calculateTemperatureDecay(38);
  const currentVisc = calculateViscosity(currentTemp);

  for (let h = 24; h >= 0; h--) {
    const time = new Date();
    time.setMinutes(time.getMinutes() - h * 10);
    // Standard normal readings prior to demo trigger
    const srpData = generateSrpTelemetry(currentVisc, 5.2, 86.0, false);
    srpReadings.push({
      well_id: wellPrimary.id,
      timestamp: time,
      ...srpData,
    });
  }

  await prisma.srpReading.createMany({
    data: srpReadings,
  });

  console.log(`✓ Seeded ${srpReadings.length} recent SRP telemetry points`);

  // 5. Seed KPI Snapshots (30-day timeline)
  const kpiData = generateKpiHistory(30);
  await prisma.kpiSnapshot.createMany({
    data: kpiData.map((k) => ({
      well_id: wellPrimary.id,
      date: k.date,
      sor: k.sor,
      energy_per_bbl: k.energy_per_bbl,
      production_bbl: k.production_bbl,
      optimized: k.optimized,
    })),
  });

  console.log(`✓ Seeded ${kpiData.length} KPI snapshots`);

  // 6. Seed Initial Operational Alerts
  await prisma.alert.createMany({
    data: [
      {
        well_id: wellPrimary.id,
        type: "HIGH_VISCOSITY",
        severity: "WARNING",
        message: "Dynamic viscosity reached 780 cP (threshold: 750 cP). Downstroke frictional drag elevated.",
        timestamp: new Date(Date.now() - 42 * 60 * 1000),
        acknowledged: false,
      },
      {
        well_id: wellPrimary.id,
        type: "CYCLE_TRIGGER",
        severity: "INFO",
        message: "CSS Cycle #3 production day 38: Economic cutoff threshold predicted within 14 days.",
        timestamp: new Date(Date.now() - 180 * 60 * 1000),
        acknowledged: true,
      },
      {
        well_id: wellSecondary.id,
        type: "OVERLOAD",
        severity: "WARNING",
        message: "Gearbox torque peaked at 89% rated capacity during start-up sequence.",
        timestamp: new Date(Date.now() - 320 * 60 * 1000),
        acknowledged: true,
      },
    ],
  });

  console.log("✓ Seeded operational alerts");
  console.log("✅ Database successfully seeded for Baghewala Field Digital Twin!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
