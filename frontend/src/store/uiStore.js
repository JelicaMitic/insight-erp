import { create } from "zustand";

export const useUiStore = create((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
}));
