# Next.js implementation plan — CSS/SRP digital twin dashboard

Problem statement: SIH26120 — Digital Twin for Well-to-Surface Optimization (CSS + SRP), Baghewala Field, Oil India Limited.

## 1. Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State**: React Query (server state) + Zustand (UI state, e.g. selected well, time range)
- **Backend**: Next.js API routes (or separate FastAPI service if Python models are heavier — call it from API routes via fetch)
- **Data**: SQLite/Postgres via Prisma, seeded with synthetic well data
- **Realtime feel**: polling every 3–5s from a simulated data generator (no real SCADA feed needed for demo)

## 2. Folder structure

```
app/
  layout.tsx
  page.tsx                     -> redirects to /overview
  overview/page.tsx            -> Page 1: Well overview
  css-cycle/page.tsx           -> Page 2: CSS cycle monitor
  srp-performance/page.tsx     -> Page 3: SRP performance
  optimization/page.tsx        -> Page 4: Optimization recommendations
  alerts/page.tsx              -> Page 5: Alerts & failure log
  kpi/page.tsx                 -> Page 6: KPI / impact dashboard
  api/
    well-state/route.ts        -> current twin state (GET)
    css-cycle/route.ts         -> CSS cycle history + prediction (GET)
    srp/route.ts               -> SRP load data + risk score (GET)
    optimize/route.ts          -> optimization engine output (GET/POST)
    alerts/route.ts            -> alert feed (GET)
    kpi/route.ts               -> SOR/energy/production trends (GET)
components/
  nav/Sidebar.tsx
  cards/StatusCard.tsx
  cards/RiskBadge.tsx
  charts/ViscosityCurve.tsx
  charts/DynoCard.tsx
  charts/SORTrend.tsx
  charts/EnergyTrend.tsx
  layout/PageHeader.tsx
lib/
  models/reservoir.ts           -> viscosity/temp decay prediction logic
  models/srp.ts                 -> rod-floating rule-based detector
  models/optimizer.ts           -> CSS + SRP recommendation engine
  data/generator.ts             -> synthetic well data generator
  db/prisma.ts
prisma/
  schema.prisma
```

## 3. Data model (Prisma schema, simplified)

- `Well` — id, name, field, api_gravity
- `CssCycle` — well_id, cycle_number, steam_volume, injection_pressure, soak_time_days, start_date, status
- `ReservoirReading` — well_id, timestamp, temperature, predicted_viscosity
- `SrpReading` — well_id, timestamp, spm, stroke_length, load, rod_floating_flag
- `Alert` — well_id, type, severity, message, timestamp
- `KpiSnapshot` — well_id, date, sor, energy_per_bbl, production_bbl

## 4. Build order mapped to pages

1. `lib/data/generator.ts` — synthetic data generator (temp decay curve + noisy SRP load + occasional rod-floating events)
2. `/overview` — pulls latest `well-state`, shows status cards (cycle day, viscosity estimate, pump state, risk flag)
3. `/srp-performance` — dyno-style load chart (Recharts) + SPM/stroke display + risk badge, polling every 3–5s
4. `/optimization` — calls `lib/models/optimizer.ts`, shows recommended SPM/stroke + next CSS trigger with a one-line "why" (reasoning string)
5. `/kpi` — before/after comparison chart (baseline vs optimized SOR and energy/bbl) — this is your judge-facing slide equivalent
6. `/css-cycle` and `/alerts` — simpler, mostly table + single chart, build last

## 5. Optimization engine logic (lib/models/optimizer.ts)

Rule-based, explainable (avoid black-box ML for the demo):

```
if predicted_viscosity > threshold_high:
    recommend: reduce SPM by X%, increase stroke length
if days_since_cycle_start > soak_time_days and viscosity trending up:
    recommend: trigger next CSS cycle
if load pattern matches rod-floating signature:
    flag: rod floating risk = high, recommend SPM reduction
```

Return a structured object: `{ recommended_spm, recommended_stroke, next_cycle_trigger, risk_level, reasoning }`

## 6. Timeline (mapped to earlier phase plan)

| Day | Focus |
|---|---|
| Day 0 | Repo setup, Prisma schema, data generator, seed script |
| Day 1 | Reservoir + SRP model logic, `/overview` and `/srp-performance` pages |
| Day 1–2 | Optimizer engine, `/optimization` page, wire polling |
| Day 2 | `/kpi` page (impact chart), `/css-cycle`, `/alerts` |
| Final hours | Demo script, seed a "rod floating event" scenario for live walkthrough, polish UI |

## 7. Demo script hook

Seed the generator so that ~90 seconds into the live demo, a rod-floating event fires on `/srp-performance` → judges watch `/optimization` immediately recommend a corrected SPM → `/kpi` shows the SOR/energy delta. This is the single most important interaction to get smooth.
