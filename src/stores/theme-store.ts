import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ThemeState {
  mode: 'monochrome' | 'glass' | 'midnight' | 'cyberpunk' | 'retro' | 'light' | 'dark'
  blur: number
  opacity: number
  radius: number
  background: 'mesh' | 'aurora' | 'deep' | 'cyber' | 'custom' | 'default'
  customColor: string
  layoutMode: 'locked' | 'edit'
  fontFamily: 'default' | 'mono' | 'serif' | 'display'
  fontSize: 'xs' | 'sm' | 'base' | 'lg'
  lineHeight: 'tight' | 'normal' | 'relaxed'
  setTheme: (theme: Partial<ThemeState>) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'monochrome', // Default to light mode
      blur: 20,
      opacity: 0.8,
      radius: 12,
      background: 'mesh', // Lighter background default
      customColor: '#000000',
      layoutMode: 'locked',
      fontFamily: 'default',
      fontSize: 'base',
      lineHeight: 'normal',
      setTheme: (newTheme) => set((state) => ({ ...state, ...newTheme })),
    }),
    {
      name: 'ftw-theme-storage',
    }
  )
)
