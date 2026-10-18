import { create } from "zustand";

export type DietaryFilter = "ALL" | "VEG" | "NON_VEG";

interface DietaryState {
  filter: DietaryFilter;
  setFilter: (filter: DietaryFilter) => void;
}

export const useDietaryFilter = create<DietaryState>((set) => ({
  filter: "ALL",
  setFilter: (filter) => set({ filter }),
}));
