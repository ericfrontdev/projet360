import { create } from "zustand";

interface KanbanState {
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
  currentProjectId: null,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
}));
