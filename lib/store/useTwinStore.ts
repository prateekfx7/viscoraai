import { create } from "zustand";

interface TwinUIState {
  selectedWellId: string;
  setSelectedWellId: (id: string) => void;
  pollingEnabled: boolean;
  setPollingEnabled: (enabled: boolean) => void;
  timeRange: "24h" | "7d" | "30d";
  setTimeRange: (range: "24h" | "7d" | "30d") => void;
  activeDemoEmergency: boolean;
  setActiveDemoEmergency: (active: boolean) => void;
}

export const useTwinStore = create<TwinUIState>((set) => ({
  selectedWellId: "well-bgw-04",
  setSelectedWellId: (id) => set({ selectedWellId: id }),
  pollingEnabled: true,
  setPollingEnabled: (enabled) => set({ pollingEnabled: enabled }),
  timeRange: "30d",
  setTimeRange: (range) => set({ timeRange: range }),
  activeDemoEmergency: false,
  setActiveDemoEmergency: (active) => set({ activeDemoEmergency: active }),
}));
