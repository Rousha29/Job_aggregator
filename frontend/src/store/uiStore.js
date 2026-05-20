import { create } from 'zustand';

const useUIStore = create((set) => ({
  isAccessibilityOpen: false,
  toggleAccessibility: () => set((state) => ({ isAccessibilityOpen: !state.isAccessibilityOpen })),
  setAccessibilityOpen: (open) => set({ isAccessibilityOpen: open }),
}));

export default useUIStore;
