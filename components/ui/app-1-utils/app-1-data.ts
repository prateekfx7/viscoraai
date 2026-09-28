import { ChartConfig } from "@/components/ui/chart";

export const app1User = {
  name: "Jitendra Mourya",
  title: "Lead Field Operations Engineer",
  organization: "Oil India Limited • Baghewala Asset",
  initials: "JM",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
};

export const app1ChartConfig = {
  opened: {
    label: "Steam Input Equivalent (bbl/d)",
    color: "#f59e0b",
  },
  completed: {
    label: "Crude Lifted (bbl/d)",
    color: "#22c55e",
  },
} satisfies ChartConfig;

export const app1Chart = [
  { week: "W1 (Soak)", opened: 120, completed: 85 },
  { week: "W2 (Peak)", opened: 160, completed: 148 },
  { week: "W3 (Flow)", opened: 140, completed: 152 },
  { week: "W4 (Decay)", opened: 130, completed: 138 },
  { week: "W5 (Cooling)", opened: 110, completed: 125 },
  { week: "W6 (Visc Rise)", opened: 125, completed: 118 },
  { week: "W7 (Auto-SPM)", opened: 140, completed: 142 },
  { week: "W8 (Current)", opened: 150, completed: 156 },
];

export const app1Projects = [
  {
    id: "proj-bgw-04",
    name: "Well BGW-04 (South Pad)",
    status: "In progress" as const,
    description:
      "CSS Cycle #3 active. 17.5° API Jodhpur Sandstone. Bottom-hole temperature at 94.6°C, Viscora Auto-Pilot actively throttling pump to 3.2 SPM.",
    progress: 78,
    dueDate: "Oct 12 (Next Steam Soak)",
    team: [
      {
        name: "Jitendra Mourya",
        initials: "JM",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80",
      },
      {
        name: "Dr. A. Sharma",
        initials: "AS",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80",
      },
      {
        name: "R. Sen",
        initials: "RS",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80",
      },
    ],
  },
  {
    id: "proj-bgw-07",
    name: "Well BGW-07 (Central Pad)",
    status: "In progress" as const,
    description:
      "CSS Cycle #2 steady extraction. 112 bbl/d stable heavy crude flow at 18.2° API with optimal Stokes fall clearance.",
    progress: 62,
    dueDate: "Oct 24 (Cycle Review)",
    team: [
      {
        name: "P. Verma",
        initials: "PV",
        avatar:
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=128&q=80",
      },
      {
        name: "Jitendra Mourya",
        initials: "JM",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80",
      },
    ],
  },
  {
    id: "proj-bgw-12",
    name: "Well BGW-12 (North Flank)",
    status: "In review" as const,
    description:
      "CSS Cycle #1 Thermal Ingestion Phase (Day 5 Soak). 17.8° API crude. Heat diffusion monitoring underway prior to SRP restart.",
    progress: 40,
    dueDate: "Oct 04 (Production Start)",
    team: [
      {
        name: "Dr. A. Sharma",
        initials: "AS",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80",
      },
      {
        name: "R. Sen",
        initials: "RS",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80",
      },
    ],
  },
  {
    id: "proj-bgw-15",
    name: "Well BGW-15 (Exploration Pad)",
    status: "Planning" as const,
    description:
      "Pre-steam casing integrity check and SCADA sensor calibration for ultra-heavy 18.9° API Jodhpur Sandstone zone.",
    progress: 15,
    dueDate: "Nov 02 (Steam Initiation)",
    team: [
      {
        name: "P. Verma",
        initials: "PV",
        avatar:
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=128&q=80",
      },
    ],
  },
];

export const app1Activity = [
  {
    id: "act-1",
    person: {
      name: "Viscora Auto-Pilot",
      initials: "AP",
      avatar:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&q=80",
    },
    action:
      "throttled pump speed on Well BGW-04 from 5.2 SPM to 3.2 SPM after detecting heavy oil drag (saved ₹35 Lakhs rod snap risk)",
    time: "2 minutes ago",
  },
  {
    id: "act-2",
    person: {
      name: "Jitendra Mourya",
      initials: "JM",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80",
    },
    action: "confirmed SCADA telemetry sync for BGW-04 bottom-hole reservoir readings (94.6°C, 850 cP)",
    time: "14 minutes ago",
  },
  {
    id: "act-3",
    person: {
      name: "Dr. A. Sharma",
      initials: "AS",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80",
    },
    action:
      "logged CSS Cycle #1 heat soaking progress on Well BGW-12 (Reservoir thermal retention at 96%)",
    time: "1 hour ago",
  },
  {
    id: "act-4",
    person: {
      name: "Viscora Optimization Engine",
      initials: "OE",
      avatar:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&q=80",
    },
    action:
      "updated field KPI model: Baghewala SOR lowered to 3.25 t/t, yielding ₹5.85 Crores/year net savings",
    time: "3 hours ago",
  },
];
