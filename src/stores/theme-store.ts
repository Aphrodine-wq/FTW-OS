import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  mode: 'monochrome' | 'glass'
  activeTheme: 'monochrome'
  blur: number
  opacity: number
  noiseOpacity: number // New granular control
  radius: number
  accentColor: string
  background: 'solid' | 'mesh' | 'aurora' | 'deep' | 'cyber'
  density: 'compact' | 'comfortable'
  sidebarPosition: 'left' | 'right' // New granular control
  sidebarCollapsed: boolean // New granular control
  layoutMode: 'locked' | 'edit' // New Layout Control
  setTheme: (config: Partial<ThemeState>) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'monochrome', 
      activeTheme: 'monochrome',
      blur: 0,
      opacity: 1,
      noiseOpacity: 0.03, // Default noise
      radius: 8,
      accentColor: '#000000',
      background: 'solid',
      density: 'comfortable',
      sidebarPosition: 'left',
      sidebarCollapsed: false,
      layoutMode: 'locked',
      setTheme: (config) => set((state) => ({ ...state, ...config })),
    }),
    { name: 'fairtrade-theme-v3' } // Version bump
  )
)
