-- CreateTable
CREATE TABLE "Well" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "field" TEXT NOT NULL DEFAULT 'Baghewala',
    "api_gravity" REAL NOT NULL DEFAULT 15.2,
    "depth_m" REAL NOT NULL DEFAULT 1050.0,
    "formation" TEXT NOT NULL DEFAULT 'Jodhpur Sandstone',
    "operator" TEXT NOT NULL DEFAULT 'Oil India Limited',
    "status" TEXT NOT NULL DEFAULT 'PRODUCING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CssCycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "well_id" TEXT NOT NULL,
    "cycle_number" INTEGER NOT NULL,
    "steam_volume" REAL NOT NULL,
    "injection_pressure" REAL NOT NULL,
    "soak_time_days" INTEGER NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "steam_quality" REAL NOT NULL DEFAULT 0.75,
    "peak_temp_c" REAL NOT NULL DEFAULT 265.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CssCycle_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "Well" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReservoirReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "well_id" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" REAL NOT NULL,
    "predicted_viscosity" REAL NOT NULL,
    "pressure_bar" REAL NOT NULL DEFAULT 45.0,
    "oil_rate_bpd" REAL NOT NULL DEFAULT 120.0,
    CONSTRAINT "ReservoirReading_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "Well" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SrpReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "well_id" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "spm" REAL NOT NULL,
    "stroke_length" REAL NOT NULL,
    "load" REAL NOT NULL,
    "min_load" REAL NOT NULL DEFAULT 4500.0,
    "rod_floating_flag" BOOLEAN NOT NULL DEFAULT false,
    "frictional_drag" REAL NOT NULL DEFAULT 1200.0,
    "card_data_json" TEXT,
    "gearbox_torque_pct" REAL NOT NULL DEFAULT 68.0,
    CONSTRAINT "SrpReading_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "Well" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "well_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Alert_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "Well" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KpiSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "well_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "sor" REAL NOT NULL,
    "energy_per_bbl" REAL NOT NULL,
    "production_bbl" REAL NOT NULL,
    "optimized" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "KpiSnapshot_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "Well" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Well_name_key" ON "Well"("name");

-- CreateIndex
CREATE INDEX "ReservoirReading_well_id_timestamp_idx" ON "ReservoirReading"("well_id", "timestamp");

-- CreateIndex
CREATE INDEX "SrpReading_well_id_timestamp_idx" ON "SrpReading"("well_id", "timestamp");

-- CreateIndex
CREATE INDEX "Alert_well_id_timestamp_idx" ON "Alert"("well_id", "timestamp");

-- CreateIndex
CREATE INDEX "KpiSnapshot_well_id_date_idx" ON "KpiSnapshot"("well_id", "date");
