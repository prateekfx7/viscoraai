-- Supabase PostgreSQL Schema for Oil India Limited - Baghewala Field Digital Twin
-- Problem Statement: SIH26120 (CSS + SRP Optimization)

-- 1. Wells Table
CREATE TABLE IF NOT EXISTS wells (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  field TEXT DEFAULT 'Baghewala (Bikaner-Nagaur Basin)',
  api_gravity DOUBLE PRECISION DEFAULT 15.2,
  depth_m DOUBLE PRECISION DEFAULT 1045.0,
  formation TEXT DEFAULT 'Jodhpur Sandstone (Heavy Oil)',
  operator TEXT DEFAULT 'Oil India Limited',
  status TEXT DEFAULT 'PRODUCING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CSS Cycles Table
CREATE TABLE IF NOT EXISTS css_cycles (
  id TEXT PRIMARY KEY,
  well_id TEXT REFERENCES wells(id) ON DELETE CASCADE,
  cycle_number INT NOT NULL,
  steam_volume DOUBLE PRECISION NOT NULL,
  injection_pressure DOUBLE PRECISION NOT NULL,
  soak_time_days INT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'COMPLETED',
  steam_quality DOUBLE PRECISION DEFAULT 0.75,
  peak_temp_c DOUBLE PRECISION DEFAULT 265.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Reservoir Readings Table
CREATE TABLE IF NOT EXISTS reservoir_readings (
  id TEXT PRIMARY KEY,
  well_id TEXT REFERENCES wells(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  temperature DOUBLE PRECISION NOT NULL,
  predicted_viscosity DOUBLE PRECISION NOT NULL,
  pressure_bar DOUBLE PRECISION DEFAULT 45.0,
  oil_rate_bpd DOUBLE PRECISION DEFAULT 120.0
);

-- 4. SRP Readings Table
CREATE TABLE IF NOT EXISTS srp_readings (
  id TEXT PRIMARY KEY,
  well_id TEXT REFERENCES wells(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  spm DOUBLE PRECISION NOT NULL,
  stroke_length DOUBLE PRECISION NOT NULL,
  load DOUBLE PRECISION NOT NULL,
  min_load DOUBLE PRECISION DEFAULT 4500.0,
  rod_floating_flag BOOLEAN DEFAULT FALSE,
  frictional_drag DOUBLE PRECISION DEFAULT 1200.0,
  card_data_json TEXT,
  gearbox_torque_pct DOUBLE PRECISION DEFAULT 68.0
);

-- 5. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  well_id TEXT REFERENCES wells(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE
);

-- 6. KPI Snapshots Table
CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id TEXT PRIMARY KEY,
  well_id TEXT REFERENCES wells(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  sor DOUBLE PRECISION NOT NULL,
  energy_per_bbl DOUBLE PRECISION NOT NULL,
  production_bbl DOUBLE PRECISION NOT NULL,
  optimized BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security (RLS) & Public Read for Hackathon Demo
ALTER TABLE wells ENABLE ROW LEVEL SECURITY;
ALTER TABLE css_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservoir_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE srp_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read wells" ON wells FOR SELECT USING (true);
CREATE POLICY "Public read css_cycles" ON css_cycles FOR SELECT USING (true);
CREATE POLICY "Public read reservoir_readings" ON reservoir_readings FOR SELECT USING (true);
CREATE POLICY "Public read srp_readings" ON srp_readings FOR SELECT USING (true);
CREATE POLICY "Public read alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Public read kpi_snapshots" ON kpi_snapshots FOR SELECT USING (true);

-- Seed Initial Baghewala Field Wells
INSERT INTO wells (id, name, field, api_gravity, depth_m, formation, operator, status)
VALUES
  ('well-bgw-04', 'BGW-04 (Baghewala South)', 'Baghewala (Bikaner-Nagaur Basin)', 15.2, 1045.0, 'Jodhpur Sandstone', 'Oil India Limited', 'PRODUCING'),
  ('well-bgw-07', 'BGW-07 (Baghewala Central)', 'Baghewala (Bikaner-Nagaur Basin)', 14.8, 1080.0, 'Jodhpur Sandstone', 'Oil India Limited', 'PRODUCING'),
  ('well-bgw-12', 'BGW-12 (Baghewala North)', 'Baghewala (Bikaner-Nagaur Basin)', 15.5, 1020.0, 'Jodhpur Sandstone', 'Oil India Limited', 'SOAKING')
ON CONFLICT (id) DO NOTHING;
