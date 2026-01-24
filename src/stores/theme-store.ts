import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ThemeState {
  mode: 'light' | 'dark' | 'glass'
  background: string
  layoutMode: 'locked' | 'edit'
  setTheme: (theme: Partial<ThemeState>) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light', // Default to light mode
      background: '',
      layoutMode: 'locked',
      setTheme: (newTheme) => set((state) => ({ ...state, ...newTheme })),
    }),
    {
      name: 'ftw-theme-storage',
    }
  )
)
