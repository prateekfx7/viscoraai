# Well-to-Surface Digital Twin — Baghewala Field (Oil India Limited)
### Smart India Hackathon Problem Statement SIH26120: CSS & SRP Heavy Oil Well-to-Surface Optimization

An end-to-end, physics-informed digital twin prototype engineered for **Oil India Limited (OIL)** to optimize **Cyclic Steam Stimulation (CSS)** and **Sucker Rod Pump (SRP)** operations in extra-heavy crude wells (15.2° API) at the **Baghewala Field (Bikaner-Nagaur Basin, Rajasthan)**.

---

## 🛠️ Stack & Technology

- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS (Industrial dark control-room telemetry aesthetic)
- **Charts & Dyno Visualization**: Recharts + Custom High-Precision SVG Dynamometer Loop Renderer
- **State Management**: TanStack React Query (3.5s SCADA polling) + Zustand (UI state & well selection)
- **Database & ORM**: SQLite with Prisma ORM
- **Physics Models**:
  - `lib/models/reservoir.ts`: Post-steam thermal decay & Andrade-Walther dynamic viscosity model
  - `lib/models/srp.ts`: Stokes terminal fall velocity & rule-based rod-floating anomaly detector
  - `lib/models/optimizer.ts`: Explainable recommendation engine for SPM, stroke length, and CSS re-injection trigger

---

## 🚀 Quickstart Setup

Run the following commands to install dependencies, migrate the database, seed Baghewala field data, and start the app:

```bash
# 1. Install dependencies
npm install

# 2. Run Prisma migration
npx prisma migrate dev

# 3. Seed synthetic Baghewala field dataset
npm run seed

# 4. Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser (redirects automatically to `/overview`).

---

## 🧭 Application Modules & Page Directory

| Route | Module Name | Core Functionality |
|---|---|---|
| **`/overview`** | **Digital Twin Overview** | Real-time multi-physics status cards (CSS Day 38, bottom-hole temp, viscosity, SPM, risk flag), dyno mini-card, thermal trajectory. |
| **`/srp-performance`** | **SRP & Dyno Telemetry** | Full 24-point Surface vs Downhole Dynamometer Card, minimum load depression monitor, gearbox torque %, viscous drag ratio, safe SPM ceiling. |
| **`/optimization`** | **Optimization Engine** | Rule-based explainable advisor returning `{ recommended_spm, recommended_stroke, next_cycle_trigger, risk_level, reasoning }`, field checklist, and interactive "What-If" sandbox. |
| **`/kpi`** | **KPI & Impact Dashboard** | Judge-facing comparison slides: Baseline vs Optimized Steam-Oil Ratio (SOR 4.75 → 3.25), lifting power savings (98.2 → 68.5 kWh/bbl), and Baghewala Field annualized economics (₹5.85 Cr/yr). |
| **`/css-cycle`** | **CSS Cycle Monitor** | 3-cycle injection history (Cycle 1, 2, 3), 38-day historical bottom-hole decay curve, 30-day forward forecast, and economic cutoff threshold marker (1,400 cP / 62°C). |
| **`/alerts`** | **Failure Prevention Feed** | Live mechanical alarm log with real-time rod-floating injection, acknowledge action, and failure mitigation matrix. |

---

## 🎬 Hackathon Demo Walkthrough (The 90-Second Scripted Scenario)

This digital twin features a synchronized **90-Second Scripted Scenario** demonstrating the detection and resolution of **Sucker Rod Floating**:

### Step 1: Baseline State (`/overview`)
- Open `http://localhost:3000/overview`.
- Observe **BGW-04 (Baghewala South)** operating nominally at 5.2 SPM, stroke 86", bottom-hole temp 94.6°C, viscosity 850 cP.
- The top **Demo Scenario Bar** tracks elapsed time (`T+0s`, counting up to 90s).

### Step 2: Observe the Mechanical Telemetry (`/srp-performance`)
- Navigate to `/srp-performance`.
- View the balanced Surface and Downhole dynamometer card loops. Minimum rod load is stable at ~5,300 lbs.

### Step 3: Trigger the Rod-Floating Event
- **Option A (Automatic)**: Wait until the timer reaches **T+85s to 90s**.
- **Option B (Instant for Judges)**: Click the **`⚡ Trigger Event Now`** button in the Demo Scenario Bar.
- **Immediate Live Reaction**:
  - The UI instantly turns to an **Industrial Rose Emergency State**.
  - Risk Badge transitions from `NORMAL` to **`CRITICAL RISK (ROD-FLOATING)`**.
  - The Dynamometer card deforms: downstroke load collapses to **3,100 lbs**, showing delayed traveling valve opening and a rod compression plateau.
  - Frictional drag spikes to **3,400 lbs**.

### Step 4: Review Explainable Optimization (`/optimization`)
- Navigate to `/optimization` (or click "View Optimizer Advisory" on the alert banner).
- The Rule-Based Optimizer outputs:
  - **`recommended_spm`**: **3.2 SPM** (reduced by 40% so gravitational rod fall exceeds upward viscous drag).
  - **`recommended_stroke`**: **100.0 inches** (lengthened to preserve oil throughput at lower speed).
  - **`next_cycle_trigger`**: **`CYCLE_TRIGGER_RECOMMENDED_IN_8_DAYS`**.
  - **`risk_level`**: **`RED`**.
  - **`reasoning`**: *“CRITICAL ROD-FLOATING DETECTED: Bottom-hole crude viscosity (851 cP) is impeding sucker rod gravity fall on downstroke. Current speed exceeds terminal fall velocity... Reduce SPM immediately to 3.2 SPM and increase stroke to 100 in to prevent rod failure.”*
  - **`urgency`**: `IMMEDIATE_ACTION`.

### Step 5: Judge-Facing KPI Impact (`/kpi`)
- Navigate to `/kpi`.
- Inspect the before-and-after impact metrics:
  - **Steam-to-Oil Ratio (SOR)**: Reduced from **4.75 down to 3.25** (**-31.6% steam reduction**).
  - **Lifting Power**: Lowered from **98.2 down to 68.5 kWh/bbl** (**-30.2% energy savings**).
  - **Net Recovery Lift**: **+32.1%** heavy oil production margin.
  - **Baghewala Field OPEX**: **14,200 tonnes of steam conserved** & **₹5.85 Crores/year** in avoided rod workovers and fuel savings.

### Step 6: Resetting the Simulation
- Click **`✅ Apply Fix / Normal`** or **`↺ Reset`** in the top bar to return the twin to baseline operations.

---

## 🔬 Mathematical & Engineering Foundation

### 1. Andrade-Walther Heavy Oil Viscosity Equation
$$\ln(\mu) = A + \frac{B}{T + 273.15}$$
Calibrated for Baghewala 15.2° API crude ($A = -6.85, B = 5000$):
- $T = 250^\circ\text{C} \implies \mu \approx 15\text{ cP}$ (Low friction during peak steam)
- $T = 94.6^\circ\text{C} \implies \mu \approx 850\text{ cP}$ (Day 38 elevated drag boundary)
- $T = 45^\circ\text{C} \implies \mu > 7,000\text{ cP}$ (Immobile native crude)

### 2. Sucker Rod Downstroke Terminal Fall Velocity (Stokes Regime)
$$v_{\text{fall}} = \frac{(\rho_{\text{steel}} - \rho_{\text{oil}}) \cdot g \cdot d_{\text{rod}}^2}{32 \cdot \mu}$$
When pump beam descent velocity $v_{\text{beam}} = \frac{2 \cdot S \cdot \text{SPM}}{60}$ exceeds $v_{\text{fall}}$, the polished rod floats, triggering compression shock.

### 3. Safe SPM Calculation
$$\text{SPM}_{\text{safe}} = \min\left(6.8, \frac{3600}{\sqrt{\mu}}\right)$$
At $\mu = 850\text{ cP}$, $\text{SPM}_{\text{safe}} \approx 3.2\text{ SPM}$.

---

## 🏛️ Project Directory Structure

```
├── app/
│   ├── layout.tsx                # Control room dark layout with Sidebar and DemoScenarioBar
│   ├── page.tsx                  # Root redirect to /overview
│   ├── providers.tsx             # React Query Client with 3.5s real-time SCADA polling
│   ├── globals.css               # Tailwind dark industrial control room styling
│   ├── overview/page.tsx         # Page 1: Digital twin well overview
│   ├── srp-performance/page.tsx  # Page 3: SRP telemetry & dynamometer card
│   ├── optimization/page.tsx     # Page 4: Rule-based recommendation engine & sandbox
│   ├── kpi/page.tsx              # Page 6: Before/After SOR and lifting energy trends
│   ├── css-cycle/page.tsx        # Page 2: CSS Huff-and-Puff cycle monitor & decay curve
│   ├── alerts/page.tsx           # Page 5: Real-time alerts & mechanical failure prevention
│   └── api/
│       ├── well-state/route.ts   # Current twin state (GET)
│       ├── css-cycle/route.ts    # CSS cycle history + 30d forecast (GET)
│       ├── srp/route.ts          # SRP load data, dyno card, risk score (GET)
│       ├── optimize/route.ts     # Optimization engine execution (GET/POST)
│       ├── alerts/route.ts       # Alert feed with dynamic rod-floating injection (GET/POST)
│       ├── kpi/route.ts          # SOR, energy, and economics trends (GET)
│       └── demo/route.ts         # Scripted 90s scenario control & manual trigger (GET/POST)
├── components/
│   ├── nav/Sidebar.tsx           # High-contrast navigation with OIL branding
│   ├── demo/DemoScenarioBar.tsx  # Countdown & instant judge scenario trigger
│   ├── cards/StatusCard.tsx      # Control room telemetry metric cards
│   ├── cards/RiskBadge.tsx       # Green/Amber/Red state badge with pulse
│   ├── layout/PageHeader.tsx     # Well switcher, live SCADA indicator, refresh button
│   ├── charts/DynoCard.tsx       # Surface vs downhole closed-loop dynamometer card
│   ├── charts/ViscosityCurve.tsx # Temperature decay & viscosity rise vs economic cutoff
│   ├── charts/SORTrend.tsx       # Baseline vs optimized steam-oil ratio area chart
│   └── charts/EnergyTrend.tsx    # Lifting energy consumption (kWh/bbl) trend chart
├── lib/
│   ├── models/reservoir.ts       # Thermal dissipation & Walther viscosity logic
│   ├── models/srp.ts             # Rod-floating rule-based detector & safe SPM ceiling
│   ├── models/optimizer.ts       # Multi-variable rule-based recommendation advisor
│   ├── data/generator.ts         # Baghewala synthetic data & demo state manager
│   ├── db/prisma.ts              # Global Prisma client singleton
│   └── store/useTwinStore.ts     # Zustand store for selected well and UI state
├── prisma/
│   ├── schema.prisma             # SQLite schema for Wells, CSS, SRP, Alerts, KPIs
│   └── seed.ts                   # Realistic Baghewala field dataset seed script
└── package.json
```
